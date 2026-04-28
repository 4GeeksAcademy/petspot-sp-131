from flask import request, jsonify, Blueprint
from api.models import db, User, Favorite, Place
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select
from werkzeug.security import generate_password_hash

users_api = Blueprint('users_api', __name__)

@users_api.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    # Only Admin should list all users (role check omitted here for brevity, should be added)
    users = db.session.execute(db.select(User)).scalars().all()
    return jsonify([user.serialize() for user in users]), 200

@users_api.route("/users/private", methods=['GET'])
@jwt_required()
def get_private_user():
    identity = get_jwt_identity()
    user_id = identity["id"] if isinstance(identity, dict) else identity
    user = db.session.get(User, user_id)
    if not user: return jsonify(response="No user found"), 404
    return jsonify(user.serialize()), 200

@users_api.route("/users/private", methods=["PUT"])
@jwt_required()
def update_private_user():
    identity = get_jwt_identity()
    user_id = identity["id"] if isinstance(identity, dict) else identity
    user = db.session.get(User, user_id)
    if not user: return jsonify(response="User not found"), 404

    data = request.get_json(silent=True) or {}
    if 'name' in data: user.name = data['name'].strip()
    if 'email' in data: user.email = data['email'].strip()
    if 'password' in data: user.password = generate_password_hash(data['password'].strip())
    
    db.session.commit()
    return jsonify(user.serialize()), 200

@users_api.route("/users/private/favorites", methods=['POST'])
@jwt_required()
def add_favorite():
    identity = get_jwt_identity()
    user_id = identity["id"] if isinstance(identity, dict) else identity
    data = request.get_json(silent=True) or {}
    place_id = data.get("place_id")
    
    if not place_id: return jsonify({"msg": "Missing place_id"}), 400
    
    fav = Favorite(user_id=user_id, place_id=int(place_id))
    db.session.add(fav)
    db.session.commit()
    return jsonify({"msg": "Favorite added"}), 201
