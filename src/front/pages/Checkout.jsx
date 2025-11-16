// src/front/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Checkout = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        phone: "",
        country: "Italy",
        address: "",
        city: "",
        postal_code: "",
        special_requests: ""
    });

    useEffect(() => {
        // Si el carrito está vacío, redirigir
        if (store.cart.length === 0) {
            navigate("/cart");
        }
    }, [store.cart, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const calculateGrandTotal = () => {
        return store.cart.reduce((total, item) => total + item.subtotal, 0).toFixed(2);
    };

    const validateForm = () => {
        if (!formData.email || !formData.name || !formData.phone) {
            alert("Please fill in all required fields");
            return false;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid email address");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            // Preparar datos de la reserva
            const bookingData = {
                customer_email: formData.email,
                customer_name: formData.name,
                customer_phone: formData.phone,
                country: formData.country,
                address: formData.address,
                city: formData.city,
                postal_code: formData.postal_code,
                special_requests: formData.special_requests,
                items: store.cart.map(item => ({
                    type: item.type,
                    id: item.id,
                    name: item.name,
                    date: item.date || null,
                    check_in: item.check_in || null,
                    check_out: item.check_out || null,
                    guests: item.guests || item.capacity,
                    nights: item.nights || null,
                    price: item.price,
                    extras: item.extras,
                    subtotal: item.subtotal
                })),
                total_amount: parseFloat(calculateGrandTotal())
            };

            // Crear sesión de checkout con Stripe
            const response = await fetch(`${backendUrl}/api/create-checkout-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (response.ok) {
                // Redirigir a Stripe Checkout
                window.location.href = data.checkout_url;
            } else {
                alert(data.error || "Error creating checkout session");
                setLoading(false);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    if (store.cart.length === 0) {
        return null;
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">Checkout</h1>

            <div className="row">
                {/* Left Column - Form */}
                <div className="col-lg-7">
                    <form onSubmit={handleSubmit}>
                        {/* Contact Information */}
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="mb-4">Contact Information</h4>
                                
                                <div className="mb-3">
                                    <label className="form-label">Email Address *</label>
                                    <input
                                        type="email"
                                        className="form-control form-control-lg"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                    <small className="text-muted">
                                        Confirmation will be sent to this email
                                    </small>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Phone Number *</label>
                                        <input
                                            type="tel"
                                            className="form-control form-control-lg"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+39 123 456 7890"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Billing Address */}
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="mb-4">Billing Address</h4>
                                
                                <div className="mb-3">
                                    <label className="form-label">Country</label>
                                    <select
                                        className="form-select form-select-lg"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Italy">Italy</option>
                                        <option value="Spain">Spain</option>
                                        <option value="France">France</option>
                                        <option value="Germany">Germany</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="United States">United States</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Street Address</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="123 Main Street"
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Palermo"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Postal Code</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            name="postal_code"
                                            value={formData.postal_code}
                                            onChange={handleInputChange}
                                            placeholder="90100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Special Requests */}
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h4 className="mb-4">Special Requests</h4>
                                <textarea
                                    className="form-control"
                                    name="special_requests"
                                    value={formData.special_requests}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Any special requests or dietary requirements? (Optional)"
                                ></textarea>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right Column - Order Summary */}
                <div className="col-lg-5">
                    <div className="card shadow-sm sticky-top" style={{ top: '100px' }}>
                        <div className="card-body">
                            <h4 className="mb-4">Order Summary</h4>

                            {/* Cart Items */}
                            <div className="mb-3">
                                {store.cart.map((item, index) => (
                                    <div key={index} className="mb-3 pb-3 border-bottom">
                                        <div className="d-flex">
                                            <img 
                                                src={item.image_url} 
                                                alt={item.name}
                                                className="rounded me-3"
                                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1">{item.name}</h6>
                                                <small className="text-muted d-block">
                                                    {item.type === 'experience' && (
                                                        <>
                                                            {new Date(item.date).toLocaleDateString()} · {item.guests} guests
                                                        </>
                                                    )}
                                                    {item.type === 'room' && (
                                                        <>
                                                            {item.nights} nights · {new Date(item.check_in).toLocaleDateString()}
                                                        </>
                                                    )}
                                                </small>
                                                <div className="mt-1">
                                                    <span className="fw-bold" style={{ color: '#C9A961' }}>
                                                        €{item.subtotal.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr />

                            {/* Total */}
                            <div className="d-flex justify-content-between mb-4">
                                <h5 className="mb-0">Total:</h5>
                                <h4 className="mb-0 fw-bold" style={{ color: '#C9A961' }}>
                                    €{calculateGrandTotal()}
                                </h4>
                            </div>

                            {/* Payment Button */}
                            <button
                                type="button"
                                className="btn btn-lg w-100 text-white fw-semibold mb-3"
                                style={{
                                    background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                                    border: 'none'
                                }}
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-lock me-2"></i>
                                        Pay with Stripe
                                    </>
                                )}
                            </button>

                            {/* Security Info */}
                            <div className="text-center">
                                <small className="text-muted d-block mb-2">
                                    <i className="fas fa-shield-alt me-1"></i>
                                    Secure payment powered by Stripe
                                </small>
                                <small className="text-muted d-block">
                                    <i className="fas fa-lock me-1"></i>
                                    Your payment information is encrypted
                                </small>
                            </div>

                            {/* Cancellation Policy */}
                            <div className="mt-4 pt-3 border-top">
                                <h6 className="mb-2">Cancellation Policy</h6>
                                <small className="text-muted">
                                    Free cancellation up to 48 hours before your booking. 
                                    After that, cancellations are subject to a 50% fee.
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};