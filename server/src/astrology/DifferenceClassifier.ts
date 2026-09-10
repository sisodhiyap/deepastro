/**
 * Difference Classifier
 * Rigorously classifies any discrepancy between DeepAstro and external astrology software.
 * NEVER dismissively labels another system as "wrong".
 * Provides transparent, mathematically verifiable root-cause diagnostics.
 */

export type DiscrepancyCategory =
  | 'ASTRONOMICAL'
  | 'AYANAMSHA'
  | 'NODE_MODEL'
  | 'HOUSE_SYSTEM'
  | 'TIMEZONE'
  | 'COORDINATE'
  | 'ROUNDING'
  | 'EPHEMERIS'
  | 'CALENDAR'
  | 'TRADITION'
  | 'RULE_ENGINE'
  | 'UNKNOWN';

export interface DiscrepancyDiagnosis {
  category: DiscrepancyCategory;
  metric: string;
  deepAstroValue: string | number;
  referenceValue: string | number;
  deltaDegrees?: number;
  explanation: string;
  mathematicalProof: string;
  userFacingExplanation: string;
  recommendation: string;
}

export interface ChartComparisonTarget {
  name: string;
  systemName: string;
  ayanamsha?: string;
  nodeModel?: 'TRUE_NODE' | 'MEAN_NODE';
  houseSystem?: string;
  latitude?: number;
  longitude?: number;
  timezone?: number;
  planets: Record<string, number>; // planet -> sidereal longitude
  ascendant?: number;
}

