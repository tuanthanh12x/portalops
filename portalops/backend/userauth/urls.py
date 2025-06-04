from django.urls import path
from .views import LoginWithProjectView

urlpatterns = [
    path('login/', LoginWithProjectView.as_view(), name='login'),
    path("projects/", GetProjectsView.as_view(), name="get-projects"),
]
