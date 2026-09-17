import { ComponentType } from 'react';
import {
  Compass,
  Sun,
  Layers,
  Sparkles,
  Shield,
  Clock,
  Activity,
  Binary,
  Globe,
  Briefcase,
  Coins,
  Heart,
  BookOpen,
  Calendar,
  Brain,
  LucideIcon
} from 'lucide-react';

export type CosmicModuleId =
  | 'overview'
  | 'planets'
  | 'houses'
  | 'nakshatras'
  | 'yogas'
  | 'dasha'
  | 'transits'
  | 'vargas'
  | 'kp'
  | 'western'
  | 'career'
  | 'money'
  | 'relationships'
  | 'timeline'
  | 'daily-context'
  | 'ai-astrologer';

export type DataSourceType =
  | 'CALCULATED'
  | 'EVIDENCE-GROUNDED'
  | 'INTERPRETIVE'
  | 'REAL-TIME'
  | 'COMBINED';

export type VerificationStatus = 'VERIFIED' | 'CALCULATING' | 'ACTIVE';

export interface CosmicModuleMeta {
  id: CosmicModuleId;
  label: string;
  category: 'FOUNDATION' | 'TIMING' | 'HARMONICS' | 'LIFE_DOMAINS' | 'INTELLIGENCE';
  icon: LucideIcon;
  dataSource: DataSourceType;
  verificationStatus: VerificationStatus;
  badge?: string;
  description: string;
  requiresSession: boolean;
  requiresPremium: boolean;
}

export const COSMIC_MODULE_REGISTRY: CosmicModuleMeta[] = [
  {
    id: 'overview',
    label: 'Cosmic Overview',
    category: 'FOUNDATION',
    icon: Compass,
    dataSource: 'CALCULATED',
    verificationStatus: 'VERIFIED',
    description: 'Astronomical snapshot, primary Lagna, Moon sign, and distinctive karmic signatures.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'planets',
    label: 'Planets & Dignities',
    category: 'FOUNDATION',
    icon: Sun,
    dataSource: 'CALCULATED',
    verificationStatus: 'VERIFIED',
    description: 'Exact ephemeris degrees, Shadbala dignity, combustion, retrogression, and aspect rays.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'houses',
    label: '12 Bhavas (Houses)',
    category: 'FOUNDATION',
    icon: Layers,
    dataSource: 'CALCULATED',
    verificationStatus: 'VERIFIED',
    description: 'Bhava Madhya cusp degrees, ruling lords, resident planets, and functional associations.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'nakshatras',
    label: 'Nakshatras (Lunar)',
    category: 'FOUNDATION',
    icon: Sparkles,
    dataSource: 'CALCULATED',
    verificationStatus: 'VERIFIED',
    description: '27 lunar mansions, pada coordinates, governing deities, and stellar rulerships.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'yogas',
    label: 'Mathematical Yogas',
    category: 'FOUNDATION',
    icon: Shield,
    dataSource: 'CALCULATED',
    verificationStatus: 'VERIFIED',
    description: 'Classical Parashari and Jaimini planetary combinations proven via deterministic logic.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'dasha',
    label: 'Vimshottari Dasha',
    category: 'TIMING',
    icon: Clock,
    dataSource: 'CALCULATED',
    verificationStatus: 'VERIFIED',
    description: '120-year planetary progression calibrated from exact natal Moon nakshatra degree.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'transits',
    label: 'Transit Radar (Gochar)',
    category: 'TIMING',
    icon: Activity,
    dataSource: 'REAL-TIME',
    verificationStatus: 'VERIFIED',
    description: 'Real-time ephemeris positions transiting over natal houses and sensitive points.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'vargas',
    label: 'Vargas (D1, D9, D10)',
    category: 'HARMONICS',
    icon: Layers,
    dataSource: 'CALCULATED',
    verificationStatus: 'VERIFIED',
    description: 'Harmonic divisional charts: D1 Rashi, D9 Navamsha (soul/dharma), D10 Dashamsha (career).',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'kp',
    label: 'KP Stellar Astrology',
    category: 'HARMONICS',
    icon: Binary,
    dataSource: 'CALCULATED',
    verificationStatus: 'VERIFIED',
    description: 'Placidus cuspal divisions with Krishnamurti sub-lord and sub-sub-lord rulers.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'western',
    label: 'Western Tropical',
    category: 'HARMONICS',
    icon: Globe,
    dataSource: 'CALCULATED',
    verificationStatus: 'VERIFIED',
    description: 'Sayana zodiac placements and major Ptolemaic aspect geometry.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'career',
    label: 'Career Deep Dive',
    category: 'LIFE_DOMAINS',
    icon: Briefcase,
    dataSource: 'EVIDENCE-GROUNDED',
    verificationStatus: 'VERIFIED',
    description: '10th house karma, 10th lord, D10 Dashamsha, professional karakas, and active dasha alignment.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'money',
    label: 'Wealth & Dhana',
    category: 'LIFE_DOMAINS',
    icon: Coins,
    dataSource: 'EVIDENCE-GROUNDED',
    verificationStatus: 'VERIFIED',
    description: '2nd & 11th bhavas, Dhana yogas, Lakshmi houses (5th & 9th), and fiscal significators.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'relationships',
    label: 'Relationships & Dharma',
    category: 'LIFE_DOMAINS',
    icon: Heart,
    dataSource: 'EVIDENCE-GROUNDED',
    verificationStatus: 'VERIFIED',
    description: '7th bhava dynamics, Venus/Jupiter karaka dignity, and D9 Navamsha relational harmonics.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'timeline',
    label: '10-Chapter Life Story',
    category: 'LIFE_DOMAINS',
    icon: BookOpen,
    dataSource: 'EVIDENCE-GROUNDED',
    verificationStatus: 'VERIFIED',
    description: 'Personalized narrative chapters synthesized directly from verified planetary evidence nodes.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'daily-context',
    label: 'Daily Cosmic Weather',
    category: 'TIMING',
    icon: Calendar,
    dataSource: 'REAL-TIME',
    verificationStatus: 'VERIFIED',
    description: 'Daily transit moon trigger, active natal activation, and weekly thematic trajectory.',
    requiresSession: true,
    requiresPremium: false,
  },
  {
    id: 'ai-astrologer',
    label: 'Ask DeepAstro AI',
    category: 'INTELLIGENCE',
    icon: Brain,
    dataSource: 'INTERPRETIVE',
    verificationStatus: 'VERIFIED',
    badge: 'WHY?',
    description: 'Evidence-grounded conversational synthesis strictly citing verified chart calculations.',
    requiresSession: true,
    requiresPremium: false,
  },
];

export const getCosmicModule = (id: CosmicModuleId): CosmicModuleMeta | undefined => {
  return COSMIC_MODULE_REGISTRY.find(m => m.id === id);
};

export const VERIFIED_MODULE_COUNT = COSMIC_MODULE_REGISTRY.length;
