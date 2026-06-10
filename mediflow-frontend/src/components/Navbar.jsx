import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Calendar as CalendarIcon, Menu } from 'lucide-react';

const Navbar = ({ title, onToggleSidebar }) => {
  const { user } = useAuth();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white/75 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 shadow-sm">
      {/* Left Section with Hamburger and Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-750 hover:bg-slate-100/80 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base md:text-xl font-bold text-slate-800 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent truncate max-w-[150px] sm:max-w-none">
          {title || 'MediFlow Platform'}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/60">
          <CalendarIcon className="w-4 h-4 text-emerald-500" />
          <span>{currentDate}</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2 md:gap-3 pl-4 md:pl-6 border-l border-slate-200">
          <div className="flex flex-col text-right">
            <span className="text-xs md:text-sm font-bold text-slate-800 truncate max-w-[80px] sm:max-w-none">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {user?.role} ID: #{user?.profileId || user?.userId}
            </span>
          </div>

          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs md:text-sm shadow-inner shrink-0">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
