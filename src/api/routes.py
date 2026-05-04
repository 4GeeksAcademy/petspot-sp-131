"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
import io
import json
import re
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Place, EstablishmentType, AdminUser, Review, City, Chat, Reservation, ReservationStatus, Favorite, News, PostType, Race, Pet, PetAnimalType, PetSize
from datetime import datetime
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from sqlalchemy.orm import joinedload
import base64
import requests
import math


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


def normalize_pet_animal_type(raw_value):
    if not isinstance(raw_value, str):
        raise ValueError("Animal type must be a string")

    normalized = raw_value.strip().lower()
    if normalized in ["perro", "dog"]:
        return PetAnimalType.DOG
    if normalized in ["gato", "cat"]:
        return PetAnimalType.CAT
    if normalized in ["otros", "other"]:
        return PetAnimalType.OTHER

    raise ValueError("Invalid animal type. Use dog, cat, or other")


def normalize_pet_size(raw_value):
    if not isinstance(raw_value, str):
        raise ValueError("Size must be a string")

    normalized = raw_value.strip().lower()
    if normalized in ["pequeño", "pequeno", "small"]:
        return PetSize.SMALL
    if normalized in ["mediano", "medium"]:
        return PetSize.MEDIUM
    if normalized in ["grande", "large"]:
        return PetSize.LARGE

    raise ValueError("Invalid size. Use small, medium, or large")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def geocode_address_details(address):
    if not GOOGLE_API_KEY:
        raise ValueError("Google Maps API key is not configured")

    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": GOOGLE_API_KEY,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as error:
        raise RuntimeError("Unable to connect to the geocoding service") from error
    except ValueError as error:
        raise RuntimeError("Invalid response from the geocoding service") from error

    status = data.get("status")
    if status == "OK":
        found_non_spain_result = False
        for result in data["results"]:
            address_components = result["address_components"]
            for element in address_components:
                if 'Spain' in element["long_name"]:
                    location = result["geometry"]["location"]
                    return {
                        "formatted_address": result["formatted_address"],
                        "latitude": location["lat"],
                        "longitude": location["lng"],
                        "address_components": result.get("address_components", [])
                    }

            found_non_spain_result = True

        if found_non_spain_result:
            raise ValueError("Please enter an address in Spain.")

    if status == "ZERO_RESULTS":
        raise ValueError("Invalid address")

    error_message = data.get("error_message") or "Geocoding service returned an error"
    raise RuntimeError(f"Geocoding failed: {status}. {error_message}")


def geocode_address(address):
    geocoded = geocode_address_details(address)
    return geocoded["latitude"], geocoded["longitude"]


def geocoded_result_matches_city(geocoded_result, city_name):
    normalized_city = city_name.strip().lower()
    formatted_address = geocoded_result["formatted_address"].strip().lower()
    if normalized_city in formatted_address:
        return True

    for component in geocoded_result.get("address_components", []):
        component_name = component.get("long_name", "").strip().lower()
        if component_name == normalized_city:
            return True

    return False


def find_matching_city_for_geocoded_result(geocoded_result):
    cities = db.session.execute(select(City)).scalars().all()
    for city in cities:
        if geocoded_result_matches_city(geocoded_result, city.city):
            return city

    return None


def extract_city_name_from_geocoded_result(geocoded_result):
    preferred_component_types = [
        "locality",
        "administrative_area_level_2",
        "administrative_area_level_1"
    ]

    for preferred_type in preferred_component_types:
        for component in geocoded_result.get("address_components", []):
            if preferred_type in component.get("types", []):
                return component.get("long_name")

    return None

@api.route('/analyze-pet', methods=['POST'])
def analyze_pet():
    if 'image' not in request.files:
        return jsonify({"msg": "No image file provided"}), 400

    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify({"msg": "No file selected"}), 400

    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        return jsonify({"msg": "Groq API key not configured"}), 500

    try:
        img_bytes = image_file.read()
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')
        mime_type = image_file.mimetype or "image/jpeg"
        data_url = f"data:{mime_type};base64,{img_base64}"

        prompt = (
            "Analyze this pet image and return ONLY a valid JSON object. "
            "No markdown, no code blocks, no extra text — just raw JSON. "
            "Use exactly these fields:\n"
            '{"animal_type":"Dog or Cat or Other","breed":"Most likely breed name",'
            '"is_mix":true or false,'
            '"mix_description":"Describe mixed breeds, or null if purebred",'
            '"recommended_food":["3-4 specific food recommendations"],'
            '"care_tips":["2-3 practical care tips"],'
            '"fun_facts":"One interesting fun fact about this breed",'
            '"personality":"Brief description of typical personality traits"}\n'
            'If no pet is visible in the image, return: {"error":"No pet detected in image"}'
        )

        import requests as http_requests
        resp = http_requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "meta-llama/llama-4-scout-17b-16e-instruct",
                "temperature": 0.2,
                "messages": [{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_url}}
                    ]
                }]
            },
            timeout=30
        )

        if not resp.ok:
            return jsonify({"msg": f"Groq API error {resp.status_code}: {resp.text}"}), 502

        raw_text = resp.json()["choices"][0]["message"]["content"].strip()

        # Strip markdown code blocks if present
        raw_text = re.sub(r'^```(?:json)?\s*', '', raw_text)
        raw_text = re.sub(r'\s*```$', '', raw_text)

        result = json.loads(raw_text)
        return jsonify(result), 200

    except json.JSONDecodeError:
        return jsonify({"msg": "AI response could not be parsed", "raw": raw_text}), 500
    except Exception as e:
        return jsonify({"msg": f"Error analyzing image: {str(e)}"}), 500

def add_city_to_db(geocoded_result):
    city = extract_city_name_from_geocoded_result(geocoded_result)
    if not city:
        return jsonify(response="Unable to detect a city from the provided address"), 400

    existing_city = db.session.execute(
        select(City).where(City.city == city)
    ).scalar_one_or_none()
    if existing_city:
        return True

    try:
        geocoded_city = geocode_address_details(f"{city}, Spain")
    except ValueError as error:
        return jsonify(response="Invalid city" if str(error) == "Invalid address" else str(error)), 400
    except RuntimeError as error:
        return jsonify(response=str(error)), 502

    address = geocoded_city['formatted_address']
    latitude = geocoded_city["latitude"]
    longitude = geocoded_city["longitude"]

    add_city = City(city=city, address=address, latitude=latitude, longitude=longitude)
    db.session.add(add_city)
    db.session.commit()
    return True


def resolve_place_address_geocode(address):
    if not isinstance(address, str):
        raise ValueError("Address must be a string")

    address = address.strip()
    if not address:
        raise ValueError("Address is required")

    geocoded_result = geocode_address_details(address)
    matching_city = find_matching_city_for_geocoded_result(geocoded_result)

    if not matching_city:
        city_to_add_to_db = add_city_to_db(geocoded_result)
        if city_to_add_to_db is not True:
            response, status_code = city_to_add_to_db
            error_data = response.get_json(silent=True) or {}
            error_message = error_data.get("response") or "Unable to resolve city for address"
            if status_code >= 500:
                raise RuntimeError(error_message)
            raise ValueError(error_message)

        matching_city = find_matching_city_for_geocoded_result(geocoded_result)

    return {
        "formatted_address": geocoded_result["formatted_address"],
        "latitude": geocoded_result["latitude"],
        "longitude": geocoded_result["longitude"],
        "detected_city": matching_city.city if matching_city else None,
        "city_id": matching_city.id if matching_city else None
    }


@api.route('/geocode/place-address', methods=['POST'])
def geocode_place_address():
    data = request.get_json(silent=True) or {}
    address = data.get("address")

    try:
        geocoded_place = resolve_place_address_geocode(address)
    except ValueError as error:
        return jsonify(response=str(error)), 400
    except RuntimeError as error:
        return jsonify(response=str(error)), 502

    return jsonify(geocoded_place), 200


@api.route('/geocode/city', methods=['POST'])
def geocode_city():
    data = request.get_json(silent=True) or {}
    city = data.get("city")

    if not isinstance(city, str):
        return jsonify(response="City must be a string"), 400

    city = city.strip()
    if not city:
        return jsonify(response="City is required"), 400

    try:
        geocoded_result = geocode_address_details(city)
    except ValueError as error:
        return jsonify(response="Invalid city" if str(error) == "Invalid address" else str(error)), 400
    except RuntimeError as error:
        return jsonify(response=str(error)), 502

    normalized_city = extract_city_name_from_geocoded_result(geocoded_result) or city.title()

    city_exists = db.session.execute(
        select(City).where(City.city == normalized_city)
    ).scalar_one_or_none()
    if city_exists:
        return jsonify(response="City already exists"), 400

    return jsonify({
        "city": normalized_city,
        "formatted_address": geocoded_result["formatted_address"],
        "latitude": geocoded_result["latitude"],
        "longitude": geocoded_result["longitude"]
    }), 200

@api.route('/autocomplete/address', methods=['GET'])
def autocomplete_address():
    user_input = request.args.get("input")
    if not user_input:
        return jsonify(response="Input is required"), 400

    if not GOOGLE_API_KEY:
        raise ValueError("Google Maps API key is not configured")

    url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    params = {
        "input": user_input,
        "key": GOOGLE_API_KEY,
        "types": "address",
        "components": "country:es"
    }
    
    response = requests.get(url, params=params)
    response_dict = response.json()

    if response_dict.get("status") != "OK":
        return jsonify(response="Failed to fetch predictions"), 400

    predictions = response_dict.get("predictions", [])
    results = [
        {
            "description": p["description"],
            "place_id": p["place_id"]
        }
        for p in predictions
    ]
    
    return jsonify(results), 200

