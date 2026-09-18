import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Sun,
  Moon,
  Briefcase,
  Heart,
  DollarSign,
  Activity,
  Users,
  Feather,
  ArrowRight,
  PlusCircle,
  Clock,
  Compass,
  MapPin,
  Flame,
  Hash,
  RefreshCw,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { NavTabId } from '../components/layout/Sidebar.js';
import { NorthIndianChart } from '../components/charts/NorthIndianChart.js';
import {
  getCalculatedChart,
  getBirthProfile,
  saveCalculatedChart,
  onChartUpdated,
  StoredBirthProfile,
} from '../utils/birthStorage.js';
import { useAstrologicalCalculation } from '../hooks/useAstrologicalCalculation.js';
import { CalculationProgressModal } from '../components/astrology/CalculationProgressModal.js';
import { generateDynamicLalKitabRemedies } from '../utils/lalKitabEngine.js';

interface DashboardPageProps {
  onNavigate: (tab: NavTabId) => void;
  userName?: string;
  chartContext?: any;
}

const CITY_COORDS: Record<string, { lat: number; lng: number; tz: number }> = {
  delhi: { lat: 28.6139, lng: 77.209, tz: 5.5 },
  'new delhi': { lat: 28.6139, lng: 77.209, tz: 5.5 },
  mumbai: { lat: 19.076, lng: 72.8777, tz: 5.5 },
  bombay: { lat: 19.076, lng: 72.8777, tz: 5.5 },
  bangalore: { lat: 12.9716, lng: 77.5946, tz: 5.5 },
  bengaluru: { lat: 12.9716, lng: 77.5946, tz: 5.5 },
  kolkata: { lat: 22.5726, lng: 88.3639, tz: 5.5 },
  chennai: { lat: 13.0827, lng: 80.2707, tz: 5.5 },
  hyderabad: { lat: 17.385, lng: 78.4867, tz: 5.5 },
  ahmedabad: { lat: 23.0225, lng: 72.5714, tz: 5.5 },
  pune: { lat: 18.5204, lng: 73.8567, tz: 5.5 },
  jaipur: { lat: 26.9124, lng: 75.7873, tz: 5.5 },
  lucknow: { lat: 26.8467, lng: 80.9462, tz: 5.5 },
  varanasi: { lat: 25.3176, lng: 82.9739, tz: 5.5 },
  patna: { lat: 25.5941, lng: 85.1376, tz: 5.5 },
  chandigarh: { lat: 30.7333, lng: 76.7794, tz: 5.5 },
  london: { lat: 51.5074, lng: -0.1278, tz: 0.0 },
  'new york': { lat: 40.7128, lng: -74.006, tz: -5.0 },
  'san francisco': { lat: 37.7749, lng: -122.4194, tz: -8.0 },
  dubai: { lat: 25.2048, lng: 55.2708, tz: 4.0 },
  singapore: { lat: 1.3521, lng: 103.8198, tz: 8.0 },
  tokyo: { lat: 35.6762, lng: 139.6503, tz: 9.0 },
  sydney: { lat: -33.8688, lng: 151.2093, tz: 10.0 },
};

const computeLifePath = (dob: string): number => {
  if (!dob) return 7;
  const digits = dob.replace(/\D/g, '');
  if (!digits) return 7;
  let sum = digits.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return sum;
};

const computeBirthNumber = (dob: string): number => {
  if (!dob) return 4;
  const parts = dob.split('-');
  const day = parseInt(parts[2] || parts[0], 10);
  if (!day || isNaN(day)) return 4;
  let sum = day;
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return sum;
};

