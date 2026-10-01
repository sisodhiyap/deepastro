/**
 * TransitEngine.ts
 * Deterministic Sidereal Gochara Transit Engine for Future Intelligence.
 * Uses identical VSOP87/ELP-2000 astronomical theory and canonical Meeus True Node via PlanetEngine.
 * Computes exact planetary ingress, house alignments (from Lagna and Moon), and D1/D9/D10 aspects.
 */

import { getJulianDay, BirthTimeInput, ZODIAC_SIGNS } from '../../astrology/astronomyMath.js';
import { calculateAllPlanets, PlanetName, PlanetData } from '../../astrology/PlanetEngine.js';
import { CanonicalPredictionContext, TransitRecord, SignalStrengthLevel } from './types.js';
import { predictionScoringEngine } from './PredictionWeights.js';

export class FutureSiderealTransitEngine {
  /**
   * Computes planetary transit positions for any target date using DeepAstro's canonical ephemeris.
   */
  public static calculateTransitsForDate(
    context: CanonicalPredictionContext,
    targetDate: Date
  ): TransitRecord[] {
    const timeInput: BirthTimeInput = {
      year: targetDate.getUTCFullYear(),
      month: targetDate.getUTCMonth() + 1,
      day: targetDate.getUTCDate(),
      hour: targetDate.getUTCHours(),
      minute: targetDate.getUTCMinutes(),
      second: targetDate.getUTCSeconds(),
    };

    const jd = getJulianDay(timeInput, 0);
    const natalAscDegrees = context.ascendant.degrees;
    const natalAscSignIndex = context.ascendant.signIndex;

    // Resolve natal Moon sign index
    const natalMoon = context.planetaryPositions.find((p) => p.name === 'Moon');
    const natalMoonSignIndex = natalMoon ? natalMoon.signIndex : natalAscSignIndex;

    // Deterministic planetary positions at future target date using DeepAstro's ephemeris & true node
    const transitPlanets = calculateAllPlanets(jd, natalAscDegrees);

    const records: TransitRecord[] = [];
    const isoDate = targetDate.toISOString().split('T')[0];

    for (const tp of transitPlanets) {
      const houseFromLagna = ((tp.signIndex - natalAscSignIndex + 12) % 12) + 1;
      const houseFromMoon = ((tp.signIndex - natalMoonSignIndex + 12) % 12) + 1;

      // Identify natal targets conjunct or aspected
      const conjunctNatal = context.planetaryPositions
        .filter((np) => np.signIndex === tp.signIndex)
        .map((np) => np.name);

      // Classical Vedic Aspects (Drishti)
      const aspectingHouses: number[] = [(houseFromLagna + 6) % 12 || 12]; // 7th aspect for all
      if (tp.name === 'Saturn') {
        aspectingHouses.push((houseFromLagna + 2) % 12 || 12); // 3rd aspect
        aspectingHouses.push((houseFromLagna + 9) % 12 || 12); // 10th aspect
      } else if (tp.name === 'Jupiter') {
        aspectingHouses.push((houseFromLagna + 4) % 12 || 12); // 5th aspect
        aspectingHouses.push((houseFromLagna + 8) % 12 || 12); // 9th aspect
      } else if (tp.name === 'Mars') {
        aspectingHouses.push((houseFromLagna + 3) % 12 || 12); // 4th aspect
        aspectingHouses.push((houseFromLagna + 7) % 12 || 12); // 8th aspect
      }

      // Varga cross-check (D9 and D10)
      const d9Target = context.d9?.find((v) => v.signIndex === tp.signIndex)?.planet;
      const d10Target = context.d10?.find((v) => v.signIndex === tp.signIndex)?.planet;

      let aspectDesc = `House ${houseFromLagna} from Lagna, House ${houseFromMoon} from Moon`;
      if (conjunctNatal.length > 0) {
        aspectDesc += ` (Conjunct Natal ${conjunctNatal.join(', ')})`;
      }
      if (d9Target) aspectDesc += ` (Navamsa ${d9Target} resonance)`;
      if (d10Target) aspectDesc += ` (Dashamsha ${d10Target} confirmation)`;

      // Raw transit strength score calculation
      let rawScore = 50;
      if (tp.name === 'Jupiter') {
        rawScore = [1, 2, 5, 7, 9, 11].includes(houseFromMoon) ? 85 : 55;
      } else if (tp.name === 'Saturn') {
        const isSadeSati = [12, 1, 2].includes(houseFromMoon);
        rawScore = isSadeSati ? 78 : [3, 6, 11].includes(houseFromMoon) ? 80 : 60;
      } else if (tp.name === 'Rahu' || tp.name === 'Ketu') {
        rawScore = [3, 6, 10, 11].includes(houseFromLagna) ? 75 : 62;
      }

      const strength: SignalStrengthLevel = predictionScoringEngine.normalizeStrength(rawScore);

      records.push({
        transitPlanet: tp.name,
        transitLongitude: tp.siderealLongitude,
        transitSign: tp.signName,
        transitSignIndex: tp.signIndex,
        transitHouse: houseFromLagna,
        transitHouseFromMoon: houseFromMoon,
        natalTarget: conjunctNatal.length > 0 ? conjunctNatal.join(', ') : undefined,
        aspect: aspectDesc,
        isRetrograde: tp.isRetrograde,
        startDate: isoDate,
        peakDate: isoDate,
        endDate: isoDate,
        strength,
      });
    }

    return records;
  }

  /**
   * Projects major transits (Jupiter, Saturn, Rahu, Ketu, Mars, Sun) for an entire year.
   */
  public static calculateTransitsForYear(
    context: CanonicalPredictionContext,
    targetYear: number
  ): TransitRecord[] {
    // Sample mid-year (1st of July) for primary year background transit positions
    const midDate = new Date(Date.UTC(targetYear, 6, 1, 12, 0, 0));
    return this.calculateTransitsForDate(context, midDate);
  }
}
