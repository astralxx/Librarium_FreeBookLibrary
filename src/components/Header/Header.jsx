import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import BurgerMenu from './BurgerMenu';
import SearchBar from './SearchBar';
import { useAuth } from '../../pages/auth/AuthContext.jsx';
import './Header.css';

const Header = ({ isMenuOpen, toggleMenu }) => {
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('header');
      const scrollPosition = window.scrollY || window.pageYOffset;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        header.style.backgroundColor = '#101010';
      } else {
        header.style.backgroundColor = '#000';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header>
      <div className="container">
        <div className="menu-icon-1000px" id="burger-menu-icon-1000px" onClick={toggleMenu}>
          <img src="img/icon-menu.svg" alt="menu" />
        </div>
        <div className="logo">
          <Link to="/"><h1>Либрариум</h1></Link>
          <nav>
            <ul>
              <li><Link to="/">Главное</Link></li>
              <li><Link to="#">Аудио</Link></li>
              <li><Link to="#">Комиксы</Link></li>
              <li><Link to="#">Мои книги</Link></li>
            </ul>
          </nav>
        </div>
        <SearchBar toggleMenu={toggleMenu} />
        <div className="menu-search-1000px" id="menu-icon"><img src="img/icon-search.svg" alt="menu" /></div>
      </div>
      <BurgerMenu 
        isOpen={isMenuOpen} 
        onClose={toggleMenu}
        user={user}
        onLogout={logout}
      />
    </header>
  );
};

export default Header;
