// src/components/ui/Button.jsx
import React from 'react';

const variants = {
  primary: 'bg-green-600 hover:bg-green-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  danger: 'bg-red-50 hover:bg-red-100 text-red-600',
  dark: 'bg-slate-900 hover:bg-slate-800 text-white',
};

const Button = React.memo(({ children, variant = 'primary', icon: Icon, onClick, type = 'button', disabled, className = '', ...props }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center gap-2 font-bold px-5 py-3 rounded-2xl transition-all disabled:opacity-50 ${
      variants[variant] || variants.primary
    } ${className}`}
    {...props}
  >
    {Icon && <Icon size={18} />}
    {children}
  </button>
));

Button.displayName = 'Button';
export default Button;
