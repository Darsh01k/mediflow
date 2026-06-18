import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  TrendingUp, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Trash2,
  Mail,
  User,
  Lock,
  DollarSign,
  CreditCard,
  Building
} from 'lucide-react';
import API from '../services/api';
import { formatINR } from '../utils/currency';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import SecuritySettings from '../components/SecuritySettings';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = ({ stats, refreshStats }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  
  // Add Doctor Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [bio, setBio] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchLists = async () => {
    try {
      const docsRes = await API.get('/doctors');
      setDoctors(docsRes.data);
      const patsRes = await API.get('/patients');
      setPatients(patsRes.data);
    } catch (err) {
      console.error('Failed to load directories', err);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!username || !password || !email || !firstName || !lastName || !specialization || !licenseNumber || !consultationFee) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        username,
        password,
        email,
        role: 'DOCTOR',
        firstName,
        lastName,
        specialization,
        licenseNumber,
        consultationFee: parseFloat(consultationFee),
        bio
      };

      await API.post('/auth/register', payload);
      toast.success(`Registered Dr. ${firstName} ${lastName}!`);
      
      // Clear form
      setUsername('');
      setPassword('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setSpecialization('');
      setLicenseNumber('');
      setConsultationFee('');
      setBio('');

      refreshStats();
      fetchLists();
      setShowAddDoctor(false);

    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add doctor profile.');
      toast.error(err.response?.data?.message || 'Failed to register doctor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePatient = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient profile?')) {
      try {
        await API.delete(`/patients/${id}`);
        toast.success('Patient profile removed.');
        fetchLists();
        refreshStats();
      } catch (err) {
        toast.error('Failed to delete patient profile');
      }
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor profile?')) {
      try {
        await API.delete(`/doctors/${id}`);
        toast.success('Doctor profile removed.');
        fetchLists();
        refreshStats();
      } catch (err) {
        toast.error('Failed to delete doctor profile');
      }
    }
  };

  // Chart configs
  const doughnutData = {
    labels: ['Scheduled', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          stats.upcomingAppointments,
          stats.completedAppointments,
          stats.cancelledAppointments
        ],
        backgroundColor: ['#6366f1', '#10b981', '#f43f5e'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: ['Patients', 'Doctors', 'Appointments'],
    datasets: [
      {
        label: 'System Totals',
        data: [stats.totalPatients, stats.totalDoctors, stats.totalAppointments],
        backgroundColor: '#0ea5e9',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors shrink-0 ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors shrink-0 ${
            activeTab === 'security'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Security Settings
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Hospitals</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalHospitals}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Patients</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalPatients}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650 shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Doctors</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalDoctors}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-650 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Visits</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalAppointments}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Bookings</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.upcomingAppointments}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status Distribution</CardTitle>
            <CardDescription>Visual breakdown of current visit statuses</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <div className="w-full max-w-64 h-64">
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Growth Volume</CardTitle>
            <CardDescription>Global metrics comparison across entities</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="w-full min-h-[250px]">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lists & Directory Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Doctors Section */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-4 border-b">
            <div>
              <CardTitle>Doctors Directory</CardTitle>
              <CardDescription>Overview of registered practitioners</CardDescription>
            </div>
            <Button
              size="sm"
              icon={Plus}
              onClick={() => setShowAddDoctor(!showAddDoctor)}
            >
              Add Doctor
            </Button>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            {showAddDoctor && (
              <form onSubmit={handleAddDoctor} className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4">
                <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wide">New Doctor Registration</h5>
                {formError && <Alert variant="danger">{formError}</Alert>}
                
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Username" required value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Input
                    type="password" placeholder="Password" required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Input
                    type="email" placeholder="Email Address" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="col-span-2"
                  />
                  <Input
                    placeholder="First Name" required value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input
                    placeholder="Last Name" required value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <Input
                    placeholder="Specialty (e.g. Cardiology)" required value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                  <Input
                    placeholder="License Number" required value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                  <Input
                    type="number" placeholder="Consultation Fee (INR)" required value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="col-span-2"
                  />
                  <div className="col-span-2 space-y-1.5">
                    <textarea
                      placeholder="Doctor Professional Biography" rows="2" value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="secondary" size="sm" onClick={() => setShowAddDoctor(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" loading={formLoading}>
                    Submit
                  </Button>
                </div>
              </form>
            )}

            <Table className="min-w-[500px]">
              <THead>
                <TR>
                  <TH>Doctor</TH>
                  <TH>Specialty</TH>
                  <TH className="text-right">Fee</TH>
                  <TH className="text-center">Action</TH>
                </TR>
              </THead>
              <TBody>
                {doctors.map((doc) => (
                  <TR key={doc.id}>
                    <TD className="font-bold text-slate-850">
                      Dr. {doc.user?.firstName} {doc.user?.lastName}
                    </TD>
                    <TD className="text-slate-500 font-medium">{doc.specialization}</TD>
                    <TD className="text-right font-bold text-slate-700">{formatINR(doc.consultationFee)}</TD>
                    <TD className="text-center">
                      <button
                        onClick={() => handleDeleteDoctor(doc.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        {/* Patients Section */}
        <Card>
          <CardHeader className="pb-4 border-b">
            <CardTitle>Patients Directory</CardTitle>
            <CardDescription>Overview of registered patient accounts</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Table className="min-w-[500px]">
              <THead>
                <TR>
                  <TH>Patient</TH>
                  <TH>Phone</TH>
                  <TH className="text-center">Blood</TH>
                  <TH className="text-center">Action</TH>
                </TR>
              </THead>
              <TBody>
                {patients.map((pat) => (
                  <TR key={pat.id}>
                    <TD className="font-bold text-slate-850">
                      {pat.user?.firstName} {pat.user?.lastName}
                    </TD>
                    <TD className="text-slate-500 font-medium">{pat.phone}</TD>
                    <TD className="text-center">
                      <Badge variant="neutral">{pat.bloodType || 'N/A'}</Badge>
                    </TD>
                    <TD className="text-center">
                      <button
                        onClick={() => handleDeletePatient(pat.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

      </div>
      </>
      )}

      {activeTab === 'security' && (
        <SecuritySettings />
      )}
    </div>
  );
};

export default AdminDashboard;
