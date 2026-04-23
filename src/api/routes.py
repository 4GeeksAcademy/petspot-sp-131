"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Place, EstablishmentType, AdminUser, Review, City, Chat, Reservation, ReservationStatus, Favorite, News, PostType
from datetime import datetime
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/admin/login', methods=['POST'])
def admin_login():
    body = request.get_json(silent=True)

    if not body:
        return jsonify({"msg": "Missing request body"}), 400

    email = body.get("email", "").strip()
    password = body.get("password", "")

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    admin = AdminUser.query.filter_by(email=email).first()
    if not admin or not check_password_hash(admin.password, password):
        return jsonify({"msg": "Invalid credentials"}), 401

    return jsonify({
        "msg": "Login successful",
        "token": "Admin token",
        "admin": {
            "id": admin.id,
            "name": admin.name,
            "email": admin.email
        }
    }), 200


@api.route('/hello', methods=['GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200


@api.route('/users', methods=['GET'])
def get_users():
    users = db.session.execute(db.select(User)).scalars().all()
    return jsonify([user.serialize() for user in users]), 200


@api.route('/users', methods=['POST'])
def create_user():
    body = request.get_json()

    name = body.get("name", None)
    email = body.get("email", None)
    password = body.get("password", None)

    if not name or not email or not password:
        return jsonify({"msg": "All fields are required"}), 400

    existing_user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if existing_user:
        return jsonify({"msg": "User already exists"}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(
        name=name,
        email=email,
        password=hashed_password,
        is_active=True
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.serialize()), 201


@api.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = db.session.execute(
        db.select(User).filter_by(id=user_id)
    ).scalar_one_or_none()

    if user is None:
        return jsonify({"msg": "User not found"}), 404

    return jsonify(user.serialize()), 200


@api.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    body = request.get_json()

    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if "email" not in body or not body["email"]:
        return jsonify({"msg": "El email es obligatorio"}), 400

    existing_user = db.session.execute(
        db.select(User).filter_by(email=body["email"])
    ).scalar_one_or_none()

    if existing_user and existing_user.id != user.id:
        return jsonify({"msg": "El email ya está en uso"}), 409

    user.name = body.get("name", user.name)
    user.email = body.get("email", user.email)
    user.password = body.get("password", user.password)
    user.is_active = body.get("is_active", user.is_active)

    db.session.commit()

    return jsonify(user.serialize()), 200


@api.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = db.session.get(User, user_id)

    if user is None:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"msg": "Usuario eliminado correctamente"}), 200


@api.route("/places", methods=["GET"])
def get_places():
    places = db.session.execute(
        select(Place).order_by(Place.id.desc())
    ).scalars().all()
    response = [place.serialize() for place in places]
    return jsonify(response), 200


@api.route("/places", methods=["POST"])
def add_place():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    establishment_type = data.get("establishment_type")
    pet_rules = data.get("pet_rules")
    city_id = data.get("city_id")

    if not all([x for x in [email, password, name, establishment_type, city_id]]):
        return jsonify(response="Email, password, name, establishment type, and city_id are required"), 400

    if not all([isinstance(x, str) for x in [email, password, name, establishment_type]]):
        return jsonify(response="Email, password, name, and establishment_type must be strings"), 400

    try:
        city_id = int(city_id)
    except (TypeError, ValueError):
        return jsonify(response="city_id must be a valid integer"), 400

    city = db.session.get(City, city_id)
    if city is None:
        return jsonify(response="City not found"), 404

    try:
        establishment_type = establishment_type.strip()
        establishment_type = EstablishmentType(establishment_type)
    except ValueError:
        return jsonify(response="Invalid establishment type"), 400

    email = email.strip()
    password = password.strip()
    name = name.strip()

    if pet_rules is not None:
        pet_rules = str(pet_rules).strip()
        if len(pet_rules) > 250:
            return jsonify(response="pet_rules cannot exceed 250 characters"), 400

    if not all([x for x in [email, password, name]]):
        return jsonify(response="Email, password, city, and name cannot be empty"), 400

    email_exists = db.session.execute(
        select(Place).where(Place.email == email)
    ).scalar_one_or_none()
    if email_exists is not None:
        return jsonify(response="Unable to create an account with the provided information"), 400

    hashed_password = generate_password_hash(password)
    place = Place(
        name=name,
        email=email,
        password=hashed_password,
        city=city,
        establishment_type=establishment_type,
        pet_rules=pet_rules or None
    )
    db.session.add(place)
    db.session.commit()

    return jsonify(place.serialize()), 201


@api.route("/places/<int:place_id>", methods=["DELETE"])
def delete_place(place_id):
    place_exists = db.get_or_404(Place, place_id)
    db.session.delete(place_exists)
    db.session.commit()
    return jsonify(response="Place deleted"), 200


@api.route("/places/<int:place_id>", methods=["PUT"])
def update_place(place_id):
    place = db.get_or_404(Place, place_id)
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    establishment_type = data.get("establishment_type")
    pet_rules_provided = "pet_rules" in data
    pet_rules = data.get("pet_rules")
    city_id = data.get("city_id")

    if email is not None:
        if not isinstance(email, str):
            return jsonify(response="Email must be a string"), 400
        email = email.strip()
        if not email:
            return jsonify(response="Email cannot be empty"), 400

        email_exists = db.session.execute(
            select(Place).where(Place.email == email, Place.id != place_id)
        ).scalar_one_or_none()
        if email_exists is not None:
            return jsonify(response="Unable to update account with the provided information"), 400

        place.email = email

    if password is not None:
        if not isinstance(password, str):
            return jsonify(response="Password must be a string"), 400
        password = password.strip()
        if not password:
            return jsonify(response="Password cannot be empty"), 400
        place.password = generate_password_hash(password)

    if name is not None:
        if not isinstance(name, str):
            return jsonify(response="Name must be a string"), 400
        name = name.strip()
        if not name:
            return jsonify(response="Name cannot be empty"), 400
        place.name = name

    if establishment_type is not None:
        if not isinstance(establishment_type, str):
            return jsonify(response="Establishment type must be a string"), 400
        try:
            place.establishment_type = EstablishmentType(
                establishment_type.strip())
        except ValueError:
            return jsonify(response="Invalid establishment type"), 400

    if pet_rules_provided:
        if pet_rules is None:
            place.pet_rules = None
        else:
            pet_rules = str(pet_rules).strip()
            if len(pet_rules) > 250:
                return jsonify(response="pet_rules cannot exceed 250 characters"), 400
            place.pet_rules = pet_rules or None

    if city_id is not None:
        try:
            city_id = int(city_id)
        except (TypeError, ValueError):
            return jsonify(response="city_id must be a valid integer"), 400

        city = db.session.get(City, city_id)
        if city is None:
            return jsonify(response="City not found"), 404
        place.city = city

    db.session.commit()

    return jsonify(place.serialize()), 200


@api.route('/admin', methods=['GET'])
def get_admins():
    admins = AdminUser.query.all()
    return jsonify([admin.serialize() for admin in admins]), 200


@api.route('/admin/<int:id>', methods=['GET'])
def get_admin(id):
    admin = AdminUser.query.get(id)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404
    return jsonify(admin.serialize()), 200


@api.route('/admin', methods=['POST'])
def create_admin():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"error": "Missing name, email or password"}), 400

    existing_admin = AdminUser.query.filter_by(email=email).first()
    if existing_admin:
        return jsonify({"error": "Admin with this email already exists"}), 409

    hashed_password = generate_password_hash(password)

    new_admin = AdminUser(
        name=name,
        email=email,
        password=hashed_password
    )

    db.session.add(new_admin)
    db.session.commit()

    return jsonify(new_admin.serialize()), 201