@api.route('/places/details', methods=['GET'])
def get_place_details():
    place_id = request.args.get("place_id")
    if not place_id:
        return jsonify(response="palce_id is required"), 400
    
    if not GOOGLE_API_KEY:
        raise ValueError("Google Maps API key is not configured")
    
    response = requests.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        params={
            "place_id": place_id,
            "fields": "geometry,formatted_address,address_components",
            "key": os.getenv("GOOGLE_API_KEY"),
        },
    )

    data = response.json()

    if data.get("status") != "OK":
        return jsonify(response="Failed to fetch place details"), 400
    
    result = data.get("result", {})
    
    return jsonify({
        "lat": result.get("geometry", {}).get("location", {}).get("lat"),
        "lng": result.get("geometry", {}).get("location", {}).get("lng"),
        "formatted_address": result.get("formatted_address"),
        "address_components": result.get("address_components"),
    }), 200


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
    
    access_token = create_access_token(identity=admin.id)

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


@api.route('/hello', methods=['GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200


@api.route('/users', methods=['GET'])
def get_users():
    users = db.session.execute(db.select(User)).scalars().all()
    return jsonify([user.serialize() for user in users]), 200


@api.route('/users', methods=['POST'])
def create_user():
    body = request.get_json()

    name = body.get("name", None)
    email = body.get("email", None)
    password = body.get("password", None)

    if not name or not email or not password:
        return jsonify({"msg": "All fields are required"}), 400

    existing_user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if existing_user:
        return jsonify({"msg": "User already exists"}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(
        name=name,
        email=email,
        password=hashed_password,
        is_active=True
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.serialize()), 201


@api.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = db.session.execute(
        db.select(User).filter_by(id=user_id)
    ).scalar_one_or_none()

    if user is None:
        return jsonify({"msg": "User not found"}), 404

    return jsonify(user.serialize()), 200


@api.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    body = request.get_json()

    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if "email" not in body or not body["email"]:
        return jsonify({"msg": "El email es obligatorio"}), 400

    existing_user = db.session.execute(
        db.select(User).filter_by(email=body["email"])
    ).scalar_one_or_none()

    if existing_user and existing_user.id != user.id:
        return jsonify({"msg": "El email ya está en uso"}), 409

    user.name = body.get("name", user.name)
    user.email = body.get("email", user.email)
    password = body.get("password")
    if password is not None:
        hashed_password = generate_password_hash(password)
        user.password = hashed_password
    
    user.is_active = body.get("is_active", user.is_active)

    db.session.commit()

    return jsonify(user.serialize()), 200


@api.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"msg": "Usuario eliminado correctamente"}), 200


@api.route("/places", methods=["GET"])
def get_places():
    places = db.session.execute(
        select(Place).order_by(Place.id.desc())
    ).scalars().all()
    response = [place.serialize() for place in places]
    return jsonify(response), 200


@api.route("/places", methods=["POST"])
def add_place():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    establishment_type = data.get("establishment_type")
    pet_rules = data.get("pet_rules")
    image_url = data.get("image_url")
    city_id = data.get("city_id")
    address = data.get("address")
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not all([x for x in [email, password, name, establishment_type]]):
        return jsonify(response="Email, password, name, and establishment type are required"), 400

    if not all([isinstance(x, str) for x in [email, password, name, establishment_type]]):
        return jsonify(response="Email, password, name, and establishment_type must be strings"), 400

    try:
        establishment_type = establishment_type.strip().lower()
        establishment_type = EstablishmentType(establishment_type)
    except ValueError:
        return jsonify(response="Invalid establishment type"), 400

    email = email.strip()
    password = password.strip()
    name = name.strip()

    if image_url is not None:
        image_url = str(image_url).strip()
    
    if pet_rules is not None:
        pet_rules = str(pet_rules).strip()
        if len(pet_rules) > 250:
            return jsonify(response="pet_rules cannot exceed 250 characters"), 400

    if not all([x for x in [email, password, name]]):
        return jsonify(response="Email, password, city, and name cannot be empty"), 400

    address_provided = isinstance(address, str) and address.strip()
    city = None
    resolved_address = None
    resolved_latitude = None
    resolved_longitude = None

    if address_provided:
        try:
            resolved_place_address = resolve_place_address_geocode(address)
        except ValueError as error:
            return jsonify(response=str(error)), 400
        except RuntimeError as error:
            return jsonify(response=str(error)), 502

        city_id = resolved_place_address["city_id"]
        resolved_address = resolved_place_address["formatted_address"]
        resolved_latitude = resolved_place_address["latitude"]
        resolved_longitude = resolved_place_address["longitude"]

        city = db.session.get(City, city_id) if city_id else None
        if city is None:
            return jsonify(response="Unable to resolve city for address"), 400
    else:
        if city_id is None:
            return jsonify(response="Address or city is required"), 400

        try:
            city_id = int(city_id)
        except (TypeError, ValueError):
            return jsonify(response="city_id must be a valid integer"), 400

        city = db.session.get(City, city_id)
        if city is None:
            return jsonify(response="City not found"), 404

        try:
            geocoded_city = geocode_address_details(f"{city.city}, Spain")
        except ValueError as error:
            return jsonify(response=str(error)), 400
        except RuntimeError as error:
            return jsonify(response=str(error)), 502

        resolved_address = geocoded_city["formatted_address"]
        resolved_latitude = geocoded_city["latitude"]
        resolved_longitude = geocoded_city["longitude"]

    email_exists = db.session.execute(
        select(Place).where(Place.email == email)
    ).scalar_one_or_none()
    if email_exists is not None:
        return jsonify(response="Unable to create an account with the provided information"), 400

    hashed_password = generate_password_hash(password)
    place = Place(
        name=name,
        email=email,
        password=hashed_password,
        city=city,
        establishment_type=establishment_type,
        address=resolved_address,
        latitude=resolved_latitude,
        longitude=resolved_longitude,
        pet_rules=pet_rules or None,
        image_url=image_url or None
    )
    db.session.add(place)
    db.session.commit()

    return jsonify(place.serialize()), 201


@api.route("/places/<int:place_id>", methods=["DELETE"])
def delete_place(place_id):
    place_exists = db.get_or_404(Place, place_id)
    db.session.delete(place_exists)
    db.session.commit()
    return jsonify(response="Place deleted"), 200


@api.route("/places/<int:place_id>", methods=["PUT"])
def update_place(place_id):
    place = db.get_or_404(Place, place_id)
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    establishment_type = data.get("establishment_type")
    pet_rules_provided = "pet_rules" in data
    pet_rules = data.get("pet_rules")
    image_url = data.get("image_url")
    city_id = data.get("city_id")
    address_provided = "address" in data
    address = data.get("address")
    city_id_provided = "city_id" in data
    next_city = place.city

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
            place.establishment_type = EstablishmentType(
                establishment_type.strip())
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

    if city_id_provided:
        try:
            city_id = int(city_id)
        except (TypeError, ValueError):
            return jsonify(response="city_id must be a valid integer"), 400

        next_city = db.session.get(City, city_id)
        if next_city is None:
            return jsonify(response="City not found"), 404

    if 'start_time' in data:
        try:
            place.start_time = datetime.strptime(data['start_time'], "%H:%M").time() if data['start_time'] else None
        except ValueError:
            return jsonify(response="Invalid start_time format (HH:MM)"), 400

    if 'end_time' in data:
        try:
            place.end_time = datetime.strptime(data['end_time'], "%H:%M").time() if data['end_time'] else None
        except ValueError:
            return jsonify(response="Invalid end_time format (HH:MM)"), 400

    geocoded_location = None

    if address_provided:
        if not isinstance(address, str):
            return jsonify(response="Address must be a string"), 400

        address = address.strip()
        if not address:
            return jsonify(response="Address or city is required"), 400

        try:
            geocoded_location = geocode_address_details(address)
        except ValueError as error:
            return jsonify(response=str(error)), 400
        except RuntimeError as error:
            return jsonify(response=str(error)), 502

        if city_id_provided and not geocoded_result_matches_city(geocoded_location, next_city.city):
            return jsonify(response="Address does not belong to the selected city"), 400

        matching_city = find_matching_city_for_geocoded_result(geocoded_location)
        if not matching_city:
            city_to_add_to_db = add_city_to_db(geocoded_location)
            if city_to_add_to_db is not True:
                response, status_code = city_to_add_to_db
                error_data = response.get_json(silent=True) or {}
                backend_message = error_data.get("response") or "Unable to resolve city for address"
                return jsonify(response=backend_message), status_code

            matching_city = find_matching_city_for_geocoded_result(geocoded_location)

        if not city_id_provided:
            next_city = matching_city
    else:
        if not city_id_provided:
            return jsonify(response="Address or city is required"), 400

        try:
            geocoded_location = geocode_address_details(f"{next_city.city}, Spain")
        except ValueError as error:
            return jsonify(response=str(error)), 400
        except RuntimeError as error:
            return jsonify(response=str(error)), 502

    if geocoded_location:
        place.city = next_city
        place.address = geocoded_location["formatted_address"]
        place.latitude = geocoded_location["latitude"]
        place.longitude = geocoded_location["longitude"]

        if "latitude" in data:
            place.latitude = data["latitude"]

        if "longitude" in data:
            place.longitude = data["longitude"]
    elif city_id_provided:
        place.city = next_city

    if image_url is not None:
        place.image_url = str(image_url).strip() or None

    db.session.commit()

    return jsonify(place.serialize()), 200


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


@api.route('/reviews', methods=['GET'])
def get_reviews():
    reviews = db.session.execute(db.select(Review)).scalars().all()
    return jsonify([review.serialize() for review in reviews]), 200


@api.route('/reviews/<int:review_id>', methods=['GET'])
def get_review(review_id):
    review = db.session.execute(
        db.select(Review).filter_by(id=review_id)
    ).scalar_one_or_none()

    if review is None:
        return jsonify({"msg": "Review no encontrada"}), 404

    return jsonify(review.serialize()), 200


@api.route('/reviews', methods=['POST'])
def create_review():
    body = request.get_json()

    required_fields = ["user_id", "reservation_id",
                       "rating", "title", "content", "created_at"]

    for field in required_fields:
        if field not in body or body[field] == "":
            return jsonify({"msg": f"El campo {field} es obligatorio"}), 400

    review = Review(
        user_id=body["user_id"],
        reservation_id=body["reservation_id"],
        rating=body["rating"],
        title=body["title"],
        content=body["content"],
        created_at=body["created_at"],
        is_active=body.get("is_active", True)
    )

    db.session.add(review)
    db.session.commit()

    return jsonify(review.serialize()), 201


@api.route('/reviews/<int:review_id>', methods=['PUT'])
def update_review(review_id):
    review = db.session.execute(
        db.select(Review).filter_by(id=review_id)
    ).scalar_one_or_none()

    if review is None:
        return jsonify({"msg": "Review no encontrada"}), 404

    body = request.get_json()

    review.user_id = body.get("user_id", review.user_id)
    review.reservation_id = body.get("reservation_id", review.reservation_id)
    review.rating = body.get("rating", review.rating)
    review.title = body.get("title", review.title)
    review.content = body.get("content", review.content)
    review.created_at = body.get("created_at", review.created_at)
    review.is_active = body.get("is_active", review.is_active)

    db.session.commit()

    return jsonify(review.serialize()), 200


@api.route('/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    review = db.session.execute(
        db.select(Review).filter_by(id=review_id)
    ).scalar_one_or_none()

    if review is None:
        return jsonify({"msg": "Review no encontrada"}), 404

    db.session.delete(review)
    db.session.commit()

    return jsonify({"msg": "Review eliminada correctamente"}), 200


@api.route('/places/<int:place_id>/reviews', methods=['GET'])
def get_place_reviews(place_id):
    place = db.session.get(Place, place_id)
    if place is None:
        return jsonify(response="Place not found"), 404

    reviews = db.session.execute(
        select(Review)
        .join(Reservation, Review.reservation_id == Reservation.id)
        .where(Reservation.place_id == place_id)
        .order_by(Review.id.desc())
    ).scalars().all()

    return jsonify([review.serialize() for review in reviews]), 200


@api.route('/cities', methods=['GET'])
def get_cities():
    cities = db.session.execute(
        select(City).order_by(City.city.asc())
    ).scalars().all()
    return jsonify([city.serialize() for city in cities]), 200


@api.route('/cities', methods=['POST'])
def add_city():
    data = request.get_json(silent=True) or {}
    city = data.get("city")
    address = data.get("address")
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if city is None:
        return jsonify(response="City is required"), 400

    if address is None:
        return jsonify(response="Address is required"), 400

    if latitude is None or longitude is None:
        return jsonify(response="Latitude and longitude are required"), 400

    city = city.strip().title()
    if not city:
        return jsonify(response="City is required"), 400

    if not isinstance(address, str):
        return jsonify(response="Address must be a string"), 400

    address = address.strip()
    if not address:
        return jsonify(response="Address is required"), 400

    try:
        latitude = float(latitude)
        longitude = float(longitude)
    except (TypeError, ValueError):
        return jsonify(response="Latitude and longitude must be valid numbers"), 400

    city_exists = db.session.execute(
        select(City).where(City.city == city)
    ).scalar_one_or_none()
    if city_exists:
        return jsonify(response="City already exists"), 400

    try:
        add_city = City(city=city, address=address, latitude=latitude, longitude=longitude)
        db.session.add(add_city)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(response="City already exists"), 400

    return jsonify(add_city.serialize()), 200


@api.route('/cities/<int:city_id>', methods=['DELETE'])
def delete_city(city_id):
    city_exists = db.get_or_404(City, city_id)
    db.session.delete(city_exists)
    db.session.commit()
    return jsonify(response="City deleted"), 200


@api.route('/cities/<int:city_id>', methods=['PUT'])
def update_city(city_id):
    city_exists = db.get_or_404(City, city_id)
    data = request.get_json(silent=True) or {}
    city = data.get("city")
    if city is None:
        return jsonify(response="City is required"), 400

    city = city.strip().title()
    city_with_existing_name = db.session.execute(
        select(City).where(City.city == city, City.id != city_id)
    ).scalar_one_or_none()
    if city_with_existing_name:
        return jsonify(response="City cannot be updated to an existing city name"), 400

    try:
        city_exists.city = city
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(response="City cannot be updated to an existing city name"), 400

    return jsonify(city_exists.serialize()), 200

@api.route("/cities/with-places", methods=["GET"])
def get_cities_with_places():
    cities = db.session.execute(select(City).join(Place).where(Place.is_active.is_(True)).distinct().order_by(City.city)).scalars().all()
    
    return jsonify([city.serialize() for city in cities]), 200

# LOGIN & SIGNUP #
# USER #


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


@api.route('/news', methods=['GET'])
def get_news():
    news_list = db.session.execute(
        select(News).order_by(News.post_date.desc(), News.id.desc())
    ).scalars().all()
    return jsonify([news.serialize() for news in news_list]), 200


@api.route('/news/<int:news_id>', methods=['GET'])
def get_single_news(news_id):
    news = db.session.get(News, news_id)

    if news is None:
        return jsonify({"msg": "News not found"}), 404

    return jsonify(news.serialize()), 200


@api.route('/news', methods=['POST'])
def create_news():
    data = request.get_json(silent=True) or {}

    id_admin = data.get("id_admin")
    title = data.get("title")
    content = data.get("content")
    post_date = data.get("post_date")
    post_type = data.get("post_type")

    if not all([id_admin, title, content, post_date, post_type]):
        return jsonify({"msg": "id_admin, title, content, post_date and post_type are required"}), 400

    admin = db.session.get(AdminUser, id_admin)
    if admin is None:
        return jsonify({"msg": "Admin not found"}), 404

    try:
        parsed_date = datetime.strptime(post_date, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"msg": "post_date must be in YYYY-MM-DD format"}), 400

    try:
        parsed_type = PostType(post_type)
    except ValueError:
        return jsonify({"msg": "Invalid post_type"}), 400

    new_news = News(
        id_admin=id_admin,
        title=title.strip(),
        content=content.strip(),
        post_date=parsed_date,
        post_type=parsed_type
    )

    db.session.add(new_news)
    db.session.commit()

    return jsonify(new_news.serialize()), 201


