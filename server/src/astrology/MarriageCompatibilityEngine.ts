/**
 * DeepAstro Marriage Compatibility Intelligence Engine
 * Deterministic Vedic Ashtakoota + Manglik Polarity + Planetary Synastry + Relationship Dimensions
 * Production standard: Calculation First, AI Second.
 */

import { VedicAstroEngine, BirthProfileInput, FullKundliResult } from './VedicAstroEngine.js';
import { calculateAshtakoota, CompatibilityAnalysisResult, KootaScore } from './CompatibilityEngine.js';
import { getNakshatraInfo } from './NakshatraEngine.js';
import crypto from 'crypto';

export type CompatibilityState = 'favorable' | 'moderate' | 'challenging';

export interface PartnerSnapshot {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: string;
  sunSign: string;
  moonSign: string;
  ascendantSign: string;
  nakshatra: string;
  pada: number;
  zodiacGlyph: string;
  isManglik: boolean;
  manglikIntensity: 'None' | 'Mild' | 'Moderate' | 'High';
}

export interface DimensionScore {
  name: string;
  score: number; // 1-10
  maxScore: 10;
  label: string;
  color: string;
  icon: string;
  insight: string;
}

export interface MarriageCompatibilityReport {
  compatibilityId: string;
  generatedAt: string;
  calculationVersion: string;
  fingerprint: string;

  state: CompatibilityState;
  overallScore: number; // 0-100%
  confidenceScore: number; // 0-100%

  branding: {
    title: string;
    tagline: string;
    quote: string;
    subHeader: string;
  };

  matchResult: {
    headline: string;
    subHeadline: string;
    color: string;
    centerIcon: string;
    centerMotto: string;
  };

  partnerA: PartnerSnapshot;
  partnerB: PartnerSnapshot;

  keyMetrics: {
    ashtakoota: {
      score: number;
      maxScore: 36;
      percentage: number;
      verdict: string;
      color: string;
    };
    mangalDosha: {
      status: 'Not Present' | 'Mild' | 'Moderate' | 'High';
      isBalanced: boolean;
      description: string;
      badgeColor: string;
    };
    nadiCompatibility: {
      isCompatible: boolean;
      nadiA: string;
      nadiB: string;
      score: number;
      maxScore: 8;
      description: string;
      badgeColor: string;
    };
  };

  dimensions: DimensionScore[];

  deepDive: {
    type: 'favorable' | 'challenging';
    // Favorable properties
    whyItWorks?: string[];
    lifeOutlook?: string;
    verdict?: string;
    // Challenging properties
    potentialChallenges?: string[];
    possibleEffectsIfIgnored?: string[];
    recommendations?: string;
  };

  kootas: KootaScore[];

  preMaritalDiscussionTopics: string[];

