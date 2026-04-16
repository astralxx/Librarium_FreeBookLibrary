import React, { createContext, useEffect, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Проверка авторизации через cookies
    const checkAuth = async () => {
        try {
            const response = await axios.get('http://localhost:8080/profile', {
                withCredentials: true,        // ← Обязательно для отправки cookies
                timeout: 8000
            });

            const userData = {
                username: response.data.username,
                email: response.data.email,
            };

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            // Не авторизован или токен истёк
            console.log('Not authenticated or session expired');
            setUser(null);
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    };

    // Логин (вызывается после успешной регистрации/входа)
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Выход
    const logout = async () => {
        try {
            await axios.post(
                'http://localhost:8080/auth/logout',
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            // Очистка всех cookies
            document.cookie.split(';').forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, '')
                    .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
            });
        }
    };

    // Инициализация при загрузке приложения
    useEffect(() => {
        // Восстанавливаем пользователя из localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('user');
            }
        }

        // Проверяем актуальную сессию на сервере
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                checkAuth,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);