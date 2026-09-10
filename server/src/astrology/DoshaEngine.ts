/**
 * Dosha Engine
 * Identifies and assesses classical Vedic Astrological Doshas:
 * - Manglik Dosha (Kuja Dosha) with classical cancellations (Nivritti)
 * - Kaal Sarp Dosha (12 distinct varieties, Full vs Partial)
 * - Sade Sati Analysis (Rising, Peak, Setting phases based on real-time transit Saturn)
 * - Pitra Dosha
 * Formulates balanced, non-fatalistic evaluations and actionable spiritual guidance.
 */

import * as Astronomy from 'astronomy-engine';
import { PlanetData, PlanetName } from './PlanetEngine.js';
import { BhavaData } from './HouseEngine.js';
import { getLahiriAyanamsha, normalizeDegrees, ZODIAC_SIGNS } from './astronomyMath.js';

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

/**
 * Dynamically computes the current real-time sidereal sign index of Saturn (0-11)
 */
export function getCurrentTransitSaturnSign(): number {
  const time = Astronomy.MakeTime(new Date());
  const ayanamsha = getLahiriAyanamsha(time);
  const v = Astronomy.GeoVector(Astronomy.Body.Saturn, time, true);
  const ecl = Astronomy.Ecliptic(v);
  const siderealLon = normalizeDegrees(ecl.elon - ayanamsha);
  return Math.floor(siderealLon / 30.0);
}

