import React, { useRef, useEffect, useState } from 'react';
import AudioBookCard_A from './AudioBookCard_A';

const AudioBookCarousel_A = () => {
  const scrollContainerRef = useRef(null);
  const scrollStep = 1020;
  const [audioBooks, setAudioBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAudioBooks = async () => {
      try {
        const url = 'http://localhost:8080/books/category?category=popular&type=аудиокнига';
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setAudioBooks(data || []);
        
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        // Запасные данные на случай ошибки
        setAudioBooks([
          {
            id: 1,
            title: "Преступление и наказание",
            author: "Ф.М. Достоевский",
            book_img: "/img/image_1.png",
            type: "аудиокнига",
            feature: "бестселлер"
          },
          {
            id: 2,
            title: "Война и мир",
            author: "Л.Н. Толстой",
            book_img: "/img/image_2.png",
            type: "аудиокнига",
            feature: "бестселлер"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioBooks();
  }, []);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="div-audio-box">
      <button 
        className="carousel-button-left" 
        onClick={scrollLeft}
      >
        &#10094;
      </button>
      <div className="div-audio-container" ref={scrollContainerRef}>
        {audioBooks.map((book) => (
          <AudioBookCard_A
            key={book.id}
            imageSrc={book.book_img}
            author={book.author}
            title={book.title}
          />
        ))}
      </div>
      <button 
        className="carousel-button-right" 
        onClick={scrollRight}
      >
        &#10095;
      </button>
    </div>
  );
};

export default AudioBookCarousel_A;