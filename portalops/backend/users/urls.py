from django.urls import path
from .views import AccountOverviewView

urlpatterns = [
    path('getuserinfo/', AccountOverviewView.as_view(), name='login'),
]
