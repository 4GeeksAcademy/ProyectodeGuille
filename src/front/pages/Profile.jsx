import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Profile = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
    }, [user, navigate])

    if (!user) {
        return null
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h1>Mi Perfil</h1>
                <button onClick={logout} className="btn btn-logout">
                    Cerrar Sesión
                </button>
            </div>

            <div className="profile-content">
                <div className="profile-info">
                    <div className="info-item">
                        <strong>Nombre:</strong> {user.first_name || 'No especificado'}
                    </div>
                    <div className="info-item">
                        <strong>Apellido:</strong> {user.last_name || 'No especificado'}
                    </div>
                    <div className="info-item">
                        <strong>Email:</strong> {user.email}
                    </div>
                    <div className="info-item">
                        <strong>Teléfono:</strong> {user.phone || 'No especificado'}
                    </div>
                    <div className="info-item">
                        <strong>Rol:</strong> {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </div>
                </div>

                <div className="profile-actions">
                    <button
                        onClick={() => navigate('/orders')}
                        className="btn btn-primary"
                    >
                        Ver Mis Pedidos
                    </button>
                    <button
                        onClick={() => navigate('/cart')}
                        className="btn btn-secondary"
                    >
                        Ver Carrito
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Profile