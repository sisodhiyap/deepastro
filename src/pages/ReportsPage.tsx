import React, { useState } from 'react';
import { FileText, Download, Printer, Sparkles, CheckCircle2, Eye, User, Calendar, Clock, MapPin } from 'lucide-react';
import { getBirthProfile } from '../utils/birthStorage.js';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('BLUEPRINT_5PAGE');
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Native birth details state for dynamic report generation
  const [birthData, setBirthData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    latitude: '',
    longitude: '',
    timezone: '5.5',
    gender: 'Other',
  });

  // Automatically load saved chart profile if one exists
  React.useEffect(() => {
    const saved = getBirthProfile();
    if (saved?.name && saved?.birthDate) {
      setBirthData({
        name: saved.name,
        birthDate: saved.birthDate,
        birthTime: saved.birthTime || '',
        birthPlace: saved.birthPlace || '',
        latitude: saved.latitude || '',
        longitude: saved.longitude || '',
        timezone: saved.timezone || '5.5',
        gender: saved.gender || 'Other',
      });
    }

    fetch('/api/astrology/chart')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const bd = data?.birthData || data?.chart?.birthData;
        if (bd && bd.name && bd.birthDate) {
          setBirthData({
            name: bd.name,
            birthDate: bd.birthDate,
            birthTime: bd.birthTime || '',
            birthPlace: bd.birthPlace || '',
            latitude: bd.latitude?.toString() || '',
            longitude: bd.longitude?.toString() || '',
            timezone: bd.timezone?.toString() || '5.5',
            gender: bd.gender || 'Other',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setErrorMsg(null);
    if (!birthData.name || !birthData.birthDate || !birthData.birthTime || !birthData.birthPlace) {
      setErrorMsg('Please enter the native\'s Full Name, Birth Date, Birth Time, and Birth Place before generating the report.');
      return;
    }

    setIsGenerating(true);
    try {
      if (reportType === 'BLUEPRINT_5PAGE') {
        const res = await fetch('/api/reports/blueprint/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthData: {
              name: birthData.name.trim(),
              birthDate: birthData.birthDate,
              birthTime: birthData.birthTime,
              birthPlace: birthData.birthPlace.trim(),
              latitude: birthData.latitude ? parseFloat(birthData.latitude) : undefined,
              longitude: birthData.longitude ? parseFloat(birthData.longitude) : undefined,
              timezone: birthData.timezone ? parseFloat(birthData.timezone) : 5.5,
              gender: birthData.gender,
            },
            chartStyle: 'north',
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.details || errData.error || 'Failed to generate My Life Blueprint.');
        }

        const data = await res.json();
        const rep = data.report;
        setGeneratedReport({
          id: data.id || rep.metadata?.reportId,
          title: 'MY LIFE BLUEPRINT — JANAM KUNDLI & NUMEROLOGY REPORT',
          native: { name: rep.profile.name },
          executiveSummary: rep.finalBlueprint?.executiveSummary || 'Comprehensive 5-Page luxury Vedic Blueprint synthesized from verified sidereal ephemeris.',
          htmlUrl: data.htmlUrl,
          isBlueprint: true,
          pageCount: 5,
          astronomy: {
            ascendantSign: rep.snapshot.ascendantSign,
            moonSign: rep.snapshot.moonSign,
            nakshatra: `${rep.snapshot.nakshatra} (Pada ${rep.snapshot.nakshatraPada})`,
            currentMahadasha: `${rep.activeDasha?.currentMahadasha} / ${rep.activeDasha?.currentAntardasha}`,
          },
        });
      } else {
        const res = await fetch('/api/reports/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportType,
            birthData: {
              name: birthData.name.trim(),
              birthDate: birthData.birthDate,
              birthTime: birthData.birthTime,
              birthPlace: birthData.birthPlace.trim(),
              latitude: birthData.latitude ? parseFloat(birthData.latitude) : undefined,
              longitude: birthData.longitude ? parseFloat(birthData.longitude) : undefined,
              timezone: birthData.timezone ? parseFloat(birthData.timezone) : 5.5,
              gender: birthData.gender,
            },
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.details || errData.error || 'Failed to generate report.');
        }

        const data = await res.json();
        setGeneratedReport(data);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during report generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const reportOptions = [
    {
      id: 'BLUEPRINT_5PAGE',
      title: 'My Life Blueprint (5-Page Luxury Janam Kundli)',
      desc: 'Flagship publication: 12-House guide, planetary sphuta, Vimshottari dasha progression, transit trends, numerology & actionable life blueprint.',
      badge: 'Gold Publication Edition',
      isPrimary: true,
    },
    { id: 'FULL_KUNDLI', title: 'Complete Natal Kundli Dossier', desc: '12 Bhavas, D1/D9/D10 charts, Yogas, Doshas, and 120-year Vimshottari progression.' },
    { id: 'CAREER_WEALTH', title: '10th House Career & Karma Analysis', desc: 'Dashamsha (D10) professional alignments, auspicious career timing, and wealth indicators.' },
    { id: 'RELATIONSHIP_MILAN', title: 'Kundli Milan & Marriage Compatibility', desc: '36-point Ashtakoota scorecard, emotional compatibility, and joint remedial measures.' },
    { id: 'ANNUAL_FORECAST', title: 'Annual Transit & Gochar Life Forecast', desc: 'Month-by-month cosmic weather, major planetary shifts, and lucky milestones.' },
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" /> Archival Intelligence
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Astrological Reports &amp; PDF Dossiers
        </h1>
        <p className="text-xs text-cosmic-muted">
          Generate comprehensive, publication-grade Vedic reports grounded in deterministic sidereal ephemeris calculations.
        </p>
      </div>

      {/* Native Birth Details Card */}
      <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 shadow-cosmic-card space-y-4">
        <div className="flex items-center justify-between border-b border-cosmic-border/60 pb-3">
          <h3 className="text-sm font-display font-extrabold text-cosmic-text flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Target Native Birth Profile</span>
          </h3>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Required for Dynamic Recalculation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-cosmic-muted block mb-1 font-semibold">Full Name *</label>
            <input
              type="text"
              placeholder="Enter recipient's full name"
              value={birthData.name}
              onChange={(e) => setBirthData({ ...birthData, name: e.target.value })}
              className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-cosmic-muted block mb-1 font-semibold">Date of Birth *</label>
            <input
              type="date"
              value={birthData.birthDate}
              onChange={(e) => setBirthData({ ...birthData, birthDate: e.target.value })}
              className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-cosmic-muted block mb-1 font-semibold">Time of Birth *</label>
            <input
              type="time"
              value={birthData.birthTime}
              onChange={(e) => setBirthData({ ...birthData, birthTime: e.target.value })}
              className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-cosmic-muted block mb-1 font-semibold">Birth Place (City / Country) *</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, India or London"
              value={birthData.birthPlace}
              onChange={(e) => setBirthData({ ...birthData, birthPlace: e.target.value })}
              className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3.5 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportOptions.map((opt) => {
          const isSelected = reportType === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setReportType(opt.id)}
              className={`rounded-2xl border p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-glow-cyan/20'
                  : 'border-cosmic-border bg-cosmic-surface hover:border-cosmic-border/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-cosmic-text">{opt.title}</h4>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-cyan-400 bg-cyan-500' : 'border-cosmic-border'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </div>
                <p className="text-xs text-cosmic-muted mt-2 leading-relaxed">{opt.desc}</p>
              </div>

              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mt-4">
                PDF &amp; Print Ready
              </span>
            </div>
          );
        })}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Generate Action */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-extrabold text-xs uppercase tracking-wider transition-all shadow-glow-cyan flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Calculating Astronomical Coordinates & Compiling...' : 'Generate Astrological Report'}</span>
        </button>
      </div>

      {/* Generated Report Preview Card */}
      {generatedReport && (
        <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-8 space-y-6 shadow-cosmic-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cosmic-border/60 pb-6">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                Generated Dossier #{generatedReport.id}
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-cosmic-text mt-1">
                {generatedReport.title}
              </h2>
              <p className="text-xs text-cosmic-muted mt-1">
                Native: {generatedReport.native.name} &bull; Generated {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={generatedReport.htmlUrl || `/api/reports/${generatedReport.id}/html`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl border border-cosmic-border bg-cosmic-card hover:border-cyan-400 text-xs font-bold text-cosmic-text flex items-center gap-2 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Web Preview</span>
              </a>
              <a
                href={generatedReport.htmlUrl || `/api/reports/${generatedReport.id}/html`}
                download={`${generatedReport.id}.html`}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-glow-cyan"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </a>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider">
              Executive Summary
            </h3>
            <p className="text-xs text-cosmic-text leading-relaxed">
              {generatedReport.executiveSummary}
            </p>
          </div>

          {/* Planetary Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-cosmic-card border border-cosmic-border/60">
              <span className="text-cosmic-muted block text-[10px]">Ascendant (Lagna)</span>
              <span className="font-bold text-cosmic-text">{generatedReport.astronomy.ascendantSign}</span>
            </div>
            <div className="p-3 rounded-xl bg-cosmic-card border border-cosmic-border/60">
              <span className="text-cosmic-muted block text-[10px]">Moon Rashi</span>
              <span className="font-bold text-cosmic-text">{generatedReport.astronomy.moonSign}</span>
            </div>
            <div className="p-3 rounded-xl bg-cosmic-card border border-cosmic-border/60">
              <span className="text-cosmic-muted block text-[10px]">Nakshatra</span>
              <span className="font-bold text-cosmic-text">{generatedReport.astronomy.nakshatra}</span>
            </div>
            <div className="p-3 rounded-xl bg-cosmic-card border border-cosmic-border/60">
              <span className="text-cosmic-muted block text-[10px]">Current Dasha</span>
              <span className="font-bold text-cosmic-text">{generatedReport.astronomy.currentMahadasha}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
