import React from 'react';

/**
 * CosmicPlanets Component
 * Renders high-fidelity celestial planets moving slowly in the background
 * at exactly 80% opacity (0.80) to provide an awe-inspiring, futuristic cosmic atmosphere.
 */
export const CosmicPlanets: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      style={{ opacity: 0.8 }}
      aria-hidden="true"
    >
      {/* ============================================================ */}
      {/* 1. SATURN (Shani) — Majestic Ringed Planet in Upper Right      */}
      {/* ============================================================ */}
      <div className="absolute -top-12 right-[6%] sm:right-[10%] lg:right-[14%] animate-planet-drift-1">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Planet Atmospheric Glow Aura */}
          <div className="absolute inset-4 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

          {/* Saturn Planetary Rings (Back layer - behind sphere) */}
          <svg
            className="absolute w-80 h-44 -rotate-[24deg] pointer-events-none opacity-90"
            viewBox="0 0 320 160"
            fill="none"
          >
            <defs>
              <linearGradient id="saturnRingsBack" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5C76A" stopOpacity="0.85" />
                <stop offset="25%" stopColor="#D97706" stopOpacity="0.4" />
                <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#78350F" stopOpacity="0.25" />
                <stop offset="80%" stopColor="#FDE68A" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#B45309" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Outer Ring */}
            <ellipse
              cx="160"
              cy="80"
              rx="155"
              ry="45"
              stroke="url(#saturnRingsBack)"
              strokeWidth="14"
              strokeDasharray="4 2"
              className="opacity-70"
            />
            {/* Cassini Division Inner Ring */}
            <ellipse
              cx="160"
              cy="80"
              rx="136"
              ry="37"
              stroke="url(#saturnRingsBack)"
              strokeWidth="20"
              className="opacity-95"
            />
            {/* Innermost Ring */}
            <ellipse
              cx="160"
              cy="80"
              rx="108"
              ry="27"
              stroke="#FDE68A"
              strokeWidth="6"
              strokeOpacity="0.6"
            />
          </svg>

          {/* Saturn Spherical Body */}
          <div
            className="w-36 h-36 rounded-full relative z-10 overflow-hidden shadow-[0_0_50px_rgba(245,199,106,0.35)]"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #FEF3C7 0%, #F59E0B 35%, #92400E 70%, #451A03 100%)',
              boxShadow:
                'inset -18px -18px 30px rgba(0, 0, 0, 0.9), inset 10px 10px 25px rgba(254, 243, 199, 0.4), 0 0 35px rgba(217, 119, 6, 0.4)',
            }}
          >
            {/* Atmospheric Banding Stripes */}
            <div className="absolute inset-0 opacity-45 mix-blend-overlay flex flex-col justify-between py-2 pointer-events-none">
              <div className="h-1 bg-amber-100/60" />
              <div className="h-2 bg-amber-900/60" />
              <div className="h-1.5 bg-yellow-200/50" />
              <div className="h-3 bg-amber-950/70" />
              <div className="h-2 bg-amber-300/40" />
              <div className="h-1.5 bg-stone-900/80" />
            </div>

            {/* Ring Shadow Cast Across Northern Hemisphere */}
            <div className="absolute top-[38%] left-0 right-0 h-4 bg-black/65 blur-[1px] -rotate-[12deg] pointer-events-none" />
          </div>

          {/* Saturn Planetary Rings (Front layer - wraps in front of lower sphere) */}
          <svg
            className="absolute w-80 h-44 -rotate-[24deg] pointer-events-none z-20"
            viewBox="0 0 320 160"
            fill="none"
          >
            {/* Lower half clip to overlap the front of the sphere */}
            <ellipse
              cx="160"
              cy="80"
              rx="136"
              ry="37"
              stroke="url(#saturnRingsBack)"
              strokeWidth="20"
              strokeDasharray="400 400"
              strokeDashoffset="-200"
              className="opacity-95"
            />
          </svg>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. JUPITER (Guru) — Colossal Banded Gas Giant at Bottom Left   */}
      {/* ============================================================ */}
      <div className="absolute -bottom-20 left-[18%] sm:left-[22%] lg:left-[26%] animate-planet-drift-2">
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Gravitational Corona */}
          <div className="absolute inset-2 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />

          {/* Jupiter Sphere */}
          <div
            className="w-56 h-56 rounded-full relative overflow-hidden"
            style={{
              background:
                'radial-gradient(circle at 30% 28%, #FFFBEB 0%, #FBBF24 25%, #C2410C 55%, #7C2D12 80%, #1C1917 100%)',
              boxShadow:
                'inset -30px -30px 50px rgba(0, 0, 0, 0.95), inset 12px 12px 30px rgba(254, 243, 199, 0.4), 0 0 45px rgba(234, 88, 12, 0.35)',
            }}
          >
            {/* Jupiter Cloud Strata & Belts */}
            <div className="absolute inset-0 opacity-55 mix-blend-color-burn flex flex-col justify-evenly py-1 pointer-events-none">
              <div className="h-3 bg-amber-900/70" />
              <div className="h-1.5 bg-amber-100/50" />
              <div className="h-4 bg-orange-950/80" />
              <div className="h-2 bg-amber-200/40" />
              <div className="h-5 bg-red-950/90 relative">
                {/* Great Red Spot (Vedic Brihaspati storm) */}
                <div
                  className="absolute right-10 top-0.5 w-7 h-4 rounded-full bg-red-600/90 shadow-[inset_0_0_6px_rgba(0,0,0,0.8)]"
                  style={{
                    boxShadow: '0 0 8px rgba(220, 38, 38, 0.7)',
                  }}
                />
              </div>
              <div className="h-2.5 bg-amber-300/40" />
              <div className="h-4 bg-amber-950/80" />
              <div className="h-2 bg-stone-900/90" />
            </div>

            {/* Limb Darkening & Atmospheric Rim */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/80 via-transparent to-amber-200/20 pointer-events-none" />
          </div>

          {/* Jovian Orbit Ring Arc */}
          <div className="absolute w-88 h-88 rounded-full border border-amber-500/10 pointer-events-none -rotate-12" />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MARS (Mangal) — Crimson Warrior Sphere at Middle Right     */}
      {/* ============================================================ */}
      <div className="absolute top-[48%] -right-8 sm:right-6 lg:right-10 animate-planet-drift-3">
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Radiant Ruby Halo */}
          <div className="absolute inset-1 rounded-full bg-red-600/20 blur-xl pointer-events-none" />

          {/* Mars Sphere */}
          <div
            className="w-24 h-24 rounded-full relative overflow-hidden"
            style={{
              background:
                'radial-gradient(circle at 30% 25%, #FCA5A5 0%, #DC2626 40%, #7F1D1D 75%, #450A0A 100%)',
              boxShadow:
                'inset -12px -12px 25px rgba(0, 0, 0, 0.9), inset 8px 8px 20px rgba(254, 202, 202, 0.35), 0 0 28px rgba(239, 68, 68, 0.45)',
            }}
          >
            {/* Polar Ice Cap */}
            <div className="absolute top-1 left-7 w-6 h-2 rounded-full bg-slate-100/80 blur-[0.5px]" />

            {/* Volcanic Terrain & Valles Marineris */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-gradient-to-br from-transparent via-red-950 to-black" />
            <div className="absolute top-10 left-3 w-12 h-2.5 bg-red-950/70 rounded-full -rotate-12 blur-[1px]" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. NEPTUNE / EXOPLANET (Varuna) — Glowing Cyan Celestial Orb */}
      {/* ============================================================ */}
      <div className="absolute top-[22%] left-[45%] sm:left-[55%] animate-planet-drift-4">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Cyan Ion Atmosphere */}
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

          {/* Azure Sphere */}
          <div
            className="w-18 h-18 rounded-full relative overflow-hidden"
            style={{
              width: '4.5rem',
              height: '4.5rem',
              background:
                'radial-gradient(circle at 35% 30%, #A5F3FC 0%, #06B6D4 35%, #0E7490 65%, #164E63 85%, #082F49 100%)',
              boxShadow:
                'inset -10px -10px 20px rgba(0, 0, 0, 0.9), inset 6px 6px 15px rgba(165, 243, 252, 0.5), 0 0 30px rgba(6, 182, 212, 0.45)',
            }}
          >
            {/* White Methane Cloud Cirrus */}
            <div className="absolute top-5 left-2 w-8 h-1 bg-cyan-100/70 rounded-full blur-[0.5px] rotate-6" />
            <div className="absolute top-8 left-4 w-6 h-1 bg-cyan-100/50 rounded-full blur-[0.5px] -rotate-3" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. VENUS (Shukra) — Radiant Golden Morning Star Sphere       */}
      {/* ============================================================ */}
      <div className="absolute bottom-[30%] left-[34%] sm:left-[40%] animate-planet-drift-1">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Luminous Golden Corona */}
          <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-lg pointer-events-none" />

          {/* Pearlescent Golden Sphere */}
          <div
            className="w-14 h-14 rounded-full relative overflow-hidden"
            style={{
              background:
                'radial-gradient(circle at 32% 28%, #FFFDF5 0%, #FDE68A 30%, #F59E0B 65%, #B45309 88%, #451A03 100%)',
              boxShadow:
                'inset -8px -8px 16px rgba(0, 0, 0, 0.85), inset 6px 6px 14px rgba(255, 255, 255, 0.6), 0 0 25px rgba(245, 158, 11, 0.5)',
            }}
          >
            {/* Sulfuric Atmospheric Whirls */}
            <div className="absolute inset-0 opacity-35 bg-gradient-to-tr from-amber-900 via-transparent to-yellow-100/60 mix-blend-overlay" />
          </div>
        </div>
      </div>

      {/* Subtle Orbital Geometry Lines to add futuristic depth */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="75%"
          cy="20%"
          rx="450"
          ry="260"
          fill="none"
          stroke="rgba(245, 199, 106, 0.15)"
          strokeWidth="1"
          strokeDasharray="8 6"
        />
        <ellipse
          cx="30%"
          cy="85%"
          rx="600"
          ry="340"
          fill="none"
          stroke="rgba(0, 229, 255, 0.12)"
          strokeWidth="1"
          strokeDasharray="6 8"
        />
      </svg>
    </div>
  );
};
