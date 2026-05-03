"""
Reviews Routes
==============
CRUD de reseñas de establecimientos.
"""
from flask import request, jsonify
from sqlalchemy import select

from api.routes import api
from api.models import db, Review


# ===========================================================================
# CRUD de Reviews (admin)
# ===========================================================================

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

    required_fields = ["user_id", "reservation_id", "rating", "title", "content", "created_at"]

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
