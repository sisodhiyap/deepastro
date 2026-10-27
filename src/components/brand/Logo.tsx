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
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  const titleSizes = {
    xs: 'text-xs',
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const taglineSizes = {
    xs: 'text-[6px] tracking-[0.08em]',
    sm: 'text-[7px] sm:text-[7.5px] tracking-[0.10em]',
    md: 'text-[7.5px] sm:text-[8.5px] tracking-[0.12em]',
    lg: 'text-[9px] tracking-[0.14em]',
    xl: 'text-[11px] tracking-[0.16em]',
  };

  if (variant === 'full-graphic') {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-center select-none max-w-full ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <img
          src="/images/deepastro-logo.png"
          alt="DeepAstro — Explore Your Cosmic Path"
          className="w-full h-auto max-h-14 sm:max-h-20 object-contain filter drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)] transition-transform duration-300 hover:scale-[1.02]"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 sm:gap-3 select-none min-w-0 max-w-full ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Celestial 'D' Emblem with Ambient Golden/Cosmic Halo */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
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
        <div className="flex flex-col min-w-0 flex-1 overflow-hidden justify-center">
          <div className={`font-display font-black tracking-wider uppercase flex items-center gap-1 leading-none ${titleSizes[size]}`}>
            <span className="text-slate-100 tracking-[0.10em] font-serif shrink-0">
              DEEP
            </span>
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-serif tracking-[0.10em] drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)] flex items-center gap-0.5 shrink-0">
              ASTRO
              <span className="text-amber-400 text-[0.6em] leading-none select-none">✦</span>
            </span>
          </div>
          {showTagline && (
            <div className="flex items-center gap-1 mt-0.5 sm:mt-1 min-w-0 overflow-hidden">
              <span className={`uppercase font-semibold text-amber-300/85 truncate whitespace-nowrap ${taglineSizes[size]}`}>
                EXPLORE YOUR COSMIC PATH
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
