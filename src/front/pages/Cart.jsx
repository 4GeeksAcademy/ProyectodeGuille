import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Cart = () => {
    const { user, getToken } = useAuth()
    const navigate = useNavigate()
    const [cartItems, setCartItems] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchCart()
        } else {
            setLoading(false)
        }
    }, [user])

    const fetchCart = async () => {
        try {
            const token = getToken()
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setCartItems(data.items)
                setTotal(data.total)
            }
        } catch (error) {
            console.error('Error fetching cart:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId)
            return
        }

        try {
            const token = getToken()
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cart/update/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            })

            if (response.ok) {
                fetchCart()
            } else {
                const error = await response.json()
                alert(`Error: ${error.error}`)
            }
        } catch (error) {
            alert('Error al actualizar cantidad')
        }
    }

    const removeFromCart = async (itemId) => {
        try {
            const token = getToken()
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cart/remove/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                fetchCart()
            }
        } catch (error) {
            alert('Error al eliminar del carrito')
        }
    }

    const clearCart = async () => {
        if (!confirm('¿Estás seguro de que quieres vaciar el carrito?')) return

        try {
            const token = getToken()
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cart/clear`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                fetchCart()
            }
        } catch (error) {
            alert('Error al vaciar el carrito')
        }
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Cargando carrito...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="cart-empty">
                <h2>Inicia sesión para ver tu carrito</h2>
                <p>Necesitas una cuenta para agregar productos al carrito</p>
                <div className="auth-buttons">
                    <Link to="/login" className="btn btn-primary">
                        Iniciar Sesión
                    </Link>
                    <Link to="/register" className="btn btn-secondary">
                        Crear Cuenta
                    </Link>
                </div>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty">
                <h2>Tu carrito está vacío</h2>
                <p>Agrega algunos productos para comenzar</p>
                <Link to="/products" className="btn btn-primary">
                    Ver Productos
                </Link>
            </div>
        )
    }

    return (
        <div className="cart-page">
            <h1>Tu Carrito de Compras</h1>

            <div className="cart-content">
                <div className="cart-items">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                            <img
                                src={item.image_url || 'https://via.placeholder.com/100x100'}
                                alt={item.name}
                                className="item-image"
                            />

                            <div className="item-details">
                                <h3>{item.name}</h3>
                                <p className="item-price">${item.price.toFixed(2)}</p>
                                <p className="item-stock">Stock disponible: {item.stock}</p>

                                <div className="quantity-controls">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="item-subtotal">
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="remove-btn"
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    <div className="cart-actions">
                        <button onClick={clearCart} className="btn btn-clear">
                            Vaciar Carrito
                        </button>
                        <Link to="/products" className="btn btn-continue">
                            Continuar Comprando
                        </Link>
                    </div>
                </div>

                <div className="cart-summary">
                    <h3>Resumen del Pedido</h3>

                    <div className="summary-item">
                        <span>Subtotal:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <div className="summary-item">
                        <span>Envío:</span>
                        <span>Gratis</span>
                    </div>

                    <div className="summary-item total">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={() => navigate('/checkout')}
                        className="btn btn-checkout"
                    >
                        Proceder al Pago
                    </button>

                    <p className="secure-checkout">
                        🔒 Pago 100% seguro
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Cart