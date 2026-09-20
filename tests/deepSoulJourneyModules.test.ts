import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import jwt from 'jsonwebtoken';
import { db } from '../server/src/database/db.js';
import { PastLifeIntelligenceEngine } from '../server/src/intelligence/pastlife/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'deepastro_cosmic_super_secret_jwt_key_2026';

function createAuthToken(userId: string): string {
  db.users.set(userId, {
    id: userId,
    email: `${userId}@deepastro.test`,
    passwordHash: 'test_hash',
    role: 'CLIENT',
    fullName: 'Test Seeker',
    isActive: true,
    createdAt: new Date().toISOString(),
  } as any);
  return jwt.sign({ userId, email: `${userId}@deepastro.test`, role: 'CLIENT' }, JWT_SECRET, { expiresIn: '1h' });
}

describe('DEEPASTRO SOULTRACE: Deep Soul Journey & Four Interactive Modules', () => {
  const profileA = {
    fullName: 'Aarav Sharma',
    birthDate: '1995-08-15',
    birthTime: '10:15',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 'Asia/Kolkata',
    gender: 'Male',
  };

  const profileB = {
    fullName: 'Maya Lin',
    birthDate: '1988-11-04',
    birthTime: '18:45',
    birthPlace: 'San Francisco, CA, USA',
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
    gender: 'Female',
  };

  it('1. Generates authentic soulJourneyModules containing all 4 modules', () => {
    const res = PastLifeIntelligenceEngine.generate('usr_test_a', null, {
      overrides: profileA,
      format: 'soul_journey',
    });

    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    const modules = res.data!.soulJourneyModules;
    expect(modules).toBeDefined();

    // Module 1: Karmic Patterns
    expect(modules!.karmicPatterns).toBeDefined();
    expect(modules!.karmicPatterns.dominantTheme.planet).toBe('Saturn');
    expect(modules!.karmicPatterns.dominantTheme.sanskritName).toBe('Shani');
    expect(modules!.karmicPatterns.karmicAxis.axis).toBe('Rahu - Ketu');
    expect(modules!.karmicPatterns.keyPatterns).toHaveLength(5);
    expect(['Strong', 'Moderate', 'Mild']).toContain(modules!.karmicPatterns.keyPatterns[0].strength);
    expect(modules!.karmicPatterns.relatedPlanets.length).toBeGreaterThanOrEqual(3);
    expect(modules!.karmicPatterns.influencedHouses.length).toBeGreaterThanOrEqual(4);
    expect(modules!.karmicPatterns.insightQuote.quote).toBeDefined();

    // Module 2: Past Life Influences
    expect(modules!.pastLifeInfluences).toBeDefined();
    expect(modules!.pastLifeInfluences.archetype).toBeDefined();
    expect(modules!.pastLifeInfluences.setting).toBeDefined();
    expect(modules!.pastLifeInfluences.narrative.summary).toBeDefined();
    expect(modules!.pastLifeInfluences.currentLifeConnections.length).toBeGreaterThan(0);
    expect(modules!.pastLifeInfluences.astrologicalIndicators.length).toBeGreaterThan(0);

    // Module 3: Soul Lessons
    expect(modules!.soulLessons).toBeDefined();
    expect(modules!.soulLessons.primaryLesson.title).toBeDefined();
    expect(modules!.soulLessons.primaryLesson.indicators.length).toBeGreaterThan(0);
    expect(modules!.soulLessons.secondaryLessons.length).toBeGreaterThan(0);
    expect(modules!.soulLessons.supportingPlanets.length).toBeGreaterThanOrEqual(4);
    expect(modules!.soulLessons.practicalReflection).toBeDefined();

    // Module 4: Life Purpose
    expect(modules!.lifePurpose).toBeDefined();
    expect(modules!.lifePurpose.coreDirection.title).toBeDefined();
    expect(modules!.lifePurpose.careerAndContribution.title).toBeDefined();
    expect(modules!.lifePurpose.growthDirection.title).toBeDefined();
    expect(modules!.lifePurpose.practicalReflection).toBeDefined();
  });

  it('2. Demonstrates deterministic fingerprint and calculation divergence across profiles', () => {
    const resA1 = PastLifeIntelligenceEngine.generate('usr_test_a', null, { overrides: profileA });
    const resA2 = PastLifeIntelligenceEngine.generate('usr_test_a', null, { overrides: profileA });
    const resB = PastLifeIntelligenceEngine.generate('usr_test_b', null, { overrides: profileB });

    // Deterministic for same profile
    expect(resA1.data!.calculationFingerprint).toBe(resA2.data!.calculationFingerprint);
    expect(resA1.data!.soulJourneyModules!.karmicPatterns.dominantTheme.explanation).toBe(
      resA2.data!.soulJourneyModules!.karmicPatterns.dominantTheme.explanation
    );

    // Predictably diverges when birth coordinates differ
    expect(resA1.data!.calculationFingerprint).not.toBe(resB.data!.calculationFingerprint);
  });

  it('3. API endpoint /api/intelligence/past-life/generate delivers soulJourneyModules to client', async () => {
    const userId = `past-life-test-${Date.now()}`;
    const token = createAuthToken(userId);

    const res = await request(app)
      .post('/api/intelligence/past-life/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        format: 'soul_journey',
        birthProfile: profileA,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.schema.soulJourneyModules).toBeDefined();
    expect(res.body.schema.soulJourneyModules.karmicPatterns.dominantTheme.planet).toBe('Saturn');
    expect(res.body.schema.soulJourneyModules.karmicPatterns.keyPatterns.length).toBe(5);
    expect(res.body.provenance.calculationFingerprint).toBeDefined();
  });
});
