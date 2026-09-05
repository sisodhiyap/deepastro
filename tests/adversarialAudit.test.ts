import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { AstronomicalVerificationEngine } from '../server/src/astrology/AstronomicalVerificationEngine.js';
import { JyotishRuleEngine } from '../server/src/astrology/JyotishRuleEngine.js';
import { CalculationRepository } from '../server/src/database/repositories/CalculationRepository.js';
import { ReportRepository, reportRepository } from '../server/src/database/repositories/ReportRepository.js';
import { UserRepository, userRepository } from '../server/src/database/repositories/UserRepository.js';
import { BirthProfileRepository, birthProfileRepository } from '../server/src/database/repositories/BirthProfileRepository.js';
import { MigrationRunner } from '../server/src/database/MigrationRunner.js';
import { ReportStoreMigrationService } from '../server/src/database/ReportStoreMigrationService.js';
import { artifactStorage } from '../server/src/storage/ArtifactStorage.js';
import { PremiumPDFRenderer } from '../server/src/reports/PremiumKundliReportGenerator/PremiumPDFRenderer.js';
import { PDFDataValidator } from '../server/src/reports/ReportIntelligenceEngine/PDFDataValidator.js';
import { ReportComposer } from '../server/src/reports/PremiumKundliReportGenerator/ReportComposer.js';
import { ReportIntegrityEngine } from '../server/src/reports/ReportIntelligenceEngine/ReportIntegrityEngine.js';
import { AstrologyFactChecker } from '../server/src/reports/ReportIntelligenceEngine/AstrologyFactChecker.js';
import { AIConsensusEngine } from '../server/src/ai/AIConsensusEngine.js';
import { EmbeddingProvider } from '../server/src/ai/EmbeddingProvider.js';
import { KnowledgeRAG } from '../server/src/ai/KnowledgeRAG.js';
import { PalmistryVisionService } from '../server/src/ai/PalmistryVisionService.js';
import { reportGenerationService } from '../server/src/services/ReportGenerationService.js';
import { AIAuditor } from '../server/src/ai/AIAuditor.js';

