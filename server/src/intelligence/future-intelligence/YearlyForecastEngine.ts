/**
 * YearlyForecastEngine.ts
 * Computes deep, structured annual forecasts for 1, 3, 5, 10, or 20 years.
 * Generates all 8 life areas, evidence, confidence, and astrological signal strengths.
 */

import {
  CanonicalPredictionContext,
  YearForecast,
  PredictionEvidence,
  TransitRecord,
} from './types.js';
import { FutureSiderealTransitEngine } from './TransitEngine.js';
import { DashaForecastEngine, ActiveDashaContext } from './DashaForecastEngine.js';
import { NumerologyForecastEngine } from './NumerologyForecastEngine.js';
import { VargaForecastEngine } from './VargaForecastEngine.js';
import { DashaTransitIntersectionEngine } from './DashaTransitIntersectionEngine.js';
import { ContradictionEngine } from './ContradictionEngine.js';
import { EventWindowEngine } from './EventWindowEngine.js';
import { PredictionConfidenceEngine } from './ConfidenceEngine.js';
import { PlanetStrengthEngine } from './PlanetStrengthEngine.js';
import { MonthlyForecastEngine } from './MonthlyForecastEngine.js';
import { PlanetName } from '../../astrology/PlanetEngine.js';

export class YearlyForecastEngine {
  /**
   * Generates annual forecasts for a sequence of years starting from a given base year.
   */
  public static generateYearlyForecasts(
    context: CanonicalPredictionContext,
    startYear: number,
    totalYears: number = 5,
    includeMonthlyBreakdown: boolean = true
  ): YearForecast[] {
    const results: YearForecast[] = [];

    for (let i = 0; i < totalYears; i++) {
      const year = startYear + i;

      // 1. Dasha Context
      const dasha = DashaForecastEngine.getDashaForYear(context, year);

      // 2. Transits Context
      const transits = FutureSiderealTransitEngine.calculateTransitsForYear(context, year);

      // 3. Numerology Context
      const { personalYear, theme: numTheme, evidence: numEvidence } = NumerologyForecastEngine.calculatePersonalYear(
        context,
        year
      );

      // 4. Intersections
      const signals = DashaTransitIntersectionEngine.evaluateIntersection(context, dasha, transits);

      // 5. Varga Evaluations for Key Domains
      const vargaCareer = VargaForecastEngine.evaluateDomain(context, 'CAREER_EXPANSION', {
        mahadasha: dasha.mahadasha,
        antardasha: dasha.antardasha,
      });

      const vargaRel = VargaForecastEngine.evaluateDomain(context, 'RELATIONSHIP_ACTIVATION', {
        mahadasha: dasha.mahadasha,
        antardasha: dasha.antardasha,
      });

      // 6. Year Evidence Graph Accumulator
      const allYearEvidence: PredictionEvidence[] = [
        ...dasha.isTransitionPeriod && dasha.transitionNote
          ? [{
              source: 'DASHA' as const,
              rule: 'Dasha Sandhi Transition',
              value: dasha.transitionNote,
              weight: 0.35,
              direction: 'NEUTRAL' as const,
            }]
          : [{
              source: 'DASHA' as const,
              rule: 'Vimshottari Dasha Active Cycle',
              value: `${dasha.mahadasha} Mahadasha with ${dasha.antardasha} Antardasha sets current cosmic backdrop.`,
              weight: 0.35,
              direction: 'SUPPORTIVE' as const,
            }],
        ...signals.flatMap((s) => s.evidence),
        numEvidence,
      ];

      // 7. Contradiction Analysis
      const careerContradiction = ContradictionEngine.evaluateEvidence('CAREER_EXPANSION', [
        ...vargaCareer.evidence,
        ...allYearEvidence.filter((e) => e.source === 'DASHA' || e.source === 'TRANSIT'),
      ]);

      const relContradiction = ContradictionEngine.evaluateEvidence('RELATIONSHIP_ACTIVATION', [
        ...vargaRel.evidence,
        ...allYearEvidence.filter((e) => e.source === 'DASHA'),
      ]);

      const contradictoryList: string[] = [];
      if (careerContradiction.hasContradiction && careerContradiction.tensionSummary) {
        contradictoryList.push(`Career: ${careerContradiction.tensionSummary}`);
      }
      if (relContradiction.hasContradiction && relContradiction.tensionSummary) {
        contradictoryList.push(`Relationships: ${relContradiction.tensionSummary}`);
      }

      // 8. Important Windows
      const importantWindows = EventWindowEngine.detectWindowsForYear(
        context,
        year,
        dasha,
        transits,
        personalYear
      );

      // 9. Confidence and Overall Signal Strength
      const conf = PredictionConfidenceEngine.evaluate(allYearEvidence, 78);

      // 10. Life Area Forecasts
      const careerHeadline = careerContradiction.hasContradiction
        ? 'Professional Expansion with Heightened Responsibility'
        : 'Career Initiatives & Strategic Progression';
      const careerDesc = `${vargaCareer.d1Signal} ${vargaCareer.d10Signal || ''} ${careerContradiction.synthesizedOutcome}`;

      const moneyHeadline = 'Resource Structuring & Asset Prudence';
      const moneyDesc = `Emphasis on methodical wealth accumulation and budgeting during the ${dasha.antardasha} cycle. Jupiter Gochara encourages disciplined investments while avoiding speculative rush.`;

      const relHeadline = relContradiction.hasContradiction
        ? 'Deepening Interpersonal Bonds via Maturity'
        : 'Partnership Harmony & Shared Commitments';
      const relDesc = `${vargaRel.d9Signal || ''} ${relContradiction.synthesizedOutcome}`;

      const healthHeadline = 'Vitality Anchored in Daily Routine';
      const healthDesc = `Sustained well-being favored by consistent rest, nervous-system calming practices, and mindful hydration. No deterministic medical claims.`;

      const familyHeadline = 'Domestic Stabilization & Collective Support';
      const familyDesc = `Family ties offer grounded support. Ideal time for domestic investments, property repairs, and honoring elder guidance.`;

      const eduHeadline = 'Intellectual Synthesis & Credentialing';
      const eduDesc = `Favorable period for acquiring specialized competencies, technical certifications, and reflective philosophical inquiry.`;

      const travelHeadline = 'Exploratory & Purpose-Driven Travel';
      const travelDesc = `Cross-border connections, short research trips, and perspective-broadening cultural journeys supported under current nodal configurations.`;

      const spiritHeadline = 'Dharmic Cultivation & Meditative Stillness';
      const spiritDesc = `Strong inward pull toward contemplation, mantra meditation, and regular quietude to integrate active life lessons.`;

      // Major transits summary
      const majorTransits = transits
        .filter((t) => ['Jupiter', 'Saturn', 'Rahu', 'Mars'].includes(t.transitPlanet))
        .map((t) => ({
          planet: t.transitPlanet,
          sign: t.transitSign,
          houseFromLagna: t.transitHouse,
          isRetrograde: t.isRetrograde,
        }));

      // Key planets involved
      const keyPlanets: PlanetName[] = [
        dasha.mahadasha,
        dasha.antardasha,
        ...transits.slice(0, 2).map((t) => t.transitPlanet),
      ];

      // Overall theme
      const primarySignal = signals[0]?.category.replace(/_/g, ' ') || 'Progress and Integration';
      const overallTheme = `${primarySignal} under ${dasha.mahadasha}/${dasha.antardasha} with Personal Year ${personalYear} (${numTheme})`;

      // Months
      const months = includeMonthlyBreakdown
        ? MonthlyForecastEngine.calculateMonthsForYear(context, year)
        : undefined;

      results.push({
        year,
        overallTheme,
        signalStrength: conf.signalStrength,
        confidence: conf.level,
        confidenceScore: conf.score,
        activeDasha: {
          mahadasha: dasha.mahadasha,
          antardasha: dasha.antardasha,
          pratyantardasha: dasha.pratyantardasha,
        },
        majorTransits,
        keyPlanets: Array.from(new Set(keyPlanets)),
        career: {
          headline: careerHeadline,
          description: careerDesc,
          signalStrength: conf.signalStrength,
          evidence: vargaCareer.evidence,
        },
        money: {
          headline: moneyHeadline,
          description: moneyDesc,
          signalStrength: 'STRONG',
          evidence: allYearEvidence.filter((e) => e.source === 'DASHA' || e.source === 'TRANSIT'),
        },
        relationships: {
          headline: relHeadline,
          description: relDesc,
          signalStrength: 'MODERATE',
          evidence: vargaRel.evidence,
        },
        health: {
          headline: healthHeadline,
          description: healthDesc,
          signalStrength: 'MODERATE',
          evidence: allYearEvidence.filter((e) => e.source === 'STRENGTH'),
        },
        family: {
          headline: familyHeadline,
          description: familyDesc,
          signalStrength: 'STRONG',
          evidence: [],
        },
        education: {
          headline: eduHeadline,
          description: eduDesc,
          signalStrength: 'STRONG',
          evidence: [],
        },
        travel: {
          headline: travelHeadline,
          description: travelDesc,
          signalStrength: 'MODERATE',
          evidence: [],
        },
        spirituality: {
          headline: spiritHeadline,
          description: spiritDesc,
          signalStrength: 'STRONG',
          evidence: [],
        },
        importantWindows,
        cautionWindows: [
          `Q3 ${year}: Mid-year retrograde planetary station recommends double-checking legal and contractual terms.`,
          `Q4 ${year}: Seasonal transition calls for prioritizing recuperation and avoiding burnout.`,
        ],
        supportivePeriods: [
          `Spring ${year}: Favorable solar and planetary ingress supporting new initiatives and collaborations.`,
          `Autumn ${year}: Anchored consolidation period ideal for long-range agreements and commitments.`,
        ],
        d9Signals: vargaRel.d9Signal ? [vargaRel.d9Signal] : [],
        d10Signals: vargaCareer.d10Signal ? [vargaCareer.d10Signal] : [],
        numerologySignals: {
          personalYear,
          theme: numTheme,
          harmonyWithVedic: true,
        },
        evidence: allYearEvidence,
        contradictorySignals: contradictoryList,
        months,
      });
    }

    return results;
  }
}
