/**
 * DashaTransitIntersectionEngine.ts
 * Master synthesis of active Vimshottari Dasha cycles + major Gochara planetary transits + natal houses & planets.
 * Yields structured prediction categories without deterministic certainty.
 */

import {
  CanonicalPredictionContext,
  DashaTransitIntersectionSignal,
  PredictionSignalCategory,
  PredictionEvidence,
  TransitRecord,
} from './types.js';
import { PlanetName } from '../../astrology/PlanetEngine.js';
import { ActiveDashaContext } from './DashaForecastEngine.js';
import { predictionScoringEngine } from './PredictionWeights.js';
import { KPForecastEngine } from './KPForecastEngine.js';

export class DashaTransitIntersectionEngine {
  /**
   * Evaluates the multi-system convergence of Dasha + Transit + Natal Geometry.
   */
  public static evaluateIntersection(
    context: CanonicalPredictionContext,
    dasha: ActiveDashaContext,
    transits: TransitRecord[]
  ): DashaTransitIntersectionSignal[] {
    const signals: DashaTransitIntersectionSignal[] = [];

    // Find major transits
    const saturnTransit = transits.find((t) => t.transitPlanet === 'Saturn');
    const jupiterTransit = transits.find((t) => t.transitPlanet === 'Jupiter');
    const rahuTransit = transits.find((t) => t.transitPlanet === 'Rahu');

    // 1. CAREER_EXPANSION
    // Triggered when 10th house or 10th lord is energized by Jupiter/Mercury/Sun in Dasha or Transit
    const isCareerDasha = ['Jupiter', 'Sun', 'Mercury', 'Mars', 'Saturn'].includes(dasha.mahadasha);
    const isJupiter10th = jupiterTransit && [10, 1, 5, 9, 11].includes(jupiterTransit.transitHouse);
    if (isCareerDasha && isJupiter10th) {
      const evidence: PredictionEvidence[] = [
        {
          source: 'DASHA',
          rule: 'Career Dasha Lordship',
          value: `${dasha.mahadasha} Mahadasha sets professional growth baseline.`,
          weight: 0.35,
          direction: 'SUPPORTIVE',
        },
        {
          source: 'TRANSIT',
          rule: 'Guru Gochara 10th/Trine Aspect',
          value: `Jupiter transit in House ${jupiterTransit?.transitHouse} provides expansive career momentum.`,
          weight: 0.30,
          direction: 'SUPPORTIVE',
        },
      ];
      signals.push({
        category: 'CAREER_EXPANSION',
        mahadashaLord: dasha.mahadasha,
        antardashaLord: dasha.antardasha,
        pratyantardashaLord: dasha.pratyantardasha,
        majorTransitPlanet: 'Jupiter',
        natalHouse: 10,
        score: 82,
        strength: predictionScoringEngine.normalizeStrength(82),
        direction: 'SUPPORTIVE',
        rationale: `Convergence of ${dasha.mahadasha} dasha and Jupiter transit in House ${jupiterTransit?.transitHouse} opens windows for elevated professional status and career advancement.`,
        evidence,
      });
    }

    // 2. FINANCIAL_FOCUS
    // 2nd/11th house focus with Jupiter, Venus, or Mercury
    const isWealthDasha = ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(dasha.antardasha);
    const isProsperityTransit = jupiterTransit && [2, 11, 9].includes(jupiterTransit.transitHouse);
    if (isWealthDasha || isProsperityTransit) {
      const score = (isWealthDasha && isProsperityTransit) ? 80 : 68;
      signals.push({
        category: 'FINANCIAL_FOCUS',
        mahadashaLord: dasha.mahadasha,
        antardashaLord: dasha.antardasha,
        pratyantardashaLord: dasha.pratyantardasha,
        majorTransitPlanet: jupiterTransit?.transitPlanet || 'Jupiter',
        natalHouse: 2,
        score,
        strength: predictionScoringEngine.normalizeStrength(score),
        direction: 'SUPPORTIVE',
        rationale: `Dynamic emphasis on resource accumulation, prudent asset structuring, and potential inflow of returns.`,
        evidence: [
          {
            source: 'DASHA',
            rule: 'Dhana Bhava Resonance',
            value: `${dasha.antardasha} antardasha energizes financial planning and value consolidation.`,
            weight: 0.30,
            direction: 'SUPPORTIVE',
          },
          {
            source: 'TRANSIT',
            rule: 'Benefic Transit Activation',
            value: `Jupiter transit reinforces wealth houses (House 2 / 11 axis).`,
            weight: 0.28,
            direction: 'SUPPORTIVE',
          },
        ],
      });
    }

    // 3. RELATIONSHIP_ACTIVATION
    // 7th house / Venus / Jupiter resonance
    const isRelDasha = ['Venus', 'Jupiter', 'Moon', 'Mercury'].includes(dasha.antardasha);
    const isRelTransit = jupiterTransit && [7, 5, 1, 11].includes(jupiterTransit.transitHouse);
    if (isRelDasha || isRelTransit) {
      const score = (isRelDasha && isRelTransit) ? 84 : 66;
      signals.push({
        category: 'RELATIONSHIP_ACTIVATION',
        mahadashaLord: dasha.mahadasha,
        antardashaLord: dasha.antardasha,
        pratyantardashaLord: dasha.pratyantardasha,
        majorTransitPlanet: 'Venus' as any,
        natalHouse: 7,
        score,
        strength: predictionScoringEngine.normalizeStrength(score),
        direction: 'SUPPORTIVE',
        rationale: `Partnership themes become central, inviting deeper emotional commitment, interpersonal harmony, and mutual support.`,
        evidence: [
          {
            source: 'DASHA',
            rule: 'Saptama Bhava Correlation',
            value: `${dasha.antardasha} sub-period highlights mutual bonds and alliances.`,
            weight: 0.30,
            direction: 'SUPPORTIVE',
          },
        ],
      });
    }

    // 4. RESPONSIBILITY_PERIOD (Saturn transit over key houses or Saturn dasha)
    const isSaturnActive = dasha.mahadasha === 'Saturn' || dasha.antardasha === 'Saturn' || (saturnTransit && [1, 4, 8, 10].includes(saturnTransit.transitHouse));
    if (isSaturnActive) {
      const score = 76;
      signals.push({
        category: 'RESPONSIBILITY_PERIOD',
        mahadashaLord: dasha.mahadasha,
        antardashaLord: dasha.antardasha,
        pratyantardashaLord: dasha.pratyantardasha,
        majorTransitPlanet: 'Saturn',
        natalHouse: saturnTransit?.transitHouse || 10,
        score,
        strength: predictionScoringEngine.normalizeStrength(score),
        direction: 'NEUTRAL',
        rationale: `Call for heightened discipline, patient endurance, and structural accountability. Demands realistic assessment rather than hurried action.`,
        evidence: [
          {
            source: 'TRANSIT',
            rule: 'Shani Gochara Discipline',
            value: `Saturn operates in House ${saturnTransit?.transitHouse}, emphasizing endurance and ethical boundaries.`,
            weight: 0.35,
            direction: 'NEUTRAL',
          },
        ],
      });
    }

    // 5. TRANSFORMATION_PERIOD (8th house or Rahu/Ketu axis)
    const isNodalActive = ['Rahu', 'Ketu'].includes(dasha.mahadasha) || ['Rahu', 'Ketu'].includes(dasha.antardasha) || (rahuTransit && [1, 7, 8, 10].includes(rahuTransit.transitHouse));
    if (isNodalActive) {
      const score = 74;
      signals.push({
        category: 'TRANSFORMATION_PERIOD',
        mahadashaLord: dasha.mahadasha,
        antardashaLord: dasha.antardasha,
        pratyantardashaLord: dasha.pratyantardasha,
        majorTransitPlanet: 'Rahu',
        natalHouse: 8,
        score,
        strength: predictionScoringEngine.normalizeStrength(score),
        direction: 'NEUTRAL',
        rationale: `Evolutionary pivot encouraging departure from stale routines, deep psychological introspection, and embracing innovative paradigms.`,
        evidence: [
          {
            source: 'DASHA',
            rule: 'Chhaya Graha Evolutionary Shift',
            value: `Nodal energy catalyzes unconventional growth and release of outdated dependencies.`,
            weight: 0.30,
            direction: 'NEUTRAL',
          },
        ],
      });
    }

    // 6. SPIRITUAL_DEVELOPMENT (9th/12th house, Jupiter/Ketu)
    const isSpiritual = ['Jupiter', 'Ketu', 'Sun'].includes(dasha.antardasha) || (jupiterTransit && [9, 12, 5].includes(jupiterTransit.transitHouse));
    if (isSpiritual) {
      signals.push({
        category: 'SPIRITUAL_DEVELOPMENT',
        mahadashaLord: dasha.mahadasha,
        antardashaLord: dasha.antardasha,
        pratyantardashaLord: dasha.pratyantardasha,
        majorTransitPlanet: 'Jupiter',
        natalHouse: 9,
        score: 72,
        strength: predictionScoringEngine.normalizeStrength(72),
        direction: 'SUPPORTIVE',
        rationale: `Heightened affinity for dharmic alignment, contemplative study, meditative stillness, and mentorship.`,
        evidence: [
          {
            source: 'DASHA',
            rule: 'Dharmic Bhava Activation',
            value: `${dasha.antardasha} fosters philosophical clarity and inner quietude.`,
            weight: 0.25,
            direction: 'SUPPORTIVE',
          },
        ],
      });
    }

    // 7. TRAVEL_FOREIGN_CONNECTION (3rd, 9th, 12th houses with Rahu/Moon/Mercury)
    const isTravel = ['Moon', 'Mercury', 'Rahu'].includes(dasha.antardasha);
    if (isTravel) {
      signals.push({
        category: 'TRAVEL_FOREIGN_CONNECTION',
        mahadashaLord: dasha.mahadasha,
        antardashaLord: dasha.antardasha,
        majorTransitPlanet: 'Rahu',
        natalHouse: 9,
        score: 65,
        strength: predictionScoringEngine.normalizeStrength(65),
        direction: 'SUPPORTIVE',
        rationale: `Opportunities for travel, cross-cultural engagements, geographical relocation, or expanding digital frontiers.`,
        evidence: [
          {
            source: 'DASHA',
            rule: 'Deshantar Bhava Movement',
            value: `${dasha.antardasha} influences movement, exploration, and perspective broadening.`,
            weight: 0.20,
            direction: 'SUPPORTIVE',
          },
        ],
      });
    }

    // Fallback: If empty, provide balanced baseline
    if (signals.length === 0) {
      signals.push({
        category: 'RESPONSIBILITY_PERIOD',
        mahadashaLord: dasha.mahadasha,
        antardashaLord: dasha.antardasha,
        majorTransitPlanet: 'Jupiter',
        natalHouse: 1,
        score: 60,
        strength: 'MODERATE',
        direction: 'NEUTRAL',
        rationale: `Steady foundation-building period focusing on personal development and gradual progress.`,
        evidence: [
          {
            source: 'DASHA',
            rule: 'Baseline Period Integration',
            value: `${dasha.mahadasha} / ${dasha.antardasha} sets active tempo.`,
            weight: 0.20,
            direction: 'NEUTRAL',
          },
        ],
      });
    }

    // Augment each signal with KP, Jaimini, and Ashtakavarga confirmations
    for (const s of signals) {
      // 1. KP Stellar Sub-Lord Confirmation
      const kpRes = KPForecastEngine.evaluateDomain(context, s.category, {
        mahadasha: s.mahadashaLord,
        antardasha: s.antardashaLord,
      });
      if (kpRes.evidence && kpRes.evidence.length > 0) {
        s.evidence.push(...kpRes.evidence);
        if (kpRes.direction === 'SUPPORTIVE') {
          s.score = Math.min(95, s.score + 5);
          s.strength = predictionScoringEngine.normalizeStrength(s.score);
        }
      }

      // 2. Jaimini Chara Karaka Confirmation
      if (context.jaimini) {
        if ((s.category === 'CAREER_EXPANSION' || s.category === 'RESPONSIBILITY_PERIOD') && context.jaimini.amatyakaraka?.planet === s.mahadashaLord) {
          s.evidence.push({
            source: 'JAIMINI',
            engineVersion: '1.0.0-jaimini',
            rule: 'Jaimini Amatyakaraka Career Elevation',
            entity: `AmK_${s.mahadashaLord}`,
            value: `Mahadasha lord ${s.mahadashaLord} acts as Jaimini Amatyakaraka (AmK - Planet of Professional Status), reinforcing worldly authority.`,
            weight: 0.20,
            direction: 'SUPPORTIVE',
          });
        } else if (s.category === 'RELATIONSHIP_ACTIVATION' && context.jaimini.darakaraka?.planet === s.mahadashaLord) {
          s.evidence.push({
            source: 'JAIMINI',
            engineVersion: '1.0.0-jaimini',
            rule: 'Jaimini Darakaraka Relational Alliance',
            entity: `DK_${s.mahadashaLord}`,
            value: `Mahadasha lord ${s.mahadashaLord} is Jaimini Darakaraka (DK - Planet of Partnership), indicating decisive relationship chapter.`,
            weight: 0.20,
            direction: 'SUPPORTIVE',
          });
        } else if (s.category === 'SPIRITUAL_DEVELOPMENT' && context.jaimini.atmakaraka?.planet === s.mahadashaLord) {
          s.evidence.push({
            source: 'JAIMINI',
            engineVersion: '1.0.0-jaimini',
            rule: 'Jaimini Atmakaraka Soul Purpose',
            entity: `AK_${s.mahadashaLord}`,
            value: `Mahadasha lord ${s.mahadashaLord} is Jaimini Atmakaraka (AK - Soul Planet), catalyzing deep spiritual maturation and self-inquiry.`,
            weight: 0.25,
            direction: 'SUPPORTIVE',
          });
        }
      }

      // 3. Ashtakavarga SAV Potency Confirmation
      if (context.ashtakavarga?.sarvashtakavarga && s.natalHouse >= 1 && s.natalHouse <= 12) {
        const bindus = context.ashtakavarga.sarvashtakavarga[s.natalHouse - 1];
        if (bindus !== undefined) {
          const isHighSAV = bindus >= 28;
          s.evidence.push({
            source: 'ASHTAKAVARGA',
            engineVersion: '1.0.0-ashtakavarga',
            rule: isHighSAV ? 'SAV High Bindu Transit Potency' : 'SAV Moderate Bindu Discipline',
            entity: `House_${s.natalHouse}_SAV_${bindus}`,
            value: `House ${s.natalHouse} contains ${bindus} Sarvashtakavarga bindus (${isHighSAV ? 'strong structural support' : 'calls for deliberate effort'}).`,
            weight: 0.15,
            direction: isHighSAV ? 'SUPPORTIVE' : 'NEUTRAL',
          });
        }
      }
    }

    return signals;
  }
}
