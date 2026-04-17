/**
 * ProfilePage Component - страница профиля пользователя
 * Добавлена новая секция «Стать Автором»
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiSettings, FiAward, FiLogOut, FiEdit2, FiEdit3 } from 'react-icons/fi';
import { useAuth } from '../auth/AuthContext';
import { profileApi } from '../../services/api';
import { getInitial, formatDate } from '../../utils/helpers';
import { SUCCESS_MESSAGES } from '../../utils/constants';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';
import '../../styles/pages/ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, login } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getProfile();
        setProfileData(data);
        
        if (data.username !== user?.username || data.email !== user?.email) {
          login({ username: data.username, email: data.email });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      navigate('/login');
    }
  }, [user, navigate, login]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(SUCCESS_MESSAGES.logoutSuccess);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ==================== ТАБЫ ====================
  const tabs = [
    { id: 'profile', label: 'Профиль', icon: <FiUser /> },
    { id: 'settings', label: 'Настройки', icon: <FiSettings /> },
    { id: 'achievements', label: 'Достижения', icon: <FiAward /> },
    { id: 'author', label: 'Стать Автором', icon: <FiEdit3 /> },   // ← НОВЫЙ ТАБ
  ];

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-loading-spinner" />
          <p className="profile-loading-text">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Заголовок профиля */}
        <motion.div className="profile-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="profile-avatar">
            <div className="profile-avatar-placeholder">
              {getInitial(user?.username)}
            </div>
            <button className="profile-avatar-edit" aria-label="Изменить аватар">
              <FiEdit2 />
            </button>
          </div>
          
          <div className="profile-info">
            <h1 className="profile-name">{user?.username}</h1>
            <p className="profile-email">{user?.email}</p>
            
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">0</span>
                <span className="profile-stat-label">Книг прочитано</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">0</span>
                <span className="profile-stat-label">Дней в системе</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">0</span>
                <span className="profile-stat-label">Баллов</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Навигация */}
        <motion.div className="profile-nav" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`profile-nav-btn ${activeTab === tab.id ? 'profile-nav-btn--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          
          <button className="profile-nav-btn profile-nav-btn--logout" onClick={handleLogout}>
            <FiLogOut />
            Выйти
          </button>
        </motion.div>

        {/* Секции */}
        <motion.div className="profile-sections" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>

          {/* === Профиль === */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2 className="profile-section-title">Основная информация</h2>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="profile-info-label">Имя пользователя</span>
                  <span className="profile-info-value">{user?.username}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Email</span>
                  <span className="profile-info-value">{user?.email}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Дата регистрации</span>
                  <span className="profile-info-value">{formatDate(profileData?.created_at)}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Последний вход</span>
                  <span className="profile-info-value">{formatDate(profileData?.last_login)}</span>
                </div>
              </div>
            </div>
          )}

          {/* === Настройки === */}
          {activeTab === 'settings' && (
            <div className="profile-section">
              <h2 className="profile-section-title">Настройки аккаунта</h2>
              <div className="profile-settings-form">
                <div className="profile-form-group">
                  <label className="profile-form-label">Имя пользователя</label>
                  <input type="text" className="profile-form-input" value={user?.username || ''} disabled />
                </div>
                <div className="profile-form-group">
                  <label className="profile-form-label">Email</label>
                  <input type="email" className="profile-form-input" value={user?.email || ''} disabled />
                </div>
                <Button variant="primary" size="medium">Сохранить изменения</Button>
              </div>
            </div>
          )}

          {/* === Достижения === */}
          {activeTab === 'achievements' && (
            <div className="profile-section">
              <h2 className="profile-section-title">Достижения</h2>
              <div className="profile-empty">
                <div className="profile-empty-icon">🏆</div>
                <p className="profile-empty-text">У вас пока нет достижений. Читайте книги и получайте награды!</p>
                <Button variant="primary" size="medium">Начать читать</Button>
              </div>
            </div>
          )}

          {/* === НОВАЯ СЕКЦИЯ: Стать Автором === */}
          {activeTab === 'author' && (
            <div className="profile-section profile-author-section">
              <h2 className="profile-section-title">Стать Автором</h2>
              <div className="profile-author-content">
                <div className="profile-author-icon">✍️</div>
                <h3>Публикуйте свои книги в Либрариум</h3>
                <p>
                  Станьте автором и делитесь своими произведениями с тысячами читателей.<br />
                  Получайте доход от чтений, отзывы и поддержку сообщества.
                </p>
                <Button 
                  variant="primary" 
                  size="large"
                  onClick={() => alert('Форма подачи заявки на авторство будет здесь (пока в разработке)')}
                >
                  Подать заявку на авторство
                </Button>
                <p className="profile-author-note">
                  Заявка рассматривается модераторами в течение 1–3 дней
                </p>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;