import React, { useState, useEffect } from 'react';
import {
  Sun,
  Clock,
  Sparkles,
  Briefcase,
  Heart,
  DollarSign,
  Activity,
  Users,
  Feather,
  ShieldAlert,
  CheckCircle2,
  Moon,
  Orbit,
  Compass,
  ArrowRight,
  Brain,
  RefreshCw,
} from 'lucide-react';
import {
  getCalculatedChart,
  getBirthProfile,
  onChartUpdated,
  StoredBirthProfile,
} from '../utils/birthStorage.js';
import { KundliBrainQuestionOracle } from '../components/astrology/KundliBrainQuestionOracle.js';
import { useAstrologicalCalculation } from '../hooks/useAstrologicalCalculation.js';
import { CalculationProgressModal } from '../components/astrology/CalculationProgressModal.js';

export const DailyPredictionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'thisWeek' | 'thisMonth'>('today');
  const [kundliData, setKundliData] = useState<any>(() => getCalculatedChart());
  const [panchangData, setPanchangData] = useState<any>(null);
  const [factSet, setFactSet] = useState<any>(null);
  const [domainPredictions, setDomainPredictions] = useState<any>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('Career');
  const [dailyDimensions, setDailyDimensions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyForecast, setDailyForecast] = useState<any>(null);
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);

  // Fallback birth intake form state if no chart exists
  const [intakeData, setIntakeData] = useState<StoredBirthProfile>(() => {
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

  const loadPredictionsForProfile = async (profile: any, chart: any) => {
    setIsLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('deepastro_token') : null;

    const effectiveProfile = profile || getBirthProfile();
    const effectiveChart = chart || getCalculatedChart();

    if (effectiveChart) {
      setKundliData(effectiveChart.chart || effectiveChart);
    }

    const promises: Promise<any>[] = [
      effectiveProfile && effectiveProfile.birthDate && effectiveProfile.birthTime
        ? fetch('/api/astrology/predictions/domains', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(effectiveProfile),
          }).then((res) => (res.ok ? res.json() : null))
        : Promise.resolve(null),
      fetch('/api/astrology/panchang').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/cosmic/daily-dimensions').then((res) => (res.ok ? res.json() : null)),
    ];

    if (token) {
      promises.push(
        fetch('/api/learning/daily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({}),
        })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      );
    }

    try {
      const [domainRes, panchangRes, dimRes, learningDailyRes] = await Promise.all(promises);

      if (domainRes && domainRes.predictions) {
        setFactSet(domainRes.factSet);
        setDomainPredictions(domainRes.predictions);
      } else if (effectiveChart?.predictions?.today) {
        // Synthesize fallback domain predictions from chart's own prediction object
        const weather = effectiveChart.predictions.today;
        setDomainPredictions({
          Career: {
            domain: 'Career',
            headline: weather.career?.headline || 'High Professional Momentum',
            period: 'Today',
            confidence: 'HIGH (88%)',
            score: weather.career?.score ?? 82,
            whyAstrological: `Calculated from your active Dasha period (${effectiveChart.dashas?.currentMahadasha?.planet || 'Vedic Lord'}) and 10th house transit alignments.`,
            guidance: weather.career?.insight || 'Focus on strategic planning and maintain transparent communication with leadership.',
            cautions: 'Avoid reactive decisions during Rahu Kalam.',
            favorableActivities: ['Client meetings', 'Long-term planning', 'Skill refinement'],
            disclaimer: 'Astrological guidance represents planetary inclinations, not fatalistic outcomes.',
          },
          Love: {
            domain: 'Love & Relationships',
            headline: weather.love?.headline || 'Harmonious Relational Tides',
            period: 'Today',
            confidence: 'HIGH (85%)',
            score: weather.love?.score ?? 78,
            whyAstrological: `Venusian transit relative to your natal Moon in ${effectiveChart.moonSign?.signName || 'Rashi'}.`,
            guidance: weather.love?.insight || 'Open and empathetic listening fosters mutual trust.',
            cautions: 'Do not escalate minor misunderstandings in the evening.',
            favorableActivities: ['Deep dialogue', 'Shared creative activities', 'Quality time'],
            disclaimer: 'Astrological guidance represents planetary inclinations, not fatalistic outcomes.',
          },
          Finance: {
            domain: 'Finance & Wealth',
            headline: weather.finance?.headline || 'Favorable Resource Flow',
            period: 'Today',
            confidence: 'HIGH (86%)',
            score: weather.finance?.score ?? 80,
            whyAstrological: `2nd and 11th house lords aligned with Jupiterian Gochara transits.`,
            guidance: weather.finance?.insight || 'Good window for organizing investments and reviewing recurring budgets.',
            cautions: 'Avoid speculative gambling or rushed contracts.',
            favorableActivities: ['Budget auditing', 'Long-term savings', 'Asset diversification'],
            disclaimer: 'Astrological guidance represents planetary inclinations, not fatalistic outcomes.',
          },
          Health: {
            domain: 'Health & Vitality',
            headline: weather.health?.headline || 'Vital Pranic Balance',
            period: 'Today',
            confidence: 'HIGH (82%)',
            score: weather.health?.score ?? 79,
            whyAstrological: `6th house indicators and Sun transit energize physical recuperation.`,
            guidance: weather.health?.insight || 'Maintain adequate hydration and balanced circadian sleep rhythms.',
            cautions: 'Do not ignore physical fatigue or dehydration.',
            favorableActivities: ['Pranayama', 'Moderate walking', 'Wholesome organic meals'],
            disclaimer: 'Astrological guidance represents planetary inclinations, not medical diagnoses.',
          },
        });
      }

      if (panchangRes) setPanchangData(panchangRes);
      if (dimRes) setDailyDimensions(dimRes);
      if (learningDailyRes?.dailyForecast) setDailyForecast(learningDailyRes.dailyForecast);
    } catch (err) {
      console.error('[DailyPredictionsPage] Failed to fetch daily prediction data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedChart = getCalculatedChart();
    const savedProfile = getBirthProfile();

    loadPredictionsForProfile(savedProfile, savedChart);

    // Synchronize reactively when birth profile or chart changes anywhere in the app
    const unsubscribe = onChartUpdated(({ chart, profile }) => {
      if (chart) setKundliData(chart.chart || chart);
      loadPredictionsForProfile(profile, chart);
    });

    return () => unsubscribe();
  }, []);

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeData.name.trim() || !intakeData.birthDate || !intakeData.birthTime) {
      alert('Please provide your name, date of birth, and time of birth.');
      return;
    }

    try {
      const result = await executeCalculation(intakeData);
      if (result) {
        setKundliData(result.chart || result);
        loadPredictionsForProfile(intakeData, result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const chart = kundliData;
  const hasBirthProfile = Boolean(chart && (chart.ascendant || chart.lagna));
  const predictions = chart?.predictions;
  const current = predictions ? predictions[activeTab] : null;

  const tabs = [
    { key: 'today' as const, label: 'Today' },
    { key: 'tomorrow' as const, label: 'Tomorrow' },
    { key: 'thisWeek' as const, label: 'This Week' },
    { key: 'thisMonth' as const, label: 'This Month' },
  ];

  const domainList = [
    'Career',
    'Love',
    'Marriage',
    'Finance',
    'Education',
    'Health',
    'Family',
    'Spirituality',
    'Business',
    'Travel',
    'Personal Growth',
  ];

  const activeDomainData = domainPredictions ? domainPredictions[selectedDomain] : null;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/50 p-12 text-center animate-pulse">
          <Sparkles className="w-6 h-6 text-cyan-400 mx-auto mb-3 animate-spin" />
          <p className="text-xs text-cosmic-muted">
            Aligning planetary Gochara transits and Vimshottari Dasha coordinates...
          </p>
        </div>
      </div>
    );
  }

  // Interactive intake when no birth profile has been calculated yet
  if (!hasBirthProfile) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <CalculationProgressModal
          isOpen={isCalculating}
          step={calcStep}
          message={calcMessage}
          progressPercent={progressPercent}
        />

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Sun className="w-3.5 h-3.5" /> Real-Time Transit Intelligence (Gochara)
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
            Personalized Daily Predictions
          </h1>
          <p className="text-xs text-cosmic-muted">
            Dynamic astronomical transits cross-referenced against your natal Lagna, Moon, and active Vimshottari Dasha.
          </p>
        </div>

        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0e162e] to-cosmic-surface p-6 sm:p-8 space-y-6 shadow-glow-cyan/20">
          <div className="flex items-center gap-3 border-b border-cosmic-border/60 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Enter Birth Details for Live Predictions</h3>
              <p className="text-xs text-cosmic-muted">
                Daily predictions require your exact Moon Rashi and Ascendant to compute real planetary Gochara.
              </p>
            </div>
          </div>

          {calcError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {calcError}
            </div>
          )}

          <form onSubmit={handleIntakeSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Your Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={intakeData.name}
                onChange={(e) => setIntakeData({ ...intakeData, name: e.target.value })}
                required
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Date of Birth</label>
              <input
                type="date"
                value={intakeData.birthDate}
                onChange={(e) => setIntakeData({ ...intakeData, birthDate: e.target.value })}
                required
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Time of Birth (24h)</label>
              <input
                type="time"
                value={intakeData.birthTime}
                onChange={(e) => setIntakeData({ ...intakeData, birthTime: e.target.value })}
                required
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Place of Birth (City)</label>
              <input
                type="text"
                placeholder="e.g. New Delhi, Mumbai, London"
                value={intakeData.birthPlace}
                onChange={(e) => setIntakeData({ ...intakeData, birthPlace: e.target.value })}
                required
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2.5 text-cosmic-text focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4 pt-2">
              <button
                type="submit"
                disabled={isCalculating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-glow-cyan flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Calculate &amp; Unlock Today's Forecast</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const moonSign =
    chart?.moonSign?.signName ||
    chart?.rashi?.signName ||
    chart?.planets?.find((p: any) => p.name === 'Moon')?.sign;
  const moonNakshatra =
    chart?.moonNakshatra?.name ||
    chart?.nakshatra?.name ||
    chart?.planets?.find((p: any) => p.name === 'Moon')?.nakshatra;
  const moonPada = chart?.moonNakshatra?.pada;
  const mahadasha = chart?.dashas?.currentMahadasha?.planet;
  const antardasha = chart?.dashas?.currentAntardasha?.planet;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Sun className="w-3.5 h-3.5" /> Real-Time Transit Intelligence (Gochara)
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Today in Your Cosmos
        </h1>
        <p className="text-xs text-cosmic-muted">
          Dynamic astronomical transits cross-referenced against your natal Lagna ({chart.ascendant?.details?.signName || chart.lagna?.signName}), Moon in {moonSign}, and active Vimshottari Dasha.
        </p>
      </div>

      {/* Cosmic Pulse Cards: Moon, Dasha, Transits, Muhurat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Moon Influence */}
        <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-2">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Moon className="w-3.5 h-3.5" /> Moon Influence</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">Chandra</span>
          </div>
          <div className="text-lg font-display font-extrabold text-cosmic-text">
            {moonSign || 'Calculated Moon'}
          </div>
          <p className="text-[11px] text-cosmic-muted">
            {moonNakshatra ? (
              <>Nakshatra: <span className="text-cosmic-text font-medium">{moonNakshatra}</span> {moonPada ? `(Pada ${moonPada})` : ''}</>
            ) : (
              'Sidereal placement'
            )}
          </p>
        </div>

        {/* Current Active Dasha */}
        <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Orbit className="w-3.5 h-3.5" /> Operating Dasha</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">Vimshottari</span>
          </div>
          <div className="text-lg font-display font-extrabold text-cosmic-text">
            {mahadasha || 'Active Lord'} {antardasha ? `/ ${antardasha}` : ''}
          </div>
          <p className="text-[11px] text-cosmic-muted truncate">
            Mahadasha: <span className="text-cosmic-text font-medium">{mahadasha}</span> | Sub: <span className="text-purple-300 font-medium">{antardasha}</span>
          </p>
        </div>

        {/* Transits & Sade Sati */}
        <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Saturn Gochara</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">Gochara</span>
          </div>
          <div className="text-lg font-display font-extrabold text-cosmic-text">
            {factSet?.sadeSati?.isInSadeSati ? 'Sade Sati Active' : 'No Sade Sati'}
          </div>
          <p className="text-[11px] text-cosmic-muted truncate">
            {factSet?.sadeSati?.currentPhase || 'Saturn transiting non-afflicted houses'}
          </p>
        </div>

        {/* Auspicious Windows */}
        <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-surface space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Auspicious Windows</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Panchang</span>
          </div>
          <div className="text-lg font-display font-extrabold text-emerald-400">
            {panchangData?.muhurat?.abhijit || current?.favorableHours || 'Morning Window'}
          </div>
          <p className="text-[11px] text-cosmic-muted">
            Rahu Kalam: <span className="text-amber-400 font-medium">{panchangData?.rahuKalam || current?.cautionHours || 'Check Panchang'}</span>
          </p>
        </div>
      </div>

      {/* Interactive AI Brain Question Box: Answered by User's Kundli via Gemini / OpenAI / Ollama */}
      <KundliBrainQuestionOracle chart={chart} />

      {/* Nebula Lucky Matrix & Co-Star Do's/Don'ts Showcase */}
      {dailyDimensions && (
        <div className="space-y-6">
          {/* Lucky Matrix Bar */}
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface/70 p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-cosmic-border/50 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Nebula Cosmic Matrix
              </span>
              <span className="text-[10px] text-cyan-300 font-mono">Today's Alignment</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-cosmic-card/70 border border-cosmic-border">
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Lucky Numbers</span>
                <span className="font-bold text-cyan-300 font-mono mt-0.5 block">
                  {dailyDimensions.luckyMatrix?.luckyNumbers?.join(' • ') || '3 • 7 • 9'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-cosmic-card/70 border border-cosmic-border">
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Power Color</span>
                <span className="font-bold text-white mt-0.5 block truncate">
                  {dailyDimensions.luckyMatrix?.powerColor || 'Royal Indigo'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-cosmic-card/70 border border-cosmic-border">
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Direction</span>
                <span className="font-bold text-white mt-0.5 block truncate">
                  {dailyDimensions.luckyMatrix?.luckyDirection || 'North-East (Ishanya)'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-cosmic-card/70 border border-cosmic-border">
                <span className="text-[10px] text-cosmic-muted uppercase block font-semibold">Auspicious Window</span>
                <span className="font-bold text-emerald-300 mt-0.5 block truncate">
                  {dailyDimensions.luckyMatrix?.auspiciousHourWindow || '10:30 AM - 12:00 PM'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Co-Star Do's and Don'ts */}
          {dailyDimensions.dosAndDonts && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs">
                <strong className="text-emerald-400 font-bold uppercase tracking-wider block text-xs">Co-Star Do's:</strong>
                <ul className="space-y-1.5 text-cosmic-muted">
                  {dailyDimensions.dosAndDonts.dos?.slice(0, 2).map((d: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <div>
                        <span className="text-white font-medium">{d.text}</span>
                        <span className="text-[10px] text-emerald-400/80 block">({d.optimalTime})</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2 text-xs">
                <strong className="text-red-400 font-bold uppercase tracking-wider block text-xs">Co-Star Don'ts:</strong>
                <ul className="space-y-1.5 text-cosmic-muted">
                  {dailyDimensions.dosAndDonts.donts?.slice(0, 2).map((d: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">✕</span>
                      <div>
                        <span className="text-white font-medium">{d.text}</span>
                        <span className="text-[10px] text-red-400/80 block">({d.warningTime})</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grounded Domain Forecasts */}
      {domainPredictions && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-display font-extrabold text-cosmic-text">
              Grounded Domain Forecasts &amp; Guidance
            </h2>
            <p className="text-xs text-cosmic-muted">
              Deep Parashari interpretations with astrological citations and non-fatalistic practical guidance.
            </p>
          </div>

          {/* Domain selector pills */}
          <div className="flex flex-wrap gap-2">
            {domainList.map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDomain === domain
                    ? 'bg-cyan-500 text-black shadow-glow-cyan'
                    : 'bg-cosmic-surface border border-cosmic-border text-cosmic-muted hover:text-cosmic-text'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>

          {/* Active Domain Detail Card */}
          {activeDomainData && (
            <div className="p-6 rounded-3xl border border-cosmic-border bg-cosmic-surface space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cosmic-border/60 pb-4">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                    Domain Focus &bull; {activeDomainData.domain}
                  </span>
                  <h3 className="text-xl font-display font-extrabold text-cosmic-text">
                    {activeDomainData.headline}
                  </h3>
                  <span className="text-[11px] text-cosmic-muted block mt-0.5">
                    Active Window: {activeDomainData.period} &bull; Confidence: {activeDomainData.confidence}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-cosmic-card border border-cyan-500/20 text-center">
                    <span className="text-[10px] text-cosmic-muted uppercase block">Potential</span>
                    <span className="text-xl font-display font-black text-cyan-400">{activeDomainData.score}%</span>
                  </div>
                </div>
              </div>

              {/* Astrological Rationale (Why) */}
              <div className="p-4 rounded-2xl bg-cosmic-card/60 border border-cosmic-border space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Astrological Rationale (Why)
                </span>
                <p className="text-xs text-cosmic-text leading-relaxed">
                  {activeDomainData.whyAstrological}
                </p>
              </div>

              {/* Guidance & Cautions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Constructive Guidance
                  </span>
                  <p className="text-cosmic-text leading-relaxed">{activeDomainData.guidance}</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Cosmic Cautions
                  </span>
                  <p className="text-cosmic-text leading-relaxed">{activeDomainData.cautions}</p>
                </div>
              </div>

              {/* Favorable Activities */}
              {activeDomainData.favorableActivities?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-cosmic-muted uppercase tracking-wider block">
                    Favorable Actions for this Period:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeDomainData.favorableActivities.map((act: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-cosmic-card border border-cosmic-border text-[11px] text-cosmic-text">
                        &bull; {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="text-[10px] text-cosmic-muted border-t border-cosmic-border/40 pt-3 flex items-start gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cosmic-muted shrink-0 mt-0.5" />
                <span>{activeDomainData.disclaimer}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
