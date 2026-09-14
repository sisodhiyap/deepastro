/**
 * DeepAstro Observatory V2.0 - Deduplication Engine
 * Prevents one real-world event from generating multiple "correct" predictions.
 */
import { DeduplicationResult, DeduplicationStatus } from './ObservatoryV2Types.js';

interface PredictionForDedup {
  predictionId: string;
  domain: string;
  eventDescription: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  userId: string;
}

export class PredictionDeduplicationEngine {
  private static normalizeText(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  }

  private static windowsOverlap(
    s1: string, e1: string, s2: string, e2: string
  ): boolean {
    const start1 = new Date(s1).getTime();
    const end1 = new Date(e1).getTime();
    const start2 = new Date(s2).getTime();
    const end2 = new Date(e2).getTime();
    return start1 <= end2 && start2 <= end1;
  }

  private static textSimilarity(a: string, b: string): number {
    const na = this.normalizeText(a);
    const nb = this.normalizeText(b);
    if (na === nb) return 1.0;
    const aWords = new Set(na.split(' '));
    const bWords = new Set(nb.split(' '));
    const intersection = new Set([...aWords].filter(w => bWords.has(w)));
    const union = new Set([...aWords, ...bWords]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  public static check(
    candidate: PredictionForDedup,
    existing: PredictionForDedup[]
  ): DeduplicationResult {
    const sameUserPredictions = existing.filter(p =>
      p.userId === candidate.userId && p.predictionId !== candidate.predictionId
    );

    const duplicates: string[] = [];
    const overlaps: string[] = [];

    for (const pred of sameUserPredictions) {
      if (pred.domain !== candidate.domain) continue;

      const similarity = this.textSimilarity(candidate.eventDescription, pred.eventDescription);
      const windowOverlap = this.windowsOverlap(
        candidate.timeWindowStart, candidate.timeWindowEnd,
        pred.timeWindowStart, pred.timeWindowEnd
      );

      if (similarity >= 0.75 && windowOverlap) duplicates.push(pred.predictionId);
      else if (windowOverlap) overlaps.push(pred.predictionId);
    }

    let status: DeduplicationStatus;
    let similarityScore = 0;
    let reason = '';

    if (duplicates.length > 0) {
      status = 'DUPLICATE';
      similarityScore = 0.9;
      reason = `High-similarity duplicate found: ${duplicates[0]}`;
    } else if (overlaps.length > 0) {
      status = 'OVERLAPPING';
      similarityScore = 0.65;
      reason = `Overlapping predictions in same domain/window: ${overlaps.join(', ')}`;
    } else {
      status = 'UNIQUE';
      similarityScore = 0;
      reason = 'No duplicates or significant overlaps detected';
    }

    return {
      predictionId: candidate.predictionId,
      status, duplicateOf: duplicates[0],
      overlapsWith: overlaps, similarityScore, reason,
    };
  }
}
