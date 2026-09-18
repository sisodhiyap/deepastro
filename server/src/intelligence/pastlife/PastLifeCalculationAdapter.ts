/**
 * DeepAstro 7.0 — Past Life Calculation Adapter
 * Bridges the canonical astronomical calculation core (VedicAstroEngine)
 * with the SoulTrace Past Life Intelligence Engine.
 */

import { VedicAstroEngine, BirthProfileInput, FullKundliResult } from '../../astrology/VedicAstroEngine.js';
import { CalculationSnapshotService } from '../../services/CalculationSnapshotService.js';
import { ValidatedPastLifeInput } from './PastLifeInputEngine.js';

export interface PastLifeCalculatedSnapshot {
  fingerprint: string;
  kundli: FullKundliResult;
  charaKarakas: Array<{ planet: string; longitude: number; karaka: string; role: string }>;
  atmakaraka: { planet: string; sign: string; degrees: number; house: number };
  ketuPlacement: { sign: string; house: number; nakshatra: string; nakshatraLord: string };
  rahuPlacement: { sign: string; house: number; nakshatra: string };
  twelfthHouse: { sign: string; lord: string; planets: string[] };
  eighthHouse: { sign: string; lord: string; planets: string[] };
  fifthHouse: { sign: string; lord: string; planets: string[] };
  d9LagnaSign: string;
  d60Available: boolean;
  d60LimitationNotice?: string;
  currentDasha: { mahadasha: string; antardasha: string };
}

