/**
 * Report Branding Configuration
 * Establishes consistent luxury identity and attribution for DeepAstro publications.
 */

import { ReportBranding } from './types/KundliReport.js';

export const DEFAULT_REPORT_BRANDING: ReportBranding = {
  brandName: 'DeepAstro',
  reportTitle: 'JANAM KUNDLI',
  reportSubtitle: 'VEDIC ASTROLOGY & NUMEROLOGY REPORT',
  tagline: 'A Premium Life Blueprint — Graha Positions · Dasha Timeline · Numerology · Remedies',
  copyright: '© 2026 DeepAstro. All Rights Reserved.',
  creator: 'Designed & Created by Prashant Sisodhiya',
  website: 'https://deepastro.com',
  logoSvg: `
    <svg viewBox="0 0 100 100" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; vertical-align:middle;">
      <circle cx="50" cy="50" r="46" stroke="#E5C158" stroke-width="1.5" stroke-dasharray="3 3"/>
      <circle cx="50" cy="50" r="36" stroke="#D4AF37" stroke-width="1.2"/>
      <circle cx="50" cy="50" r="26" stroke="#E5C158" stroke-width="1"/>
      <circle cx="50" cy="50" r="16" stroke="#F3E5AB" stroke-width="1"/>
      <circle cx="50" cy="50" r="6" fill="#E5C158"/>
      <line x1="50" y1="4" x2="50" y2="96" stroke="#D4AF37" stroke-width="0.8" stroke-opacity="0.6"/>
      <line x1="4" y1="50" x2="96" y2="50" stroke="#D4AF37" stroke-width="0.8" stroke-opacity="0.6"/>
      <polygon points="50,18 60,38 82,50 60,62 50,82 40,62 18,50 40,38" stroke="#E5C158" stroke-width="1" fill="none"/>
    </svg>
  `.trim(),
};
