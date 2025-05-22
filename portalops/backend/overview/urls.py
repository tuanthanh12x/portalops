from django.urls import path

from .views import ResourceOverviewView, MyInstancesView, LimitSummaryView

# from .views import ResourceOverviewView, MyInstancesView

urlpatterns = [
    path('resources/', ResourceOverviewView.as_view(), name='resource-overview'),
    path("instances/", MyInstancesView.as_view(), name="my-instances"),
    path('limits/', LimitSummaryView.as_view(), name='limit-summary'),
]
