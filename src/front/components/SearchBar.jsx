// src/front/js/component/SearchBar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const SearchBar = ({ variant = "hero" }) => {
    const navigate = useNavigate();
    const [searchData, setSearchData] = useState({
        checkIn: "",
        checkOut: "",
        adults: 2,
        children: 0
    });
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!searchData.checkIn || !searchData.checkOut) {
            alert("Please select check-in and check-out dates");
            return;
        }

        const checkInDate = new Date(searchData.checkIn);
        const checkOutDate = new Date(searchData.checkOut);

        if (checkInDate >= checkOutDate) {
            alert("Check-out date must be after check-in date");
            return;
        }

        // Navegar a resultados con query params
        const params = new URLSearchParams({
            check_in: searchData.checkIn,
            check_out: searchData.checkOut,
            guests: searchData.adults + searchData.children
        });

        navigate(`/search?${params.toString()}`);
    };

    const incrementGuests = (type) => {
        setSearchData(prev => ({
            ...prev,
            [type]: prev[type] + 1
        }));
    };

    const decrementGuests = (type) => {
        if (searchData[type] > 0) {
            setSearchData(prev => ({
                ...prev,
                [type]: prev[type] - 1
            }));
        }
    };

    const totalGuests = searchData.adults + searchData.children;

    // Estilos según variante
    const isHero = variant === "hero";
    const containerClass = isHero 
        ? "shadow-lg p-4 rounded-4 bg-white" 
        : "shadow-sm p-3 rounded-3 bg-white border";

    return (
        <div className={containerClass}>
            <form onSubmit={handleSearch}>
                <div className="row g-3 align-items-end">
                    {/* Check-in Date */}
                    <div className="col-lg-3 col-md-6">
                        <label className="form-label fw-semibold mb-2" style={{ fontSize: '0.9rem', color: '#4A5568' }}>
                            <i className="fas fa-calendar-alt me-2" style={{ color: '#C9A961' }}></i>
                            Check-in
                        </label>
                        <input
                            type="date"
                            className="form-control form-control-lg border-2"
                            value={searchData.checkIn}
                            onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            style={{ 
                                borderColor: '#E2E8F0',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Check-out Date */}
                    <div className="col-lg-3 col-md-6">
                        <label className="form-label fw-semibold mb-2" style={{ fontSize: '0.9rem', color: '#4A5568' }}>
                            <i className="fas fa-calendar-check me-2" style={{ color: '#C9A961' }}></i>
                            Check-out
                        </label>
                        <input
                            type="date"
                            className="form-control form-control-lg border-2"
                            value={searchData.checkOut}
                            onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                            min={searchData.checkIn || new Date().toISOString().split('T')[0]}
                            style={{ 
                                borderColor: '#E2E8F0',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Guests Dropdown */}
                    <div className="col-lg-4 col-md-6 position-relative">
                        <label className="form-label fw-semibold mb-2" style={{ fontSize: '0.9rem', color: '#4A5568' }}>
                            <i className="fas fa-users me-2" style={{ color: '#C9A961' }}></i>
                            Guests
                        </label>
                        <div
                            className="form-control form-control-lg border-2 d-flex justify-content-between align-items-center"
                            style={{ 
                                cursor: 'pointer',
                                borderColor: '#E2E8F0',
                                fontSize: '1rem'
                            }}
                            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                        >
                            <span>{totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'}</span>
                            <i className={`fas fa-chevron-${showGuestDropdown ? 'up' : 'down'}`}></i>
                        </div>

                        {/* Dropdown de huéspedes */}
                        {showGuestDropdown && (
                            <div 
                                className="position-absolute bg-white shadow-lg rounded-3 p-3 mt-2 w-100"
                                style={{ 
                                    zIndex: 1000,
                                    border: '1px solid #E2E8F0'
                                }}
                            >
                                {/* Adultos */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <div className="fw-semibold">Adults</div>
                                        <small className="text-muted">Ages 13+</small>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary rounded-circle"
                                            onClick={() => decrementGuests('adults')}
                                            disabled={searchData.adults <= 1}
                                            style={{ width: '32px', height: '32px' }}
                                        >
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <span className="fw-semibold">{searchData.adults}</span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary rounded-circle"
                                            onClick={() => incrementGuests('adults')}
                                            disabled={totalGuests >= 8}
                                            style={{ width: '32px', height: '32px' }}
                                        >
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Niños */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-semibold">Children</div>
                                        <small className="text-muted">Ages 4-12</small>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary rounded-circle"
                                            onClick={() => decrementGuests('children')}
                                            disabled={searchData.children <= 0}
                                            style={{ width: '32px', height: '32px' }}
                                        >
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <span className="fw-semibold">{searchData.children}</span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary rounded-circle"
                                            onClick={() => incrementGuests('children')}
                                            disabled={totalGuests >= 8}
                                            style={{ width: '32px', height: '32px' }}
                                        >
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-top">
                                    <small className="text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Maximum 8 guests per booking
                                    </small>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search Button */}
                    <div className="col-lg-2 col-md-6">
                        <button
                            type="submit"
                            className="btn btn-lg w-100 text-white fw-semibold shadow-sm"
                            style={{
                                background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                                border: 'none',
                                padding: '0.75rem',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            <i className="fas fa-search me-2"></i>
                            Search
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};