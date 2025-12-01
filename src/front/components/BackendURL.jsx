import React from 'react';

// URL base del backend - usando tu URL específica
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://cuddly-space-fishstick-q7xqj5g5v45c9q49-3001.app.github.dev/api';

const useBackend = () => {
	// Función para hacer fetch al backend
	const fetchFromBackend = async (endpoint, options = {}) => {
		const url = `${BACKEND_URL}${endpoint}`;
		const token = localStorage.getItem('token');

		const defaultOptions = {
			headers: {
				'Content-Type': 'application/json',
				...(token && { 'Authorization': `Bearer ${token}` }),
				...options.headers
			},
			...options
		};

		try {
			console.log('Fetching from:', url); // Debug
			const response = await fetch(url, defaultOptions);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('Error response:', errorText);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching from backend:', error);
			throw error;
		}
	};

	// Función para subir archivos (con FormData)
	const uploadToBackend = async (endpoint, formData) => {
		const url = `${BACKEND_URL}${endpoint}`;
		const token = localStorage.getItem('token');

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					...(token && { 'Authorization': `Bearer ${token}` })
				},
				body: formData
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error uploading:', error);
			throw error;
		}
	};

	return {
		BACKEND_URL,
		fetchFromBackend,
		uploadToBackend
	};
};

export default useBackend;

// Constantes de endpoints
export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: '/login',
		REGISTER: '/register',
		PROFILE: '/profile',
		LOGOUT: '/logout'
	},
	PRODUCTS: {
		LIST: '/products',
		DETAIL: (id) => `/products/${id}`,
		CREATE: '/products',
		UPDATE: (id) => `/products/${id}`,
		DELETE: (id) => `/products/${id}`
	},
	QUOTES: {
		LIST: '/quotes',
		CREATE: '/quotes',
		DETAIL: (id) => `/quotes/${id}`,
		UPDATE: (id) => `/quotes/${id}`
	},
	CART: {
		GET: '/cart',
		ADD: '/cart/add',
		REMOVE: (id) => `/cart/remove/${id}`,
		UPDATE: (id) => `/cart/update/${id}`
	},
	ORDERS: {
		LIST: '/orders',
		CREATE: '/orders',
		DETAIL: (id) => `/orders/${id}`
	},
	BUSINESS: {
		DASHBOARD: '/business/dashboard',
		ANALYTICS: '/business/analytics',
		PRODUCTS: '/business/products'
	},
	CUSTOMERS: {
		PROFILE: '/customers/profile',
		ORDERS: '/customers/orders',
		QUOTES: '/customers/quotes'
	}
};