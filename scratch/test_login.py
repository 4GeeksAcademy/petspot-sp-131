import requests

url = "http://localhost:3001/api/login/user"
data = {
    "email": "test_user1@test.com",
    "password": "123456"
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
