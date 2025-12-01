def register_blueprints(app):
    """Registrar todos los blueprints de la API"""

    try:
        # Importar blueprints
        from .routes.auth import auth_bp
        from .routes.products import products_bp
        from .routes.customers import customers_bp
        from .routes.business import business_bp
        from .routes.quotes import quotes_bp
        from .routes.analytics import analytics_bp
        from .routes.cart import cart_bp
        from .routes.orders import orders_bp
        from .routes.payments import payments_bp
        from .routes.inventory import inventory_bp

        # Registrar blueprints
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(products_bp, url_prefix='/api/products')
        app.register_blueprint(customers_bp, url_prefix='/api/customers')
        app.register_blueprint(business_bp, url_prefix='/api/business')
        app.register_blueprint(quotes_bp, url_prefix='/api/quotes')
        app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
        app.register_blueprint(cart_bp, url_prefix='/api/cart')
        app.register_blueprint(orders_bp, url_prefix='/api/orders')
        app.register_blueprint(payments_bp, url_prefix='/api/payments')
        app.register_blueprint(inventory_bp, url_prefix='/api/inventory')

        print("✅ Todos los blueprints registrados correctamente")

    except ImportError as e:
        print(f"⚠️  Error importando blueprints: {e}")
