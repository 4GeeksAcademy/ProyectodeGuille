from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Product, User


def setup_products_routes(app):

    @app.route('/products', methods=['GET'])
    def get_products():
        try:
            category = request.args.get('category', 'all')
            product_type = request.args.get('type', 'all')

            query = Product.query.filter_by(is_active=True)

            if category != 'all':
                query = query.filter_by(category=category)

            if product_type != 'all':
                query = query.filter_by(product_type=product_type)

            products = query.all()

            return jsonify({
                'products': [{
                    'id': p.id,
                    'name': p.name,
                    'description': p.description,
                    'price': p.price,
                    'category': p.category,
                    'product_type': p.product_type,
                    'stock': p.stock,
                    'image_url': p.image_url,
                    'is_eco_friendly': p.is_eco_friendly,
                    'features': p.features,
                    'specifications': p.specifications
                } for p in products]
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/products/<int:product_id>', methods=['GET'])
    def get_product(product_id):
        try:
            product = Product.query.get(product_id)
            if not product or not product.is_active:
                return jsonify({'error': 'Product not found'}), 404

            return jsonify({
                'product': {
                    'id': product.id,
                    'name': product.name,
                    'description': product.description,
                    'price': product.price,
                    'category': product.category,
                    'product_type': product.product_type,
                    'stock': product.stock,
                    'image_url': product.image_url,
                    'is_eco_friendly': product.is_eco_friendly,
                    'features': product.features,
                    'specifications': product.specifications
                }
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/products/categories', methods=['GET'])
    def get_categories():
        try:
            categories = [
                {'value': 'yacht', 'label': 'Solar Yachts', 'icon': '⛵'},
                {'value': 'private_jet', 'label': 'Eco Private Jets', 'icon': '✈️'},
                {'value': 'luxury_car', 'label': 'Luxury Electric Cars', 'icon': '🚗'},
                {'value': 'all', 'label': 'All Products', 'icon': '🌟'}
            ]

            product_types = [
                {'value': 'solar', 'label': 'Solar Powered'},
                {'value': 'electric', 'label': 'Electric'},
                {'value': 'hybrid', 'label': 'Hybrid Eco'},
                {'value': 'all', 'label': 'All Types'}
            ]

            return jsonify({
                'categories': categories,
                'product_types': product_types
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/products', methods=['POST'])
    @jwt_required()
    def create_product():
        try:
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)

            if not user or user.role != 'business':
                return jsonify({'error': 'Unauthorized'}), 403

            data = request.get_json()
            product = Product(
                name=data['name'],
                description=data['description'],
                price=data['price'],
                category=data['category'],
                product_type=data.get('product_type', 'solar'),
                stock=data.get('stock', 1),
                image_url=data.get('image_url', ''),
                is_eco_friendly=data.get('is_eco_friendly', True),
                features=data.get('features', {}),
                specifications=data.get('specifications', {})
            )

            db.session.add(product)
            db.session.commit()

            return jsonify({
                'message': 'Product created successfully',
                'product_id': product.id
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/products/<int:product_id>', methods=['PUT'])
    @jwt_required()
    def update_product(product_id):
        try:
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)

            if not user or user.role != 'business':
                return jsonify({'error': 'Unauthorized'}), 403

            product = Product.query.get(product_id)
            if not product:
                return jsonify({'error': 'Product not found'}), 404

            data = request.get_json()

            if 'name' in data:
                product.name = data['name']
            if 'description' in data:
                product.description = data['description']
            if 'price' in data:
                product.price = data['price']
            if 'stock' in data:
                product.stock = data['stock']
            if 'image_url' in data:
                product.image_url = data['image_url']
            if 'features' in data:
                product.features = data['features']
            if 'specifications' in data:
                product.specifications = data['specifications']
            if 'is_eco_friendly' in data:
                product.is_eco_friendly = data['is_eco_friendly']

            db.session.commit()

            return jsonify({'message': 'Product updated successfully'}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
