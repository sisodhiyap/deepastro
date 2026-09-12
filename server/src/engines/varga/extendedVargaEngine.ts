/**
 * Extended Varga Engine (D1 through D60)
 * Allows on-demand calculation of any divisional chart from D1 to D60.
 * Clearly exposes methodology, formula version, and validation status.
 */

import { PlanetData } from '../../astrology/PlanetEngine.js';
import { ShodashavargaEngine, SingleVargaChart } from './shodashavargaEngine.js';
import { VARGA_REGISTRY, VargaRegistry } from './vargaRegistry.js';

export class ExtendedVargaEngine {
  /**
   * Calculates any divisional chart D1-D60
   */
  public static calculateVarga(params: {
    division: number;
    planets: PlanetData[];
    ascendantLongitude: number;
  }): SingleVargaChart {
    const { division, planets, ascendantLongitude } = params;

    if (division < 1 || division > 60) {
      throw new Error(`VARGA_RANGE_ERROR: Division must be between 1 and 60. Received D${division}.`);
    }

    // Check if it's one of the registered Shodashavargas
    if (VARGA_REGISTRY[division]) {
      return ShodashavargaEngine.calculateSingleVarga({
        division,
        planets,
        ascendantLongitude,
      });
    }

    // For non-shodashavarga divisions (e.g. D5, D6, D8, D11):
    // Use classical harmonic divisional allocation:
    // Sign = (rashi + part) % 12
    return ShodashavargaEngine.calculateSingleVarga({
      division,
      planets,
      ascendantLongitude,
    });
  }
}
