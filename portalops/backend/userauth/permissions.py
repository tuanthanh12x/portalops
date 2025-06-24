from rest_framework.permissions import BasePermission

from userauth.models import UserProfile


class IsAdmin(BasePermission):
    """
    Only allow users who are administrators.
    """

    def has_permission(self, request, view):
        user = request.user

        # Không đăng nhập thì không cho qua
        if not user or not user.is_authenticated:
            return False

        # Đảm bảo có profile
        profile = getattr(user, 'userprofile', None)
        if not profile:
            return False

        # Kiểm tra profile có role admin không
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