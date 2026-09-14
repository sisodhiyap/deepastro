/**
 * DeepAstro Observatory V2.0 - Hallucination Auditor
 * Detects AI-fabricated content in predictions.
 * Any fabricated evidence â†’ CRITICAL_QUALITY_FAILURE
 */
import { HallucinationAuditResult, HallucinationType, HallucinationSeverity } from './ObservatoryV2Types.js';

export class PredictionHallucinationAuditor {
  private static readonly FABRICATED_SOURCE_PATTERNS = [
    /according to (a recent study|research shows|studies show|science confirms)/i,
    /\b(NASA|ISRO|Harvard|Stanford|MIT|Oxford|Cambridge) (confirm|show|prove|demonstrate|says)\b/i,
  ];
  private static readonly INVENTED_ASTRO_PATTERNS = [
    /\b(sun is exalted in (gemini|cancer|capricorn|aquarius|pisces|sagittarius))\b/i,
    /\b(moon is exalted in (aries|taurus|gemini|leo|virgo|libra|scorpio|sagittarius|capricorn))\b/i,
    /\b(jupiter rules (gemini|virgo|libra|scorpio|aquarius))\b/i,
    /\b(saturn rules (aries|taurus|cancer|leo|virgo|libra|sagittarius))\b/i,
    /\baspect of \d+ degrees?\b/i, // non-standard aspects
  ];
  private static readonly FALSE_CERTAINTY_PATTERNS = [
    /\b(100% accurate|proven to be true|scientifically proven|definitely will happen|guaranteed to occur)\b/i,
    /\b(astrology has proven|verified by science|empirically confirmed by astrology)\b/i,
  ];
  private static readonly UNSUPPORTED_STAT_PATTERNS = [
    /\b(\d+% of people|in \d+% of cases|studies show \d+%|research indicates \d+%)\b/i,
  ];

  public static audit(params: {
    predictionId: string;
    forecastText: string;
    evidenceTexts?: string[];
  }): HallucinationAuditResult {
    const { predictionId, forecastText, evidenceTexts = [] } = params;
    const allText = [forecastText, ...evidenceTexts].join(' ');
    const detectedHallucinations: HallucinationAuditResult['detectedHallucinations'] = [];

    // Check fabricated sources
    for (const pattern of this.FABRICATED_SOURCE_PATTERNS) {
      if (pattern.test(allText)) {
        detectedHallucinations.push({
          type: 'FABRICATED_SOURCE', evidence: allText.match(pattern)?.[0] ?? '',
          location: 'forecast_text', severity: 'CRITICAL',
        });
      }
    }

    // Check invented astronomical facts
    for (const pattern of this.INVENTED_ASTRO_PATTERNS) {
      if (pattern.test(allText)) {
        detectedHallucinations.push({
          type: 'INVENTED_ASTRONOMICAL_FACT', evidence: allText.match(pattern)?.[0] ?? '',
          location: 'forecast_text', severity: 'CRITICAL',
        });
      }
    }

    // Check false certainty
    for (const pattern of this.FALSE_CERTAINTY_PATTERNS) {
      if (pattern.test(allText)) {
        detectedHallucinations.push({
          type: 'FALSE_CERTAINTY', evidence: allText.match(pattern)?.[0] ?? '',
          location: 'forecast_text', severity: 'HIGH',
        });
      }
    }

    // Check unsupported statistics
    for (const pattern of this.UNSUPPORTED_STAT_PATTERNS) {
      if (pattern.test(allText)) {
        detectedHallucinations.push({
          type: 'UNSUPPORTED_STATISTIC', evidence: allText.match(pattern)?.[0] ?? '',
          location: 'evidence_text', severity: 'HIGH',
        });
      }
    }

    const hasCritical = detectedHallucinations.some(h => h.severity === 'CRITICAL');
    const hasHigh = detectedHallucinations.some(h => h.severity === 'HIGH');
    const overallSeverity: HallucinationSeverity =
      hasCritical ? 'CRITICAL_QUALITY_FAILURE' :
      hasHigh ? 'HIGH_RISK' :
      detectedHallucinations.length > 0 ? 'LOW_RISK' : 'CLEAN';

    return {
      predictionId, detectedHallucinations, overallSeverity,
      auditedAt: new Date().toISOString(),
      auditNotes: hasCritical
        ? 'CRITICAL: Fabricated or astronomically incorrect content detected. Do not release.'
        : hasHigh ? 'WARNING: Potentially misleading content detected. Review before release.'
        : 'No hallucination patterns detected.',
    };
  }
}
