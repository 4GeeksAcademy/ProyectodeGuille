import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const getCategoryIcon = (category) => {
        const icons = {
            'yacht': '⛵',
            'private_jet': '✈️',
            'luxury_car': '🚗'
        };
        return icons[category] || '🌟';
    };

    const getTypeBadge = (productType) => {
        const types = {
            'solar': { label: 'Solar', class: 'solar-badge' },
            'electric': { label: 'Eléctrico', class: 'electric-badge' },
            'hybrid': { label: 'Híbrido', class: 'hybrid-badge' }
        };
        const type = types[productType] || types.solar;
        return <span className={`type-badge ${type.class}`}>{type.label}</span>;
    };

    return (
        <div className="product-card">
            <div className="product-image-container">
                <img
                    src={product.image_url || '/placeholder-yacht.jpg'}
                    alt={product.name}
                    className="product-image"
                />
                <div className="product-overlay">
                    {getCategoryIcon(product.category)}
                    {getTypeBadge(product.product_type)}
                    {product.is_eco_friendly && (
                        <div className="sustainability-badge">
                            <span className="eco-icon">🌱</span>
                            <span className="badge-text">ECO FRIENDLY</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">
                    {product.description.length > 120
                        ? `${product.description.substring(0, 120)}...`
                        : product.description
                    }
                </p>

                <div className="product-features">
                    {product.specifications && Object.entries(product.specifications)
                        .slice(0, 2)
                        .map(([key, value]) => (
                            <div key={key} className="feature">
                                <span className="feature-label">
                                    {key.replace(/_/g, ' ')}:
                                </span>
                                <span className="feature-value">{value}</span>
                            </div>
                        ))
                    }
                </div>

                <div className="product-footer">
                    <div className="price-section">
                        <span className="price">${product.price.toLocaleString()}</span>
                        <span className="stock">
                            {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                        </span>
                    </div>

                    <Link
                        to={`/products/${product.id}`}
                        className="customize-button"
                    >
                        Personalizar
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;