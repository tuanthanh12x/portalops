from django.urls import path

from .views import CreateProjectTypeView, ListProjectTypeView, AllProjectsOverview
urlpatterns = [
    path("project-package/", CreateProjectTypeView.as_view(), name="create-project-package"),
    path("project-packages/list/", ListProjectTypeView.as_view()),
    path('project/lists/', AllProjectsOverview.as_view(), name='limit-summary'),
    # path('console/', CreateConsoleAPI.as_view(), name='create-console'),
    # path("admin/summary/", SystemSummaryView.as_view(),name="admin-summary"),
]
