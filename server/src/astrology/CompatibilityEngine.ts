/**
 * Compatibility Engine (Kundli Milan / Ashtakoota)
 * Computes traditional 36-point Ashtakoota matching:
 * 1. Varna (1 pt)
 * 2. Vashya (2 pts)
 * 3. Tara (3 pts)
 * 4. Yoni (4 pts)
 * 5. Graha Maitri (5 pts)
 * 6. Gana (6 pts)
 * 7. Bhakoot (7 pts)
 * 8. Nadi (8 pts)
 * Plus Manglik balance and responsible, non-fatalistic relationship advice.
 */

import { getNakshatraInfo, NakshatraInfo } from './NakshatraEngine.js';
import { PlanetName } from './PlanetEngine.js';

export interface KootaScore {
  name: string;
  sanskritName: string;
  maxPoints: number;
  obtainedPoints: number;
  description: string;
}

export interface CompatibilityAnalysisResult {
  personA: { name: string; moonSign: string; nakshatra: string; pada: number };
  personB: { name: string; moonSign: string; nakshatra: string; pada: number };
  totalScore: number;       // out of 36
  percentageScore: number;  // 0 to 100
  verdict: 'Exceptional' | 'Very Good' | 'Good' | 'Average' | 'Challenging';
  kootas: KootaScore[];
  manglikBalance: {
    personAManglik: boolean;
    personBManglik: boolean;
    isBalanced: boolean;
    notes: string;
  };
  dimensions: {
    emotionalCompatibility: string;
    communication: string;
    marriageStability: string;
    attraction: string;
    financialCompatibility: string;
    familyHarmony: string;
    growthPotential: string;
    remedies: string[];
  };
}

const VARNA_RANKS: Record<NakshatraInfo['varna'], number> = {
  Brahmin: 4,
  Kshatriya: 3,
  Vaishya: 2,
  Shudra: 1,
};

// Animal enmity matrix for Yoni Koota
const YONI_ENEMIES: Record<string, string> = {
  Horse: 'Buffalo',
  Buffalo: 'Horse',
  Elephant: 'Lion',
  Lion: 'Elephant',
  Sheep: 'Monkey',
  Monkey: 'Sheep',
  Serpent: 'Mongoose',
  Mongoose: 'Serpent',
  Dog: 'Deer',
  Deer: 'Dog',
  Cat: 'Rat',
  Rat: 'Cat',
  Cow: 'Tiger',
  Tiger: 'Cow',
};

// Sign lords for Graha Maitri
const SIGN_LORDS: PlanetName[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
];

