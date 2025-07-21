from django.urls import path

from .views import CreateProjectTypeView, ListProjectTypeView, AllProjectsOverview, CreateProjectView, \
    AssignUserToProjectView, ChangeVPSTypeView, AdminProjectDetailView, UserProjectListView, SyncFloatingIPsView

urlpatterns = [
    path("project-package/", CreateProjectTypeView.as_view(), name="create-project-package"),
    path("project-packages/list/", ListProjectTypeView.as_view()),
    path('projects/list/', AllProjectsOverview.as_view(), name='limit-summary'),
    path('create-project/', CreateProjectView.as_view(), name='create-project'),
    path("assign-user-to-project/", AssignUserToProjectView.as_view(),name="assign-user-to-project"),
    path("change-vps-package/", ChangeVPSTypeView.as_view(), name="change-vps-package"),
    path("project-list", UserProjectListView.as_view(), name="user-project-list"),
    path("<str:openstack_id>/project-detail/", AdminProjectDetailView.as_view(), name="admin-project-detail"),
    path("sync-floating-ips/", SyncFloatingIPsView.as_view(), name="sync-floating-ips"),

]
