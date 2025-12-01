import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setLoading(false)
                return
            }

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            } else {
                localStorage.removeItem('token')
            }
        } catch (error) {
            console.error('Auth check failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            })

            if (response.ok) {
                const data = await response.json()
                localStorage.setItem('token', data.access_token)
                setUser(data.user)
                return { success: true, user: data.user }
            } else {
                const error = await response.json()
                return { success: false, error: error.error }
            }
        } catch (error) {
            return { success: false, error: 'Login failed' }
        }
    }

    const register = async (userData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            })

            if (response.ok) {
                const data = await response.json()
                localStorage.setItem('token', data.access_token)
                setUser(data.user)
                return { success: true, user: data.user }
            } else {
                const error = await response.json()
                return { success: false, error: error.error }
            }
        } catch (error) {
            return { success: false, error: 'Registration failed' }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    const getToken = () => {
        return localStorage.getItem('token')
    }

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        getToken,
        checkAuthStatus
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}