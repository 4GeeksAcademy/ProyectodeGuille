// src/front/pages/RoomDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const RoomDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    
    const [room, setRoom] = useState(null);
    const [extras, setExtras] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Formulario
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [selectedExtras, setSelectedExtras] = useState([]);

    useEffect(() => {
        loadRoom();
        loadExtras();
    }, [id]);

    const loadRoom = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/rooms/${id}`);
            const data = await response.json();
            
            if (response.ok) {
                setRoom(data);
            } else {
                alert("Room not found");
                navigate("/");
            }
            setLoading(false);
        } catch (error) {
            console.error("Error loading room:", error);
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

    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateTotal = () => {
        if (!room) return 0;
        
        const nights = calculateNights();
        let total = room.price_per_night * nights;
        
        selectedExtras.forEach(extra => {
            if (extra.type === 'per_guest') {
                total += extra.price * room.capacity * nights;
            } else {
                total += extra.price;
            }
        });
        
        return total.toFixed(2);
    };

    const addToCart = () => {
        if (!checkIn || !checkOut) {
            alert("Please select check-in and check-out dates");
            return;
        }

        if (new Date(checkIn) >= new Date(checkOut)) {
            alert("Check-out date must be after check-in date");
            return;
        }

        const nights = calculateNights();

        const cartItem = {
            type: 'room',
            id: room.id,
            name: room.name,
            check_in: checkIn,
            check_out: checkOut,
            nights: nights,
            guests: room.capacity,
            price: room.price_per_night,
            image_url: room.image_url,
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

    if (!room) {
        return (
            <div className="container py-5 text-center">
                <h2>Room not found</h2>
            </div>
        );
    }

    const nights = calculateNights();

    return (
        <div className="container py-5">
            <div className="row">
                {/* Left Column - Image and Description */}
                <div className="col-lg-7">
                    <img 
                        src={room.image_url} 
                        alt={room.name}
                        className="img-fluid rounded-4 shadow-lg mb-4"
                        style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                    />
                    
                    <h1 className="mb-3" style={{ color: '#2C5F7C' }}>{room.name}</h1>
                    
                    <div className="d-flex gap-4 mb-4">
                        <div>
                            <i className="fas fa-users me-2" style={{ color: '#C9A961' }}></i>
                            <span>Up to {room.capacity} guests</span>
                        </div>
                        <div>
                            <i className="fas fa-bed me-2" style={{ color: '#C9A961' }}></i>
                            <span>Luxury room</span>
                        </div>
                        <div>
                            <i className="fas fa-star me-2" style={{ color: '#C9A961' }}></i>
                            <span>5.0 (85 reviews)</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="mb-3">About this room</h4>
                        <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                            {room.description}
                        </p>
                    </div>

                    {/* Amenities */}
                    <div className="mb-4">
                        <h4 className="mb-3">Amenities</h4>
                        <div className="row g-3">
                            {room.amenities && Object.entries(room.amenities).map(([key, value]) => (
                                value && (
                                    <div key={key} className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-check-circle me-2" style={{ color: '#C9A961' }}></i>
                                            <span className="text-capitalize">
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Check-in/out times */}
                    <div className="mb-4">
                        <h4 className="mb-3">House Rules</h4>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-clock me-2" style={{ color: '#C9A961' }}></i>
                                    <div>
                                        <strong>Check-in:</strong>
                                        <span className="ms-2">After 3:00 PM</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-clock me-2" style={{ color: '#C9A961' }}></i>
                                    <div>
                                        <strong>Check-out:</strong>
                                        <span className="ms-2">Before 10:00 AM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Booking Form */}
                <div className="col-lg-5">
                    <div className="card shadow-lg border-0 sticky-top" style={{ top: '100px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h3 className="mb-0 fw-bold" style={{ color: '#C9A961' }}>
                                        €{room.price_per_night}
                                    </h3>
                                    <small className="text-muted">per night</small>
                                </div>
                            </div>

                            {/* Check-in Date */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Check-in</label>
                                <input
                                    type="date"
                                    className="form-control form-control-lg"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {/* Check-out Date */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Check-out</label>
                                <input
                                    type="date"
                                    className="form-control form-control-lg"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    min={checkIn || new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {/* Show nights if dates selected */}
                            {nights > 0 && (
                                <div className="alert alert-info mb-4">
                                    <i className="fas fa-moon me-2"></i>
                                    <strong>{nights}</strong> {nights === 1 ? 'night' : 'nights'}
                                </div>
                            )}

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
                                                        {extra.type === 'per_guest' && ' /person/night'}
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Price Breakdown */}
                            {nights > 0 && (
                                <div className="border-top pt-3 mb-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>€{room.price_per_night} x {nights} nights</span>
                                        <span>€{(room.price_per_night * nights).toFixed(2)}</span>
                                    </div>
                                    {selectedExtras.map(extra => (
                                        <div key={extra.id} className="d-flex justify-content-between mb-2 text-muted">
                                            <span>{extra.name}</span>
                                            <span>
                                                €{extra.type === 'per_guest' 
                                                    ? (extra.price * room.capacity * nights).toFixed(2)
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
                            )}

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