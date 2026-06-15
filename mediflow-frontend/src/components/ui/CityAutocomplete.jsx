import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { indianCities } from '../../data/indianCities';

const CityAutocomplete = ({ 
  value = '', 
  onChange, 
  placeholder = 'Search City, District, or Alias...', 
  disabled = false,
  required = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (onChange) {
      onChange({ city: val, state: '', country: 'India' });
    }

    if (!val || val.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    const query = val.toLowerCase().trim();
    // Search in city, district, state, and aliases
    const filtered = indianCities.filter(item => {
      return (
        item.city.toLowerCase().includes(query) ||
        item.district.toLowerCase().includes(query) ||
        item.state.toLowerCase().includes(query) ||
        item.aliases.some(alias => alias.toLowerCase().includes(query))
      );
    });

    setSuggestions(filtered.slice(0, 10)); // Limit to top 10 results
    setShowDropdown(true);
  };

  const handleSelect = (item) => {
    const displayVal = `${item.city}, ${item.state}, ${item.country}`;
    setInputValue(displayVal);
    setShowDropdown(false);
    
    if (onChange) {
      onChange({
        city: item.city,
        state: item.state,
        country: item.country
      });
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (inputValue && inputValue.trim().length > 0) {
              setShowDropdown(true);
            }
          }}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300 transition-all duration-200"
        />
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
          {suggestions.map((item, idx) => (
            <button
              key={`${item.city}-${idx}`}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full px-4 py-2.5 text-left hover:bg-indigo-50/50 transition-colors flex items-center gap-2.5 text-slate-700 font-semibold text-xs cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">{item.city}</span>
                <span className="text-slate-400 font-medium">, {item.state}, {item.country}</span>
                {item.district && item.district.toLowerCase() !== item.city.toLowerCase() && (
                  <span className="text-[10px] text-slate-400 block font-normal italic">District: {item.district}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && inputValue && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 text-center text-xs font-bold text-slate-400">
          No matching Indian locations found
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
