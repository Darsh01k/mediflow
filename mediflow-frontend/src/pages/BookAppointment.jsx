import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import { HealthAvatar } from '../components/ui/Avatar';
import { 
  Calendar, 
  User, 
  Stethoscope, 
  DollarSign, 
  FileQuestion,
  Hospital
} from 'lucide-react';

const BookAppointment = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const queryDoctorId = searchParams.get('doctorId');

  const isInitialPreselect = useRef(false);

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(queryDoctorId || '');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const hospRes = await API.get('/hospitals');
        setHospitals(hospRes.data);

        if (queryDoctorId) {
          const docRes = await API.get(`/doctors/${queryDoctorId}`);
          const doctor = docRes.data;
          if (doctor && doctor.hospital) {
            isInitialPreselect.current = true;
            setSelectedHospitalId(doctor.hospital.id.toString());
            // Fetch doctors and specializations for this hospital
            const docsRes = await API.get(`/doctors/hospital/${doctor.hospital.id}`);
            const specsRes = await API.get(`/doctors/hospital/${doctor.hospital.id}/specializations`);
            setDoctors(docsRes.data);
            setSpecializations(specsRes.data);
            setSelectedSpecialization(doctor.specialization);
            setSelectedDoctorId(queryDoctorId);
          }
        }
      } catch (err) {
        console.error("Failed to load initial data for booking:", err);
        setError(`Failed to load initial data: ${err.response?.data?.message || err.message || 'Please try again.'}`);
      } finally {
        setFetching(false);
      }
    };
    loadInitialData();
  }, [queryDoctorId]);

  useEffect(() => {
    if (!selectedHospitalId) {
      setDoctors([]);
      setSpecializations([]);
      setSelectedSpecialization('');
      setSelectedDoctorId('');
      return;
    }

    if (isInitialPreselect.current) {
      isInitialPreselect.current = false;
      return;
    }

    const loadHospitalData = async () => {
      try {
        setLoading(true);
        const docsRes = await API.get(`/doctors/hospital/${selectedHospitalId}`);
        setDoctors(docsRes.data);
        
        const specsRes = await API.get(`/doctors/hospital/${selectedHospitalId}/specializations`);
        setSpecializations(specsRes.data);
      } catch (err) {
        console.error("Failed to load hospital data:", err);
        setError(`Failed to load doctors for the selected hospital: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    setSelectedDoctorId('');
    setSelectedSpecialization('');
    loadHospitalData();
  }, [selectedHospitalId]);

  const filteredDoctors = selectedSpecialization 
    ? doctors.filter(doc => doc.specialization === selectedSpecialization)
    : doctors;

  const selectedDoctorDetails = doctors.find(doc => doc.id === parseInt(selectedDoctorId));

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctorId || !appointmentDate || !reason) {
      setError('Please fill in all required scheduling details');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        patientId: user.profileId,
        doctorId: parseInt(selectedDoctorId),
        appointmentDate: new Date(appointmentDate).toISOString().slice(0, 19),
        reason,
        notes
      };

      await API.post('/appointments', payload);
      toast.success('Consultation booked successfully!');
      setTimeout(() => {
        navigate('/appointments');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-slate-500 text-xs font-semibold">Loading clinics and doctors directories...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto border-slate-200/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b">
        <CardTitle>Schedule Consultation</CardTitle>
        <CardDescription>Book your clinical appointment in three quick steps</CardDescription>
      </CardHeader>

      <CardContent className="p-8">
        {error && (
          <Alert variant="danger" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleBook} className="space-y-6 text-xs font-medium text-slate-600">
          {/* Step 1: Hospital Select and Filters */}
          <div className="space-y-4">
            <Select
              label="1. Select Hospital / Clinic"
              id="hospital"
              required
              icon={Hospital}
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="bg-white"
            >
              <option value="">Choose a Hospital...</option>
              {hospitals.map(hosp => (
                <option key={hosp.id} value={hosp.id}>{hosp.name} ({hosp.city})</option>
              ))}
            </Select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="2. Filter by Specialization"
                id="specialization"
                icon={Stethoscope}
                value={selectedSpecialization}
                onChange={(e) => {
                  setSelectedSpecialization(e.target.value);
                  setSelectedDoctorId(''); // Reset doctor select
                }}
                disabled={!selectedHospitalId}
                className="bg-white"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </Select>

              <Select
                label="3. Select Practitioner"
                id="doctor"
                required
                icon={User}
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                disabled={!selectedHospitalId}
                className="bg-white"
              >
                <option value="">Choose a Doctor...</option>
                {filteredDoctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.user.firstName} {doc.user.lastName} ({doc.specialization})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Doctor Details Summary Card */}
          {selectedDoctorDetails && (
            <div className="p-5 bg-slate-50 border border-slate-200/50 rounded-xl space-y-4 hover:bg-slate-50/80 transition-colors animate-in fade-in duration-200">
              {/* Doctor Details Section */}
              <div className="flex items-start gap-4">
                <HealthAvatar avatarId={selectedDoctorDetails.user.avatarId || 'doctor_1'} className="w-12 h-12 rounded-full" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">
                    Dr. {selectedDoctorDetails.user.firstName} {selectedDoctorDetails.user.lastName}
                  </h4>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{selectedDoctorDetails.specialization}</p>
                  
                  {selectedDoctorDetails.qualification && (
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Qualification: <span className="text-slate-700 font-bold">{selectedDoctorDetails.qualification}</span>
                    </p>
                  )}
                  {selectedDoctorDetails.experience !== undefined && (
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Experience: <span className="text-slate-700 font-bold">{selectedDoctorDetails.experience} Years</span>
                    </p>
                  )}
                  
                  {selectedDoctorDetails.bio && <p className="text-[10px] text-slate-500 italic mt-1 font-semibold leading-normal">"{selectedDoctorDetails.bio}"</p>}
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
                    <DollarSign className="w-4 h-4 shrink-0" />
                    <span>Consultation Fee: ${selectedDoctorDetails.consultationFee}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-slate-200/60" />

              {/* Hospital Details Section */}
              {selectedDoctorDetails.hospital && (
                <div className="flex items-start gap-4">
                  <HealthAvatar avatarId={selectedDoctorDetails.hospital.logoAvatar || 'hospital_1'} className="w-12 h-12 rounded-xl" />
                  <div className="space-y-1 text-slate-600 font-medium">
                    <h4 className="font-bold text-slate-800 text-xs">
                      {selectedDoctorDetails.hospital.name}
                    </h4>
                    <p className="text-[11px] text-slate-550 leading-normal font-semibold">
                      Address: <span className="text-slate-700 font-bold">{selectedDoctorDetails.hospital.address}</span>
                    </p>
                    {selectedDoctorDetails.hospital.phone && (
                      <p className="text-[11px] text-slate-550 font-semibold">
                        Phone: <span className="text-slate-700 font-bold">{selectedDoctorDetails.hospital.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Schedule Date/Time */}
          <Input
            label="4. Choose Appointment Date & Time"
            id="appointmentDate"
            type="datetime-local"
            required
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            icon={Calendar}
            className="bg-white"
          />

          {/* Step 3: Clinical Reason */}
          <div className="space-y-4">
            <div className="space-y-1.5 text-xs font-semibold text-slate-600">
              <label htmlFor="reason" className="block font-bold text-slate-500 uppercase tracking-wide">Reason for Consultation</label>
              <div className="relative">
                <FileQuestion className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  id="reason"
                  required
                  rows="2"
                  placeholder="e.g. Regular cardiac check-up / High fever and cough since yesterday."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 text-slate-800 bg-white placeholder-slate-400 text-sm font-medium resize-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-semibold text-slate-600">
              <label htmlFor="notes" className="block font-bold text-slate-500 uppercase tracking-wide">Additional Notes (Optional)</label>
              <textarea
                id="notes"
                rows="2"
                placeholder="List any drug allergies, active treatments or special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 text-slate-800 bg-white placeholder-slate-400 text-sm font-medium resize-none"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Book Appointment
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
};

export default BookAppointment;
