/**
 * Report Composer — Master Composition & Provenance Engine
 * Executes the complete DeepAstro Report Intelligence master pipeline:
 * Source Data → Astrology Engine → Fact Ledger → Fact Checker → Rule Engines →
 * Interpretation Engine → Quality Gate → PDF Renderer → Round-Trip Validator → Audit Log.
 */

import { BirthProfileInput, VedicAstroEngine, FullKundliResult } from '../../astrology/VedicAstroEngine.js';
import { ReportDataAdapter } from './ReportDataAdapter.js';
import { PDFQualityValidator } from './PDFQualityValidator.js';
import type { QualityValidationResult } from './PDFQualityValidator.js';
import { KundliReport } from './types/KundliReport.js';
import { PremiumPDFRenderer } from './PremiumPDFRenderer.js';
import { AstrologyFactChecker } from '../ReportIntelligenceEngine/AstrologyFactChecker.js';
import { PDFDataValidator, RoundTripValidationResult } from '../ReportIntelligenceEngine/PDFDataValidator.js';
import { ReportAuditLog, AuditRecord } from '../ReportIntelligenceEngine/ReportAuditLog.js';
import { FactLedger } from '../ReportIntelligenceEngine/FactLedger.js';
import { UnverifiedParsedKundli } from '../ReportIntelligenceEngine/KundliParserEngine.js';

export interface ComposedReportEnvelope {
  report: KundliReport;
  validation: QualityValidationResult;
  roundTrip: RoundTripValidationResult;
  auditRecord: AuditRecord;
  ledger: FactLedger;
}

export class ReportComposer {
  /**
   * Generates a mathematical North Indian diamond chart SVG matching the luxury gold/midnight aesthetic
   */
  public static generateNorthIndianSvg(ascSignIndex: number, planets: any[]): string {
    const houseCoords: Record<number, { x: number; y: number; labelX: number; labelY: number }> = {
      1:  { x: 200, y: 110, labelX: 200, labelY: 145 },
      2:  { x: 100, y: 55,  labelX: 130, labelY: 75  },
      3:  { x: 55,  y: 100, labelX: 75,  labelY: 130 },
      4:  { x: 120, y: 200, labelX: 155, labelY: 200 },
      5:  { x: 55,  y: 300, labelX: 75,  labelY: 270 },
      6:  { x: 100, y: 345, labelX: 130, labelY: 325 },
      7:  { x: 200, y: 290, labelX: 200, labelY: 255 },
      8:  { x: 300, y: 345, labelX: 270, labelY: 325 },
      9:  { x: 345, y: 300, labelX: 325, labelY: 270 },
      10: { x: 280, y: 200, labelX: 245, labelY: 200 },
      11: { x: 345, y: 100, labelX: 325, labelY: 130 },
      12: { x: 300, y: 55,  labelX: 270, labelY: 75  },
    };

    let housesSvg = '';
    for (let h = 1; h <= 12; h++) {
      const signNum = ((ascSignIndex + (h - 1)) % 12) + 1;
      const pos = houseCoords[h];
      const occupants = planets.filter((p: any) => p.house === h);
      const occupantList = occupants.map((p: any) => p.symbol || p.name.slice(0, 2));
      if (h === 1) occupantList.unshift('Asc');

      const text = occupantList.join(' ');

      housesSvg += `
        <text x="${pos.labelX}" y="${pos.labelY}" fill="#94A3B8" font-size="10" font-weight="600" text-anchor="middle">${signNum}</text>
        <text x="${pos.x}" y="${pos.y}" fill="#F1F5F9" font-size="12" font-weight="800" text-anchor="middle">${text}</text>
      `;
    }

    return `
      <svg viewBox="0 0 400 400" width="300" height="300" style="margin: 0 auto; display: block; background: #070A14; border-radius: 8px; border: 1px solid #D4AF37;">
        <rect x="8" y="8" width="384" height="384" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
        <line x1="8" y1="8" x2="392" y2="392" stroke="#8B732B" stroke-width="1"/>
        <line x1="392" y1="8" x2="8" y2="392" stroke="#8B732B" stroke-width="1"/>
        <polygon points="200,8 392,200 200,392 8,200" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
        ${housesSvg}
      </svg>
    `.trim();
  }

