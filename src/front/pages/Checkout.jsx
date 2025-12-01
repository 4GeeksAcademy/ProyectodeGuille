import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBackend, { API_ENDPOINTS } from '../components/BackendURL';

const Checkout = () => {
    const [step, setStep] = useState(1); // 1: Dirección, 2: Pago, 3: Confirmación
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const { fetchFromBackend } = useBackend();
    const navigate = useNavigate();

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            // 1. Obtener carrito del usuario
            const user = JSON.parse(localStorage.getItem('user'));
            const cartResponse = await fetchFromBackend(`${API_ENDPOINTS.CART.GET}?user_id=${user.id}`);

            // 2. Crear orden
            const orderData = {
                user_id: user.id,
                items: cartResponse.items,
                payment_method: paymentMethod,
                shipping_address: {
                    street: "Calle Principal 123",
                    city: "Ciudad",
                    zip: "12345"
                }
            };

            const orderResponse = await fetchFromBackend(API_ENDPOINTS.ORDERS.CREATE, {
                method: 'POST',
                body: JSON.stringify(orderData)
            });

            // 3. Procesar pago
            const paymentData = {
                order_id: orderResponse.order.id,
                amount: orderResponse.order.total,
                payment_method: paymentMethod
            };

            const paymentResponse = await fetchFromBackend('/payments/create-payment', {
                method: 'POST',
                body: JSON.stringify(paymentData)
            });

            if (paymentResponse.success) {
                // 4. Vaciar carrito
                await fetchFromBackend('/cart/clear', {
                    method: 'POST',
                    body: JSON.stringify({ user_id: user.id })
                });

                // 5. Redirigir a confirmación
                navigate('/orders');
            } else {
                alert('Pago fallido. Intenta nuevamente.');
            }

        } catch (error) {
            console.error('Error en checkout:', error);
            alert('Error al procesar el pedido');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            {/* Pasos */}
            <div className="mb-8">
                <div className="flex justify-between">
                    {['Dirección', 'Pago', 'Confirmación'].map((label, index) => (
                        <div key={index} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step > index + 1 ? 'bg-green-500' :
                                    step === index + 1 ? 'bg-blue-500' : 'bg-gray-300'
                                } text-white`}>
                                {index + 1}
                            </div>
                            <span className="ml-2">{label}</span>
                            {index < 2 && <div className="w-16 h-1 bg-gray-300 mx-2"></div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Formulario de pago */}
            {step === 2 && (
                <div className="max-w-md mx-auto">
                    <h2 className="text-xl font-semibold mb-4">Método de Pago</h2>

                    <select
                        className="w-full p-2 border rounded mb-4"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="credit_card">Tarjeta de Crédito</option>
                        <option value="paypal">PayPal</option>
                        <option value="bank_transfer">Transferencia Bancaria</option>
                    </select>

                    {paymentMethod === 'credit_card' && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Número de tarjeta"
                                className="w-full p-2 border rounded"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                            />
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    placeholder="MM/AA"
                                    className="flex-1 p-2 border rounded"
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="CVC"
                                    className="w-24 p-2 border rounded"
                                    value={cvc}
                                    onChange={(e) => setCvc(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full mt-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                        {isProcessing ? 'Procesando...' : 'Pagar Ahora'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Checkout;