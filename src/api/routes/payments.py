from flask import Blueprint, jsonify, request
from datetime import datetime
import random

payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/create-payment', methods=['POST'])
def create_payment():
    """Crear una transacción de pago"""
    data = request.json

    if not data or 'order_id' not in data or 'amount' not in data:
        return jsonify({"error": "order_id y amount son requeridos"}), 400

    # Simular procesamiento de pago (80% éxito, 20% fallo)
    is_successful = random.random() > 0.2

    payment_data = {
        "payment_id": f"PAY-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
        "order_id": data['order_id'],
        "amount": data['amount'],
        "currency": "USD",
        "status": "completed" if is_successful else "failed",
        "payment_method": data.get('payment_method', 'credit_card'),
        "created_at": datetime.utcnow().isoformat(),
        "transaction_id": f"TXN{random.randint(1000000000, 9999999999)}" if is_successful else None
    }

    return jsonify({
        "success": is_successful,
        "message": "Pago completado" if is_successful else "Pago fallido",
        "payment": payment_data
    })


@payments_bp.route('/webhook', methods=['POST'])
def payment_webhook():
    """Webhook para notificaciones de pago (simulado)"""
    # En producción, esto vendría de PayPal/Stripe/MercadoPago
    webhook_data = request.json

    print(f"Webhook recibido: {webhook_data}")

    return jsonify({
        "success": True,
        "message": "Webhook procesado"
    })


@payments_bp.route('/methods', methods=['GET'])
def get_payment_methods():
    """Obtener métodos de pago disponibles"""
    return jsonify([
        {
            "id": "credit_card",
            "name": "Tarjeta de Crédito",
            "icon": "💳",
            "description": "Pago con tarjeta de crédito/débito"
        },
        {
            "id": "paypal",
            "name": "PayPal",
            "icon": "📱",
            "description": "Pago seguro con PayPal"
        },
        {
            "id": "bank_transfer",
            "name": "Transferencia Bancaria",
            "icon": "🏦",
            "description": "Transferencia directa a nuestra cuenta"
        }
    ])
