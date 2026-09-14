import { describe, it, expect } from 'vitest';
import { CosmicFutureIntelligenceEngine } from '../server/src/intelligence/future/CosmicFutureIntelligenceEngine.js';
import { FutureConsentEngine } from '../server/src/intelligence/future/FutureConsentEngine.js';
import { db } from '../server/src/database/db.js';

describe('DEEPASTRO LIVING FUTURE MAP â€” Real User Generation', () => {
  it('Generates full 10-year future projection with valid consent and entitlement', async () => {
    const userId = 'usr_real_forecast_001';
    db.grantEntitlement(userId, 'FUTURE_INTELLIGENCE_PREMIUM');
    FutureConsentEngine.recordConsent(userId, true, 'LEVEL_1');

    const forecast = await CosmicFutureIntelligenceEngine.generateForecast({
      userId,
      birthProfile: {
        name: 'Siddhartha Roy',
        birthDate: '1995-11-18',
        birthTime: '06:45',
        birthPlace: 'Kolkata, India',
        latitude: 22.5726,
        longitude: 88.3639,
        timezone: 5.5,
      },
      horizon: '10_YEARS',
      requestedLevel: 'LEVEL_1',
      clientRole: 'CLIENT',
      bypassEntitlementForAdmin: true,
    });

    expect(forecast).toBeDefined();
    expect(forecast.id).toBeDefined();
    expect(forecast.yearForecasts.length).toBe(10);
    expect(forecast.overall10YearTheme).toBeDefined();
    expect(forecast.multiSystemConvergence.overallConvergence).toBeDefined();
    expect(forecast.domainForecasts).toBeDefined();
    expect(forecast.domainForecasts.CAREER).toBeDefined();
  });
});
