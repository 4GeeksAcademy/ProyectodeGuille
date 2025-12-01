from flask import Blueprint, jsonify
from datetime import datetime, timedelta
import random

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/dashboard', methods=['GET'])
def get_analytics_dashboard():
    """Obtener dashboard de analytics para negocio"""

    # Datos simulados para analytics
    today = datetime.now()

    # Visitas últimos 30 días
    visits_last_30_days = [
        {
            "date": (today - timedelta(days=i)).strftime("%Y-%m-%d"),
            "visits": random.randint(50, 200)
        }
        for i in range(30, -1, -1)
    ]

    # Conversiones (cotizaciones a órdenes)
    conversion_data = [
        {
            "month": "Ene",
            "quotes": random.randint(20, 40),
            "orders": random.randint(5, 15),
            "conversion_rate": random.uniform(20, 40)
        },
        {
            "month": "Feb",
            "quotes": random.randint(25, 45),
            "orders": random.randint(8, 18),
            "conversion_rate": random.uniform(25, 45)
        },
        {
            "month": "Mar",
            "quotes": random.randint(30, 50),
            "orders": random.randint(10, 20),
            "conversion_rate": random.uniform(30, 50)
        },
        {
            "month": "Abr",
            "quotes": random.randint(35, 55),
            "orders": random.randint(12, 22),
            "conversion_rate": random.uniform(35, 55)
        }
    ]

    # Métricas principales
    main_metrics = {
        "total_revenue": 15250.75,
        "total_orders": 124,
        "total_quotes": 312,
        "avg_order_value": 123.0,
        "customer_satisfaction": 4.5,
        "monthly_growth": 15.5
    }

    # Productos más populares
    top_products = [
        {"id": 1, "name": "Producto Premium", "sales": 45, "revenue": 6750.00},
        {"id": 2, "name": "Producto Básico", "sales": 38, "revenue": 3800.00},
        {"id": 3, "name": "Producto Eco", "sales": 25, "revenue": 3750.00},
        {"id": 4, "name": "Producto Deluxe", "sales": 16, "revenue": 4800.00}
    ]

    # Análisis de sostenibilidad
    sustainability_impact = {
        "co2_saved_kg": 1250,
        "trees_equivalent": 62,
        "water_saved_liters": 8500,
        "waste_reduced_kg": 420
    }

    return jsonify({
        "success": True,
        "data": {
            "main_metrics": main_metrics,
            "visits_last_30_days": visits_last_30_days,
            "conversion_data": conversion_data,
            "top_products": top_products,
            "sustainability_impact": sustainability_impact,
            "timestamp": datetime.utcnow().isoformat()
        }
    })


@analytics_bp.route('/realtime', methods=['GET'])
def get_realtime_metrics():
    """Obtener métricas en tiempo real"""

    current_time = datetime.now()

    return jsonify({
        "success": True,
        "data": {
            "active_users": random.randint(5, 25),
            "quotes_today": random.randint(3, 15),
            "orders_today": random.randint(1, 8),
            "revenue_today": round(random.uniform(200, 1500), 2),
            "avg_response_time": random.uniform(1.5, 5.5),
            "system_status": "operational",
            "last_updated": current_time.strftime("%H:%M:%S")
        }
    })


@analytics_bp.route('/customer-insights', methods=['GET'])
def get_customer_insights():
    """Obtener insights de clientes"""

    customer_segments = [
        {"segment": "Eco-Conscious", "percentage": 35, "avg_order": 145.50},
        {"segment": "Price-Sensitive", "percentage": 28, "avg_order": 89.75},
        {"segment": "Premium Buyers", "percentage": 22, "avg_order": 210.25},
        {"segment": "Bulk Purchasers", "percentage": 15, "avg_order": 450.00}
    ]

    retention_metrics = {
        "repeat_customers": 65,
        "new_customers": 35,
        "avg_retention_days": 45,
        "churn_rate": 12.5
    }

    geographic_distribution = [
        {"region": "Norte", "customers": 125, "revenue": 42500},
        {"region": "Sur", "customers": 98, "revenue": 31200},
        {"region": "Este", "customers": 156, "revenue": 52100},
        {"region": "Oeste", "customers": 87, "revenue": 28500}
    ]

    return jsonify({
        "success": True,
        "data": {
            "customer_segments": customer_segments,
            "retention_metrics": retention_metrics,
            "geographic_distribution": geographic_distribution
        }
    })


@analytics_bp.route('/sustainability-report', methods=['GET'])
def get_sustainability_report():
    """Reporte de impacto de sostenibilidad"""

    monthly_impact = [
        {
            "month": "Enero",
            "co2_saved": 95,
            "products_sold": 42,
            "sustainability_score": 78
        },
        {
            "month": "Febrero",
            "co2_saved": 110,
            "products_sold": 48,
            "sustainability_score": 82
        },
        {
            "month": "Marzo",
            "co2_saved": 125,
            "products_sold": 55,
            "sustainability_score": 85
        },
        {
            "month": "Abril",
            "co2_saved": 140,
            "products_sold": 62,
            "sustainability_score": 88
        }
    ]

    environmental_benefits = {
        "total_co2_saved_kg": 1250,
        "equivalent_trees": 62,
        "plastic_waste_reduced_kg": 850,
        "water_saved_liters": 12500,
        "energy_saved_kwh": 4200
    }

    product_sustainability = [
        {"product": "Producto A", "score": 92, "impact": "Alto"},
        {"product": "Producto B", "score": 85, "impact": "Medio-Alto"},
        {"product": "Producto C", "score": 78, "impact": "Medio"},
        {"product": "Producto D", "score": 65, "impact": "Medio-Bajo"}
    ]

    return jsonify({
        "success": True,
        "data": {
            "monthly_impact": monthly_impact,
            "environmental_benefits": environmental_benefits,
            "product_sustainability": product_sustainability,
            "certifications": ["Eco-Friendly", "Carbon Neutral", "Sustainable Materials"],
            "goals": {
                "target_co2_reduction": 2000,
                "current_progress": 62.5,
                "target_date": "2024-12-31"
            }
        }
    })
