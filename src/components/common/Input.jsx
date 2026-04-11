/**
 * Input Component - поле ввода с премиальным дизайном
 * Поддерживает различные варианты, иконки и валидацию
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Input.css';

const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  success,
  disabled = false,
  required = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const inputClasses = [
    'input',
    isFocused && 'input--focused',
    error && 'input--error',
    success && 'input--success',
    disabled && 'input--disabled',
    icon && `input--icon-${iconPosition}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="input-wrapper">
      {label && (
        <label className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}
      
      <div className={inputClasses}>
        {icon && iconPosition === 'left' && (
          <span className="input__icon input__icon--left">{icon}</span>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className="input__field"
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <span className="input__icon input__icon--right">{icon}</span>
        )}
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.span
            className="input__error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.span>
        )}
        
        {success && !error && (
          <motion.span
            className="input__success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {success}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
