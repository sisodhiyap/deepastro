import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'lockup' | 'icon-only' | 'full-graphic';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  variant = 'lockup',
  className = '',
  onClick,
}) => {
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl',
  };

  const taglineSizes = {
    xs: 'text-[7px]',
    sm: 'text-[8px]',
    md: 'text-[9px] sm:text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  };

  if (variant === 'full-graphic') {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <img
          src="/images/deepastro-logo.png"
          alt="DeepAstro — Explore Your Cosmic Path"
          className="w-auto h-auto max-h-24 object-contain filter drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)] transition-transform duration-300 hover:scale-[1.02]"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Celestial 'D' Emblem with Ambient Golden/Cosmic Halo */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center`}>
        {/* Ambient atmospheric glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/25 via-blue-500/20 to-indigo-500/30 blur-[6px] animate-pulse-glow" />
        
        <img
          src="/images/deepastro-icon.png"
          alt="DeepAstro Emblem"
          className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_2px_10px_rgba(245,158,11,0.35)] transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            // Fallback SVG if image not yet loaded
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />
      </div>

      {variant !== 'icon-only' && (
        <div className="flex flex-col min-w-0">
          <div className={`font-display font-black tracking-wider uppercase flex items-center gap-1.5 leading-none ${titleSizes[size]}`}>
            <span className="text-slate-100 tracking-[0.12em] font-serif">
              DEEP
            </span>
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-serif tracking-[0.14em] drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)] flex items-center gap-1">
              ASTRO
              <span className="text-amber-400 text-[0.6em] leading-none select-none">✦</span>
            </span>
          </div>
          {showTagline && (
            <div className="flex items-center gap-1 mt-1">
              <span className={`tracking-[0.22em] uppercase font-semibold text-amber-300/80 ${taglineSizes[size]}`}>
                EXPLORE YOUR COSMIC PATH
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
