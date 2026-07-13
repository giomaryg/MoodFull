import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function LocationAutocomplete({ 
  onLocationSelect, 
  placeholder = "Address or ZIP code", 
  className = "",
  icon: Icon = MapPin,
  value: externalValue,
  onChange: externalOnChange
}) {
  const [inputValue, setInputValue] = useState(externalValue || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (externalValue !== undefined && externalValue !== inputValue) {
      setInputValue(externalValue);
    }
  }, [externalValue]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!inputValue || inputValue.length < 3 || !showSuggestions) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&limit=5&addressdetails=1`);
        const data = await res.json();
        
        const uniqueSet = new Set();
        const formatted = [];
        for (const item of data) {
          const addr = item.address || {};
          const houseNumber = addr.house_number;
          const road = addr.road;
          const streetPart = [houseNumber, road].filter(Boolean).join(' ');
          
          const city = addr.city || addr.town || addr.village || addr.municipality;
          const state = addr.state;
          const zip = addr.postcode;
          const country = addr.country;

          let firstPart = streetPart;
          if (!firstPart && item.name && item.name !== city && item.name !== state && item.name !== country) {
              firstPart = item.name;
          }

          const parts = [firstPart, city, state, zip, country].filter(Boolean);
          const uniqueParts = [...new Set(parts)];
          const label = uniqueParts.join(', ');
          
          if (!uniqueSet.has(label)) {
            uniqueSet.add(label);
            formatted.push({ ...item, label });
          }
        }
        setSuggestions(formatted);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timeoutId);
  }, [inputValue, showSuggestions]);

  return (
    <div className="relative w-full">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      <Input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
          if (externalOnChange) externalOnChange(e.target.value);
        }}
        onFocus={() => {
          if (inputValue && inputValue.length >= 3) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && inputValue.length > 3) {
            e.preventDefault();
            setShowSuggestions(false);
            if (suggestions.length > 0) {
              const bestMatch = suggestions[0];
              setInputValue(bestMatch.label);
              if (externalOnChange) externalOnChange(bestMatch.label);
              onLocationSelect(parseFloat(bestMatch.lat), parseFloat(bestMatch.lon), bestMatch.label);
            } else {
              fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}`)
                .then(res => res.json())
                .then(data => {
                  if (data && data.length > 0) {
                    onLocationSelect(parseFloat(data[0].lat), parseFloat(data[0].lon), inputValue);
                  } else {
                    toast.error("Location not found");
                  }
                }).catch(() => toast.error("Error finding location"));
            }
          }
        }}
        placeholder={placeholder}
        className={`pl-12 ${className}`}
      />
      
      {isSearching && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
           <div className="w-4 h-4 border-2 border-[#A29BE3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[500] max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={`${suggestion.place_id}-${idx}`}
              onMouseDown={(e) => {
                 e.preventDefault();
                 setInputValue(suggestion.label);
                 if (externalOnChange) externalOnChange(suggestion.label);
                 setShowSuggestions(false);
                 onLocationSelect(parseFloat(suggestion.lat), parseFloat(suggestion.lon), suggestion.label);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm border-b border-gray-50 last:border-0 transition-colors flex items-center gap-3"
            >
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">{suggestion.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}