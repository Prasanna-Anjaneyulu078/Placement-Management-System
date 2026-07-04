import React from 'react';
import './Avatar.css';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  ...props 
}) => {
  const avatarClasses = [
    'custom-avatar',
    `avatar-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={avatarClasses} 
      role="img"
      aria-label={alt || 'Avatar'}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className="avatar-img" />
      ) : (
        <div className="avatar-placeholder">{alt ? alt.charAt(0).toUpperCase() : '?'}</div>
      )}
    </div>
  );
};

export default Avatar;
