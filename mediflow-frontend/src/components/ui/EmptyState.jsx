import React from 'react';
import { Database } from 'lucide-react';

const EmptyState = ({
  title = 'No records found',
  description = 'There are no active records in this directory.',
  icon: Icon = Database,
  action,
  className = ''
}) => {
  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 space-y-4 max-w-md mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <Icon className="w-6 h-6 shrink-0" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-700">{title}</h4>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
