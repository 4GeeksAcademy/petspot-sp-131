"""
Pets Routes
===========
CRUD de mascotas, razas (races), análisis de imagen con IA (Groq)
y carga de imágenes (Cloudinary).
"""
import os
import re
import json
import base64
import requests
from flask import request, jsonify
from sqlalchemy import select
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from api.routes import api
from api.models import db, Pet, Race, User, PetAnimalType, PetSize


# ===========================================================================
# Funciones auxiliares
# ===========================================================================

def normalize_pet_animal_type(raw_value):
    if not isinstance(raw_value, str):
        raise ValueError("Animal type must be a string")

    normalized = raw_value.strip().lower()
    if normalized in ["perro", "dog"]:
        return PetAnimalType.DOG
    if normalized in ["gato", "cat"]:
        return PetAnimalType.CAT
    if normalized in ["otros", "other"]:
        return PetAnimalType.OTHER

    raise ValueError("Invalid animal type. Use dog, cat, or other")


def normalize_pet_size(raw_value):
    if not isinstance(raw_value, str):
        raise ValueError("Size must be a string")

    normalized = raw_value.strip().lower()
    if normalized in ["pequeño", "pequeno", "small"]:
        return PetSize.SMALL
    if normalized in ["mediano", "medium"]:
        return PetSize.MEDIUM
    if normalized in ["grande", "large"]:
        return PetSize.LARGE

    raise ValueError("Invalid size. Use small, medium, or large")


# ===========================================================================
# Análisis de imagen con IA
# ===========================================================================

@api.route('/analyze-pet', methods=['POST'])
def analyze_pet():
    if 'image' not in request.files:
        return jsonify({"msg": "No image file provided"}), 400

    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify({"msg": "No file selected"}), 400

    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        return jsonify({"msg": "Groq API key not configured"}), 500

    try:
        img_bytes = image_file.read()
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')
        mime_type = image_file.mimetype or "image/jpeg"
        data_url = f"data:{mime_type};base64,{img_base64}"

        prompt = (
            "Analyze this pet image and return ONLY a valid JSON object. "
            "No markdown, no code blocks, no extra text — just raw JSON. "
            "Use exactly these fields:\n"
            '{"animal_type":"Dog or Cat or Other","breed":"Most likely breed name",'
            '"is_mix":true or false,'
            '"mix_description":"Describe mixed breeds, or null if purebred",'
            '"recommended_food":["3-4 specific food recommendations"],'
            '"care_tips":["2-3 practical care tips"],'
            '"fun_facts":"One interesting fun fact about this breed",'
            '"personality":"Brief description of typical personality traits"}\n'
            'If no pet is visible in the image, return: {"error":"No pet detected in image"}'
        )

        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "meta-llama/llama-4-scout-17b-16e-instruct",
                "temperature": 0.2,
                "messages": [{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_url}}
                    ]
                }]
            },
            timeout=30
        )

        if not resp.ok:
            return jsonify({"msg": f"Groq API error {resp.status_code}: {resp.text}"}), 502

        raw_text = resp.json()["choices"][0]["message"]["content"].strip()

        # Limpiar bloques de código markdown si los hay
        raw_text = re.sub(r'^```(?:json)?\s*', '', raw_text)
        raw_text = re.sub(r'\s*```$', '', raw_text)

        result = json.loads(raw_text)
        return jsonify(result), 200

    except json.JSONDecodeError:
        return jsonify({"msg": "AI response could not be parsed", "raw": raw_text}), 500
    except Exception as e:
        return jsonify({"msg": f"Error analyzing image: {str(e)}"}), 500


# ===========================================================================
# Carga de imágenes (Cloudinary)
# ===========================================================================

