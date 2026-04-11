/**
 * API Service - централизованный сервис для работы с API
 * Все запросы к бэкенду проходят через этот модуль
 */

import axios from 'axios';

// Базовый URL API
const API_BASE_URL = 'http://localhost:8080';

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Очищаем данные при неавторизованном доступе
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

/**
 * Auth API - методы для работы с авторизацией
 */
export const authApi = {
  /**
   * Вход пользователя
   * @param {Object} credentials - { username, password }
   * @returns {Promise} - ответ сервера
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Регистрация пользователя
   * @param {Object} userData - { username, email, password }
   * @returns {Promise} - ответ сервера
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Выход пользователя
   * @returns {Promise} - ответ сервера
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Получение URL для Google OAuth
   * @returns {string} - URL для авторизации через Google
   */
  getYandexAuthUrl: () => {
    return `${API_BASE_URL}/auth/yandex`;
  },
};

/**
 * Profile API - методы для работы с профилем пользователя
 */
export const profileApi = {
  /**
   * Получение данных профиля
   * @returns {Promise} - данные профиля
   */
  getProfile: async () => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  /**
   * Обновление данных профиля
   * @param {Object} profileData - данные для обновления
   * @returns {Promise} - обновленные данные профиля
   */
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/profile', profileData);
    return response.data;
  },
};

/**
 * Books API - методы для работы с книгами
 */
export const booksApi = {
  /**
   * Получение книг по категории
   * @param {string} category - категория книг
   * @param {number} offset - смещение для пагинации
   * @returns {Promise} - список книг
   */
  getByCategory: async (category, offset = 0) => {
    let url = `/books/category?category=${category}`;
    if (offset > 0) {
      url += `&offset=${offset}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Получение популярных книг
   * @returns {Promise} - список популярных книг
   */
  getPopular: async () => {
    const response = await apiClient.get('/books/category?category=popular');
    return response.data;
  },

  /**
   * Получение новинок
   * @param {number} offset - смещение для пагинации
   * @returns {Promise} - список новинок
   */
  getNew: async (offset = 0) => {
    let url = '/books/category?category=new';
    if (offset > 0) {
      url += `&offset=${offset}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Получение книг по жанру
   * @param {string} genre - жанр книги
   * @returns {Promise} - список книг
   */
  getByGenre: async (genre) => {
    const response = await apiClient.get(`/books/category?category=${genre}`);
    return response.data;
  },

  /**
   * Получение аудиокниг
   * @returns {Promise} - список аудиокниг
   */
  getAudioBooks: async () => {
    const response = await apiClient.get('/books/category?category=popular&type=аудиокнига');
    return response.data;
  },

  /**
   * Получение рекомендуемых книг
   * @returns {Promise} - список рекомендуемых книг
   */
  getFeatured: async () => {
    const response = await apiClient.get('/books/featured');
    return response.data;
  },

  /**
   * Поиск книг
   * @param {string} query - поисковый запрос
   * @returns {Promise} - результаты поиска
   */
  search: async (query) => {
    const response = await apiClient.get(`/books/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  /**
   * Получение информации о книге
   * @param {number} bookId - ID книги
   * @returns {Promise} - данные книги
   */
  getById: async (bookId) => {
    const response = await apiClient.get(`/books/${bookId}`);
    return response.data;
  },
};

export default apiClient;
