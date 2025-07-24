from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ProjectType(models.Model):
    name = models.CharField(max_length=100)
    price_per_month = models.DecimalField(max_digits=10, decimal_places=4)
    description = models.TextField(blank=True)

    instances = models.IntegerField()
    vcpus = models.IntegerField()
    ram = models.IntegerField()  # in MB
    metadata_items = models.IntegerField()
    key_pairs = models.IntegerField()
    server_groups = models.IntegerField()
    server_group_members = models.IntegerField()
    injected_files = models.IntegerField()
    injected_file_content_bytes = models.IntegerField()
    volumes = models.IntegerField()
    volume_snapshots = models.IntegerField()
    total_volume_gb = models.IntegerField()
    networks = models.IntegerField()
    subnets = models.IntegerField()
    ports = models.IntegerField()
    routers = models.IntegerField()
    floating_ips = models.IntegerField()
    security_groups = models.IntegerField()
    security_group_rules = models.IntegerField()

    def __str__(self):
        return self.name


class Project(models.Model):
    """
    Represents an OpenStack project with its metadata.
    """
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    type = models.ForeignKey(ProjectType, on_delete=models.SET_NULL, null=True, related_name="projects")
    openstack_id = models.CharField(max_length=128, unique=True, help_text="ID from OpenStack")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ProjectUserMapping(models.Model):
    """
    Maps a user to a project, optionally storing their role and status.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="project_mappings")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="user_mappings")
    role = models.CharField(max_length=50, default="member")
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'project')
        verbose_name = "Project User Mapping"
        verbose_name_plural = "Project User Mappings"

    def __str__(self):
        return f"{self.user.username} in {self.project.name} ({self.role})"



class IPStatus(models.TextChoices):
    AVAILABLE = "available", "Available"
    ALLOCATED = "allocated", "Allocated"
    RESERVED = "reserved", "Reserved"
    RELEASED = "released", "Released"


class FloatingIPPool(models.Model):
    ip_address = models.GenericIPAddressField(protocol="both", unique=True)
    subnet_id = models.UUIDField()  # liên kết tới subnet trong OpenStack
    network_id = models.UUIDField()  # external network
    project_id = models.UUIDField(null=True, blank=True)  # project dùng IP
    vm_id = models.UUIDField(null=True, blank=True)  # VM được gán IP
    vm_name = models.CharField(max_length=150)
    status = models.CharField(
        max_length=10,
        choices=IPStatus.choices,
        default=IPStatus.AVAILABLE
    )

    note = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "floating_ip_pool"
        indexes = [
            models.Index(fields=["subnet_id"]),
            models.Index(fields=["network_id"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.ip_address} [{self.status}]"