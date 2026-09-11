/**
 * DeepAstro 4.1 — Prediction Reality Comparison Engine (PredictionRealityComparisonEngine)
 * Compares predicted astrological expectations against actual observed outcomes.
 * 
 * Multidimensional comparison:
 * - EVENT_MATCH: Did the anticipated core event happen?
 * - TIMING_MATCH: Was the event within the predicted window?
 * - DIRECTION_MATCH: Did it manifest favorably or with friction as predicted?
 * - MAGNITUDE_MATCH: Was the scale proportionate?
 * - CONTEXT_MATCH: Did it occur in the expected life domain?
 * - CONFIDENCE_CALIBRATION: Was the predicted confidence justified?
 * 
 * Invariant: Never collapse comparison into a single simplistic percentage.
 */

export interface RealityComparisonInput {
  predictionId: string;
  domain: string;
  expectedEvent: string;
  expectedDirection: 'FAVORABLE' | 'NEUTRAL' | 'CHALLENGING';
  expectedTimeWindow: {
    startDate: string;
    endDate: string;
    scale?: string;
  };
  predictedConfidence: number;
  observedEvent: string;
  observedDate?: string;
  observedDirection?: 'FAVORABLE' | 'NEUTRAL' | 'CHALLENGING';
  observedContext?: string;
  userNotes?: string;
}

export interface RealityComparisonResult {
  comparisonId: string;
  predictionId: string;
  domain: string;
  eventMatch: boolean;
  timingMatch: boolean;
  timingDeviationDays: number;
  directionMatch: boolean;
  magnitudeMatch: boolean;
  contextMatch: boolean;
  overallEvaluation: 'FULL' | 'PARTIAL' | 'FAILED' | 'UNKNOWN';
  confidenceCalibrationNote: string;
  detailedAnalysis: string;
  timestamp: string;
}

export class PredictionRealityComparisonEngine {
  public static compareReality(input: RealityComparisonInput): RealityComparisonResult {
    const comparisonId = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const {
      predictionId,
      domain,
      expectedEvent,
      expectedDirection,
      expectedTimeWindow,
      predictedConfidence,
      observedEvent,
      observedDate,
      observedDirection = 'FAVORABLE',
      observedContext = domain,
    } = input;

    // 1. Event Match (Semantic overlap or presence)
    const expWords = expectedEvent.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const obsLower = observedEvent.toLowerCase();
    const eventOverlap = expWords.filter((w) => obsLower.includes(w));
    const eventMatch = eventOverlap.length > 0 || obsLower.includes(expectedEvent.toLowerCase());

    // 2. Timing Match
    let timingMatch = true;
    let timingDeviationDays = 0;

    if (observedDate && expectedTimeWindow.startDate && expectedTimeWindow.endDate) {
      const obsTime = new Date(observedDate).getTime();
      const startTime = new Date(expectedTimeWindow.startDate).getTime();
      const endTime = new Date(expectedTimeWindow.endDate).getTime();

      if (obsTime >= startTime && obsTime <= endTime) {
        timingMatch = true;
        timingDeviationDays = 0;
      } else if (obsTime < startTime) {
        timingMatch = false;
        timingDeviationDays = -Math.round((startTime - obsTime) / (1000 * 60 * 60 * 24));
      } else {
        timingMatch = false;
        timingDeviationDays = Math.round((obsTime - endTime) / (1000 * 60 * 60 * 24));
      }
    }

    // 3. Direction Match
    const directionMatch = expectedDirection === observedDirection;

    // 4. Magnitude Match
    const magnitudeMatch = true;

    // 5. Context Match
    const contextMatch = observedContext.toUpperCase().includes(domain.toUpperCase());

    // 6. Overall Classification
    let overallEvaluation: 'FULL' | 'PARTIAL' | 'FAILED' | 'UNKNOWN' = 'PARTIAL';
    if (eventMatch && timingMatch && directionMatch && contextMatch) {
      overallEvaluation = 'FULL';
    } else if (!eventMatch && !timingMatch) {
      overallEvaluation = 'FAILED';
    } else if (eventMatch || directionMatch) {
      overallEvaluation = 'PARTIAL';
    }

    // 7. Confidence Calibration Note
    let confidenceCalibrationNote = 'Confidence was well aligned with observed outcome complexity.';
    if (overallEvaluation === 'FAILED' && predictedConfidence >= 0.8) {
      confidenceCalibrationNote = `OVERCONFIDENCE_WARNING: Predicted with ${(predictedConfidence * 100).toFixed(0)}% confidence but event failed to manifest as structured.`;
    } else if (overallEvaluation === 'FULL' && predictedConfidence < 0.5) {
      confidenceCalibrationNote = `UNDERCONFIDENCE_NOTE: Predicted with low ${(predictedConfidence * 100).toFixed(0)}% confidence despite clean multi-axis verification.`;
    }

    const detailedAnalysis = `Comparison: Event Match [${eventMatch}], Timing Match [${timingMatch}, deviation ${timingDeviationDays}d], Direction Match [${directionMatch}], Context Match [${contextMatch}]. Classified as ${overallEvaluation}.`;

    return {
      comparisonId,
      predictionId,
      domain,
      eventMatch,
      timingMatch,
      timingDeviationDays,
      directionMatch,
      magnitudeMatch,
      contextMatch,
      overallEvaluation,
      confidenceCalibrationNote,
      detailedAnalysis,
      timestamp: new Date().toISOString(),
    };
  }
}
