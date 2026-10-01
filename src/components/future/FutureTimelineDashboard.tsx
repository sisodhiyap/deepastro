import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  ShieldCheck,
  Brain,
  Star,
  Clock,
  RefreshCw,
  AlertCircle,
  X,
  Layers,
  Activity,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  FileCheck,
  User,
  Users,
  Plus
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { getBirthProfile, StoredBirthProfile } from '../../utils/birthStorage.js';

interface SavedChart {
  id: string;
  name: string;
  relationship: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  calculationFingerprint?: string;
  isPrimary?: boolean;
}

export const FutureTimelineDashboard: React.FC = () => {
  // 1. Chart selection state
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [selectedChartId, setSelectedChartId] = useState<string>('primary');
  const [selectedChart, setSelectedChart] = useState<SavedChart | null>(null);
  const [showChartDropdown, setShowChartDropdown] = useState(false);
  const [showAddChartModal, setShowAddChartModal] = useState(false);

  // New chart form state
  const [newChartForm, setNewChartForm] = useState({
    name: '',
    relationship: 'Family Member',
    birthDate: '',
    birthTime: '',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    gender: 'Male',
  });

  // 2. Horizon range state (1, 3, 5, 10, 20)
  const [selectedYears, setSelectedYears] = useState<number>(5);

  // 3. Timeline Zoom state ('YEAR' | 'MONTH' | 'PERIOD')
  const [timelineZoom, setTimelineZoom] = useState<'YEAR' | 'MONTH' | 'PERIOD'>('YEAR');

  // 4. Forecast Data state
  const [forecast, setForecast] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 5. Expandable states
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [yearMonths, setYearMonths] = useState<Record<number, any[]>>({});
  const [loadingMonthsYear, setLoadingMonthsYear] = useState<number | null>(null);

  // 6. Evidence Drawer state
  const [activeEvidence, setActiveEvidence] = useState<{
    title: string;
    evidence: any[];
    year?: number;
    fingerprint?: string;
  } | null>(null);

  // 7. PDF Export status
  const [exportingPdf, setExportingPdf] = useState(false);

  // Fetch charts on mount
  useEffect(() => {
    fetchCharts();
  }, []);

  // Fetch forecast when selectedChartId or selectedYears change
  useEffect(() => {
    if (selectedChartId) {
      loadForecast(selectedChartId, selectedYears);
    }
  }, [selectedChartId, selectedYears]);

  const fetchCharts = async () => {
    try {
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const res = await fetch('/api/future-intelligence/charts', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.charts && data.charts.length > 0) {
          setCharts(data.charts);
          const current = data.charts.find((c: any) => c.id === selectedChartId) || data.charts[0];
          setSelectedChartId(current.id);
          setSelectedChart(current);
          return;
        }
      }

      // Fallback: local birth profile
      const local = getBirthProfile();
      if (local && local.birthDate) {
        const defaultChart: SavedChart = {
          id: 'primary',
          name: local.name || 'Primary Birth Chart',
          relationship: 'Self',
          birthDate: local.birthDate,
          birthTime: local.birthTime,
          birthPlace: local.birthPlace,
          calculationFingerprint: 'fp_local_verified',
          isPrimary: true,
        };
        setCharts([defaultChart]);
        setSelectedChart(defaultChart);
      }
    } catch (err) {
      console.warn('Failed to load saved charts:', err);
    }
  };

  const loadForecast = async (chartId: string, years: number, forceRecalc: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const localProfile = getBirthProfile();

      const res = await fetch('/api/future-intelligence/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          chartId,
          years,
          forceRecalculate: forceRecalc,
          birthProfile: localProfile || undefined,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.details || body.error || 'Failed to generate Future Intelligence forecast.');
      }

      setForecast(body);
      if (body.years && body.years.length > 0) {
        setExpandedYear(body.years[0].year);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load future prediction context.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMonthBreakdown = async (year: number) => {
    if (expandedYear === year && yearMonths[year]) {
      setExpandedYear(null);
      return;
    }
    setExpandedYear(year);

    if (!yearMonths[year] && forecast?.forecastId) {
      setLoadingMonthsYear(year);
      try {
        const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
        const res = await fetch(`/api/future-intelligence/${forecast.forecastId}/year/${year}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.months) {
            setYearMonths((prev) => ({ ...prev, [year]: data.months }));
          }
        }
      } catch (err) {
        console.warn('Failed to load month-by-month breakdown:', err);
      } finally {
        setLoadingMonthsYear(null);
      }
    }
  };

  const handleAddChart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('deepastro_token') || localStorage.getItem('token');
      const res = await fetch('/api/future-intelligence/charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newChartForm),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.chart) {
          setCharts((prev) => [...prev, data.chart]);
          setSelectedChartId(data.chart.id);
          setSelectedChart(data.chart);
          setShowAddChartModal(false);
        }
      }
    } catch (err) {
      console.warn('Failed to add chart:', err);
    }
  };

  // 8. Download Future Forecast PDF
  const downloadPdf = () => {
    if (!forecast) return;
    setExportingPdf(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      let y = 15;

      // Header Banner
      doc.setFillColor(10, 16, 32);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(56, 189, 248);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('DEEPASTRO FUTURE INTELLIGENCE', 15, y);

      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(226, 232, 240);
      doc.setFont('helvetica', 'normal');
      doc.text('Your Personal Vedic Timeline — Evidence-Driven Astrological Forecast', 15, y);

      y += 6;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Engine: ${forecast.predictionVersion} | Fingerprint: ${forecast.calculationFingerprint.slice(0, 16)}...`, 15, y);

      y = 45;
      // Chart Identity & Context
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`1. NATIVE CONTEXT: ${forecast.chartSummary?.name || 'Native'}`, 15, y);

      y += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Birth Place: ${forecast.chartSummary?.birthPlace} | Date: ${forecast.chartSummary?.birthDate}`, 15, y);
      y += 5;
      doc.text(`Ascendant (Lagna): ${forecast.chartSummary?.ascendantSign} | Moon Sign: ${forecast.chartSummary?.moonSign} | Sun Sign: ${forecast.chartSummary?.sunSign}`, 15, y);

      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.text(`2. CURRENT OPERATING CYCLE`, 15, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`Active Mahadasha: ${forecast.currentPeriod?.mahadasha} | Antardasha: ${forecast.currentPeriod?.antardasha} | Pratyantardasha: ${forecast.currentPeriod?.pratyantardasha}`, 15, y);
      y += 5;
      doc.text(`Next Transition: ${forecast.nextMajorTransition?.transitionDate} (${forecast.nextMajorTransition?.significance})`, 15, y);

      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.text(`3. MULTI-YEAR TIMELINE FORECAST (${forecast.forecastRange.replace('_', ' ')})`, 15, y);
      y += 6;

      // Iterate Years
      for (const yr of forecast.years || []) {
        if (y > 260) {
          doc.addPage();
          y = 15;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(`YEAR ${yr.year} — ${yr.overallTheme}`, 15, y);
        y += 5;

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(`Signal Strength: ${yr.signalStrength} | Confidence: ${yr.confidence} | Active Dasha: ${yr.activeDasha?.mahadasha}/${yr.activeDasha?.antardasha}`, 15, y);
        y += 5;

        // Life domains
        doc.text(`• Career: ${yr.career?.headline} — ${yr.career?.description.slice(0, 100)}...`, 15, y);
        y += 4.5;
        doc.text(`• Finance: ${yr.money?.headline} — ${yr.money?.description.slice(0, 100)}...`, 15, y);
        y += 4.5;
        doc.text(`• Relationships: ${yr.relationships?.headline} — ${yr.relationships?.description.slice(0, 100)}...`, 15, y);
        y += 4.5;
        doc.text(`• Health & Vitality: ${yr.health?.headline}`, 15, y);
        y += 6;
      }

      // Methodology & Ethical Notice
      if (y > 240) {
        doc.addPage();
        y = 15;
      }
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('METHODOLOGY & ETHICAL DISCLOSURE', 15, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const disclosureLines = doc.splitTextToSize(forecast.methodologyDisclosure, 180);
      doc.text(disclosureLines, 15, y);
      y += disclosureLines.length * 4 + 4;

      const ethicalLines = doc.splitTextToSize(forecast.ethicalNotice, 180);
      doc.text(ethicalLines, 15, y);

      doc.save(`DeepAstro_Future_Forecast_${selectedChart?.name || 'Native'}_${forecast.predictionVersion}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
      {/* 1. TOP HEADER & KUNDLI SELECTOR */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0c1427] via-[#090d19] to-[#06070a] border border-cyan-500/20 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>FUTURE INTELLIGENCE ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-satoshi text-white tracking-tight">
              Your Personal Vedic Timeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore multi-year future cycles derived from your verified Kundli, Vimshottari Dashas, planetary transits (Gochara), Shodashavargas (D1-D60), and numerological cycles.
            </p>
          </div>

          {/* Chart Selector Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowChartDropdown(!showChartDropdown)}
                className="w-full sm:w-auto text-left flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#111827]/90 border border-cyan-500/30 hover:border-cyan-400 text-slate-100 transition-all shadow-lg min-w-[240px]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">FORECAST FOR:</div>
                    <div className="text-xs font-bold text-white truncate max-w-[150px]">
                      {selectedChart?.name || 'Primary Birth Chart'}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {showChartDropdown && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0e1628] border border-cyan-500/30 p-2 shadow-2xl z-50 space-y-1">
                  <div className="text-[10px] font-mono font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                    SAVED KUNDLIS
                  </div>
                  {charts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedChartId(c.id);
                        setSelectedChart(c);
                        setShowChartDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        selectedChartId === c.id
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold truncate">{c.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {c.relationship} • {c.birthPlace}
                        </div>
                      </div>
                      {selectedChartId === c.id && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setShowChartDropdown(false);
                      setShowAddChartModal(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-2 pt-2 border-t border-slate-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Kundli (Family/Partner)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Download PDF Button */}
            <button
              onClick={downloadPdf}
              disabled={exportingPdf || !forecast}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-900/30 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exportingPdf ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>

        {/* Selected Chart Metadata strip */}
        {selectedChart && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span className="text-slate-300 font-bold">{selectedChart.name}</span>
            <span>•</span>
            <span>Birth Chart: {selectedChart.birthPlace}</span>
            <span>•</span>
            <span>DOB: {selectedChart.birthDate}</span>
            <span>•</span>
            <span className="text-cyan-400">Fingerprint: {selectedChart.calculationFingerprint?.slice(0, 12) || 'Verified'}...</span>
          </div>
        )}
      </div>

      {/* 2. HORIZON SELECTOR (1, 3, 5, 10, 20 YEARS) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-[#0c1220]/80 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pl-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>FORECAST HORIZON:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[1, 3, 5, 10, 20].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYears(yr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYears === yr
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {yr} {yr === 1 ? 'YEAR' : 'YEARS'}
            </button>
          ))}
        </div>

        {/* Timeline Zoom toggles */}
        <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl border border-slate-800">
          {(['YEAR', 'MONTH', 'PERIOD'] as const).map((zoom) => (
            <button
              key={zoom}
              onClick={() => setTimelineZoom(zoom)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                timelineZoom === zoom ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              {zoom}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-4">
          <Compass className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <div className="text-sm font-bold text-slate-200">
            Synthesizing Deterministic Future Intelligence...
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Processing planetary ephemeris, Gochara transits, 120-year Vimshottari cycles, and Shodashavargas for {selectedYears} years.
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            onClick={() => loadForecast(selectedChartId, selectedYears, true)}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-bold"
          >
            Retry
          </button>
        </div>
      ) : forecast ? (
        <div className="space-y-8 animate-fadeIn">
          {/* 3. CURRENT PERIOD & NEXT TRANSITION HIGHLIGHT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CURRENT PERIOD */}
            <div className="rounded-2xl bg-[#0f172a]/80 border border-cyan-500/30 p-5 space-y-2 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest">CURRENT OPERATING CYCLE</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-black text-white font-satoshi">
                {forecast.currentPeriod?.mahadasha} / {forecast.currentPeriod?.antardasha}
              </div>
              <div className="text-xs text-slate-300">
                Pratyantardasha: <span className="font-semibold text-cyan-300">{forecast.currentPeriod?.pratyantardasha}</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Active Cycle: {forecast.currentPeriod?.startDate} to {forecast.currentPeriod?.endDate}
              </div>
            </div>

            {/* NEXT MAJOR TRANSITION */}
            <div className="rounded-2xl bg-[#0f172a]/80 border border-amber-500/30 p-5 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest">NEXT MAJOR TRANSITION</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-black text-amber-300 font-satoshi">
                {forecast.nextMajorTransition?.transitionDate}
              </div>
              <div className="text-xs text-slate-300 line-clamp-1">
                From {forecast.nextMajorTransition?.fromDasha} to {forecast.nextMajorTransition?.toDasha}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {forecast.nextMajorTransition?.significance}
              </p>
            </div>

            {/* NEXT SIGNIFICANT WINDOW */}
            <div className="rounded-2xl bg-[#0f172a]/80 border border-emerald-500/30 p-5 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest">NEXT SIGNIFICANT WINDOW</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-base font-bold text-emerald-300 truncate">
                {forecast.nextSignificantWindow?.startDate} – {forecast.nextSignificantWindow?.endDate}
              </div>
              <div className="text-xs text-slate-200 font-semibold truncate">
                {forecast.nextSignificantWindow?.category?.replace(/_/g, ' ')}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {forecast.nextSignificantWindow?.theme}
              </p>
            </div>
          </div>

          {/* 4. YEAR TIMELINE CARDS */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-lg font-black font-satoshi text-white">
                  Multi-Year Trajectory ({forecast.years?.length} Years)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Calculated: {forecast.chartSummary?.calculationDate}
              </span>
            </div>

            <div className="space-y-6">
              {forecast.years?.map((yr: any) => {
                const isExpanded = expandedYear === yr.year;
                const months = yearMonths[yr.year];

                return (
                  <div
                    key={yr.year}
                    className="rounded-3xl bg-gradient-to-b from-[#0f172a] to-[#0a0f1d] border border-slate-800 hover:border-slate-700/80 transition-all p-5 sm:p-7 space-y-6 shadow-xl"
                  >
                    {/* Year Card Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-black font-satoshi text-white tracking-tight">
                            {yr.year}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                            Astrological Signal Strength: {yr.signalStrength}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Confidence: {yr.confidence} ({yr.confidenceScore}%)
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-slate-200">
                          {yr.overallTheme}
                        </div>
                      </div>

                      {/* Active Dasha & Transit tags */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-400/30 text-purple-300 font-bold">
                          Dasha: {yr.activeDasha?.mahadasha} / {yr.activeDasha?.antardasha}
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 font-bold">
                          Personal Year {yr.numerologySignals?.personalYear}
                        </span>
                      </div>
                    </div>

                    {/* 8 Life Domains Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Career */}
                      <div className="p-4 rounded-2xl bg-[#090d16]/80 border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">CAREER & STATUS</span>
                        <div className="text-xs font-bold text-slate-100">{yr.career?.headline}</div>
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{yr.career?.description}</p>
                      </div>

                      {/* Finance */}
                      <div className="p-4 rounded-2xl bg-[#090d16]/80 border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">FINANCE & ASSETS</span>
                        <div className="text-xs font-bold text-slate-100">{yr.money?.headline}</div>
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{yr.money?.description}</p>
                      </div>

                      {/* Relationships */}
                      <div className="p-4 rounded-2xl bg-[#090d16]/80 border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">RELATIONSHIPS</span>
                        <div className="text-xs font-bold text-slate-100">{yr.relationships?.headline}</div>
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{yr.relationships?.description}</p>
                      </div>

                      {/* Health / Wellness */}
                      <div className="p-4 rounded-2xl bg-[#090d16]/80 border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">WELLNESS & ROUTINE</span>
                        <div className="text-xs font-bold text-slate-100">{yr.health?.headline}</div>
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{yr.health?.description}</p>
                      </div>
                    </div>

                    {/* Additional 4 Domains Compact Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#090d16]/40 p-3 rounded-2xl border border-slate-800/50">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Family</span>
                        <span className="text-[11px] text-slate-300 font-medium">{yr.family?.headline}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Education</span>
                        <span className="text-[11px] text-slate-300 font-medium">{yr.education?.headline}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Travel</span>
                        <span className="text-[11px] text-slate-300 font-medium">{yr.travel?.headline}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Spirituality</span>
                        <span className="text-[11px] text-slate-300 font-medium">{yr.spirituality?.headline}</span>
                      </div>
                    </div>

                    {/* Major Gochara Transits in this Year */}
                    {yr.majorTransits && yr.majorTransits.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-3 text-xs font-mono">
                        <span className="text-slate-400 font-bold uppercase">Major Transits:</span>
                        {yr.majorTransits.map((mt: any, idx: number) => (
                          <span key={idx} className="px-2 py-1 rounded-md bg-slate-800 text-slate-200">
                            {mt.planet} in {mt.sign} (H{mt.houseFromLagna})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Important & Caution Windows */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        {yr.importantWindows?.map((win: any, idx: number) => (
                          <div key={idx} className="text-cyan-300 font-medium">
                            <span className="font-mono text-cyan-400 font-bold">Signal Window:</span> {win.startDate} – {win.endDate} ({win.theme})
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Evidence Button */}
                        <button
                          onClick={() =>
                            setActiveEvidence({
                              title: `Calculation Evidence for ${yr.year}`,
                              evidence: yr.evidence || [],
                              year: yr.year,
                              fingerprint: forecast.calculationFingerprint,
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Why am I seeing this?</span>
                        </button>

                        {/* Month-by-Month Toggle */}
                        <button
                          onClick={() => toggleMonthBreakdown(yr.year)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <span>{isExpanded ? 'Hide Months' : 'View Month-by-Month'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Month-by-Month Accordion Content */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                            {yr.year} MONTH-BY-MONTH VEDIC TIMELINE
                          </span>
                          {loadingMonthsYear === yr.year && (
                            <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(months || yr.months || []).map((m: any) => (
                            <div
                              key={m.month}
                              className="p-3.5 rounded-2xl bg-[#070b14] border border-slate-800/80 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                <span className="font-bold text-white font-satoshi text-sm">
                                  {m.monthName}
                                </span>
                                <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                                  {m.dasha?.mahadasha}/{m.dasha?.antardasha}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-snug">
                                {m.keyThemes?.[0] || 'Focused integration period.'}
                              </p>
                              <div className="text-[10px] text-emerald-400 font-medium">
                                {m.supportiveWindow}
                              </div>
                              <div className="text-[10px] text-amber-400 font-medium">
                                {m.cautionWindow}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. METHODOLOGY & ETHICAL DISCLOSURE */}
          <div className="rounded-3xl bg-[#090d16] border border-slate-800 p-6 space-y-3 text-xs text-slate-400 leading-relaxed">
            <div className="flex items-center gap-2 text-slate-200 font-bold font-satoshi text-sm">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>How This Forecast Is Calculated</span>
            </div>
            <p>{forecast.methodologyDisclosure}</p>
            <p className="text-slate-500 italic pt-1 border-t border-slate-800/80">
              {forecast.ethicalNotice}
            </p>
          </div>
        </div>
      ) : null}

      {/* 6. EVIDENCE DRAWER MODAL ("Why am I seeing this?") */}
      {activeEvidence && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-3xl bg-[#0c1322] border border-cyan-500/40 p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{activeEvidence.title}</h4>
                  <div className="text-[10px] font-mono text-cyan-400">
                    Fingerprint: {activeEvidence.fingerprint?.slice(0, 20)}...
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveEvidence(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 text-xs">
              <p className="text-slate-400 leading-relaxed">
                DeepAstro prediction signals are strictly grounded in deterministic astronomical mechanics. Here is the verified calculation evidence behind this period:
              </p>

              {activeEvidence.evidence?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#070b14] border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-cyan-400 uppercase">[{item.source}] {item.rule}</span>
                    <span className="text-slate-500">Weight: {(item.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-slate-200 text-xs font-medium">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveEvidence(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ADD NEW KUNDLI MODAL */}
      {showAddChartModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-3xl bg-[#0c1322] border border-cyan-500/30 p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">Add New Kundli</h4>
              <button
                onClick={() => setShowAddChartModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddChart} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newChartForm.name}
                  onChange={(e) => setNewChartForm({ ...newChartForm, name: e.target.value })}
                  placeholder="e.g. Partner, Child, Family Member"
                  className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Relationship</label>
                  <select
                    value={newChartForm.relationship}
                    onChange={(e) => setNewChartForm({ ...newChartForm, relationship: e.target.value })}
                    className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Partner">Partner</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Family Member">Family Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Gender</label>
                  <select
                    value={newChartForm.gender}
                    onChange={(e) => setNewChartForm({ ...newChartForm, gender: e.target.value })}
                    className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Birth Date</label>
                  <input
                    type="date"
                    required
                    value={newChartForm.birthDate}
                    onChange={(e) => setNewChartForm({ ...newChartForm, birthDate: e.target.value })}
                    className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Birth Time</label>
                  <input
                    type="time"
                    required
                    value={newChartForm.birthTime}
                    onChange={(e) => setNewChartForm({ ...newChartForm, birthTime: e.target.value })}
                    className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Birth Place</label>
                <input
                  type="text"
                  required
                  value={newChartForm.birthPlace}
                  onChange={(e) => setNewChartForm({ ...newChartForm, birthPlace: e.target.value })}
                  className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddChartModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Kundli
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
