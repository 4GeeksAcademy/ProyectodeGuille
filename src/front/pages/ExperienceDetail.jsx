// src/front/pages/ExperienceDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const ExperienceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    
    const [experience, setExperience] = useState(null);
    const [extras, setExtras] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Formulario
    const [selectedDate, setSelectedDate] = useState("");
    const [guests, setGuests] = useState(2);
    const [selectedExtras, setSelectedExtras] = useState([]);

    useEffect(() => {
        loadExperience();
        loadExtras();
    }, [id]);

    const loadExperience = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/experiences/${id}`);
            const data = await response.json();
            
            if (response.ok) {
                setExperience(data);
            } else {
                alert("Experience not found");
                navigate("/");
            }
            setLoading(false);
        } catch (error) {
            console.error("Error loading experience:", error);
            setLoading(false);
        }
    };

    const loadExtras = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/extras`);
            const data = await response.json();
            if (response.ok) setExtras(data);
        } catch (error) {
            console.error("Error loading extras:", error);
        }
    };

    const toggleExtra = (extra) => {
        const exists = selectedExtras.find(e => e.id === extra.id);
        if (exists) {
            setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
        } else {
            setSelectedExtras([...selectedExtras, extra]);
        }
    };

    const calculateTotal = () => {
        if (!experience) return 0;
        
        let total = experience.price * guests;
        
        selectedExtras.forEach(extra => {
            if (extra.type === 'per_guest') {
                total += extra.price * guests;
            } else {
                total += extra.price;
            }
        });
        
        return total.toFixed(2);
    };

    const addToCart = () => {
        if (!selectedDate) {
            alert("Please select a date");
            return;
        }

        const cartItem = {
            type: 'experience',
            id: experience.id,
            name: experience.name,
            date: selectedDate,
            guests: guests,
            price: experience.price,
            image_url: experience.image_url,
            extras: selectedExtras,
            subtotal: parseFloat(calculateTotal())
        };

        dispatch({ type: 'add_to_cart', payload: cartItem });
        alert("Added to cart!");
        navigate("/cart");
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" style={{ color: '#C9A961' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!experience) {
        return (
            <div className="container py-5 text-center">
                <h2>Experience not found</h2>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row">
                {/* Left Column - Image and Description */}
                <div className="col-lg-7">
                    <img 
                        src={experience.image_url} 
                        alt={experience.name}
                        className="img-fluid rounded-4 shadow-lg mb-4"
                        style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                    />
                    
                    <h1 className="mb-3" style={{ color: '#2C5F7C' }}>{experience.name}</h1>
                    
                    <div className="d-flex gap-4 mb-4">
                        <div>
                            <i className="far fa-clock me-2" style={{ color: '#C9A961' }}></i>
                            <span>{experience.duration_hours} hours</span>
                        </div>
                        <div>
                            <i className="fas fa-users me-2" style={{ color: '#C9A961' }}></i>
                            <span>Max {experience.max_capacity} guests</span>
                        </div>
                        <div>
                            <i className="fas fa-star me-2" style={{ color: '#C9A961' }}></i>
                            <span>5.0 (120 reviews)</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="mb-3">About this experience</h4>
                        <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                            {experience.description}
                        </p>
                    </div>

                    <div className="mb-4">
                        <h4 className="mb-3">What's included</h4>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <i className="fas fa-check-circle me-2" style={{ color: '#C9A961' }}></i>
                                Expert guide
                            </li>
                            <li className="mb-2">
                                <i className="fas fa-check-circle me-2" style={{ color: '#C9A961' }}></i>
                                All materials and equipment
                            </li>
                            <li className="mb-2">
                                <i className="fas fa-check-circle me-2" style={{ color: '#C9A961' }}></i>
                                Light refreshments
                            </li>
                            <li className="mb-2">
                                <i className="fas fa-check-circle me-2" style={{ color: '#C9A961' }}></i>
                                Transportation during activity
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column - Booking Form */}
                <div className="col-lg-5">
                    <div className="card shadow-lg border-0 sticky-top" style={{ top: '100px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h3 className="mb-0 fw-bold" style={{ color: '#C9A961' }}>
                                        €{experience.price}
                                    </h3>
                                    <small className="text-muted">per person</small>
                                </div>
                            </div>

                            {/* Date Selection */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Select Date</label>
                                <input
                                    type="date"
                                    className="form-control form-control-lg"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {/* Guests Selection */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Number of Guests</label>
                                <div className="d-flex align-items-center gap-3">
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                        disabled={guests <= 1}
                                    >
                                        <i className="fas fa-minus"></i>
                                    </button>
                                    <span className="fs-4 fw-bold">{guests}</span>
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => setGuests(Math.min(experience.max_capacity, guests + 1))}
                                        disabled={guests >= experience.max_capacity}
                                    >
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Extras */}
                            {extras.length > 0 && (
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Add Extras (Optional)</label>
                                    {extras.map(extra => (
                                        <div key={extra.id} className="form-check mb-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`extra-${extra.id}`}
                                                checked={selectedExtras.some(e => e.id === extra.id)}
                                                onChange={() => toggleExtra(extra)}
                                            />
                                            <label className="form-check-label" htmlFor={`extra-${extra.id}`}>
                                                <div className="d-flex justify-content-between">
                                                    <span>{extra.name}</span>
                                                    <span className="text-muted">
                                                        €{extra.price}
                                                        {extra.type === 'per_guest' && ' /person'}
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Price Breakdown */}
                            <div className="border-top pt-3 mb-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>€{experience.price} x {guests} guests</span>
                                    <span>€{(experience.price * guests).toFixed(2)}</span>
                                </div>
                                {selectedExtras.map(extra => (
                                    <div key={extra.id} className="d-flex justify-content-between mb-2 text-muted">
                                        <span>{extra.name}</span>
                                        <span>
                                            €{extra.type === 'per_guest' 
                                                ? (extra.price * guests).toFixed(2)
                                                : extra.price.toFixed(2)
                                            }
                                        </span>
                                    </div>
                                ))}
                                <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-3 border-top">
                                    <span>Total</span>
                                    <span style={{ color: '#C9A961' }}>€{calculateTotal()}</span>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                className="btn btn-lg w-100 text-white fw-semibold"
                                style={{
                                    background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                                    border: 'none'
                                }}
                                onClick={addToCart}
                            >
                                Add to Cart
                            </button>

                            <p className="text-center text-muted mt-3 mb-0">
                                <small>You won't be charged yet</small>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};