@api.route('/news/<int:news_id>', methods=['PUT'])
def update_news(news_id):
    news = db.session.get(News, news_id)

    if news is None:
        return jsonify({"msg": "News not found"}), 404

    data = request.get_json(silent=True) or {}

    if 'id_admin' in data:
        admin = db.session.get(AdminUser, data['id_admin'])
        if admin is None:
            return jsonify({"msg": "Admin not found"}), 404
        news.id_admin = data['id_admin']

    if 'title' in data:
        title = str(data['title']).strip()
        if not title:
            return jsonify({"msg": "Title cannot be empty"}), 400
        news.title = title

    if 'content' in data:
        content = str(data['content']).strip()
        if not content:
            return jsonify({"msg": "Content cannot be empty"}), 400
        news.content = content

    if 'post_date' in data:
        try:
            news.post_date = datetime.strptime(
                data['post_date'], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"msg": "post_date must be in YYYY-MM-DD format"}), 400

    if 'post_type' in data:
        try:
            news.post_type = PostType(data['post_type'])
        except ValueError:
            return jsonify({"msg": "Invalid post_type"}), 400

    db.session.commit()
    return jsonify(news.serialize()), 200


@api.route('/news/<int:news_id>', methods=['DELETE'])
def delete_news(news_id):
    news = db.session.get(News, news_id)

    if news is None:
        return jsonify({"msg": "News not found"}), 404

    db.session.delete(news)
    db.session.commit()

    return jsonify({"msg": "News deleted successfully"}), 200


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

    # If identity is available from JWT, we can use it to set the missing ID
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

    # Emit socket event for real-time update
    try:
        # Get the socketio instance from the current app extensions
        from flask import current_app
        sio = current_app.extensions['socketio']
        serialized_chat = new_chat.serialize()
        print(f"DEBUG: Data received - User: {user_id}, Place: {place_id}, Sender: {sender}, Identity: {identity}")
        
        user_room = f"user_{str(user_id)}"
        place_room = f"place_{str(place_id)}"
        
        print(f"DEBUG: Emitting to rooms: {user_room} and {place_room}")
        
        sio.emit('new_message', serialized_chat, room=user_room)
        sio.emit('new_message', serialized_chat, room=place_room)
        
        print(f"DEBUG: Emission to {user_room} and {place_room} finished.")
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
    type = data.get("type") # 'user' or 'place' (who is marking as read)
    
    if not other_id or not type:
        return jsonify({"msg": "Missing other_id or type"}), 400
    
    if type == "user":
        # User is marking messages from Place as read
        chats = Chat.query.filter_by(user_id=int(identity), place_id=int(other_id), sender="place", is_read=False).all()
    else:
        # Place is marking messages from User as read
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


@api.route('/reservations', methods=['GET'])
def get_reservations():
    reservations = db.session.execute(
        select(Reservation)
        .options(joinedload(Reservation.user), joinedload(Reservation.place))
        .order_by(Reservation.id.desc())
    ).scalars().all() or None
    if not reservations:
        return jsonify(response="No reservations found"), 404
    return jsonify([res.serialize() for res in reservations]), 200


@api.route('/reservations/<int:id>', methods=['GET'])
def get_reservation(id):
    reservation = db.session.get(Reservation, id)
    if not reservation:
        return jsonify({"msg": "Reservation not found"}), 404
    return jsonify(reservation.serialize()), 200


