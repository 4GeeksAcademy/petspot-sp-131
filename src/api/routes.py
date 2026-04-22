"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Place, EstablishmentType, AdminUser, City, Chat, Reservation, ReservationStatus, Favorite
from datetime import datetime
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


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

    new_user = User(
        name=name,
        email=email,
        password=password,
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

    # Validación básica
    if "email" not in body or not body["email"]:
        return jsonify({"msg": "El email es obligatorio"}), 400

    # Verificar si el email ya existe en otro usuario
    existing_user = db.session.execute(
        db.select(User).filter_by(email=body["email"])
    ).scalar_one_or_none()

    if existing_user and existing_user.id != user.id:
        return jsonify({"msg": "El email ya está en uso"}), 409

    # Actualizar campos
    user.name = body.get("name", user.name)
    user.email = body.get("email", user.email)
    user.password = body.get("password", user.password)
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
        select(Place).order_by(Place.id.desc())).scalars().all()
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
    city_id = data.get("city_id")

    if not all([x for x in [email, password, name, establishment_type, city_id]]):
        return jsonify(response="Email, password, name, establishment type, and city_id are required"), 400

    if not all([isinstance(x, str) for x in [email, password, name, establishment_type]]):
        return jsonify(response="Email, password, name, and establishment_type must be strings"), 400

    try:
        city_id = int(city_id)
    except (TypeError, ValueError):
        return jsonify(response="city_id must be a valid integer"), 400

    city = db.session.get(City, city_id)
    if city is None:
        return jsonify(response="City not found"), 404

    try:
        establishment_type = establishment_type.strip()
        establishment_type = EstablishmentType(establishment_type)
    except ValueError:
        return jsonify(response="Invalid establishment type"), 400

    email = email.strip()
    password = password.strip()
    name = name.strip()

    if pet_rules is not None:
        pet_rules = str(pet_rules)
        pet_rules = pet_rules.strip()
        if len(pet_rules) > 250:
            return jsonify(response="pet_rules cannot exceed 250 characters"), 400

    if not all([x for x in [email, password, name]]):
        return jsonify(response="Email, password, city, and name cannot be empty"), 400

    email_exists = db.session.execute(select(Place).where(
        Place.email == email)).scalar_one_or_none()
    if email_exists is not None:
        return jsonify(response="Unable to create an account with the provided information"), 400

    hashed_password = generate_password_hash(password)
    place = Place(name=name, email=email, password=hashed_password, city=city,
                  establishment_type=establishment_type, pet_rules=pet_rules or None)
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
    city_id = data.get("city_id")

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

    if city_id is not None:
        try:
            city_id = int(city_id)
        except (TypeError, ValueError):
            return jsonify(response="city_id must be a valid integer"), 400

        city = db.session.get(City, city_id)
        if city is None:
            return jsonify(response="City not found"), 404
        place.city = city

    db.session.commit()

    return jsonify(place.serialize()), 200


@api.route('/admin', methods=['GET'])
def get_admins():
    admins = AdminUser.query.all()
    return jsonify([admin.serialize() for admin in admins]), 200


@api.route('/admin/<int:id>', methods=['GET'])
def get_admin(id):
    admin = AdminUser.query.get(id)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404
    return jsonify(admin.serialize()), 200


@api.route('/admin', methods=['POST'])
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
def delete_admin(id):
    admin = AdminUser.query.get(id)

    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    db.session.delete(admin)
    db.session.commit()

    return jsonify({"message": "Admin deleted"}), 200


@api.route('/cities', methods=['GET'])
def get_cities():
    cities = db.session.execute(
        select(City).order_by(City.city.asc())).scalars().all()
    return jsonify([city.serialize() for city in cities]), 200


@api.route('/cities', methods=['POST'])
def add_city():
    data = request.get_json(silent=True) or {}
    city = data.get("city")

    if city is None:
        return jsonify(response="City is required"), 400

    city = city.strip().title()
    city_exists = db.session.execute(select(City).where(
        City.city == city)).scalar_one_or_none()
    if city_exists:
        return jsonify(response="City already exists"), 400

    try:
        add_city = City(city=city)
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
    city_with_existing_name = db.session.execute(select(City).where(
        City.city == city, City.id != city_id)).scalar_one_or_none()
    if city_with_existing_name:
        return jsonify(response="City cannot be updated to an existing city name"), 400

    try:
        city_exists.city = city
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(response="City cannot be updated to an existing city name"), 400
    
    return jsonify(city_exists.serialize()), 200


