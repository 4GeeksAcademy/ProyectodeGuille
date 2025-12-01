from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Cart, CartItem, Product, Order, OrderItem
import stripe
import os


def setup_orders_routes(api):
    @api.route('/orders', methods=['GET'])
    @jwt_required()
    def get_orders():
        try:
            user_id = get_jwt_identity()
            orders = Order.query.filter_by(user_id=user_id).order_by(
                Order.created_at.desc()).all()
            return jsonify({'orders': [order.serialize() for order in orders]}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api.route('/orders/<int:order_id>', methods=['GET'])
    @jwt_required()
    def get_order(order_id):
        try:
            user_id = get_jwt_identity()
            order = Order.query.get(order_id)

            if not order or order.user_id != user_id:
                return jsonify({'error': 'Order not found'}), 404

            order_items = OrderItem.query.filter_by(order_id=order_id).all()
            items = []

            for item in order_items:
                product = Product.query.get(item.product_id)
                if product:
                    items.append({
                        'product_id': product.id,
                        'name': product.name,
                        'price': item.price,
                        'quantity': item.quantity,
                        'subtotal': item.price * item.quantity
                    })

            return jsonify({
                'order': order.serialize(),
                'items': items
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api.route('/checkout/create-payment', methods=['POST'])
    @jwt_required()
    def create_payment():
        try:
            user_id = get_jwt_identity()

            # Obtener carrito
            cart = Cart.query.filter_by(user_id=user_id).first()
            if not cart:
                return jsonify({'error': 'Cart is empty'}), 400

            cart_items = CartItem.query.filter_by(cart_id=cart.id).all()
            if not cart_items:
                return jsonify({'error': 'Cart is empty'}), 400

            # Calcular total y verificar stock
            total = 0
            items_to_order = []

            for cart_item in cart_items:
                product = Product.query.get(cart_item.product_id)
                if not product or not product.is_active:
                    return jsonify({'error': f'Product {cart_item.product_id} not available'}), 400

                if product.stock < cart_item.quantity:
                    return jsonify({'error': f'Insufficient stock for {product.name}'}), 400

                item_total = product.price * cart_item.quantity
                total += item_total

                items_to_order.append({
                    'product': product,
                    'cart_item': cart_item,
                    'quantity': cart_item.quantity,
                    'price': product.price
                })

            # Crear orden pendiente
            order = Order(
                user_id=user_id,
                total_amount=total,
                status='pending'
            )
            db.session.add(order)
            db.session.flush()

            # Crear items de la orden
            for item in items_to_order:
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=item['product'].id,
                    quantity=item['quantity'],
                    price=item['price']
                )
                db.session.add(order_item)

            # Configurar Stripe (simulado)
            stripe.api_key = os.environ.get(
                'STRIPE_SECRET_KEY', 'sk_test_demo')

            # Crear Payment Intent (simulado para demo)
            payment_intent = {
                'id': f'pi_demo_{order.id}',
                'client_secret': f'pi_demo_secret_{order.id}',
                'amount': int(total * 100)
            }

            order.stripe_payment_id = payment_intent['id']
            db.session.commit()

            return jsonify({
                'payment_intent': payment_intent,
                'order_id': order.id,
                'total': total
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api.route('/checkout/confirm', methods=['POST'])
    @jwt_required()
    def confirm_payment():
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            order_id = data.get('order_id')

            order = Order.query.get(order_id)
            if not order or order.user_id != user_id:
                return jsonify({'error': 'Order not found'}), 404

            if order.status != 'pending':
                return jsonify({'error': 'Order already processed'}), 400

            # Obtener items de la orden
            order_items = OrderItem.query.filter_by(order_id=order_id).all()

            # Actualizar stock y completar orden
            for item in order_items:
                product = Product.query.get(item.product_id)
                if product:
                    product.stock -= item.quantity

            # Limpiar carrito
            cart = Cart.query.filter_by(user_id=user_id).first()
            if cart:
                CartItem.query.filter_by(cart_id=cart.id).delete()
                cart.updated_at = db.func.now()

            order.status = 'completed'
            db.session.commit()

            return jsonify({
                'message': 'Payment confirmed successfully',
                'order': order.serialize()
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
