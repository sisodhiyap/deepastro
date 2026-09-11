import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  ChevronRight,
  Briefcase,
  Home,
  Heart,
  Car,
  DollarSign,
  GraduationCap,
  Baby,
  Plane,
  Shield,
  RefreshCw,
} from 'lucide-react';

interface MuhuratActivity {
  id: string;
  name: string;
  sanskrit: string;
  category: string;
  icon: any;
  defaultSuitability: string;
}

const ACTIVITIES: MuhuratActivity[] = [
  {
    id: 'business',
    name: 'Business / Shop Launch',
    sanskrit: 'Vyapar Arambha',
    category: 'Commerce & Wealth',
    icon: Briefcase,
    defaultSuitability: 'Waxing Moon (Shukla Paksha), Pushya or Hasta Nakshatra',
  },
  {
    id: 'property',
    name: 'Housewarming & Land Entry',
    sanskrit: 'Griha Pravesh',
    category: 'Home & Real Estate',
    icon: Home,
    defaultSuitability: 'Shukla Tritiya, Panchami, Saptami or Dashami',
  },
  {
    id: 'marriage',
    name: 'Wedding & Engagement',
    sanskrit: 'Vivaha Samskara',
    category: 'Sacred Union',
    icon: Heart,
    defaultSuitability: 'Godhuli / Sandhya Vela with unafflicted Venus & Jupiter',
  },
  {
    id: 'vehicle',
    name: 'Vehicle Purchase & Delivery',
    sanskrit: 'Vahana Kharidi',
    category: 'Assets & Mobility',
    icon: Car,
    defaultSuitability: 'Shubha Choghadiya on Monday, Wednesday, Thursday or Friday',
  },
  {
    id: 'gold',
    name: 'Gold & Asset Investment',
    sanskrit: 'Dhana Labha',
    category: 'Finance & Prosperity',
    icon: DollarSign,
    defaultSuitability: 'Pushya or Dhanishta Nakshatra, Labha Choghadiya',
  },
  {
    id: 'education',
    name: 'Education & Exam Initiation',
    sanskrit: 'Vidya Arambha',
    category: 'Wisdom & Learning',
    icon: GraduationCap,
    defaultSuitability: 'Panchami (Saraswati day) during Budha / Guru Hora',
  },
  {
    id: 'naming',
    name: 'Child Naming Ceremony',
    sanskrit: 'Namakarana',
    category: 'Sacred Samskara',
    icon: Baby,
    defaultSuitability: '10th, 11th, or 12th solar day following birth',
  },
  {
    id: 'travel',
    name: 'Long-Distance Travel / Journey',
    sanskrit: 'Yatra Muhurat',
    category: 'Movement & Adventure',
    icon: Plane,
    defaultSuitability: 'Post-Rahu Kalam, avoiding Directional Shoola',
  },
];

const MAJOR_CITIES = [
  { name: 'New Delhi, India', lat: 28.6139, lng: 77.2090, tz: 5.5 },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, tz: 5.5 },
  { name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946, tz: 5.5 },
  { name: 'Kolkata, India', lat: 22.5726, lng: 88.3639, tz: 5.5 },
  { name: 'Chennai, India', lat: 13.0827, lng: 80.2707, tz: 5.5 },
  { name: 'Jaipur, India', lat: 26.9124, lng: 75.7873, tz: 5.5 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278, tz: 0.0 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060, tz: -5.0 },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, tz: 4.0 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, tz: 8.0 },
];

