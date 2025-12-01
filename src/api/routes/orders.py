from flask import Blueprint, jsonify, request
from .payments import payments_bp
from datetime import datetime, timedelta
import random

orders_bp = Blueprint('orders', __name__)

# Base de datos de órdenes en memoria
orders_db = []
order_counter = 1000

# Estados posibles de órdenes
ORDER_STATUSES = [
    "pending",       # Pendiente de pago
    "processing",    # Procesando
    "shipped",       # Enviado
    "delivered",     # Entregado
    "cancelled"      # Cancelado
]

# Métodos de pago
PAYMENT_METHODS = ["credit_card", "debit_card", "paypal", "bank_transfer"]


@orders_bp.route('/', methods=['GET'])
def get_orders():
    """Obtener todas las órdenes (con filtros)"""
    user_id = request.args.get('user_id', type=int)
    status = request.args.get('status')
    limit = request.args.get('limit', type=int, default=20)

    filtered_orders = orders_db

    if user_id:
        filtered_orders = [
            order for order in filtered_orders if order['user_id'] == user_id]

    if status:
        filtered_orders = [
            order for order in filtered_orders if order['status'] == status]

    # Ordenar por fecha más reciente
    filtered_orders.sort(key=lambda x: x['created_at'], reverse=True)

    # Limitar resultados
    filtered_orders = filtered_orders[:limit]

    return jsonify({
        "success": True,
        "count": len(filtered_orders),
        "orders": filtered_orders
    })


