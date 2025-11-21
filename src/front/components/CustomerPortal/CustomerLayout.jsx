import React from "react";
import { useAuth } from '../../context/AuthContext.jsx';

const CustomerLayout = ({ children }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
            logout();
        }
    };

    return (
        <div className="customer-layout">
            <header className="luxury-header">
                <div className="header-brand">
                    <h1>🌱 EcoLuxury Configurator</h1>
                    <span>Lujo Responsable, Futuro Sostenible</span>
                </div>

                <nav className="customer-nav">
                    <a href="/customer" className="nav-link">
                        🏠 Dashboard
                    </a>
                    <a href="/customer/products" className="nav-link">
                        🛍️ Catálogo
                    </a>
                    <a href="/customer/quotes" className="nav-link">
                        📋 Mis Cotizaciones
                    </a>
                    <a href="/customer/profile" className="nav-link">
                        👤 Perfil
                    </a>
                </nav>

                <div className="user-menu">
                    <div className="user-info">
                        <span className="user-email">{user?.email}</span>
                        <span className="user-role">Cliente</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main className="customer-main">{children}</main>

            <footer className="luxury-footer">
                <div className="footer-content">
                    <div className="footer-mission">
                        <h3>Comprometidos con el Futuro</h3>
                        <p>
                            Cada configuración contribuye a un planeta más verde y un futuro
                            más sostenible
                        </p>
                    </div>
                    <div className="footer-stats">
                        <div className="footer-stat">
                            <span>500+</span>
                            <small>Clientes Satisfechos</small>
                        </div>
                        <div className="footer-stat">
                            <span>45,000t</span>
                            <small>CO2 Ahorrado</small>
                        </div>
                        <div className="footer-stat">
                            <span>100%</span>
                            <small>Energía Renovable</small>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 EcoLuxury Configurator. Lujo con Conciencia.</p>
                </div>
            </footer>
        </div>
    );
};

export default CustomerLayout;
