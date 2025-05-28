from django.urls import path

from .views.nova import InstanceOptionsView, CreateInstanceAPI, CreateImageAPI, CreateKeypairAPI

urlpatterns = [
    path('instance-option/', InstanceOptionsView.as_view(), name='instance-option'),
    path('create-instance/', CreateInstanceAPI.as_view(), name='create-instance'),
    path('create-image/', CreateImageAPI.as_view(), name='create-image'),
path('create-keypair/', CreateKeypairAPI.as_view(), name='create-keypair'),
]
