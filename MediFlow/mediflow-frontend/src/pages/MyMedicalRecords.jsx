import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { FileText, Calendar, User, HeartPulse, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const MyMedicalRecords = () => {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await API.get('/medical-records/my-records');
        setRecords(response.data);
      } catch (err) {
        setError('Failed to load clinical records history.');
        toast.error('Failed to load medical records');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [toast]);

  if (loading) {
    return (
      <div className="h-[55vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-slate-500 text-xs font-semibold">Retrieving clinical charts history...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Clinical Charts</CardTitle>
        <CardDescription>Review diagnostic histories and prescriptions</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-6 bg-rose-50/50 border border-rose-200/50 text-rose-600 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {records.length === 0 ? (
          <EmptyState
            title="No medical records found"
            description="There are no active clinical charts or prescriptions registered under your profile."
            icon={FileText}
          />
        ) : (
          <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-8">
            {records.map((rec) => (
              <div key={rec.id} className="relative space-y-3">
                {/* Timeline marker */}
                <span className="absolute -left-[35px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-4 ring-emerald-500/10 flex items-center justify-center">
                  <HeartPulse className="w-2 h-2 text-white shrink-0" />
                </span>

                {/* Card content */}
                <Card className="bg-slate-50/50 hover:bg-slate-50/80 border-slate-200/55 transition-colors">
                  <CardHeader className="flex-row items-start md:items-center justify-between gap-2 border-b-0 pb-1 space-y-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Dr. {rec.doctor.user.firstName} {rec.doctor.user.lastName}
                      </span>
                      <Badge variant="primary">{rec.doctor.specialization}</Badge>
                      {rec.doctor?.hospital && (
                        <div className="w-full md:w-auto text-[10px] font-semibold text-slate-400 mt-1 md:mt-0 md:ml-2">
                          Hospital: {rec.doctor.hospital.name} ({rec.doctor.hospital.city}) • Address: {rec.doctor.hospital.address} • Ph: {rec.doctor.hospital.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Consultation Date: {rec.visitDate}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {/* Diagnosis */}
                      <div className="space-y-1.5">
                        <h5 className="font-bold text-slate-500 uppercase tracking-wide">Diagnosis / Clinical Summary</h5>
                        <p className="p-3 bg-white border border-slate-200/60 rounded-xl text-slate-800 leading-relaxed font-semibold shadow-sm">
                          {rec.diagnosis}
                        </p>
                      </div>

                      {/* Prescription */}
                      <div className="space-y-1.5">
                        <h5 className="font-bold text-slate-500 uppercase tracking-wide">Prescribed Treatment / Medication</h5>
                        <p className="p-3 bg-white border border-slate-200/60 rounded-xl text-slate-800 leading-relaxed font-mono font-medium shadow-sm">
                          {rec.prescription}
                        </p>
                      </div>
                    </div>

                    {/* Treatment notes if they exist */}
                    {rec.treatmentNotes && (
                      <div className="text-xs space-y-1.5 border-t border-slate-100 pt-3">
                        <h5 className="font-bold text-slate-400 uppercase tracking-wide">Doctor's Clinical Notes</h5>
                        <p className="text-slate-600 italic font-semibold leading-relaxed">
                          "{rec.treatmentNotes}"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyMedicalRecords;
