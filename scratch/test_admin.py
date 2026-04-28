import requests

# 1. Login to get token
login_url = "http://localhost:3001/api/admin/login"
login_data = {
    "email": "test_admin1@test.com",
    "password": "123456"
}
login_resp = requests.post(login_url, json=login_data)
token = login_resp.json()["access_token"]

# 2. Get admins
admin_url = "http://localhost:3001/api/admin"
headers = {"Authorization": f"Bearer {token}"}
admin_resp = requests.get(admin_url, headers=headers)

print(f"Status: {admin_resp.status_code}")
print(f"Response: {admin_resp.json()}")
