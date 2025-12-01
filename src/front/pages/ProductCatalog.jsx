import React, { useState, useEffect } from 'react';
import ProductCard from '../components/Shared/ProductCard';
import { useGlobal } from '../hooks/useGlobalReducer';
import useBackend, { API_ENDPOINTS } from '../components/BackendURL';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { state, dispatch } = useGlobal();
    const { fetchFromBackend } = useBackend();

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, selectedCategory, searchTerm]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await fetchFromBackend(API_ENDPOINTS.PRODUCTS.LIST);

            setProducts(data);
            dispatch({ type: 'SET_PRODUCTS', payload: data });

            // Extraer categorías únicas
            const uniqueCategories = ['all', ...new Set(data.map(p => p.category).filter(Boolean))];
            setCategories(uniqueCategories);
        } catch (err) {
            setError('Error al cargar los productos');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    };

    const handleAddToCart = async (product) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                alert('Por favor, inicia sesión para agregar productos al carrito');
                return;
            }

            await fetchFromBackend(API_ENDPOINTS.CART.ADD, {
                method: 'POST',
                body: JSON.stringify({
                    user_id: user.id,
                    product_id: product.id,
                    quantity: 1
                })
            });

            // Actualizar estado local
            dispatch({
                type: 'ADD_TO_CART',
                payload: {
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url
                }
            });

            alert('Producto agregado al carrito');
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Error al agregar al carrito');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={fetchProducts}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Catálogo de Productos</h1>

            {/* Filtros y búsqueda */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtro por categoría */}
                    <div className="flex items-center gap-4">
                        <label className="text-gray-700">Categoría:</label>
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'Todas las categorías' : category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Contador de productos */}
            <div className="mb-6">
                <p className="text-gray-600">
                    Mostrando {filteredProducts.length} de {products.length} productos
                </p>
            </div>

            {/* Grid de productos */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No se encontraron productos</p>
                    <button
                        onClick={() => {
                            setSelectedCategory('all');
                            setSearchTerm('');
                        }}
                        className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                        Limpiar filtros
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={() => handleAddToCart(product)}
                        />
                    ))}
                </div>
            )}

            {/* Sostenibilidad */}
            <div className="mt-12 bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-green-800 mb-4">Compra Sostenible</h2>
                <p className="text-green-700">
                    Cada producto tiene una puntuación de sostenibilidad. Cuanto más alta sea la puntuación,
                    más amigable es el producto con el medio ambiente.
                </p>
            </div>
        </div>
    );
};

export default ProductCatalog;