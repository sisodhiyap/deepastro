import React from 'react';

export type DeepAstroCardVariant = 'cosmic' | 'glass' | 'elevated' | 'gold' | 'cyan' | 'danger';

export interface DeepAstroCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: DeepAstroCardVariant;
  children: React.ReactNode;
  as?: 'div' | 'section' | 'article';
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
}

const variantClasses: Record<DeepAstroCardVariant, string> = {
  cosmic: 'bg-[#111827] border-[#2A3441] text-[#F8FAFC]',
  glass: 'glass-panel text-[#F8FAFC]',
  elevated: 'bg-[#1A1F2B] border-[#2A3441] shadow-cosmic-card text-[#F8FAFC]',
  gold: 'bg-gradient-to-b from-[#16130b] to-[#111827] border-amber-500/30 text-[#F8FAFC]',
  cyan: 'bg-gradient-to-b from-[#081726] to-[#111827] border-cyan-500/30 text-[#F8FAFC]',
  danger: 'bg-[#1c1114] border-rose-500/40 text-[#F8FAFC]',
};

export const DeepAstroCard: React.FC<DeepAstroCardProps> = ({
  title,
  subtitle,
  icon,
  badge,
  actions,
  footer,
  variant = 'elevated',
  children,
  as: Component = 'div',
  className = '',
  bodyClassName = '',
  headerClassName = '',
  ...rest
}) => {
  return (
    <Component
      className={`card-safe relative rounded-2xl sm:rounded-3xl border transition-all duration-300 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {/* Optional Card Header */}
      {(title || subtitle || icon || badge || actions) && (
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-6 border-b border-[#2A3441]/60 min-w-0 ${headerClassName}`}
        >
          <div className="flex items-center gap-3 min-w-0 max-w-full">
            {icon && (
              <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-900/80 border border-[#2A3441] flex items-center justify-center">
                {icon}
              </div>
            )}
            <div className="min-w-0 max-w-full">
              {badge && <div className="mb-1">{badge}</div>}
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] break-words">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#94A3B8] mt-0.5 break-words">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Main Card Content */}
      <div className={`p-4 sm:p-6 min-w-0 max-w-full ${bodyClassName}`}>
        {children}
      </div>

      {/* Optional Card Footer */}
      {footer && (
        <div className="p-4 sm:p-6 border-t border-[#2A3441]/60 bg-black/20 rounded-b-2xl sm:rounded-b-3xl min-w-0">
          {footer}
        </div>
      )}
    </Component>
  );
};
