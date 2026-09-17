import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server/src/index.js';
import { COSMIC_HUB_TABS } from '../src/pages/CosmicHubPage.js';

describe('DEEPASTRO 6.4: Cosmic Hub Registry & Real-Time Endpoints', () => {
  it('1. Verifies typed registry integrity: all 6 tabs exist with distinct IDs', () => {
    expect(COSMIC_HUB_TABS.length).toBe(6);

    const ids = COSMIC_HUB_TABS.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(6);

    expect(ids).toContain('vibe');
    expect(ids).toContain('timing');
    expect(ids).toContain('sky');
    expect(ids).toContain('choghadiya');
    expect(ids).toContain('tarot');
    expect(ids).toContain('prashna');

    COSMIC_HUB_TABS.forEach((tab) => {
      expect(tab.label.length).toBeGreaterThan(0);
      expect(tab.badge.length).toBeGreaterThan(0);
      expect(tab.description.length).toBeGreaterThan(0);
    });
  });

  it('2. GET /api/cosmic/live-sky returns real astronomical planetary coordinates', async () => {
    const res = await request(app).get('/api/cosmic/live-sky');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.planets)).toBe(true);
    expect(res.body.planets.length).toBeGreaterThanOrEqual(9);
    expect(res.body.ayanamsha).toContain('Lahiri');
  });

  it('3. GET /api/cosmic/choghadiya-hora returns auspicious spans for coordinates', async () => {
    const res = await request(app).get('/api/cosmic/choghadiya-hora?lat=28.6139&lon=77.2090');
    expect(res.status).toBe(200);
    expect(res.body.currentChoghadiya).toBeDefined();
    expect(res.body.daySlots?.length).toBe(8);
    expect(res.body.nightSlots?.length).toBe(8);
  });

  it('4. GET /api/cosmic/moon-phase returns current lunar phase and manifestation guide', async () => {
    const res = await request(app).get('/api/cosmic/moon-phase');
    expect(res.status).toBe(200);
    expect(res.body.phaseName).toBeDefined();
    expect(res.body.moonSign).toBeDefined();
    expect(res.body.ritualGuide).toBeDefined();
  });

  it('5. GET /api/cosmic/daily-tarot returns daily Graha major arcana card', async () => {
    const res = await request(app).get('/api/cosmic/daily-tarot');
    expect(res.status).toBe(200);
    expect(res.body.cardName).toBeDefined();
    expect(res.body.vedicGraha).toBeDefined();
    expect(res.body.beejaMantra).toBeDefined();
  });
});
