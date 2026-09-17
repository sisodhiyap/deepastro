import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CareerDeepDiveView } from '../src/components/astrology/CareerDeepDiveView.js';
import { NakshatrasView } from '../src/components/astrology/NakshatrasView.js';
import { TransitsRadarView } from '../src/components/astrology/TransitsRadarView.js';
import { WealthDeepDiveView } from '../src/components/astrology/WealthDeepDiveView.js';
import { RelationshipsDeepDiveView } from '../src/components/astrology/RelationshipsDeepDiveView.js';
import { ChartSessionService } from '../server/src/services/ChartSessionService.js';
import { ChartSession } from '../src/types/chartSession.js';

describe('DeepAstro 6.0.3 Empty Module Detection & Content Restoration Suite', () => {
  let session: ChartSession;

  it('initializes real server-authoritative session for test native', async () => {
    session = (await ChartSessionService.getOrCreateSession({
      name: 'Rohan Verma',
      birthDate: '1988-11-14',
      birthTime: '17:45',
      birthPlace: 'Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
      timezone: 5.5,
      country: 'India',
      gender: 'male',
    })) as unknown as ChartSession;
    expect(session).toBeDefined();
    expect(session.vedic.planets.length).toBe(9);
    expect(session.vedic.houses.length).toBe(12);
  });

  it('verifies CareerDeepDiveView renders substantial non-blank content', () => {
    const html = renderToString(React.createElement(CareerDeepDiveView, { session }));
    expect(html.length).toBeGreaterThan(1500);
    expect(html).toContain('Career &amp; Vocation Deep Dive');
    expect(html).toContain('10th House (Karma)');
    expect(html).toContain(session.vedic.houses[9].sign);
  });

  it('verifies NakshatrasView renders all 9 Grahas and lunar mansion table without empty cards', () => {
    const html = renderToString(React.createElement(NakshatrasView, { session }));
    expect(html.length).toBeGreaterThan(1500);
    expect(html).toContain('Nakshatras (27 Lunar Mansions)');
    expect(html).toContain(session.vedic.moonNakshatra);
    expect(html).toContain(session.vedic.ascendantNakshatra);
    expect(html).toContain('Janma Nakshatra (Natal Moon)');
    expect(html).toContain('9 Grahas in their Lunar Mansions');
  });

  it('verifies TransitsRadarView renders live telemetry and active triggers without empty cards', () => {
    const html = renderToString(React.createElement(TransitsRadarView, { session }));
    expect(html.length).toBeGreaterThan(1000);
    expect(html).toContain('Transit Radar (Gochara Engine)');
    expect(html).toContain(session.currentCosmicWeather.transitMoonSign);
    expect(html).toContain(session.currentCosmicWeather.transitMoonNakshatra);
    expect(html).toContain(session.currentCosmicWeather.activeNatalTrigger);
  });

  it('verifies WealthDeepDiveView renders Dhana houses and wealth metrics without empty cards', () => {
    const html = renderToString(React.createElement(WealthDeepDiveView, { session }));
    expect(html.length).toBeGreaterThan(1500);
    expect(html).toContain('Wealth &amp; Dhana Deep Dive');
    expect(html).toContain('2nd House (Treasury / Net Worth)');
    expect(html).toContain('11th House (Recurring Inflows)');
    expect(html).toContain('5th Bhava (Purva Punya');
    expect(html).toContain('9th Bhava (Bhagya');
  });

  it('verifies RelationshipsDeepDiveView renders 7th house and D9 Navamsha harmonics without empty cards', () => {
    const html = renderToString(React.createElement(RelationshipsDeepDiveView, { session }));
    expect(html.length).toBeGreaterThan(1500);
    expect(html).toContain('Relationships &amp; Dharma Deep Dive');
    expect(html).toContain('7th House (Union &amp; Others)');
    expect(html).toContain('Venus (Love &amp; Chemistry)');
    expect(html).toContain('Jupiter (Dharmic Commitment)');
    expect(html).toContain('D9 Navamsha Soul &amp; Marital Harmonics');
  });
});
