from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Product, User


def setup_products_routes(api):
    @api.route('/products', methods=['GET'])
    def get_products():
        try:
            products = Product.query.filter_by(is_active=True).all()
            return jsonify({'products': [p.serialize() for p in products]}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api.route('/products/<int:product_id>', methods=['GET'])
    def get_product(product_id):
        try:
            product = Product.query.get(product_id)
            if not product or not product.is_active:
                return jsonify({'error': 'Product not found'}), 404
            return jsonify({'product': product.serialize()}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api.route('/products/categories', methods=['GET'])
    def get_categories():
        categories = ['electronics', 'clothing', 'books', 'home', 'sports']
        return jsonify({'categories': categories}), 200

    @api.route('/products', methods=['POST'])
    @jwt_required()
    def create_product():
        try:
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user or user.role != 'admin':
                return jsonify({'error': 'Unauthorized'}), 403

            data = request.get_json()
            product = Product(
                name=data['name'],
                description=data['description'],
                price=data['price'],
                category=data.get('category', 'general'),
                stock=data.get('stock', 0),
                image_url=data.get('image_url', '')
            )

            db.session.add(product)
            db.session.commit()

            return jsonify({
                'message': 'Product created successfully',
                'product': product.serialize()
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api.route('/products/<int:product_id>', methods=['PUT'])
    @jwt_required()
    def update_product(product_id):
        try:
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user or user.role != 'admin':
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
            if 'category' in data:
                product.category = data['category']
            if 'image_url' in data:
                product.image_url = data['image_url']

            db.session.commit()

            return jsonify({
                'message': 'Product updated successfully',
                'product': product.serialize()
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api.route('/products/<int:product_id>', methods=['DELETE'])
    @jwt_required()
    def delete_product(product_id):
        try:
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user or user.role != 'admin':
                return jsonify({'error': 'Unauthorized'}), 403

            product = Product.query.get(product_id)
            if not product:
                return jsonify({'error': 'Product not found'}), 404

            product.is_active = False
            db.session.commit()

            return jsonify({'message': 'Product deleted successfully'}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
