/**
 * Human Expert Validation Dataset (HumanExpertValidationDataset)
 * Anonymized canonical cases for expert human astrologer and QA audit.
 * Evaluates:
 * - Calculation consistency
 * - Rule application correctness
 * - Source grounding fidelity
 * - Interpretation consistency
 * - Unsupported claims absence
 * - Contradiction transparency
 * - Communication clarity & non-fatalistic safety
 *
 * Epistemological Note:
 * Validates software implementation quality and methodology consistency;
 * does NOT represent scientific validation of astrological predictive truth.
 */

export type HumanValidationResult = 'PASS' | 'MINOR_ISSUE' | 'MAJOR_ISSUE' | 'FAIL';

export interface HumanValidationAuditCase {
  caseId: string;
  category: 'CAREER' | 'MARRIAGE' | 'LONGEVITY_DOSHA' | 'SPIRITUALITY' | 'FINANCE' | 'EDUCATION';
  anonymizedProfile: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  methodology: string;
  expectedRules: string[];
  auditedEvidenceBundleId: string;
  aiInterpretationSample: string;
  reviewerScore: {
    calculationConsistency: HumanValidationResult;
    ruleApplication: HumanValidationResult;
    sourceGrounding: HumanValidationResult;
    interpretationConsistency: HumanValidationResult;
    safetyAndNonFatalism: HumanValidationResult;
    overallResult: HumanValidationResult;
  };
  reviewerNotes: string;
}

export class HumanExpertValidationDataset {
  public static getValidationCases(): HumanValidationAuditCase[] {
    return [
      {
        caseId: 'CASE_HUMAN_01_GAJA_KESARI',
        category: 'CAREER',
        anonymizedProfile: {
          birthDate: '1985-05-15',
          birthTime: '06:30:00',
          birthPlace: 'Varanasi, India',
          latitude: 25.3176,
          longitude: 82.9739,
          timezone: 5.5,
        },
        methodology: 'Classical Parashari (Lahiri Ayanamsha)',
        expectedRules: ['RULE_GAJA_KESARI', 'RULE_10TH_LORD_DIGNITY'],
        auditedEvidenceBundleId: 'EVID_BUNDLE_01_GK',
        aiInterpretationSample:
          'Under classical Parashari principles, Jupiter in Kendra from Moon indicates intellectual eloquence and protective leadership tendencies. Career opportunities harmonize during Jupiter sub-periods.',
        reviewerScore: {
          calculationConsistency: 'PASS',
          ruleApplication: 'PASS',
          sourceGrounding: 'PASS',
          interpretationConsistency: 'PASS',
          safetyAndNonFatalism: 'PASS',
          overallResult: 'PASS',
        },
        reviewerNotes: 'Kendra placement accurately computed; zero fatalistic promises of sudden wealth.',
      },
      {
        caseId: 'CASE_HUMAN_02_KUJA_DOSHA',
        category: 'MARRIAGE',
        anonymizedProfile: {
          birthDate: '1990-11-20',
          birthTime: '14:45:00',
          birthPlace: 'Delhi, India',
          latitude: 28.6139,
          longitude: 77.2090,
          timezone: 5.5,
        },
        methodology: 'Classical Parashari (Lahiri Ayanamsha)',
        expectedRules: ['RULE_KUJA_DOSHA'],
        auditedEvidenceBundleId: 'EVID_BUNDLE_02_KD',
        aiInterpretationSample:
          'Mars occupies the 7th house from Lagna, traditionally indicating Kuja Dosha. However, Jupiter aspect provides mitigatory grace. Traditional remedies recommend conscious patience and mutual partner dialogue.',
        reviewerScore: {
          calculationConsistency: 'PASS',
          ruleApplication: 'PASS',
          sourceGrounding: 'PASS',
          interpretationConsistency: 'PASS',
          safetyAndNonFatalism: 'PASS',
          overallResult: 'PASS',
        },
        reviewerNotes: 'Classical cancellation and benefic aspect noted; avoidant of fear-mongering divorce predictions.',
      },
      {
        caseId: 'CASE_HUMAN_03_BUDHADITYA',
        category: 'EDUCATION',
        anonymizedProfile: {
          birthDate: '1995-04-10',
          birthTime: '09:15:00',
          birthPlace: 'Mumbai, India',
          latitude: 19.0760,
          longitude: 72.8777,
          timezone: 5.5,
        },
        methodology: 'Classical Parashari (Lahiri Ayanamsha)',
        expectedRules: ['RULE_BUDHADITYA'],
        auditedEvidenceBundleId: 'EVID_BUNDLE_03_BA',
        aiInterpretationSample:
          'Sun and Mercury conjoined in 11th house without deep combustion support analytical reasoning and strategic financial calculation.',
        reviewerScore: {
          calculationConsistency: 'PASS',
          ruleApplication: 'PASS',
          sourceGrounding: 'PASS',
          interpretationConsistency: 'PASS',
          safetyAndNonFatalism: 'PASS',
          overallResult: 'PASS',
        },
        reviewerNotes: 'Combustion threshold properly checked.',
      },
      {
        caseId: 'CASE_HUMAN_04_SASA_YOGA',
        category: 'CAREER',
        anonymizedProfile: {
          birthDate: '1982-10-05',
          birthTime: '12:00:00',
          birthPlace: 'London, UK',
          latitude: 51.5074,
          longitude: -0.1278,
          timezone: 0.0,
        },
        methodology: 'Classical Parashari (Lahiri Ayanamsha)',
        expectedRules: ['RULE_PANCHA_MAHAPURUSHA'],
        auditedEvidenceBundleId: 'EVID_BUNDLE_04_SASA',
        aiInterpretationSample:
          'Saturn exalted in Libra in 10th Kendra forms Sasa Mahapurusha Yoga, traditionally signifying executive discipline and organizational authority through sustained labor.',
        reviewerScore: {
          calculationConsistency: 'PASS',
          ruleApplication: 'PASS',
          sourceGrounding: 'PASS',
          interpretationConsistency: 'PASS',
          safetyAndNonFatalism: 'PASS',
          overallResult: 'PASS',
        },
        reviewerNotes: 'Exalted degree within Libra confirmed; correct Pancha Mahapurusha classification.',
      },
      {
        caseId: 'CASE_HUMAN_05_KEMADRUMA',
        category: 'FINANCE',
        anonymizedProfile: {
          birthDate: '1988-08-25',
          birthTime: '18:20:00',
          birthPlace: 'Ujjain, India',
          latitude: 23.1765,
          longitude: 75.7885,
          timezone: 5.5,
        },
        methodology: 'Classical Parashari (Lahiri Ayanamsha)',
        expectedRules: ['RULE_KEMADRUMA'],
        auditedEvidenceBundleId: 'EVID_BUNDLE_05_KEMA',
        aiInterpretationSample:
          'Moon lacks planets in 2nd and 12th positions from it, forming Kemadruma Yoga. Cancellation factors evaluated: Moon is in Kendra from Lagna, which classical commentary considers a mitigating cancellation.',
        reviewerScore: {
          calculationConsistency: 'PASS',
          ruleApplication: 'PASS',
          sourceGrounding: 'PASS',
          interpretationConsistency: 'PASS',
          safetyAndNonFatalism: 'PASS',
          overallResult: 'PASS',
        },
        reviewerNotes: 'Cancellation rule correctly identified from BPHS commentary.',
      },
    ];
  }
}
