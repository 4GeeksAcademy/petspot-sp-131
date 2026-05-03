"""
Chat Routes
===========
Endpoints del sistema de mensajería en tiempo real entre usuarios y establecimientos.
Emite eventos via Socket.IO para actualizaciones en tiempo real.
"""
from flask import request, jsonify, current_app
from sqlalchemy import select
from flask_jwt_extended import jwt_required, get_jwt_identity

from api.routes import api
from api.models import db, Chat


# ===========================================================================
# Endpoints de Chat
# ===========================================================================

@api.route('/chat', methods=['GET'])
def get_chats():
    chats = db.session.execute(select(Chat).order_by(Chat.created_at.desc())).scalars().all()
    return jsonify([chat.serialize() for chat in chats]), 200


@api.route('/chat/user', methods=['GET'])
@jwt_required()
def get_user_chats():
    user_id = get_jwt_identity()
    chats = db.session.execute(
        select(Chat)
        .where(Chat.user_id == int(user_id))
        .order_by(Chat.created_at.desc())
    ).scalars().all()
    return jsonify([chat.serialize() for chat in chats]), 200


@api.route('/chat/place', methods=['GET'])
@jwt_required()
def get_place_chats():
    place_id = get_jwt_identity()
    chats = db.session.execute(
        select(Chat)
        .where(Chat.place_id == int(place_id))
        .order_by(Chat.created_at.desc())
    ).scalars().all()
    return jsonify([chat.serialize() for chat in chats]), 200


@api.route('/chat/<int:chat_id>', methods=['GET'])
def get_chat(chat_id):
    chat = db.session.get(Chat, chat_id)
    if chat is None:
        return jsonify({"msg": "Chat not found"}), 404
    return jsonify(chat.serialize()), 200


@api.route('/chat', methods=['POST'])
@jwt_required(optional=True)
def create_chat():
    data = request.json
    if not data:
        return jsonify({"msg": "Missing body"}), 400

    user_id = data.get("user_id")
    place_id = data.get("place_id")
    message = data.get("message")
    sender = data.get("sender")

    identity = get_jwt_identity()
    if identity:
        if sender == "user" and not user_id:
            user_id = identity
        if sender == "place" and not place_id:
            place_id = identity

    if not all([user_id, place_id, message, sender]):
        return jsonify({"msg": "Missing required fields: user_id, place_id, message, sender"}), 400

    new_chat = Chat(
        user_id=int(user_id),
        place_id=int(place_id),
        message=message,
        sender=sender
    )

    db.session.add(new_chat)
    db.session.commit()

    # Emitir evento Socket.IO para actualización en tiempo real
    try:
        sio = current_app.extensions['socketio']
        serialized_chat = new_chat.serialize()

        user_room = f"user_{str(user_id)}"
        place_room = f"place_{str(place_id)}"

        sio.emit('new_message', serialized_chat, room=user_room)
        sio.emit('new_message', serialized_chat, room=place_room)
    except Exception as e:
        print(f"Error emitting socket event: {e}")

    return jsonify(new_chat.serialize()), 201


@api.route('/chat/read', methods=['PUT'])
@jwt_required()
def mark_as_read():
    identity = get_jwt_identity()
    data = request.json
    if not data:
        return jsonify({"msg": "Missing body"}), 400

    other_id = data.get("other_id")
    type = data.get("type")  # 'user' or 'place' (who is marking as read)

    if not other_id or not type:
        return jsonify({"msg": "Missing other_id or type"}), 400

    if type == "user":
        chats = Chat.query.filter_by(user_id=int(identity), place_id=int(other_id), sender="place", is_read=False).all()
    else:
        chats = Chat.query.filter_by(place_id=int(identity), user_id=int(other_id), sender="user", is_read=False).all()

    for chat in chats:
        chat.is_read = True

    db.session.commit()
    return jsonify({"msg": "Messages marked as read", "count": len(chats)}), 200


@api.route('/chat/<int:chat_id>', methods=['PUT'])
def update_chat(chat_id):
    chat = db.session.get(Chat, chat_id)
    if chat is None:
        return jsonify({"msg": "Chat not found"}), 404

    data = request.json

    chat.message = data.get("message", chat.message)
    chat.sender = data.get("sender", chat.sender)

    db.session.commit()

    return jsonify(chat.serialize()), 200


@api.route('/chat/<int:chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    chat = db.session.get(Chat, chat_id)
    if chat is None:
        return jsonify({"msg": "Chat not found"}), 404

    db.session.delete(chat)
    db.session.commit()

    return jsonify({"msg": "Chat deleted"}), 200
