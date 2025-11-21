import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/Shared/ProductCard.jsx';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [selectedCategory, selectedType, products]);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories);
                setProductTypes(data.product_types);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (selectedType !== 'all') {
            filtered = filtered.filter(p => p.product_type === selectedType);
        }

        setFilteredProducts(filtered);
    };

    if (loading) {
        return (
            <div className="catalog-loading">
                <div className="loading-spinner"></div>
                <p>Cargando productos de lujo sostenible...</p>
            </div>
        );
    }

    return (
        <div className="catalog-container">
            <div className="catalog-hero">
                <h1 className="hero-title">Descubre el Lujo Sostenible</h1>
                <p className="hero-subtitle">
                    Productos premium con tecnología ecológica de vanguardia.
                    Diseñados para el confort y el respeto al medio ambiente.
                </p>
            </div>

            <div className="catalog-filters">
                <div className="filter-group">
                    <label htmlFor="category-filter">Categoría:</label>
                    <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>
                                {cat.icon} {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="type-filter">Tipo de Energía:</label>
                    <select
                        id="type-filter"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="filter-select"
                    >
                        {productTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="products-grid">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="no-products">
                    <h3>No se encontraron productos</h3>
                    <p>Intenta con otros filtros o categorías</p>
                    <button
                        onClick={() => {
                            setSelectedCategory('all');
                            setSelectedType('all');
                        }}
                        className="reset-filters-btn"
                    >
                        Mostrar Todos los Productos
                    </button>
                </div>
            )}

            <div className="catalog-features">
                <div className="feature-card">
                    <div className="feature-icon">🌱</div>
                    <h4>Sostenibilidad Comprometida</h4>
                    <p>Todos nuestros productos utilizan energía 100% renovable y materiales ecológicos certificados</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <h4>Tecnología Avanzada</h4>
                    <p>Incorporamos las últimas innovaciones en energía solar, eléctrica y sistemas híbridos</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🎨</div>
                    <h4>Personalización Total</h4>
                    <p>Diseña cada detalle según tus preferencias, desde materiales hasta sistemas especializados</p>
                </div>
            </div>
        </div>
    );
};

export default ProductCatalog;