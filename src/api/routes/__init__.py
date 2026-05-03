"""
API Routes Package
==================
Este paquete centraliza todos los endpoints de la API.
Cada módulo agrupa endpoints por dominio funcional.
"""
from flask import Blueprint

api = Blueprint('api', __name__)

# Importar todos los módulos de rutas para registrar sus endpoints en el blueprint
from api.routes import geocoding      # noqa: F401, E402
from api.routes import admin          # noqa: F401, E402
from api.routes import auth           # noqa: F401, E402
from api.routes import users          # noqa: F401, E402
from api.routes import places         # noqa: F401, E402
from api.routes import chat           # noqa: F401, E402
from api.routes import reservations   # noqa: F401, E402
from api.routes import reviews        # noqa: F401, E402
from api.routes import cities         # noqa: F401, E402
from api.routes import news           # noqa: F401, E402
from api.routes import favorites      # noqa: F401, E402
from api.routes import pets           # noqa: F401, E402