@api.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    import cloudinary.uploader
    if 'image' not in request.files:
        return jsonify({"msg": "No image provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400

    try:
        upload_result = cloudinary.uploader.upload(
            file,
            transformation=[
                {'width': 1000, 'height': 1000, 'crop': 'limit'},
                {'quality': 'auto'}
            ]
        )
        return jsonify({"url": upload_result['secure_url']}), 200
    except Exception as e:
        return jsonify({"msg": str(e)}), 500


# ===========================================================================
# CRUD de Razas (Races)
# ===========================================================================

@api.route('/races', methods=['GET'])
def get_races():
    races = db.session.execute(db.select(Race)).scalars().all()
    return jsonify([race.serialize() for race in races]), 200


@api.route('/races/<int:race_id>', methods=['GET'])
def get_race(race_id):
    race = db.session.execute(db.select(Race).where(Race.id == race_id)).scalars().first()
    if not race:
        return jsonify({"msg": "Race not found"}), 404
    return jsonify(race.serialize()), 200


@api.route('/races/import', methods=['POST'])
@jwt_required()
def import_external_races():
    dog_count = 0
    cat_count = 0

    try:
        api_key = os.getenv("DOG_API_KEY")
        headers = {"x-api-key": api_key} if api_key else {}
        dog_res = requests.get('https://api.thedogapi.com/v1/breeds', headers=headers)
        if dog_res.status_code == 200:
            dogs = dog_res.json()
            for dog in dogs:
                name = dog.get('name')
                image_url = dog.get('image', {}).get('url') if dog.get('image') else None
                if name:
                    exists = db.session.execute(select(Race).where(Race.name == name, Race.animal_type == "Perro")).scalars().first()
                    if not exists:
                        new_race = Race(name=name, animal_type="Perro", url=image_url)
                        db.session.add(new_race)
                        dog_count += 1
                    elif exists and not exists.url and image_url:
                        exists.url = image_url
            db.session.commit()
        else:
            fallback_dogs = [
                "Golden Retriever", "Labrador Retriever", "Bulldog", "Poodle",
                "Beagle", "Chihuahua", "German Shepherd", "Yorkshire Terrier",
                "Boxer", "Husky", "Pomeranian", "Dachshund", "Pug",
                "Cocker Spaniel", "Rottweiler", "Doberman", "Pitbull", "Border Collie"
            ]
            for name in fallback_dogs:
                exists = db.session.execute(select(Race).where(Race.name == name, Race.animal_type == "Perro")).scalars().first()
                if not exists:
                    new_race = Race(name=name, animal_type="Perro")
                    db.session.add(new_race)
                    dog_count += 1
            db.session.commit()
    except Exception as e:
        print(f"Excepcion The Dog API: {e}")

    try:
        cat_res = requests.get('https://api.thecatapi.com/v1/breeds')
        if cat_res.status_code == 200:
            cats = cat_res.json()
            for cat in cats:
                name = cat.get('name')
                image_url = cat.get('image', {}).get('url') if cat.get('image') else None
                if not image_url and cat.get('reference_image_id'):
                    image_url = f"https://cdn2.thecatapi.com/images/{cat.get('reference_image_id')}.jpg"
                if name:
                    exists = db.session.execute(select(Race).where(Race.name == name, Race.animal_type == "Gato")).scalars().first()
                    if not exists:
                        new_race = Race(name=name, animal_type="Gato", url=image_url)
                        db.session.add(new_race)
                        cat_count += 1
                    elif exists and not exists.url and image_url:
                        exists.url = image_url
            db.session.commit()
    except Exception as e:
        print(f"Excepcion The Cat API: {e}")

    return jsonify({"msg": f"Razas importadas exitosamente. Perros: {dog_count}, Gatos: {cat_count}"}), 200


@api.route('/races', methods=['POST'])
@jwt_required()
def create_race():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"msg": "Missing JSON in request"}), 400

    if "name" not in body or "animal_type" not in body:
        return jsonify({"msg": "Missing 'name' or 'animal_type' in request"}), 400

    new_race = Race(
        name=body['name'],
        animal_type=body['animal_type'],
        url=body.get('url')
    )
    db.session.add(new_race)
    try:
        db.session.commit()
        return jsonify(new_race.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500


@api.route('/races/<int:race_id>', methods=['PUT'])
@jwt_required()
def update_race(race_id):
    race = db.session.execute(db.select(Race).where(Race.id == race_id)).scalars().first()
    if not race:
        return jsonify({"msg": "Race not found"}), 404

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"msg": "Missing JSON in request"}), 400

    if "name" in body:
        race.name = body["name"]
    if "animal_type" in body:
        race.animal_type = body["animal_type"]
    if "url" in body:
        race.url = body["url"]

    try:
        db.session.commit()
        return jsonify(race.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500


@api.route('/races/<int:race_id>', methods=['DELETE'])
@jwt_required()
def delete_race(race_id):
    race = db.session.execute(db.select(Race).where(Race.id == race_id)).scalars().first()
    if not race:
        return jsonify({"msg": "Race not found"}), 404

    db.session.delete(race)
    try:
        db.session.commit()
        return jsonify({"msg": "Race deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500


# ===========================================================================
# CRUD de Mascotas (Pets)
# ===========================================================================

@api.route('/pets', methods=['GET'])
def get_pets():
    pets = db.session.execute(db.select(Pet)).scalars().all()
    return jsonify([pet.serialize() for pet in pets]), 200


@api.route('/pets/<int:pet_id>', methods=['GET'])
def get_pet(pet_id):
    pet = db.session.execute(db.select(Pet).where(Pet.id == pet_id)).scalars().first()
    if not pet:
        return jsonify({"msg": "Pet not found"}), 404
    return jsonify(pet.serialize()), 200


@api.route('/pets', methods=['POST'])
@jwt_required()
def create_pet():
    user_id = get_jwt_identity()
    user = db.session.execute(db.select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"msg": "Missing JSON in request"}), 400

    required_fields = ["name", "animal_type", "size"]
    for field in required_fields:
        if field not in body:
            return jsonify({"msg": f"Missing '{field}' in request"}), 400

    try:
        animal_type = normalize_pet_animal_type(body['animal_type'])
        size = normalize_pet_size(body['size'])
    except ValueError as error:
        return jsonify({"msg": str(error)}), 400

    other_type = body.get("other_type")
    if other_type is not None and not isinstance(other_type, str):
        return jsonify({"msg": "'other_type' must be a string"}), 400

    other_type = other_type.strip() if isinstance(other_type, str) else None
    other_type = other_type or None
    race_id = None

    if animal_type in [PetAnimalType.DOG, PetAnimalType.CAT]:
        if "race_id" not in body or not body["race_id"]:
            return jsonify({"msg": "Missing 'race_id' in request for dog or cat"}), 400

        race = db.session.execute(db.select(Race).where(Race.id == body['race_id'])).scalars().first()
        if not race:
            return jsonify({"msg": "Race not found"}), 404
        race_id = race.id
        other_type = None
    elif animal_type == PetAnimalType.OTHER:
        if not other_type:
            return jsonify({"msg": "Missing 'other_type' in request when animal_type is 'other'"}), 400
    elif "race_id" in body and body["race_id"]:
        race = db.session.execute(db.select(Race).where(Race.id == body['race_id'])).scalars().first()
        if race:
            race_id = race.id

    new_pet = Pet(
        name=body['name'],
        user_id=user.id,
        animal_type=animal_type,
        other_type=other_type,
        race_id=race_id,
        size=size,
        url=body.get('url')
    )
    db.session.add(new_pet)
    try:
        db.session.commit()
        return jsonify(new_pet.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500


@api.route('/pets/<int:pet_id>', methods=['PUT'])
@jwt_required()
def update_pet(pet_id):
    user_id = get_jwt_identity()
    user = db.session.execute(db.select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    pet = db.session.execute(db.select(Pet).where(Pet.id == pet_id)).scalars().first()
    if not pet:
        return jsonify({"msg": "Pet not found"}), 404

    claims = get_jwt()
    if pet.user_id != user.id and claims.get("role") != "admin":
        return jsonify({"msg": "Unauthorized to update this pet"}), 403

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"msg": "Missing JSON in request"}), 400

    next_animal_type = pet.animal_type
    next_other_type = pet.other_type

    if "name" in body:
        pet.name = body["name"]
    if "animal_type" in body:
        try:
            next_animal_type = normalize_pet_animal_type(body["animal_type"])
        except ValueError as error:
            return jsonify({"msg": str(error)}), 400
    if "other_type" in body:
        if body["other_type"] is not None and not isinstance(body["other_type"], str):
            return jsonify({"msg": "'other_type' must be a string"}), 400
        next_other_type = body["other_type"].strip() if isinstance(body["other_type"], str) else None
        next_other_type = next_other_type or None
    if "race_id" in body:
        if body["race_id"] is None or body["race_id"] == "":
            pet.race_id = None
        else:
            race = db.session.execute(db.select(Race).where(Race.id == body['race_id'])).scalars().first()
            if not race:
                return jsonify({"msg": "Race not found"}), 404
            pet.race_id = race.id
    if "size" in body:
        try:
            pet.size = normalize_pet_size(body["size"])
        except ValueError as error:
            return jsonify({"msg": str(error)}), 400
    if "url" in body:
        pet.url = body["url"]

    if next_animal_type in [PetAnimalType.DOG, PetAnimalType.CAT]:
        if pet.race_id is None:
            return jsonify({"msg": "A race is required for dog or cat"}), 400
        pet.animal_type = next_animal_type
        pet.other_type = None
    else:
        if not next_other_type:
            return jsonify({"msg": "'other_type' is required when animal_type is 'other'"}), 400
        pet.animal_type = next_animal_type
        pet.other_type = next_other_type

    try:
        db.session.commit()
        return jsonify(pet.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500


@api.route('/pets/<int:pet_id>', methods=['DELETE'])
@jwt_required()
def delete_pet(pet_id):
    user_id = get_jwt_identity()
    user = db.session.execute(db.select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    pet = db.session.execute(db.select(Pet).where(Pet.id == pet_id)).scalars().first()
    if not pet:
        return jsonify({"msg": "Pet not found"}), 404

    claims = get_jwt()
    if pet.user_id != user.id and claims.get("role") != "admin":
        return jsonify({"msg": "Unauthorized to delete this pet"}), 403

    db.session.delete(pet)
    try:
        db.session.commit()
        return jsonify({"msg": "Pet deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500
