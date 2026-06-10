import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle,
  FileText, 
  AlertCircle,
  Stethoscope,
  ClipboardList,
  Plus
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const DoctorDashboard = ({ stats, refreshStats }) => {
  const { user } = useAuth();
  const toast = useToast();
  
  // Clinical record modal state
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCancelAppointment = async (apptId) => {
    if (window.confirm('Are you sure you want to cancel this consultation?')) {
      try {
        await API.put(`/appointments/${apptId}/status?status=CANCELLED`);
        toast.success('Consultation cancelled successfully.');
        refreshStats();
      } catch (err) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis || !prescription) {
      setError('Please write diagnosis and prescription');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const payload = {
        patientId: activeAppointment.patient.id,
        doctorId: activeAppointment.doctor.id,
        diagnosis,
        prescription,
        treatmentNotes
      };

      // 1. Save Medical Record
      await API.post('/medical-records', payload);

      // 2. Mark Appointment as Completed
      await API.put(`/appointments/${activeAppointment.id}/status?status=COMPLETED&notes=Record saved`);

      toast.success('Clinical chart and prescription registered!');
      
      // Clear & close
      setDiagnosis('');
      setPrescription('');
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
    <div className="space-y-8 relative">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-650 shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">My Total Consults</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalAppointments}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pending Visits</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.upcomingAppointments}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Completed</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.completedAppointments}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Patients Managed</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalPatients}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultations List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Appointments Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Consultation Schedule</CardTitle>
            <CardDescription>Review upcoming and past visits assigned to you</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {stats.recentAppointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No scheduled visits found.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2">
                {stats.recentAppointments.map((appt) => (
                  <div key={appt.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-800">
                          {appt.patient.user.firstName} {appt.patient.user.lastName}
                        </h5>
                        {getStatusBadge(appt.status)}
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">
                        Date: {new Date(appt.appointmentDate).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-slate-400 font-semibold italic">Reason: {appt.reason}</p>
                    </div>

                    {appt.status === 'SCHEDULED' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          icon={Plus}
                          onClick={() => setActiveAppointment(appt)}
                        >
                          Diagnose
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={XCircle}
                          onClick={() => handleCancelAppointment(appt.id)}
                          className="text-rose-600 border-rose-100 hover:bg-rose-50/50"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Medical Charts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Patient Charts</CardTitle>
            <CardDescription>Latest diagnostics entries</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {stats.recentRecords.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No medical entries found.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {stats.recentRecords.map((rec) => (
                  <div key={rec.id} className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl space-y-2 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <h5 className="text-xs font-bold text-slate-800">
                        {rec.patient.user.firstName} {rec.patient.user.lastName}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-bold">{rec.visitDate}</span>
                    </div>
                    <div className="text-[11px] space-y-1">
                      <p className="text-slate-700 leading-normal"><span className="font-bold text-slate-500">Diagnosis:</span> {rec.diagnosis}</p>
                      <p className="text-slate-700 leading-normal"><span className="font-bold text-slate-500">Prescription:</span> {rec.prescription}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Diagnosis & Prescription Modal Backdrop */}
      {activeAppointment && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center border-b pb-3">
              <div>
                <CardTitle>New Clinical Record Entry</CardTitle>
                <CardDescription>Prescribe medication and save diagnosis charts</CardDescription>
              </div>
              <button 
                onClick={() => setActiveAppointment(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm shrink-0"
              >
                ✕
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl flex flex-col gap-1.5 border border-slate-200/50 font-semibold">
                <p><span className="font-bold text-slate-400">Patient Name:</span> {activeAppointment.patient.user.firstName} {activeAppointment.patient.user.lastName}</p>
                <p><span className="font-bold text-slate-400">Consultation Reason:</span> {activeAppointment.reason}</p>
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
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 text-slate-800 placeholder-slate-400 resize-none font-medium text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase tracking-wide">Prescription (Drugs & Dosage)</label>
                  <textarea
                    required
                    rows="2"
                    placeholder="e.g. Amoxicillin 500mg, 1 tablet 3x daily for 7 days."
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 text-slate-800 placeholder-slate-400 resize-none font-medium text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase tracking-wide">Treatment / Follow-up Notes (Optional)</label>
                  <textarea
                    rows="2"
                    placeholder="Advised bed rest, keep hydrated, return if fever persists."
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 text-slate-800 placeholder-slate-400 resize-none font-medium text-sm"
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
