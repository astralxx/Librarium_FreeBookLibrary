import React from 'react';

const AudioBookCard_B = ({ imageSrc, author, title }) => {
  return (
    <div className="div-audio-card-B">
      <img className="img-audio-card-B" src={imageSrc} alt={title} />
      <div className="div-text-card">
        <p className="p-card">{author}</p>
        <h1 className="h1-card">{title}</h1>
      </div>
    </div>
  );
};

export default AudioBookCard_B;