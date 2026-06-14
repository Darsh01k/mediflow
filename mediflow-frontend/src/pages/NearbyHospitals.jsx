import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useLocation2, formatDistance } from '../context/LocationContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { HealthAvatar } from '../components/ui/Avatar';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  Navigation2, 
  Search, 
  Map, 
  Compass,
  Users,
  Clock,
  DollarSign,
  Briefcase,
  GraduationCap,
  LocateFixed,
  Building2,
  RefreshCw,
  Satellite
} from 'lucide-react';

const NearbyHospitals = () => {
  const navigate = useNavigate();
  const { coords, locationSource, geoStatus, refreshLocation } = useLocation2();

  const [cityInput, setCityInput] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSource, setActiveSource] = useState(null); // 'gps' | 'city-search' | 'all'

  const [selectedHospitalForDoctors, setSelectedHospitalForDoctors] = useState(null);
  const [hospitalDoctors, setHospitalDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const handleViewDoctors = async (hosp) => {
    setSelectedHospitalForDoctors(hosp);
    setLoadingDoctors(true);
    try {
      const response = await API.get(`/doctors/hospital/${hosp.id}`);
      setHospitalDoctors(response.data);
    } catch (err) {
      console.error("Failed to load approved doctors", err);
      setHospitalDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // On mount or when coords change from LocationContext, auto-fetch nearby
  useEffect(() => {
    if (coords && coords.lat && coords.lng) {
      fetchWithCoords(coords.lat, coords.lng);
      setActiveSource(locationSource === 'gps' ? 'gps' : 'city');
    } else {
      loadAllHospitals();
    }
  }, [coords]);

  const loadAllHospitals = async () => {
    setLoading(true);
    setError('');
    setActiveSource('all');
    try {
      const response = await API.get('/hospitals/search');
      setHospitals(response.data);
    } catch (err) {
      setError('Failed to load hospitals.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWithCoords = async (lat, lng) => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get(`/hospitals/search?lat=${lat}&lng=${lng}`);
      setHospitals(response.data);
    } catch (err) {
      setError('Failed to fetch nearby hospitals.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseGPS = () => {
    refreshLocation();
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    if (!cityInput.trim()) {
      setError('Please enter a city name.');
      return;
    }
    setActiveSource('city-search');
    fetchWithCity(cityInput.trim());
  };

  const fetchWithCity = async (cityName) => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get(`/hospitals/search?city=${encodeURIComponent(cityName)}`);
      setHospitals(response.data);
    } catch (err) {
      setError('Failed to search hospitals by city.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCityInput('');
    setError('');
    if (coords && coords.lat && coords.lng) {
      fetchWithCoords(coords.lat, coords.lng);
      setActiveSource(locationSource === 'gps' ? 'gps' : 'city');
    } else {
      loadAllHospitals();
    }
  };

  // Location source badge
  const LocationBadge = () => {
    if (activeSource === 'gps') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200 uppercase tracking-wider">
          <Satellite className="w-3 h-3" />
          GPS Location
        </div>
      );
    }
    if (activeSource === 'city' || activeSource === 'city-search') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold text-blue-700 bg-blue-50 rounded-full border border-blue-200 uppercase tracking-wider">
          <Building2 className="w-3 h-3" />
          City-Based
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Find Nearby Hospitals</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Locate active healthcare clinics closest to your current location</p>
        </div>
        <LocationBadge />
      </div>

      {/* Geolocation selector cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Location Button Card */}
        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-gradient-to-br from-emerald-50/40 to-teal-50/40">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-700 text-xs">GPS Geolocation</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Instantly retrieve hospitals closest to your exact coordinates</p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleUseGPS} 
                loading={geoStatus === 'requesting'}
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
              >
                <LocateFixed className="w-4 h-4" />
                <span>{geoStatus === 'requesting' ? 'Locating...' : 'Use Current Location'}</span>
              </Button>
              {geoStatus === 'denied' && (
                <p className="text-[10px] text-amber-600 font-semibold text-center">
                  Location denied — using your registered city as fallback
                </p>
              )}
              {geoStatus === 'granted' && coords && (
                <p className="text-[10px] text-emerald-600 font-semibold text-center">
                  📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* City Filter Card */}
        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/70">
          <CardContent className="p-6">
            <form onSubmit={handleCitySearch} className="space-y-4 text-xs font-semibold text-slate-500">
              <Input
                label="Search by City"
                id="city"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="e.g. Ahmedabad, Mumbai, Surat"
                icon={MapPin}
                className="bg-white"
              />
              <div className="flex justify-end gap-3 pt-1">
                {(cityInput || activeSource === 'city-search') && (
                  <Button type="button" variant="secondary" size="sm" onClick={handleClear}>
                    Clear
                  </Button>
                )}
                <Button type="submit" variant="primary" size="sm" icon={Search}>
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {activeSource === 'gps' && coords && (
        <Alert variant="success" title="GPS Location Active">
          Showing hospitals sorted by distance from your GPS coordinates: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </Alert>
      )}

      {activeSource === 'city' && (
        <Alert variant="info" title="City Fallback Active">
          Showing hospitals sorted by distance from your registered city location.
        </Alert>
      )}

      {/* Hospital List Display */}
      {loading ? (
        <div className="h-48 flex flex-col items-center justify-center gap-3">
          <Spinner size="md" />
          <p className="text-slate-500 text-xs font-semibold">Calculating nearby distances...</p>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <p className="text-slate-500 font-bold text-sm">No clinics found in this area.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {hospitals.length} Hospital{hospitals.length !== 1 ? 's' : ''} Found
          </p>
          {hospitals.map((hosp) => (
            <Card key={hosp.id} className="border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                    {hosp.logoAvatar ? (
                      <HealthAvatar avatarId={hosp.logoAvatar} className="w-10 h-10 rounded-lg" />
                    ) : (
                      <MapPin className="w-6 h-6 text-emerald-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm">{hosp.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xl">
                      {hosp.address}, {hosp.city}, {hosp.state} - {hosp.pincode}
                    </p>
                    {hosp.phone && (
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 pt-0.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{hosp.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side Actions / Distances */}
                <div className="flex md:flex-col items-end justify-between md:justify-center gap-4 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 shrink-0">
                  {hosp.distance !== null && hosp.distance !== undefined ? (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Estimated Distance</span>
                      <p className="text-base font-black text-emerald-600 mt-0.5">
                        {formatDistance(hosp.distance)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Distance</span>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">
                        Use GPS or search a city
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto">
                    {hosp.latitude && hosp.longitude ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${hosp.latitude},${hosp.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg transition-colors border border-emerald-100 cursor-pointer w-full"
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>Open in Maps</span>
                      </a>
                    ) : (
                      <button 
                        disabled
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 rounded-lg border border-slate-150 cursor-not-allowed w-full"
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>No Coordinates</span>
                      </button>
                    )}

                    <Button
                      variant="primary"
                      size="xs"
                      icon={Users}
                      onClick={() => handleViewDoctors(hosp)}
                      className="w-full justify-center"
                    >
                      View Doctors
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Hospital Doctors View Modal */}
      {selectedHospitalForDoctors && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row justify-between items-center border-b pb-3 shrink-0">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">{selectedHospitalForDoctors.name}</CardTitle>
                <CardDescription className="text-xs font-semibold">Available Medical Practitioners & Booking</CardDescription>
              </div>
              <button 
                onClick={() => setSelectedHospitalForDoctors(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
              {/* Hospital Mini Header */}
              <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                <HealthAvatar avatarId={selectedHospitalForDoctors.logoAvatar || 'hospital_1'} className="w-16 h-16 rounded-xl border border-slate-200" />
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-800 text-sm">{selectedHospitalForDoctors.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{selectedHospitalForDoctors.address}, {selectedHospitalForDoctors.city}, {selectedHospitalForDoctors.state}</p>
                  {selectedHospitalForDoctors.phone && (
                    <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedHospitalForDoctors.phone}</span>
                    </p>
                  )}
                  {selectedHospitalForDoctors.distance !== null && selectedHospitalForDoctors.distance !== undefined && (
                    <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5">
                      <Navigation2 className="w-3.5 h-3.5" />
                      <span>{formatDistance(selectedHospitalForDoctors.distance)} away</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Doctors Section */}
              <div>
                <h4 className="text-[11px] font-black tracking-wider text-slate-400 uppercase mb-3">Approved Doctors</h4>
                {loadingDoctors ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-slate-200/60">
                    <Spinner />
                    <p className="text-xs text-slate-400 font-semibold text-center">Retrieving practitioners list...</p>
                  </div>
                ) : hospitalDoctors.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 border-dashed">
                    <p className="text-slate-500 font-bold text-xs">No approved doctors found in this hospital.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hospitalDoctors.map((doc) => (
                      <div key={doc.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all">
                        <div className="flex items-start gap-4">
                          <HealthAvatar avatarId={doc.user?.avatarId || 'doctor_1'} className="w-12 h-12 rounded-full border border-slate-200" />
                          <div className="space-y-1 text-xs">
                            <h5 className="font-bold text-slate-800">Dr. {doc.user?.firstName} {doc.user?.lastName}</h5>
                            <span className="inline-block text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{doc.specialization}</span>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 pt-1.5 font-semibold text-slate-500">
                              {doc.qualification && (
                                <p className="flex items-center gap-1">
                                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{doc.qualification}</span>
                                </p>
                              )}
                              {doc.experience !== undefined && (
                                <p className="flex items-center gap-1">
                                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{doc.experience} Years Exp</span>
                                </p>
                              )}
                              <p className="flex items-center gap-1 text-emerald-650">
                                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                                <span>Fee: ${doc.consultationFee}</span>
                              </p>
                              {doc.availability && (
                                <p className="col-span-1 md:col-span-2 flex items-start gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                  <span className="leading-relaxed">{doc.availability}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="shrink-0 flex items-center">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => navigate(`/book-appointment?doctorId=${doc.id}`)}
                            className="w-full sm:w-auto"
                          >
                            Book Appointment
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NearbyHospitals;