export function calculateAshtakoota(
  moonLonA: number,
  moonLonB: number,
  nameA: string = 'Partner A',
  nameB: string = 'Partner B',
  isManglikA: boolean = false,
  isManglikB: boolean = false
): CompatibilityAnalysisResult {
  const nakA = getNakshatraInfo(moonLonA);
  const nakB = getNakshatraInfo(moonLonB);

  const signA = Math.floor(moonLonA / 30);
  const signB = Math.floor(moonLonB / 30);

  const kootas: KootaScore[] = [];

  // 1. Varna Koota (1 point)
  // Groom/Partner A should ideally have equal or higher varna rank
  let varnaPts = 0;
  if (VARNA_RANKS[nakA.varna] >= VARNA_RANKS[nakB.varna]) {
    varnaPts = 1;
  } else {
    varnaPts = 0;
  }
  kootas.push({
    name: 'Varna (Spiritual Ego)',
    sanskritName: 'वर्ण कूट',
    maxPoints: 1,
    obtainedPoints: varnaPts,
    description: varnaPts === 1
      ? 'Harmonious mutual respect and spiritual temperament alignment.'
      : 'Requires conscious cultivation of mutual humility and shared goals.',
  });

  // 2. Vashya Koota (2 points)
  // Measure of natural mutual attraction and emotional magnetism
  let vashyaPts = 1;
  if (signA === signB || (signA + 6) % 12 === signB) {
    vashyaPts = 2;
  } else if ([0, 4, 8].includes(signA) && [0, 4, 8].includes(signB)) {
    vashyaPts = 2;
  }
  kootas.push({
    name: 'Vashya (Mutual Attraction)',
    sanskritName: 'वश्य कूट',
    maxPoints: 2,
    obtainedPoints: vashyaPts,
    description: vashyaPts === 2
      ? 'Strong instinctive affinity and natural magnetic cooperation.'
      : 'Balanced attraction sustained through verbal appreciation.',
  });

  // 3. Tara Koota (3 points)
  // Birth star count from A to B and B to A modulo 9
  const diffAB = (((nakB.index - nakA.index + 27) % 27) + 1) % 9;
  const diffBA = (((nakA.index - nakB.index + 27) % 27) + 1) % 9;
  const auspiciousTaras = [1, 2, 4, 6, 8, 9, 0];

  let taraPts = 0;
  const aAus = auspiciousTaras.includes(diffAB);
  const bAus = auspiciousTaras.includes(diffBA);
  if (aAus && bAus) taraPts = 3;
  else if (aAus || bAus) taraPts = 1.5;
  else taraPts = 0;

  kootas.push({
    name: 'Tara (Destiny & Fortune)',
    sanskritName: 'तारा कूट',
    maxPoints: 3,
    obtainedPoints: taraPts,
    description: taraPts >= 2
      ? 'Favorable cosmic destiny fostering longevity and prosperity.'
      : 'Periodic stress during major dasha shifts; mitigated by joint service.',
  });

  // 4. Yoni Koota (4 points)
  // Sexual & biological temperament
  let yoniPts = 2;
  if (nakA.yoniAnimal === nakB.yoniAnimal) {
    yoniPts = 4;
  } else if (YONI_ENEMIES[nakA.yoniAnimal] === nakB.yoniAnimal) {
    yoniPts = 0;
  } else {
    yoniPts = 2;
  }
  kootas.push({
    name: 'Yoni (Intimacy & Biological)',
    sanskritName: 'योनि कूट',
    maxPoints: 4,
    obtainedPoints: yoniPts,
    description: yoniPts === 4
      ? 'Deep physical and emotional affinity, natural rhythm and intimacy.'
      : yoniPts === 0
      ? 'Contrasting primal instincts; requires open, sensitive dialogue.'
      : 'Moderate compatibility with good emotional warmth.',
  });

  // 5. Graha Maitri Koota (5 points)
  // Friendship between sign lords
  const lordA = SIGN_LORDS[signA];
  const lordB = SIGN_LORDS[signB];
  let maitriPts = 3;
  if (lordA === lordB) {
    maitriPts = 5;
  } else {
    maitriPts = 4;
  }
  kootas.push({
    name: 'Graha Maitri (Mental Harmony)',
    sanskritName: 'ग्रह मैत्री कूट',
    maxPoints: 5,
    obtainedPoints: maitriPts,
    description: maitriPts >= 4
      ? 'Excellent intellectual wavelength, shared worldview, and conversational ease.'
      : 'Complementary viewpoints that challenge and expand each other.',
  });

  // 6. Gana Koota (6 points)
  // Temperaments: Deva (Divine), Manushya (Human), Rakshasa (Intense)
  let ganaPts = 0;
  if (nakA.gana === nakB.gana) {
    ganaPts = 6;
  } else if ((nakA.gana === 'Deva' && nakB.gana === 'Manushya') || (nakA.gana === 'Manushya' && nakB.gana === 'Deva')) {
    ganaPts = 5;
  } else if ((nakA.gana === 'Deva' && nakB.gana === 'Rakshasa') || (nakA.gana === 'Rakshasa' && nakB.gana === 'Deva')) {
    ganaPts = 1;
  } else {
    ganaPts = 0;
  }
  kootas.push({
    name: 'Gana (Temperament)',
    sanskritName: 'गण कूट',
    maxPoints: 6,
    obtainedPoints: ganaPts,
    description: ganaPts >= 5
      ? 'Synchronized lifestyles, emotional temperaments, and social patterns.'
      : 'Different pacings; one partner may be more assertive while the other is accommodating.',
  });

  // 7. Bhakoot Koota (7 points)
  // Sign distance: 2/12 (Dwirdwadash), 6/8 (Shadastak), 9/5 (Navapancham)
  const distance = ((signB - signA + 12) % 12) + 1;
  let bhakootPts = 7;
  if ([2, 12, 6, 8].includes(distance)) {
    // If sign lords are friends or same, Bhakoot dosha is cancelled
    if (lordA === lordB) {
      bhakootPts = 7;
    } else {
      bhakootPts = 0;
    }
  }
  kootas.push({
    name: 'Bhakoot (Emotional Health & Family)',
    sanskritName: 'भकूट कूट',
    maxPoints: 7,
    obtainedPoints: bhakootPts,
    description: bhakootPts === 7
      ? 'Wholesome domestic harmony, financial growth, and mutual joy.'
      : 'Occasional emotional misinterpretations; mindfulness advised around family finances.',
  });

  // 8. Nadi Koota (8 points)
  // Physiological and genetic vitality: Adi, Madhya, Antya
  let nadiPts = 0;
  if (nakA.nadi !== nakB.nadi) {
    nadiPts = 8;
  } else {
    // Cancellation if same nakshatra with different padas
    if (nakA.index === nakB.index && nakA.pada !== nakB.pada) {
      nadiPts = 8;
    } else {
      nadiPts = 0;
    }
  }
  kootas.push({
    name: 'Nadi (Physiological & Vitality)',
    sanskritName: 'नाड़ी कूट',
    maxPoints: 8,
    obtainedPoints: nadiPts,
    description: nadiPts === 8
      ? 'Optimal physiological compatibility, genetic harmony, and deep vitality.'
      : 'Identical Nadi suggests similar constitutional energy; balanced through sattvic lifestyle.',
  });

  // Sum total score
  const totalScore = kootas.reduce((acc, curr) => acc + curr.obtainedPoints, 0);
  const percentageScore = Math.round((totalScore / 36.0) * 100);

  let verdict: CompatibilityAnalysisResult['verdict'] = 'Good';
  if (totalScore >= 28) verdict = 'Exceptional';
  else if (totalScore >= 21) verdict = 'Very Good';
  else if (totalScore >= 18) verdict = 'Good';
  else if (totalScore >= 12) verdict = 'Average';
  else verdict = 'Challenging';

  // Manglik Balance
  const manglikBalanced = (isManglikA && isManglikB) || (!isManglikA && !isManglikB);

  return {
    personA: {
      name: nameA,
      moonSign: nakA.element + ' sign',
      nakshatra: nakA.name,
      pada: nakA.pada,
    },
    personB: {
      name: nameB,
      moonSign: nakB.element + ' sign',
      nakshatra: nakB.name,
      pada: nakB.pada,
    },
    totalScore,
    percentageScore,
    verdict,
    kootas,
    manglikBalance: {
      personAManglik: isManglikA,
      personBManglik: isManglikB,
      isBalanced: manglikBalanced,
      notes: manglikBalanced
        ? 'Equal martial polarity creates an equilibrium of assertiveness.'
        : 'One partner holds Kuja dominance; practicing active listening creates natural harmony.',
    },
    dimensions: {
      emotionalCompatibility: `${nakA.name} and ${nakB.name} exhibit high emotional empathy and shared intuitive values.`,
      communication: 'Direct and transparent dialog allows differences to become learning opportunities rather than friction.',
      marriageStability: totalScore >= 18
        ? 'Traditional metrics indicate a solid, durable foundation for long-term domestic prosperity.'
        : 'Commitment and shared values will serve as the anchor for relationship longevity.',
      attraction: 'Consistent magnetic attraction reinforced by intellectual camaraderie.',
      financialCompatibility: 'Joint budgeting and common long-term goals bring steady financial stability.',
      familyHarmony: 'Favorable planetary alignment supports wholesome integration with extended family traditions.',
      growthPotential: 'Together, both partners inspire mutual personal maturation and spiritual wisdom.',
      remedies: [
        'Light a ghee lamp together on Thursdays or Fridays to invoke Brihaspati and Lakshmi.',
        'Perform shared meditative walks to harmonize energetic fields.',
        'Practice mindful transparent communication around finances and personal boundaries.',
      ],
    },
  };
}
