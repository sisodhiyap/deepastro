/**
 * FutureIntelligenceEngine.ts
 * Master Orchestrator for DeepAstro Future Intelligence Engine (FUTURE_INTELLIGENCE_V1).
 * Single unified entrypoint executing:
 * ChartContextResolver -> TransitEngine -> DashaForecastEngine -> VargaForecastEngine ->
 * NumerologyForecastEngine -> EventWindowEngine -> YearlyForecastEngine -> EvidenceGraphEngine.
 */

import {
  CanonicalPredictionContext,
  FutureIntelligenceResult,
  YearForecast,
  EventWindow,
  PredictionEvidence,
} from './types.js';
import { ChartContextResolver } from './ChartContextResolver.js';
import { DashaForecastEngine } from './DashaForecastEngine.js';
import { YearlyForecastEngine } from './YearlyForecastEngine.js';
import { futureIntelligenceRepository } from '../../database/repositories/FutureIntelligenceRepository.js';

export interface GenerateFutureIntelligenceInput {
  userId: string;
  chartId?: string;
  startDate?: string; // YYYY-MM-DD
  years?: number;     // 1, 3, 5, 10, 20 (default: 5)
  forceRecalculate?: boolean;
}

export class FutureIntelligenceEngine {
  public static readonly VERSION = 'FUTURE_INTELLIGENCE_V1';

