import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader } from 'lucide-react';

const AddressAutocomplete = ({ 
  value = '', 
  onChange, 
  onSelect, 
  placeholder = 'Start typing address...', 
  className = '', 
  required = false,
  disabled = false
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    if (!query || query.length < 3 || !showDropdown) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'MediFlow-App/1.0 (contact@mediflow.com)'
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Geocoding suggestions fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query, showDropdown]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) {
      onChange(val);
    }
    setShowDropdown(true);
  };

  const handleSelectSuggestion = (item) => {
    const addressDetails = item.address || {};
    const fullAddress = item.display_name;
    const lat = item.lat;
    const lon = item.lon;

    // Resolve city
    const city = addressDetails.city || 
                 addressDetails.town || 
                 addressDetails.village || 
                 addressDetails.suburb || 
                 addressDetails.county || 
                 '';
    
    const state = addressDetails.state || '';
    const pincode = addressDetails.postcode || '';

    setQuery(fullAddress);
    setShowDropdown(false);

    if (onSelect) {
      onSelect({
        address: fullAddress,
        city,
        state,
        pincode,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      });
    }
  };

  return (
    <div className="relative w-full text-xs font-semibold text-slate-600" ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <textarea
          rows="2"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          className={`w-full pl-10 pr-10 py-2.5 border rounded-xl transition-all focus:outline-none text-sm font-medium resize-none ${
            className.includes('bg-') ? '' : 'bg-white'
          } ${
            className.includes('text-') ? '' : 'text-slate-800'
          } ${
            className.includes('placeholder-') ? '' : 'placeholder-slate-400'
          } ${
            className.includes('border-') ? '' : 'border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 hover:border-slate-300'
          } ${className}`}
        />
        {loading && (
          <div className="absolute right-3.5 top-3.5 text-slate-400">
            <Loader className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>

      {showDropdown && (suggestions.length > 0 || loading) && (
        <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          {loading && suggestions.length === 0 ? (
            <div className="p-3.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Searching locations...
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {suggestions.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-800/80 transition-colors flex items-start gap-2.5 text-slate-200 font-medium text-xs cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
