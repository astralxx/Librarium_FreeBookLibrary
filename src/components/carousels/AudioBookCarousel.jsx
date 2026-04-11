/**
 * AudioBookCarousel Component - карусель аудиокниг с премиальным дизайном
 * Включает анимации, навигацию и адаптивность
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { booksApi } from '../../services/api';
import AudioBookCard from '../cards/AudioBookCard';
import './AudioBookCarousel.css';

const AudioBookCarousel = ({
  title = 'Аудиокниги',
  showTitle = true,
  className = '',
}) => {
  const scrollContainerRef = useRef(null);
  const [audioBooks, setAudioBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Загрузка аудиокниг
  useEffect(() => {
    const fetchAudioBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await booksApi.getAudioBooks();
        setAudioBooks(data || []);
      } catch (err) {
        console.error('Error fetching audio books:', err);
        setError(err.message);
        // Fallback данные для разработки
        setAudioBooks([
          { id: 1, title: "Преступление и наказание", author: "Ф.М. Достоевский", book_img: "/img/image_1.png" },
          { id: 2, title: "Война и мир", author: "Л.Н. Толстой", book_img: "/img/image_2.png" },
          { id: 3, title: "Мастер и Маргарита", author: "М.А. Булгаков", book_img: "/img/image_3.png" },
          { id: 4, title: "1984", author: "Джордж Оруэлл", book_img: "/img/image_4.png" },
          { id: 5, title: "Гарри Поттер", author: "Дж. К. Роулинг", book_img: "/img/image_5.png" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioBooks();
  }, []);

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
  }, [audioBooks]);

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
      <div className={`audio-book-carousel ${className}`}>
        {showTitle && (
          <div className="audio-book-carousel__header">
            <h2 className="audio-book-carousel__title">{title}</h2>
          </div>
        )}
        <div className="audio-book-carousel__loading">
          <div className="audio-book-carousel__spinner" />
          <p>Загрузка аудиокниг...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`audio-book-carousel ${className}`}>
        {showTitle && (
          <div className="audio-book-carousel__header">
            <h2 className="audio-book-carousel__title">{title}</h2>
          </div>
        )}
        <div className="audio-book-carousel__error">
          <p>Ошибка: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      className={`audio-book-carousel ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      {/* Заголовок */}
      {showTitle && (
        <motion.div
          className="audio-book-carousel__header"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="audio-book-carousel__title">{title}</h2>
          <div className="audio-book-carousel__line" />
        </motion.div>
      )}

      {/* Контейнер карусели */}
      <div className="audio-book-carousel__container">
        {/* Кнопка прокрутки влево */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              className="audio-book-carousel__nav-btn audio-book-carousel__nav-btn--left"
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

        {/* Карточки аудиокниг */}
        <div
          className="audio-book-carousel__scroll-container"
          ref={scrollContainerRef}
        >
          <div className="audio-book-carousel__track">
            {audioBooks.map((book, index) => (
              <motion.div
                key={book.id || index}
                className="audio-book-carousel__item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <AudioBookCard
                  imageSrc={book.book_img}
                  author={book.author}
                  title={book.title}
                  duration={book.duration}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Кнопка прокрутки вправо */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              className="audio-book-carousel__nav-btn audio-book-carousel__nav-btn--right"
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

export default AudioBookCarousel;
