/**
 * Application Constants - константы приложения
 */

// Цветовая палитра
export const COLORS = {
  // Основные цвета
  primary: '#FF6B35',
  primaryDark: '#E85D04',
  primaryLight: '#FF8C5A',
  
  // Фоновые цвета
  background: {
    dark: '#000000',
    darkSecondary: '#111111',
    darkTertiary: '#2C2C2C',
    darkQuaternary: '#4A4A4A',
    light: '#F5F5F5',
    white: '#FFFFFF',
  },
  
  // Текстовые цвета
  text: {
    primary: '#FFFFFF',
    secondary: '#C5C5C5',
    dark: '#000000',
    muted: '#888888',
  },
  
  // Границы
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Тени
  shadow: {
    light: '0 4px 6px rgba(0, 0, 0, 0.1)',
    medium: '0 10px 25px rgba(0, 0, 0, 0.3)',
    heavy: '0 20px 50px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(255, 107, 53, 0.3)',
  },
  
  // Градиенты
  gradient: {
    primary: 'linear-gradient(135deg, #FF6B35 0%, #E85D04 100%)',
    dark: 'linear-gradient(180deg, #000000 0%, #111111 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },
};

// Шрифты
export const FONTS = {
  primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"Fira Code", "Courier New", monospace',
};

// Размеры шрифтов
export const FONT_SIZES = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
};

// Отступы
export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
};

// Радиусы скругления
export const BORDER_RADIUS = {
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

// Анимации
export const ANIMATIONS = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  verySlow: '1000ms',
};

// Breakpoints для адаптивности
export const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px',
  wide: '1536px',
};

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    google: '/auth/google/login',
  },
  profile: '/profile',
  books: {
    category: '/books/category',
    featured: '/books/featured',
    search: '/books/search',
    byId: (id) => `/books/${id}`,
  },
};

// Категории книг
export const BOOK_CATEGORIES = {
  popular: 'popular',
  new: 'new',
  fantasy: 'fantasy',
  selfdev: 'selfdev',
  comics: 'comics',
};

// Жанры
export const GENRES = [
  { value: '', label: 'Все жанры' },
  { value: 'Фэнтези', label: 'Фэнтези' },
  { value: 'Детектив', label: 'Детектив' },
  { value: 'Роман', label: 'Роман' },
  { value: 'Антиутопия', label: 'Антиутопия' },
  { value: 'Притча', label: 'Притча' },
  { value: 'Триллер', label: 'Триллер' },
  { value: 'Бизнес', label: 'Бизнес' },
  { value: 'Психология', label: 'Психология' },
];

// Опции сортировки
export const SORT_OPTIONS = [
  { value: 'views-desc', label: 'По популярности' },
  { value: 'title-asc', label: 'По названию (А-Я)' },
  { value: 'title-desc', label: 'По названию (Я-А)' },
  { value: 'author-asc', label: 'По автору (А-Я)' },
  { value: 'year-desc', label: 'По году (новые)' },
  { value: 'year-asc', label: 'По году (старые)' },
];

// Сообщения об ошибках
export const ERROR_MESSAGES = {
  required: 'Это поле обязательно',
  invalidEmail: 'Некорректный формат email',
  passwordTooShort: 'Пароль должен быть не менее 6 символов',
  usernameTooShort: 'Имя пользователя должно быть не менее 3 символов',
  loginFailed: 'Ошибка входа. Проверьте логин и пароль',
  registerFailed: 'Ошибка регистрации. Попробуйте позже',
  networkError: 'Ошибка сети. Проверьте подключение к интернету',
  serverError: 'Ошибка сервера. Попробуйте позже',
  unauthorized: 'Необходимо авторизоваться',
  notFound: 'Ресурс не найден',
};

// Сообщения об успехе
export const SUCCESS_MESSAGES = {
  loginSuccess: 'Вход выполнен успешно',
  registerSuccess: 'Регистрация прошла успешно',
  logoutSuccess: 'Вы вышли из аккаунта',
  profileUpdated: 'Профиль обновлен',
  bookAdded: 'Книга добавлена',
  bookRemoved: 'Книга удалена',
};

// Настройки пагинации
export const PAGINATION = {
  defaultPage: 1,
  booksPerPage: 5,
  maxVisiblePages: 5,
};

// Настройки карусели
export const CAROUSEL = {
  scrollStep: 1020,
  autoPlayInterval: 5000,
  animationDuration: 500,
};
