from flask import Blueprint
from api.routes.auth import auth_api
from api.routes.users import users_api
from api.routes.admins import admins_api
from api.routes.places import places_api
from api.routes.pets import pets_api
from api.routes.reservations import reservations_api
from api.routes.misc import misc_api
from api.routes.chat import chat_api

api = Blueprint('api', __name__)

# Register sub-blueprints
api.register_blueprint(auth_api)
api.register_blueprint(users_api)
api.register_blueprint(admins_api)
api.register_blueprint(places_api)
api.register_blueprint(pets_api)
api.register_blueprint(reservations_api)
api.register_blueprint(misc_api)
api.register_blueprint(chat_api)

@api.route('/hello', methods=['GET'])
def handle_hello():
    return {"message": "Hello! The API is modular now!"}, 200
