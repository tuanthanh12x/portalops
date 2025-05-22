from django.urls import path

from .views import ResourceOverviewView, MyInstancesView

# from .views import ResourceOverviewView, MyInstancesView

urlpatterns = [
    path('resources/', ResourceOverviewView.as_view(), name='resource-overview'),
    path("instances/", MyInstancesView.as_view(), name="my-instances"),
]
