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
    # ... creation logic ...
    hashed_password = generate_password_hash(data['password'])
    new_place = Place(
        name=data['name'], 
        email=data['email'], 
        password=hashed_password,
        city_id=data['city_id'],
        establishment_type=EstablishmentType(data['establishment_type'])
    )
    db.session.add(new_place)
    db.session.commit()
    return jsonify(new_place.serialize()), 201
