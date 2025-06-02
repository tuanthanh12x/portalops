from django.urls import path

from .views.cinder import ListVolumesView
from .views.glance import ListImagesView
from .views.nova import InstanceOptionsView, CreateInstanceAPI, CreateImageAPI, CreateKeypairAPI, InstanceActionAPI, \
    VolumeOptionsView, CreateVolumeAPI

urlpatterns = [
    path('instance-option/', InstanceOptionsView.as_view(), name='instance-option'),
    path('volume-option/', VolumeOptionsView.as_view(), name='volume-option'),
    path('compute/instances/', CreateInstanceAPI.as_view(), name='create-instance'),
    path('storage/volumes/', CreateVolumeAPI.as_view(), name='create-volume'),
    path('compute/images/', CreateImageAPI.as_view(), name='create-image'),
    path('compute/keypair/', CreateKeypairAPI.as_view(), name='create-keypair'),
    path("compute/instances/<str:id>/action/", InstanceActionAPI.as_view()),
    path("image/images/", ListImagesView.as_view(), name="list-images"),
    path("storage/volumes", ListVolumesView.as_view(), name="list-volumes"),
]
