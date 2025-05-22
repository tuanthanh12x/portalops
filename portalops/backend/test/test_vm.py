import requests

image_endpoint = "http://172.93.187.251/image"
token = "gAAAAABoLEaLPjMYwmhtWX9aVN0kG169_kZBdHQ5S1LiiUMXnHFa4uT-RRXvzZyVQzHJG1AOoSdWA4lsEQy0n5EE_4rVPUzvNnV41KhFEwK8WRS20Oom4YF5OmuRr_hHYznrRTQCwRMRA2JezcMZbLLuupwfxx38Gw9OP2Vgtm0stICod_v_Y7I";

url = f"{image_endpoint}/v2/images"

headers = {
    "X-Auth-Token": token,
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    images = data.get('images', [])
    print(f"Found {len(images)} images:")
    for image in images:
        print(f"- {image['name']} (ID: {image['id']})")
else:
    print(f"Failed to get images. Status code: {response.status_code}")
    print("Response:", response.text)