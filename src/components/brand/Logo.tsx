import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center`}>
        {/* Glowing atmospheric halo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/30 via-indigo-500/20 to-violet-500/30 blur-[6px] animate-pulse-glow" />
        
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full relative z-10 drop-shadow-md">
          <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" className="text-cosmic-border" />
          {/* Orbital path */}
          <ellipse
            cx="24"
            cy="24"
            rx="18"
            ry="9"
            stroke="url(#logoGrad1)"
            strokeWidth="1.5"
            transform="rotate(-30 24 24)"
          />
          {/* Central Star Core */}
          <circle cx="24" cy="24" r="5.5" fill="url(#logoGrad2)" />
          <path
            d="M24 10L25.5 19L34 20.5L27 25L28.5 34L24 28L19.5 34L21 25L14 20.5L22.5 19Z"
            fill="#F8FAFC"
            opacity="0.85"
          />
          <circle cx="36" cy="16" r="2" fill="#00E5FF" />
          <defs>
            <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="50%" stopColor="#F5C76A" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <radialGradient id="logoGrad2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#6366F1" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-display font-extrabold tracking-wider text-cosmic-text uppercase flex items-center gap-1.5 ${titleSizes[size]}`}>
          DEEP<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400">ASTRO</span>
        </span>
        {showTagline && (
          <span className="text-[10px] tracking-widest uppercase font-medium text-cosmic-muted">
            Decode Your Life. Discover Your Cosmos.
          </span>
        )}
      </div>
    </div>
  );
};
