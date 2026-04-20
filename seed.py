import os
import sys
from datetime import datetime

# adding src to path
sys.path.insert(0, os.path.abspath('src'))
from app import app
from api.models import db, AdminUser, User, City, Place, EstablishmentType, Reservation, ReservationStatus

with app.app_context():
    db.create_all()
    if not AdminUser.query.first():
        user = AdminUser(name='Jane Doe', email='admin@petspot.com', password='password123', is_active=True)
        db.session.add(user)
        
    if not User.query.first():
        standard_user = User(name="Standard User", email="user@petspot.com", password="password123", is_active=True)
        db.session.add(standard_user)
        db.session.commit()
    else:
        standard_user = User.query.first()

    if not City.query.first():
        city = City(city="Madrid")
        db.session.add(city)
        db.session.commit()
    else:
        city = City.query.first()
        
    if not Place.query.first():
        place = Place(email="place@petspot.com", password="password123", is_active=True, name="El Perro Verde", establishment_type=EstablishmentType.BAR, city_id=city.id)
        db.session.add(place)
        db.session.commit()
    else:
        place = Place.query.first()
        
    if not Reservation.query.first():
        reservation = Reservation(
            user_id=standard_user.id,
            place_id=place.id,
            reservation_date=datetime.now().date(),
            reservation_time=datetime.now().time(),
            people_count=4,
            pet_count=1,
            zone_preference="terraza",
            notes="Mesa sombra por id 60",
            status=ReservationStatus.CONFIRMED
        )
        db.session.add(reservation)
        db.session.commit()

    print("Data seeded successfully!")
