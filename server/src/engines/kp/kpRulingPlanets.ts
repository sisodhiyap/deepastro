/**
 * KP Ruling Planets (RP) Engine — Ruleset KP-RP-v1
 * Determines the 5 Master Ruling Planets at the moment of query or judgement:
 * 1. Weekday Lord (Day Lord / Vara Lord)
 * 2. Ascendant Sign Lord
 * 3. Ascendant Star Lord
 * 4. Moon Sign Lord
 * 5. Moon Star Lord
 * Includes Rahu/Ketu proxy nodes and Sub-Lord extensions.
 */

import Astronomy from '../../astrology/astronomyBridge.js';
import { calculateAscendant, getJulianDayFromDate } from '../../astrology/astronomyMath.js';
import { calculateAllPlanets } from '../../astrology/PlanetEngine.js';
import { KPSubDivisionEngine } from './kpSubDivision.js';
import { KPAyanamsaEngine } from './kpAyanamsa.js';
import { KPAyanamsaType } from './kpConfig.js';

export interface RulingPlanetSnapshot {
  rulingPlanets: string[];
  weekdayLord: string;
  ascendantSignLord: string;
  ascendantStarLord: string;
  ascendantSubLord: string;
  moonSignLord: string;
  moonStarLord: string;
  moonSubLord: string;
  nodeProxies: Record<string, string[]>;
  timestamp: string;
  location: string;
  ruleset: 'KP-RP-v1';
}

const WEEKDAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export class KPRulingPlanetsEngine {
  /**
   * Calculates KP Ruling Planets for a given date, time, and geographic location.
   */
  public static calculateRulingPlanets(params: {
    utcDate: Date;
    latitude: number;
    longitude: number;
    timezone: number;
    locationName?: string;
    ayanamsaType?: KPAyanamsaType;
  }): RulingPlanetSnapshot {
    const {
      utcDate,
      latitude,
      longitude,
      timezone,
      locationName = 'Query Location',
      ayanamsaType = 'KP_NEW',
    } = params;

    // 1. Weekday Lord based on local sunrise / local date
    const localMs = utcDate.getTime() + timezone * 3600 * 1000;
    const localDate = new Date(localMs);
    const dayOfWeek = localDate.getUTCDay(); // 0 = Sunday -> Sun, 1 = Mon -> Moon, etc.
    const weekdayLord = WEEKDAY_LORDS[dayOfWeek];

    // 2. Compute JD & Planetary Positions
    const jd = getJulianDayFromDate(utcDate);
    const time = Astronomy.MakeTime(utcDate);
    const ayanamsa = KPAyanamsaEngine.calculateAyanamsa(time, ayanamsaType);

    // Compute Ascendant
    const lahiriAsc = calculateAscendant(jd, { latitude, longitude, timezone });
    // Convert to KP Sidereal
    const kpAsc = ayanamsaType === 'KP_NEW'
      ? KPSubDivisionEngine.normalize(lahiriAsc + KPAyanamsaEngine.KP_NEW_OFFSET_DEG)
      : lahiriAsc;

    const ascDetails = KPSubDivisionEngine.resolveDetails(kpAsc);

    // Compute Moon
    const planets = calculateAllPlanets(jd, kpAsc);
    const moon = planets.find((p) => p.name === 'Moon');
    const moonLon = moon ? moon.siderealLongitude : 0;
    const kpMoonLon = ayanamsaType === 'KP_NEW'
      ? KPSubDivisionEngine.normalize(moonLon + KPAyanamsaEngine.KP_NEW_OFFSET_DEG)
      : moonLon;

    const moonDetails = KPSubDivisionEngine.resolveDetails(kpMoonLon);

    // Check Rahu / Ketu proxy nodes
    const nodeProxies: Record<string, string[]> = { Rahu: [], Ketu: [] };
    const rahu = planets.find((p) => p.name === 'Rahu');
    const ketu = planets.find((p) => p.name === 'Ketu');

    if (rahu) {
      const rDetails = KPSubDivisionEngine.resolveDetails(rahu.siderealLongitude);
      nodeProxies.Rahu.push(rDetails.signLord, rDetails.starLord);
    }
    if (ketu) {
      const kDetails = KPSubDivisionEngine.resolveDetails(ketu.siderealLongitude);
      nodeProxies.Ketu.push(kDetails.signLord, kDetails.starLord);
    }

    // Consolidated prioritized list of unique ruling planets
    const rawRps = [
      ascDetails.starLord,
      ascDetails.signLord,
      moonDetails.starLord,
      moonDetails.signLord,
      weekdayLord,
    ];

    // If Rahu or Ketu represents any of these, Rahu/Ketu take prominent precedence
    const finalRps: string[] = [];
    for (const rp of rawRps) {
      if (!finalRps.includes(rp)) finalRps.push(rp);
      if (nodeProxies.Rahu.includes(rp) && !finalRps.includes('Rahu')) finalRps.push('Rahu');
      if (nodeProxies.Ketu.includes(rp) && !finalRps.includes('Ketu')) finalRps.push('Ketu');
    }

    return {
      rulingPlanets: finalRps,
      weekdayLord,
      ascendantSignLord: ascDetails.signLord,
      ascendantStarLord: ascDetails.starLord,
      ascendantSubLord: ascDetails.subLord,
      moonSignLord: moonDetails.signLord,
      moonStarLord: moonDetails.starLord,
      moonSubLord: moonDetails.subLord,
      nodeProxies,
      timestamp: utcDate.toISOString(),
      location: locationName,
      ruleset: 'KP-RP-v1',
    };
  }
}
