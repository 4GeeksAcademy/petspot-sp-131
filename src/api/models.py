from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, ForeignKey, Date, Time, UniqueConstraint, Float, Numeric
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum
from datetime import datetime
from decimal import Decimal


db = SQLAlchemy()

class EstablishmentType(Enum):
    BAR = "bar"
    RESTAURANT = "restaurant"
    CAFE = "cafe"

class PostType(Enum):
    NORMATIVE = "normative"
    NEWS = "news"
    EVENT = "event"

class PetAnimalType(Enum):
    DOG = "dog"
    CAT = "cat"
    OTHER = "other"

class PetSize(Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    address: Mapped[str] = mapped_column(String(255), nullable=True)

    reservations: Mapped[list["Reservation"]] = relationship("Reservation", back_populates="user", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    chats: Mapped[list["Chat"]] = relationship("Chat", back_populates="user", cascade="all, delete-orphan")
    favorite_places: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    pets: Mapped[list["Pet"]] = relationship("Pet", back_populates="user", cascade="all, delete-orphan")
    
    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "favorite_places": [favorite.place_id for favorite in self.favorite_places],
            "reservations": [reservation.serialize() for reservation in self.reservations],
            "reviews": [review.serialize() for review in self.reviews],
            "pets": [pet.serialize() for pet in self.pets],
            "latitude": self.latitude,
            "longitude": self.longitude,
            "address": self.address
        }

class Place(db.Model):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    establishment_type: Mapped[EstablishmentType] = mapped_column(SQLEnum(EstablishmentType, name="establishment_type"),nullable=False)
    pet_rules: Mapped[str | None] = mapped_column(Text, nullable=True)
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id"), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    requires_reservation_payment: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=False)
    reservation_price: Mapped[ Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    city: Mapped["City"] = relationship("City", back_populates="places")
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="place", cascade="all, delete-orphan")
    chats: Mapped[list["Chat"]] = relationship("Chat", back_populates="place", cascade="all, delete-orphan")
    reservations: Mapped[list["Reservation"]] = relationship("Reservation", back_populates="place", cascade="all, delete-orphan")
    tables: Mapped[list["Table"]] = relationship("Table", back_populates="place", cascade="all, delete-orphan")
    schedules: Mapped[list["PlaceSchedule"]] = relationship("PlaceSchedule", back_populates="place", cascade="all, delete-orphan")
    layouts: Mapped[list["FloorLayout"]] = relationship("FloorLayout", back_populates="place", cascade="all, delete-orphan")

    start_time: Mapped["Time"] = mapped_column(Time, nullable=True)
    end_time: Mapped["Time"] = mapped_column(Time, nullable=True)

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
            "latitude": self.latitude if self.latitude is not None else None,
            "longitude": self.longitude if self.longitude is not None else None,
            "address": self.address if self.address else None,
            "city": self.city.serialize(),
            "favorited_by_users": [favorite.user_id for favorite in self.favorites],
            "image_url": self.image_url,
            "start_time": str(self.start_time) if self.start_time else None,
            "end_time": str(self.end_time) if self.end_time else None,
            "reviews": [review.serialize() for reservation in self.reservations for review in reservation.reviews],
            "requires_reservation_payment": self.requires_reservation_payment,
            "reservation_price": self.reservation_price if self.reservation_price else None
        }

class PlaceSchedule(db.Model):
    __tablename__ = "place_schedules"

    id: Mapped[int] = mapped_column(primary_key=True)
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(nullable=False) # 0=Monday, 6=Sunday
    start_time: Mapped["Time"] = mapped_column(Time, nullable=True)
    end_time: Mapped["Time"] = mapped_column(Time, nullable=True)
    is_closed: Mapped[bool] = mapped_column(Boolean(), default=False)

    place: Mapped["Place"] = relationship("Place", back_populates="schedules")

    def serialize(self):
        return {
            "id": self.id,
            "place_id": self.place_id,
            "day_of_week": self.day_of_week,
            "start_time": str(self.start_time) if self.start_time else None,
            "end_time": str(self.end_time) if self.end_time else None,
            "is_closed": self.is_closed
        }

