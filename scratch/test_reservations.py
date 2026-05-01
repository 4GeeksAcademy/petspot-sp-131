import sys
import os

# Add src to path so we can import app and db
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from app import app, db
from api.models import User, Place, Table, PlaceSchedule, Reservation, Pet, ReservationStatus
from datetime import datetime, timedelta, time

def run_tests():
    with app.app_context():
        # Setup: Ensure we have a test user and a test place
        user = User.query.filter_by(email="testuser_res@example.com").first()
        if not user:
            user = User(
                name="Test Res User",
                email="testuser_res@example.com",
                password="password",
                is_active=True
            )
            db.session.add(user)
            db.session.commit()

        place = Place.query.filter_by(email="testplace_res@example.com").first()
        if not place:
            place = Place(
                name="Test Place Res",
                email="testplace_res@example.com",
                password="password",
                establishment_type="RESTAURANT",
                city_id=1,
                is_active=True
            )
            db.session.add(place)
            db.session.commit()

        # 1. Test Schedule CRUD
        # Clear existing
        db.session.execute(db.delete(PlaceSchedule).where(PlaceSchedule.place_id == place.id))
        
        # Add Monday schedule
        schedule = PlaceSchedule(
            place_id=place.id,
            day_of_week=0, # Monday
            start_time=time(9, 0),
            end_time=time(18, 0),
            is_closed=False
        )
        db.session.add(schedule)
        db.session.commit()

        print("Schedule created successfully")

        # 2. Test Table CRUD
        # Clear existing
        db.session.execute(db.delete(Table).where(Table.place_id == place.id))
        
        table = Table(
            place_id=place.id,
            name="Table 1",
            capacity_people=4,
            capacity_pets=2,
            pos_x=0,
            pos_y=0
        )
        db.session.add(table)
        db.session.commit()

        print("Table created successfully")

        # 3. Test Availability logic (simulated by checking if we can query the schedule)
        # Assuming today is Monday for testing logic, we'd normally hit the endpoint.
        # Here we just verify the schedule is in DB
        fetched_schedule = PlaceSchedule.query.filter_by(place_id=place.id, day_of_week=0).first()
        assert fetched_schedule is not None
        assert fetched_schedule.start_time == time(9, 0)
        
        print("Availability data is correct in DB")

        # 4. Test Reservation Flow
        reservation = Reservation(
            user_id=user.id,
            place_id=place.id,
            reservation_date=datetime.now().date(),
            reservation_time=time(10, 0),
            people_count=2,
            pet_id=None,
            status=ReservationStatus.PENDING # it should be CONFIRMED if amount is 0 according to route, but we test DB level here
        )
        db.session.add(reservation)
        db.session.commit()

        print(f"Reservation created successfully with ID {reservation.id}")

        # 5. Test Seating Logic
        reservation.table_id = table.id
        reservation.status = ReservationStatus.CONFIRMED
        db.session.commit()

        fetched_res = db.session.get(Reservation, reservation.id)
        assert fetched_res.table_id == table.id
        assert fetched_res.status == ReservationStatus.CONFIRMED

        print("Reservation seated successfully")

        # Cleanup
        db.session.delete(reservation)
        db.session.delete(table)
        db.session.delete(schedule)
        db.session.delete(user)
        db.session.delete(place)
        db.session.commit()
        
        print("All tests passed and cleaned up!")

if __name__ == '__main__':
    run_tests()
