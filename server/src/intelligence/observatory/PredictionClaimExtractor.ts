/**
 * DeepAstro Prediction Claim Extractor
 * Converts unstructured natural language forecasts or raw JSON predictions into canonical PredictionClaim objects.
 * Never evaluates raw prose directly.
 */

import { PredictionClaim, PredictionDomain, PredictionDirection, PredictionMagnitude } from './ObservatoryTypes.js';
import { PredictionDiscriminatorEngine } from './PredictionDiscriminatorEngine.js';
import crypto from 'crypto';

export class PredictionClaimExtractor {
  public static extractFromForecast(params: {
    predictionId: string;
    userId: string;
    forecastText: string;
    domain?: PredictionDomain;
    timeWindow?: { startDate: string; endDate: string; precision?: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' };
    confidence?: number;
    uncertainty?: number;
    evidenceIds?: string[];
    contradictionIds?: string[];
    systemsUsed?: string[];
    modelUsed?: string;
    provider?: string;
    calculationSnapshotHash?: string;
    knowledgeSnapshotHash?: string;
  }): PredictionClaim {
    const {
      predictionId,
      userId,
      forecastText,
      domain = this.inferDomain(forecastText),
      timeWindow = this.inferTimeWindow(forecastText),
      confidence = 0.65,
      uncertainty = 0.35,
      evidenceIds = [],
      contradictionIds = [],
      systemsUsed = ['VimshottariDasha', 'TransitEngine'],
      modelUsed = 'CFIE-v2.0',
      provider = 'DeepAstro-Deterministic',
      calculationSnapshotHash = crypto.createHash('sha256').update(predictionId).digest('hex'),
      knowledgeSnapshotHash = crypto.createHash('sha256').update('knowledge_v4').digest('hex'),
    } = params;

    const claimId = 'claim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const now = new Date().toISOString();

    const direction = this.inferDirection(forecastText);
    const magnitude = this.inferMagnitude(forecastText);
    const eventType = this.inferEventType(forecastText, domain);
    const isBarnum = PredictionDiscriminatorEngine.detectBarnumStatement(forecastText);
    const isOverconfident = PredictionDiscriminatorEngine.detectOverconfidence(forecastText);
    const testability = PredictionDiscriminatorEngine.classifyTestability({
      claimText: forecastText,
      hasTimeWindow: Boolean(timeWindow.startDate && timeWindow.endDate),
      isBarnum,
    });

    const promptHash = crypto.createHash('sha256').update('prompt:' + predictionId).digest('hex');
    const outputHash = crypto.createHash('sha256').update(forecastText).digest('hex');

    return {
      claimId,
      predictionId,
      userId,
      forecastVersion: 'CFIE-2.0',
      issuedAt: now,
      domain,
      eventType,
      direction,
      magnitude,
      timingWindow: {
        startDate: timeWindow.startDate,
        endDate: timeWindow.endDate,
        precision: timeWindow.precision || 'MONTH',
      },
      context: 'Context for ' + domain + ' manifestation',
      rawClaimText: forecastText,
      confidence,
      uncertainty,
      evidenceIds,
      contradictionIds,
      systemsUsed,
      modelUsed,
      provider,
      calculationSnapshotHash,
      knowledgeSnapshotHash,
      promptHash,
      outputHash,
      testability,
      isBarnum,
      isOverconfident,
    };
  }

  private static inferDomain(text: string): PredictionDomain {
    const lower = text.toLowerCase();
    if (lower.includes('career') || lower.includes('job') || lower.includes('promotion') || lower.includes('profession') || lower.includes('work')) return 'CAREER';
    if (lower.includes('business') || lower.includes('venture') || lower.includes('partnership')) return 'BUSINESS';
    if (lower.includes('wealth') || lower.includes('money') || lower.includes('finance') || lower.includes('investment')) return 'FINANCE';
    if (lower.includes('relationship') || lower.includes('marriage') || lower.includes('love') || lower.includes('partner')) return 'RELATIONSHIPS';
    if (lower.includes('health') || lower.includes('wellness') || lower.includes('vitality') || lower.includes('recovery')) return 'WELLBEING';
    if (lower.includes('spiritual') || lower.includes('meditation') || lower.includes('dharma')) return 'SPIRITUALITY';
    if (lower.includes('relocation') || lower.includes('move') || lower.includes('travel') || lower.includes('abroad')) return 'RELOCATION';
    if (lower.includes('education') || lower.includes('study') || lower.includes('exam')) return 'EDUCATION';
    return 'LIFE_PHASE';
  }

  private static inferDirection(text: string): PredictionDirection {
    const lower = text.toLowerCase();
    if (lower.includes('expansion') || lower.includes('success') || lower.includes('favorable') || lower.includes('breakthrough') || lower.includes('gain')) {
      return 'POSITIVE';
    }
    if (lower.includes('friction') || lower.includes('caution') || lower.includes('delay') || lower.includes('pressure') || lower.includes('challenge')) {
      return 'CHALLENGING';
    }
    return 'NEUTRAL';
  }

  private static inferMagnitude(text: string): PredictionMagnitude {
    const lower = text.toLowerCase();
    if (lower.includes('major') || lower.includes('transformative') || lower.includes('pivotal') || lower.includes('monumental')) {
      return 'TRANSFORMATIVE';
    }
    if (lower.includes('significant') || lower.includes('substantial') || lower.includes('notable')) {
      return 'SIGNIFICANT';
    }
    if (lower.includes('subtle') || lower.includes('minor') || lower.includes('gradual')) {
      return 'SUBTLE';
    }
    return 'MODERATE';
  }

  private static inferEventType(text: string, domain: PredictionDomain): string {
    const lower = text.toLowerCase();
    if (lower.includes('promotion')) return 'CAREER_PROMOTION';
    if (lower.includes('job change') || lower.includes('new role')) return 'CAREER_TRANSITION';
    if (lower.includes('marriage') || lower.includes('commitment')) return 'RELATIONSHIP_UNION';
    if (lower.includes('financial gain') || lower.includes('windfall')) return 'FINANCIAL_GAIN';
    if (lower.includes('relocation')) return 'RESIDENTIAL_MOVE';
    return domain + '_DEVELOPMENT';
  }

  private static inferTimeWindow(text: string): { startDate: string; endDate: string; precision: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' } {
    const currentYear = new Date().getFullYear();
    const yearMatch = text.match(/202[4-9]|203[0-5]/);
    const targetYear = yearMatch ? parseInt(yearMatch[0], 10) : currentYear;

    return {
      startDate: targetYear + '-01-01T00:00:00.000Z',
      endDate: targetYear + '-12-31T23:59:59.999Z',
      precision: 'YEAR',
    };
  }
}
