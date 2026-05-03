"""
Admin Routes
============
Endpoints de autenticación y CRUD de administradores.
"""
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required

from api.routes import api
from api.models import db, AdminUser


# ===========================================================================
# Auth
# ===========================================================================

@api.route('/admin/login', methods=['POST'])
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

    access_token = create_access_token(identity=str(admin.id))
    return jsonify({
        "msg": "Login successful",
        "access_token": access_token,
        "token": access_token,
        "admin": {
            "id": admin.id,
            "name": admin.name,
            "email": admin.email
        }
    }), 200


# ===========================================================================
# CRUD Admins
# ===========================================================================

@api.route('/admin', methods=['GET'])
@jwt_required()
def get_admins():
    admins = AdminUser.query.all()
    return jsonify([admin.serialize() for admin in admins]), 200


@api.route('/admin/<int:id>', methods=['GET'])
@jwt_required()
def get_admin(id):
    admin = AdminUser.query.get(id)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404
    return jsonify(admin.serialize()), 200


@api.route('/admin', methods=['POST'])
@jwt_required()
def create_admin():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"error": "Missing name, email or password"}), 400

    existing_admin = AdminUser.query.filter_by(email=email).first()
    if existing_admin:
        return jsonify({"error": "Admin with this email already exists"}), 409

    hashed_password = generate_password_hash(password)
    new_admin = AdminUser(
        name=name,
        email=email,
        password=hashed_password
    )

    db.session.add(new_admin)
    db.session.commit()

    return jsonify(new_admin.serialize()), 201


@api.route('/admin/<int:id>', methods=['PUT'])
@jwt_required()
def update_admin(id):
    admin = AdminUser.query.get(id)

    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    if 'name' in data:
        admin.name = data['name']

    if 'email' in data:
        existing_admin = AdminUser.query.filter(
            AdminUser.email == data['email'],
            AdminUser.id != id
        ).first()

        if existing_admin:
            return jsonify({"error": "Email already in use"}), 409

        admin.email = data['email']

    if 'password' in data:
        admin.password = generate_password_hash(data['password'])

    db.session.commit()
    return jsonify(admin.serialize()), 200


@api.route('/admin/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_admin(id):
    admin = AdminUser.query.get(id)

    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    db.session.delete(admin)
    db.session.commit()

    return jsonify({"message": "Admin deleted"}), 200
