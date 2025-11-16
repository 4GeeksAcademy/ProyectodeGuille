// src/front/pages/SearchResults.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const { store } = useGlobalReducer();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState({ experiences: [], rooms: [] });

    // Obtener parámetros de búsqueda
    const checkIn = searchParams.get('check_in');
    const checkOut = searchParams.get('check_out');
    const guests = searchParams.get('guests');

    useEffect(() => {
        searchAvailability();
    }, [checkIn, checkOut, guests]);

    const searchAvailability = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            
            // Por ahora mostramos todo (luego implementaremos filtrado por disponibilidad)
            const expResponse = await fetch(`${backendUrl}/api/experiences`);
            const expData = await expResponse.json();
            
            const roomResponse = await fetch(`${backendUrl}/api/rooms`);
            const roomData = await roomResponse.json();

            if (expResponse.ok && roomResponse.ok) {
                setResults({
                    experiences: expData,
                    rooms: roomData
                });
            }

            setLoading(false);
        } catch (error) {
            console.error("Error searching:", error);
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            {/* SEARCH SUMMARY */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="mb-3">Search Results</h2>
                    <div className="d-flex gap-4 flex-wrap">
                        <div>
                            <small className="text-muted">Check-in:</small>
                            <p className="mb-0 fw-semibold">{checkIn || 'Not selected'}</p>
                        </div>
                        <div>
                            <small className="text-muted">Check-out:</small>
                            <p className="mb-0 fw-semibold">{checkOut || 'Not selected'}</p>
                        </div>
                        <div>
                            <small className="text-muted">Guests:</small>
                            <p className="mb-0 fw-semibold">{guests || '0'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: '#C9A961' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    {/* EXPERIENCES */}
                    <section className="mb-5">
                        <h3 className="mb-4">Experiences ({results.experiences.length})</h3>
                        <div className="row g-4">
                            {results.experiences.map((exp) => (
                                <div key={exp.id} className="col-lg-4 col-md-6">
                                    <div className="card h-100 shadow-sm">
                                        <img 
                                            src={exp.image_url} 
                                            className="card-img-top" 
                                            alt={exp.name}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <div className="card-body">
                                            <h5 className="card-title">{exp.name}</h5>
                                            <p className="card-text text-muted">
                                                {exp.description.substring(0, 100)}...
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="fw-bold text-success">€{exp.price}/person</span>
                                                <small className="text-muted">
                                                    <i className="far fa-clock me-1"></i>
                                                    {exp.duration_hours}h
                                                </small>
                                            </div>
                                            <Link 
                                                to={`/experience/${exp.id}`}
                                                className="btn w-100"
                                                style={{
                                                    background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                                                    color: 'white',
                                                    border: 'none'
                                                }}
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ROOMS */}
                    <section>
                        <h3 className="mb-4">Accommodation ({results.rooms.length})</h3>
                        <div className="row g-4">
                            {results.rooms.map((room) => (
                                <div key={room.id} className="col-lg-4 col-md-6">
                                    <div className="card h-100 shadow-sm">
                                        <img 
                                            src={room.image_url} 
                                            className="card-img-top" 
                                            alt={room.name}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <div className="card-body">
                                            <h5 className="card-title">{room.name}</h5>
                                            <p className="card-text text-muted">
                                                {room.description.substring(0, 100)}...
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="fw-bold text-success">€{room.price_per_night}/night</span>
                                                <small className="text-muted">
                                                    <i className="fas fa-users me-1"></i>
                                                    {room.capacity} guests
                                                </small>
                                            </div>
                                            <Link 
                                                to={`/room/${room.id}`}
                                                className="btn w-100"
                                                style={{
                                                    background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                                                    color: 'white',
                                                    border: 'none'
                                                }}
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};