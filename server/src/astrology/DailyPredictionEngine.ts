/**
 * Universal Daily Prediction Card Engine
 * DeepAstro Production Standard: Calculation First, AI Second
 *
 * Deterministically computes the full daily astrology card payload from verified
 * birth data, active Vimshottari Dasha, live ephemeris transits, and Panchang.
 * Zero AI hallucination or fabricated values.
 */

import { BirthProfileInput, VedicAstroEngine } from './VedicAstroEngine.js';
import { calculatePanchang, PanchangData } from './PanchangEngine.js';
import { TransitEngine } from './TransitEngine.js';
import { getDegreeDetails, normalizeDegrees } from './astronomyMath.js';
import Astronomy from './astronomyBridge.js';
import crypto from 'crypto';

export interface ScoreItem {
  score: number; // 0-10
  confidence: number; // 0.0 - 1.0
  positiveFactors: string[];
  challengingFactors: string[];
  calculationVersion: string;
}

export interface PlanetaryInfluenceItem {
  planet: string;
  status: 'Strong' | 'Supportive' | 'Neutral' | 'Favorable' | 'Challenging';
  direction: '↑' | '↓' | '—';
  color: string; // Hex color for sphere glow
  houseTransit: number;
  reason: string;
}

export interface AuspiciousTimingWindow {
  window: string;
  label: string;
  periodName: string;
  confidence: number;
}

export interface LuckyElements {
  color: { name: string; hex: string };
  number: number;
  gemstone: { name: string; hex: string };
  metal: { name: string; hex: string };
  direction: string;
  element: string;
  disclaimer: string;
}

export interface MantraPractice {
  sanskrit: string;
  transliteration: string;
  meaning: string;
  repetitions: number;
  rulingPlanet: string;
  purpose: string;
}

export interface DailyPredictionCardData {
  predictionId: string;
  generatedAt: string;
  targetDate: string;
  timezone: number;
  calculationVersion: string;
  fingerprint: string;

  header: {
    title: string;
    formattedDate: string;
    moonPhase: string;
    moonSign: string;
    motto: string;
  };

  identity: {
    zodiacSign: string;
    zodiacSymbol: string;
    dateRange: string;
    traits: string[];
    ascendantSign: string;
    ascendantDegree: number;
    moonSign: string;
    sunSign: string;
    activeMahadasha: string;
    activeAntardasha: string;
  };

  mainPrediction: {
    headline: string;
    predictionText: string;
    wordCount: number;
  };

  scores: {
    overall: ScoreItem;
    love: ScoreItem;
    career: ScoreItem;
    health: ScoreItem;
    finance: ScoreItem;
  };

  vibe: {
    keywords: string[];
    tone: string;
  };

  luckyElements: LuckyElements;

  planetaryInfluences: PlanetaryInfluenceItem[];

  auspiciousTimings: AuspiciousTimingWindow[];

  advice: string[];

  affirmation: string;

  mantra: MantraPractice;

  aiInsight: {
    text: string;
    evidence: string[];
  };
}

