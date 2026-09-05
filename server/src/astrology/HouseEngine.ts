/**
 * House Engine (Bhava)
 * Computes 12 Bhavas (Tanu, Dhana, Sahaja, Sukha, Putra, Ari, Yuvati, Randhra, Dharma, Karma, Labha, Vyaya)
 * Maps sign lords, cusp degrees, planets residing in houses, and traditional significations.
 */

import { ZODIAC_SIGNS, VEDIC_RASHI_NAMES, normalizeDegrees } from './astronomyMath.js';
import { PlanetData, PlanetName } from './PlanetEngine.js';

export interface BhavaData {
  houseNumber: number; // 1-12
  sanskritName: string;
  signIndex: number; // 0-11
  signName: string;
  vedicSignName: string;
  lord: PlanetName;
  startDegree: number;
  midCuspDegree: number;
  endDegree: number;
  planetsInHouse: PlanetName[];
  signification: string;
  category: 'Kendra' | 'Trikona' | 'Upachaya' | 'Dusthana' | 'Maraka';
}

const BHAVA_NAMES = [
  'Tanu Bhava (Self / Physical Body)',
  'Dhana Bhava (Wealth / Speech / Family)',
  'Sahaja Bhava (Siblings / Courage / Effort)',
  'Sukha Bhava (Mother / Happiness / Land)',
  'Putra Bhava (Children / Intellect / Past Merits)',
  'Ari Bhava (Enemies / Health / Obstacles / Service)',
  'Yuvati Bhava (Spouse / Partnerships / Public)',
  'Randhra Bhava (Longevity / Transformation / Occult)',
  'Dharma Bhava (Fortune / Higher Wisdom / Father)',
  'Karma Bhava (Career / Status / Public Reputation)',
  'Labha Bhava (Gains / Ambition / Social Circle)',
  'Vyaya Bhava (Expenditure / Liberation / Solitude)',
];

const SIGN_LORDS: PlanetName[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
];

export function calculateHouses(ascendantDegrees: number, planets: PlanetData[]): BhavaData[] {
  const ascSign = Math.floor(ascendantDegrees / 30);
  const ascRemainder = ascendantDegrees % 30;

  const houses: BhavaData[] = [];

  for (let i = 1; i <= 12; i++) {
    const houseSign = (ascSign + (i - 1)) % 12;
    const lord = SIGN_LORDS[houseSign];

    // Equal bhava calculation around ascendant
    const midCusp = normalizeDegrees(ascendantDegrees + (i - 1) * 30);
    const startDeg = normalizeDegrees(midCusp - 15);
    const endDeg = normalizeDegrees(midCusp + 15);

    // Find planets located in this house
    const planetsInHouse = planets
      .filter((p) => p.house === i)
      .map((p) => p.name);

    // Vedic house classifications
    let category: 'Kendra' | 'Trikona' | 'Upachaya' | 'Dusthana' | 'Maraka' = 'Upachaya';
    if ([1, 4, 7, 10].includes(i)) category = 'Kendra';
    else if ([1, 5, 9].includes(i)) category = 'Trikona';
    else if ([6, 8, 12].includes(i)) category = 'Dusthana';
    else if ([2, 7].includes(i)) category = 'Maraka';
    else if ([3, 6, 10, 11].includes(i)) category = 'Upachaya';

    houses.push({
      houseNumber: i,
      sanskritName: BHAVA_NAMES[i - 1],
      signIndex: houseSign,
      signName: ZODIAC_SIGNS[houseSign],
      vedicSignName: VEDIC_RASHI_NAMES[houseSign],
      lord,
      startDegree: startDeg,
      midCuspDegree: midCusp,
      endDegree: endDeg,
      planetsInHouse,
      signification: BHAVA_NAMES[i - 1].split('(')[1].replace(')', ''),
      category,
    });
  }

  return houses;
}
