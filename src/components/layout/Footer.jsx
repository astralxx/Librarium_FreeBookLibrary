/**
 * Footer Component - подвал сайта с премиальным дизайном
 * Включает навигацию, социальные сети и копирайт
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaTelegram, FaVk, FaYoutube, FaGoogle } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Либрариум',
      links: [
        { label: 'О нас', href: '#' },
        { label: 'Волонтерам', href: '#' },
        { label: 'Партнерам', href: '#' },
        { label: 'Вакансии', href: '#' },
        { label: 'Блог', href: '#' },
      ],
    },
    {
      title: 'Исследование',
      links: [
        { label: 'Книги', href: '#' },
        { label: 'Авторы', href: '#' },
        { label: 'Категории', href: '#' },
        { label: 'Коллекции', href: '#' },
        { label: 'Поиск', href: '#' },
      ],
    },
    {
      title: 'Разработка',
      links: [
        { label: 'API', href: '#' },
        { label: 'Документация', href: '#' },
        { label: 'Дампы данных', href: '#' },
        { label: 'Боты', href: '#' },
      ],
    },
    {
      title: 'Помощь',
      links: [
        { label: 'Центр помощи', href: '#' },
        { label: 'Сообщить о проблеме', href: '#' },
        { label: 'Предложения', href: '#' },
        { label: 'Добавить книгу', href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FaTelegram />, href: '#', label: 'Telegram' },
    { icon: <FaVk />, href: '#', label: 'VK' },
    { icon: <FaYoutube />, href: '#', label: 'YouTube' },
    { icon: <FaGoogle />, href: '#', label: 'Gmail' },
  ];

  const contactInfo = [
    { icon: <FiMail />, text: 'info@librarium.ru' },
    { icon: <FiPhone />, text: '+7 (800) 123-45-67' },
    { icon: <FiMapPin />, text: 'Москва, Россия' },
  ];

  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="footer__container">
        {/* Основной контент футера */}
        <div className="footer__content">
          {/* Логотип и описание */}
          <motion.div
            className="footer__brand"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/" className="footer__logo">
              <span className="footer__logo-text">Либрариум</span>
            </Link>
            <p className="footer__description">
              Твоя библиотека в твоем компьютере. 
              Тысячи книг, аудиокниг и комиксов доступны бесплатно.
            </p>
            
            {/* Контактная информация */}
            <div className="footer__contact">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={index}
                  className="footer__contact-item"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <span className="footer__contact-icon">{item.icon}</span>
                  <span className="footer__contact-text">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Ссылки */}
          <div className="footer__links">
            {footerLinks.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                className="footer__links-section"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + sectionIndex * 0.1 }}
              >
                <h3 className="footer__links-title">{section.title}</h3>
                <ul className="footer__links-list">
                  {section.links.map((link, linkIndex) => (
                    <motion.li
                      key={link.label}
                      className="footer__links-item"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + sectionIndex * 0.1 + linkIndex * 0.05 }}
                    >
                      <a href={link.href} className="footer__link">
                        {link.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Разделитель */}
        <motion.div
          className="footer__divider"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        />

        {/* Нижняя часть футера */}
        <div className="footer__bottom">
          {/* Социальные сети */}
          <motion.div
            className="footer__social"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                className="footer__social-link"
                aria-label={social.label}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>

          {/* Копирайт */}
          <motion.p
            className="footer__copyright"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            © {currentYear} Либрариум. Все права защищены.
          </motion.p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
