from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import db, User
from ..utils import generate_sitemap, APIException
import bcrypt
from datetime import datetime, timedelta


def setup_auth_routes(api):
    @api.route('/register', methods=['POST'])
    def register():
        try:
            data = request.get_json()

            # Validaciones
            if not data.get('email') or not data.get('password'):
                return jsonify({'error': 'Email and password are required'}), 400

            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already registered'}), 400

            # Crear usuario
            hashed_password = bcrypt.hashpw(data['password'].encode(
                'utf-8'), bcrypt.gensalt()).decode('utf-8')
            user = User(
                email=data['email'],
                password=hashed_password,
                first_name=data['first_name'],
                last_name=data['last_name'],
                phone=data.get('phone', ''),
                company_name=data.get('company_name', ''),
                role=data.get('role', 'customer')
            )

            db.session.add(user)
            db.session.commit()

            # Crear token JWT
            access_token = create_access_token(
                identity=user.id,
                expires_delta=timedelta(days=7)
            )

            return jsonify({
                'message': 'User registered successfully',
                'access_token': access_token,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'company_name': user.company_name
                }
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api.route('/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            user = User.query.filter_by(email=data['email']).first()

            if user and bcrypt.check_password_hash(user.password, data['password']):
                # Crear token JWT
                access_token = create_access_token(
                    identity=user.id,
                    expires_delta=timedelta(days=7)
                )

                return jsonify({
                    'message': 'Login successful',
                    'access_token': access_token,
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role,
                        'company_name': user.company_name
                    }
                }), 200
            else:
                return jsonify({'error': 'Invalid credentials'}), 401

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api.route('/logout', methods=['POST'])
    @jwt_required()
    def logout():
        # Con JWT, el logout se maneja en el frontend eliminando el token
        return jsonify({'message': 'Logout successful'}), 200

    @api.route('/user/profile', methods=['GET'])
    @jwt_required()
    def get_profile():
        try:
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)

            if not user:
                return jsonify({'error': 'User not found'}), 404

            return jsonify({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone': user.phone,
                    'company_name': user.company_name,
                    'role': user.role,
                    'created_at': user.created_at.isoformat()
                }
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api.route('/user/profile', methods=['PUT'])
    @jwt_required()
    def update_profile():
        try:
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)

            if not user:
                return jsonify({'error': 'User not found'}), 404

            data = request.get_json()

            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.phone = data.get('phone', user.phone)
            user.company_name = data.get('company_name', user.company_name)

            db.session.commit()

            return jsonify({
                'message': 'Profile updated successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone': user.phone,
                    'company_name': user.company_name,
                    'role': user.role
                }
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @api.route('/user/delete-account', methods=['DELETE'])
    @jwt_required()
    def delete_account():
        try:
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)

            if not user:
                return jsonify({'error': 'User not found'}), 404

            # Soft delete - mark as inactive
            user.is_active = False
            db.session.commit()

            return jsonify({'message': 'Account deleted successfully'}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
