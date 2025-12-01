from flask import Blueprint, jsonify, request
from datetime import datetime

inventory_bp = Blueprint('inventory', __name__)

# Base de datos de inventario
inventory_db = [
    {
        "id": 1,
        "product_id": 1,
        "current_stock": 10,
        "minimum_stock": 5,
        "maximum_stock": 50,
        "last_restock": "2024-01-15T10:30:00Z",
        "movements": [
            {"date": "2024-01-15T10:30:00Z", "type": "restock",
                "quantity": 20, "new_stock": 30},
            {"date": "2024-01-20T14:15:00Z", "type": "sale",
                "quantity": -2, "new_stock": 28}
        ]
    }
]


@inventory_bp.route('/product/<int:product_id>', methods=['GET'])
def get_product_inventory(product_id):
    """Obtener inventario de un producto"""
    inventory = next(
        (inv for inv in inventory_db if inv['product_id'] == product_id), None)

    if not inventory:
        return jsonify({"error": "Inventario no encontrado"}), 404

    return jsonify(inventory)


@inventory_bp.route('/update-stock', methods=['POST'])
def update_stock():
    """Actualizar stock (para ventas o restock)"""
    data = request.json

    if not data or 'product_id' not in data or 'quantity' not in data or 'type' not in data:
        return jsonify({"error": "product_id, quantity y type son requeridos"}), 400

    product_id = data['product_id']
    quantity = data['quantity']
    movement_type = data['type']  # 'sale' o 'restock'

    # Buscar inventario
    inventory = next(
        (inv for inv in inventory_db if inv['product_id'] == product_id), None)

    if not inventory:
        # Crear nuevo registro de inventario
        inventory = {
            "id": len(inventory_db) + 1,
            "product_id": product_id,
            "current_stock": quantity if movement_type == 'restock' else 0,
            "minimum_stock": data.get('minimum_stock', 5),
            "maximum_stock": data.get('maximum_stock', 100),
            "last_restock": datetime.utcnow().isoformat() if movement_type == 'restock' else None,
            "movements": []
        }
        inventory_db.append(inventory)

    # Calcular nuevo stock
    if movement_type == 'sale':
        if inventory['current_stock'] < quantity:
            return jsonify({"error": "Stock insuficiente"}), 400
        new_stock = inventory['current_stock'] - quantity
    else:  # restock
        new_stock = inventory['current_stock'] + quantity

    # Actualizar stock
    inventory['current_stock'] = new_stock

    if movement_type == 'restock':
        inventory['last_restock'] = datetime.utcnow().isoformat()

    # Registrar movimiento
    movement = {
        "date": datetime.utcnow().isoformat(),
        "type": movement_type,
        "quantity": quantity if movement_type == 'restock' else -quantity,
        "new_stock": new_stock,
        "reason": data.get('reason', ''),
        "user_id": data.get('user_id')
    }

    inventory['movements'].append(movement)

    # También actualizar el producto en products_db
    from .products import products_db
    product = next((p for p in products_db if p['id'] == product_id), None)
    if product:
        product['stock'] = new_stock

    return jsonify({
        "success": True,
        "message": f"Stock actualizado: {new_stock} unidades",
        "inventory": inventory
    })


@inventory_bp.route('/low-stock', methods=['GET'])
def get_low_stock():
    """Obtener productos con stock bajo"""
    threshold = request.args.get('threshold', type=int, default=10)

    low_stock_items = []

    for inventory in inventory_db:
        if inventory['current_stock'] <= threshold:
            # Obtener info del producto
            from .products import products_db
            product = next(
                (p for p in products_db if p['id'] == inventory['product_id']), None)

            if product:
                low_stock_items.append({
                    "product_id": inventory['product_id'],
                    "product_name": product.get('name', 'Desconocido'),
                    "current_stock": inventory['current_stock'],
                    "minimum_stock": inventory['minimum_stock'],
                    "reorder_quantity": inventory['maximum_stock'] - inventory['current_stock']
                })

    return jsonify({
        "success": True,
        "low_stock_items": low_stock_items,
        "threshold": threshold
    })
