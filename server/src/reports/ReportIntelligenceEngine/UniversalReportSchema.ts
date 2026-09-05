/**
 * Universal Report Schema
 * Canonical DeepAstroReport contract capable of representing any publication
 * (Kundli, Compatibility Milan, Career Karma, Annual Gochar, Numerology Blueprint)
 * across PDF, Web, Mobile, and AstroBot channels.
 */

import { FactLedger, VerifiedFact } from './FactLedger.js';
import { SectionEvidence } from './InterpretationEngine.js';

export type ReportCategory =
  | 'KUNDLI_BLUEPRINT'
  | 'COMPATIBILITY_MILAN'
  | 'CAREER_KARMA'
  | 'ANNUAL_GOCHAR'
  | 'NUMEROLOGY_BLUEPRINT'
  | 'ASTROLOGER_CONSULTATION';

export interface ReportMetaRecord {
  reportId: string;
  category: ReportCategory;
  title: string;
  subtitle: string;
  engineVersion: string;
  rulesVersion: string;
  schemaVersion: 'deepastro-report-v1';
  createdAt: string;
  checksum: string;
  userId?: string;
  totalPages: number;
}

export interface UniversalSection {
  id: string;
  order: number;
  sectionNumber?: number;
  title: string;
  subtitle?: string;
  contentType: 'SNAPSHOT' | 'CHART' | 'TABLE' | 'CARDS' | 'TEXT' | 'TIMELINE' | 'ACTION_PLAN';
  data: Record<string, any>;
  evidence?: SectionEvidence;
  disclaimer?: string;
}

export interface DeepAstroReport {
  metadata: ReportMetaRecord;
  branding: {
    brandName: string;
    appName: string;
    logoSvg?: string;
    tagline: string;
    website: string;
    creator: string;
    copyright: string;
  };
  provenance: {
    ledgerId: string;
    totalVerifiedFacts: number;
    conflictsDetected: number;
    verifiedFactsSummary: string[];
  };
  sections: UniversalSection[];
  safetyAudit: {
    isAudited: boolean;
    auditedAt: string;
    antiHallucinationPassed: boolean;
    safetyPassed: boolean;
  };
}
