from openstack import connection, exceptions

from backend.backend.settings.base import OPENSTACK_AUTH

def test_openstack_connection():
    try:
        conn = connection.Connection(**OPENSTACK_AUTH)
        projects = list(conn.identity.projects())
        print("✅ Kết nối OpenStack thành công!")
        print(f"🔢 Số lượng project: {len(projects)}")
        for p in projects:
            print(f"📁 Project: {p.name} (ID: {p.id})")
    except exceptions.HttpException as e:
        print(f"❌ HTTP lỗi khi kết nối OpenStack: {e}")
    except Exception as e:
        print(f"❌ Lỗi kết nối OpenStack: {e}")

if __name__ == "__main__":
    test_openstack_connection()