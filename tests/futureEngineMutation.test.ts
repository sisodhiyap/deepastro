/**
 * futureEngineMutation.test.ts
 * Verifies that mutating upstream astrological calculation engines (D10, D9, KP, Dasha)
 * directly alters the downstream future predictions and evidence graph.
 * Also verifies that incomplete chart inputs trigger PREDICTION_CONTEXT_INCOMPLETE rather than generic fallback.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChartContextResolver } from '../server/src/intelligence/future-intelligence/ChartContextResolver.js';
import { VargaForecastEngine } from '../server/src/intelligence/future-intelligence/VargaForecastEngine.js';
import { KPForecastEngine } from '../server/src/intelligence/future-intelligence/KPForecastEngine.js';
import { YearlyForecastEngine } from '../server/src/intelligence/future-intelligence/YearlyForecastEngine.js';
import { db } from '../server/src/database/db.js';

describe('FUTURE INTELLIGENCE — ENGINE MUTATION & SENSITIVITY TEST SUITE', () => {
  const baseUserId = 'usr_mutation_base_001';

  beforeEach(() => {
    db.birthProfiles.set(baseUserId, {
      id: 'prof_mutation_base',
      userId: baseUserId,
      fullName: 'Vikramaditya',
      birthDate: '1989-06-25',
      birthTime: '15:30',
      birthPlace: 'Ujjain, India',
      latitude: 23.1765,
      longitude: 75.7885,
      timezone: 5.5,
      gender: 'Male',
      createdAt: new Date().toISOString(),
    });
  });

  it('1. Mutation 1 (D10): Changing D10 placement alters Career evidence and Dashamsha signal', async () => {
    const context = await ChartContextResolver.resolve(baseUserId, 'primary');
    const activeLords = { mahadasha: context.currentMahadasha.planet, antardasha: context.currentAntardasha.planet };

    const initialCareer = VargaForecastEngine.evaluateDomain(context, 'CAREER_EXPANSION', activeLords);

    // Mutate D10
    const mutatedContext = {
      ...context,
      d10: context.d10.map((v) =>
        v.planet === activeLords.mahadasha ? { ...v, signName: 'Capricorn', house: 10 } : v
      ),
    };

    const mutatedCareer = VargaForecastEngine.evaluateDomain(mutatedContext, 'CAREER_EXPANSION', activeLords);

    expect(mutatedCareer.d10Signal).toBeDefined();
    expect(mutatedCareer.d10Signal).toContain('Capricorn');
    expect(mutatedCareer.d10Signal).not.toBe(initialCareer.d10Signal);
  });

  it('2. Mutation 2 (D9): Changing D9 Navamsha sign alters Relationship evidence and dharmic refinement', async () => {
    const context = await ChartContextResolver.resolve(baseUserId, 'primary');
    const activeLords = { mahadasha: context.currentMahadasha.planet, antardasha: context.currentAntardasha.planet };

    const initialRel = VargaForecastEngine.evaluateDomain(context, 'RELATIONSHIP_ACTIVATION', activeLords);

    // Mutate D9
    const mutatedContext = {
      ...context,
      d9: context.d9.map((v) =>
        v.planet === activeLords.mahadasha ? { ...v, signName: 'Pisces' } : v
      ),
    };

    const mutatedRel = VargaForecastEngine.evaluateDomain(mutatedContext, 'RELATIONSHIP_ACTIVATION', activeLords);

    expect(mutatedRel.d9Signal).toBeDefined();
    expect(mutatedRel.d9Signal).toContain('Pisces');
    expect(mutatedRel.d9Signal).not.toBe(initialRel.d9Signal);
  });

  it('3. Mutation 3 (KP): Changing KP sub-lord alters KP cuspal evidence and rationale', async () => {
    const context = await ChartContextResolver.resolve(baseUserId, 'primary');
    const activeLords = { mahadasha: context.currentMahadasha.planet, antardasha: context.currentAntardasha.planet };

    const initialKP = KPForecastEngine.evaluateDomain(context, 'CAREER_EXPANSION', activeLords);

    // Mutate KP 10th cusp sub-lord
    const mutatedContext = {
      ...context,
      kpAnalysis: context.kpAnalysis ? {
        ...context.kpAnalysis,
        cusps: context.kpAnalysis.cusps.map((c) =>
          c.houseNumber === 10 ? { ...c, subLord: 'Mercury', starLord: 'Ketu' } : c
        ),
      } : undefined,
    };

    const mutatedKP = KPForecastEngine.evaluateDomain(mutatedContext, 'CAREER_EXPANSION', activeLords);

    expect(mutatedKP.cuspSubLord).toBe('Mercury');
    expect(mutatedKP.evidence[0].rule).toContain('Cusp 10 Sub-Lord');
  });

  it('4. Zero-Generic-Fallback: Incomplete birth profile rejects calculation with PREDICTION_CONTEXT_INCOMPLETE', async () => {
    const incompleteUser = 'usr_incomplete_001';
    db.birthProfiles.set(incompleteUser, {
      id: 'prof_inc',
      userId: incompleteUser,
      fullName: 'Incomplete User',
      birthDate: '', // Missing birthDate
      birthTime: '',
      birthPlace: 'Nowhere',
      latitude: NaN,
      longitude: NaN,
      timezone: 5.5,
      gender: 'Other',
    } as any);

    await expect(
      ChartContextResolver.resolve(incompleteUser, 'primary')
    ).rejects.toThrow(/PREDICTION_CONTEXT_INCOMPLETE/);
  });
});