const computeDestiny = (name: string): number => {
  if (!name) return 1;
  const pythagorean: Record<string, number> = {
    a: 1, j: 1, s: 1,
    b: 2, k: 2, t: 2,
    c: 3, l: 3, u: 3,
    d: 4, m: 4, v: 4,
    e: 5, n: 5, w: 5,
    f: 6, o: 6, x: 6,
    g: 7, p: 7, y: 7,
    h: 8, q: 8, z: 8,
    i: 9, r: 9,
  };
  let sum = 0;
  for (const char of name.toLowerCase()) {
    if (pythagorean[char]) sum += pythagorean[char];
  }
  if (!sum) return 1;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return sum;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  userName = 'Cosmic Seeker',
  chartContext,
}) => {
  const { user } = useAuth();
  const [kundli, setKundli] = useState<any>(() => {
    return chartContext || getCalculatedChart();
  });
  const [panchang, setPanchang] = useState<any>(null);
  const [choghadiya, setChoghadiya] = useState<any>(null);
  const [dailyDimensions, setDailyDimensions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditIntake, setShowEditIntake] = useState(false);

  // Form data for birth intake
  const [formData, setFormData] = useState<StoredBirthProfile>(() => {
    const saved = getBirthProfile();
    return (
      saved || {
        name: '',
        birthDate: '',
        birthTime: '',
        birthPlace: '',
        latitude: '',
        longitude: '',
        timezone: '5.5',
        gender: 'male',
        isApproximateTime: false,
      }
    );
  });

  const {
    isCalculating,
    calcStep,
    calcMessage,
    progressPercent,
    error: calcError,
    executeCalculation,
  } = useAstrologicalCalculation();

  // Synchronize with unified chart storage
  useEffect(() => {
    // 1. Check local storage first
    const local = getCalculatedChart();
    if (local && (local.ascendant || local.lagna || local.chart?.ascendant)) {
      setKundli(local.chart || local);
    } else {
      // 2. Fetch user's authoritative calculated chart from backend in background
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const chartUrl = token ? '/api/astrology/current-kundli' : '/api/astrology/chart';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(chartUrl, { headers })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && (data.ascendant || data.chart?.ascendant)) {
            const chartData = data.chart || data;
            setKundli(chartData);
            saveCalculatedChart(chartData);
          }
        })
        .catch(() => {});
    }

    // 3. Listen to cross-component updates
    const unsubscribe = onChartUpdated(({ chart, profile }) => {
      if (chart) {
        setKundli(chart.chart || chart);
        setShowEditIntake(false);
      }
      if (profile) {
        setFormData(profile);
      }
    });

    // 4. Fetch live sidereal Panchang
    fetch('/api/astrology/panchang')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPanchang(data);
      })
      .catch(() => {});

    // 5. Fetch live Choghadiya & Daily Dimensions
    fetch('/api/cosmic/choghadiya-hora')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setChoghadiya(data);
      })
      .catch(() => {});

    fetch('/api/cosmic/daily-dimensions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setDailyDimensions(data);
      })
      .catch(() => {});

    return () => unsubscribe();
  }, []);

  const handleBirthPlaceChange = (value: string) => {
    const lower = value.toLowerCase().trim();
    let lat = formData.latitude;
    let lng = formData.longitude;
    let tz = formData.timezone;

    for (const [city, coord] of Object.entries(CITY_COORDS)) {
      if (lower.includes(city)) {
        lat = coord.lat.toString();
        lng = coord.lng.toString();
        tz = coord.tz.toString();
        break;
      }
    }

    setFormData({
      ...formData,
      birthPlace: value,
      latitude: lat,
      longitude: lng,
      timezone: tz,
    });
  };

  const handleIntakeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name?.trim() || !formData.birthDate || !formData.birthTime) {
      alert('Please provide your name, date of birth, and time of birth.');
      return;
    }

    try {
      const result = await executeCalculation(formData);
      if (result) {
        const calculatedChart = result.chart || result;
        setKundli(calculatedChart);
        saveCalculatedChart(calculatedChart, formData);
        setShowEditIntake(false);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const chart = kundli;
  const ascendantSign =
    (typeof chart?.ascendant?.details?.signName === 'string' ? chart.ascendant.details.signName : null) ||
    (typeof chart?.lagna?.signName === 'string' ? chart.lagna.signName : null) ||
    (typeof chart?.ascendantSign === 'string' ? chart.ascendantSign : null) ||
    (typeof chart?.ascendant === 'string' ? chart.ascendant : null) ||
    (typeof chart?.ascendant?.sign === 'string' ? chart.ascendant.sign : null);

  const ascendantDegree =
    typeof chart?.ascendant?.details?.degreeInSign === 'number'
      ? `${chart.ascendant.details.degreeInSign.toFixed(2)}°`
      : typeof chart?.ascendant?.degrees === 'number'
      ? `${(chart.ascendant.degrees % 30).toFixed(2)}°`
      : typeof chart?.lagna?.degreeInSign === 'number'
      ? `${chart.lagna.degreeInSign.toFixed(2)}°`
      : null;

  const ascendantIndex =
    typeof chart?.ascendant?.details?.signIndex === 'number'
      ? chart.ascendant.details.signIndex
      : typeof chart?.lagna?.signIndex === 'number'
      ? chart.lagna.signIndex
      : typeof chart?.ascendant?.signIndex === 'number'
      ? chart.ascendant.signIndex
      : 0;

  const moonSign =
    (typeof chart?.moonSign?.signName === 'string' ? chart.moonSign.signName : null) ||
    (typeof chart?.moonSign === 'string' ? chart.moonSign : null) ||
    (typeof chart?.rashi?.signName === 'string' ? chart.rashi.signName : null) ||
    (typeof chart?.rashi === 'string' ? chart.rashi : null) ||
    chart?.planets?.find((p: any) => p.name === 'Moon')?.sign;

  const moonNakshatra =
    (typeof chart?.moonNakshatra?.name === 'string' ? chart.moonNakshatra.name : null) ||
    (typeof chart?.moonNakshatra === 'string' ? chart.moonNakshatra : null) ||
    (typeof chart?.nakshatra?.name === 'string' ? chart.nakshatra.name : null) ||
    (typeof chart?.nakshatra === 'string' ? chart.nakshatra : null) ||
    chart?.planets?.find((p: any) => p.name === 'Moon')?.nakshatra;

  const sunSign =
    (typeof chart?.sunSign?.signName === 'string' ? chart.sunSign.signName : null) ||
    (typeof chart?.sunSign === 'string' ? chart.sunSign : null) ||
    chart?.planets?.find((p: any) => p.name === 'Sun')?.sign;

  const mahadasha =
    chart?.dashas?.currentMahadasha?.planet ||
    (typeof chart?.currentMahadasha === 'string' ? chart.currentMahadasha : null);
  const antardasha =
    chart?.dashas?.currentAntardasha?.planet ||
    (typeof chart?.currentAntardasha === 'string' ? chart.currentAntardasha : null);
  const weather = chart?.predictions?.today;

  const activePlanets = Array.isArray(chart?.planets)
    ? chart.planets.map((p: any) => ({
        name: typeof p?.name === 'string' ? p.name : 'Unknown',
        symbol: typeof p?.symbol === 'string' ? p.symbol : '☉',
        house: typeof p?.house === 'number' ? p.house : 1,
        sign: typeof p?.sign === 'string' ? p.sign : 'Aries',
        degreeInSign:
          typeof p?.degreeInSign === 'number'
            ? p.degreeInSign
            : typeof p?.degrees === 'number'
            ? p.degrees % 30
            : 0,
        nakshatra:
          typeof p?.nakshatra === 'string'
            ? p.nakshatra
            : typeof p?.nakshatra?.name === 'string'
            ? p.nakshatra.name
            : 'Ashwini',
        dignity: typeof p?.dignity === 'string' ? p.dignity : 'Neutral',
        isRetrograde: Boolean(p?.isRetrograde),
        isCombust: Boolean(p?.isCombust),
      }))
    : [];

  const lalKitabRemedies = chart ? generateDynamicLalKitabRemedies(chart) : [];

  const effectiveUserName =
    user?.fullName ||
    (formData.name && typeof formData.name === 'string' ? formData.name.trim() : '') ||
    chart?.birthData?.name ||
    chart?.profile?.name ||
    chart?.input?.name ||
    (userName !== 'Cosmic Seeker' ? userName : 'Cosmic Seeker');

  // Safe Panchang strings to prevent React object child errors
  const tithiDisplay = panchang?.tithi?.name
    ? `${panchang.tithi.name}${panchang.tithi.paksha ? ` (${panchang.tithi.paksha.split(' ')[0]})` : ''}`
    : (typeof panchang?.tithi === 'string' ? panchang.tithi : 'Shukla Paksha');

  const nakshatraDisplay = panchang?.nakshatra?.name
    ? panchang.nakshatra.name
    : (typeof panchang?.nakshatra === 'string' ? panchang.nakshatra : 'Current Nakshatra');

  const varaDisplay = panchang?.vara?.name
    ? `${panchang.vara.name}${panchang.vara.sanskritName ? ` (${panchang.vara.sanskritName})` : ''}`
    : (typeof panchang?.vara === 'string' ? panchang.vara : 'Vara');

  const yogaDisplay = panchang?.yoga?.name
    ? panchang.yoga.name
    : (typeof panchang?.yoga === 'string' ? panchang.yoga : 'Yoga');

  const calculatedLifePath =
    chart?.numerology?.lifePathNumber ??
    computeLifePath(formData.birthDate || chart?.profile?.birthDate || chart?.birthDate || '1995-10-15');
  const calculatedBirthNumber =
    chart?.numerology?.birthNumber ??
    computeBirthNumber(formData.birthDate || chart?.profile?.birthDate || chart?.birthDate || '1995-10-15');
  const calculatedDestiny =
    chart?.numerology?.destinyNumber ?? computeDestiny(effectiveUserName);

  // If no chart is configured or user explicitly requested to edit coordinates
  if (!chart || !ascendantSign || showEditIntake) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <CalculationProgressModal
          isOpen={isCalculating}
          step={calcStep}
          message={calcMessage}
          progressPercent={progressPercent}
        />

        {/* Top Welcome Header */}
        <div className="rounded-3xl border border-cosmic-border bg-gradient-to-r from-cosmic-surface via-cosmic-card to-cosmic-surface p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-cosmic-card relative overflow-hidden">
          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Cosmic Command Center
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-cosmic-text">
              {showEditIntake ? 'Update Your Birth Coordinates' : `Welcome, ${effectiveUserName}.`}
            </h1>
            <p className="text-xs sm:text-sm text-cosmic-muted max-w-xl">
              Enter your exact birth coordinates below. DeepAstro uses high-precision Swiss Ephemeris and Lahiri Ayanamsha to plot your complete Lagna Kundli, Mahadashas, Numerology, and Lal Kitab remedies.
            </p>
          </div>

          {chart && showEditIntake && (
            <div className="relative z-10">
              <button
                type="button"
                onClick={() => setShowEditIntake(false)}
                className="px-4 py-2 rounded-xl border border-cosmic-border bg-cosmic-card text-xs font-bold text-cosmic-text hover:border-cyan-400"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Live Interactive Birth Intake Form */}
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0e162e]/90 to-cosmic-surface p-6 sm:p-8 shadow-glow-cyan/20 space-y-6">
          <div className="flex items-center justify-between border-b border-cosmic-border/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Astrological Birth Coordinates</h3>
                <p className="text-[11px] text-cosmic-muted">Calculated strictly on the fly — never predetermined</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
              Arcsecond Precision
            </span>
          </div>

          {calcError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {calcError}
            </div>
          )}

          <form onSubmit={handleIntakeSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Your Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Date of Birth</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  required
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Time of Birth (24h)</label>
                <input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  required
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Place of Birth (City)</label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi, Mumbai, London"
                  value={formData.birthPlace}
                  onChange={(e) => handleBirthPlaceChange(e.target.value)}
                  required
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Latitude</label>
                <input
                  type="text"
                  placeholder="28.6139"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Longitude</label>
                <input
                  type="text"
                  placeholder="77.2090"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Timezone (UTC offset)</label>
                <input
                  type="text"
                  placeholder="5.5"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-cosmic-muted block mb-1 font-semibold">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-cosmic-border/60">
              <label className="flex items-center gap-2 cursor-pointer text-cosmic-muted text-[11px]">
                <input
                  type="checkbox"
                  checked={formData.isApproximateTime}
                  onChange={(e) => setFormData({ ...formData, isApproximateTime: e.target.checked })}
                  className="rounded border-cosmic-border bg-cosmic-card text-cyan-500"
                />
                <span>Approximate birth time (rectification assistance)</span>
              </label>

              <button
                type="submit"
                disabled={isCalculating}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-glow-cyan flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Calculate &amp; Plot My Dashboard</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Astronomical Panchang */}
        {panchang && (
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cosmic-gold uppercase tracking-wider">
                <Sun className="w-3.5 h-3.5" /> Today's Live Sidereal Panchang
              </div>
              <span className="text-[10px] text-cosmic-muted font-mono">
                {panchang.date || new Date().toISOString().split('T')[0]}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-cosmic-card border border-cosmic-border">
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Tithi</span>
                <span className="font-bold text-cosmic-text text-sm">{tithiDisplay}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-cosmic-card border border-cosmic-border">
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Nakshatra</span>
                <span className="font-bold text-cosmic-text text-sm">{nakshatraDisplay}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-cosmic-card border border-cosmic-border">
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Vara (Day)</span>
                <span className="font-bold text-cosmic-text text-sm">{varaDisplay}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-cosmic-card border border-cosmic-border">
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Yoga</span>
                <span className="font-bold text-cosmic-text text-sm">{yogaDisplay}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dynamic 6 pillars when predictions exist
  const pillars = weather
    ? [
        { label: 'Career & Ambition', score: weather.career?.score ?? 78, icon: Briefcase, headline: weather.career?.headline || 'High Momentum', insight: weather.career?.insight || 'Align major decisions with Dasha lord.' },
        { label: 'Love & Harmony', score: weather.love?.score ?? 76, icon: Heart, headline: weather.love?.headline || 'Relational Harmony', insight: weather.love?.insight || 'Venusian transit supports dialogue.' },
        { label: 'Wealth & Labha', score: weather.finance?.score ?? 82, icon: DollarSign, headline: weather.finance?.headline || 'Positive Flow', insight: weather.finance?.insight || 'Focus on sustainable value creation.' },
        { label: 'Health & Vitality', score: weather.health?.score ?? 80, icon: Activity, headline: weather.health?.headline || 'Balanced Prana', insight: weather.health?.insight || 'Maintain circadian sleep cycles.' },
        { label: 'Family & Roots', score: weather.family?.score ?? 85, icon: Users, headline: weather.family?.headline || 'Deep Bonding', insight: weather.family?.insight || 'Ground yourself with loved ones.' },
        { label: 'Spirituality', score: weather.spirituality?.score ?? 88, icon: Feather, headline: weather.spirituality?.headline || 'Subtle Insight', insight: weather.spirituality?.insight || 'Ideal window for meditation.' },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      <CalculationProgressModal
        isOpen={isCalculating}
        step={calcStep}
        message={calcMessage}
        progressPercent={progressPercent}
      />

      {/* Top Welcome Header with Recalculate Option */}
      <div className="rounded-3xl border border-cosmic-border bg-gradient-to-r from-cosmic-surface via-cosmic-card to-cosmic-surface p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-cosmic-card relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Personal Cosmic Command Center
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-cosmic-text">
            Welcome, {effectiveUserName}.
          </h1>
          <p className="text-xs sm:text-sm text-cosmic-muted max-w-xl">
            Lagna in <span className="text-cyan-400 font-bold">{ascendantSign}</span> {ascendantDegree ? `(${ascendantDegree})` : ''} • Moon Rashi in <span className="text-cosmic-gold font-bold">{moonSign || 'Calculating'}</span> ({moonNakshatra || 'Nakshatra'}) • Sun in <span className="text-amber-400 font-bold">{sunSign || 'Calculating'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setShowEditIntake(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cosmic-card border border-cosmic-border hover:border-cyan-400 text-xs font-bold text-cosmic-text transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Edit Coordinates</span>
          </button>

          <button
            onClick={() => onNavigate('kundli')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-xs shadow-glow-cyan hover:opacity-95 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Full Vargas</span>
          </button>
        </div>
      </div>

      {/* Plotted Kundli Horoscope & Planetary Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Plotted North Indian Chart Card */}
        <div className="lg:col-span-5 rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 shadow-cosmic-card space-y-4">
          <div className="flex items-center justify-between border-b border-cosmic-border/60 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" /> Lagna Kundli (D1 Birth Chart)
            </div>
            <span className="text-[10px] font-mono text-cosmic-muted">Lahiri Sidereal</span>
          </div>

          <div className="flex justify-center pt-2">
            <NorthIndianChart
              ascendantSignIndex={ascendantIndex}
              planets={activePlanets}
              size={360}
              className="w-full max-w-[360px]"
            />
          </div>

          <div className="p-3 rounded-2xl bg-cosmic-card/60 border border-cosmic-border/60 text-center text-xs">
            <span className="text-cosmic-muted text-[11px]">Ascendant Lord: </span>
            <span className="font-bold text-cyan-400">{chart?.ascendant?.details?.ruler || 'Lagna Lord'}</span>
            <span className="text-cosmic-muted text-[11px] ml-3">Nakshatra Pada: </span>
            <span className="font-bold text-cosmic-gold">{chart?.moonNakshatra?.pada ? `Pada ${chart.moonNakshatra.pada}` : '1'}</span>
          </div>
        </div>

        {/* Planetary Coordinates & Dignities Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 shadow-cosmic-card space-y-4">
            <div className="flex items-center justify-between border-b border-cosmic-border/60 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Planetary Positions &amp; Dignities
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                100% Deterministic
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cosmic-border/60 text-[10px] uppercase font-bold text-cosmic-muted">
                    <th className="pb-2">Graha</th>
                    <th className="pb-2">Sign</th>
                    <th className="pb-2">Deg</th>
                    <th className="pb-2">House</th>
                    <th className="pb-2">Nakshatra</th>
                    <th className="pb-2">Dignity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cosmic-border/40">
                  {activePlanets.map((p: any) => (
                    <tr key={p.name} className="hover:bg-cosmic-card/40 transition-colors">
                      <td className="py-2.5 font-bold text-cosmic-text flex items-center gap-1.5">
                        <span className="text-cyan-400 font-mono">{p.symbol || '☉'}</span>
                        <span>{p.name}</span>
                        {p.isRetrograde && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            R
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-cosmic-text/90 font-medium">{p.sign}</td>
                      <td className="py-2.5 text-cosmic-muted font-mono text-[11px]">
                        {typeof p.degreeInSign === 'number' && !isNaN(p.degreeInSign)
                          ? `${p.degreeInSign.toFixed(1)}°`
                          : '—'}
                      </td>
                      <td className="py-2.5 font-bold text-cyan-400">H{p.house}</td>
                      <td className="py-2.5 text-cosmic-muted text-[11px]">{p.nakshatra}</td>
                      <td className="py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          ['Exalted', 'Own Sign', 'Moolatrikona'].includes(p.dignity)
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : p.dignity === 'Debilitated'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-cosmic-card text-cosmic-muted border-cosmic-border'
                        }`}>
                          {p.dignity || 'Neutral'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dasha Quick Status Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Active Mahadasha</span>
                <span className="font-bold text-cosmic-text text-base mt-0.5 block">{mahadasha || 'Vimshottari Dasha'}</span>
                <span className="text-[10px] text-cyan-400">Primary Period Governor</span>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Active
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Sub-Period (Antardasha)</span>
                <span className="font-bold text-cosmic-text text-base mt-0.5 block">{antardasha || 'Sub-Lord'}</span>
                <span className="text-[10px] text-violet-400">Secondary Operating Energy</span>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30">
                Current
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Numerology & Lal Kitab Highlights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Numerology Harmonic Card */}
        <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-cosmic-border/60 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Hash className="w-3.5 h-3.5" /> Numerology Vibrations ({effectiveUserName})
            </div>
            <button
              onClick={() => onNavigate('numerology')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>Full Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-cosmic-muted leading-relaxed">
            Chaldean and Pythagorean sound vibration calculated directly for your legal name and birth date.
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase block">Life Path</span>
              <span className="text-2xl font-display font-black text-cyan-400">
                {calculatedLifePath}
              </span>
              <span className="text-[9px] text-cyan-300/80 block mt-0.5">Core Purpose</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase block">Birth Number</span>
              <span className="text-2xl font-display font-black text-amber-400">
                {calculatedBirthNumber}
              </span>
              <span className="text-[9px] text-amber-300/80 block mt-0.5">Innate Talent</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/30">
              <span className="text-[10px] font-bold text-cosmic-muted uppercase block">Destiny</span>
              <span className="text-2xl font-display font-black text-violet-400">
                {calculatedDestiny}
              </span>
              <span className="text-[9px] text-violet-300/80 block mt-0.5">Expression</span>
            </div>
          </div>
        </div>

        {/* Lal Kitab Dynamic Remedial Card */}
        <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-cosmic-border/60 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" /> Lal Kitab Remedies for Your Chart
            </div>
            <button
              onClick={() => onNavigate('lalkitab')}
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
            >
              <span>Remedy Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-cosmic-muted leading-relaxed">
            Pragmatic elemental remedies calculated specifically from your actual planetary house placements.
          </p>

          <div className="space-y-2.5">
            {lalKitabRemedies.slice(0, 2).map((rem) => (
              <div
                key={rem.id}
                className="p-3 rounded-2xl bg-cosmic-card/70 border border-cosmic-border hover:border-orange-500/40 transition-colors text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-cosmic-text">{rem.title}</span>
                  <span className="text-[10px] font-mono text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/30">
                    {rem.planet.split(' ')[0]} in H{rem.house}
                  </span>
                </div>
                <p className="text-[11px] text-cosmic-muted leading-snug line-clamp-2">
                  {rem.instructions}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Core Life Energy Pillars Grid */}
      {pillars.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider">
              6 Dimensions of Today's Energy
            </h2>
            <button
              onClick={() => onNavigate('predictions')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>Full Daily Forecast</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="rounded-2xl border border-cosmic-border bg-cosmic-surface p-5 hover:border-cyan-500/40 transition-all duration-300 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-cosmic-card border border-cosmic-border flex items-center justify-center text-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-cosmic-text">{p.label}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">{p.score}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-cosmic-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                      style={{ width: `${p.score}%` }}
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-cosmic-text">{p.headline}</h4>
                    <p className="text-[11px] text-cosmic-muted mt-0.5 leading-snug">{p.insight}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
