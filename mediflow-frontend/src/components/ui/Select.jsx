import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  error,
  icon: Icon,
  options = [],
  children,
  className = '',
  id,
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5 w-full text-xs font-semibold text-slate-600">
      {label && (
        <label 
          htmlFor={id} 
          className="block font-bold text-slate-500 uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <select
          ref={ref}
          id={id}
          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-800 transition-all focus:outline-none text-sm font-medium ${
            Icon ? 'pl-10' : ''
          } ${
            error 
              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10' 
              : 'border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 hover:border-slate-300'
          } ${className}`}
          {...props}
        >
          {children || options.map(opt => (
            <option 
              key={typeof opt === 'object' ? opt.value : opt} 
              value={typeof opt === 'object' ? opt.value : opt}
            >
              {typeof opt === 'object' ? opt.label : opt}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="text-[10px] font-bold text-rose-500 mt-1 pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
