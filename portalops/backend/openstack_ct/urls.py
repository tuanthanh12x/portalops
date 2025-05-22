from django.urls import path

from .views.usage_views import ResourceUsageView

urlpatterns = [
    path("usage/", ResourceUsageView.as_view(), name="project-usage"),
]
