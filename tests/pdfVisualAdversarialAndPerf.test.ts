import { describe, it, expect } from 'vitest';
import { PremiumPDFRenderer } from '../server/src/reports/PremiumKundliReportGenerator/PremiumPDFRenderer.js';
import { ReportComposer } from '../server/src/reports/PremiumKundliReportGenerator/ReportComposer.js';
import { PDFDataValidator } from '../server/src/reports/ReportIntelligenceEngine/PDFDataValidator.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { calculateNumerology } from '../server/src/astrology/NumerologyEngine.js';
import { PalmistryVisionService } from '../server/src/ai/PalmistryVisionService.js';
import { AIOrchestrator } from '../server/src/ai/AIOrchestrator.js';

describe('DEEPASTRO CHECKPOINT 9.5 — PDF ADVERSARIAL, OLLAMA & SUBSYSTEM MATRIX', () => {
  // =========================================================================
  // PHASE 4 & 5 — ADVERSARIAL PDF GENERATION & PARSING (11 CASES)
  // =========================================================================
  describe('Phase 4 & 5 — PDF True Binary & Visual Adversarial Tests (11 Profiles)', () => {
    const adversarialProfiles: Array<{ label: string; profile: BirthProfileInput }> = [
      {
        label: '1. Short Name',
        profile: {
          name: 'Al',
          birthDate: '1995-05-15',
          birthTime: '12:00',
          birthPlace: 'Goa',
          latitude: 15.2993,
          longitude: 74.1240,
          timezone: 5.5,
        },
      },
      {
        label: '2. Very Long Name',
        profile: {
          name: 'Maharajadhiraja Veerendra Vikramaditya Devavrat Dharmadhikari Ramanujam Sisodhiya',
          birthDate: '1988-11-23',
          birthTime: '08:45',
          birthPlace: 'Jaipur',
          latitude: 26.9124,
          longitude: 75.7873,
          timezone: 5.5,
        },
      },
      {
        label: '3. Long Birthplace',
        profile: {
          name: 'Vikram',
          birthDate: '1992-07-19',
          birthTime: '17:30',
          birthPlace: 'Sree Padmanabhaswamy Temple North Fort Gate, East Fort, Thiruvananthapuram, Kerala, 695023, India',
          latitude: 8.4831,
          longitude: 76.9436,
          timezone: 5.5,
        },
      },
      {
        label: '4. Hindi Text',
        profile: {
          name: 'श्री प्रशांत सिंह सिसोदिया',
          birthDate: '1990-09-22',
          birthTime: '06:15',
          birthPlace: 'वाराणसी, उत्तर प्रदेश, भारत',
          latitude: 25.3176,
          longitude: 82.9739,
          timezone: 5.5,
        },
      },
      {
        label: '5. Sanskrit Text',
        profile: {
          name: 'ॐ श्री गणेशाय नमः ज्योतिर्मय भास्कर',
          birthDate: '1985-01-01',
          birthTime: '04:30',
          birthPlace: 'उज्जयिनी महाकाल क्षेत्र',
          latitude: 23.1765,
          longitude: 75.7885,
          timezone: 5.5,
        },
      },
      {
        label: '6. Unicode Astrological Symbols',
        profile: {
          name: 'AstroSeeker ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ ☉ ☽ ☿ ♀ ♂ ♃ ♄',
          birthDate: '1999-12-31',
          birthTime: '23:59',
          birthPlace: 'Greenwich Observatory 51°28\'40"N 0°00\'05"W',
          latitude: 51.4769,
          longitude: -0.0005,
          timezone: 0.0,
        },
      },
      {
        label: '7. Large Numerology Profile',
        profile: {
          name: 'Alexander Maximilian Thaddeus Montgomery-Cunningham III',
          birthDate: '1977-07-07',
          birthTime: '07:07',
          birthPlace: 'Alexandria',
          latitude: 31.2001,
          longitude: 29.9187,
          timezone: 2.0,
        },
      },
      {
        label: '8. Multiple Yogas Profile',
        profile: {
          name: 'Rajadhiraja Raja Yoga Native',
          birthDate: '1992-04-14',
          birthTime: '11:11',
          birthPlace: 'Ujjain',
          latitude: 23.1765,
          longitude: 75.7885,
          timezone: 5.5,
        },
      },
      {
        label: '9. Multiple Doshas Profile',
        profile: {
          name: 'Severe Kuja & Shani Native',
          birthDate: '1994-08-18',
          birthTime: '19:40',
          birthPlace: 'Bhopal',
          latitude: 23.2599,
          longitude: 77.4126,
          timezone: 5.5,
        },
      },
      {
        label: '10. Palmistry Hybrid Profile',
        profile: {
          name: 'Palmistry Native Test',
          birthDate: '2001-03-25',
          birthTime: '14:10',
          birthPlace: 'Mumbai',
          latitude: 19.0760,
          longitude: 72.8777,
          timezone: 5.5,
        },
      },
      {
        label: '11. Maximum-Content Stress Dossier',
        profile: {
          name: 'Paramahamsa Sarvartha Chintamani Chakravartin',
          birthDate: '1984-10-24',
          birthTime: '05:45',
          birthPlace: 'Ayodhya Sacred Ram Janmabhoomi Complex, Uttar Pradesh, India',
          latitude: 26.7922,
          longitude: 82.1998,
          timezone: 5.5,
        },
      },
    ];

    for (const testCase of adversarialProfiles) {
      it(`successfully generates and verifies PDF for: ${testCase.label}`, async () => {
        const kundli = VedicAstroEngine.calculateKundli(testCase.profile);
        const envelope = ReportComposer.compose(testCase.profile, 'north', kundli);
        const report = envelope.report;

        // 1. Render true binary PDF
        const pdfArtifact = await PremiumPDFRenderer.generateBinaryPdf(report);

        // 2. Validate Buffer starts with %PDF-
        expect(pdfArtifact.buffer).toBeInstanceOf(Buffer);
        const magicHeader = pdfArtifact.buffer.subarray(0, 5).toString('ascii');
        expect(magicHeader).toBe('%PDF-');
        expect(pdfArtifact.mimeType).toBe('application/pdf');
        expect(pdfArtifact.fileSizeBytes).toBeGreaterThan(1000);
        expect(pdfArtifact.pageCount).toBeGreaterThanOrEqual(1);

        // 3. Round-trip data validation using PDFDataValidator
        const roundTrip = await PDFDataValidator.validateBinaryPdf(pdfArtifact.buffer, report);
        if (!roundTrip.passed) {
          console.log('[DEBUG_ROUNDTRIP_MISMATCHES]:', JSON.stringify(roundTrip.mismatches, null, 2));
          console.log('[DEBUG_EXTRACTED_TEXT_SAMPLE]:', roundTrip.extractedTextSample);
        }
        expect(roundTrip.passed).toBe(true);

        // 4. Visual layout QA
        const visualQA = PDFDataValidator.performVisualQA(pdfArtifact.buffer, pdfArtifact.pageCount, roundTrip.extractedTextSample);
        expect(visualQA.passed).toBe(true);
        expect(visualQA.status).not.toBe('FAILED');
      }, 45000);
    }
  });

  // =========================================================================
  // PHASE 11 — MULTI-MODEL AI & OLLAMA VERIFICATION
  // =========================================================================
  describe('Phase 11 — Multi-Model AI & Ollama Verification', () => {
    it('verifies Ollama provider responsiveness or safe deterministic fallback', async () => {
      const orchestrator = new AIOrchestrator();
      const response = await orchestrator.orchestrate({
        query: 'Synthesize Vedic astrological insights for Jupiter in Kendra.',
        feature: 'ReportSynthesis',
        preferredProvider: 'Ollama',
      });

      expect(response).toBeDefined();
      expect(typeof response.summary).toBe('string');
      expect(typeof response.interpretation).toBe('string');
      expect(response.interpretation.length).toBeGreaterThan(20);
      expect(response.confidence).toBeDefined();
    }, 15000);
  });

  // =========================================================================
  // PHASE 18 — SUBSYSTEM COMBINATIONS (PALM + KUNDLI + NUMEROLOGY)
  // =========================================================================
  describe('Phase 18 — Subsystem Independence & Combination Matrix', () => {
    const baseProfile: BirthProfileInput = {
      name: 'Rohan Sharma',
      birthDate: '1991-06-18',
      birthTime: '10:15',
      birthPlace: 'Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    };

    it('1. Kundli only: generates valid astronomical data without requiring other subsystems', () => {
      const kundli = VedicAstroEngine.calculateKundli(baseProfile);
      expect(kundli.planets.length).toBe(9);
      expect(kundli.ascendant.details.signName).toBeDefined();
    });

    it('2. Numerology only: calculates Pythagorean & Chaldean numbers independently', () => {
      const numerology = calculateNumerology(baseProfile.name, 18, 6, 1991);
      expect(numerology.birthNumber).toBeGreaterThanOrEqual(1);
      expect(numerology.lifePathNumber).toBeGreaterThanOrEqual(1);
    });

    it('3. Palmistry only: evaluates palm structure independently with image input', () => {
      const analysis = PalmistryVisionService.analyzePalmImage('palm.png', 'image/png', 1500);
      expect(analysis.imageQualityScore).toBeLessThan(60);
      expect(analysis.heartLine.status).toBe('LOW_CONFIDENCE');
      expect(analysis.fateLine.status).toBe('NOT_VISIBLE');
    });

    it('4. Kundli + Numerology: combines astrological and numerological data without collisions', () => {
      const kundli = VedicAstroEngine.calculateKundli(baseProfile);
      const numerology = calculateNumerology(baseProfile.name, 18, 6, 1991);
      expect(kundli.planets[0].signName).toBeDefined();
      expect(numerology.soulUrgeNumber).toBeGreaterThanOrEqual(1);
    });

    it('5. Kundli + Palmistry: ensures palm observations never modify planetary positions', () => {
      const kundli = VedicAstroEngine.calculateKundli(baseProfile);
      const initialSunLong = kundli.planets.find(p => p.name === 'Sun')!.longitude;

      PalmistryVisionService.analyzePalmImage('palm.png', 'image/png', 250000);

      const kundliAfter = VedicAstroEngine.calculateKundli(baseProfile);
      const postSunLong = kundliAfter.planets.find(p => p.name === 'Sun')!.longitude;
      expect(initialSunLong).toBe(postSunLong);
    });

    it('6. Kundli + Numerology + Palmistry: all three operate concurrently in isolated domains', () => {
      const kundli = VedicAstroEngine.calculateKundli(baseProfile);
      const numerology = calculateNumerology(baseProfile.name, 18, 6, 1991);
      const palm = PalmistryVisionService.analyzePalmImage('palm.png', 'image/png', 250000);

      expect(kundli.planets.length).toBe(9);
      expect(numerology.personalityNumber).toBeGreaterThanOrEqual(1);
      expect(palm.lifeLine.status).toBe('VISIBLE');
    });
  });

  // =========================================================================
  // PHASE 19 — PERFORMANCE BENCHMARKING
  // =========================================================================
  describe('Phase 19 — Latency & Throughput Benchmarks', () => {
    const profile: BirthProfileInput = {
      name: 'Benchmark Native',
      birthDate: '1990-01-01',
      birthTime: '12:00',
      birthPlace: 'Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    };

    it('measures pure calculation latency (sub-10ms target)', () => {
      const iterations = 50;
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        VedicAstroEngine.calculateKundli(profile);
      }
      const elapsed = performance.now() - start;
      const avgMs = elapsed / iterations;
      console.log(`[BENCHMARK] Average Vedic calculation latency: ${avgMs.toFixed(3)}ms`);
      expect(avgMs).toBeLessThan(15);
    });

    it('measures full PDF rendering latency', async () => {
      const kundli = VedicAstroEngine.calculateKundli(profile);
      const envelope = ReportComposer.compose(profile, 'north', kundli);

      const start = performance.now();
      const pdf = await PremiumPDFRenderer.generateBinaryPdf(envelope.report);
      const elapsedMs = performance.now() - start;

      console.log(`[BENCHMARK] Full PDF rendering latency: ${elapsedMs.toFixed(1)}ms (${pdf.fileSizeBytes} bytes)`);
      expect(pdf.buffer.length).toBeGreaterThan(1000);
      expect(elapsedMs).toBeLessThan(25000);
    }, 30000);
  });
});
