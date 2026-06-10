import React from 'react';

const Badge = ({
  children,
  className = '',
  variant = 'neutral'
}) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors select-none uppercase tracking-wide';
  
  const variants = {
    primary: 'bg-indigo-50 border-indigo-200/50 text-indigo-600',
    success: 'bg-emerald-50 border-emerald-200/50 text-emerald-600',
    danger: 'bg-rose-50 border-rose-200/50 text-rose-600',
    warning: 'bg-amber-50 border-amber-200/50 text-amber-600',
    info: 'bg-sky-50 border-sky-200/50 text-sky-600',
    neutral: 'bg-slate-100 border-slate-200/50 text-slate-700',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
