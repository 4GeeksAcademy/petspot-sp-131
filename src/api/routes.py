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
    # Read the JSON body sent by the client
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    establishment_type = data.get("establishment_type")
    locations = data.get("locations")
    pet_rules = data.get("pet_rules")

    # Validate the required text fields
    if not all([isinstance(x, str) for x in [email, password, name, establishment_type]]):
        return jsonify(response="Email, password, name, and establishment_type must be strings"), 400
    
    # Validate that the establishment type matches the allowed enum values
    try:
        establishment_type = establishment_type.strip()
        establishment_type = EstablishmentType(establishment_type)
    except ValueError:
        return jsonify(response="Invalid establishment type"), 400
    
    # Validate that locations is a list
    if not isinstance(locations, list):
        return jsonify(response="Locations must be a list"), 400
    
    # Validate that the locations list is not empty
    if not len(locations):
        return jsonify(response="Locations cannot be empty"), 400
    
    # Validate that each location is a city string
    if not all([isinstance(city, str) for city in locations]):
        return jsonify(response="All locations must be strings"), 400
    
    # Normalize the required fields by trimming surrounding whitespace
    email = email.strip()
    password = password.strip()
    name = name.strip()
    locations = [ city.strip().title() for city in locations ]

    # Normalize the optional pet_rules field and enforce its length limit
    if pet_rules is not None:
        pet_rules = str(pet_rules)
        pet_rules = pet_rules.strip()
        if len(pet_rules) > 250:
            return jsonify(response="pet_rules cannot exceed 250 characters"), 400

    # Validate that the required text fields are not blank after trimming
    if not all([x for x in [email, password, name]]):
        return jsonify(response="Email, password, and name cannot be empty"), 400
    
    # Validate that no location entry is blank after trimming
    for city in locations:
        if not city:
            return jsonify(response="Location entries cannot be empty"), 400
    
    # Check whether another place already uses the same email
    email_exists = db.session.execute(select(Place).where(Place.email == email)).scalar_one_or_none()
    # If the email already exists, reject the request without exposing which field caused it
    if email_exists is not None:
        return jsonify(response="Unable to create account with the provided information"), 400
    
    # Generate a password hash before saving the new account
    hashed_password = generate_password_hash(password)
    # Create the new place with the validated data
    place = Place(name=name, email=email, password=hashed_password, establishment_type=establishment_type, pet_rules=pet_rules or None)
    # Save the place first so it gets an id
    db.session.add(place)
    db.session.commit()
    # Create one location record for each validated city
    for city in locations:
        db.session.add(Location(city=city, place_id=place.id))
    
    db.session.commit()
    
    return jsonify(place.serialize()), 201

@api.route("/places/<int:place_id>", methods=["DELETE"])
def delete_place(place_id):
    place_exists = db.get_or_404(Place, place_id, description="Place not found")
    db.session.delete(place_exists)
    db.session.commit()
    return jsonify(response="Place deleted"), 200

