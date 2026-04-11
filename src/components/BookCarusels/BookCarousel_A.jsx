import React, { useRef, useEffect, useState } from 'react';
import BookCard from './BookCard';

const BookCarousel_A = ({ title, offset = 0, showTitle = true }) => {
  const scrollContainerRef = useRef(null);
  const scrollStep = 1020;
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        let url = 'http://localhost:8080/books/category?category=';
        
        if (title === "Популярные книги") {
            url += 'popular';
        } else if (title === "Новинки") {
            url += 'new';
            url += `&offset=${offset}`;
        } else if (title === "Фантастика") {
            url += 'fantasy';
        } else if (title === "Саморазвитие") {
            url += 'selfdev';
        } else if (title === "Комиксы") {
            url += 'comics';
        } else {
            url = 'http://localhost:8080/books/featured';
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setBooks(data || []);
        
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err.message);
        // Fallback data for development
        setBooks([
          { book_id: 1, title: "Война и мир", author: "Лев Толстой", book_img: "/img/placeholder.jpg" },
          { book_id: 2, title: "Преступление и наказание", author: "Фёдор Достоевский", book_img: "/img/placeholder.jpg" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [title, offset]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollStep,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollStep,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return <div className="loading-message">Загрузка книг...</div>;
  if (error) return <div className="error-message">Ошибка: {error}</div>;

  return (
    <div className="div-category">
      {showTitle && (
        <div className="div-h1-bestsellers">
          <h1 className="h1-bestsellers">{title}</h1>
        </div>
      )}
      <div className="div-box">
        <button 
          className="carousel-button-left-B" 
          onClick={scrollLeft}
          aria-label="Прокрутить влево"
        >
          &#10094;
        </button>
        <div className="div-container" ref={scrollContainerRef}>
          {books.map((book) => (
            <BookCard
              key={book.book_id || book.id}
              imageSrc={book.book_img}
              author={book.author}
              title={book.title}
            />
          ))}
        </div>
        <button 
          className="carousel-button-right-B" 
          onClick={scrollRight}
          aria-label="Прокрутить вправо"
        >
          &#10095;
        </button>
      </div>
    </div>
  );
};

export default BookCarousel_A;
