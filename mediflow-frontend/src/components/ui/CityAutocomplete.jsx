import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { indianCities } from '../../data/indianCities';

const CityAutocomplete = ({ 
  value = '', 
  onChange, 
  placeholder = 'Search City, District, or Alias...', 
  disabled = false,
  required = false
}) => {
  const [searchText, setSearchText] = useState(value || '');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Sync value from prop ONLY when the input is not focused
  useEffect(() => {
    if (!isFocused) {
      setSearchText(value || '');
    }
  }, [value, isFocused]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        setActiveSuggestionIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    setSelectedLocation(null);
    setActiveSuggestionIndex(-1);
    
    // Notify parent of typing changes immediately
    if (onChange) {
      onChange({ city: val, state: '', country: 'India' });
    }

    if (!val || val.trim().length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const query = val.toLowerCase().trim();
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
    setSearchText(displayVal);
    setSelectedLocation(item);
    setShowDropdown(false);
    setActiveSuggestionIndex(-1);
    
    if (onChange) {
      onChange({
        city: item.city,
        state: item.state,
        country: item.country
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showDropdown) {
        setShowDropdown(true);
      } else if (suggestions.length > 0) {
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showDropdown && suggestions.length > 0) {
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (showDropdown && activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[activeSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (searchText && searchText.trim().length > 0 && suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    // Timeout allows list click handlers to complete before dropdown hides
    setTimeout(() => {
      setIsFocused(false);
      setShowDropdown(false);
    }, 200);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={searchText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
              className={`w-full px-4 py-2.5 text-left hover:bg-indigo-50/50 transition-colors flex items-center gap-2.5 text-slate-700 font-semibold text-xs cursor-pointer ${
                activeSuggestionIndex === idx ? 'bg-indigo-50/80 text-indigo-700 font-bold' : ''
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">{item.city}</span>
                <span className="text-slate-400 font-medium">, {item.state}, {item.country}</span>
                {item.district && item.district.toLowerCase() !== item.city.toLowerCase() && (
                  <span className="text-[10px] text-slate-450 block font-normal italic">District: {item.district}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && searchText && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 text-center text-xs font-bold text-slate-400">
          No matching Indian locations found
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
