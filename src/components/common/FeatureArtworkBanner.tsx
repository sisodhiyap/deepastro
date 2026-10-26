import React, { useState } from 'react';
import { DeepAstroArtworkMetadata } from '../../constants/deepastroAssets.js';
import { Sparkles } from 'lucide-react';

export interface FeatureArtworkBannerProps {
  artwork: DeepAstroArtworkMetadata;
  variant?: 'banner' | 'card' | 'hero' | 'compact';
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  showCaption?: boolean;
  titleOverride?: string;
  badgeOverride?: string;
  descriptionOverride?: string;
  asH1?: boolean;
  children?: React.ReactNode;
}

export const FeatureArtworkBanner: React.FC<FeatureArtworkBannerProps> = ({
  artwork,
  variant = 'banner',
  priority = false,
  className = '',
  imageClassName = '',
  showCaption = true,
  titleOverride,
  badgeOverride,
  descriptionOverride,
  asH1 = false,
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // If asset is unavailable or has an error, fail safely without breaking the container
  if (!artwork.available || !artwork.src || hasError) {
    return null;
  }

  const title = titleOverride || artwork.title;
  const badge = badgeOverride || artwork.badge;
  const description = descriptionOverride || artwork.description;

  // Variant-specific styling rules
  const containerClasses = {
    hero: 'w-full rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#0e1628] via-[#090d16] to-[#06070a] shadow-[0_8px_35px_rgba(0,0,0,0.6)]',
    banner: 'w-full rounded-2xl sm:rounded-3xl border border-slate-800/80 hover:border-amber-500/30 bg-[#0a0e1a]/80 shadow-lg',
    card: 'w-full rounded-2xl border border-slate-800/80 bg-cosmic-card/50 shadow-md',
    compact: 'w-full rounded-xl border border-slate-800/60 bg-cosmic-card/30',
  }[variant];

  const aspectClasses = {
    hero: 'h-52 sm:h-72 md:h-96 lg:h-[440px] max-h-[75vh]',
    banner: 'h-44 sm:h-60 md:h-72 lg:h-80',
    card: 'h-40 sm:h-52 md:h-64',
    compact: 'h-32 sm:h-40',
  }[variant];

  const HeadingTag = asH1 ? 'h1' : 'h2';

  return (
    <figure
      className={`relative overflow-hidden min-w-0 max-w-full select-none transition-all duration-500 group ${containerClasses} ${className}`}
    >
      {/* Ambient background aura glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-amber-500/15 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm pointer-events-none" />

      <div className={`relative w-full overflow-hidden ${aspectClasses}`}>
        {/* Placeholder shimmer while loading */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-slate-900/80 animate-pulse flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-cyan-400/50 animate-spin" />
          </div>
        )}

        {/* Real Responsive Image */}
        <img
          src={artwork.src}
          alt={artwork.alt}
          width={artwork.width}
          height={artwork.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-[1.025] group-hover:brightness-[1.04] ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${imageClassName}`}
        />

        {/* Cinematic Multi-Tier Gradient Overlays for optimal contrast & readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#06070a]/45 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06070a]/85 via-[#06070a]/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,229,255,0.06),transparent_50%)] pointer-events-none" />

        {/* Gold & Cyan Dual Laser Border Highlight Glow on Top Edge */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/60 to-cyan-400/40 pointer-events-none" />

        {/* Futuristic Corner Tech Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/40 pointer-events-none rounded-tl-sm transition-colors group-hover:border-cyan-400/70" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400/40 pointer-events-none rounded-tr-sm transition-colors group-hover:border-cyan-400/70" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400/30 pointer-events-none rounded-bl-sm transition-colors group-hover:border-amber-400/60" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/30 pointer-events-none rounded-br-sm transition-colors group-hover:border-amber-400/60" />

        {/* Content & Caption Layer */}
        {showCaption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-auto">
            <div className="space-y-1.5 max-w-2xl min-w-0">
              {badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-cyan-500/10 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_12px_rgba(245,158,11,0.2)] backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="truncate">{badge}</span>
                </div>
              )}
              <HeadingTag className="text-xl sm:text-2xl md:text-3xl font-display font-black text-white tracking-tight break-words drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {title}
              </HeadingTag>
              {description && (
                <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-xl break-words line-clamp-2 sm:line-clamp-none drop-shadow-sm font-medium">
                  {description}
                </p>
              )}
            </div>

            {/* Optional Action Buttons / Controls */}
            {children && (
              <div className="shrink-0 flex items-center gap-2 pt-1 sm:pt-0">
                {children}
              </div>
            )}
          </div>
        )}
      </div>
    </figure>
  );
};
