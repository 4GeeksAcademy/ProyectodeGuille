import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Checkout = () => {
    const { user, getToken } = useAuth()
    const navigate = useNavigate()
    const [cartItems, setCartItems] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [orderId, setOrderId] = useState(null)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchCart()
    }, [user, navigate])

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
                if (data.items.length === 0) {
                    navigate('/cart')
                    return
                }
                setCartItems(data.items)
                setTotal(data.total)
            }
        } catch (error) {
            console.error('Error fetching cart:', error)
        } finally {
            setLoading(false)
        }
    }

    const processPayment = async () => {
        if (!user) {
            alert('Por favor inicia sesión para continuar')
            navigate('/login')
            return
        }

        if (cartItems.length === 0) {
            alert('Tu carrito está vacío')
            navigate('/products')
            return
        }

        setProcessing(true)
        try {
            const token = getToken()

            // Crear payment intent
            const paymentResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/checkout/create-payment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!paymentResponse.ok) {
                const error = await paymentResponse.json()
                throw new Error(error.error || 'Error al crear pago')
            }

            const paymentData = await paymentResponse.json()
            setOrderId(paymentData.order_id)

            // Simular pago exitoso (en producción usarías Stripe Elements)
            alert('Pago simulado exitoso. Redirigiendo...')

            // Confirmar pago
            const confirmResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/checkout/confirm`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order_id: paymentData.order_id })
            })

            if (confirmResponse.ok) {
                const orderData = await confirmResponse.json()
                alert(`¡Pago exitoso! Orden #${orderData.order.id} creada`)
                navigate('/orders')
            } else {
                const error = await confirmResponse.json()
                alert(`Error al confirmar pago: ${error.error}`)
            }
        } catch (error) {
            alert(`Error: ${error.message}`)
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Cargando checkout...</p>
            </div>
        )
    }

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>

            <div className="checkout-content">
                <div className="order-summary">
                    <h3>Resumen de tu Pedido</h3>

                    <div className="order-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="order-item">
                                <div className="item-info">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-quantity">x{item.quantity}</span>
                                </div>
                                <span className="item-price">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="order-totals">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>Envío:</span>
                            <span>Gratis</span>
                        </div>
                        <div className="total-row grand-total">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="payment-section">
                    <h3>Información de Pago</h3>

                    <div className="payment-methods">
                        <div className="payment-method active">
                            <div className="method-icon">💳</div>
                            <div className="method-info">
                                <h4>Tarjeta de Crédito/Débito</h4>
                                <p>Pago seguro con Stripe</p>
                            </div>
                        </div>
                    </div>

                    <div className="payment-form">
                        <div className="form-group">
                            <label>Número de Tarjeta</label>
                            <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value="4242 4242 4242 4242" // Demo
                                readOnly
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Fecha de Expiración</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value="12/34"
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label>CVC</label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    value="123"
                                    readOnly
                                />
                            </div>
                        </div>

                        <button
                            onClick={processPayment}
                            disabled={processing}
                            className="btn btn-pay"
                        >
                            {processing ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
                        </button>

                        <p className="demo-notice">
                            ⚠️ Este es un checkout de demostración. No se procesarán pagos reales.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout