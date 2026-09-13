import { describe, it, expect } from 'vitest';
import { UniversalQuestionRouter } from '../server/src/chatbot/UniversalQuestionRouter.js';
import { CardImagePromptBuilder } from '../server/src/chatbot/CardImagePromptBuilder.js';
import { UniversalChatService } from '../server/src/chatbot/UniversalChatService.js';
import { globalWeatherProvider } from '../server/src/engines/weather/WeatherProvider.js';
import { MarketDataService } from '../server/src/engines/market/marketDataService.js';
import { KPPrashnaEngine } from '../server/src/engines/kp/kpPrashnaEngine.js';

describe('DeepAstro Universal Intelligence Chatbot & Answer Card Engine Tests', () => {

  // 1. Universal Question Router
  it('correctly classifies multi-domain queries into verified domain intents', () => {
    const careerIntent = UniversalQuestionRouter.route('Will I get a promotion this year?');
    expect(careerIntent.primaryDomain).toBe('CAREER');
    expect(careerIntent.requiresBirthData).toBe(true);

    const weatherIntent = UniversalQuestionRouter.route('What is the weather today in New Delhi?');
    expect(weatherIntent.primaryDomain).toBe('WEATHER');
    expect(weatherIntent.requiresCurrentData).toBe(true);

    const marketIntent = UniversalQuestionRouter.route('What is happening in NIFTY today and should I invest?');
    expect(marketIntent.primaryDomain).toBe('MARKET');
    expect(marketIntent.requiresCurrentData).toBe(true);

    const prashnaIntent = UniversalQuestionRouter.route('KP Horary question with seed 145: will I change jobs?');
    expect(prashnaIntent.primaryDomain).toBe('KP_PRASHNA');

    const scienceIntent = UniversalQuestionRouter.route('What causes a total solar eclipse and gravitational lensing?');
    expect(scienceIntent.primaryDomain).toBe('SCIENCE');
  });

  // 2. Image Differentiation
  it('generates distinct, question-specific visual concepts and prompts per domain', () => {
    const careerSpec = CardImagePromptBuilder.build({
      question: 'Will I get a promotion?',
      domain: 'CAREER'
    });
    expect(careerSpec.styleTheme).toBe('CAREER');
    expect(careerSpec.prompt).toContain('ascending luminous');

    const weatherSpec = CardImagePromptBuilder.build({
      question: 'Will it rain today?',
      domain: 'WEATHER'
    });
    expect(weatherSpec.styleTheme).toBe('WEATHER');
    expect(weatherSpec.prompt).toContain('meteorological');

    const marketSpec = CardImagePromptBuilder.build({
      question: 'NIFTY price trends',
      domain: 'MARKET'
    });
    expect(marketSpec.styleTheme).toBe('FINANCIAL');
    expect(marketSpec.prompt).toContain('financial');

    // Prompts must not be identical across different domains
    expect(careerSpec.prompt).not.toBe(weatherSpec.prompt);
    expect(careerSpec.prompt).not.toBe(marketSpec.prompt);
  });

  // 3. Full Answer Card Synthesis & Quality Gate
  it('produces a complete DeepAstro Answer Card complying with design and verification specs', async () => {
    const res = await UniversalChatService.answerQuestion('Will I get a promotion this year?');
    expect(res).toBeDefined();
    expect(res.card).toBeDefined();

    const card = res.card;
    expect(card.version).toBe('6.0.4');
    expect(card.question).toBe('Will I get a promotion this year?');
    expect(card.primaryHeader).toBe('Career Outlook');
    expect(card.keySignals.length).toBeGreaterThanOrEqual(2);
    expect(card.visualImageUrl).toBeDefined();
    expect(card.sourcesFooter.sources.length).toBeGreaterThanOrEqual(1);

    // No undefined or NaN strings in rendered card
    const cardStr = JSON.stringify(card);
    expect(cardStr).not.toContain('undefined');
    expect(cardStr).not.toContain('NaN');
    expect(cardStr).not.toContain('null');

    // If momentum score exists, it must have mathematical provenance
    if (card.momentumScore) {
      expect(card.momentumScore.percentage).toBeGreaterThan(0);
      expect(card.momentumScore.computedFrom).toBeDefined();
    }
  });

  // 4. Real Weather Engine Physical Telemetry
  it('retrieves real Open-Meteo weather with strict scientific separation', async () => {
    const weather = await globalWeatherProvider.getWeather(28.6139, 77.2090, 'New Delhi');
    expect(weather).toBeDefined();
    expect(weather.location.city).toBe('New Delhi');
    expect(typeof weather.temperatureCelsius).toBe('number');
    expect(weather.provenance.provider).toBe('Open-Meteo');

    const comparison = globalWeatherProvider.getAstroPhysicalComparison(weather, {
      sunSign: 'Virgo',
      moonSign: 'Libra',
      dominantElement: 'AIR',
      lunarPhase: 'Waxing Crescent',
      significantTransits: ['Sun conjunct Mercury']
    });
    expect(comparison.disclaimer).toContain('SCIENTIFIC SEPARATION GUARANTEE');
  });

  // 5. Market Data Engine Integrity
  it('delivers market pulse with zero synthetic price fluctuation', async () => {
    const pulse = await MarketDataService.getMarketPulse();
    expect(pulse).toBeDefined();
    expect(pulse.primaryIndices.length).toBeGreaterThan(0);

    const nifty = pulse.primaryIndices.find(x => x.symbol === 'NIFTY 50');
    expect(nifty).toBeDefined();
    expect(nifty!.currentPrice).toBeGreaterThan(0);
    expect(nifty!.source).toBeDefined();
  });

  // 6. KP Prashna 1-249 Deterministic Engine
  it('calculates deterministic horary chart for seed 1-249 without AI interpolation', () => {
    const chart = KPPrashnaEngine.generatePrashnaChart({
      question: 'Will I get the project approved?',
      seedNumber: 108,
      questionTimestamp: new Date('2026-09-13T10:00:00Z'),
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
      locationName: 'New Delhi'
    });

    expect(chart).toBeDefined();
    expect(chart.seedNumber).toBe(108);
    expect(chart.horaryAscendant.longitude).toBeGreaterThanOrEqual(0);
    expect(chart.cusps.length).toBe(12);
    expect(chart.rulingPlanets).toBeDefined();
  });
});
