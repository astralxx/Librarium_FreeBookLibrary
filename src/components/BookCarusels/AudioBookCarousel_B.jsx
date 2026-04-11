import React, { useRef, useEffect, useState } from 'react';
import AudioBookCard_B from './AudioBookCard_B';

const AudioBookCarousel_B = ({ title = "Аудиокниги" }) => {
  const scrollContainerRef = useRef(null);
  const scrollStep = 1020;
  const [audioBooks, setAudioBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAudioBooks = async () => {
      try {
        // Запрос аудиокниг по категории
        const url = 'http://localhost:8080/books/category?category=audiobook';
        
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
            title: "Илон Маск", 
            author: "Уолтер Айзексон", 
            book_img: "/img/img-audio-B-1.png" 
          },
          { 
            id: 2, 
            title: "Богатый папа, бедный папа", 
            author: "Роберт Кийосаки", 
            book_img: "/img/img-audio-B-2.png" 
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
    <div className="div-category">
      <div className="div-h1-bestsellers">
        <h1 className="h1-bestsellers"></h1>
      </div>
      <div className="div-audio-box-B">
        <button 
          className="carousel-button-left-C" 
          onClick={scrollLeft}
        >
          &#10094;
        </button>
        <div className="div-audio-container-B" ref={scrollContainerRef}>
          {audioBooks.map((book) => (
            <AudioBookCard_B
              key={book.id}
              imageSrc={book.book_img}
              author={book.author}
              title={book.title}
            />
          ))}
        </div>
        <button 
          className="carousel-button-right-C" 
          onClick={scrollRight}
        >
          &#10095;
        </button>
      </div>
    </div>
  );
};

export default AudioBookCarousel_B;