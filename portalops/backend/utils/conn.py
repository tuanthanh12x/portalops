from openstack import connection
from django.conf import settings

from keystoneauth1 import session
from keystoneauth1.identity import v3

def connect_with_token(token, project_id):
    auth = v3.Token(
        auth_url=settings.OPENSTACK_AUTH["auth_url"],
        token=token,
        project_id=project_id
    )
    sess = session.Session(auth=auth)
    return connection.Connection(session=sess)

def vl_connect_with_token(token, project_id):
    auth = v3.Token(
        auth_url=settings.OPENSTACK_AUTH["auth_url"],
        token=token,
        project_id=project_id
    )
    sess = session.Session(auth=auth)

    return connection.Connection(
        session=sess,
        block_storage_api_version='3',
        # force endpoint override
        block_storage_endpoint_override="http://172.93.187.251/volume/v3",  # ← your real cinder v3 public endpoint
    )

def connect_with_token_v5(token, project_id):
    auth = v3.Token(
        auth_url=settings.OPENSTACK_AUTH["auth_url"],
        token=token,
        project_id=project_id,
    )
    sess = session.Session(auth=auth, verify=False)  # verify goes here, NOT in Token
    return connection.Connection(session=sess)
