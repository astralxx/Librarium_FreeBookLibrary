/**
 * AudioBookCard Component - карточка аудиокниги с премиальным дизайном
 * Включает анимации при наведении и glassmorphism эффект
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiHeart, FiHeadphones } from 'react-icons/fi';
import './AudioBookCard.css';

const AudioBookCard = ({
  imageSrc,
  author,
  title,
  duration,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.article
      className={`audio-book-card ${className}`}
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
      <div className="audio-book-card__image-container">
        <motion.img
          src={imageSrc}
          alt={title}
          className="audio-book-card__image"
          loading="lazy"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Оверлей при наведении */}
        <motion.div
          className="audio-book-card__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            className="audio-book-card__play-btn"
            onClick={handlePlayClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </motion.button>
        </motion.div>

        {/* Кнопка избранного */}
        <motion.button
          className={`audio-book-card__favorite-btn ${isFavorite ? 'audio-book-card__favorite-btn--active' : ''}`}
          onClick={handleFavoriteClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <FiHeart />
        </motion.button>

        {/* Иконка наушников */}
        <div className="audio-book-card__icon">
          <FiHeadphones />
        </div>
      </div>

      {/* Информация о книге */}
      <div className="audio-book-card__info">
        <motion.h3
          className="audio-book-card__title"
          animate={{ color: isHovered ? '#FF6B35' : '#FFFFFF' }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h3>
        
        <p className="audio-book-card__author">{author}</p>
        
        {/* Длительность */}
        {duration && (
          <div className="audio-book-card__duration">
            <span className="audio-book-card__duration-icon">⏱</span>
            <span className="audio-book-card__duration-value">{duration}</span>
          </div>
        )}

        {/* Кнопка прослушивания */}
        <motion.button
          className="audio-book-card__listen-btn"
          onClick={handlePlayClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlay />
          <span>Слушать</span>
        </motion.button>
      </div>
    </motion.article>
  );
};

export default AudioBookCard;
