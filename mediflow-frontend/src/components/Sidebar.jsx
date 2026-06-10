import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  LogOut,
  HeartPulse,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const getLinks = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { path: '/', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/doctors', label: 'Doctor Management', icon: Stethoscope },
          { path: '/patients', label: 'Patient Management', icon: Users },
          { path: '/appointments', label: 'All Appointments', icon: Calendar },
        ];
      case 'DOCTOR':
        return [
          { path: '/', label: 'Doctor Dashboard', icon: LayoutDashboard },
          { path: '/appointments', label: 'My Appointments', icon: Calendar },
          { path: '/patients', label: 'My Patients', icon: Users },
        ];
      case 'PATIENT':
        return [
          { path: '/', label: 'Patient Dashboard', icon: LayoutDashboard },
          { path: '/book-appointment', label: 'Book Appointment', icon: Calendar },
          { path: '/appointments', label: 'My Visits', icon: Calendar },
          { path: '/records', label: 'Medical Records', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-xl border-r border-slate-800 transition-transform duration-350 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-emerald-400 animate-pulse" />
            <span className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              MediFlow
            </span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
          <h4 className="text-sm font-bold text-white mt-1 truncate">
            {user?.firstName} {user?.lastName}
          </h4>
          <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
            {user?.role}
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 gap-3 group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-950/20'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-105 transition-transform" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors gap-3 border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
