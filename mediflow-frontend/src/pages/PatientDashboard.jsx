import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const PatientDashboard = ({ stats, refreshStats }) => {
  const navigate = useNavigate();

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
      {/* Quick Promos & Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Book Appointment Promo */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-650 p-6 rounded-2xl text-white shadow-md shadow-emerald-950/20 flex flex-col justify-between min-h-[160px]">
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
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Scheduled Visits</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.upcomingAppointments}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Stats 2 */}
        <Card>
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">My Total Consults</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalAppointments}</h3>
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
            {stats.recentAppointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming consultations booked.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2">
                {stats.recentAppointments.map((appt) => (
                  <div key={appt.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-800">
                          Dr. {appt.doctor.user.firstName} {appt.doctor.user.lastName}
                        </h5>
                        <Badge variant="neutral">
                          {appt.doctor.specialization}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">
                        Date: {new Date(appt.appointmentDate).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-slate-450 font-medium">Reason: {appt.reason}</p>
                    </div>
                    <div>
                      {getStatusBadge(appt.status)}
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
            {stats.recentRecords.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No prescriptions on record.</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {stats.recentRecords.map((rec) => (
                  <div key={rec.id} className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">
                          Dr. {rec.doctor.user.firstName} {rec.doctor.user.lastName}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-bold">{rec.visitDate}</p>
                      </div>
                      <span className="p-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-600">
                        <FileText className="w-4.5 h-4.5" />
                      </span>
                    </div>
                    <div className="text-[11px] space-y-1.5 border-t border-slate-200/50 pt-2">
                      <p className="text-slate-700 font-semibold leading-normal">
                        <span className="font-bold text-slate-500">Rx:</span> {rec.prescription}
                      </p>
                      <p className="text-slate-450 font-semibold">Diagnosis: {rec.diagnosis}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default PatientDashboard;
