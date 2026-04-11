/**
 * HomePage Component - главная страница приложения
 * Включает hero секцию, карусели книг и анимации
 * Персонализация приветствия для авторизованных пользователей
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiSearch, FiBookOpen, FiHeadphones, FiCompass, FiTrendingUp } from 'react-icons/fi';
import { BookCarousel, AudioBookCarousel } from '../components/carousels';
import { Button, ReadingProgress } from '../components/common';
import { useAuth } from './auth/AuthContext';
import '../styles/pages/HomePage.css';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { user } = useAuth();

  const categories = [
    { id: 'all', label: 'Все', icon: <FiCompass /> },
    { id: 'popular', label: 'Популярные', icon: <FiTrendingUp /> },
    { id: 'new', label: 'Новинки', icon: <FiBookOpen /> },
    { id: 'fantasy', label: 'Фантастика', icon: <FiBookOpen /> },
    { id: 'selfdev', label: 'Саморазвитие', icon: <FiBookOpen /> },
    { id: 'comics', label: 'Комиксы', icon: <FiBookOpen /> },
  ];

  const stats = [
    { icon: <FiBookOpen />, value: '10,000+', label: 'Книг' },
    { icon: <FiHeadphones />, value: '5,000+', label: 'Аудиокниг' },
    { icon: <FiCompass />, value: '50+', label: 'Категорий' },
    { icon: <FiTrendingUp />, value: '100,000+', label: 'Читателей' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search:', searchQuery);
  };

  // Персонализированное приветствие
  const getGreeting = () => {
    if (user?.username) {
      return `С возвращением, ${user.username}!`;
    }
    return 'Каждая страница — новая история';
  };

  return (
    <div className="home-page">
      {/* Прогресс-бар чтения */}
      <ReadingProgress position="top" />
      
      {/* Hero секция */}
      <section className="hero" aria-label="Hero секция">
        <div className="hero__background" />
        <div className="hero__overlay" />
        
        <motion.div
          className="hero__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {user?.username ? (
              <>
                С возвращением, <span>{user.username}</span>!
              </>
            ) : (
              <>
                Каждая страница — <span>новая история</span>
              </>
            )}
          </motion.h1>
          
          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Твоя библиотека в твоем компьютере. Тысячи книг, аудиокниг и комиксов доступны бесплатно.
          </motion.p>
          
          <motion.form
            className="hero__search"
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            role="search"
          >
            <input
              type="text"
              className="hero__search-input"
              placeholder="Поиск книг, авторов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Поиск книг"
            />
            <button type="submit" className="hero__search-btn" aria-label="Найти">
              <FiSearch />
              <span>Найти</span>
            </button>
          </motion.form>
          
          <motion.div
            className="categories"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            role="tablist"
            aria-label="Категории книг"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${activeCategory === category.id ? 'category-btn--active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
                role="tab"
                aria-selected={activeCategory === category.id}
                aria-controls={`category-${category.id}`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Основной контент */}
      <div className="main-content">
        <div className="container">
          {/* Статистика */}
          <motion.section
            className="stats"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            aria-label="Статистика библиотеки"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="stat-card__icon">{stat.icon}</div>
                <div className="stat-card__value">{stat.value}</div>
                <div className="stat-card__label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.section>

          {/* Рекомендации для авторизованных пользователей */}
          {user && (
            <motion.section
              className="recommendations"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              aria-label="Рекомендации"
            >
              <h2 className="section-title">Рекомендации для вас</h2>
              <p className="section-subtitle">
                На основе ваших интересов и прочитанных книг
              </p>
              <BookCarousel title="Рекомендуемые" category="popular" />
            </motion.section>
          )}

          {/* Аудиокниги */}
          <section className="carousel-section" aria-label="Аудиокниги">
            <AudioBookCarousel title="Аудиокниги" />
          </section>

          {/* Популярные книги */}
          <section className="carousel-section" aria-label="Популярные книги">
            <BookCarousel title="Популярные книги" category="popular" />
          </section>

          {/* Баннер */}
          <motion.section
            className="banner"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            aria-label="Баннер регистрации"
          >
            <div className="banner__content">
              <div className="banner__text">
                <h2 className="banner__title">Читай бесплатно</h2>
                <p className="banner__description">
                  Получите доступ к тысячам книг и аудиокниг совершенно бесплатно. 
                  Регистрация занимает всего минуту.
                </p>
                <Link to="/register">
                  <Button variant="primary" size="large">
                    Начать читать
                  </Button>
                </Link>
              </div>
            </div>
            <div className="banner__image" />
          </motion.section>

          {/* Новинки */}
          <section className="carousel-section" aria-label="Новинки">
            <BookCarousel title="Новинки" category="new" />
          </section>

          {/* Фантастика */}
          <section className="carousel-section" aria-label="Фантастика">
            <BookCarousel title="Фантастика" category="fantasy" />
          </section>

          {/* Саморазвитие */}
          <section className="carousel-section" aria-label="Саморазвитие">
            <BookCarousel title="Саморазвитие" category="selfdev" />
          </section>

          {/* Комиксы */}
          <section className="carousel-section" aria-label="Комиксы">
            <BookCarousel title="Комиксы" category="comics" />
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
