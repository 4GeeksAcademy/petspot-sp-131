"""
Places Routes
=============
CRUD de establecimientos (admin), endpoints privados del lugar autenticado,
gestión de tablas (mesas) y horarios.
"""
from datetime import datetime, timedelta
from flask import request, jsonify
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity

from api.routes import api
from api.models import db, Place, City, EstablishmentType, Reservation, Review, Table, PlaceSchedule


# ===========================================================================
# CRUD público / admin de Places
# ===========================================================================

@api.route("/places", methods=["GET"])
def get_places():
    places = db.session.execute(
        select(Place).order_by(Place.id.desc())
    ).scalars().all()
    return jsonify([place.serialize() for place in places]), 200


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

    if city_id is not None:
        try:
            city_id = int(city_id)
        except (TypeError, ValueError):
            return jsonify(response="city_id must be a valid integer"), 400

        city = db.session.get(City, city_id)
        if city is None:
            return jsonify(response="City not found"), 404
        place.city = city

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

    db.session.commit()

    return jsonify(place.serialize()), 200


# ===========================================================================
# Endpoints privados del establecimiento autenticado
# ===========================================================================

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
    from api.routes.geocoding import (
        geocode_address_details,
        geocoded_result_matches_city
    )

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


# ===========================================================================
# Reviews de un place (público)
# ===========================================================================

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


# ===========================================================================
# Reservas de un place (público)
# ===========================================================================

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


# ===========================================================================
# Tablas (mesas)
# ===========================================================================

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

    if 'name' in data:
        table.name = data['name']
    if 'capacity_people' in data:
        table.capacity_people = safe_int(data['capacity_people'], table.capacity_people)
    if 'capacity_pets' in data:
        table.capacity_pets = safe_int(data['capacity_pets'], table.capacity_pets)
    if 'pos_x' in data:
        table.pos_x = safe_int(data['pos_x'], table.pos_x)
    if 'pos_y' in data:
        table.pos_y = safe_int(data['pos_y'], table.pos_y)
    if 'shape' in data:
        table.shape = data['shape']
    if 'is_occupied' in data:
        table.is_occupied = bool(data['is_occupied'])

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


# ===========================================================================
# Horarios del establecimiento
# ===========================================================================

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

    day_of_week = req_date.weekday()
    schedule = db.session.execute(
        select(PlaceSchedule).where(
            PlaceSchedule.place_id == place_id,
            PlaceSchedule.day_of_week == day_of_week
        )
    ).scalar_one_or_none()

    if not schedule or schedule.is_closed or not schedule.start_time or not schedule.end_time:
        return jsonify({"slots": []}), 200

    slots = []
    current_dt = datetime.combine(req_date, schedule.start_time)
    end_dt = datetime.combine(req_date, schedule.end_time)

    while current_dt + timedelta(minutes=30) <= end_dt:
        slots.append(current_dt.time().strftime("%H:%M"))
        current_dt += timedelta(minutes=30)

    return jsonify({"slots": slots}), 200


# ===========================================================================
# Estadísticas del establecimiento
# ===========================================================================

@api.route('/places/<int:place_id>/statistics', methods=['GET'])
def get_place_statistics(place_id):
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
