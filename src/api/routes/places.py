from flask import request, jsonify, Blueprint
from api.models import db, Place, City, EstablishmentType
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select
from werkzeug.security import generate_password_hash

places_api = Blueprint('places_api', __name__)

@places_api.route("/places", methods=["GET"])
def get_places():
    places = db.session.execute(select(Place).order_by(Place.id.desc())).scalars().all()
    return jsonify([place.serialize() for place in places]), 200

@places_api.route("/places/private", methods=["GET"])
@jwt_required()
def get_private_place():
    identity = get_jwt_identity()
    place_id = identity["id"] if isinstance(identity, dict) else identity
    place = db.session.get(Place, place_id)
    if not place: return jsonify(response="Place not found"), 404
    return jsonify(place.serialize()), 200

@places_api.route("/places", methods=["POST"])
def add_place():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    establishment_type = data.get("establishment_type")
    city_id = data.get("city_id")

    if not all([x for x in [email, password, name, establishment_type, city_id]]):
        return jsonify(response="Email, password, name, establishment type, and city_id are required"), 400

    city = db.session.get(City, city_id)
    if city is None: return jsonify(response="City not found"), 404

    try:
        est_type = EstablishmentType(establishment_type.strip().lower())
    except ValueError:
        return jsonify(response="Invalid establishment type"), 400

    email_exists = db.session.execute(select(Place).where(Place.email == email.strip())).scalar_one_or_none()
    if email_exists: return jsonify(response="Email already registered"), 400

    hashed_password = generate_password_hash(password.strip())
    place = Place(
        name=name.strip(),
        email=email.strip(),
        password=hashed_password,
        city=city,
        establishment_type=est_type,
        pet_rules=data.get("pet_rules"),
        image_url=data.get("image_url")
    )
    db.session.add(place)
    db.session.commit()
    return jsonify(place.serialize()), 201

@places_api.route("/places/<int:place_id>", methods=["PUT"])
@jwt_required()
def update_place(place_id):
    identity = get_jwt_identity()
    requester_id = identity["id"] if isinstance(identity, dict) else identity
    role = identity.get("role") if isinstance(identity, dict) else None

    # Only the owner or an admin can update
    if requester_id != place_id and role != "admin":
        return jsonify({"msg": "Unauthorized"}), 403

    place = db.session.get(Place, place_id)
    if not place: return jsonify(response="Place not found"), 404

    data = request.get_json(silent=True) or {}
    if "email" in data: place.email = data["email"].strip()
    if "name" in data: place.name = data["name"].strip()
    if "password" in data: place.password = generate_password_hash(data["password"].strip())
    if "establishment_type" in data:
        try:
            place.establishment_type = EstablishmentType(data["establishment_type"].strip())
        except ValueError:
            return jsonify(response="Invalid establishment type"), 400
    if "city_id" in data:
        city = db.session.get(City, data["city_id"])
        if city: place.city = city
    if "pet_rules" in data: place.pet_rules = data["pet_rules"]
    if "image_url" in data: place.image_url = data["image_url"]

    db.session.commit()
    return jsonify(place.serialize()), 200

@places_api.route("/places/<int:place_id>", methods=["DELETE"])
@jwt_required()
def delete_place(place_id):
    identity = get_jwt_identity()
    role = identity.get("role") if isinstance(identity, dict) else None
    if role != "admin": return jsonify({"msg": "Admin only"}), 403

    place = db.session.get(Place, place_id)
    if not place: return jsonify(response="Place not found"), 404
    db.session.delete(place)
    db.session.commit()
    return jsonify(response="Place deleted"), 200
