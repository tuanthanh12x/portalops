from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ProjectType(models.Model):
    """
    Represents the type/category of a project, e.g., Development, Production.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

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
