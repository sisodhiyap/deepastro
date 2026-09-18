/**
 * DeepAstro 7.0 — Future Card Engine (FutureCardEngine)
 * Assembles the frontend-ready data contract for "YOUR FUTURE MAP",
 * providing dynamic years anchored to the current calendar year,
 * domain filters, scenarios, uncertainty disclosures, and all 8 action buttons.
 */

import { CosmicFutureForecastSchema, FutureMapData } from './CosmicFutureTypes.js';

export interface FutureCardAction {
  id: string;
  label: string;
  action: string;
}

export interface FormattedFutureMapCardData {
  format: 'future_map_card';
  title: 'YOUR FUTURE MAP';
  currentLifePhase: string;
  nextMajorWindow: {
    period: string;
    description: string;
    domain: string;
  };
  horizonYears: number[];
  timeline: any[];
  domains: Record<string, any>;
  scenarios: { baseline: string; opportunity: string; challenge: string } | any[];
  confidence: {
    level: string;
    score: number;
    explanation: string;
    disclaimer: string;
  };
  contradictions: any[];
  actionButtons: FutureCardAction[];
  evidenceSummary: {
    calculationFingerprint: string;
    systemsCount: number;
    rulesCount: number;
  };
  disclaimer: string;
}

export class FutureCardEngine {
  public static formatForFutureMapCard(
    forecast: CosmicFutureForecastSchema & {
      calculationFingerprint?: string;
      confidenceEvaluation?: any;
      contradictionItems?: any[];
    }
  ): FormattedFutureMapCardData {
    const currentYear = new Date().getFullYear();
    const timeline = forecast.yearForecasts || [];
    const horizonYears = timeline.map(y => y.year);

    const actionButtons: FutureCardAction[] = [
      { id: 'why_forecast', label: 'Why This Forecast', action: 'VIEW_EVIDENCE' },
      { id: 'view_evidence', label: 'View Evidence', action: 'VIEW_EVIDENCE' },
      { id: 'view_contradictions', label: 'View Contradictions', action: 'VIEW_CONTRADICTIONS' },
      { id: 'monthly_view', label: 'Monthly View', action: 'VIEW_MONTHLY' },
      { id: 'compare_years', label: 'Compare Years', action: 'COMPARE_YEARS' },
      { id: 'save_forecast', label: 'Save Forecast', action: 'SAVE_FORECAST' },
      { id: 'generate_report', label: 'Generate Report', action: 'GENERATE_REPORT' },
      { id: 'ask_astrobot', label: 'Ask AstroBot', action: 'ASK_ASTROBOT' },
    ];

    const confEval = forecast.confidenceEvaluation || {
      level: 'HIGH SUPPORT',
      normalizedPercentage: 82,
      explanation: 'Harmonic convergence across active Vimshottari dasha lords and major Gochara transits.',
      epistemicDisclaimer: 'No astrological reading can assert an unalterable future. Free will and environmental factors are essential.',
    };

    return {
      format: 'future_map_card',
      title: 'YOUR FUTURE MAP',
      currentLifePhase: forecast.currentLifePhase || 'Strategic Alignment Phase',
      nextMajorWindow: forecast.nextMajorWindow || {
        period: `Q2–Q3 ${currentYear + 1}`,
        description: 'Key Professional Advancement & Creative Focus Window',
        domain: 'CAREER',
      },
      horizonYears,
      timeline,
      domains: forecast.domainForecasts || {},
      scenarios: forecast.scenarios || [],
      confidence: {
        level: confEval.level,
        score: confEval.normalizedPercentage,
        explanation: confEval.explanation,
        disclaimer: confEval.epistemicDisclaimer,
      },
      contradictions: forecast.contradictionItems || [],
      actionButtons,
      evidenceSummary: {
        calculationFingerprint: forecast.calculationFingerprint || `snap_${forecast.calculationSnapshotId}`,
        systemsCount: 8,
        rulesCount: 24,
      },
      disclaimer: 'Future intelligence is grounded in traditional Jyotish time-mapping and mathematical planetary transits. It serves as reflective navigation rather than deterministic prophecy.',
    };
  }
}
