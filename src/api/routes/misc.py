from flask import request, jsonify, Blueprint
from api.models import db, Review, City, News, AdminUser, PostType
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select
from datetime import datetime

misc_api = Blueprint('misc_api', __name__)

# REVIEWS
@misc_api.route('/reviews', methods=['GET'])
def get_reviews():
    reviews = db.session.execute(db.select(Review)).scalars().all()
    return jsonify([r.serialize() for r in reviews]), 200

# CITIES
@misc_api.route('/cities', methods=['GET'])
def get_cities():
    cities = db.session.execute(select(City).order_by(City.city.asc())).scalars().all()
    return jsonify([c.serialize() for c in cities]), 200

# NEWS
@misc_api.route('/news', methods=['GET'])
def get_news():
    news_list = db.session.execute(select(News).order_by(News.post_date.desc())).scalars().all()
    return jsonify([n.serialize() for n in news_list]), 200

@misc_api.route('/news', methods=['POST'])
@jwt_required()
def create_news():
    identity = get_jwt_identity()
    admin_id = identity["id"] if isinstance(identity, dict) else identity
    data = request.get_json(silent=True) or {}
    
    new_news = News(
        id_admin=admin_id,
        title=data['title'],
        content=data['content'],
        post_date=datetime.strptime(data['post_date'], "%Y-%m-%d").date(),
        post_type=PostType(data['post_type'])
    )
    db.session.add(new_news)
    db.session.commit()
    return jsonify(new_news.serialize()), 201
