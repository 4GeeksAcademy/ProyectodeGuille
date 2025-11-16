// src/front/js/component/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
    return (
        <footer className="bg-dark text-light pt-5 pb-3">
            <div className="container">
                <div className="row g-4">
                    {/* Logo y Descripción */}
                    <div className="col-lg-4 col-md-6">
                        <div className="d-flex align-items-center mb-3">
                            <span className="text-warning me-2" style={{ fontSize: '1.8rem' }}>✨</span>
                            <h4 className="mb-0 fw-bold" style={{ 
                                background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                CALIAFARM
                            </h4>
                        </div>
                        <p className="text-muted mb-3" style={{ fontSize: '0.95rem' }}>
                            Authentic Sicilian Agritourism. Experience the true essence of Sicily through 
                            exclusive wine tours, olive oil tastings, and luxury accommodation in the heart 
                            of the countryside.
                        </p>
                        <div className="d-flex gap-3">
                            <a 
                                href="https://facebook.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-muted"
                                style={{ fontSize: '1.3rem', transition: 'color 0.3s' }}
                                onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                            >
                                <i className="fab fa-facebook"></i>
                            </a>
                            <a 
                                href="https://instagram.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-muted"
                                style={{ fontSize: '1.3rem', transition: 'color 0.3s' }}
                                onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                            >
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a 
                                href="https://twitter.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-muted"
                                style={{ fontSize: '1.3rem', transition: 'color 0.3s' }}
                                onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                            >
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a 
                                href="https://tripadvisor.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-muted"
                                style={{ fontSize: '1.3rem', transition: 'color 0.3s' }}
                                onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                            >
                                <i className="fab fa-tripadvisor"></i>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-lg-2 col-md-6">
                        <h5 className="mb-3 fw-bold" style={{ color: '#C9A961' }}>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <Link 
                                    to="/" 
                                    className="text-muted text-decoration-none"
                                    style={{ transition: 'color 0.3s' }}
                                    onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link 
                                    to="/experiences" 
                                    className="text-muted text-decoration-none"
                                    style={{ transition: 'color 0.3s' }}
                                    onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                                >
                                    Experiences
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link 
                                    to="/accommodation" 
                                    className="text-muted text-decoration-none"
                                    style={{ transition: 'color 0.3s' }}
                                    onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                                >
                                    Accommodation
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link 
                                    to="/packages" 
                                    className="text-muted text-decoration-none"
                                    style={{ transition: 'color 0.3s' }}
                                    onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                                >
                                    Packages
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link 
                                    to="/about" 
                                    className="text-muted text-decoration-none"
                                    style={{ transition: 'color 0.3s' }}
                                    onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                                >
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="mb-3 fw-bold" style={{ color: '#C9A961' }}>Support</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <Link 
                                    to="/contact" 
                                    className="text-muted text-decoration-none"
                                    style={{ transition: 'color 0.3s' }}
                                    onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link 
                                    to="/faq" 
                                    className="text-muted text-decoration-none"
                                    style={{ transition: 'color 0.3s' }}
                                    onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link 
                                    to="/terms" 
                                    className="text-muted text-decoration-none"
                                    style={{ transition: 'color 0.3s' }}
                                    onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                                >
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link 
                                    to="/privacy" 
                                    className="text-muted text-decoration-none"
                                    style={{ transition: 'color 0.3s' }}
                                    onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link 
                                    to="/cancellation" 
                                    className="text-muted text-decoration-none"
                                    style={{ transition: 'color 0.3s' }}
                                    onMouseEnter={(e) => e.target.style.color = '#C9A961'}
                                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                                >
                                    Cancellation Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="mb-3 fw-bold" style={{ color: '#C9A961' }}>Contact Info</h5>
                        <ul className="list-unstyled">
                            <li className="mb-3 d-flex align-items-start">
                                <i className="fas fa-map-marker-alt mt-1 me-2" style={{ color: '#C9A961' }}></i>
                                <span className="text-muted" style={{ fontSize: '0.95rem' }}>
                                    Between Palermo & Trapani<br />
                                    Sicily, Italy
                                </span>
                            </li>
                            <li className="mb-3 d-flex align-items-center">
                                <i className="fas fa-phone-alt me-2" style={{ color: '#C9A961' }}></i>
                                <a 
                                    href="tel:+393123456789" 
                                    className="text-muted text-decoration-none"
                                    style={{ fontSize: '0.95rem' }}
                                >
                                    +39 312 345 6789
                                </a>
                            </li>
                            <li className="mb-3 d-flex align-items-center">
                                <i className="fas fa-envelope me-2" style={{ color: '#C9A961' }}></i>
                                <a 
                                    href="mailto:info@caliafarm.com" 
                                    className="text-muted text-decoration-none"
                                    style={{ fontSize: '0.95rem' }}
                                >
                                    info@caliafarm.com
                                </a>
                            </li>
                            <li className="d-flex align-items-center">
                                <i className="fas fa-clock me-2" style={{ color: '#C9A961' }}></i>
                                <span className="text-muted" style={{ fontSize: '0.95rem' }}>
                                    Mon - Sun: 9:00 - 20:00
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <hr className="my-4" style={{ borderColor: '#495057' }} />
                <div className="row align-items-center">
                    <div className="col-md-6 text-center text-md-start">
                        <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                            © {new Date().getFullYear()} CaliaFarm. All rights reserved.
                        </p>
                    </div>
                    <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
                        <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                            <span className="me-3">
                                <i className="fas fa-star text-warning"></i>
                                <i className="fas fa-star text-warning"></i>
                                <i className="fas fa-star text-warning"></i>
                                <i className="fas fa-star text-warning"></i>
                                <i className="fas fa-star text-warning"></i>
                            </span>
                            5-Star Rated on TripAdvisor
                        </p>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="row mt-4">
                    <div className="col-12 text-center">
                        <div className="d-flex justify-content-center align-items-center flex-wrap gap-4">
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                <i className="fas fa-shield-alt me-2" style={{ color: '#C9A961' }}></i>
                                Secure Payment
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                <i className="fas fa-lock me-2" style={{ color: '#C9A961' }}></i>
                                SSL Protected
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                <i className="fas fa-check-circle me-2" style={{ color: '#C9A961' }}></i>
                                100% Verified
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                <i className="fas fa-award me-2" style={{ color: '#C9A961' }}></i>
                                Family Owned Since 2010
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};