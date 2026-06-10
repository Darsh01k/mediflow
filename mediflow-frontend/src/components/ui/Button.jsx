import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-255 active:scale-[0.98] select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-950/10 hover:shadow-lg focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-500/15 focus:outline-none border border-slate-200/50',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-2 focus:ring-primary-500/10 focus:outline-none',
    destructive: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm focus:ring-2 focus:ring-rose-500/20 focus:outline-none',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-800',
    link: 'text-primary-600 hover:underline hover:text-primary-500 p-0 rounded-none active:scale-100',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
