from rest_framework.permissions import BasePermission

from .models import UserProfile
from django.contrib.auth.models import User

class IsAdmin(BasePermission):
    """
    Only allow users who are administrators.
    """

    def has_permission(self, request, view):
        username = request.auth.get("username")
        user=User.objects.get(username=username)

        profile = user.userprofile
        if not profile:
            return False

        return profile.role_mappings.filter(role__name__iexact='admin').exists()


class HasProjectID(BasePermission):
    """
    ✅ Only allows access to users who have a project_id in their profile.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            return bool(request.user.userprofile.project_id)
        except UserProfile.DoesNotExist:
            return False