import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobal } from '../hooks/useGlobalReducer';
import useBackend, { API_ENDPOINTS } from '../components/BackendURL';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [total, setTotal] = useState(0);

    const { state } = useGlobal();
    const { fetchFromBackend } = useBackend();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        calculateTotal();
    }, [cartItems]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user'));

            if (!user) {
                navigate('/login');
                return;
            }

            const data = await fetchFromBackend(API_ENDPOINTS.CART.GET, {
                method: 'GET'
            });

            setCartItems(data.cart || []);
            setTotal(data.total || 0);
        } catch (err) {
            setError('Error al cargar el carrito');
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        const newTotal = cartItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
        setTotal(newTotal);
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            await handleRemoveItem(itemId);
            return;
        }

        try {
            await fetchFromBackend(`/cart/update/${itemId}`, {
                method: 'PUT',
                body: JSON.stringify({ quantity: newQuantity })
            });

            setCartItems(items =>
                items.map(item =>
                    item.cart_item_id === itemId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );
        } catch (err) {
            console.error('Error updating quantity:', err);
            alert('Error al actualizar la cantidad');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await fetchFromBackend(API_ENDPOINTS.CART.REMOVE(itemId), {
                method: 'DELETE'
            });

            setCartItems(items => items.filter(item => item.cart_item_id !== itemId));
        } catch (err) {
            console.error('Error removing item:', err);
            alert('Error al remover el producto');
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('El carrito está vacío');
            return;
        }
        navigate('/checkout');
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
                    onClick={fetchCart}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Tu Carrito de Compras</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🛒</div>
                    <p className="text-gray-600 text-lg mb-6">Tu carrito está vacío</p>
                    <Link
                        to="/products"
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Explorar Productos
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Lista de productos */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold mb-6">Productos ({cartItems.length})</h2>

                                    <div className="space-y-4">
                                        {cartItems.map(item => (
                                            <div key={item.cart_item_id} className="flex items-center border-b pb-4">
                                                {/* Imagen */}
                                                <div className="w-24 h-24 mr-4">
                                                    <img
                                                        src={item.image_url || 'https://via.placeholder.com/100'}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                </div>

                                                {/* Información */}
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                                                    <p className="text-gray-600">${item.price.toFixed(2)} cada uno</p>

                                                    {/* Controles de cantidad */}
                                                    <div className="flex items-center mt-2">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                                                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-300">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r"
                                                        >
                                                            +
                                                        </button>

                                                        <button
                                                            onClick={() => handleRemoveItem(item.cart_item_id)}
                                                            className="ml-4 text-red-500 hover:text-red-700"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Subtotal */}
                                                <div className="text-right">
                                                    <p className="font-semibold text-lg">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resumen del pedido */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                <h2 className="text-xl font-semibold mb-6">Resumen del Pedido</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Envío</span>
                                        <span className="text-green-600">Gratis</span>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors mb-4"
                                >
                                    Proceder al Pago
                                </button>

                                <Link
                                    to="/products"
                                    className="block text-center text-blue-500 hover:text-blue-700"
                                >
                                    ← Continuar comprando
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;