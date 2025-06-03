from django.urls import path

from .views.cinder import VolumeAPI
from .views.glance import ListImagesView
from .views.nova import InstanceOptionsView, CreateInstanceAPI, CreateImageAPI, InstanceActionAPI, \
    VolumeOptionsView,  KeypairView

urlpatterns = [
    path('instance-option/', InstanceOptionsView.as_view(), name='instance-option'),
    path('volume-option/', VolumeOptionsView.as_view(), name='volume-option'),
    path('compute/instances/', CreateInstanceAPI.as_view(), name='create-instance'),
    path('volumes', VolumeAPI.as_view(), name='volume_api'),
    path('compute/images/', CreateImageAPI.as_view(), name='create-image'),
    path('compute/keypair/', KeypairView.as_view(), name='keypair'),
    path("compute/instances/<str:id>/action/", InstanceActionAPI.as_view()),
    path("image/images/", ListImagesView.as_view(), name="list-images"),
]
