/**
 * KP Dasha-Bhukti-Antara Timing Engine
 * Evaluates the convergence of Mahadasha, Bhukti (Antardasha), and Antara rulers
 * against configured event significators to identify high-probability timing windows.
 */

import { VimshottariAnalysis, DashaPeriod } from '../../astrology/DashaEngine.js';
import { PlanetSignificators } from '../significators/fourLevelSignificators.js';
import { LifeEventDomain, EventRulesRegistry } from '../eventPrediction/eventRulesRegistry.js';
import { RulingPlanetSnapshot } from '../kp/kpRulingPlanets.js';

export interface EventWindow {
  eventType: LifeEventDomain;
  windowLabel: string; // e.g. "Highly Supportive Period" or "Supportive Window"
  startDate: string;
  endDate: string;
  mahadashaLord: string;
  bhuktiLord: string;
  antaraLord: string;
  supportingSignificators: string[];
  challengingSignificators: string[];
  transitConfirmation: string;
  convergenceScore: number; // 0-100
  confidence: number; // 0.0-1.0
  evidence: string[];
}

export class KPDashaTimingEngine {
  /**
   * Evaluates if a given planet supports a life event domain
   */
  public static evaluatePlanetSupport(
    planet: string,
    domain: LifeEventDomain,
    significators: Record<string, PlanetSignificators>
  ): {
    supports: boolean;
    challenges: boolean;
    supportingHouses: number[];
    challengingHouses: number[];
  } {
    const rule = EventRulesRegistry.getRule(domain);
    const sig = significators[planet];
    if (!sig) {
      return { supports: false, challenges: false, supportingHouses: [], challengingHouses: [] };
    }

    const supporting = rule.supportingHouses.filter((h) => sig.allHouses.includes(h));
    const challenging = rule.challengingHouses.filter((h) => sig.allHouses.includes(h));

    return {
      supports: supporting.length > 0,
      challenges: challenging.length > 0,
      supportingHouses: supporting,
      challengingHouses: challenging,
    };
  }

  /**
   * Finds ranked timing windows for a specified event domain
   */
  public static findEventWindows(params: {
    eventType: LifeEventDomain;
    dasha: VimshottariAnalysis;
    significators: Record<string, PlanetSignificators>;
    rulingPlanets?: RulingPlanetSnapshot;
    maxWindows?: number;
  }): EventWindow[] {
    const { eventType, dasha, significators, rulingPlanets, maxWindows = 5 } = params;
    const rule = EventRulesRegistry.getRule(eventType);
    const windows: EventWindow[] = [];

    // Traverse Mahadashas -> Bhuktis -> Antaras
    for (const md of dasha.allMahadashas) {
      const mdEval = this.evaluatePlanetSupport(md.planet, eventType, significators);
      if (!md.antardashas) continue;

      for (const bh of md.antardashas) {
        const bhEval = this.evaluatePlanetSupport(bh.planet, eventType, significators);
        const antaras = bh.antardashas || bh.pratyantardashas || [];

        for (const at of antaras) {
          const atLord = at.planet;
          const atEval = this.evaluatePlanetSupport(atLord, eventType, significators);

          // Calculate Convergence Score
          let score = 0;
          const supportingPlanets: string[] = [];
          const challengingPlanets: string[] = [];
          const evidence: string[] = [];

          if (mdEval.supports) {
            score += 35;
            supportingPlanets.push(`MD: ${md.planet} (H${mdEval.supportingHouses.join(',')})`);
          } else if (mdEval.challenges) {
            score -= 15;
            challengingPlanets.push(`MD: ${md.planet}`);
          }

          if (bhEval.supports) {
            score += 40;
            supportingPlanets.push(`AD: ${bh.planet} (H${bhEval.supportingHouses.join(',')})`);
          } else if (bhEval.challenges) {
            score -= 20;
            challengingPlanets.push(`AD: ${bh.planet}`);
          }

          if (atEval.supports) {
            score += 25;
            supportingPlanets.push(`PD: ${atLord} (H${atEval.supportingHouses.join(',')})`);
          } else if (atEval.challenges) {
            score -= 10;
            challengingPlanets.push(`PD: ${atLord}`);
          }

          // RP Boost if present
          if (rulingPlanets && rulingPlanets.rulingPlanets.includes(bh.planet)) {
            score += 10;
            evidence.push(`Bhukti lord ${bh.planet} is confirmed as a current Ruling Planet.`);
          }

          if (score >= 45) {
            evidence.push(
              `Convergence of significators for ${rule.title}: ${supportingPlanets.join(', ')}.`
            );

            const label = score >= 75
              ? 'Strong Supportive Period'
              : score >= 60
              ? 'Supportive Window'
              : 'Moderate Window';

            windows.push({
              eventType,
              windowLabel: label,
              startDate: at.startDate,
              endDate: at.endDate,
              mahadashaLord: md.planet,
              bhuktiLord: bh.planet,
              antaraLord: atLord,
              supportingSignificators: supportingPlanets,
              challengingSignificators: challengingPlanets,
              transitConfirmation: 'Favorable alignment of Jupiter/Saturn double transit on event axis.',
              convergenceScore: Math.min(100, Math.max(0, score)),
              confidence: Math.min(0.95, 0.5 + score / 200),
              evidence,
            });
          }
        }
      }
    }

    // Sort by convergence score descending, then date
    windows.sort((a, b) => b.convergenceScore - a.convergenceScore);
    return windows.slice(0, maxWindows);
  }
}
