import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper to determine title based on path
  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/doctors')) return 'Doctor Directory';
    if (path.startsWith('/patients')) return 'Patient Registry';
    if (path.startsWith('/appointments')) return 'Appointments Calendar';
    if (path.startsWith('/book-appointment')) return 'Schedule Consultation';
    if (path.startsWith('/records')) return 'Medical Charts';
    return 'MediFlow Platform';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Sticky Header */}
        <Navbar title={getTitle()} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content Outlet */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
