/**
 * Life Replay Engine V2 (LifeReplayEngineV2)
 * Assembles unified longitudinal timeline across:
 * BIRTH -> LIFE EVENTS -> DASHA PERIODS -> TRANSITS -> USER-CONFIRMED EVENTS -> PREDICTIONS -> OUTCOMES
 *
 * Epistemological Rule:
 * Identifies temporal correlations and classical associations.
 * STRICTLY BARS CLAIMS OF SCIENTIFIC CAUSATION.
 */

import { RealUserOnboardingService } from '../services/RealUserOnboardingService.js';
import { LifeContextGraphV2, LifeContextNodeV2 } from '../intelligence/LifeContextGraphV2.js';
import { PredictionLedgerV2, PredictionLedgerV2Entry } from './PredictionLedgerV2.js';
import { PredictionOutcomeService, StoredOutcomeRecord } from './PredictionOutcomeService.js';
import { VedicAstroEngine } from '../astrology/VedicAstroEngine.js';

export interface TimelineEntry {
  timestamp: string;
  category: 'BIRTH' | 'CONFIRMED_LIFE_EVENT' | 'DASHA_PERIOD' | 'TRANSIT_ALIGNMENT' | 'PREDICTION' | 'OUTCOME';
  title: string;
  description: string;
  correlationNote: string;
  provenance: {
    sourceId: string;
    isUserConfirmed: boolean;
  };
}

export class LifeReplayEngineV2 {
  public static buildReplayTimeline(userId: string): {
    userId: string;
    timeline: TimelineEntry[];
    disclosures: string[];
  } {
    const profile = RealUserOnboardingService.getLatestProfile(userId);
    const timeline: TimelineEntry[] = [];
    const disclosures = [
      'Temporal alignments demonstrate chronological overlap, NOT scientific causation.',
      'Traditional Jyotish interpretation associates planetary periods with life themes, but personal volition and world circumstances are primary.',
    ];

    if (!profile) {
      return { userId, timeline: [], disclosures };
    }

    // 1. Birth Marker
    timeline.push({
      timestamp: `${profile.dateOfBirth}T${profile.timeOfBirth}`,
      category: 'BIRTH',
      title: `Natal Genesis (${profile.name})`,
      description: `Birth recorded at ${profile.birthPlace} with ${profile.confidence.tier} confidence.`,
      correlationNote: 'Foundational baseline for sidereal planetary and divisional calculations.',
      provenance: {
        sourceId: profile.calculationPassport.fingerprint,
        isUserConfirmed: true,
      },
    });

    // 2. Dasha Periods (Calculated deterministically)
    const calcResult = VedicAstroEngine.calculateKundli({
      name: profile.name,
      birthDate: profile.dateOfBirth,
      birthTime: profile.timeOfBirth,
      birthPlace: profile.birthPlace,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
      gender: profile.gender,
      isApproximateTime: profile.birthTimePrecision !== 'EXACT',
    });

    const dasha = calcResult.dashas;
    if (dasha && dasha.allMahadashas) {
      for (const p of dasha.allMahadashas.slice(0, 5)) {
        timeline.push({
          timestamp: `${p.startDate}T00:00:00Z`,
          category: 'DASHA_PERIOD',
          title: `Vimshottari Mahadasha: ${p.planet}`,
          description: `Major planetary phase spanning from ${p.startDate} to ${p.endDate}.`,
          correlationNote: `Traditional Jyotish interpretation associates the ${p.planet} period with the houses and karakatvas ruled by ${p.planet}.`,
          provenance: {
            sourceId: 'SRC_BPHS_VIMSHOTTARI',
            isUserConfirmed: true,
          },
        });
      }
    }

    // 3. User-Confirmed Life Events
    const confirmedEvents = LifeContextGraphV2.getFactualContext(userId);
    for (const event of confirmedEvents) {
      timeline.push({
        timestamp: event.eventDate ? `${event.eventDate}T12:00:00Z` : event.createdAt,
        category: 'CONFIRMED_LIFE_EVENT',
        title: `[${event.domain}] ${event.title}`,
        description: event.description || 'User-confirmed historical event.',
        correlationNote: 'Recorded event coincides chronologically with active planetary dasha cycle.',
        provenance: {
          sourceId: event.nodeId,
          isUserConfirmed: true,
        },
      });
    }

    // 4. Predictions & Outcomes
    const predictions = PredictionLedgerV2.getUserPredictions(userId);
    const outcomes = PredictionOutcomeService.getUserOutcomes(userId);

    for (const pred of predictions) {
      timeline.push({
        timestamp: pred.createdAt,
        category: 'PREDICTION',
        title: `Prediction: ${pred.question}`,
        description: pred.statement,
        correlationNote: `Evaluated under ${pred.methodology} with confidence ${(pred.confidence * 100).toFixed(0)}%.`,
        provenance: {
          sourceId: pred.predictionId,
          isUserConfirmed: false,
        },
      });
    }

    for (const outcome of outcomes) {
      timeline.push({
        timestamp: outcome.recordedAt,
        category: 'OUTCOME',
        title: `Outcome Logged: ${outcome.outcome}`,
        description: outcome.userNotes || `User recorded outcome state: ${outcome.outcome}`,
        correlationNote: 'Voluntarily reported user observation utilized in calibration scoring.',
        provenance: {
          sourceId: outcome.outcomeId,
          isUserConfirmed: true,
        },
      });
    }

    // Sort chronologically
    timeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return {
      userId,
      timeline,
      disclosures,
    };
  }
}
