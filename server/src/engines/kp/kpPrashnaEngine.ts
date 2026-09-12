/**
 * KP Prashna (Horary) Intelligence Engine
 * Implements 1–249 Horary Astrology according to classical KP principles:
 * - Horary seed number determines the Ascendant cusp longitude.
 * - 12 Placidus cusps and CSLs calculated independently.
 * - Never mixes natal data unless explicitly requested.
 */

import Astronomy from '../../astrology/astronomyBridge.js';
import { getJulianDayFromDate } from '../../astrology/astronomyMath.js';
import { calculateAllPlanets } from '../../astrology/PlanetEngine.js';
import { KPSubDivisionEngine } from './kpSubDivision.js';
import { KPAyanamsaEngine } from './kpAyanamsa.js';
import { KPAyanamsaType } from './kpConfig.js';
import { KPCuspEngine, KPCuspItem } from './kpCuspEngine.js';
import { KPPlanetaryTableEngine, KPPlanetRow } from './kpPlanetaryTable.js';
import { FourLevelSignificatorsEngine } from '../significators/fourLevelSignificators.js';
import { HouseSignificatorMatrixEngine } from '../significators/houseSignificatorMatrix.js';
import { KPRulingPlanetsEngine, RulingPlanetSnapshot } from './kpRulingPlanets.js';
import { KPEventPromiseEngine, EventPromiseEvaluation } from '../eventPrediction/kpEventPromiseEngine.js';
import { LifeEventDomain } from '../eventPrediction/eventRulesRegistry.js';

export interface PrashnaChartResult {
  question: string;
  seedNumber: number; // 1-249
  questionTimestamp: string;
  location: {
    latitude: number;
    longitude: number;
    timezone: number;
    locationName: string;
  };
  ayanamsaType: KPAyanamsaType;
  ayanamsaDegrees: number;
  horaryAscendant: {
    longitude: number;
    sign: string;
    signLord: string;
    nakshatra: string;
    starLord: string;
    subLord: string;
    subSubLord: string;
  };
  cusps: KPCuspItem[];
  planets: KPPlanetRow[];
  rulingPlanets: RulingPlanetSnapshot;
  targetDomain?: LifeEventDomain;
  eventPromise?: EventPromiseEvaluation;
  matrix: any[];
}

export class KPPrashnaEngine {
  /**
   * Generates a complete KP Prashna Chart and evaluation
   */
  public static generatePrashnaChart(params: {
    question: string;
    seedNumber: number;
    questionTimestamp: Date;
    latitude: number;
    longitude: number;
    timezone: number;
    locationName?: string;
    targetDomain?: LifeEventDomain;
    ayanamsaType?: KPAyanamsaType;
  }): PrashnaChartResult {
    const {
      question,
      seedNumber,
      questionTimestamp,
      latitude,
      longitude,
      timezone,
      locationName = 'Horary Location',
      targetDomain,
      ayanamsaType = 'KP_NEW',
    } = params;

    const jd = getJulianDayFromDate(questionTimestamp);
    const time = Astronomy.MakeTime(questionTimestamp);
    const ayanamsa = KPAyanamsaEngine.calculateAyanamsa(time, ayanamsaType);

    // 1. Resolve Horary Ascendant from 1-249 seed number
    const seedInfo = KPSubDivisionEngine.getLongitudeFor249Seed(seedNumber);
    const ascLon = seedInfo.startLongitude;
    const ascDetails = KPSubDivisionEngine.resolveDetails(ascLon);

    // 2. Compute 12 Placidus cusps using seed Ascendant as House 1 Cusp
    const cusps = KPCuspEngine.calculateKPCusps({
      jd,
      latitude,
      longitude,
      ayanamsaType,
    });
    // In Horary, Cusp 1 is pinned to the seed longitude
    cusps[0].longitude = ascLon;
    cusps[0].sign = ascDetails.signName;
    cusps[0].signLord = ascDetails.signLord;
    cusps[0].starLord = ascDetails.starLord;
    cusps[0].subLord = ascDetails.subLord;
    cusps[0].subSubLord = ascDetails.subSubLord;

    // 3. Planetary positions at question moment
    const rawPlanets = calculateAllPlanets(jd, ascLon);
    const kpPlanets = KPPlanetaryTableEngine.calculateTable({
      planets: rawPlanets,
      cusps,
      jd,
      ayanamsaType,
    });

    // 4. Significators & Matrix
    const significators = FourLevelSignificatorsEngine.calculateSignificators(kpPlanets, cusps);
    const matrix = HouseSignificatorMatrixEngine.generateMatrix(significators);

    // 5. Ruling Planets at question moment
    const rulingPlanets = KPRulingPlanetsEngine.calculateRulingPlanets({
      utcDate: questionTimestamp,
      latitude,
      longitude,
      timezone,
      locationName,
      ayanamsaType,
    });

    // 6. Optional domain promise evaluation
    let eventPromise: EventPromiseEvaluation | undefined;
    if (targetDomain) {
      eventPromise = KPEventPromiseEngine.evaluateDomain({
        domain: targetDomain,
        cusps,
        significators,
      });
    }

    return {
      question,
      seedNumber,
      questionTimestamp: questionTimestamp.toISOString(),
      location: {
        latitude,
        longitude,
        timezone,
        locationName,
      },
      ayanamsaType,
      ayanamsaDegrees: ayanamsa,
      horaryAscendant: {
        longitude: ascLon,
        sign: ascDetails.signName,
        signLord: ascDetails.signLord,
        nakshatra: ascDetails.nakshatraName,
        starLord: ascDetails.starLord,
        subLord: ascDetails.subLord,
        subSubLord: ascDetails.subSubLord,
      },
      cusps,
      planets: kpPlanets,
      rulingPlanets,
      targetDomain,
      eventPromise,
      matrix,
    };
  }
}
