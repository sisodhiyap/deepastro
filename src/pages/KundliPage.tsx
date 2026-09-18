
import { KPIntelligencePanel } from '../components/astrology/KPIntelligencePanel.js';
import { VargaExplorerPanel } from '../components/astrology/VargaExplorerPanel.js';
import { AstrologyEvidenceModal } from '../components/astrology/AstrologyEvidenceModal.js';
import { GitMerge } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Compass,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  Layers,
  ShieldCheck,
  Upload,
  FileText,
  Download,
  FileUp,
  RefreshCw,
  Eye,
  AlertCircle,
  AlertTriangle,
  Edit3,
  MapPin,
  X,
} from 'lucide-react';
import { NorthIndianChart } from '../components/charts/NorthIndianChart.js';
import { SouthIndianChart } from '../components/charts/SouthIndianChart.js';
import { EastIndianChart } from '../components/charts/EastIndianChart.js';
import { PlanetaryTable } from '../components/astrology/PlanetaryTable.js';
import { DashaTimeline } from '../components/astrology/DashaTimeline.js';
import {
  getCalculatedChart,
  getBirthProfile,
  saveCalculatedChart,
  onChartUpdated,
} from '../utils/birthStorage.js';
import { useAstrologicalCalculation } from '../hooks/useAstrologicalCalculation.js';
import { CalculationProgressModal } from '../components/astrology/CalculationProgressModal.js';
import { PlaceSelector } from '../components/common/PlaceSelector.js';

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

