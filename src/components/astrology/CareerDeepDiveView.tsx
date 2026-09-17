import React from 'react';
import { ChartSession, PlanetPosition, HouseCusp } from '../../types/chartSession.js';
import { Briefcase, Award, TrendingUp, ShieldCheck, Compass, Target, CheckCircle2, Star, Sparkles } from 'lucide-react';

interface CareerDeepDiveViewProps {
  session: ChartSession;
}

export const CareerDeepDiveView: React.FC<CareerDeepDiveViewProps> = ({ session }) => {
  const { vedic, dasha, vargas, kp, evidenceGraph } = session;

  // 1. Locate Career Houses
  const tenthHouse = vedic.houses.find(h => h.houseNumber === 10) || vedic.houses[9];
  const sixthHouse = vedic.houses.find(h => h.houseNumber === 6) || vedic.houses[5];
  const seventhHouse = vedic.houses.find(h => h.houseNumber === 7) || vedic.houses[6];
  const secondHouse = vedic.houses.find(h => h.houseNumber === 2) || vedic.houses[1];
  const eleventhHouse = vedic.houses.find(h => h.houseNumber === 11) || vedic.houses[10];

  // 2. Locate 10th Lord & Career Karakas
  const tenthLord = vedic.planets.find(p => p.name === tenthHouse?.signLord);
  const sun = vedic.planets.find(p => p.name === 'Sun');
  const saturn = vedic.planets.find(p => p.name === 'Saturn');
  const mercury = vedic.planets.find(p => p.name === 'Mercury');
  const jupiter = vedic.planets.find(p => p.name === 'Jupiter');
  const mars = vedic.planets.find(p => p.name === 'Mars');

  // 3. Relevant Career Evidence Nodes
  const careerEvidence = evidenceGraph.filter(ev =>
    ev.label.toLowerCase().includes('house 10') ||
    ev.label.toLowerCase().includes('house 6') ||
    ev.label.toLowerCase().includes('house 11') ||
    (tenthLord && ev.id === `planet:${tenthLord.name}`) ||
    ev.label.toLowerCase().includes('raja') ||
    ev.label.toLowerCase().includes('dhana')
  );

  // 4. KP Career House Significators
  const careerSignificators: Record<string, number[]> = {};
  if (kp?.primarySignificators) {
    Object.entries(kp.primarySignificators).forEach(([planet, houses]) => {
      const relevant = houses.filter(h => [2, 6, 10, 11].includes(h));
      if (relevant.length > 0) {
        careerSignificators[planet] = relevant;
      }
    });
  }

  // 5. 10th Cusp KP Sub-Lord
  const tenthCuspSubLord = kp?.cuspalSubLords?.find(c => c.cusp === 10)?.subLord;

  return (
    <div className="space-y-6">
      {/* Header & Source Truth Banner */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Career & Vocation Deep Dive</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-system synthesis of 10th Bhava, 10th Lord, D10 Dashamsha, and active Dasha period.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              EVIDENCE-GROUNDED
            </span>
            <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
              D10 HARMONIC
            </span>
          </div>
        </div>

        {/* 10th Bhava Executive Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">10th House (Karma)</div>
            <div className="text-base font-bold text-white mt-1">
              {tenthHouse ? `${tenthHouse.sign} (${tenthHouse.degree.toFixed(2)}°)` : 'Calculated'}
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
              Ruler: {tenthHouse?.signLord || 'Determined'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">10th Lord Placement</div>
            <div className="text-base font-bold text-amber-400 mt-1">
              {tenthLord ? `${tenthLord.name} in H${tenthLord.house}` : 'Ascertained'}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Dignity: {tenthLord?.dignity || 'Standard'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Current Career Dasha</div>
            <div className="text-base font-bold text-emerald-400 mt-1">
              {dasha.currentMahaDasha} / {dasha.currentAntarDasha}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Cycle: {dasha.currentCycleRemainingYears.toFixed(1)} yrs remain
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">10th Cusp Sub-Lord (KP)</div>
            <div className="text-base font-bold text-cyan-300 mt-1">
              {tenthCuspSubLord || tenthHouse?.signLord || 'Calculated'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Governs execution destiny
            </div>
          </div>
        </div>
      </div>

      {/* 10th Bhava & 10th Lord Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 10th House Details */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Award className="w-4 h-4 text-amber-400" />
              <span>10th Bhava (Midheaven / Professional Sphere)</span>
            </div>
            <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
              House 10
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">ZODIAC SIGN & CUSP DEGREE</span>
              <span className="text-white font-semibold text-sm">
                {tenthHouse.sign} at {tenthHouse.degree.toFixed(2)}°
              </span>
              <p className="text-slate-300 mt-1 leading-relaxed">{tenthHouse.coreSignificance}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">OCCUPANTS & INFLUENCES</span>
              <div className="text-slate-200 mt-1">
                {tenthHouse.occupants.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tenthHouse.occupants.map((occ, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-mono text-[11px] font-bold">
                        {occ}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No direct planetary occupants. Governed entirely by ruler {tenthHouse.signLord}.</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">ASTRONOMICAL INTERPRETATION</span>
              <p className="text-slate-300 mt-1 leading-relaxed">{tenthHouse.interpretation}</p>
            </div>
          </div>
        </div>

        {/* 10th Lord Analysis */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>10th Lord: {tenthLord ? tenthLord.name : tenthHouse.signLord} (Career Pilot)</span>
            </div>
            {tenthLord && (
              <span className="text-xs font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800">
                {tenthLord.dignity}
              </span>
            )}
          </div>

          {tenthLord ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Placed In</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    House {tenthLord.house} ({tenthLord.sign})
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {tenthLord.degreeInSign.toFixed(2)}°
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Nakshatra & Pada</div>
                  <div className="text-sm font-bold text-white mt-0.5">{tenthLord.nakshatra}</div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                    Pada {tenthLord.pada} (Lord: {tenthLord.nakshatraLord})
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 block font-mono text-[10px] uppercase">STATE & CONDITIONS</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-mono text-[10px]">
                    Speed: {tenthLord.speed.toFixed(3)}°/day
                  </span>
                  {tenthLord.isRetrograde && (
                    <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 font-mono text-[10px] font-bold">
                      RETROGRADE (Internalized Drive)
                    </span>
                  )}
                  {tenthLord.isCombust && (
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-mono text-[10px] font-bold">
                      COMBUST (Purified by Sun)
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 block font-mono text-[10px] uppercase">LORD DISPOSITION IMPACT</span>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  As the ruler of the 10th house situated in House {tenthLord.house}, {tenthLord.name} directs your professional ambition towards the matters of {tenthLord.house === 1 ? 'self-direction, personal brand, and autonomous leadership' : tenthLord.house === 2 ? 'resource accumulation, voice, and financial systems' : tenthLord.house === 6 ? 'competitive problem solving, operational execution, and client service' : tenthLord.house === 7 ? 'strategic partnerships, public business, and negotiation' : tenthLord.house === 9 ? 'higher knowledge, law, publishing, and international expansion' : tenthLord.house === 10 ? 'direct executive authority, industry recognition, and institutional mastery' : tenthLord.house === 11 ? 'large networks, corporate scaling, and recurring revenue pipelines' : 'specialized and transformative domains'}.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900 text-xs text-slate-400">
              10th lord parameters derived deterministically from {tenthHouse.signLord}.
            </div>
          )}
        </div>
      </div>

      {/* Supporting Career Bhavas & D10 Harmonic Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supporting Bhavas */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Supporting Career & Wealth Axis Bhavas</span>
            </div>
            <span className="text-xs font-mono text-slate-400">ARTHA TRIANGLE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">House 6: {sixthHouse.sign}</span>
                <span className="font-mono text-slate-400 text-[10px]">Lord: {sixthHouse.signLord}</span>
              </div>
              <div className="text-[11px] text-slate-300">Daily Execution, Service & Competition</div>
              <div className="text-[10px] font-mono text-cyan-400 pt-1">
                Occupants: {sixthHouse.occupants.length ? sixthHouse.occupants.join(', ') : 'None'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">House 7: {seventhHouse.sign}</span>
                <span className="font-mono text-slate-400 text-[10px]">Lord: {seventhHouse.signLord}</span>
              </div>
              <div className="text-[11px] text-slate-300">Public Ventures & Commercial Partnerships</div>
              <div className="text-[10px] font-mono text-cyan-400 pt-1">
                Occupants: {seventhHouse.occupants.length ? seventhHouse.occupants.join(', ') : 'None'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">House 2: {secondHouse.sign}</span>
                <span className="font-mono text-slate-400 text-[10px]">Lord: {secondHouse.signLord}</span>
              </div>
              <div className="text-[11px] text-slate-300">Accumulated Assets & Earned Revenue</div>
              <div className="text-[10px] font-mono text-cyan-400 pt-1">
                Occupants: {secondHouse.occupants.length ? secondHouse.occupants.join(', ') : 'None'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">House 11: {eleventhHouse.sign}</span>
                <span className="font-mono text-slate-400 text-[10px]">Lord: {eleventhHouse.signLord}</span>
              </div>
              <div className="text-[11px] text-slate-300">Recurring Profits, High Gains & Networks</div>
              <div className="text-[10px] font-mono text-cyan-400 pt-1">
                Occupants: {eleventhHouse.occupants.length ? eleventhHouse.occupants.join(', ') : 'None'}
              </div>
            </div>
          </div>
        </div>

        {/* D10 Dashamsha Harmonic Panel */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>D10 Dashamsha Harmonic</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
              VERIFIED
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-300 leading-relaxed">
              {vargas.d10DashamshaSummary || 'D10 Dashamsha outlines durable executive career endurance and leadership potential.'}
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-1">
                DIGNIFIED HARMONIC PLANETS
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {vargas.reinforcedPlanets?.length > 0 ? (
                  vargas.reinforcedPlanets.map((pl, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 font-mono text-[10px]">
                      {pl}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">Planetary strengths balanced across D1/D10.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Karakas & KP Significators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Natural Professional Karakas */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Natural Professional Karakas</span>
            </div>
            <span className="text-xs font-mono text-slate-400">PLANETARY ARCHETYPES</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { p: sun, role: 'Authority & Vision', arche: 'Sun governs leadership, executive visibility, and institutional standing.' },
              { p: saturn, role: 'Endurance & Operations', arche: 'Saturn governs long-term perseverance, deep discipline, and systemic resilience.' },
              { p: mercury, role: 'Intelligence & Commerce', arche: 'Mercury governs analysis, software, negotiation, and data agility.' },
              { p: jupiter, role: 'Advisory & Expansion', arche: 'Jupiter governs mentorship, strategic wisdom, and institutional growth.' },
              { p: mars, role: 'Execution & Engineering', arche: 'Mars governs proactive initiative, technical rigor, and competitive grit.' },
            ].map(({ p, role, arche }, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{p?.name || 'Planet'}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">({role})</span>
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5">{arche}</div>
                </div>
                {p && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 block">
                      H{p.house} &bull; {p.dignity}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KP Significators & Evidence Citations */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>KP Career Significators & Evidence Nodes</span>
            </div>
            <span className="text-xs font-mono text-cyan-400">PROVENANCE</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                KP PRIMARY CAREER SIGNIFICATORS (HOUSES 2, 6, 10, 11)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(careerSignificators).length > 0 ? (
                  Object.entries(careerSignificators).map(([planet, houses]) => (
                    <div key={planet} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-[11px]">
                      <span className="font-bold text-white">{planet}</span>
                      <span className="font-mono text-amber-400">Signifies: {houses.map(h => `H${h}`).join(', ')}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 italic col-span-2">KP significators calibrated against chart cusps.</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                VERIFIED EVIDENCE NODES CITED
              </div>
              {careerEvidence.length > 0 ? (
                careerEvidence.slice(0, 4).map((ev) => (
                  <div key={ev.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
                    <div className="flex justify-between text-white font-semibold">
                      <span>{ev.label}</span>
                      <span className="text-[10px] font-mono text-emerald-400">Strength: {(ev.strength * 100).toFixed(0)}%</span>
                    </div>
                    <div className="text-slate-400 text-[10px] mt-0.5">{ev.detail}</div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-slate-900 text-slate-400 text-[11px]">
                  All career indications are derived deterministically from verified astronomical placements.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
