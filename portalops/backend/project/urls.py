from django.urls import path

from .views import CreateProjectTypeView, ListProjectTypeView, AllProjectsOverview, CreateProjectView, \
    AssignUserToProjectView

urlpatterns = [
    path("project-package/", CreateProjectTypeView.as_view(), name="create-project-package"),
    path("project-packages/list/", ListProjectTypeView.as_view()),
    path('projects/list/', AllProjectsOverview.as_view(), name='limit-summary'),
    path('create-project/', CreateProjectView.as_view(), name='create-project'),
    path("assign-user-to-project/", AssignUserToProjectView.as_view(),name="assign-user-to-project"),
]
