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


class LoginWithProjectView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "Username and password required"}, status=400)

        try:
            # Step 1: Authenticate without project_id
            conn = connection.Connection(
                auth_url=settings.OPENSTACK_AUTH["auth_url"],
                username=username,
                password=password,
                user_domain_name=settings.OPENSTACK_AUTH.get("user_domain_name", "Default"),
                project_domain_name=settings.OPENSTACK_AUTH.get("project_domain_name", "Default"),
                identity_api_version='3',
            )
            conn.authorize()

            # Step 2: Get list of projects
            keystone_url = settings.OPENSTACK_AUTH["auth_url"].rstrip("/")
            projects_url = f"{keystone_url}/auth/projects"

            headers = {"X-Auth-Token": conn.session.get_token()}
            resp = requests.get(projects_url, headers=headers)
            resp.raise_for_status()

            projects = resp.json().get("projects", [])

            if not projects:
                return Response({"detail": "No projects associated with this user"}, status=403)
            if len(projects) > 1:
                return Response({"detail": "Multiple projects found. Expected only one."}, status=400)

            project = projects[0]
            project_id = project["id"]

            # Step 3: Re-authenticate using project_id
            scoped_conn = connection.Connection(
                auth_url=settings.OPENSTACK_AUTH["auth_url"],
                username=username,
                password=password,
                project_id=project_id,
                user_domain_name=settings.OPENSTACK_AUTH.get("user_domain_name", "Default"),
                project_domain_name=settings.OPENSTACK_AUTH.get("project_domain_name", "Default"),
                identity_api_version='3',
            )
            scoped_conn.authorize()
            keystone_token = scoped_conn.session.get_token()

            # Get user roles
            user_id = scoped_conn.current_user_id
            roles = scoped_conn.identity.roles(user=user_id, project=project_id)
            role_names = [r.name for r in roles]

            # Store token in Redis
            redis_key = f"keystone_token:{username}:{project_id}"
            redis_client.set(redis_key, keystone_token, ex=3600)

            # Django user setup
            User = get_user_model()
            user, _ = User.objects.get_or_create(username=username)
            user.last_login = now()
            user.save(update_fields=['last_login'])

            # JWT generation
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
        except requests.exceptions.RequestException as e:
            return Response({"detail": f"Failed to retrieve projects: {str(e)}"}, status=400)
        except Exception as e:
            return Response({"detail": f"Login failed: {str(e)}"}, status=500)
