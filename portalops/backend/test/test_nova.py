import requests

# Endpoint Nova public
nova_url = "http://172.93.187.251/compute/v2.1/servers/detail"

# Token Keystone lấy được
token = "gAAAAABoK_yd5MfYkCfz63Bu50b3ePhG3xd9aFjuB3omMA8YASly3Bw__zXkai_-cade6VhImbur1eTQNKxi6ydVF5U1UPDwjCuGWFi-Xgxxcldr3Tus90jOe1GZOz7dW0VMaY-iTSKDnwHkXeaxwAjmccqkAP66fapcJDuxBP5gUI786n3Zupg"

# Header dùng token
headers = {
    "X-Auth-Token": token,
    "Content-Type": "application/json",
}

response = requests.get(nova_url, headers=headers)

print("Status Code:", response.status_code)
print("Response Body:", response.json())
