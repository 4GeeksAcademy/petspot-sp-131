"""
Geocoding Routes
================
Endpoints relacionados con geocodificación de direcciones y ciudades.
Utiliza la API de Google Maps para convertir direcciones en coordenadas.
"""
import os
import requests
from flask import request, jsonify
from sqlalchemy import select

from api.routes import api
from api.models import db, Place, City


GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


# ===========================================================================
# Funciones auxiliares de geocodificación
# ===========================================================================

def geocode_address_details(address):
    if not GOOGLE_API_KEY:
        raise ValueError("Google Maps API key is not configured")

    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": GOOGLE_API_KEY,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as error:
        raise RuntimeError("Unable to connect to the geocoding service") from error
    except ValueError as error:
        raise RuntimeError("Invalid response from the geocoding service") from error

    status = data.get("status")
    if status == "OK":
        found_non_spain_result = False
        for result in data["results"]:
            address_components = result["address_components"]
            for element in address_components:
                if 'Spain' in element["long_name"]:
                    location = result["geometry"]["location"]
                    return {
                        "formatted_address": result["formatted_address"],
                        "latitude": location["lat"],
                        "longitude": location["lng"],
                        "address_components": result.get("address_components", [])
                    }

            found_non_spain_result = True

        if found_non_spain_result:
            raise ValueError("Please enter an address in Spain.")

    if status == "ZERO_RESULTS":
        raise ValueError("Invalid address")

    error_message = data.get("error_message") or "Geocoding service returned an error"
    raise RuntimeError(f"Geocoding failed: {status}. {error_message}")


def geocode_address(address):
    geocoded = geocode_address_details(address)
    return geocoded["latitude"], geocoded["longitude"]


def geocoded_result_matches_city(geocoded_result, city_name):
    normalized_city = city_name.strip().lower()
    formatted_address = geocoded_result["formatted_address"].strip().lower()
    if normalized_city in formatted_address:
        return True

    for component in geocoded_result.get("address_components", []):
        component_name = component.get("long_name", "").strip().lower()
        if component_name == normalized_city:
            return True

    return False


def find_matching_city_for_geocoded_result(geocoded_result):
    cities = db.session.execute(select(City)).scalars().all()
    for city in cities:
        if geocoded_result_matches_city(geocoded_result, city.city):
            return city
    return None


def extract_city_name_from_geocoded_result(geocoded_result):
    preferred_component_types = [
        "locality",
        "administrative_area_level_2",
        "administrative_area_level_1"
    ]

    for preferred_type in preferred_component_types:
        for component in geocoded_result.get("address_components", []):
            if preferred_type in component.get("types", []):
                return component.get("long_name")

    return None


def add_city_to_db(geocoded_result):
    city = extract_city_name_from_geocoded_result(geocoded_result)
    if not city:
        return jsonify(response="Unable to detect a city from the provided address"), 400

    existing_city = db.session.execute(
        select(City).where(City.city == city)
    ).scalar_one_or_none()
    if existing_city:
        return True

    try:
        geocoded_city = geocode_address_details(f"{city}, Spain")
    except ValueError as error:
        return jsonify(response="Invalid city" if str(error) == "Invalid address" else str(error)), 400
    except RuntimeError as error:
        return jsonify(response=str(error)), 502

    address = geocoded_city['formatted_address']
    latitude = geocoded_city["latitude"]
    longitude = geocoded_city["longitude"]

    add_city = City(city=city, address=address, latitude=latitude, longitude=longitude)
    db.session.add(add_city)
    db.session.commit()
    return True


# ===========================================================================
# Endpoints
# ===========================================================================

