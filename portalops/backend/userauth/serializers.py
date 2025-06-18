# serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import UserProfile, Role, UserRoleMapping

User = get_user_model()

class CreateUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    role_id = serializers.IntegerField()

    def create(self, validated_data):
        role_id = validated_data.pop('role_id')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(password)
        user.save()

        user_profile = UserProfile.objects.create(
            user=user,
            phone_number=validated_data.get('phone_number', ''),
            address=validated_data.get('address', ''),
            timezone=validated_data.get('timezone', 'UTC'),
        )

        role = Role.objects.get(id=role_id)
        UserRoleMapping.objects.create(user_profile=user_profile, role=role)

        return user_profile

        # def get(self):
        #     user = User.objects.get(id=self.request.user.id)
        #
        #     return user_profile
        #

from .models import Role

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']
