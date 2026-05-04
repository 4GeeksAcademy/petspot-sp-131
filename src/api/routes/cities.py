"""
Cities Routes
=============
CRUD de ciudades disponibles en la plataforma.
"""
from flask import request, jsonify
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from api.routes import api
from api.models import db, City


# ===========================================================================
# CRUD de Ciudades
# ===========================================================================

@api.route('/cities', methods=['GET'])
def get_cities():
    cities = db.session.execute(
        select(City).order_by(City.city.asc())
    ).scalars().all()
    return jsonify([city.serialize() for city in cities]), 200


@api.route("/cities/with-places", methods=["GET"])
def get_cities_with_places():
    from api.models import Place
    cities = db.session.execute(
        select(City)
        .join(Place)
        .where(Place.is_active.is_(True))
        .distinct()
        .order_by(City.city)
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
