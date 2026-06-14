import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, 
  Clock, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Reschedule state
  const [reschedulingAppt, setReschedulingAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await API.get('/appointments');
      setAppointments(response.data);
    } catch (err) {
      setError('Failed to fetch appointments schedule.');
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (apptId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        setActionLoading(true);
        await API.put(`/appointments/${apptId}/status?status=CANCELLED`);
        toast.success('Appointment cancelled successfully');
        window.dispatchEvent(new CustomEvent('refresh-notifications'));
        fetchAppointments();
      } catch (err) {
        toast.error('Failed to cancel appointment');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!newDate) return;

    try {
      setActionLoading(true);
      const formattedDate = new Date(newDate).toISOString().slice(0, 19);
      await API.put(`/appointments/${reschedulingAppt.id}/reschedule?date=${formattedDate}`);
      toast.success('Appointment rescheduled successfully');
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
      setReschedulingAppt(null);
      setNewDate('');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setActionLoading(false);
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
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="h-[55vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-slate-500 text-xs font-semibold">Loading consultation calendars...</p>
      </div>
    );
  }

  return (
    <Card className="relative">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Visits & Appointments</CardTitle>
          <CardDescription>Manage scheduled consultations and history</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchAppointments}
          disabled={actionLoading}
        >
          Refresh
        </Button>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-6 bg-rose-50/50 border border-rose-200/50 text-rose-600 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {appointments.length === 0 ? (
          <EmptyState
            title="No appointments scheduled"
            description="There are no consultation visits currently booked on your account."
            icon={Calendar}
            action={
              user.role === 'PATIENT' ? (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => navigate('/book-appointment')}
                >
                  Book Consultation
                </Button>
              ) : null
            }
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Practitioner / Client</TH>
                <TH>Specialization</TH>
                <TH>Schedule Date</TH>
                <TH>Consultation Reason</TH>
                <TH className="text-center">Status</TH>
                <TH className="text-center">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {appointments.map((appt) => {
                const displayName = user.role === 'PATIENT'
                  ? `Dr. ${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`
                  : `${appt.patient.user.firstName} ${appt.patient.user.lastName}`;
                
                return (
                  <TR key={appt.id}>
                    <TD className="font-bold text-slate-800">
                      <div>{displayName}</div>
                      {user.role === 'PATIENT' && appt.doctor?.hospital && (
                        <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          Hospital: {appt.doctor.hospital.name} ({appt.doctor.hospital.city}) • Address: {appt.doctor.hospital.address} • Ph: {appt.doctor.hospital.phone}
                        </div>
                      )}
                    </TD>
                    <TD className="text-slate-500 font-medium">{appt.doctor.specialization}</TD>
                    <TD className="text-slate-500 font-medium">
                      {new Date(appt.appointmentDate).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TD>
                    <TD className="text-slate-400 font-semibold italic max-w-xs truncate">{appt.reason}</TD>
                    <TD className="text-center">{getStatusBadge(appt.status)}</TD>
                    <TD className="text-center">
                      {appt.status === 'SCHEDULED' ? (
                        <div className="flex justify-center gap-2">
                          {(user.role === 'PATIENT' || user.role === 'ADMIN') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReschedulingAppt(appt)}
                              disabled={actionLoading}
                            >
                              Reschedule
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(appt.id)}
                            disabled={actionLoading}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="neutral">Closed</Badge>
                      )}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </CardContent>

      {/* Reschedule Overlay Modal */}
      {reschedulingAppt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle>Reschedule Appointment</CardTitle>
              <button 
                onClick={() => setReschedulingAppt(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-xs text-slate-500 leading-normal">
                Change consult schedule with <span className="font-bold text-slate-700">
                  Dr. {reschedulingAppt.doctor.user.firstName} {reschedulingAppt.doctor.user.lastName}
                </span>.
              </p>

              <form onSubmit={handleReschedule} className="space-y-4">
                <Input
                  label="Select New Date & Time"
                  type="datetime-local"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  icon={Clock}
                />

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => setReschedulingAppt(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={actionLoading}
                  >
                    Confirm
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default Appointments;
