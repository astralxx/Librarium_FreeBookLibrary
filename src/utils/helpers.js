/**
 * Utility Functions - вспомогательные функции
 */

/**
 * Форматирование числа с разделителями тысяч
 * @param {number} number - число для форматирования
 * @returns {string} - отформатированное число
 */
export const formatNumber = (number) => {
  return number?.toLocaleString('ru-RU') || '0';
};

/**
 * Форматирование даты
 * @param {string|Date} date - дата для форматирования
 * @returns {string} - отформатированная дата
 */
export const formatDate = (date) => {
  if (!date) return 'Недавно';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Обрезка текста до указанной длины
 * @param {string} text - текст для обрезки
 * @param {number} maxLength - максимальная длина
 * @returns {string} - обрезанный текст
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Валидация email
 * @param {string} email - email для валидации
 * @returns {boolean} - результат валидации
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Валидация пароля
 * @param {string} password - пароль для валидации
 * @returns {Object} - { isValid, errors }
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Пароль обязателен');
  } else if (password.length < 6) {
    errors.push('Пароль должен быть не менее 6 символов');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Валидация имени пользователя
 * @param {string} username - имя пользователя для валидации
 * @returns {Object} - { isValid, errors }
 */
export const validateUsername = (username) => {
  const errors = [];
  
  if (!username?.trim()) {
    errors.push('Имя пользователя обязательно');
  } else if (username.length < 3) {
    errors.push('Имя пользователя должно быть не менее 3 символов');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Получение первой буквы имени
 * @param {string} name - имя
 * @returns {string} - первая буква
 */
export const getInitial = (name) => {
  return name?.charAt(0).toUpperCase() || 'U';
};

/**
 * Debounce функция
 * @param {Function} func - функция для debounce
 * @param {number} wait - время ожидания в мс
 * @returns {Function} - debounced функция
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle функция
 * @param {Function} func - функция для throttle
 * @param {number} limit - лимит времени в мс
 * @returns {Function} - throttled функция
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Генерация уникального ID
 * @returns {string} - уникальный ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Проверка на мобильное устройство
 * @returns {boolean} - true если мобильное устройство
 */
export const isMobile = () => {
  return window.innerWidth <= 768;
};

/**
 * Проверка на планшет
 * @returns {boolean} - true если планшет
 */
export const isTablet = () => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

/**
 * Проверка на десктоп
 * @returns {boolean} - true если десктоп
 */
export const isDesktop = () => {
  return window.innerWidth > 1024;
};
