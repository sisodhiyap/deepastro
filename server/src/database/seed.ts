/**
 * DeepAstro Seed Data
 * Certified astrologers, subscription tiers, and classical knowledge chunks.
 */

import { AstrologerRecord } from './db.js';

export const SEED_PLANS = [
  {
    id: 'FREE',
    name: 'Cosmic Seeker (Free)',
    priceCents: 0,
    currency: 'INR',
    features: [
      'Basic Daily Horoscope & Transit Overview',
      'Core Kundli (Ascendant, Sun & Moon sign)',
      'Limited AstroBot questions (5/day)',
      'Basic Life Path Numerology',
      'Browse Certified Astrologer Profiles',
    ],
  },
  {
    id: 'PREMIUM',
    name: 'Cosmic Voyager (Premium)',
    priceCents: 49900, // ₹499/mo
    currency: 'INR',
    features: [
      'Everything in Free',
      'Complete Vedic Kundli (D1, D9 Navamsa, D10 Dashamsha)',
      'Vimshottari Dasha Analysis & Timeline to 120 yrs',
      '36-Point Ashtakoota Kundli Milan & Manglik checks',
      'Detailed Panchang & Auspicious Muhurat Finder',
      'Palmistry Vision Image Upload Analysis',
      'Full Lal Kitab Diagnostics & Remedies Tracker',
      'Direct Astrologer Phone, WhatsApp & Email Access',
      'Unlimited AI AstroBot with Classical Grounding',
      'Instant PDF Report Downloads',
    ],
  },
  {
    id: 'PRO',
    name: 'Cosmic Sovereign (Pro)',
    priceCents: 149900, // ₹1,499/mo
    currency: 'INR',
    features: [
      'Everything in Premium',
      'Multi-Model Cross-Checked AI (OpenAI + Gemini + Grok)',
      '1 Free 30-minute Astrologer Consultation / month',
      'Priority Astrologer Booking Slots',
      'Exclusive Muhurat Calendars & Business Strategy Auspices',
      'Bespoke Handcrafted Annual PDF Life Dossier',
      'Family Profile Vault (Store up to 10 Kundlis)',
    ],
  },
];

export const SEED_ASTROLOGERS: AstrologerRecord[] = [
  {
    id: 'astro_1',
    name: 'Acharya Vidyadhar Shastri',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    bio: 'Gold medalist from Sampurnanand Sanskrit University, Varanasi with 28 years of rigorous practice in Parashari Jyotish, Muhurat, and Vivaha Milan.',
    experienceYears: 28,
    languages: ['Hindi', 'Sanskrit', 'English'],
    rating: 4.96,
    reviewCount: 1420,
    pricePerMinuteCents: 6000, // ₹60/min
    consultationTypes: ['Call', 'Video', 'Chat'],
    specialties: ['Vedic Astrology', 'Kundli Milan', 'Muhurat', 'Remedies'],
    phoneProtected: '+91 98110 44219',
    whatsappProtected: '+91 98110 44219',
    emailProtected: 'acharya.vidyadhar@deepastro.com',
    isVerified: true,
    isAvailable: true,
  },
  {
    id: 'astro_2',
    name: 'Dr. Meenakshi Ramanathan',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Ph.D. in Vedic Mathematics & Astrology. Renowned expert in KP Astrology, Career Transits, and Higher Education timing.',
    experienceYears: 21,
    languages: ['English', 'Tamil', 'Hindi'],
    rating: 4.94,
    reviewCount: 980,
    pricePerMinuteCents: 7500, // ₹75/min
    consultationTypes: ['Video', 'Call'],
    specialties: ['KP Astrology', 'Career & Finance', 'Nadi Jyotish'],
    phoneProtected: '+91 98402 77134',
    whatsappProtected: '+91 98402 77134',
    emailProtected: 'dr.meenakshi@deepastro.com',
    isVerified: true,
    isAvailable: true,
  },
  {
    id: 'astro_3',
    name: 'Pandit Rajeshwar Mukherjee',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Fifth-generation practitioner of Lal Kitab remedies, Palmistry, and Vastu Shastra. Known for pragmatic and transformative remedies.',
    experienceYears: 19,
    languages: ['Hindi', 'Bengali', 'English'],
    rating: 4.91,
    reviewCount: 840,
    pricePerMinuteCents: 5000, // ₹50/min
    consultationTypes: ['Call', 'Chat'],
    specialties: ['Lal Kitab', 'Palmistry', 'Vastu Shastra'],
    phoneProtected: '+91 99331 55678',
    whatsappProtected: '+91 99331 55678',
    emailProtected: 'pt.rajeshwar@deepastro.com',
    isVerified: true,
    isAvailable: true,
  },
  {
    id: 'astro_4',
    name: 'Devika Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    bio: 'Master Numerologist and Gemstone consultant guiding entrepreneurs, artists, and leaders on name vibrations and relationship synergy.',
    experienceYears: 15,
    languages: ['English', 'Hindi', 'Punjabi'],
    rating: 4.98,
    reviewCount: 1120,
    pricePerMinuteCents: 6500, // ₹65/min
    consultationTypes: ['Call', 'Video', 'Chat'],
    specialties: ['Numerology', 'Chaldean Vibrations', 'Gemstones'],
    phoneProtected: '+91 98205 91823',
    whatsappProtected: '+91 98205 91823',
    emailProtected: 'devika.sharma@deepastro.com',
    isVerified: true,
    isAvailable: true,
  },
];

export const SEED_KNOWLEDGE = [
  {
    source: 'Brihat Parashara Hora Shastra',
    tradition: 'Parashari',
    topic: 'Kendra and Trikona Synergy',
    content: 'When the lords of Kendra (1, 4, 7, 10) and Trikona (1, 5, 9) combine through conjunction, mutual aspect, or parivartana, they form Raja Yogas that confer auspicious status, honor, and prosperity.',
  },
  {
    source: 'Phaladeepika',
    tradition: 'Vedic',
    topic: 'Dasha Phala Principles',
    content: 'The Dasha of a benefic planet placed in exaltation or own house yields auspicious fruits, joy, mental clarity, and elevation. Malefics in dusthanas create challenges meant for soul maturation.',
  },
  {
    source: 'Lal Kitab (1952)',
    tradition: 'Lal Kitab',
    topic: 'Artificial Planets & Remedial Philosophy',
    content: 'Planets act in concert as synthetic pairs (e.g. Jupiter + Rahu). Remedies must never harm natural streams or living entities, but rebalance planetary elements through conscious charity and alignment.',
  },
];
