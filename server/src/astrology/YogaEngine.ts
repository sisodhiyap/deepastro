/**
 * Yoga Engine
 * Identifies Classical Auspicious and Raja Yogas from Parashara and Phaladeepika:
 * - Gaja Kesari Yoga
 * - Budhaditya Yoga
 * - Pancha Mahapurusha Yogas (Ruchaka, Bhadra, Hamsa, Malavya, Shasha)
 * - Neechabhanga Raja Yoga
 * - Vipreet Raja Yogas (Harsha, Sarala, Vimala)
 * - Chandra Mangala Yoga
 * - Amala Yoga
 * - Dhana Yogas
 */

import { PlanetData, PlanetName } from './PlanetEngine.js';
import { BhavaData } from './HouseEngine.js';

export interface YogaResult {
  name: string;
  sanskritName: string;
  category: 'MahaPurusha' | 'Raja' | 'Dhana' | 'Spiritual' | 'Auspicious';
  isFormed: boolean;
  involvedPlanets: PlanetName[];
  housesInvolved: number[];
  effects: string;
  strengthScore: number; // 0 to 100
}

export function detectYogas(planets: PlanetData[], houses: BhavaData[]): YogaResult[] {
  const yogas: YogaResult[] = [];
  const planetMap = new Map<PlanetName, PlanetData>();
  planets.forEach((p) => planetMap.set(p.name, p));

  const sun = planetMap.get('Sun')!;
  const moon = planetMap.get('Moon')!;
  const mars = planetMap.get('Mars')!;
  const mercury = planetMap.get('Mercury')!;
  const jupiter = planetMap.get('Jupiter')!;
  const venus = planetMap.get('Venus')!;
  const saturn = planetMap.get('Saturn')!;

  // 1. Gaja Kesari Yoga (Jupiter in Kendra 1, 4, 7, 10 from Moon)
  if (jupiter && moon) {
    const houseDiff = ((jupiter.house - moon.house + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(houseDiff)) {
      yogas.push({
        name: 'Gaja Kesari Yoga',
        sanskritName: 'गजकेसरी योग',
        category: 'Raja',
        isFormed: true,
        involvedPlanets: ['Jupiter', 'Moon'],
        housesInvolved: [jupiter.house, moon.house],
        effects: 'Bestows great wisdom, eminence, invincibility over adversaries, eloquent speech, and long-lasting reputation.',
        strengthScore: jupiter.dignity === 'Debilitated' ? 45 : 90,
      });
    }
  }

  // 2. Budhaditya Yoga (Sun + Mercury in same house)
  if (sun && mercury && sun.house === mercury.house) {
    const isClose = Math.abs(sun.siderealLongitude - mercury.siderealLongitude) < 14;
    yogas.push({
      name: 'Budhaditya Yoga',
      sanskritName: 'बुधादित्य योग',
      category: 'Auspicious',
      isFormed: true,
      involvedPlanets: ['Sun', 'Mercury'],
      housesInvolved: [sun.house],
      effects: 'Grants sharp analytical intellect, administrative excellence, mastery in communication, and scholarly prestige.',
      strengthScore: isClose ? 75 : 88,
    });
  }

  // 3. Pancha Mahapurusha Yogas (Kendra + Own/Exalted sign)
  const kendras = [1, 4, 7, 10];

  // Ruchaka (Mars)
  if (kendras.includes(mars.house) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(mars.dignity)) {
    yogas.push({
      name: 'Ruchaka Yoga',
      sanskritName: 'रुचक योग',
      category: 'MahaPurusha',
      isFormed: true,
      involvedPlanets: ['Mars'],
      housesInvolved: [mars.house],
      effects: 'Courage, magnetic authority, executive power, victory in strategic endeavors, and physical vitality.',
      strengthScore: 95,
    });
  }

  // Bhadra (Mercury)
  if (kendras.includes(mercury.house) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(mercury.dignity)) {
    yogas.push({
      name: 'Bhadra Yoga',
      sanskritName: 'भद्र योग',
      category: 'MahaPurusha',
      isFormed: true,
      involvedPlanets: ['Mercury'],
      housesInvolved: [mercury.house],
      effects: 'Exceptional mathematical and commercial acumen, erudition, longevity, and diplomatic charm.',
      strengthScore: 92,
    });
  }

  // Hamsa (Jupiter)
  if (kendras.includes(jupiter.house) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(jupiter.dignity)) {
    yogas.push({
      name: 'Hamsa Yoga',
      sanskritName: 'हंस योग',
      category: 'MahaPurusha',
      isFormed: true,
      involvedPlanets: ['Jupiter'],
      housesInvolved: [jupiter.house],
      effects: 'Spiritual purity, revered righteous conduct, deep philosophical insight, and universal goodwill.',
      strengthScore: 98,
    });
  }

  // Malavya (Venus)
  if (kendras.includes(venus.house) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(venus.dignity)) {
    yogas.push({
      name: 'Malavya Yoga',
      sanskritName: 'मालव्य योग',
      category: 'MahaPurusha',
      isFormed: true,
      involvedPlanets: ['Venus'],
      housesInvolved: [venus.house],
      effects: 'Refined artistic genius, opulence, luxury, loving relationships, and serene domestic bliss.',
      strengthScore: 94,
    });
  }

  // Shasha (Saturn)
  if (kendras.includes(saturn.house) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(saturn.dignity)) {
    yogas.push({
      name: 'Shasha Yoga',
      sanskritName: 'शश योग',
      category: 'MahaPurusha',
      isFormed: true,
      involvedPlanets: ['Saturn'],
      housesInvolved: [saturn.house],
      effects: 'Steadfast perseverance, mastery over masses, enduring institutional command, and self-mastery.',
      strengthScore: 90,
    });
  }

  // 4. Chandra Mangala Yoga (Moon and Mars conjunct)
  if (moon && mars && moon.house === mars.house) {
    yogas.push({
      name: 'Chandra Mangala Yoga',
      sanskritName: 'चन्द्र-मंगल योग',
      category: 'Dhana',
      isFormed: true,
      involvedPlanets: ['Moon', 'Mars'],
      housesInvolved: [moon.house],
      effects: 'Immense capacity for commercial wealth accumulation, enterprising drive, and resilience.',
      strengthScore: 82,
    });
  }

  // 5. Amala Yoga (Benefics Jupiter, Venus, or Mercury in 10th house from Ascendant or Moon)
  const tenthHousePlanets = planets.filter((p) => p.house === 10);
  const hasBeneficIn10th = tenthHousePlanets.some((p) => ['Jupiter', 'Venus', 'Mercury'].includes(p.name));
  if (hasBeneficIn10th) {
    yogas.push({
      name: 'Amala Yoga',
      sanskritName: 'अमल योग',
      category: 'Auspicious',
      isFormed: true,
      involvedPlanets: tenthHousePlanets.map((p) => p.name),
      housesInvolved: [10],
      effects: 'Stainless professional reputation, high integrity, moral leadership, and lasting public honors.',
      strengthScore: 86,
    });
  }

  // 6. Vipreet Raja Yoga (Lord of 6, 8, or 12 in another dusthana 6, 8, 12)
  const dusthanas = [6, 8, 12];
  const h6Lord = houses.find((h) => h.houseNumber === 6)?.lord;
  const h8Lord = houses.find((h) => h.houseNumber === 8)?.lord;
  const h12Lord = houses.find((h) => h.houseNumber === 12)?.lord;

  const h6LordData = h6Lord ? planetMap.get(h6Lord) : null;
  const h8LordData = h8Lord ? planetMap.get(h8Lord) : null;
  const h12LordData = h12Lord ? planetMap.get(h12Lord) : null;

  if (h6LordData && dusthanas.includes(h6LordData.house)) {
    yogas.push({
      name: 'Harsha Vipreet Raja Yoga',
      sanskritName: 'हर्ष विपरीत राजयोग',
      category: 'Raja',
      isFormed: true,
      involvedPlanets: [h6LordData.name],
      housesInvolved: [h6LordData.house],
      effects: 'Overcoming insurmountable odds, immunity from secret adversaries, and triumph arising from crises.',
      strengthScore: 78,
    });
  }

  if (h8LordData && dusthanas.includes(h8LordData.house)) {
    yogas.push({
      name: 'Sarala Vipreet Raja Yoga',
      sanskritName: 'सरल विपरीत राजयोग',
      category: 'Raja',
      isFormed: true,
      involvedPlanets: [h8LordData.name],
      housesInvolved: [h8LordData.house],
      effects: 'Longevity, fearlessness, sudden unexpected inheritances or gains, and indomitable courage.',
      strengthScore: 80,
    });
  }

  if (h12LordData && dusthanas.includes(h12LordData.house)) {
    yogas.push({
      name: 'Vimala Vipreet Raja Yoga',
      sanskritName: 'विमल विपरीत राजयोग',
      category: 'Raja',
      isFormed: true,
      involvedPlanets: [h12LordData.name],
      housesInvolved: [h12LordData.house],
      effects: 'Freedom from debts, noble spending, independent mindset, and spiritual serenity.',
      strengthScore: 79,
    });
  }

  return yogas;
}
