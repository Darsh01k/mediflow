import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import AdminDashboard from './AdminDashboard';
import HospitalDashboard from './HospitalDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await API.get('/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-slate-500 font-semibold text-sm">Assembling dashboard analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 max-w-md mx-auto mt-12">
        <Alert variant="danger" title="Load Error">
          {error}
        </Alert>
        <div className="text-center">
          <Button 
            onClick={fetchStats}
            variant="primary"
            size="sm"
          >
            Retry Load
          </Button>
        </div>
      </div>
    );
  }

  switch (user?.role) {
    case 'PLATFORM_ADMIN':
    case 'ADMIN': // Backwards compatibility for existing users
      return <AdminDashboard stats={stats} refreshStats={fetchStats} />;
    case 'HOSPITAL_ADMIN':
      return <HospitalDashboard stats={stats} refreshStats={fetchStats} />;
    case 'DOCTOR':
      return <DoctorDashboard stats={stats} refreshStats={fetchStats} />;
    case 'PATIENT':
      return <PatientDashboard stats={stats} refreshStats={fetchStats} />;
    default:
      return (
        <div className="p-8 text-center text-slate-500 font-semibold text-sm">
          Unknown user role: {user?.role}
        </div>
      );
  }
};

export default Dashboard;
