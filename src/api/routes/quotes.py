from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Product, Quote, QuoteItem, User


def setup_quotes_routes(api):
    @api.route('/quotes', methods=['POST'])
    @jwt_required()
    def create_quote():
        try:
            current_user_id = get_jwt_identity()
            data = request.get_json()
            product = Product.query.get(data['product_id'])

            if not product:
                return jsonify({'error': 'Product not found'}), 404

            # Calculate total price based on customizations
            base_price = product.price
            additional_cost = 0
            customizations = data.get('customization', {})

            # Process customizations and calculate additional costs
            for feature, option in customizations.items():
                if (product.features and
                    feature in product.features and
                        isinstance(product.features[feature], dict)):
                    feature_options = product.features[feature]
                    if option in feature_options:
                        additional_cost += feature_options[option].get(
                            'additional_cost', 0)

            total_price = base_price + additional_cost

            # Create quote
            quote = Quote(
                user_id=current_user_id,
                product_id=data['product_id'],
                customization=customizations,
                total_price=total_price,
                status='pending'
            )

            db.session.add(quote)
            db.session.commit()

            return jsonify({
                'message': 'Quote created successfully',
                'quote': {
                    'id': quote.id,
                    'total_price': total_price,
                    'status': quote.status,
                    'customization': quote.customization
                }
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api.route('/quotes', methods=['GET'])
    @jwt_required()
    def get_quotes():
        try:
            current_user_id = get_jwt_identity()
            quotes = Quote.query.filter_by(user_id=current_user_id).all()

            return jsonify({
                'quotes': [{
                    'id': q.id,
                    'product_name': q.product.name,
                    'total_price': q.total_price,
                    'status': q.status,
                    'customization': q.customization,
                    'created_at': q.created_at.isoformat()
                } for q in quotes]
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api.route('/quotes/<int:quote_id>', methods=['GET'])
    @jwt_required()
    def get_quote(quote_id):
        try:
            current_user_id = get_jwt_identity()
            quote = Quote.query.get(quote_id)

            if not quote or quote.user_id != current_user_id:
                return jsonify({'error': 'Quote not found'}), 404

            return jsonify({
                'quote': {
                    'id': quote.id,
                    'product': {
                        'id': quote.product.id,
                        'name': quote.product.name,
                        'description': quote.product.description,
                        'image_url': quote.product.image_url
                    },
                    'total_price': quote.total_price,
                    'status': quote.status,
                    'customization': quote.customization,
                    'created_at': quote.created_at.isoformat()
                }
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500
