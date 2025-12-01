import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
	return (
		<div className="home">
			<section className="hero">
				<div className="hero-content">
					<h1>Bienvenido a Nuestra Tienda Online</h1>
					<p>Descubre los mejores productos al mejor precio</p>
					<Link to="/products" className="btn btn-primary btn-large">
						Comprar Ahora
					</Link>
				</div>
			</section>

			<section className="features">
				<div className="container">
					<h2>¿Por Qué Elegirnos?</h2>
					<div className="features-grid">
						<div className="feature">
							<div className="feature-icon">🚚</div>
							<h3>Envío Rápido</h3>
							<p>Entrega en 24-48 horas</p>
						</div>
						<div className="feature">
							<div className="feature-icon">🛡️</div>
							<h3>Pago Seguro</h3>
							<p>Protegido con encriptación</p>
						</div>
						<div className="feature">
							<div className="feature-icon">📞</div>
							<h3>Soporte 24/7</h3>
							<p>Atención al cliente siempre</p>
						</div>
						<div className="feature">
							<div className="feature-icon">↩️</div>
							<h3>Devoluciones Fáciles</h3>
							<p>30 días para devoluciones</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Home