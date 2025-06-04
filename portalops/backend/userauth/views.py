import requests
from django.conf import settings
from django.utils.timezone import now
from openstack_portal.services.keystone import login_with_keystone
from rest_framework.response import Response
from utils.redis_client import redis_client

from openstack import exceptions, connection

from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from utils.redis_client import redis_client

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "Missing credentials"}, status=400)

        try:
            # Step 1: Authenticate user globally (without project scope)
            conn = connection.Connection(
                auth_url=settings.OPENSTACK_AUTH["auth_url"],
                username=username,
                password=password,
                user_domain_name=settings.OPENSTACK_AUTH.get("user_domain_name", "Default"),
                project_domain_name=settings.OPENSTACK_AUTH.get("project_domain_name", "Default"),
                identity_api_version='3',
            )
            conn.authorize()

            # Step 2: Get projects of user
            token = conn.session.get_token()
            keystone_url = settings.OPENSTACK_AUTH["auth_url"].rstrip("/")
            projects_url = f"{keystone_url}/auth/projects"
            headers = {"X-Auth-Token": token}

            resp = requests.get(projects_url, headers=headers)
            resp.raise_for_status()
            projects = resp.json().get("projects", [])

            # Step 3: Check if user has exactly one project
            if len(projects) != 1:
                return Response({"detail": "User must have exactly one project."}, status=400)

            project_id = projects[0]["id"]

            # Step 4: Authenticate scoped to that project
            conn_project = connection.Connection(
                auth_url=settings.OPENSTACK_AUTH["auth_url"],
                username=username,
                password=password,
                project_id=project_id,
                user_domain_name=settings.OPENSTACK_AUTH.get("user_domain_name", "Default"),
                project_domain_name=settings.OPENSTACK_AUTH.get("project_domain_name", "Default"),
                identity_api_version='3',
            )
            conn_project.authorize()
            keystone_token = conn_project.session.get_token()

            # Step 5: Generate JWT token & return
            User = get_user_model()
            user, _ = User.objects.get_or_create(username=username)
            user.last_login = now()
            user.save(update_fields=['last_login'])

            refresh = RefreshToken.for_user(user)
            refresh["username"] = username
            refresh["project_id"] = project_id
            refresh["keystone_token"] = keystone_token

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })

        except Exception as e:
            return Response({"detail": f"Login failed: {str(e)}"}, status=401)
