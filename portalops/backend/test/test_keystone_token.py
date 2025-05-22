import requests
import json

url = "http://172.93.187.251/identity/v3/auth/tokens"
headers = {"Content-Type": "application/json"}

payload = {
    "auth": {
        "identity": {
            "methods": ["password"],
            "password": {
                "user": {
                    "name": "admin",
                    "domain": {"name": "Default"},
                    "password": "GreenOps0192"
                }
            }
        },
        "scope": {
            "project": {
                "id": "3f4c60e0ee614e128a38a644ef5c4101",
            }
        }
    }
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

print(f"Status Code: {response.status_code}")
print("Response Headers:")
print(response.headers)
print("Response Body:")
print(response.text)


token = response.headers.get("X-Subject-Token")
if token:
    print("\n✅ Token:")
    print(token)
else:
    print("\n❌ Không nhận được token.")
