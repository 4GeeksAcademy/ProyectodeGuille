// src/front/pages/Cart.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Cart = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const removeItem = (index) => {
        if (window.confirm("Are you sure you want to remove this item?")) {
            dispatch({ type: 'remove_from_cart', payload: index });
        }
    };

    const calculateGrandTotal = () => {
        return store.cart.reduce((total, item) => total + item.subtotal, 0).toFixed(2);
    };

    const proceedToCheckout = () => {
        if (store.cart.length === 0) {
            alert("Your cart is empty");
            return;
        }
        navigate("/checkout");
    };

    if (store.cart.length === 0) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                        <i className="fas fa-shopping-cart mb-4" style={{ fontSize: '5rem', color: '#C9A961' }}></i>
                        <h2 className="mb-3">Your cart is empty</h2>
                        <p className="text-muted mb-4">
                            Looks like you haven't added anything to your cart yet.
                        </p>
                        <Link 
                            to="/" 
                            className="btn btn-lg px-5"
                            style={{
                                background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            Start Exploring
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">Your Cart</h1>
            
            <div className="row">
                {/* Cart Items */}
                <div className="col-lg-8">
                    {store.cart.map((item, index) => (
                        <div key={index} className="card mb-3 shadow-sm">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    {/* Image */}
                                    <div className="col-md-3">
                                        <img 
                                            src={item.image_url} 
                                            alt={item.name}
                                            className="img-fluid rounded"
                                            style={{ height: '150px', width: '100%', objectFit: 'cover' }}
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="col-md-6">
                                        <h5 className="mb-2">{item.name}</h5>
                                        
                                        {/* Experience Details */}
                                        {item.type === 'experience' && (
                                            <>
                                                <p className="mb-1 text-muted">
                                                    <i className="far fa-calendar me-2"></i>
                                                    <strong>Date:</strong> {new Date(item.date).toLocaleDateString()}
                                                </p>
                                                <p className="mb-1 text-muted">
                                                    <i className="fas fa-users me-2"></i>
                                                    <strong>Guests:</strong> {item.guests}
                                                </p>
                                                <p className="mb-1 text-muted">
                                                    <strong>Price:</strong> €{item.price}/person
                                                </p>
                                            </>
                                        )}

                                        {/* Room Details */}
                                        {item.type === 'room' && (
                                            <>
                                                <p className="mb-1 text-muted">
                                                    <i className="far fa-calendar me-2"></i>
                                                    <strong>Check-in:</strong> {new Date(item.check_in).toLocaleDateString()}
                                                </p>
                                                <p className="mb-1 text-muted">
                                                    <i className="far fa-calendar me-2"></i>
                                                    <strong>Check-out:</strong> {new Date(item.check_out).toLocaleDateString()}
                                                </p>
                                                <p className="mb-1 text-muted">
                                                    <i className="fas fa-moon me-2"></i>
                                                    <strong>Nights:</strong> {item.nights}
                                                </p>
                                                <p className="mb-1 text-muted">
                                                    <strong>Price:</strong> €{item.price}/night
                                                </p>
                                            </>
                                        )}

                                        {/* Extras */}
                                        {item.extras && item.extras.length > 0 && (
                                            <div className="mt-2">
                                                <small className="text-muted">
                                                    <strong>Extras:</strong>
                                                </small>
                                                <ul className="mb-0" style={{ fontSize: '0.9rem' }}>
                                                    {item.extras.map((extra, idx) => (
                                                        <li key={idx}>{extra.name} - €{extra.price}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price and Remove */}
                                    <div className="col-md-3 text-end">
                                        <h4 className="mb-3 fw-bold" style={{ color: '#C9A961' }}>
                                            €{item.subtotal.toFixed(2)}
                                        </h4>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removeItem(index)}
                                        >
                                            <i className="fas fa-trash me-1"></i>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="col-lg-4">
                    <div className="card shadow-sm sticky-top" style={{ top: '100px' }}>
                        <div className="card-body">
                            <h4 className="mb-4">Order Summary</h4>
                            
                            {/* Items breakdown */}
                            <div className="mb-3">
                                {store.cart.map((item, index) => (
                                    <div key={index} className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">{item.name}</span>
                                        <span>€{item.subtotal.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <hr />

                            {/* Total Items */}
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Total Items:</span>
                                <span className="fw-semibold">{store.cart.length}</span>
                            </div>

                            <hr />

                            {/* Grand Total */}
                            <div className="d-flex justify-content-between mb-4">
                                <h5 className="mb-0">Grand Total:</h5>
                                <h4 className="mb-0 fw-bold" style={{ color: '#C9A961' }}>
                                    €{calculateGrandTotal()}
                                </h4>
                            </div>

                            {/* Checkout Button */}
                            <button
                                className="btn btn-lg w-100 text-white fw-semibold mb-3"
                                style={{
                                    background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                                    border: 'none'
                                }}
                                onClick={proceedToCheckout}
                            >
                                Proceed to Checkout
                            </button>

                            {/* Continue Shopping */}
                            <Link 
                                to="/"
                                className="btn btn-outline-secondary btn-lg w-100"
                            >
                                Continue Shopping
                            </Link>

                            {/* Security badges */}
                            <div className="mt-4 pt-3 border-top text-center">
                                <small className="text-muted d-block mb-2">
                                    <i className="fas fa-lock me-1"></i>
                                    Secure Checkout
                                </small>
                                <small className="text-muted d-block">
                                    <i className="fas fa-shield-alt me-1"></i>
                                    Your payment information is safe
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};