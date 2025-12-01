import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Orders = () => {
    const { user, getToken } = useAuth()
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchOrders()
    }, [user, navigate])

    const fetchOrders = async () => {
        try {
            const token = getToken()
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setOrders(data.orders)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Cargando pedidos...</p>
            </div>
        )
    }

    return (
        <div className="orders-page">
            <h1>Mis Pedidos</h1>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <p>No tienes pedidos aún</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="btn btn-primary"
                    >
                        Ver Productos
                    </button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <div>
                                    <h3>Pedido #{order.id}</h3>
                                    <p className="order-date">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="order-status">
                                    <span className={`status-badge ${order.status}`}>
                                        {order.status === 'completed' ? 'Completado' :
                                            order.status === 'pending' ? 'Pendiente' : order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="order-details">
                                <div className="order-total">
                                    <strong>Total:</strong> ${order.total_amount.toFixed(2)}
                                </div>
                                <button
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                    className="btn btn-view"
                                >
                                    Ver Detalles
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Orders