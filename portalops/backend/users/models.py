from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    openstack_user_id = models.CharField(max_length=128)
    customer_id = models.CharField(max_length=64, blank=True, null=True)

    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    company = models.CharField(max_length=128, blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)

    two_factor_enabled = models.BooleanField(default=False)
    credits = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def get_openstack_credentials(self):
        return {
            "user_id": self.openstack_user_id,
            "username": self.user.username,
        }

    def has_permission(self, permission):
        return self.user.has_perm(permission)

    def __str__(self):
        return f"{self.user.username} Profile"
