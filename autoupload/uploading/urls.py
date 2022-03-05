from django.urls import path
from . import views
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
  path('notion',views.notionReq),
  path('github',views.githubReq),
  path('all',views.allReq)
]