class FloorLayout(db.Model):
    __tablename__ = "floor_layouts"

    id: Mapped[int] = mapped_column(primary_key=True)
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean(), default=False)

    place: Mapped["Place"] = relationship("Place", back_populates="layouts")
    tables: Mapped[list["Table"]] = relationship("Table", back_populates="layout", cascade="all, delete-orphan")
    elements: Mapped[list["RoomElement"]] = relationship("RoomElement", back_populates="layout", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<FloorLayout {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "place_id": self.place_id,
            "name": self.name,
            "description": self.description,
            "is_default": self.is_default,
        }


class RoomElement(db.Model):
    __tablename__ = "room_elements"

    id: Mapped[int] = mapped_column(primary_key=True)
    layout_id: Mapped[int] = mapped_column(ForeignKey("floor_layouts.id"), nullable=False)
    # wall, stage, bar, window, pillar, text, entrance, exit, divider
    element_type: Mapped[str] = mapped_column(String(30), nullable=False, default="wall")
    pos_x: Mapped[int] = mapped_column(nullable=False, default=0)
    pos_y: Mapped[int] = mapped_column(nullable=False, default=0)
    width: Mapped[int] = mapped_column(nullable=False, default=120)
    height: Mapped[int] = mapped_column(nullable=False, default=20)
    rotation: Mapped[int] = mapped_column(nullable=False, default=0)
    color: Mapped[str | None] = mapped_column(String(30), nullable=True)
    label: Mapped[str | None] = mapped_column(String(100), nullable=True)

    layout: Mapped["FloorLayout"] = relationship("FloorLayout", back_populates="elements")

    def __repr__(self):
        return f'<RoomElement {self.element_type}>'

    def serialize(self):
        return {
            "id": self.id,
            "layout_id": self.layout_id,
            "element_type": self.element_type,
            "pos_x": self.pos_x,
            "pos_y": self.pos_y,
            "width": self.width,
            "height": self.height,
            "rotation": self.rotation,
            "color": self.color,
            "label": self.label,
        }


class Table(db.Model):
    __tablename__ = "tables"

    id: Mapped[int] = mapped_column(primary_key=True)
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"), nullable=False)
    layout_id: Mapped[int | None] = mapped_column(ForeignKey("floor_layouts.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    capacity_people: Mapped[int] = mapped_column(nullable=False)
    capacity_pets: Mapped[int] = mapped_column(nullable=False)
    pos_x: Mapped[int] = mapped_column(nullable=True, default=0)
    pos_y: Mapped[int] = mapped_column(nullable=True, default=0)
    # square, round, rectangle, diamond, oval
    shape: Mapped[str] = mapped_column(String(20), nullable=True, default="square")
    width: Mapped[int] = mapped_column(nullable=True, default=80)
    height: Mapped[int] = mapped_column(nullable=True, default=80)
    rotation: Mapped[int] = mapped_column(nullable=True, default=0)
    is_occupied: Mapped[bool] = mapped_column(nullable=True, default=False)

    place: Mapped["Place"] = relationship("Place", back_populates="tables")
    layout: Mapped["FloorLayout | None"] = relationship("FloorLayout", back_populates="tables")

    def __repr__(self):
        return f'<Table {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "place_id": self.place_id,
            "layout_id": self.layout_id,
            "name": self.name,
            "capacity_people": self.capacity_people,
            "capacity_pets": self.capacity_pets,
            "pos_x": self.pos_x,
            "pos_y": self.pos_y,
            "shape": self.shape,
            "width": self.width if self.width is not None else 80,
            "height": self.height if self.height is not None else 80,
            "rotation": self.rotation if self.rotation is not None else 0,
            "is_occupied": self.is_occupied if self.is_occupied is not None else False,
        }

class City(db.Model):
    __tablename__ = "cities"

    id: Mapped[int] = mapped_column(primary_key=True)
    city: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    address: Mapped[str] = mapped_column(String(255), nullable=True)

    places: Mapped[list["Place"]] = relationship("Place", back_populates="city", cascade="all, delete-orphan")

    def __repr__(self):
        return self.city

    def serialize(self):
        return {
            "id": self.id,
            "city": self.city,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "address": self.address
        }
    

class AdminUser(db.Model):
    __tablename__ = "admin_user"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False
    )
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True
    )

    news: Mapped[list["News"]] = relationship("News", back_populates="admin", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
        }


