import React from 'react';

const BookCard = ({ imageSrc, author, title }) => {
  return (
    <div className="div-card">
      <img className="img-card" src={imageSrc} alt={title} />
      <div className="div-text-card">
        <p className="p-card">{author}</p>
        <h1 className="h1-card">{title}</h1>
      </div>
    </div>
  );
};

export default BookCard;
