from django.urls import path

from .views.cinder import VolumeAPI
from .views.glance import ListImagesView, SnapshotListAPIView
from .views.neutron import PortListView, FloatingIPListView, AttachFloatingIPView, NetworkListView, CreateNetworkView, \
    SubnetListView, AssignOrReplaceFloatingIPView, RemovingFloatingIPView, CreateNetworkAPI, AddingFloatingIPView, \
    ListAllIPView, GetVMIPsView, ChangePasswordVMView
from .views.nova import InstanceOptionsView, CreateInstanceAPI, CreateImageAPI, InstanceActionAPI, \
    VolumeOptionsView, KeypairView, VPSDetailView, InstanceSnapshotView, CreateInstanceAsAdminAPI

urlpatterns = [
    path('instance-option/', InstanceOptionsView.as_view(), name='instance-option'),
    path("vps/<str:instance_id>/", VPSDetailView.as_view()),

    path('volume-option/', VolumeOptionsView.as_view(), name='volume-option'),
    path('compute/instances/', CreateInstanceAPI.as_view(), name='create-instance'),
    path('compute/admin-instances/', CreateInstanceAsAdminAPI.as_view(), name='admin-create-instance'),
    path('storage/volumes/', VolumeAPI.as_view(), name='volume_api'),
    path('compute/images/', CreateImageAPI.as_view(), name='create-image'),
    path('compute/keypair/', KeypairView.as_view(), name='keypair'),
    path("compute/instances/<str:id>/action/", InstanceActionAPI.as_view()),
    path('compute/instances/<str:instance_id>/snapshot/', InstanceSnapshotView.as_view(), name='instance-snapshot'),
    path("image/images/", ListImagesView.as_view(), name="list-images"),
    path('image/instance-snapshots/', SnapshotListAPIView.as_view(), name='snapshot-list'),
    path('network/<str:network_id>/ports/', PortListView.as_view(), name='network-port-list'),
    path('network/floatingip-list/', FloatingIPListView.as_view(), name='floating-ip-list'),
    path('network/attach-floating-ip/', AttachFloatingIPView.as_view(), name='action-list'),
    path("network/network-list/", NetworkListView.as_view(), name="network-list"),
    path("network/subnet-list/", SubnetListView.as_view(), name="network-list"),
    path("network/create-network/", CreateNetworkView.as_view(), name="network-list"),
    path("network/assign-or-replace-floating-ip/", AssignOrReplaceFloatingIPView.as_view(), name="assign-or-replace-floating-ip"),
    path("network/remove-floating-ip/", RemovingFloatingIPView.as_view(), name="remove-floating-ip"),
    path("network/create-networks/", CreateNetworkAPI.as_view(), name="create-networks"),
    path("network/assign-floating-ip/", AddingFloatingIPView.as_view(), name="assign-floating-ip"),
    path("network/list-all-ip-of-project/", ListAllIPView.as_view(), name="list-all-ip-of-project"),
    path("network/list-all-ip-of-vm/<str:vm_id>/", GetVMIPsView.as_view(), name="list-all-ip-of-vm"),
    path("vms/<str:vm_id>/change-password/", ChangePasswordVMView.as_view(), name="change-vm-password"),

]
