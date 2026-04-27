import requests

# 1. Login to get token
login_url = "http://localhost:3001/api/login/user"
login_data = {
    "email": "test_user1@test.com",
    "password": "123456"
}
login_resp = requests.post(login_url, json=login_data)
token = login_resp.json()["access_token"]

# 2. Get chats
chat_url = "http://localhost:3001/api/chat/user"
headers = {"Authorization": f"Bearer {token}"}
chat_resp = requests.get(chat_url, headers=headers)

print(f"Status: {chat_resp.status_code}")
try:
    print(f"Response: {chat_resp.json()}")
except:
    print(f"Raw Response: {chat_resp.text}")
