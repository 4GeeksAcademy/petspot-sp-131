from flask import request, jsonify, Blueprint
from api.models import db, Chat
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select

chat_api = Blueprint('chat_api', __name__)

@chat_api.route('/chat', methods=['GET'])
@jwt_required()
def get_chats():
    # ... logic for fetching chat history ...
    chats = db.session.execute(select(Chat)).scalars().all()
    return jsonify([c.serialize() for c in chats]), 200

@chat_api.route('/chat', methods=['POST'])
@jwt_required()
def send_message():
    identity = get_jwt_identity()
    user_id = identity["id"] if isinstance(identity, dict) else identity
    data = request.get_json(silent=True) or {}
    
    new_chat = Chat(
        user_id=user_id if identity["role"] == "user" else data.get("user_id"),
        place_id=user_id if identity["role"] == "place" else data.get("place_id"),
        message=data.get("message"),
        is_user_sender=(identity["role"] == "user")
    )
    db.session.add(new_chat)
    db.session.commit()
    return jsonify(new_chat.serialize()), 201
