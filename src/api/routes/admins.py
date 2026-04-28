from flask import request, jsonify, Blueprint
from api.models import db, AdminUser
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash

admins_api = Blueprint('admins_api', __name__)

@admins_api.route('/admin', methods=['GET'])
@jwt_required()
def get_admins():
    admins = AdminUser.query.all()
    return jsonify([admin.serialize() for admin in admins]), 200

@admins_api.route('/admin/<int:id>', methods=['GET'])
@jwt_required()
def get_admin(id):
    admin = AdminUser.query.get(id)
    if not admin: return jsonify({"error": "Admin not found"}), 404
    return jsonify(admin.serialize()), 200

@admins_api.route('/admin', methods=['POST'])
@jwt_required()
def create_admin():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'])
    new_admin = AdminUser(name=data['name'], email=data['email'], password=hashed_password)
    db.session.add(new_admin)
    db.session.commit()
    return jsonify(new_admin.serialize()), 201

@admins_api.route('/admin/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_admin(id):
    admin = AdminUser.query.get(id)
    if not admin: return jsonify({"error": "Admin not found"}), 404
    db.session.delete(admin)
    db.session.commit()
    return jsonify({"message": "Admin deleted"}), 200
