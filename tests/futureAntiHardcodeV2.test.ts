import { describe, it, expect, beforeAll } from 'vitest';
import { CosmicFutureIntelligenceEngine } from '../server/src/intelligence/future/CosmicFutureIntelligenceEngine.js';
import { db } from '../server/src/database/db.js';
import { FutureConsentEngine } from '../server/src/intelligence/future/FutureConsentEngine.js';
import { BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('CFIE v2.0 — Anti-Hardcoding & Zero-Demo Variance Verification', () => {
  const profiles: Array<{ id: string; profile: BirthProfileInput }> = [
    {
      id: 'native-profile-1',
      profile: {
        name: 'Aarav Mehta',
        birthDate: '1985-03-21',
        birthTime: '06:30',
        birthPlace: 'Ahmedabad, India',
        latitude: 23.0225,
        longitude: 72.5714,
        timezone: 5.5,
        gender: 'Male',
      },
    },
    {
      id: 'native-profile-2',
      profile: {
        name: 'Priya Sen',
        birthDate: '1993-10-15',
        birthTime: '18:40',
        birthPlace: 'Kolkata, India',
        latitude: 22.5726,
        longitude: 88.3639,
        timezone: 5.5,
        gender: 'Female',
      },
    },
    {
      id: 'native-profile-3',
      profile: {
        name: 'Rohan Gupta',
        birthDate: '1978-07-04',
        birthTime: '11:15',
        birthPlace: 'Bengaluru, India',
        latitude: 12.9716,
        longitude: 77.5946,
        timezone: 5.5,
        gender: 'Male',
      },
    },
    {
      id: 'native-profile-4',
      profile: {
        name: 'Ananya Iyer',
        birthDate: '2001-01-28',
        birthTime: '23:55',
        birthPlace: 'Chennai, India',
        latitude: 13.0827,
        longitude: 80.2707,
        timezone: 5.5,
        gender: 'Female',
      },
    },
    {
      id: 'native-profile-5',
      profile: {
        name: 'Kabir Verma',
        birthDate: '1998-12-09',
        birthTime: '04:10',
        birthPlace: 'Shimla, India',
        latitude: 31.1048,
        longitude: 77.1734,
        timezone: 5.5,
        gender: 'Male',
      },
    },
  ];

  beforeAll(() => {
    // Setup entitlements and consent for all test profiles
    for (const p of profiles) {
      db.subscriptions.set(p.id, {
        id: `sub_${p.id}`,
        userId: p.id,
        planId: 'PRO',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 86400000).toISOString(),
      } as any);
      FutureConsentEngine.recordConsent(p.id, true, 'LEVEL_4');
    }
  });

  it('generates distinct, non-identical future forecasts across 5 isolated profiles', async () => {
    const forecasts: any[] = [];

    for (const p of profiles) {
      const forecast = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: p.id,
        birthProfile: p.profile,
        horizon: '10_YEARS',
        requestedLevel: 'LEVEL_4',
      });
      forecasts.push(forecast);
    }

    expect(forecasts).toHaveLength(5);

    // Verify distinct phases and themes
    const phases = forecasts.map((f) => f.currentLifePhase);
    const uniquePhases = new Set(phases);
    expect(uniquePhases.size).toBeGreaterThanOrEqual(3);

    // Verify distinct overall themes
    const themes = forecasts.map((f) => f.overall10YearTheme);
    const uniqueThemes = new Set(themes);
    expect(uniqueThemes.size).toBe(5);

    // Verify distinct timeline dasha rulers
    const dashaLords = forecasts.map((f) => f.yearForecasts[0].activeDasha);
    const uniqueLords = new Set(dashaLords);
    expect(uniqueLords.size).toBeGreaterThanOrEqual(3);

    // Verify strict zero occurrences of banned demo tokens
    const bannedTokens = [
      '1990-05-15',
      'Cosmic Seeker',
      'Peak Expansion Phase',
      'mid-2028',
      'Professional Elevation',
      'Spring Transition Cycle',
    ];

    for (const f of forecasts) {
      const serialized = JSON.stringify(f);
      for (const banned of bannedTokens) {
        expect(serialized).not.toContain(banned);
      }
    }
  });

  it('proves zero cross-user leakage across repeated access cycles (A -> B -> A -> B)', async () => {
    const userA = profiles[0];
    const userB = profiles[1];

    const runA1 = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: userA.id,
      birthProfile: userA.profile,
      horizon: '5_YEARS',
    });

    const runB1 = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: userB.id,
      birthProfile: userB.profile,
      horizon: '5_YEARS',
    });

    const runA2 = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: userA.id,
      birthProfile: userA.profile,
      horizon: '5_YEARS',
    });

    const runB2 = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: userB.id,
      birthProfile: userB.profile,
      horizon: '5_YEARS',
    });

    // Verify A1 and A2 are identical (deterministic)
    expect(runA1.overall10YearTheme).toBe(runA2.overall10YearTheme);
    expect(runA1.currentLifePhase).toBe(runA2.currentLifePhase);

    // Verify B1 and B2 are identical (deterministic)
    expect(runB1.overall10YearTheme).toBe(runB2.overall10YearTheme);
    expect(runB1.currentLifePhase).toBe(runB2.currentLifePhase);

    // Verify A does not contain B data
    expect(runA1.overall10YearTheme).not.toContain(userB.profile.name);
    expect(runB1.overall10YearTheme).not.toContain(userA.profile.name);
    expect(runA1.currentLifePhase).not.toBe(runB1.currentLifePhase);
  });
});
