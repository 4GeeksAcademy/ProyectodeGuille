import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../hooks/useGlobalReducer';
import BackendURL, { API_ENDPOINTS } from '../components/BackendURL.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer'); // 'customer' o 'business'
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { dispatch } = useGlobal();
    const navigate = useNavigate();
    const { fetchFromBackend } = BackendURL();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await fetchFromBackend(API_ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                body: JSON.stringify({ email, password, role })
            });

            if (data.token) {
                // Guardar token
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Actualizar estado global
                dispatch({
                    type: 'LOGIN',
                    payload: {
                        user: data.user,
                        role: data.user.role
                    }
                });

                // Redirigir según el rol
                if (data.user.role === 'business') {
                    navigate('/business/dashboard');
                } else {
                    navigate('/customer/dashboard');
                }
            }
        } catch (err) {
            setError('Error al iniciar sesión. Verifica tus credenciales.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Iniciar Sesión
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        O{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            regístrate aquí
                        </button>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de cuenta
                        </label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio"
                                    name="role"
                                    value="customer"
                                    checked={role === 'customer'}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                <span className="ml-2">Cliente</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio"
                                    name="role"
                                    value="business"
                                    checked={role === 'business'}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                <span className="ml-2">Negocio</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>

                <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700">Datos de prueba:</h3>
                    <p className="text-xs text-gray-500">
                        Cliente: cliente@ejemplo.com / 123456<br />
                        Negocio: negocio@ejemplo.com / 123456
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;