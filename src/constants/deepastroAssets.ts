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

  // 7. Reports & Personal Cosmic Journey Artwork
  reportsCosmicJourney: {
    id: 'reports-cosmic-dossier',
    title: 'Vedic Life Dossier & Astronomical Manuscript',
    src: '/images/deepastro/reports-cosmic-dossier.jpg',
    width: 1792,
    height: 1024,
    aspectRatio: '16/9',
    alt: 'Royal Vedic astrological manuscript with illuminated celestial diagrams, armillary sphere, and planetary natal chart',
    role: 'feature-intro',
    category: 'Reports & Dossiers',
    badge: 'EXECUTIVE ASTRAL DOSSIERS',
    description: 'Comprehensive archival reports grounded in deterministic sidereal calculations and ancient canons.',
    available: true,
  },

  // 8. Palmistry & Sacred Hastarekha Artwork
  palmistrySacredGeometry: {
    id: 'palmistry-sacred-geometry',
    title: 'Sacred Hastarekha & Biometric Line Geometry',
    src: '/images/deepastro/palmistry-sacred-geometry.jpg',
    width: 1792,
    height: 1024,
    aspectRatio: '16/9',
    alt: 'Sacred Vedic palmistry with glowing cyan and gold life, heart, and head lines and illuminated planetary mounts',
    role: 'feature-intro',
    category: 'Palmistry & Hastarekha',
    badge: 'BIOMETRIC HASTAREKHA GEOMETRY',
    description: 'High-resolution palm line analysis mapping energy meridians and planetary mounts to life events.',
    available: true,
  },

  // 9. Numerology & Sacred Mathematics Artwork
  numerologySacredMatrix: {
    id: 'numerology-sacred-matrix',
    title: 'Sacred Numerological Matrix & Cosmic Vibration',
    src: '/images/deepastro/numerology-sacred-matrix.jpg',
    width: 1792,
    height: 1024,
    aspectRatio: '16/9',
    alt: 'Vibrant cosmic numerology vortex with glowing 3D golden numbers 1 to 9 and radiant golden Sri Yantra',
    role: 'feature-intro',
    category: 'Vedic Numerology & Anka Shastra',
    badge: 'SACRED VEDIC ANKA SHASTRA',
    description: 'Life path, destiny, and soul urge numerical matrix aligned with planetary vibrational frequencies.',
    available: true,
  },

  // 10. AI Astrologer Sanctuary Artwork
  aiAstrologerSanctuary: {
    id: 'ai-astrologer-sanctuary',
    title: 'Celestial AI Astrologer Sanctuary',
    src: '/images/deepastro/ai-astrologer-sanctuary.jpg',
    width: 1792,
    height: 1024,
    aspectRatio: '16/9',
    alt: 'Futuristic celestial AI astrologer sanctuary with an enlightened cosmic sage, orbiting holographic planets, and neural starlight',
    role: 'hero',
    category: 'AI Astrologer Consultation',
    badge: 'NEURAL ASTRAL ORACLE',
    description: 'Autonomous multi-tradition Jyotish intelligence grounded strictly in authoritative classical sutras.',
    available: true,
  },

  // 11. Kundli Matching & Synastry Artwork
  matchingCosmicUnion: {
    id: 'matching-cosmic-union',
    title: 'Divya Kundali Milan & Ashta Koota Synastry',
    src: '/images/deepastro/matching-cosmic-union.jpg',
    width: 1792,
    height: 1024,
    aspectRatio: '16/9',
    alt: 'Divine Kundli matching showing two celestial beings of starlight connecting across an illuminated Ashta Koota mandala',
    role: 'feature-intro',
    category: 'Kundli Milan & Relationship Harmony',
    badge: '36-GUNAS ASHTA KOOTA HARMONY',
    description: 'Rigorous compatibility assessment evaluating Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi.',
    available: true,
  },

  // 12. Past Life & Karmic Matrix Artwork
  pastLifeKarma: {
    id: 'past-life-karma',
    title: 'Akashic Records & Karmic Reincarnation Wheel',
    src: '/images/deepastro/past-life-karma.jpg',
    width: 1792,
    height: 1024,
    aspectRatio: '16/9',
    alt: 'Akashic records cosmic library with glowing karmic wheel, flying illuminated scrolls, and spiral reincarnation galaxy portal',
    role: 'feature-intro',
    category: 'Karmic & Past Life Matrix',
    badge: 'AKASHIC SOUL PROGRESSION',
    description: 'Rahu-Ketu karmic axis, Atmakaraka soul desires, and Rinanu bandhana debt decoding across lifetimes.',
    available: true,
  },

  // 13. KP Astrology & Sub-Lord Radar Artwork
  kpAstrologyRadar: {
    id: 'kp-astrology-radar',
    title: 'Krishnamurti Paddhati (KP) Stellar Telemetry',
    src: '/images/deepastro/kp-astrology-radar.jpg',
    width: 1792,
    height: 1024,
    aspectRatio: '16/9',
    alt: 'High-precision KP Astrology stellar radar dividing the zodiac into cuspal sub-lords with laser coordinate telemetry',
    role: 'feature-intro',
    category: 'KP Sub-Lord System',
    badge: 'PINPOINT CUSPAL SUB-LORD RADAR',
    description: 'Placidus house division and sub-lord significance matrix for exact timing of real-world events.',
    available: true,
  },

  // 14. Muhurat & Auspicious Timing Chronometer Artwork
  muhuratTimeMatrix: {
    id: 'muhurat-time-matrix',
    title: 'Shubh Muhurat & Sacred Kala Chronometer',
    src: '/images/deepastro/muhurat-time-matrix.jpg',
    width: 1792,
    height: 1024,
    aspectRatio: '16/9',
    alt: 'Sacred Muhurat astronomical clock with interlocking sun and moon gears and Abhijit Muhurat golden beam in space',
    role: 'feature-intro',
    category: 'Muhurat & Auspicious Timing',
    badge: 'ABHIJIT & SHUBH KALA RADAR',
    description: 'Precision calculation of Choghadiya, Hora, Rahu Kalam, Yamaganda, and Abhijit Muhurat windows.',
    available: true,
  },

  // 15. Western Tropical Astrology & Aspect Matrix Artwork
  westernTropicalMatrix: {
    id: 'western-tropical-matrix',
    title: 'Western Tropical Astrology & Aspect Geometry',
    src: '/images/deepastro/western-tropical-matrix.jpg',
    width: 1792,
    height: 1024,
    aspectRatio: '16/9',
    alt: 'Futuristic Western tropical astrology and celestial zodiac wheel with illuminated trines, squares, and armillary astrolabe',
    role: 'feature-intro',
    category: 'Western Tropical Astrology',
    badge: 'TROPICAL ZODIAC · ASPECT GEOMETRY',
    description: 'High-precision Tropical coordinates, Placidus cusps, geometric aspect mechanics, and psychological archetypes.',
    available: true,
  },

  // 16. Lal Kitab Pragmatic Remedies & Elemental Altar Artwork
  lalKitabRemedialAltar: {
    id: 'lalkitab-remedial-altar',
    title: 'Lal Kitab Red Book Remedies & Elemental Altar',
    src: '/images/deepastro/lalkitab-remedial-altar.jpg',
    width: 1792,
    height: 1024,
    aspectRatio: '16/9',
    alt: 'Ancient mystical Lal Kitab red book with gold embossing, sacred fire, copper water vessel, and cosmic planetary orbits',
    role: 'feature-intro',
    category: 'Lal Kitab Shastra',
    badge: '1952 SAMHITA · ELEMENTAL ALCHEMY',
    description: 'Pragmatic astrological remedies balancing elemental energies through Sattvic disciplines and planetary house pacification.',
    available: true,
  },

  // 17. Financial Astrology & Cosmic Market Terminal Artwork
  financialAstrologyLab: {
    id: 'financial-astrology-lab',
    title: 'Cosmic Market Intelligence & Mundane Cycle Radar',
    src: '/images/deepastro/financial-astrology-lab.jpg',
    width: 1792,
    height: 1024,
    aspectRatio: '16/9',
    alt: 'Futuristic financial astrology trading terminal with holographic candlestick charts, planetary transit orbits, and celestial bull and bear',
    role: 'hero',
    category: 'Financial Astrology & Markets',
    badge: 'REALTIME MUNDANE RADAR · FINANCIAL ASTROLOGY',
    description: 'Intersection of high-precision planetary ephemeris, sector cycles, and real-time market telemetry.',
    available: true,
  },
};
