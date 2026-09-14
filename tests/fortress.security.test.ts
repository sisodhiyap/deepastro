import { describe, it, expect } from 'vitest';
import { DeepAstroConstitution } from '../server/src/governance/DeepAstroConstitution.js';
import { CalculationCoreProtection } from '../server/src/astrology/CalculationCoreProtection.js';

describe('DEEPASTRO FORTRESS â€” Phase 1 & Security Gates', () => {
  it('Rule 001: Rejects tampering with astronomical calculation truth', () => {
    expect(() => {
      DeepAstroConstitution.assertAstronomicalTruthInvariant(120.45, 125.0, 'Jupiter');
    }).toThrow(/Rule 001/);

    // Exact or within 0.0001 deg passes
    expect(() => {
      DeepAstroConstitution.assertAstronomicalTruthInvariant(120.45, 120.45, 'Jupiter');
    }).not.toThrow();
  });

  it('Rule 002: Rejects setting CALCULATION_CORE_MUTABLE to true', () => {
    expect(CalculationCoreProtection.CALCULATION_CORE_MUTABLE).toBe(false);
    expect(() => {
      DeepAstroConstitution.assertCalculationCoreImmutable(true as any);
    }).toThrow(/Rule 002/);
  });

  it('Rule 003: Rejects missing birth data to prevent synthetic fabrication', () => {
    expect(() => {
      DeepAstroConstitution.validateBirthDataIntegrity({ birthDate: '' });
    }).toThrow(/Rule 003/);

    expect(() => {
      DeepAstroConstitution.validateBirthDataIntegrity({ birthDate: '1990-05-15', birthTime: '14:30' });
    }).not.toThrow();
  });

  it('Rule 004: Rejects passive actions as outcome confirmations', () => {
    expect(() => {
      DeepAstroConstitution.validateOutcomeConfirmation('silence');
    }).toThrow(/Rule 004/);

    expect(() => {
      DeepAstroConstitution.validateOutcomeConfirmation('passive_scroll');
    }).toThrow(/Rule 004/);

    expect(DeepAstroConstitution.validateOutcomeConfirmation('explicit_user_button_click')).toBe(true);
  });

  it('Rule 006: Rejects sensitive future forecast access without explicit consent', () => {
    expect(() => {
      DeepAstroConstitution.assertFutureConsent(false, 'NONE');
    }).toThrow(/Rule 006/);

    expect(() => {
      DeepAstroConstitution.assertFutureConsent(true, 'LEVEL_1');
    }).not.toThrow();
  });

  it('Rule 007 & 008: Prohibits exact death or cause of death forecasting', () => {
    expect(() => {
      DeepAstroConstitution.assertNoDeathPrediction('Your exact date of death will be in 2045');
    }).toThrow(/Rule 007\/008/);

    expect(() => {
      DeepAstroConstitution.assertNoDeathPrediction('You will die on October 12th');
    }).toThrow(/Rule 007\/008/);

    expect(() => {
      DeepAstroConstitution.assertNoDeathPrediction('A period of health rejuvenation and holistic wellness.');
    }).not.toThrow();
  });

  it('Rule 009: Prohibits medical diagnosis', () => {
    expect(() => {
      DeepAstroConstitution.assertNoMedicalDiagnosis('You are diagnosed with severe heart failure, stop taking your pills.');
    }).toThrow(/Rule 009/);

    expect(() => {
      DeepAstroConstitution.assertNoMedicalDiagnosis('Traditional Ayurvedic Pitta balance and stress management recommended.');
    }).not.toThrow();
  });

  it('Rule 010: Prohibits guaranteed financial returns', () => {
    expect(() => {
      DeepAstroConstitution.assertNoGuaranteedReturns('Guaranteed profit of 500% in crypto next week');
    }).toThrow(/Rule 010/);

    expect(() => {
      DeepAstroConstitution.assertNoGuaranteedReturns('Favorable macroeconomic and planetary sector alignment for disciplined long-term investing.');
    }).not.toThrow();
  });

  it('Rule 016: Resolves server-authoritative identity and rejects client IDOR overrides', () => {
    expect(() => {
      DeepAstroConstitution.resolveAuthoritativeUser('user_actual_123', 'user_foreign_999');
    }).toThrow(/Rule 016/);

    expect(DeepAstroConstitution.resolveAuthoritativeUser('user_actual_123', 'user_actual_123')).toBe('user_actual_123');
    expect(DeepAstroConstitution.resolveAuthoritativeUser('user_actual_123')).toBe('user_actual_123');
  });

  it('Rule 017: Protects planetary ephemeris from learning mutation', () => {
    expect(() => {
      DeepAstroConstitution.assertLearningFirewall('planetary_ephemeris');
    }).toThrow(/Rule 017/);

    expect(() => {
      DeepAstroConstitution.assertLearningFirewall('ranking_weights');
    }).not.toThrow();
  });

  it('Rule 020: Fails closed on security anomalies', () => {
    expect(() => {
      DeepAstroConstitution.failClosed(new Error('Unauthorized token signature'));
    }).toThrow(/SECURITY_FAIL_CLOSED/);
  });
});
