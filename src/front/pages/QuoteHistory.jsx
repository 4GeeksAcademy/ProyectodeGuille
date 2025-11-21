import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const QuoteHistory = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, getToken } = useAuth();

    useEffect(() => {
        if (user) {
            fetchQuotes();
        }
    }, [user]);

    const fetchQuotes = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/quotes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setQuotes(data.quotes);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { class: 'status-pending', label: 'Pendiente' },
            'approved': { class: 'status-approved', label: 'Aprobada' },
            'rejected': { class: 'status-rejected', label: 'Rechazada' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <span className={`status-badge ${config.class}`}>{config.label}</span>;
    };

    if (loading) {
        return (
            <div className="quotes-loading">
                <div className="loading-spinner"></div>
                <p>Cargando tus cotizaciones...</p>
            </div>
        );
    }

    return (
        <div className="quote-history-container">
            <div className="quotes-header">
                <h1>Mis Cotizaciones</h1>
                <p>Historial de tus productos personalizados</p>
            </div>

            {quotes.length === 0 ? (
                <div className="no-quotes">
                    <div className="no-quotes-icon">📋</div>
                    <h3>No tienes cotizaciones aún</h3>
                    <p>Personaliza un producto para crear tu primera cotización</p>
                    <button
                        onClick={() => window.location.href = '/products'}
                        className="browse-products-btn"
                    >
                        Explorar Productos
                    </button>
                </div>
            ) : (
                <div className="quotes-list">
                    {quotes.map(quote => (
                        <div key={quote.id} className="quote-card">
                            <div className="quote-header">
                                <h3>{quote.product_name}</h3>
                                {getStatusBadge(quote.status)}
                            </div>

                            <div className="quote-details">
                                <div className="quote-price">
                                    <strong>Total:</strong> ${quote.total_price.toLocaleString()}
                                </div>
                                <div className="quote-date">
                                    <strong>Creada:</strong> {new Date(quote.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            {quote.customization && Object.keys(quote.customization).length > 0 && (
                                <div className="customization-details">
                                    <h4>Personalizaciones:</h4>
                                    <div className="customization-list">
                                        {Object.entries(quote.customization).map(([feature, option]) => (
                                            <div key={feature} className="customization-item">
                                                <span className="feature-name">
                                                    {feature.replace(/_/g, ' ').toUpperCase()}:
                                                </span>
                                                <span className="option-value">{option}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="quote-actions">
                                <button className="view-details-btn">
                                    Ver Detalles
                                </button>
                                {quote.status === 'pending' && (
                                    <button className="contact-support-btn">
                                        Contactar Soporte
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuoteHistory;