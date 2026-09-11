import { describe, it, expect } from 'vitest';
import { DailyPredictionEngine } from '../server/src/astrology/DailyPredictionEngine.js';
import { PredictionGuard } from '../server/src/astrology/PredictionGuard.js';
import { BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('Universal Daily Prediction Card Engine Suite', () => {
  const userAries: BirthProfileInput = {
    name: 'Aarav Sharma',
    birthDate: '1995-04-10',
    birthTime: '06:30',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
    gender: 'Male',
    isApproximateTime: false,
  };

  const userScorpio: BirthProfileInput = {
    name: 'Diya Sen',
    birthDate: '2000-11-15',
    birthTime: '17:45',
    birthPlace: 'Kolkata, India',
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: 5.5,
    gender: 'Female',
    isApproximateTime: false,
  };

  it('1. Generates authentic, fully structured Daily Prediction Cards for distinct users', () => {
    const cardA = DailyPredictionEngine.generateCard(userAries, new Date('2026-09-04T10:00:00Z'));
    const cardB = DailyPredictionEngine.generateCard(userScorpio, new Date('2026-09-04T10:00:00Z'));

    expect(cardA.predictionId).toBeDefined();
    expect(cardB.predictionId).toBeDefined();
    expect(cardA.predictionId).not.toBe(cardB.predictionId);

    // Zodiac & identity must match authentic astronomical calculation
    expect(cardA.identity.ascendantSign).toBeDefined();
    expect(cardB.identity.ascendantSign).toBeDefined();
    expect(cardA.identity.ascendantSign).not.toBe(cardB.identity.ascendantSign);

    // Lucky elements must reflect individual ruling planets
    expect(cardA.luckyElements.color.name).not.toBe(cardB.luckyElements.color.name);
    expect(cardA.mantra.sanskrit).not.toBe(cardB.mantra.sanskrit);

    // Both cards must pass PredictionGuard validation
    const valA = PredictionGuard.validate(cardA);
    const valB = PredictionGuard.validate(cardB);

    expect(valA.isValid).toBe(true);
    expect(valB.isValid).toBe(true);
    expect(valA.accuracyConfidence).toBeGreaterThanOrEqual(0.9);
  });

  it('2. Enforces non-fatalistic language and authentic scores within bounds', () => {
    const card = DailyPredictionEngine.generateCard(userAries);

    expect(card.scores.overall.score).toBeGreaterThanOrEqual(0);
    expect(card.scores.overall.score).toBeLessThanOrEqual(10);
    expect(card.scores.career.score).toBeGreaterThanOrEqual(0);
    expect(card.scores.career.score).toBeLessThanOrEqual(10);
    expect(card.scores.love.score).toBeGreaterThanOrEqual(0);
    expect(card.scores.love.score).toBeLessThanOrEqual(10);
    expect(card.scores.health.score).toBeGreaterThanOrEqual(0);
    expect(card.scores.health.score).toBeLessThanOrEqual(10);
    expect(card.scores.finance.score).toBeGreaterThanOrEqual(0);
    expect(card.scores.finance.score).toBeLessThanOrEqual(10);

    expect(card.auspiciousTimings.length).toBeGreaterThanOrEqual(2);
    expect(card.planetaryInfluences.length).toBeGreaterThanOrEqual(3);
    expect(card.advice.length).toBeGreaterThanOrEqual(4);
  });

  it('3. PredictionGuard detects and flags fatalistic or fabricated statements', () => {
    const card = DailyPredictionEngine.generateCard(userAries);

    // Mutate with a forbidden fatalistic claim
    const poisonedCard = JSON.parse(JSON.stringify(card));
    poisonedCard.mainPrediction.predictionText += ' You will definitely lose your job tomorrow.';

    const val = PredictionGuard.validate(poisonedCard);
    expect(val.isValid).toBe(false);
    expect(val.errors.some((e: string) => e.includes('fatalistic'))).toBe(true);
  });
});