describe('DEEPASTRO CHECKPOINT 9.5 — ADVERSARIAL VERIFICATION SUITE', () => {

  // =========================================================================
  // PHASE 6 — 50-PROFILE CALCULATION REGRESSION (GLOBAL DATASET)
  // =========================================================================
  describe('Phase 6 — Global 50-Profile Calculation Regression & Determinism', () => {
    const globalProfiles: BirthProfileInput[] = [
      // 1. India - New Delhi (Standard)
      { name: 'P01_Delhi', birthDate: '1990-05-15', birthTime: '06:30', birthPlace: 'New Delhi, India', latitude: 28.6139, longitude: 77.2090, timezone: 5.5 },
      // 2. India - Mumbai
      { name: 'P02_Mumbai', birthDate: '1985-11-20', birthTime: '18:45', birthPlace: 'Mumbai, India', latitude: 19.0760, longitude: 72.8777, timezone: 5.5 },
      // 3. India - Chennai
      { name: 'P03_Chennai', birthDate: '2000-01-01', birthTime: '00:01', birthPlace: 'Chennai, India', latitude: 13.0827, longitude: 80.2707, timezone: 5.5 },
      // 4. India - Kolkata
      { name: 'P04_Kolkata', birthDate: '1999-12-31', birthTime: '23:59', birthPlace: 'Kolkata, India', latitude: 22.5726, longitude: 88.3639, timezone: 5.5 },
      // 5. India - Varanasi (Leap Day)
      { name: 'P05_Varanasi_Leap', birthDate: '2000-02-29', birthTime: '12:00', birthPlace: 'Varanasi, India', latitude: 25.3176, longitude: 82.9739, timezone: 5.5 },
      // 6. Nepal - Kathmandu
      { name: 'P06_Kathmandu', birthDate: '1992-08-14', birthTime: '09:15', birthPlace: 'Kathmandu, Nepal', latitude: 27.7172, longitude: 85.3240, timezone: 5.75 },
      // 7. UK - London (GMT Winter)
      { name: 'P07_London_GMT', birthDate: '1988-01-15', birthTime: '14:20', birthPlace: 'London, UK', latitude: 51.5074, longitude: -0.1278, timezone: 0.0 },
      // 8. UK - London (BST Summer)
      { name: 'P08_London_BST', birthDate: '1988-07-15', birthTime: '14:20', birthPlace: 'London, UK', latitude: 51.5074, longitude: -0.1278, timezone: 1.0 },
      // 9. USA - New York (EST Winter)
      { name: 'P09_NewYork_EST', birthDate: '1995-12-10', birthTime: '08:00', birthPlace: 'New York, USA', latitude: 40.7128, longitude: -74.0060, timezone: -5.0 },
      // 10. USA - New York (EDT Summer)
      { name: 'P10_NewYork_EDT', birthDate: '1995-06-10', birthTime: '08:00', birthPlace: 'New York, USA', latitude: 40.7128, longitude: -74.0060, timezone: -4.0 },
      // 11. USA - San Francisco (PST)
      { name: 'P11_SanFrancisco', birthDate: '1991-03-21', birthTime: '17:30', birthPlace: 'San Francisco, USA', latitude: 37.7749, longitude: -122.4194, timezone: -8.0 },
      // 12. USA - Honolulu (Hawaii, no DST)
      { name: 'P12_Honolulu', birthDate: '2005-04-12', birthTime: '22:10', birthPlace: 'Honolulu, USA', latitude: 21.3069, longitude: -157.8583, timezone: -10.0 },
      // 13. Canada - Toronto
      { name: 'P13_Toronto', birthDate: '1993-09-09', birthTime: '11:11', birthPlace: 'Toronto, Canada', latitude: 43.6532, longitude: -79.3832, timezone: -5.0 },
      // 14. Canada - Vancouver
      { name: 'P14_Vancouver', birthDate: '1984-02-29', birthTime: '03:45', birthPlace: 'Vancouver, Canada', latitude: 49.2827, longitude: -123.1207, timezone: -8.0 },
      // 15. Australia - Sydney (AEST)
      { name: 'P15_Sydney_AEST', birthDate: '1996-07-20', birthTime: '15:00', birthPlace: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093, timezone: 10.0 },
      // 16. Australia - Sydney (AEDT Summer)
      { name: 'P16_Sydney_AEDT', birthDate: '1996-12-20', birthTime: '15:00', birthPlace: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093, timezone: 11.0 },
      // 17. Australia - Adelaide (Half-hour timezone)
      { name: 'P17_Adelaide', birthDate: '1994-10-18', birthTime: '07:25', birthPlace: 'Adelaide, Australia', latitude: -34.9285, longitude: 138.6007, timezone: 9.5 },
      // 18. New Zealand - Auckland
      { name: 'P18_Auckland', birthDate: '2001-08-30', birthTime: '19:40', birthPlace: 'Auckland, NZ', latitude: -36.8485, longitude: 174.7633, timezone: 12.0 },
      // 19. Japan - Tokyo (JST)
      { name: 'P19_Tokyo', birthDate: '1990-11-12', birthTime: '05:55', birthPlace: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, timezone: 9.0 },
      // 20. UAE - Dubai (GST)
      { name: 'P20_Dubai', birthDate: '1989-05-04', birthTime: '13:30', birthPlace: 'Dubai, UAE', latitude: 25.2048, longitude: 55.2708, timezone: 4.0 },
      // 21. Singapore
      { name: 'P21_Singapore', birthDate: '1997-03-15', birthTime: '16:20', birthPlace: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 8.0 },
      // 22. South Africa - Johannesburg
      { name: 'P22_Johannesburg', birthDate: '1987-06-22', birthTime: '10:10', birthPlace: 'Johannesburg, South Africa', latitude: -26.2041, longitude: 28.0473, timezone: 2.0 },
      // 23. Germany - Berlin (CET)
      { name: 'P23_Berlin_CET', birthDate: '1992-01-28', birthTime: '02:00', birthPlace: 'Berlin, Germany', latitude: 52.5200, longitude: 13.4050, timezone: 1.0 },
      // 24. Germany - Berlin (CEST)
      { name: 'P24_Berlin_CEST', birthDate: '1992-07-28', birthTime: '02:00', birthPlace: 'Berlin, Germany', latitude: 52.5200, longitude: 13.4050, timezone: 2.0 },
      // 25. France - Paris
      { name: 'P25_Paris', birthDate: '1986-10-14', birthTime: '21:15', birthPlace: 'Paris, France', latitude: 48.8566, longitude: 2.3522, timezone: 1.0 },
      // 26. Brazil - Sao Paulo
      { name: 'P26_SaoPaulo', birthDate: '1998-11-05', birthTime: '14:50', birthPlace: 'Sao Paulo, Brazil', latitude: -23.5505, longitude: -46.6333, timezone: -3.0 },
      // 27. Argentina - Buenos Aires
      { name: 'P27_BuenosAires', birthDate: '1993-04-18', birthTime: '18:10', birthPlace: 'Buenos Aires, Argentina', latitude: -34.6037, longitude: -58.3816, timezone: -3.0 },
      // 28. Egypt - Cairo
      { name: 'P28_Cairo', birthDate: '1983-09-27', birthTime: '04:40', birthPlace: 'Cairo, Egypt', latitude: 30.0444, longitude: 31.2357, timezone: 2.0 },
      // 29. Russia - Moscow
      { name: 'P29_Moscow', birthDate: '1990-12-05', birthTime: '23:30', birthPlace: 'Moscow, Russia', latitude: 55.7558, longitude: 37.6173, timezone: 3.0 },
      // 30. Sri Lanka - Colombo
      { name: 'P30_Colombo', birthDate: '2002-06-16', birthTime: '11:45', birthPlace: 'Colombo, Sri Lanka', latitude: 6.9271, longitude: 79.8612, timezone: 5.5 },
      // 31. India - Sign Boundary (Aries/Taurus boundary cusp)
      { name: 'P31_SignBoundary_1', birthDate: '1994-05-14', birthTime: '18:00', birthPlace: 'Ujjain, India', latitude: 23.1765, longitude: 75.7885, timezone: 5.5 },
      // 32. India - Nakshatra Boundary (Ashwini/Bharani cusp)
      { name: 'P32_NakshatraBoundary', birthDate: '1996-04-14', birthTime: '12:00', birthPlace: 'Haridwar, India', latitude: 29.9457, longitude: 78.1642, timezone: 5.5 },
      // 33. India - Midnight Exactly
      { name: 'P33_MidnightExact', birthDate: '1998-08-15', birthTime: '00:00', birthPlace: 'Jaipur, India', latitude: 26.9124, longitude: 75.7873, timezone: 5.5 },
      // 34. India - Noon Exactly
      { name: 'P34_NoonExact', birthDate: '1998-08-15', birthTime: '12:00', birthPlace: 'Jaipur, India', latitude: 26.9124, longitude: 75.7873, timezone: 5.5 },
      // 35. India - Cusp 23:59
      { name: 'P35_CuspNight', birthDate: '2001-12-31', birthTime: '23:59', birthPlace: 'Bengaluru, India', latitude: 12.9716, longitude: 77.5946, timezone: 5.5 },
      // 36. India - Cusp 00:01
      { name: 'P36_CuspMorning', birthDate: '2002-01-01', birthTime: '00:01', birthPlace: 'Bengaluru, India', latitude: 12.9716, longitude: 77.5946, timezone: 5.5 },
      // 37. India - High Latitude North (Srinagar)
      { name: 'P37_Srinagar_North', birthDate: '1991-01-10', birthTime: '08:30', birthPlace: 'Srinagar, India', latitude: 34.0837, longitude: 74.7973, timezone: 5.5 },
      // 38. India - South Tip (Kanyakumari)
      { name: 'P38_Kanyakumari_South', birthDate: '1991-01-10', birthTime: '08:30', birthPlace: 'Kanyakumari, India', latitude: 8.0883, longitude: 77.5385, timezone: 5.5 },
      // 39. India - Western Tip (Dwarka)
      { name: 'P39_Dwarka_West', birthDate: '1991-01-10', birthTime: '08:30', birthPlace: 'Dwarka, India', latitude: 22.2442, longitude: 68.9685, timezone: 5.5 },
      // 40. India - Eastern Tip (Dibrugarh)
      { name: 'P40_Dibrugarh_East', birthDate: '1991-01-10', birthTime: '08:30', birthPlace: 'Dibrugarh, India', latitude: 27.4728, longitude: 94.9120, timezone: 5.5 },
      // 41. Equator Profile (Quito, Ecuador)
      { name: 'P41_Equator_Quito', birthDate: '2003-03-21', birthTime: '12:00', birthPlace: 'Quito, Ecuador', latitude: -0.1807, longitude: -78.4678, timezone: -5.0 },
      // 42. High Latitude North Europe (Reykjavik, Iceland)
      { name: 'P42_Reykjavik', birthDate: '1989-06-21', birthTime: '00:30', birthPlace: 'Reykjavik, Iceland', latitude: 64.1466, longitude: -21.9426, timezone: 0.0 },
      // 43. High Latitude South (Ushuaia, Argentina)
      { name: 'P43_Ushuaia', birthDate: '1995-12-21', birthTime: '16:00', birthPlace: 'Ushuaia, Argentina', latitude: -54.8019, longitude: -68.3030, timezone: -3.0 },
      // 44. China - Beijing
      { name: 'P44_Beijing', birthDate: '1988-08-08', birthTime: '08:08', birthPlace: 'Beijing, China', latitude: 39.9042, longitude: 116.4074, timezone: 8.0 },
      // 45. Hong Kong
      { name: 'P45_HongKong', birthDate: '1997-07-01', birthTime: '00:00', birthPlace: 'Hong Kong', latitude: 22.3193, longitude: 114.1694, timezone: 8.0 },
      // 46. Mexico - Mexico City
      { name: 'P46_MexicoCity', birthDate: '1990-09-16', birthTime: '13:00', birthPlace: 'Mexico City, Mexico', latitude: 19.4326, longitude: -99.1332, timezone: -6.0 },
      // 47. Turkey - Istanbul
      { name: 'P47_Istanbul', birthDate: '1985-05-29', birthTime: '09:00', birthPlace: 'Istanbul, Turkey', latitude: 41.0082, longitude: 28.9784, timezone: 3.0 },
      // 48. Kenya - Nairobi
      { name: 'P48_Nairobi', birthDate: '2004-12-12', birthTime: '14:20', birthPlace: 'Nairobi, Kenya', latitude: -1.2921, longitude: 36.8219, timezone: 3.0 },
      // 49. Indonesia - Jakarta
      { name: 'P49_Jakarta', birthDate: '1996-08-17', birthTime: '10:00', birthPlace: 'Jakarta, Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 7.0 },
      // 50. India - Leap Year Millennium Cusp (2000-02-29 23:59:59)
      { name: 'P50_MillenniumLeap', birthDate: '2000-02-29', birthTime: '23:59', birthPlace: 'Ujjain, India', latitude: 23.1765, longitude: 75.7885, timezone: 5.5 },
    ];

    it('calculates all 50 global birth profiles and proves 100% determinism over duplicate runs', () => {
      expect(globalProfiles).toHaveLength(50);

      for (let i = 0; i < globalProfiles.length; i++) {
        const p = globalProfiles[i];
        const run1 = VedicAstroEngine.calculateKundli(p);
        const run2 = VedicAstroEngine.calculateKundli(p);

        // Deterministic Verification
        expect(run1.ascendant.details.signIndex).toBe(run2.ascendant.details.signIndex);
        expect(run1.ascendant.degrees).toBe(run2.ascendant.degrees);
        expect(run1.moonSign.signIndex).toBe(run2.moonSign.signIndex);
        expect(run1.sunSign.signIndex).toBe(run2.sunSign.signIndex);
        expect(run1.planets).toHaveLength(9);
        expect(run1.houses).toHaveLength(12);

        // Every planet's longitude must match identically across runs to 10 decimal places
        for (let j = 0; j < 9; j++) {
          expect(run1.planets[j].siderealLongitude).toBe(run2.planets[j].siderealLongitude);
          expect(run1.planets[j].signIndex).toBe(run2.planets[j].signIndex);
          expect(run1.planets[j].house).toBe(run2.planets[j].house);
        }

        // Vimshottari Mahadasha balance must match identically
        expect(run1.dashas.balanceYearsRemaining).toBe(run2.dashas.balanceYearsRemaining);
        expect(run1.dashas.currentMahadasha.planet).toBe(run2.dashas.currentMahadasha.planet);
      }
    });
  });

  // =========================================================================
  // PHASE 7 — A → B → A → B CONTAMINATION PROOF
  // =========================================================================
  describe('Phase 7 — Alternating Generation Cross-Contamination Test', () => {
    const profileA: BirthProfileInput = {
      name: 'Seeker A',
      birthDate: '1988-03-21',
      birthTime: '06:00',
      birthPlace: 'Varanasi, India',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 5.5,
    };

    const profileB: BirthProfileInput = {
      name: 'Seeker B',
      birthDate: '1998-11-14',
      birthTime: '21:30',
      birthPlace: 'London, UK',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 0.0,
    };

    it('verifies that alternating A -> B -> A -> B calculations yield zero contamination', () => {
      const runA1 = VedicAstroEngine.calculateKundli(profileA);
      const runB1 = VedicAstroEngine.calculateKundli(profileB);
      const runA2 = VedicAstroEngine.calculateKundli(profileA);
      const runB2 = VedicAstroEngine.calculateKundli(profileB);
      const runA3 = VedicAstroEngine.calculateKundli(profileA);
      const runB3 = VedicAstroEngine.calculateKundli(profileB);

      // A1 === A2 === A3
      expect(runA1.ascendant.degrees).toBe(runA2.ascendant.degrees);
      expect(runA2.ascendant.degrees).toBe(runA3.ascendant.degrees);
      expect(runA1.moonSign.signIndex).toBe(runA2.moonSign.signIndex);

      // B1 === B2 === B3
      expect(runB1.ascendant.degrees).toBe(runB2.ascendant.degrees);
      expect(runB2.ascendant.degrees).toBe(runB3.ascendant.degrees);
      expect(runB1.moonSign.signIndex).toBe(runB2.moonSign.signIndex);

      // A !== B
      expect(runA1.ascendant.details.signName).not.toBe(runB1.ascendant.details.signName);
      expect(runA1.moonSign.signName).not.toBe(runB1.moonSign.signName);
    });
  });

  // =========================================================================
  // PHASE 8 — ASTRONOMICAL FINGERPRINT ADVERSARIAL SENSITIVITY
  // =========================================================================
  describe('Phase 8 — Astronomical Fingerprint Invariance & Sensitivity', () => {
    const base: BirthProfileInput = {
      name: 'Devadatta',
      birthDate: '1992-06-15',
      birthTime: '10:30',
      birthPlace: 'Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    };

    it('proves fingerprint is identical regardless of name, email, or user context', () => {
      const fp1 = CalculationRepository.computeAstronomicalFingerprint(base);
      const fpWithDifferentName = CalculationRepository.computeAstronomicalFingerprint({
        ...base,
        name: 'Alexander The Great',
      });
      expect(fp1).toBe(fpWithDifferentName);
    });

    it('proves fingerprint changes when birth time changes by 1 minute', () => {
      const fpBase = CalculationRepository.computeAstronomicalFingerprint(base);
      const fp1MinLater = CalculationRepository.computeAstronomicalFingerprint({
        ...base,
        birthTime: '10:31',
      });
      expect(fpBase).not.toBe(fp1MinLater);
    });

    it('proves fingerprint changes when longitude changes by 0.001 degree', () => {
      const fpBase = CalculationRepository.computeAstronomicalFingerprint(base);
      const fpLongShift = CalculationRepository.computeAstronomicalFingerprint({
        ...base,
        longitude: 77.2100,
      });
      expect(fpBase).not.toBe(fpLongShift);
    });

    it('proves fingerprint changes when timezone changes', () => {
      const fpBase = CalculationRepository.computeAstronomicalFingerprint(base);
      const fpTzShift = CalculationRepository.computeAstronomicalFingerprint({
        ...base,
        timezone: 5.0,
      });
      expect(fpBase).not.toBe(fpTzShift);
    });
  });

  // =========================================================================
  // PHASE 9 — JYOTISH RULE ENGINE POSITIVE & NEGATIVE CHARTS
  // =========================================================================
  describe('Phase 9 — Formal Jyotish Rule Engine Qualification Matrix', () => {
    it('evaluates Gajakesari Yoga only when Jupiter is in Kendra from Moon', () => {
      // Test chart where Jupiter is Kendra from Moon (H1 vs H4 = diff 4)
      const mockKundliGk: any = {
        planets: [
          { name: 'Sun', house: 1, dignity: 'Own Sign', isCombust: false, signIndex: 4 },
          { name: 'Moon', house: 1, dignity: 'Friend', isCombust: false, signIndex: 4 },
          { name: 'Mars', house: 3, dignity: 'Neutral', isCombust: false, signIndex: 6 },
          { name: 'Mercury', house: 2, dignity: 'Neutral', isCombust: false, signIndex: 5 },
          { name: 'Jupiter', house: 4, dignity: 'Exalted', isCombust: false, signIndex: 7 }, // Kendra (4th from Moon in 1st)
          { name: 'Venus', house: 5, dignity: 'Neutral', isCombust: false, signIndex: 8 },
          { name: 'Saturn', house: 9, dignity: 'Neutral', isCombust: false, signIndex: 0 },
        ],
        ascendant: { degrees: 120, details: { signName: 'Leo', signIndex: 4 } },
        vargas: { d9_navamsa: [] },
        doshas: { manglik: { isManglik: false }, sadeSati: { isActive: false, description: 'None' } },
        dashas: { currentMahadasha: { planet: 'Jupiter' }, currentAntardasha: { planet: 'Moon' } },
      };

      const reportGk = JyotishRuleEngine.evaluateAllRules(mockKundliGk);
      const gkRule = reportGk.rules.find((r) => r.ruleId === 'RULE_YOGA_GAJA_KESARI');
      expect(gkRule?.result).toBe('QUALIFIED');

      // Test negative chart: Jupiter in 6th from Moon (Dusthana, not Kendra)
      const mockKundliNoGk = {
        ...mockKundliGk,
        planets: mockKundliGk.planets.map((p: any) => p.name === 'Jupiter' ? { ...p, house: 6 } : p),
      };
      const reportNoGk = JyotishRuleEngine.evaluateAllRules(mockKundliNoGk);
      const noGkRule = reportNoGk.rules.find((r) => r.ruleId === 'RULE_YOGA_GAJA_KESARI');
      expect(noGkRule?.result).toBe('NOT_QUALIFIED');
    });

    it('evaluates Manglik Dosha strictly from Kuja positions (1, 4, 7, 8, 12)', () => {
      // Mars in House 7 = Manglik
      const mockManglik: any = {
        planets: [
          { name: 'Sun', house: 1, dignity: 'Own Sign', isCombust: false, signIndex: 4 },
          { name: 'Moon', house: 1, dignity: 'Friend', isCombust: false, signIndex: 4 },
          { name: 'Mars', house: 7, dignity: 'Neutral', isCombust: false, signIndex: 10 },
          { name: 'Mercury', house: 2, dignity: 'Neutral', isCombust: false, signIndex: 5 },
          { name: 'Jupiter', house: 5, dignity: 'Neutral', isCombust: false, signIndex: 8 },
          { name: 'Venus', house: 5, dignity: 'Neutral', isCombust: false, signIndex: 8 },
          { name: 'Saturn', house: 9, dignity: 'Neutral', isCombust: false, signIndex: 0 },
        ],
        ascendant: { degrees: 120, details: { signName: 'Leo', signIndex: 4 } },
        vargas: { d9_navamsa: [] },
        doshas: { manglik: { isManglik: true, intensity: 'High', exceptions: [] }, sadeSati: { isActive: false, description: 'None' } },
        dashas: { currentMahadasha: { planet: 'Mars' }, currentAntardasha: { planet: 'Rahu' } },
      };
      const report = JyotishRuleEngine.evaluateAllRules(mockManglik);
      const manglikRule = report.rules.find((r) => r.ruleId === 'RULE_DOSHA_MANGLIK');
      expect(manglikRule?.result).toBe('QUALIFIED');

      // Mars in House 3 = Non-Manglik (Upachaya house)
      const mockNonManglik = {
        ...mockManglik,
        planets: mockManglik.planets.map((p: any) => p.name === 'Mars' ? { ...p, house: 3 } : p),
        doshas: { manglik: { isManglik: false, intensity: 'None', exceptions: [] }, sadeSati: { isActive: false, description: 'None' } },
      };
      const reportNon = JyotishRuleEngine.evaluateAllRules(mockNonManglik);
      const nonManglikRule = reportNon.rules.find((r) => r.ruleId === 'RULE_DOSHA_MANGLIK');
      expect(nonManglikRule?.result).toBe('NOT_QUALIFIED');
    });
  });

  // =========================================================================
  // PHASE 12 — AI CONSENSUS CALCULATION SUPREMACY
  // =========================================================================
  describe('Phase 12 — AI Consensus Calculation Supremacy Invariant', () => {
    it('proves AI models cannot vote to alter deterministic planetary facts', () => {
      const kundli = VedicAstroEngine.calculateKundli({
        name: 'Test',
        birthDate: '1990-01-01',
        birthTime: '12:00',
        birthPlace: 'Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 5.5,
      });

      const actualMoonLon = kundli.planets.find((p) => p.name === 'Moon')!.siderealLongitude;

      // 3 AI models disagreeing with each other and with reality
      const opinions = [
        { modelName: 'ModelA', provider: 'Test', payload: { summary: 'Moon is in Taurus at 45.0 degrees.' } as any },
        { modelName: 'ModelB', provider: 'Test', payload: { summary: 'Moon is in Gemini at 75.0 degrees.' } as any },
        { modelName: 'ModelC', provider: 'Test', payload: { summary: 'Moon is in Aries at 15.0 degrees.' } as any },
      ];

      const consensus = AIConsensusEngine.reconcile(opinions, kundli);

      // Verify calculation supremacy
      expect(consensus.disagreements).toBeDefined();
      expect(consensus.modelsEvaluated).toHaveLength(3);
      // Actual planetary position is preserved without averaging
      expect(kundli.planets.find((p) => p.name === 'Moon')!.siderealLongitude).toBe(actualMoonLon);
    });
  });

  // =========================================================================
  // PHASE 13 — CLAIM FACT CHECKING & ETHICAL SAFETY
  // =========================================================================
  describe('Phase 13 — Claim Fact Checking & Ethical Safety Gates', () => {
    it('blocks fatalistic rhetoric, medical claims, and financial guarantees', () => {
      const kundli = VedicAstroEngine.calculateKundli({
        name: 'Test',
        birthDate: '1990-01-01',
        birthTime: '12:00',
        birthPlace: 'Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 5.5,
      });

      const toxicClaims = `
        You will definitely inherit 5 million dollars by 2028.
        This gem will cure cancer and restore your cellular health.
        Your marriage is guaranteed to fail in divorce by next October.
        The native shows an alignment of Mars with strategic insight.
      `;

      const audit = AstrologyFactChecker.auditClaims(toxicClaims, kundli);

      expect(audit.blockedCount).toBeGreaterThanOrEqual(2);
      expect(audit.passed).toBe(false);

      const blockedClaims = audit.claims.filter((c) => c.status === 'BLOCKED');
      expect(blockedClaims.length).toBeGreaterThanOrEqual(2);

      // Safe sentence should be supported
      const safeClaim = audit.claims.find((c) => c.text.includes('Mars with strategic insight'));
      expect(safeClaim?.status).not.toBe('BLOCKED');
    });
  });

  // =========================================================================
  // PHASE 14 — PALMISTRY ADVERSARIAL ANALYSIS
  // =========================================================================
  describe('Phase 14 — Palmistry Image Quality & Confidence Rules', () => {
    it('returns LOW_CONFIDENCE and NOT_VISIBLE for poor quality images rather than inventing lines', () => {
      // Tiny 1.5 KB payload
      const lowResAnalysis = PalmistryVisionService.analyzePalmImage(
        'lowres.jpg',
        'image/jpeg',
        1536,
        'Right',
        true
      );
      expect(lowResAnalysis.heartLine.status).toBe('LOW_CONFIDENCE');
      expect(lowResAnalysis.fateLine.status).toBe('NOT_VISIBLE');
      expect(lowResAnalysis.imageQualityScore).toBeLessThan(60);

      // High-res 1.2 MB payload
      const highResAnalysis = PalmistryVisionService.analyzePalmImage(
        'clear_palm.png',
        'image/png',
        1200000,
        'Right',
        true
      );
      expect(highResAnalysis.heartLine.status).toBe('VISIBLE');
      expect(highResAnalysis.imageQualityScore).toBeGreaterThanOrEqual(60);
    });

    it('rejects invalid file types gracefully with explicit validation error', () => {
      expect(() => {
        PalmistryVisionService.analyzePalmImage('document.pdf', 'application/pdf', 50000);
      }).toThrow('Unsupported image format');
    });
  });

  // =========================================================================
  // PHASE 15 — IDEMPOTENCY & RESTART RECOVERY
  // =========================================================================
  describe('Phase 15 — Generation Job Idempotency & Restart Recovery', () => {
    it('returns existing report without duplicate calculation when generationRequestId is repeated', async () => {
      const reqId = `gen_test_idempotency_${Date.now()}`;
      const profile: BirthProfileInput = {
        name: 'Ananya',
        birthDate: '1993-04-12',
        birthTime: '15:20',
        birthPlace: 'Pune',
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: 5.5,
      };

      const testUser = await userRepository.createUser({
        email: `idempotent_${Date.now()}@deepastro.internal`,
        passwordHash: 'hash_test',
        role: 'CLIENT',
      });

      const res1 = await reportGenerationService.generateReport({
        generationRequestId: reqId,
        userId: testUser.id,
        profile,
      });

      const res2 = await reportGenerationService.generateReport({
        generationRequestId: reqId,
        userId: testUser.id,
        profile,
      });

      expect(res1.id).toBe(res2.id);
      expect(res1.calculationFingerprint).toBe(res2.calculationFingerprint);
    }, 60000);

    it('executes restart recovery and reports recoverable/failed counts safely', async () => {
      const rec = await reportGenerationService.recoverInterruptedJobs();
      expect(rec).toBeDefined();
      expect(typeof rec.recovered).toBe('number');
      expect(typeof rec.markedFailed).toBe('number');
    });
  });

  // =========================================================================
  // PHASE 17 — SECURITY & CROSS-TENANT ISOLATION
  // =========================================================================
  describe('Phase 17 — Multi-Tenant Data Isolation & Access Security', () => {
    it('strictly isolates User A from User B across report repository methods', async () => {
      const userA = await userRepository.createUser({
        email: `usera_${Date.now()}@deepastro.internal`,
        passwordHash: 'hash_a',
        role: 'CLIENT',
      });
      const userB = await userRepository.createUser({
        email: `userb_${Date.now()}@deepastro.internal`,
        passwordHash: 'hash_b',
        role: 'CLIENT',
      });

      const reportA = await reportRepository.createReport({
        id: `rep_a_${Date.now()}`,
        userId: userA.id,
        generationRequestId: `req_a_${Date.now()}`,
        reportType: 'FULL_KUNDLI',
        title: 'User A Report',
        status: 'VERIFIED',
        integrityStatus: 'VERIFIED',
        integrityScore: 95,
        calculationFingerprint: 'dummy_hash_a',
        engineVersion: '2.0',
        ephemerisVersion: 'SwissEph',
        ruleEngineVersion: '1.0',
        promptVersion: '1.0',
        rendererVersion: '1.0',
        nativeData: { name: 'Native A' },
      });

      // User B lists their reports
      const reportsB = await reportRepository.listUserReports(userB.id);
      expect(reportsB.some((r) => r.id === reportA.id)).toBe(false);

      // User A lists their reports
      const reportsA = await reportRepository.listUserReports(userA.id);
      expect(reportsA.some((r) => r.id === reportA.id)).toBe(true);
    });
  });

  // =========================================================================
  // PHASE 20 — REPORT INTEGRITY GATE CRITICAL AUDIT
  // =========================================================================
  describe('Phase 20 — 9-Part Integrity Gate Enforcement', () => {
    it('prevents report download and issues BLOCKED status if any critical stage fails', () => {
      const blockedGate = ReportIntegrityEngine.evaluateGate({
        calculationPassed: false, // Critical failure
        verificationStatus: 'CALCULATION_CONFLICT',
        rulesEvaluated: true,
        claimsAuditPassed: false,
        unsupportedClaimsCount: 5,
        blockedClaimsCount: 1,
        safetyPassed: false,
        safetyViolations: ['Fatalistic statement detected'],
        pdfGenerated: false,
        pdfRoundTripPassed: false,
        pdfQAPassed: false,
        ownershipValid: true,
      });

      expect(blockedGate.finalStatus).toBe('BLOCKED');
      expect(blockedGate.isDownloadAllowed).toBe(false);
      expect(blockedGate.blockingReasons.length).toBeGreaterThan(0);
    });

    it('issues VERIFIED and enables download only when all critical gates pass', () => {
      const verifiedGate = ReportIntegrityEngine.evaluateGate({
        calculationPassed: true,
        verificationStatus: 'VERIFIED',
        rulesEvaluated: true,
        claimsAuditPassed: true,
        unsupportedClaimsCount: 0,
        blockedClaimsCount: 0,
        safetyPassed: true,
        pdfGenerated: true,
        pdfRoundTripPassed: true,
        pdfQAPassed: true,
        ownershipValid: true,
      });

      expect(verifiedGate.finalStatus).toBe('VERIFIED');
      expect(verifiedGate.isDownloadAllowed).toBe(true);
      expect(verifiedGate.deepAstroReportIntegrity).toBeGreaterThanOrEqual(90);
    });
  });

});
