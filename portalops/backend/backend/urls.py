
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('api/auth/', include('userauth.urls')),
    path('api/overview/', include('overview.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/openstack/', include('openstack_portal.urls')),
    path('api/project/', include('project.urls')),
]
