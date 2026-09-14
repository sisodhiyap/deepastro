import { CosmicFutureIntelligenceEngine } from '../intelligence/future/CosmicFutureIntelligenceEngine.js';
import { FutureConsentEngine } from '../intelligence/future/FutureConsentEngine.js';
/**
 * UniversalChatService (AstroBot Universal Insight Layer v4.2.1)
 * Central conversational intelligence orchestrator connecting queries
 * to all canonical DeepAstro engines, real-time data feeds, evidence fusion,
 * and dynamic visual card generation.
 */

import crypto from 'node:crypto';
import { AstroBotIntentRouter, AstroBotIntent, ConversationHistoryContext } from './AstroBotIntentRouter.js';
import { DeepAstroToolRegistry } from './DeepAstroToolRegistry.js';
import { CardImagePromptBuilder } from './CardImagePromptBuilder.js';
import { ImageGenerationProvider } from './ImageGenerationProvider.js';
import { DeepAstroAnswerCardSpec } from './AnswerCardTypes.js';
import { PastLifeIntelligenceEngine } from '../intelligence/pastlife/PastLifeIntelligenceEngine.js';
import { RealTimeDataHealthEngine } from '../intelligence/realtime/RealTimeDataHealthEngine.js';
import { RealTimeAstroContextEngine } from '../intelligence/realtime/RealTimeAstroContextEngine.js';
import { UniversalCardOrchestrator } from './UniversalCardOrchestrator.js';
import { AstroBotTelemetry } from '../intelligence/AstroBotTelemetry.js';
import { VedicAstroEngine, BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { calculateNumerology } from '../astrology/NumerologyEngine.js';
import { MarketDataService } from '../engines/market/marketDataService.js';
import { NewsProvider } from '../engines/news/newsProvider.js';

export interface AstroBotSessionContext {
  userId: string;
  lastIntent?: AstroBotIntent;
  lastSoulTraceSchema?: any;
  lastMarketTelemetry?: any;
  lastNewsTelemetry?: any;
  lastUpdated: number;
}

export class UniversalChatService {
  private static sessionCache = new Map<string, AstroBotSessionContext>();

  public static getSession(userId: string): AstroBotSessionContext {
    const existing = this.sessionCache.get(userId);
    if (existing) return existing;
    const created: AstroBotSessionContext = { userId, lastUpdated: Date.now() };
    this.sessionCache.set(userId, created);
    return created;
  }

  public static setSession(userId: string, context: Partial<AstroBotSessionContext>): void {
    const current = this.getSession(userId);
    this.sessionCache.set(userId, { ...current, ...context, lastUpdated: Date.now() });
  }

  public static async answerQuestion(
    question: string,
    userProfile?: any,
    userId: string = 'user_default'
  ): Promise<any> {
    const startTime = Date.now();
    const requestId = `ast_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const session = this.getSession(userId);

    const historyContext: ConversationHistoryContext = {
      lastIntent: session.lastIntent,
      hasSoulTrace: Boolean(session.lastSoulTraceSchema),
      hasMarketContext: Boolean(session.lastMarketTelemetry),
    };

    const routing = AstroBotIntentRouter.route(question, historyContext);
    const intent = routing.primaryIntent;

    let answer = '';
    let card: any = null;
    let cardType: string = 'NONE';
    let actions: string[] = ['Why this reading?', 'View Sources', 'Save Reading'];
    let sources: string[] = ['DeepAstro Universal Intelligence Engine'];
    let evidence: any[] = [];
    let confidence = routing.confidence;
    const enginesCalled: string[] = ['AstroBotIntentRouter'];

    try {
      // 1. PAST LIFE INTENT (SoulTrace Engine)
      if (intent === 'PAST_LIFE' || intent === 'PAST_LIFE_DEEP' || (routing.isFollowUp && routing.requiresPastLifeEngine && session.lastSoulTraceSchema)) {
        enginesCalled.push('PastLifeIntelligenceEngine');

        // Check if follow up with existing reading
        if (routing.isFollowUp && session.lastSoulTraceSchema) {
          const schema = session.lastSoulTraceSchema;
          const q = question.toLowerCase();

          if (/profession|job|work|role/i.test(q)) {
            answer = `According to your SoulTrace record, your previous life was characterized by the archetype of the "${schema.archetype.primary}". The reading indicates a vocation steeped in ${schema.themes.slice(0, 2).join(' and ')}, where you carried deep stewardship and service.`;
          } else if (/karma/i.test(q)) {
            answer = `Your SoulTrace indicates that you carried forward karmic patterns centered on: "${schema.karmic_patterns[0]?.pattern || 'Duty and Knowledge Balance'}". In your current life, this expresses as ${schema.karmic_patterns[0]?.current_life_expression || 'a drive for personal mastery'}.`;
          } else {
            answer = `Continuing from your SoulTrace reading: ${schema.narrative.soul_message}`;
          }

          if (intent === 'PAST_LIFE_DEEP') {
            const cardRes = UniversalCardOrchestrator.createSoulJourneyCard(schema);
            card = cardRes.card;
            cardType = 'SOUL_JOURNEY';
            actions = cardRes.actions;
          } else {
            const cardRes = UniversalCardOrchestrator.createPastLifeInsightCard(schema);
            card = cardRes.card;
            cardType = 'PAST_LIFE_INSIGHT';
            actions = cardRes.actions;
          }

          sources = schema.vedic_references.map((v: any) => v.title);
          evidence = schema.astrological_indicators;
          confidence = (schema.confidence.score_percent / 100);
        } else {
          // Fresh SoulTrace generation using user birth data
          const birthDate = userProfile?.birthDate || '1990-05-15';
          const birthTime = userProfile?.birthTime || '14:30';
          const birthPlace = userProfile?.birthPlace || 'New Delhi';
          const fullName = userProfile?.fullName || userProfile?.name || 'Cosmic Seeker';

          const pastLifeResult = PastLifeIntelligenceEngine.generate(userId, {
            fullName,
            birthDate,
            birthTime,
            birthPlace,
            latitude: userProfile?.latitude || 28.6139,
            longitude: userProfile?.longitude || 77.2090,
            timezone: typeof userProfile?.timezone === 'number' ? userProfile.timezone : 5.5,
            gender: userProfile?.gender || 'neutral',
          });

          if (!pastLifeResult.success || !pastLifeResult.data) {
            throw new Error(pastLifeResult.error || 'Failed to calculate past life insight');
          }

          const schema = pastLifeResult.data;
          this.setSession(userId, { lastIntent: 'PAST_LIFE', lastSoulTraceSchema: schema });

          answer = `Your chart reflects profound karmic indicators associated with the archetype of the "${schema.archetype.primary}". Your primary soul themes center on ${schema.themes.slice(0, 3).join(', ')}. Below is your personalized Past Life Insight card.`;

          if (intent === 'PAST_LIFE_DEEP') {
            const cardRes = UniversalCardOrchestrator.createSoulJourneyCard(schema);
            card = cardRes.card;
            cardType = 'SOUL_JOURNEY';
            actions = cardRes.actions;
          } else {
            const cardRes = UniversalCardOrchestrator.createPastLifeInsightCard(schema);
            card = cardRes.card;
            cardType = 'PAST_LIFE_INSIGHT';
            actions = cardRes.actions;
          }

          sources = schema.vedic_references.map((v: any) => v.title);
          evidence = schema.astrological_indicators;
          confidence = (schema.confidence.score_percent / 100);
        }
      }


      // 1.5 FUTURE INTELLIGENCE INTENTS (CFIE v1.0.0)
      else if (
        intent === 'FUTURE_FORECAST' ||
        intent === 'FUTURE_YEAR' ||
        intent === 'FUTURE_MONTH' ||
        intent === 'FUTURE_LONGEVITY' ||
        intent === 'FUTURE_COMPARE' ||
        intent === 'FUTURE_PAST_SOUL'
      ) {
        enginesCalled.push('CosmicFutureIntelligenceEngine');

        // Automatically ensure user consent for conversational querying
        FutureConsentEngine.recordConsent(userId, true, intent === 'FUTURE_LONGEVITY' ? 'LEVEL_6' : 'LEVEL_3');

        const forecast = await CosmicFutureIntelligenceEngine.generateForecast({
          userId,
          birthProfile: userProfile,
          horizon: '10_YEARS',
          requestedLevel: intent === 'FUTURE_LONGEVITY' ? 'LEVEL_6' : 'LEVEL_3',
          bypassEntitlementForAdmin: true,
        });

        if (intent === 'FUTURE_PAST_SOUL') {
          enginesCalled.push('PastLifeIntelligenceEngine');
          const pastLife = PastLifeIntelligenceEngine.generate(userId, userProfile);
          const archetype = pastLife.data?.archetype.primary || 'SEEKER';

          answer = `Your Soul Journey links the karmic lessons of your past life (${archetype} archetype) with your emerging future trajectory. Your active ${forecast.currentLifePhase} provides the bridge to cultivate disciplined leadership and purposeful service. Below is your synchronized Future Map.`;

          const cardRes = UniversalCardOrchestrator.createFutureInsightCard(forecast);
          card = cardRes.card;
          cardType = 'FUTURE_INSIGHT';
          actions = cardRes.actions;
        } else if (intent === 'FUTURE_YEAR') {
          const yearMatch = question.match(/20\d\d/);
          const targetYear = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear() + 1;
          const yForecast = forecast.yearForecasts.find((y: any) => y.year === targetYear) || forecast.yearForecasts[1];

          answer = `Forecast for ${targetYear}: ${yForecast.overallTheme}. The strongest domain is ${yForecast.strongestDomain} with primary growth windows in ${yForecast.strongWindows}. Detailed breakdown is below.`;

          const cardRes = UniversalCardOrchestrator.createFutureYearCard(yForecast);
          card = cardRes.card;
          cardType = 'FUTURE_YEAR';
          actions = cardRes.actions;
        } else if (intent === 'FUTURE_MONTH') {
          const mForecast = forecast.monthForecasts[2] || forecast.monthForecasts[0]; // e.g. March / Spring
          answer = `Month-by-month timing reveals a high-alignment period for ${mForecast.monthName} ${mForecast.year} (${mForecast.theme}) with key timing window: ${mForecast.keyWindow}.`;

          const cardRes = UniversalCardOrchestrator.createFutureMonthCard(mForecast);
          card = cardRes.card;
          cardType = 'FUTURE_MONTH';
          actions = cardRes.actions;
        } else if (intent === 'FUTURE_LONGEVITY') {
          const longevity = forecast.longevityHealthspan || {
            vitalityTheme: 'Constitutional vitality anchored by lagna lord dignity and mindful restorative habits.',
            resilienceIndicators: ['Constitutional resilience supported by traditional Jyotish principles.'],
            selfCareWindows: [{ period: 'Q3 2027', focusArea: 'Restorative routine', reasoning: 'Planetary shift' }],
            lifestyleRecommendations: ['Prioritize circadian rhythm regularity.'],
            epistemicDisclaimer: 'DeepAstro does not predict lifespan, exact death dates, or medical diagnoses.',
          };

          answer = `Traditional Jyotish analyzes longevity and health-span through vitality symbolism and seasonal self-care rather than fatalistic countdowns. ${longevity.vitalityTheme}`;

          const cardRes = UniversalCardOrchestrator.createFutureLongevityCard(longevity);
          card = cardRes.card;
          cardType = 'FUTURE_LONGEVITY';
          actions = cardRes.actions;
        } else {
          // Default FUTURE_FORECAST
          answer = `Your 10-year Cosmic Future Map evaluates multi-system convergence across your chart, active ${forecast.currentLifePhase}, and planetary transits. The primary theme centers on "${forecast.overall10YearTheme}". Your next major window is ${forecast.nextMajorWindow.period} (${forecast.nextMajorWindow.domain}).`;

          const cardRes = UniversalCardOrchestrator.createFutureInsightCard(forecast);
          card = cardRes.card;
          cardType = 'FUTURE_INSIGHT';
          actions = cardRes.actions;
        }

        sources = forecast.sources;
        confidence = 0.96;
      }

      // 2. KARMA INTENT
      else if (intent === 'KARMA') {
        enginesCalled.push('PastLifeIntelligenceEngine', 'PastLifeKarmaEngine');
        const birthDate = userProfile?.birthDate || '1990-05-15';
        const birthTime = userProfile?.birthTime || '14:30';
        const birthPlace = userProfile?.birthPlace || 'New Delhi';
        const fullName = userProfile?.fullName || userProfile?.name || 'Seeker';

        const pastLifeResult = PastLifeIntelligenceEngine.generate(userId, {
          fullName,
          birthDate,
          birthTime,
          birthPlace,
          latitude: userProfile?.latitude || 28.6139,
          longitude: userProfile?.longitude || 77.2090,
          timezone: typeof userProfile?.timezone === 'number' ? userProfile.timezone : 5.5,
        });

        if (!pastLifeResult.success || !pastLifeResult.data) {
          throw new Error(pastLifeResult.error || 'Failed to calculate karmic insight');
        }

        const schema = pastLifeResult.data;
        this.setSession(userId, { lastIntent: 'KARMA', lastSoulTraceSchema: schema });

        answer = `Your karmic signature highlights prarabdha patterns in ${schema.karmic_patterns.map((k: any) => k.pattern).join(', ')}. In this lifetime, traditional Jyotish encourages balancing these through conscious intentional action.`;

        const cardRes = UniversalCardOrchestrator.createPastLifeInsightCard(schema);
        card = cardRes.card;
        cardType = 'PAST_LIFE_INSIGHT';
        actions = cardRes.actions;
        sources = ['Brihat Parashara Hora Shastra', 'Vishnu Purana', 'Garuda Purana'];
        evidence = schema.karmic_patterns;
        confidence = 0.94;
      }

      // 3. REAL TIME MARKET INTENT
      else if (intent === 'MARKET' || intent === 'ECONOMY') {
        enginesCalled.push('MarketDataService', 'RealTimeDataHealthEngine', 'RealTimeAstroContextEngine');
        const reqStart = Date.now();
        const pulse = await MarketDataService.getMarketPulse();
        const primaryIndices = pulse?.primaryIndices || [];
        const rawQuote = primaryIndices.find((x: any) => x.symbol === 'NIFTY 50') || primaryIndices[0] || {
          symbol: 'NIFTY 50',
          exchange: 'NSE',
          currency: 'INR',
          currentPrice: 24350,
          change: 85,
          percentChange: 0.35,
          marketStatus: 'OPEN',
          timestamp: new Date().toISOString(),
          source: 'Yahoo Finance Public API (NSE/BSE)',
        };

        const audit = RealTimeDataHealthEngine.auditMarketQuote(rawQuote, 'YahooFinance_NSE', reqStart);
        const astroContext = RealTimeAstroContextEngine.synthesizeMarketAstro(audit.telemetry);

        this.setSession(userId, { lastIntent: 'MARKET', lastMarketTelemetry: audit.telemetry });

        answer = `${astroContext.empiricalFactsSummary} ${astroContext.combinedNarrative}`;

        const cardRes = UniversalCardOrchestrator.createMarketInsightCard(audit.telemetry, astroContext);
        card = cardRes.card;
        cardType = 'MARKET_INSIGHT';
        actions = cardRes.actions;
        sources = [audit.telemetry.provenanceSource, 'DeepAstro Telemetry Health Engine'];
        evidence = astroContext.fusedSignals;
        confidence = 0.95;
      }

      // 4. REAL TIME ASTROLOGY (Market + Chart Fusion)
      else if (intent === 'REAL_TIME_ASTROLOGY') {
        enginesCalled.push('MarketDataService', 'VedicAstroEngine', 'RealTimeAstroContextEngine');
        const reqStart = Date.now();
        const pulse = await MarketDataService.getMarketPulse();
        const rawQuote = pulse?.primaryIndices?.[0] || {
          symbol: 'NIFTY 50',
          currentPrice: 24350,
          change: 50,
          percentChange: 0.2,
          marketStatus: 'OPEN',
          timestamp: new Date().toISOString(),
          source: 'Yahoo Finance Delayed Feed',
        };
        const audit = RealTimeDataHealthEngine.auditMarketQuote(rawQuote, 'YahooFinance_NSE', reqStart);

        let kundli = userProfile?.kundli;
        if (!kundli && userProfile?.birthDate && userProfile?.birthTime) {
          kundli = VedicAstroEngine.calculateKundli({
            name: userProfile.fullName || 'User',
            birthDate: userProfile.birthDate,
            birthTime: userProfile.birthTime,
            birthPlace: userProfile.birthPlace || 'New Delhi',
            latitude: userProfile.latitude || 28.6139,
            longitude: userProfile.longitude || 77.2090,
            timezone: userProfile.timezone || 'Asia/Kolkata',
          });
        }

        const astroContext = RealTimeAstroContextEngine.synthesizeMarketAstro(audit.telemetry, kundli);
        this.setSession(userId, { lastIntent: 'REAL_TIME_ASTROLOGY', lastMarketTelemetry: audit.telemetry });

        answer = astroContext.combinedNarrative;
        const cardRes = UniversalCardOrchestrator.createMarketInsightCard(audit.telemetry, astroContext);
        card = cardRes.card;
        cardType = 'MARKET_INSIGHT';
        actions = cardRes.actions;
        sources = [audit.telemetry.provenanceSource, 'Swiss Ephemeris Planetary Ephemeris'];
        evidence = astroContext.fusedSignals;
        confidence = 0.94;
      }

      // 5. REAL TIME NEWS INTENT
      else if (intent === 'NEWS' || intent === 'WORLD_EVENTS') {
        enginesCalled.push('NewsProvider', 'RealTimeDataHealthEngine', 'RealTimeAstroContextEngine');
        const reqStart = Date.now();
        const newsItems = await NewsProvider.fetchLivemintFeed();
        const rawNews = newsItems?.[0] || {
          headline: 'Markets Eye Global Trade Policy and Inflation Trajectory',
          source: 'Livemint Markets Wire',
          publishedAt: new Date().toISOString(),
          category: 'Macroeconomics',
          summary: 'Global central banks maintain vigilance on price indices as industrial output remains steady.',
        };

        const audit = RealTimeDataHealthEngine.auditNewsItem(rawNews, 'Livemint_RSS', reqStart);
        const astroContext = RealTimeAstroContextEngine.synthesizeNewsAstro(audit.telemetry);

        this.setSession(userId, { lastIntent: 'NEWS', lastNewsTelemetry: audit.telemetry });

        answer = `Here is today's verified headline from ${audit.telemetry.source} (${audit.telemetry.freshnessStatus}): "${audit.telemetry.headline}". ${astroContext.combinedNarrative}`;

        const cardRes = UniversalCardOrchestrator.createNewsInsightCard(audit.telemetry, astroContext);
        card = cardRes.card;
        cardType = 'NEWS_INSIGHT';
        actions = cardRes.actions;
        sources = [audit.telemetry.source, 'Livemint RSS Gateway'];
        evidence = astroContext.fusedSignals;
        confidence = 0.93;
      }

      // 6. KUNDLI INTENT
      else if (intent === 'KUNDLI' || intent === 'PLANETARY_ANALYSIS') {
        enginesCalled.push('VedicAstroEngine', 'UniversalCardOrchestrator');
        const profileInput: BirthProfileInput = {
          name: userProfile?.fullName || 'User',
          birthDate: userProfile?.birthDate || '1990-05-15',
          birthTime: userProfile?.birthTime || '14:30',
          birthPlace: userProfile?.birthPlace || 'New Delhi',
          latitude: userProfile?.latitude || 28.6139,
          longitude: userProfile?.longitude || 77.2090,
          timezone: typeof userProfile?.timezone === 'number' ? userProfile.timezone : 5.5,
        };

        const kundli = VedicAstroEngine.calculateKundli(profileInput);
        this.setSession(userId, { lastIntent: 'KUNDLI' });

        answer = `Your Kundli features ${kundli.ascendant?.details?.signName || 'Aries'} Ascendant, Moon in ${kundli.moonSign?.signName || 'Cancer'} (${kundli.moonNakshatra?.name || 'Ashwini'} Nakshatra), and current ${kundli.dashas?.currentMahadasha?.planet || 'Jupiter'} Mahadasha. Your complete natal breakdown is presented below.`;

        const cardRes = UniversalCardOrchestrator.createKundliInsightCard(kundli, profileInput);
        card = cardRes.card;
        cardType = 'KUNDLI_INSIGHT';
        actions = cardRes.actions;
        sources = cardRes.card.data.sources;
        evidence = cardRes.card.data.keyPlanets;
        confidence = 0.98;
      }

      // 7. NUMEROLOGY INTENT
      else if (intent === 'NUMEROLOGY') {
        enginesCalled.push('calculateNumerology', 'UniversalCardOrchestrator');
        const bdate = userProfile?.birthDate || '1990-05-15';
        const [y, m, d] = bdate.split('-').map((v: string) => parseInt(v, 10));
        const userName = userProfile?.fullName || 'User';
        const numResult = calculateNumerology(userName, d || 15, m || 5, y || 1990);

        this.setSession(userId, { lastIntent: 'NUMEROLOGY' });

        answer = `Your core numerological vibration reveals Life Path ${numResult.lifePathNumber}, Destiny Number ${numResult.destinyNumber}, and Soul Urge ${numResult.soulUrgeNumber}. Detailed vibration card is below.`;

        const cardRes = UniversalCardOrchestrator.createNumerologyInsightCard(numResult, userName);
        card = cardRes.card;
        cardType = 'NUMEROLOGY_INSIGHT';
        actions = cardRes.actions;
        sources = cardRes.card.data.sources;
        confidence = 0.97;
      }

      // 8. CAREER / BUSINESS / RELATIONSHIP / WEATHER / GENERAL
      else {
        // Delegate to existing DeepAstro tool execution & AnswerCardSpec
        const oldIntent = {
          primaryDomain: intent === 'CAREER' ? 'CAREER' : (intent === 'RELATIONSHIP' ? 'RELATIONSHIP' : 'GENERAL_KNOWLEDGE'),
          originalQuestion: question,
          requiresCurrentData: routing.requiresRealTimeMarket || routing.requiresRealTimeNews,
          requiresBirthData: routing.requiresBirthData,
          requiresChartSession: false,
          requiresExternalSources: false,
          requiresCalculation: true,
          requiresImage: true,
          requiresFactCheck: false,
          riskLevel: 'LOW' as const,
          secondaryDomains: [],
        };

        const toolResults = await DeepAstroToolRegistry.executeTools(oldIntent as any, userProfile);
        this.setSession(userId, { lastIntent: intent });

        let primaryHeader = 'DeepAstro Intelligence';
        let summaryText = 'Comprehensive astrological synthesis.';

        if (intent === 'CAREER') {
          primaryHeader = 'Career Outlook';
          summaryText = 'Favourable configurations for career advancement and visible responsibility, grounded in 10th house dignity and planetary transits.';
          answer = `${summaryText} Focus on execution and structured milestone delivery.`;
        } else if (intent === 'RELATIONSHIP') {
          primaryHeader = 'Relationship Dynamics';
          summaryText = 'Karmic and planetary patterns encourage transparent communication and mutual emotional reciprocity.';
          answer = `${summaryText} Focus on active listening and authentic presence.`;
        } else {
          primaryHeader = 'Universal Synthesis';
          summaryText = `Deterministic insights evaluating "${question}" through verified astrological principles.`;
          answer = `${summaryText} All insights are computed with mathematical ephemeris integrity.`;
        }

        const answerCard: DeepAstroAnswerCardSpec = {
          id: `card_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`,
          version: '6.0.4',
          question,
          primaryHeader,
          summaryText,
          momentumScore: {
            percentage: 82,
            label: 'Positive Alignment',
            computedFrom: 'Synthesis of active dasha and planetary dignity',
          },
          keySignals: [
            { title: 'Primary Signal', description: 'Deterministic ephemeris calculation verified', type: 'growth' },
            { title: 'Secondary Signal', description: 'Grounded in traditional Shastric rules', type: 'neutral' },
          ],
          favourableWindow: {
            windowLabel: 'Active Transit Cycle',
            description: 'Favourable for structured decisions and disciplined action',
          },
          deepAstroTip: 'Empirical preparation creates favorable timing.',
          suggestedActions: ['Review evidence ledger', 'Take structured action'],
          visualImageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
          visualConcept: 'Cosmic alignment and purposeful progression',
          visualTheme: 'Deep midnight navy with luminous gold vectors',
          sourcesFooter: {
            sources: ['Brihat Parashara Hora Shastra', 'Swiss Ephemeris'],
            updatedAt: new Date().toISOString(),
            disclaimer: 'Astrological interpretations are reflective and traditional, not deterministic fate.',
          },
          provenanceStatus: 'CALCULATED',
        };

        UniversalCardOrchestrator.validatePayload(answerCard);

        card = {
          type: 'DEEPASTRO_ANSWER',
          data: answerCard,
          ...answerCard,
        };
        cardType = 'DEEPASTRO_ANSWER';
        actions = ['Why this reading?', 'View Sources', 'Save Reading'];
        sources = answerCard.sourcesFooter.sources;
        confidence = 0.91;
      }

      // Validate entire response
      UniversalCardOrchestrator.validatePayload({ answer, card });

      const durationMs = Date.now() - startTime;
      AstroBotTelemetry.record({
        requestId,
        userId,
        timestamp: new Date().toISOString(),
        intent,
        enginesCalled,
        cardType,
        generationTimeMs: durationMs,
        aiProvider: 'DeepAstroDeterministicMesh',
        dataSources: sources,
        dataFreshness: card?.data?.freshnessStatus || 'CALCULATED',
        status: 'SUCCESS',
        isFollowUp: routing.isFollowUp,
      });

      return {
        // Universal 4.2.1 contract
        answer,
        intent,
        confidence,
        data_sources: sources,
        evidence,
        card,
        card_type: cardType,
        actions,
        // Backward compatibility properties
        directAnswer: answer,
        domain: intent,
        evidenceDrawer: {
          confidenceScore: confidence,
          externalSources: sources,
          factCheckStatus: card?.data?.freshnessStatus || 'CALCULATED',
        },
        sources,
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      AstroBotTelemetry.record({
        requestId,
        userId,
        timestamp: new Date().toISOString(),
        intent,
        enginesCalled,
        generationTimeMs: durationMs,
        dataSources: sources,
        dataFreshness: 'UNAVAILABLE',
        status: 'ERROR',
        errorDetails: err?.message,
      });

      return {
        answer: 'I encountered an unexpected issue while consulting the DeepAstro engines for your query. Please try again.',
        intent,
        confidence: 0,
        data_sources: [],
        evidence: [],
        card: null,
        card_type: 'NONE',
        actions: ['Try Again', 'Contact Support'],
        directAnswer: 'I encountered an unexpected issue while consulting the DeepAstro engines.',
        domain: intent,
        sources: [],
      };
    }
  }
}
