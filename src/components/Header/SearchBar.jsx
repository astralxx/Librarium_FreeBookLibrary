import React from 'react';
import './Header.css';

const SearchBar = ({ toggleMenu }) => {
  return (
    <div className="search-menu">
      <div className="input-container">
        <input type="text" placeholder="Найти книгу..." />
        <button className="button-search" type="submit">
          <img src="img/icon-search.svg" alt="search" width="20px" height="20px" />
        </button>
      </div>
      <div className="menu-icon" id="burger-menu-icon" onClick={toggleMenu}>
        <img src="img/icon-menu.svg" alt="menu" />
      </div>
    </div>
  );
};

export default SearchBar;