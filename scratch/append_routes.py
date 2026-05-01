import os

with open('src/api/routes.py', 'a', encoding='utf-8') as f:
    f.write('''

from api.models import Table, PlaceSchedule

@api.route('/places/<int:place_id>/tables', methods=['GET'])
def get_place_tables(place_id):
    tables = db.session.execute(select(Table).where(Table.place_id == place_id)).scalars().all()
    return jsonify([t.serialize() for t in tables]), 200

@api.route('/places/<int:place_id>/tables', methods=['POST'])
def add_place_table(place_id):
    data = request.get_json(silent=True) or {}
    name = data.get('name')
    capacity_people = data.get('capacity_people', 0)
    capacity_pets = data.get('capacity_pets', 0)
    pos_x = data.get('pos_x', 0)
    pos_y = data.get('pos_y', 0)

    if not name:
        return jsonify({"msg": "Name is required"}), 400

    new_table = Table(
        place_id=place_id,
        name=name,
        capacity_people=int(capacity_people),
        capacity_pets=int(capacity_pets),
        pos_x=int(pos_x),
        pos_y=int(pos_y)
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
    if 'name' in data: table.name = data['name']
    if 'capacity_people' in data: table.capacity_people = int(data['capacity_people'])
    if 'capacity_pets' in data: table.capacity_pets = int(data['capacity_pets'])
    if 'pos_x' in data: table.pos_x = int(data['pos_x'])
    if 'pos_y' in data: table.pos_y = int(data['pos_y'])

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
        reservation.status = ReservationStatus.CONFIRMED

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
''')
