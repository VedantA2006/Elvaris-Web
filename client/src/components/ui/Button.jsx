'use client';

import React from 'react';

const variants = {
  primary: 'bg-primary text-on-primary hover:shadow-ambient hover:-translate-y-0.5 transition-all duration-200',
  outline: 'border border-primary text-primary hover:bg-surface-container-highest transition-colors',
  ghost: 'text-primary hover:bg-surface-container-low transition-colors',
  inverted: 'bg-surface-container-lowest text-primary hover:bg-surface-container-high transition-colors',
};

const Button = ({ children, variant = 'primary', className = '', type = 'button', ...props }) => {
  const base = 'font-label-sm text-label-sm px-6 py-2 rounded inline-flex items-center justify-center gap-2';

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
