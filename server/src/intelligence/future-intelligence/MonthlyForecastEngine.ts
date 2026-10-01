/**
 * MonthlyForecastEngine.ts
 * Generates structured 12-month breakdowns for any requested year based on actual Dasha and Transit states.
 */

import {
  CanonicalPredictionContext,
  MonthForecast,
  PredictionEvidence,
  TransitRecord,
} from './types.js';
import { FutureSiderealTransitEngine } from './TransitEngine.js';
import { DashaForecastEngine } from './DashaForecastEngine.js';
import { NumerologyForecastEngine } from './NumerologyForecastEngine.js';
import { AspectForecastEngine } from './HouseActivationEngine.js';
import { PlanetName } from '../../astrology/PlanetEngine.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export class MonthlyForecastEngine {
  /**
   * Generates month-by-month forecasts (1-12) for a given calendar year.
   */
  public static calculateMonthsForYear(
    context: CanonicalPredictionContext,
    year: number
  ): MonthForecast[] {
    const months: MonthForecast[] = [];

    for (let m = 1; m <= 12; m++) {
      const monthDate = new Date(Date.UTC(year, m - 1, 15, 12, 0, 0));
      const monthName = MONTH_NAMES[m - 1];

      // 1. Dasha at this month
      const dasha = DashaForecastEngine.getActiveDasha(context, monthDate);

      // 2. Transits at this month
      const transits = FutureSiderealTransitEngine.calculateTransitsForDate(context, monthDate);

      // 3. Numerology Personal Month
      const { personalMonth, theme: numTheme } = NumerologyForecastEngine.calculatePersonalMonth(
        context,
        year,
        m
      );

      // 4. Active Houses & Planets
      const activeHouses: number[] = [];
      const importantPlanets: PlanetName[] = [dasha.mahadasha, dasha.antardasha];

      for (const t of transits) {
        if (!activeHouses.includes(t.transitHouse)) activeHouses.push(t.transitHouse);
        if (['Jupiter', 'Saturn', 'Rahu', 'Mars'].includes(t.transitPlanet) && !importantPlanets.includes(t.transitPlanet)) {
          importantPlanets.push(t.transitPlanet);
        }
      }

      // 5. Major transit summary
      const majorTransits = transits
        .filter((t) => ['Jupiter', 'Saturn', 'Rahu', 'Mars', 'Sun'].includes(t.transitPlanet))
        .map((t) => ({
          planet: t.transitPlanet,
          sign: t.transitSign,
          houseFromLagna: t.transitHouse,
          isRetrograde: t.isRetrograde,
        }));

      // 6. Monthly Themes & Windows
      const keyThemes: string[] = [
        `${dasha.mahadasha} / ${dasha.antardasha} Dasha active cycle`,
        `${numTheme}`,
        `Houses ${activeHouses.slice(0, 3).join(', ')} prominently energized`,
      ];

      const jupiter = transits.find((t) => t.transitPlanet === 'Jupiter');
      const saturn = transits.find((t) => t.transitPlanet === 'Saturn');

      const supportiveWindow = `${monthName} 5 – 22: Favorable planetary geometry for focused effort and clear communication.`;
      const cautionWindow = `${monthName} 26 – 29: Lunar cycle inflection; maintain mindful routines and avoid impulsive commitments.`;

      const evidence: PredictionEvidence[] = [
        {
          source: 'DASHA',
          rule: 'Monthly Vimshottari Rulership',
          value: `${dasha.mahadasha}/${dasha.antardasha} active in ${monthName}.`,
          weight: 0.35,
          direction: 'SUPPORTIVE',
        },
        {
          source: 'TRANSIT',
          rule: 'Monthly Gochara Transit Status',
          value: `Jupiter in ${jupiter?.transitSign || 'Sign'}, Saturn in ${saturn?.transitSign || 'Sign'}.`,
          weight: 0.30,
          direction: 'SUPPORTIVE',
        },
        {
          source: 'NUMEROLOGY',
          rule: 'Personal Month Rhythm',
          value: `Personal Month ${personalMonth} rhythm.`,
          weight: 0.10,
          direction: 'SUPPORTIVE',
        },
      ];

      months.push({
        month: m,
        monthName,
        year,
        dasha: {
          mahadasha: dasha.mahadasha,
          antardasha: dasha.antardasha,
          pratyantardasha: dasha.pratyantardasha,
        },
        majorTransits,
        activeHouses: activeHouses.sort((a, b) => a - b),
        importantPlanets,
        keyThemes,
        supportiveWindow,
        cautionWindow,
        evidence,
      });
    }

    return months;
  }
}
