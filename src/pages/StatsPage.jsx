/**
 * StatsPage Component - страница статистики
 * Включает графики, таблицу книг и фильтры
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useBooksTable } from '../hooks/useBooksTable';
import { GENRES, SORT_OPTIONS, PAGINATION } from '../utils/constants';
import { formatNumber } from '../utils/helpers';
import '../styles/pages/StatsPage.css';

// Регистрируем компоненты Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const StatsPage = () => {
  // Данные для графиков
  const userGenreData = [
    { genre: 'Фэнтези', count: 1 },
    { genre: 'Детектив', count: 1 },
    { genre: 'Романтика', count: 1 },
    { genre: 'Триллер', count: 1 },
    { genre: 'Бизнес', count: 1 },
    { genre: 'Психология', count: 1 },
  ];

  const siteGenreData = [
    { genre: 'Фэнтези', count: 35 },
    { genre: 'Детектив', count: 25 },
    { genre: 'Романтика', count: 30 },
    { genre: 'Триллер', count: 20 },
    { genre: 'Бизнес', count: 15 },
    { genre: 'Психология', count: 25 },
  ];

  const backgroundColors = [
    '#FF6B35',
    '#E85D04',
    '#FF8C5A',
    '#FFB366',
    '#FFD9B3',
    '#FFF5E6',
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#FFFFFF',
          font: {
            family: 'Inter',
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'Inter',
          size: 14,
        },
        bodyFont: {
          family: 'Inter',
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  const userChartData = {
    labels: userGenreData.map((item) => item.genre),
    datasets: [
      {
        data: userGenreData.map((item) => item.count),
        backgroundColor: backgroundColors,
        borderColor: '#000000',
        borderWidth: 2,
      },
    ],
  };

  const siteChartData = {
    labels: siteGenreData.map((item) => item.genre),
    datasets: [
      {
        data: siteGenreData.map((item) => item.count),
        backgroundColor: backgroundColors,
        borderColor: '#000000',
        borderWidth: 2,
      },
    ],
  };

  // Хук для таблицы книг
  const {
    paginatedBooks,
    currentPage,
    totalPages,
    searchTerm,
    selectedGenre,
    sortConfig,
    setSearchTerm,
    setCurrentPage,
    handleSort,
    handleSearch,
    handleGenreChange,
    handleSortSelectChange,
  } = useBooksTable();

  return (
    <div className="stats-page">
      <div className="stats-container">
        {/* Заголовок */}
        <motion.div
          className="stats-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="stats-title">Ваша статистика в Либрариум</h1>
          <p className="stats-subtitle">
            Анализируйте свои читательские привычки и открывайте новые книги
          </p>
        </motion.div>

        {/* Графики */}
        <motion.div
          className="stats-charts"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="stats-chart-card">
            <h3 className="stats-chart-title">Ваши популярные жанры</h3>
            <div className="stats-chart-container">
              <Pie data={userChartData} options={chartOptions} />
            </div>
          </div>
          
          <div className="stats-chart-card">
            <h3 className="stats-chart-title">Популярные жанры на сайте</h3>
            <div className="stats-chart-container">
              <Pie data={siteChartData} options={chartOptions} />
            </div>
          </div>
        </motion.div>

        {/* Контролы */}
        <motion.div
          className="stats-controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="stats-search">
            <input
              type="text"
              className="stats-search-input"
              placeholder="Поиск по названию или автору..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="stats-search-btn" onClick={handleSearch}>
              <FiSearch />
              Найти
            </button>
          </div>
          
          <div className="stats-filters">
            <select
              className="stats-filter-select"
              value={selectedGenre}
              onChange={handleGenreChange}
            >
              {GENRES.map((genre) => (
                <option key={genre.value} value={genre.value}>
                  {genre.label}
                </option>
              ))}
            </select>
            
            <select
              className="stats-filter-select"
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={handleSortSelectChange}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Таблица */}
        <motion.div
          className="stats-table-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <table className="stats-table">
            <thead className="stats-table-header">
              <tr>
                <th
                  className={`sortable ${sortConfig.key === 'title' ? `sort-${sortConfig.direction}` : ''}`}
                  onClick={() => handleSort('title')}
                >
                  Название
                </th>
                <th
                  className={`sortable ${sortConfig.key === 'author' ? `sort-${sortConfig.direction}` : ''}`}
                  onClick={() => handleSort('author')}
                >
                  Автор
                </th>
                <th
                  className={`sortable ${sortConfig.key === 'genre' ? `sort-${sortConfig.direction}` : ''}`}
                  onClick={() => handleSort('genre')}
                >
                  Жанр
                </th>
                <th
                  className={`sortable ${sortConfig.key === 'year' ? `sort-${sortConfig.direction}` : ''}`}
                  onClick={() => handleSort('year')}
                >
                  Год
                </th>
                <th
                  className={`sortable ${sortConfig.key === 'rating' ? `sort-${sortConfig.direction}` : ''}`}
                  onClick={() => handleSort('rating')}
                >
                  Рейтинг
                </th>
                <th
                  className={`sortable ${sortConfig.key === 'views' ? `sort-${sortConfig.direction}` : ''}`}
                  onClick={() => handleSort('views')}
                >
                  Просмотры
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedBooks.length > 0 ? (
                paginatedBooks.map((book) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.year}</td>
                    <td>
                      <div className="stats-table-rating">
                        <span className="stats-table-rating-star">★</span>
                        {book.rating.toFixed(1)}
                      </div>
                    </td>
                    <td>
                      <div className="stats-table-views">
                        <span className="stats-table-views-icon">👁</span>
                        {formatNumber(book.views)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="stats-empty">
                      <div className="stats-empty-icon">📚</div>
                      <p className="stats-empty-text">Книги не найдены</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <motion.div
            className="stats-pagination"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <button
              className="stats-pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
              Назад
            </button>
            
            <span className="stats-pagination-info">
              Страница {currentPage} из {totalPages}
            </span>
            
            <button
              className="stats-pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Вперед
              <FiChevronRight />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
