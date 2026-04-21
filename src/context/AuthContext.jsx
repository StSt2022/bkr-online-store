// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

// Створюємо сам контекст
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true);

    // Функція логіну (зберігає токен і юзера)
    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
    };

    // Функція виходу
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    // При завантаженні сайту перевіряємо, чи є токен. Якщо є - "пінгуємо" бекенд
    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await fetch('http://localhost:3001/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    // Якщо токен протермінувався або невалідний
                    logout();
                }
            } catch (error) {
                console.error("Помилка авторизації", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};