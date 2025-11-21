from flask import request, jsonify, session
from ..models import db, User
from ..utils import generate_sitemap, APIException
import bcrypt
from datetime import datetime


def setup_auth_routes(app):

    @app.route('/api/register', methods=['POST'])
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

            session['user_id'] = user.id

            return jsonify({
                'message': 'User registered successfully',
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

    @app.route('/api/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            user = User.query.filter_by(email=data['email']).first()

            if user and bcrypt.check_password_hash(user.password, data['password']):
                session['user_id'] = user.id
                return jsonify({
                    'message': 'Login successful',
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

    @app.route('/api/logout', methods=['POST'])
    def logout():
        session.pop('user_id', None)
        return jsonify({'message': 'Logout successful'}), 200

    @app.route('/api/user/profile', methods=['GET'])
    def get_profile():
        try:
            if 'user_id' not in session:
                return jsonify({'error': 'Not authenticated'}), 401

            user = User.query.get(session['user_id'])
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

    @app.route('/api/user/profile', methods=['PUT'])
    def update_profile():
        try:
            if 'user_id' not in session:
                return jsonify({'error': 'Not authenticated'}), 401

            user = User.query.get(session['user_id'])
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

    @app.route('/api/user/delete-account', methods=['DELETE'])
    def delete_account():
        try:
            if 'user_id' not in session:
                return jsonify({'error': 'Not authenticated'}), 401

            user = User.query.get(session['user_id'])
            if not user:
                return jsonify({'error': 'User not found'}), 404

            # En una implementación real, podrías querer soft delete
            db.session.delete(user)
            db.session.commit()
            session.pop('user_id', None)

            return jsonify({'message': 'Account deleted successfully'}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
