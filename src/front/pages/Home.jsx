// src/front/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { SearchBar } from "../components/SearchBar.jsx"; 

export const Home = () => {
    const { store, dispatch } = useGlobalReducer();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            
            // Cargar experiencias
            const expResponse = await fetch(`${backendUrl}/api/experiences`);
            const expData = await expResponse.json();
            if (expResponse.ok) {
                dispatch({ type: "set_experiences", payload: expData });
            }

            // Cargar habitaciones
            const roomResponse = await fetch(`${backendUrl}/api/rooms`);
            const roomData = await roomResponse.json();
            if (roomResponse.ok) {
                dispatch({ type: "set_rooms", payload: roomData });
            }

            setLoading(false);
        } catch (error) {
            console.error("Error loading data:", error);
            setLoading(false);
        }
    };

    const experiences = store.experiences.slice(0, 3);

    return (
        <>
            {/* HERO SECTION */}
            <section 
                className="position-relative d-flex align-items-center"
                style={{
                    minHeight: '85vh',
                    background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920) center/cover',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="container">
                    <div className="row justify-content-center text-center">
                        <div className="col-lg-10">
                            <div className="mb-4">
                                <span style={{ fontSize: '4rem' }}>✨</span>
                            </div>

                            <h1 
                                className="display-2 fw-bold text-white mb-4"
                                style={{ 
                                    textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                                    letterSpacing: '2px'
                                }}
                            >
                                CALIAFARM
                            </h1>
                            
                            <div 
                                className="mx-auto mb-4"
                                style={{
                                    width: '100px',
                                    height: '3px',
                                    background: 'linear-gradient(90deg, transparent, #C9A961, transparent)'
                                }}
                            ></div>

                            <h2 className="h3 text-white mb-3 fw-light">
                                Authentic Sicilian Agritourism
                            </h2>

                            <p className="lead text-white mb-5" style={{ maxWidth: '700px', margin: '0 auto' }}>
                                Experience the true essence of Sicily through exclusive wine tours, 
                                olive oil tastings, and luxury accommodation in the heart of the countryside
                            </p>

                            <div className="d-flex justify-content-center gap-4 mb-5 flex-wrap">
                                <div className="text-white">
                                    <i className="fas fa-map-marker-alt me-2" style={{ color: '#C9A961' }}></i>
                                    Between Palermo & Trapani
                                </div>
                                <div className="text-white">
                                    <i className="fas fa-users me-2" style={{ color: '#C9A961' }}></i>
                                    Small Groups · Max 8 People
                                </div>
                                <div className="text-white">
                                    <i className="fas fa-star me-2" style={{ color: '#C9A961' }}></i>
                                    5-Star Rated Experiences
                                </div>
                            </div>

                            <div className="col-lg-10 mx-auto">
                                <SearchBar variant="hero" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="py-5" style={{ background: 'linear-gradient(135deg, #2C5F7C 0%, #4A7A94 100%)' }}>
                <div className="container">
                    <div className="row text-center text-white">
                        <div className="col-md-3 col-6 mb-4 mb-md-0">
                            <h2 className="display-4 fw-bold mb-2" style={{ color: '#C9A961' }}>500+</h2>
                            <p className="mb-0 fw-light">Happy Guests</p>
                        </div>
                        <div className="col-md-3 col-6 mb-4 mb-md-0">
                            <h2 className="display-4 fw-bold mb-2" style={{ color: '#C9A961' }}>50+</h2>
                            <p className="mb-0 fw-light">Wine Partners</p>
                        </div>
                        <div className="col-md-3 col-6">
                            <h2 className="display-4 fw-bold mb-2" style={{ color: '#C9A961' }}>15</h2>
                            <p className="mb-0 fw-light">Years Experience</p>
                        </div>
                        <div className="col-md-3 col-6">
                            <h2 className="display-4 fw-bold mb-2" style={{ color: '#C9A961' }}>100%</h2>
                            <p className="mb-0 fw-light">Sicilian Authentic</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* EXPERIENCES SECTION */}
            <section className="py-5 bg-light">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <span className="text-muted text-uppercase fw-semibold" style={{ letterSpacing: '2px', fontSize: '0.9rem' }}>
                            What We Offer
                        </span>
                        <h2 className="display-5 fw-bold mt-2 mb-3" style={{ color: '#2C5F7C' }}>
                            Sicilian Experiences
                        </h2>
                        <p className="lead text-muted" style={{ maxWidth: '700px', margin: '0 auto' }}>
                            Immerse yourself in authentic Sicilian culture through our curated experiences
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" style={{ color: '#C9A961' }} role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {experiences.length > 0 ? (
                                experiences.map((exp) => (
                                    <div key={exp.id} className="col-lg-4 col-md-6">
                                        <div 
                                            className="card h-100 border-0 shadow-sm overflow-hidden"
                                            style={{ transition: 'transform 0.3s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div className="position-relative">
                                                <img 
                                                    src={exp.image_url || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'} 
                                                    className="card-img-top" 
                                                    alt={exp.name}
                                                    style={{ height: '250px', objectFit: 'cover' }}
                                                />
                                                <div 
                                                    className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill text-white fw-semibold"
                                                    style={{ background: 'rgba(201, 169, 97, 0.95)' }}
                                                >
                                                    €{exp.price}/person
                                                </div>
                                            </div>
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title fw-bold mb-3" style={{ color: '#2C5F7C' }}>
                                                    {exp.name}
                                                </h5>
                                                <p className="card-text text-muted flex-grow-1">
                                                    {exp.description.substring(0, 120)}...
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                                                    <small className="text-muted">
                                                        <i className="far fa-clock me-1"></i>
                                                        {exp.duration_hours}h
                                                    </small>
                                                    <small className="text-muted">
                                                        <i className="fas fa-users me-1"></i>
                                                        Max {exp.max_capacity}
                                                    </small>
                                                </div>
                                                <Link 
                                                    to={`/experience/${exp.id}`}
                                                    className="btn w-100 text-white fw-semibold"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                                                        border: 'none'
                                                    }}
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 text-center">
                                    <p className="text-muted">No experiences available at the moment.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};