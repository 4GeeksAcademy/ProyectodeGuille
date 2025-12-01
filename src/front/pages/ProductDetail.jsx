import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProductDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, getToken } = useAuth()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        fetchProduct()
    }, [id])

    const fetchProduct = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/${id}`)
            if (response.ok) {
                const data = await response.json()
                setProduct(data.product)
            }
        } catch (error) {
            console.error('Error fetching product:', error)
        } finally {
            setLoading(false)
        }
    }

    const addToCart = async () => {
        if (!user) {
            alert('Por favor inicia sesión para agregar productos al carrito')
            navigate('/login')
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
                    quantity: quantity
                })
            })

            if (response.ok) {
                alert('Producto agregado al carrito')
                navigate('/cart')
            } else {
                const error = await response.json()
                alert(`Error: ${error.error}`)
            }
        } catch (error) {
            alert('Error al agregar al carrito')
        }
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Cargando producto...</p>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="error">
                <h2>Producto no encontrado</h2>
                <button onClick={() => navigate('/products')} className="btn">
                    Volver al catálogo
                </button>
            </div>
        )
    }

    return (
        <div className="product-detail">
            <div className="product-images">
                <img
                    src={product.image_url || 'https://via.placeholder.com/500x400'}
                    alt={product.name}
                    className="main-image"
                />
            </div>

            <div className="product-info">
                <h1>{product.name}</h1>
                <p className="product-description">{product.description}</p>

                <div className="product-price">
                    <span className="price">${product.price.toFixed(2)}</span>
                    {product.stock > 0 && (
                        <span className="stock-available">Disponible</span>
                    )}
                </div>

                <div className="product-meta">
                    <div className="meta-item">
                        <strong>Categoría:</strong> {product.category}
                    </div>
                    <div className="meta-item">
                        <strong>Stock:</strong> {product.stock} unidades
                    </div>
                </div>

                {product.stock > 0 ? (
                    <div className="product-actions">
                        <div className="quantity-selector">
                            <label>Cantidad:</label>
                            <div className="quantity-controls">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value)
                                        if (!isNaN(val) && val >= 1 && val <= product.stock) {
                                            setQuantity(val)
                                        }
                                    }}
                                    min="1"
                                    max={product.stock}
                                />
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                    disabled={quantity >= product.stock}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button onClick={addToCart} className="btn btn-add-cart">
                            Agregar al Carrito (${(product.price * quantity).toFixed(2)})
                        </button>

                        <button className="btn btn-buy">
                            Comprar Ahora
                        </button>
                    </div>
                ) : (
                    <div className="out-of-stock">
                        <p>⚠️ Producto agotado</p>
                        <button onClick={() => navigate('/products')} className="btn">
                            Ver otros productos
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductDetail