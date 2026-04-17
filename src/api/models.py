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

    # Relationship One - Many
    locations: Mapped[list["Location"]] = relationship("Location", back_populates="place", cascade="all, delete-orphan")

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
            "locations": [location.serialize() for location in self.locations],
            # do not serialize the password, its a security breach
        }

class Location(db.Model):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True)
    city: Mapped[str] = mapped_column(String(120), nullable=False)

    # ForeignKeys
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"))

    # Relationship Many - One
    place: Mapped["Place"] = relationship("Place", back_populates="locations")

    def serialize(self):
        return {
            "city": self.city
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
