# project/serializers.py
from rest_framework import serializers
from .models import ProjectUserMapping
from django.contrib.auth import get_user_model

User = get_user_model()


class AssignUserToProjectSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    project_id = serializers.IntegerField()
    def validate(self, data):
        try:
            user = User.objects.get(id=data["user_id"])
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        try:
            project = Project.objects.get(id=data["project_id"])
        except Project.DoesNotExist:
            raise serializers.ValidationError("Project not found.")

        if ProjectUserMapping.objects.filter(user=user, project=project).exists():
            raise serializers.ValidationError("User is already assigned to this project.")

        data["user"] = user
        data["project"] = project
        return data


from rest_framework import serializers
from .models import Project, ProjectType

class ProjectTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectType
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    type = ProjectTypeSerializer()

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'type', 'openstack_id', 'created_at']


class ReplaceProjectOwnerSerializer(serializers.Serializer):
    project = serializers.SlugRelatedField(
        queryset=Project.objects.all(),
        slug_field="openstack_id"
    )
    new_owner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())