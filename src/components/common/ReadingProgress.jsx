/**
 * ReadingProgress - компонент прогресс-бара чтения
 * Отображает индикатор прокрутки страницы книги
 */

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import './ReadingProgress.css';

/**
 * Компонент прогресс-бара чтения
 * @param {Object} props - свойства компонента
 * @param {string} props.position - позиция бара ('top', 'bottom')
 * @param {string} props.color - цвет бара (CSS значение)
 * @param {boolean} props.showPercentage - показывать ли процент
 */
const ReadingProgress = ({
  position = 'top',
  color,
  showPercentage = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Плавная анимация прогресса
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Показываем бар только после прокрутки
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Вычисляем процент для отображения
  const [percentage, setPercentage] = useState(0);
  
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      setPercentage(Math.round(value * 100));
    });
    
    return () => unsubscribe();
  }, [scrollYProgress]);

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      className={`reading-progress reading-progress--${position}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Прогресс чтения: ${percentage}%`}
    >
      <motion.div
        className="reading-progress__bar"
        style={{
          scaleX,
          ...(color && { background: color }),
        }}
      />
      
      {showPercentage && (
        <div className="reading-progress__percentage">
          {percentage}%
        </div>
      )}
    </motion.div>
  );
};

export default ReadingProgress;
