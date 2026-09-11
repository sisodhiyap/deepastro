import React, { useState } from 'react';
import { Hand, Upload, CheckCircle2, ShieldAlert, Sparkles, Image, ArrowRight, Camera, RefreshCw, Smartphone } from 'lucide-react';
import { PalmCameraModal } from '../components/palmistry/PalmCameraModal.js';

export const PalmistryPage: React.FC = () => {
  const [handType, setHandType] = useState<'Left' | 'Right'>('Right');
  const [isDominant, setIsDominant] = useState(true);
  const [ageRange, setAgeRange] = useState('25-35');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleCameraCapture = (file: File, preview: string, autoSubmit?: boolean) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
    setErrorMessage(null);

    if (autoSubmit) {
      setTimeout(() => {
        handleAnalyze(file);
      }, 100);
    }
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async (fileToAnalyze?: File) => {
    const file = fileToAnalyze || selectedFile;
    if (!file) {
      setErrorMessage('Please capture or upload a palm photo before analyzing.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('palmImage', file);
      formData.append('handType', handType);
      formData.append('isDominant', isDominant.toString());
      formData.append('ageRange', ageRange);

      const res = await fetch('/api/palmistry/analyze', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis({
          ...data.analysis,
          visionProvider: data.metadata?.visionProvider || data.analysis?.visionProvider || 'DeepAstro Vision AI',
        });
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.details || err.error || 'Failed to analyze palm photo.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with palmistry engine.');
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
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-cosmic-text">Provide a clear photo of your palm</h3>
                <p className="text-xs text-cosmic-muted mt-0.5">
                  Use your device camera with our live alignment guide or upload an existing photo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-display font-extrabold uppercase tracking-wider transition-all shadow-glow-cyan flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
              >
                <Camera className="w-4 h-4" />
                <span>Open Live Camera</span>
              </button>
            </div>
          </div>

          {previewUrl ? (
            <div className="rounded-3xl border border-cyan-500/30 bg-cosmic-card/50 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl">
              <div className="relative group shrink-0">
                <img
                  src={previewUrl}
                  alt="Palm preview"
                  className="w-44 h-56 object-cover rounded-2xl border-2 border-cyan-400/50 shadow-2xl"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <span className="text-[11px] font-bold text-cyan-300">Image Ready</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 text-center md:text-left w-full">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Photo Captured & Ready
                  </div>
                  <h4 className="text-base font-bold text-cosmic-text">
                    {selectedFile?.name || 'Live Camera Capture'}
                  </h4>
                  <p className="text-xs text-cosmic-muted mt-0.5">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'High-resolution snapshot'} &bull; Ready for Gemini & OpenAI Vision
                  </p>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="button"
                  onClick={() => handleAnalyze()}
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-2xl font-display font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-glow-cyan ${
                    isLoading
                      ? 'bg-cyan-600/50 text-black cursor-wait'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-black hover:scale-[1.01]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isLoading ? 'Scanning Palm with Vision AI...' : 'Submit & Analyze Palm Features'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="px-3 py-1.5 rounded-xl border border-cosmic-border bg-cosmic-card text-xs font-semibold text-cosmic-text hover:border-cyan-400/40 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Retake with Camera
                  </button>

                  <label className="px-3 py-1.5 rounded-xl border border-cosmic-border bg-cosmic-card text-xs font-semibold text-cosmic-text hover:border-cyan-400/40 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Smartphone className="w-3.5 h-3.5 text-cosmic-muted" />
                    <span>Device Camera</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                  </label>

                  <label className="px-3 py-1.5 rounded-xl border border-cosmic-border bg-cosmic-card text-xs font-semibold text-cosmic-text hover:border-cyan-400/40 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-cosmic-muted" />
                    <span>Browse Files</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Option 1: Live Camera Card */}
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="group border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-3xl p-5 flex flex-col items-center justify-center text-center transition-all bg-cyan-500/5 hover:bg-cyan-500/10 space-y-2.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-cosmic-text block group-hover:text-cyan-300 transition-colors">
                    Live Viewfinder
                  </span>
                  <span className="text-[10px] text-cosmic-muted mt-0.5 block">
                    Palm alignment guide
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-bold uppercase tracking-wider">
                  Recommended
                </span>
              </button>

              {/* Option 2: Native Device Camera */}
              <label className="group border-2 border-dashed border-cosmic-border hover:border-cyan-500/40 rounded-3xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-cosmic-card/30 hover:bg-cosmic-card/50 space-y-2.5">
                <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                <div className="w-12 h-12 rounded-2xl bg-cosmic-card border border-cosmic-border flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-cosmic-text block">
                    Device Camera
                  </span>
                  <span className="text-[10px] text-cosmic-muted mt-0.5 block">
                    Direct phone camera
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-cosmic-card text-cosmic-muted text-[9px] font-semibold">
                  Instant Snap
                </span>
              </label>

              {/* Option 3: Upload File Card */}
              <label className="border-2 border-dashed border-cosmic-border hover:border-cosmic-muted rounded-3xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-cosmic-card/30 hover:bg-cosmic-card/50 space-y-2.5 group">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <div className="w-12 h-12 rounded-2xl bg-cosmic-card border border-cosmic-border flex items-center justify-center text-cosmic-muted group-hover:text-cosmic-text group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-cosmic-text block">
                    Upload Photo
                  </span>
                  <span className="text-[10px] text-cosmic-muted mt-0.5 block">
                    JPG, PNG, or WEBP
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-cosmic-card text-cosmic-muted text-[9px] font-semibold">
                  Browse Files
                </span>
              </label>
            </div>
          )}

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

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || isLoading}
            className={`w-full py-3.5 rounded-2xl font-display font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              !selectedFile || isLoading
                ? 'bg-cosmic-card border border-cosmic-border text-cosmic-muted cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-glow-cyan'
            }`}
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Vision Synthesis &bull; {analysis.handElement}
              </span>
              {analysis.visionProvider && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-bold text-cyan-300">
                  {analysis.visionProvider}
                </span>
              )}
            </div>
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

      {/* Live Camera Viewfinder Modal */}
      <PalmCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
