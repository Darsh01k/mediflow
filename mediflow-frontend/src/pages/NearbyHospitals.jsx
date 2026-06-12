import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
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
  Compass
} from 'lucide-react';

const NearbyHospitals = () => {
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial load showing all hospitals
  useEffect(() => {
    loadAllHospitals();
  }, []);

  const loadAllHospitals = async () => {
    setLoading(true);
    try {
      const response = await API.get('/hospitals/search');
      setHospitals(response.data);
    } catch (err) {
      setError('Failed to load hospitals.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('HTML5 Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        fetchNearby(latitude, longitude, '');
      },
      (err) => {
        console.error(err);
        setError('Location permission denied. Please enter a city manually.');
        setGeoLoading(false);
      }
    );
  };

  const fetchNearby = async (lat, lng, cityName) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (lat) params.append('lat', lat);
      if (lng) params.append('lng', lng);
      if (cityName) params.append('city', cityName);

      const response = await API.get(`/hospitals/search?${params.toString()}`);
      setHospitals(response.data);
    } catch (err) {
      setError('Failed to calculate nearby distances.');
    } finally {
      setLoading(false);
      setGeoLoading(false);
    }
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    if (!city) {
      setError('Please type a city name.');
      return;
    }
    setCoords(null);
    fetchNearby(null, null, city);
  };

  const handleClear = () => {
    setCity('');
    setCoords(null);
    setError('');
    loadAllHospitals();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Find Nearby Hospitals</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">Locate active healthcare clinics closest to your current location</p>
      </div>

      {/* Geolocation selector cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Location Button Card */}
        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-gradient-to-br from-emerald-50/40 to-teal-50/40 backdrop-blur-md">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-700 text-xs">GPS Geolocation</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Instantly retrieve hospitals closest to your exact coordinates</p>
            </div>
            <div>
              <Button 
                onClick={handleUseCurrentLocation} 
                loading={geoLoading}
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 animate-spin-slow" />
                <span>Use Current Location</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* City Filter Card */}
        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/70 backdrop-blur-md">
          <CardContent className="p-6">
            <form onSubmit={handleCitySearch} className="space-y-4 text-xs font-semibold text-slate-500">
              <Input
                label="Search by City"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Los Angeles"
                icon={MapPin}
                className="bg-white"
              />
              <div className="flex justify-end gap-3 pt-1">
                {(city || coords) && (
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

      {coords && (
        <Alert variant="success" title="Location Retrieved">
          Showing hospitals sorted by distance from coordinates: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
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
                        {hosp.distance} km
                      </p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Distance</span>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">N/A</p>
                    </div>
                  )}

                  {hosp.latitude && hosp.longitude ? (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${hosp.latitude},${hosp.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg transition-colors border border-emerald-100 cursor-pointer"
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>Open in Maps</span>
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 rounded-lg border border-slate-150 cursor-not-allowed"
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>No Coordinates</span>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyHospitals;
