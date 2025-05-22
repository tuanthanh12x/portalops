import requests

# Thay bằng token thực tế bạn lấy từ Keystone
token = "gAAAAABoLTH5VRJcw2mFKpkL8tgSnXlXB_E9bOoNvAqvG25DWNwAAPfKPBhdy7fTmUDkHXNpLF6tFzIZ_FQzB325kN7qpDS4XXQrty6UVQFCgzss1303UyS2RDLO7x3H_Ep1ZU-7uAM2rTWruCAtyarScauIBFBfiG-rbLn7K46-OqXVzhTRTIU"
nova_url = "http://172.93.187.251/compute/v2.1/servers/detail"

# Gửi request
headers = {
    "Content-Type": "application/json",
    "X-Auth-Token": token
}

response = requests.get(nova_url, headers=headers)

# Kiểm tra và hiển thị kết quả
if response.status_code == 200:
    data = response.json()
    for server in data.get("servers", []):
        print(f"Instance name: {server['name']}")
        print(f"Status: {server['status']}")
        print(f"ID: {server['id']}")
        print(f"Flavor: {server['flavor']}")
        print("-" * 30)
else:
    print("Failed to fetch instances")
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")
