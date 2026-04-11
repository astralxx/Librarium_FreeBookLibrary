/**
 * BookCard Component - карточка книги с премиальным дизайном
 * Включает анимации при наведении и glassmorphism эффект
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiHeart, FiBookmark } from 'react-icons/fi';
import './BookCard.css';

const BookCard = ({
  imageSrc,
  author,
  title,
  rating,
  views,
  year,
  genre,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  return (
    <motion.article
      className={`book-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -10 }}
    >
      {/* Изображение книги */}
      <div className="book-card__image-container">
        <motion.img
          src={imageSrc}
          alt={title}
          className="book-card__image"
          loading="lazy"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Оверлей при наведении */}
        <motion.div
          className="book-card__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            className="book-card__action-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiBookOpen />
            <span>Читать</span>
          </motion.button>
        </motion.div>

        {/* Кнопки избранного и закладок */}
        <div className="book-card__buttons">
          <motion.button
            className={`book-card__icon-btn ${isFavorite ? 'book-card__icon-btn--active' : ''}`}
            onClick={handleFavoriteClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          >
            <FiHeart />
          </motion.button>
          
          <motion.button
            className={`book-card__icon-btn ${isBookmarked ? 'book-card__icon-btn--active' : ''}`}
            onClick={handleBookmarkClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isBookmarked ? 'Убрать закладку' : 'Добавить закладку'}
          >
            <FiBookmark />
          </motion.button>
        </div>

        {/* Жанр */}
        {genre && (
          <motion.span
            className="book-card__genre"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {genre}
          </motion.span>
        )}
      </div>

      {/* Информация о книге */}
      <div className="book-card__info">
        <motion.h3
          className="book-card__title"
          animate={{ color: isHovered ? '#FF6B35' : '#FFFFFF' }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h3>
        
        <p className="book-card__author">{author}</p>
        
        {/* Метаданные */}
        <div className="book-card__meta">
          {rating && (
            <div className="book-card__rating">
              <span className="book-card__rating-star">★</span>
              <span className="book-card__rating-value">{rating.toFixed(1)}</span>
            </div>
          )}
          
          {views && (
            <div className="book-card__views">
              <span className="book-card__views-icon">👁</span>
              <span className="book-card__views-value">{views.toLocaleString()}</span>
            </div>
          )}
          
          {year && (
            <div className="book-card__year">
              <span className="book-card__year-value">{year}</span>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default BookCard;