def resolve_place_address_geocode(address):
    """
    Resolve a place address to geocoded coordinates and matching city.
    Used by both the API endpoint and CLI commands for seeding.
    Raises ValueError for client errors, RuntimeError for server errors.
    """
    if not isinstance(address, str):
        raise ValueError("Address must be a string")

    address = address.strip()
    if not address:
        raise ValueError("Address is required")

    geocoded_result = geocode_address_details(address)
    matching_city = find_matching_city_for_geocoded_result(geocoded_result)

    if not matching_city:
        city_to_add_to_db = add_city_to_db(geocoded_result)
        if city_to_add_to_db is not True:
            response, status_code = city_to_add_to_db
            error_data = response.get_json(silent=True) or {}
            error_message = error_data.get("response") or "Unable to resolve city for address"
            if status_code >= 500:
                raise RuntimeError(error_message)
            raise ValueError(error_message)

        matching_city = find_matching_city_for_geocoded_result(geocoded_result)

    return {
        "formatted_address": geocoded_result["formatted_address"],
        "latitude": geocoded_result["latitude"],
        "longitude": geocoded_result["longitude"],
        "detected_city": matching_city.city if matching_city else None,
        "city_id": matching_city.id if matching_city else None
    }


@api.route('/geocode/place-address', methods=['POST'])
def geocode_place_address():
    data = request.get_json(silent=True) or {}
    address = data.get("address")

    try:
        geocoded_place = resolve_place_address_geocode(address)
    except ValueError as error:
        return jsonify(response=str(error)), 400
    except RuntimeError as error:
        return jsonify(response=str(error)), 502

    return jsonify(geocoded_place), 200


@api.route('/geocode/city', methods=['POST'])
def geocode_city():
    data = request.get_json(silent=True) or {}
    city = data.get("city")

    if not isinstance(city, str):
        return jsonify(response="City must be a string"), 400

    city = city.strip()
    if not city:
        return jsonify(response="City is required"), 400

    try:
        geocoded_result = geocode_address_details(city)
    except ValueError as error:
        return jsonify(response="Invalid city" if str(error) == "Invalid address" else str(error)), 400
    except RuntimeError as error:
        return jsonify(response=str(error)), 502

    normalized_city = extract_city_name_from_geocoded_result(geocoded_result) or city.title()

    city_exists = db.session.execute(
        select(City).where(City.city == normalized_city)
    ).scalar_one_or_none()
    if city_exists:
        return jsonify(response="City already exists"), 400

    return jsonify({
        "city": normalized_city,
        "formatted_address": geocoded_result["formatted_address"],
        "latitude": geocoded_result["latitude"],
        "longitude": geocoded_result["longitude"]
    }), 200


@api.route('/autocomplete/address', methods=['GET'])
def autocomplete_address():
    user_input = request.args.get("input")
    if not user_input:
        return jsonify(response="Input is required"), 400

    if not GOOGLE_API_KEY:
        raise ValueError("Google Maps API key is not configured")

    url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    params = {
        "input": user_input,
        "key": GOOGLE_API_KEY,
        "types": "address",
        "components": "country:es"
    }

    response = requests.get(url, params=params)
    response_dict = response.json()

    if response_dict.get("status") != "OK":
        return jsonify(response="Failed to fetch predictions"), 400

    predictions = response_dict.get("predictions", [])
    results = [
        {
            "description": p["description"],
            "place_id": p["place_id"]
        }
        for p in predictions
    ]

    return jsonify(results), 200


@api.route('/places/details', methods=['GET'])
def get_place_details():
    place_id = request.args.get("place_id")
    if not place_id:
        return jsonify(response="place_id is required"), 400

    if not GOOGLE_API_KEY:
        raise ValueError("Google Maps API key is not configured")

    response = requests.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        params={
            "place_id": place_id,
            "fields": "geometry,formatted_address,address_components",
            "key": GOOGLE_API_KEY,
        },
    )

    data = response.json()

    if data.get("status") != "OK":
        return jsonify(response="Failed to fetch place details"), 400

    result = data.get("result", {})

    return jsonify({
        "lat": result.get("geometry", {}).get("location", {}).get("lat"),
        "lng": result.get("geometry", {}).get("location", {}).get("lng"),
        "formatted_address": result.get("formatted_address"),
        "address_components": result.get("address_components"),
    }), 200
