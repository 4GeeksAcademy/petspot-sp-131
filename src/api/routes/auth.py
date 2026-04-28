from flask import request, jsonify, Blueprint
from api.models import db, User, Place, AdminUser
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

auth_api = Blueprint('auth_api', __name__)

@auth_api.route('/admin/login', methods=['POST'])
def admin_login():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"msg": "Missing request body"}), 400

    email = body.get("email", "").strip()
    password = body.get("password", "")

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    admin = AdminUser.query.filter_by(email=email).first()
    if not admin or not check_password_hash(admin.password, password):
        return jsonify({"msg": "Invalid credentials"}), 401
    
    # Security: Include role in identity to avoid ID overlap
    identity = {"id": admin.id, "role": "admin"}
    access_token = create_access_token(identity=identity)

    return jsonify({
        "msg": "Login successful",
        "token": access_token,
        "admin": {
            "id": admin.id,
            "name": admin.name,
            "email": admin.email
        }
    }), 200

@auth_api.route("/login/user", methods=["POST"])
def login_user():
    email = request.json.get("email", None)
    password = request.json.get("password", None)

    user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if user is None or not user.is_active or not check_password_hash(user.password, password):
        return jsonify({"msg": "Bad email or password"}), 401

    # Security: Include role in identity
    identity = {"id": user.id, "role": "user"}
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token), 200

@auth_api.route("/signup/user", methods=["POST"])
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

    hashed_password = generate_password_hash(password)
    new_user = User(
        name=name,
        email=email,
        password=hashed_password,
        is_active=True
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado exitosamente"}), 201

@auth_api.route("/places/login", methods=["POST"])
def login_place():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify(response="Email and Password are required"), 400

    place_exists = db.session.execute(
        db.select(Place).where(Place.email == email.strip())
    ).scalar_one_or_none()

    if place_exists is None or not check_password_hash(place_exists.password, password.strip()):
        return jsonify(response="Incorrect email or password"), 400

    # Security: Include role in identity
    identity = {"id": place_exists.id, "role": "place"}
    access_token = create_access_token(identity=identity)

    return jsonify(access_token_place=access_token), 200
