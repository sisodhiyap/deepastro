/**
 * DeepAstro Centralized Visual Asset Inventory & Metadata
 * 
 * Maps supplied cinematic Vedic astrology artwork to their canonical
 * application routes, responsive roles, and accessibility specifications.
 */

export interface DeepAstroArtworkMetadata {
  id: string;
  title: string;
  src: string;
  width: number;
  height: number;
  aspectRatio: string;
  alt: string;
  role: 'hero' | 'feature-intro' | 'banner' | 'card';
  category: string;
  badge: string;
  description: string;
  available: boolean;
}

export const DEEPASTRO_ARTWORK: Record<string, DeepAstroArtworkMetadata> = {
  // Homepage Hero Artwork (Preserved separate asset)
  hero: {
    id: 'hero-page',
    title: 'DeepAstro Cosmic Portal Hero',
    src: '/images/deepastro/hero-page.png',
    width: 1848,
    height: 851,
    aspectRatio: '1848/851',
    alt: 'DeepAstro cosmic Vedic astrology portal hero featuring ancient sage wisdom and illuminated planetary orbits',
    role: 'hero',
    category: 'Core Platform',
    badge: 'CELESTIAL OPERATING SYSTEM',
    description: 'High-precision sidereal calculations united with modern cosmic intelligence.',
    available: true,
  },

  // 1. Kundli & Vedic Chart Artwork
  kundliVedicChart: {
    id: 'kundli-vedic-chart',
    title: 'Kundli & Vedic Chart Artwork',
    src: '/images/deepastro/kundli-vedic-chart.png',
    width: 1672,
    height: 941,
    aspectRatio: '1672/941',
    alt: 'Vedic Kundli and birth chart planetary geometry with classical scriptures and celestial alignments',
    role: 'feature-intro',
    category: 'Vedic Kundli & Vargas',
    badge: 'DETERMINISTIC VEDIC GEOMETRY',
    description: 'Lahiri Ayanamsha sidereal ephemeris with complete divisional charts and Shodashavarga.',
    available: true,
  },

  // 2. Cosmic Intelligence Artwork
  cosmicIntelligence: {
    id: 'cosmic-intelligence',
    title: 'Cosmic Intelligence Artwork',
    src: '/images/deepastro/cosmic-intelligence.png',
    width: 1672,
    height: 941,
    aspectRatio: '1672/941',
    alt: 'Cosmic Intelligence AI neural observatory fusing Vedic wisdom with planetary telemetry and decision timelines',
    role: 'feature-intro',
    category: 'Cosmic Intelligence',
    badge: 'INTELLIGENCE FABRIC 3.0',
    description: 'Deterministic astronomical calculations cross-referenced with your confirmed life context.',
    available: true,
  },

  // 3. Future Intelligence Artwork
  futureIntelligence: {
    id: 'future-intelligence',
    title: 'Future Intelligence Artwork',
    src: '/images/deepastro/future-intelligence.png',
    width: 1672,
    height: 941,
    aspectRatio: '1672/941',
    alt: 'Future Intelligence temporal progression showing timeline gates from 3 months to lifetime destiny',
    role: 'feature-intro',
    category: 'Future Intelligence',
    badge: 'PERSONAL VEDIC TIMELINE',
    description: 'Multi-year destiny trajectories, Vimshottari progression, and karmic opportunity windows.',
    available: true,
  },

  // 4. Nakshatra & Cosmic Knowledge Artwork
  nakshatraCosmicKnowledge: {
    id: 'nakshatra-cosmic-knowledge',
    title: 'Nakshatra & Cosmic Knowledge Artwork',
    src: '/images/deepastro/nakshatra-cosmic-knowledge.png',
    width: 1672,
    height: 941,
    aspectRatio: '1672/941',
    alt: '27 Nakshatras cosmic blueprint of life with Panchang, Muhurat, and celestial mandala',
    role: 'feature-intro',
    category: 'Panchang & Muhurat',
    badge: '27 NAKSHATRAS & KALA SHASTRA',
    description: 'Solilunar ephemeris, Pancha Anga coordinates, and auspicious timing calculation.',
    available: true,
  },

  // 5. Tarot & Spiritual Guidance Artwork
  tarotSpiritualGuidance: {
    id: 'tarot-spiritual-guidance',
    title: 'Tarot & Spiritual Guidance Artwork',
    src: '/images/deepastro/tarot-spiritual-guidance.png',
    width: 1672,
    height: 941,
    aspectRatio: '1672/941',
    alt: 'DeepAstro Tarot and spiritual guidance altar with sacred cards, crystal sphere, and astral mandala',
    role: 'feature-intro',
    category: 'Tarot & Divination',
    badge: '78 SACRED CARDS · CRYPTO RNG',
    description: 'Astrologically contextualized archetypal reflection and intuitive clarity.',
    available: true,
  },

  // 6. Planetary Insights & Transits Artwork
  planetaryInsightsTransits: {
    id: 'planetary-insights-transits',
    title: 'Planetary Insights & Transits Artwork',
    src: '/images/deepastro/planetary-insights-transits.png',
    width: 1672,
    height: 941,
    aspectRatio: '1672/941',
    alt: 'Real-time planetary transits, Gochara, planetary aspects, and transit impact timeline',
    role: 'feature-intro',
    category: 'Daily Predictions & Gochara',
    badge: 'REAL-TIME GOCHARA TELEMETRY',
    description: 'Dynamic planetary transits mapped against your natal Moon and Ascendant.',
    available: true,
  },

  // 7. Reports & Personal Cosmic Journey Artwork (UNAVAILABLE - NOT SUPPLIED)
  reportsCosmicJourney: {
    id: 'reports-cosmic-journey',
    title: 'Reports & Personal Cosmic Journey Artwork',
    src: '',
    width: 0,
    height: 0,
    aspectRatio: '',
    alt: 'Reports and personal cosmic journey artwork',
    role: 'feature-intro',
    category: 'Reports & Dossiers',
    badge: 'EXECUTIVE PDF DOSSIERS',
    description: 'Comprehensive archival reports grounded in deterministic sidereal calculations.',
    available: false, // Safely marked false; no fabricated image or placeholder substituted
  },
};
