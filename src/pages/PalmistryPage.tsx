import React, { useState } from 'react';
import { Hand, Upload, CheckCircle2, ShieldAlert, Sparkles, Image, ArrowRight } from 'lucide-react';

export const PalmistryPage: React.FC = () => {
  const [handType, setHandType] = useState<'Left' | 'Right'>('Right');
  const [isDominant, setIsDominant] = useState(true);
  const [ageRange, setAgeRange] = useState('25-35');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('palmImage', selectedFile);
      } else {
        formData.append('imageData', 'sample_fallback_palm');
      }
      formData.append('handType', handType);
      formData.append('isDominant', isDominant.toString());
      formData.append('ageRange', ageRange);

      const res = await fetch('/api/palmistry/analyze', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Hand className="w-3.5 h-3.5" /> Hastarekha & Samudrika Shastra
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-cosmic-text">
          Palmistry Vision AI Analysis
        </h1>
        <p className="text-xs text-cosmic-muted">
          Upload a high-resolution photo of your palm for classical line and mount inspection.
        </p>
      </div>

      {/* Upload Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-cosmic-text">Upload a clear photo of your palm</h3>
            <p className="text-xs text-cosmic-muted">
              Place your open hand under even lighting against a neutral background. JPG, PNG, and WEBP supported.
            </p>
          </div>

          <label className="border-2 border-dashed border-cosmic-border hover:border-cyan-400 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-cosmic-card/30 group">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            {previewUrl ? (
              <div className="flex flex-col items-center gap-3">
                <img src={previewUrl} alt="Palm preview" className="w-40 h-40 object-cover rounded-2xl border border-cosmic-border shadow-md" />
                <span className="text-xs text-cyan-400 font-semibold group-hover:underline">Click to change photo</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-cosmic-card border border-cosmic-border flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-bold text-cosmic-text block">Choose a palm image or drag & drop</span>
                  <span className="text-xs text-cosmic-muted mt-1 block">Maximum file size 10MB</span>
                </div>
              </div>
            )}
          </label>

          {/* Form Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Hand Orientation</label>
              <select
                value={handType}
                onChange={(e) => setHandType(e.target.value as 'Left' | 'Right')}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
              >
                <option value="Right">Right Hand</option>
                <option value="Left">Left Hand</option>
              </select>
            </div>

            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Dominant Hand</label>
              <select
                value={isDominant ? 'true' : 'false'}
                onChange={(e) => setIsDominant(e.target.value === 'true')}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
              >
                <option value="true">Yes, Dominant Hand</option>
                <option value="false">Non-Dominant</option>
              </select>
            </div>

            <div>
              <label className="text-cosmic-muted block mb-1 font-semibold">Age Range</label>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full bg-cosmic-card border border-cosmic-border rounded-xl px-3 py-2 text-cosmic-text focus:outline-none focus:border-cyan-400"
              >
                <option value="18-24">18–24 Years</option>
                <option value="25-35">25–35 Years</option>
                <option value="36-50">36–50 Years</option>
                <option value="50+">50+ Years</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-extrabold text-xs uppercase tracking-wider transition-all shadow-glow-cyan flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Scanning Palm Geometry...' : 'Analyze Palm Features'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions & Ethical Notice */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-6 space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Traditional Hand Rules
            </h4>
            <ul className="space-y-2 text-xs text-cosmic-muted leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">&bull;</span>
                <span><strong>Dominant Hand:</strong> Represents conscious action, choices, cultivated skills, and manifested karma.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">&bull;</span>
                <span><strong>Passive Hand:</strong> Represents inherited ancestral blueprints, innate instincts, and subconscious predispositions.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" /> Ethical Astrological Disclaimer
            </div>
            <p className="text-[11px] text-cosmic-muted leading-relaxed">
              Palmistry (Hastarekha) is a traditional contemplative art. It is neither medically nor scientifically diagnostic and must never substitute for qualified medical, psychological, or financial counsel.
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysis && (
        <div className="rounded-3xl border border-cosmic-border bg-cosmic-surface p-8 space-y-8 shadow-cosmic-card">
          <div className="space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              Vision Synthesis &bull; {analysis.handElement}
            </span>
            <h3 className="text-2xl font-display font-extrabold text-cosmic-text">
              Comprehensive Chiromancy Report
            </h3>
            <p className="text-xs text-cosmic-muted leading-relaxed max-w-3xl">
              {analysis.overallSynthesis}
            </p>
          </div>

          {/* Core Lines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-card/60 space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase">Heart Line (Emotional Nature)</span>
              <span className="font-bold text-cosmic-text block">{analysis.heartLine.clarity}</span>
              <p className="text-cosmic-muted text-[11px] mt-1">{analysis.heartLine.interpretation}</p>
            </div>

            <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-card/60 space-y-1">
              <span className="text-[10px] font-bold text-violet-400 uppercase">Head Line (Intellect & Vision)</span>
              <span className="font-bold text-cosmic-text block">{analysis.headLine.direction}</span>
              <p className="text-cosmic-muted text-[11px] mt-1">{analysis.headLine.interpretation}</p>
            </div>

            <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-card/60 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Life Line (Vitality Arc)</span>
              <span className="font-bold text-cosmic-text block">{analysis.lifeLine.arc}</span>
              <p className="text-cosmic-muted text-[11px] mt-1">{analysis.lifeLine.interpretation}</p>
            </div>

            <div className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-card/60 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase">Fate Line (Destiny & Career)</span>
              <span className="font-bold text-cosmic-text block">{analysis.fateLine.visibility}</span>
              <p className="text-cosmic-muted text-[11px] mt-1">{analysis.fateLine.interpretation}</p>
            </div>
          </div>

          {/* Mounts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-cosmic-muted uppercase tracking-wider">
              Prominent Celestial Mounts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {analysis.prominentMounts.map((m: any) => (
                <div key={m.name} className="p-4 rounded-2xl border border-cosmic-border bg-cosmic-card/40 space-y-1">
                  <span className="font-bold text-cosmic-text text-xs block">{m.name}</span>
                  <span className="text-[10px] text-cosmic-gold font-semibold block">{m.energy}</span>
                  <p className="text-[11px] text-cosmic-muted mt-1 leading-snug">{m.significance}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
