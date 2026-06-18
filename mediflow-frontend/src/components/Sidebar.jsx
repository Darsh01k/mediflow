import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HealthAvatar } from './ui/Avatar';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  LogOut,
  HeartPulse,
  X,
  Search,
  Building,
  Navigation,
  Clock,
  AlertOctagon,
  Hospital
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  let fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  if (!fullName || 
      fullName.toLowerCase() === 'user' || 
      fullName.toLowerCase() === 'undefined' || 
      fullName.toLowerCase() === 'null') {
    fullName = user?.username || 'User';
  } else if (user?.role === 'DOCTOR' && !fullName.toLowerCase().startsWith('dr')) {
    fullName = `Dr. ${fullName}`;
  }

  const formatRole = (role) => {
    if (!role) return '';
    if (role === 'HOSPITAL_ADMIN') return 'Hospital Admin';
    if (role === 'PLATFORM_ADMIN' || role === 'ADMIN') return 'Platform Admin';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const getLinks = () => {
    switch (user?.role) {
      case 'PLATFORM_ADMIN':
      case 'ADMIN':
        return [
          { path: '/', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/hospitals', label: 'Hospital Management', icon: Hospital },
          { path: '/doctors', label: 'Doctor Management', icon: Stethoscope },
          { path: '/patients', label: 'Patient Management', icon: Users },
          { path: '/appointments', label: 'All Appointments', icon: Calendar },
          { path: '/prescriptions', label: 'Prescriptions', icon: FileText },
          { path: '/emergency', label: 'Emergency Help', icon: AlertOctagon },
        ];
      case 'HOSPITAL_ADMIN':
        return [
          { path: '/', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/patients', label: 'Hospital Patients', icon: Users },
          { path: '/appointments', label: 'Hospital Visits', icon: Calendar },
          { path: '/prescriptions', label: 'Prescriptions', icon: FileText },
          { path: '/emergency', label: 'Emergency Help', icon: AlertOctagon },
        ];
      case 'DOCTOR':
        return [
          { path: '/', label: 'Doctor Dashboard', icon: LayoutDashboard },
          { path: '/appointments', label: 'My Appointments', icon: Calendar },
          { path: '/patients', label: 'My Patients', icon: Users },
          { path: '/prescriptions', label: 'Prescriptions', icon: FileText },
          { path: '/emergency', label: 'Emergency Help', icon: AlertOctagon },
        ];
      case 'PATIENT':
        return [
          { path: '/', label: 'Patient Dashboard', icon: LayoutDashboard },
          { path: '/doctor-search', label: 'Search Doctors', icon: Search },
          { path: '/hospital-search', label: 'Search Hospitals', icon: Building },
          { path: '/nearby-hospitals', label: 'Nearby Hospitals', icon: Navigation },
          { path: '/book-appointment', label: 'Book Appointment', icon: Calendar },
          { path: '/appointments', label: 'My Visits', icon: Calendar },
          { path: '/records', label: 'Medical Records', icon: FileText },
          { path: '/prescriptions', label: 'My Prescriptions', icon: FileText },
          { path: '/history', label: 'Medical History', icon: Clock },
          { path: '/emergency', label: 'Emergency Help (SOS)', icon: AlertOctagon },
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

      <div className={`print:hidden w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-xl border-r border-slate-800 transition-transform duration-350 lg:translate-x-0 ${
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

        {/* User Info with Premium Avatar Display */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <HealthAvatar avatarId={user?.avatarId || 'avatar_1'} className="w-12 h-12 rounded-xl border border-slate-700/50" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <h4 className="text-sm font-bold text-white truncate leading-tight" title={fullName}>
              {fullName}
            </h4>
            <p className="text-xs text-slate-400 font-medium leading-none mt-0.5">
              @{user?.username}
            </p>
            <p className="text-[11px] font-semibold text-emerald-400 leading-tight mt-1">
              {formatRole(user?.role)}
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isEmergency = link.path === '/emergency';
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 gap-3 group ${
                    isActive
                      ? isEmergency
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-950/20'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-950/20'
                      : isEmergency
                        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-red-500/20 font-bold'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`
                }
              >
                <Icon className={`w-5 h-5 flex-shrink-0 group-hover:scale-105 transition-transform ${
                  isEmergency && !isOpen ? 'text-red-450' : ''
                }`} />
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
