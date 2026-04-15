"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Place, EstablishmentType, Location
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import select
from werkzeug.security import generate_password_hash

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route("/places", methods=["GET"])
def get_places():
    places = db.session.execute(select(Place)).scalars().all()
    response = [place.serialize() for place in places]
    return jsonify(response), 200

@api.route("/places", methods=["POST"])
def add_place():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    establishment_type = data.get("establishment_type")
    locations = data.get("locations")
    pet_rules = data.get("pet_rules")

    if not all([isinstance(x, str) for x in [email, password, name, establishment_type]]):
        return jsonify(response="Email, password, name, and establishment_type must be strings"), 400
    
    try:
        establishment_type = establishment_type.strip()
        establishment_type = EstablishmentType(establishment_type)
    except ValueError:
        return jsonify(response="Invalid establishment type"), 400
    
    if not isinstance(locations, list):
        return jsonify(response="Locations must be a list"), 400
    
    if not len(locations):
        return jsonify(response="Locations cannot be empty"), 400
    
    if not all([isinstance(city, str) for city in locations]):
        return jsonify(response="All locations must be strings"), 400
    
    email = email.strip()
    password = password.strip()
    name = name.strip()
    locations = [ city.strip().title() for city in locations ]

    if pet_rules is not None:
        pet_rules = str(pet_rules)
        pet_rules = pet_rules.strip()
        if len(pet_rules) > 250:
            return jsonify(response="pet_rules cannot exceed 250 characters"), 400

    if not all([x for x in [email, password, name]]):
        return jsonify(response="Email, password, and name cannot be empty"), 400
    
    for city in locations:
        if not city:
            return jsonify(response="Location entries cannot be empty"), 400
    
    email_exists = db.session.execute(select(Place).where(Place.email == email)).scalar_one_or_none()
    if email_exists is not None:
        return jsonify(response="Unable to create account with the provided information"), 400
    
    hashed_password = generate_password_hash(password)
    place = Place(name=name, email=email, password=hashed_password, establishment_type=establishment_type, pet_rules=pet_rules or None)
    db.session.add(place)
    db.session.flush()
    for city in locations:
        place.locations.append(Location(city=city))
    
    db.session.commit()
    
    return jsonify(place.serialize()), 201

@api.route("/places/<int:place_id>", methods=["DELETE"])
def delete_place(place_id):
    place_exists = db.get_or_404(Place, place_id, description="Place not found")
    db.session.delete(place_exists)
    db.session.commit()
    return jsonify(response="Place deleted"), 200

@api.route("/places/<int:place_id>", methods=["PUT"])
def update_place(place_id):
    place = db.get_or_404(Place, place_id, description="Place not found")
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    establishment_type = data.get("establishment_type")
    locations = data.get("locations")
    pet_rules_provided = "pet_rules" in data
    pet_rules = data.get("pet_rules")

    if email is not None:
        if not isinstance(email, str):
            return jsonify(response="Email must be a string"), 400
        email = email.strip()
        if not email:
            return jsonify(response="Email cannot be empty"), 400

        email_exists = db.session.execute(
            select(Place).where(Place.email == email, Place.id != place_id)
        ).scalar_one_or_none()
        if email_exists is not None:
            return jsonify(response="Unable to update account with the provided information"), 400

        place.email = email

    if password is not None:
        if not isinstance(password, str):
            return jsonify(response="Password must be a string"), 400
        password = password.strip()
        if not password:
            return jsonify(response="Password cannot be empty"), 400
        place.password = generate_password_hash(password)

    if name is not None:
        if not isinstance(name, str):
            return jsonify(response="Name must be a string"), 400
        name = name.strip()
        if not name:
            return jsonify(response="Name cannot be empty"), 400
        place.name = name

    if establishment_type is not None:
        if not isinstance(establishment_type, str):
            return jsonify(response="Establishment type must be a string"), 400
        try:
            place.establishment_type = EstablishmentType(establishment_type.strip())
        except ValueError:
            return jsonify(response="Invalid establishment type"), 400

    if pet_rules_provided:
        if pet_rules is None:
            place.pet_rules = None
        else:
            pet_rules = str(pet_rules).strip()
            if len(pet_rules) > 250:
                return jsonify(response="pet_rules cannot exceed 250 characters"), 400
            place.pet_rules = pet_rules or None

    if locations is not None:
        if not isinstance(locations, list):
            return jsonify(response="Locations must be a list"), 400
        if not len(locations):
            return jsonify(response="Locations cannot be empty"), 400
        if not all(isinstance(city, str) for city in locations):
            return jsonify(response="All locations must be strings"), 400

        normalized_locations = [city.strip().title() for city in locations]
        if not all(normalized_locations):
            return jsonify(response="Location entries cannot be empty"), 400

        place.locations.clear()
        for city in normalized_locations:
            place.locations.append(Location(city=city))

    db.session.commit()

    return jsonify(place.serialize()), 200
