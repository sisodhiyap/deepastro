/**
 * Dynamic Kundli Recalculation & Specimen Isolation Test Suite
 * Validates:
 * 1. User A vs User B distinct calculation and zero data leakage
 * 2. Zero specimen/dummy data in production reports
 * 3. Recalculation on birth time change
 * 4. Recalculation on location change
 * 5. Domain separation: Name change modifies numerology but preserves astronomy
 * 6. Sample Data Detector blocks specimen profiles
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { ReportComposer } from '../server/src/reports/PremiumKundliReportGenerator/ReportComposer.js';
import { PremiumPDFRenderer } from '../server/src/reports/PremiumKundliReportGenerator/PremiumPDFRenderer.js';
import { BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('Dynamic Kundli Recalculation & Specimen Isolation Suite', () => {
  const userA: BirthProfileInput = {
    name: 'Karan Mehra',
    birthDate: '1988-03-21',
    birthTime: '06:15',
    birthPlace: 'Kolkata, India',
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: 5.5,
    gender: 'Male',
    isApproximateTime: false,
  };

  const userB: BirthProfileInput = {
    name: 'Ananya Roy',
    birthDate: '2001-11-09',
    birthTime: '18:45',
    birthPlace: 'Mumbai, India',
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 5.5,
    gender: 'Female',
    isApproximateTime: false,
  };

  it('1. USER A vs USER B produces completely distinct calculations and verified PDFs', () => {
    const envelopeA = ReportComposer.compose(userA);
    const envelopeB = ReportComposer.compose(userB);

    // Assert profiles are distinct
    expect(envelopeA.report.profile.name).toBe('Karan Mehra');
    expect(envelopeB.report.profile.name).toBe('Ananya Roy');

    // Assert astronomical coordinates differ
    expect(envelopeA.report.snapshot.ascendantSign).not.toBe(envelopeB.report.snapshot.ascendantSign);
    expect(envelopeA.report.snapshot.moonSign).not.toBe(envelopeB.report.snapshot.moonSign);
    expect(envelopeA.report.snapshot.nakshatra).not.toBe(envelopeB.report.snapshot.nakshatra);

    // Render both PDFs
    const htmlA = PremiumPDFRenderer.renderHtml(envelopeA.report);
    const htmlB = PremiumPDFRenderer.renderHtml(envelopeB.report);

    // Verify PDF A contains User A and does not contain User B
    expect(htmlA).toContain('Karan Mehra');
    expect(htmlA).not.toContain('Ananya Roy');

    // Verify PDF B contains User B and does not contain User A
    expect(htmlB).toContain('Ananya Roy');
    expect(htmlB).not.toContain('Karan Mehra');

    // Verify checksums and report IDs are distinct
    expect(envelopeA.report.metadata.checksum).not.toBe(envelopeB.report.metadata.checksum);
    expect(envelopeA.report.metadata.reportId).not.toBe(envelopeB.report.metadata.reportId);
  });

  it('2. Production reports contain ZERO specimen dummy data ("Aarav Mehta")', () => {
    const envelopeB = ReportComposer.compose(userB);
    const htmlB = PremiumPDFRenderer.renderHtml(envelopeB.report);

    // Must never contain specimen name or specimen disclaimers
    expect(htmlB).not.toContain('Aarav Mehta');
    expect(htmlB).not.toContain('FICTIONAL DATA');
    expect(htmlB).not.toContain('ILLUSTRATIVE DESIGN SPECIMEN');
    expect(htmlB).not.toContain('NOT AN ACTUAL ASTROLOGICAL CALCULATION');

    // Must contain legitimate production disclaimers
    expect(htmlB).toContain('DEEPASTRO OFFICIAL DOSSIER');
    expect(htmlB).toContain('Prashant Sisodhiya');
  });

  it('3. Changing only Birth Time triggers complete astrological recalculation and new hash', () => {
    const userMorning = { ...userA, birthTime: '06:15' };
    const userEvening = { ...userA, birthTime: '18:45' };

    const morningEnvelope = ReportComposer.compose(userMorning);
    const eveningEnvelope = ReportComposer.compose(userEvening);

    // Ascendant should shift due to 12.5 hour difference
    expect(morningEnvelope.report.snapshot.ascendantSign).not.toBe(eveningEnvelope.report.snapshot.ascendantSign);
    expect(morningEnvelope.report.metadata.checksum).not.toBe(eveningEnvelope.report.metadata.checksum);
  });

  it('4. Changing only Location recalculates Ascendant, Bhavas, and Coordinates', () => {
    const userDelhi = { ...userA, birthPlace: 'New Delhi, India', latitude: 28.6139, longitude: 77.209, timezone: 5.5 };
    const userLondon = { ...userA, birthPlace: 'London, UK', latitude: 51.5074, longitude: -0.1278, timezone: 0.0 };

    const delhiEnvelope = ReportComposer.compose(userDelhi);
    const londonEnvelope = ReportComposer.compose(userLondon);

    // Coordinates and Ascendant must update
    expect(delhiEnvelope.report.profile.latitude).not.toBe(londonEnvelope.report.profile.latitude);
    expect(delhiEnvelope.report.profile.longitude).not.toBe(londonEnvelope.report.profile.longitude);
    expect(delhiEnvelope.report.snapshot.ascendantDegree).not.toBe(londonEnvelope.report.snapshot.ascendantDegree);
  });

  it('5. Changing only Name alters Numerology but preserves identical astronomical positions', () => {
    const personOne = { ...userA, name: 'Rohan Verma' };
    const personTwo = { ...userA, name: 'Vikramaditya Singhania' };

    const envOne = ReportComposer.compose(personOne);
    const envTwo = ReportComposer.compose(personTwo);

    // Planetary positions and Lagna remain identical
    expect(envOne.report.snapshot.ascendantSign).toBe(envTwo.report.snapshot.ascendantSign);
    expect(envOne.report.snapshot.moonSign).toBe(envTwo.report.snapshot.moonSign);
    expect(envOne.report.snapshot.nakshatra).toBe(envTwo.report.snapshot.nakshatra);

    // Name-based numerology destiny/expression changes
    expect(envOne.report.numerology.destinyName.number).not.toBe(envTwo.report.numerology.destinyName.number);
  });

  it('6. Sample Data Detector blocks "Aarav Mehta" when test flag is disabled', () => {
    const specimenProfile: BirthProfileInput = {
      name: 'Aarav Mehta',
      birthDate: '1996-08-14',
      birthTime: '07:42',
      birthPlace: 'New Delhi',
      latitude: 28.6139,
      longitude: 77.209,
      timezone: 5.5,
      gender: 'Male',
      isApproximateTime: false,
    };

    const originalEnv = process.env.NODE_ENV;
    const originalAllow = process.env.ALLOW_TEST_FIXTURES;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_TEST_FIXTURES;

      expect(() => {
        ReportComposer.compose(specimenProfile);
      }).toThrow(/SPECIMEN_DATA_DETECTED/);
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalAllow) process.env.ALLOW_TEST_FIXTURES = originalAllow;
    }
  });
});
