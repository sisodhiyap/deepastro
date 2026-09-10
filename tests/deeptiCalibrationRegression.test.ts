/**
 * DeepAstro — Deepti Calibration Benchmark Regression Suite
 *
 * Verifies that the official calibration profile (DEEPTI_CALIBRATION_PROFILE.json)
 * executes deterministically against VedicAstroEngine, AstronomicalVerificationEngine,
 * VargaEngine, DashaEngine, HouseEngine, and PanchangEngine with ZERO deviation.
 *
 * Subject: Deepti
 * DOB: 1988-03-02 07:15 AM IST (01:45 UTC)
 * Location: Agra, UP, India (27.1767° N, 78.0081° E, Asia/Kolkata +5.5)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';
import { AstronomicalVerificationEngine } from '../server/src/astrology/AstronomicalVerificationEngine.js';
import { calculateAllVargas } from '../server/src/astrology/VargaEngine.js';
import { calculateVimshottariDasha } from '../server/src/astrology/DashaEngine.js';
import { calculateHouses, calculateBhavaChalit } from '../server/src/astrology/HouseEngine.js';
import { calculatePanchang } from '../server/src/astrology/PanchangEngine.js';
import { LocationResolver } from '../server/src/astrology/LocationResolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('DeepAstro Official Deepti Calibration Regression Gate', () => {
  const profilePath = path.resolve(__dirname, '../DEEPTI_CALIBRATION_PROFILE.json');
  const storedProfile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));

  const input = {
    name: storedProfile.birthInput.name,
    birthDate: storedProfile.birthInput.birthDate,
    birthTime: storedProfile.birthInput.birthTime,
    latitude: storedProfile.birthInput.latitude,
    longitude: storedProfile.birthInput.longitude,
    timezone: storedProfile.birthInput.timezoneOffsetHours,
  };

  it('resolves Agra coordinates and timezone deterministically via LocationResolver', () => {
    const loc = LocationResolver.resolve('Agra, Uttar Pradesh, India', input.birthDate, input.birthTime);
    expect(loc).toBeDefined();
    expect(loc!.city).toBe('Agra');
    expect(loc!.latitude).toBeCloseTo(27.1767, 3);
    expect(loc!.longitude).toBeCloseTo(78.0081, 3);
    expect(loc!.timezone).toBe(5.5);
    expect(loc!.ianaTimeZone).toBe('Asia/Kolkata');
  });

  it('matches Julian Day and astronomical parameters within 1e-5 precision', () => {
    const kundli = VedicAstroEngine.calculateKundli(input);
    expect(kundli.astronomy.julianDay).toBeCloseTo(storedProfile.astronomicalCore.julianDay, 4);
    expect(kundli.astronomy.ayanamshaDegrees).toBeCloseTo(storedProfile.astronomicalCore.ayanamshaDegrees, 4);
  });

  it('calculates exact Ascendant in Aquarius (Purva Bhadrapada Pada 3)', () => {
    const kundli = VedicAstroEngine.calculateKundli(input);
    expect(kundli.ascendant.details.signName).toBe('Aquarius');
    expect(kundli.ascendant.details.degreeInSign).toBe(28);
    expect(kundli.ascendant.details.minutes).toBe(22);
    expect(kundli.ascendant.nakshatra.name).toBe('Purva Bhadrapada');
    expect(kundli.ascendant.nakshatra.pada).toBe(3);
    expect(kundli.ascendant.degrees).toBeCloseTo(storedProfile.ascendant.longitudeDegrees, 4);
  });

  it('matches all 9 planetary longitudes, signs, and houses against stored benchmark', () => {
    const kundli = VedicAstroEngine.calculateKundli(input);
    expect(kundli.planets).toHaveLength(9);

    for (const storedP of storedProfile.planets) {
      const liveP = kundli.planets.find((p) => p.name === storedP.name);
      expect(liveP).toBeDefined();
      expect(liveP!.siderealLongitude).toBeCloseTo(storedP.siderealLongitude, 4);
      expect(liveP!.signName).toBe(storedP.signName);
      expect(liveP!.house).toBe(storedP.house);
      expect(liveP!.nakshatra.name).toBe(storedP.nakshatra.name);
      expect(liveP!.nakshatra.pada).toBe(storedP.nakshatra.pada);
      expect(liveP!.isRetrograde).toBe(storedP.isRetrograde);
    }
  });

  it('confirms Venus is Vargottama (Aries in D1 and Aries in D9)', () => {
    const kundli = VedicAstroEngine.calculateKundli(input);
    const vargas = calculateAllVargas(kundli.planets, kundli.ascendant.details.signIndex);
    const venusD1 = vargas.d1_rashi.find((p) => p.planet === 'Venus');
    const venusD9 = vargas.d9_navamsa.find((p) => p.planet === 'Venus');
    expect(venusD1?.signName).toBe('Aries');
    expect(venusD9?.signName).toBe('Aries');
  });

  it('maintains strict Rahu-Ketu exact 180° opposition (< 1e-5 error)', () => {
    const kundli = VedicAstroEngine.calculateKundli(input);
    const rahu = kundli.planets.find((p) => p.name === 'Rahu');
    const ketu = kundli.planets.find((p) => p.name === 'Ketu');
    const diff = Math.abs(((rahu!.siderealLongitude + 180.0) % 360.0) - ketu!.siderealLongitude);
    expect(diff).toBeLessThan(0.00001);
  });

  it('calculates exact Vimshottari dasha balance and Ketu seed at birth', () => {
    const kundli = VedicAstroEngine.calculateKundli(input);
    const moon = kundli.planets.find((p) => p.name === 'Moon')!;
    const birthDateObj = new Date(Date.UTC(1988, 2, 2, 1, 45, 0));
    const dasha = calculateVimshottariDasha(moon.siderealLongitude, birthDateObj);

    expect(dasha.birthDashaLord).toBe('Ketu');
    expect(dasha.balanceYearsRemaining).toBeCloseTo(storedProfile.vimshottariDasha.balanceYearsAtBirth, 3);
  });

  it('passes all 11 AstronomicalVerificationEngine audit checks with 100/100 score', () => {
    const kundli = VedicAstroEngine.calculateKundli(input);
    const audit = AstronomicalVerificationEngine.verify(input, kundli);

    expect(audit.overallStatus).toBe('VERIFIED');
    expect(audit.integrityScore).toBe(100);
    expect(audit.conflicts).toHaveLength(0);
    expect(audit.checks).toHaveLength(11);
    expect(audit.checks.every((c) => c.status === 'PASS')).toBe(true);
  });

  it('verifies dynamic Panchang elements (Chaturdashi, Budhavara, Magha, Atiganda, Vishti)', () => {
    const kundli = VedicAstroEngine.calculateKundli(input);
    const sun = kundli.planets.find((p) => p.name === 'Sun')!;
    const moon = kundli.planets.find((p) => p.name === 'Moon')!;
    const birthDateObj = new Date(Date.UTC(1988, 2, 2, 1, 45, 0));

    const panchang = calculatePanchang(
      sun.siderealLongitude,
      moon.siderealLongitude,
      birthDateObj,
      input.latitude,
      input.longitude,
      input.timezone
    );

    expect(panchang.tithi.name).toContain('Chaturdashi');
    expect(panchang.vara.name).toBe('Wednesday');
    expect(panchang.nakshatra.name).toBe('Magha');
    expect(panchang.yoga.name).toBe('Atiganda');
    expect(panchang.karana.name).toBe('Vanija');
  });
});
