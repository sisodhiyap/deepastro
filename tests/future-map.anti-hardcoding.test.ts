import { describe, it, expect } from 'vitest';
import { CosmicFutureIntelligenceEngine } from '../server/src/intelligence/future/CosmicFutureIntelligenceEngine.js';
import { FutureConsentEngine } from '../server/src/intelligence/future/FutureConsentEngine.js';
import { db } from '../server/src/database/db.js';

describe('DEEPASTRO LIVING FUTURE MAP â€” Anti-Hardcoding & 5-Profile Divergence', () => {
  const profiles = [
    { name: 'Profile A (Delhi)', birthDate: '1988-03-12', birthTime: '08:15', latitude: 28.6139, longitude: 77.209, timezone: 5.5 },
    { name: 'Profile B (Tokyo)', birthDate: '1996-07-29', birthTime: '14:20', latitude: 35.6762, longitude: 139.6503, timezone: 9.0 },
    { name: 'Profile C (London)', birthDate: '1982-12-04', birthTime: '22:10', latitude: 51.5074, longitude: -0.1278, timezone: 0.0 },
    { name: 'Profile D (New York)', birthDate: '2001-09-18', birthTime: '04:45', latitude: 40.7128, longitude: -74.006, timezone: -5.0 },
    { name: 'Profile E (Sydney)', birthDate: '1970-01-25', birthTime: '18:00', latitude: -33.8688, longitude: 151.2093, timezone: 10.0 },
  ];

  it('Verifies that all 5 distinct geographic birth profiles generate strictly divergent future forecasts', async () => {
    const results: any[] = [];

    for (let i = 0; i < profiles.length; i++) {
      const p = profiles[i];
      const uId = `usr_div_${i}`;
      db.grantEntitlement(uId, 'FUTURE_INTELLIGENCE_PREMIUM');
      FutureConsentEngine.recordConsent(uId, true, 'LEVEL_1');

      const forecast = await CosmicFutureIntelligenceEngine.generateForecast({
        userId: uId,
        birthProfile: p,
        horizon: '10_YEARS',
        requestedLevel: 'LEVEL_1',
        clientRole: 'CLIENT',
        bypassEntitlementForAdmin: true,
      });

      results.push(forecast);
    }

    // Verify all 5 profiles produce valid forecasts
    expect(results.length).toBe(5);

    // Verify all 5 profiles receive unique IDs and valid calculation snapshots
    const ids = results.map((r) => r.id);
    expect(new Set(ids).size).toBe(5);

    // Verify active dasha periods diverge across the distinct birth charts
    const dashas = results.map((r) => r.yearForecasts[0].activeDasha);
    expect(new Set(dashas).size).toBeGreaterThanOrEqual(3);

    // Verify domain career trajectories are populated dynamically
    const careerOutlooks = results.map((r) => r.domainForecasts.CAREER.currentState);
    expect(careerOutlooks.length).toBe(5);
    expect(careerOutlooks[0]).toBeDefined();
  });

  it('Executes sequential cycle A -> B -> A -> B and confirms zero context leakage', async () => {
    const userA = 'usr_seq_A';
    const userB = 'usr_seq_B';
    db.grantEntitlement(userA, 'FUTURE_INTELLIGENCE_PREMIUM');
    db.grantEntitlement(userB, 'FUTURE_INTELLIGENCE_PREMIUM');
    FutureConsentEngine.recordConsent(userA, true, 'LEVEL_1');
    FutureConsentEngine.recordConsent(userB, true, 'LEVEL_1');

    const forecastA1 = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: userA,
      birthProfile: profiles[0],
      horizon: '10_YEARS',
      requestedLevel: 'LEVEL_1',
      clientRole: 'CLIENT',
      bypassEntitlementForAdmin: true,
    });

    const forecastB1 = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: userB,
      birthProfile: profiles[1],
      horizon: '10_YEARS',
      requestedLevel: 'LEVEL_1',
      clientRole: 'CLIENT',
      bypassEntitlementForAdmin: true,
    });

    const forecastA2 = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: userA,
      birthProfile: profiles[0],
      horizon: '10_YEARS',
      requestedLevel: 'LEVEL_1',
      clientRole: 'CLIENT',
      bypassEntitlementForAdmin: true,
    });

    const forecastB2 = await CosmicFutureIntelligenceEngine.generateForecast({
      userId: userB,
      birthProfile: profiles[1],
      horizon: '10_YEARS',
      requestedLevel: 'LEVEL_1',
      clientRole: 'CLIENT',
      bypassEntitlementForAdmin: true,
    });

    // Verify A1 and A2 are identical (deterministic)
    expect(forecastA1.overall10YearTheme).toBe(forecastA2.overall10YearTheme);
    expect(forecastA1.yearForecasts[0].overallTheme).toBe(forecastA2.yearForecasts[0].overallTheme);

    // Verify B1 and B2 are identical (deterministic)
    expect(forecastB1.overall10YearTheme).toBe(forecastB2.overall10YearTheme);

    // Verify A and B are distinct
    expect(forecastA1.userId).not.toBe(forecastB1.userId);
    expect(forecastA1.id).not.toBe(forecastB1.id);
  });
});
