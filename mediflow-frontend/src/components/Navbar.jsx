import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { HealthAvatar } from './ui/Avatar';
import { Calendar as CalendarIcon, Menu, Bell, CheckCheck, MailOpen, Clock } from 'lucide-react';
import API from '../services/api';
import { useNotificationWebSocket } from '../hooks/useNotificationWebSocket';

const Navbar = ({ title, onToggleSidebar }) => {
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  let navFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  if (!navFullName || 
      navFullName.toLowerCase() === 'user' || 
      navFullName.toLowerCase() === 'undefined' || 
      navFullName.toLowerCase() === 'null') {
    navFullName = user?.username || 'User';
  } else if (user?.role === 'DOCTOR' && !navFullName.toLowerCase().startsWith('dr')) {
    navFullName = `Dr. ${navFullName}`;
  }
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const countRes = await API.get('/notifications/unread-count');
      setUnreadCount(countRes.data);
      const listRes = await API.get('/notifications');
      // Show only top 10 notifications
      setNotifications(listRes.data.slice(0, 10));
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Real-time WebSocket notification handler
  const handleNewNotification = useCallback((notification) => {
    // Increment unread count
    setUnreadCount(prev => prev + 1);
    // Prepend to the notifications list
    setNotifications(prev => [notification, ...prev].slice(0, 10));
  }, []);

  // Connect WebSocket for real-time notifications
  useNotificationWebSocket(handleNewNotification, !!user);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setUnreadCount(0);
      // Mark all in state as read
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await API.put(`/notifications/${id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const formatTimeAgo = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const seconds = Math.floor((new Date() - date) / 1000);
      
      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return interval + " yr ago";
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return interval + " mo ago";
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return interval + " d ago";
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return interval + " hr ago";
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return interval + " min ago";
      return "just now";
    } catch (e) {
      return "recently";
    }
  };

  return (
    <header className="print:hidden h-16 bg-white/75 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 shadow-sm">
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

        {/* Notifications Popover */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-500 hover:text-slate-750 hover:bg-slate-100/80 rounded-xl transition-colors relative cursor-pointer"
              aria-label="Open notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[8px] font-black text-white flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Card */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Notifications Feed</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[9px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 hover:underline cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <MailOpen className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-[10px] font-bold mt-2">All caught up!</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id}
                        className={`p-3.5 text-[11px] font-medium leading-normal flex items-start gap-2.5 transition-colors ${
                          !notif.read ? 'bg-indigo-50/35 hover:bg-indigo-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          !notif.read ? 'bg-emerald-500 animate-pulse' : 'bg-transparent'
                        }`} />
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className={`text-slate-700 ${!notif.read ? 'font-bold' : ''}`}>
                            {notif.message}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(notif.createdAt)}</span>
                          </p>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(e, notif.id)}
                            className="p-1 text-slate-350 hover:text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Card */}
        <div className="flex items-center gap-2 md:gap-3 pl-4 md:pl-6 border-l border-slate-200">
          <div className="flex flex-col text-right">
            <span className="text-xs md:text-sm font-bold text-slate-800 truncate max-w-[80px] sm:max-w-none">
              {navFullName}
            </span>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {user?.role?.replace('_', ' ')} ID: #{user?.profileId || user?.userId}
            </span>
          </div>

          {/* Render selected healthcare avatar */}
          <HealthAvatar avatarId={user?.avatarId || 'avatar_1'} className="w-8 h-8 md:w-9 md:h-9" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
