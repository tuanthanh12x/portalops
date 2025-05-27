from django.urls import path

from .views import ResourceOverviewView, MyInstancesView, LimitSummaryView, InstanceOptionsView, CreateInstanceAPI

# from .views import ResourceOverviewView, MyInstancesView

urlpatterns = [
    path('resources/', ResourceOverviewView.as_view(), name='resource-overview'),
    path("instances/", MyInstancesView.as_view(), name="my-instances"),
    path('limits/', LimitSummaryView.as_view(), name='limit-summary'),
    path('instance-option/', InstanceOptionsView.as_view(), name='instance-option'),
    path('create-instance/', CreateInstanceAPI.as_view(), name='create-instance'),
]
