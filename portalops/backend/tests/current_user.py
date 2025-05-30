import requests

# Thông tin
keystone_url = "http://172.93.187.251/identity"
user_id = "e7a3f3fed80e4a0d9e24c3fe72a7eb78"
token = "gAAAAABoLSfWhf0bvJ6abl8m9trFaUHH9GqV3AJK8WrGlnRK7N6Y9ICDYp6zzvm5A9EzlSPTYnXapPXbwh5msufZJT3a5APaRydpbpjX7ruo53UznSSpE6m6twJuY-9OceLa2G-snEnxWNKLLzKepQkMQRAs8CZa3lca7SDJ0IZ2l2OeH4m7hpA"
headers = {
    "X-Auth-Token": token,
    "Content-Type": "application/json"
}

url = f"{keystone_url}/v3/users/{user_id}"

response = requests.get(url, headers=headers)

if response.status_code == 200:
    user_info = response.json()
    print("User Info:")
    print(user_info)
else:
    print(f"Failed to get user info. Status code: {response.status_code}")
    print(response.text)