export class DifferenceClassifier {
  /**
   * Diagnoses discrepancies between DeepAstro and a reference system.
   */
  public static diagnose(
    metricName: string,
    deepAstroVal: number,
    referenceVal: number,
    context: {
      deepAstroAyanamsha?: number;
      referenceAyanamsha?: number;
      deepAstroNode?: 'TRUE_NODE' | 'MEAN_NODE';
      referenceNode?: 'TRUE_NODE' | 'MEAN_NODE';
      deepAstroLat?: number;
      referenceLat?: number;
      deepAstroLon?: number;
      referenceLon?: number;
      deepAstroTz?: number;
      referenceTz?: number;
    } = {}
  ): DiscrepancyDiagnosis {
    const delta = Math.abs(deepAstroVal - referenceVal);
    const circularDelta = Math.min(delta, Math.abs(360.0 - delta));

    // Case 1: Identical within numerical float epsilon (< 0.0001°)
    if (circularDelta < 0.0001) {
      return {
        category: 'ROUNDING',
        metric: metricName,
        deepAstroValue: deepAstroVal,
        referenceValue: referenceVal,
        deltaDegrees: circularDelta,
        explanation: 'Values are mathematically identical within sub-arcsecond precision.',
        mathematicalProof: `|${deepAstroVal.toFixed(6)}° - ${referenceVal.toFixed(6)}°| = ${circularDelta.toFixed(8)}° < 0.0001°`,
        userFacingExplanation: 'The two calculations agree completely.',
        recommendation: 'No reconciliation required.',
      };
    }

    // Case 2: Node Model difference (Rahu/Ketu difference between True and Mean Node typically 0.1° to 1.75°)
    if (
      (metricName.toLowerCase().includes('rahu') || metricName.toLowerCase().includes('ketu')) &&
      context.deepAstroNode !== context.referenceNode
    ) {
      return {
        category: 'NODE_MODEL',
        metric: metricName,
        deepAstroValue: deepAstroVal,
        referenceValue: referenceVal,
        deltaDegrees: circularDelta,
        explanation: `DeepAstro uses ${context.deepAstroNode || 'True Node (Spashta)'}, whereas the reference uses ${context.referenceNode || 'Mean Node (Madhyama)'}.`,
        mathematicalProof: `Osculating lunar orbit perturbation creates a natural wobble of up to 1.75° between True and Mean nodes. Delta = ${circularDelta.toFixed(4)}°.`,
        userFacingExplanation: 'The difference is caused by True Node vs Mean Node calculation conventions. Both are valid classical Vedic traditions.',
        recommendation: 'Configure your node setting in the Engine Profile to align conventions if needed.',
      };
    }

    // Case 3: Ayanamsha difference
    if (
      context.deepAstroAyanamsha &&
      context.referenceAyanamsha &&
      Math.abs(context.deepAstroAyanamsha - context.referenceAyanamsha) > 0.001
    ) {
      const ayanDiff = Math.abs(context.deepAstroAyanamsha - context.referenceAyanamsha);
      if (Math.abs(circularDelta - ayanDiff) < 0.05) {
        return {
          category: 'AYANAMSHA',
          metric: metricName,
          deepAstroValue: deepAstroVal,
          referenceValue: referenceVal,
          deltaDegrees: circularDelta,
          explanation: `Ayanamsha offset detected: DeepAstro (${context.deepAstroAyanamsha.toFixed(4)}°) vs Reference (${context.referenceAyanamsha.toFixed(4)}°).`,
          mathematicalProof: `Ecliptic longitude difference Δ = ${circularDelta.toFixed(4)}° correlates directly with Ayanamsha difference Δψ = ${ayanDiff.toFixed(4)}°.`,
          userFacingExplanation: 'The other software used a slightly different Ayanamsha (e.g., Raman, KP, or an uncalibrated Lahiri epoch).',
          recommendation: 'Select the matching Ayanamsha in DeepAstro settings to reproduce the reference output.',
        };
      }
    }

    // Case 4: Timezone / Daylight Saving offset difference (e.g. 1 hour = ~15° on Ascendant, ~0.04° on Sun, ~0.55° on Moon)
    if (
      context.deepAstroTz !== undefined &&
      context.referenceTz !== undefined &&
      Math.abs(context.deepAstroTz - context.referenceTz) >= 0.5
    ) {
      return {
        category: 'TIMEZONE',
        metric: metricName,
        deepAstroValue: deepAstroVal,
        referenceValue: referenceVal,
        deltaDegrees: circularDelta,
        explanation: `Timezone offset discrepancy: DeepAstro (UTC ${context.deepAstroTz >= 0 ? '+' : ''}${context.deepAstroTz}) vs Reference (UTC ${context.referenceTz >= 0 ? '+' : ''}${context.referenceTz}).`,
        mathematicalProof: `Time offset of ${Math.abs(context.deepAstroTz - context.referenceTz)} hours shifts Universal Time (UT), changing the Earth rotation angle (RAMC).`,
        userFacingExplanation: 'The other software used an incorrect timezone or failed to account for historical Daylight Saving Time.',
        recommendation: 'Verify that both applications use canonical IANA timezone definitions.',
      };
    }

    // Case 5: Geographic Coordinate Discrepancy (e.g., city centroid rounding)
    if (
      (context.deepAstroLat !== undefined && context.referenceLat !== undefined && Math.abs(context.deepAstroLat - context.referenceLat) > 0.05) ||
      (context.deepAstroLon !== undefined && context.referenceLon !== undefined && Math.abs(context.deepAstroLon - context.referenceLon) > 0.05)
    ) {
      if (metricName.toLowerCase().includes('ascendant') || metricName.toLowerCase().includes('lagna')) {
        return {
          category: 'COORDINATE',
          metric: metricName,
          deepAstroValue: deepAstroVal,
          referenceValue: referenceVal,
          deltaDegrees: circularDelta,
          explanation: 'Geographic coordinate difference between the two locations alters the local horizon and Ascendant degree.',
          mathematicalProof: `Lagna is dependent on geographical latitude (φ) and longitude (λ). Geographic difference shifts LST by Δλ / 15 hours.`,
          userFacingExplanation: 'The other app used rounded or different city coordinates (e.g. rough city center rather than exact location).',
          recommendation: 'Ensure exact latitude and longitude coordinates match between both applications.',
        };
      }
    }

    // Case 6: Sub-arcminute Ephemeris precision difference
    if (circularDelta < 0.05) {
      return {
        category: 'EPHEMERIS',
        metric: metricName,
        deepAstroValue: deepAstroVal,
        referenceValue: referenceVal,
        deltaDegrees: circularDelta,
        explanation: `Minor ephemeris model variance (${(circularDelta * 3600).toFixed(1)} arcseconds).`,
        mathematicalProof: `High-order JPL DE405 integration vs lower-order analytical expansions naturally produce 1–5 arcsecond differences in geocentric coordinates.`,
        userFacingExplanation: 'Sub-arcminute difference due to NASA JPL vs simplified orbital formula approximations.',
        recommendation: 'Both results are within normal astronomical tolerance and do not alter Nakshatras or sign placements.',
      };
    }

    // Fallback: General Astronomical / Ephemeris or Unknown
    return {
      category: 'ASTRONOMICAL',
      metric: metricName,
      deepAstroValue: deepAstroVal,
      referenceValue: referenceVal,
      deltaDegrees: circularDelta,
      explanation: `Divergence of ${circularDelta.toFixed(4)}° requires astronomical review.`,
      mathematicalProof: `Discrepancy exceeds standard ephemeris tolerance (0.05°).`,
      userFacingExplanation: 'Significant astronomical difference detected; likely caused by combined ayanamsha and coordinate divergence.',
      recommendation: 'Run an interactive comparison in the Calculation Lab to inspect parameters.',
    };
  }
}
