from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Cho phép truy cập nếu user có role 'admin' (không phân biệt hoa thường).
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
