from app import app
from api.models import db, Chat
from sqlalchemy import inspect

with app.app_context():
    inspector = inspect(db.engine)
    if 'chat' in inspector.get_table_names():
        print("Table 'chat' exists.")
    else:
        print("Table 'chat' does NOT exist.")