@api.route('/admin/<int:id>', methods=['PUT'])
def update_admin(id):
    admin = AdminUser.query.get(id)

    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    if 'name' in data:
        admin.name = data['name']

    if 'email' in data:
        existing_admin = AdminUser.query.filter(
            AdminUser.email == data['email'],
            AdminUser.id != id
        ).first()

        if existing_admin:
            return jsonify({"error": "Email already in use"}), 409

        admin.email = data['email']

    if 'password' in data:
        admin.password = generate_password_hash(data['password'])

    db.session.commit()
    return jsonify(admin.serialize()), 200


@api.route('/admin/<int:id>', methods=['DELETE'])
def delete_admin(id):
    admin = AdminUser.query.get(id)

    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    db.session.delete(admin)
    db.session.commit()

    return jsonify({"message": "Admin deleted"}), 200


@api.route('/reviews', methods=['GET'])
def get_reviews():
    reviews = db.session.execute(db.select(Review)).scalars().all()
    return jsonify([review.serialize() for review in reviews]), 200


@api.route('/reviews/<int:review_id>', methods=['GET'])
def get_review(review_id):
    review = db.session.execute(
        db.select(Review).filter_by(id=review_id)
    ).scalar_one_or_none()

    if review is None:
        return jsonify({"msg": "Review no encontrada"}), 404

    return jsonify(review.serialize()), 200