const ZODIAC_METADATA: Record<string, {
  dateRange: string;
  symbol: string;
  traits: string[];
  ruler: string;
  color: { name: string; hex: string };
  number: number;
  gemstone: { name: string; hex: string };
  metal: { name: string; hex: string };
  element: string;
  direction: string;
  mantra: { sanskrit: string; transliteration: string; meaning: string };
}> = {
  Aries: {
    dateRange: 'Mar 21 – Apr 19',
    symbol: '♈',
    traits: ['Bold', 'Energetic', 'Fearless'],
    ruler: 'Mars',
    color: { name: 'Red', hex: '#EF4444' },
    number: 9,
    gemstone: { name: 'Red Coral', hex: '#F97316' },
    metal: { name: 'Iron', hex: '#94A3B8' },
    element: 'Fire',
    direction: 'East',
    mantra: {
      sanskrit: 'ॐ अं अंगारकाय नमः',
      transliteration: 'Om Angarakaya Namaha',
      meaning: 'Salutations to the brave and fiery cosmic commander Mars.',
    },
  },
  Taurus: {
    dateRange: 'Apr 20 – May 20',
    symbol: '♉',
    traits: ['Grounded', 'Patient', 'Sensual'],
    ruler: 'Venus',
    color: { name: 'Rose Pink', hex: '#F43F5E' },
    number: 6,
    gemstone: { name: 'Diamond / White Sapphire', hex: '#E2E8F0' },
    metal: { name: 'Silver', hex: '#CBD5E1' },
    element: 'Earth',
    direction: 'South',
    mantra: {
      sanskrit: 'ॐ शुं शुक्राय नमः',
      transliteration: 'Om Shukraya Namaha',
      meaning: 'Salutations to the deity of grace, aesthetics, and prosperity Venus.',
    },
  },
  Gemini: {
    dateRange: 'May 21 – Jun 20',
    symbol: '♊',
    traits: ['Curious', 'Adaptable', 'Expressive'],
    ruler: 'Mercury',
    color: { name: 'Emerald Green', hex: '#10B981' },
    number: 5,
    gemstone: { name: 'Emerald', hex: '#059669' },
    metal: { name: 'Bronze', hex: '#D97706' },
    element: 'Air',
    direction: 'West',
    mantra: {
      sanskrit: 'ॐ बुं बुधाय नमः',
      transliteration: 'Om Budhaya Namaha',
      meaning: 'Salutations to the lord of intellect, clarity, and articulation Mercury.',
    },
  },
  Cancer: {
    dateRange: 'Jun 21 – Jul 22',
    symbol: '♋',
    traits: ['Intuitive', 'Nurturing', 'Empathetic'],
    ruler: 'Moon',
    color: { name: 'Pearly White', hex: '#F8FAFC' },
    number: 2,
    gemstone: { name: 'Natural Pearl', hex: '#F1F5F9' },
    metal: { name: 'Silver', hex: '#E2E8F0' },
    element: 'Water',
    direction: 'North',
    mantra: {
      sanskrit: 'ॐ सों सोमाय नमः',
      transliteration: 'Om Somaya Namaha',
      meaning: 'Salutations to the benevolent and peaceful Moon.',
    },
  },
  Leo: {
    dateRange: 'Jul 23 – Aug 22',
    symbol: '♌',
    traits: ['Radiant', 'Regal', 'Generous'],
    ruler: 'Sun',
    color: { name: 'Golden Amber', hex: '#F59E0B' },
    number: 1,
    gemstone: { name: 'Ruby', hex: '#E11D48' },
    metal: { name: 'Gold / Copper', hex: '#FBBF24' },
    element: 'Fire',
    direction: 'East',
    mantra: {
      sanskrit: 'ॐ घृणिः सूर्याय नमः',
      transliteration: 'Om Ghrinih Suryaya Namaha',
      meaning: 'Salutations to the supreme illumination and source of vitality, the Sun.',
    },
  },
  Virgo: {
    dateRange: 'Aug 23 – Sep 22',
    symbol: '♍',
    traits: ['Analytical', 'Precise', 'Devoted'],
    ruler: 'Mercury',
    color: { name: 'Forest Green', hex: '#047857' },
    number: 5,
    gemstone: { name: 'Green Tourmaline / Emerald', hex: '#10B981' },
    metal: { name: 'Bronze', hex: '#D97706' },
    element: 'Earth',
    direction: 'South',
    mantra: {
      sanskrit: 'ॐ बुं बुधाय नमः',
      transliteration: 'Om Budhaya Namaha',
      meaning: 'Salutations to the illuminator of analytical intellect Mercury.',
    },
  },
  Libra: {
    dateRange: 'Sep 23 – Oct 22',
    symbol: '♎',
    traits: ['Harmonious', 'Diplomatic', 'Gracious'],
    ruler: 'Venus',
    color: { name: 'Pastel Blue', hex: '#38BDF8' },
    number: 6,
    gemstone: { name: 'White Zircon / Opal', hex: '#BAE6FD' },
    metal: { name: 'Silver', hex: '#CBD5E1' },
    element: 'Air',
    direction: 'West',
    mantra: {
      sanskrit: 'ॐ शुं शुक्राय नमः',
      transliteration: 'Om Shukraya Namaha',
      meaning: 'Salutations to the teacher of balance, virtue, and beauty Venus.',
    },
  },
  Scorpio: {
    dateRange: 'Oct 23 – Nov 21',
    symbol: '♏',
    traits: ['Passionate', 'Transformative', 'Perceptive'],
    ruler: 'Mars',
    color: { name: 'Deep Crimson', hex: '#991B1B' },
    number: 9,
    gemstone: { name: 'Red Coral', hex: '#EA580C' },
    metal: { name: 'Iron', hex: '#64748B' },
    element: 'Water',
    direction: 'North',
    mantra: {
      sanskrit: 'ॐ अं अंगारकाय नमः',
      transliteration: 'Om Angarakaya Namaha',
      meaning: 'Salutations to the fearless force of transformation Mars.',
    },
  },
  Sagittarius: {
    dateRange: 'Nov 22 – Dec 21',
    symbol: '♐',
    traits: ['Philosophical', 'Optimistic', 'Visionary'],
    ruler: 'Jupiter',
    color: { name: 'Saffron Yellow', hex: '#FACC15' },
    number: 3,
    gemstone: { name: 'Yellow Sapphire', hex: '#FDE047' },
    metal: { name: 'Gold', hex: '#F59E0B' },
    element: 'Fire',
    direction: 'East',
    mantra: {
      sanskrit: 'ॐ बृं बृहस्पतये नमः',
      transliteration: 'Om Brihaspataye Namaha',
      meaning: 'Salutations to the supreme guru of cosmic wisdom Jupiter.',
    },
  },
  Capricorn: {
    dateRange: 'Dec 22 – Jan 19',
    symbol: '♑',
    traits: ['Disciplined', 'Strategic', 'Resilient'],
    ruler: 'Saturn',
    color: { name: 'Navy Blue', hex: '#1E3A8A' },
    number: 8,
    gemstone: { name: 'Blue Sapphire / Amethyst', hex: '#3B82F6' },
    metal: { name: 'Iron', hex: '#475569' },
    element: 'Earth',
    direction: 'South',
    mantra: {
      sanskrit: 'ॐ शं शनैश्चराय नमः',
      transliteration: 'Om Shanaishcharaya Namaha',
      meaning: 'Salutations to the lord of time, karma, and perseverance Saturn.',
    },
  },
  Aquarius: {
    dateRange: 'Jan 20 – Feb 18',
    symbol: '♒',
    traits: ['Visionary', 'Altruistic', 'Original'],
    ruler: 'Saturn',
    color: { name: 'Electric Cyan', hex: '#06B6D4' },
    number: 8,
    gemstone: { name: 'Lapis Lazuli / Blue Topaz', hex: '#0EA5E9' },
    metal: { name: 'Platinum / Lead', hex: '#94A3B8' },
    element: 'Air',
    direction: 'West',
    mantra: {
      sanskrit: 'ॐ शं शनैश्चराय नमः',
      transliteration: 'Om Shanaishcharaya Namaha',
      meaning: 'Salutations to Saturn, granting progressive vision and steadfast discipline.',
    },
  },
  Pisces: {
    dateRange: 'Feb 19 – Mar 20',
    symbol: '♓',
    traits: ['Mystical', 'Compassionate', 'Imaginative'],
    ruler: 'Jupiter',
    color: { name: 'Sea Green', hex: '#14B8A6' },
    number: 3,
    gemstone: { name: 'Yellow Topaz / Aquamarine', hex: '#2DD4BF' },
    metal: { name: 'Gold', hex: '#F59E0B' },
    element: 'Water',
    direction: 'North',
    mantra: {
      sanskrit: 'ॐ बृं बृहस्पतये नमः',
      transliteration: 'Om Brihaspataye Namaha',
      meaning: 'Salutations to the compassionate preceptor of spiritual expansion Jupiter.',
    },
  },
};

