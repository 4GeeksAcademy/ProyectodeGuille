import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
	const { user, logout } = useAuth()

	return (
		<nav className="navbar">
			<div className="navbar-container">
				<Link to="/" className="navbar-brand">
					🛒 Ecommerce
				</Link>

				<div className="navbar-menu">
					<Link to="/products" className="nav-link">
						Productos
					</Link>
					<Link to="/cart" className="nav-link">
						🛒 Carrito
					</Link>

					{user ? (
						<>
							<Link to="/profile" className="nav-link">
								👤 Perfil
							</Link>
							<Link to="/orders" className="nav-link">
								📦 Pedidos
							</Link>
							<button onClick={logout} className="nav-link btn-logout">
								Cerrar Sesión
							</button>
						</>
					) : (
						<>
							<Link to="/login" className="nav-link">
								Iniciar Sesión
							</Link>
							<Link to="/register" className="nav-link btn-register">
								Registrarse
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	)
}

export default Navbar