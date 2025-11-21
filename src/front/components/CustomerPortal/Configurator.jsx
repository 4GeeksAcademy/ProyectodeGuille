import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Configurator = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user, getToken } = useAuth();

    const [product, setProduct] = useState(null);
    const [customization, setCustomization] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [savingQuote, setSavingQuote] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    useEffect(() => {
        calculateTotalPrice();
    }, [customization, product]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/${productId}`);
            if (response.ok) {
                const data = await response.json();
                setProduct(data.product);

                // Initialize default customizations
                if (data.product.features) {
                    const defaultCustomization = {};
                    Object.keys(data.product.features).forEach(key => {
                        const options = data.product.features[key];
                        if (typeof options === 'object' && !Array.isArray(options)) {
                            defaultCustomization[key] = Object.keys(options)[0];
                        }
                    });
                    setCustomization(defaultCustomization);
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalPrice = () => {
        if (!product) return;

        let price = product.price;

        // Calculate additional costs from customizations
        Object.keys(customization).forEach(key => {
            const selectedOption = customization[key];
            const featureOptions = product.features[key];

            if (typeof featureOptions === 'object' && featureOptions[selectedOption]) {
                price += featureOptions[selectedOption].additional_cost || 0;
            }
        });

        setTotalPrice(price);
    };

    const handleCustomizationChange = (feature, value) => {
        setCustomization(prev => ({
            ...prev,
            [feature]: value
        }));
    };

    const saveQuote = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setSavingQuote(true);
        try {
            const token = getToken();
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/quotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: parseInt(productId),
                    customization: customization
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert('Cotización guardada exitosamente!');
                navigate('/quote-history');
            } else {
                const error = await response.json();
                alert('Error: ' + error.error);
            }
        } catch (error) {
            alert('Error al guardar la cotización');
        } finally {
            setSavingQuote(false);
        }
    };

    if (loading) {
        return (
            <div className="configurator-loading">
                <div className="loading-spinner"></div>
                <p>Cargando configurador...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="configurator-error">
                <h2>Producto no encontrado</h2>
                <button onClick={() => navigate('/products')} className="back-button">
                    Volver al Catálogo
                </button>
            </div>
        );
    }

    return (
        <div className="configurator-container">
            <div className="configurator-header">
                <h1>Personaliza tu {product.name}</h1>
                <p>Diseña el producto de lujo sostenible de tus sueños</p>
            </div>

            <div className="configurator-layout">
                <div className="product-preview-section">
                    <div className="product-image-container">
                        <img
                            src={product.image_url || '/placeholder-yacht.jpg'}
                            alt={product.name}
                            className="product-image"
                        />
                        {product.is_eco_friendly && (
                            <div className="eco-badge">🌱 ECO FRIENDLY</div>
                        )}
                    </div>

                    <div className="price-summary">
                        <h3>Resumen de Precio</h3>
                        <div className="price-breakdown">
                            <div className="price-line">
                                <span>Precio Base:</span>
                                <span>${product.price.toLocaleString()}</span>
                            </div>
                            {Object.keys(customization).map(feature => {
                                const option = customization[feature];
                                const featureData = product.features[feature];
                                const additionalCost = featureData && featureData[option] ? featureData[option].additional_cost : 0;

                                if (additionalCost > 0) {
                                    return (
                                        <div key={feature} className="price-line">
                                            <span>{feature}:</span>
                                            <span>+${additionalCost.toLocaleString()}</span>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                            <div className="price-line total">
                                <span>Total:</span>
                                <span>${totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="customization-section">
                    <div className="customization-options">
                        <h3>Opciones de Personalización</h3>

                        {product.features && Object.entries(product.features).map(([feature, options]) => (
                            <div key={feature} className="feature-group">
                                <h4 className="feature-title">
                                    {feature.replace(/_/g, ' ').toUpperCase()}
                                </h4>

                                <div className="options-grid">
                                    {Object.entries(options).map(([option, details]) => (
                                        <div
                                            key={option}
                                            className={`option-card ${customization[feature] === option ? 'selected' : ''}`}
                                            onClick={() => handleCustomizationChange(feature, option)}
                                        >
                                            <div className="option-header">
                                                <h5>{option.replace(/_/g, ' ').toUpperCase()}</h5>
                                                {details.additional_cost > 0 && (
                                                    <span className="additional-cost">
                                                        +${details.additional_cost.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            {details.description && (
                                                <p className="option-description">{details.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="action-buttons">
                        <button
                            onClick={saveQuote}
                            disabled={savingQuote}
                            className="save-quote-btn primary"
                        >
                            {savingQuote ? 'Guardando...' : 'Guardar Cotización'}
                        </button>
                        <button
                            onClick={() => navigate('/products')}
                            className="back-btn secondary"
                        >
                            Volver al Catálogo
                        </button>
                    </div>
                </div>
            </div>

            {product.specifications && (
                <div className="specifications-section">
                    <h3>Especificaciones Técnicas</h3>
                    <div className="specs-grid">
                        {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="spec-item">
                                <span className="spec-label">
                                    {key.replace(/_/g, ' ').toUpperCase()}:
                                </span>
                                <span className="spec-value">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Configurator;