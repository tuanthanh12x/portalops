from openstack import connection
from django.conf import settings
from keystoneauth1 import session
from keystoneauth1.identity import v3


def connect_with_token(token, project_id):
    """
    Basic connection to OpenStack with token and project_id.
    """
    auth = v3.Token(
        auth_url=settings.OPENSTACK_AUTH_URL,
        token=token,
        project_id=project_id
    )
    sess = session.Session(auth=auth)
    return connection.Connection(session=sess)


def vl_connect_with_token(token, project_id):
    """
    Connection to OpenStack block storage with endpoint override from settings.
    """
    auth = v3.Token(
        auth_url=settings.OPENSTACK_AUTH_URL,
        token=token,
        project_id=project_id
    )
    sess = session.Session(auth=auth)

    return connection.Connection(
        session=sess,
        block_storage_api_version='3',
        block_storage_endpoint_override=settings.OPENSTACK_BLOCK_STORAGE_URL
    )


def connect_with_token_v5(token, project_id):
    """
    Connection with token (verify=False) for special VNC or insecure SSL needs.
    """
    auth = v3.Token(
        auth_url=settings.OPENSTACK_AUTH_URL,
        token=token,
        project_id=project_id,
    )
    sess = session.Session(auth=auth, verify=False)
    return connection.Connection(session=sess)
