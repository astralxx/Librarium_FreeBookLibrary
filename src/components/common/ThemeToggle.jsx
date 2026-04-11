/**
 * ThemeToggle - компонент переключения темы
 * Анимированная кнопка для переключения между темной и светлой темой
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

/**
 * Компонент переключения темы
 * @param {Object} props - свойства компонента
 * @param {string} props.size - размер кнопки ('small', 'medium', 'large')
 * @param {string} props.variant - вариант стиля ('icon', 'button')
 */
const ThemeToggle = ({ size = 'medium', variant = 'icon' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  // Вариант только с иконкой
  if (variant === 'icon') {
    return (
      <motion.button
        className={`theme-toggle theme-toggle--icon theme-toggle--${size}`}
        onClick={toggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
        title={isDark ? 'Светлая тема' : 'Темная тема'}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiSun className="theme-toggle__icon" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiMoon className="theme-toggle__icon" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // Вариант с кнопкой и текстом
  return (
    <motion.button
      className={`theme-toggle theme-toggle--button theme-toggle--${size}`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            className="theme-toggle__content"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <FiSun className="theme-toggle__icon" />
            <span>Светлая тема</span>
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            className="theme-toggle__content"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <FiMoon className="theme-toggle__icon" />
            <span>Темная тема</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
