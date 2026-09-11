import { describe, it, expect } from 'vitest';
import { CosmicFeaturesEngine } from '../server/src/astrology/CosmicFeaturesEngine.js';

describe('CosmicFeaturesEngine Verification Suite', () => {
  it('calculates 9 live sky planets with valid sidereal coordinates and nakshatras', () => {
    const planets = CosmicFeaturesEngine.getLiveSkyPlanets();
    expect(planets).toHaveLength(9);

    const names = planets.map((p) => p.name);
    expect(names).toContain('Sun');
    expect(names).toContain('Moon');
    expect(names).toContain('Mars');
    expect(names).toContain('Mercury');
    expect(names).toContain('Jupiter');
    expect(names).toContain('Venus');
    expect(names).toContain('Saturn');
    expect(names).toContain('Rahu');
    expect(names).toContain('Ketu');

    for (const p of planets) {
      expect(p.degreeInSign).toBeGreaterThanOrEqual(0);
      expect(p.degreeInSign).toBeLessThan(30);
      expect(p.signIndex).toBeGreaterThanOrEqual(0);
      expect(p.signIndex).toBeLessThan(12);
      expect(typeof p.nakshatra).toBe('string');
      expect(p.nakshatra.length).toBeGreaterThan(0);
      expect([1, 2, 3, 4]).toContain(p.pada);
    }
  });

  it('calculates 8 day and 8 night Choghadiya slots with active timer and planetary hora', () => {
    const choghadiya = CosmicFeaturesEngine.calculateChoghadiyaAndHora(new Date(), 28.6139, 77.2090);

    expect(choghadiya.daySlots).toHaveLength(8);
    expect(choghadiya.nightSlots).toHaveLength(8);
    expect(choghadiya.currentChoghadiya).toBeDefined();
    expect(choghadiya.nextChoghadiya).toBeDefined();
    expect(choghadiya.remainingSecondsInCurrent).toBeGreaterThanOrEqual(0);

    expect(choghadiya.currentHora).toBeDefined();
    expect(typeof choghadiya.currentHora.planet).toBe('string');
    expect(choghadiya.currentHora.favorableActivities.length).toBeGreaterThan(0);
  });

  it('evaluates Moon Phase with illumination percentage and ritual guidance', () => {
    const moon = CosmicFeaturesEngine.getMoonPhaseAndRitual();

    expect(moon.illuminationPercentage).toBeGreaterThanOrEqual(0);
    expect(moon.illuminationPercentage).toBeLessThanOrEqual(100);
    expect(typeof moon.phaseName).toBe('string');
    expect(moon.ritualGuide.title.length).toBeGreaterThan(0);
    expect(moon.ritualGuide.instructions.length).toBeGreaterThanOrEqual(3);
    expect(typeof moon.ritualGuide.mantra).toBe('string');
  });

  it('generates 6-dimensional Co-Star style life radar, do\'s and dont\'s, and lucky matrix', () => {
    const mockChart = {
      moonSign: { signName: 'Taurus' },
      moonNakshatra: { name: 'Rohini' },
      dashas: { currentMahadasha: { planet: 'Jupiter' } },
    };

    const daily = CosmicFeaturesEngine.getDailyLifeDimensions(mockChart);

    expect(daily.dimensions).toHaveLength(6);
    expect(daily.overallVibeScore).toBeGreaterThanOrEqual(50);
    expect(daily.overallVibeScore).toBeLessThanOrEqual(100);

    for (const dim of daily.dimensions) {
      expect(dim.score).toBeGreaterThanOrEqual(0);
      expect(dim.score).toBeLessThanOrEqual(100);
      expect(typeof dim.highlight).toBe('string');
    }

    expect(daily.dosAndDonts.dos.length).toBeGreaterThanOrEqual(4);
    expect(daily.dosAndDonts.donts.length).toBeGreaterThanOrEqual(4);
    expect(daily.luckyMatrix.luckyNumbers.length).toBe(3);
    expect(daily.luckyMatrix.powerColor.length).toBeGreaterThan(0);
  });

  it('draws a valid Tarot archetype mapped to Vedic Grahas with upright and reversed meanings', () => {
    const card = CosmicFeaturesEngine.getDailyTarot(new Date(), 3);

    expect(card.cardName).toBe('The Empress');
    expect(card.vedicGraha).toContain('Venus');
    expect(typeof card.uprightMeaning).toBe('string');
    expect(typeof card.reversedMeaning).toBe('string');
    expect(typeof card.microRitual).toBe('string');
    expect(typeof card.beejaMantra).toBe('string');
  });

  it('evaluates Instant Prashna Kundli with Karya Siddhi probability score', () => {
    const res = CosmicFeaturesEngine.calculatePrashnaKundli(
      'Will my international contract be approved this quarter?',
      28.6139,
      77.2090
    );

    expect(res.karyaSiddhiPercentage).toBeGreaterThanOrEqual(0);
    expect(res.karyaSiddhiPercentage).toBeLessThanOrEqual(100);
    expect(typeof res.prashnaLagna).toBe('string');
    expect(res.astrologicalSignatures.length).toBeGreaterThan(0);
    expect(typeof res.verdict).toBe('string');
  });

  it('synthesizes Life Cycles and deep synastry relationship dynamics', () => {
    const chart1 = { moonSign: { signName: 'Cancer' }, moonNakshatra: { name: 'Pushya' } };
    const chart2 = { moonSign: { signName: 'Scorpio' }, moonNakshatra: { name: 'Anuradha' } };

    const cycles = CosmicFeaturesEngine.calculateLifeCycles(chart1);
    expect(cycles.length).toBeGreaterThanOrEqual(2);
    expect(cycles[0].progressPercentage).toBeGreaterThanOrEqual(0);
    expect(cycles[0].progressPercentage).toBeLessThanOrEqual(100);

    const synastry = CosmicFeaturesEngine.calculateDeepSynastry(chart1, chart2);
    expect(synastry.overallBondScore).toBeGreaterThanOrEqual(0);
    expect(synastry.overallBondScore).toBeLessThanOrEqual(100);
    expect(synastry.quadrants.soulResonance.score).toBeGreaterThan(0);
    expect(synastry.quadrants.communicationFlow.score).toBeGreaterThan(0);
    expect(synastry.quadrants.passionAndFriction.score).toBeGreaterThan(0);
    expect(synastry.quadrants.longTermGrowth.score).toBeGreaterThan(0);
    expect(synastry.keysToThrive.length).toBeGreaterThanOrEqual(3);
  });
});
