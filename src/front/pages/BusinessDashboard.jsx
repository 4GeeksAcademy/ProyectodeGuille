import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const BusinessDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="customer-dashboard">
            <div className="dashboard-header">
                <h1>Panel Empresarial</h1>
                <p>Bienvenido, {user?.company_name || user?.first_name}</p>
            </div>

            <div className="dashboard-actions">
                <div className="action-card">
                    <div className="action-icon">📊</div>
                    <h3>Analytics</h3>
                    <p>Métricas y estadísticas de ventas</p>
                </div>

                <div className="action-card">
                    <div className="action-icon">📦</div>
                    <h3>Gestión de Productos</h3>
                    <p>Administra tu catálogo de productos</p>
                </div>

                <div className="action-card">
                    <div className="action-icon">💬</div>
                    <h3>Cotizaciones</h3>
                    <p>Revisa y gestiona las cotizaciones de clientes</p>
                </div>
            </div>

            <div className="recent-activity">
                <h2>Resumen Rápido</h2>
                <div className="featured-products">
                    <div className="featured-item">
                        <span className="product-icon">💰</span>
                        <div className="product-info">
                            <h4>Ventas Totales</h4>
                            <p>Consulta el historial de ventas</p>
                        </div>
                    </div>
                    <div className="featured-item">
                        <span className="product-icon">📈</span>
                        <div className="product-info">
                            <h4>Tendencias</h4>
                            <p>Analiza el comportamiento del mercado</p>
                        </div>
                    </div>
                    <div className="featured-item">
                        <span className="product-icon">👥</span>
                        <div className="product-info">
                            <h4>Clientes</h4>
                            <p>Gestiona tu base de clientes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessDashboard;