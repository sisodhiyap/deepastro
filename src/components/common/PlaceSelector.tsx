import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Globe, Compass, ChevronDown, Check, Search, Sliders, X } from 'lucide-react';
import { PlaceItem, WORLD_PLACES, COUNTRIES, searchPlaces } from '../../constants/worldPlaces.js';

interface PlaceSelectorProps {
  value: string;
  latitude: string | number;
  longitude: string | number;
  timezone: string | number;
  onChange: (place: {
    birthPlace: string;
    latitude: string;
    longitude: string;
    timezone: string;
  }) => void;
  className?: string;
}

export const PlaceSelector: React.FC<PlaceSelectorProps> = ({
  value,
  latitude,
  longitude,
  timezone,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [selectedCountry, setSelectedCountry] = useState<string>('India');
  const [showManualCoordinates, setShowManualCoordinates] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value !== searchQuery) {
      setSearchQuery(value || '');
    }
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPlaces = searchPlaces(searchQuery, selectedCountry);

  const handleSelectPlace = (place: PlaceItem) => {
    const displayName = `${place.name}, ${place.state ? place.state + ', ' : ''}${place.country}`;
    setSearchQuery(displayName);
    onChange({
      birthPlace: displayName,
      latitude: place.lat.toString(),
      longitude: place.lng.toString(),
      timezone: place.tz.toString(),
    });
    setIsOpen(false);
  };

  const formatCoordinateDisplay = (lat: string | number, lng: string | number, tz: string | number) => {
    const latNum = parseFloat(lat?.toString() || '0');
    const lngNum = parseFloat(lng?.toString() || '0');
    const tzNum = parseFloat(tz?.toString() || '5.5');
    const latDir = latNum >= 0 ? 'N' : 'S';
    const lngDir = lngNum >= 0 ? 'E' : 'W';
    const tzSign = tzNum >= 0 ? '+' : '-';
    const absTz = Math.abs(tzNum);
    const tzHours = Math.floor(absTz).toString().padStart(2, '0');
    const tzMins = Math.round((absTz % 1) * 60).toString().padStart(2, '0');

    return {
      latStr: `${Math.abs(latNum).toFixed(4)}° ${latDir}`,
      lngStr: `${Math.abs(lngNum).toFixed(4)}° ${lngDir}`,
      tzStr: `UTC ${tzSign}${tzHours}:${tzMins}`,
    };
  };

  const coords = formatCoordinateDisplay(latitude, longitude, timezone);

  return (
    <div ref={containerRef} className={`space-y-2 relative ${className}`}>
      <label className="text-cosmic-muted block text-xs font-semibold flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          Birth City & Exact Location
        </span>
        <button
          type="button"
          onClick={() => setShowManualCoordinates(!showManualCoordinates)}
          className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition"
        >
          <Sliders className="w-3 h-3" />
          {showManualCoordinates ? 'Hide GPS Editor' : 'Fine-Tune GPS'}
        </button>
      </label>

      {/* Main Location Search Input & Country Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Country Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setIsOpen(true);
            }}
            className="w-full bg-[#1A1F2B] border border-[#2A3441] text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-400 cursor-pointer appearance-none pr-8 font-medium"
          >
            <option value="All Countries">🌍 All Countries</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c === 'India' ? '🇮🇳 India' : c === 'United States' ? '🇺🇸 United States' : c === 'United Kingdom' ? '🇬🇧 United Kingdom' : c === 'Canada' ? '🇨🇦 Canada' : c === 'Australia' ? '🇦🇺 Australia' : c === 'United Arab Emirates' ? '🇦🇪 UAE' : c}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* City Input with Dropdown trigger */}
        <div className="relative sm:col-span-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
                // Also update parent state for typing
                onChange({
                  birthPlace: e.target.value,
                  latitude: latitude.toString(),
                  longitude: longitude.toString(),
                  timezone: timezone.toString(),
                });
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Type city name (e.g., Varanasi, Mumbai, London)..."
              className="w-full bg-cosmic-card border border-cosmic-border rounded-xl pl-9 pr-8 py-2.5 text-xs text-cosmic-text focus:outline-none focus:border-cyan-400 placeholder-slate-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onChange({
                    birthPlace: '',
                    latitude: '',
                    longitude: '',
                    timezone: '5.5',
                  });
                }}
                className="text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown List */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 max-h-60 bg-[#111827] border border-cyan-500/40 rounded-xl shadow-2xl overflow-y-auto z-50 divide-y divide-[#2A3441]/60">
              <div className="p-2 bg-[#1A1F2B]/90 text-[10px] text-slate-400 flex items-center justify-between sticky top-0 backdrop-blur-md">
                <span>Select City from Database ({filteredPlaces.length} found)</span>
                <span className="text-cyan-400 font-mono">Exact Lat / Lng</span>
              </div>

              {filteredPlaces.length > 0 ? (
                filteredPlaces.slice(0, 50).map((p, idx) => (
                  <button
                    key={`${p.name}-${p.country}-${idx}`}
                    type="button"
                    onClick={() => handleSelectPlace(p)}
                    className="w-full p-2.5 text-left hover:bg-cyan-950/40 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-cyan-300">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.state ? `${p.state}, ` : ''}{p.country}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[10px] text-slate-400 group-hover:text-cyan-400 shrink-0">
                      <div>{Math.abs(p.lat).toFixed(2)}°{p.lat >= 0 ? 'N' : 'S'}, {Math.abs(p.lng).toFixed(2)}°{p.lng >= 0 ? 'E' : 'W'}</div>
                      <div className="text-slate-500 text-[9px]">TZ: {p.tz >= 0 ? `+${p.tz}` : p.tz}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  <span>No exact preset city found for "{searchQuery}". You can enter custom coordinates below.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Verified Geographic Coordinates Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-[#2A3441] text-slate-300">
          <span className="text-slate-500">Lat:</span>
          <span className="text-cyan-400 font-bold">{coords.latStr}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-[#2A3441] text-slate-300">
          <span className="text-slate-500">Lng:</span>
          <span className="text-cyan-400 font-bold">{coords.lngStr}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-[#2A3441] text-slate-300">
          <span className="text-slate-500">TZ:</span>
          <span className="text-emerald-400 font-bold">{coords.tzStr}</span>
        </div>
      </div>

      {/* Optional Manual GPS Coordinates Fine-Tuning */}
      {showManualCoordinates && (
        <div className="p-3 rounded-xl bg-[#1A1F2B]/60 border border-[#2A3441] space-y-2 mt-2 animate-fadeIn text-xs">
          <div className="text-[11px] font-semibold text-cyan-300 flex items-center justify-between">
            <span>Manual GPS Coordinates Override (Decimal Degrees)</span>
            <span className="text-[10px] text-slate-400 font-normal">For exact hospital / village location</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Latitude (Decimal)</label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => onChange({
                  birthPlace: value,
                  latitude: e.target.value,
                  longitude: longitude.toString(),
                  timezone: timezone.toString(),
                })}
                placeholder="28.6139"
                className="w-full bg-[#111827] border border-[#2A3441] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Longitude (Decimal)</label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => onChange({
                  birthPlace: value,
                  latitude: latitude.toString(),
                  longitude: e.target.value,
                  timezone: timezone.toString(),
                })}
                placeholder="77.2090"
                className="w-full bg-[#111827] border border-[#2A3441] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Timezone (Hours from UTC)</label>
              <input
                type="number"
                step="0.25"
                value={timezone}
                onChange={(e) => onChange({
                  birthPlace: value,
                  latitude: latitude.toString(),
                  longitude: longitude.toString(),
                  timezone: e.target.value,
                })}
                placeholder="5.5"
                className="w-full bg-[#111827] border border-[#2A3441] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceSelector;
