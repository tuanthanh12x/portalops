import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from openstack_portal.services.keystone import login_with_keystone
from rest_framework_simplejwt.tokens import RefreshToken

from utils.redis_client import redis_client


class LoginWithProjectView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        project_id = request.data.get("project_id")

        if not username or not password or not project_id:
            return Response({"detail": "Missing credentials or project_id"}, status=400)

        keystone_url = settings.OPENSTACK_AUTH["auth_url"].rstrip("/") + "/auth/tokens"
        payload = {
            "auth": {
                "identity": {
                    "methods": ["password"],
                    "password": {
                        "user": {
                            "name": username,
                            "domain": {"name": settings.OPENSTACK_AUTH.get("user_domain_name", "Default")},
                            "password": password,
                        }
                    }
                },
                "scope": {
                    "project": {
                        "id": project_id
                    }
                }
            }
        }

        try:
            resp = requests.post(keystone_url, json=payload)
            resp.raise_for_status()
        except:
            return Response({"detail": "Login failed"}, status=401)

        if resp.status_code != 201:
            return Response({"detail": "Invalid credentials or project"}, status=401)

        keystone_token = resp.headers.get("X-Subject-Token")
        user_info = resp.json().get("token", {})
        roles = [r["name"] for r in user_info.get("roles", [])]

        redis_client.set(f"keystone_token:{username}", keystone_token, ex=3600)

        User = get_user_model()
        user, _ = User.objects.get_or_create(username=username)

        refresh = RefreshToken.for_user(user)
        refresh["username"] = username
        refresh["project_id"] = project_id
        refresh["roles"] = roles
        refresh["keystone_token"] = keystone_token

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })
class GetProjectsView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "Username and password required"}, status=400)

        keystone_url = settings.OPENSTACK_AUTH["auth_url"].rstrip("/") + "/auth/tokens"
        payload = {
            "auth": {
                "identity": {
                    "methods": ["password"],
                    "password": {
                        "user": {
                            "name": username,
                            "domain": {"name": settings.OPENSTACK_AUTH.get("user_domain_name", "Default")},
                            "password": password,
                        }
                    }
                }
            }
        }

        try:
            resp = requests.post(keystone_url, json=payload)
            resp.raise_for_status()
        except requests.exceptions.RequestException:
            return Response({"detail": "Cannot connect to Keystone"}, status=503)

        if resp.status_code != 201:
            return Response({"detail": "Invalid credentials"}, status=401)

        token = resp.headers.get("X-Subject-Token")

        project_url = settings.OPENSTACK_AUTH["auth_url"].rstrip("/") + "/auth/projects"
        try:
            proj_resp = requests.get(project_url, headers={"X-Auth-Token": token})
            proj_resp.raise_for_status()
        except:
            return Response({"detail": "Failed to get projects"}, status=400)

        return Response({"projects": proj_resp.json().get("projects", [])})