import requests

# Endpoint volume OpenStack
url = "http://172.93.187.251/volume/v3"

# Token lấy được
token = "gAAAAABoM_KNuhK6j7cW1bsqZKsfsM7Ayug5duIGcBKGwWgRzt3AbxZZdyxzo2Oeb1wBMsqkYSuimYNZvlR7YPmb9haHvW_5Lg0yCjIM1ardAqjn9DKEs798HwPxfo9vA95L5TdWYrp_YYwKmN_oul2UrXEQeZdg1NfxQosPgqK-JHVsPvXsIRE"
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
