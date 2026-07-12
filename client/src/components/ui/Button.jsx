'use client';

import React from 'react';

const variants = {
  primary: 'bg-[#000000] text-[#FFFFFF] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-200',
  secondary: 'border border-[#000000] bg-transparent text-[#000000] hover:bg-[#000000]/5 transition-colors duration-200',
  outline: 'border border-[#000000] bg-transparent text-[#000000] hover:bg-[#000000]/5 transition-colors duration-200',
  ghost: 'text-[#000000] hover:bg-[#000000]/5 transition-colors duration-200',
  inverted: 'bg-[#FFFFFF] text-[#000000] border border-[#C4C7C7] hover:bg-[#F9F9F9] transition-colors duration-200',
};

const Button = ({ children, variant = 'primary', className = '', type = 'button', ...props }) => {
  const base = 'font-sans font-semibold text-[14px] leading-[20px] tracking-[0.02em] px-6 py-2.5 rounded-full inline-flex items-center justify-center gap-2 select-none';

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