@api.route('/reservations', methods=['POST'])
def add_reservation():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    place_id = data.get("place_id")
    reservation_date_str = data.get("reservation_date")
    reservation_time_str = data.get("reservation_time")
    people_count = data.get("people_count")
    pet_id = data.get("pet_id")
    amount = float(data.get("amount", 0))
    zone_preference = data.get("zone_preference")
    notes = data.get("notes")

    if not all([
        user_id,
        place_id,
        reservation_date_str,
        reservation_time_str,
        people_count is not None
    ]):
        return jsonify(response="Missing required fields"), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify(response="User not found"), 404

    place = db.session.get(Place, place_id)
    if not place:
        return jsonify(response="Place not found"), 404

    try:
        res_date = datetime.strptime(reservation_date_str, '%Y-%m-%d').date()
        res_time = datetime.strptime(reservation_time_str, '%H:%M').time()
    except ValueError:
        return jsonify(response="Invalid date or time format. Use YYYY-MM-DD and HH:MM"), 400

    # Scheduling Validation (Calendly logic)
    if place.start_time and place.end_time:
        if not (place.start_time <= res_time <= place.end_time):
            return jsonify(response=f"The place is closed at that time. Operating hours: {place.start_time.strftime('%H:%M')} - {place.end_time.strftime('%H:%M')}"), 400

    status = ReservationStatus.CONFIRMED if amount == 0 else ReservationStatus.PENDING

    new_reservation = Reservation(
        user_id=user_id,
        place_id=place_id,
        reservation_date=res_date,
        reservation_time=res_time,
        people_count=int(people_count),
        pet_id=int(pet_id) if pet_id else None,
        zone_preference=zone_preference,
        notes=notes,
        status=status
    )

    db.session.add(new_reservation)
    db.session.commit()

    response_data = new_reservation.serialize()
    response_data["reservation_id"] = new_reservation.id

    return jsonify(response_data), 201

@api.route('/reservations/<int:id>', methods=['PUT'])
def update_reservation(id):
    reservation = db.session.get(Reservation, id)
    if not reservation:
        return jsonify({"msg": "Reservation not found"}), 404

    data = request.get_json(silent=True) or {}

    reservation_date_str = data.get("reservation_date")
    reservation_time_str = data.get("reservation_time")
    if reservation_date_str:
        try:
            reservation.reservation_date = datetime.strptime(
                reservation_date_str, '%Y-%m-%d'
            ).date()
        except ValueError:
            return jsonify(response="Invalid date format"), 400
    if reservation_time_str:
        try:
            reservation.reservation_time = datetime.strptime(
                reservation_time_str[:5], '%H:%M'
            ).time()
        except ValueError:
            return jsonify(response="Invalid time format"), 400

    if 'user_id' in data:
        reservation.user_id = int(data['user_id'])
    if 'place_id' in data:
        reservation.place_id = int(data['place_id'])
    if 'people_count' in data:
        reservation.people_count = int(data['people_count'])
    if 'pet_id' in data:
        reservation.pet_id = int(data['pet_id']) if data['pet_id'] else None
    if 'table_id' in data:
        reservation.table_id = int(data['table_id']) if data['table_id'] else None
    if 'zone_preference' in data:
        reservation.zone_preference = data['zone_preference']
    if 'notes' in data:
        reservation.notes = data['notes']
    if 'status' in data:
        try:
            reservation.status = ReservationStatus(data['status'])
        except ValueError:
            return jsonify(response="Invalid status"), 400

    db.session.commit()
    return jsonify(reservation.serialize()), 200


@api.route('/reservations/<int:id>', methods=['DELETE'])
def delete_reservation(id):
    reservation = db.session.get(Reservation, id)
    if not reservation:
        return jsonify({"msg": "Reservation not found"}), 404

    db.session.delete(reservation)
    db.session.commit()

    return jsonify({"msg": "Reservation deleted"}), 200


@api.route('/users/<int:user_id>/reservations', methods=['GET'])
def get_user_reservations(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify(response="User not found"), 404
    reservations = db.session.execute(
        select(Reservation).where(Reservation.user_id == user_id)
    ).scalars().all()
    if not reservations:
        return jsonify(response="No reservations found for this user"), 404
    return jsonify([res.serialize() for res in reservations]), 200


@api.route('/places/<int:place_id>/reservations', methods=['GET'])
def get_place_reservations(place_id):
    place = db.session.get(Place, place_id)
    if not place:
        return jsonify(response="Place not found"), 404
    date_str = request.args.get('date')
    query = select(Reservation).where(Reservation.place_id == place_id)
    
    if date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            query = query.where(Reservation.reservation_date == target_date)
        except ValueError:
            return jsonify({"msg": "Invalid date format, use YYYY-MM-DD"}), 400

    reservations = db.session.execute(query).scalars().all()
    return jsonify([res.serialize() for res in reservations]), 200


@api.route('/favorites', methods=['GET'])
def get_favorites():
    favorites = db.session.execute(select(Favorite)).scalars().all()
    return jsonify([favorite.serialize() for favorite in favorites]), 200


@api.route('/favorites', methods=['POST'])
def add_favorite():
    data = request.get_json(silent=True) or {}
    user = data.get("user")
    place = data.get("place")

    if any([x is None for x in [user, place]]):
        return jsonify(response="User and place are required"), 400

    if not all([isinstance(x, str) for x in [user, place]]):
        return jsonify(response="User and place need to be strings"), 400

    user = user.strip()
    place = place.strip()

    if any([len(x) == 0 for x in [user, place]]):
        return jsonify(response="User or place cannot be empty"), 400

    user_exists = db.session.execute(
        select(User).where(User.name == user)
    ).scalar_one_or_none()
    if user_exists is None:
        return jsonify(response="User not found"), 404

    place_exists = db.session.execute(
        select(Place).where(Place.name == place)
    ).scalar_one_or_none()
    if place_exists is None:
        return jsonify(response="Place not found"), 404

    new_favorite = Favorite(user_id=user_exists.id, place_id=place_exists.id)
    db.session.add(new_favorite)
    db.session.commit()

    return jsonify(new_favorite.serialize()), 200


@api.route('/favorites/<int:favorite_id>', methods=["DELETE"])
def delete_favorite(favorite_id):
    favorite_exists = db.get_or_404(Favorite, favorite_id)
    db.session.delete(favorite_exists)
    db.session.commit()
    return jsonify(response="Favorite deleted"), 200


@api.route('/favorites/<int:favorite_id>', methods=["PUT"])
def update_favorite(favorite_id):
    favorite_exists = db.session.execute(
        select(Favorite).where(Favorite.id == favorite_id)
    ).scalar_one_or_none()
    if favorite_exists is None:
        return jsonify(response="Favorite not found"), 404

    data = request.get_json(silent=True) or {}
    place = data.get("place")
    if place is None:
        return jsonify(response="Place is required"), 400

    if not isinstance(place, str):
        return jsonify(response="Place must be a string"), 400

    place = place.strip()

    if len(place) == 0:
        return jsonify(response="Place cannot be empty"), 400

    place_exists = db.session.execute(
        select(Place).where(Place.name == place)
    ).scalar_one_or_none()
    if place_exists is None:
        return jsonify(response="Place not found"), 404

    favorite_relation_exists = db.session.execute(
        select(Favorite).where(
            Favorite.user_id == favorite_exists.user_id,
            Favorite.place_id == place_exists.id
        )
    ).scalar_one_or_none()
    if favorite_relation_exists is not None:
        return jsonify(response="Favorite relation already exists"), 400

    favorite_exists.place_id = place_exists.id
    db.session.commit()
    return jsonify(favorite_exists.serialize()), 200


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
        select(Place).where(Place.email == email)
    ).scalar_one_or_none()
    if place_exists is None:
        return jsonify(response="Incorrect email or password"), 400

    place_password = place_exists.password
    if not check_password_hash(place_password, password):
        return jsonify(response="Incorrect email or password"), 400

    access_token = create_access_token(identity=str(place_exists.id), additional_claims={"role": "place"})

    return jsonify(access_token_place=access_token), 200


@api.route("/places/private", methods=["GET"])
@jwt_required()
def private_place():
    place_id = int(get_jwt_identity())
    place_exists = db.session.execute(
        select(Place).where(Place.id == place_id)
    ).scalar_one_or_none()
    if place_exists is None:
        return jsonify(response="Place not found"), 404
    return jsonify(place_exists.serialize()), 200


