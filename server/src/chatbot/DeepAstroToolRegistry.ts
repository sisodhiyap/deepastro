/**
 * DeepAstro Tool Registry
 * Single unified invocation gateway connecting the Chatbot to all canonical DeepAstro engines.
 * Zero duplicate logic. Direct invocation of existing microservices & calculators.
 */

import { VedicAstroEngine, BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { calculateNumerology } from '../astrology/NumerologyEngine.js';
import { MarketDataService } from '../engines/market/marketDataService.js';
import { NewsProvider } from '../engines/news/newsProvider.js';
import { globalWeatherProvider } from '../engines/weather/WeatherProvider.js';
import { KPPrashnaEngine } from '../engines/kp/kpPrashnaEngine.js';
import { ChartSessionService } from '../services/ChartSessionService.js';

export class DeepAstroToolRegistry {
  

  public static async executeTools(intent: {
    primaryDomain: string;
    originalQuestion: string;
    requiresCurrentData: boolean;
    requiresBirthData: boolean;
    requiresChartSession: boolean;
    requiresExternalSources: boolean;
  }, userProfile?: any): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    // 1. Weather
    if (intent.primaryDomain === 'WEATHER' || intent.originalQuestion.toLowerCase().includes('weather')) {
      const lat = userProfile?.latitude || 28.6139;
      const lon = userProfile?.longitude || 77.2090;
      const city = userProfile?.birthPlace || 'New Delhi';
      const weather = await globalWeatherProvider.getWeather(lat, lon, city);
      results.weather = weather;
    }

    // 2. Real Market Data
    if (intent.primaryDomain === 'MARKET' || intent.primaryDomain === 'FINANCE' || intent.originalQuestion.toLowerCase().includes('nifty') || intent.originalQuestion.toLowerCase().includes('stock')) {
      const pulse = await MarketDataService.getMarketPulse();
      results.market = pulse;
    }

    // 3. Real News & Fact Checking
    if (intent.requiresExternalSources || intent.primaryDomain === 'NEWS') {
      const news = await NewsProvider.fetchLivemintFeed();
      results.news = news;
    }

    // 4. KP Prashna
    if (intent.primaryDomain === 'KP_PRASHNA') {
      const numMatch = intent.originalQuestion.match(/\b([1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9])\b/);
      const seed = numMatch ? parseInt(numMatch[1], 10) : 108;
      results.kpPrashna = KPPrashnaEngine.generatePrashnaChart({
        question: intent.originalQuestion,
        seedNumber: seed,
        questionTimestamp: new Date(),
        latitude: userProfile?.latitude || 28.6139,
        longitude: userProfile?.longitude || 77.2090,
        timezone: 5.5,
        locationName: userProfile?.birthPlace || 'New Delhi'
      });
    }

    // 5. Chart / Astrology Engine
    if (intent.requiresBirthData && userProfile && userProfile.birthDate && userProfile.birthTime) {
      try {
        const input: BirthProfileInput = {
          name: userProfile.fullName || 'User',
          birthDate: userProfile.birthDate,
          birthTime: userProfile.birthTime,
          birthPlace: userProfile.birthPlace || 'New Delhi',
          latitude: userProfile.latitude || 28.6139,
          longitude: userProfile.longitude || 77.2090,
          timezone: userProfile.timezone || 'Asia/Kolkata',
          gender: userProfile.gender || 'neutral'
        };

        if (intent.primaryDomain === 'NUMEROLOGY') {
          const parts = input.birthDate.split('-');
          const y = parseInt(parts[0], 10) || 1990;
          const m = parseInt(parts[1], 10) || 1;
          const d = parseInt(parts[2], 10) || 1;
          results.numerology = calculateNumerology(input.name, d, m, y);
        } else {
          results.vedic = VedicAstroEngine.calculateKundli(input);
        }
      } catch (err: any) {
        results.astrologyError = err?.message || 'Astrology calculation failed';
      }
    }

    return results;
  }
}
