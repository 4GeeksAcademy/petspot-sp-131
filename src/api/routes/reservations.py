from flask import request, jsonify, Blueprint
from api.models import db, Reservation, User, Place, ReservationStatus
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from datetime import datetime

reservations_api = Blueprint('reservations_api', __name__)

@reservations_api.route('/reservations', methods=['GET'])
def get_reservations():
    reservations = db.session.execute(
        select(Reservation).options(joinedload(Reservation.user), joinedload(Reservation.place)).order_by(Reservation.id.desc())
    ).scalars().all()
    return jsonify([res.serialize() for res in reservations]), 200

@reservations_api.route('/reservations', methods=['POST'])
@jwt_required()
def add_reservation():
    identity = get_jwt_identity()
    user_id = identity["id"] if isinstance(identity, dict) else identity
    data = request.get_json(silent=True) or {}
    
    try:
        new_reservation = Reservation(
            user_id=user_id,
            place_id=data.get("place_id"),
            reservation_date=datetime.strptime(data.get("reservation_date"), '%Y-%m-%d').date(),
            reservation_time=datetime.strptime(data.get("reservation_time"), '%H:%M').time(),
            people_count=int(data.get("people_count")),
            pet_count=int(data.get("pet_count")),
            zone_preference=data.get("zone_preference"),
            notes=data.get("notes"),
            status=ReservationStatus.PENDING
        )
        db.session.add(new_reservation)
        db.session.commit()
        return jsonify(new_reservation.serialize()), 201
    except Exception as e:
        return jsonify({"msg": str(e)}), 400

@reservations_api.route('/reservations/<int:id>', methods=['PUT'])
@jwt_required()
def update_reservation(id):
    res = db.session.get(Reservation, id)
    if not res: return jsonify({"msg": "Not found"}), 404
    
    data = request.get_json(silent=True) or {}
    # ... update logic ...
    db.session.commit()
    return jsonify(res.serialize()), 200

@reservations_api.route('/users/private/reservations', methods=['GET'])
@jwt_required()
def get_user_reservations():
    identity = get_jwt_identity()
    user_id = identity["id"] if isinstance(identity, dict) else identity
    res = db.session.execute(select(Reservation).where(Reservation.user_id == user_id)).scalars().all()
    return jsonify([r.serialize() for r in res]), 200
