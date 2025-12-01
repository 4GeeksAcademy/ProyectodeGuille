import { useReducer, useContext, createContext } from 'react';

// Estado inicial
const initialState = {
    user: null,
    cart: [],
    quotes: [],
    orders: [],
    products: [],
    isLoading: false,
    error: null,
    role: null  // 'customer' o 'business'
};

const GlobalContext = createContext();

// Reducer
const reducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                user: action.payload.user,
                role: action.payload.role
            };

        case 'LOGOUT':
            return initialState;

        case 'SET_CART':
            return { ...state, cart: action.payload };

        case 'ADD_TO_CART':
            const existingItem = state.cart.find(item => item.product_id === action.payload.product_id);
            if (existingItem) {
                return {
                    ...state,
                    cart: state.cart.map(item =>
                        item.product_id === action.payload.product_id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                };
            }
            return { ...state, cart: [...state.cart, { ...action.payload, quantity: 1 }] };

        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cart: state.cart.filter(item => item.product_id !== action.payload)
            };

        case 'UPDATE_CART_ITEM':
            return {
                ...state,
                cart: state.cart.map(item =>
                    item.product_id === action.payload.product_id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                )
            };

        case 'SET_PRODUCTS':
            return { ...state, products: action.payload };

        case 'SET_QUOTES':
            return { ...state, quotes: action.payload };

        case 'SET_ORDERS':
            return { ...state, orders: action.payload };

        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload };

        default:
            return state;
    }
};

// Provider
export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <GlobalContext.Provider value={{ state, dispatch }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Hook personalizado
export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobal must be used within GlobalProvider');
    }
    return context;
};