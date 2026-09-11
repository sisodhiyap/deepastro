import { describe, it, expect } from 'vitest';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { PredictionEngine } from '../server/src/astrology/PredictionEngine.js';
import { DeepAstroBrain } from '../server/src/brain/DeepAstroBrain.js';

describe('Daily Predictions & Kundli Brain Dynamic Recalculation Suite', () => {
  const userA: BirthProfileInput = {
    name: 'Karan Mehra',
    birthDate: '1988-03-21',
    birthTime: '06:15',
    birthPlace: 'Kolkata, India',
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: 5.5,
    gender: 'Male',
    isApproximateTime: false,
  };

  const userB: BirthProfileInput = {
    name: 'Ananya Roy',
    birthDate: '2001-11-09',
    birthTime: '18:45',
    birthPlace: 'Mumbai, India',
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 5.5,
    gender: 'Female',
    isApproximateTime: false,
  };

  it('1. Generates authentic Vedic FactSets dynamically based on birth data', () => {
    const factSetA = VedicAstroEngine.createAstrologyFactSet(userA);
    const factSetB = VedicAstroEngine.createAstrologyFactSet(userB);

    expect(factSetA.ascendant.details.signName).toBeDefined();
    expect(factSetB.ascendant.details.signName).toBeDefined();
    expect(factSetA.ascendant.details.signName).not.toBe(factSetB.ascendant.details.signName);

    const moonA = factSetA.planets.find(p => p.name === 'Moon');
    const moonB = factSetB.planets.find(p => p.name === 'Moon');
    expect(moonA?.signName).not.toBe(moonB?.signName);
  });

  it('2. PredictionEngine.generateDomainPredictions accurately differentiates User A and User B', () => {
    const factSetA = VedicAstroEngine.createAstrologyFactSet(userA);
    const factSetB = VedicAstroEngine.createAstrologyFactSet(userB);

    const predictionsA = PredictionEngine.generateDomainPredictions(factSetA);
    const predictionsB = PredictionEngine.generateDomainPredictions(factSetB);

    expect(predictionsA.Career).toBeDefined();
    expect(predictionsB.Career).toBeDefined();
    expect(predictionsA.Finance).toBeDefined();
    expect(predictionsB.Finance).toBeDefined();

    // Career domain predictions reflect differing planetary house configurations
    const careerA = predictionsA.Career;
    const careerB = predictionsB.Career;

    expect(careerA.whyAstrological).not.toBe(careerB.whyAstrological);
    expect(careerA.headline).toBeDefined();
    expect(careerB.headline).toBeDefined();
  });

  it('3. Recalculates completely when birth time shifts by 4 hours', () => {
    const userAShifted: BirthProfileInput = {
      ...userA,
      birthTime: '10:15',
    };

    const factSetOriginal = VedicAstroEngine.createAstrologyFactSet(userA);
    const factSetShifted = VedicAstroEngine.createAstrologyFactSet(userAShifted);

    expect(factSetOriginal.ascendant.details.totalDegrees).not.toBe(factSetShifted.ascendant.details.totalDegrees);
    expect(factSetOriginal.ascendant.details.signName).not.toBe(factSetShifted.ascendant.details.signName);

    const predsOriginal = PredictionEngine.generateDomainPredictions(factSetOriginal);
    const predsShifted = PredictionEngine.generateDomainPredictions(factSetShifted);

    expect(JSON.stringify(predsOriginal)).not.toBe(JSON.stringify(predsShifted));
  });

  it('4. DeepAstroBrain answers user queries strictly grounded in birth chart ephemeris', async () => {
    const question = 'How does my current dasha and Saturn transit affect my career trajectory?';
    
    const brainResponse = await DeepAstroBrain.analyze({
      userId: 'test_user_karan',
      question,
      birthProfile: userA,
      allowPublicResearch: false,
    });

    expect(brainResponse).toBeDefined();
    expect(brainResponse.structuredReading).toBeDefined();
    expect(brainResponse.structuredReading.directAnswer).toBeDefined();
    expect(brainResponse.structuredReading.whatYourChartIndicates).toBeDefined();
    expect(brainResponse.structuredReading.supportingFactors.length).toBeGreaterThan(0);
    expect(brainResponse.systemsConsulted.vedic.lagna).toBeDefined();
    expect(brainResponse.calculationFingerprint).toBeDefined();
  });
});
