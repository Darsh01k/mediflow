import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

// Predefined city coordinates for fallback geocoding
const CITY_COORDINATES = {
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'rajkot': { lat: 22.3039, lng: 70.8022 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.7041, lng: 77.1025 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'gandhinagar': { lat: 23.2156, lng: 72.6369 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
};

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const { user } = useAuth();
  const [coords, setCoords] = useState(null);
  const [locationSource, setLocationSource] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle');
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const geoPendingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('userLocation');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lng) {
          setCoords({ lat: parsed.lat, lng: parsed.lng });
          setLocationSource(parsed.source || 'city');
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  const safeSetCoords = useCallback((c) => { if (mountedRef.current) setCoords(c); }, []);
  const safeSetLocationSource = useCallback((s) => { if (mountedRef.current) setLocationSource(s); }, []);
  const safeSetGeoStatus = useCallback((s) => { if (mountedRef.current) setGeoStatus(s); }, []);
  const safeSetError = useCallback((e) => { if (mountedRef.current) setError(e); }, []);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      safeSetGeoStatus('unavailable');
      safeSetError('Geolocation is not supported by your browser.');
      return;
    }

    if (geoPendingRef.current) return;

    safeSetGeoStatus('requesting');
    safeSetError(null);
    geoPendingRef.current = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mountedRef.current) return;
        geoPendingRef.current = false;
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoords(newCoords);
        setLocationSource('gps');
        setGeoStatus('granted');
        localStorage.setItem('userLocation', JSON.stringify({ ...newCoords, source: 'gps' }));
      },
      (err) => {
        if (!mountedRef.current) return;
        geoPendingRef.current = false;
        console.warn('Geolocation denied or failed:', err.message);
        setGeoStatus('denied');
        setError('Location permission denied.');
        fallbackToCityRef.current?.();
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  const fallbackToCity = useCallback(() => {
    if (user?.city) {
      const cityKey = user.city.toLowerCase().trim();
      const cityCoords = CITY_COORDINATES[cityKey];
      if (cityCoords) {
        safeSetCoords(cityCoords);
        safeSetLocationSource('city');
        localStorage.setItem('userLocation', JSON.stringify({ ...cityCoords, source: 'city' }));
        return;
      }
    }
    safeSetLocationSource(null);
  }, [user]);

  const fallbackToCityRef = useRef(fallbackToCity);
  fallbackToCityRef.current = fallbackToCity;

  useEffect(() => {
    if (!user) return;
    if (coords) return;
    if (user?.city) {
      fallbackToCity();
    }
    requestGeolocation();
  }, [user]);

  const refreshLocation = useCallback(() => {
    geoPendingRef.current = false;
    requestGeolocation();
  }, [requestGeolocation]);

  return (
    <LocationContext.Provider value={{
      coords,
      locationSource,
      geoStatus,
      error,
      refreshLocation,
      CITY_COORDINATES,
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation2 = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation2 must be used within a LocationProvider');
  }
  return context;
};

/**
 * Format a distance value (in km) for display.
 * Shows meters if < 1 km, otherwise km with appropriate decimals.
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined) return null;
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }
  return `${Math.round(distanceKm)} km`;
};
