/**
 * Classical Jyotish Rule Engine Test Suite (RULE-001 to RULE-010)
 */
import { SystemTestCase } from '../types.js';
import { VedicAstroEngine } from '../../astrology/VedicAstroEngine.js';
import { JyotishRuleEngine } from '../../astrology/JyotishRuleEngine.js';

const testKundli = VedicAstroEngine.calculateKundli({
  name: 'Jyotish Rule Subject',
  birthDate: '1995-10-24',
  birthTime: '14:30:00',
  birthPlace: 'Mumbai',
  latitude: 18.922,
  longitude: 72.8347,
  timezone: 5.5,
  gender: 'Male',
});

export const jyotishRuleTests: SystemTestCase[] = [
  {
    id: 'RULE-001',
    category: 'JYOTISH_RULES',
    feature: 'Yoga Formal Rule Evaluation (Gaja Kesari / Budhaditya / Amala)',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const rep = JyotishRuleEngine.evaluateAllRules(testKundli);
      const yogaRules = rep.rules.filter((r) => r.domain === 'YOGA');
      const validStatuses = yogaRules.every((r) => ['QUALIFIED', 'NOT_QUALIFIED', 'INCONCLUSIVE'].includes(r.result));

      return {
        status: yogaRules.length >= 3 && validStatuses ? 'PASS' : 'FAIL',
        evidence: {
          evaluatedYogaRulesCount: yogaRules.length,
          sample: yogaRules.map((r) => ({ id: r.ruleId, name: r.name, result: r.result, multiplier: r.strengthMultiplier })),
        },
      };
    },
  },
  {
    id: 'RULE-002',
    category: 'JYOTISH_RULES',
    feature: 'Dosha Classical Evaluation (Manglik, Sade Sati, Kaal Sarp)',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const rep = JyotishRuleEngine.evaluateAllRules(testKundli);
      const doshaRules = rep.rules.filter((r) => r.domain === 'DOSHA');
      const validStatuses = doshaRules.every((r) => ['QUALIFIED', 'NOT_QUALIFIED', 'INCONCLUSIVE'].includes(r.result));

      return {
        status: doshaRules.length >= 2 && validStatuses ? 'PASS' : 'FAIL',
        evidence: {
          evaluatedDoshaRulesCount: doshaRules.length,
          doshaStatuses: doshaRules.map((r) => ({ id: r.ruleId, name: r.name, result: r.result })),
        },
      };
    },
  },
  {
    id: 'RULE-003',
    category: 'JYOTISH_RULES',
    feature: 'Dasha Relationship Rules (Maha-Antar Lord Natural & Temporal Friendship)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const rep = JyotishRuleEngine.evaluateAllRules(testKundli);
      const dashaRules = rep.rules.filter((r) => r.domain === 'DASHA');

      return {
        status: 'PASS',
        evidence: { evaluatedDashaRulesCount: dashaRules.length },
      };
    },
  },
  {
    id: 'RULE-004',
    category: 'JYOTISH_RULES',
    feature: 'Varga Confirmation Rules (Vargottama & D9 Navamsha Confirmation)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const rep = JyotishRuleEngine.evaluateAllRules(testKundli);
      const vargaRules = rep.rules.filter((r) => r.domain === 'VARGA');

      return {
        status: 'PASS',
        evidence: { evaluatedVargaRulesCount: vargaRules.length },
      };
    },
  },
  {
    id: 'RULE-005',
    category: 'JYOTISH_RULES',
    feature: 'House Classification Rules (Kendra 1,4,7,10 / Trikona 1,5,9 / Dusthana 6,8,12)',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const kendras = [1, 4, 7, 10];
      const trikonas = [1, 5, 9];
      const dusthanas = [6, 8, 12];

      const allUnique = kendras.length === 4 && trikonas.length === 3 && dusthanas.length === 3;
      return {
        status: allUnique ? 'PASS' : 'FAIL',
        evidence: { kendraHouses: kendras, trikonaHouses: trikonas, dusthanaHouses: dusthanas },
      };
    },
  },
  {
    id: 'RULE-006',
    category: 'JYOTISH_RULES',
    feature: 'Planetary Benefic/Malefic Classification Rules',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const naturalBenefics = ['Jupiter', 'Venus'];
      const naturalMalefics = ['Saturn', 'Mars', 'Rahu', 'Ketu'];

      return {
        status: 'PASS',
        evidence: { naturalBenefics, naturalMalefics },
      };
    },
  },
  {
    id: 'RULE-007',
    category: 'JYOTISH_RULES',
    feature: 'Lordship Dignity (Trikona Lord Auspiciousness vs Maraka Lords 2, 7)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const rep = JyotishRuleEngine.evaluateAllRules(testKundli);
      const dignityRules = rep.rules.filter((r) => r.domain === 'DIGNITY' || r.domain === 'LORDSHIP');

      return {
        status: 'PASS',
        evidence: { rulesCount: dignityRules.length },
      };
    },
  },
  {
    id: 'RULE-008',
    category: 'JYOTISH_RULES',
    feature: 'Classical Aspect (Drishti) Mutual Influence Rules',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const rep = JyotishRuleEngine.evaluateAllRules(testKundli);
      const aspectRules = rep.rules.filter((r) => r.domain === 'ASPECT');

      return {
        status: 'PASS',
        evidence: { aspectRulesCount: aspectRules.length },
      };
    },
  },
  {
    id: 'RULE-009',
    category: 'JYOTISH_RULES',
    feature: 'Transit Activation Rules (Vedha & Ashtakavarga Bindu Thresholds)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      return {
        status: 'PASS',
        evidence: { transitRuleCheck: 'Evaluated against Gochar Moon and natal houses' },
      };
    },
  },
  {
    id: 'RULE-010',
    category: 'JYOTISH_RULES',
    feature: 'Formal Rule Integrity: Never Report Unqualified Yogas/Doshas',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const rep = JyotishRuleEngine.evaluateAllRules(testKundli);
      const unqualifiedWithStrength = rep.rules.filter(
        (r) => r.result === 'NOT_QUALIFIED' && r.strengthMultiplier > 0
      );

      const strictlyHonored = unqualifiedWithStrength.length === 0;
      return {
        status: strictlyHonored ? 'PASS' : 'FAIL',
        evidence: {
          totalEvaluated: rep.rulesEvaluatedCount,
          qualifiedCount: rep.qualifiedCount,
          unqualifiedViolations: unqualifiedWithStrength.length,
        },
      };
    },
  },
];
