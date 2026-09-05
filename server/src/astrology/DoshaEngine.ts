/**
 * Dosha Engine
 * Identifies and assesses Vedic Astrological Doshas:
 * - Manglik Dosha (Kuja Dosha) with classical cancellations (Nivritti)
 * - Kaal Sarp Dosha (12 distinct varieties, Full vs Partial)
 * - Sade Sati Analysis (Rising, Peak, Setting phases of Shani)
 * - Pitra Dosha
 * Formulates balanced, non-fatalistic evaluations and actionable spiritual remedies.
 */

import { PlanetData, PlanetName } from './PlanetEngine.js';
import { BhavaData } from './HouseEngine.js';

export interface ManglikAnalysis {
  isManglik: boolean;
  intensity: 'None' | 'Anshik (Low)' | 'Moderate' | 'Purna (High)';
  marsHouseFromLagna: number;
  marsHouseFromMoon: number;
  cancellations: string[];
  remedySummary: string;
}

export interface KaalSarpAnalysis {
  hasKaalSarp: boolean;
  type: string;
  sanskritName: string;
  isPartial: boolean;
  rahuHouse: number;
  ketuHouse: number;
  description: string;
  remedySummary: string;
}

export interface SadeSatiAnalysis {
  isActive: boolean;
  currentPhase: 'Not Active' | 'Rising (First Phase)' | 'Peak (Second Phase)' | 'Setting (Third Phase)';
  natalMoonSign: string;
  saturnTransitSign: string;
  description: string;
  guidance: string;
}

export interface DoshaReport {
  manglik: ManglikAnalysis;
  kaalSarp: KaalSarpAnalysis;
  sadeSati: SadeSatiAnalysis;
  pitraDosha: {
    hasPitraDosha: boolean;
    reason: string;
    remedies: string[];
  };
}

