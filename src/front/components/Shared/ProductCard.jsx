import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const ProductCard = ({ product }) => {
    const { user, getToken } = useAuth()

    const addToCart = async () => {
        if (!user) {
            alert('Por favor inicia sesión para agregar productos al carrito')
            return
        }

        try {
            const token = getToken()
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: 1
                })
            })

            if (response.ok) {
                alert('Producto agregado al carrito')
            } else {
                const error = await response.json()
                alert(`Error: ${error.error}`)
            }
        } catch (error) {
            alert('Error al agregar al carrito')
        }
    }

    return (
        <div className="product-card">
            <div className="product-image">
                <img
                    src={product.image_url || 'https://via.placeholder.com/300x200'}
                    alt={product.name}
                />
            </div>
            <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">
                    {product.description.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description}
                </p>
                <div className="product-price">${product.price.toFixed(2)}</div>
                <div className="product-stock">
                    {product.stock > 0 ? `Disponible: ${product.stock}` : 'Agotado'}
                </div>
                <div className="product-actions">
                    <Link to={`/products/${product.id}`} className="btn btn-view">
                        Ver Detalles
                    </Link>
                    <button
                        onClick={addToCart}
                        className="btn btn-add"
                        disabled={product.stock === 0}
                    >
                        {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard