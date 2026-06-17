import React from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle 
} from 'lucide-react';

const Alert = ({
  children,
  className = '',
  variant = 'info',
  title
}) => {
  const baseStyles = 'p-4 rounded-xl border text-xs flex gap-3 leading-normal';
  
  const variants = {
    info: {
      container: 'bg-indigo-50/50 border-indigo-200/50 text-indigo-600',
      icon: Info
    },
    success: {
      container: 'bg-emerald-50/50 border-emerald-200/50 text-emerald-600',
      icon: CheckCircle
    },
    warning: {
      container: 'bg-amber-50/50 border-amber-200/50 text-amber-600',
      icon: AlertTriangle
    },
    danger: {
      container: 'bg-rose-50/50 border-rose-200/50 text-rose-600',
      icon: AlertCircle
    }
  };

  const Icon = variants[variant].icon;

  const renderSafeChildren = (child) => {
    if (!child) return child;
    if (Array.isArray(child)) {
      return child.map((c, i) => <React.Fragment key={i}>{renderSafeChildren(c)}</React.Fragment>);
    }
    if (child instanceof Error) {
      return child.message || String(child);
    }
    if (typeof child === 'object' && child !== null && !React.isValidElement(child)) {
      return child.message || String(child);
    }
    return child;
  };

  return (
    <div className={`${baseStyles} ${variants[variant].container} ${className}`}>
      <Icon className="w-4.5 h-4.5 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        {title && <h5 className="font-bold uppercase tracking-wider">{title}</h5>}
        <div className="font-semibold text-slate-700">{renderSafeChildren(children)}</div>
      </div>
    </div>
  );
};

export default Alert;
