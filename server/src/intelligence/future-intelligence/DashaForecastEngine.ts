/**
 * DashaForecastEngine.ts
 * Computes active Mahadashas, Antardashas, and Pratyantardashas for future dates
 * using DeepAstro's canonical Vimshottari engine.
 */

import { calculateVimshottariDasha, DashaPeriod, PratyantardashaPeriod } from '../../astrology/DashaEngine.js';
import { PlanetName } from '../../astrology/PlanetEngine.js';
import { CanonicalPredictionContext } from './types.js';

export interface ActiveDashaContext {
  targetDate: string;
  mahadasha: PlanetName;
  mahadashaStart: string;
  mahadashaEnd: string;
  antardasha: PlanetName;
  antardashaStart: string;
  antardashaEnd: string;
  pratyantardasha: PlanetName;
  pratyantardashaStart: string;
  pratyantardashaEnd: string;
  isTransitionPeriod: boolean; // Near dasha boundary (+/- 60 days)
  transitionNote?: string;
}

export class DashaForecastEngine {
  /**
   * Resolves the exact active 3-tier Vimshottari period for any future evaluation timestamp.
   */
  public static getActiveDasha(
    context: CanonicalPredictionContext,
    targetDate: Date
  ): ActiveDashaContext {
    const moon = context.planetaryPositions.find((p) => p.name === 'Moon');
    const moonLon = moon ? moon.siderealLongitude : 0;
    const birthDate = new Date(context.birthDate + 'T' + context.birthTime + 'Z');

    const analysis = calculateVimshottariDasha(moonLon, birthDate, targetDate);

    const m = analysis.currentMahadasha;
    const a = analysis.currentAntardasha;
    const p = analysis.currentPratyantardasha;

    // Check boundary proximity (Dasha Sandhi / transition window within 60 days)
    const targetMs = targetDate.getTime();
    const mEndMs = new Date(m.endDate).getTime();
    const aEndMs = new Date(a.endDate).getTime();
    const MS_60_DAYS = 60 * 24 * 60 * 60 * 1000;

    let isTransition = false;
    let transitionNote: string | undefined = undefined;

    if (Math.abs(targetMs - mEndMs) <= MS_60_DAYS) {
      isTransition = true;
      transitionNote = `Mahadasha Sandhi: Major cosmic life transition approaching as ${m.planet} cycle winds down.`;
    } else if (Math.abs(targetMs - aEndMs) <= MS_60_DAYS / 2) {
      isTransition = true;
      transitionNote = `Antardasha transition: Sub-cycle shifting from ${a.planet}.`;
    }

    return {
      targetDate: targetDate.toISOString().split('T')[0],
      mahadasha: m.planet,
      mahadashaStart: m.startDate,
      mahadashaEnd: m.endDate,
      antardasha: a.planet,
      antardashaStart: a.startDate,
      antardashaEnd: a.endDate,
      pratyantardasha: p.planet,
      pratyantardashaStart: p.startDate,
      pratyantardashaEnd: p.endDate,
      isTransitionPeriod: isTransition,
      transitionNote,
    };
  }

  /**
   * Gets Dasha for a specific year (evaluated mid-year, 1st July)
   */
  public static getDashaForYear(
    context: CanonicalPredictionContext,
    year: number
  ): ActiveDashaContext {
    const midYear = new Date(Date.UTC(year, 6, 1, 12, 0, 0));
    return this.getActiveDasha(context, midYear);
  }

  /**
   * Finds next major Mahadasha or Antardasha transition date starting from a given date.
   */
  public static getNextMajorTransition(
    context: CanonicalPredictionContext,
    fromDate: Date = new Date()
  ): {
    transitionDate: string;
    fromDasha: string;
    toDasha: string;
    significance: string;
  } {
    const current = this.getActiveDasha(context, fromDate);
    const mEnd = new Date(current.mahadashaEnd);
    const aEnd = new Date(current.antardashaEnd);

    // If Mahadasha ends within 5 years, prioritize Mahadasha transition
    if (mEnd.getTime() > fromDate.getTime() && mEnd.getTime() - fromDate.getTime() < 5 * 365 * 24 * 60 * 60 * 1000) {
      const nextDate = new Date(mEnd.getTime() + 24 * 60 * 60 * 1000);
      const nextDasha = this.getActiveDasha(context, nextDate);
      return {
        transitionDate: current.mahadashaEnd.split('T')[0],
        fromDasha: `${current.mahadasha} Mahadasha`,
        toDasha: `${nextDasha.mahadasha} Mahadasha`,
        significance: `Comprehensive tectonic life evolution as the native shifts from ${current.mahadasha} to ${nextDasha.mahadasha} rulership.`,
      };
    }

    // Otherwise next Antardasha transition
    const nextSubDate = new Date(aEnd.getTime() + 24 * 60 * 60 * 1000);
    const nextSub = this.getActiveDasha(context, nextSubDate);
    return {
      transitionDate: current.antardashaEnd.split('T')[0],
      fromDasha: `${current.mahadasha} / ${current.antardasha}`,
      toDasha: `${current.mahadasha} / ${nextSub.antardasha}`,
      significance: `Phase transition: Shift in day-to-day focus and opportunities as ${nextSub.antardasha} antardasha initiates.`,
    };
  }
}

export class AntardashaForecastEngine {
  public static getAntardashasForYear(
    context: CanonicalPredictionContext,
    year: number
  ): Array<{ planet: PlanetName; startDate: string; endDate: string }> {
    const results: Array<{ planet: PlanetName; startDate: string; endDate: string }> = [];
    const moon = context.planetaryPositions.find((p) => p.name === 'Moon');
    const moonLon = moon ? moon.siderealLongitude : 0;
    const birthDate = new Date(context.birthDate + 'T' + context.birthTime + 'Z');

    const yearStart = new Date(Date.UTC(year, 0, 1)).getTime();
    const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59)).getTime();

    // Sample across months to capture all active antardashas in that year
    const seen = new Set<string>();
    for (let m = 0; m < 12; m++) {
      const sampleDate = new Date(Date.UTC(year, m, 15));
      const res = calculateVimshottariDasha(moonLon, birthDate, sampleDate);
      const ant = res.currentAntardasha;
      const key = `${ant.planet}_${ant.startDate}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          planet: ant.planet,
          startDate: ant.startDate.split('T')[0],
          endDate: ant.endDate.split('T')[0],
        });
      }
    }

    return results;
  }
}

export class PratyantardashaForecastEngine {
  public static getPratyantardashaForDate(
    context: CanonicalPredictionContext,
    date: Date
  ): PratyantardashaPeriod {
    const moon = context.planetaryPositions.find((p) => p.name === 'Moon');
    const moonLon = moon ? moon.siderealLongitude : 0;
    const birthDate = new Date(context.birthDate + 'T' + context.birthTime + 'Z');
    const res = calculateVimshottariDasha(moonLon, birthDate, date);
    return res.currentPratyantardasha;
  }
}
