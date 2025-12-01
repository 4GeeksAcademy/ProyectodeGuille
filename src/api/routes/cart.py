from flask import Blueprint, jsonify, request
from datetime import datetime

cart_bp = Blueprint('cart', __name__)

# Base de datos de carritos en memoria
carts_db = {}
cart_items_db = []
item_counter = 1

# Productos disponibles (simulados)
available_products = [
    {
        "id": 1,
        "name": "Producto Sostenible 1",
        "price": 100.50,
        "stock": 10,
        "image_url": "https://via.placeholder.com/150"
    },
    {
        "id": 2,
        "name": "Producto Sostenible 2",
        "price": 200.00,
        "stock": 5,
        "image_url": "https://via.placeholder.com/150"
    },
    {
        "id": 3,
        "name": "Producto Sostenible 3",
        "price": 150.75,
        "stock": 15,
        "image_url": "https://via.placeholder.com/150"
    }
]


@cart_bp.route('/', methods=['GET'])
def get_cart():
    """Obtener el carrito del usuario"""
    user_id = request.args.get('user_id', type=int)

    if not user_id:
        return jsonify({"error": "user_id es requerido"}), 400

    # Crear carrito si no existe
    if user_id not in carts_db:
        carts_db[user_id] = {
            "id": user_id,
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

    # Obtener items del carrito
    user_cart_items = [
        item for item in cart_items_db if item['cart_id'] == user_id]

    # Enriquecer con información del producto
    enriched_items = []
    total = 0

    for item in user_cart_items:
        product = next(
            (p for p in available_products if p['id'] == item['product_id']), None)
        if product:
            item_total = product['price'] * item['quantity']
            total += item_total

            enriched_items.append({
                **item,
                "product_name": product['name'],
                "product_price": product['price'],
                "product_image": product['image_url'],
                "item_total": item_total,
                "available_stock": product['stock']
            })

    return jsonify({
        "cart": carts_db[user_id],
        "items": enriched_items,
        "summary": {
            "items_count": len(enriched_items),
            "total_items": sum(item['quantity'] for item in enriched_items),
            "subtotal": total,
            "shipping": 0 if total == 0 else 10.00,
            "tax": round(total * 0.08, 2),
            "total": total + (0 if total == 0 else 10.00) + round(total * 0.08, 2)
        }
    })


@cart_bp.route('/add', methods=['POST'])
def add_to_cart():
    """Agregar producto al carrito"""
    data = request.json

    if not data or 'user_id' not in data or 'product_id' not in data:
        return jsonify({"error": "user_id y product_id son requeridos"}), 400

    user_id = data['user_id']
    product_id = data['product_id']
    quantity = data.get('quantity', 1)

    # Verificar que el producto exista
    product = next(
        (p for p in available_products if p['id'] == product_id), None)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    # Verificar stock
    if quantity > product['stock']:
        return jsonify({"error": "Stock insuficiente"}), 400

    # Crear carrito si no existe
    if user_id not in carts_db:
        carts_db[user_id] = {
            "id": user_id,
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

    # Verificar si el producto ya está en el carrito
    existing_item = next(
        (item for item in cart_items_db
         if item['cart_id'] == user_id and item['product_id'] == product_id),
        None
    )

    global item_counter

    if existing_item:
        # Actualizar cantidad
        existing_item['quantity'] += quantity
        existing_item['updated_at'] = datetime.utcnow().isoformat()
    else:
        # Agregar nuevo item
        new_item = {
            "id": item_counter,
            "cart_id": user_id,
            "product_id": product_id,
            "quantity": quantity,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        cart_items_db.append(new_item)
        item_counter += 1

    # Actualizar timestamp del carrito
    carts_db[user_id]['updated_at'] = datetime.utcnow().isoformat()

    return jsonify({
        "success": True,
        "message": "Producto agregado al carrito",
        "cart_id": user_id
    })


@cart_bp.route('/update/<int:item_id>', methods=['PUT'])
def update_cart_item(item_id):
    """Actualizar cantidad de un item en el carrito"""
    data = request.json

    if not data or 'quantity' not in data:
        return jsonify({"error": "quantity es requerido"}), 400

    quantity = data['quantity']

    if quantity < 0:
        return jsonify({"error": "La cantidad no puede ser negativa"}), 400

    # Buscar el item
    item = next(
        (item for item in cart_items_db if item['id'] == item_id), None)

    if not item:
        return jsonify({"error": "Item no encontrado en el carrito"}), 404

    # Verificar producto y stock
    product = next(
        (p for p in available_products if p['id'] == item['product_id']), None)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    if quantity > product['stock']:
        return jsonify({"error": "Stock insuficiente"}), 400

    # Actualizar cantidad
    if quantity == 0:
        # Eliminar el item si la cantidad es 0
        cart_items_db[:] = [i for i in cart_items_db if i['id'] != item_id]
        message = "Item eliminado del carrito"
    else:
        item['quantity'] = quantity
        item['updated_at'] = datetime.utcnow().isoformat()
        message = "Cantidad actualizada"

    # Actualizar timestamp del carrito
    if item['cart_id'] in carts_db:
        carts_db[item['cart_id']]['updated_at'] = datetime.utcnow().isoformat()

    return jsonify({
        "success": True,
        "message": message
    })


@cart_bp.route('/remove/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    """Eliminar item del carrito"""

    # Buscar el item
    item = next(
        (item for item in cart_items_db if item['id'] == item_id), None)

    if not item:
        return jsonify({"error": "Item no encontrado en el carrito"}), 404

    # Eliminar el item
    cart_items_db[:] = [i for i in cart_items_db if i['id'] != item_id]

    # Actualizar timestamp del carrito
    if item['cart_id'] in carts_db:
        carts_db[item['cart_id']]['updated_at'] = datetime.utcnow().isoformat()

    return jsonify({
        "success": True,
        "message": "Item eliminado del carrito"
    })


@cart_bp.route('/clear', methods=['POST'])
def clear_cart():
    """Vaciar el carrito completo"""
    data = request.json

    if not data or 'user_id' not in data:
        return jsonify({"error": "user_id es requerido"}), 400

    user_id = data['user_id']

    # Eliminar todos los items del usuario
    cart_items_db[:] = [
        item for item in cart_items_db if item['cart_id'] != user_id]

    # Actualizar timestamp del carrito
    if user_id in carts_db:
        carts_db[user_id]['updated_at'] = datetime.utcnow().isoformat()

    return jsonify({
        "success": True,
        "message": "Carrito vaciado"
    })
