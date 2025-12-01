import React from 'react';
import SustainabilityBadge from './SustainabilityBadge';

const ProductCard = ({ product, onAddToCart, showDetails = true }) => {
    const {
        id,
        name,
        description,
        price,
        sustainability_score,
        image_url,
        stock,
        category
    } = product;

    const isOutOfStock = stock <= 0;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Imagen del producto */}
            <div className="relative h-48 overflow-hidden">
                {image_url ? (
                    <img
                        src={image_url}
                        alt={name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=Producto';
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sin imagen</span>
                    </div>
                )}

                {/* Badge de sostenibilidad */}
                <div className="absolute top-2 right-2">
                    <SustainabilityBadge score={sustainability_score} />
                </div>

                {/* Badge de stock */}
                {isOutOfStock && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        AGOTADO
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="p-4">
                {/* Categoría */}
                {category && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-2">
                        {category}
                    </span>
                )}

                {/* Nombre */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                    {name}
                </h3>

                {/* Descripción */}
                {showDetails && description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Precio y stock */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="text-xl font-bold text-blue-600">
                            ${price.toFixed(2)}
                        </span>
                        {!isOutOfStock && (
                            <span className="text-sm text-gray-500 ml-2">
                                ({stock} disponibles)
                            </span>
                        )}
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                    <button
                        onClick={onAddToCart}
                        disabled={isOutOfStock}
                        className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${isOutOfStock
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        {isOutOfStock ? 'Agotado' : 'Agregar al carrito'}
                    </button>

                    <button
                        onClick={() => window.location.href = `/products/${id}`}
                        className="py-2 px-4 border border-blue-500 text-blue-500 rounded font-medium hover:bg-blue-50 transition-colors"
                    >
                        Ver más
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;