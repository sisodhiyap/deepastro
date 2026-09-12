/**
 * Historical Mundane Inception Charts Engine
 * Precision calculation for national and market inception benchmarks:
 * - India Republic (1950-01-26, 10:18 AM IST, New Delhi)
 * - National Stock Exchange (NSE) (1992-11-27, 10:00 AM IST, Mumbai)
 * - Bombay Stock Exchange (BSE) (1875-07-09, 10:30 AM LMT, Mumbai)
 * - US Independence (1776-07-04, 17:10 LMT, Philadelphia)
 */

import { VedicAstroEngine, BirthProfileInput } from '../../astrology/VedicAstroEngine.js';
import { WesternEngine, WesternChartOutput } from '../western/westernEngine.js';

export interface MundaneEntity {
  id: 'india_republic' | 'nse_inception' | 'bse_inception' | 'us_independence';
  name: string;
  category: 'Nation' | 'Exchange' | 'Index';
  historicalDate: string;
  historicalTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
  description: string;
  vedicChart?: any;
  westernChart?: WesternChartOutput;
}

export const MUNDANE_BENCHMARKS: Record<string, Omit<MundaneEntity, 'vedicChart' | 'westernChart'>> = {
  india_republic: {
    id: 'india_republic',
    name: 'Republic of India Inception',
    category: 'Nation',
    historicalDate: '1950-01-26',
    historicalTime: '10:18',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    description: 'Promulgation of the Constitution of India; establishes the sovereign Republic foundation chart.'
  },
  nse_inception: {
    id: 'nse_inception',
    name: 'National Stock Exchange (NSE) Incorporation',
    category: 'Exchange',
    historicalDate: '1992-11-27',
    historicalTime: '10:00',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
    description: 'Incorporation of the National Stock Exchange of India, marking modern electronic equities trading.'
  },
  bse_inception: {
    id: 'bse_inception',
    name: 'Bombay Stock Exchange (BSE) Foundation',
    category: 'Exchange',
    historicalDate: '1875-07-09',
    historicalTime: '10:30',
    latitude: 18.9298,
    longitude: 72.8333,
    timezone: 'Asia/Kolkata',
    description: 'The Native Share & Stock Brokers Association (BSE) foundation under the Banyan tree in Mumbai.'
  },
  us_independence: {
    id: 'us_independence',
    name: 'United States Declaration of Independence',
    category: 'Nation',
    historicalDate: '1776-07-04',
    historicalTime: '17:10',
    latitude: 39.9526,
    longitude: -75.1652,
    timezone: 'America/New_York',
    description: 'Declaration of Independence in Philadelphia; widely used standard mundane chart for US sovereign dynamics.'
  }
};

export class MundaneChartsEngine {
  public static getBenchmarkChart(id: keyof typeof MUNDANE_BENCHMARKS): MundaneEntity {
    const raw = MUNDANE_BENCHMARKS[id];
    if (!raw) throw new Error('Unknown mundane benchmark: ' + String(id));

    const [y, m, d] = raw.historicalDate.split('-').map(Number);
    const [hh, mm] = raw.historicalTime.split(':').map(Number);
    // Create Date object in UTC
    const dateObj = new Date(Date.UTC(y, m - 1, d, hh, mm));

    // Calculate Vedic Sidereal Chart
    const tzOffset = raw.timezone === 'America/New_York' ? -5.0 : 5.5;
    const vedicInput: BirthProfileInput = {
      name: raw.name,
      birthDate: raw.historicalDate,
      birthTime: raw.historicalTime,
      birthPlace: raw.name,
      latitude: raw.latitude,
      longitude: raw.longitude,
      timezone: tzOffset
    };
    const vedicChart = VedicAstroEngine.calculateKundli(vedicInput);

    // Calculate Western Tropical Chart
    const westernChart = WesternEngine.calculateChart(dateObj, raw.latitude, raw.longitude, 'Placidus');

    return {
      ...raw,
      vedicChart,
      westernChart
    };
  }

  public static listAllBenchmarks(): Array<Omit<MundaneEntity, 'vedicChart' | 'westernChart'>> {
    return Object.values(MUNDANE_BENCHMARKS);
  }
}