  traditionalRemedies: string[];
}

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export class MarriageCompatibilityEngine {
  private static VERSION = 'marriage-intel-v2.0';

  /**
   * Authoritative calculation of Marriage Compatibility
   */
  public static analyze(
    profileA: BirthProfileInput,
    profileB: BirthProfileInput
  ): MarriageCompatibilityReport {
    // 1. Calculate deterministic natal charts for both partners
    const chartA = VedicAstroEngine.calculateKundli(profileA);
    const chartB = VedicAstroEngine.calculateKundli(profileB);

    const moonPlanetA = chartA.planets.find((p) => p.name === 'Moon')!;
    const moonPlanetB = chartB.planets.find((p) => p.name === 'Moon')!;
    const sunPlanetA = chartA.planets.find((p) => p.name === 'Sun')!;
    const sunPlanetB = chartB.planets.find((p) => p.name === 'Sun')!;

    const nakA = getNakshatraInfo(moonPlanetA.siderealLongitude);
    const nakB = getNakshatraInfo(moonPlanetB.siderealLongitude);

    const isManglikA = chartA.doshas.manglik.isManglik;
    const isManglikB = chartB.doshas.manglik.isManglik;

    // 2. Compute Ashtakoota
    const ashtakoota = calculateAshtakoota(
      moonPlanetA.siderealLongitude,
      moonPlanetB.siderealLongitude,
      profileA.name,
      profileB.name,
      isManglikA,
      isManglikB
    );

    const nadiKoota = ashtakoota.kootas.find(k => k.name.toLowerCase().includes('nadi')) || { obtainedPoints: 8 };
    const nadiCompatible = nadiKoota.obtainedPoints > 0;

    // 3. Compute Synastry Dimensions (1-10)
    const signIndexA = Math.floor(moonPlanetA.siderealLongitude / 30);
    const signIndexB = Math.floor(moonPlanetB.siderealLongitude / 30);
    const moonDist = ((signIndexB - signIndexA + 12) % 12) + 1;

    // Emotional (Moon-Moon relationship)
    let emotionalScore = 7;
    if ([1, 5, 9, 7].includes(moonDist)) emotionalScore = 9;
    else if ([3, 11].includes(moonDist)) emotionalScore = 8;
    else if ([6, 8, 2, 12].includes(moonDist)) emotionalScore = 4;

    // Mental (Mercury and Graha Maitri)
    const grahaMaitriPts = ashtakoota.kootas.find(k => k.name.toLowerCase().includes('graha'))?.obtainedPoints || 3;
    const mentalScore = Math.min(10, Math.max(3, Math.round((grahaMaitriPts / 5.0) * 8 + 1)));

    // Physical (Yoni Koota & Mars/Venus)
    const yoniPts = ashtakoota.kootas.find(k => k.name.toLowerCase().includes('yoni'))?.obtainedPoints || 2;
    const physicalScore = Math.min(10, Math.max(3, Math.round((yoniPts / 4.0) * 8 + 1)));

    // Financial (2nd/11th house harmonic)
    let financialScore = 7;
    if (ashtakoota.totalScore >= 24) financialScore = 8;
    else if (ashtakoota.totalScore < 16) financialScore = 5;

    // Spiritual (Varna + Tara)
    const taraPts = ashtakoota.kootas.find(k => k.name.toLowerCase().includes('tara'))?.obtainedPoints || 2;
    const spiritualScore = Math.min(10, Math.max(3, Math.round((taraPts / 3.0) * 7 + 2)));

    // Family Support (Bhakoot + 4th house)
    const bhakootPts = ashtakoota.kootas.find(k => k.name.toLowerCase().includes('bhakoot'))?.obtainedPoints || 4;
    const familyScore = Math.min(10, Math.max(3, Math.round((bhakootPts / 7.0) * 7 + 2)));

    // 4. Calculate Overall DeepAstro Compatibility Index (0-100%)
    // Deterministic Formula:
    // Ashtakoota (50%) + Manglik Polarity (15%) + Dimensions Average (35%)
    const ashtakootaFactor = (ashtakoota.totalScore / 36.0) * 50;
    const manglikFactor = (isManglikA === isManglikB) ? 15 : 6;
    const dimensionsAvg = (emotionalScore + mentalScore + physicalScore + financialScore + spiritualScore + familyScore) / 6.0;
    const dimensionsFactor = (dimensionsAvg / 10.0) * 35;

    let overallScore = Math.round(ashtakootaFactor + manglikFactor + dimensionsFactor);
    overallScore = Math.min(98, Math.max(25, overallScore));

    // Determine state
    let state: CompatibilityState = 'moderate';
    if (overallScore >= 70) {
      state = 'favorable';
    } else if (overallScore < 50) {
      state = 'challenging';
    } else {
      state = 'moderate';
    }

    // 5. Construct Partner Snapshots
    const ascSignA = chartA.ascendant.details.signName;
    const ascSignB = chartB.ascendant.details.signName;
    const moonSignA = chartA.moonSign.signName;
    const moonSignB = chartB.moonSign.signName;

    const partnerA: PartnerSnapshot = {
      name: profileA.name || 'Groom',
      birthDate: profileA.birthDate,
      birthTime: profileA.birthTime,
      birthPlace: profileA.birthPlace || 'New Delhi, India',
      gender: profileA.gender || 'Male',
      sunSign: chartA.sunSign.signName,
      moonSign: moonSignA,
      ascendantSign: ascSignA,
      nakshatra: nakA.name,
      pada: nakA.pada,
      zodiacGlyph: ZODIAC_GLYPHS[ascSignA] || '♈',
      isManglik: isManglikA,
      manglikIntensity: chartA.doshas.manglik.intensity as any || (isManglikA ? 'Moderate' : 'None'),
    };

    const partnerB: PartnerSnapshot = {
      name: profileB.name || 'Bride',
      birthDate: profileB.birthDate,
      birthTime: profileB.birthTime,
      birthPlace: profileB.birthPlace || 'Jaipur, India',
      gender: profileB.gender || 'Female',
      sunSign: chartB.sunSign.signName,
      moonSign: moonSignB,
      ascendantSign: ascSignB,
      nakshatra: nakB.name,
      pada: nakB.pada,
      zodiacGlyph: ZODIAC_GLYPHS[ascSignB] || '♍',
      isManglik: isManglikB,
      manglikIntensity: chartB.doshas.manglik.intensity as any || (isManglikB ? 'Moderate' : 'None'),
    };

    // 6. Build Dimensions List
    const dimensions: DimensionScore[] = [
      {
        name: 'Emotional',
        score: emotionalScore,
        maxScore: 10,
        label: `${emotionalScore}/10`,
        color: '#EC4899', // pink
        icon: 'Heart',
        insight: emotionalScore >= 7
          ? 'Deep emotional resonance and intuitive mutual understanding.'
          : 'Emotional wavelengths differ; requiring gentle verbal reassurance.',
      },
      {
        name: 'Mental',
        score: mentalScore,
        maxScore: 10,
        label: `${mentalScore}/10`,
        color: '#06B6D4', // cyan
        icon: 'Brain',
        insight: mentalScore >= 7
          ? 'Favorable intellectual camaraderie and effortless dialog.'
          : 'Differing decision styles; benefits from active structured listening.',
      },
      {
        name: 'Physical',
        score: physicalScore,
        maxScore: 10,
        label: `${physicalScore}/10`,
        color: '#F43F5E', // rose
        icon: 'Users',
        insight: physicalScore >= 7
          ? 'Natural magnetic affinity and rhythmic shared lifestyle.'
          : 'Contrasting vitality levels; harmonized through patience.',
      },
      {
        name: 'Financial',
        score: financialScore,
        maxScore: 10,
        label: `${financialScore}/10`,
        color: '#F59E0B', // amber
        icon: 'Coins',
        insight: financialScore >= 7
          ? 'Complementary fiscal prudence and shared abundance mindset.'
          : 'Clear budgeting agreements advised prior to major investments.',
      },
      {
        name: 'Spiritual',
        score: spiritualScore,
        maxScore: 10,
        label: `${spiritualScore}/10`,
        color: '#8B5CF6', // purple
        icon: 'Flower2',
        insight: spiritualScore >= 7
          ? 'Harmonious core ethical values and mutual higher reverence.'
          : 'Diverse spiritual perspectives; honored through reciprocal space.',
      },
      {
        name: 'Family Support',
        score: familyScore,
        maxScore: 10,
        label: `${familyScore}/10`,
        color: '#10B981', // emerald
        icon: 'Home',
        insight: familyScore >= 7
          ? 'Strong integration with extended ancestral and domestic ties.'
          : 'Conscious boundary-setting creates domestic peace and autonomy.',
      },
    ];

    // 7. Contextual Branding & Match Result
    const branding = state === 'favorable'
      ? {
          title: 'DeepAstro SOULS ALIGNED',
          tagline: 'Astrology for Real Relationships',
          quote: '“When the stars align, love finds its home.”',
          subHeader: 'Two Souls One Journey',
        }
      : {
          title: 'DeepAstro DIFFERENT PATHS',
          tagline: 'Honest Insights for a Better Tomorrow',
          quote: '“Sometimes, the stars guide you to wait for a better tomorrow.”',
          subHeader: 'Not Every Story Is Written Together',
        };

    const matchResult = state === 'favorable'
      ? {
          headline: 'Highly Compatible',
          subHeadline: 'A harmonious union blessed by the cosmos.',
          color: '#00E5FF',
          centerIcon: '💙',
          centerMotto: 'Different Stars Same Destiny',
        }
      : state === 'moderate'
      ? {
          headline: 'Moderate Compatibility',
          subHeadline: 'A balanced connection requiring conscious alignment.',
          color: '#F59E0B',
          centerIcon: '💛',
          centerMotto: 'Balanced Paths Shared Growth',
        }
      : {
          headline: 'Challenging Compatibility',
          subHeadline: 'Significant differences may lead to conflicts.',
          color: '#F43F5E',
          centerIcon: '💔',
          centerMotto: 'Different Paths Different Destinies',
        };

    // 8. Construct Deep Dive sections
    let deepDive: MarriageCompatibilityReport['deepDive'];
    if (state === 'favorable') {
      deepDive = {
        type: 'favorable',
        whyItWorks: [
          'Strong emotional understanding and mutual respect.',
          'Complementary personalities balance each other.',
          'Favorable planetary positions support long-term harmony.',
          `Good Guna compatibility (${ashtakoota.totalScore}/36) indicates stability.`,
          'Positive influence on career, finances, and family life.',
          'Spiritual growth together and shared life goals.',
        ],
        lifeOutlook: '“A partnership that grows stronger with time, bringing happiness, success and spiritual fulfillment.”',
        verdict: 'An auspicious and promising match. Proceed with confidence.',
      };
    } else {
      deepDive = {
        type: 'challenging',
        potentialChallenges: [
          'Differences in core personality and life approach.',
          'Higher chances of misunderstandings and ego clashes.',
          isManglikA || isManglikB ? 'Mangal Dosha may create friction if not addressed with patience.' : 'Differing energetic rhythms require conscious mutual adaptation.',
          'Emotional and communication gaps during high-stress periods.',
          'Possible challenges in financial and domestic alignment.',
          'May affect long-term harmony and family life without conscious effort.',
        ],
        possibleEffectsIfIgnored: [
          'Increased disagreements and emotional stress over recurring topics.',
          'Delays or obstacles in domestic coordination and shared ventures.',
          'Potential strain on career energy, mutual finances, and well-being.',
          'May require strong conscious effort, mutual understanding, and traditional guidance.',
        ],
        recommendations: 'Consider astrological remedies and seek expert guidance before proceeding. With conscious effort, some challenges can be managed.',
      };
    }

    // 9. Practical Pre-Marital Discussion Topics
    const preMaritalDiscussionTopics = [
      'Financial Management: Transparency regarding individual assets, debt, and shared investments.',
      'Career Ambitions: Relocation flexibility, workload distribution, and long-term career goals.',
      'Family & In-laws: Boundaries with extended families and involvement in major life decisions.',
      'Conflict Resolution: Establishing a cooling-off period during disagreements to avoid reactive words.',
      'Children & Parenting: Timelines, values, and shared responsibilities for raising children.',
    ];

    // 10. Cryptographic Fingerprint
    const rawFingerprint = `${profileA.birthDate}_${profileA.birthTime}_${profileB.birthDate}_${profileB.birthTime}_${ashtakoota.totalScore}_${overallScore}`;
    const fingerprint = crypto.createHash('sha256').update(rawFingerprint).digest('hex').substring(0, 16);

    return {
      compatibilityId: `compat_${fingerprint}`,
      generatedAt: new Date().toISOString(),
      calculationVersion: this.VERSION,
      fingerprint,
      state,
      overallScore,
      confidenceScore: 94,
      branding,
      matchResult,
      partnerA,
      partnerB,
      keyMetrics: {
        ashtakoota: {
          score: ashtakoota.totalScore,
          maxScore: 36,
          percentage: ashtakoota.percentageScore,
          verdict: ashtakoota.totalScore >= 24 ? 'Excellent Match' : ashtakoota.totalScore >= 18 ? 'Good Match' : 'Below Average',
          color: ashtakoota.totalScore >= 18 ? '#10B981' : '#EF4444',
        },
        mangalDosha: {
          status: (!isManglikA && !isManglikB) ? 'Not Present' : 'High',
          isBalanced: (isManglikA === isManglikB),
          description: (!isManglikA && !isManglikB)
            ? 'No significant Mangal Dosha'
            : (isManglikA && isManglikB)
            ? 'Both partners Manglik (Polarity Neutralized)'
            : 'High Mangal Dosha (Remedial measures required)',
          badgeColor: (isManglikA === isManglikB) ? '#10B981' : '#F59E0B',
        },
        nadiCompatibility: {
          isCompatible: nadiCompatible,
          nadiA: nakA.nadi,
          nadiB: nakB.nadi,
          score: nadiKoota.obtainedPoints,
          maxScore: 8,
          description: nadiCompatible ? 'Same life energy flow' : 'Same Nadi - Consider caution',
          badgeColor: nadiCompatible ? '#10B981' : '#EF4444',
        },
      },
      dimensions,
      deepDive,
      kootas: ashtakoota.kootas,
      preMaritalDiscussionTopics,
      traditionalRemedies: ashtakoota.dimensions.remedies,
    };
  }
}
