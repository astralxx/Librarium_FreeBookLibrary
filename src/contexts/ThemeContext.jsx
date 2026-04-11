/**
 * ThemeContext - контекст для управления темой приложения
 * Поддерживает темную и светлую темы с сохранением в localStorage
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Создаем контекст темы
const ThemeContext = createContext(undefined);

// Ключ для localStorage
const THEME_STORAGE_KEY = 'librarium-theme';

/**
 * Провайдер темы
 * @param {Object} props - свойства компонента
 * @param {React.ReactNode} props.children - дочерние элементы
 */
export const ThemeProvider = ({ children }) => {
  // Инициализируем тему из localStorage или используем темную по умолчанию
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        return savedTheme;
      }
      // Проверяем системные настройки
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Применяем тему к документу
  useEffect(() => {
    const root = document.documentElement;
    
    // Удаляем предыдущие классы темы
    root.classList.remove('theme-dark', 'theme-light');
    
    // Добавляем текущий класс темы
    root.classList.add(`theme-${theme}`);
    
    // Обновляем мета-тег theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0A0A0A' : '#FFFFFF');
    }
    
    // Сохраняем в localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Слушаем изменения системных настроек
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Только если пользователь не выбрал тему вручную
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Функция переключения темы
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Функция установки конкретной темы
  const setSpecificTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setTheme(newTheme);
    }
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Хук для использования контекста темы
 * @returns {Object} - объект с темой и функциями управления
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;
