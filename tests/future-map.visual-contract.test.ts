import { describe, it, expect } from 'vitest';
import { UniversalCardOrchestrator } from '../server/src/chatbot/UniversalCardOrchestrator.js';

describe('DEEPASTRO LIVING FUTURE MAP â€” Visual Contract & AstroBot Card Parity', () => {
  it('Orchestrates validated FUTURE_INSIGHT card without template placeholders', () => {
    const res = UniversalCardOrchestrator.createFutureInsightCard({
      id: 'f_test_01',
      currentLifePhase: 'Expansion Phase',
      nextMajorWindow: 'Spring 2027',
      overall10YearTheme: 'Auspicious professional acceleration cycle',
      yearForecasts: [{ year: 2026, overallTheme: 'Consolidation', strongestDomain: 'CAREER' }],
    });

    expect(res.card.type).toBe('FUTURE_INSIGHT');
    expect(res.card.data.currentLifePhase).toBe('Expansion Phase');
    expect(res.actions.length).toBeGreaterThan(0);
  });

  it('Orchestrates validated FUTURE_YEAR card without template placeholders', () => {
    const res = UniversalCardOrchestrator.createFutureYearCard({
      year: 2028,
      overallTheme: 'Strategic Consolidation',
      strongestDomain: 'CAREER',
      careerOutlook: 'Strong leadership recognition',
      businessOutlook: 'Calculated expansion',
      financeOutlook: 'Steady portfolio growth',
    });

    expect(res.card.type).toBe('FUTURE_YEAR');
    expect(res.card.data.year).toBe(2028);
    expect(res.card.data.overallTheme).toBe('Strategic Consolidation');
    expect(res.card.data.strongestDomain).toBe('CAREER');
    expect(res.actions.length).toBeGreaterThan(0);
  });
});
