import './LightTheme.css';
import React, {useState, useEffect} from 'react';
import { FaUser, FaLock, FaEnvelope, FaGoogle } from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function LoginRegistPage({ defaultForm = 'login' }) {
    const [action, setAction] = useState(defaultForm === 'register' ? ' active' : '');
    const { login } = useAuth();
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setAction(defaultForm === 'register' ? ' active' : '');
    }, [defaultForm]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = (isLogin = true) => {
        const newErrors = {};
        
        if (!formData.username.trim()) {
            newErrors.username = 'Имя пользователя обязательно';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Имя пользователя должно быть не менее 3 символов';
        }
        
        if (!isLogin && !formData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!isLogin && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Некорректный формат email';
        }
        
        if (!formData.password) {
            newErrors.password = 'Пароль обязателен';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен быть не менее 6 символов';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm(true)) return;
        
        setIsSubmitting(true);
        
        try {
            const response = await axios.post(
                "http://localhost:8080/auth/login",
                {
                    username: formData.username,
                    password: formData.password
                },
                { withCredentials: true }
            );
            
            // Сохраняем токен в localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            
            const userData = {
                username: response.data.user?.username || formData.username,
                email: response.data.user?.email || ''
            };

            login(userData);
            navigate('/profile');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Ошибка входа';
            setErrors({ submit: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm(false)) return;
        
        setIsSubmitting(true);
        
        try {
            const response = await axios.post(
                "http://localhost:8080/auth/register",
                {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                },
                { withCredentials: true }
            );
            
            // Сохраняем токен и данные пользователя
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                
                const userData = {
                    username: response.data.user.username,
                    email: response.data.user.email
                };
                
                login(userData);
                navigate('/profile');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Ошибка регистрации';
            setErrors({ submit: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const registerLink = (e) => {
        e.preventDefault();
        setAction(' active');
        setErrors({});
    }

    const loginLink = (e) => {
        e.preventDefault();
        setAction('');
        setErrors({});
    }

    const handleGoogleLogin = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        document.cookie = 'token=; Max-Age=0; path=/;';
        window.location.href = "http://localhost:8080/auth/google/login";
    };

    return(
        <div className="registration-page-div">
            <div className={`wrapper${action}`}>
                <div className="form-box login">
                    <form onSubmit={handleLoginSubmit}>
                        <h1>Войти</h1>
                        {errors.submit && <div className="error-message">{errors.submit}</div>}
                        <div className="input-box">
                            <input 
                                type="text" 
                                name="username"
                                placeholder='Имя пользователя' 
                                value={formData.username}
                                onChange={handleChange}
                                required
                                aria-invalid={errors.username ? 'true' : 'false'}
                            />
                            <FaUser className='icon'/>
                            {errors.username && <span className="field-error">{errors.username}</span>}
                        </div>
                        <div className="input-box">
                            <input 
                                type="password" 
                                name="password"
                                placeholder='Пароль' 
                                value={formData.password}
                                onChange={handleChange}
                                required
                                aria-invalid={errors.password ? 'true' : 'false'}
                            />
                            <FaLock className='icon'/>
                            {errors.password && <span className="field-error">{errors.password}</span>}
                        </div>
                        <div className="remember-forgot">
                            <label><input type="checkbox"/> Запомнить меня</label>
                            <a href="#">Забыли пароль?</a>
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Вход...' : 'Авторизироваться'}
                        </button>
                        <div className="social-login">
                        </div>
                        <div className="register-link">
                            <p>Нет аккаунта? <a href="#" onClick={registerLink}>Регистрация</a></p>
                        </div>
                        <button 
                            type="button" 
                            className="google-btn"
                            onClick={handleGoogleLogin}
                        >
                            <FaGoogle className='google-icon'/>
                        </button>
                    </form>
                </div>

                <div className="form-box register">
                    <form onSubmit={handleRegisterSubmit}>
                        <h1>Регистрация</h1>
                        {errors.submit && <div className="error-message">{errors.submit}</div>}
                        <div className="input-box">
                            <input 
                                type="text" 
                                name="username"
                                placeholder='Имя пользователя' 
                                value={formData.username}
                                onChange={handleChange}
                                required
                                aria-invalid={errors.username ? 'true' : 'false'}
                            />
                            <FaUser className='icon'/>
                            {errors.username && <span className="field-error">{errors.username}</span>}
                        </div>
                        <div className="input-box">
                            <input 
                                type="email" 
                                name="email"
                                placeholder='Email' 
                                value={formData.email}
                                onChange={handleChange}
                                required
                                aria-invalid={errors.email ? 'true' : 'false'}
                            />
                            <FaEnvelope className='icon'/>
                            {errors.email && <span className="field-error">{errors.email}</span>}
                        </div>
                        <div className="input-box">
                            <input 
                                type="password" 
                                name="password"
                                placeholder='Пароль' 
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
                                aria-invalid={errors.password ? 'true' : 'false'}
                            />
                            <FaLock className='icon'/>
                            {errors.password && <span className="field-error">{errors.password}</span>}
                        </div>
                        <div className="remember-forgot">
                            <label><input type="checkbox"/> Я согласен с правилами и условиями</label>
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>

                        <div className="register-link">
                            <p>У вас есть аккаунт? <a href="#" onClick={loginLink}>Авторизация</a></p>
                        </div>
                        <button 
                            type="button" 
                            className="google-btn"
                            onClick={handleGoogleLogin}
                        >
                            <FaGoogle className='google-icon'/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginRegistPage;
