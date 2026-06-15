import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useLocation2, formatDistance } from '../context/LocationContext';
import { formatINR } from '../utils/currency';
import { HealthAvatar } from '../components/ui/Avatar';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { 
  Search, 
  MapPin, 
  Phone, 
  Users, 
  Layers, 
  Info,
  X,
  Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HospitalSearch = () => {
  const navigate = useNavigate();
  const { coords } = useLocation2();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [specialty, setSpecialty] = useState('');
  
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // View Doctors Modal state
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [modalDoctors, setModalDoctors] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (coords?.lat) params.append('lat', coords.lat);
      if (coords?.lng) params.append('lng', coords.lng);
      const response = await API.get(`/hospitals/search?${params.toString()}`);
      setHospitals(response.data);
    } catch (err) {
      setError('Failed to fetch hospital records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (name) params.append('name', name);
      if (city) params.append('city', city);
      if (state) params.append('state', state);
      if (specialty) params.append('specialty', specialty);
      if (coords?.lat) params.append('lat', coords.lat);
      if (coords?.lng) params.append('lng', coords.lng);

      const response = await API.get(`/hospitals/search?${params.toString()}`);
      setHospitals(response.data);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setName('');
    setCity('');
    setState('');
    setSpecialty('');
    loadHospitals();
  };

  const openDoctorsModal = async (hosp) => {
    setSelectedHospital(hosp);
    setModalLoading(true);
    try {
      // Find doctors belonging to this hospital
      const response = await API.get(`/doctors/search?hospital=${encodeURIComponent(hosp.name)}`);
      setModalDoctors(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Hospital Registry</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">Locate modern healthcare clinics and multi-specialty hospitals</p>
      </div>

      {/* Advanced Filter Form */}
      <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/70 backdrop-blur-md">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4 text-xs font-semibold text-slate-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Hospital Name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saint Grace Clinic"
                icon={Search}
                className="bg-white"
              />

              <Input
                label="City"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Boston"
                icon={MapPin}
                className="bg-white"
              />

              <Input
                label="State"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Massachusetts"
                icon={MapPin}
                className="bg-white"
              />

              <Input
                label="Available Specialty"
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Cardiology"
                icon={Stethoscope}
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
          <p className="text-slate-500 text-xs font-semibold">Filtering hospitals...</p>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <p className="text-slate-500 font-bold text-sm">No hospitals matched your search criteria.</p>
          <button onClick={handleClear} className="text-emerald-500 hover:text-emerald-600 font-bold text-xs mt-2 underline cursor-pointer">
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hosp) => (
            <Card key={hosp.id} className="border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-350 overflow-hidden bg-white flex flex-col justify-between group">
              <CardContent className="p-6 space-y-4">
                {/* Header Profile */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                    {hosp.logoAvatar ? (
                      <HealthAvatar avatarId={hosp.logoAvatar} className="w-12 h-12 rounded-xl" />
                    ) : (
                      <Layers className="w-6 h-6 text-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-800 text-sm truncate group-hover:text-emerald-600 transition-colors">
                      {hosp.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                      <span className="truncate">{hosp.city}, {hosp.state}</span>
                    </p>
                    {hosp.phone && (
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                        <span>{hosp.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Body Details */}
                <div className="space-y-1 text-xs font-semibold text-slate-600">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Address</p>
                  <p className="text-slate-700 leading-normal text-[11px] font-medium">{hosp.address}, {hosp.pincode}</p>
                </div>

                {hosp.description && (
                  <p className="text-[10px] text-slate-400 font-bold line-clamp-2 italic leading-relaxed">
                    "{hosp.description}"
                  </p>
                )}
              </CardContent>

              {/* Action Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-emerald-600 flex items-center gap-1">
                    <Users className="w-4 h-4 shrink-0" />
                    <span>{hosp.doctorCount || 0} Doctors</span>
                  </span>
                  {hosp.distance !== null && hosp.distance !== undefined && (
                    <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{formatDistance(hosp.distance)}</span>
                    </span>
                  )}
                </div>
                <Button 
                  onClick={() => openDoctorsModal(hosp)}
                  variant="primary" 
                  size="sm"
                  className="rounded-lg from-emerald-600 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 hover:scale-[1.01] text-white font-semibold text-xs py-1.5 px-3.5 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="flex items-center gap-1">
                    View Doctors <span className="text-xs font-light">→</span>
                  </span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Doctors Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Doctors at {selectedHospital.name}</h3>
                <p className="text-[10px] text-slate-400 font-semibold">{selectedHospital.city}, {selectedHospital.state}</p>
              </div>
              <button 
                onClick={() => setSelectedHospital(null)}
                className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {modalLoading ? (
                <div className="h-40 flex flex-col items-center justify-center gap-3">
                  <Spinner size="md" />
                  <p className="text-slate-400 text-xs font-semibold">Fetching doctor listings...</p>
                </div>
              ) : modalDoctors.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  <p className="text-slate-500 font-bold text-xs">No active doctors associated with this hospital.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {modalDoctors.map(doc => (
                    <div key={doc.id} className="p-4 border border-slate-200/60 rounded-xl bg-white flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                      <HealthAvatar avatarId={doc.user.avatarId || 'avatar_1'} className="w-10 h-10 rounded-full" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="font-bold text-slate-800 text-xs truncate">
                          Dr. {doc.user.firstName} {doc.user.lastName}
                        </h4>
                        <p className="text-[10px] text-emerald-600 font-bold">{doc.specialization}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">{doc.experience || 0} yrs exp • Fee: {formatINR(doc.consultationFee)}</p>
                        <button
                          onClick={() => {
                            setSelectedHospital(null);
                            navigate(`/book-appointment?doctorId=${doc.id}`);
                          }}
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 mt-2 transition-colors cursor-pointer"
                        >
                          <span>Book consultation</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <Button onClick={() => setSelectedHospital(null)} variant="secondary" size="sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalSearch;
