/**
 * DeepAstro Observatory V2.0 - Domain Calibration Engine
 * Tracks prediction calibration per domain separately.
 * INVARIANT: Strong performance in one domain cannot hide poor performance elsewhere.
 */
import { DomainCalibrationReport } from './ObservatoryV2Types.js';

interface DomainSample { predictedConfidence: number; outcomeScore: number; }

export class DomainCalibrationEngine {
  private static domainSamples: Map<string, DomainSample[]> = new Map();
  private static readonly MIN_SAMPLE = 5;

  public static addSample(domain: string, predictedConfidence: number, outcomeScore: number): void {
    if (!this.domainSamples.has(domain)) this.domainSamples.set(domain, []);
    this.domainSamples.get(domain)!.push({ predictedConfidence, outcomeScore });
  }

  public static getReport(domain: string): DomainCalibrationReport {
    const samples = this.domainSamples.get(domain) ?? [];
    const now = new Date().toISOString();

    if (samples.length < this.MIN_SAMPLE) {
      return { domain, sampleSize: samples.length, brierScore: null, eventAccuracy: null, timingAccuracy: null, status: 'INSUFFICIENT_SAMPLE', computedAt: now };
    }

    const N = samples.length;
    const brierScore = samples.reduce((acc, s) => acc + Math.pow(s.predictedConfidence - s.outcomeScore, 2), 0) / N;
    const eventAccuracy = samples.filter(s => s.outcomeScore >= 0.5).length / N;

    return { domain, sampleSize: N, brierScore: +brierScore.toFixed(4), eventAccuracy: +eventAccuracy.toFixed(4), timingAccuracy: null, status: 'SUFFICIENT', computedAt: now };
  }

  public static getAllReports(): DomainCalibrationReport[] {
    const domains = [
      'CAREER', 'BUSINESS', 'FINANCE', 'RELATIONSHIPS', 'EDUCATION',
      'RELOCATION', 'CREATIVITY', 'SPIRITUALITY', 'LIFE_PHASE', 'GENERAL',
    ];
    return domains.map(d => this.getReport(d));
  }

  public static reset(): void { this.domainSamples.clear(); }
}
