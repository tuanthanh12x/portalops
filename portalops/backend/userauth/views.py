import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from openstack_portal.services.keystone import login_with_keystone
from rest_framework_simplejwt.tokens import RefreshToken

from utils.redis_client import redis_client


from openstack import connection
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from utils.redis_client import redis_client



class LoginWithProjectView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        project_id = request.data.get("project_id")

        if not username or not password or not project_id:
            return Response({"detail": "Missing credentials or project_id"}, status=400)

        try:
            # Authenticate scoped to project
            conn = connection.Connection(
                auth_url=settings.OPENSTACK_AUTH["auth_url"],
                username=username,
                password=password,
                project_id=project_id,
                user_domain_name=settings.OPENSTACK_AUTH.get("user_domain_name", "Default"),
                project_domain_name=settings.OPENSTACK_AUTH.get("project_domain_name", "Default"),
                identity_api_version='3',
            )

            conn.authorize()
            keystone_token = conn.session.get_token()

            # Get user roles in this project
            user_id = conn.current_user_id
            roles = conn.identity.roles(user=user_id, project=project_id)
            role_names = [r.name for r in roles]

            # Store token in Redis with project-specific key
            redis_key = f"keystone_token:{username}:{project_id}"
            redis_client.set(redis_key, keystone_token, ex=3600)

            # Create or get local user
            User = get_user_model()
            user, _ = User.objects.get_or_create(username=username)

            # Generate JWT
            refresh = RefreshToken.for_user(user)
            refresh["username"] = username
            refresh["project_id"] = project_id
            refresh["roles"] = role_names
            refresh["keystone_token"] = keystone_token

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })

        except exceptions.HttpException as e:
            return Response({"detail": f"Authentication failed: {e.details}"}, status=401)
        except Exception as e:
            return Response({"detail": f"Login failed: {str(e)}"}, status=500)

from openstack import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from openstack import connection
from openstack import exceptions



class GetProjectsView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "Username and password required"}, status=400)

        try:
            conn = connection.Connection(
                auth_url=settings.OPENSTACK_AUTH["auth_url"],
                username=username,
                password=password,
                user_domain_name=settings.OPENSTACK_AUTH.get("user_domain_name", "Default"),
                project_domain_name=settings.OPENSTACK_AUTH.get("project_domain_name", "Default"),
                identity_api_version='3',
            )
            conn.authorize()


            token = conn.authorize()

            keystone_url = settings.OPENSTACK_AUTH["auth_url"].rstrip("/")
            projects_url = f"{keystone_url}/auth/projects"

            headers = {
                "X-Auth-Token": conn.session.get_token()
            }
            resp = requests.get(projects_url, headers=headers)
            resp.raise_for_status()

            projects = resp.json().get("projects", [])
            project_list = [{"id": p["id"], "name": p["name"]} for p in projects]

            return Response({"projects": project_list})

        except exceptions.HttpException as e:
            return Response({"detail": f"Failed to authenticate or get projects: {str(e)}"}, status=401)
        except requests.exceptions.RequestException as e:
            return Response({"detail": f"Failed to get projects: {str(e)}"}, status=400)
        except Exception as e:
            return Response({"detail": f"Unexpected error: {str(e)}"}, status=500)