@api.route('/places/private', methods=['PUT'])
@jwt_required()
def update_private_place():
    place_id = int(get_jwt_identity())
    place = db.session.get(Place, place_id)
    if not place:
        return jsonify(response="Place not found"), 404
        
    data = request.get_json(silent=True) or {}
    address_provided = "address" in data
    city_id_provided = "city_id" in data
    next_city = place.city
    
    if 'name' in data:
        name = str(data['name']).strip()
        if not name:
             return jsonify(response="Name cannot be empty"), 400
        place.name = name
        
    if 'establishment_type' in data:
        try:
             place.establishment_type = EstablishmentType(data['establishment_type'].strip())
        except ValueError:
             return jsonify(response="Invalid establishment type"), 400
             
    if 'pet_rules' in data:
        if data['pet_rules'] is None:
             place.pet_rules = None
        else:
             rules = str(data['pet_rules']).strip()
             if len(rules) > 250:
                 return jsonify(response="pet_rules cannot exceed 250 characters"), 400
             place.pet_rules = rules or None

    if city_id_provided:
        city_id = data.get("city_id")
        try:
            city_id = int(city_id)
        except (TypeError, ValueError):
            return jsonify(response="city_id must be a valid integer"), 400

        next_city = db.session.get(City, city_id)
        if not next_city:
            return jsonify(response="City not found"), 404
    if 'start_time' in data:
        try:
            place.start_time = datetime.strptime(data['start_time'], "%H:%M").time() if data['start_time'] else None
        except ValueError:
            return jsonify(response="Invalid start_time format"), 400

    if 'end_time' in data:
        try:
            place.end_time = datetime.strptime(data['end_time'], "%H:%M").time() if data['end_time'] else None
        except ValueError:
            return jsonify(response="Invalid end_time format"), 400

    geocoded_location = None

    if address_provided:
        address = data.get("address")
        if not isinstance(address, str):
            return jsonify(response="Address must be a string"), 400

        address = address.strip()
        if not address:
            return jsonify(response="Address or city is required"), 400

        try:
            geocoded_location = geocode_address_details(address)
        except ValueError as error:
            return jsonify(response=str(error)), 400
        except RuntimeError as error:
            return jsonify(response=str(error)), 502

        if city_id_provided and not geocoded_result_matches_city(geocoded_location, next_city.city):
            return jsonify(response="Address does not belong to the selected city"), 400
    else:
        if not city_id_provided:
            return jsonify(response="Address or city is required"), 400

        try:
            geocoded_location = geocode_address_details(f"{next_city.city}, Spain")
        except ValueError as error:
            return jsonify(response=str(error)), 400
        except RuntimeError as error:
            return jsonify(response=str(error)), 502

    if geocoded_location:
        place.city = next_city
        place.address = geocoded_location["formatted_address"]
        place.latitude = geocoded_location["latitude"]
        place.longitude = geocoded_location["longitude"]
        
        if 'latitude' in data:
            place.latitude = data["latitude"]
        
        if 'longitude' in data:
            place.longitude = data["longitude"]

    elif city_id_provided:
        place.city = next_city
        
    db.session.commit()
    return jsonify(place.serialize()), 200


@api.route('/places/private', methods=['DELETE'])
@jwt_required()
def delete_private_place():
    place_id = int(get_jwt_identity())
    place = db.session.get(Place, place_id)
    if not place:
        return jsonify(response="Place not found"), 404
        
    db.session.delete(place)
    db.session.commit()
    return jsonify(response="Place deleted"), 200

@api.route('/places/private/reservations', methods=['GET'])
@jwt_required()
def get_private_place_reservations():
    place_id = int(get_jwt_identity())
    reservations = db.session.execute(
        db.select(Reservation).where(Reservation.place_id == place_id)
    ).scalars().all()
    if not reservations:
        return jsonify(response="No reservations found for this place"), 404
    return jsonify([res.serialize() for res in reservations]), 200


@api.route('/places/private/reviews', methods=['GET'])
@jwt_required()
def get_private_place_reviews():
    place_id = int(get_jwt_identity())
    reviews = db.session.execute(
        db.select(Review).join(Reservation).where(Reservation.place_id == place_id)
    ).scalars().all()
    if not reviews:
        return jsonify(response="No reviews found for this place"), 404
    return jsonify([r.serialize() for r in reviews]), 200

# CRUD for Races

@api.route('/races', methods=['GET'])
def get_races():
    races = db.session.execute(db.select(Race)).scalars().all()
    return jsonify([race.serialize() for race in races]), 200

@api.route('/races/<int:race_id>', methods=['GET'])
def get_race(race_id):
    race = db.session.execute(db.select(Race).where(Race.id == race_id)).scalars().first()
    if not race:
        return jsonify({"msg": "Race not found"}), 404
    return jsonify(race.serialize()), 200

@api.route('/races/import', methods=['POST'])
@jwt_required()
def import_external_races():
    import os, requests
    dog_count = 0
    cat_count = 0
    try:
        api_key = os.getenv("DOG_API_KEY")
        headers = {"x-api-key": api_key} if api_key else {}
        dog_res = requests.get('https://api.thedogapi.com/v1/breeds', headers=headers)
        if dog_res.status_code == 200:
            dogs = dog_res.json()
            for dog in dogs:
                name = dog.get('name')
                image_url = dog.get('image', {}).get('url') if dog.get('image') else None
                if name:
                    exists = db.session.execute(select(Race).where(Race.name == name, Race.animal_type == "Perro")).scalars().first()
                    if not exists:
                        new_race = Race(name=name, animal_type="Perro", url=image_url)
                        db.session.add(new_race)
                        dog_count += 1
                    elif exists and not exists.url and image_url:
                        exists.url = image_url
            db.session.commit()
        else:
            fallback_dogs = [
                "Golden Retriever", "Labrador Retriever", "Bulldog", "Poodle", 
                "Beagle", "Chihuahua", "German Shepherd", "Yorkshire Terrier", 
                "Boxer", "Husky", "Pomeranian", "Dachshund", "Pug", 
                "Cocker Spaniel", "Rottweiler", "Doberman", "Pitbull", "Border Collie"
            ]
            for name in fallback_dogs:
                exists = db.session.execute(select(Race).where(Race.name == name, Race.animal_type == "Perro")).scalars().first()
                if not exists:
                    new_race = Race(name=name, animal_type="Perro")
                    db.session.add(new_race)
                    dog_count += 1
            db.session.commit()
    except Exception as e:
        print(f"Excepcion The Dog API: {e}")

    try:
        cat_res = requests.get('https://api.thecatapi.com/v1/breeds')
        if cat_res.status_code == 200:
            cats = cat_res.json()
            for cat in cats:
                name = cat.get('name')
                image_url = cat.get('image', {}).get('url') if cat.get('image') else None
                if not image_url and cat.get('reference_image_id'):
                    image_url = f"https://cdn2.thecatapi.com/images/{cat.get('reference_image_id')}.jpg"
                if name:
                    exists = db.session.execute(select(Race).where(Race.name == name, Race.animal_type == "Gato")).scalars().first()
                    if not exists:
                        new_race = Race(name=name, animal_type="Gato", url=image_url)
                        db.session.add(new_race)
                        cat_count += 1
                    elif exists and not exists.url and image_url:
                        exists.url = image_url
            db.session.commit()
    except Exception as e:
        print(f"Excepcion The Cat API: {e}")

    return jsonify({"msg": f"Razas importadas exitosamente. Perros: {dog_count}, Gatos: {cat_count}"}), 200


