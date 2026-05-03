"""
Reservations Routes
===================
CRUD completo de reservas y endpoint de asignación de mesa (seat).
"""
from datetime import datetime
from flask import request, jsonify
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from api.routes import api
from api.models import db, Reservation, ReservationStatus, User, Place, Table


# ===========================================================================
# CRUD de Reservas (admin)
# ===========================================================================

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
            reservation.reservation_date = datetime.strptime(reservation_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify(response="Invalid date format"), 400
    if reservation_time_str:
        try:
            reservation.reservation_time = datetime.strptime(reservation_time_str[:5], '%H:%M').time()
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


# ===========================================================================
# Asignación de mesa (Place dashboard)
# ===========================================================================

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

        # Solo 'place' puede confirmar reservas
        if new_status == 'confirmed' and role != 'place':
            return jsonify({"msg": "Only establishments can confirm reservations"}), 403

        if new_status in ['confirmed', 'pending', 'cancelled']:
            reservation.status = ReservationStatus(new_status)

    db.session.commit()
    return jsonify(reservation.serialize()), 200
