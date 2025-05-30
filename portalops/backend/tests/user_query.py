import requests
import json

KEYSTONE_URL = "http://172.93.187.251/identity/v3/users"
TOKEN = "gAAAAABoLSfWhf0bvJ6abl8m9trFaUHH9GqV3AJK8WrGlnRK7N6Y9ICDYp6zzvm5A9EzlSPTYnXapPXbwh5msufZJT3a5APaRydpbpjX7ruo53UznSSpE6m6twJuY-9OceLa2G-snEnxWNKLLzKepQkMQRAs8CZa3lca7SDJ0IZ2l2OeH4m7hpA"
headers = {
    "X-Auth-Token": TOKEN
}

response = requests.get(KEYSTONE_URL, headers=headers)

if response.status_code == 200:
    users = response.json().get("users", [])
    print(f"{'ID':<36} | {'Name':<20} | {'Email':<30} | {'Enabled'}")
    print("-" * 100)
    for user in users:
        print(f"{user.get('id', ''):<36} | {user.get('name', ''):<20} | {user.get('email', '-'):<30} | {user.get('enabled', False)}")
else:
    print("Failed to fetch users. Status:", response.status_code)
    print("Response:", response.text)
