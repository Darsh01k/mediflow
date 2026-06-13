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
  FileText
} from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
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

  const fetchHospitalProfile = async () => {
    try {
      setLoadingHosp(true);
      const res = await API.get('/hospitals/my-hospital');
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
    } catch (err) {
      console.error(err);
      toast.error('Failed to load hospital profile');
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
        logoAvatar: hospLogo
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
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Analytics
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors relative ${
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
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'patients'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          View Patients
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'profile'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Profile
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
                        <TD className="font-bold text-slate-700">${doc.consultationFee}</TD>
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
        )}

        {/* Tab 4: Hospital Profile */}
        {activeTab === 'profile' && hospital && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Hospital Profile</CardTitle>
              <CardDescription>Update name, contact parameters, description, and location metadata of this facility.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loadingHosp ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Spinner />
                  <p className="text-xs text-slate-400 font-semibold">Loading details...</p>
                </div>
              ) : (
                <form onSubmit={handleUpdateHospital} className="space-y-6 max-w-4xl">
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
                    
                    <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-600">
                      <label className="block font-bold text-slate-500 uppercase tracking-wide">Facility Description</label>
                      <textarea
                        rows="3"
                        placeholder="Saint Grace Medical Center is a premier multi-speciality hospital..."
                        value={hospDesc}
                        onChange={(e) => setHospDesc(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-none"
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
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default HospitalDashboard;
