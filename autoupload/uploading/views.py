from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from . import models
from notion.client import NotionClient
from notion.block import TextBlock, CodeBlock, HeaderBlock
import requests
import base64
import json
import os
import datetime


@api_view(['POST'])
def githubReq(request):
    try:
        problemInfo = getProblemInfo(request)

        uploadGithub(problemInfo)
    except Exception as e:
        return Response(str(e), status=status.HTTP_400_BAD_REQUEST)
    return Response("success", status=status.HTTP_200_OK)


@api_view(['POST'])
def notionReq(request):
  try:
    problemInfo = getProblemInfo(request)
    
    uploadNotion(problemInfo)
  except Exception as e:
    return Response(str(e), status=status.HTTP_400_BAD_REQUEST)
  return Response("success", status=status.HTTP_200_OK)


@api_view(['POST'])
def allReq(request):
    try:
      problemInfo = getProblemInfo(request)
      
      uploadGithub(problemInfo)
      uploadNotion(problemInfo)
    except Exception as e:
      return Response(str(e), status=status.HTTP_400_BAD_REQUEST)
    return Response("success", status=status.HTTP_200_OK)


def getProblemInfo(request):
    if not ('problemId' in request.data and 'sourcecode' in request.data):
        raise Exception("Check the requested variables!")
    problemId = request.data['problemId']
    sourcecode = request.data['sourcecode']
    url = "https://solved.ac/api/v3/problem/show"
    headers = {"Content-Type": "application/json"}
    levels = ['Unrated']
    level = ['브론즈', '실버', '골드', '플래티넘', '다이아몬드', '루비']

    for Lv in level:
        for idx in range(5, 0, -1):
            levels.append(Lv+str(idx))

    querystring = {"problemId": problemId}
    res = requests.request(
        "GET", url, headers=headers, params=querystring)

    if not res.status_code == 200:
        raise Exception(
            "An error occurred while requesting data from solvedac.")

    title = res.json()['titleKo']
    tags = []
    level = levels[res.json()['level']]

    for item in res.json()['tags']:
        tags.append(item['displayNames'][1]['name'])

    if "bits/stdc++.h" in sourcecode:
        language = "C++"
        ext = "cpp"
    elif "public class Main" in sourcecode:
        language = "Java"
        ext = "java"
    else:
        language = "Python"
        ext = "py"

    problemInfo = {
        "problemId": problemId,
        "title": title,
        "level": level,
        "tags": tags,
        "sourcecode": sourcecode,
        "language": language,
        "ext": ext
    }
    return problemInfo


def uploadGithub(problemInfo):
    github_api_url = "https://api.github.com"

    github_token = os.environ.get("github_token")
    github_owner = os.environ.get("github_owner")
    github_repo = os.environ.get("github_repo")
    github_folder_path = os.environ.get("github_folder_path")

    if not(github_token and github_owner and github_repo and github_folder_path):
        raise Exception("Check your github_token!")

    headers = {
        'Authorization': 'Bearer %s' % (github_token),
        'Accept': 'application/vnd.github.v3+json'
    }

    path = '%s%s.%s' % (github_folder_path,
                        problemInfo['problemId'], problemInfo['ext'])
    url = '%s/repos/%s/%s/contents/%s' % (github_api_url,
                                          github_owner, github_repo, path)

    requestData = {
        "message": problemInfo['title'],
        "content": base64.b64encode(problemInfo['sourcecode'].encode('ascii')).decode('utf8')
    }

    res = requests.put(url=url, headers=headers, data=json.dumps(requestData))

    if res.status_code == 422:
        raise Exception("It's a file that already exists.")

    if not(res.status_code == 201 or res.status_code == 200):
        raise Exception("An error occurred while uploading to Github.")


def uploadNotion(problemInfo):
    client = NotionClient(token_v2=os.environ.get("notion_token"))
    pageUrl = client.get_collection_view(os.environ.get("notion_url"))

    newPage = pageUrl.collection.add_row()
    newPage.set_property('title', problemInfo['title'])
    newPage.set_property('문제정보', ['BOJ', problemInfo['level'], problemInfo['problemId']])
    newPage.set_property('태그', problemInfo['tags'])
    newPage.set_property(
        'URL', f'https://www.acmicpc.net/problem/{problemInfo["problemId"]}')
    newPage.set_property('Date', datetime.date.today())
    newPage.set_property('풀이', problemInfo['language'])

    explanationHeader = newPage.children.add_new(HeaderBlock)
    explanationHeader.title = "풀이"

    emptyspace = newPage.children.add_new(TextBlock)

    codeHeader = newPage.children.add_new(HeaderBlock)
    codeHeader.title = "소스 코드"

    code = newPage.children.add_new(CodeBlock)
    code.language = problemInfo['language']
    sourcecode = problemInfo['sourcecode'].replace('    ','\t').split('\n')
    for x in range(len(sourcecode)):
      sourcecode[x] = sourcecode[x]+'\n'
    sourcecode = '\t'.join(sourcecode)
    code.title = sourcecode