@api.route('/reviews', methods=['POST'])
def create_review():
    body = request.get_json()

    required_fields = ["user_id", "reservation_id",
                       "rating", "title", "content", "created_at"]

    for field in required_fields:
        if field not in body or body[field] == "":
            return jsonify({"msg": f"El campo {field} es obligatorio"}), 400

    review = Review(
        user_id=body["user_id"],
        reservation_id=body["reservation_id"],
        rating=body["rating"],
        title=body["title"],
        content=body["content"],
        created_at=body["created_at"],
        is_active=body.get("is_active", True)
    )

    db.session.add(review)
    db.session.commit()

    return jsonify(review.serialize()), 201


@api.route('/reviews/<int:review_id>', methods=['PUT'])
def update_review(review_id):
    review = db.session.execute(
        db.select(Review).filter_by(id=review_id)
    ).scalar_one_or_none()

    if review is None:
        return jsonify({"msg": "Review no encontrada"}), 404

    body = request.get_json()

    review.user_id = body.get("user_id", review.user_id)
    review.reservation_id = body.get("reservation_id", review.reservation_id)
    review.rating = body.get("rating", review.rating)
    review.title = body.get("title", review.title)
    review.content = body.get("content", review.content)
    review.created_at = body.get("created_at", review.created_at)
    review.is_active = body.get("is_active", review.is_active)

    db.session.commit()

    return jsonify(review.serialize()), 200


@api.route('/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    review = db.session.execute(
        db.select(Review).filter_by(id=review_id)
    ).scalar_one_or_none()

    if review is None:
        return jsonify({"msg": "Review no encontrada"}), 404

    db.session.delete(review)
    db.session.commit()

    return jsonify({"msg": "Review eliminada correctamente"}), 200


@api.route('/cities', methods=['GET'])
def get_cities():
    cities = db.session.execute(
        select(City).order_by(City.city.asc())
    ).scalars().all()
    return jsonify([city.serialize() for city in cities]), 200


@api.route('/cities', methods=['POST'])
def add_city():
    data = request.get_json(silent=True) or {}
    city = data.get("city")

    if city is None:
        return jsonify(response="City is required"), 400

    city = city.strip().title()
    city_exists = db.session.execute(
        select(City).where(City.city == city)
    ).scalar_one_or_none()
    if city_exists:
        return jsonify(response="City already exists"), 400

    try:
        add_city = City(city=city)
        db.session.add(add_city)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(response="City already exists"), 400

    return jsonify(add_city.serialize()), 200


@api.route('/cities/<int:city_id>', methods=['DELETE'])
def delete_city(city_id):
    city_exists = db.get_or_404(City, city_id)
    db.session.delete(city_exists)
    db.session.commit()
    return jsonify(response="City deleted"), 200


@api.route('/cities/<int:city_id>', methods=['PUT'])
def update_city(city_id):
    city_exists = db.get_or_404(City, city_id)
    data = request.get_json(silent=True) or {}
    city = data.get("city")
    if city is None:
        return jsonify(response="City is required"), 400

    city = city.strip().title()
    city_with_existing_name = db.session.execute(
        select(City).where(City.city == city, City.id != city_id)
    ).scalar_one_or_none()
    if city_with_existing_name:
        return jsonify(response="City cannot be updated to an existing city name"), 400

    try:
        city_exists.city = city
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(response="City cannot be updated to an existing city name"), 400

    return jsonify(city_exists.serialize()), 200

