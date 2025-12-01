import React, { useState, useEffect } from 'react'
import ProductCard from '../components/Shared/ProductCard.jsx'

const ProductCatalog = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState('all')

    useEffect(() => {
        fetchProducts()
    }, [category])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            let url = `${import.meta.env.VITE_BACKEND_URL}/products`
            if (category !== 'all') {
                url += `?category=${category}`
            }

            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()
                setProducts(data.products)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Cargando productos...</p>
            </div>
        )
    }

    return (
        <div className="product-catalog">
            <div className="catalog-header">
                <h1>Catálogo de Productos</h1>
                <div className="category-filter">
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="all">Todas las categorías</option>
                        <option value="electronics">Electrónica</option>
                        <option value="clothing">Ropa</option>
                        <option value="books">Libros</option>
                        <option value="home">Hogar</option>
                        <option value="sports">Deportes</option>
                    </select>
                </div>
            </div>

            <div className="products-grid">
                {products.length > 0 ? (
                    products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="no-products">
                        <p>No hay productos disponibles en esta categoría</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductCatalog