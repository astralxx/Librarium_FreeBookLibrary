/**
 * LoginPage Component - страница авторизации
 * Минималистичный дизайн с валидацией и анимациями
 * Оптимизировано для компактного размещения на экране
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { authApi } from '../../services/api';
import { validateUsername, validatePassword } from '../../utils/helpers';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';
import { toast } from 'react-toastify';
import '../../styles/pages/AuthForms.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.errors[0];
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await authApi.login({
        username: formData.username,
        password: formData.password,
      });
      
      // Сохраняем токен
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      // Обновляем данные пользователя
      const userData = {
        username: response.user?.username || formData.username,
        email: response.user?.email || '',
      };
      
      login(userData);
      toast.success(SUCCESS_MESSAGES.loginSuccess);
      navigate('/profile');
    } catch (error) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.loginFailed;
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYandexLogin = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; Max-Age=0; path=/;';
    window.location.href = authApi.getYandexAuthUrl();
  };

  // Обработка нажатия Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
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
            <motion.div
              className="auth-logo"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Либрариум
            </motion.div>
            <motion.h1
              className="auth-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Войти
            </motion.h1>
            <motion.p
              className="auth-subtitle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              Добро пожаловать в Либрариум
            </motion.p>
          </div>

          {/* Форма */}
          <motion.form
            className="auth-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            onKeyDown={handleKeyDown}
          >
            {/* Ошибка отправки */}
            {errors.submit && (
              <motion.div
                className="form-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="form-error-icon">⚠</span>
                {errors.submit}
              </motion.div>
            )}

            {/* Имя пользователя */}
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Имя пользователя
              </label>
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
                  autoComplete="username"
                />
                <FiUser className="auth-input-icon" />
              </div>
              {errors.username && (
                <span className="field-error">{errors.username}</span>
              )}
            </div>

            {/* Пароль */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Пароль
              </label>
              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
                  placeholder="Введите пароль"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <FiLock className="auth-input-icon" />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>

            {/* Чекбокс и ссылка */}
            <div className="form-options">
              <label className="form-checkbox">
                <input type="checkbox" />
                <span className="form-checkbox-label">Запомнить меня</span>
              </label>
              <a href="#" className="form-link">
                Забыли пароль?
              </a>
            </div>

            {/* Кнопка входа */}
            <button
              type="submit"
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="auth-button-spinner"></span>
                  Вход...
                </>
              ) : (
                'Авторизироваться'
              )}
            </button>
          </motion.form>

          {/* Разделитель */}
          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">или</span>
            <div className="auth-divider-line" />
          </div>

          {/* Yandex кнопка */}
          <motion.button
            type="button"
            className="auth-social-btn"
            onClick={handleYandexLogin}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <FaGoogle className="auth-social-icon" />
            Войти через Яндекс
          </motion.button>

          {/* Переключение на регистрацию */}
          <div className="auth-switch">
            <p className="auth-switch-text">
              Нет аккаунта?{' '}
              <Link to="/register" className="auth-switch-link">
                Регистрация
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
