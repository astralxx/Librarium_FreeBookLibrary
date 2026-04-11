/**
 * Header Component - шапка сайта с премиальным дизайном
 * Включает навигацию, поиск, переключатель темы и меню пользователя
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSearch, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../pages/auth/AuthContext';
import { ThemeToggle } from '../common';
import Button from '../common/Button';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLargeScreenMenu, setIsLargeScreenMenu] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Отслеживание скролла для изменения фона хедера
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Закрытие меню при изменении маршрута
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Закрытие меню по Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Обработка размера экрана для больших разрешений
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreenMenu(window.innerWidth >= 1825);
      
      // Если размер экрана стал меньше 1825px, закрываем меню
      if (window.innerWidth < 1825) {
        setIsMenuOpen(false);
      }
    };

    // Инициализация при монтировании
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/', label: 'Главное' },
    { path: '/stats', label: 'Статистика' },
    { path: '#', label: 'Аудио' },
    { path: '#', label: 'Комиксы' },
    { path: '#', label: 'Мои книги' },
  ];

  return (
    <motion.header
      className={`header ${isScrolled ? 'header--scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      role="banner"
    >
      <div className="header__container">
        {/* Логотип */}
        <Link to="/" className="header__logo" aria-label="Либрариум - Главная">
          <motion.span
            className="header__logo-text"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Либрариум
          </motion.span>
        </Link>

        {/* Навигация для десктопа */}
        {!isLargeScreenMenu && (
        <nav className="header__nav" role="navigation" aria-label="Основная навигация">
          <ul className="header__nav-list">
            {navItems.map((item, index) => (
              <motion.li
                key={item.path}
                className="header__nav-item"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`header__nav-link ${
                    location.pathname === item.path ? 'header__nav-link--active' : ''
                  }`}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
        )}

        {/* Правая часть: поиск, тема, пользователь, меню */}
        <div className="header__actions">
          {/* Поиск */}
          <motion.button
            className="header__search-btn"
            onClick={toggleSearch}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Поиск"
            aria-expanded={isSearchOpen}
          >
            <FiSearch />
          </motion.button>

          {/* Переключатель темы */}
          <ThemeToggle size="medium" variant="icon" />

          {/* Пользователь */}
          {user ? (
            <div className="header__user">
              <Link to="/profile" className="header__user-link" aria-label="Профиль">
                <motion.div
                  className="header__user-avatar"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </motion.div>
              </Link>
              <motion.button
                className="header__logout-btn"
                onClick={handleLogout}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Выйти"
              >
                <FiLogOut />
              </motion.button>
            </div>
          ) : (
            <div className="header__auth">
              <Link to="/login">
                <Button variant="ghost" size="small">
                  Войти
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="small">
                  Регистрация
                </Button>
              </Link>
            </div>
          )}

          {/* Мобильное меню */}
          <motion.button
            className="header__menu-btn"
            onClick={toggleMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </motion.button>
        </div>
      </div>

      {/* Мобильное меню */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="header__mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            role="navigation"
            aria-label="Мобильная навигация"
          >
            <nav className="header__mobile-nav">
              <ul className="header__mobile-nav-list">
                {navItems.map((item, index) => (
                  <motion.li
                    key={item.path}
                    className="header__mobile-nav-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={`header__mobile-nav-link ${
                        location.pathname === item.path ? 'header__mobile-nav-link--active' : ''
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={location.pathname === item.path ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              
              {/* Переключатель темы в мобильном меню */}
              <div className="header__mobile-theme">
                <ThemeToggle size="medium" variant="button" />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Поиск */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="header__search"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            role="search"
          >
            <div className="header__search-container">
              <input
                type="text"
                className="header__search-input"
                placeholder="Поиск книг, авторов..."
                autoFocus
                aria-label="Поиск книг"
              />
              <button className="header__search-submit" aria-label="Найти">
                <FiSearch />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
