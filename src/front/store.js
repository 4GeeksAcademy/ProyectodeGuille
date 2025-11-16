// src/front/js/store/store.js

export const initialStore = () => {
    return {
        // Mensaje de ejemplo (puedes mantenerlo o quitarlo)
        message: null,
        
        // Usuario autenticado
        user: null,
        
        // Carrito de compras
        cart: JSON.parse(localStorage.getItem('cart')) || [],
        
        // Datos de la aplicación
        experiences: [],
        rooms: [],
        packages: [],
        
        // Reserva en proceso
        currentBooking: null
    }
}

export default function storeReducer(store, action = {}) {
    switch (action.type) {
        // ============= MENSAJE DE EJEMPLO =============
        case 'set_hello':
            return {
                ...store,
                message: action.payload
            };

        // ============= EXPERIENCIAS =============
        case 'set_experiences':
            return {
                ...store,
                experiences: action.payload
            };

        // ============= HABITACIONES =============
        case 'set_rooms':
            return {
                ...store,
                rooms: action.payload
            };

        // ============= PAQUETES =============
        case 'set_packages':
            return {
                ...store,
                packages: action.payload
            };

        // ============= USUARIO =============
        case 'set_user':
            return {
                ...store,
                user: action.payload
            };

        case 'logout':
            localStorage.removeItem('token');
            localStorage.removeItem('cart');
            return {
                ...store,
                user: null,
                cart: []
            };

        // ============= CARRITO =============
        case 'add_to_cart':
            const newCart = [...store.cart, action.payload];
            localStorage.setItem('cart', JSON.stringify(newCart));
            return {
                ...store,
                cart: newCart
            };

        case 'remove_from_cart':
            const filteredCart = store.cart.filter((_, index) => index !== action.payload);
            localStorage.setItem('cart', JSON.stringify(filteredCart));
            return {
                ...store,
                cart: filteredCart
            };

        case 'update_cart_item':
            const updatedCart = store.cart.map((item, index) => 
                index === action.payload.index ? action.payload.item : item
            );
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            return {
                ...store,
                cart: updatedCart
            };

        case 'clear_cart':
            localStorage.removeItem('cart');
            return {
                ...store,
                cart: []
            };

        // ============= RESERVA ACTUAL =============
        case 'set_current_booking':
            return {
                ...store,
                currentBooking: action.payload
            };

        case 'clear_current_booking':
            return {
                ...store,
                currentBooking: null
            };

        default:
            return store;
    }
}