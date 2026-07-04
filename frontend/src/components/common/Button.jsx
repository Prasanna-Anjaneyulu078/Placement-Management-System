import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  icon: Icon,
  fullWidth = false,
  ...props 
}) => {
  const buttonClasses = [
    'custom-btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={buttonClasses} 
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 18} className="button-icon-svg" />}
      {children}
    </button>
  );
};

export default Button;
