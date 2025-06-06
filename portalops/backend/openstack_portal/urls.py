from django.urls import path

from .views.cinder import VolumeAPI
from .views.glance import ListImagesView, SnapshotListAPIView
from .views.nova import InstanceOptionsView, CreateInstanceAPI, CreateImageAPI, InstanceActionAPI, \
    VolumeOptionsView, KeypairView, VPSDetailView, InstanceSnapshotView

urlpatterns = [
    path('instance-option/', InstanceOptionsView.as_view(), name='instance-option'),
    path("vps/<str:instance_id>/", VPSDetailView.as_view()),

    path('volume-option/', VolumeOptionsView.as_view(), name='volume-option'),
    path('compute/instances/', CreateInstanceAPI.as_view(), name='create-instance'),
    path('storage/volumes/', VolumeAPI.as_view(), name='volume_api'),
    path('compute/images/', CreateImageAPI.as_view(), name='create-image'),
    path('compute/keypair/', KeypairView.as_view(), name='keypair'),
    path("compute/instances/<str:id>/action/", InstanceActionAPI.as_view()),
    path('compute/instances/<str:instance_id>/snapshot/', InstanceSnapshotView.as_view(), name='instance-snapshot'),
    path("image/images/", ListImagesView.as_view(), name="list-images"),
    path('image/instance-snapshots/', SnapshotListAPIView.as_view(), name='snapshot-list'),
]
