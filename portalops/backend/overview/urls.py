from django.urls import path

from .views import MyInstancesView, LimitSummaryView, CreateConsoleAPI, SystemSummaryView

# from .views import ResourceOverviewView, MyInstancesView

urlpatterns = [
    path("instances/", MyInstancesView.as_view(), name="my-instances"),
    path('limits/', LimitSummaryView.as_view(), name='limit-summary'),
    path('console/', CreateConsoleAPI.as_view(), name='create-console'),
    path("admin/summary/", SystemSummaryView.as_view(),name="admin-summary"),
]
