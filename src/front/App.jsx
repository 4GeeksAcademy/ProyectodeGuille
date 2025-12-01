import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import CustomerDashboard from './pages/CustomerDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import QuoteHistory from './pages/QuoteHistory';
import Profile from './pages/Profile';
import Demo from './pages/Demo';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="products" element={<ProductCatalog />} />
                    <Route path="products/:id" element={<ProductDetail />} />
                    <Route path="customer/dashboard" element={<CustomerDashboard />} />
                    <Route path="business/dashboard" element={<BusinessDashboard />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="quotes" element={<QuoteHistory />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="demo" element={<Demo />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;