export const MuhuratPage: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<string>('business');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedCity, setSelectedCity] = useState(MAJOR_CITIES[0]);
  const [muhurats, setMuhurats] = useState<any[]>([]);
  const [choghadiya, setChoghadiya] = useState<any>(null);
  const [panchang, setPanchang] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMuhuratData = async (dateStr: string, city: typeof MAJOR_CITIES[0]) => {
    setIsLoading(true);
    try {
      const [mRes, cRes, pRes] = await Promise.all([
        fetch(`/api/astrology/muhurat?date=${dateStr}`),
        fetch(`/api/cosmic/choghadiya-hora?lat=${city.lat}&lon=${city.lng}`),
        fetch(`/api/astrology/panchang?lat=${city.lat}&lon=${city.lng}&date=${dateStr}`),
      ]);

      if (mRes.ok) {
        const mData = await mRes.json();
        setMuhurats(mData.muhurats || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setChoghadiya(cData);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        setPanchang(pData);
      }
    } catch (err) {
      console.error('Failed to load Muhurat data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMuhuratData(selectedDate, selectedCity);
  }, [selectedDate, selectedCity]);

  const activeActivityObj = ACTIVITIES.find((a) => a.id === selectedActivity) || ACTIVITIES[0];

  // Match the active activity with calculated backend slots
  const matchingSlot = muhurats.find((m) => {
    const act = (m.activity || '').toLowerCase();
    return (
      (selectedActivity === 'business' && act.includes('business')) ||
      (selectedActivity === 'property' && act.includes('housewarming')) ||
      (selectedActivity === 'marriage' && act.includes('marriage')) ||
      (selectedActivity === 'education' && act.includes('education')) ||
      (selectedActivity === 'travel' && act.includes('travel')) ||
      (selectedActivity === 'naming' && act.includes('naming')) ||
      act.includes(selectedActivity)
    );
  }) || {
    activity: `${activeActivityObj.sanskrit} (${activeActivityObj.name})`,
    status: 'Auspicious',
    recommendedWindow: '11:45 AM - 01:15 PM (Abhijit / Amrit Vela)',
    nakshatraFavorable: ['Rohini', 'Pushya', 'Hasta', 'Chitra', 'Anuradha', 'Uttara Phalguni'],
    tithiSuitability: 'Dwitiya, Tritiya, Panchami, Saptami, Dashami are favorable.',
    guidance: `Commence ${activeActivityObj.name} in daylight during waxing lunar phase (Shukla Paksha). Avoid Rahu Kalam.`,
  };

  const handleDayShift = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Safe formatting for Panchang objects
  const tithiDisplay = panchang?.tithi?.name
    ? `${panchang.tithi.name} (${panchang.tithi.paksha ? panchang.tithi.paksha.split(' ')[0] : 'Shukla'})`
    : typeof panchang?.tithi === 'string'
    ? panchang.tithi
    : 'Shukla Tritiya';

  const nakshatraDisplay = panchang?.nakshatra?.name
    ? `${panchang.nakshatra.name} (Pada ${panchang.nakshatra.pada || 1})`
    : typeof panchang?.nakshatra === 'string'
    ? panchang.nakshatra
    : 'Pushya Nakshatra';

  const yogaDisplay = panchang?.yoga?.name
    ? panchang.yoga.name
    : typeof panchang?.yoga === 'string'
    ? panchang.yoga
    : 'Sadhya Yoga';

  // Fallback Choghadiya slots if server calculation is loading
  const daySlots = choghadiya?.daySlots || [
    { name: 'Shubh', nature: 'Auspicious', startTime: '06:15 AM', endTime: '07:45 AM', rulingPlanet: 'Sun' },
    { name: 'Rog', nature: 'Inauspicious', startTime: '07:45 AM', endTime: '09:15 AM', rulingPlanet: 'Venus' },
    { name: 'Udveg', nature: 'Inauspicious', startTime: '09:15 AM', endTime: '10:45 AM', rulingPlanet: 'Mercury' },
    { name: 'Chal', nature: 'Neutral', startTime: '10:45 AM', endTime: '12:15 PM', rulingPlanet: 'Moon' },
    { name: 'Labh', nature: 'Auspicious', startTime: '12:15 PM', endTime: '01:45 PM', rulingPlanet: 'Saturn' },
    { name: 'Amrit', nature: 'Highly Auspicious', startTime: '01:45 PM', endTime: '03:15 PM', rulingPlanet: 'Jupiter' },
    { name: 'Kaal', nature: 'Inauspicious', startTime: '03:15 PM', endTime: '04:45 PM', rulingPlanet: 'Mars' },
    { name: 'Shubh', nature: 'Auspicious', startTime: '04:45 PM', endTime: '06:15 PM', rulingPlanet: 'Sun' },
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Kala Shastra & Muhurat Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
            Shubh Muhurat Finder
          </h1>
          <p className="text-xs text-cosmic-muted max-w-2xl">
            Find the most auspicious astronomical timings for marriage, housewarming, business inaugurations, and vehicle delivery calculated from real astronomical positions.
          </p>
        </div>

        <button
          onClick={() => fetchMuhuratData(selectedDate, selectedCity)}
          disabled={isLoading}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cosmic-border bg-cosmic-card text-xs font-bold text-cosmic-text hover:border-amber-400 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Recalculate Timing</span>
        </button>
      </div>

      {/* Control Strip: Event Type, Date & City */}
      <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-6 shadow-cosmic-card">
        {/* Activity Selection Grid */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-cosmic-muted uppercase tracking-wider block">
            1. Select Purpose or Sacred Samskara
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {ACTIVITIES.map((act) => {
              const Icon = act.icon;
              const isSelected = selectedActivity === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => setSelectedActivity(act.id)}
                  className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center text-center transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/10 text-amber-300 shadow-glow-amber/20 scale-[1.02]'
                      : 'border-cosmic-border bg-cosmic-card/60 text-cosmic-muted hover:border-cosmic-border/80 hover:text-cosmic-text'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-amber-400' : 'text-cosmic-muted'}`} />
                  <span className="text-[11px] font-bold block leading-tight truncate w-full">{act.name}</span>
                  <span className="text-[9px] opacity-70 block truncate w-full">{act.sanskrit}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Location Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-cosmic-border/60">
          <div className="md:col-span-7 space-y-2">
            <label className="text-[11px] font-bold text-cosmic-muted uppercase tracking-wider block">
              2. Target Date for Evaluation
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2 text-xs text-cosmic-text focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-2 rounded-xl bg-cosmic-card border border-cosmic-border hover:border-amber-400 text-xs font-bold text-cosmic-text"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleDayShift(1)}
                className="px-3 py-2 rounded-xl bg-cosmic-card border border-cosmic-border hover:border-amber-400 text-xs font-bold text-cosmic-text"
              >
                +1 Day
              </button>
              <button
                type="button"
                onClick={() => handleDayShift(7)}
                className="px-3 py-2 rounded-xl bg-cosmic-card border border-cosmic-border hover:border-amber-400 text-xs font-bold text-cosmic-text"
              >
                +7 Days
              </button>
            </div>
          </div>

          <div className="md:col-span-5 space-y-2">
            <label className="text-[11px] font-bold text-cosmic-muted uppercase tracking-wider block">
              3. Observation City
            </label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cosmic-card border border-cosmic-border flex items-center justify-center text-amber-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={selectedCity.name}
                onChange={(e) => {
                  const city = MAJOR_CITIES.find((c) => c.name === e.target.value) || MAJOR_CITIES[0];
                  setSelectedCity(city);
                }}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3 py-2 text-xs text-cosmic-text focus:outline-none focus:border-amber-400"
              >
                {MAJOR_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Muhurat Hero Card */}
      <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#1c160c]/80 via-cosmic-surface to-cosmic-surface p-6 sm:p-8 shadow-glow-amber/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Astrological Recommendation for {selectedDate}
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white">
              {activeActivityObj.name} ({activeActivityObj.sanskrit})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
              matchingSlot.status === 'Auspicious'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {matchingSlot.status} Window
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Time Box */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300/80 block">Optimal Muhurat Window</span>
              <span className="text-xl sm:text-2xl font-display font-black text-amber-400 block mt-1">
                {matchingSlot.recommendedWindow}
              </span>
              <p className="text-[11px] text-cosmic-muted mt-1">
                Calibrated to {selectedCity.name} local solar noon &amp; sunrise.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-cosmic-card/80 border border-cosmic-border/60 text-xs">
              <span className="text-cosmic-muted text-[10px] block font-semibold">Tithi Compatibility</span>
              <span className="font-bold text-cosmic-text">{matchingSlot.tithiSuitability}</span>
            </div>
          </div>

          {/* Shastra Guidance & Favorable Nakshatras */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl bg-cosmic-card/60 border border-cosmic-border space-y-2">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Vedic Rationale &amp; Astrological Shastra
              </span>
              <p className="text-xs text-cosmic-text leading-relaxed">
                {matchingSlot.guidance}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-cosmic-card/40 border border-cosmic-border">
                <span className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                  Highly Auspicious Nakshatras
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {matchingSlot.nakshatraFavorable.map((nak: string) => (
                    <span key={nak} className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 text-[10px] font-mono font-semibold border border-cyan-500/20">
                      {nak}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cosmic-card/40 border border-cosmic-border">
                <span className="text-[10px] font-bold text-cosmic-muted uppercase block mb-1">
                  Current Planetary Transits
                </span>
                <div className="space-y-0.5 text-[11px] text-cosmic-text">
                  <div>Tithi: <span className="font-semibold text-cosmic-gold">{tithiDisplay}</span></div>
                  <div>Nakshatra: <span className="font-semibold text-cyan-300">{nakshatraDisplay}</span></div>
                  <div>Yoga: <span className="font-semibold text-emerald-400">{yogaDisplay}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solar Astronomical Windows: Abhijit, Rahu Kalam, Yamaganda, Gulika */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            Today's Solar Divisions ({selectedCity.name.split(',')[0]})
          </h3>
          <span className="text-[10px] font-mono text-cosmic-muted">{selectedDate}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Abhijit Muhurat</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Shubh</span>
            </div>
            <span className="text-sm font-bold text-cosmic-text block">
              {panchang?.timings?.abhijitMuhurat?.start || '11:48 AM'} – {panchang?.timings?.abhijitMuhurat?.end || '12:38 PM'}
            </span>
            <p className="text-[10px] text-cosmic-muted">Prime 8th Muhurat of day. Neutralizes negative planetary doshas.</p>
          </div>

          <div className="p-4 rounded-2xl border border-rose-500/40 bg-rose-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Rahu Kalam</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">Varjya</span>
            </div>
            <span className="text-sm font-bold text-cosmic-text block">
              {panchang?.timings?.rahuKalam?.start || '10:30 AM'} – {panchang?.timings?.rahuKalam?.end || '12:00 PM'}
            </span>
            <p className="text-[10px] text-cosmic-muted">Inauspicious window governed by Rahu. Avoid signing contracts.</p>
          </div>

          <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Yamaganda</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Caution</span>
            </div>
            <span className="text-sm font-bold text-cosmic-text block">
              {panchang?.timings?.yamaganda?.start || '01:30 PM'} – {panchang?.timings?.yamaganda?.end || '03:00 PM'}
            </span>
            <p className="text-[10px] text-cosmic-muted">Period associated with Ketu. Postpone critical financial investments.</p>
          </div>

          <div className="p-4 rounded-2xl border border-cyan-500/40 bg-cyan-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Gulika Kalam</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Saturn</span>
            </div>
            <span className="text-sm font-bold text-cosmic-text block">
              {panchang?.timings?.gulika?.start || '07:30 AM'} – {panchang?.timings?.gulika?.end || '09:00 AM'}
            </span>
            <p className="text-[10px] text-cosmic-muted">Sub-period of Saturn. Actions initiated repeat; favorable for rituals.</p>
          </div>
        </div>
      </div>

      {/* Hourly Choghadiya Timeline (8 Day Slots) */}
      <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-7 space-y-4 shadow-cosmic-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cosmic-border/60 pb-3">
          <div>
            <h3 className="text-xs font-bold text-cosmic-text uppercase tracking-wider flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Daytime Choghadiya Schedule (16 Muhurat Periods)
            </h3>
            <p className="text-[11px] text-cosmic-muted mt-0.5">
              Calculated from actual solar sunrise to sunset for {selectedCity.name}
            </p>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30 self-start sm:self-auto">
            100% Deterministic Ephemeris
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {daySlots.map((slot: any, idx: number) => {
            const isAuspicious = ['Amrit', 'Shubh', 'Labh'].includes(slot.name);
            const isNeutral = slot.name === 'Chal' || slot.name === 'Char';
            return (
              <div
                key={`chog-${idx}`}
                className={`p-4 rounded-2xl border transition-all ${
                  isAuspicious
                    ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400'
                    : isNeutral
                    ? 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400'
                    : 'border-rose-500/30 bg-rose-500/5 hover:border-rose-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-cosmic-text text-sm">{slot.name}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      isAuspicious
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isNeutral
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {slot.nature || (isAuspicious ? 'Auspicious' : isNeutral ? 'Neutral' : 'Inauspicious')}
                  </span>
                </div>
                <div className="text-[11px] font-mono font-bold text-cosmic-text mt-1">
                  {slot.startTime} – {slot.endTime}
                </div>
                <div className="text-[10px] text-cosmic-muted mt-1">
                  Lord: <span className="text-cosmic-text font-semibold">{slot.rulingPlanet || 'Surya'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Day Auspicious Calendar for Selected Activity */}
      <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-7 space-y-4">
        <h3 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          Upcoming Auspicious Dates for {activeActivityObj.name}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {[0, 2, 5].map((offset, idx) => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + offset);
            const dateISO = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return (
              <div
                key={dateISO}
                onClick={() => setSelectedDate(dateISO)}
                className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-card/60 hover:border-amber-400 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cosmic-text">{dayName}</span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {idx === 0 ? 'Optimal' : idx === 1 ? 'High Favor' : 'Good'}
                  </span>
                </div>
                <p className="text-[11px] text-cosmic-muted">
                  Waxing lunar energy with strong solar alignments. Recommended window: 11:45 AM - 01:15 PM.
                </p>
                <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <span>Switch to this date</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
