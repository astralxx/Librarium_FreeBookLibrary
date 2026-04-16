import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Очищаем ошибку при вводе
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Простая клиентская валидация
    const validateForm = () => {
        const newErrors = {};

        if (!formData.username || formData.username.length < 3) {
            newErrors.username = 'Имя пользователя должно быть не менее 3 символов';
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Введите корректный email';
        }
        if (!formData.password || formData.password.length < 8) {
            newErrors.password = 'Пароль должен быть не менее 8 символов';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:8080/auth/register',
                {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                },
                {
                    withCredentials: true,   // ← КРИТИЧНО для cookies
                }
            );

            // Успешная регистрация
            const userData = {
                username: response.data.user?.username || formData.username,
                email: response.data.user?.email || formData.email,
            };

            login(userData);                    // сохраняем в AuthContext
            toast.success('Регистрация прошла успешно! Добро пожаловать в Либрариум 🎉');

            navigate('/profile');               // переходим в профиль

        } catch (error) {
            const errorMsg = error.response?.data?.message 
                || error.response?.data?.errors?.[0]?.message 
                || 'Ошибка регистрации. Попробуйте ещё раз.';

            setErrors({ submit: errorMsg });
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleYandexLogin = () => {
        window.location.href = 'http://localhost:8080/auth/yandex';
    };

    return (
        <div className="auth-page">
            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="auth-card">
                    {/* Заголовок */}
                    <div className="auth-header">
                        <motion.div className="auth-logo">Либрариум</motion.div>
                        <motion.h1 className="auth-title">Регистрация</motion.h1>
                        <motion.p className="auth-subtitle">Создайте аккаунт в Либрариум</motion.p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Общая ошибка */}
                        {errors.submit && (
                            <motion.div className="form-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {errors.submit}
                            </motion.div>
                        )}

                        {/* Username */}
                        <div className="form-group">
                            <label className="form-label">Имя пользователя</label>
                            <div className="auth-input-wrapper">
                                <input
                                    name="username"
                                    type="text"
                                    className={`auth-input ${errors.username ? 'auth-input--error' : ''}`}
                                    placeholder="Введите имя пользователя"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <FiUser className="auth-input-icon" />
                            </div>
                            {errors.username && <span className="field-error">{errors.username}</span>}
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="auth-input-wrapper">
                                <input
                                    name="email"
                                    type="email"
                                    className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
                                    placeholder="Введите email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <FiMail className="auth-input-icon" />
                            </div>
                            {errors.email && <span className="field-error">{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label className="form-label">Пароль</label>
                            <div className="password-wrapper">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
                                    placeholder="Введите пароль"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <FiLock className="auth-input-icon" />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {errors.password && <span className="field-error">{errors.password}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label className="form-label">Подтвердите пароль</label>
                            <div className="password-wrapper">
                                <input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className={`auth-input ${errors.confirmPassword ? 'auth-input--error' : ''}`}
                                    placeholder="Подтвердите пароль"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <FiLock className="auth-input-icon" />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>Регистрация...</>
                            ) : (
                                'Зарегистрироваться'
                            )}
                        </button>
                    </form>

                    {/* Яндекс */}
                    <motion.button
                        type="button"
                        className="auth-social-btn"
                        onClick={handleYandexLogin}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FaGoogle className="auth-social-icon" />
                        Зарегистрироваться через Яндекс
                    </motion.button>

                    <div className="auth-switch">
                        <p className="auth-switch-text">
                            Уже есть аккаунт?{' '}
                            <Link to="/login" className="auth-switch-link">
                                Войти
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;