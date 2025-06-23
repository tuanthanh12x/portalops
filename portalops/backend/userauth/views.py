import base64
import json
import uuid
from datetime import timedelta

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.http import JsonResponse
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from openstack import connection
import requests
from django.conf import settings

from django.contrib.auth import authenticate, get_user_model, update_session_auth_hash
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from django.contrib.auth.hashers import make_password
from django.utils.timezone import localtime, is_naive, make_aware
from openstack.identity import v3
from rest_framework.decorators import api_view
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import UserProfile, UserRoleMapping, Role
from utils.redis_client import redis_client
from rest_framework_simplejwt.tokens import RefreshToken, TokenError, AccessToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from .models import UserProfile
from .serializers import CreateUserSerializer, RoleSerializer, UserListSerializer


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "Missing credentials"}, status=400)

        user = authenticate(request, username=username, password=password)
        if not user or not user.is_active:
            return Response({"detail": "Invalid credentials."}, status=401)

        try:
            profile = user.userprofile
        except UserProfile.DoesNotExist:
            return Response({"detail": "User profile not found."}, status=500)

        # Two-Factor Authentication required
        if profile.two_factor_enabled:
            # Generate session_key and store temporarily (in Redis or DB)
            session_key = str(uuid.uuid4())
            redis_key = f"2fa_session:{session_key}"
            redis_client.set(redis_key, f"{username}:{password}", ex=300)  # 5-minute expiry

            return Response({
                "require_2fa": True,
                "session_key": session_key,
                "message": "2FA required. Please verify your OTP code."
            }, status=200)
        roles = []
        if profile:
            roles = list(
                profile.role_mappings.select_related("role")
                .values_list("role__name", flat=True)
            )
        # If no 2FA required, proceed to generate token
        refresh = RefreshToken.for_user(user)
        refresh["username"] = user.username
        refresh["email"] = user.email
        refresh["roles"] = roles

        profile.last_login = format_last_login(now())
        profile.save()

        # Keystone Token for OpenStack
        if profile.project_id:
            try:
                conn = connection.Connection(
                    auth_url=settings.OPENSTACK_AUTH["auth_url"],
                    username=username,
                    password=password,
                    project_id=profile.project_id,
                    user_domain_name=settings.OPENSTACK_AUTH.get("user_domain_name", "Default"),
                    project_domain_name=settings.OPENSTACK_AUTH.get("project_domain_name", "Default"),
                    identity_api_version='3',
                )
                conn.authorize()
                keystone_token = conn.session.get_token()

                # refresh["keystone_token"] = keystone_token
                refresh["project_id"] = profile.project_id

                redis_key = f"keystone_token:{username}:{profile.project_id}"
                redis_client.set(redis_key, keystone_token, ex=3600)
                if profile.is_admin:
                    conn = connection.Connection(
                        auth_url=settings.OPENSTACK_AUTH["auth_url"],
                        username=username,
                        password=password,
                        user_domain_name=settings.OPENSTACK_AUTH.get("user_domain_name", "Default"),
                        project_domain_name=settings.OPENSTACK_AUTH.get("project_domain_name", "Default"),
                        identity_api_version='3',
                    )
                    conn.authorize()
                    keystone_token = conn.session.get_token()

                    refresh["keystone_token"] = keystone_token

                    redis_key = f"unscope_admin_keystone_token:{username}"
                    redis_client.set(redis_key, keystone_token, ex=36000)
            except Exception as e:
                print(f"[⚠️ OpenStack Error] {e}")


        response = JsonResponse({
            "message": "Login successful.",
            "access": str(refresh.access_token),
        })

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Strict",
            path="/api/auth/token/refresh/"
        )

        return response

class RefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({"detail": "No refresh token provided."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)
            return Response({"access": access_token})
        except TokenError:
            return Response({"detail": "Invalid or expired refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"message": "Logged out successfully."}, status=200)
        response.delete_cookie(
            key="refresh_token",
            path="/api/auth/token/refresh/",
            # samesite="Lax",  # or "Strict", depending on your settings
            # secure=True
        )
        return response


class SignUpView(APIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        if not username or not email or not password:
            return Response({"detail": "Missing username, email or password."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            User = get_user_model()

            if User.objects.filter(username=username).exists():
                return Response({"detail": "Username already taken."}, status=status.HTTP_409_CONFLICT)

            if User.objects.filter(email=email).exists():
                return Response({"detail": "Email already in use."}, status=status.HTTP_409_CONFLICT)

            user = User.objects.create(
                username=username,
                email=email,
                password=make_password(password),
                last_login=now(),
            )
            profile = UserProfile.objects.create(user=user)

            create_openstack_user.delay(user.id, password)

            default_role_name = "Guest"
            try:
                default_role = Role.objects.get(name=default_role_name)
                UserRoleMapping.objects.create(user_profile=profile, role=default_role)
            except Role.DoesNotExist:
                return Response({"detail": f"Default role '{default_role_name}' not found."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "message": "Registration successful.",
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"detail": f"Registration failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.auth.get("username")
        user = User.objects.get(username=username)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        return Response({
            "email": user.email,
            "two_factor_enabled": profile.two_factor_enabled if profile else False,
            "last_login": user.last_login,
            "timezone": getattr(user, "timezone", "UTC"),
        })

class UserProfileInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.auth.get("username")
        user=User.objects.get(username=username)
        profile = getattr(user, 'userprofile', None)

        return Response({
            "username": user.username,
            "full_name": f"{user.first_name} {user.last_name}".strip(),
            "email": user.email,
            "last_login": user.last_login,
            "date_joined": user.date_joined,

            # Profile fields
            "phone_number": profile.phone_number if profile else "",
            "company": profile.company if profile else "",
            "address": profile.address if profile else "",
            "timezone": profile.timezone if profile else "UTC",
            "two_factor_enabled": profile.two_factor_enabled if profile else False,
            "credits": str(profile.credits) if profile else "0.00",
            "customer_id": profile.customer_id if profile else "",
            "openstack_user_id": profile.openstack_user_id if profile else "",
            "project_id": profile.project_id if profile else "",
        })
class UpdateUserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        data = request.data

        profile.full_name = data.get('full_name', profile.full_name)
        profile.phone_number = data.get('phone_number', profile.phone_number)
        profile.company = data.get('company', profile.company)
        profile.address = data.get('address', profile.address)
        profile.timezone = data.get('timezone', profile.timezone)

        try:
            profile.save()
            return Response({'message': 'Profile updated successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def format_last_login(last_login):
    if last_login:
        if is_naive(last_login):
            last_login = make_aware(last_login)
        return localtime(last_login).isoformat()
    return None

def serialize_user_profile(user):
    profile = user.profile
    roles = [mapping.role.name for mapping in profile.role_mappings.all()]
    return {
        "email": user.email,
        "username": user.username,
        "company": profile.company,
        "credits": float(profile.credits),
        "two_factor_enabled": profile.two_factor_enabled,
        "last_login": format_last_login(user.last_login),
        "timezone": getattr(profile, "timezone", "UTC"),
        "openstack_user_id": profile.openstack_user_id,
        "phone_number": profile.phone_number,
        "roles": roles,
    }

class AccountOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(serialize_user_profile(request.user))

class ListUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(serialize_user_profile(request.user))



class ResetPasswordConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        password = request.data.get("password")
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid token or user"}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Token is invalid or has expired"}, status=status.HTTP_400_BAD_REQUEST)



class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not current_password or not new_password or not confirm_password:
            return Response(
                {"error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {"error": "New password and confirmation do not match."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if current_password == new_password:
            return Response(
                {"error": "New password must be different from the current password."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)  # Prevents logout after password change

        return Response(
            {"message": "Your password has been successfully updated."},
            status=status.HTTP_200_OK
        )
class CreateUserAPIView(APIView):
    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            user_profile = serializer.save()
            user = user_profile.user
            raw_password = getattr(user_profile, "raw_password", None)

            role_mapping = user_profile.role_mappings.first()
            role = role_mapping.role.name.lower() if role_mapping else "unknown"

            if role == "customer" and raw_password:
                create_openstack_project_and_user.delay(user.id, raw_password)

            return Response({
                "message": "User created successfully.",
                "username": user.username,
                "role": role
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class RoleListAPIView(ListAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer


from .tasks import send_reset_password_email, create_openstack_project_and_user, sync_vm_count_for_all_users ,create_openstack_user


class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        send_reset_password_email.delay(user.email, uid, token)
        return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)

import pyotp
import qrcode
import io


class Generate2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.userprofile

        if not profile.totp_secret:
            profile.totp_secret = pyotp.random_base32()
            profile.save()

        totp_uri = pyotp.totp.TOTP(profile.totp_secret).provisioning_uri(
            name=user.username,
            issuer_name="PortalOps"
        )

        qr = qrcode.make(totp_uri)
        buffer = io.BytesIO()
        qr.save(buffer, format='PNG')
        qr_b64 = base64.b64encode(buffer.getvalue()).decode()

        return Response({"qr_code": f"data:image/png;base64,{qr_b64}"})

class CodeSessionSerializer(serializers.Serializer):
    code = serializers.CharField()
    session_key = serializers.CharField()

class CodeOnlySerializer(serializers.Serializer):
    code = serializers.CharField()



class Verify2FASetupView(APIView):
    permission_classes = [IsAuthenticated]

    def require_fields(data, *fields):
        missing = [f for f in fields if f not in data or data[f] in [None, ""]]
        if missing:
            raise ValueError(f"Missing required field(s): {', '.join(missing)}")

    def post(self, request):
        serializer = CodeOnlySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        code = serializer.validated_data["code"]
        profile = request.user.userprofile

        totp = pyotp.TOTP(profile.totp_secret)
        if totp.verify(code):
            profile.two_factor_enabled = True
            profile.save()
            return Response({"message": "2FA enabled successfully"})
        return Response({"error": "Invalid code"}, status=400)



class TwoFactorLoginHandler:
    def __init__(self, request):
        self.request = request
        self.data = request.data
        self.user = None
        self.profile = None
        self.username = None
        self.password = None

    def validate_input(self):
        serializer = CodeSessionSerializer(data=self.data)
        if not serializer.is_valid():
            return None, Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return serializer.validated_data, None

    def load_user_session(self, session_key):
        session_data = redis_client.get(f"2fa_session:{session_key}")
        if not session_data:
            return Response({"error": "Session expired or invalid."}, status=403)

        try:
            value = session_data
            if isinstance(value, bytes):
                value = value.decode("utf-8")

            username, password = value.split(":", 1)

            # Gán lại cho self để dùng tiếp
            self.user = User.objects.get(username=username)
            self.username = username
            self.profile = self.user.userprofile
            self.password = password
        except (User.DoesNotExist, UserProfile.DoesNotExist):
            return Response({"error": "User or profile not found."}, status=404)
        except ValueError:
            return Response({"error": "Corrupted session data."}, status=400)

        return None

    def load_user_profile(self):
        try:
            self.user = User.objects.get(username=self.username)
            self.profile = self.user.userprofile
        except (User.DoesNotExist, UserProfile.DoesNotExist):
            return Response({"error": "Invalid user or missing profile."}, status=404)
        return None

    def verify_totp(self, code):
        totp = pyotp.TOTP(self.profile.totp_secret)
        if not totp.verify(code):
            return Response({"error": "Invalid 2FA code."}, status=400)
        return None

    def issue_tokens_and_cache(self):
        self.profile.last_login = timezone.now()
        self.profile.save()
        roles = []
        if profile:
            roles = list(
                profile.role_mappings.select_related("role")
                .values_list("role__name", flat=True)
            )
        refresh = RefreshToken.for_user(self.user)
        refresh["username"] = self.user.username
        refresh["email"] = self.user.email
        refresh["roles"] = roles

        if self.profile.project_id:
            refresh["project_id"] = self.profile.project_id
            try:
                conn = connection.Connection(
                    auth_url=settings.OPENSTACK_AUTH["auth_url"],
                    username=self.username,
                    password=self.password,
                    project_id=self.profile.project_id,
                    user_domain_name=settings.OPENSTACK_AUTH.get("user_domain_name", "Default"),
                    project_domain_name=settings.OPENSTACK_AUTH.get("project_domain_name", "Default"),
                    identity_api_version="3"
                )
                conn.authorize()
                token = conn.session.get_token()
                redis_client.set(
                    f"keystone_token:{self.username}:{self.profile.project_id}",
                    token,
                    ex=3600
                )
            except Exception as e:
                print(f"[OpenStack] Failed to authorize user: {e}")

            if self.profile.is_admin:
                conn = connection.Connection(
                    auth_url=settings.OPENSTACK_AUTH["auth_url"],
                    username=self.username,
                    password=self.password,
                    user_domain_name=settings.OPENSTACK_AUTH.get("user_domain_name", "Default"),
                    project_domain_name=settings.OPENSTACK_AUTH.get("project_domain_name", "Default"),
                    identity_api_version='3',
                )
                conn.authorize()
                keystone_token = conn.session.get_token()

                refresh["keystone_token"] = keystone_token

                redis_key = f"unscope_admin_keystone_token:{self.username}"
                redis_client.set(redis_key, keystone_token, ex=36000)

        response = JsonResponse({
            "access": str(refresh.access_token),
            "message": "2FA login successful"
        })
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Strict",
            path="/api/auth/token/refresh/"
        )
        return response

    def execute(self):
        validated_data, error_response = self.validate_input()
        if error_response:
            return error_response

        code = validated_data.get("code")
        session_key = validated_data.get("session_key")

        error_response = self.load_user_session(session_key)
        if error_response:
            return error_response

        error_response = self.load_user_profile()
        if error_response:
            return error_response

        error_response = self.verify_totp(code)
        if error_response:
            return error_response

        # Delete temp session after use
        redis_client.delete(f"2fa_session:{session_key}")

        return self.issue_tokens_and_cache()


class TWOFALoginView(APIView):
    """
    Verifies 2FA code after username/password login.
    Returns JWT and sets refresh token cookie.
    """
    permission_classes = []  # Allow unauthenticated access here

    def post(self, request):
        handler = TwoFactorLoginHandler(request)
        return handler.execute()


class UserListView(APIView):
    # permission_classes = [IsAdminUser]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = UserProfile.objects.select_related("user").all()
        serializer = UserListSerializer(queryset, many=True)
        return Response(serializer.data)



@api_view(['POST'])
def trigger_vm_sync(request):
    sync_vm_count_for_all_users.delay()
    return Response({"message": "VM count sync triggered"}, status=202)





class AdminUserDetailView(APIView):
    # permission_classes = [IsAdminUser]
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Try get UserProfile if exists
        profile = getattr(user, 'userprofile', None)

        # Try get Role if exists
        role_mapping = profile.role_mappings.first() if profile else None
        role_name = role_mapping.role.name if role_mapping else "No Role Assigned"

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone_number": profile.phone_number if profile else "",
            "is_active": user.is_active,
            "is_2fa_enabled": profile.two_factor_enabled if profile else False,
            "project_id": profile.project_id,
            "role": {
                "name": role_name
            },
            "date_joined": user.date_joined,
            "last_login": user.last_login,

            # Mocked resource summary
            "resource_summary": {
                "vms": profile.vm_count if profile else 0,
                "storage": 40,
                "floating_ips": 1,
                "snapshots": 3
            },

            # Mocked billing summary
            "billing": {
                "balance": "50.00",
                "last_payment_date": "2025-06-01",
                "due_date": "2025-07-01",
                "plan_name": "Premium",
                "current_usage": "18.75"
            }
        })

from keystoneauth1.identity import v3
from keystoneauth1 import session as ks_session

from keystoneauth1.identity import v3
from keystoneauth1 import session as ks_session

class ImpersonateUserTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        admin = request.user
        user_id = request.data.get("id")
        if not user_id:
            return Response({"detail": "Missing user_id."}, status=400)

        try:
            target_user = User.objects.get(id=user_id)
            target_profile = target_user.userprofile
            target_project_id = target_profile.project_id
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)
        except Exception:
            return Response({"detail": "User profile not found."}, status=500)

        # Get unscoped admin token
        unscoped_token = redis_client.get(f"unscope_admin_keystone_token:{admin.username}")
        if not unscoped_token:
            return Response({"detail": "Unscoped token not found or expired."}, status=403)

        try:
            token_str = unscoped_token.decode() if isinstance(unscoped_token, bytes) else unscoped_token

            auth = v3.Token(
                auth_url=settings.OPENSTACK_AUTH_URL,
                token=token_str,
                project_id=target_project_id,
                project_domain_name=settings.PROJECT_DOMAIN_NAME,
            )
            sess = ks_session.Session(auth=auth)
            scoped_token = sess.get_token()
        except Exception as e:
            return Response({"detail": f"Failed to scope token: {e}"}, status=500)
        profile = getattr(admin, 'userprofile', None)
        admin_access_token = request.auth  # DRF sets this from Authorization header
        if admin_access_token:
            redis_client.set(
                f"admin_access_token:{admin.username}:{profile.project_id}",
                str(admin_access_token),
                ex=3600
            )
        refresh = RefreshToken.for_user(admin)
        refresh["id"] = user_id
        refresh["admin_name"]=admin.username
        refresh["admin_project_id"]=profile.project_id
        refresh["username"] = target_user.username
        refresh["email"] = target_user.email
        refresh["project_id"] = target_project_id
        refresh["keystone_token"]= str(scoped_token)
        refresh["mark"]="up-to-date"
        refresh["impersonated"] = True

        # Store scoped impersonated token
        redis_client.set(
            f"keystone_token:{target_user.username}:{target_project_id}",
            scoped_token,
            ex=3600
        )

        return Response({
            "access": str(refresh.access_token),
            "username": target_user.username,
            "project_id": target_project_id
        }, status=200)
import jwt
class UnimpersonateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"detail": "Missing or invalid Authorization header"}, status=status.HTTP_401_UNAUTHORIZED)

        token = auth_header.split(" ")[1]

        try:
            # Decode token to extract claims
            payload = jwt.decode(token, options={"verify_signature": False})
            admin_username = payload.get("admin_name")
            admin_project_id = payload.get("admin_project_id")
        except Exception as e:
            return Response({"detail": f"Invalid token: {str(e)}"}, status=status.HTTP_401_UNAUTHORIZED)

        if not admin_username or not admin_project_id:
            return Response({"detail": "Missing admin info in token"}, status=status.HTTP_400_BAD_REQUEST)

        redis_key = f"admin_access_token:{admin_username}:{admin_project_id}"
        admin_token = redis_client.get(redis_key)
        if not admin_token:
            return Response({"detail": "Admin token not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "message": f"Restored token of admin user '{admin_username}'",
            "token": admin_token
        })