# LOGIN & SIGNUP #
# USER #


@api.route("/login/user", methods=["POST"])
def login_user():
    email = request.json.get("email", None)
    password = request.json.get("password", None)

    user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if user is None:
        return jsonify({"msg": "Bad email or password"}), 401

    if not check_password_hash(user.password, password):
        return jsonify({"msg": "Bad email or password"}), 401

    access_token = create_access_token(identity=email)
    return jsonify(access_token=access_token), 200


@api.route("/signup/user", methods=["POST"])
def signup_user():
    body = request.get_json()

    name = body.get("name", None)
    email = body.get("email", None)
    password = body.get("password", None)

    if not name or not email or not password:
        return jsonify({"msg": "All fields are required"}), 400

    user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if user:
        return jsonify({"msg": "Ya se encuentra un usuario con ese email"}), 409

    new_user = User(
        name=name,
        email=email,
        password=password,
        is_active=True
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado exitosamente"}), 201


@api.route('/news', methods=['GET'])
def get_news():
    news_list = db.session.execute(
        select(News).order_by(News.post_date.desc(), News.id.desc())
    ).scalars().all()
    return jsonify([news.serialize() for news in news_list]), 200


@api.route('/news/<int:news_id>', methods=['GET'])
def get_single_news(news_id):
    news = db.session.get(News, news_id)

    if news is None:
        return jsonify({"msg": "News not found"}), 404

    return jsonify(news.serialize()), 200


@api.route('/news', methods=['POST'])
def create_news():
    data = request.get_json(silent=True) or {}

    id_admin = data.get("id_admin")
    title = data.get("title")
    content = data.get("content")
    post_date = data.get("post_date")
    post_type = data.get("post_type")

    if not all([id_admin, title, content, post_date, post_type]):
        return jsonify({"msg": "id_admin, title, content, post_date and post_type are required"}), 400

    admin = db.session.get(AdminUser, id_admin)
    if admin is None:
        return jsonify({"msg": "Admin not found"}), 404

    try:
        parsed_date = datetime.strptime(post_date, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"msg": "post_date must be in YYYY-MM-DD format"}), 400

    try:
        parsed_type = PostType(post_type)
    except ValueError:
        return jsonify({"msg": "Invalid post_type"}), 400

    new_news = News(
        id_admin=id_admin,
        title=title.strip(),
        content=content.strip(),
        post_date=parsed_date,
        post_type=parsed_type
    )

    db.session.add(new_news)
    db.session.commit()

    return jsonify(new_news.serialize()), 201


@api.route('/news/<int:news_id>', methods=['PUT'])
def update_news(news_id):
    news = db.session.get(News, news_id)

    if news is None:
        return jsonify({"msg": "News not found"}), 404

    data = request.get_json(silent=True) or {}

    if 'id_admin' in data:
        admin = db.session.get(AdminUser, data['id_admin'])
        if admin is None:
            return jsonify({"msg": "Admin not found"}), 404
        news.id_admin = data['id_admin']

    if 'title' in data:
        title = str(data['title']).strip()
        if not title:
            return jsonify({"msg": "Title cannot be empty"}), 400
        news.title = title

    if 'content' in data:
        content = str(data['content']).strip()
        if not content:
            return jsonify({"msg": "Content cannot be empty"}), 400
        news.content = content

    if 'post_date' in data:
        try:
            news.post_date = datetime.strptime(
                data['post_date'], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"msg": "post_date must be in YYYY-MM-DD format"}), 400

    if 'post_type' in data:
        try:
            news.post_type = PostType(data['post_type'])
        except ValueError:
            return jsonify({"msg": "Invalid post_type"}), 400

    db.session.commit()
    return jsonify(news.serialize()), 200


@api.route('/news/<int:news_id>', methods=['DELETE'])
def delete_news(news_id):
    news = db.session.get(News, news_id)

    if news is None:
        return jsonify({"msg": "News not found"}), 404

    db.session.delete(news)
    db.session.commit()

    return jsonify({"msg": "News deleted successfully"}), 200


@api.route('/chat', methods=['GET'])
def get_chats():
    chats = db.session.execute(select(Chat)).scalars().all()
    return jsonify([chat.serialize() for chat in chats]), 200


