from flask import Blueprint, jsonify

customers_bp = Blueprint('customers', __name__)


@customers_bp.route('/profile', methods=['GET'])
def get_customer_profile():
    return jsonify({
        "message": "Perfil del cliente",
        "profile": {
            "name": "Cliente Demo",
            "email": "cliente@ejemplo.com",
            "role": "customer"
        }
    })