export function analyzeDoshas(
  planets: PlanetData[],
  houses: BhavaData[],
  overrideSaturnSignIndex?: number
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

  // ── 1. Manglik Dosha Analysis ──────────────────────────────────────────
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const marsHouseLagna = mars.house;
  const marsHouseMoon = ((mars.signIndex - moon.signIndex + 12) % 12) + 1;

  const isLagnaManglik = manglikHouses.includes(marsHouseLagna);
  const isMoonManglik = manglikHouses.includes(marsHouseMoon);

  const cancellations: string[] = [];
  if (mars.dignity === 'Own Sign' || mars.dignity === 'Exalted') {
    cancellations.push('Mars is in its own sign or exalted, softening dosha effects.');
  }
  if (jupiter.aspectsToHouses.includes(mars.house) || jupiter.house === mars.house) {
    cancellations.push('Guru (Jupiter) directly aspects or conjoins Mars, neutralizing harshness.');
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

  // ── 2. Kaal Sarp Dosha Analysis ─────────────────────────────────────────
  // Check if all 7 planets (Sun, Moon, Mars, Mer, Jup, Ven, Sat) lie entirely on one side of Rahu-Ketu axis
  const rLon = rahu.siderealLongitude;
  const kLon = ketu.siderealLongitude;

  const truePlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as PlanetName[];
  let inSideA = 0;
  let inSideB = 0;

  for (const name of truePlanets) {
    const pLon = planetMap.get(name)!.siderealLongitude;
    // Check angular distance from Rahu going counterclockwise
    const diff = normalizeDegrees(pLon - rLon);
    if (diff > 0.001 && diff < 179.999) {
      inSideA++;
    } else {
      inSideB++;
    }
  }

  const hasFullKaalSarp = inSideA === 7 || inSideB === 7;
  const hasPartialKaalSarp = inSideA === 6 || inSideB === 6;
  const hasKaalSarp = hasFullKaalSarp || hasPartialKaalSarp;

  const KAAL_SARP_NAMES: Record<number, { name: string; sanskrit: string }> = {
    1: { name: 'Anant Kaal Sarp', sanskrit: 'अनंत कालसर्प योग' },
    2: { name: 'Kulik Kaal Sarp', sanskrit: 'कुलिक कालसर्प योग' },
    3: { name: 'Vasuki Kaal Sarp', sanskrit: 'वासुकी कालसर्प योग' },
    4: { name: 'Shankhpal Kaal Sarp', sanskrit: 'शंखपाल कालसर्प योग' },
    5: { name: 'Padma Kaal Sarp', sanskrit: 'पद्म कालसर्प योग' },
    6: { name: 'Maha Padma Kaal Sarp', sanskrit: 'महापद्म कालसर्प योग' },
    7: { name: 'Takshak Kaal Sarp', sanskrit: 'तक्षक कालसर्प योग' },
    8: { name: 'Karkotak Kaal Sarp', sanskrit: 'कर्कोटक कालसर्प योग' },
    9: { name: 'Shankhachur Kaal Sarp', sanskrit: 'शंखचूड़ कालसर्प योग' },
    10: { name: 'Ghatak Kaal Sarp', sanskrit: 'घातक कालसर्प योग' },
    11: { name: 'Vishdhar Kaal Sarp', sanskrit: 'विषधर कालसर्प योग' },
    12: { name: 'Sheshnag Kaal Sarp', sanskrit: 'शेषनाग कालसर्प योग' },
  };

  const ksInfo = KAAL_SARP_NAMES[rahu.house] || { name: 'Kaal Sarp Yoga', sanskrit: 'कालसर्प योग' };

  // ── 3. Sade Sati Analysis (Astronomical Transit) ─────────────────────────
  const currentTransitSaturnSign = overrideSaturnSignIndex !== undefined 
    ? overrideSaturnSignIndex 
    : getCurrentTransitSaturnSign();

  const moonSignIndex = moon.signIndex;
  const signDiff = (currentTransitSaturnSign - moonSignIndex + 12) % 12;

  let isSadeSatiActive = false;
  let currentPhase: 'Not Active' | 'Rising (First Phase)' | 'Peak (Second Phase)' | 'Setting (Third Phase)' = 'Not Active';

  if (signDiff === 11) {
    isSadeSatiActive = true;
    currentPhase = 'Rising (First Phase)';
  } else if (signDiff === 0) {
    isSadeSatiActive = true;
    currentPhase = 'Peak (Second Phase)';
  } else if (signDiff === 1) {
    isSadeSatiActive = true;
    currentPhase = 'Setting (Third Phase)';
  }

  // ── 4. Pitra Dosha Analysis ─────────────────────────────────────────────
  const hasPitraDosha =
    (sun.house === 9 && [rahu.house, ketu.house, saturn.house].includes(9)) ||
    (rahu.house === 9 || ketu.house === 9);

  return {
    manglik: {
      isManglik,
      intensity,
      marsHouseFromLagna: marsHouseLagna,
      marsHouseFromMoon: marsHouseMoon,
      cancellations,
      remedySummary: isManglik
        ? 'Spiritual harmony practices, Hanuman Chalisa recitation, and mindful communication.'
        : 'No adverse Manglik influences present in natal chart.',
    },
    kaalSarp: {
      hasKaalSarp,
      type: hasKaalSarp ? ksInfo.name : 'None',
      sanskritName: hasKaalSarp ? ksInfo.sanskrit : 'दोष रहित',
      isPartial: hasPartialKaalSarp,
      rahuHouse: rahu.house,
      ketuHouse: ketu.house,
      description: hasKaalSarp
        ? `${ksInfo.name} formed with Rahu in House ${rahu.house} and Ketu in House ${ketu.house}.`
        : 'Planets are freely distributed around the nodal axis; no Kaal Sarp configuration.',
      remedySummary: hasKaalSarp
        ? 'Maha Mrityunjaya Japa, Shiva Aradhana, and service to elders.'
        : 'All planetary currents flow unimpeded.',
    },
    sadeSati: {
      isActive: isSadeSatiActive,
      currentPhase,
      natalMoonSign: ZODIAC_SIGNS[moonSignIndex],
      saturnTransitSign: ZODIAC_SIGNS[currentTransitSaturnSign],
      description: isSadeSatiActive
        ? `Transit Saturn in ${ZODIAC_SIGNS[currentTransitSaturnSign]} is traversing natal Moon (${ZODIAC_SIGNS[moonSignIndex]}). Currently in ${currentPhase}.`
        : `Saturn currently transiting ${ZODIAC_SIGNS[currentTransitSaturnSign]}; no active Sade Sati phase on Moon in ${ZODIAC_SIGNS[moonSignIndex]}.`,
      guidance: isSadeSatiActive
        ? 'Embrace disciplined action, patience, and karmic integrity. Shani rewards righteous persevering effort.'
        : 'Favorable cosmic atmosphere for continuous personal and professional development.',
    },
    pitraDosha: {
      hasPitraDosha,
      reason: hasPitraDosha
        ? 'Affliction of the 9th house or Sun by shadow nodes indicates unresolved ancestral debts.'
        : '9th house and Surya are free from malefic nodal afflictions.',
      remedies: hasPitraDosha
        ? ['Perform ancestral tarpana during Amavasya', 'Donate sesame seeds and food to needy elders', 'Chant Gayatri Mantra daily']
        : ['Offer gratitude to family lineage and parents'],
    },
  };
}
