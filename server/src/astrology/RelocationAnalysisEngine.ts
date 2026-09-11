/**
 * Relocation Analysis Engine
 * Evaluates relocated astrological charts for current residence or prospective destinations.
 * 
 * Strict Invariant:
 * The natal birth chart remains the permanent, immutable root.
 * Relocation charts compute a secondary perspective (local horizon & local houses)
 * without overwriting natal planetary longitudes or natal dasha balance.
 */

import { BirthProfileInput, VedicAstroEngine } from './VedicAstroEngine.js';
import { LocationResolver } from './LocationResolver.js';

export interface RelocationComparison {
  birthLocation: {
    city: string;
    latitude: number;
    longitude: number;
    timezone: number;
    ascendantSign: string;
    ascendantDegree: number;
  };
  relocatedLocation: {
    city: string;
    latitude: number;
    longitude: number;
    timezone: number;
    ascendantSign: string;
    ascendantDegree: number;
  };
  houseShifts: Array<{
    planet: string;
    natalHouse: number;
    relocatedHouse: number;
    shiftDescription: string;
  }>;
  prominentFocusChange: string;
  astrologicalGuidance: string;
}

export class RelocationAnalysisEngine {
  /**
   * Compares natal chart against a relocated destination
   */
  public static compareRelocation(
    natalInput: BirthProfileInput,
    relocatedCity: string,
    relocatedLat?: number,
    relocatedLon?: number,
    relocatedTimezone?: number
  ): RelocationComparison {
    // 1. Calculate Natal Baseline
    const natalKundli = VedicAstroEngine.calculateKundli(natalInput);

    // 2. Resolve Relocated Coordinates
    let rLat = relocatedLat;
    let rLon = relocatedLon;
    let rTz = relocatedTimezone;

    if (rLat === undefined || rLon === undefined || rTz === undefined) {
      const resolved = LocationResolver.resolve(relocatedCity, natalInput.birthDate, natalInput.birthTime);
      if (resolved) {
        rLat = resolved.latitude;
        rLon = resolved.longitude;
        rTz = resolved.timezone;
      } else {
        // Fallback to natal if unresolvable
        rLat = natalInput.latitude;
        rLon = natalInput.longitude;
        rTz = natalInput.timezone;
      }
    }

    // 3. Compute Relocated Chart
    // Important: Keep exact same UTC moment of birth, recalculating local sidereal time for relocated longitude
    const relocatedInput: BirthProfileInput = {
      ...natalInput,
      birthPlace: relocatedCity,
      latitude: rLat,
      longitude: rLon,
      timezone: rTz,
    };

    const relocatedKundli = VedicAstroEngine.calculateKundli(relocatedInput);

    // 4. Compute House Shifts
    const houseShifts = natalKundli.planets.map((nP) => {
      const rP = relocatedKundli.planets.find((p) => p.name === nP.name) || nP;
      const shifted = nP.house !== rP.house;
      const shiftDescription = shifted
        ? `${nP.name} moves from House ${nP.house} (Natal) to House ${rP.house} (Relocated in ${relocatedCity}).`
        : `${nP.name} remains anchored in House ${nP.house}.`;

      return {
        planet: nP.name,
        natalHouse: nP.house,
        relocatedHouse: rP.house,
        shiftDescription,
      };
    });

    const ascendantShifted = natalKundli.ascendant.details.signName !== relocatedKundli.ascendant.details.signName;
    const prominentFocusChange = ascendantShifted
      ? `Relocating to ${relocatedCity} shifts local Ascendant from ${natalKundli.ascendant.details.signName} to ${relocatedKundli.ascendant.details.signName}, bringing new life areas to the forefront.`
      : `Ascendant remains in ${natalKundli.ascendant.details.signName}, but house cusps adjust by ${Math.abs(relocatedKundli.ascendant.degrees - natalKundli.ascendant.degrees).toFixed(1)}°.`;

    const astrologicalGuidance =
      'Traditional Jyotish regards the natal chart as your fundamental karmic blueprint. Relocation alters the local energetic horizon and environmental interaction, but does not overwrite your natal destiny or planetary strengths.';

    return {
      birthLocation: {
        city: natalInput.birthPlace,
        latitude: natalInput.latitude,
        longitude: natalInput.longitude,
        timezone: natalInput.timezone,
        ascendantSign: natalKundli.ascendant.details.signName,
        ascendantDegree: parseFloat(natalKundli.ascendant.details.degreeInSign.toFixed(2)),
      },
      relocatedLocation: {
        city: relocatedCity,
        latitude: rLat,
        longitude: rLon,
        timezone: rTz,
        ascendantSign: relocatedKundli.ascendant.details.signName,
        ascendantDegree: parseFloat(relocatedKundli.ascendant.details.degreeInSign.toFixed(2)),
      },
      houseShifts,
      prominentFocusChange,
      astrologicalGuidance,
    };
  }
}
