// src/front/pages/Confirmation.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Confirmation = () => {
    const [searchParams] = useSearchParams();
    const { dispatch } = useGlobalReducer();
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState(null);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (sessionId) {
            verifyPayment();
        } else {
            setError("No session ID found");
            setLoading(false);
        }
    }, [sessionId]);

    const verifyPayment = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/verify-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ session_id: sessionId })
            });

            const data = await response.json();

            if (response.ok) {
                setBooking(data);
                // Limpiar carrito después del pago exitoso
                dispatch({ type: 'clear_cart' });
            } else {
                setError(data.error || "Payment verification failed");
            }
            
            setLoading(false);
        } catch (error) {
            console.error("Error verifying payment:", error);
            setError("An error occurred while verifying your payment");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border mb-3" style={{ color: '#C9A961', width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h3>Verifying your payment...</h3>
                <p className="text-muted">Please wait while we confirm your booking.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                        <i className="fas fa-exclamation-circle text-danger mb-4" style={{ fontSize: '5rem' }}></i>
                        <h2 className="mb-3">Payment Verification Failed</h2>
                        <p className="text-muted mb-4">{error}</p>
                        <Link 
                            to="/" 
                            className="btn btn-lg px-5"
                            style={{
                                background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {/* Success Header */}
                    <div className="text-center mb-5">
                        <div className="mb-4">
                            <i 
                                className="fas fa-check-circle" 
                                style={{ fontSize: '5rem', color: '#28a745' }}
                            ></i>
                        </div>
                        <h1 className="mb-3">Booking Confirmed!</h1>
                        <p className="lead text-muted">
                            Thank you for your booking. A confirmation email has been sent to{' '}
                            <strong>{booking?.customer_email}</strong>
                        </p>
                    </div>

                    {/* Booking Details Card */}
                    <div className="card shadow-lg border-0 mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                <div>
                                    <h4 className="mb-1">Booking Reference</h4>
                                    <h3 className="mb-0 fw-bold" style={{ color: '#C9A961' }}>
                                        #{booking?.booking_number}
                                    </h3>
                                </div>
                                <div className="text-end">
                                    <small className="text-muted d-block">Booking Date</small>
                                    <strong>{new Date(booking?.created_at).toLocaleDateString()}</strong>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="mb-4">
                                <h5 className="mb-3">Customer Information</h5>
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted d-block">Name</small>
                                        <strong>{booking?.customer_name}</strong>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted d-block">Email</small>
                                        <strong>{booking?.customer_email}</strong>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted d-block">Phone</small>
                                        <strong>{booking?.customer_phone}</strong>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted d-block">Payment Status</small>
                                        <span className="badge bg-success">Paid</span>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Items */}
                            <div className="mb-4">
                                <h5 className="mb-3">Booking Details</h5>
                                {booking?.items?.map((item, index) => (
                                    <div key={index} className="border rounded p-3 mb-3">
                                        <div className="d-flex">
                                            <img 
                                                src={item.image_url} 
                                                alt={item.name}
                                                className="rounded me-3"
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="mb-2">{item.name}</h6>
                                                <div className="text-muted small">
                                                    {item.type === 'experience' && (
                                                        <>
                                                            <div>
                                                                <i className="far fa-calendar me-1"></i>
                                                                Date: {new Date(item.date).toLocaleDateString()}
                                                            </div>
                                                            <div>
                                                                <i className="fas fa-users me-1"></i>
                                                                Guests: {item.guests}
                                                            </div>
                                                        </>
                                                    )}
                                                    {item.type === 'room' && (
                                                        <>
                                                            <div>
                                                                <i className="far fa-calendar me-1"></i>
                                                                Check-in: {new Date(item.check_in).toLocaleDateString()}
                                                            </div>
                                                            <div>
                                                                <i className="far fa-calendar me-1"></i>
                                                                Check-out: {new Date(item.check_out).toLocaleDateString()}
                                                            </div>
                                                            <div>
                                                                <i className="fas fa-moon me-1"></i>
                                                                Nights: {item.nights}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {item.extras && item.extras.length > 0 && (
                                                    <div className="mt-2">
                                                        <small className="text-muted">
                                                            <strong>Extras:</strong> {item.extras.map(e => e.name).join(', ')}
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-end">
                                                <strong style={{ color: '#C9A961' }}>
                                                    €{item.subtotal.toFixed(2)}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                <h5 className="mb-0">Total Paid</h5>
                                <h3 className="mb-0 fw-bold" style={{ color: '#C9A961' }}>
                                    €{booking?.total_amount?.toFixed(2)}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Important Information */}
                    <div className="card border-0 bg-light mb-4">
                        <div className="card-body">
                            <h5 className="mb-3">
                                <i className="fas fa-info-circle me-2" style={{ color: '#C9A961' }}></i>
                                Important Information
                            </h5>
                            <ul className="mb-0">
                                <li className="mb-2">
                                    A confirmation email with your booking details has been sent to your email address.
                                </li>
                                <li className="mb-2">
                                    Please arrive 15 minutes before your scheduled time.
                                </li>
                                <li className="mb-2">
                                    For any changes or cancellations, please contact us at least 48 hours in advance.
                                </li>
                                <li>
                                    If you have any questions, contact us at: 
                                    <a href="mailto:info@caliafarm.com" className="ms-1">info@caliafarm.com</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="text-center">
                        <Link 
                            to="/" 
                            className="btn btn-lg px-5 me-3"
                            style={{
                                background: 'linear-gradient(135deg, #C9A961 0%, #8B7355 100%)',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            Return to Home
                        </Link>
                        <button 
                            className="btn btn-outline-secondary btn-lg px-5"
                            onClick={() => window.print()}
                        >
                            <i className="fas fa-print me-2"></i>
                            Print Receipt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};