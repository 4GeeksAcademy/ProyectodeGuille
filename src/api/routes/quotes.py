from flask import Blueprint, jsonify, request
from datetime import datetime

quotes_bp = Blueprint('quotes', __name__)

# Base de datos de cotizaciones en memoria
quotes_db = []


@quotes_bp.route('/', methods=['GET'])
def get_quotes():
    """Obtener todas las cotizaciones"""
    user_id = request.args.get('user_id')
    role = request.args.get('role')

    filtered_quotes = quotes_db

    if user_id:
        filtered_quotes = [
            q for q in filtered_quotes if q['customer_id'] == int(user_id)]

    return jsonify(filtered_quotes)


@quotes_bp.route('/', methods=['POST'])
def create_quote():
    """Crear una nueva cotización"""
    data = request.json

    if not data or not data.get('customer_id') or not data.get('items'):
        return jsonify({"error": "Datos incompletos"}), 400

    new_quote = {
        "id": len(quotes_db) + 1,
        "customer_id": data['customer_id'],
        "business_id": data.get('business_id', 1),
        "items": data['items'],
        "status": "pending",
        "total_price": sum(item.get('price', 0) * item.get('quantity', 1) for item in data['items']),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

    quotes_db.append(new_quote)

    return jsonify({
        "message": "Cotización creada exitosamente",
        "quote": new_quote
    }), 201
