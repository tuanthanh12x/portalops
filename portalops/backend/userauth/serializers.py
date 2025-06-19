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



class UserListSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id',read_only=True)
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    role = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    # resources = serializers.SerializerMethodField()
    # credits = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source='user.date_joined')
    vm_count = serializers.IntegerField()
    class Meta:
        model = UserProfile
        fields = ['user_id','username', 'email', 'role', 'status', 'credits', 'created_at', 'vm_count']

    def get_role(self, obj):
        mapping = obj.role_mappings.first()
        return mapping.role.name if mapping else "N/A"

    def get_status(self, obj):
        return "Active" if obj.user.is_active else "Locked"




    # def get_credits(self, obj):
    #     return f"${obj.credits}" if obj.credits else "N/A"

    # users/serializers.py
    from rest_framework import serializers
    from django.contrib.auth import get_user_model
    # from rbac.serializers import RoleSerializer

    User = get_user_model()

    class AdminUserDetailSerializer(serializers.ModelSerializer):
        # role = RoleSerializer()
        resource_summary = serializers.SerializerMethodField()
        billing = serializers.SerializerMethodField()

        class Meta:
            model = User
            fields = [
                'id', 'username', 'email', 'phone_number',
                'is_active', 'role', 'two_factor_enabled',
                'date_joined', 'last_login',
                'vm_count', 'billing'
            ]

        def get_resource_summary(self, obj):
            return {
                "vms": 2,
                "storage": 40,  # GB
                "floating_ips": 1,
                "snapshots": 3
            }

        def get_billing(self, obj):
            return {
                "balance": "50.00",
                "last_payment_date": "2025-06-01",
                "due_date": "2025-07-01",
                "plan_name": "Premium",
                "current_usage": "18.75"
            }

