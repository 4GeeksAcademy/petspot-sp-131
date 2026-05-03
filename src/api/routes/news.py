"""
News Routes
===========
CRUD de noticias y comunicados publicados por administradores.
"""
from datetime import datetime
from flask import request, jsonify
from sqlalchemy import select

from api.routes import api
from api.models import db, News, PostType, AdminUser


# ===========================================================================
# CRUD de Noticias
# ===========================================================================

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
            news.post_date = datetime.strptime(data['post_date'], "%Y-%m-%d").date()
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
