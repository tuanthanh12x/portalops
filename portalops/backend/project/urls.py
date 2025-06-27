from django.urls import path

from .views import CreateProjectTypeView

urlpatterns = [
    path("project-package/", CreateProjectTypeView.as_view(), name="create-project-package"),
    # path('limits/', LimitSummaryView.as_view(), name='limit-summary'),
    # path('console/', CreateConsoleAPI.as_view(), name='create-console'),
    # path("admin/summary/", SystemSummaryView.as_view(),name="admin-summary"),
]
