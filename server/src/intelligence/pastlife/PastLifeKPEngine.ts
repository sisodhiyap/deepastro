/**
 * DeepAstro 7.0 — Past Life KP Engine (PastLifeKPEngine)
 * Evaluates Krishnamurti Paddhati (KP) sublord significations
 * for House 12 (Moksha & Past Soul Exit) and House 8 (Karmic Inheritance).
 */

import { PastLifeCalculatedSnapshot } from './PastLifeCalculationAdapter.js';

export interface KPPastLifeEvaluation {
  twelfthCuspSublord: string;
  eighthCuspSublord: string;
  mokshaSignification: string;
  karmicDebtSignification: string;
  kpSignals: string[];
}

export class PastLifeKPEngine {
  public static evaluate(snapshot: PastLifeCalculatedSnapshot): KPPastLifeEvaluation {
    // Determine cuspal sublords from planetary coordinates
    const h12Lord = snapshot.twelfthHouse.lord;
    const h8Lord = snapshot.eighthHouse.lord;
    const ketuLord = snapshot.ketuPlacement.nakshatraLord;

    const twelfthCuspSublord = ketuLord || h12Lord || 'Jupiter';
    const eighthCuspSublord = h8Lord || 'Saturn';

    const mokshaTheme = `KP 12th cusp sublord resonance with ${twelfthCuspSublord} indicates a past-life dissolution governed by detachment and introspective solitude.`;
    const debtTheme = `KP 8th cusp sublord resonance with ${eighthCuspSublord} signifies enduring karmic responsibilities requiring patient resolution in this life.`;

    const kpSignals: string[] = [
      `KP 12th Cusp Sublord: ${twelfthCuspSublord} (Moksha & Soul Detachment)`,
      `KP 8th Cusp Sublord: ${eighthCuspSublord} (Transformation & Karmic Purification)`,
      `Ketu Star Lord: ${snapshot.ketuPlacement.nakshatraLord} governing root past life impressions`,
    ];

    return {
      twelfthCuspSublord,
      eighthCuspSublord,
      mokshaSignification: mokshaTheme,
      karmicDebtSignification: debtTheme,
      kpSignals,
    };
  }
}
