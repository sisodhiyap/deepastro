/**
 * KP High-Precision Ayanamsa Engine
 * Supports KP New (K.S. Krishnamurti modern standard), KP Original, and Lahiri comparison.
 * Zero-epoch of KP New is calibrated so the difference with Lahiri is precisely 0° 05' 54".
 */

import Astronomy from '../../astrology/astronomyBridge.js';
import { getLahiriAyanamsha, toRadians } from '../../astrology/astronomyMath.js';
import { KPAyanamsaType } from './kpConfig.js';
import type * as AstronomyTypes from 'astronomy-engine';

export class KPAyanamsaEngine {
  // Constant offset between Lahiri and KP New: 0 deg 5 arcmin 53.64 arcsec = 0.09823333 degrees
  public static readonly KP_NEW_OFFSET_DEG = 0.09823333;
  // KP Original offset: ~0.101111 degrees (6 arcmin 4 arcsec)
  public static readonly KP_ORIGINAL_OFFSET_DEG = 0.10111111;

  /**
   * Computes the KP Ayanamsa in decimal degrees for a given Julian Day or AstroTime
   */
  public static calculateAyanamsa(
    jdOrTime: number | AstronomyTypes.AstroTime,
    type: KPAyanamsaType = 'KP_NEW'
  ): number {
    const lahiri = getLahiriAyanamsha(jdOrTime);

    switch (type) {
      case 'KP_NEW':
        return lahiri - this.KP_NEW_OFFSET_DEG;
      case 'KP_ORIGINAL':
        return lahiri - this.KP_ORIGINAL_OFFSET_DEG;
      case 'LAHIRI':
      default:
        return lahiri;
    }
  }

  /**
   * Converts Tropical longitude to KP Sidereal longitude using the selected KP Ayanamsa
   */
  public static tropicalToKPSidereal(
    tropicalLon: number,
    jdOrTime: number | AstronomyTypes.AstroTime,
    type: KPAyanamsaType = 'KP_NEW'
  ): number {
    const ayanamsa = this.calculateAyanamsa(jdOrTime, type);
    let sidereal = (tropicalLon - ayanamsa) % 360.0;
    if (sidereal < 0) sidereal += 360.0;
    return sidereal;
  }
}
