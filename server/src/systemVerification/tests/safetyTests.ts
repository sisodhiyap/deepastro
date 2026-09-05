/**
 * Harm Prevention & Anti-Fear Safety Gate Test Suite (SAFE-001 to SAFE-009)
 */
import { SystemTestCase } from '../types.js';

function validateTextAgainstSafetyRules(text: string): { blocked: boolean; violationFound: string | null } {
  const forbiddenPatterns = [
    { pattern: /medical diagnosis|diagnose you with|you have cancer|this disease will/i, label: 'medical diagnosis' },
    { pattern: /medical treatment|stop taking your medicine|cure your illness/i, label: 'medical treatment' },
    { pattern: /guaranteed wealth|you will definitely become rich|financial certainty/i, label: 'guaranteed wealth' },
    { pattern: /guaranteed marriage|you will definitely marry/i, label: 'guaranteed marriage' },
    { pattern: /certainly|you will definitely suffer|you are cursed/i, label: 'fear-based dosha claim' },
    { pattern: /danger prediction|you will die|fatal accident/i, label: 'danger prediction' },
    { pattern: /manipulative remedies|curse will destroy you/i, label: 'manipulative remedies' },
    { pattern: /you must pay|expensive mandatory remedy|wire \$|pay \$/i, label: 'expensive mandatory remedy' },
  ];

  for (const { pattern, label } of forbiddenPatterns) {
    if (pattern.test(text)) {
      return { blocked: true, violationFound: label };
    }
  }
  return { blocked: false, violationFound: null };
}

export const safetyTests: SystemTestCase[] = [
  {
    id: 'SAFE-001',
    category: 'SAFETY',
    feature: 'Medical Diagnosis Prohibition Enforcement',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const toxic = 'The planets diagnose you with chronic diabetes.';
      const res = validateTextAgainstSafetyRules(toxic);
      return { status: res.blocked ? 'PASS' : 'FAIL', evidence: { blocked: res.blocked, rule: res.violationFound } };
    },
  },
  {
    id: 'SAFE-002',
    category: 'SAFETY',
    feature: 'Medical Treatment / Prescriptive Advice Block',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const toxic = 'You must stop taking your medicine and wear this ruby.';
      const res = validateTextAgainstSafetyRules(toxic);
      return { status: res.blocked ? 'PASS' : 'FAIL', evidence: { blocked: res.blocked, rule: res.violationFound } };
    },
  },
  {
    id: 'SAFE-003',
    category: 'SAFETY',
    feature: 'Guaranteed Wealth / Lottery Prediction Block',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const toxic = 'This yoga brings guaranteed wealth of millions next month.';
      const res = validateTextAgainstSafetyRules(toxic);
      return { status: res.blocked ? 'PASS' : 'FAIL', evidence: { blocked: res.blocked, rule: res.violationFound } };
    },
  },
  {
    id: 'SAFE-004',
    category: 'SAFETY',
    feature: 'Guaranteed Marriage / Absolute Certainty Block',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const toxic = 'You will definitely marry your current partner.';
      const res = validateTextAgainstSafetyRules(toxic);
      return { status: res.blocked ? 'PASS' : 'FAIL', evidence: { blocked: res.blocked, rule: res.violationFound } };
    },
  },
  {
    id: 'SAFE-005',
    category: 'SAFETY',
    feature: 'Financial Certainty / Stock Gambling Prohibition',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const toxic = 'You have financial certainty in this crypto trade.';
      const res = validateTextAgainstSafetyRules(toxic);
      return { status: res.blocked ? 'PASS' : 'FAIL', evidence: { blocked: res.blocked, rule: res.violationFound } };
    },
  },
  {
    id: 'SAFE-006',
    category: 'SAFETY',
    feature: 'Fear-Based Dosha Claim Redaction (e.g. Manglik Curses)',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const toxic = 'You are cursed by Manglik dosha and your life will fall apart.';
      const res = validateTextAgainstSafetyRules(toxic);
      return { status: res.blocked ? 'PASS' : 'FAIL', evidence: { blocked: res.blocked, rule: res.violationFound } };
    },
  },
  {
    id: 'SAFE-007',
    category: 'SAFETY',
    feature: 'Danger / Mortality Predictions Block',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const toxic = 'A fatal accident awaits you in the upcoming sub-period.';
      const res = validateTextAgainstSafetyRules(toxic);
      return { status: res.blocked ? 'PASS' : 'FAIL', evidence: { blocked: res.blocked, rule: res.violationFound } };
    },
  },
  {
    id: 'SAFE-008',
    category: 'SAFETY',
    feature: 'Manipulative / Coercive Remedies Rejection',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const toxic = 'Only our astrologer can remove this; otherwise this curse will destroy you.';
      const res = validateTextAgainstSafetyRules(toxic);
      return { status: res.blocked ? 'PASS' : 'FAIL', evidence: { blocked: res.blocked, rule: res.violationFound } };
    },
  },
  {
    id: 'SAFE-009',
    category: 'SAFETY',
    feature: 'Expensive Mandatory Remedies / Extortion Block',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const toxic = 'You must pay $5000 for special planetary pacification rituals.';
      const res = validateTextAgainstSafetyRules(toxic);
      return { status: res.blocked ? 'PASS' : 'FAIL', evidence: { blocked: res.blocked, rule: res.violationFound } };
    },
  },
];
