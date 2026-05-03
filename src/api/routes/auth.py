"""
Auth Routes
===========
Endpoints de autenticación para usuarios y establecimientos (places).
"""
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

from api.routes import api
from api.models import db, User, Place


# ===========================================================================
# User Auth
# ===========================================================================

@api.route("/user/login", methods=["POST"])
def login_user():
    email = request.json.get("email", None)
    password = request.json.get("password", None)

    user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if user is None:
        return jsonify({"msg": "Bad email or password"}), 401

    if not user.is_active:
        return jsonify({"msg": "Bad email or password"}), 401

    if not check_password_hash(user.password, password):
        return jsonify({"msg": "Bad email or password"}), 401

    access_token = create_access_token(identity=str(user.id), additional_claims={"role": "user"})
    return jsonify(access_token=access_token), 200


@api.route("/signup/user", methods=["POST"])
def signup_user():
    body = request.get_json()

    name = body.get("name", None)
    email = body.get("email", None)
    password = body.get("password", None)

    if not name or not email or not password:
        return jsonify({"msg": "All fields are required"}), 400

    user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if user:
        return jsonify({"msg": "Ya se encuentra un usuario con ese email"}), 409

    new_user = User(
        name=name,
        email=email,
        password=password,
        is_active=True
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado exitosamente"}), 201


# ===========================================================================
# Place Auth
# ===========================================================================

@api.route("/places/login", methods=["POST"])
def login_place():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if any([x is None for x in [email, password]]):
        return jsonify(response="Email and Password are required"), 400

    if not all([isinstance(x, str) for x in [email, password]]):
        return jsonify(response="Email and Password must be strings"), 400

    email = email.strip()
    password = password.strip()

    if any([len(x) == 0 for x in [email, password]]):
        return jsonify(response="Email or password cannot be empty"), 400

    place_exists = db.session.execute(
        db.select(Place).where(Place.email == email)
    ).scalar_one_or_none()
    if place_exists is None:
        return jsonify(response="Incorrect email or password"), 400

    if not check_password_hash(place_exists.password, password):
        return jsonify(response="Incorrect email or password"), 400

    access_token = create_access_token(identity=str(place_exists.id), additional_claims={"role": "place"})
    return jsonify(access_token_place=access_token), 200
