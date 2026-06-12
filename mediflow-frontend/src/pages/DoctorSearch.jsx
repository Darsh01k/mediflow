import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { HealthAvatar } from '../components/ui/Avatar';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { 
  Search, 
  Stethoscope, 
  MapPin, 
  Award, 
  DollarSign, 
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

const DoctorSearch = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  const [city, setCity] = useState('');
  const [experience, setExperience] = useState('');
  const [specializations, setSpecializations] = useState([]);
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch initial specializations list & all doctors
  useEffect(() => {
    const loadFiltersAndDoctors = async () => {
      try {
        setLoading(true);
        const specsRes = await API.get('/doctors/specializations');
        setSpecializations(specsRes.data);
        
        const docsRes = await API.get('/doctors/search');
        setDoctors(docsRes.data);
      } catch (err) {
        setError('Failed to fetch doctor lists.');
      } finally {
        setLoading(false);
      }
    };
    loadFiltersAndDoctors();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (name) params.append('name', name);
      if (specialization) params.append('specialization', specialization);
      if (hospital) params.append('hospital', hospital);
      if (city) params.append('city', city);
      if (experience) params.append('experience', experience);

      const response = await API.get(`/doctors/search?${params.toString()}`);
      setDoctors(response.data);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setName('');
    setSpecialization('');
    setHospital('');
    setCity('');
    setExperience('');
    try {
      setLoading(true);
      const response = await API.get('/doctors/search');
      setDoctors(response.data);
    } catch (err) {
      setError('Failed to reload doctors list.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Practitioner Directory</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Search and connect with premium certified doctors</p>
        </div>
      </div>

      {/* Advanced Filter Form */}
      <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/70 backdrop-blur-md">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4 text-xs font-semibold text-slate-500">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Input
                label="Doctor Name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Smith"
                icon={Search}
                className="bg-white"
              />

              <Select
                label="Specialization"
                id="specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                icon={Stethoscope}
                className="bg-white text-slate-700"
              >
                <option value="">All Specialities</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </Select>

              <Input
                label="Hospital"
                id="hospital"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="e.g. Grace Clinic"
                icon={Layers}
                className="bg-white"
              />

              <Input
                label="City"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New York"
                icon={MapPin}
                className="bg-white"
              />

              <Input
                label="Min Experience (Years)"
                id="experience"
                type="number"
                min="0"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 5"
                icon={Award}
                className="bg-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleClear}>
                Clear
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={Search}>
                Apply Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {/* Grid of Results */}
      {loading ? (
        <div className="h-48 flex flex-col items-center justify-center gap-3">
          <Spinner size="md" />
          <p className="text-slate-500 text-xs font-semibold">Filtering practitioners...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <p className="text-slate-500 font-bold text-sm">No practitioners matched your search criteria.</p>
          <button onClick={handleClear} className="text-emerald-500 hover:text-emerald-600 font-bold text-xs mt-2 underline cursor-pointer">
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <Card key={doc.id} className="border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-350 overflow-hidden bg-white group flex flex-col justify-between">
              <CardContent className="p-6 space-y-4 flex-1">
                {/* Header Profile */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <HealthAvatar avatarId={doc.user.avatarId || 'avatar_1'} className="w-14 h-14" />
                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      doc.availability ? 'bg-emerald-500' : 'bg-slate-400'
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-800 text-sm truncate group-hover:text-emerald-600 transition-colors">
                      Dr. {doc.user.firstName} {doc.user.lastName}
                    </h3>
                    <p className="text-[11px] text-emerald-600 font-black flex items-center gap-1 mt-0.5">
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>{doc.specialization}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {doc.qualification || 'MBBS'} • {doc.experience || 0} years experience
                    </p>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Body Details */}
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  {doc.hospital && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.hospital.name} ({doc.hospital.city}, {doc.hospital.state})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Consultation Fee: <strong className="text-slate-800">${doc.consultationFee}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-500">Available: <strong className="text-slate-700">{doc.availability || 'Schedule on Booking'}</strong></span>
                  </div>
                </div>
              </CardContent>

              {/* Action Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  LIC: {doc.licenseNumber}
                </span>
                <Button 
                  onClick={() => navigate(`/book-appointment?doctorId=${doc.id}`)}
                  variant="primary" 
                  size="xs"
                  className="rounded-lg shadow-sm font-semibold flex items-center gap-1"
                >
                  <span>Book Appointment</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
