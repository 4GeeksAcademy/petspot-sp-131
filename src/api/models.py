from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, ForeignKey, UniqueConstraint
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    # Relationship Many - Many
    favorite_places: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="user")
    chats: Mapped[list["Chat"]] = relationship("Chat", back_populates="user")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "favorite_places": [favorite.place_id for favorite in self.favorite_places],
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
    # Relationship Many - Many
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates = "place")
    chats: Mapped[list["Chat"]] = relationship("Chat", back_populates="place")

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
            "city": self.city.serialize(),
            "favorited_by_users": [favorite.user_id for favorite in self.favorites]
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

class Favorite(db.Model):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "place_id", name="uq_favorite_user_place"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"), nullable=False)

    # Relationship Many to One
    user: Mapped["User"] = relationship("User", back_populates="favorite_places")
    place: Mapped["Place"] = relationship("Place", back_populates="favorites")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "place_id": self.place_id
        }


class Chat(db.Model):
    __tablename__ = "chat"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    sender: Mapped[str] = mapped_column(String(20), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="chats")
    place: Mapped["Place"] = relationship("Place", back_populates="chats")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.name,
            "place_id": self.place_id,
            "place_name": self.place.name,
            "message": self.message,
            "sender": self.sender
    }

 