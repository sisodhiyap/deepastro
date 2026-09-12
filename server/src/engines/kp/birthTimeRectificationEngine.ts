/**
 * KP Birth Time Rectification Engine — RULESET_RECTIFICATION_V1
 * Algorithmic candidate-generation and CSL event-correlation analysis.
 *
 * Invariants:
 * - Rectification is an astrological inference, NOT a scientific certainty.
 * - Always returns a Best-Fit Time Window and Sensitivity Score.
 * - Explains the Cuspal Sub-Lord shifts across time boundaries.
 */

import { getUtcDateFromLocal, getJulianDayFromDate } from '../../astrology/astronomyMath.js';
import { calculateAllPlanets } from '../../astrology/PlanetEngine.js';
import { calculateVimshottariDasha } from '../../astrology/DashaEngine.js';
import { KPCuspEngine } from './kpCuspEngine.js';
import { KPPlanetaryTableEngine } from './kpPlanetaryTable.js';
import { FourLevelSignificatorsEngine } from '../significators/fourLevelSignificators.js';
import { KPEventPromiseEngine } from '../eventPrediction/kpEventPromiseEngine.js';
import { LifeEventDomain } from '../eventPrediction/eventRulesRegistry.js';
import { KPAyanamsaType } from './kpConfig.js';

export interface KnownLifeEventInput {
  domain: LifeEventDomain;
  eventDate: string; // "YYYY-MM-DD"
  description?: string;
}

export interface CandidateTimeScore {
  candidateTime: string; // "HH:mm:ss"
  offsetMinutes: number;
  score: number; // 0-100
  ascendantDegree: number;
  ascendantSubLord: string;
  matchedEventsCount: number;
  totalEventsCount: number;
  eventMatchDetails: Array<{
    domain: LifeEventDomain;
    status: string;
    score: number;
    reason: string;
  }>;
}

export interface RectificationResult {
  nominalBirthTime: string;
  searchWindowMinutes: number;
  bestFitWindow: {
    recommendedTime: string;
    windowStart: string;
    windowEnd: string;
    confidence: number;
  };
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  topCandidates: CandidateTimeScore[];
  methodologyNotes: string[];
}

export class BirthTimeRectificationEngine {
  /**
   * Evaluates candidate birth times around the nominal time against known events
   */
  public static rectify(params: {
    birthDate: string; // "YYYY-MM-DD"
    birthTime: string; // "HH:mm" or "HH:mm:ss"
    latitude: number;
    longitude: number;
    timezone: number;
    knownEvents: KnownLifeEventInput[];
    windowMinutes?: number; // e.g. 30 (+/- 15 min)
    stepSeconds?: number;   // e.g. 60 sec
    ayanamsaType?: KPAyanamsaType;
  }): RectificationResult {
    const {
      birthDate,
      birthTime,
      latitude,
      longitude,
      timezone,
      knownEvents,
      windowMinutes = 30,
      stepSeconds = 60,
      ayanamsaType = 'KP_NEW',
    } = params;

    const [year, month, day] = birthDate.split('-').map(Number);
    const timeParts = birthTime.split(':').map(Number);
    const hour = timeParts[0];
    const minute = timeParts[1];
    const second = timeParts[2] || 0;

    const nominalMinutesTotal = hour * 60 + minute + second / 60.0;
    const halfWindow = windowMinutes / 2.0;

    const startMin = Math.max(0, nominalMinutesTotal - halfWindow);
    const endMin = Math.min(1439, nominalMinutesTotal + halfWindow);

    const candidates: CandidateTimeScore[] = [];

    for (let currentMin = startMin; currentMin <= endMin; currentMin += stepSeconds / 60.0) {
      const cHour = Math.floor(currentMin / 60);
      const cMin = Math.floor(currentMin % 60);
      const cSec = Math.round((currentMin * 60) % 60);
      const cTimeStr = `${cHour.toString().padStart(2, '0')}:${cMin.toString().padStart(2, '0')}:${cSec.toString().padStart(2, '0')}`;

      const utcDate = getUtcDateFromLocal({ year, month, day, hour: cHour, minute: cMin, second: cSec }, timezone);
      const jd = getJulianDayFromDate(utcDate);

      // Compute Cusps
      const cusps = KPCuspEngine.calculateKPCusps({ jd, latitude, longitude, ayanamsaType });
      const ascCusp = cusps[0];

      // Compute Planets & Significators
      const rawPlanets = calculateAllPlanets(jd, ascCusp.longitude);
      const kpPlanets = KPPlanetaryTableEngine.calculateTable({ planets: rawPlanets, cusps, jd, ayanamsaType });
      const significators = FourLevelSignificatorsEngine.calculateSignificators(kpPlanets, cusps);

      let totalScore = 0;
      let matchedCount = 0;
      const matchDetails: CandidateTimeScore['eventMatchDetails'] = [];

      for (const ev of knownEvents) {
        const evalPromise = KPEventPromiseEngine.evaluateDomain({
          domain: ev.domain,
          cusps,
          significators,
        });

        let eventScore = 0;
        if (evalPromise.status === 'PROMISED') {
          eventScore = 100;
          matchedCount++;
        } else if (evalPromise.status === 'FAVORABLE') {
          eventScore = 80;
          matchedCount++;
        } else if (evalPromise.status === 'DELAYED') {
          eventScore = 55;
          matchedCount += 0.5;
        } else if (evalPromise.status === 'MIXED') {
          eventScore = 40;
        } else {
          eventScore = 10;
        }

        totalScore += eventScore;
        matchDetails.push({
          domain: ev.domain,
          status: evalPromise.status,
          score: eventScore,
          reason: `Cusp ${evalPromise.primaryCusp} Sub-Lord ${evalPromise.cuspSubLord} status is ${evalPromise.status}.`,
        });
      }

      const avgScore = knownEvents.length > 0 ? Math.round(totalScore / knownEvents.length) : 50;
      candidates.push({
        candidateTime: cTimeStr,
        offsetMinutes: Math.round((currentMin - nominalMinutesTotal) * 10) / 10,
        score: avgScore,
        ascendantDegree: Math.round(ascCusp.longitude * 10000) / 10000,
        ascendantSubLord: ascCusp.subLord,
        matchedEventsCount: matchedCount,
        totalEventsCount: knownEvents.length,
        eventMatchDetails: matchDetails,
      });
    }

    candidates.sort((a, b) => b.score - a.score);

    const top = candidates[0] || {
      candidateTime: birthTime,
      offsetMinutes: 0,
      score: 50,
      ascendantDegree: 0,
      ascendantSubLord: 'Unknown',
      matchedEventsCount: 0,
      totalEventsCount: knownEvents.length,
      eventMatchDetails: [],
    };

    // Calculate sensitivity: how many different Ascendant Sub-Lords appeared in the search range
    const uniqueSubLords = new Set(candidates.map((c) => c.ascendantSubLord));
    const sensitivity = uniqueSubLords.size >= 5 ? 'CRITICAL' : uniqueSubLords.size >= 3 ? 'HIGH' : uniqueSubLords.size >= 2 ? 'MEDIUM' : 'LOW';

    return {
      nominalBirthTime: birthTime,
      searchWindowMinutes: windowMinutes,
      bestFitWindow: {
        recommendedTime: top.candidateTime,
        windowStart: candidates[Math.max(0, Math.min(2, candidates.length - 1))].candidateTime,
        windowEnd: top.candidateTime,
        confidence: Math.min(0.92, 0.45 + (top.score / 100) * 0.45),
      },
      sensitivity,
      topCandidates: candidates.slice(0, 5),
      methodologyNotes: [
        'Evaluated Cuspal Sub-Lord promise across candidate temporal increments.',
        `Identified ${uniqueSubLords.size} distinct Ascendant sub-lord boundaries within +/- ${halfWindow} minutes.`,
        'Results represent astrological pattern fit, not deterministic historical fact.',
      ],
    };
  }
}
