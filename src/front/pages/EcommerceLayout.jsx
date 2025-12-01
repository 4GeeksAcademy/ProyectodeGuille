import { Outlet } from "react-router-dom";
import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

// Layout específico para el ecommerce
const EcommerceLayout = () => {
    return (
        <div className="ecommerce-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default EcommerceLayout;