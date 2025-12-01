from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import db, User
import bcrypt
from datetime import timedelta


def setup_auth_routes(api):
    @api.route('/register', methods=['POST'])
    def register():
        try:
            data = request.get_json()

            if not data.get('email') or not data.get('password'):
                return jsonify({'error': 'Email and password are required'}), 400

            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already registered'}), 400

            hashed_password = bcrypt.hashpw(data['password'].encode(
                'utf-8'), bcrypt.gensalt()).decode('utf-8')
            user = User(
                email=data['email'],
                password=hashed_password,
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                phone=data.get('phone', ''),
                role=data.get('role', 'customer')
            )

            db.session.add(user)
            db.session.commit()

            access_token = create_access_token(
                identity=user.id, expires_delta=timedelta(days=7))

            return jsonify({
                'message': 'User registered successfully',
                'access_token': access_token,
                'user': user.serialize()
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
                access_token = create_access_token(
                    identity=user.id, expires_delta=timedelta(days=7))
                return jsonify({
                    'message': 'Login successful',
                    'access_token': access_token,
                    'user': user.serialize()
                }), 200
            else:
                return jsonify({'error': 'Invalid credentials'}), 401

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api.route('/user/profile', methods=['GET'])
    @jwt_required()
    def get_profile():
        try:
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                return jsonify({'error': 'User not found'}), 404

            return jsonify({'user': user.serialize()}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @api.route('/logout', methods=['POST'])
    @jwt_required()
    def logout():
        return jsonify({'message': 'Logout successful'}), 200
