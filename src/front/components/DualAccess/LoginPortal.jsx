import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import RoleSelector from './RoleSelector.jsx';

const LoginPortal = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        company_name: '',
        role: 'customer'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRoleChange = (role) => {
        setFormData(prev => ({ ...prev, role }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let result;
            if (isLogin) {
                result = await login(formData.email, formData.password);
            } else {
                result = await register(formData);
            }

            if (result.success) {
                // Redirigir según el rol
                if (result.user.role === 'business') {
                    navigate('/business');
                } else {
                    navigate('/customer');
                }
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-portal">
            <div className="portal-container">
                <div className="portal-header">
                    <h1>EcoLuxury Craft</h1>
                    <p>Lujo Sostenible Inteligente</p>
                </div>

                <div className="portal-tabs">
                    <button
                        className={`tab ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        className={`tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Registrarse
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="portal-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellido</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tu apellido"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+34 123 456 789"
                                />
                            </div>

                            <div className="form-group">
                                <label>Empresa (Opcional)</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    placeholder="Nombre de tu empresa"
                                />
                            </div>

                            {/* Componente RoleSelector integrado */}
                            <RoleSelector
                                selectedRole={formData.role}
                                onRoleChange={handleRoleChange}
                            />
                        </>
                    )}

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                    </button>
                </form>

                <div className="portal-features">
                    <div className="feature">
                        <span className="icon">⛵</span>
                        <span>Yates Solares Personalizados</span>
                    </div>
                    <div className="feature">
                        <span className="icon">✈️</span>
                        <span>Aviones Ecológicos</span>
                    </div>
                    <div className="feature">
                        <span className="icon">🌱</span>
                        <span>Tecnología Sostenible</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPortal;