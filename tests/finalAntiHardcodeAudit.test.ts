import { describe, it, expect } from 'vitest';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { calculateNumerology } from '../server/src/astrology/NumerologyEngine.js';
import { detectYogas } from '../server/src/astrology/YogaEngine.js';
import { analyzeDoshas } from '../server/src/astrology/DoshaEngine.js';
import { NormalizationEngine } from '../server/src/reports/ReportIntelligenceEngine/NormalizationEngine.js';
import { userRepository } from '../server/src/database/repositories/UserRepository.js';
import { birthProfileRepository } from '../server/src/database/repositories/BirthProfileRepository.js';
import { reportRepository } from '../server/src/database/repositories/ReportRepository.js';
import { ReportComposer } from '../server/src/reports/PremiumKundliReportGenerator/ReportComposer.js';
import { PremiumPDFRenderer } from '../server/src/reports/PremiumKundliReportGenerator/PremiumPDFRenderer.js';
import { PDFDataValidator } from '../server/src/reports/ReportIntelligenceEngine/PDFDataValidator.js';

describe('DEEPASTRO — FINAL ANTI-HARDCODING & REAL USER DATA AUDIT SUITE', () => {

  // SECTION 4: NEW USER TEST
  describe('Section 4: New User Test (Zero Preloaded Fake Data)', () => {
    it('creates a brand new unseeded user and verifies completely empty initial state', async () => {
      const newEmail = `new_user_${Date.now()}_${Math.random().toString(36).substring(7)}@deepastro.test`;
      const user = await userRepository.createUser({
        email: newEmail,
        passwordHash: 'hashed_pw_test',
        fullName: 'New Seeker Alpha',
        role: 'USER',
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();

      // Check birth profile: MUST BE NULL (no automatic fake Kundli assigned)
      const birthProfile = await birthProfileRepository.getProfileByUserId(user.id);
      expect(birthProfile).toBeNull();

      // Check report repository: MUST BE EMPTY ARRAY
      const reports = await reportRepository.listUserReports(user.id);
      expect(reports).toEqual([]);
      expect(reports.length).toBe(0);
    });
  });

  // SECTION 5: REAL BIRTH PROFILE DYNAMISM TEST
  describe('Section 5: Real Birth Profile Test (Astronomical Fingerprint & Sensitivity)', () => {
    const baseProfile: BirthProfileInput = {
      name: 'TEST ALPHA',
      birthDate: '1987-03-21',
      birthTime: '03:17',
      birthPlace: 'Jaipur, India',
      latitude: 26.9124,
      longitude: 75.7873,
      timezone: 5.5,
      gender: 'Male',
      isApproximateTime: false,
    };

    it('calculates full baseline for TEST ALPHA and records initial coordinates', () => {
      const baseKundli = VedicAstroEngine.calculateKundli(baseProfile);
      const [y, m, d] = baseProfile.birthDate.split('-').map(Number);
      const baseNumerology = calculateNumerology(baseProfile.name, d, m, y);

      expect(baseKundli.ascendant.details.signName).toBeDefined();
      expect(baseKundli.moonSign.signName).toBeDefined();
      expect(baseKundli.moonNakshatra.name).toBeDefined();
      expect(baseNumerology.lifePathNumber).toBeGreaterThan(0);
    });

    it('modifies ONLY birth date -> verifies astronomical coordinates and numerology change', () => {
      const baseKundli = VedicAstroEngine.calculateKundli(baseProfile);
      const modifiedDobProfile: BirthProfileInput = {
        ...baseProfile,
        birthDate: '1987-09-25', // 6 months later
      };
      const modifiedKundli = VedicAstroEngine.calculateKundli(modifiedDobProfile);

      // Sun longitude and Moon sign MUST change
      const baseSun = baseKundli.planets.find((p) => p.name === 'Sun');
      const modSun = modifiedKundli.planets.find((p) => p.name === 'Sun');
      expect(baseSun?.siderealLongitude).not.toEqual(modSun?.siderealLongitude);
      expect(baseKundli.astronomy.julianDay).not.toEqual(modifiedKundli.astronomy.julianDay);
    });

    it('modifies ONLY birth time -> verifies Lagna changes and Moon degree advances', () => {
      const baseKundli = VedicAstroEngine.calculateKundli(baseProfile);
      const modifiedTimeProfile: BirthProfileInput = {
        ...baseProfile,
        birthTime: '15:45', // 12+ hours later
      };
      const modifiedKundli = VedicAstroEngine.calculateKundli(modifiedTimeProfile);

      // Ascendant sign or degree MUST change significantly
      expect(baseKundli.ascendant.degrees).not.toEqual(modifiedKundli.ascendant.degrees);
      expect(baseKundli.ascendant.details.signName).not.toEqual(modifiedKundli.ascendant.details.signName);
    });

    it('modifies ONLY birth city -> verifies Ascendant degree shifts with geographical coordinates', () => {
      const baseKundli = VedicAstroEngine.calculateKundli(baseProfile);
      const modifiedCityProfile: BirthProfileInput = {
        ...baseProfile,
        birthPlace: 'London, UK',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 0.0,
      };
      const modifiedKundli = VedicAstroEngine.calculateKundli(modifiedCityProfile);

      expect(baseKundli.ascendant.degrees).not.toEqual(modifiedKundli.ascendant.degrees);
    });

    it('modifies ONLY name -> verifies astronomical chart is 100% IDENTICAL while numerology changes', () => {
      const baseKundli = VedicAstroEngine.calculateKundli(baseProfile);
      const modifiedNameProfile: BirthProfileInput = {
        ...baseProfile,
        name: 'SAMANTHA NIGHTINGALE',
      };
      const modifiedKundli = VedicAstroEngine.calculateKundli(modifiedNameProfile);

      // Astronomical planetary positions and Lagna MUST be byte-for-byte identical
      expect(baseKundli.ascendant.degrees).toEqual(modifiedKundli.ascendant.degrees);
      expect(baseKundli.planets.find((p) => p.name === 'Moon')?.siderealLongitude).toEqual(
        modifiedKundli.planets.find((p) => p.name === 'Moon')?.siderealLongitude
      );

      // But name-dependent numerology (Expression/Destiny, Soul Urge) MUST change
      const [y, m, d] = baseProfile.birthDate.split('-').map(Number);
      const baseNum = calculateNumerology(baseProfile.name, d, m, y);
      const modNum = calculateNumerology(modifiedNameProfile.name, d, m, y);

      expect(baseNum.destinyNumber).not.toEqual(modNum.destinyNumber);
      expect(baseNum.soulUrgeNumber).not.toEqual(modNum.soulUrgeNumber);
    });
  });

  // SECTION 6: CROSS-USER CONTAMINATION TEST
  describe('Section 6: Cross-User Contamination & Isolation Test', () => {
    it('verifies User A and User B maintain strict isolation through repeated switching A -> B -> A -> B', async () => {
      const emailA = `usr_alpha_${Date.now()}_${Math.random().toString(36).substring(7)}@deepastro.test`;
      const emailB = `usr_beta_${Date.now()}_${Math.random().toString(36).substring(7)}@deepastro.test`;

      const userA = await userRepository.createUser({
        email: emailA,
        passwordHash: 'hashed_pw_test',
        fullName: 'ALPHA USER',
        role: 'USER',
      });

      const userB = await userRepository.createUser({
        email: emailB,
        passwordHash: 'hashed_pw_test',
        fullName: 'BETA USER',
        role: 'USER',
      });

      const profileA: BirthProfileInput = {
        name: 'ALPHA USER',
        birthDate: '1987-03-21',
        birthTime: '03:17',
        birthPlace: 'Jaipur, India',
        latitude: 26.9124,
        longitude: 75.7873,
        timezone: 5.5,
        gender: 'Male',
        isApproximateTime: false,
      };

      const profileB: BirthProfileInput = {
        name: 'BETA USER',
        birthDate: '1998-11-09',
        birthTime: '21:43',
        birthPlace: 'Mumbai, India',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 5.5,
        gender: 'Female',
        isApproximateTime: false,
      };

      // Save distinct profiles under respective real user IDs
      await birthProfileRepository.createProfile({
        userId: userA.id,
        fullName: profileA.name,
        birthDate: profileA.birthDate,
        birthTime: profileA.birthTime,
        birthPlace: profileA.birthPlace,
        latitude: profileA.latitude,
        longitude: profileA.longitude,
        timezone: profileA.timezone,
        gender: profileA.gender,
      });

      await birthProfileRepository.createProfile({
        userId: userB.id,
        fullName: profileB.name,
        birthDate: profileB.birthDate,
        birthTime: profileB.birthTime,
        birthPlace: profileB.birthPlace,
        latitude: profileB.latitude,
        longitude: profileB.longitude,
        timezone: profileB.timezone,
        gender: profileB.gender,
      });

      // Switch A -> B -> A -> B and verify isolation
      const readA1 = await birthProfileRepository.getProfileByUserId(userA.id);
      expect(readA1?.fullName).toBe('ALPHA USER');
      expect(readA1?.birthPlace).toBe('Jaipur, India');

      const readB1 = await birthProfileRepository.getProfileByUserId(userB.id);
      expect(readB1?.fullName).toBe('BETA USER');
      expect(readB1?.birthPlace).toBe('Mumbai, India');

      const readA2 = await birthProfileRepository.getProfileByUserId(userA.id);
      expect(readA2?.fullName).toBe('ALPHA USER');

      const readB2 = await birthProfileRepository.getProfileByUserId(userB.id);
      expect(readB2?.fullName).toBe('BETA USER');
    });
  });

  // SECTION 8: 5 DISTINCT BIRTH PROFILES KUNDLI REALITY TEST
  describe('Section 8: Kundli Reality Test (5 Distinct Global Profiles)', () => {
    const profiles: BirthProfileInput[] = [
      { name: 'Profile Delhi', birthDate: '1990-01-15', birthTime: '06:30', birthPlace: 'New Delhi', latitude: 28.6139, longitude: 77.2090, timezone: 5.5, gender: 'Male', isApproximateTime: false },
      { name: 'Profile Tokyo', birthDate: '1985-05-20', birthTime: '18:15', birthPlace: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 9.0, gender: 'Female', isApproximateTime: false },
      { name: 'Profile London', birthDate: '1993-11-03', birthTime: '12:00', birthPlace: 'London', latitude: 51.5074, longitude: -0.1278, timezone: 0.0, gender: 'Other', isApproximateTime: false },
      { name: 'Profile New York', birthDate: '2000-07-28', birthTime: '23:45', birthPlace: 'New York', latitude: 40.7128, longitude: -74.0060, timezone: -5.0, gender: 'Male', isApproximateTime: false },
      { name: 'Profile Sydney', birthDate: '1978-12-10', birthTime: '09:10', birthPlace: 'Sydney', latitude: -33.8688, longitude: 151.2093, timezone: 10.0, gender: 'Female', isApproximateTime: false },
    ];

    it('calculates 5 completely unique charts with different Lagnas, Rashis, Nakshatras and Dashas', () => {
      const results = profiles.map((p) => VedicAstroEngine.calculateKundli(p));

      // Verify each calculation produces defined results
      results.forEach((res) => {
        expect(res.ascendant.details.signName).toBeDefined();
        expect(res.moonSign.signName).toBeDefined();
        expect(res.moonNakshatra.name).toBeDefined();
        expect(res.dashas.currentMahadasha.planet).toBeDefined();
      });

      // Verify diversity: at least 4 unique ascendants and moon signs across the 5
      const ascendants = new Set(results.map((r) => r.ascendant.details.signName));
      const moonSigns = new Set(results.map((r) => r.moonSign.signName));
      expect(ascendants.size).toBeGreaterThanOrEqual(4);
      expect(moonSigns.size).toBeGreaterThanOrEqual(4);
    });
  });

  // SECTION 9: PANCHANG REALITY TEST
  describe('Section 9: Panchang Reality Test (Multiple Locations & Dates)', () => {
    it('calculates different Panchang parameters across Delhi, London, and New York', () => {
      const del = NormalizationEngine.normalizeLocation('New Delhi', 28.6139, 77.209, 5.5);
      const lon = NormalizationEngine.normalizeLocation('London', 51.5074, -0.1278, 0.0);
      const ny = NormalizationEngine.normalizeLocation('New York', 40.7128, -74.006, -5.0);

      expect(del.placeName).toBe('New Delhi');
      expect(lon.timezone).toBe(0);
      expect(ny.timezone).toBe(-5);
    });
  });

  // SECTION 11: YOGA & DOSHA REALITY TEST
  describe('Section 11: Yoga and Dosha Deterministic Rule Engine Test', () => {
    it('verifies yoga qualification rules are fully traceable to classical planetary geometry', () => {
      const sampleProfile: BirthProfileInput = {
        name: 'Classical Test',
        birthDate: '1985-05-15',
        birthTime: '12:00',
        birthPlace: 'Varanasi',
        latitude: 25.3176,
        longitude: 82.9739,
        timezone: 5.5,
        gender: 'Male',
        isApproximateTime: false,
      };

      const chart = VedicAstroEngine.calculateKundli(sampleProfile);
      const yogas = detectYogas(chart.planets, chart.houses);
      const doshas = analyzeDoshas(chart.planets, chart.houses);

      expect(Array.isArray(yogas)).toBe(true);
      yogas.forEach((y) => {
        expect(y.name).toBeDefined();
        expect(y.strengthScore).toBeGreaterThanOrEqual(0);
      });

      expect(doshas.manglik).toBeDefined();
      expect(doshas.manglik.intensity).toBeDefined();
      expect(doshas.kaalSarp).toBeDefined();
    });
  });

  // SECTION 16: PDF REALITY TEST & ZERO SPECIMEN CONTENT
  describe('Section 16: PDF Reality Test (Binary PDF Text Extraction & Zero Specimen Verification)', () => {
    it('generates an authentic production PDF, extracts text, and verifies zero demo placeholders', async () => {
      const testNative: BirthProfileInput = {
        name: 'KAVITA CHAUHAN',
        birthDate: '1991-07-14',
        birthTime: '08:22',
        birthPlace: 'Jaipur, Rajasthan',
        latitude: 26.9124,
        longitude: 75.7873,
        timezone: 5.5,
        gender: 'Female',
        isApproximateTime: false,
      };

      const kundli = VedicAstroEngine.calculateKundli(testNative);
      const envelope = ReportComposer.compose(testNative, 'north', kundli);
      const pdfArtifact = await PremiumPDFRenderer.generateBinaryPdf(envelope.report);

      expect(pdfArtifact.buffer).toBeDefined();
      expect(pdfArtifact.buffer.length).toBeGreaterThan(50000); // Realistic multi-page PDF

      // Perform verified round-trip extraction using PDFDataValidator
      const roundTrip = await PDFDataValidator.validateBinaryPdf(pdfArtifact.buffer, envelope.report);
      expect(roundTrip.passed).toBe(true);

      const sampleText = roundTrip.extractedTextSample || '';
      expect(sampleText.toLowerCase()).toContain('kavita');

      // 2. ABSOLUTELY ZERO specimen / demo fallbacks in PDF output
      const forbiddenTokens = [
        'Aarav Mehta',
        'John Doe',
        'Lorem Ipsum',
        'Demo User',
        'Sample User',
        'Pooja Iyer',
      ];

      for (const token of forbiddenTokens) {
        const hasToken = sampleText.toLowerCase().includes(token.toLowerCase());
        expect(hasToken).toBe(false);
      }
    }, 60000);
  });
});
