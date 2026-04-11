/**
 * Modal Component - модальное окно с glassmorphism эффектом
 * Поддерживает различные размеры и анимации
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium', // small, medium, large, fullscreen
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
}) => {
  // Закрытие по Escape
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalClasses = [
    'modal',
    `modal--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className={modalClasses}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {(title || showCloseButton) && (
              <div className="modal__header">
                {title && <h2 className="modal__title">{title}</h2>}
                {showCloseButton && (
                  <button
                    className="modal__close"
                    onClick={onClose}
                    aria-label="Закрыть"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            )}
            
            <div className="modal__body">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * ModalHeader - заголовок модального окна
 */
export const ModalHeader = ({ children, className = '' }) => (
  <div className={`modal__header ${className}`}>
    {children}
  </div>
);

/**
 * ModalBody - тело модального окна
 */
export const ModalBody = ({ children, className = '' }) => (
  <div className={`modal__body ${className}`}>
    {children}
  </div>
);

/**
 * ModalFooter - футер модального окна
 */
export const ModalFooter = ({ children, className = '' }) => (
  <div className={`modal__footer ${className}`}>
    {children}
  </div>
);

export default Modal;
