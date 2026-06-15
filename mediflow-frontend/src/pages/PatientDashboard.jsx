import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  User,
  Heart,
  Phone,
  MapPin,
  FilePenLine
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import { AvatarPicker } from '../components/ui/Avatar';
import SecuritySettings from '../components/SecuritySettings';
import ErrorBoundary from '../components/ui/ErrorBoundary';

const calculateAge = (dobString) => {
  if (!dobString) return 'N/A';
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const PatientDashboard = ({ stats, refreshStats }) => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');

  // Profile management states
  const [patientProfile, setPatientProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Form states
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emerg, setEmerg] = useState('');
  const [blood, setBlood] = useState('O+');
  const [notes, setNotes] = useState('');
  const [avId, setAvId] = useState('avatar_1');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [mail, setMail] = useState('');

  const fetchPatientProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await API.get(`/patients/user/${user.userId}`);
      if (res.data) {
        setPatientProfile(res.data);
        // Bind form variables
        setDob(res.data.dateOfBirth || '');
        setGender(res.data.gender || 'Male');
        setPhone(res.data.phone || '');
        setAddress(res.data.address || '');
        setEmerg(res.data.emergencyContact || '');
        setBlood(res.data.bloodType || 'O+');
        setNotes(res.data.medicalNotes || '');
        setAvId(res.data.user?.avatarId || 'avatar_1');
        setFname(res.data.user?.firstName || '');
        setLname(res.data.user?.lastName || '');
        setMail(res.data.user?.email || '');
      } else {
        setPatientProfile(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load patient profile data');
      setPatientProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!dob || !gender || !phone) {
      toast.error('First Name, Last Name, Email, DOB, Gender, and Phone are required');
      return;
    }

    try {
      setSavingProfile(true);
      const payload = {
        dateOfBirth: dob,
        gender,
        phone,
        address, // Address optional
        emergencyContact: emerg,
        bloodType: blood,
        medicalNotes: notes,
        user: {
          firstName: fname,
          lastName: lname,
          email: mail,
          avatarId: avId
        }
      };

      const res = await API.put(`/patients/${patientProfile.id}`, payload);
      setPatientProfile(res.data);
      
      // Update local storage and context user data for real-time sync
      updateUser({
        avatarId: avId,
        firstName: fname,
        lastName: lname,
        email: mail
      });

      toast.success('Patient profile updated successfully!');

    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile changes');
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge variant="primary">Scheduled</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs bar */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Health Portal
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'profile'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Modify Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'security'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Security Settings
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Promos & Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              
              {/* Book Appointment Promo */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-md shadow-emerald-950/20 flex flex-col justify-between min-h-[160px]">
                <div>
                  <h3 className="font-black text-lg leading-6">Book a Doctor Visit</h3>
                  <p className="text-emerald-100 text-xs mt-1 font-semibold leading-relaxed">
                    Find specialists and schedule your consultation in seconds.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/book-appointment')}
                  className="flex items-center gap-2 self-start mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20 font-bold rounded-xl text-xs transition-all cursor-pointer group"
                >
                  <span>Start Booking</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Stats 1 */}
              <Card>
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Scheduled Visits</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats?.upcomingAppointments ?? 0}</h3>
                  </div>
                </CardContent>
              </Card>

              {/* Stats 2 */}
              <Card>
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">My Total Consults</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats?.totalAppointments ?? 0}</h3>
                  </div>
                </CardContent>
              </Card>

              {/* Stats 3 */}
              <Card>
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-650 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">My Prescriptions</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats?.totalPrescriptions ?? 0}</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Upcoming Visits */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row justify-between items-center pb-4 border-b">
                  <div>
                    <CardTitle>My Medical Appointments</CardTitle>
                    <CardDescription>Scheduled consults and visit history</CardDescription>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/appointments')}
                  >
                    See All
                  </Button>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  {!stats?.recentAppointments || stats.recentAppointments.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No upcoming consultations booked.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2">
                      {(stats?.recentAppointments || []).map((appt) => (
                        <div key={appt?.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-slate-800">
                                Dr. {appt?.doctor?.user?.firstName || ''} {appt?.doctor?.user?.lastName || ''}
                              </h5>
                              <Badge variant="neutral">
                                {appt?.doctor?.specialization || 'N/A'}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 font-semibold">
                              Date: {appt?.appointmentDate ? new Date(appt.appointmentDate).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </p>
                            <p className="text-xs text-slate-450 font-medium">Reason: {appt?.reason || 'N/A'}</p>
                            {appt?.doctor?.hospital && (
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                Hospital: {appt.doctor.hospital.name} ({appt.doctor.hospital.city}) • Address: {appt.doctor.hospital.address} • Ph: {appt.doctor.hospital.phone}
                              </p>
                            )}
                          </div>
                          <div>
                            {getStatusBadge(appt?.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Prescriptions */}
              <Card>
                <CardHeader className="flex flex-row justify-between items-center pb-4 border-b">
                  <div>
                    <CardTitle>My Prescriptions</CardTitle>
                    <CardDescription>Recent medical treatments</CardDescription>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/records')}
                  >
                    See All
                  </Button>
                </CardHeader>

                <CardContent className="p-6">
                  {!stats?.recentRecords || stats.recentRecords.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No prescriptions on record.</p>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {(stats?.recentRecords || []).map((rec) => (
                        <div key={rec?.id} className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-xs font-bold text-slate-800">
                                Dr. {rec?.doctor?.user?.firstName || ''} {rec?.doctor?.user?.lastName || ''}
                              </h5>
                              {rec?.doctor?.hospital && (
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                  Hospital: {rec.doctor.hospital.name} ({rec.doctor.hospital.city}) • Address: {rec.doctor.hospital.address} • Ph: {rec.doctor.hospital.phone}
                                </p>
                              )}
                              <p className="text-[10px] text-slate-400 font-bold">{rec?.visitDate || 'N/A'}</p>
                            </div>
                            <span className="p-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-605">
                              <FileText className="w-4.5 h-4.5" />
                            </span>
                          </div>
                          <div className="text-[11px] space-y-1.5 border-t border-slate-200/50 pt-2">
                            <p className="text-slate-700 font-semibold leading-normal">
                              <span className="font-bold text-slate-500">Rx:</span> {rec?.prescription || 'N/A'}
                            </p>
                            <p className="text-slate-455 font-semibold">Diagnosis: {rec?.diagnosis || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Modify Profile */}
        {activeTab === 'profile' && (
          <ErrorBoundary>
            {patientProfile ? (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Patient Profile</CardTitle>
                  <CardDescription>Configure emergency contact, address details, medical notes, and change your avatar.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingProfile ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <Spinner />
                      <p className="text-xs text-slate-400 font-semibold">Retrieving details...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                      {/* Left Column: Health Passport Card */}
                      <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gradient-to-br from-teal-500/95 to-emerald-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/10">
                          {/* Grid background effect */}
                          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                          
                          <div className="relative z-10 space-y-6">
                            {/* Title bar */}
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase bg-white/20 border border-white/20 px-2.5 py-1 rounded-md tracking-wider">
                                MediFlow Health ID
                              </span>
                              <span className="text-[10px] font-bold opacity-60">ACTIVE</span>
                            </div>

                            {/* Avatar & Name */}
                            <div className="flex flex-col items-center text-center space-y-3 pt-2">
                              <div className="p-1.5 bg-white/10 rounded-full border border-white/20 shadow-md">
                                <HealthAvatar avatarId={avId} className="w-20 h-20" />
                              </div>
                              <div>
                                <h3 className="text-lg font-black tracking-tight leading-none">{fname} {lname}</h3>
                                <p className="text-[11px] font-semibold opacity-75 mt-1.5">{patientProfile?.user?.city ? `${patientProfile?.user?.city}, ${patientProfile?.user?.state || ''}` : 'Location unconfigured'}</p>
                              </div>
                            </div>

                            <hr className="border-white/15" />

                            {/* Key Info Grid */}
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-semibold">
                              <div>
                                <span className="block text-[9px] font-bold opacity-50 uppercase tracking-wide">Age</span>
                                <span className="text-sm font-extrabold">{calculateAge(dob)} Years</span>
                              </div>
                              <div>
                                <span className="block text-[9px] font-bold opacity-50 uppercase tracking-wide">Gender</span>
                                <span className="text-sm font-extrabold">{gender || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] font-bold opacity-50 uppercase tracking-wide">Blood Group</span>
                                <span className="inline-block text-xs font-extrabold px-2 py-0.5 bg-white/25 rounded mt-0.5">{blood || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] font-bold opacity-50 uppercase tracking-wide">Emergency Contact</span>
                                <span className="text-[11px] font-bold leading-tight block mt-0.5 truncate" title={emerg}>{emerg || 'Not configured'}</span>
                              </div>
                            </div>

                            {/* Stats summary */}
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-3.5 flex justify-around text-center text-xs font-semibold">
                              <div>
                                <span className="block font-black text-lg leading-none">{stats?.totalAppointments ?? 0}</span>
                                <span className="text-[9px] font-bold opacity-60 uppercase tracking-wider block mt-1">Consults</span>
                              </div>
                              <div className="border-r border-white/10 h-7 self-center" />
                              <div>
                                <span className="block font-black text-lg leading-none">{stats?.totalPrescriptions ?? 0}</span>
                                <span className="text-[9px] font-bold opacity-60 uppercase tracking-wider block mt-1">Prescriptions</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Modify Profile Form */}
                      <form onSubmit={handleUpdateProfile} className="lg:col-span-2 space-y-6 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm text-slate-700">
                        {/* Avatar Picker Section */}
                        <div className="space-y-3">
                          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Select Healthcare Avatar</span>
                          <AvatarPicker selectedId={avId} onSelect={setAvId} category="PATIENT" />
                        </div>

                        {/* Form fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="First Name"
                            required
                            placeholder="First Name"
                            value={fname}
                            onChange={(e) => setFname(e.target.value)}
                          />
                          <Input
                            label="Last Name"
                            required
                            placeholder="Last Name"
                            value={lname}
                            onChange={(e) => setLname(e.target.value)}
                          />
                          <Input
                            label="Email Address"
                            required
                            type="email"
                            placeholder="name@example.com"
                            value={mail}
                            onChange={(e) => setMail(e.target.value)}
                          />
                          <Input
                            label="Phone Number"
                            required
                            placeholder="+1 (555) 000-1111"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                          <Input
                            label="Date of Birth"
                            required
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Select
                              label="Gender"
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                              options={['Male', 'Female', 'Other']}
                            />
                            <Select
                              label="Blood Group"
                              value={blood}
                              onChange={(e) => setBlood(e.target.value)}
                              options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="Emergency Contact (Optional)"
                          placeholder="Jane Doe (Spouse) - +1 (555) 111-2222"
                          value={emerg}
                          onChange={(e) => setEmerg(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-600">
                        <label className="block font-bold text-slate-500 uppercase tracking-wide">Residential Address (Optional)</label>
                        <textarea
                          rows="2"
                          placeholder="123 Health Ave, Medical City"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-none font-medium"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-600">
                        <label className="block font-bold text-slate-500 uppercase tracking-wide">Personal Medical Notes</label>
                        <textarea
                          rows="3"
                          placeholder="Chronic diseases, allergies, special treatments, current medications..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500/50 resize-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-3 border-t">
                      <Button
                        type="submit"
                        loading={savingProfile}
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
                <p className="text-xs text-slate-450 font-bold">No patient profile data available.</p>
                <Button variant="primary" size="sm" onClick={fetchPatientProfile} loading={loadingProfile}>
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

export default PatientDashboard;
