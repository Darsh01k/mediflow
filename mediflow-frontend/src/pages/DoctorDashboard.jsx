import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle,
  FileText, 
  AlertCircle,
  Stethoscope,
  ClipboardList,
  Plus,
  Phone,
  GraduationCap,
  Briefcase,
  Globe,
  DollarSign,
  Settings,
  Activity,
  Heart,
  Clock,
  Trash2,
  HeartPulse
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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

const DoctorDashboard = ({ stats, refreshStats }) => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('appointments');
  
  // Clinical record modal state
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [rxMedicines, setRxMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [dosageNotes, setDosageNotes] = useState('');
  const [rxInstructions, setRxInstructions] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Medicine row helpers
  const handleAddMedicineRow = () => {
    setRxMedicines([...rxMedicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };
  const handleRemoveMedicineRow = (idx) => {
    if (rxMedicines.length === 1) return;
    setRxMedicines(rxMedicines.filter((_, i) => i !== idx));
  };
  const handleMedicineFieldChange = (idx, field, value) => {
    const updated = [...rxMedicines];
    updated[idx][field] = value;
    setRxMedicines(updated);
  };

  // Doctor Profile state
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Form states
  const [spec, setSpec] = useState('');
  const [lic, setLic] = useState('');
  const [fee, setFee] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [qual, setQual] = useState('');
  const [exp, setExp] = useState('');
  const [lang, setLang] = useState('');
  const [avail, setAvail] = useState('');
  const [avId, setAvId] = useState('avatar_1');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [mail, setMail] = useState('');

  const fetchDoctorProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await API.get(`/doctors/user/${user.userId}`);
      if (res.data) {
        setDoctorProfile(res.data);
        // Bind fields
        setSpec(res.data.specialization || '');
        setLic(res.data.licenseNumber || '');
        setFee(res.data.consultationFee || '');
        setBio(res.data.bio || '');
        setPhone(res.data.phone || '');
        setQual(res.data.qualification || '');
        setExp(res.data.experience != null ? res.data.experience.toString() : '');
        setLang(res.data.languages || '');
        setAvail(res.data.availability || '');
        setAvId(res.data.user?.avatarId || 'avatar_1');
        setFname(res.data.user?.firstName || '');
        setLname(res.data.user?.lastName || '');
        setMail(res.data.user?.email || '');
      } else {
        setDoctorProfile(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctor profile');
      setDoctorProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const handleCancelAppointment = async (apptId) => {
    if (window.confirm('Are you sure you want to cancel this consultation?')) {
      try {
        await API.put(`/appointments/${apptId}/status?status=CANCELLED`);
        toast.success('Consultation cancelled successfully.');
        window.dispatchEvent(new CustomEvent('refresh-notifications'));
        refreshStats();
      } catch (err) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();

    // Filter out blank medicine rows
    const activeMeds = rxMedicines.filter(m => m.name.trim() !== '');
    if (!diagnosis || activeMeds.length === 0) {
      setError('Please write a diagnosis and add at least one medicine.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Build human-readable prescription summary for MedicalRecord
      const prescriptionSummary = activeMeds.map((m, i) => 
        `${i + 1}. ${m.name}${m.dosage ? ' — ' + m.dosage : ''}${m.frequency ? ', ' + m.frequency : ''}${m.duration ? ' for ' + m.duration : ''}${m.instructions ? ' (' + m.instructions + ')' : ''}`
      ).join('\n');
      
      const payload = {
        patientId: activeAppointment?.patient?.id,
        doctorId: activeAppointment?.doctor?.id,
        diagnosis,
        prescription: prescriptionSummary,
        treatmentNotes,
        medicinesJson: JSON.stringify(activeMeds),
        dosage: dosageNotes || 'As directed',
        instructions: rxInstructions || treatmentNotes || 'As directed'
      };

      // 1. Save Medical Record (which automatically creates the prescription and notifies the patient)
      await API.post('/medical-records', payload);

      // 2. Mark Appointment as Completed
      await API.put(`/appointments/${activeAppointment?.id}/status?status=COMPLETED&notes=Record saved`);

      toast.success('Clinical chart and prescription registered!');
      
      // Dispatch notification event to sync immediately
      window.dispatchEvent(new CustomEvent('refresh-notifications'));

      // Clear & close
      setDiagnosis('');
      setRxMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      setDosageNotes('');
      setRxInstructions('');
      setTreatmentNotes('');
      setActiveAppointment(null);

      // Refresh Stats
      refreshStats();

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit clinical record.');
      toast.error('Failed to submit medical record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!spec || !lic || !fee || !qual || !exp || !phone) {
      toast.error('Please fill in all mandatory profile fields');
      return;
    }

    try {
      setSavingProfile(true);
      const payload = {
        specialization: spec,
        licenseNumber: lic,
        consultationFee: parseFloat(fee),
        bio,
        phone,
        qualification: qual,
        experience: parseInt(exp),
        languages: lang,
        availability: avail,
        user: {
          firstName: fname,
          lastName: lname,
          email: mail,
          avatarId: avId
        }
      };

      const res = await API.put(`/doctors/${doctorProfile.id}`, payload);
      setDoctorProfile(res.data);
      
      // Update local storage and context user data for real-time sync
      updateUser({
        avatarId: avId,
        firstName: fname,
        lastName: lname,
        email: mail
      });
      
      toast.success('Profile details modified successfully!');

    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile updates');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAppointmentStatusUpdate = async (appointmentId, status) => {
    try {
      await API.put(`/appointments/${appointmentId}/status?status=${status}`);
      toast.success(`Appointment successfully ${status === 'APPROVED' ? 'accepted' : 'rejected'}!`);
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
      refreshStats();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || `Failed to update appointment status`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="info">Approved</Badge>;
      case 'SCHEDULED':
        return <Badge variant="primary">Scheduled</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  // Derive unique patients list from stats appointments
  const getUniquePatients = () => {
    const map = new Map();
    if (stats && stats.recentAppointments) {
      stats.recentAppointments.forEach(appt => {
        if (appt?.patient?.id) {
          map.set(appt.patient.id, appt.patient);
        }
      });
    }
    return Array.from(map.values());
  };

  const patientsList = getUniquePatients();

  return (
    <div className="space-y-8 relative">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Patients Served</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{stats?.totalPatients ?? 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Today's Visits</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{stats?.todayAppointments ?? 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-650 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Prescriptions Issued</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{stats?.totalPrescriptions ?? 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Pending Visits</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{stats?.upcomingAppointments ?? 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">My Total Consults</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{stats?.totalAppointments ?? 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'appointments'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Consultation Schedule
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'prescriptions'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Prescriptions & Charts
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'patients'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Patients Directory
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

      {/* Dynamic Tab Panels */}
      <div className="space-y-6">

        {/* Tab 1: Appointments Schedule */}
        {activeTab === 'appointments' && (
          <Card>
            <CardHeader>
              <CardTitle>My Consultation Schedule</CardTitle>
              <CardDescription>Review upcoming and past visits assigned to you</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!stats?.recentAppointments || stats.recentAppointments.length === 0 ? (
                <EmptyState
                  title="No Scheduled Consultations"
                  description="You do not have any patient visits currently booked."
                  icon={Calendar}
                />
              ) : (
                <Table>
                  <THead>
                    <TR>
                      <TH>Patient</TH>
                      <TH>Appointment Time</TH>
                      <TH>Reason for Visit</TH>
                      <TH className="text-center">Status</TH>
                      <TH className="text-right">Action</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {(stats?.recentAppointments || []).map((appt) => (
                      <TR key={appt?.id}>
                        <TD>
                          <div className="flex items-center gap-3">
                            <HealthAvatar avatarId={appt?.patient?.user?.avatarId || 'avatar_1'} className="w-8 h-8" />
                            <div>
                              <div className="font-bold text-slate-800">
                                {appt?.patient?.user?.firstName || ''} {appt?.patient?.user?.lastName || ''}
                              </div>
                              <div className="text-[10px] font-semibold text-slate-400">
                                Age: {calculateAge(appt?.patient?.dateOfBirth)} • Gender: {appt?.patient?.gender || 'N/A'} • City: {appt?.patient?.user?.city || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TD>
                        <TD className="text-xs font-semibold text-slate-600">
                          {appt?.appointmentDate ? new Date(appt.appointmentDate).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </TD>
                        <TD className="max-w-xs text-xs text-slate-500 font-medium truncate" title={appt?.reason || ''}>
                          {appt?.reason || 'N/A'}
                        </TD>
                        <TD className="text-center">
                          {getStatusBadge(appt?.status)}
                        </TD>
                        <TD className="text-right">
                          {appt?.status === 'PENDING' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="xs"
                                onClick={() => handleAppointmentStatusUpdate(appt?.id, 'APPROVED')}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleAppointmentStatusUpdate(appt?.id, 'REJECTED')}
                                className="text-rose-500 border-rose-100 hover:bg-rose-50 hover:text-rose-700"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {appt?.status === 'APPROVED' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="xs"
                                icon={Plus}
                                onClick={() => setActiveAppointment(appt)}
                              >
                                Diagnose
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleCancelAppointment(appt?.id)}
                                className="text-rose-500 border-rose-100 hover:bg-rose-50 hover:text-rose-700"
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                          {appt?.status === 'REJECTED' && (
                            <Badge variant="neutral" className="opacity-60 bg-slate-100 text-slate-400 border-slate-200">
                              Rejected by Doctor
                            </Badge>
                          )}
                          {appt?.status === 'COMPLETED' && (
                            <span className="text-xs text-slate-400 font-semibold">Completed</span>
                          )}
                          {appt?.status === 'CANCELLED' && (
                            <span className="text-xs text-slate-400 font-semibold">Cancelled</span>
                          )}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Prescriptions & Charts */}
        {activeTab === 'prescriptions' && (
          <Card>
            <CardHeader>
              <CardTitle>Clinical Charts History</CardTitle>
              <CardDescription>Review past diagnosis logs and drugs prescriptions.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!stats?.recentRecords || stats.recentRecords.length === 0 ? (
                <EmptyState
                  title="No Medical Entries"
                  description="You have not logged any diagnostics chart summaries yet."
                  icon={FileText}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(stats?.recentRecords || []).map((rec) => (
                    <Card key={rec?.id} className="border border-slate-200/60 shadow-sm">
                      <CardHeader className="flex flex-row justify-between items-center bg-slate-50/50 pb-3 border-b">
                        <div className="flex items-center gap-3">
                          <HealthAvatar avatarId={rec?.patient?.user?.avatarId || 'avatar_1'} className="w-8 h-8" />
                          <div>
                            <CardTitle className="text-xs font-bold text-slate-800">
                              {rec?.patient?.user?.firstName || ''} {rec?.patient?.user?.lastName || ''}
                            </CardTitle>
                            <CardDescription className="text-[10px]">Patient ID: #{rec?.patient?.id || 'N/A'}</CardDescription>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 border border-slate-200/50 rounded-full">
                          {rec?.visitDate || 'N/A'}
                        </span>
                      </CardHeader>
                      <CardContent className="p-4 text-xs space-y-3 font-semibold text-slate-600">
                        <div>
                          <span className="block font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Diagnosis</span>
                          <p className="bg-slate-50 p-2.5 border border-slate-100 rounded-lg text-slate-800 font-medium">
                            {rec?.diagnosis || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Prescribed Treatment</span>
                          <p className="bg-emerald-50/10 p-2.5 border border-emerald-100/30 rounded-lg text-emerald-800 font-medium">
                            {rec?.prescription || 'N/A'}
                          </p>
                        </div>
                        {rec?.treatmentNotes && (
                          <div>
                            <span className="block font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Clinical Notes</span>
                            <p className="text-slate-500 font-medium italic">
                              {rec?.treatmentNotes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 3: My Patients */}
        {activeTab === 'patients' && (
          <Card>
            <CardHeader>
              <CardTitle>My Patients Directory</CardTitle>
              <CardDescription>Overview of unique patients associated with your practice logs</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {patientsList.length === 0 ? (
                <EmptyState
                  title="No Patients Registered"
                  description="No patient accounts are currently linked with your consult logs."
                  icon={Users}
                />
              ) : (
                <Table>
                  <THead>
                    <TR>
                      <TH>Patient</TH>
                      <TH>Age</TH>
                      <TH>Gender</TH>
                      <TH>City</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {(patientsList || []).map((pat) => (
                      <TR key={pat?.id}>
                        <TD>
                          <div className="flex items-center gap-3">
                            <HealthAvatar avatarId={pat?.user?.avatarId || 'avatar_1'} className="w-8 h-8" />
                            <div className="font-bold text-slate-800">
                              {pat?.user?.firstName || ''} {pat?.user?.lastName || ''}
                            </div>
                          </div>
                        </TD>
                        <TD className="text-xs font-semibold text-slate-600">{calculateAge(pat?.dateOfBirth)} Years</TD>
                        <TD className="text-xs font-semibold text-slate-600">{pat?.gender || 'N/A'}</TD>
                        <TD className="text-xs font-semibold text-slate-655">{pat?.user?.city || 'N/A'}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Modify Profile */}
        {activeTab === 'profile' && (
          <ErrorBoundary>
            {doctorProfile ? (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Doctor Profile</CardTitle>
                  <CardDescription>Change avatar, availability, specialization, consult fee, and qualifications.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingProfile ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <Spinner />
                      <p className="text-xs text-slate-400 font-semibold">Retrieving profile...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-slate-700">
                      {/* Left Column: Certified Practitioner Card */}
                      <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/10">
                          {/* Grid background effect */}
                          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                          
                          <div className="relative z-10 space-y-5">
                            {/* Title bar */}
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase bg-white/20 border border-white/20 px-2.5 py-1 rounded-md tracking-wider">
                                Certified Practitioner
                              </span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-500 rounded-md tracking-wide">
                                {doctorProfile?.status || 'APPROVED'}
                              </span>
                            </div>

                            {/* Avatar & Name */}
                            <div className="flex flex-col items-center text-center space-y-3 pt-2">
                              <div className="p-1.5 bg-white/10 rounded-full border border-white/20 shadow-md">
                                <HealthAvatar avatarId={avId} className="w-20 h-20" />
                              </div>
                              <div>
                                <h3 className="text-lg font-black tracking-tight leading-none">Dr. {fname} {lname}</h3>
                                <p className="text-xs font-black text-indigo-200 bg-white/10 border border-white/10 rounded-full px-3.5 py-1 mt-2 inline-block">
                                  {spec || 'General Practice'}
                                </p>
                              </div>
                            </div>

                            <hr className="border-white/15" />

                            {/* Key Info List */}
                            <div className="space-y-3.5 text-xs font-semibold text-indigo-100">
                              <div className="flex justify-between items-center">
                                <span className="opacity-60 font-bold uppercase text-[9px] tracking-wide shrink-0">Hospital</span>
                                <span className="text-white font-extrabold truncate max-w-[150px]">{doctorProfile?.hospital?.name || 'Unassociated'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="opacity-60 font-bold uppercase text-[9px] tracking-wide">Qualification</span>
                                <span className="text-white font-extrabold">{qual || 'MBBS'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="opacity-60 font-bold uppercase text-[9px] tracking-wide">Experience</span>
                                <span className="text-white font-extrabold">{exp || '0'} Years</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="opacity-60 font-bold uppercase text-[9px] tracking-wide">Consultation Fee</span>
                                <span className="text-white font-extrabold">{formatINR(fee)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="opacity-60 font-bold uppercase text-[9px] tracking-wide">Rating</span>
                                <span className="text-white font-extrabold flex items-center gap-1">★ 4.8 <span className="opacity-50 text-[10px]">(Verified)</span></span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="opacity-60 font-bold uppercase text-[9px] tracking-wide">Registered City</span>
                                <span className="text-white font-extrabold">{user?.city || 'Boston'}</span>
                              </div>
                            </div>

                            {/* Availability Schedule Info */}
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-3.5 text-xs font-semibold">
                              <span className="block opacity-60 font-bold uppercase text-[8px] tracking-wider mb-1">Availability Schedule</span>
                              <p className="text-white leading-normal text-[11px] font-medium">{avail || 'Schedule on Consultation Booking'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Modify Profile Form */}
                      <form onSubmit={handleUpdateProfile} className="lg:col-span-2 space-y-6 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm text-slate-700">
                        {/* Avatar Picker Section */}
                        <div className="space-y-3">
                          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Select Healthcare Avatar</span>
                          <AvatarPicker selectedId={avId} onSelect={setAvId} category="DOCTOR" />
                        </div>

                        {/* Basic Form Attributes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="First Name"
                            required
                            placeholder="Doctor First Name"
                            value={fname}
                            onChange={(e) => setFname(e.target.value)}
                          />
                          <Input
                            label="Last Name"
                            required
                            placeholder="Doctor Last Name"
                            value={lname}
                            onChange={(e) => setLname(e.target.value)}
                          />
                          <Input
                            label="Email Address"
                            required
                            type="email"
                            placeholder="dr.name@example.com"
                            value={mail}
                            onChange={(e) => setMail(e.target.value)}
                          />
                          <Input
                            label="Practice Phone Number"
                            required
                            placeholder="+1 (555) 123-4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                          <Input
                            label="Medical Specialization"
                            required
                            placeholder="e.g. Pediatrics"
                            value={spec}
                            onChange={(e) => setSpec(e.target.value)}
                          />
                          <Input
                            label="Medical License Number"
                            required
                            placeholder="e.g. LIC-987654"
                            value={lic}
                            onChange={(e) => setLic(e.target.value)}
                          />
                          <Input
                            label="Qualification"
                            required
                            placeholder="e.g. MBBS, MD"
                            value={qual}
                            onChange={(e) => setQual(e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Years of Experience"
                              required
                              type="number"
                              min="0"
                              placeholder="10"
                              value={exp}
                              onChange={(e) => setExp(e.target.value)}
                            />
                            <Input
                              label="Consultation Fee (INR)"
                              required
                              type="number"
                              min="0"
                              placeholder="500"
                              value={fee}
                              onChange={(e) => setFee(e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              label="Languages Spoken (Comma Separated)"
                              placeholder="English, Spanish, Hindi"
                              value={lang}
                              onChange={(e) => setLang(e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              label="Availability Schedule"
                              placeholder="Mon-Fri: 09:00 AM - 05:00 PM"
                              value={avail}
                              onChange={(e) => setAvail(e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-655">
                            <label className="block font-bold text-slate-500 uppercase tracking-wide">Professional Bio</label>
                            <textarea
                              rows="3"
                              placeholder="Describe your medical experience, style, and philosophy..."
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
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
                <p className="text-xs text-slate-455 font-bold">No doctor profile data available.</p>
                <Button variant="primary" size="sm" onClick={fetchDoctorProfile} loading={loadingProfile}>
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

      {/* Diagnosis & Prescription Modal Backdrop */}
      {activeAppointment && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row justify-between items-center border-b pb-3 shrink-0">
              <div>
                <CardTitle>New Clinical Record Entry</CardTitle>
                <CardDescription>Prescribe medication and save diagnosis charts</CardDescription>
              </div>
              <button 
                onClick={() => setActiveAppointment(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 overflow-y-auto flex-1">
              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl flex flex-col gap-1.5 border border-slate-200/50 font-semibold">
                <p><span className="font-bold text-slate-400">Patient Name:</span> {activeAppointment?.patient?.user?.firstName || ''} {activeAppointment?.patient?.user?.lastName || ''}</p>
                <p><span className="font-bold text-slate-400">Consultation Reason:</span> {activeAppointment?.reason || 'N/A'}</p>
              </div>

              <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase tracking-wide">Diagnosis / Assessment</label>
                  <textarea
                    required
                    rows="2"
                    placeholder="Describe patient condition, e.g. Acute Pharyngitis with mild dehydration."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500/50 text-slate-800 placeholder-slate-400 resize-none font-medium text-sm"
                  />
                </div>

                {/* Structured Medicines Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-extrabold text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-emerald-500" />
                      <span>Medicines & Dosage</span>
                    </h4>
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      icon={Plus}
                      onClick={handleAddMedicineRow}
                    >
                      Add Row
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {rxMedicines.map((med, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end bg-slate-50/80 p-3 border border-slate-200/60 rounded-xl relative">
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-400 uppercase tracking-wide text-[9px]">Medicine</label>
                          <input
                            required={idx === 0}
                            value={med.name}
                            onChange={(e) => handleMedicineFieldChange(idx, 'name', e.target.value)}
                            placeholder="e.g. Amoxicillin 500mg"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500/50 text-slate-800 placeholder-slate-400 text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-400 uppercase tracking-wide text-[9px]">Dosage</label>
                          <input
                            value={med.dosage}
                            onChange={(e) => handleMedicineFieldChange(idx, 'dosage', e.target.value)}
                            placeholder="e.g. 1 Tablet"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500/50 text-slate-800 placeholder-slate-400 text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-400 uppercase tracking-wide text-[9px]">Frequency</label>
                          <input
                            value={med.frequency}
                            onChange={(e) => handleMedicineFieldChange(idx, 'frequency', e.target.value)}
                            placeholder="e.g. 3x daily"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500/50 text-slate-800 placeholder-slate-400 text-xs font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-slate-400 uppercase tracking-wide text-[9px]">Duration</label>
                          <input
                            value={med.duration}
                            onChange={(e) => handleMedicineFieldChange(idx, 'duration', e.target.value)}
                            placeholder="e.g. 7 days"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500/50 text-slate-800 placeholder-slate-400 text-xs font-medium"
                          />
                        </div>
                        <div className="flex items-end gap-1.5">
                          <div className="flex-1 space-y-1">
                            <label className="block font-bold text-slate-400 uppercase tracking-wide text-[9px]">Instructions</label>
                            <input
                              value={med.instructions}
                              onChange={(e) => handleMedicineFieldChange(idx, 'instructions', e.target.value)}
                              placeholder="e.g. After meals"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500/50 text-slate-800 placeholder-slate-400 text-xs font-medium"
                            />
                          </div>
                          {rxMedicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicineRow(idx)}
                              className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* General Dosage & Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-wide">Dosage / Timing Guidelines</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Take morning dose before breakfast..."
                      value={dosageNotes}
                      onChange={(e) => setDosageNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500/50 text-slate-800 placeholder-slate-400 resize-none font-medium text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-wide">Additional Instructions</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Avoid dairy, stay hydrated..."
                      value={rxInstructions}
                      onChange={(e) => setRxInstructions(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500/50 text-slate-800 placeholder-slate-400 resize-none font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase tracking-wide">Treatment / Follow-up Notes (Optional)</label>
                  <textarea
                    rows="2"
                    placeholder="Advised bed rest, keep hydrated, return if fever persists."
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500/50 text-slate-800 placeholder-slate-400 resize-none font-medium text-sm"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                  <Button variant="secondary" size="sm" onClick={() => setActiveAppointment(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" loading={submitting}>
                    Submit Chart
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
