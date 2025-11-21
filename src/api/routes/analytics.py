from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, User, Product, Quote
from datetime import datetime, timedelta


def setup_analytics_routes(api):
    @api.route('/analytics/overview', methods=['GET'])
    @jwt_required()
    def get_analytics_overview():
        try:
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)

            if not user or user.role != 'business':
                return jsonify({'error': 'Unauthorized'}), 403

            # Estadísticas básicas
            total_products = Product.query.filter_by(is_active=True).count()
            total_quotes = Quote.query.count()
            pending_quotes = Quote.query.filter_by(status='pending').count()

            # Ventas totales
            total_sales = db.session.query(db.func.sum(Quote.total_price)).filter(
                Quote.status == 'approved'
            ).scalar() or 0

            # Productos más populares
            popular_products = db.session.query(
                Product.name,
                db.func.count(Quote.id).label('quote_count')
            ).join(Quote).group_by(Product.id).order_by(
                db.func.count(Quote.id).desc()
            ).limit(5).all()

            return jsonify({
                'overview': {
                    'total_products': total_products,
                    'total_quotes': total_quotes,
                    'pending_quotes': pending_quotes,
                    'total_sales': total_sales,
                    'popular_products': [
                        {'name': name, 'quotes': quote_count}
                        for name, quote_count in popular_products
                    ]
                }
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500
