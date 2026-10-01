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
import { KPForecastEngine } from './KPForecastEngine.js';
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
      const activeLords = {
        mahadasha: dasha.mahadasha,
        antardasha: dasha.antardasha,
      };

      // 2. Transits Context
      const transits = FutureSiderealTransitEngine.calculateTransitsForYear(context, year);

      // 3. Numerology Context
      const { personalYear, theme: numTheme, evidence: numEvidence } = NumerologyForecastEngine.calculatePersonalYear(
        context,
        year
      );

      // 4. Intersections
      const signals = DashaTransitIntersectionEngine.evaluateIntersection(context, dasha, transits);

      // 5. Multi-Varga & KP Evaluations for ALL 8 Life Domains
      // Domain 1: Career
      const vargaCareer = VargaForecastEngine.evaluateDomain(context, 'CAREER_EXPANSION', activeLords);
      const kpCareer = KPForecastEngine.evaluateDomain(context, 'CAREER_EXPANSION', activeLords, String(year));
      const amk = context.jaimini?.amatyakaraka;
      const jaiminiCareerEvidence: PredictionEvidence[] = amk ? [{
        source: 'JAIMINI',
        rule: 'Jaimini Amatyakaraka Career Guidance',
        value: `Amatyakaraka (AmK) is ${amk.planet} in ${amk.signName}. Guides profession and sustained career trajectory.`,
        weight: 0.15,
        direction: 'SUPPORTIVE',
      }] : [];
      const careerEvidence: PredictionEvidence[] = [
        ...vargaCareer.evidence,
        ...kpCareer.evidence,
        ...jaiminiCareerEvidence,
      ];

      // Domain 2: Money / Finance
      const vargaMoney = VargaForecastEngine.evaluateDomain(context, 'FINANCIAL_FOCUS', activeLords);
      const kpMoney = KPForecastEngine.evaluateDomain(context, 'FINANCIAL_FOCUS', activeLords, String(year));
      const sav2 = context.ashtakavarga?.sarvashtakavarga?.[2] ?? 28;
      const sav11 = context.ashtakavarga?.sarvashtakavarga?.[11] ?? 28;
      const savMoneyEvidence: PredictionEvidence = {
        source: 'ASHTAKAVARGA',
        rule: 'SAV 2nd & 11th House Wealth Potency',
        value: `Sarvashtakavarga points: House 2 (Accumulation) = ${sav2} pts, House 11 (Gains) = ${sav11} pts (${sav11 >= 28 ? 'Auspicious inflow' : 'Structured growth'}).`,
        weight: 0.15,
        direction: sav11 >= 28 ? 'SUPPORTIVE' : 'NEUTRAL',
      };
      const moneyTransits = transits.filter((t) => [2, 11].includes(t.transitHouse));
      const moneyEvidence: PredictionEvidence[] = [
        ...vargaMoney.evidence,
        ...kpMoney.evidence,
        savMoneyEvidence,
        ...moneyTransits.slice(0, 1).map((t) => ({
          source: 'TRANSIT' as const,
          rule: 'Wealth House Transit Trigger',
          value: `${t.transitPlanet} transiting natal House ${t.transitHouse} (${t.transitSign}).`,
          weight: 0.15,
          direction: 'SUPPORTIVE' as const,
        })),
      ];

      // Domain 3: Relationships
      const vargaRel = VargaForecastEngine.evaluateDomain(context, 'RELATIONSHIP_ACTIVATION', activeLords);
      const kpRel = KPForecastEngine.evaluateDomain(context, 'RELATIONSHIP_ACTIVATION', activeLords, String(year));
      const dk = context.jaimini?.darakaraka;
      const jaiminiRelEvidence: PredictionEvidence[] = dk ? [{
        source: 'JAIMINI',
        rule: 'Jaimini Darakaraka Relationship Guidance',
        value: `Darakaraka (DK) is ${dk.planet} in ${dk.signName}. Illuminates partnership evolution and relational commitments.`,
        weight: 0.15,
        direction: 'SUPPORTIVE',
      }] : [];
      const relEvidence: PredictionEvidence[] = [
        ...vargaRel.evidence,
        ...kpRel.evidence,
        ...jaiminiRelEvidence,
      ];

      // Domain 4: Health
      const vargaHealth = VargaForecastEngine.evaluateDomain(context, 'HEALTH_ROUTINE_FOCUS', activeLords);
      const kpHealth = KPForecastEngine.evaluateDomain(context, 'HEALTH_ROUTINE_FOCUS', activeLords, String(year));
      const lagnaLord = context.houseLords?.[1] || 'Mars';
      const lagnaShadbala = context.shadbala?.[lagnaLord];
      const healthEvidence: PredictionEvidence[] = [
        ...vargaHealth.evidence,
        ...kpHealth.evidence,
        lagnaShadbala && typeof lagnaShadbala.totalRupas === 'number' ? {
          source: 'SHADBALA' as const,
          rule: 'Lagna Lord Shadbala Vitality Potency',
          value: `Ascendant lord ${lagnaLord} holds ${lagnaShadbala.totalRupas.toFixed(1)} Rupas (${lagnaShadbala.relativeRank || 1}), anchoring physical constitution and resilience.`,
          weight: 0.15,
          direction: lagnaShadbala.isStrong ? 'SUPPORTIVE' as const : 'NEUTRAL' as const,
        } : {
          source: 'PLANET_STRENGTH' as const,
          rule: 'Ascendant Baseline Vitality',
          value: `Lagna constitution guided by ${context.ascendant.signName} Ascendant.`,
          weight: 0.10,
          direction: 'SUPPORTIVE' as const,
        },
      ];

      // Domain 5: Family & Domestic
      const vargaFamily = VargaForecastEngine.evaluateDomain(context, 'PROPERTY_HOME_FOCUS', activeLords);
      const kpFamily = KPForecastEngine.evaluateDomain(context, 'PROPERTY_HOME_FOCUS', activeLords, String(year));
      const familyTransits = transits.filter((t) => [4, 2].includes(t.transitHouse));
      const familyEvidence: PredictionEvidence[] = [
        ...vargaFamily.evidence,
        ...kpFamily.evidence,
        familyTransits.length > 0 ? {
          source: 'TRANSIT' as const,
          rule: 'Domestic Cusp Gochara Ingress',
          value: `${familyTransits[0].transitPlanet} transiting natal House ${familyTransits[0].transitHouse} (${familyTransits[0].transitSign}) directly influences domestic stability.`,
          weight: 0.15,
          direction: 'SUPPORTIVE' as const,
        } : {
          source: 'HOUSE' as const,
          rule: '4th House Domestic Anchor',
          value: `4th house domestic sphere harmonized under active ${dasha.mahadasha} cycle.`,
          weight: 0.10,
          direction: 'SUPPORTIVE' as const,
        },
      ];

      // Domain 6: Education & Intellect
      const vargaEdu = VargaForecastEngine.evaluateDomain(context, 'EDUCATION_PERIOD', activeLords);
      const kpEdu = KPForecastEngine.evaluateDomain(context, 'EDUCATION_PERIOD', activeLords, String(year));
      const merc = context.d1.find((p) => p.name === 'Mercury');
      const eduEvidence: PredictionEvidence[] = [
        ...vargaEdu.evidence,
        ...kpEdu.evidence,
        {
          source: 'NAKSHATRA' as const,
          rule: 'Vidya Karaka Intellectual Disposition',
          value: `Mercury located in ${merc?.signName || 'Aries'} (Analytical acumen) guides cognitive and educational milestones.`,
          weight: 0.15,
          direction: 'SUPPORTIVE' as const,
        },
      ];

      // Domain 7: Travel & Relocation
      const vargaTravel = VargaForecastEngine.evaluateDomain(context, 'TRAVEL_FOREIGN_CONNECTION', activeLords);
      const kpTravel = KPForecastEngine.evaluateDomain(context, 'TRAVEL_FOREIGN_CONNECTION', activeLords, String(year));
      const travelTransits = transits.filter((t) => [9, 12, 3].includes(t.transitHouse));
      const travelEvidence: PredictionEvidence[] = [
        ...vargaTravel.evidence,
        ...kpTravel.evidence,
        travelTransits.length > 0 ? {
          source: 'TRANSIT' as const,
          rule: 'Long-Distance & Journey Transit Trigger',
          value: `${travelTransits[0].transitPlanet} transiting House ${travelTransits[0].transitHouse} activates geographical horizon expansion.`,
          weight: 0.15,
          direction: 'SUPPORTIVE' as const,
        } : {
          source: 'HOUSE' as const,
          rule: '9th/12th Horizon Resonance',
          value: `Travel impulses aligned with ${dasha.mahadasha} dasha planetary resonance.`,
          weight: 0.10,
          direction: 'SUPPORTIVE' as const,
        },
      ];

      // Domain 8: Spirituality & Dharma
      const vargaSpirit = VargaForecastEngine.evaluateDomain(context, 'SPIRITUAL_DEVELOPMENT', activeLords);
      const kpSpirit = KPForecastEngine.evaluateDomain(context, 'SPIRITUAL_DEVELOPMENT', activeLords, String(year));
      const ak = context.jaimini?.atmakaraka;
      const spiritualEvidence: PredictionEvidence[] = [
        ...vargaSpirit.evidence,
        ...kpSpirit.evidence,
        ak ? {
          source: 'JAIMINI' as const,
          rule: 'Jaimini Atmakaraka Soul Evolution',
          value: `Atmakaraka (AK) is ${ak.planet} in ${ak.signName}. Represents the soul's primary dharmic journey and contemplative depth.`,
          weight: 0.20,
          direction: 'SUPPORTIVE' as const,
        } : {
          source: 'D9' as const,
          rule: 'Dharmic Soul Anchor',
          value: `Inner contemplation anchored by 9th house and Navamsha dispositions.`,
          weight: 0.10,
          direction: 'SUPPORTIVE' as const,
        },
      ];

      // 6. Year Evidence Graph Accumulator (Combining Dasha, Intersections, Numerology, and Domain Evidences)
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
        ...careerEvidence.filter((e) => e.source === 'D10' || e.source === 'KP'),
        ...moneyEvidence.filter((e) => e.source === 'ASHTAKAVARGA' || e.source === 'VARGA'),
        ...relEvidence.filter((e) => e.source === 'D9' || e.source === 'JAIMINI'),
        ...healthEvidence.filter((e) => e.source === 'SHADBALA' || e.source === 'VARGA'),
      ];

      // 7. Contradiction Analysis
      const careerContradiction = ContradictionEngine.evaluateEvidence('CAREER_EXPANSION', [
        ...careerEvidence,
        ...allYearEvidence.filter((e) => e.source === 'DASHA' || e.source === 'TRANSIT'),
      ]);

      const relContradiction = ContradictionEngine.evaluateEvidence('RELATIONSHIP_ACTIVATION', [
        ...relEvidence,
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

      // 10. Life Area Forecasts (Personalized descriptions backed by calculated evidence)
      const careerHeadline = careerContradiction.hasContradiction
        ? 'Professional Expansion with Heightened Responsibility'
        : 'Career Initiatives & Strategic Progression';
      const careerDesc = `${vargaCareer.d1Signal} ${vargaCareer.d10Signal || ''} ${kpCareer.rationale} ${careerContradiction.synthesizedOutcome}`;

      const moneyHeadline = sav11 >= 28 ? 'Resource Expansion & Inflow Momentum' : 'Resource Structuring & Asset Prudence';
      const moneyDesc = `Emphasis on methodical wealth accumulation and budgeting during the ${dasha.antardasha} cycle. ${vargaMoney.specificVargaSignal || ''} ${kpMoney.rationale} SAV House 11 potency (${sav11} pts) advises disciplined allocation.`;

      const relHeadline = relContradiction.hasContradiction
        ? 'Deepening Interpersonal Bonds via Maturity'
        : 'Partnership Harmony & Shared Commitments';
      const relDesc = `${vargaRel.d9Signal || ''} ${kpRel.rationale} ${relContradiction.synthesizedOutcome}`;

      const healthHeadline = 'Vitality Anchored in Daily Routine';
      const healthDesc = `Sustained well-being favored by consistent rest, nervous-system calming practices, and mindful hydration. ${vargaHealth.specificVargaSignal || ''} ${kpHealth.rationale} (No deterministic medical claims).`;

      const familyHeadline = 'Domestic Stabilization & Collective Support';
      const familyDesc = `Family ties offer grounded support. ${vargaFamily.specificVargaSignal || ''} ${kpFamily.rationale} Favorable window for domestic improvements and strengthening household ties.`;

      const eduHeadline = 'Intellectual Synthesis & Credentialing';
      const eduDesc = `Favorable period for acquiring specialized competencies, technical certifications, and reflective inquiry. ${vargaEdu.specificVargaSignal || ''} ${kpEdu.rationale}`;

      const travelHeadline = 'Exploratory & Purpose-Driven Travel';
      const travelDesc = `Cross-border connections, short research trips, and perspective-broadening cultural journeys supported under current configurations. ${vargaTravel.specificVargaSignal || ''} ${kpTravel.rationale}`;

      const spiritHeadline = 'Dharmic Cultivation & Meditative Stillness';
      const spiritDesc = `Strong inward pull toward contemplation, mantra meditation, and regular quietude to integrate active life lessons. ${vargaSpirit.specificVargaSignal || ''} ${kpSpirit.rationale}`;

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
          evidence: careerEvidence,
        },
        money: {
          headline: moneyHeadline,
          description: moneyDesc,
          signalStrength: sav11 >= 28 ? 'STRONG' : 'MODERATE',
          evidence: moneyEvidence,
        },
        relationships: {
          headline: relHeadline,
          description: relDesc,
          signalStrength: 'MODERATE',
          evidence: relEvidence,
        },
        health: {
          headline: healthHeadline,
          description: healthDesc,
          signalStrength: 'MODERATE',
          evidence: healthEvidence,
        },
        family: {
          headline: familyHeadline,
          description: familyDesc,
          signalStrength: 'STRONG',
          evidence: familyEvidence,
        },
        education: {
          headline: eduHeadline,
          description: eduDesc,
          signalStrength: 'STRONG',
          evidence: eduEvidence,
        },
        travel: {
          headline: travelHeadline,
          description: travelDesc,
          signalStrength: 'MODERATE',
          evidence: travelEvidence,
        },
        spirituality: {
          headline: spiritHeadline,
          description: spiritDesc,
          signalStrength: 'STRONG',
          evidence: spiritualEvidence,
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
