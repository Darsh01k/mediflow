import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Settings,
  Activity,
  FileText,
  Globe
} from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { HealthAvatar, AvatarPicker } from '../components/ui/Avatar';
import AddressAutocomplete from '../components/ui/AddressAutocomplete';
import SecuritySettings from '../components/SecuritySettings';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title as ChartTitle } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle);

const HospitalDashboard = ({ stats, refreshStats }) => {
  const toast = useToast();
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Lists
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [hospital, setHospital] = useState(null);
  
  // Loading states
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingPats, setLoadingPats] = useState(false);
  const [loadingHosp, setLoadingHosp] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [updatingHosp, setUpdatingHosp] = useState(false);

  // Hospital profile form state
  const [hospName, setHospName] = useState('');
  const [hospEmail, setHospEmail] = useState('');
  const [hospPhone, setHospPhone] = useState('');
  const [hospAddress, setHospAddress] = useState('');
  const [hospCity, setHospCity] = useState('');
  const [hospState, setHospState] = useState('');
  const [hospPincode, setHospPincode] = useState('');
  const [hospLat, setHospLat] = useState('');
  const [hospLng, setHospLng] = useState('');
  const [hospLicense, setHospLicense] = useState('');
  const [hospDesc, setHospDesc] = useState('');
  const [hospLogo, setHospLogo] = useState('');
  const [hospType, setHospType] = useState('General Hospital');
  const [hospFacilities, setHospFacilities] = useState('');
  const [hospBeds, setHospBeds] = useState('');
  const [hospEmergency, setHospEmergency] = useState(false);
  const [hospWebsite, setHospWebsite] = useState('');

  const fetchHospitalProfile = async () => {
    try {
      setLoadingHosp(true);
      const res = await API.get('/hospitals/my-hospital');
      if (res.data) {
        setHospital(res.data);
        // Bind form
        setHospName(res.data.name || '');
        setHospEmail(res.data.email || '');
        setHospPhone(res.data.phone || '');
        setHospAddress(res.data.address || '');
        setHospCity(res.data.city || '');
        setHospState(res.data.state || '');
        setHospPincode(res.data.pincode || '');
        setHospLat(res.data.latitude || '');
        setHospLng(res.data.longitude || '');
        setHospLicense(res.data.licenseNumber || '');
        setHospDesc(res.data.description || '');
        setHospLogo(res.data.logoAvatar || '');
        setHospType(res.data.hospitalType || 'General Hospital');
        setHospFacilities(res.data.facilities || '');
        setHospBeds(res.data.numberOfBeds || '');
        setHospEmergency(res.data.emergencyServicesAvailable || false);
        setHospWebsite(res.data.website || '');
      } else {
        setHospital(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load hospital profile');
      setHospital(null);
    } finally {
      setLoadingHosp(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoadingDocs(true);
      const res = await API.get('/hospitals/my-hospital/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctors list');
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoadingPats(true);
      const res = await API.get('/hospitals/my-hospital/patients');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load patient history');
    } finally {
      setLoadingPats(false);
    }
  };

  useEffect(() => {
    fetchHospitalProfile();
    fetchDoctors();
    fetchPatients();
  }, []);

  const handleUpdateStatus = async (doctorId, status) => {
    try {
      setUpdatingStatus(doctorId);
      await API.put(`/hospitals/my-hospital/doctors/${doctorId}/status`, null, {
        params: { status }
      });
      toast.success(`Doctor status updated to ${status}!`);
      fetchDoctors();
      refreshStats();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleUpdateHospital = async (e) => {
    e.preventDefault();
    if (!hospName || !hospAddress) {
      toast.error('Hospital name and address are required');
      return;
    }
    try {
      setUpdatingHosp(true);
      const payload = {
        name: hospName,
        email: hospEmail,
        phone: hospPhone,
        address: hospAddress,
        city: hospCity,
        state: hospState,
        pincode: hospPincode,
        latitude: hospLat ? parseFloat(hospLat) : null,
        longitude: hospLng ? parseFloat(hospLng) : null,
        licenseNumber: hospLicense,
        description: hospDesc,
        logoAvatar: hospLogo,
        hospitalType: hospType,
        facilities: hospFacilities,
        numberOfBeds: hospBeds ? parseInt(hospBeds) : null,
        emergencyServicesAvailable: hospEmergency,
        website: hospWebsite
      };
      const res = await API.put('/hospitals/my-hospital', payload);
      setHospital(res.data);
      
      // Update global context state for real-time sidebar/navbar refresh
      updateUser({
        firstName: hospName,
        avatarId: hospLogo
      });

      toast.success('Hospital profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update hospital profile');
    } finally {
      setUpdatingHosp(false);
    }
  };

  // Chart configs
  const doughnutData = {
    labels: ['Scheduled', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          stats?.upcomingAppointments ?? 0,
          stats?.completedAppointments ?? 0,
          stats?.cancelledAppointments ?? 0
        ],
        backgroundColor: ['#6366f1', '#10b981', '#f43f5e'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: ['Patients Served', 'Active Doctors', 'Total Appointments'],
    datasets: [
      {
        label: 'Hospital Performance Metrics',
        data: [stats?.totalPatients ?? 0, stats?.totalDoctors ?? 0, stats?.totalAppointments ?? 0],
        backgroundColor: '#10b981',
        borderRadius: 8,
      },
    ],
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'danger';
      case 'SUSPENDED': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hospital Banner */}
      {hospital && (
        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-6">
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <HealthAvatar avatarId={hospital.logoAvatar || 'hospital_1'} className="w-16 h-16 rounded-2xl" />

          <div className="text-center md:text-left space-y-1 z-10 flex-1">
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Hospital Admin Portal
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white mt-2">{hospital.name}</h2>
            <p className="text-slate-400 text-xs font-medium max-w-2xl">{hospital.description || 'No description provided. Click Profile to add description.'}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 justify-center md:justify-start text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {hospital.city ? `${hospital.city}, ${hospital.state}` : hospital.address}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {hospital.phone || 'No Phone'}</span>
              <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-slate-400" /> Lic: {hospital.licenseNumber || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

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
          Overview & Analytics
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors relative shrink-0 ${
            activeTab === 'doctors'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Doctors
          {doctors.filter(d => d.status === 'PENDING').length > 0 && (
            <span className="absolute top-2 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors shrink-0 ${
            activeTab === 'patients'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          View Patients
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors shrink-0 ${
            activeTab === 'profile'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Profile
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

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total Patients</p>
                    <h3 className="text-xl font-black text-slate-800 mt-0.5">{stats?.totalPatients ?? 0}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Active Doctors</p>
                    <h3 className="text-xl font-black text-slate-800 mt-0.5">{stats?.totalDoctors ?? 0}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total Bookings</p>
                    <h3 className="text-xl font-black text-slate-800 mt-0.5">{stats?.totalAppointments ?? 0}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Active Scheduled</p>
                    <h3 className="text-xl font-black text-slate-800 mt-0.5">{stats?.upcomingAppointments ?? 0}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-650 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total Prescriptions</p>
                    <h3 className="text-xl font-black text-slate-800 mt-0.5">{stats?.totalPrescriptions ?? 0}</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appointments Status Chart</CardTitle>
                  <CardDescription>Breakdown of patient booking statuses in this hospital</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                  <div className="w-64 h-64">
                    <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Volume Analytics</CardTitle>
                  <CardDescription>Visual metrics representing hospital load</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="w-full min-h-[250px]">
                    <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Manage Doctors */}
        {activeTab === 'doctors' && (
          <Card>
            <CardHeader>
              <CardTitle>Doctor Registration & Approval Workflow</CardTitle>
              <CardDescription>Manage, approve, suspend, or reject doctors registered to your hospital.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loadingDocs ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Spinner />
                  <p className="text-xs text-slate-400 font-semibold">Fetching practitioners...</p>
                </div>
              ) : doctors.length === 0 ? (
                <EmptyState
                  title="No Registered Doctors"
                  description="No medical practitioners have signed up for this hospital yet."
                  icon={Stethoscope}
                />
              ) : (
                <Table>
                  <THead>
                    <TR>
                      <TH>Practitioner</TH>
                      <TH>Specialty & License</TH>
                      <TH>Experience</TH>
                      <TH>Consultation Fee</TH>
                      <TH className="text-center">Status</TH>
                      <TH className="text-right">Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {doctors.map((doc) => (
                      <TR key={doc.id}>
                        <TD>
                          <div className="flex items-center gap-3">
                            <HealthAvatar avatarId={doc.user?.avatarId || 'avatar_1'} className="w-9 h-9" />
                            <div>
                              <div className="font-bold text-slate-800">
                                Dr. {doc.user?.firstName} {doc.user?.lastName}
                              </div>
                              <div className="text-xs font-semibold text-slate-400 truncate max-w-[180px]">
                                {doc.user?.email} • {doc.phone || 'No phone'}
                              </div>
                            </div>
                          </div>
                        </TD>
                        <TD>
                          <div className="font-semibold text-slate-700 text-xs">{doc.specialization}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">{doc.licenseNumber}</div>
                        </TD>
                        <TD className="text-xs font-medium text-slate-500">
                          {doc.experience ? `${doc.experience} Years` : 'N/A'}
                        </TD>
                        <TD className="font-bold text-slate-700">{formatINR(doc.consultationFee)}</TD>
                        <TD className="text-center">
                          <Badge variant={getStatusBadgeVariant(doc.status)}>{doc.status}</Badge>
                        </TD>
                        <TD className="text-right">
                          <div className="flex justify-end gap-1.5">
                            {doc.status === 'PENDING' && (
                              <>
                                <Button
                                  size="xs"
                                  variant="primary"
                                  loading={updatingStatus === doc.id}
                                  onClick={() => handleUpdateStatus(doc.id, 'APPROVED')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="xs"
                                  variant="danger"
                                  loading={updatingStatus === doc.id}
                                  onClick={() => handleUpdateStatus(doc.id, 'REJECTED')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {doc.status === 'APPROVED' && (
                              <Button
                                size="xs"
                                variant="outline"
                                className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                                loading={updatingStatus === doc.id}
                                onClick={() => handleUpdateStatus(doc.id, 'SUSPENDED')}
                              >
                                Suspend
                              </Button>
                            )}

                            {(doc.status === 'SUSPENDED' || doc.status === 'REJECTED') && (
                              <Button
                                size="xs"
                                variant="primary"
                                loading={updatingStatus === doc.id}
                                onClick={() => handleUpdateStatus(doc.id, 'APPROVED')}
                              >
                                Reactivate / Approve
                              </Button>
                            )}
                          </div>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Patients Log */}
        {activeTab === 'patients' && (
          <Card>
            <CardHeader>
              <CardTitle>Hospital Patients Log</CardTitle>
              <CardDescription>Directory of patient profiles registered or served by this hospital's doctors.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loadingPats ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Spinner />
                  <p className="text-xs text-slate-400 font-semibold">Loading patient list...</p>
                </div>
              ) : patients.length === 0 ? (
                <EmptyState
                  title="No Patients Logged"
                  description="No patients have booked visits with doctors of this hospital yet."
                  icon={Users}
                />
              ) : (
                <Table>
                  <THead>
                    <TR>
                      <TH>Patient</TH>
                      <TH>Gender & DOB</TH>
                      <TH>Phone & Emergency Contact</TH>
                      <TH className="text-center">Blood Group</TH>
                      <TH>Medical Notes</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {patients.map((pat) => (
                      <TR key={pat.id}>
                        <TD>
                          <div className="flex items-center gap-3">
                            <HealthAvatar avatarId={pat.user?.avatarId || 'avatar_1'} className="w-9 h-9" />
                            <div>
                              <div className="font-bold text-slate-800">
                                {pat.user?.firstName} {pat.user?.lastName}
                              </div>
                              <div className="text-xs font-semibold text-slate-400 truncate max-w-[180px]">
                                {pat.user?.email}
                              </div>
                            </div>
                          </div>
                        </TD>
                        <TD>
                          <div className="font-semibold text-slate-700 text-xs">{pat.gender}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">DOB: {pat.dateOfBirth}</div>
                        </TD>
                        <TD>
                          <div className="font-semibold text-slate-700 text-xs">{pat.phone}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={pat.emergencyContact}>
                            EMR: {pat.emergencyContact}
                          </div>
                        </TD>
                        <TD className="text-center">
                          <Badge variant="neutral">{pat.bloodType || 'N/A'}</Badge>
                        </TD>
                        <TD className="max-w-xs">
                          <p className="text-xs text-slate-500 font-medium line-clamp-2" title={pat.medicalNotes || 'No notes available'}>
                            {pat.medicalNotes || <span className="text-slate-350 italic">None logged</span>}
                          </p>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}        {/* Tab 4: Hospital Profile */}
        {activeTab === 'profile' && (
          <ErrorBoundary>
            {hospital ? (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Hospital Profile</CardTitle>
                  <CardDescription>Update identity parameters, facilities, bed capacities, emergency access, and web settings.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingHosp ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <Spinner />
                      <p className="text-xs text-slate-400 font-semibold">Loading details...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-slate-700">
                      {/* Left Column: Enterprise Care Facility Card */}
                      <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
                          {/* Grid background effect */}
                          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                          
                          <div className="relative z-10 space-y-5">
                            {/* Title bar */}
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md tracking-wider text-emerald-400">
                                Enterprise Care Facility
                              </span>
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wide ${hospEmergency ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300'}`}>
                                {hospEmergency ? 'Emergency Active' : 'No Emergency'}
                              </span>
                            </div>

                            {/* Logo & Name */}
                            <div className="flex flex-col items-center text-center space-y-3 pt-2">
                              <div className="p-2 bg-white/5 rounded-2xl border border-white/10 shadow-md">
                                <HealthAvatar avatarId={hospLogo || 'hospital_1'} className="w-20 h-20 rounded-2xl" />
                              </div>
                              <div>
                                <h3 className="text-lg font-black tracking-tight leading-snug">{hospName || 'Hospital Facility'}</h3>
                                <p className="text-xs font-black text-indigo-300 bg-white/5 border border-white/10 rounded-full px-4 py-1 mt-2 inline-block">
                                  {hospType}
                                </p>
                              </div>
                            </div>

                            <hr className="border-white/10" />

                            {/* Key Info List */}
                            <div className="space-y-3.5 text-xs font-semibold text-slate-300">
                              <div className="flex justify-between items-start gap-4">
                                <span className="opacity-60 font-bold uppercase text-[9px] tracking-wide shrink-0">Address</span>
                                <span className="text-white font-extrabold text-right leading-tight truncate max-w-[200px]" title={hospAddress}>
                                  {hospAddress || 'Not entered'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="opacity-60 font-bold uppercase text-[9px] tracking-wide">License Number</span>
                                <span className="text-white font-extrabold">{hospLicense || 'Not entered'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="opacity-60 font-bold uppercase text-[9px] tracking-wide">Bed Capacity</span>
                                <span className="text-white font-extrabold">{hospBeds || '0'} Total Beds</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="opacity-60 font-bold uppercase text-[9px] tracking-wide">Active Doctors</span>
                                <span className="text-white font-extrabold">{stats?.totalDoctors ?? doctors.length ?? 0} Associated</span>
                              </div>
                              {hospWebsite && (
                                <div className="flex justify-between items-center">
                                  <span className="opacity-60 font-bold uppercase text-[9px] tracking-wide">Website</span>
                                  <a 
                                    href={hospWebsite} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-emerald-400 hover:text-emerald-300 font-extrabold flex items-center gap-1 transition-colors"
                                  >
                                    <Globe className="w-3.5 h-3.5" /> Visit site
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Facilities info */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 text-xs font-semibold">
                              <span className="block opacity-60 font-bold uppercase text-[8px] tracking-wider mb-1.5">Operational Facilities</span>
                              {hospFacilities ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {hospFacilities.split(',').map((fac, idx) => (
                                    <span key={idx} className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                                      {fac.trim()}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-400 leading-normal text-[11px] font-medium italic">No facilities declared</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Profile Modification Form */}
                      <form onSubmit={handleUpdateHospital} className="lg:col-span-2 space-y-6 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm text-slate-700">
                        {/* Avatar Picker Section */}
                        <div className="space-y-3">
                          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Select Hospital Logo Avatar</span>
                          <AvatarPicker selectedId={hospLogo} onSelect={setHospLogo} category="HOSPITAL" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Hospital Name"
                            required
                            placeholder="Saint Grace Medical Center"
                            value={hospName}
                            onChange={(e) => setHospName(e.target.value)}
                          />
                          <Input
                            label="Medical License Number"
                            placeholder="LIC-99887766"
                            value={hospLicense}
                            onChange={(e) => setHospLicense(e.target.value)}
                          />
                          <Input
                            label="Contact Email"
                            type="email"
                            placeholder="info@stgrace.org"
                            value={hospEmail}
                            onChange={(e) => setHospEmail(e.target.value)}
                          />
                          <Input
                            label="Contact Phone"
                            placeholder="+1 (555) 123-4567"
                            value={hospPhone}
                            onChange={(e) => setHospPhone(e.target.value)}
                          />

                          {/* Hospital Type */}
                          <div className="space-y-1.5 text-xs font-semibold text-slate-600">
                            <label className="block font-bold text-slate-500 uppercase tracking-wide">Hospital Type</label>
                            <select
                              value={hospType}
                              onChange={(e) => setHospType(e.target.value)}
                              className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500/50"
                            >
                              <option>General Hospital</option>
                              <option>Multi-Specialty Hospital</option>
                              <option>Clinic</option>
                              <option>Emergency Care</option>
                            </select>
                          </div>

                          {/* Number of Beds */}
                          <Input
                            label="Total Bed Capacity"
                            type="number"
                            min="0"
                            placeholder="e.g. 150"
                            value={hospBeds}
                            onChange={(e) => setHospBeds(e.target.value)}
                          />

                          {/* Facilities */}
                          <div className="md:col-span-2">
                            <Input
                              label="Facilities (Comma-separated)"
                              placeholder="e.g. ICU, OPD, Emergency, Pharmacy, Diagnostics"
                              value={hospFacilities}
                              onChange={(e) => setHospFacilities(e.target.value)}
                            />
                          </div>

                          {/* Website */}
                          <div className="md:col-span-2">
                            <Input
                              label="Official Website (Optional)"
                              type="url"
                              placeholder="e.g. https://www.saintgrace.org"
                              value={hospWebsite}
                              onChange={(e) => setHospWebsite(e.target.value)}
                            />
                          </div>

                          <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-600">
                            <label className="block font-bold text-slate-500 uppercase tracking-wide">Street Address (Mandatory)</label>
                            <AddressAutocomplete
                              value={hospAddress}
                              onChange={setHospAddress}
                              onSelect={(res) => {
                                setHospAddress(res.address);
                                setHospCity(res.city);
                                setHospState(res.state);
                                setHospPincode(res.pincode);
                                setHospLat(res.latitude ? res.latitude.toString() : '');
                                setHospLng(res.longitude ? res.longitude.toString() : '');
                              }}
                              required
                              className="bg-white border border-slate-200"
                            />
                          </div>

                          <Input
                            label="City"
                            placeholder="Medical City"
                            value={hospCity}
                            onChange={(e) => setHospCity(e.target.value)}
                          />
                          <Input
                            label="State"
                            placeholder="CA"
                            value={hospState}
                            onChange={(e) => setHospState(e.target.value)}
                          />
                          <Input
                            label="Pincode"
                            placeholder="90210"
                            value={hospPincode}
                            onChange={(e) => setHospPincode(e.target.value)}
                          />

                          {/* Emergency services toggle */}
                          <div className="md:col-span-2 flex items-center gap-2.5 pt-2">
                            <input
                              type="checkbox"
                              id="dashboardEmergCheckbox"
                              checked={hospEmergency}
                              onChange={(e) => setHospEmergency(e.target.checked)}
                              className="w-4.5 h-4.5 accent-emerald-500 border border-slate-200 rounded-md cursor-pointer"
                            />
                            <label htmlFor="dashboardEmergCheckbox" className="text-xs font-bold text-slate-500 uppercase tracking-wide cursor-pointer select-none">
                              24/7 Emergency Services Available
                            </label>
                          </div>
                          
                          <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-600">
                            <label className="block font-bold text-slate-500 uppercase tracking-wide">Facility Description</label>
                            <textarea
                              rows="3"
                              placeholder="Saint Grace Medical Center is a premier multi-speciality hospital..."
                              value={hospDesc}
                              onChange={(e) => setHospDesc(e.target.value)}
                              className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-none font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-3 border-t">
                          <Button
                            type="submit"
                            loading={updatingHosp}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs text-center max-w-md mx-auto my-6">
                <p className="text-xs text-slate-455 font-bold">No hospital profile data available.</p>
                <Button variant="primary" size="sm" onClick={fetchHospitalProfile} loading={loadingHosp}>
                  Retry Loading Profile
                </Button>
              </div>
            )}
          </ErrorBoundary>
        )}

        {activeTab === 'security' && (
          <SecuritySettings />
        )}

      </div>
    </div>
  );
};

export default HospitalDashboard;
