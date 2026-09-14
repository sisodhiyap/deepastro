/**
 * DAIR â€” DeepAstro Intelligence Representation
 * Version: FORTRESS-1.0
 * The authoritative internal semantic contract bridging deterministic astronomical calculation,
 * evidence weighting, AI synthesis, safety auditing, and presentation.
 */

export interface DAIRIndicator {
  system: 'VEDIC' | 'JAIMINI' | 'KP' | 'TRANSIT' | 'DASHA' | 'NUMEROLOGY' | 'WESTERN' | 'PURANIC';
  planet?: string;
  house?: number;
  sign?: string;
  aspect?: string;
  ruleName: string;
  description: string;
  weight: number; // 0.0 to 1.0
  favorable: boolean;
}

export interface DAIREvidenceItem {
  evidenceId: string;
  system: string;
  category: 'PRIMARY' | 'SUPPORTING' | 'CONTRADICTING' | 'NEUTRAL';
  astronomicalBasis: string;
  textualSource?: string;
  weight: number;
  confidenceContribution: number;
}

export interface DAIRContradiction {
  primarySystem: string;
  conflictingSystem: string;
  primaryIndication: string;
  conflictingIndication: string;
  resolutionRationale: string;
  netImpact: 'FAVORABLE' | 'NEUTRAL' | 'CAUTIONARY';
}

export interface DAIRConfidence {
  rawScore: number; // 0.0 to 1.0
  calibratedScore: number; // Post-calibration score
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXCEPTIONAL';
  systemsConverging: number;
  basis: string;
}

export interface DAIRUncertainty {
  degree: number; // 0.0 to 1.0 (higher = more uncertainty)
  factors: string[];
  timingFlexibilityDays: number;
  dataSensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DAIRTimeWindow {
  phase: string;
  startDate: string;
  endDate: string;
  peakPeriod?: string;
  intensity: 'EMERGING' | 'PEAK' | 'CULMINATING' | 'RECEDING';
}

export interface DAIRExplanation {
  summary: string;
  astrologicalSynthesis: string;
  laymanGuidance: string;
  timingRationale: string;
  keyActions: string[];
}

export interface DAIRPayload {
  dairVersion: 'FORTRESS-1.0';
  domain: 'CAREER' | 'FINANCE' | 'RELATIONSHIP' | 'HEALTH_VITALITY' | 'SPIRITUAL' | 'GENERAL';
  timeWindow: DAIRTimeWindow;
  primaryIndicators: DAIRIndicator[];
  supportingIndicators: DAIRIndicator[];
  contradictions: DAIRContradiction[];
  evidence: DAIREvidenceItem[];
  confidence: DAIRConfidence;
  uncertainty: DAIRUncertainty;
  allowedClaims: string[];
  blockedClaims: string[];
  explanation: DAIRExplanation;
  provenance: {
    calculationFingerprint: string;
    engineVersion: string;
    ruleVersion: string;
    generatedAt: string;
  };
}

export class DAIRBuilder {
  public static createDefault(domain: DAIRPayload['domain'], phase: string): DAIRPayload {
    return {
      dairVersion: 'FORTRESS-1.0',
      domain,
      timeWindow: {
        phase,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        intensity: 'PEAK',
      },
      primaryIndicators: [],
      supportingIndicators: [],
      contradictions: [],
      evidence: [],
      confidence: {
        rawScore: 0.85,
        calibratedScore: 0.82,
        level: 'HIGH',
        systemsConverging: 3,
        basis: 'Multi-system convergence between Vimshottari Dasha, Jupiter transit, and KP Cuspal sub-lord.',
      },
      uncertainty: {
        degree: 0.18,
        factors: ['Birth time accuracy sensitivity', 'Sub-period transition window'],
        timingFlexibilityDays: 14,
        dataSensitivity: 'LOW',
      },
      allowedClaims: [
        'Probabilistic career elevation trends',
        'Favorable timing for collaborative ventures',
        'Traditional Vedic remedy alignment',
      ],
      blockedClaims: [
        'Guaranteed financial gains',
        'Exact death or illness prediction',
        'Deterministic unalterable fate',
      ],
      explanation: {
        summary: 'A significant cosmic alignment favors disciplined expansion and structural reorganization.',
        astrologicalSynthesis: 'Harmonious transit of Jupiter across the 10th house while in an auspicious dasha lord sub-period.',
        laymanGuidance: 'Focus on core strengths, initiate long-term strategic projects, and avoid impulsive financial commitments.',
        timingRationale: 'The period reaches maximum coherence between the third and fifth months of this cycle.',
        keyActions: [
          'Pursue skill enhancement and leadership responsibilities',
          'Practice disciplined financial budgeting',
          'Maintain regular mindful health routines',
        ],
      },
      provenance: {
        calculationFingerprint: '',
        engineVersion: '6.0.5-FORTRESS',
        ruleVersion: 'JYOTISH-V3',
        generatedAt: new Date().toISOString(),
      },
    };
  }
}
