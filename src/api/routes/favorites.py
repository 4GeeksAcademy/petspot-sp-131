"""
Favorites Routes
================
CRUD de lugares favoritos de los usuarios.
"""
from flask import request, jsonify
from sqlalchemy import select

from api.routes import api
from api.models import db, Favorite, User, Place


# ===========================================================================
# CRUD de Favoritos (admin)
# ===========================================================================

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
