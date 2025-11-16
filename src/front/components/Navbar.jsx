// src/front/js/component/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"; // 👈 TU HOOK

export const Navbar = () => {
    const { store, dispatch } = useGlobalReducer(); // 👈 USA TU HOOK
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch({ type: "logout" });
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className="container">
                {/* Logo */}
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <span className="text-warning me-2" style={{ fontSize: '1.5rem' }}>✨</span>
                    <span className="fw-bold" style={{ 
                        fontSize: '1.5rem',
                        background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        CALIAFARM
                    </span>
                </Link>

                {/* Mobile Menu Toggle */}
                <button 
                    className="navbar-toggler border-0" 
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navigation Links */}
                <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
                        <li className="nav-item">
                            <Link 
                                className="nav-link px-3 py-2" 
                                to="/experiences"
                                style={{ color: '#4A5568', fontWeight: '500' }}
                            >
                                Experiences
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className="nav-link px-3 py-2" 
                                to="/accommodation"
                                style={{ color: '#4A5568', fontWeight: '500' }}
                            >
                                Accommodation
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className="nav-link px-3 py-2" 
                                to="/packages"
                                style={{ color: '#4A5568', fontWeight: '500' }}
                            >
                                Packages
                            </Link>
                        </li>

                        {/* Cart Icon */}
                        <li className="nav-item ms-lg-2">
                            <Link 
                                className="nav-link position-relative" 
                                to="/cart"
                            >
                                <i className="fas fa-shopping-cart" style={{ fontSize: '1.2rem', color: '#C9A961' }}></i>
                                {store.cart && store.cart.length > 0 && (
                                    <span 
                                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                        style={{ fontSize: '0.65rem' }}
                                    >
                                        {store.cart.length}
                                    </span>
                                )}
                            </Link>
                        </li>

                        {/* User Menu */}
                        {store.user ? (
                            <li className="nav-item dropdown ms-lg-2">
                                <a 
                                    className="nav-link dropdown-toggle d-flex align-items-center" 
                                    href="#" 
                                    id="userDropdown" 
                                    role="button" 
                                    data-bs-toggle="dropdown"
                                >
                                    <div 
                                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-2"
                                        style={{ width: '32px', height: '32px' }}
                                    >
                                        <span className="text-white fw-bold">
                                            {store.user.name ? store.user.name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                    <span className="d-none d-lg-inline">{store.user.name}</span>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <Link className="dropdown-item" to="/my-bookings">
                                            <i className="fas fa-calendar-check me-2"></i>
                                            My Bookings
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to="/profile">
                                            <i className="fas fa-user me-2"></i>
                                            Profile
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <a 
                                            className="dropdown-item text-danger" 
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleLogout();
                                            }}
                                        >
                                            <i className="fas fa-sign-out-alt me-2"></i>
                                            Logout
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <li className="nav-item ms-lg-3">
                                <Link 
                                    className="btn btn-sm px-4 py-2"
                                    to="/login"
                                    style={{
                                        background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '25px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};