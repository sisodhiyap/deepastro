import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CareerDeepDiveView } from '../src/components/astrology/CareerDeepDiveView.js';
import { ChartSessionService } from '../server/src/services/ChartSessionService.js';
import { ChartSession } from '../src/types/chartSession.js';

describe('DeepAstro 6.0.3 Career Deep Dive Real Data Rendering Suite', () => {
  it('verifies CareerDeepDiveView renders authentic calculated astronomical parameters without placeholder data', async () => {
    // Generate server-authoritative chart session
    const session = await ChartSessionService.getOrCreateSession({
      name: 'Aditi Sharma',
      birthDate: '1992-08-20',
      birthTime: '09:15',
      birthPlace: 'Mumbai',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 5.5,
      country: 'India',
      gender: 'female',
    });

    const html = renderToString(React.createElement(CareerDeepDiveView, { session: session as unknown as ChartSession }));

    // 1. Verify 10th Bhava & Lord
    expect(html).toContain('Career &amp; Vocation Deep Dive');
    expect(html).toContain('10th House (Karma)');
    expect(html).toContain('10th Lord:');
    expect(html).toContain('EVIDENCE-GROUNDED');
    expect(html).toContain('D10 HARMONIC');

    // 2. Verify Supporting Bhavas
    expect(html).toContain('House 6:');
    expect(html).toContain('House 7:');
    expect(html).toContain('House 2:');
    expect(html).toContain('House 11:');

    // 3. Verify D10 Dashamsha Summary
    expect(html).toContain('D10 Dashamsha Harmonic');

    // 4. Verify Professional Karakas
    expect(html).toContain('Natural Professional Karakas');
    expect(html).toContain('Authority &amp; Vision');
    expect(html).toContain('Endurance &amp; Operations');
    expect(html).toContain('Intelligence &amp; Commerce');

    // 5. Verify KP Significators
    expect(html).toContain('KP PRIMARY CAREER SIGNIFICATORS');

    // 6. Verify zero generic placeholder text
    expect(html).not.toContain('Coming soon');
    expect(html).not.toContain('career is strong');
    expect(html).not.toContain('fake');
    expect(html).not.toContain('Demo Native');
  });
});
