/**
 * Report Audit Log & "Why This Result?" Inspector
 * Central registry recording end-to-end report generation telemetry,
 * providing complete provenance auditing for developers, admins, and quality monitors.
 */

import { FactLedger } from './FactLedger.js';
import { KundliReport } from '../PremiumKundliReportGenerator/types/KundliReport.js';

export interface AuditRecord {
  reportId: string;
  userId?: string;
  nativeName: string;
  engineVersion: string;
  rulesVersion: string;
  reportVersion: string;
  timestamp: string;
  provenanceLedgerId: string;
  verifiedFactsCount: number;
  conflictsDetected: number;
  roundTripValidationPassed: boolean;
  whyThisResultInspector: {
    yogasProvenance: Array<{ yoga: string; status: string; evidence: string[] }>;
    dashaProvenance: { mahadasha: string; antardasha: string; evidence: string[] };
    careerProvenance: { interpretation: string; factors: string[] };
    gemstoneProvenance: Array<{ gem: string; graha: string; reason: string }>;
  };
}

export class ReportAuditLog {
  private static records: Map<string, AuditRecord> = new Map();

  public static logReportGeneration(
    report: KundliReport,
    ledger: FactLedger,
    roundTripPassed: boolean
  ): AuditRecord {
    const record: AuditRecord = {
      reportId: report.metadata.reportId,
      userId: report.metadata.userId,
      nativeName: report.profile.name,
      engineVersion: report.metadata.engineVersion || 'lahiri-v2.1',
      rulesVersion: 'rules-v1.4',
      reportVersion: report.metadata.reportVersion,
      timestamp: new Date().toISOString(),
      provenanceLedgerId: ledger.ledgerId,
      verifiedFactsCount: ledger.getVerifiedFacts().length,
      conflictsDetected: ledger.getConflicts().length,
      roundTripValidationPassed: roundTripPassed,
      whyThisResultInspector: {
        yogasProvenance: report.yogas.map((y) => ({
          yoga: y.name,
          status: y.status,
          evidence: [y.qualificationEvidence, y.traditionalSignificance],
        })),
        dashaProvenance: {
          mahadasha: report.activeDasha.currentMahadasha,
          antardasha: report.activeDasha.currentAntardasha,
          evidence: [report.activeDasha.guidance],
        },
        careerProvenance: {
          interpretation: report.careerBusinessFinance.careerInsight,
          factors: [
            `Lagna: ${report.snapshot.ascendantSign}`,
            `Moon: ${report.snapshot.moonSign}`,
            `Active Dasha: ${report.activeDasha.currentMahadasha}/${report.activeDasha.currentAntardasha}`,
          ],
        },
        gemstoneProvenance: report.gemstonesAndRemedies.recommendations.map((g) => ({
          gem: g.gemstone,
          graha: g.graha,
          reason: g.reason,
        })),
      },
    };

    this.records.set(report.metadata.reportId, record);
    return record;
  }

  public static getAuditRecord(reportId: string): AuditRecord | undefined {
    return this.records.get(reportId);
  }

  public static inspectWhy(reportId: string, queryTopic: 'yogas' | 'dasha' | 'career' | 'gemstones') {
    const record = this.records.get(reportId);
    if (!record) return { error: `No audit record found for report ID ${reportId}` };

    switch (queryTopic) {
      case 'yogas':
        return record.whyThisResultInspector.yogasProvenance;
      case 'dasha':
        return record.whyThisResultInspector.dashaProvenance;
      case 'career':
        return record.whyThisResultInspector.careerProvenance;
      case 'gemstones':
        return record.whyThisResultInspector.gemstoneProvenance;
      default:
        return record.whyThisResultInspector;
    }
  }
}
