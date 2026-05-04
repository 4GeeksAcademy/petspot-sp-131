"""
Users Routes
============
CRUD de usuarios (admin) y endpoints privados del usuario autenticado.
"""
from flask import request, jsonify
import math
from sqlalchemy import select
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity

from api.routes import api
from api.models import db, User, Favorite, Place, Reservation, Review, ReservationStatus


# ===========================================================================
# CRUD público / admin
# ===========================================================================

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
        user.password = generate_password_hash(password)

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


# ===========================================================================
# Endpoints privados del usuario autenticado
# ===========================================================================

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
    from api.routes.geocoding import geocode_address

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

        user.password = generate_password_hash(password)

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
    if user.latitude is None or user.longitude is None:
        return jsonify([place.serialize() for place in all_places]), 200

    nearby_places = []
    for place in all_places:
        if place.latitude is None or place.longitude is None:
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
    from datetime import datetime

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

    if pet_id:
        try:
            pet_id = int(pet_id)
        except (TypeError, ValueError):
            return jsonify(response="Pet id must be a valid integer"), 400
    else:
        pet_id = None

    try:
        res_date = datetime.strptime(reservation_date_str, '%Y-%m-%d').date()
        res_time = datetime.strptime(reservation_time_str[:5], '%H:%M').time()
    except ValueError:
        return jsonify(response="Invalid date or time format. Use YYYY-MM-DD and HH:MM"), 400

    new_reservation = Reservation(
        user_id=user_id,
        place_id=place_id,
        reservation_date=res_date,
        reservation_time=res_time,
        people_count=people_count,
        pet_id=pet_id,
        zone_preference=zone_preference,
        notes=notes,
        status=ReservationStatus.PENDING
    )

    db.session.add(new_reservation)
    db.session.commit()

    return jsonify(new_reservation.serialize()), 201


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
    from datetime import datetime

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


@api.route('/users/pets', methods=['GET'])
@jwt_required()
def get_user_pets():
    from api.models import Pet
    user_id = get_jwt_identity()
    user = db.session.execute(db.select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    pets = db.session.execute(db.select(Pet).where(Pet.user_id == user.id)).scalars().all()
    return jsonify([pet.serialize() for pet in pets]), 200
