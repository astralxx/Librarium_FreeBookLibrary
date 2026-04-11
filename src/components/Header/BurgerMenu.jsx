import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BurgerMenuLight.css';

const BurgerMenu = ({ isOpen, onClose, user, onLogout }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isOpen]);

  return (
    <>
      <div 
        className={`burger-menu-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      />
      
      <div className={`burger-menu ${isOpen ? 'active' : ''}`}>
        <div className="burger-menu-head">
          <div className="account-field">
            <Link to={user ? "/profile" : "/login"}>
              <img src="img/profile.svg" alt="profile" />
            </Link>
            <div className="Username-email">
              <Link to={user ? "/profile" : "/login"}>
              <h1>{user ? user.username : 'Гость'}</h1>
              <p>{user ? user.email : 'Войдите в аккаунт'}</p>
              </Link>
            </div>
          </div>
          <div className="burger-menu-cross-close" onClick={onClose}>
            <img src="img/burger_cross_close.svg" alt="close" />
          </div>
        </div>
        <div className="burger-menu-content">
          <div className="burger-menu-ul-A">
            <ul>
              <li>
                <Link 
                  to={user ? "/profile" : "/login"} 
                  className="burger-menu-item"
                  onClick={onClose}
                >
                  <div className="burger-icon">
                    <img src="img/burger_icon_1.svg" alt="icon" />
                  </div>
                  Профиль
                </Link>
              </li>
              <li>
                <Link to="#" className="burger-menu-item">
                  <div className="burger-icon">
                    <img src="img/burger_icon_2.svg" alt="icon" />
                  </div>
                  Добавленные книги
                </Link>
              </li>
              <li>
                <Link to="/stats" className="burger-menu-item" onClick={onClose}>
                  <div className="burger-icon">
                    <img src="img/burger_icon_3.svg" alt="icon" />
                  </div>
                  Статистика
                </Link>
              </li>
              <li>
                <Link to="#" className="burger-menu-item">
                  <div className="burger-icon">
                    <img src="img/burger_icon_4.svg" alt="icon" />
                  </div>
                  О нас
                </Link>
              </li>
              <li>
                <Link to="#" className="burger-menu-item">
                  <div className="burger-icon">
                    <img src="img/burger_icon_5.svg" alt="icon" />
                  </div>
                  Помощь
                </Link>
              </li>
            </ul>
          </div>
          <div className="burger-menu-ul-B">
            <ul>
              <li>
                <Link to="#" className="burger-menu-item burger-button-lang">
                  <div className="burger-icon">
                    <img src="img/burger_icon_ru.svg" alt="icon" />
                  </div>
                  Сменить язык - RU
                </Link>
              </li>
                {user ? (
                  <li>
                    <Link 
                      to="#"
                      className="burger-menu-item burger-button-exit"
                      onClick={(e) => {
                        e.preventDefault();
                        onLogout();
                        onClose();
                      }}
                    >
                      <div className="burger-icon">
                        <img src="img/burger_icon_exit.svg" alt="icon" />
                      </div>
                      Выйти из аккаунта
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link 
                      to="/login" 
                      className="burger-menu-item burger-button-exit"
                      onClick={onClose}
                    >
                      <div className="burger-icon">
                        <img src="img/burger_icon_exit.svg" alt="icon" />
                      </div>
                      Войти в аккаунт
                    </Link>
                  </li>
                )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default BurgerMenu;
