import { useState, useEffect } from 'react';

/**
 * FontAnimation Component - анимация текста с использованием только шрифта Inter
 * Используются разные начертания Inter для создания визуального эффекта
 */
const FontAnimation = () => {
  // Используем только разные начертания шрифта Inter
  const fonts = [
    "Inter, sans-serif", // weight 300
    "Inter, sans-serif", // weight 400
    "Inter, sans-serif", // weight 500
    "Inter, sans-serif", // weight 600
    "Inter, sans-serif", // weight 700
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif"
  ];

  const fonts2 = [
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
  ];

  const fonts3 = [
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif"
  ];

  const fonts4 = [
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif",
    "Inter, sans-serif"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimationRunning, setIsAnimationRunning] = useState(true);

  useEffect(() => {
    let intervalId;
    
    if (isAnimationRunning) {
      intervalId = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % fonts.length);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isAnimationRunning, fonts.length]);

  const toggleAnimation = () => {
    setIsAnimationRunning(prev => !prev);
  };

  return (
    <div className="div-h1-visit-page">
    <h1 className="h1-visit-page">
      <span 
        id="cont" 
        style={{ fontFamily: fonts[currentIndex] }}
        onClick={toggleAnimation}
      >Каждая </span>
      <span 
        id="cont2" 
        style={{ fontFamily: fonts2[currentIndex] }}
        onClick={toggleAnimation}
      >страница </span>-<br />
      <span 
        id="cont3" 
        style={{ fontFamily: fonts3[currentIndex] }}
        onClick={toggleAnimation}
      >новая </span>
      <span 
        id="cont4" 
        style={{ fontFamily: fonts4[currentIndex] }}
        onClick={toggleAnimation}
      >история!</span>
    </h1>
    </div>
  );
};

export default FontAnimation;
