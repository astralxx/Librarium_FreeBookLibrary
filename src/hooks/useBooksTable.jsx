/**
 * useBooksTable Hook - хук для управления таблицей книг
 * Включает фильтрацию, сортировку и пагинацию
 */

import { useState, useEffect, useMemo } from 'react';
import { PAGINATION } from '../utils/constants';

// Демо-данные для разработки
const DEMO_BOOKS = [
  { id: 1, title: "Властелин колец", author: "Дж. Р. Р. Толкин", genre: "Фэнтези", year: 1954, rating: 4.9, views: 12500 },
  { id: 2, title: "Гарри Поттер и философский камень", author: "Дж. К. Роулинг", genre: "Фэнтези", year: 1997, rating: 4.8, views: 11800 },
  { id: 3, title: "Преступление и наказание", author: "Ф. М. Достоевский", genre: "Роман", year: 1866, rating: 4.7, views: 9800 },
  { id: 4, title: "1984", author: "Джордж Оруэлл", genre: "Антиутопия", year: 1949, rating: 4.6, views: 8700 },
  { id: 5, title: "Убийство в Восточном экспрессе", author: "Агата Кристи", genre: "Детектив", year: 1934, rating: 4.5, views: 7600 },
  { id: 6, title: "Мастер и Маргарита", author: "М. А. Булгаков", genre: "Роман", year: 1967, rating: 4.8, views: 10500 },
  { id: 7, title: "Три товарища", author: "Эрих Мария Ремарк", genre: "Роман", year: 1936, rating: 4.7, views: 9200 },
  { id: 8, title: "Шерлок Холмс", author: "Артур Конан Дойл", genre: "Детектив", year: 1887, rating: 4.6, views: 8400 },
  { id: 9, title: "Маленький принц", author: "Антуан де Сент-Экзюпери", genre: "Притча", year: 1943, rating: 4.9, views: 11200 },
  { id: 10, title: "Анна Каренина", author: "Лев Толстой", genre: "Роман", year: 1877, rating: 4.7, views: 8900 },
];

export const useBooksTable = () => {
  const [booksData] = useState(DEMO_BOOKS);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(PAGINATION.defaultPage);
  const [sortConfig, setSortConfig] = useState({ key: 'views', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const booksPerPage = PAGINATION.booksPerPage;

  // Применяем фильтрацию и сортировку
  useEffect(() => {
    let result = [...booksData];
    
    // Фильтрация по поисковому запросу
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term)
      );
    }
    
    // Фильтрация по жанру
    if (selectedGenre) {
      result = result.filter((book) => book.genre === selectedGenre);
    }
    
    // Сортировка
    result.sort((a, b) => {
      let valueA = a[sortConfig.key];
      let valueB = b[sortConfig.key];
      
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredBooks(result);
    setCurrentPage(1); // Сброс на первую страницу при изменении фильтров
  }, [booksData, searchTerm, selectedGenre, sortConfig]);

  // Пагинация
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * booksPerPage;
    return filteredBooks.slice(startIndex, startIndex + booksPerPage);
  }, [filteredBooks, currentPage, booksPerPage]);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Обработчик сортировки
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Обработчик поиска
  const handleSearch = () => {
    // Поиск уже работает через onChange
    // Эта функция для дополнительной логики при необходимости
  };

  // Обработчик изменения жанра
  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  // Обработчик изменения сортировки через select
  const handleSortSelectChange = (e) => {
    const value = e.target.value;
    const [key, direction] = value.split('-');
    setSortConfig({ key, direction });
  };

  return {
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
  };
};

export default useBooksTable;
