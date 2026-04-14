from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from enum import Enum

db = SQLAlchemy()

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)


    def serialize(self):
        return {
            "id": self.id,
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


    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
            "name": self.name,
            "establishment_type": self.establishment_type.value,
            "pet_rules": self.pet_rules,
            # do not serialize the password, its a security breach
        }
    