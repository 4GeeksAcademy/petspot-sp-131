from src.app import app
from src.api.models import Chat

with app.app_context():
    chats = Chat.query.all()
    print(f"Total chats: {len(chats)}")
    for c in chats:
        print(c.serialize())
