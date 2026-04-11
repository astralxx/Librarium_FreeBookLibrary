/**
 * Card Component - карточка с glassmorphism эффектом
 * Поддерживает различные варианты и анимации
 */

import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

const Card = ({
  children,
  variant = 'default', // default, glass, elevated, outlined
  padding = 'medium', // none, small, medium, large
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  ...props
}) => {
  const cardClasses = [
    'card',
    `card--${variant}`,
    `card--padding-${padding}`,
    hoverable && 'card--hoverable',
    clickable && 'card--clickable',
    className,
  ].filter(Boolean).join(' ');

  const MotionComponent = clickable ? motion.div : motion.div;

  return (
    <MotionComponent
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      whileHover={hoverable || clickable ? { 
        y: -5,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      } : {}}
      whileTap={clickable ? { scale: 0.98 } : {}}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

/**
 * CardHeader - заголовок карточки
 */
export const CardHeader = ({ children, className = '' }) => (
  <div className={`card__header ${className}`}>
    {children}
  </div>
);

/**
 * CardBody - тело карточки
 */
export const CardBody = ({ children, className = '' }) => (
  <div className={`card__body ${className}`}>
    {children}
  </div>
);

/**
 * CardFooter - футер карточки
 */
export const CardFooter = ({ children, className = '' }) => (
  <div className={`card__footer ${className}`}>
    {children}
  </div>
);

export default Card;
