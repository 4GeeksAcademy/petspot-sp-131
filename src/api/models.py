from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, ForeignKey
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            # do not serialize the password, its a security breach
        }

class EstablishmentType(Enum):
    BAR = "bar"
    RESTAURANT = "restaurant"
    CAFE = "cafe"

class Place(db.Model):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    establishment_type: Mapped[EstablishmentType] = mapped_column(
        SQLEnum(EstablishmentType, name="establishment_type"),
        nullable=False)
    pet_rules: Mapped[str | None] = mapped_column(Text, nullable=True)
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id"), nullable=False)

    # Relationship Many - One
    city: Mapped["City"] = relationship("City", back_populates="places")

    def __str__(self):
        return self.name

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
            "name": self.name,
            "establishment_type": self.establishment_type.value,
            "pet_rules": self.pet_rules,
            "city": self.city.serialize()
            # do not serialize the password, its a security breach
        }

class AdminUser(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            # do not serialize the password, its a security breach
        }
    

class Review(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(nullable=False)
    reservation_id: Mapped[int] = mapped_column(nullable=False)
    rating: Mapped[int] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    content: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[str] = mapped_column(String(50), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "reservation_id": self.reservation_id,
            "rating": self.rating,
            "title": self.title,
            "content": self.content,
            "created_at": self.created_at,
            "is_active": self.is_active
        }

class City(db.Model):
    __tablename__ = "cities"

    id: Mapped[int] = mapped_column(primary_key=True)
    city: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)

    # Relationship One - Many
    places: Mapped[list["Place"]] = relationship("Place", back_populates="city")

    def __repr__(self):
        return self.city

    def serialize(self):
        return {
            "id": self.id,
            "city": self.city
        }

class Reservation(db.Model):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    place_id: Mapped[int] = mapped_column(
        ForeignKey("places.id"), nullable=False)
    reservation_date: Mapped[str] = mapped_column(String(10), nullable=False)
    reservation_time: Mapped[str] = mapped_column(String(5), nullable=False)
    people_count: Mapped[int] = mapped_column(nullable=False)
    pet_count: Mapped[int] = mapped_column(default=0, nullable=False)
    zone_preference: Mapped[str | None] = mapped_column(
        String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ReservationStatus] = mapped_column(
        SQLEnum(ReservationStatus, name="reservation_status"),
        default=ReservationStatus.PENDING,
        nullable=False
    )