@api.route('/chat/<int:chat_id>', methods=['GET'])
def get_chat(chat_id):
    chat = db.session.get(Chat, chat_id)
    if chat is None:
        return jsonify({"msg": "Chat not found"}), 404
    return jsonify(chat.serialize()), 200


@api.route('/chat', methods=['POST'])
def create_chat():
    data = request.json

    new_chat = Chat(
        user_id=data.get("user_id"),
        place_id=data.get("place_id"),
        message=data.get("message"),
        sender=data.get("sender")
    )

    db.session.add(new_chat)
    db.session.commit()

    return jsonify(new_chat.serialize()), 201


@api.route('/chat/<int:chat_id>', methods=['PUT'])
def update_chat(chat_id):
    chat = db.session.get(Chat, chat_id)
    if chat is None:
        return jsonify({"msg": "Chat not found"}), 404

    data = request.json

    chat.message = data.get("message", chat.message)
    chat.sender = data.get("sender", chat.sender)

    db.session.commit()

    return jsonify(chat.serialize()), 200


@api.route('/chat/<int:chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    chat = db.session.get(Chat, chat_id)
    if chat is None:
        return jsonify({"msg": "Chat not found"}), 404

    db.session.delete(chat)
    db.session.commit()

    return jsonify({"msg": "Chat deleted"}), 200


@api.route('/reservations', methods=['GET'])
def get_reservations():
    reservations = db.session.execute(
        select(Reservation)
        .options(joinedload(Reservation.user), joinedload(Reservation.place))
        .order_by(Reservation.id.desc())
    ).scalars().all() or None
    if not reservations:
        return jsonify(response="No reservations found"), 404
    return jsonify([res.serialize() for res in reservations]), 200


@api.route('/reservations/<int:id>', methods=['GET'])
def get_reservation(id):
    reservation = db.session.get(Reservation, id)
    if not reservation:
        return jsonify({"msg": "Reservation not found"}), 404
    return jsonify(reservation.serialize()), 200


@api.route('/reservations', methods=['POST'])
def add_reservation():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    place_id = data.get("place_id")
    reservation_date_str = data.get("reservation_date")
    reservation_time_str = data.get("reservation_time")
    people_count = data.get("people_count")
    pet_count = data.get("pet_count")
    zone_preference = data.get("zone_preference")
    notes = data.get("notes")

    if not all([
        user_id,
        place_id,
        reservation_date_str,
        reservation_time_str,
        people_count is not None,
        pet_count is not None
    ]):
        return jsonify(response="Missing required fields"), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify(response="User not found"), 404

    place = db.session.get(Place, place_id)
    if not place:
        return jsonify(response="Place not found"), 404

    try:
        res_date = datetime.strptime(reservation_date_str, '%Y-%m-%d').date()
        res_time = datetime.strptime(reservation_time_str, '%H:%M').time()
    except ValueError:
        return jsonify(response="Invalid date or time format. Use YYYY-MM-DD and HH:MM"), 400

    new_reservation = Reservation(
        user_id=user_id,
        place_id=place_id,
        reservation_date=res_date,
        reservation_time=res_time,
        people_count=int(people_count),
        pet_count=int(pet_count),
        zone_preference=zone_preference,
        notes=notes,
        status=ReservationStatus.PENDING
    )

    db.session.add(new_reservation)
    db.session.commit()

    return jsonify(new_reservation.serialize()), 201


@api.route('/reservations/<int:id>', methods=['PUT'])
def update_reservation(id):
    reservation = db.session.get(Reservation, id)
    if not reservation:
        return jsonify({"msg": "Reservation not found"}), 404

    data = request.get_json(silent=True) or {}

    reservation_date_str = data.get("reservation_date")
    reservation_time_str = data.get("reservation_time")
    if reservation_date_str:
        try:
            reservation.reservation_date = datetime.strptime(
                reservation_date_str, '%Y-%m-%d'
            ).date()
        except ValueError:
            return jsonify(response="Invalid date format"), 400
    if reservation_time_str:
        try:
            reservation.reservation_time = datetime.strptime(
                reservation_time_str[:5], '%H:%M'
            ).time()
        except ValueError:
            return jsonify(response="Invalid time format"), 400

    if 'user_id' in data:
        reservation.user_id = int(data['user_id'])
    if 'place_id' in data:
        reservation.place_id = int(data['place_id'])
    if 'people_count' in data:
        reservation.people_count = int(data['people_count'])
    if 'pet_count' in data:
        reservation.pet_count = int(data['pet_count'])
    if 'zone_preference' in data:
        reservation.zone_preference = data['zone_preference']
    if 'notes' in data:
        reservation.notes = data['notes']
    if 'status' in data:
        try:
            reservation.status = ReservationStatus(data['status'])
        except ValueError:
            return jsonify(response="Invalid status"), 400

    db.session.commit()
    return jsonify(reservation.serialize()), 200


@api.route('/reservations/<int:id>', methods=['DELETE'])
def delete_reservation(id):
    reservation = db.session.get(Reservation, id)
    if not reservation:
        return jsonify({"msg": "Reservation not found"}), 404

    db.session.delete(reservation)
    db.session.commit()

    return jsonify({"msg": "Reservation deleted"}), 200


@api.route('/users/<int:user_id>/reservations', methods=['GET'])
def get_user_reservations(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify(response="User not found"), 404
    reservations = db.session.execute(
        select(Reservation).where(Reservation.user_id == user_id)
    ).scalars().all()
    if not reservations:
        return jsonify(response="No reservations found for this user"), 404
    return jsonify([res.serialize() for res in reservations]), 200


@api.route('/places/<int:place_id>/reservations', methods=['GET'])
def get_place_reservations(place_id):
    place = db.session.get(Place, place_id)
    if not place:
        return jsonify(response="Place not found"), 404
    reservations = db.session.execute(
        select(Reservation).where(Reservation.place_id == place_id)
    ).scalars().all()
    if not reservations:
        return jsonify(response="No reservations found for this place"), 404
    return jsonify([res.serialize() for res in reservations]), 200


@api.route('/favorites', methods=['GET'])
def get_favorites():
    favorites = db.session.execute(select(Favorite)).scalars().all()
    return jsonify([favorite.serialize() for favorite in favorites]), 200


@api.route('/favorites', methods=['POST'])
def add_favorite():
    data = request.get_json(silent=True) or {}
    user = data.get("user")
    place = data.get("place")

    if any([x is None for x in [user, place]]):
        return jsonify(response="User and place are required"), 400

    if not all([isinstance(x, str) for x in [user, place]]):
        return jsonify(response="User and place need to be strings"), 400

    user = user.strip()
    place = place.strip()

    if any([len(x) == 0 for x in [user, place]]):
        return jsonify(response="User or place cannot be empty"), 400

    user_exists = db.session.execute(
        select(User).where(User.name == user)
    ).scalar_one_or_none()
    if user_exists is None:
        return jsonify(response="User not found"), 404

    place_exists = db.session.execute(
        select(Place).where(Place.name == place)
    ).scalar_one_or_none()
    if place_exists is None:
        return jsonify(response="Place not found"), 404

    new_favorite = Favorite(user_id=user_exists.id, place_id=place_exists.id)
    db.session.add(new_favorite)
    db.session.commit()

    return jsonify(new_favorite.serialize()), 200


@api.route('/favorites/<int:favorite_id>', methods=["DELETE"])
def delete_favorite(favorite_id):
    favorite_exists = db.get_or_404(Favorite, favorite_id)
    db.session.delete(favorite_exists)
    db.session.commit()
    return jsonify(response="Favorite deleted"), 200


@api.route('/favorites/<int:favorite_id>', methods=["PUT"])
def update_favorite(favorite_id):
    favorite_exists = db.session.execute(
        select(Favorite).where(Favorite.id == favorite_id)
    ).scalar_one_or_none()
    if favorite_exists is None:
        return jsonify(response="Favorite not found"), 404

    data = request.get_json(silent=True) or {}
    place = data.get("place")
    if place is None:
        return jsonify(response="Place is required"), 400

    if not isinstance(place, str):
        return jsonify(response="Place must be a string"), 400

    place = place.strip()

    if len(place) == 0:
        return jsonify(response="Place cannot be empty"), 400

    place_exists = db.session.execute(
        select(Place).where(Place.name == place)
    ).scalar_one_or_none()
    if place_exists is None:
        return jsonify(response="Place not found"), 404

    favorite_relation_exists = db.session.execute(
        select(Favorite).where(
            Favorite.user_id == favorite_exists.user_id,
            Favorite.place_id == place_exists.id
        )
    ).scalar_one_or_none()
    if favorite_relation_exists is not None:
        return jsonify(response="Favorite relation already exists"), 400

    favorite_exists.place_id = place_exists.id
    db.session.commit()
    return jsonify(favorite_exists.serialize()), 200


@api.route("/places/login", methods=["POST"])
def login_place():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if any([x is None for x in [email, password]]):
        return jsonify(response="Email and Password are required"), 400

    if not all([isinstance(x, str) for x in [email, password]]):
        return jsonify(response="Email and Password must be strings"), 400

    email = email.strip()
    password = password.strip()

    if any([len(x) == 0 for x in [email, password]]):
        return jsonify(response="Email or password cannot be empty"), 400

    place_exists = db.session.execute(
        select(Place).where(Place.email == email)
    ).scalar_one_or_none()
    if place_exists is None:
        return jsonify(response="Incorrect email or password"), 400

    place_password = place_exists.password
    if not check_password_hash(place_password, password):
        return jsonify(response="Incorrect email or password"), 400

    access_token = create_access_token(identity=str(place_exists.id))

    return jsonify(access_token_place=access_token), 200


@api.route("/places/private", methods=["GET"])
@jwt_required()
def private_place():
    place_id = int(get_jwt_identity())
    place_exists = db.session.execute(
        select(Place).where(Place.id == place_id)
    ).scalar_one_or_none()
    if place_exists is None:
        return jsonify(response="Place not found"), 404
    return jsonify(place_exists.serialize()), 200


@api.route('/places/private', methods=['PUT'])
@jwt_required()
def update_private_place():
    place_id = int(get_jwt_identity())
    place = db.session.get(Place, place_id)
    if not place:
        return jsonify(response="Place not found"), 404
        
    data = request.get_json(silent=True) or {}
    
    if 'name' in data:
        name = str(data['name']).strip()
        if not name:
             return jsonify(response="Name cannot be empty"), 400
        place.name = name
        
    if 'establishment_type' in data:
        try:
             place.establishment_type = EstablishmentType(data['establishment_type'].strip())
        except ValueError:
             return jsonify(response="Invalid establishment type"), 400
             
    if 'pet_rules' in data:
        if data['pet_rules'] is None:
             place.pet_rules = None
        else:
             rules = str(data['pet_rules']).strip()
             if len(rules) > 250:
                 return jsonify(response="pet_rules cannot exceed 250 characters"), 400
             place.pet_rules = rules or None
             
    if 'city_id' in data:
        city_id = data['city_id']
        city = db.session.get(City, city_id)
        if not city:
            return jsonify(response="City not found"), 404
        place.city_id = city_id
        
    db.session.commit()
    return jsonify(place.serialize()), 200


@api.route('/places/private', methods=['DELETE'])
@jwt_required()
def delete_private_place():
    place_id = int(get_jwt_identity())
    place = db.session.get(Place, place_id)
    if not place:
        return jsonify(response="Place not found"), 404
        
    db.session.delete(place)
    db.session.commit()
    return jsonify(response="Place deleted"), 200


@api.route('/places/private/reservations', methods=['GET'])
@jwt_required()
def get_private_place_reservations():
    place_id = int(get_jwt_identity())
    reservations = db.session.execute(
        db.select(Reservation).where(Reservation.place_id == place_id)
    ).scalars().all()
    if not reservations:
        return jsonify(response="No reservations found for this place"), 404
    return jsonify([res.serialize() for res in reservations]), 200


@api.route('/places/private/reviews', methods=['GET'])
@jwt_required()
def get_private_place_reviews():
    place_id = int(get_jwt_identity())
    reviews = db.session.execute(
        db.select(Review).join(Reservation).where(Reservation.place_id == place_id)
    ).scalars().all()
    if not reviews:
        return jsonify(response="No reviews found for this place"), 404
    return jsonify([r.serialize() for r in reviews]), 200
