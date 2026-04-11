/**
 * BookCarousel Component - карусель книг с премиальным дизайном
 * Включает анимации, навигацию и адаптивность
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { booksApi } from '../../services/api';
import BookCard from '../cards/BookCard';
import './BookCarousel.css';

const BookCarousel = ({
  title,
  category,
  offset = 0,
  showTitle = true,
  className = '',
}) => {
  const scrollContainerRef = useRef(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Загрузка книг
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data;
        if (category === 'popular') {
          data = await booksApi.getPopular();
        } else if (category === 'new') {
          data = await booksApi.getNew(offset);
        } else if (category) {
          data = await booksApi.getByGenre(category);
        } else {
          data = await booksApi.getFeatured();
        }
        
        setBooks(data || []);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err.message);
        // Fallback данные для разработки
        setBooks([
          { book_id: 1, title: "Война и мир", author: "Лев Толстой", book_img: "/img/placeholder.jpg" },
          { book_id: 2, title: "Преступление и наказание", author: "Фёдор Достоевский", book_img: "/img/placeholder.jpg" },
          { book_id: 3, title: "Мастер и Маргарита", author: "Михаил Булгаков", book_img: "/img/placeholder.jpg" },
          { book_id: 4, title: "1984", author: "Джордж Оруэлл", book_img: "/img/placeholder.jpg" },
          { book_id: 5, title: "Гарри Поттер", author: "Дж. К. Роулинг", book_img: "/img/placeholder.jpg" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [category, offset]);

  // Проверка возможности прокрутки
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      return () => container.removeEventListener('scroll', checkScrollability);
    }
  }, [books]);

  // Прокрутка влево
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320,
        behavior: 'smooth',
      });
    }
  };

  // Прокрутка вправо
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className={`book-carousel ${className}`}>
        {showTitle && title && (
          <div className="book-carousel__header">
            <h2 className="book-carousel__title">{title}</h2>
          </div>
        )}
        <div className="book-carousel__loading">
          <div className="book-carousel__spinner" />
          <p>Загрузка книг...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`book-carousel ${className}`}>
        {showTitle && title && (
          <div className="book-carousel__header">
            <h2 className="book-carousel__title">{title}</h2>
          </div>
        )}
        <div className="book-carousel__error">
          <p>Ошибка: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      className={`book-carousel ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      {/* Заголовок */}
      {showTitle && title && (
        <motion.div
          className="book-carousel__header"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="book-carousel__title">{title}</h2>
          <div className="book-carousel__line" />
        </motion.div>
      )}

      {/* Контейнер карусели */}
      <div className="book-carousel__container">
        {/* Кнопка прокрутки влево */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              className="book-carousel__nav-btn book-carousel__nav-btn--left"
              onClick={scrollLeft}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Прокрутить влево"
            >
              <FiChevronLeft />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Карточки книг */}
        <div
          className="book-carousel__scroll-container"
          ref={scrollContainerRef}
        >
          <div className="book-carousel__track">
            {books.map((book, index) => (
              <motion.div
                key={book.book_id || book.id || index}
                className="book-carousel__item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <BookCard
                  imageSrc={book.book_img}
                  author={book.author}
                  title={book.title}
                  rating={book.rating}
                  views={book.views}
                  year={book.year}
                  genre={book.genre}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Кнопка прокрутки вправо */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              className="book-carousel__nav-btn book-carousel__nav-btn--right"
              onClick={scrollRight}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Прокрутить вправо"
            >
              <FiChevronRight />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default BookCarousel;