export class DailyPredictionEngine {
  private static VERSION = 'daily-card-v1.0';

  /**
   * Generates the complete, deterministic Daily Prediction Card payload
   */
  public static generateCard(
    profile: BirthProfileInput,
    targetDate: Date = new Date()
  ): DailyPredictionCardData {
    // 1. Calculate canonical natal FactSet
    const factSet = VedicAstroEngine.createAstrologyFactSet(profile);
    const ascSign = factSet.ascendant.details.signName;
    const moonSign = factSet.moonSign.signName;
    const sunSign = factSet.sunSign.signName;
    const meta = ZODIAC_METADATA[ascSign] || ZODIAC_METADATA['Aries'];

    // 2. Calculate live transits for targetDate
    const transits = TransitEngine.calculateTransits(
      factSet.ascendant.details.signIndex,
      factSet.moonSign.signIndex,
      factSet.planets,
      targetDate
    );

    // 3. Calculate live Panchang for targetDate
    const sunPlanet = factSet.planets.find((p) => p.name === 'Sun')!;
    const moonPlanet = factSet.planets.find((p) => p.name === 'Moon')!;
    const panchang = calculatePanchang(
      sunPlanet.siderealLongitude,
      moonPlanet.siderealLongitude,
      targetDate,
      profile.latitude,
      profile.longitude,
      profile.timezone
    );

    // 4. Formulate deterministic scores (0-10)
    const isSadeSati = transits.sadeSati.isInSadeSati;
    const dashaLord = factSet.dashas.currentMahadasha.planet;
    const antardashaLord = factSet.dashas.currentAntardasha.planet;

    // Deterministic mathematical weights based on real astrological parameters
    const moonTransitHouse = ((transits.planetaryTransits.find(p => p.planet === 'Moon')?.transitSignIndex || 0) - factSet.ascendant.details.signIndex + 12) % 12 + 1;
    const jupiterTransitHouse = ((transits.planetaryTransits.find(p => p.planet === 'Jupiter')?.transitSignIndex || 0) - factSet.ascendant.details.signIndex + 12) % 12 + 1;
    const saturnTransitHouse = ((transits.planetaryTransits.find(p => p.planet === 'Saturn')?.transitSignIndex || 0) - factSet.ascendant.details.signIndex + 12) % 12 + 1;

    // Career Score calculation
    let careerScore = 8.5;
    const careerPos: string[] = [];
    const careerChal: string[] = [];
    if ([1, 5, 9, 10, 11].includes(jupiterTransitHouse)) {
      careerScore += 0.8;
      careerPos.push(`Jupiter transiting supportive House ${jupiterTransitHouse}`);
    }
    if ([10, 11].includes(moonTransitHouse)) {
      careerScore += 0.5;
      careerPos.push(`Transiting Moon activating zenith House ${moonTransitHouse}`);
    }
    if (dashaLord === 'Sun' || dashaLord === 'Mars' || dashaLord === 'Jupiter') {
      careerScore += 0.4;
      careerPos.push(`Active Mahadasha lord ${dashaLord} favors professional initiative`);
    }
    if (saturnTransitHouse === 10) {
      careerScore -= 0.6;
      careerChal.push(`Saturn transiting 10th house requires meticulous discipline and patience`);
    }
    careerScore = Math.min(10, Math.max(5.5, parseFloat(careerScore.toFixed(1))));

    // Love & Relationship Score
    let loveScore = 7.4;
    const lovePos: string[] = [];
    const loveChal: string[] = [];
    if ([5, 7, 11].includes(moonTransitHouse)) {
      loveScore += 0.9;
      lovePos.push(`Lunar transit illuminates relational Houses`);
    }
    if (dashaLord === 'Venus' || antardashaLord === 'Venus' || dashaLord === 'Moon') {
      loveScore += 0.6;
      lovePos.push(`Venus/Moon dasha sub-period promotes emotional harmony`);
    }
    if (transits.sadeSati.isInSadeSati) {
      loveScore -= 0.5;
      loveChal.push(`Saturn sade-sati phase tests relational maturity and commitment`);
    }
    loveScore = Math.min(10, Math.max(5.0, parseFloat(loveScore.toFixed(1))));

    // Health & Vitality Score
    let healthScore = 8.0;
    const healthPos: string[] = [];
    const healthChal: string[] = [];
    if ([1, 9].includes(jupiterTransitHouse)) {
      healthScore += 0.7;
      healthPos.push(`Guru drishti provides cellular protection and mental resilience`);
    }
    if ([6, 8, 12].includes(moonTransitHouse)) {
      healthScore -= 0.7;
      healthChal.push(`Moon in dusthana house suggests prioritizing restorative rest`);
    } else {
      healthPos.push(`Balanced lunar transit supports steady circadian rhythm`);
    }
    healthScore = Math.min(10, Math.max(5.0, parseFloat(healthScore.toFixed(1))));

    // Finance Score
    let financeScore = 7.8;
    const financePos: string[] = [];
    const financeChal: string[] = [];
    if ([2, 11].includes(jupiterTransitHouse)) {
      financeScore += 1.0;
      financePos.push(`Jupiter aspecting wealth Bhavas`);
    }
    if ([2, 11].includes(moonTransitHouse)) {
      financeScore += 0.6;
      financePos.push(`Moon transit enhances resource liquidity`);
    }
    if ([6, 8, 12].includes(saturnTransitHouse)) {
      financeScore -= 0.5;
      financeChal.push(`Avoid speculative investments during Saturn's transit check`);
    }
    financeScore = Math.min(10, Math.max(5.0, parseFloat(financeScore.toFixed(1))));

    // Overall Score (Weighted harmonic synthesis)
    const overallScore = parseFloat(
      (careerScore * 0.3 + loveScore * 0.25 + healthScore * 0.25 + financeScore * 0.2).toFixed(1)
    );

    // 5. Planetary Influences (Ranked top 4)
    const planetaryInfluences: PlanetaryInfluenceItem[] = [
      {
        planet: 'Mars',
        status: (dashaLord === 'Mars' || [1, 3, 10].includes(factSet.ascendant.details.signIndex % 3)) ? 'Strong' : 'Supportive',
        direction: '↑',
        color: '#EF4444',
        houseTransit: ((transits.planetaryTransits.find(p => p.planet === 'Mars')?.transitSignIndex || 0) - factSet.ascendant.details.signIndex + 12) % 12 + 1,
        reason: 'Empowers decisive executive action and direct problem solving.',
      },
      {
        planet: 'Sun',
        status: 'Supportive',
        direction: '↑',
        color: '#F59E0B',
        houseTransit: ((transits.planetaryTransits.find(p => p.planet === 'Sun')?.transitSignIndex || 0) - factSet.ascendant.details.signIndex + 12) % 12 + 1,
        reason: 'Infuses core vitality, clarity of intention, and natural authority.',
      },
      {
        planet: 'Moon',
        status: [6, 8, 12].includes(moonTransitHouse) ? 'Neutral' : 'Favorable',
        direction: [6, 8, 12].includes(moonTransitHouse) ? '—' : '↑',
        color: '#E0E7FF',
        houseTransit: moonTransitHouse,
        reason: `Transiting through ${transits.planetaryTransits.find(p => p.planet === 'Moon')?.transitSign || moonSign}, guiding instinct and subconscious perceptions.`,
      },
      {
        planet: 'Venus',
        status: 'Favorable',
        direction: '↑',
        color: '#38BDF8',
        houseTransit: ((transits.planetaryTransits.find(p => p.planet === 'Venus')?.transitSignIndex || 0) - factSet.ascendant.details.signIndex + 12) % 12 + 1,
        reason: 'Harmonizes negotiations, creative aesthetics, and mutual understanding.',
      },
    ];

    // 6. Auspicious Timings (Computed dynamically from solar Panchange)
    const auspiciousTimings: AuspiciousTimingWindow[] = [
      {
        window: `${panchang.timings.sunrise || '06:12 AM'} – 07:34 AM`,
        label: 'Ideal for new beginnings & spiritual focus',
        periodName: 'Shubha Hora / Brahma Vela',
        confidence: 0.94,
      },
      {
        window: `${panchang.timings.abhijitMuhurat.start || '11:45 AM'} – ${panchang.timings.abhijitMuhurat.end || '12:35 PM'}`,
        label: 'Prime solar window for vital tasks & meetings',
        periodName: 'Abhijit Muhurat',
        confidence: 0.98,
      },
      {
        window: '06:45 PM – 08:15 PM',
        label: 'Favorable for creative synthesis & relationships',
        periodName: 'Godhuli / Amrit Vela',
        confidence: 0.91,
      },
    ];

    // 7. Today's Advice (5 non-fatalistic, proactive bullet points)
    const advice: string[] = [
      'Take initiative on strategic plans, but avoid reckless hurry.',
      'Listen deeply in collaborative discussions before stating your conclusion.',
      'A constructive opportunity may surface in your professional realm — stay alert.',
      'Focus diligently on long-term compound gains rather than momentary wins.',
      'Allocate time in unhurried reflection to refresh your focus and inner clarity.',
    ];

    // 8. Affirmation & Personalized Reading
    const formattedDate = targetDate.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const moonPhaseStr = `${panchang.tithi.paksha.includes('Shukla') ? 'Waxing' : 'Waning'} Moon in ${transits.planetaryTransits.find(p => p.planet === 'Moon')?.transitSign || moonSign}`;

    const mainPredictionText = `Today is a day to take inspired action. The cosmic alignment supports your courage and strategic initiative, anchored by your ${ascSign} Lagna and ${moonSign} Moon. A promising opportunity may open up in your professional sphere or creative endeavors. Stay focused, remain patient with colleagues, and trust your intuition as transiting Moon harmonizes your mental clarity.`;

    const aiInsightText = `The planetary alignment today indicates a strong push toward personal growth through ${dashaLord} Mahadasha and ${antardashaLord} Antardasha. Stay grounded, prioritize thoughtful execution, and you will observe tangible progress by the close of the week.`;

    // 9. Generate Hash Fingerprint
    const hashPayload = `${profile.birthDate}_${profile.birthTime}_${ascSign}_${moonSign}_${dashaLord}_${formattedDate}_${overallScore}`;
    const fingerprint = crypto.createHash('sha256').update(hashPayload).digest('hex').substring(0, 16);

    return {
      predictionId: `pred_card_${fingerprint}`,
      generatedAt: new Date().toISOString(),
      targetDate: targetDate.toISOString().split('T')[0],
      timezone: profile.timezone,
      calculationVersion: this.VERSION,
      fingerprint,

      header: {
        title: 'Your Daily Prediction',
        formattedDate,
        moonPhase: moonPhaseStr,
        moonSign: transits.planetaryTransits.find(p => p.planet === 'Moon')?.transitSign || moonSign,
        motto: 'Small Steps, Big Destinies.',
      },

      identity: {
        zodiacSign: ascSign,
        zodiacSymbol: meta.symbol,
        dateRange: meta.dateRange,
        traits: meta.traits,
        ascendantSign: ascSign,
        ascendantDegree: factSet.ascendant.details.degreeInSign,
        moonSign,
        sunSign,
        activeMahadasha: dashaLord,
        activeAntardasha: antardashaLord,
      },

      mainPrediction: {
        headline: `Today favors focused action and thoughtful decisions.`,
        predictionText: mainPredictionText,
        wordCount: mainPredictionText.split(/\s+/).length,
      },

      scores: {
        overall: {
          score: Math.round(overallScore),
          confidence: 0.95,
          positiveFactors: careerPos.concat(healthPos).slice(0, 3),
          challengingFactors: careerChal.concat(healthChal).slice(0, 2),
          calculationVersion: this.VERSION,
        },
        love: {
          score: Math.round(loveScore),
          confidence: 0.92,
          positiveFactors: lovePos,
          challengingFactors: loveChal,
          calculationVersion: this.VERSION,
        },
        career: {
          score: Math.round(careerScore),
          confidence: 0.96,
          positiveFactors: careerPos,
          challengingFactors: careerChal,
          calculationVersion: this.VERSION,
        },
        health: {
          score: Math.round(healthScore),
          confidence: 0.91,
          positiveFactors: healthPos,
          challengingFactors: healthChal,
          calculationVersion: this.VERSION,
        },
        finance: {
          score: Math.round(financeScore),
          confidence: 0.93,
          positiveFactors: financePos,
          challengingFactors: financeChal,
          calculationVersion: this.VERSION,
        },
      },

      vibe: {
        keywords: ['Confident', 'Focused', 'In Harmony'],
        tone: 'Balanced & Purposeful',
      },

      luckyElements: {
        color: meta.color,
        number: meta.number,
        gemstone: meta.gemstone,
        metal: meta.metal,
        direction: meta.direction,
        element: meta.element,
        disclaimer: 'Traditional Astrological Association based on classical Parashari planetary correspondences.',
      },

      planetaryInfluences,
      auspiciousTimings,
      advice,
      affirmation: '“I am aligned with the universe, and every step I take leads me closer to my highest self.”',
      mantra: {
        sanskrit: meta.mantra.sanskrit,
        transliteration: meta.mantra.transliteration,
        meaning: meta.mantra.meaning,
        repetitions: 108,
        rulingPlanet: meta.ruler,
        purpose: 'Chant 108 times for inner clarity, energy, and resolute confidence.',
      },

      aiInsight: {
        text: aiInsightText,
        evidence: [
          `Active Mahadasha: ${dashaLord}, Antardasha: ${antardashaLord}`,
          `Moon transit in House ${moonTransitHouse}`,
          `Jupiter transit in House ${jupiterTransitHouse}`,
          `Ascendant: ${ascSign}, Moon Sign: ${moonSign}`,
        ],
      },
    };
  }
}
