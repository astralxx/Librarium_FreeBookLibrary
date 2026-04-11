import React from 'react';

const AudioBookCard_A = ({ imageSrc, author, title }) => {
  return (
    <div className="div-audio-card">
      <img 
        className="img-audio-card" 
        src={imageSrc} 
        alt={title} 
      />
      <div className="div-text-audio-card">
        <p className="p-audio-card">{author}</p>
        <h1 className="h1-audio-card">{title}</h1>
      </div>
      <button className="button-audio-card">
        <img 
          src="img/play.svg" 
          alt="play" 
          className="play-button-audio"
        />
        Слушать
      </button>
    </div>
  );
};

export default AudioBookCard_A;