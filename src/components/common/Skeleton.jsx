/**
 * Skeleton - компонент скелетона для загрузки
 * Имитирует контент во время загрузки данных
 */

import React from 'react';
import { motion } from 'framer-motion';
import './Skeleton.css';

/**
 * Базовый компонент скелетона
 * @param {Object} props - свойства компонента
 * @param {string} props.variant - вариант скелетона ('text', 'circular', 'rectangular', 'card')
 * @param {string} props.width - ширина (CSS значение)
 * @param {string} props.height - высота (CSS значение)
 * @param {string} props.className - дополнительные CSS классы
 */
const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
  ...props
}) => {
  const baseClasses = `skeleton skeleton--${variant}`;
  const combinedClasses = `${baseClasses} ${className}`.trim();

  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <motion.div
      className={combinedClasses}
      style={style}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

/**
 * Скелетон для карточки книги
 */
export const BookCardSkeleton = () => (
  <div className="skeleton-card">
    <Skeleton variant="rectangular" className="skeleton-card__image" />
    <div className="skeleton-card__content">
      <Skeleton variant="text" className="skeleton-card__title" />
      <Skeleton variant="text" className="skeleton-card__author" />
      <div className="skeleton-card__meta">
        <Skeleton variant="text" className="skeleton-card__rating" />
        <Skeleton variant="text" className="skeleton-card__price" />
      </div>
    </div>
  </div>
);

/**
 * Скелетон для списка книг
 * @param {Object} props - свойства компонента
 * @param {number} props.count - количество скелетонов
 */
export const BookListSkeleton = ({ count = 5 }) => (
  <div className="skeleton-list">
    {Array.from({ length: count }).map((_, index) => (
      <BookCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Скелетон для карусели
 * @param {Object} props - свойства компонента
 * @param {number} props.count - количество скелетонов в карусели
 */
export const CarouselSkeleton = ({ count = 6 }) => (
  <div className="skeleton-carousel">
    <Skeleton variant="text" className="skeleton-carousel__title" />
    <div className="skeleton-carousel__items">
      {Array.from({ length: count }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

/**
 * Скелетон для профиля
 */
export const ProfileSkeleton = () => (
  <div className="skeleton-profile">
    <Skeleton variant="circular" className="skeleton-profile__avatar" />
    <Skeleton variant="text" className="skeleton-profile__name" />
    <Skeleton variant="text" className="skeleton-profile__email" />
    <div className="skeleton-profile__stats">
      <Skeleton variant="rectangular" className="skeleton-profile__stat" />
      <Skeleton variant="rectangular" className="skeleton-profile__stat" />
      <Skeleton variant="rectangular" className="skeleton-profile__stat" />
    </div>
  </div>
);

/**
 * Скелетон для текстового блока
 * @param {Object} props - свойства компонента
 * @param {number} props.lines - количество строк
 */
export const TextSkeleton = ({ lines = 3 }) => (
  <div className="skeleton-text">
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        className={`skeleton-text__line ${index === lines - 1 ? 'skeleton-text__line--last' : ''}`}
      />
    ))}
  </div>
);

export default Skeleton;
