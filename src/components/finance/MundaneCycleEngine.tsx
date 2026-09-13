import React from 'react';
import { Globe, Shield, Clock, Compass, Layers, Cpu, Sparkles } from 'lucide-react';

export const MundaneCycleEngine: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
            MUNDANE JYOTISH & MACRO-CYCLE ENGINE
          </span>
          <span className="text-xs font-mono text-cyan-400">REGISTRY V2.4</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Planetary Transits, Sovereign Horoscopes & Long-Term Economic Super-Cycles
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          Medini (Mundane) Jyotish analyzes planetary ingresses, eclipse paths, and multi-decade conjunctions across nation-state charts to understand structural capital shifts, commodity price waves, and sovereign debt cycles.
        </p>
      </div>

      {/* 3-Channel Multi-Signal Demarcation */}
      <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Mandated 3-Channel Multi-Signal Demarcation
        </h3>
        <p className="text-xs text-slate-400">
          Rigorous visual and cognitive separation ensures users never confuse empirical market reality with theoretical planetary correlations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#111828] border border-cyan-800/60 rounded-xl p-4 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 block w-fit">
              CHANNEL 1: FUNDAMENTAL CORPORATE
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real corporate balance sheet health, P/E valuations, EBITDA growth, statutory quarterly reports, and debt-to-equity leverage.
            </p>
          </div>

          <div className="bg-[#111828] border border-emerald-800/60 rounded-xl p-4 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 block w-fit">
              CHANNEL 2: MACRO TELEMETRY
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              RBI repo rates, sovereign G-Sec yield curve, CPI inflation, trade deficit data, exchange breadth (A/D ratio), and FX reserves.
            </p>
          </div>

          <div className="bg-[#111828] border border-purple-800/60 rounded-xl p-4 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-400 block w-fit">
              CHANNEL 3: MUNDANE ASTROLOGY
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Planetary ingresses, Jupiter-Saturn 20-yr conjunctions, nodal axis (Rahu-Ketu), and eclipse season liquidity nodes.
            </p>
          </div>
        </div>
      </div>

      {/* Active Global Transits & Sovereign Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active World Planetary Transits */}
        <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Active World Planetary Transits & Ingresses</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#111828] border border-[#1e293b] space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-white">Saturn in Pisces (Meena Rashi)</span>
                <span className="text-amber-400 font-mono text-[11px]">2023 - 2025/26</span>
              </div>
              <p className="text-xs text-slate-300">
                Water sign transit governing global maritime shipping routes, sovereign debt renegotiations, pharmaceutical breakthroughs, and water infrastructure.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#111828] border border-[#1e293b] space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-white">Jupiter in Taurus / Gemini (Vrishabha / Mithuna)</span>
                <span className="text-cyan-400 font-mono text-[11px]">Active Cycle</span>
              </div>
              <p className="text-xs text-slate-300">
                Expansion of high-bandwidth telecommunications, microelectronics foundries, artificial intelligence computation, and agricultural supply chains.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#111828] border border-[#1e293b] space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-white">Rahu-Ketu Axis in Pisces-Virgo</span>
                <span className="text-purple-400 font-mono text-[11px]">18-Month Axis</span>
              </div>
              <p className="text-xs text-slate-300">
                Disruption in legacy banking intermediaries; exponential acceleration in algorithmic trading, distributed ledgers, and biotech analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Sovereign Nation Mundane Charts */}
        <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Sovereign Nation Mundane Charts</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#111828] border border-[#1e293b] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">Republic of India (15 Aug 1947, 00:00 IST)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400">
                  Taurus Lagna
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Taurus ascendant with 5-planet stellium in 3rd house (Pushya Nakshatra). Current planetary periods indicate domestic capex expansion, digital infrastructure dominance, and record foreign exchange reserve growth.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111828] border border-[#1e293b] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">United States (4 July 1776, 17:10 LMT)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-400">
                  Gemini Lagna
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gemini ascendant with Sagittarius Moon. Ongoing Pluto return and Mars transits highlight sovereign debt refinancing dynamics and monetary easing cycles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Macro Super-Cycles */}
      <div className="bg-[#0b101d] border border-[#1b2537] rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Multi-Decade Economic Super-Cycles (10-Year to 60-Year Waves)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-[#111828] border border-[#1e293b] space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold block">20-YEAR JUPITER-SATURN</span>
            <div className="text-xs font-bold text-white">Great Conjunction in Air</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Transition from tangible fossil fuels to algorithmic intelligence, renewables, and space exploration.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111828] border border-[#1e293b] space-y-1">
            <span className="text-[10px] font-mono text-purple-400 font-bold block">18.6-YEAR NODAL CYCLE</span>
            <div className="text-xs font-bold text-white">Rahu-Ketu Real Estate Wave</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Correlation with global real estate capital formation, urban land values, and structural debt expansions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111828] border border-[#1e293b] space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 font-bold block">11-YEAR SOLAR CYCLE</span>
            <div className="text-xs font-bold text-white">Sunspot Geomagnetic Activity</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Historical correlation with agricultural yields, soft commodity pricing, and solar energy installations.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111828] border border-[#1e293b] space-y-1">
            <span className="text-[10px] font-mono text-amber-400 font-bold block">12-YEAR JUPITER CYCLE</span>
            <div className="text-xs font-bold text-white">Brihaspati Liquidity Expansion</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Full zodiac transit through financial houses dictating sovereign central bank easing and tightening waves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
