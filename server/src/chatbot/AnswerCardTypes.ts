/**
 * DeepAstro Answer Card Types & Schema Definition
 * Directly matches the master reference design (Dark cosmic, cyan/violet/gold accents,
 * glass panels, thin luminous borders, editorial typography, signals, metrics, actions).
 */

export interface AnswerCardSignal {
  title: string;
  description: string;
  type: 'growth' | 'caution' | 'milestone' | 'neutral';
}

export interface AnswerCardAction {
  label: string;
  isCompleted?: boolean;
}

export interface DeepAstroAnswerCardSpec {
  id: string;
  version: '6.0.4';
  question: string;
  primaryHeader: string; // e.g. 'Career Outlook'
  summaryText: string;
  momentumScore?: {
    percentage: number;
    label: string;
    computedFrom: string;
  };
  keySignals: AnswerCardSignal[];
  favourableWindow?: {
    windowLabel: string;
    description: string;
  };
  deepAstroTip?: string;
  luckyAssociations?: {
    luckyColor?: { name: string; hex: string; note: string };
    luckyNumber?: { value: number | string; note: string };
  };
  suggestedActions?: string[];
  visualImageUrl: string;
  visualConcept: string;
  visualTheme: string;
  sourcesFooter: {
    sources: string[];
    updatedAt: string;
    disclaimer: string;
  };
  provenanceStatus: 'LIVE' | 'CALCULATED' | 'CORROBORATED' | 'ASTROLOGICAL_INTERPRETATION' | 'UNAVAILABLE';
}

export interface DeepAstroChatResponse {
  directAnswer: string;
  domain: string;
  intent: any;
  card: DeepAstroAnswerCardSpec;
  evidenceDrawer: {
    ruleApplied?: string;
    deterministicCalculations?: any;
    externalSources?: any[];
    factCheckStatus?: string;
    confidenceScore: number;
  };
  sources: string[];
}