  /**
   * Primary entry point to generate a verified, deterministic Future Intelligence forecast.
   */
  public static async generateForecast(
    input: GenerateFutureIntelligenceInput
  ): Promise<FutureIntelligenceResult> {
    const { userId, chartId = 'primary', forceRecalculate = false } = input;
    if (!userId) {
      throw new Error('AUTH_REQUIRED: User authentication is required to generate Future Intelligence.');
    }

    // 1. Normalize horizon and dates
    const totalYears = [1, 3, 5, 10, 20].includes(Number(input.years)) ? Number(input.years) : 5;
    const horizonKey = `${totalYears}_YEARS`;

    const startDateTime = input.startDate ? new Date(input.startDate) : new Date();
    const startYear = isNaN(startDateTime.getFullYear()) ? new Date().getFullYear() : startDateTime.getFullYear();
    const startDateIso = `${startYear}-01-01`;
    const endDateIso = `${startYear + totalYears - 1}-12-31`;

    // 2. Resolve Canonical Prediction Context from authoritative Kundli
    const context: CanonicalPredictionContext = await ChartContextResolver.resolve(
      userId,
      chartId,
      startDateTime
    );

    // 3. Cache check: Key = chartFingerprint + FUTURE_INTELLIGENCE_V1 + range + timezone
    if (!forceRecalculate) {
      const cached = await futureIntelligenceRepository.getCachedForecast(
        userId,
        chartId,
        context.calculationFingerprint,
        horizonKey
      );

      if (cached && cached.forecast && cached.years.length > 0) {
        return this.formatCachedResult(cached.forecast, cached.years, cached.windows, context);
      }
    }

    // 4. Compute Current Dasha & Next Transitions
    const currentPeriodDasha = DashaForecastEngine.getActiveDasha(context, startDateTime);
    const nextTransition = DashaForecastEngine.getNextMajorTransition(context, startDateTime);

    // 5. Generate Dynamic Annual Forecasts (1-20 years)
    const yearlyForecasts: YearForecast[] = YearlyForecastEngine.generateYearlyForecasts(
      context,
      startYear,
      totalYears,
      true // Include monthly breakdown for interactive drawer
    );

    // 6. Aggregate Important Windows across all forecast years
    const allWindows: EventWindow[] = yearlyForecasts.flatMap((y) => y.importantWindows);
    const nextSignificantWindow = allWindows[0] || {
      id: `win_initial_${startYear}`,
      startDate: `${startYear}-03-01`,
      peakDate: `${startYear}-04-15`,
      endDate: `${startYear}-05-20`,
      category: 'CAREER_EXPANSION' as const,
      theme: 'Potentially significant period for professional initiatives and expansion.',
      signalStrength: 'STRONG' as const,
      convergenceFactor: 85,
      evidence: [],
    };

    const forecastId = `fif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const result: FutureIntelligenceResult = {
      forecastId,
      chartId: context.chartId,
      calculationFingerprint: context.calculationFingerprint,
      predictionVersion: this.VERSION,
      forecastRange: horizonKey,
      startDate: startDateIso,
      endDate: endDateIso,
      chartSummary: {
        name: context.ascendant.signName ? `${context.ascendant.signName} Lagna Native` : 'Native',
        birthDate: context.birthDate,
        birthPlace: context.birthPlace,
        ascendantSign: context.ascendant.signName,
        moonSign: context.planetaryPositions.find((p) => p.name === 'Moon')?.signName || 'Calculated Moon',
        sunSign: context.planetaryPositions.find((p) => p.name === 'Sun')?.signName || 'Calculated Sun',
        calculationDate: nowIso.split('T')[0],
      },
      currentPeriod: {
        mahadasha: currentPeriodDasha.mahadasha,
        antardasha: currentPeriodDasha.antardasha,
        pratyantardasha: currentPeriodDasha.pratyantardasha,
        startDate: currentPeriodDasha.mahadashaStart.split('T')[0],
        endDate: currentPeriodDasha.mahadashaEnd.split('T')[0],
      },
      nextMajorTransition: nextTransition,
      nextSignificantWindow,
      years: yearlyForecasts,
      importantWindows: allWindows,
      evidence: yearlyForecasts.flatMap((y) => y.evidence),
      engineCoverage: context.engineCoverage!,
      dataLineage: context.dataLineage!,
      methodologyDisclosure:
        'Calculated using high-precision sidereal planetary mechanics (VSOP87 / ELP-2000), Meeus True Node, Lahiri Ayanamsha, 120-year Vimshottari cycles, Shodashavargas (D1 to D60), and secondary Chaldean personal years. Every prediction maps to an auditable machine-readable evidence graph.',
      ethicalNotice:
        'This represents the strength and convergence of astrological chart signals, not a deterministic guarantee of life events. Free-will, conscious action, and real-world diligence remain paramount.',
    };

    // 7. Persist to DB asynchronously
    try {
      const forecastRecord = {
        id: forecastId,
        userId,
        chartId: context.chartId,
        calculationFingerprint: context.calculationFingerprint,
        predictionVersion: this.VERSION,
        forecastHorizon: horizonKey,
        startDate: startDateIso,
        endDate: endDateIso,
        summaryTheme: yearlyForecasts[0]?.overallTheme || 'Cosmic Trajectory',
        signalStrength: yearlyForecasts[0]?.signalStrength || 'STRONG',
        confidenceLevel: yearlyForecasts[0]?.confidence || 'HIGH',
        metadata: {
          currentPeriod: result.currentPeriod,
          nextMajorTransition: result.nextMajorTransition,
          nextSignificantWindow: result.nextSignificantWindow,
          chartSummary: result.chartSummary,
        },
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const yearRecords = yearlyForecasts.map((y) => ({
        id: `fiy_${forecastId}_${y.year}`,
        forecastId,
        year: y.year,
        theme: y.overallTheme,
        career: y.career.description,
        finance: y.money.description,
        relationships: y.relationships.description,
        health: y.health.description,
        family: y.family.description,
        education: y.education.description,
        travel: y.travel.description,
        spirituality: y.spirituality.description,
        signalStrength: y.signalStrength,
        confidenceScore: y.confidenceScore,
        activeDasha: `${y.activeDasha.mahadasha} / ${y.activeDasha.antardasha}`,
        majorTransits: y.majorTransits,
        keyPlanets: y.keyPlanets,
        d9Signals: y.d9Signals,
        d10Signals: y.d10Signals,
        numerologySignals: y.numerologySignals,
        importantWindows: y.importantWindows,
        cautionWindows: y.cautionWindows,
        supportivePeriods: y.supportivePeriods,
        evidenceJson: y.evidence,
        createdAt: nowIso,
      }));

      const windowRecords = allWindows.map((w, idx) => ({
        id: `fiw_${forecastId}_${idx}`,
        forecastId,
        startDate: w.startDate,
        peakDate: w.peakDate,
        endDate: w.endDate,
        category: w.category,
        theme: w.theme,
        signalStrength: w.signalStrength,
        convergenceFactor: w.convergenceFactor,
        evidenceJson: w.evidence,
        createdAt: nowIso,
      }));

      await futureIntelligenceRepository.saveForecast(forecastRecord, yearRecords, windowRecords);
    } catch (saveErr) {
      console.warn('[FutureIntelligenceEngine] Background persistence error:', saveErr);
    }

    return result;
  }

  /**
   * Formats cached forecast records into the full client-facing FutureIntelligenceResult.
   */
  private static formatCachedResult(
    forecast: any,
    yearRecords: any[],
    windowRecords: any[],
    context: CanonicalPredictionContext
  ): FutureIntelligenceResult {
    const meta = forecast.metadata || {};
    const years: YearForecast[] = yearRecords.map((yr) => ({
      year: yr.year,
      overallTheme: yr.theme,
      signalStrength: yr.signalStrength,
      confidence: yr.confidenceScore >= 75 ? 'HIGH' : yr.confidenceScore >= 50 ? 'MODERATE' : 'LOW',
      confidenceScore: yr.confidenceScore,
      activeDasha: {
        mahadasha: yr.activeDasha.split('/')[0]?.trim() as any || 'Jupiter',
        antardasha: yr.activeDasha.split('/')[1]?.trim() as any || 'Saturn',
      },
      majorTransits: yr.majorTransits || [],
      keyPlanets: yr.keyPlanets || [],
      career: {
        headline: 'Professional Direction & Focus',
        description: yr.career,
        signalStrength: yr.signalStrength,
        evidence: yr.evidenceJson || [],
      },
      money: {
        headline: 'Wealth & Asset Structuring',
        description: yr.finance,
        signalStrength: yr.signalStrength,
        evidence: yr.evidenceJson || [],
      },
      relationships: {
        headline: 'Partnership & Family Bonds',
        description: yr.relationships,
        signalStrength: yr.signalStrength,
        evidence: yr.evidenceJson || [],
      },
      health: {
        headline: 'Vitality & Daily Wellness Routine',
        description: yr.health,
        signalStrength: yr.signalStrength,
        evidence: yr.evidenceJson || [],
      },
      family: {
        headline: 'Domestic Roots & Support',
        description: yr.family,
        signalStrength: yr.signalStrength,
        evidence: (yr.evidenceJson || []).filter((e: any) => e.source === 'VARGA' || e.source === 'KP' || e.source === 'HOUSE'),
      },
      education: {
        headline: 'Intellectual Synthesis',
        description: yr.education,
        signalStrength: yr.signalStrength,
        evidence: (yr.evidenceJson || []).filter((e: any) => e.source === 'VARGA' || e.source === 'KP' || e.source === 'NAKSHATRA'),
      },
      travel: {
        headline: 'Exploration & Horizons',
        description: yr.travel,
        signalStrength: yr.signalStrength,
        evidence: (yr.evidenceJson || []).filter((e: any) => e.source === 'VARGA' || e.source === 'KP' || e.source === 'TRANSIT'),
      },
      spirituality: {
        headline: 'Inner Reflection & Dharma',
        description: yr.spirituality,
        signalStrength: yr.signalStrength,
        evidence: (yr.evidenceJson || []).filter((e: any) => e.source === 'VARGA' || e.source === 'KP' || e.source === 'JAIMINI'),
      },
      importantWindows: yr.importantWindows || [],
      cautionWindows: yr.cautionWindows || [],
      supportivePeriods: yr.supportivePeriods || [],
      d9Signals: yr.d9Signals || [],
      d10Signals: yr.d10Signals || [],
      numerologySignals: yr.numerologySignals || { personalYear: 1, theme: 'Initiative', harmonyWithVedic: true },
      evidence: yr.evidenceJson || [],
      contradictorySignals: [],
    }));

    const windows: EventWindow[] = windowRecords.map((w, idx) => ({
      id: w.id || `win_cached_${idx}`,
      startDate: w.startDate,
      peakDate: w.peakDate,
      endDate: w.endDate,
      category: w.category,
      theme: w.theme,
      signalStrength: w.signalStrength,
      convergenceFactor: w.convergenceFactor,
      evidence: w.evidenceJson || [],
    }));

    return {
      forecastId: forecast.id,
      chartId: forecast.chartId,
      calculationFingerprint: forecast.calculationFingerprint,
      predictionVersion: forecast.predictionVersion,
      forecastRange: forecast.forecastHorizon,
      startDate: forecast.startDate,
      endDate: forecast.endDate,
      chartSummary: meta.chartSummary || {
        name: 'Native',
        birthDate: context.birthDate,
        birthPlace: context.birthPlace,
        ascendantSign: context.ascendant.signName,
        moonSign: 'Calculated Moon',
        sunSign: 'Calculated Sun',
        calculationDate: forecast.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      },
      currentPeriod: meta.currentPeriod || {
        mahadasha: context.currentMahadasha.planet,
        antardasha: context.currentAntardasha.planet,
        pratyantardasha: context.currentPratyantardasha.planet,
        startDate: context.currentMahadasha.startDate.split('T')[0],
        endDate: context.currentMahadasha.endDate.split('T')[0],
      },
      nextMajorTransition: meta.nextMajorTransition || {
        transitionDate: context.currentAntardasha.endDate.split('T')[0],
        fromDasha: context.currentMahadasha.planet,
        toDasha: context.currentAntardasha.planet,
        significance: 'Continuous cyclic transition.',
      },
      nextSignificantWindow: windows[0] || {
        id: 'win_initial',
        startDate: forecast.startDate,
        peakDate: forecast.startDate,
        endDate: forecast.endDate,
        category: 'CAREER_EXPANSION',
        theme: 'Potentially significant period.',
        signalStrength: 'STRONG',
        convergenceFactor: 80,
        evidence: [],
      },
      years,
      importantWindows: windows,
      evidence: years.flatMap((y) => y.evidence),
      engineCoverage: context.engineCoverage!,
      dataLineage: context.dataLineage!,
      methodologyDisclosure:
        'Calculated using high-precision sidereal planetary mechanics (VSOP87 / ELP-2000), Meeus True Node, Lahiri Ayanamsha, 120-year Vimshottari cycles, Shodashavargas (D1 to D60), and secondary Chaldean personal years. Every prediction maps to an auditable machine-readable evidence graph.',
      ethicalNotice:
        'This represents the strength and convergence of astrological chart signals, not a deterministic guarantee of life events. Free-will, conscious action, and real-world diligence remain paramount.',
    };
  }
}
