from utils.conn import connect_with_token

def get_valid_token(redis_client, username: str, project_id: str):
    redis_key = f"keystone_token:{username}:{project_id}"
    token = redis_client.get(redis_key)
    if not token:
        raise ValueError("Token expired or missing")
    return token.decode() if isinstance(token, bytes) else token


def list_all_images(token: str, project_id: str):
    conn = connect_with_token(token, project_id)
    images = conn.image.images()

    result = []
    for image in images:
        props = getattr(image, "properties", {}) or {}
        image_type = props.get("image_type", "image")
        result.append({
            "id": image.id,
            "name": image.name,
            "size": image.size,
            "status": image.status,
            "created_at": image.created_at,
            "visibility": image.visibility,
            "disk_format": image.disk_format,
            "os_type": props.get("os_type", "-"),
            "image_type": image_type,
        })
    return result


def list_snapshots(token: str, project_id: str):
    conn = connect_with_token(token, project_id)
    images = conn.image.images()

    snapshots = []
    for img in images:
        props = getattr(img, "properties", {}) or {}
        is_snapshot = (
            props.get("image_type") == "snapshot" or
            props.get("instance_snapshot") == "true"
        )
        if not is_snapshot:
            continue

        snapshots.append({
            "id": img.id,
            "name": img.name,
            "size": img.size,
            "status": img.status,
            "created_at": img.created_at,
            "instance_id": props.get("instance_uuid"),
        })
    return snapshots
