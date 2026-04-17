import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff, FiMail } from 'react-icons/fi';
import { FaYandex } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { authApi } from '../../services/api';
import { validateUsername, validatePassword } from '../../utils/helpers';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';
import { toast } from 'react-toastify';
import '../../styles/pages/AuthForms.css';

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
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Надёжная валидация email (исправлена)
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    // Username
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.errors[0];
    }

    // Email — ИСПРАВЛЕНО
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    // Password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    // Confirm password
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
      const response = await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      const userData = {
        username: response.user?.username || formData.username,
        email: response.user?.email || formData.email,
      };

      login(userData);
      toast.success(SUCCESS_MESSAGES.registerSuccess || 'Регистрация прошла успешно! 🎉');
      navigate('/profile');
    } catch (error) {
      const errorMsg = error.response?.data?.message || ERROR_MESSAGES.registerFailed || 'Ошибка регистрации';
      setErrors({ submit: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYandexLogin = () => {
    window.location.href = authApi.getYandexAuthUrl();
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
          <div className="auth-header">
            <motion.div className="auth-logo">Либрариум</motion.div>
            <motion.h1 className="auth-title">Регистрация</motion.h1>
            <motion.p className="auth-subtitle">Создайте аккаунт и начните читать</motion.p>
          </div>

          <motion.form className="auth-form" onSubmit={handleSubmit}>
            {errors.submit && (
              <motion.div className="form-error">
                <span className="form-error-icon">⚠</span>
                {errors.submit}
              </motion.div>
            )}

            {/* Username */}
            <div className="form-group">
              <label className="form-label" htmlFor="username">Имя пользователя</label>
              <div className="auth-input-wrapper">
                <input
                  id="username"
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
              <label className="form-label" htmlFor="email">Email</label>
              <div className="auth-input-wrapper">
                <input
                  id="email"
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
            <label className="form-label" htmlFor="password">Пароль</label>
            <div className="password-wrapper">
                <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
                placeholder="Придумайте пароль"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                />
                <FiLock className="auth-input-icon" />
                <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Подтвердите пароль</label>
            <div className="password-wrapper">
                <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`auth-input ${errors.confirmPassword ? 'auth-input--error' : ''}`}
                placeholder="Повторите пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                />
                <FiLock className="auth-input-icon" />
                <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
            </div>
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="auth-button-spinner" />
                  Регистрация...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </button>
          </motion.form>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">или</span>
            <div className="auth-divider-line" />
          </div>

          <motion.button
            type="button"
            className="auth-social-btn"
            onClick={handleYandexLogin}
            whileHover={{ scale: 1.01 }}
          >
            <FaYandex className="auth-social-icon" />
            Войти через Яндекс
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