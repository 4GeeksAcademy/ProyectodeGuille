import React, { useState } from "react";
import { useAuth } from '../../context/AuthContext.jsx';

const BusinessLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
            logout();
        }
    };

    return (
        <div className="business-layout">
            <aside className={`business-sidebar ${sidebarOpen ? "open" : "closed"}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <h2>📊 EcoLuxury Business</h2>
                        <span>Panel de Control Empresarial</span>
                    </div>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? "◀" : "▶"}
                    </button>
                </div>

                <nav className="business-nav">
                    <div className="nav-section">
                        <h4>ANALYTICS</h4>
                        <a href="/business" className="nav-item">
                            <span className="nav-icon">📈</span>
                            <span className="nav-label">Dashboard Principal</span>
                        </a>
                        <a href="/business/sustainability" className="nav-item">
                            <span className="nav-icon">🌱</span>
                            <span className="nav-label">Impacto Sostenible</span>
                        </a>
                        <a href="/business/sales" className="nav-item">
                            <span className="nav-icon">💰</span>
                            <span className="nav-label">Ventas & Revenue</span>
                        </a>
                        <a href="/business/customers" className="nav-item">
                            <span className="nav-icon">👥</span>
                            <span className="nav-label">Análisis de Clientes</span>
                        </a>
                    </div>

                    <div className="nav-section">
                        <h4>GESTIÓN</h4>
                        <a href="/business/products" className="nav-item">
                            <span className="nav-icon">🛍️</span>
                            <span className="nav-label">Gestión de Productos</span>
                        </a>
                        <a href="/business/quotes" className="nav-item">
                            <span className="nav-icon">📋</span>
                            <span className="nav-label">Cotizaciones</span>
                        </a>
                        <a href="/business/inventory" className="nav-item">
                            <span className="nav-icon">📦</span>
                            <span className="nav-label">Inventario</span>
                        </a>
                    </div>

                    <div className="nav-section">
                        <h4>REPORTES</h4>
                        <a href="/business/reports/sales" className="nav-item">
                            <span className="nav-icon">📄</span>
                            <span className="nav-label">Reportes de Ventas</span>
                        </a>
                        <a href="/business/reports/sustainability" className="nav-item">
                            <span className="nav-icon">🌍</span>
                            <span className="nav-label">Reportes Sostenibilidad</span>
                        </a>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <span className="company-name">
                            {user?.business_profile?.company_name || "Empresa"}
                        </span>
                        <span className="user-email">{user?.email}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main className="business-main">
                <header className="business-header">
                    <div className="header-actions">
                        <button className="btn-report">
                            <span className="btn-icon">📄</span>
                            Generar Reporte
                        </button>
                        <button className="btn-export">
                            <span className="btn-icon">📤</span>
                            Exportar Datos
                        </button>
                    </div>
                    <div className="header-info">
                        <span className="last-update">
                            Última actualización: Hoy,{" "}
                            {new Date().toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                </header>

                <div className="business-content">{children}</div>
            </main>
        </div>
    );
};

export default BusinessLayout;