@api.route('/chat', methods=['GET'])
def get_chats():
    chats = db.session.execute(select(Chat)).scalars().all()
    return jsonify([chat.serialize() for chat in chats]), 200


@api.route('/chat/<int:chat_id>', methods=['GET'])
def get_chat(chat_id):
    chat = db.session.get(Chat, chat_id)
    if chat is None:
        return jsonify({"msg": "Chat not found"}), 404
    return jsonify(chat.serialize()), 200


@api.route('/chat', methods=['POST'])
def create_chat():
    data = request.json

    new_chat = Chat(
        user_id=data.get("user_id"),
        place_id=data.get("place_id"),
        message=data.get("message"),
        sender=data.get("sender")
    )

    db.session.add(new_chat)
    db.session.commit()

    return jsonify(new_chat.serialize()), 201


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
    reservations = db.session.execute(select(Reservation).options(joinedload(Reservation.user), joinedload(Reservation.place)).order_by(Reservation.id.desc())).scalars().all() or None
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
    pet_count = data.get("pet_count")
    zone_preference = data.get("zone_preference")
    notes = data.get("notes")

    if not all([user_id, place_id, reservation_date_str, reservation_time_str, people_count is not None, pet_count is not None]):
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

    new_reservation = Reservation(
        user_id=user_id,
        place_id=place_id,
        reservation_date=res_date,
        reservation_time=res_time,
        people_count=int(people_count),
        pet_count=int(pet_count),
        zone_preference=zone_preference,
        notes=notes,
        status=ReservationStatus.PENDING
    )

    db.session.add(new_reservation)
    db.session.commit()

    return jsonify(new_reservation.serialize()), 201

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
            reservation.reservation_date = datetime.strptime(reservation_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify(response="Invalid date format"), 400
    if reservation_time_str:
        try:
            reservation.reservation_time = datetime.strptime(reservation_time_str, '%H:%M').time()
        except ValueError:
            return jsonify(response="Invalid time format"), 400

    if 'people_count' in data:
        reservation.people_count = int(data['people_count'])
    if 'pet_count' in data:
        reservation.pet_count = int(data['pet_count'])
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
    reservations = db.session.execute(select(Reservation).where(Reservation.user_id == user_id)).scalars().all()
    if not reservations:
        return jsonify(response="No reservations found for this user"), 404
    return jsonify([res.serialize() for res in reservations]), 200

@api.route('/places/<int:place_id>/reservations', methods=['GET'])
def get_place_reservations(place_id):
    place = db.session.get(Place, place_id)
    if not place:
        return jsonify(response="Place not found"), 404
    reservations = db.session.execute(select(Reservation).where(Reservation.place_id == place_id)).scalars().all()
    if not reservations:
        return jsonify(response="No reservations found for this place"), 404
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
    
    user_exists = db.session.execute(select(User).where(User.name == user)).scalar_one_or_none()
    if user_exists is None:
        return jsonify(response="User not found"), 404
    
    place_exists = db.session.execute(select(Place).where(Place.name == place)).scalar_one_or_none()
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
    favorite_exists = db.session.execute(select(Favorite).where(Favorite.id == favorite_id)).scalar_one_or_none()
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
    
    place_exists = db.session.execute(select(Place).where(Place.name == place)).scalar_one_or_none()
    if place_exists is None: 
        return jsonify(response="Place not found"), 404
    
    favorite_relation_exists = db.session.execute(select(Favorite).where(Favorite.user_id == favorite_exists.user_id, Favorite.place_id == place_exists.id)).scalar_one_or_none()
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
    
    place_exists = db.session.execute(select(Place).where(Place.email == email)).scalar_one_or_none()
    if place_exists is None:
        return jsonify(response="Incorrect email or password"), 400
    
    place_password = place_exists.password
    if not check_password_hash(place_password, password):
        return jsonify(response="Incorrect email or password"), 400
    
    access_token = create_access_token(identity=str(place_exists.id))

    return jsonify(access_token_place=access_token), 200

@api.route("/places/private", methods=["GET"])
@jwt_required()
def private_place():
    place_id = int(get_jwt_identity())
    place_exists = db.session.execute(select(Place).where(Place.id == place_id)).scalar_one_or_none()
    if place_exists is None:
        return jsonify(response="Place not found")
    
    return jsonify(place_exists.serialize()), 200