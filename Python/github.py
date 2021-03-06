from dotenv import load_dotenv
import os
import base64
import requests
import json


class Github:
    def __init__(self):
        load_dotenv()
        self.githubToken = os.environ.get("github_token")
        self.githubOwner = os.environ.get("github_owner")
        self.githubRepo = os.environ.get("github_repo")
        self.githubFolderPath = os.environ.get("github_folder_path")
        self.githubApiUrl = "https://api.github.com"

        self.headers = {
            'Authorization': 'Bearer %s' % (self.githubToken),
            'Accept': 'application/vnd.github.v3+json'
        }

    def addProblem(self, problemNum, language, problemTitle, sourcecode):
        ext = "cpp"
        if language == 'Java':
            ext = "java"
        elif language == 'Python':
            ext = "py"

        path = '%s%s.%s' % (self.githubFolderPath, problemNum, ext)
        url = '%s/repos/%s/%s/contents/%s' % (
            self.githubApiUrl, self.githubOwner, self.githubRepo, path)

        da = {
            "message": problemTitle,
            "content": base64.b64encode(sourcecode.encode('ascii')).decode('utf8'),
        }

        res = requests.put(url=url, headers=self.headers, data=json.dumps(da))

        if res.status_code == 201 or res.status_code == 200:
            print('%s를 정상적으로 Github에 업로드 하였습니다.' % (problemNum))
        else:
            print('%s를 Github에 업로드 하는 도중 오류가 발생하였습니다.' % (problemNum))
