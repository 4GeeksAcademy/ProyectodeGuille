from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, User, Product, Quote


def setup_business_routes(api):
    @api.route('/business/products', methods=['GET'])
    @jwt_required()
    def get_business_products():
        try:
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)

            if not user or user.role != 'business':
                return jsonify({'error': 'Unauthorized'}), 403

            products = Product.query.filter_by(is_active=True).all()

            return jsonify({
                'products': [{
                    'id': p.id,
                    'name': p.name,
                    'price': p.price,
                    'category': p.category,
                    'stock': p.stock,
                    'total_quotes': len(p.quotes)
                } for p in products]
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api.route('/business/quotes', methods=['GET'])
    @jwt_required()
    def get_business_quotes():
        try:
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)

            if not user or user.role != 'business':
                return jsonify({'error': 'Unauthorized'}), 403

            quotes = Quote.query.all()

            return jsonify({
                'quotes': [{
                    'id': q.id,
                    'customer_name': f"{q.user.first_name} {q.user.last_name}",
                    'product_name': q.product.name,
                    'total_price': q.total_price,
                    'status': q.status,
                    'created_at': q.created_at.isoformat()
                } for q in quotes]
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500
