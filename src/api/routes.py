from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

# Importar rutas específicas
from .routes.auth import setup_auth_routes
from .routes.products import setup_products_routes
from .routes.cart import setup_cart_routes
from .routes.orders import setup_orders_routes

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# Configurar todas las rutas
setup_auth_routes(api)
setup_products_routes(api)
setup_cart_routes(api)
setup_orders_routes(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend"
    }
    return jsonify(response_body), 200


@api.route('/')
def sitemap():
    return generate_sitemap(api)
