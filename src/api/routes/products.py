from flask import Blueprint, jsonify, request
from datetime import datetime

products_bp = Blueprint('products', __name__)

# Base de datos de productos en memoria
products_db = [
    {
        "id": 1,
        "name": "Producto Sostenible 1",
        "description": "Descripción del producto sostenible 1",
        "price": 100.50,
        "category": "Electrónicos",
        "sustainability_score": 85,
        "image_url": "https://via.placeholder.com/300",
        "stock": 10,
        "business_id": 1,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": 2,
        "name": "Producto Sostenible 2",
        "description": "Descripción del producto sostenible 2",
        "price": 200.00,
        "category": "Hogar",
        "sustainability_score": 92,
        "image_url": "https://via.placeholder.com/300",
        "stock": 5,
        "business_id": 1,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": 3,
        "name": "Producto Sostenible 3",
        "description": "Descripción del producto sostenible 3",
        "price": 150.75,
        "category": "Ropa",
        "sustainability_score": 78,
        "image_url": "https://via.placeholder.com/300",
        "stock": 15,
        "business_id": 2,
        "created_at": datetime.utcnow().isoformat()
    }
]


@products_bp.route('/', methods=['GET'])
def get_products():
    """Obtener todos los productos"""
    category = request.args.get('category')
    search = request.args.get('search')

    filtered_products = products_db

    if category and category != 'all':
        filtered_products = [
            p for p in filtered_products if p['category'] == category]

    if search:
        search_lower = search.lower()
        filtered_products = [
            p for p in filtered_products
            if search_lower in p['name'].lower() or search_lower in p['description'].lower()
        ]

    return jsonify(filtered_products)


@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Obtener un producto específico"""
    product = next((p for p in products_db if p['id'] == product_id), None)

    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    return jsonify(product)


@products_bp.route('/categories', methods=['GET'])
def get_categories():
    """Obtener todas las categorías"""
    categories = list(set(p['category'] for p in products_db if p['category']))
    return jsonify(categories)
