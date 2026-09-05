/**
 * PDF Quality Validator
 * Strict automated quality gate ensuring astronomical integrity,
 * ethical safety, absence of fatalism, and visual layout completeness.
 */

import { KundliReport } from './types/KundliReport.js';

export interface ValidationIssue {
  category: 'LAYOUT' | 'DATA' | 'LOGIC' | 'SAFETY';
  severity: 'CRITICAL' | 'WARNING';
  message: string;
}

export interface QualityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  issues: ValidationIssue[];
  metrics: {
    pageCount: number;
    planetsCount: number;
    housesCount: number;
    yogasEvaluated: number;
    doshasEvaluated: number;
    hasValidChart: boolean;
  };
}

export class PDFQualityValidator {
  private static DANGEROUS_PATTERNS = [
    /guaranteed (profit|returns|wealth|cure|outcome|win)/i,
    /will definitely (die|fail|divorce|cure|contract)/i,
    /stop taking (medicine|treatment|therapy)/i,
    /replace medical (advice|diagnosis)/i,
    /100% certainty/i,
    /death (date|guarantee|prediction)/i,
    /inevitable (disaster|ruin|accident)/i,
    /<think>[\s\S]*?<\/think>/i,
  ];

  public static validate(report: KundliReport): QualityValidationResult {
    const issues: ValidationIssue[] = [];

    // === 1. DATA INTEGRITY CHECKS ===
    if (!report.profile.name || report.profile.name.trim().length === 0) {
      issues.push({ category: 'DATA', severity: 'CRITICAL', message: 'Profile native name is missing.' });
    }
    if (!report.profile.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(report.profile.birthDate)) {
      issues.push({ category: 'DATA', severity: 'CRITICAL', message: 'Invalid birth date format (expected YYYY-MM-DD).' });
    }
    if (!report.profile.birthTime) {
      issues.push({ category: 'DATA', severity: 'CRITICAL', message: 'Birth time is missing.' });
    }
    if (!report.profile.birthPlace) {
      issues.push({ category: 'DATA', severity: 'CRITICAL', message: 'Birth place is missing.' });
    }
    if (typeof report.profile.latitude !== 'number' || typeof report.profile.longitude !== 'number') {
      issues.push({ category: 'DATA', severity: 'CRITICAL', message: 'Coordinates (lat/lng) are invalid.' });
    }
    if (!report.snapshot.ascendantSign || !report.snapshot.moonSign || !report.snapshot.nakshatra) {
      issues.push({ category: 'DATA', severity: 'CRITICAL', message: 'Essential snapshot coordinates (Lagna, Rashi, Nakshatra) are incomplete.' });
    }

    // === 2. ASTRONOMICAL LOGIC CHECKS ===
    if (!report.planets || report.planets.length < 9) {
      issues.push({ category: 'LOGIC', severity: 'CRITICAL', message: `Expected 9 Navagrahas, found ${report.planets?.length || 0}.` });
    }
    if (!report.houses || report.houses.length !== 12) {
      issues.push({ category: 'LOGIC', severity: 'CRITICAL', message: `Expected 12 Bhavas, found ${report.houses?.length || 0}.` });
    }
    if (!report.activeDasha.currentMahadasha || !report.activeDasha.currentAntardasha) {
      issues.push({ category: 'LOGIC', severity: 'CRITICAL', message: 'Active Vimshottari Dasha period is missing.' });
    }

    // === 3. LAYOUT & CHART CHECKS ===
    const hasValidChart = Boolean(report.chartSvg && report.chartSvg.includes('<svg'));
    if (!hasValidChart) {
      issues.push({ category: 'LAYOUT', severity: 'CRITICAL', message: 'Kundli chart SVG is missing or invalid.' });
    }
    if (!report.tenYearForecast || report.tenYearForecast.length < 5) {
      issues.push({ category: 'LAYOUT', severity: 'WARNING', message: 'Multi-year forecast table has fewer than 5 rows.' });
    }
    if (!report.finalBlueprint.topActionsForYearAhead || report.finalBlueprint.topActionsForYearAhead.length !== 3) {
      issues.push({ category: 'LAYOUT', severity: 'WARNING', message: 'Top 3 actions are incomplete.' });
    }

    // === 4. ETHICAL & SAFETY CHECKS ===
    const serializedReport = JSON.stringify(report);
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(serializedReport)) {
        issues.push({
          category: 'SAFETY',
          severity: 'CRITICAL',
          message: `Detected unsafe pattern matching: ${pattern.toString()}`,
        });
      }
    }

    const errors = issues.filter((i) => i.severity === 'CRITICAL').map((i) => `[${i.category}] ${i.message}`);
    const warnings = issues.filter((i) => i.severity === 'WARNING').map((i) => `[${i.category}] ${i.message}`);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      issues,
      metrics: {
        pageCount: report.metadata.totalPages || 5,
        planetsCount: report.planets?.length || 0,
        housesCount: report.houses?.length || 0,
        yogasEvaluated: report.yogas?.length || 0,
        doshasEvaluated: report.doshas?.length || 0,
        hasValidChart,
      },
    };
  }
}