@api.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    import cloudinary.uploader
    if 'image' not in request.files:
        return jsonify({"msg": "No image provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
        
    try:
        upload_result = cloudinary.uploader.upload(
            file,
            transformation=[
                {'width': 1000, 'height': 1000, 'crop': 'limit'},
                {'quality': 'auto'}
            ]
        )
        return jsonify({"url": upload_result['secure_url']}), 200
    except Exception as e:
        return jsonify({"msg": str(e)}), 500

@api.route('/races', methods=['POST'])
@jwt_required()
def create_race():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"msg": "Missing JSON in request"}), 400
    
    if "name" not in body or "animal_type" not in body:
        return jsonify({"msg": "Missing 'name' or 'animal_type' in request"}), 400
    
    new_race = Race(
        name=body['name'],
        animal_type=body['animal_type'],
        url=body.get('url')
    )
    db.session.add(new_race)
    try:
        db.session.commit()
        return jsonify(new_race.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500

@api.route('/races/<int:race_id>', methods=['PUT'])
@jwt_required()
def update_race(race_id):
    race = db.session.execute(db.select(Race).where(Race.id == race_id)).scalars().first()
    if not race:
        return jsonify({"msg": "Race not found"}), 404

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"msg": "Missing JSON in request"}), 400

    if "name" in body:
        race.name = body["name"]
    if "animal_type" in body:
        race.animal_type = body["animal_type"]
    if "url" in body:
        race.url = body["url"]
        
    try:
        db.session.commit()
        return jsonify(race.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500

@api.route('/races/<int:race_id>', methods=['DELETE'])
@jwt_required()
def delete_race(race_id):
    race = db.session.execute(db.select(Race).where(Race.id == race_id)).scalars().first()
    if not race:
        return jsonify({"msg": "Race not found"}), 404

    db.session.delete(race)
    try:
        db.session.commit()
        return jsonify({"msg": "Race deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500


# CRUD for Pets

@api.route('/pets', methods=['GET'])
def get_pets():
    pets = db.session.execute(db.select(Pet)).scalars().all()
    return jsonify([pet.serialize() for pet in pets]), 200

@api.route('/users/pets', methods=['GET'])
@jwt_required()
def get_user_pets():
    user_id = get_jwt_identity()
    user = db.session.execute(db.select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    pets = db.session.execute(db.select(Pet).where(Pet.user_id == user.id)).scalars().all()
    return jsonify([pet.serialize() for pet in pets]), 200

@api.route('/pets/<int:pet_id>', methods=['GET'])
def get_pet(pet_id):
    pet = db.session.execute(db.select(Pet).where(Pet.id == pet_id)).scalars().first()
    if not pet:
        return jsonify({"msg": "Pet not found"}), 404
    return jsonify(pet.serialize()), 200

@api.route('/pets', methods=['POST'])
@jwt_required()
def create_pet():
    user_id = get_jwt_identity()
    user = db.session.execute(db.select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"msg": "Missing JSON in request"}), 400
    
    required_fields = ["name", "animal_type", "size"]
    for field in required_fields:
        if field not in body:
            return jsonify({"msg": f"Missing '{field}' in request"}), 400
    
    try:
        animal_type = normalize_pet_animal_type(body['animal_type'])
        size = normalize_pet_size(body['size'])
    except ValueError as error:
        return jsonify({"msg": str(error)}), 400

    other_type = body.get("other_type")
    if other_type is not None and not isinstance(other_type, str):
        return jsonify({"msg": "'other_type' must be a string"}), 400

    other_type = other_type.strip() if isinstance(other_type, str) else None
    other_type = other_type or None
    race_id = None
    
    if animal_type in [PetAnimalType.DOG, PetAnimalType.CAT]:
        if "race_id" not in body or not body["race_id"]:
            return jsonify({"msg": "Missing 'race_id' in request for dog or cat"}), 400
        
        race = db.session.execute(db.select(Race).where(Race.id == body['race_id'])).scalars().first()
        if not race:
            return jsonify({"msg": "Race not found"}), 404
        race_id = race.id
        other_type = None
    elif animal_type == PetAnimalType.OTHER:
        if not other_type:
            return jsonify({"msg": "Missing 'other_type' in request when animal_type is 'other'"}), 400
    elif "race_id" in body and body["race_id"]:
        race = db.session.execute(db.select(Race).where(Race.id == body['race_id'])).scalars().first()
        if race:
            race_id = race.id

    new_pet = Pet(
        name=body['name'],
        user_id=user.id,
        animal_type=animal_type,
        other_type=other_type,
        race_id=race_id,
        size=size,
        url=body.get('url')
    )
    db.session.add(new_pet)
    try:
        db.session.commit()
        return jsonify(new_pet.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500

@api.route('/pets/<int:pet_id>', methods=['PUT'])
@jwt_required()
def update_pet(pet_id):
    user_id = get_jwt_identity()
    user = db.session.execute(db.select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    pet = db.session.execute(db.select(Pet).where(Pet.id == pet_id)).scalars().first()
    if not pet:
        return jsonify({"msg": "Pet not found"}), 404

    if pet.user_id != user.id:
        return jsonify({"msg": "Unauthorized to update this pet"}), 403

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"msg": "Missing JSON in request"}), 400

    next_animal_type = pet.animal_type
    next_other_type = pet.other_type

    if "name" in body:
        pet.name = body["name"]
    if "animal_type" in body:
        try:
            next_animal_type = normalize_pet_animal_type(body["animal_type"])
        except ValueError as error:
            return jsonify({"msg": str(error)}), 400
    if "other_type" in body:
        if body["other_type"] is not None and not isinstance(body["other_type"], str):
            return jsonify({"msg": "'other_type' must be a string"}), 400
        next_other_type = body["other_type"].strip() if isinstance(body["other_type"], str) else None
        next_other_type = next_other_type or None
    if "race_id" in body:
        if body["race_id"] is None or body["race_id"] == "":
            pet.race_id = None
        else:
            race = db.session.execute(db.select(Race).where(Race.id == body['race_id'])).scalars().first()
            if not race:
                return jsonify({"msg": "Race not found"}), 404
            pet.race_id = race.id
    if "size" in body:
        try:
            pet.size = normalize_pet_size(body["size"])
        except ValueError as error:
            return jsonify({"msg": str(error)}), 400
    if "url" in body:
        pet.url = body["url"]

    if next_animal_type in [PetAnimalType.DOG, PetAnimalType.CAT]:
        if pet.race_id is None:
            return jsonify({"msg": "A race is required for dog or cat"}), 400
        pet.animal_type = next_animal_type
        pet.other_type = None
    else:
        if not next_other_type:
            return jsonify({"msg": "'other_type' is required when animal_type is 'other'"}), 400
        pet.animal_type = next_animal_type
        pet.other_type = next_other_type
        
    try:
        db.session.commit()
        return jsonify(pet.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500

@api.route('/pets/<int:pet_id>', methods=['DELETE'])
@jwt_required()
def delete_pet(pet_id):
    user_id = get_jwt_identity()
    user = db.session.execute(db.select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    pet = db.session.execute(db.select(Pet).where(Pet.id == pet_id)).scalars().first()
    if not pet:
        return jsonify({"msg": "Pet not found"}), 404

    if pet.user_id != user.id:
        return jsonify({"msg": "Unauthorized to delete this pet"}), 403

    db.session.delete(pet)
    try:
        db.session.commit()
        return jsonify({"msg": "Pet deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500


@api.route("/users/private", methods=['GET'])
@jwt_required()
def get_private_user():
    user_id = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        return jsonify(response="No user found"), 404

    return jsonify(user.serialize()), 200

@api.route("/users/private", methods=["PUT"])
@jwt_required()
def update_private_user():
    user_id = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        return jsonify(response="User not found"), 404

    data = request.get_json(silent=True) or {}
    email = data.get("email")
    name = data.get("name")
    password = data.get("password")
    address = data.get("address")
    latitude_pin = data.get("latitude")
    longitude_pin = data.get("longitude")

    if email is not None:
        if not isinstance(email, str):
            return jsonify(response="Email must be a string"), 400

        email_exists = db.session.execute(select(User).where(User.email == email, User.id != user_id)).scalar_one_or_none()
        if email_exists is not None:
            return jsonify(response="Unable to update the email"), 400
        
        email = email.strip()
        if len(email) == 0:
            return jsonify(response="Email cannot be empty")
        
        user.email = email
    
    if name is not None:
        if not isinstance(name, str):
            return jsonify(response="Name must be a string"), 400
        
        name = name.strip()
        if len(name) == 0:
            return jsonify(response="Name cannot be empty"), 400
        
        user.name = name
    
    if password is not None:
        if not isinstance(password, str):
            return jsonify(response="Password must be a string"), 400
        
        password = password.strip()

        if len(password) == 0:
            return jsonify(response="Password cannot be empty"), 400
        
        hashed_password = generate_password_hash(password)
        user.password = hashed_password

    if address is not None:
        if not isinstance(address, str):
            return jsonify(response="Address must be a string"), 400

        address = address.strip()
        if len(address) == 0:
            user.address = None
            user.latitude = None
            user.longitude = None
        else:
            try:
                lat, lng = geocode_address(address)
            except ValueError as error:
                return jsonify(response=str(error)), 400
            except RuntimeError as error:
                return jsonify(response=str(error)), 502
        
            user.address = address
            user.latitude = lat
            user.longitude = lng
    
        if latitude_pin is not None:
            user.latitude = latitude_pin

        if longitude_pin is not None:
            user.longitude = longitude_pin
            
    db.session.commit()
   
    return jsonify(user.serialize()), 200

@api.route("/users/private", methods=["DELETE"])
@jwt_required()
def delete_private_user():
    user_id = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        return jsonify(response="User not found"), 404

    user.is_active = False
    db.session.commit()

    return jsonify(response="User deleted"), 200

@api.route("/users/private/favorites", methods=['DELETE'])
@jwt_required()
def delete_private_user_favorite():
    user_id = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        return jsonify(response="User not found"), 404

    data = request.get_json(silent=True) or {}
    place_id = data.get("place_id")

    if place_id is None:
        return jsonify(response="Place id is required"), 400
    
    if not isinstance(place_id, str):
        return jsonify(response="Place id must be a string"), 400
    
    place_id = int(place_id)

    favorite_exists = db.session.execute(select(Favorite).where(Favorite.place_id == place_id, Favorite.user_id == user_id)).scalar_one_or_none()
    if favorite_exists is None:
        return jsonify(response="Favorite relation not found"), 404
    
    db.session.delete(favorite_exists)
    db.session.commit()
    
    return jsonify(response="Favorite deleted"), 200

@api.route("/users/private/favorites", methods=['POST'])
@jwt_required()
def add_private_user_favorite():
    user_id = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        return jsonify(response="User not found"), 404

    data = request.get_json(silent=True) or {}
    place_id = data.get("place_id")

    if place_id is None:
        return jsonify(response="Place id is required"), 400
    
    if not isinstance(place_id, str):
        return jsonify(response="Place id must be a string"), 400
    
    place_id = int(place_id)

    place_exists = db.session.execute(select(Place).where(Place.id == place_id)).scalar_one_or_none()
    if place_exists is None:
        return jsonify(response="Place not found"), 404

    favorite_exists = db.session.execute(select(Favorite).where(Favorite.place_id == place_id, Favorite.user_id == user_id)).scalar_one_or_none()
    if favorite_exists is not None:
        return jsonify(response="Favorite relation already exists"), 400
    
    new_favorite = Favorite(user_id=user_id, place_id=place_id)
    db.session.add(new_favorite)
    db.session.commit()
    
    return jsonify(user.serialize()), 201

@api.route('/users/private/reservations', methods=['POST'])
@jwt_required()
def add_private_user_reservation():
    user_id = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        return jsonify(response="User not found"), 404

    data = request.get_json(silent=True) or {}
    place_id = data.get("place_id")
    reservation_date_str = data.get("reservation_date")
    reservation_time_str = data.get("reservation_time")
    people_count = data.get("people_count")
    pet_id = data.get("pet_id")
    zone_preference = data.get("zone_preference")
    notes = data.get("notes")

    if any([
        place_id is None,
        reservation_date_str is None,
        reservation_time_str is None,
        people_count is None
    ]):
        return jsonify(response="Missing required fields"), 400

    if not all([
        isinstance(place_id, str),
        isinstance(reservation_date_str, str),
        isinstance(reservation_time_str, str),
        isinstance(people_count, str)
    ]):
        return jsonify(response="Place id, date, time and people count must be strings"), 400

    place_id = place_id.strip()
    reservation_date_str = reservation_date_str.strip()
    reservation_time_str = reservation_time_str.strip()
    people_count = people_count.strip()

    if zone_preference is not None:
        if not isinstance(zone_preference, str):
            return jsonify(response="Zone preference must be a string"), 400
        
        zone_preference = zone_preference.strip() or None

    if notes is not None:
        if not isinstance(notes, str):
            return jsonify(response="Notes must be a string"), 400
        
        notes = notes.strip() or None

    if any([
        len(place_id) == 0,
        len(reservation_date_str) == 0,
        len(reservation_time_str) == 0,
        len(people_count) == 0
    ]):
        return jsonify(response="Required fields cannot be empty"), 400

    try:
        place_id = int(place_id)
    except (TypeError, ValueError):
        return jsonify(response="Place id must be a valid integer"), 400

    place = db.session.get(Place, place_id)
    if not place:
        return jsonify(response="Place not found"), 404

    try:
        people_count = int(people_count)
    except (TypeError, ValueError):
        return jsonify(response="People count must be a valid integer"), 400
    
    if people_count < 1:
        return jsonify(response="People count must be greater than 0"), 400

    if pet_id:
        try:
            pet_id = int(pet_id)
        except (TypeError, ValueError):
            return jsonify(response="Pet id must be a valid integer"), 400

        pet = db.session.execute(
            select(Pet).where(Pet.id == pet_id, Pet.user_id == user_id)
        ).scalar_one_or_none()
        if pet is None:
            return jsonify(response="Pet not found for this user"), 404
    else:
        pet_id = None

    try:
        res_date = datetime.strptime(reservation_date_str, '%Y-%m-%d').date()
        res_time = datetime.strptime(reservation_time_str[:5], '%H:%M').time()
    except ValueError:
        return jsonify(response="Invalid date or time format. Use YYYY-MM-DD and HH:MM"), 400

    if res_date < datetime.now().date():
        return jsonify(response="Reservation date cannot be in the past"), 400

    day_schedule = db.session.execute(
        select(PlaceSchedule).where(
            PlaceSchedule.place_id == place_id,
            PlaceSchedule.day_of_week == res_date.weekday()
        )
    ).scalar_one_or_none()

    if day_schedule:
        if day_schedule.is_closed or not day_schedule.start_time or not day_schedule.end_time:
            return jsonify(response="The place is closed on the selected date"), 400

        if not (day_schedule.start_time <= res_time < day_schedule.end_time):
            return jsonify(
                response=(
                    "The selected time is outside the place schedule. "
                    f"Available hours: {day_schedule.start_time.strftime('%H:%M')} - "
                    f"{day_schedule.end_time.strftime('%H:%M')}"
                )
            ), 400
    elif place.start_time and place.end_time:
        if not (place.start_time <= res_time <= place.end_time):
            return jsonify(
                response=(
                    "The selected time is outside the place schedule. "
                    f"Available hours: {place.start_time.strftime('%H:%M')} - "
                    f"{place.end_time.strftime('%H:%M')}"
                )
            ), 400
    
    if place.requires_reservation_payment is True:
        if place.reservation_price is None:
            return jsonify(response="Reservation price is required for paid reservations"), 400
        
        status = ReservationStatus.PENDING
        requires_payment = True
        amount = str(place.reservation_price)
    else:
        status = ReservationStatus.CONFIRMED
        requires_payment = False
        amount = None

    new_reservation = Reservation(
        user_id=user_id,
        place_id=place_id,
        reservation_date=res_date,
        reservation_time=res_time,
        people_count=people_count,
        pet_id=pet_id,
        zone_preference=zone_preference,
        notes=notes,
        status=status
    )

    db.session.add(new_reservation)
    db.session.commit()

    response = {
            "reservation_id": new_reservation.id,
            "user_id": new_reservation.user_id,
            "user_name": new_reservation.user.name,
            "place_id": new_reservation.place_id,
            "place_name": new_reservation.place.name,
            "reservation_date": str(new_reservation.reservation_date),
            "reservation_time": str(new_reservation.reservation_time),
            "people_count": new_reservation.people_count,
            "pet_id": new_reservation.pet_id,
            "pet_name": new_reservation.pet.name if new_reservation.pet else None,
            "table_id": new_reservation.table_id,
            "table_name": new_reservation.table.name if new_reservation.table else None,
            "zone_preference": new_reservation.zone_preference,
            "notes": new_reservation.notes,
            "status": new_reservation.status.value,
            "amount": amount,
            "currency": "EUR",
            "requires_payment": requires_payment
        }

    return jsonify(response), 201

def get_paypal_access_token():
    url = f"{os.getenv('PAYPAL_BASE_URL')}/v1/oauth2/token"

    response = requests.post(
        url,
        auth=(os.getenv("PAYPAL_CLIENT_ID"), os.getenv("PAYPAL_CLIENT_SECRET")),
        data={"grant_type": "client_credentials"}
    )

    data = response.json()
    return data.get("access_token")

@api.route('/users/private/paypal/create-order', methods=['POST'])
@jwt_required()
def paypal_create_order():
    user_id = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        return jsonify(response="User not found"), 404

    data = request.get_json(silent=True) or {}
    reservation_id = data.get("reservation_id")
    if reservation_id is None:
        return jsonify(response="Reservation ID is required"), 400
    
    try:
        reservation_id = int(reservation_id)
    except (TypeError, ValueError):
        return jsonify(response="Reservation id must be a valid integer"), 400
    
    reservation_exists = db.session.execute(select(Reservation).where(Reservation.id == reservation_id, Reservation.user_id == user_id)).scalar_one_or_none()
    if reservation_exists is None:
        return jsonify(response="Reservation not found"), 404
    
    if reservation_exists.status != ReservationStatus.PENDING:
        return jsonify(response="Reservation is not pending payment"), 400
    
    place = reservation_exists.place
    
    if place.requires_reservation_payment is False:
        return jsonify(response="This reservation does not require payment"), 400
    
    if place.reservation_price is None:
        return jsonify(response="Reservation price is missing"), 400
    
    amount = str(place.reservation_price)
    
    access_token = get_paypal_access_token()

    paypal_url = f"{os.getenv('PAYPAL_BASE_URL')}/v2/checkout/orders"
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "EUR",
                    "value": amount
                }
            }
        ]
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    paypal_res = requests.post(paypal_url, json=payload, headers=headers)

    if paypal_res.status_code not in [200, 201]:
        return jsonify(response="Error creating PayPal order"), 500
    
    paypal_data = paypal_res.json()
    order_id = paypal_data.get("id")

    return jsonify({"orderID":order_id, "reservation_id": reservation_id, "amount": amount}), 200

@api.route('/users/private/paypal/capture-order', methods=['POST'])
@jwt_required()
def paypal_capture_order():
    user_id = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        return jsonify(response="User not found"), 404

    data = request.get_json(silent=True) or {}
    reservation_id = data.get("reservation_id")
    order_id = data.get("order_id")

    if reservation_id is None or order_id is None:
        return jsonify(response="Reservation id and order id are required"), 400

    try:
        reservation_id = int(reservation_id)
    except (TypeError, ValueError):
        return jsonify(response="Reservation id must be a valid integer"), 400

    if not isinstance(order_id, str):
        return jsonify(response="Order id must be a string"), 400

    order_id = order_id.strip()
    if not order_id:
        return jsonify(response="Order id cannot be empty"), 400

    reservation = db.session.execute(
        select(Reservation).where(
            Reservation.id == reservation_id,
            Reservation.user_id == user_id
        )
    ).scalar_one_or_none()
    if reservation is None:
        return jsonify(response="Reservation not found"), 404

    if reservation.status != ReservationStatus.PENDING:
        return jsonify(response="Reservation is not pending payment"), 400

    place = reservation.place
    if not place.requires_reservation_payment:
        return jsonify(response="This reservation does not require payment"), 400

    if place.reservation_price is None:
        return jsonify(response="Reservation price is missing"), 400

    access_token = get_paypal_access_token()
    if not access_token:
        return jsonify(response="Unable to authenticate with PayPal"), 502

    paypal_url = f"{os.getenv('PAYPAL_BASE_URL')}/v2/checkout/orders/{order_id}/capture"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    try:
        paypal_res = requests.post(paypal_url, headers=headers)
    except requests.RequestException:
        return jsonify(response="Unable to capture PayPal order"), 502

    paypal_data = paypal_res.json()
    if paypal_res.status_code not in [200, 201]:
        return jsonify(
            response="Error capturing PayPal order",
            paypal_status=paypal_data.get("name"),
            paypal_details=paypal_data.get("details")
        ), 502

    capture_status = paypal_data.get("status")
    if capture_status != "COMPLETED":
        return jsonify(
            response="PayPal payment was not completed",
            paypal_status=capture_status,
            paypal_details=paypal_data
        ), 400

    reservation.status = ReservationStatus.CONFIRMED
    db.session.commit()

    return jsonify({
        "reservation_id": reservation.id,
        "status": reservation.status.value,
        "paypal_status": capture_status,
        "paypal_details": paypal_data
    }), 200

@api.route('/users/private/reservations', methods=['DELETE'])
@jwt_required()
def cancel_private_user_reservation():
    user_id = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        return jsonify(response="User not found"), 404

    data = request.get_json(silent=True) or {}
    reservation_id = data.get("reservation_id")

    if reservation_id is None:
        return jsonify(response="Reservation id is required"), 400

    if not isinstance(reservation_id, str):
        return jsonify(response="Reservation id must be a string"), 400

    reservation_id = reservation_id.strip()
    if len(reservation_id) == 0:
        return jsonify(response="Reservation id cannot be empty"), 400

    try:
        reservation_id = int(reservation_id)
    except (TypeError, ValueError):
        return jsonify(response="Reservation id must be a valid integer"), 400

    reservation = db.session.execute(
        select(Reservation).where(
            Reservation.id == reservation_id,
            Reservation.user_id == user_id
        )
    ).scalar_one_or_none()
    if reservation is None:
        return jsonify(response="Reservation not found"), 404

    reservation.status = ReservationStatus.CANCELLED
    db.session.commit()

    return jsonify(reservation.serialize()), 200


@api.route('/users/private/reviews', methods=['GET'])
@jwt_required()
def get_private_user_reviews():
    user_id = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        return jsonify(response="User not found"), 404

    reviews = db.session.execute(
        select(Review).where(Review.user_id == user_id).order_by(Review.id.desc())
    ).scalars().all()

    return jsonify([review.serialize() for review in reviews]), 200


@api.route('/users/private/reviews', methods=['POST'])
@jwt_required()
def add_private_user_review():
    user_id = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        return jsonify(response="User not found"), 404

    data = request.get_json(silent=True) or {}
    reservation_id = data.get("reservation_id")
    rating = data.get("rating")
    title = data.get("title")
    content = data.get("content")

    if any([reservation_id is None, rating is None, title is None, content is None]):
        return jsonify(response="Missing required fields"), 400

    if not all([
        isinstance(reservation_id, str),
        isinstance(rating, str),
        isinstance(title, str),
        isinstance(content, str)
    ]):
        return jsonify(response="Reservation id, rating, title and content must be strings"), 400

    reservation_id = reservation_id.strip()
    rating = rating.strip()
    title = title.strip()
    content = content.strip()

    if any([len(reservation_id) == 0, len(rating) == 0, len(title) == 0, len(content) == 0]):
        return jsonify(response="Required fields cannot be empty"), 400

    try:
        reservation_id = int(reservation_id)
    except (TypeError, ValueError):
        return jsonify(response="Reservation id must be a valid integer"), 400

    try:
        rating = int(rating)
    except (TypeError, ValueError):
        return jsonify(response="Rating must be a valid integer"), 400

    if rating < 1 or rating > 5:
        return jsonify(response="Rating must be between 1 and 5"), 400

    reservation = db.session.execute(
        select(Reservation).where(
            Reservation.id == reservation_id,
            Reservation.user_id == user_id
        )
    ).scalar_one_or_none()
    if reservation is None:
        return jsonify(response="Reservation not found"), 404

    if reservation.status != ReservationStatus.CONFIRMED:
        return jsonify(response="Only confirmed reservations can be reviewed"), 400

    # existing_review = db.session.execute(
    #     select(Review).where(
    #         Review.user_id == user_id,
    #         Review.reservation_id == reservation_id
    #     )
    # ).scalar_one_or_none()
    # if existing_review is not None:
    #     return jsonify(response="A review for this reservation already exists"), 400

    new_review = Review(
        user_id=user_id,
        reservation_id=reservation_id,
        rating=rating,
        title=title,
        content=content,
        created_at=datetime.now().isoformat(),
        is_active=True
    )

    db.session.add(new_review)
    db.session.commit()

    return jsonify(new_review.serialize()), 201

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2 +
        math.cos(math.radians(lat1)) *
        math.cos(math.radians(lat2)) *
        math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

@api.route('/users/private/nearby-places', methods=['GET'])
@jwt_required()
def get_private_user_nearby_places():
    user_id = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        return jsonify(response="User not found"), 404
    
    radius = request.args.get("radius", 10, type=float)
    radius = min(max(radius, 1), 50)
    
    all_places = db.session.execute(select(Place)).scalars().all()
    if user.latitude is None and user.longitude is None:
        return jsonify([place.serialize() for place in all_places]), 200
    
    nearby_places = []
    for place in all_places:
        if place.latitude is None and place.longitude is None:
            continue
        distance = calculate_distance(
        user.latitude,
        user.longitude,
        place.latitude,
        place.longitude
        )

        if distance <= radius:
            nearby_places.append(place)
    
    return jsonify([place.serialize() for place in nearby_places]), 200




from api.models import Table, PlaceSchedule

@api.route('/places/<int:place_id>/tables', methods=['GET'])
def get_place_tables(place_id):
    tables = db.session.execute(select(Table).where(Table.place_id == place_id)).scalars().all()
    return jsonify([t.serialize() for t in tables]), 200

@api.route('/places/<int:place_id>/tables', methods=['POST'])
def add_place_table(place_id):
    data = request.get_json(silent=True) or {}
    name = data.get('name')
    
    def safe_int(val, default=0):
        try:
            return int(val) if val not in [None, ""] else default
        except (ValueError, TypeError):
            return default
            
    capacity_people = safe_int(data.get('capacity_people'), 0)
    capacity_pets = safe_int(data.get('capacity_pets'), 0)
    pos_x = safe_int(data.get('pos_x'), 0)
    pos_y = safe_int(data.get('pos_y'), 0)

    shape = data.get('shape', 'square')
    is_occupied = data.get('is_occupied', False)

    if not name:
        return jsonify({"msg": "Name is required"}), 400

    new_table = Table(
        place_id=place_id,
        name=name,
        capacity_people=int(capacity_people),
        capacity_pets=int(capacity_pets),
        pos_x=int(pos_x),
        pos_y=int(pos_y),
        shape=shape
    )
    db.session.add(new_table)
    db.session.commit()
    return jsonify(new_table.serialize()), 201

@api.route('/tables/<int:table_id>', methods=['PUT'])
def update_table(table_id):
    table = db.session.get(Table, table_id)
    if not table:
        return jsonify({"msg": "Table not found"}), 404

    data = request.get_json(silent=True) or {}
    
    def safe_int(val, default):
        try:
            return int(val) if val not in [None, ""] else default
        except (ValueError, TypeError):
            return default

    if 'name' in data: table.name = data['name']
    if 'capacity_people' in data: table.capacity_people = safe_int(data['capacity_people'], table.capacity_people)
    if 'capacity_pets' in data: table.capacity_pets = safe_int(data['capacity_pets'], table.capacity_pets)
    if 'pos_x' in data: table.pos_x = safe_int(data['pos_x'], table.pos_x)
    if 'pos_y' in data: table.pos_y = safe_int(data['pos_y'], table.pos_y)
    if 'shape' in data: table.shape = data['shape']
    if 'is_occupied' in data: table.is_occupied = bool(data['is_occupied'])

    db.session.commit()
    return jsonify(table.serialize()), 200

@api.route('/tables/<int:table_id>', methods=['DELETE'])
def delete_table(table_id):
    table = db.session.get(Table, table_id)
    if not table:
        return jsonify({"msg": "Table not found"}), 404
    db.session.delete(table)
    db.session.commit()
    return jsonify({"msg": "Table deleted"}), 200

@api.route('/places/<int:place_id>/schedule', methods=['GET'])
def get_place_schedule(place_id):
    schedules = db.session.execute(select(PlaceSchedule).where(PlaceSchedule.place_id == place_id)).scalars().all()
    return jsonify([s.serialize() for s in schedules]), 200

@api.route('/places/<int:place_id>/schedule', methods=['PUT'])
def update_place_schedule(place_id):
    data = request.get_json(silent=True) or []
    db.session.execute(db.delete(PlaceSchedule).where(PlaceSchedule.place_id == place_id))
    
    for item in data:
        try:
            start_t = datetime.strptime(item['start_time'][:5], '%H:%M').time() if item.get('start_time') else None
            end_t = datetime.strptime(item['end_time'][:5], '%H:%M').time() if item.get('end_time') else None
        except ValueError:
            start_t, end_t = None, None

        s = PlaceSchedule(
            place_id=place_id,
            day_of_week=int(item['day_of_week']),
            start_time=start_t,
            end_time=end_t,
            is_closed=bool(item.get('is_closed', False))
        )
        db.session.add(s)

    db.session.commit()
    schedules = db.session.execute(select(PlaceSchedule).where(PlaceSchedule.place_id == place_id)).scalars().all()
    return jsonify([s.serialize() for s in schedules]), 200

@api.route('/places/<int:place_id>/availability', methods=['GET'])
def get_place_availability(place_id):
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({"msg": "date parameter is required"}), 400
        
    try:
        req_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD"}), 400

    day_of_week = req_date.weekday() # 0 = Monday
    schedule = db.session.execute(select(PlaceSchedule).where(PlaceSchedule.place_id == place_id, PlaceSchedule.day_of_week == day_of_week)).scalar_one_or_none()
    
    if not schedule or schedule.is_closed or not schedule.start_time or not schedule.end_time:
        return jsonify({"slots": []}), 200

    slots = []
    from datetime import timedelta
    current_dt = datetime.combine(req_date, schedule.start_time)
    end_dt = datetime.combine(req_date, schedule.end_time)
    
    while current_dt + timedelta(minutes=30) <= end_dt:
        slots.append(current_dt.time().strftime("%H:%M"))
        current_dt += timedelta(minutes=30)

    return jsonify({"slots": slots}), 200

@api.route('/reservations/<int:id>/seat', methods=['PUT'])
@jwt_required()
def seat_reservation(id):
    reservation = db.session.get(Reservation, id)
    if not reservation:
        return jsonify({"msg": "Reservation not found"}), 404
        
    data = request.get_json(silent=True) or {}
    table_id = data.get("table_id")
    
    if table_id:
        table = db.session.get(Table, int(table_id))
        if not table or table.place_id != reservation.place_id:
            return jsonify({"msg": "Invalid table"}), 400
        reservation.table_id = int(table_id)
        
    if 'status' in data:
        new_status = data['status']
        claims = get_jwt()
        role = claims.get("role")
        
        # Security Rules:
        # 1. Only 'place' can set to CONFIRMED
        if new_status == 'confirmed' and role != 'place':
            return jsonify({"msg": "Only establishments can confirm reservations"}), 403
            
        # 2. Both can CANCEL (but let's check ownership if needed)
        # For now, if role is present, allow cancellation
        if new_status in ['confirmed', 'pending', 'cancelled']:
            reservation.status = ReservationStatus(new_status)

    db.session.commit()
    return jsonify(reservation.serialize()), 200

@api.route('/places/<int:place_id>/statistics', methods=['GET'])
def get_place_statistics(place_id):
    from sqlalchemy import func
    from datetime import timedelta
    thirty_days_ago = datetime.now().date() - timedelta(days=30)
    
    stats = db.session.execute(
        select(Reservation.reservation_date, func.count(Reservation.id))
        .where(Reservation.place_id == place_id)
        .where(Reservation.reservation_date >= thirty_days_ago)
        .group_by(Reservation.reservation_date)
        .order_by(Reservation.reservation_date)
    ).all()
    
    result = [{"date": str(row[0]), "count": row[1]} for row in stats]
    return jsonify(result), 200
