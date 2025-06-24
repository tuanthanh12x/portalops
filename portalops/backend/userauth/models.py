import uuid

import pytz
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone


class Permission(models.Model):
    code = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name


class Role(models.Model):
    name = models.CharField(max_length=64, unique=True)
    permissions = models.ManyToManyField(Permission, related_name='roles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name



TIMEZONE_CHOICES = [(tz, tz) for tz in pytz.common_timezones]
STATUS=[]
class UserProfile(models.Model):
    # id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    openstack_user_id = models.CharField(max_length=128, blank=True, null=True)

    # Business-related
    customer_id = models.CharField(max_length=128, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    company = models.CharField(max_length=128, blank=True)

    # System fields
    vm_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=128, blank=True)
    two_factor_enabled = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=32, blank=True, null=True)
    credits = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    timezone = models.CharField(
        max_length=64,
        choices=TIMEZONE_CHOICES,
        default='UTC',
        help_text="Preferred time zone"
    )
    @property
    def user_model(self):
        """
        Return the associated Django User model instance.
        Equivalent to user, but follows a get_user_model() abstraction.
        """
        return self.user

    @property
    def is_admin(self) -> bool:
        """Return True if this user has the 'admin' role."""
        return self.role_mappings.filter(role__name__iexact='admin').exists()

    @staticmethod
    def get_user_model_class():
        """
        Return the Django User model class.
        Same as django.contrib.auth.get_user_model().
        """
        return get_user_model()

    def has_permission(self, perm_code: str) -> bool:
        return any(
            mapping.role.permissions.filter(code=perm_code).exists()
            for mapping in self.role_mappings.all()
        )

    def get_openstack_credentials(self):
        return {
            "user_id": self.openstack_user_id,
            "project_id": self.keystone_project_id
        }

    def __str__(self):
        return f"Profile of {self.user.username}"

class Pending2FASession(models.Model):
    session_key = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150)
    encrypted_password = models.TextField()  # If you store password here, encrypt it!
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"2FA session for {self.username} (expires {self.expires_at})"

class UserRoleMapping(models.Model):
    user_profile = models.ForeignKey(
        'UserProfile',
        on_delete=models.CASCADE,
        related_name='role_mappings'
    )
    role = models.ForeignKey(
        'Role',
        on_delete=models.CASCADE
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user_profile', 'role')
        verbose_name = "User Role Mapping"
        verbose_name_plural = "User Role Mappings"

    def __str__(self):
        return f"{self.user_profile} - {self.role.name}"

