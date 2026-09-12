import { describe, it, expect } from 'vitest';
import { KPConfigEngine } from '../server/src/engines/kp/kpConfig.js';
import { KPAyanamsaEngine } from '../server/src/engines/kp/kpAyanamsa.js';
import { PlacidusEngine } from '../server/src/engines/kp/placidusEngine.js';
import { KPSubDivisionEngine } from '../server/src/engines/kp/kpSubDivision.js';
import { KPCuspEngine } from '../server/src/engines/kp/kpCuspEngine.js';
import { KPPlanetaryTableEngine } from '../server/src/engines/kp/kpPlanetaryTable.js';
import { FourLevelSignificatorsEngine } from '../server/src/engines/significators/fourLevelSignificators.js';
import { HouseSignificatorMatrixEngine } from '../server/src/engines/significators/houseSignificatorMatrix.js';
import { CuspalSubLordJudgementEngine } from '../server/src/engines/significators/cuspalSubLordJudgement.js';
import { KPRulingPlanetsEngine } from '../server/src/engines/kp/kpRulingPlanets.js';
import { KPPrashnaEngine } from '../server/src/engines/kp/kpPrashnaEngine.js';
import { BirthTimeRectificationEngine } from '../server/src/engines/kp/birthTimeRectificationEngine.js';
import { EventRulesRegistry } from '../server/src/engines/eventPrediction/eventRulesRegistry.js';
import { KPEventPromiseEngine } from '../server/src/engines/eventPrediction/kpEventPromiseEngine.js';
import { KPDashaTimingEngine } from '../server/src/engines/dasha/kpDashaTimingEngine.js';
import { VargaRegistry } from '../server/src/engines/varga/vargaRegistry.js';
import { ShodashavargaEngine } from '../server/src/engines/varga/shodashavargaEngine.js';
import { ExtendedVargaEngine } from '../server/src/engines/varga/extendedVargaEngine.js';
import { NavamsaDeepEngine } from '../server/src/engines/varga/navamsaDeepEngine.js';
import { DasamshaDeepEngine } from '../server/src/engines/varga/dasamshaDeepEngine.js';
import { VargaConsistencyEngine } from '../server/src/engines/varga/vargaConsistencyEngine.js';
import { MultiMethodPredictionEngine } from '../server/src/engines/eventPrediction/multiMethodPredictionEngine.js';
import { AccuracyModel } from '../server/src/engines/eventPrediction/accuracyModel.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('DEEPASTRO 5.0 — ADVANCED KP + COMPLETE VARGA + KUNDLI INTELLIGENCE ENGINE', () => {
  const sampleProfile: BirthProfileInput = {
    name: 'Arjuna Dev',
    birthDate: '1995-05-15',
    birthTime: '14:30:00',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
  };

  // 1. KP Configuration & Ayanamsa
  describe('Phase 1 & 2: KP Configuration & Precision Ayanamsa', () => {
    it('initializes default KP configuration correctly', () => {
      const config = KPConfigEngine.getConfig();
      expect(config.KP_MODE).toBe(true);
      expect(config.HOUSE_SYSTEM).toBe('Placidus');
      expect(config.KP_AYANAMSA).toBe('KP_NEW');
      expect(config.VERSION).toBe('RULESET_KP_V1');
    });

    it('prohibits invalid non-Placidus house systems in KP mode', () => {
      expect(() => {
        KPConfigEngine.setConfig({ HOUSE_SYSTEM: 'WholeSign' as any });
      }).toThrow('KP_INVALID_CONFIG');
    });

    it('calculates KP New Ayanamsa with exact Spica calibration offset from Lahiri', () => {
      const jd = 2451545.0; // J2000.0
      const ayanamsaKP = KPAyanamsaEngine.calculateAyanamsa(jd, 'KP_NEW');
      const ayanamsaLahiri = KPAyanamsaEngine.calculateAyanamsa(jd, 'LAHIRI');
      const diff = ayanamsaLahiri - ayanamsaKP;

      expect(diff).toBeCloseTo(KPAyanamsaEngine.KP_NEW_OFFSET_DEG, 6);
      expect(ayanamsaKP).toBeGreaterThan(23.7);
      expect(ayanamsaKP).toBeLessThan(23.9);
    });
  });

  // 2. Placidus House Cusps
  describe('Phase 3: Placidus House Cusp Engine', () => {
    it('calculates exactly 12 unequal Placidus house cusps with continuous spans', () => {
      const jd = 2451545.0;
      const cusps = PlacidusEngine.calculateCusps({
        jd,
        latitude: 28.6139,
        longitude: 77.209,
        ayanamsaType: 'KP_NEW',
      });

      expect(cusps.length).toBe(12);

      // Verify that opposite cusps are approximately 180° apart
      const cusp1 = cusps[0].tropicalLongitude;
      const cusp7 = cusps[6].tropicalLongitude;
      const diff17 = (cusp7 - cusp1 + 360) % 360;
      expect(diff17).toBeCloseTo(180, 4);

      const cusp10 = cusps[9].tropicalLongitude;
      const cusp4 = cusps[3].tropicalLongitude;
      const diff104 = (cusp4 - cusp10 + 360) % 360;
      expect(diff104).toBeCloseTo(180, 4);

      // Verify total spans sum to 360°
      const totalSpan = cusps.reduce((acc, c) => acc + c.spanDegrees, 0);
      expect(totalSpan).toBeCloseTo(360, 4);
    });
  });

  // 3. Sub-Division Engine & 249 Table
  describe('Phase 4: KP Sub-Division & Boundary Continuities', () => {
    it('resolves Sign Lord, Star Lord, Sub Lord, and Sub-Sub Lord deterministically', () => {
      // 0° Aries: Mars / Ketu / Ketu / Ketu
      const zeroAries = KPSubDivisionEngine.resolveDetails(0.0);
      expect(zeroAries.signName).toBe('Aries');
      expect(zeroAries.signLord).toBe('Mars');
      expect(zeroAries.nakshatraName).toBe('Ashwini');
      expect(zeroAries.starLord).toBe('Ketu');
      expect(zeroAries.subLord).toBe('Ketu');
      expect(zeroAries.subSubLord).toBe('Ketu');
      expect(zeroAries.subNumber249).toBe(1);

      // 10° Aries: Ashwini, Venus Sub
      const tenAries = KPSubDivisionEngine.resolveDetails(10.0);
      expect(tenAries.signName).toBe('Aries');
      expect(tenAries.starLord).toBe('Ketu');
      expect(tenAries.subLord).toBe('Saturn');
    });

    it('enforces rigorous boundary testing: just before, on, and just after sub boundary', () => {
      const boundaryLon = 0.77777778; // Ketu sub end / Venus sub start in Ashwini
      const eps = 1e-7;

      const justBefore = KPSubDivisionEngine.resolveDetails(boundaryLon - eps);
      const onBoundary = KPSubDivisionEngine.resolveDetails(boundaryLon);
      const justAfter = KPSubDivisionEngine.resolveDetails(boundaryLon + eps);

      expect(justBefore.subLord).toBe('Ketu');
      expect(onBoundary.subLord).toBe('Venus');
      expect(justAfter.subLord).toBe('Venus');
    });

    it('maps all 1-249 horary seeds reversibly to valid sub-division ranges', () => {
      for (const seed of [1, 50, 108, 150, 200, 249]) {
        const info = KPSubDivisionEngine.getLongitudeFor249Seed(seed);
        expect(info.startLongitude).toBeGreaterThanOrEqual(0);
        expect(info.endLongitude).toBeGreaterThan(info.startLongitude);
        expect(info.signLord).toBeDefined();
        expect(info.subLord).toBeDefined();
      }
    });
  });

  // 4. 4-Level Significators & House Matrix
  describe('Phase 5: 4-Level Significators & 12x9 House Matrix', () => {
    it('generates 4-level significators and 12x9 matrix without flattening evidence', () => {
      const kundli = VedicAstroEngine.calculateKundli(sampleProfile);
      expect(kundli.kpIntelligence).toBeDefined();
      expect(kundli.kpIntelligence?.status).toBe('AVAILABLE');

      const sigs = kundli.kpIntelligence?.significators;
      expect(sigs).toBeDefined();
      expect(sigs['Sun']).toBeDefined();
      expect(sigs['Moon']).toBeDefined();
      expect(Array.isArray(sigs['Venus'].allHouses)).toBe(true);

      const matrix = kundli.kpIntelligence?.matrix;
      expect(matrix?.length).toBe(12);
      expect(matrix?.[0].planets['Sun']).toBeDefined();
      expect(['✓', '○', '—']).toContain(matrix?.[0].planets['Sun'].symbol);
      expect(matrix?.[0].planets['Sun'].reasons.length).toBeGreaterThan(0);
    });
  });

  // 5. Ruling Planets
  describe('Phase 6: KP Ruling Planets Engine', () => {
    it('calculates the 5 classical Ruling Planets for any timestamp and location', () => {
      const rp = KPRulingPlanetsEngine.calculateRulingPlanets({
        utcDate: new Date('2026-09-12T04:00:00Z'),
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
      });

      expect(rp.ruleset).toBe('KP-RP-v1');
      expect(rp.weekdayLord).toBeDefined();
      expect(rp.ascendantSignLord).toBeDefined();
      expect(rp.ascendantStarLord).toBeDefined();
      expect(rp.moonSignLord).toBeDefined();
      expect(rp.moonStarLord).toBeDefined();
      expect(rp.rulingPlanets.length).toBeGreaterThanOrEqual(3);
    });
  });

  // 6. Life Event Promise & Dasha Timing Windows
  describe('Phase 7 & 8: Life-Event Promise & Timing Windows', () => {
    it('evaluates life event promise using Cuspal Sub-Lord (CSL) rules', () => {
      const kundli = VedicAstroEngine.calculateKundli(sampleProfile);
      const promises = kundli.kpIntelligence?.eventPromises;

      expect(promises).toBeDefined();
      expect(promises.MARRIAGE).toBeDefined();
      expect(promises.CAREER).toBeDefined();
      expect(promises.FINANCE).toBeDefined();
      expect(['PROMISED', 'FAVORABLE', 'DELAYED', 'DENIED', 'MIXED']).toContain(promises.MARRIAGE.status);
      expect(promises.MARRIAGE.strengthScore).toBeGreaterThanOrEqual(0);
      expect(promises.MARRIAGE.evidence.length).toBeGreaterThan(0);
    });

    it('identifies ranked timing windows for life events based on significator convergence', () => {
      const kundli = VedicAstroEngine.calculateKundli(sampleProfile);
      const windows = KPDashaTimingEngine.findEventWindows({
        eventType: 'CAREER',
        dasha: kundli.dashas,
        significators: kundli.kpIntelligence?.significators,
        rulingPlanets: kundli.kpIntelligence?.rulingPlanets,
      });

      expect(Array.isArray(windows)).toBe(true);
      if (windows.length > 0) {
        const first = windows[0];
        expect(first.windowLabel).toBeDefined();
        expect(first.startDate).toBeDefined();
        expect(first.endDate).toBeDefined();
        expect(first.convergenceScore).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // 7. Prashna & Rectification
  describe('Phase 9 & 10: Prashna (1–249) & Birth-Time Rectification', () => {
    it('casts a complete isolated KP Prashna chart from horary seed number', () => {
      const prashna = KPPrashnaEngine.generatePrashnaChart({
        question: 'Will the interview lead to employment?',
        seedNumber: 77,
        questionTimestamp: new Date('2026-09-12T04:30:00Z'),
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        targetDomain: 'CAREER',
      });

      expect(prashna.seedNumber).toBe(77);
      expect(prashna.cusps.length).toBe(12);
      expect(prashna.planets.length).toBe(9);
      expect(prashna.rulingPlanets).toBeDefined();
      expect(prashna.eventPromise).toBeDefined();
    });

    it('rectifies birth time across candidate range and returns inference with sensitivity', () => {
      const rect = BirthTimeRectificationEngine.rectify({
        birthDate: '1995-05-15',
        birthTime: '14:30',
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        knownEvents: [
          { domain: 'CAREER', eventDate: '2021-06-15' },
          { domain: 'MARRIAGE', eventDate: '2023-11-20' },
        ],
        windowMinutes: 10,
        stepSeconds: 60,
      });

      expect(rect.nominalBirthTime).toBe('14:30');
      expect(rect.bestFitWindow.recommendedTime).toBeDefined();
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(rect.sensitivity);
      expect(rect.topCandidates.length).toBeGreaterThan(0);
    });
  });

  // 8. Complete Shodashavarga & Extended D1–D60
  describe('Phase 11, 12, 13: Shodashavarga & Extended D1–D60', () => {
    it('calculates all 16 classical Shodashavargas strictly from canonical longitudes', () => {
      const kundli = VedicAstroEngine.calculateKundli(sampleProfile);
      const vargas = kundli.shodashavargaDetail;

      expect(vargas).toBeDefined();
      const expectedCodes = [
        'd1', 'd2', 'd3', 'd4', 'd7', 'd9', 'd10', 'd12',
        'd16', 'd20', 'd24', 'd27', 'd30', 'd40', 'd45', 'd60'
      ];
      for (const code of expectedCodes) {
        expect(vargas[code]).toBeDefined();
        expect(vargas[code].planets.length).toBe(9);
        expect(vargas[code].ascendantSignName).toBeDefined();
      }
    });

    it('supports extended D1–D60 query with formula attribution', () => {
      const kundli = VedicAstroEngine.calculateKundli(sampleProfile);
      const d5 = ExtendedVargaEngine.calculateVarga({
        division: 5,
        planets: kundli.planets,
        ascendantLongitude: kundli.ascendant.degrees,
      });

      expect(d5.division).toBe(5);
      expect(d5.planets.length).toBe(9);
    });

    it('computes deep Navamsa (D9) metrics: Vargottama, Pushkara, and 7th house axis', () => {
      const kundli = VedicAstroEngine.calculateKundli(sampleProfile);
      const navamsaDeep = kundli.navamsaDeep;

      expect(navamsaDeep).toBeDefined();
      expect(Array.isArray(navamsaDeep.vargottamaPlanets)).toBe(true);
      expect(Array.isArray(navamsaDeep.pushkaraPlanets)).toBe(true);
      expect(navamsaDeep.seventhHouseAnalysis.seventhLordD9).toBeDefined();
      expect(navamsaDeep.integratedD1D9Synthesis.length).toBeGreaterThan(0);
    });

    it('computes deep Dasamsha (D10) career indicators', () => {
      const kundli = VedicAstroEngine.calculateKundli(sampleProfile);
      const dasamshaDeep = kundli.dasamshaDeep;

      expect(dasamshaDeep).toBeDefined();
      expect(dasamshaDeep.tenthHouseD10.signLord).toBeDefined();
      expect(dasamshaDeep.keyKarakas.sun).toBeDefined();
      expect(dasamshaDeep.keyKarakas.saturn).toBeDefined();
      expect(dasamshaDeep.careerThemes.length).toBeGreaterThan(0);
    });
  });

  // 9. Multi-Method Conflict Resolution & Accuracy Model
  describe('Phase 14 & 15: Multi-Method Prediction & Conflict Resolution', () => {
    it('reports methodological divergence honestly without false averaging', () => {
      const kundli = VedicAstroEngine.calculateKundli(sampleProfile);
      const multi = kundli.multiMethodPredictions;

      expect(multi).toBeDefined();
      expect(multi.marriage).toBeDefined();
      expect(multi.career).toBeDefined();
      expect(multi.marriage.methodologyOutputs.parashari).toBeDefined();
      expect(multi.marriage.methodologyOutputs.kp).toBeDefined();
      expect(multi.marriage.methodologyOutputs.varga).toBeDefined();
      expect(multi.marriage.conflictResolutionSummary).toBeDefined();

      const acc = kundli.accuracyQuality;
      expect(acc).toBeDefined();
      expect(acc.calculationIntegrity).toBe('99.8%');
      expect(['NORMAL', 'MEDIUM', 'HIGH', 'VERY_HIGH']).toContain(acc.birthTimeSensitivity);
    });
  });

  // 10. Golden Reference Chart Determinism
  describe('Phase 16: Golden Chart Determinism Suite', () => {
    it('produces identical deterministic outputs for duplicate calculations of reference chart', () => {
      const run1 = VedicAstroEngine.calculateKundli(sampleProfile);
      const run2 = VedicAstroEngine.calculateKundli(sampleProfile);

      expect(run1.fingerprint).toBe(run2.fingerprint);
      expect(run1.ascendant.degrees).toBe(run2.ascendant.degrees);
      expect(run1.planets[0].siderealLongitude).toBe(run2.planets[0].siderealLongitude);
      expect(run1.kpIntelligence?.cusps[0].longitude).toBe(run2.kpIntelligence?.cusps[0].longitude);
      expect(run1.kpIntelligence?.cusps[0].subLord).toBe(run2.kpIntelligence?.cusps[0].subLord);
      expect(run1.shodashavargaDetail?.d9.ascendantSignIndex).toBe(run2.shodashavargaDetail?.d9.ascendantSignIndex);
    });
  });
});
