import React from 'react';

export const Table = ({ children, className = '' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/50 shadow-inner">
      <table className={`w-full border-collapse text-left text-xs ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const THead = ({ children, className = '' }) => {
  return (
    <thead className={`bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  );
};

export const TBody = ({ children, className = '' }) => {
  return (
    <tbody className={`divide-y divide-slate-100/60 ${className}`}>
      {children}
    </tbody>
  );
};

export const TR = ({ children, className = '', ...props }) => {
  return (
    <tr 
      className={`hover:bg-slate-50/50 transition-colors ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TH = ({ children, className = '' }) => {
  return (
    <th className={`px-6 py-3 font-bold ${className}`}>
      {children}
    </th>
  );
};

export const TD = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 text-slate-600 font-medium ${className}`}>
      {children}
    </td>
  );
};