  /**
   * Master pipeline execution
   */
  public static compose(
    profile: BirthProfileInput,
    chartStyle: 'north' | 'south' | 'east' = 'north',
    userIdOrKundli?: string | FullKundliResult,
    parsedCandidate?: UnverifiedParsedKundli,
    existingKundli?: FullKundliResult
  ): ComposedReportEnvelope {
    // 0. Safety Check: Block accidental publication of specimen demo data
    const isTestMode = process.env.NODE_ENV === 'test' || process.env.ALLOW_TEST_FIXTURES === 'true';
    if (!isTestMode && profile.name && profile.name.trim().toLowerCase() === 'aarav mehta') {
      throw new Error('SPECIMEN_DATA_DETECTED: Specimen test data ("Aarav Mehta") detected. Production reports must use genuine user birth details.');
    }

    let userId: string | undefined;
    let kundliToUse: FullKundliResult | undefined;

    if (typeof userIdOrKundli === 'object' && userIdOrKundli !== null) {
      kundliToUse = userIdOrKundli;
    } else {
      userId = userIdOrKundli;
      kundliToUse = existingKundli;
    }

    // 1. Consume Existing Calculation Snapshot or Calculate Authoritative Coordinates
    let kundli: FullKundliResult;
    if (kundliToUse) {
      if ((kundliToUse as any).astronomy) {
        kundli = kundliToUse as FullKundliResult;
      } else if ((kundliToUse as any).ayanamsha) {
        const snap = kundliToUse as any;
        kundli = {
          profile,
          astronomy: {
            julianDay: snap.julianDay,
            ayanamshaName: snap.ayanamsha.name,
            ayanamshaDegrees: snap.ayanamsha.degrees,
          },
          ascendant: snap.ascendant,
          sunSign: snap.planets.find((p: any) => p.name === 'Sun')?.details || snap.ascendant.details,
          moonSign: snap.planets.find((p: any) => p.name === 'Moon')?.details || snap.ascendant.details,
          moonNakshatra: snap.ascendant.nakshatra,
          planets: snap.planets,
          houses: snap.houses,
          vargas: snap.vargas,
          shodashvargas: snap.shodashvargas,
          dashas: snap.dashas,
          yogas: snap.yogas,
          doshas: snap.doshas,
          remedies: [],
          predictions: {} as any,
          fingerprint: snap.fingerprint,
        };
      } else {
        kundli = VedicAstroEngine.calculateKundli(profile);
      }
    } else {
      kundli = VedicAstroEngine.calculateKundli(profile);
    }
    const ascSignIndex = kundli.ascendant.details.signIndex;

    // 2. Build Fact Ledger and Audit Astronomical Parity
    const factAudit = AstrologyFactChecker.auditAndBuildLedger(profile, kundli, parsedCandidate);
    if (!factAudit.passed && factAudit.conflicts.length > 0) {
      throw new Error(`Data Conflict Detected: ${factAudit.conflicts.join('; ')}`);
    }

    // 3. Generate Chart SVG
    const chartSvg = this.generateNorthIndianSvg(ascSignIndex, kundli.planets);

    // 4. Adapt into canonical KundliReport
    const report = ReportDataAdapter.adapt(profile, chartStyle, chartSvg, userId, kundli);

    // 5. Validate through Quality & Safety Gate
    const validation = PDFQualityValidator.validate(report);
    if (!validation.isValid) {
      throw new Error(`PDF Quality Validation Failed: ${validation.errors.join('; ')}`);
    }

    // 6. Pre-render publication and perform Round-Trip Fact Checking
    const renderedHtml = PremiumPDFRenderer.renderHtml(report);
    const roundTrip = PDFDataValidator.validateRenderedHtml(renderedHtml, report);
    if (!roundTrip.passed) {
      const failedFields = roundTrip.mismatches.filter((m) => m.status === 'MISMATCH').map((m) => m.field);
      console.warn(`[ReportComposer] Round-trip fact check warnings: ${failedFields.join(', ')}`);
    }

    // 7. Log complete provenance and Why-This-Result audit trail
    const auditRecord = ReportAuditLog.logReportGeneration(report, factAudit.ledger, roundTrip.passed);

    return {
      report,
      validation,
      roundTrip,
      auditRecord,
      ledger: factAudit.ledger,
    };
  }
}
