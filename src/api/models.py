from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, ForeignKey, Date, Time, UniqueConstraint
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

    # Relationship One - Many
    reservations: Mapped[list["Reservation"]] = relationship("Reservation", back_populates="user")
    # Relationship Many - Many
    favorite_places: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="user")

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


class PostType(Enum):
    NORMATIVE = "normative"
    NEWS = "news"
    EVENT = "event"


class Place(db.Model):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    establishment_type: Mapped[EstablishmentType] = mapped_column(
        SQLEnum(EstablishmentType, name="establishment_type"),
        nullable=False
    )
    pet_rules: Mapped[str | None] = mapped_column(Text, nullable=True)
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id"), nullable=False)

    # Relationship Many - One
    city: Mapped["City"] = relationship("City", back_populates="places")
    # Relationship Many - Many
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="place")

    # Relationship One - Many
    reservations: Mapped[list["Reservation"]] = relationship("Reservation", back_populates="place")

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
        String(120), unique=True, nullable=False
    )
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True
    )

    news: Mapped[list["News"]] = relationship("News", back_populates="admin")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
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


class ReservationStatus(Enum):
    CONFIRMED = "confirmed"
    PENDING = "pending"
    CANCELLED = "cancelled"


class Reservation(db.Model):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"), nullable=False)
    reservation_date: Mapped["Date"] = mapped_column(Date, nullable=False)
    reservation_time: Mapped["Time"] = mapped_column(Time, nullable=False)
    people_count: Mapped[int] = mapped_column(nullable=False)
    pet_count: Mapped[int] = mapped_column(nullable=False)
    zone_preference: Mapped[str] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ReservationStatus] = mapped_column(
        SQLEnum(ReservationStatus, name="reservation_status"),
        nullable=False,
        default=ReservationStatus.PENDING
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="reservations")
    place: Mapped["Place"] = relationship("Place", back_populates="reservations")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "place_id": self.place_id,
            "reservation_date": str(self.reservation_date),
            "reservation_time": str(self.reservation_time),
            "people_count": self.people_count,
            "pet_count": self.pet_count,
            "zone_preference": self.zone_preference,
            "notes": self.notes,
            "status": self.status.value
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
            "user_name": self.user.name if self.user else None,
            "place_id": self.place_id,
            "place_name": self.place.name if self.place else None,
        }


class News(db.Model):
    __tablename__ = "news"

    id: Mapped[int] = mapped_column(primary_key=True)
    id_admin: Mapped[int] = mapped_column(ForeignKey("admin_user.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    post_date: Mapped["Date"] = mapped_column(Date, nullable=False)
    post_type: Mapped[PostType] = mapped_column(
        SQLEnum(PostType, name="post_type"),
        nullable=False
    )

    admin: Mapped["AdminUser"] = relationship("AdminUser", back_populates="news")

    def serialize(self):
        return {
            "id": self.id,
            "id_admin": self.id_admin,
            "admin_name": self.admin.name if self.admin else None,
            "title": self.title,
            "content": self.content,
            "post_date": str(self.post_date),
            "post_type": self.post_type.value
        }