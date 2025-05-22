import requests

# Endpoint volume OpenStack
url = "http://172.93.187.251/volume/v3"

# Token lấy được
token = "gAAAAABoLC05D1fczDfcbHWFgCy8tPYs0Z8Ac3PXYru8Le9My1QhhslibtzKADLNMhBqXZc0l3D0xO1hvfa7ODu-vi-PPjYLcCqbBnnIdaL3IkxMdR_zzGVQxFcnDbJw99VPXfEBtJDBzrughXS5hUjbtboVfkOLeIgLfVA0VYosA2uUkIpliUU"

# Header Authorization với token kiểu Keystone
headers = {
    "X-Auth-Token": token
}

try:
    response = requests.get(url, headers=headers)
    print(f"Status code: {response.status_code}")
    print("Response:")
    print(response.text)
except Exception as e:
    print(f"Error when calling OpenStack API: {e}")
