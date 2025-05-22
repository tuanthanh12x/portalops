from django.urls import path
from .views import LoginWithProjectView, GetProjectsView

urlpatterns = [
    path('login/', LoginWithProjectView.as_view(), name='login'),
    path("projects/", GetProjectsView.as_view(), name="get-projects"),
]
