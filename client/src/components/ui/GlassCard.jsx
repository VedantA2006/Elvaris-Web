'use client';

import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-surface-container-lowest border border-outline-variant rounded-xl ambient-shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
