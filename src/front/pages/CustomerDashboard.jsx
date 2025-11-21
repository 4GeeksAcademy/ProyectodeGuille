import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const CustomerDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="customer-dashboard">
            <div className="dashboard-header">
                <h1>Bienvenido, {user?.first_name}!</h1>
                <p>Tu portal para productos de lujo sostenible</p>
            </div>

            <div className="dashboard-actions">
                <Link to="/products" className="action-card">
                    <div className="action-icon">🛍️</div>
                    <h3>Explorar Productos</h3>
                    <p>Descubre nuestros yates, jets y autos ecológicos</p>
                </Link>

                <Link to="/quote-history" className="action-card">
                    <div className="action-icon">📋</div>
                    <h3>Mis Cotizaciones</h3>
                    <p>Revisa el historial de tus productos personalizados</p>
                </Link>

                <div className="action-card">
                    <div className="action-icon">👤</div>
                    <h3>Mi Perfil</h3>
                    <p>Gestiona tu información personal</p>
                </div>
            </div>

            <div className="recent-activity">
                <h2>Productos Destacados</h2>
                <div className="featured-products">
                    <div className="featured-item">
                        <span className="product-icon">⛵</span>
                        <div className="product-info">
                            <h4>Yates Solares</h4>
                            <p>Lujo y sostenibilidad en alta mar</p>
                        </div>
                    </div>
                    <div className="featured-item">
                        <span className="product-icon">✈️</span>
                        <div className="product-info">
                            <h4>Jets Ecológicos</h4>
                            <p>Viaja sin emisiones de carbono</p>
                        </div>
                    </div>
                    <div className="featured-item">
                        <span className="product-icon">🚗</span>
                        <div className="product-info">
                            <h4>Autos de Lujo Eléctricos</h4>
                            <p>Elegancia y tecnología sostenible</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;