export class PastLifeCalculationAdapter {
  public static adapt(input: ValidatedPastLifeInput): PastLifeCalculatedSnapshot {
    const profileInput: BirthProfileInput = {
      name: input.fullName,
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      birthPlace: input.birthPlace,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone,
      gender: input.gender as any,
      isApproximateTime: input.isApproximateTime,
      _skipSensitivity: true,
    };

    // 1. Generate canonical deterministic calculation fingerprint
    const fingerprint = CalculationSnapshotService.generateFingerprint(profileInput);

    // 2. Compute canonical Vedic chart
    const kundli = VedicAstroEngine.calculateKundli(profileInput);

    // 3. Jaimini Chara Karakas (ordered strictly by degrees in rashi descending)
    const movingPlanets = kundli.planets.filter(
      p => !['Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'].includes(p.name)
    );

    const getPlanetDeg = (p: any) => p.degreeInSign ?? (p.normDegree !== undefined ? p.normDegree % 30 : (p.siderealLongitude % 30));
    const getPlanetLong = (p: any) => p.siderealLongitude ?? p.normDegree ?? (p.degreeInSign ?? 0);

    const sortedByDeg = [...movingPlanets].sort((a: any, b: any) => getPlanetDeg(b) - getPlanetDeg(a));
    const karakaNames = [
      { name: 'Atmakaraka (AK)', role: 'Soul Desire & Spiritual Archetype' },
      { name: 'Amatyakaraka (AmK)', role: 'Intellect, Profession & Service' },
      { name: 'Bhratrukaraka (BK)', role: 'Gurus, Mentors & Companions' },
      { name: 'Matrukaraka (MK)', role: 'Nurturance & Emotional Roots' },
      { name: 'Putrakaraka (PK)', role: 'Creativity, Disciples & Purva Punya' },
      { name: 'Gnatikaraka (GK)', role: 'Obstacles, Karma & Purification' },
      { name: 'Darakaraka (DK)', role: 'Relationships & Karmic Mirror' },
    ];

    const charaKarakas = sortedByDeg.slice(0, 7).map((p: any, idx) => ({
      planet: p.name,
      longitude: getPlanetLong(p),
      karaka: karakaNames[idx]?.name || 'Karaka',
      role: karakaNames[idx]?.role || 'Significator',
    }));

    const akPlanet = sortedByDeg[0]?.name || 'Sun';
    const akPlanetData: any = kundli.planets.find(p => p.name === akPlanet);

    // Find house of Atmakaraka
    const lagnaDeg = kundli.ascendant.degrees;
    const getHouse = (deg: number) => {
      let diff = deg - lagnaDeg;
      if (diff < 0) diff += 360;
      return Math.floor(diff / 30) + 1;
    };

    const akHouse = akPlanetData ? getHouse(getPlanetLong(akPlanetData)) : 1;
    const ketu: any = kundli.planets.find(p => p.name === 'Ketu') || {
      name: 'Ketu',
      siderealLongitude: (lagnaDeg + 210) % 360,
      degreeInSign: ((lagnaDeg + 210) % 360) % 30,
      signName: 'Scorpio',
      nakshatra: { name: 'Jyeshtha', lord: 'Mercury' },
      nakshatraLord: 'Mercury',
    };
    const rahu: any = kundli.planets.find(p => p.name === 'Rahu') || {
      name: 'Rahu',
      siderealLongitude: (lagnaDeg + 30) % 360,
      degreeInSign: ((lagnaDeg + 30) % 360) % 30,
      signName: 'Taurus',
      nakshatra: { name: 'Rohini', lord: 'Moon' },
      nakshatraLord: 'Moon',
    };

    const ketuHouse = getHouse(getPlanetLong(ketu));
    const rahuHouse = getHouse(getPlanetLong(rahu));

    // House significations
    const getPlanetsInHouse = (targetHouse: number) => {
      return kundli.planets
        .filter((p: any) => getHouse(getPlanetLong(p)) === targetHouse)
        .map(p => p.name);
    };

    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signLords: Record<string, string> = {
      Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
      Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
    };

    const lagnaSignIdx = Math.floor(lagnaDeg / 30);
    const getHouseSign = (h: number) => signs[(lagnaSignIdx + h - 1) % 12];

    const h12Sign = getHouseSign(12);
    const h8Sign = getHouseSign(8);
    const h5Sign = getHouseSign(5);

    // D60 availability verification
    const isApprox = input.isApproximateTime;
    const d60Available = !isApprox;
    const d60Notice = isApprox
      ? 'D60 (Shashtiamsa) analysis is prudently constrained because birth time is marked approximate (D60 ascends every ~2 minutes).'
      : undefined;

    // Current Vimshottari dasha
    const mahadasha = kundli.dashas?.currentMahadasha?.planet || (kundli.dashas as any)?.current?.mahadasha || 'Saturn';
    const antardasha = kundli.dashas?.currentAntardasha?.planet || (kundli.dashas as any)?.current?.antardasha || 'Mercury';

    const ketuNakName = typeof ketu.nakshatra === 'object' ? ketu.nakshatra?.name : (ketu.nakshatra || 'Ashwini');
    const rahuNakName = typeof rahu.nakshatra === 'object' ? rahu.nakshatra?.name : (rahu.nakshatra || 'Swati');

    return {
      fingerprint,
      kundli,
      charaKarakas,
      atmakaraka: {
        planet: akPlanet,
        sign: akPlanetData?.signName || 'Aries',
        degrees: akPlanetData ? getPlanetDeg(akPlanetData) : 0,
        house: akHouse,
      },
      ketuPlacement: {
        sign: ketu.signName,
        house: ketuHouse,
        nakshatra: ketuNakName,
        nakshatraLord: (ketu as any).nakshatraLord || ketu.nakshatra?.lord || 'Ketu',
      },
      rahuPlacement: {
        sign: rahu.signName,
        house: rahuHouse,
        nakshatra: rahuNakName,
      },
      twelfthHouse: {
        sign: h12Sign,
        lord: signLords[h12Sign] || 'Jupiter',
        planets: getPlanetsInHouse(12),
      },
      eighthHouse: {
        sign: h8Sign,
        lord: signLords[h8Sign] || 'Mars',
        planets: getPlanetsInHouse(8),
      },
      fifthHouse: {
        sign: h5Sign,
        lord: signLords[h5Sign] || 'Jupiter',
        planets: getPlanetsInHouse(5),
      },
      d9LagnaSign: (kundli.vargas as any)?.d9?.ascendantSign || (kundli.vargas as any)?.d9_navamsa?.[0]?.sign || 'Sagittarius',
      d60Available,
      d60LimitationNotice: d60Notice,
      currentDasha: { mahadasha, antardasha },
    };
  }
}
