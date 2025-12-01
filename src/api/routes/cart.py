from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Cart, CartItem, Product


def setup_cart_routes(api):
    @api.route('/cart', methods=['GET'])
    @jwt_required()
    def get_cart():
        try:
            user_id = get_jwt_identity()

            # Obtener o crear carrito
            cart = Cart.query.filter_by(user_id=user_id).first()
            if not cart:
                return jsonify({'items': [], 'total': 0, 'cart_id': None}), 200

            # Obtener items del carrito
            cart_items = CartItem.query.filter_by(cart_id=cart.id).all()
            items = []
            total = 0

            for item in cart_items:
                product = Product.query.get(item.product_id)
                if product and product.is_active:
                    item_total = product.price * item.quantity
                    total += item_total
                    items.append({
                        'id': item.id,
                        'product_id': product.id,
                        'name': product.name,
                        'price': product.price,
                        'quantity': item.quantity,
                        'subtotal': item_total,
                        'image_url': product.image_url,
                        'stock': product.stock
                    })

            return jsonify({
                'items': items,
                'total': total,
                'cart_id': cart.id
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api.route('/cart/add', methods=['POST'])
    @jwt_required()
    def add_to_cart():
        try:
            user_id = get_jwt_identity()
            data = request.get_json()

            # Validar producto
            product = Product.query.get(data['product_id'])
            if not product or not product.is_active:
                return jsonify({'error': 'Product not found'}), 404

            quantity = data.get('quantity', 1)
            if product.stock < quantity:
                return jsonify({'error': 'Insufficient stock'}), 400

            # Obtener o crear carrito
            cart = Cart.query.filter_by(user_id=user_id).first()
            if not cart:
                cart = Cart(user_id=user_id)
                db.session.add(cart)
                db.session.flush()

            # Verificar si el producto ya está en el carrito
            cart_item = CartItem.query.filter_by(
                cart_id=cart.id,
                product_id=product.id
            ).first()

            if cart_item:
                new_quantity = cart_item.quantity + quantity
                if product.stock < new_quantity:
                    return jsonify({'error': 'Insufficient stock'}), 400
                cart_item.quantity = new_quantity
            else:
                cart_item = CartItem(
                    cart_id=cart.id,
                    product_id=product.id,
                    quantity=quantity
                )
                db.session.add(cart_item)

            cart.updated_at = db.func.now()
            db.session.commit()

            return jsonify({
                'message': 'Product added to cart',
                'cart_item_id': cart_item.id
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api.route('/cart/update/<int:item_id>', methods=['PUT'])
    @jwt_required()
    def update_cart_item(item_id):
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            quantity = data.get('quantity', 1)

            if quantity < 0:
                return jsonify({'error': 'Invalid quantity'}), 400

            # Encontrar el carrito del usuario
            cart = Cart.query.filter_by(user_id=user_id).first()
            if not cart:
                return jsonify({'error': 'Cart not found'}), 404

            # Encontrar el item
            cart_item = CartItem.query.filter_by(
                id=item_id, cart_id=cart.id).first()
            if not cart_item:
                return jsonify({'error': 'Item not found in cart'}), 404

            # Validar stock
            product = Product.query.get(cart_item.product_id)
            if quantity > product.stock:
                return jsonify({'error': 'Insufficient stock'}), 400

            if quantity == 0:
                db.session.delete(cart_item)
            else:
                cart_item.quantity = quantity

            cart.updated_at = db.func.now()
            db.session.commit()

            return jsonify({'message': 'Cart updated successfully'}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api.route('/cart/remove/<int:item_id>', methods=['DELETE'])
    @jwt_required()
    def remove_from_cart(item_id):
        try:
            user_id = get_jwt_identity()

            # Encontrar el carrito del usuario
            cart = Cart.query.filter_by(user_id=user_id).first()
            if not cart:
                return jsonify({'error': 'Cart not found'}), 404

            # Encontrar y eliminar el item
            cart_item = CartItem.query.filter_by(
                id=item_id, cart_id=cart.id).first()
            if not cart_item:
                return jsonify({'error': 'Item not found in cart'}), 404

            db.session.delete(cart_item)
            cart.updated_at = db.func.now()
            db.session.commit()

            return jsonify({'message': 'Item removed from cart'}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api.route('/cart/clear', methods=['DELETE'])
    @jwt_required()
    def clear_cart():
        try:
            user_id = get_jwt_identity()

            cart = Cart.query.filter_by(user_id=user_id).first()
            if not cart:
                return jsonify({'message': 'Cart is already empty'}), 200

            CartItem.query.filter_by(cart_id=cart.id).delete()
            cart.updated_at = db.func.now()
            db.session.commit()

            return jsonify({'message': 'Cart cleared successfully'}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
