import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Importar la función que crea la app
from api import create_app

app = create_app()

# Configurar CORS para que funcione con tu frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configurar JWT
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "super-secret")
jwt = JWTManager(app)

# Health check endpoint


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running"}), 200

# Ruta de prueba


@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({"message": "Backend is working!", "status": "success"}), 200

# Manejar errores 404


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

# Manejar errores 500


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
