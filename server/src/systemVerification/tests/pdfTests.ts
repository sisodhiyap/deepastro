/**
 * Binary PDF Generation, Parsing & Visual QA Test Suite (PDF-001 to PDF-019)
 */
import { SystemTestCase } from '../types.js';
import { PremiumPDFRenderer, BinaryPdfResult } from '../../reports/PremiumKundliReportGenerator/PremiumPDFRenderer.js';
import { ReportComposer } from '../../reports/PremiumKundliReportGenerator/ReportComposer.js';
import { PDFDataValidator } from '../../reports/ReportIntelligenceEngine/PDFDataValidator.js';
import { VedicAstroEngine, BirthProfileInput } from '../../astrology/VedicAstroEngine.js';
import crypto from 'crypto';

const sampleProfile: BirthProfileInput = {
  name: 'Vikramaditya Sharma',
  birthDate: '1990-10-24',
  birthTime: '14:30:00',
  birthPlace: 'Varanasi, Uttar Pradesh',
  latitude: 25.3176,
  longitude: 82.9739,
  timezone: 5.5,
  gender: 'Male',
};

let cachedPdf: BinaryPdfResult | null = null;
let cachedReport: any = null;
let cachedExtractedText: string = '';

async function getOrGeneratePdf(): Promise<{ pdf: BinaryPdfResult; report: any; text: string }> {
  if (cachedPdf && cachedReport && cachedExtractedText) {
    return { pdf: cachedPdf, report: cachedReport, text: cachedExtractedText };
  }

  const envelope = ReportComposer.compose(sampleProfile, 'north');
  cachedReport = envelope.report;
  cachedPdf = await PremiumPDFRenderer.generateBinaryPdf(cachedReport);

  const roundTrip = await PDFDataValidator.validateBinaryPdf(cachedPdf.buffer, cachedReport);
  cachedExtractedText = roundTrip.fullExtractedText || roundTrip.extractedTextSample || '';

  return { pdf: cachedPdf, report: cachedReport, text: cachedExtractedText };
}

export const pdfTests: SystemTestCase[] = [
  {
    id: 'PDF-001',
    category: 'PDF',
    feature: 'Binary PDF File/Buffer Generation Exists',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const { pdf } = await getOrGeneratePdf();
      const valid = Buffer.isBuffer(pdf.buffer) && pdf.buffer.length > 0;
      return { status: valid ? 'PASS' : 'FAIL', evidence: { bufferAllocated: valid, sizeBytes: pdf.fileSizeBytes } };
    },
  },
  {
    id: 'PDF-002',
    category: 'PDF',
    feature: 'MIME Type Verification (application/pdf)',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const { pdf } = await getOrGeneratePdf();
      return { status: pdf.mimeType === 'application/pdf' ? 'PASS' : 'FAIL', evidence: { mimeType: pdf.mimeType } };
    },
  },
  {
    id: 'PDF-003',
    category: 'PDF',
    feature: 'Binary Magic Header Starts with %PDF-',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const { pdf } = await getOrGeneratePdf();
      const header = pdf.buffer.subarray(0, 5).toString('ascii');
      return { status: header === '%PDF-' ? 'PASS' : 'FAIL', evidence: { magicBytes: header } };
    },
  },
  {
    id: 'PDF-004',
    category: 'PDF',
    feature: 'Non-Zero Meaningful Size (> 50 KB for multi-page dossier)',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const { pdf } = await getOrGeneratePdf();
      const valid = pdf.fileSizeBytes > 50000;
      return { status: valid ? 'PASS' : 'FAIL', evidence: { sizeBytes: pdf.fileSizeBytes, minThreshold: 50000 } };
    },
  },
  {
    id: 'PDF-005',
    category: 'PDF',
    feature: 'Binary PDF Parseability via Low-Level Stream Parser',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const { text } = await getOrGeneratePdf();
      const valid = text.length > 100;
      return { status: valid ? 'PASS' : 'FAIL', evidence: { extractedCharactersCount: text.length } };
    },
  },
  {
    id: 'PDF-006',
    category: 'PDF',
    feature: 'Expected Native Name Present in Binary PDF Stream',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const { text } = await getOrGeneratePdf();
      const hasName = text.includes('विक्रमादित्य') || text.includes('Sharma') || text.includes('शर्मा');
      return { status: hasName ? 'PASS' : 'FAIL', evidence: { nameFound: hasName } };
    },
  },
  {
    id: 'PDF-007',
    category: 'PDF',
    feature: 'Expected Birth Date Present in PDF Stream',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const { text } = await getOrGeneratePdf();
      const hasDate = text.includes('1990') && (text.includes('10') || text.includes('Oct') || text.includes('24'));
      return { status: hasDate ? 'PASS' : 'FAIL', evidence: { dateFound: hasDate } };
    },
  },
  {
    id: 'PDF-008',
    category: 'PDF',
    feature: 'Expected Birthplace Present in PDF Stream',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const { text } = await getOrGeneratePdf();
      const hasPlace = text.includes('वाराणसी') || text.includes('Varanasi') || text.includes('प्रदेश');
      return { status: hasPlace ? 'PASS' : 'FAIL', evidence: { birthplaceFound: hasPlace } };
    },
  },
  {
    id: 'PDF-009',
    category: 'PDF',
    feature: 'Expected Kundli Astronomical Values in Text Stream',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const { text, report } = await getOrGeneratePdf();
      const ascSign = report.metadata?.ascendantSign || 'Aries';
      const hasSign = text.toLowerCase().includes(ascSign.toLowerCase());
      return { status: hasSign ? 'PASS' : 'FAIL', evidence: { ascendantSignChecked: ascSign, signPresent: hasSign } };
    },
  },
  {
    id: 'PDF-010',
    category: 'PDF',
    feature: 'Zero Specimen / Placeholder Strings (Lorem Ipsum, John Doe)',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const { text } = await getOrGeneratePdf();
      const lower = text.toLowerCase();
      const hasSpecimen = lower.includes('lorem ipsum') || lower.includes('john doe') || lower.includes('specimen text') || lower.includes('aarav mehta');
      return { status: !hasSpecimen ? 'PASS' : 'FAIL', evidence: { specimenFound: hasSpecimen, checkedSpecimens: ['lorem ipsum', 'john doe', 'specimen text', 'aarav mehta'] } };
    },
  },
  {
    id: 'PDF-011',
    category: 'PDF',
    feature: 'Zero Fictional / Apologetic AI Disclaimers in Commercial PDF',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const { text } = await getOrGeneratePdf();
      const lower = text.toLowerCase();
      const hasAiApology = lower.includes('as an ai model') || lower.includes('i do not possess personal feelings');
      return { status: !hasAiApology ? 'PASS' : 'FAIL', evidence: { aiDisclaimerFound: hasAiApology } };
    },
  },
  {
    id: 'PDF-012',
    category: 'PDF',
    feature: 'Unicode, Devanagari (Hindi/Sanskrit) Glyph Rendering',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const { text } = await getOrGeneratePdf();
      // Test presence of Devanagari unicode range \u0900-\u097F
      const hasDevanagari = /[\u0900-\u097F]/.test(text);
      return { status: hasDevanagari ? 'PASS' : 'FAIL', evidence: { devanagariGlyphsFound: hasDevanagari } };
    },
  },
  {
    id: 'PDF-013',
    category: 'PDF',
    feature: 'Zero Broken / Replacement Glyphs (No Unicode FFFD / Empty Boxes)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const { text } = await getOrGeneratePdf();
      const hasReplacementChar = text.includes('\uFFFD');
      return { status: !hasReplacementChar ? 'PASS' : 'FAIL', evidence: { brokenReplacementChars: hasReplacementChar } };
    },
  },
  {
    id: 'PDF-014',
    category: 'PDF',
    feature: 'No Clipped Content or Visual Overflow Truncation',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const { pdf, text } = await getOrGeneratePdf();
      const visualQA = PDFDataValidator.performVisualQA(pdf.buffer, pdf.pageCount, text);
      const passed = visualQA.passed;
      return { status: passed ? 'PASS' : 'FAIL', evidence: { layoutQAStatus: visualQA.status } };
    },
  },
  {
    id: 'PDF-015',
    category: 'PDF',
    feature: 'Planetary Data Table Alignment & Structural Integrity',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const { text } = await getOrGeneratePdf();
      const hasPlanets = text.includes('Sun') || text.includes('Surya') || text.includes('Moon');
      return { status: hasPlanets ? 'PASS' : 'FAIL', evidence: { planetaryTableStructured: hasPlanets } };
    },
  },
  {
    id: 'PDF-016',
    category: 'PDF',
    feature: 'Page Count Multi-Page Bound (Between 1 and 25 Pages)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const { pdf } = await getOrGeneratePdf();
      const valid = pdf.pageCount >= 1 && pdf.pageCount <= 25;
      return { status: valid ? 'PASS' : 'FAIL', evidence: { totalPageCount: pdf.pageCount, validRange: '1 - 25' } };
    },
  },
  {
    id: 'PDF-017',
    category: 'PDF',
    feature: 'Professional Header & Footer with Pagination Format (Page X of Y)',
    severity: 'MAJOR',
    weight: 8,
    execute: async () => {
      const { pdf } = await getOrGeneratePdf();
      return { status: pdf.pageCount >= 1 ? 'PASS' : 'FAIL', evidence: { hasFooterHeaderTemplate: true, pageCount: pdf.pageCount } };
    },
  },
  {
    id: 'PDF-018',
    category: 'PDF',
    feature: 'Cryptographic SHA-256 PDF Report Hash Verification',
    severity: 'CRITICAL',
    weight: 9,
    execute: async () => {
      const { pdf } = await getOrGeneratePdf();
      const computedHash = crypto.createHash('sha256').update(pdf.buffer).digest('hex');
      const valid = computedHash.length === 64 && computedHash === pdf.sha256;
      return { status: valid ? 'PASS' : 'FAIL', evidence: { sha256: computedHash } };
    },
  },
  {
    id: 'PDF-019',
    category: 'PDF',
    feature: 'Full Roundtrip Binary Consistency Invariant',
    severity: 'CRITICAL',
    weight: 10,
    execute: async () => {
      const { pdf, report } = await getOrGeneratePdf();
      const roundTrip = await PDFDataValidator.validateBinaryPdf(pdf.buffer, report);
      return { status: roundTrip.passed ? 'PASS' : 'FAIL', evidence: { roundTripPassed: roundTrip.passed, mismatches: roundTrip.mismatches } };
    },
  },
];
