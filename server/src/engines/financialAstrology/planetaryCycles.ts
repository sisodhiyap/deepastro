/**
 * Macro Planetary Cycles Engine
 * Computes major astrological cycles known in mundane financial research:
 * - Jupiter-Saturn Synodic Cycle (approx 19.86 years between conjunctions)
 * - Rahu-Ketu Nodal Axis Cycle (approx 18.6 years full nodal revolution)
 * - Solar & Lunar Eclipses (Surya & Chandra Grahan)
 * - Major Ingress Windows (Saturn, Jupiter, Rahu/Ketu crossing rashi boundaries)
 */

import Astronomy from '../../astrology/astronomyBridge.js';
import { normalizeDegrees, getJulianDayFromDate } from '../../astrology/astronomyMath.js';

export interface PlanetaryCycleEvent {
  cycleName: string;
  eventType: 'Conjunction' | 'Opposition' | 'Ingress' | 'Eclipse';
  bodies: string[];
  approximateDate: string;
  angularSeparation: number;
  traditionalTheme: string;
  historicalEconomicContext: string;
}

export interface EclipseWindow {
  type: 'Solar' | 'Lunar';
  date: string;
  signSidereal: string;
  signTropical: string;
  visibilityRegion: string;
  traditionalTheme: string;
}

export class PlanetaryCyclesEngine {
  public static getCurrentCycles(currentDate: Date = new Date()): {
    jupiterSaturnCycle: {
      separationDegrees: number;
      phase: 'Waxing Crescent' | 'First Quarter' | 'Gibbous' | 'Opposition' | 'Waning' | 'Conjunction';
      nextExactAspect: string;
      traditionalSignificance: string;
    };
    nodalAxis: {
      rahuSiderealRashi: string;
      ketuSiderealRashi: string;
      transitTheme: string;
    };
    recentAndUpcomingEclipses: EclipseWindow[];
    activeIngresses: PlanetaryCycleEvent[];
  } {
    const astroTime = Astronomy.MakeTime(currentDate);

    // Compute Jupiter and Saturn longitudes
    const jupLon = normalizeDegrees(Astronomy.EclipticLongitude(Astronomy.Body.Jupiter, astroTime));
    const satLon = normalizeDegrees(Astronomy.EclipticLongitude(Astronomy.Body.Saturn, astroTime));

    let sep = jupLon - satLon;
    if (sep < 0) sep += 360;

    let phase: 'Waxing Crescent' | 'First Quarter' | 'Gibbous' | 'Opposition' | 'Waning' | 'Conjunction' = 'Waxing Crescent';
    if (sep < 15 || sep > 345) phase = 'Conjunction';
    else if (sep >= 15 && sep < 80) phase = 'Waxing Crescent';
    else if (sep >= 80 && sep < 100) phase = 'First Quarter';
    else if (sep >= 100 && sep < 170) phase = 'Gibbous';
    else if (sep >= 170 && sep < 190) phase = 'Opposition';
    else phase = 'Waning';

    // Sidereal Nodal Axis (approximate sidereal positions)
    const jd = getJulianDayFromDate(currentDate);
    const T = (jd - 2451545.0) / 36525;
    const tropicalNode = normalizeDegrees(125.04452 - 1934.136261 * T);
    const lahiri = 24.18; // Current epoch approximate Lahiri ayanamsa
    const siderealRahu = normalizeDegrees(tropicalNode - lahiri);
    const siderealKetu = normalizeDegrees(siderealRahu + 180);

    const RASHI_NAMES = [
      'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
      'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
      'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
    ];

    const rahuRashi = RASHI_NAMES[Math.floor(siderealRahu / 30)];
    const ketuRashi = RASHI_NAMES[Math.floor(siderealKetu / 30)];

    const recentAndUpcomingEclipses: EclipseWindow[] = [
      {
        type: 'Solar',
        date: '2026-02-17',
        signSidereal: 'Kumbha (Aquarius)',
        signTropical: 'Pisces',
        visibilityRegion: 'Southern Oceans, Antarctica, South America',
        traditionalTheme: 'Traditional associations flag volatility in high-tech infrastructure and energy grid sovereign reserves.'
      },
      {
        type: 'Lunar',
        date: '2026-03-03',
        signSidereal: 'Simha (Leo)',
        signTropical: 'Virgo',
        visibilityRegion: 'Asia, Australia, Pacific, Americas',
        traditionalTheme: 'Traditional symbolism suggests emotional shifts in sovereign leadership sentiment and sovereign debt yields.'
      },
      {
        type: 'Solar',
        date: '2026-08-12',
        signSidereal: 'Karka (Cancer)',
        signTropical: 'Leo',
        visibilityRegion: 'North America, Europe, Arctic',
        traditionalTheme: 'Traditional texts link Cancer/Leo boundary eclipses with agricultural commodities and coastal shipping flows.'
      }
    ];

    const activeIngresses: PlanetaryCycleEvent[] = [
      {
        cycleName: 'Saturn Transit through Pisces (Meena)',
        eventType: 'Ingress',
        bodies: ['Saturn'],
        approximateDate: '2025-03-29 to 2027-10-19',
        angularSeparation: 0,
        traditionalTheme: 'Structural dissolution of legacy debt models; restructuring in marine transport, pharmaceutical regulation, and water assets.',
        historicalEconomicContext: 'Saturn in Pisces historically coincides with banking liquidity reassessments and sovereign credit realignments.'
      },
      {
        cycleName: 'Jupiter Ingress into Gemini (Mithuna)',
        eventType: 'Ingress',
        bodies: ['Jupiter'],
        approximateDate: '2026-06-02',
        angularSeparation: 0,
        traditionalTheme: 'Rapid expansion in communications, digital commerce, educational technologies, and micro-transaction volumes.',
        historicalEconomicContext: 'Jupiter through Mercury-ruled Gemini traditionally stimulates trade velocity and cross-border commercial protocols.'
      }
    ];

    return {
      jupiterSaturnCycle: {
        separationDegrees: Number(sep.toFixed(2)),
        phase,
        nextExactAspect: '2030 (Opposition Phase)',
        traditionalSignificance: 'The ~20-year synodic cycle historically observed in mundane studies as marking macro socioeconomic paradigm shifts.'
      },
      nodalAxis: {
        rahuSiderealRashi: rahuRashi,
        ketuSiderealRashi: ketuRashi,
        transitTheme: 'Nodal transits highlight sectors undergoing speculative disruption (Rahu) versus consolidation and clinical scrutiny (Ketu).'
      },
      recentAndUpcomingEclipses,
      activeIngresses
    };
  }
}
