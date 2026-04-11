import React from 'react';

const Footer = () => {
  return (
    <footer>
        <div className="div-footer-menu">
        <div className="div-menu">
            <ul className="footer-menu-librarium">
                <li className="li-title"><a className="active_table" href="#">Либрариум</a></li>
                <li><a className="active_table" href="#">Введение</a></li>
                <li><a className="active_table" href="#">Станьте волонтером</a></li>
                <li><a className="active_table" href="#">Станьте партнером</a></li>
                <li><a className="active_table" href="#">Вакансии</a></li>
                <li><a className="active_table" href="#">Блог</a></li>
                <li><a className="active_table" href="#">Условия использования</a></li>
                <li><a className="active_table" href="#">Пожертвовать</a></li>
            </ul>
        </div>
        <div className="div-menu">
            <ul className="footer-menu-research">
                <li className="li-title"><a className="active_table" href="#">Исследование</a></li>
                <li><a className="active_table" href="#">Главная</a></li>
                <li><a className="active_table" href="#">Книги</a></li>
                <li><a className="active_table" href="#">Авторы</a></li>
                <li><a className="active_table" href="#">Рубрики</a></li>
                <li><a className="active_table" href="#">Коллекции</a></li>
                <li><a className="active_table" href="#">Расширенный поиск</a></li>
                <li><a className="active_table" href="#">Вернуться наверх</a></li>
            </ul>
        </div>
        <div className="div-menu">
            <ul className="footer-menu-dev">
                <li className="li-title"><a className="active_table" href="#">Разработка</a></li>
                <li><a className="active_table" href="#">Центр разработчиков</a></li>
                <li><a className="active_table" href="#">Документация API</a></li>
                <li><a className="active_table" href="#">Дампы данных</a></li>
                <li><a className="active_table" href="#">Написание ботов</a></li>
            </ul>
        </div>
        <div className="div-menu">
            <ul className="footer-menu-dev">
                <li className="li-title"><a className="active_table" href="#">Помощь</a></li>
                <li><a className="active_table" href="#">Центр помощи</a></li>
                <li><a className="active_table" href="#">Сообщить о проблеме</a></li>
                <li><a className="active_table" href="#">Предложение изменений</a></li>
                <li><a className="active_table" href="#">Добавить книгу</a></li>
                <li><a className="active_table" href="#">Release notes</a></li>
            </ul>
        </div>
        </div>
        <span className="footer-line"></span>
        <div className="footer-menu-icons">
            <div className="icon-footer"><a><img src="img/menu-icon-VK.svg" alt="VK"/></a></div>
            <div className="icon-footer"><a><img src="img/menu-icon-YouTube.svg" alt="YouTube"/></a></div>
            <div className="icon-footer"><a><img src="img/menu-icon-Telegram.svg" alt="Telegram"/></a></div>
            <div className="icon-footer"><a><img src="img/menu-icon-Gmail.svg" alt="Gmail"/></a></div>
            <div className="icon-footer"><a><img src="img/menu-icon-Yandex.svg" alt="Yandex"/></a></div>
        </div>
        <p className="text-copyright">© Copyright. All rights reserved</p>
    </footer>
  );
};

export default Footer;