@orders_bp.route('/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Obtener una orden específica"""
    order = next(
        (order for order in orders_db if order['id'] == order_id), None)

    if not order:
        return jsonify({"error": "Orden no encontrada"}), 404

    return jsonify({
        "success": True,
        "order": order
    })


@orders_bp.route('/', methods=['POST'])
def create_order():
    """Crear una nueva orden desde el carrito"""
    data = request.json

    if not data or 'user_id' not in data or 'items' not in data:
        return jsonify({"error": "user_id y items son requeridos"}), 400

    user_id = data['user_id']
    items = data['items']

    if not items:
        return jsonify({"error": "El carrito está vacío"}), 400

    # 1. VERIFICAR STOCK ANTES DE CREAR LA ORDEN
    for item in items:
        # En producción, verificar contra base de datos real
        if item.get('quantity', 1) > item.get('available_stock', 0):
            return jsonify({
                "error": f"Stock insuficiente para {item.get('name', 'producto')}",
                "product_id": item.get('product_id')
            }), 400

    # 2. Calcular totales
    subtotal = sum(item.get('price', 0) * item.get('quantity', 1)
                   for item in items)
    shipping = data.get('shipping', 10.00 if subtotal < 100 else 0)
    tax = round(subtotal * 0.08, 2)
    total = subtotal + shipping + tax

    global order_counter
    order_counter += 1

    # 3. Crear nueva orden
    new_order = {
        "id": order_counter,
        "order_number": f"ORD-{datetime.now().strftime('%Y%m%d')}-{order_counter:04d}",
        "user_id": user_id,
        "items": items,
        "subtotal": subtotal,
        "shipping": shipping,
        "tax": tax,
        "total": total,
        "status": "pending_payment",  # Nuevo estado
        "payment_method": data.get('payment_method', 'credit_card'),
        "payment_status": "pending",
        "payment_id": None,
        "shipping_address": data.get('shipping_address', {}),
        "billing_address": data.get('billing_address', {}),
        "customer_notes": data.get('customer_notes', ""),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "estimated_delivery": (datetime.utcnow() + timedelta(days=random.randint(3, 7))).isoformat()
    }

    orders_db.append(new_order)

    # 4. Retornar datos para pago
    return jsonify({
        "success": True,
        "message": "Orden creada, proceder al pago",
        "order": new_order,
        "payment_required": True,
        "payment_amount": total,
        "payment_endpoint": "/api/payments/create-payment"
    }), 201


@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Actualizar el estado de una orden"""
    data = request.json

    if not data or 'status' not in data:
        return jsonify({"error": "status es requerido"}), 400

    new_status = data['status']

    if new_status not in ORDER_STATUSES:
        return jsonify({"error": f"Estado inválido. Opciones: {ORDER_STATUSES}"}), 400

    # Buscar la orden
    order = next(
        (order for order in orders_db if order['id'] == order_id), None)

    if not order:
        return jsonify({"error": "Orden no encontrada"}), 404

    # Actualizar estado
    order['status'] = new_status
    order['updated_at'] = datetime.utcnow().isoformat()

    # Si se marca como enviado, agregar tracking
    if new_status == 'shipped':
        order['tracking_number'] = f"TRK-{random.randint(1000000000, 9999999999)}"
        order['shipped_at'] = datetime.utcnow().isoformat()

    return jsonify({
        "success": True,
        "message": f"Estado actualizado a '{new_status}'",
        "order": order
    })


@orders_bp.route('/<int:order_id>/cancel', methods=['POST'])
def cancel_order(order_id):
    """Cancelar una orden"""

    # Buscar la orden
    order = next(
        (order for order in orders_db if order['id'] == order_id), None)

    if not order:
        return jsonify({"error": "Orden no encontrada"}), 404

    # Verificar si se puede cancelar
    if order['status'] in ['shipped', 'delivered']:
        return jsonify({"error": "No se puede cancelar una orden ya enviada o entregada"}), 400

    # Actualizar estado
    order['status'] = 'cancelled'
    order['updated_at'] = datetime.utcnow().isoformat()
    order['cancelled_at'] = datetime.utcnow().isoformat()
    order['cancellation_reason'] = request.json.get(
        'reason', 'Solicitud del cliente')

    return jsonify({
        "success": True,
        "message": "Orden cancelada exitosamente",
        "order": order
    })


@orders_bp.route('/user/<int:user_id>/summary', methods=['GET'])
def get_user_orders_summary(user_id):
    """Obtener resumen de órdenes del usuario"""

    user_orders = [order for order in orders_db if order['user_id'] == user_id]

    if not user_orders:
        return jsonify({
            "success": True,
            "summary": {
                "total_orders": 0,
                "total_spent": 0,
                "avg_order_value": 0,
                "last_order_date": None
            }
        })

    total_spent = sum(order['total'] for order in user_orders)
    avg_order_value = total_spent / len(user_orders)
    last_order = max(user_orders, key=lambda x: x['created_at'])

    # Contar por estado
    status_counts = {}
    for order in user_orders:
        status = order['status']
        status_counts[status] = status_counts.get(status, 0) + 1

    return jsonify({
        "success": True,
        "summary": {
            "total_orders": len(user_orders),
            "total_spent": total_spent,
            "avg_order_value": avg_order_value,
            "last_order_date": last_order['created_at'],
            "status_counts": status_counts
        }
    })


@orders_bp.route('/generate-sample', methods=['POST'])
def generate_sample_orders():
    """Generar órdenes de ejemplo (solo para desarrollo)"""
    user_id = request.json.get('user_id', 1)
    count = request.json.get('count', 5)

    sample_products = [
        {"id": 1, "name": "Producto Premium", "price": 150.00},
        {"id": 2, "name": "Producto Básico", "price": 89.99},
        {"id": 3, "name": "Producto Eco", "price": 120.50},
        {"id": 4, "name": "Accesorio", "price": 29.99}
    ]

    global order_counter

    for i in range(count):
        order_counter += 1

        # Seleccionar productos aleatorios
        num_items = random.randint(1, 3)
        items = []
        for _ in range(num_items):
            product = random.choice(sample_products)
            items.append({
                "product_id": product["id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": random.randint(1, 3)
            })

        subtotal = sum(item['price'] * item['quantity'] for item in items)
        shipping = 0 if subtotal > 100 else 10
        tax = round(subtotal * 0.08, 2)

        # Fecha aleatoria en los últimos 60 días
        days_ago = random.randint(0, 60)
        order_date = datetime.utcnow() - timedelta(days=days_ago)

        new_order = {
            "id": order_counter,
            "order_number": f"ORD-{order_date.strftime('%Y%m%d')}-{order_counter:04d}",
            "user_id": user_id,
            "items": items,
            "subtotal": subtotal,
            "shipping": shipping,
            "tax": tax,
            "total": subtotal + shipping + tax,
            "status": random.choice(ORDER_STATUSES),
            "payment_method": random.choice(PAYMENT_METHODS),
            "payment_status": "completed",
            "created_at": order_date.isoformat(),
            "updated_at": order_date.isoformat(),
            "estimated_delivery": (order_date + timedelta(days=random.randint(3, 7))).isoformat()
        }

        # Si está entregado, agregar fecha de entrega
        if new_order['status'] == 'delivered':
            new_order['delivered_at'] = (
                order_date + timedelta(days=random.randint(2, 5))).isoformat()

        orders_db.append(new_order)

    return jsonify({
        "success": True,
        "message": f"Generadas {count} órdenes de ejemplo",
        "generated_orders": count
    })