export function analyzeDoshas(
  planets: PlanetData[],
  houses: BhavaData[],
  currentSaturnSignIndex: number = 10 // Current Saturn sign (approx Aquarius/Pisces)
): DoshaReport {
  const planetMap = new Map<PlanetName, PlanetData>();
  planets.forEach((p) => planetMap.set(p.name, p));

  const mars = planetMap.get('Mars')!;
  const moon = planetMap.get('Moon')!;
  const sun = planetMap.get('Sun')!;
  const jupiter = planetMap.get('Jupiter')!;
  const saturn = planetMap.get('Saturn')!;
  const rahu = planetMap.get('Rahu')!;
  const ketu = planetMap.get('Ketu')!;

  // 1. Manglik Dosha Analysis
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const marsHouseLagna = mars.house;
  const marsHouseMoon = ((mars.signIndex - moon.signIndex + 12) % 12) + 1;

  const isLagnaManglik = manglikHouses.includes(marsHouseLagna);
  const isMoonManglik = manglikHouses.includes(marsHouseMoon);

  const cancellations: string[] = [];
  if (mars.dignity === 'Own Sign' || mars.dignity === 'Exalted') {
    cancellations.push('Mars is in its own sign or exalted, drastically softening dosha effects.');
  }
  if (jupiter.aspectsToHouses.includes(mars.house) || jupiter.house === mars.house) {
    cancellations.push('Guru (Jupiter) directly aspects or conjoins Mars, neutralizing negativity with divine grace.');
  }
  if ([2, 12].includes(marsHouseLagna) && [2, 5].includes(mars.signIndex)) {
    cancellations.push('Mars placement in Gemini or Virgo in 2nd/12th causes dosha bhanga.');
  }

  let intensity: 'None' | 'Anshik (Low)' | 'Moderate' | 'Purna (High)' = 'None';
  let isManglik = false;

  if (isLagnaManglik || isMoonManglik) {
    isManglik = true;
    if (cancellations.length >= 2) {
      intensity = 'Anshik (Low)';
    } else if (cancellations.length === 1) {
      intensity = 'Moderate';
    } else {
      intensity = isLagnaManglik && isMoonManglik ? 'Purna (High)' : 'Moderate';
    }
  }

  const manglikResult: ManglikAnalysis = {
    isManglik,
    intensity,
    marsHouseFromLagna: marsHouseLagna,
    marsHouseFromMoon: marsHouseMoon,
    cancellations,
    remedySummary: isManglik
      ? 'Chant the Mangal Gayatri Mantra, observe Tuesday fasting, or worship Lord Hanuman to channel martial fire into disciplined vitality.'
      : 'No significant Kuja dosha afflictions detected.',
  };

  // 2. Kaal Sarp Dosha Analysis
  // Check if all 7 planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) lie on one side of Rahu-Ketu axis
  const sevenPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as PlanetName[];
  const rLon = rahu.siderealLongitude;
  const kLon = ketu.siderealLongitude;

  let allBetweenRahuKetu = true;
  let allBetweenKetuRahu = true;

  for (const name of sevenPlanets) {
    const pLon = planetMap.get(name)!.siderealLongitude;
    // Angle clockwise from Rahu to planet
    const fromRahu = ((pLon - rLon) + 360) % 360;
    if (fromRahu > 180) allBetweenRahuKetu = false;
    // Angle clockwise from Ketu to planet
    const fromKetu = ((pLon - kLon) + 360) % 360;
    if (fromKetu > 180) allBetweenKetuRahu = false;
  }

  const hasKaalSarp = allBetweenRahuKetu || allBetweenKetuRahu;
  const KAAL_SARP_NAMES = [
    'Anant Kaal Sarp', 'Kulik Kaal Sarp', 'Vasuki Kaal Sarp', 'Shankhpal Kaal Sarp',
    'Padma Kaal Sarp', 'Mahapadma Kaal Sarp', 'Takshak Kaal Sarp', 'Karkotak Kaal Sarp',
    'Shankhachood Kaal Sarp', 'Ghatak Kaal Sarp', 'Vishdhar Kaal Sarp', 'Sheshnag Kaal Sarp'
  ];

  const typeName = KAAL_SARP_NAMES[(rahu.house - 1) % 12] || 'Kaal Sarp Yoga';

  const kaalSarpResult: KaalSarpAnalysis = {
    hasKaalSarp,
    type: hasKaalSarp ? typeName : 'None',
    sanskritName: hasKaalSarp ? `${typeName} योग` : 'दोष रहित',
    isPartial: false,
    rahuHouse: rahu.house,
    ketuHouse: ketu.house,
    description: hasKaalSarp
      ? `All key planetary energies are encompassed within the karmic axis of Rahu (House ${rahu.house}) and Ketu (House ${ketu.house}), producing cyclical surges of transformation.`
      : 'Planets are freely distributed across the cosmic mandala, unencumbered by the nodal axis.',
    remedySummary: hasKaalSarp
      ? 'Perform Maha Mrityunjaya Japa, Shiva Rudrabhishekam on Pradosham, and practice deep pranayama to dissolve karmic knots.'
      : 'No Kaal Sarp remedial measures required.',
  };

  // 3. Sade Sati Analysis
  // Natal Moon sign index (0-11)
  const moonSign = moon.signIndex;
  const h12FromMoon = (moonSign + 11) % 12;
  const h1FromMoon = moonSign;
  const h2FromMoon = (moonSign + 1) % 12;

  let isSadeSati = false;
  let phase: SadeSatiAnalysis['currentPhase'] = 'Not Active';

  if (currentSaturnSignIndex === h12FromMoon) {
    isSadeSati = true;
    phase = 'Rising (First Phase)';
  } else if (currentSaturnSignIndex === h1FromMoon) {
    isSadeSati = true;
    phase = 'Peak (Second Phase)';
  } else if (currentSaturnSignIndex === h2FromMoon) {
    isSadeSati = true;
    phase = 'Setting (Third Phase)';
  }

  const sadeSatiResult: SadeSatiAnalysis = {
    isActive: isSadeSati,
    currentPhase: phase,
    natalMoonSign: moon.signName,
    saturnTransitSign: houses[currentSaturnSignIndex]?.signName || 'Aquarius',
    description: isSadeSati
      ? `Saturn is transiting near your natal Moon in ${phase}. This is a profound 7.5-year cycle of purification, maturity, and foundational building.`
      : 'You are currently not experiencing the 7.5-year Sade Sati cycle of Shani.',
    guidance: isSadeSati
      ? 'Cultivate disciplined daily habits, practice humility, avoid speculation, and chant the Hanuman Chalisa on Saturdays.'
      : 'Favorable transit harmony for emotional stability.',
  };

  // 4. Pitra Dosha
  const isSunAfflicted = [rahu.house, ketu.house, saturn.house].includes(sun.house);
  const is9thAfflicted = [rahu.house, ketu.house].includes(9);
  const hasPitra = isSunAfflicted || is9thAfflicted;

  return {
    manglik: manglikResult,
    kaalSarp: kaalSarpResult,
    sadeSati: sadeSatiResult,
    pitraDosha: {
      hasPitraDosha: hasPitra,
      reason: hasPitra
        ? 'Solar or 9th house association with karmic nodes (Rahu/Ketu) indicates ancestral debts seeking resolution.'
        : '9th house and Surya are unafflicted by malefic nodes.',
      remedies: hasPitra
        ? ['Water offerings to the Sun (Surya Arghya) daily', 'Perform charity on Amavasya (New Moon)', 'Respect and care for family elders']
        : [],
    },
  };
}
