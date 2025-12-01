from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

auth_bp = Blueprint('auth', __name__)

# Usuarios de prueba
users_db = [
    {
        "id": 1,
        "email": "cliente@ejemplo.com",
        "password": generate_password_hash("123456"),
        "name": "Cliente Demo",
        "role": "customer"
    },
    {
        "id": 2,
        "email": "negocio@ejemplo.com",
        "password": generate_password_hash("123456"),
        "name": "Negocio Demo",
        "role": "business"
    }
]


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email y contraseña requeridos"}), 400

    # Buscar usuario
    user = next((u for u in users_db if u["email"] == data['email']), None)

    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({"error": "Credenciales inválidas"}), 401

    # Crear token JWT
    token = jwt.encode({
        'user_id': user['id'],
        'email': user['email'],
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, 'secret-key', algorithm='HS256')

    return jsonify({
        "token": token,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "role": user['role']
        }
    })


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json

    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({"error": "Todos los campos son requeridos"}), 400

    # Verificar si el usuario ya existe
    if any(u["email"] == data['email'] for u in users_db):
        return jsonify({"error": "El email ya está registrado"}), 400

    # Crear nuevo usuario
    new_user = {
        "id": len(users_db) + 1,
        "email": data['email'],
        "password": generate_password_hash(data['password']),
        "name": data['name'],
        "role": data.get('role', 'customer')
    }

    users_db.append(new_user)

    return jsonify({
        "message": "Usuario registrado exitosamente",
        "user": {
            "id": new_user['id'],
            "email": new_user['email'],
            "name": new_user['name'],
            "role": new_user['role']
        }
    }), 201


@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    token = request.headers.get('Authorization')

    if not token or not token.startswith('Bearer '):
        return jsonify({"error": "Token requerido"}), 401

    try:
        token = token.split(' ')[1]
        payload = jwt.decode(token, 'secret-key', algorithms=['HS256'])

        user = next(
            (u for u in users_db if u["id"] == payload['user_id']), None)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        return jsonify({
            "user": {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "role": user['role']
            }
        })

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Token inválido"}), 401
