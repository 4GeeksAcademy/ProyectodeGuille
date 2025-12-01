from flask import Blueprint, jsonify

business_bp = Blueprint('business', __name__)


@business_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    return jsonify({
        "message": "Dashboard del negocio",
        "metrics": {
            "total_products": 10,
            "total_quotes": 25,
            "total_orders": 15,
            "total_revenue": 5000.00,
            "this_month": {
                "quotes": 5,
                "orders": 3,
                "revenue": 1500.00
            }
        }
    })