class Review(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    reservation_id: Mapped[int] = mapped_column(ForeignKey("reservations.id"), nullable=False)
    rating: Mapped[int] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    content: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[str] = mapped_column(String(50), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)

    user: Mapped["User"] = relationship("User", back_populates="reviews")
    reservation: Mapped["Reservation"] = relationship(
        "Reservation", back_populates="reviews")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.name,
            "reservation_id": self.reservation_id,
            "place_id": self.reservation.place_id,
            "place_name": self.reservation.place.name,
            "rating": self.rating,
            "title": self.title,
            "content": self.content,
            "created_at": self.created_at,
            "is_active": self.is_active
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
    pet_id: Mapped[int | None] = mapped_column(ForeignKey("pets.id"), nullable=True)
    table_id: Mapped[int | None] = mapped_column(ForeignKey("tables.id"), nullable=True)
    zone_preference: Mapped[str] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ReservationStatus] = mapped_column(
        SQLEnum(ReservationStatus, name="reservation_status"),
        nullable=False,
        default=ReservationStatus.PENDING
    )
    paypal_order_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    paypal_capture_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payment_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    refunded_at: Mapped[datetime | None] = mapped_column(db.DateTime, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="reservations")
    place: Mapped["Place"] = relationship("Place", back_populates="reservations")
    pet: Mapped["Pet"] = relationship("Pet", foreign_keys=[pet_id])
    table: Mapped["Table"] = relationship("Table", foreign_keys=[table_id])
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="reservation", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.name,
            "place_id": self.place_id,
            "place_name": self.place.name,
            "reservation_date": str(self.reservation_date),
            "reservation_time": str(self.reservation_time),
            "people_count": self.people_count,
            "pet_id": self.pet_id,
            "pet_name": self.pet.name if self.pet else None,
            "table_id": self.table_id,
            "table_name": self.table.name if self.table else None,
            "zone_preference": self.zone_preference,
            "notes": self.notes,
            "status": self.status.value,
            "paypal_order_id": self.paypal_order_id,
            "paypal_capture_id": self.paypal_capture_id,
            "payment_status": self.payment_status,
            "refunded_at": self.refunded_at.isoformat() if self.refunded_at else None
        }
    

class Favorite(db.Model):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "place_id", name="uq_favorite_user_place"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"), nullable=False)

    user: Mapped["User"] = relationship(
        "User", back_populates="favorite_places")
    place: Mapped["Place"] = relationship("Place", back_populates="favorites")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.name,
            "place_id": self.place_id,
            "place_name": self.place.name
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
            "admin_name": self.admin.name,
            "title": self.title,
            "content": self.content,
            "post_date": str(self.post_date),
            "post_type": self.post_type.value
        }

class Chat(db.Model):
    __tablename__ = "chat"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    sender: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow)
    is_read: Mapped[bool] = mapped_column(Boolean(), default=False)

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
            "sender": self.sender,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_read": self.is_read
        }


class Race(db.Model):
    __tablename__ = "races"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    animal_type: Mapped[str] = mapped_column(String(120), nullable=False)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    pets: Mapped[list["Pet"]] = relationship("Pet", back_populates="race", cascade="all, delete-orphan")

    def __repr__(self):
        return self.name

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "animal_type": self.animal_type,
            "url": self.url
        }


class Pet(db.Model):
    __tablename__ = "pets"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    animal_type: Mapped[PetAnimalType] = mapped_column(
        SQLEnum(
            PetAnimalType,
            name="pet_animal_type",
            values_callable=lambda enum_cls: [member.value for member in enum_cls]
        ),
        nullable=False
    )
    other_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    race_id: Mapped[int | None] = mapped_column(ForeignKey("races.id"), nullable=True)
    size: Mapped[PetSize] = mapped_column(
        SQLEnum(
            PetSize,
            name="pet_size",
            values_callable=lambda enum_cls: [member.value for member in enum_cls]
        ),
        nullable=False
    )
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="pets")
    race: Mapped["Race"] = relationship("Race", back_populates="pets")

    def __repr__(self):
        return self.name


    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_id": self.user_id,
            "animal_type": self.animal_type.value if self.animal_type else "other",
            "other_type": self.other_type,
            "race_id": self.race_id,
            "race_name": self.race.name if self.race else None,
            "race_url": self.race.url if self.race else None,
            "size": self.size.value if self.size else "medium",
            "url": self.url
        }