export const KundliPage: React.FC = () => {
  const [formData, setFormData] = useState(() => {
    const saved = getBirthProfile();
    return {
      name: saved?.name || '',
      birthDate: saved?.birthDate || '',
      birthTime: saved?.birthTime || '',
      birthPlace: saved?.birthPlace || '',
      latitude: saved?.latitude ? String(saved.latitude) : '',
      longitude: saved?.longitude ? String(saved.longitude) : '',
      timezone: saved?.timezone ? String(saved.timezone) : '5.5',
      gender: saved?.gender || 'male',
      isApproximateTime: Boolean(saved?.isApproximateTime),
    };
  });

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

  const [pendingReview, setPendingReview] = useState<any | null>(null);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);

  const [entryMode, setEntryMode] = useState<'manual' | 'upload'>('manual');
  const [chartStyle, setChartStyle] = useState<'north' | 'south' | 'east'>('north');
  const [activeVarga, setActiveVarga] = useState<'d1' | 'd9' | 'd10'>('d1');
  const [activeMasterTab, setActiveMasterTab] = useState<
    | 'overview'
    | 'rashi'
    | 'bhava'
    | 'kp'
    | 'navamsa'
    | 'vargas'
    | 'planets'
    | 'nakshatras'
    | 'dasha'
    | 'yogas'
    | 'aspects'
    | 'significators'
    | 'timeline'
    | 'predictions'
    | 'remedies'
  >('overview');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [kundli, setKundli] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [blueprintStep, setBlueprintStep] = useState<
    'idle' | 'preparing_chart' | 'preparing_report' | 'generating_pdf' | 'quality_checks' | 'ready' | 'error'
  >('idle');
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleGenerateBlueprint = async () => {
    setBlueprintStep('preparing_chart');
    setBlueprintError(null);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setBlueprintStep('preparing_report');
      await new Promise((r) => setTimeout(r, 400));
      setBlueprintStep('generating_pdf');

      const res = await fetch('/api/reports/blueprint/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData: {
            name: formData.name,
            birthDate: formData.birthDate,
            birthTime: formData.birthTime,
            birthPlace: formData.birthPlace,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            timezone: parseFloat(formData.timezone),
            gender: formData.gender,
            isApproximateTime: formData.isApproximateTime,
          },
          chartStyle,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.details || errData.error || 'Failed to generate My Life Blueprint.');
      }

      const data = await res.json();
      setBlueprintStep('quality_checks');
      await new Promise((r) => setTimeout(r, 400));
      setBlueprintStep('ready');

      window.open(data.htmlUrl, '_blank');
    } catch (err: any) {
      console.error(err);
      setBlueprintStep('error');
      setBlueprintError(err.message || 'An error occurred during blueprint report generation.');
    }
  };

  const {
    isCalculating,
    calcStep,
    calcMessage,
    progressPercent,
    error: calcError,
    executeCalculation,
  } = useAstrologicalCalculation();

  const calculateChart = async (overrideData?: any) => {
    const targetData = overrideData || formData;
    if (!targetData.name?.trim() || !targetData.birthDate || !targetData.birthTime) {
      alert('Please enter your name, date of birth, and time of birth.');
      return;
    }
    try {
      const data = await executeCalculation(targetData);
      if (data) {
        setKundli(data.chart || data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPdf = async () => {
    setPdfGenerating(true);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: 'FULL_KUNDLI', birthData: formData }),
      });
      if (res.ok) {
        const reportData = await res.json();
        window.open(`/api/reports/${reportData.id}/html`, '_blank');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleKundliUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus('Scanning Kundli document with Vision AI...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const res = await fetch('/api/astrology/upload-kundli', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
            mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setPendingReview(data);
          setSelectedCandidateIndex(0);
          setUploadStatus('Document scanned. Please review extracted birth details before calculating.');
        } else {
          const errData = await res.json().catch(() => ({}));
          setUploadStatus(`Upload failed: ${errData.error || 'Failed to parse file'}`);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadStatus(`Upload failed: ${err.message}`);
      setIsUploading(false);
    }
  };

  const handleConfirmExtraction = () => {
    if (!pendingReview) return;
    const ef = pendingReview.extractedFields;
    const candidate = pendingReview.disambiguationCandidates?.[selectedCandidateIndex];

    const updatedForm = {
      name: ef.name.value,
      birthDate: ef.birthDate.value,
      birthTime: ef.birthTime.value,
      birthPlace: candidate ? candidate.displayName : ef.birthPlace.value,
      latitude: candidate ? candidate.latitude.toString() : ef.latitude.value.toString(),
      longitude: candidate ? candidate.longitude.toString() : ef.longitude.value.toString(),
      timezone: candidate ? candidate.timezone.toString() : ef.timezone.value.toString(),
      gender: ef.gender.value,
      isApproximateTime: false,
    };

    setFormData(updatedForm);
    if (pendingReview.calculatedKundli) {
      setKundli(pendingReview.calculatedKundli);
    }
    setUploadStatus(`âœ“ Verified & Confirmed for ${ef.name.value}! Sovereign Vedic Kundli Calculated.`);
    setPendingReview(null);
    setEntryMode('manual');
  };

  const handleEditExtraction = () => {
    if (!pendingReview) return;
    const ef = pendingReview.extractedFields;
    const candidate = pendingReview.disambiguationCandidates?.[selectedCandidateIndex];

    setFormData({
      name: ef.name.value,
      birthDate: ef.birthDate.value,
      birthTime: ef.birthTime.value,
      birthPlace: candidate ? candidate.displayName : ef.birthPlace.value,
      latitude: candidate ? candidate.latitude.toString() : ef.latitude.value.toString(),
      longitude: candidate ? candidate.longitude.toString() : ef.longitude.value.toString(),
      timezone: candidate ? candidate.timezone.toString() : ef.timezone.value.toString(),
      gender: ef.gender.value,
      isApproximateTime: false,
    });
    setUploadStatus('Extracted values loaded into editor. Adjust fields and click Recalculate.');
    setPendingReview(null);
    setEntryMode('manual');
  };

  useEffect(() => {
    // 1. Check local storage first
    const savedChart = getCalculatedChart();
    const savedProfile = getBirthProfile();

    if (savedChart && (savedChart.ascendant || savedChart.lagna)) {
      setKundli(savedChart.chart || savedChart);
    }
    if (savedProfile && savedProfile.birthDate) {
      setFormData((prev) => ({
        ...prev,
        ...savedProfile,
        latitude: savedProfile.latitude?.toString() || prev.latitude,
        longitude: savedProfile.longitude?.toString() || prev.longitude,
        timezone: savedProfile.timezone?.toString() || prev.timezone,
      }));
    }

    // 2. Fetch saved chart from server if logged in
    fetch('/api/astrology/chart')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const activeChart = data?.chart || (data?.ascendant ? data : null);
        if (activeChart && activeChart.ascendant) {
          setKundli(activeChart);
          saveCalculatedChart(activeChart);
          if (activeChart.birthData) {
            setFormData({
              name: activeChart.birthData.name || '',
              birthDate: activeChart.birthData.birthDate || '',
              birthTime: activeChart.birthData.birthTime || '',
              birthPlace: activeChart.birthData.birthPlace || '',
              latitude: activeChart.birthData.latitude?.toString() || '',
              longitude: activeChart.birthData.longitude?.toString() || '',
              timezone: activeChart.birthData.timezone?.toString() || '5.5',
              gender: activeChart.birthData.gender || 'male',
              isApproximateTime: !!activeChart.birthData.isApproximateTime,
            });
          }
        }
      })
      .catch(() => {});

    // 3. Listen to cross-component updates
    const unsubscribe = onChartUpdated(({ chart, profile }) => {
      if (chart) {
        setKundli(chart.chart || chart);
      }
      if (profile) {
        setFormData((prev) => ({
          ...prev,
          ...profile,
          latitude: profile.latitude?.toString() || prev.latitude,
          longitude: profile.longitude?.toString() || prev.longitude,
          timezone: profile.timezone?.toString() || prev.timezone,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const getActivePlanets = () => {
    if (!kundli) return [];
    if (activeVarga === 'd9' && kundli.vargas?.d9_navamsa) {
      return kundli.vargas.d9_navamsa.map((p: any) => {
        const base = kundli.planets.find((orig: any) => orig.name === p.planet);
        return {
          name: p.planet,
          symbol: base?.symbol || '',
          house: ((p.signIndex - kundli.ascendant.details.signIndex + 12) % 12) + 1,
          signIndex: p.signIndex,
          isRetrograde: base?.isRetrograde,
          isCombust: base?.isCombust,
        };
      });
    }
    if (activeVarga === 'd10' && kundli.vargas?.d10_dashamsha) {
      return kundli.vargas.d10_dashamsha.map((p: any) => {
        const base = kundli.planets.find((orig: any) => orig.name === p.planet);
        return {
          name: p.planet,
          symbol: base?.symbol || '',
          house: ((p.signIndex - kundli.ascendant.details.signIndex + 12) % 12) + 1,
          signIndex: p.signIndex,
          isRetrograde: base?.isRetrograde,
          isCombust: base?.isCombust,
        };
      });
    }
    return kundli.planets;
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      <CalculationProgressModal
        isOpen={isCalculating}
        step={calcStep}
        message={calcMessage}
        progressPercent={progressPercent}
      />
      {/* Page Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Deterministic Vedic Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Vedic Kundli & Planetary Geometry
        </h1>
        <p className="text-xs text-cosmic-muted">
          Lahiri Ayanamsha (Chitra Paksha) sidereal ephemeris with complete divisional charts.
        </p>
      </div>

      {/* Birth Input Controls */}
      <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 shadow-cosmic-card space-y-5">
        {/* Entry Mode Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cosmic-border/60">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEntryMode('manual')}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                entryMode === 'manual'
                  ? 'bg-cyan-500 text-black shadow-glow-cyan'
                  : 'bg-cosmic-card text-cosmic-muted hover:text-cosmic-text'
              }`}
            >
              <span>âœï¸ Manual Birth Details</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('upload')}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                entryMode === 'upload'
                  ? 'bg-cyan-500 text-black shadow-glow-cyan'
                  : 'bg-cosmic-card text-cosmic-muted hover:text-cosmic-text'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ðŸ“¸ Upload Kundli (Pic / PDF)</span>
            </button>
          </div>

          {uploadStatus && (
            <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadStatus}</span>
            </div>
          )}
        </div>

        {/* Upload Kundli Dropzone Mode */}
        {entryMode === 'upload' ? (
          <div className="p-8 border-2 border-dashed border-cosmic-border hover:border-cyan-400/80 rounded-2xl bg-cosmic-card/40 flex flex-col items-center justify-center text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400/20 to-violet-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-glow-cyan/20">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-cosmic-text">Upload Existing Kundli Photo or PDF</h4>
              <p className="text-xs text-cosmic-muted max-w-md mt-1">
                Drop your birth chart diagram, Kundli scan, or astrologer PDF report here. DeepAstro Vision AI extracts the birth details and auto-fills the entire calculation engine.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleKundliUpload(file);
              }}
            />
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-glow-cyan flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Scanning Document...' : 'Browse Kundli File (Image / PDF)'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              calculateChart();
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs"
          >
            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Birth Date</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Birth Time</label>
              <input
                type="time"
                value={formData.birthTime}
                onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Comprehensive Searchable Dropdown of Places with Country, City, Lat & Lng */}
            <div className="sm:col-span-2 lg:col-span-4 pt-1">
              <PlaceSelector
                value={formData.birthPlace}
                latitude={formData.latitude}
                longitude={formData.longitude}
                timezone={formData.timezone}
                onChange={({ birthPlace, latitude, longitude, timezone }) => {
                  setFormData((prev) => ({
                    ...prev,
                    birthPlace,
                    latitude,
                    longitude,
                    timezone,
                  }));
                }}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-cosmic-muted">
                <input
                  type="checkbox"
                  checked={formData.isApproximateTime}
                  onChange={(e) => setFormData({ ...formData, isApproximateTime: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-500 bg-cosmic-card border-cosmic-border"
                />
                <span>Birth time is approximate (Within +/- 15 minutes)</span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider transition-all shadow-glow-cyan"
              >
                {isLoading ? 'Calculating...' : (kundli ? 'Recalculate Kundli' : 'Calculate Vedic Kundli')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Review Your Birth Details Confirmation Modal */}
      {pendingReview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="max-w-2xl w-full rounded-3xl border border-cyan-400/40 bg-cosmic-surface p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-cosmic-border/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>OCR Vision Verified</span>
                </div>
                <h3 className="text-xl font-display font-black text-cosmic-text">
                  Review Your Birth Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPendingReview(null)}
                className="p-1.5 rounded-xl border border-cosmic-border hover:border-cosmic-muted text-cosmic-muted text-xs"
              >
                âœ•
              </button>
            </div>

            {/* Warning if low confidence */}
            {pendingReview.hasLowConfidenceFields && (
              <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Some birth details could not be read with 100% confidence. Please inspect highlighted fields carefully before confirming.
                </span>
              </div>
            )}

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Name */}
              <div className="p-3 rounded-xl bg-cosmic-card border border-cosmic-border space-y-1">
                <div className="flex items-center justify-between text-cosmic-muted">
                  <span className="font-semibold">Full Name</span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {Math.round(pendingReview.extractedFields.name.confidence * 100)}% ({pendingReview.extractedFields.name.source})
                  </span>
                </div>
                <div className="font-bold text-sm text-cosmic-text">
                  {pendingReview.extractedFields.name.value}
                </div>
              </div>

              {/* Gender */}
              <div className="p-3 rounded-xl bg-cosmic-card border border-cosmic-border space-y-1">
                <div className="flex items-center justify-between text-cosmic-muted">
                  <span className="font-semibold">Gender</span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {Math.round(pendingReview.extractedFields.gender.confidence * 100)}%
                  </span>
                </div>
                <div className="font-bold text-sm text-cosmic-text">
                  {pendingReview.extractedFields.gender.value}
                </div>
              </div>

              {/* Date of Birth */}
              <div className="p-3 rounded-xl bg-cosmic-card border border-cosmic-border space-y-1">
                <div className="flex items-center justify-between text-cosmic-muted">
                  <span className="font-semibold">Date of Birth (DOB)</span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {Math.round(pendingReview.extractedFields.birthDate.confidence * 100)}%
                  </span>
                </div>
                <div className="font-bold text-sm text-cosmic-text">
                  {pendingReview.extractedFields.birthDate.value}
                </div>
              </div>

              {/* Time of Birth */}
              <div
                className={`p-3 rounded-xl bg-cosmic-card border space-y-1 ${
                  pendingReview.extractedFields.birthTime.isUncertain
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : 'border-cosmic-border'
                }`}
              >
                <div className="flex items-center justify-between text-cosmic-muted">
                  <span className="font-semibold">Time of Birth</span>
                  <span
                    className={`text-[10px] font-bold ${
                      pendingReview.extractedFields.birthTime.isUncertain
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {Math.round(pendingReview.extractedFields.birthTime.confidence * 100)}%
                  </span>
                </div>
                <div className="font-bold text-sm text-cosmic-text">
                  {pendingReview.extractedFields.birthTime.value}
                </div>
              </div>

              {/* Location Disambiguation */}
              <div className="sm:col-span-2 p-3 rounded-xl bg-cosmic-card border border-cosmic-border space-y-2">
                <div className="flex items-center justify-between text-cosmic-muted">
                  <span className="font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Canonical Location
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">
                    {pendingReview.disambiguationCandidates?.length || 1} Candidate(s) Found
                  </span>
                </div>

                {pendingReview.disambiguationCandidates && pendingReview.disambiguationCandidates.length > 1 ? (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] text-cosmic-muted">
                      Multiple locations matched. Please pick your exact birthplace:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pendingReview.disambiguationCandidates.map((cand: any, idx: number) => (
                        <button
                          key={cand.id}
                          type="button"
                          onClick={() => setSelectedCandidateIndex(idx)}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            selectedCandidateIndex === idx
                              ? 'border-cyan-400 bg-cyan-500/10 text-cosmic-text shadow-glow-cyan/20'
                              : 'border-cosmic-border bg-cosmic-surface/60 text-cosmic-muted'
                          }`}
                        >
                          <div className="font-bold text-xs">{cand.displayName}</div>
                          <div className="text-[10px] opacity-80">
                            Lat: {cand.latitude}Â°, Lon: {cand.longitude}Â°, UTC{cand.timezone >= 0 ? `+${cand.timezone}` : cand.timezone}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="font-bold text-sm text-cosmic-text flex items-center justify-between">
                    <span>{pendingReview.extractedFields.birthPlace.value}</span>
                    <span className="text-xs text-cosmic-muted font-normal">
                      Lat: {pendingReview.extractedFields.latitude.value}Â°, Lon: {pendingReview.extractedFields.longitude.value}Â°, UTC+{pendingReview.extractedFields.timezone.value}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-cosmic-border/80">
              <button
                type="button"
                onClick={handleEditExtraction}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-cosmic-border bg-cosmic-card hover:border-cosmic-muted text-xs font-bold text-cosmic-text transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDIT DETAILS</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmExtraction}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-glow-cyan flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM &amp; CALCULATE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {!kundli && !isLoading && (
        <div className="rounded-3xl border border-dashed border-cosmic-border bg-cosmic-surface/40 p-12 text-center space-y-3 animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-cosmic-text">Ready to Calculate Your Kundli</h3>
          <p className="text-xs text-cosmic-muted max-w-md mx-auto leading-relaxed">
            Enter your name, date, time, and birth city above and press &quot;Calculate Vedic Kundli&quot;, or upload an existing chart image/PDF to scan with Vision AI.
          </p>
        </div>
      )}

      {kundli && (
        <div className="space-y-8">
          
          {/* Master 15-Tab Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-cosmic-border/60 scrollbar-thin">
            {[
              { id: 'overview', label: 'OVERVIEW' },
              { id: 'rashi', label: 'RASHI (D1)' },
              { id: 'bhava', label: 'BHAVA' },
              { id: 'kp', label: 'KP INTELLIGENCE' },
              { id: 'navamsa', label: 'NAVAMSA (D9)' },
              { id: 'vargas', label: 'VARGAS (D1â€“D60)' },
              { id: 'planets', label: 'PLANETS' },
              { id: 'nakshatras', label: 'NAKSHATRAS' },
              { id: 'dasha', label: 'DASHA' },
              { id: 'yogas', label: 'YOGAS' },
              { id: 'aspects', label: 'ASPECTS' },
              { id: 'significators', label: 'SIGNIFICATORS' },
              { id: 'timeline', label: 'TIMELINE' },
              { id: 'predictions', label: 'PREDICTIONS' },
              { id: 'remedies', label: 'REMEDIES' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMasterTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeMasterTab === tab.id
                    ? 'bg-cyan-500 text-black shadow-glow-cyan'
                    : 'bg-cosmic-card text-cosmic-muted hover:text-white border border-cosmic-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Birth Time Sensitivity Alert if Applicable */}
          {kundli.accuracyQuality?.isBoundarySensitive && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-sm">Birth-Time Sensitivity Notice</strong>
                <span>{kundli.accuracyQuality.userNotice}</span>
              </div>
            </div>
          )}

          {/* Chart Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface">
            {/* Chart Style Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cosmic-card border border-cosmic-border text-xs">
              <button
                onClick={() => setChartStyle('north')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  chartStyle === 'north' ? 'bg-cyan-500 text-black shadow-glow-cyan' : 'text-cosmic-muted'
                }`}
              >
                North Indian
              </button>
              <button
                onClick={() => setChartStyle('south')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  chartStyle === 'south' ? 'bg-cyan-500 text-black shadow-glow-cyan' : 'text-cosmic-muted'
                }`}
              >
                South Indian
              </button>
              <button
                onClick={() => setChartStyle('east')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  chartStyle === 'east' ? 'bg-cyan-500 text-black shadow-glow-cyan' : 'text-cosmic-muted'
                }`}
              >
                East Indian
              </button>
            </div>

            {/* Varga Selector & PDF Export */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cosmic-card border border-cosmic-border text-xs">
                <button
                  onClick={() => setActiveVarga('d1')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    activeVarga === 'd1' ? 'bg-violet-500 text-white' : 'text-cosmic-muted'
                  }`}
                >
                  D1 (Rashi)
                </button>
                <button
                  onClick={() => setActiveVarga('d9')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    activeVarga === 'd9' ? 'bg-violet-500 text-white' : 'text-cosmic-muted'
                  }`}
                >
                  D9 (Navamsa)
                </button>
                <button
                  onClick={() => setActiveVarga('d10')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    activeVarga === 'd10' ? 'bg-violet-500 text-white' : 'text-cosmic-muted'
                  }`}
                >
                  D10 (Dashamsha)
                </button>
              </div>

              {/* Premium My Life Blueprint Button */}
              <button
                type="button"
                onClick={() => {
                  setBlueprintStep('idle');
                  setBlueprintError(null);
                  setShowBlueprintModal(true);
                }}
                className="px-4 py-2 rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 hover:border-amber-400 hover:bg-amber-400 hover:text-black text-amber-300 text-xs font-bold transition-all flex items-center gap-2 shadow-glow-gold"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Generate My Life Blueprint</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 uppercase font-mono">5-Page PDF</span>
              </button>

              {/* Secondary Standard Download */}
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={pdfGenerating}
                className="px-3 py-2 rounded-xl border border-cosmic-border bg-cosmic-card/60 hover:border-cyan-400 text-cosmic-muted hover:text-cyan-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                title="Download Standard Quick Dossier"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{pdfGenerating ? 'Compiling...' : 'Quick Dossier'}</span>
              </button>
            </div>
          </div>

          
          {/* TAB 1: OVERVIEW */}
          {activeMasterTab === 'overview' && (
            <div className="space-y-8">
              {/* Chart Canvas & Essentials Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-6 flex justify-center p-4 rounded-3xl border border-cosmic-border bg-cosmic-surface/60 overflow-hidden">
                  {chartStyle === 'north' && (
                    <NorthIndianChart
                      ascendantSignIndex={kundli.ascendant.details.signIndex}
                      planets={getActivePlanets()}
                      size={420}
                    />
                  )}
                  {chartStyle === 'south' && (
                    <SouthIndianChart
                      ascendantSignIndex={kundli.ascendant.details.signIndex}
                      planets={getActivePlanets()}
                      size={420}
                    />
                  )}
                  {chartStyle === 'east' && (
                    <EastIndianChart
                      ascendantSignIndex={kundli.ascendant.details.signIndex}
                      planets={getActivePlanets()}
                      size={420}
                    />
                  )}
                </div>

                <div className="lg:col-span-6 space-y-4">
                  <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                        Vedic Coordinate Essentials
                      </h3>
                      <button
                        onClick={() => setShowEvidenceModal(true)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-500/20"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        EVIDENCE CHAIN
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-cosmic-card border border-cosmic-border/60">
                        <span className="text-cosmic-muted block text-[10px] uppercase font-semibold">Ascendant (Lagna)</span>
                        <span className="text-sm font-extrabold text-cosmic-text mt-0.5 block">
                          {kundli.ascendant.details.signName} ({kundli.ascendant.details.degreeInSign}Â° {kundli.ascendant.details.minutes}')
                        </span>
                        <span className="text-[10px] text-cyan-400 font-bold">
                          {kundli.ascendant.nakshatra.name} Pada {kundli.ascendant.nakshatra.pada}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-cosmic-card border border-cosmic-border/60">
                        <span className="text-cosmic-muted block text-[10px] uppercase font-semibold">Moon (Chandra)</span>
                        <span className="text-sm font-extrabold text-cosmic-text mt-0.5 block">
                          {kundli.moonSign.signName} ({kundli.moonSign.degreeInSign}Â° {kundli.moonSign.minutes}')
                        </span>
                        <span className="text-[10px] text-cosmic-gold font-bold">
                          {kundli.moonNakshatra.name} Pada {kundli.moonNakshatra.pada}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-cosmic-card border border-cosmic-border/60">
                        <span className="text-cosmic-muted block text-[10px] uppercase font-semibold">Sun (Surya)</span>
                        <span className="text-sm font-extrabold text-cosmic-text mt-0.5 block">
                          {kundli.sunSign.signName} ({kundli.sunSign.degreeInSign}Â° {kundli.sunSign.minutes}')
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-cosmic-card border border-cosmic-border/60">
                        <span className="text-cosmic-muted block text-[10px] uppercase font-semibold">Ayanamsha (Lahiri)</span>
                        <span className="text-sm font-extrabold text-cosmic-text mt-0.5 block font-mono">
                          {kundli.astronomy.ayanamshaDegrees.toFixed(4)}Â°
                        </span>
                      </div>
                    </div>

                    {/* Yogas Chips */}
                    <div className="pt-2 border-t border-cosmic-border/60 space-y-2">
                      <span className="text-[10px] font-bold text-cosmic-muted uppercase tracking-wider block">
                        Active Planetary Yogas
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {kundli.yogas?.map((y: any) => (
                          <span
                            key={y.name}
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                          >
                            {y.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Planetary Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider">
                  Sidereal Planetary Coordinates Table
                </h3>
                <PlanetaryTable planets={kundli.planets} />
              </div>
            </div>
          )}

          {/* TAB 2: RASHI (D1) */}
          {activeMasterTab === 'rashi' && (
            <div className="space-y-6">
              <div className="flex justify-center p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface/60 overflow-hidden">
                {chartStyle === 'north' && <NorthIndianChart ascendantSignIndex={kundli.ascendant.details.signIndex} planets={kundli.planets} size={460} />}
                {chartStyle === 'south' && <SouthIndianChart ascendantSignIndex={kundli.ascendant.details.signIndex} planets={kundli.planets} size={460} />}
                {chartStyle === 'east' && <EastIndianChart ascendantSignIndex={kundli.ascendant.details.signIndex} planets={kundli.planets} size={460} />}
              </div>
              <PlanetaryTable planets={kundli.planets} />
            </div>
          )}

          {/* TAB 3: BHAVA */}
          {activeMasterTab === 'bhava' && (
            <div className="rounded-2xl bg-[#111827] border border-[#2A3441] overflow-hidden p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bhava Chalit & House Cusps</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1A1F2B] text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">House</th>
                      <th className="py-3 px-4">Sign</th>
                      <th className="py-3 px-4">Lord</th>
                      <th className="py-3 px-4">Mid Cusp</th>
                      <th className="py-3 px-4">Planets in House</th>
                      <th className="py-3 px-4">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3441]/60">
                    {kundli.houses?.map((h: any) => (
                      <tr key={h.houseNumber} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-bold text-white">House {h.houseNumber}</td>
                        <td className="py-3 px-4 text-slate-300">{h.signName}</td>
                        <td className="py-3 px-4 text-slate-300">{h.lord}</td>
                        <td className="py-3 px-4 font-mono text-cyan-300">{h.midCuspDegree?.toFixed(2)}Â°</td>
                        <td className="py-3 px-4 text-slate-300">{h.planetsInHouse?.join(', ') || 'â€”'}</td>
                        <td className="py-3 px-4 text-slate-400">{h.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: KP INTELLIGENCE */}
          {activeMasterTab === 'kp' && (
            <KPIntelligencePanel
              kpData={kundli.kp || kundli.kpIntelligence}
              chartStyle={chartStyle}
              onShowEvidence={() => setShowEvidenceModal(true)}
            />
          )}

          {/* TAB 5: NAVAMSA (D9) */}
          {activeMasterTab === 'navamsa' && (
            <VargaExplorerPanel
              shodashavargaDetail={kundli.shodashavarga || kundli.shodashavargaDetail}
              navamsaDeep={kundli.navamsaDeep}
              dasamshaDeep={kundli.dasamshaDeep}
              chartStyle={chartStyle}
            />
          )}

          {/* TAB 6: VARGAS (D1-D60) */}
          {activeMasterTab === 'vargas' && (
            <VargaExplorerPanel
              shodashavargaDetail={kundli.shodashavarga || kundli.shodashavargaDetail}
              navamsaDeep={kundli.navamsaDeep}
              dasamshaDeep={kundli.dasamshaDeep}
              chartStyle={chartStyle}
            />
          )}

          {/* TAB 7: PLANETS */}
          {activeMasterTab === 'planets' && (
            <PlanetaryTable planets={kundli.planets} />
          )}

          {/* TAB 8: NAKSHATRAS */}
          {activeMasterTab === 'nakshatras' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3441] space-y-2">
                <span className="text-[10px] text-cyan-400 font-bold uppercase">Janma Nakshatra (Moon)</span>
                <h4 className="text-xl font-bold text-white">{kundli.moonNakshatra.name}</h4>
                <p className="text-xs text-slate-400">Pada: {kundli.moonNakshatra.pada} â€¢ Lord: {kundli.moonNakshatra.ruler}</p>
                <p className="text-xs text-slate-300 pt-2 border-t border-slate-800">Deity: {kundli.moonNakshatra.deity || 'Vedic Archetype'}</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3441] space-y-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase">Lagna Nakshatra (Ascendant)</span>
                <h4 className="text-xl font-bold text-white">{kundli.ascendant.nakshatra.name}</h4>
                <p className="text-xs text-slate-400">Pada: {kundli.ascendant.nakshatra.pada} â€¢ Lord: {kundli.ascendant.nakshatra.ruler}</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3441] space-y-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Surya Nakshatra (Sun)</span>
                <h4 className="text-xl font-bold text-white">{kundli.sunSign.signName}</h4>
                <p className="text-xs text-slate-400">Degree: {kundli.sunSign.degreeInSign}Â° {kundli.sunSign.minutes}'</p>
              </div>
            </div>
          )}

          {/* TAB 9: DASHA */}
          {activeMasterTab === 'dasha' && (
            <DashaTimeline
              currentMahadasha={kundli.dashas.currentMahadasha}
              currentAntardasha={kundli.dashas.currentAntardasha}
              allMahadashas={kundli.dashas.allMahadashas}
            />
          )}

          {/* TAB 10: YOGAS */}
          {activeMasterTab === 'yogas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kundli.yogas?.map((y: any) => (
                <div key={y.name} className="p-5 rounded-2xl bg-[#111827] border border-[#2A3441] space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    {y.category || 'Auspicious Yoga'}
                  </span>
                  <h4 className="font-bold text-white text-base">{y.name}</h4>
                  <p className="text-xs text-slate-400">{y.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 11: ASPECTS */}
          {activeMasterTab === 'aspects' && (
            <div className="p-6 rounded-2xl bg-[#111827] border border-[#2A3441] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Vedic Graha Drishti (Aspects Matrix)</h3>
              <div className="space-y-2 text-xs">
                {kundli.planets?.map((p: any) => (
                  <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-[#1A1F2B] border border-[#2A3441]">
                    <span className="font-bold text-white">{p.name} (H{p.house})</span>
                    <span className="text-slate-300 font-mono">
                      Aspects Houses: {((p.house + 6) % 12 || 12)}
                      {p.name === 'Mars' && `, ${((p.house + 3) % 12 || 12)}, ${((p.house + 7) % 12 || 12)}`}
                      {p.name === 'Jupiter' && `, ${((p.house + 4) % 12 || 12)}, ${((p.house + 8) % 12 || 12)}`}
                      {p.name === 'Saturn' && `, ${((p.house + 2) % 12 || 12)}, ${((p.house + 9) % 12 || 12)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: SIGNIFICATORS */}
          {activeMasterTab === 'significators' && (
            <KPIntelligencePanel
              kpData={kundli.kp || kundli.kpIntelligence}
              chartStyle={chartStyle}
              onShowEvidence={() => setShowEvidenceModal(true)}
            />
          )}

          {/* TAB 13: TIMELINE */}
          {activeMasterTab === 'timeline' && (
            <DashaTimeline
              currentMahadasha={kundli.dashas.currentMahadasha}
              currentAntardasha={kundli.dashas.currentAntardasha}
              allMahadashas={kundli.dashas.allMahadashas}
            />
          )}

          {/* TAB 14: PREDICTIONS */}
          {activeMasterTab === 'predictions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#111827] border border-[#2A3441]">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Method Integrated Predictions</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Parashari + KP Cuspal Sub-Lord + Harmonic Vargas</p>
                </div>
                <button
                  onClick={() => setShowEvidenceModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold"
                >
                  SHOW EVIDENCE
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(kundli.multiMethodPredictions || {}).map(([dom, pred]: [string, any]) => (
                  <div key={dom} className="p-5 rounded-2xl bg-[#111827] border border-[#2A3441] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm uppercase">{pred.title || dom}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                        {pred.integratedAssessment}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{pred.conflictResolutionSummary}</p>
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Integrity: {pred.accuracyMetrics?.calculationIntegrity}</span>
                      <span>KP Sub-Lord: {pred.methodologyOutputs?.kp?.verdict}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 15: REMEDIES */}
          {activeMasterTab === 'remedies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kundli.remedies?.map((rem: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#111827] border border-[#2A3441] space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {rem.planet} Remedy
                  </span>
                  <h4 className="font-bold text-white text-sm">{rem.title || rem.remedy}</h4>
                  <p className="text-xs text-slate-300">{rem.description || rem.instructions}</p>
                  <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                    Traditional practice â€¢ Completely non-commercial
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* MY LIFE BLUEPRINT â€” PREMIUM REPORT MODAL */}
      {showBlueprintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl border border-amber-400/40 bg-[#0A0E1A] p-6 md:p-8 shadow-2xl text-cosmic-text space-y-6">
            {/* Header with Celestial Emblem */}
            <div className="text-center space-y-1.5 border-b border-amber-500/20 pb-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 mb-1">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-wider">
                MY LIFE BLUEPRINT
              </h2>
              <p className="text-xs font-semibold tracking-widest text-amber-300/80 uppercase">
                Janam Kundli & Numerology Report â€¢ 5-Page Edition
              </p>
            </div>

            {/* Native & Chart Profile Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs bg-cosmic-card/50 p-4 rounded-2xl border border-cosmic-border/60">
              <div>
                <span className="text-[10px] text-cosmic-muted uppercase font-semibold block">Native Name</span>
                <span className="font-bold text-cosmic-text truncate block">{formData.name || 'Anonymous'}</span>
              </div>
              <div>
                <span className="text-[10px] text-cosmic-muted uppercase font-semibold block">Date of Birth</span>
                <span className="font-bold text-cosmic-text block">{formData.birthDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-cosmic-muted uppercase font-semibold block">Time of Birth</span>
                <span className="font-bold text-cosmic-text block">{formData.birthTime}</span>
              </div>
              <div>
                <span className="text-[10px] text-cosmic-muted uppercase font-semibold block">Birth Place</span>
                <span className="font-bold text-cosmic-text truncate block">{formData.birthPlace}</span>
              </div>
            </div>

            {/* Report Outline Spec & Page Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                  Publication Structure
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold">
                  5 A4 Luxury Pages
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-cosmic-surface border border-cosmic-border/60 text-center">
                  <div className="text-[10px] font-mono text-amber-400/80 font-bold">Page 01</div>
                  <div className="font-semibold text-cosmic-text mt-0.5">Profile & Snapshot</div>
                </div>
                <div className="p-2.5 rounded-xl bg-cosmic-surface border border-cosmic-border/60 text-center">
                  <div className="text-[10px] font-mono text-amber-400/80 font-bold">Page 02</div>
                  <div className="font-semibold text-cosmic-text mt-0.5">Rashi & Grahas</div>
                </div>
                <div className="p-2.5 rounded-xl bg-cosmic-surface border border-cosmic-border/60 text-center">
                  <div className="text-[10px] font-mono text-amber-400/80 font-bold">Page 03</div>
                  <div className="font-semibold text-cosmic-text mt-0.5">12 Bhavas Guide</div>
                </div>
                <div className="p-2.5 rounded-xl bg-cosmic-surface border border-cosmic-border/60 text-center">
                  <div className="text-[10px] font-mono text-amber-400/80 font-bold">Page 04</div>
                  <div className="font-semibold text-cosmic-text mt-0.5">Dashas & Transits</div>
                </div>
                <div className="p-2.5 rounded-xl bg-cosmic-surface border border-cosmic-border/60 text-center">
                  <div className="text-[10px] font-mono text-amber-400/80 font-bold">Page 05</div>
                  <div className="font-semibold text-cosmic-text mt-0.5">Remedies & Blueprint</div>
                </div>
              </div>
            </div>

            {/* Progressive Generation Status */}
            {blueprintStep !== 'idle' && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-3">
                  {blueprintStep !== 'ready' && blueprintStep !== 'error' && (
                    <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  )}
                  {blueprintStep === 'ready' && (
                    <span className="text-emerald-400 font-bold text-sm">âœ“</span>
                  )}
                  {blueprintStep === 'error' && (
                    <span className="text-red-400 font-bold text-sm">âš </span>
                  )}
                  <span className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                    {blueprintStep === 'preparing_chart' && 'Preparing chart & astronomical coordinates...'}
                    {blueprintStep === 'preparing_report' && 'Preparing report data adapter & fact sets...'}
                    {blueprintStep === 'generating_pdf' && 'Generating high-fidelity PDF layout...'}
                    {blueprintStep === 'quality_checks' && 'Running automated PDF quality validator...'}
                    {blueprintStep === 'ready' && 'Report Ready! Opening high-res publication...'}
                    {blueprintStep === 'error' && 'Quality Validation or Generation Error'}
                  </span>
                </div>
                {blueprintError && (
                  <p className="text-xs text-red-300 bg-red-950/40 p-2.5 rounded-xl border border-red-500/30">
                    {blueprintError}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-cosmic-border">
              <button
                type="button"
                onClick={() => setShowBlueprintModal(false)}
                disabled={blueprintStep !== 'idle' && blueprintStep !== 'ready' && blueprintStep !== 'error'}
                className="px-4 py-2 rounded-xl border border-cosmic-border bg-cosmic-card/60 hover:bg-cosmic-card text-cosmic-muted text-xs font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              {blueprintStep === 'error' ? (
                <button
                  type="button"
                  onClick={handleGenerateBlueprint}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-glow-gold flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateBlueprint}
                  disabled={blueprintStep !== 'idle' && blueprintStep !== 'ready'}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-xs transition-all shadow-glow-gold flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {blueprintStep === 'ready' ? 'Re-open Blueprint' : 'Generate Report'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <AstrologyEvidenceModal
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
        kundli={kundli}
      />
    </div>
  );
};

