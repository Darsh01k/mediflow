import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { HealthAvatar } from '../components/ui/Avatar';
import { 
  AlertOctagon, 
  PhoneCall, 
  MapPin, 
  Navigation, 
  Layers,
  HeartPulse,
  Flame,
  UserCheck
} from 'lucide-react';

const EmergencyHelp = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    // Attempt Geolocation immediately
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          fetchNearestHospitals(latitude, longitude);
        },
        (err) => {
          console.error(err);
          setError('Location access denied. Displaying general hospitals list.');
          fetchNearestHospitals(null, null);
        }
      );
    } else {
      setError('Geolocation not supported. Showing general hospitals list.');
      fetchNearestHospitals(null, null);
    }
  }, []);

  const fetchNearestHospitals = async (lat, lng) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (lat) params.append('lat', lat);
      if (lng) params.append('lng', lng);
      
      const response = await API.get(`/hospitals/search?${params.toString()}`);
      // Show only top 3 nearest hospitals for emergency quick-access
      setHospitals(response.data.slice(0, 3));
    } catch (err) {
      setError('Failed to fetch emergency hospitals directory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Prominent Emergency Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 md:p-8 text-white shadow-lg border border-red-500 shadow-red-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse-slow">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-8 h-8 text-white shrink-0 animate-bounce" />
            <h1 className="text-2xl font-black tracking-tight uppercase">Emergency SOS Mode</h1>
          </div>
          <p className="text-xs text-red-100 font-semibold leading-relaxed">
            Need urgent clinical care? Below are the closest hospitals and primary helplines. Dial instantly.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <a 
            href="tel:911" 
            className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 font-black px-5 py-3 rounded-xl shadow-md text-sm transition-transform active:scale-95 cursor-pointer border border-transparent"
          >
            <PhoneCall className="w-4 h-4 text-red-600" />
            <span>DIAL 911 / 112</span>
          </a>
        </div>
      </div>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {/* Helplines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border border-rose-100 rounded-xl bg-rose-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <HeartPulse className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ambulance SOS</h4>
            <a href="tel:102" className="text-sm font-black text-rose-600 hover:underline">Dial 102</a>
          </div>
        </div>

        <div className="p-4 border border-rose-100 rounded-xl bg-rose-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Medical Helpline</h4>
            <a href="tel:108" className="text-sm font-black text-rose-600 hover:underline">Dial 108 / 104</a>
          </div>
        </div>

        <div className="p-4 border border-rose-100 rounded-xl bg-rose-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fire Emergency</h4>
            <a href="tel:101" className="text-sm font-black text-rose-600 hover:underline">Dial 101</a>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
          <span>Nearest Medical Facilities</span>
          {coords && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded uppercase">Sorted by GPS</span>}
        </h2>

        {loading ? (
          <div className="h-40 flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-slate-200/60 shadow-sm">
            <Spinner size="md" />
            <p className="text-slate-400 text-xs font-semibold">Locating nearest clinics...</p>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500 font-bold text-xs">No local hospitals could be loaded.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hospitals.map((hosp, idx) => (
              <Card key={hosp.id} className="border-red-100/80 hover:border-red-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between relative">
                {idx === 0 && (
                  <span className="absolute top-3 right-3 text-[8px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white uppercase tracking-wider">
                    Closest
                  </span>
                )}
                <CardContent className="p-5 space-y-4 flex-1">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-800 text-sm truncate">{hosp.name}</h3>
                    {hosp.distance !== null && hosp.distance !== undefined ? (
                      <p className="text-xs font-black text-rose-600">{hosp.distance} km away</p>
                    ) : (
                      <p className="text-xs font-bold text-slate-400">Distance N/A</p>
                    )}
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-slate-600">
                    <div className="flex items-start gap-1.5 text-[11px] font-medium leading-relaxed text-slate-500">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{hosp.address}, {hosp.city}</span>
                    </div>

                    {hosp.phone && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                        <PhoneCall className="w-4 h-4 text-slate-400 shrink-0" />
                        <a href={`tel:${hosp.phone}`} className="text-emerald-600 hover:underline">{hosp.phone}</a>
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2 shrink-0">
                  {hosp.phone && (
                    <a 
                      href={`tel:${hosp.phone}`}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Hospital</span>
                    </a>
                  )}
                  {hosp.latitude && hosp.longitude && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${hosp.latitude},${hosp.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-sm cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-slate-400" />
                      <span>Open in Maps</span>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyHelp;
