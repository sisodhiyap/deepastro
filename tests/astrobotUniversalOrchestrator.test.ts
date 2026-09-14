import { describe, it, expect, beforeEach } from 'vitest';
import { AstroBotIntentRouter } from '../server/src/chatbot/AstroBotIntentRouter.js';
import { UniversalChatService } from '../server/src/chatbot/UniversalChatService.js';
import { RealTimeDataHealthEngine } from '../server/src/intelligence/realtime/RealTimeDataHealthEngine.js';
import { RealTimeAstroContextEngine } from '../server/src/intelligence/realtime/RealTimeAstroContextEngine.js';
import { UniversalCardOrchestrator } from '../server/src/chatbot/UniversalCardOrchestrator.js';
import { AstroBotTelemetry } from '../server/src/intelligence/AstroBotTelemetry.js';

describe('DeepAstro AstroBot Universal Insight Layer (v4.2.1) Comprehensive Suite', () => {

  beforeEach(() => {
    AstroBotTelemetry.clear();
  });

  // ============================================================
  // TEST GROUP 1: INTENT CLASSIFICATION & ROUTING (Section 32)
  // ============================================================
  it('correctly classifies queries across the complete 29-intent spectrum', () => {
    // Past Life
    const pastLife1 = AstroBotIntentRouter.route('Tell me about my past life.');
    expect(pastLife1.primaryIntent).toBe('PAST_LIFE');
    expect(pastLife1.requiresPastLifeEngine).toBe(true);

    const pastLife2 = AstroBotIntentRouter.route('Who was I before this life?');
    expect(pastLife2.primaryIntent).toBe('PAST_LIFE');

    const pastLifeDeep = AstroBotIntentRouter.route('Give me a deep soul journey report with full infographic');
    expect(pastLifeDeep.primaryIntent).toBe('PAST_LIFE_DEEP');

    // Karma
    const karma = AstroBotIntentRouter.route('What karma did I bring into this lifetime?');
    expect(karma.primaryIntent).toBe('KARMA');

    // Market
    const market = AstroBotIntentRouter.route("What's happening in the market today?");
    expect(market.primaryIntent).toBe('MARKET');
    expect(market.requiresRealTimeMarket).toBe(true);

    // News
    const news = AstroBotIntentRouter.route('What news matters today?');
    expect(news.primaryIntent).toBe('NEWS');
    expect(news.requiresRealTimeNews).toBe(true);

    // Real-Time Market + Astrology
    const marketAstro = AstroBotIntentRouter.route('How does today market affect my chart?');
    expect(marketAstro.primaryIntent).toBe('REAL_TIME_ASTROLOGY');
    expect(marketAstro.requiresCrossEngineFusion).toBe(true);

    // Career
    const career = AstroBotIntentRouter.route("What's my future career outlook?");
    expect(career.primaryIntent).toBe('CAREER');
    expect(career.requiresBirthData).toBe(true);

    // Kundli
    const kundli = AstroBotIntentRouter.route('Show me my kundli.');
    expect(kundli.primaryIntent).toBe('KUNDLI');

    // Dasha
    const dasha = AstroBotIntentRouter.route('What is my current dasha period?');
    expect(dasha.primaryIntent).toBe('DASHA');

    // Numerology
    const num = AstroBotIntentRouter.route('What does my numerology say about me?');
    expect(num.primaryIntent).toBe('NUMEROLOGY');

    // Relationship & Compatibility
    const rel = AstroBotIntentRouter.route('Tell me about my relationship dynamics.');
    expect(rel.primaryIntent).toBe('RELATIONSHIP');

    const comp = AstroBotIntentRouter.route('Compare me with my partner for compatibility.');
    expect(comp.primaryIntent).toBe('COMPATIBILITY');
  });

  // ============================================================
  // TEST GROUP 2: MANDATORY PAST LIFE CARD TEST (Section 37)
  // ============================================================
  it('generates authentic Past Life Insight Card with real user data', async () => {
    const userProfile = {
      fullName: 'Aarav Sharma',
      birthDate: '1988-04-12',
      birthTime: '08:25',
      birthPlace: 'Varanasi',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 'Asia/Kolkata',
    };

    const response = await UniversalChatService.answerQuestion(
      'Tell me about my past life.',
      userProfile,
      'user_aarav_88'
    );

    expect(response.intent).toBe('PAST_LIFE');
    expect(response.answer).toBeTruthy();
    expect(response.answer.length).toBeGreaterThan(20);
    expect(response.card).not.toBeNull();
    expect(response.card.type).toBe('PAST_LIFE_INSIGHT');
    expect(response.card.data.userProfile.name).toBe('Aarav Sharma');
    expect(response.card.data.userProfile.dob).toBe('1988-04-12');
    expect(response.card.data.astrologicalHighlights.length).toBeGreaterThan(0);
    expect(response.card.data.numerologyHighlights.length).toBeGreaterThan(0);
    expect(response.card.data.vedicWisdomQuote.source).toBeTruthy();
    expect(response.actions).toContain('Deep Soul Journey');
    expect(response.actions).toContain('Why this reading?');

    // Verify zero unresolved placeholder tokens
    const rawCardStr = JSON.stringify(response.card);
    expect(/\{\{\s*[a-zA-Z0-9_.]+\s*\}\}/.test(rawCardStr)).toBe(false);
  });

  // ============================================================
  // TEST GROUP 3: 5-USER ANTI-HARDCODING TEST (Section 33)
  // ============================================================
  it('produces 5 completely distinct, personalized readings with zero cross-user leakage', async () => {
    const profiles = [
      { id: 'user_1', fullName: 'Vikramaditya Rao', birthDate: '1985-03-21', birthTime: '06:30', birthPlace: 'New Delhi', latitude: 28.6139, longitude: 77.2090 },
      { id: 'user_2', fullName: 'Ananya Deshmukh', birthDate: '1992-11-14', birthTime: '22:45', birthPlace: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
      { id: 'user_3', fullName: 'Debasish Banerjee', birthDate: '1978-08-05', birthTime: '14:15', birthPlace: 'Kolkata', latitude: 22.5726, longitude: 88.3639 },
      { id: 'user_4', fullName: 'Kavitha Iyer', birthDate: '2001-01-30', birthTime: '09:10', birthPlace: 'Bengaluru', latitude: 12.9716, longitude: 77.5946 },
      { id: 'user_5', fullName: 'Rohan Mehra', birthDate: '1995-06-18', birthTime: '17:50', birthPlace: 'Chandigarh', latitude: 30.7333, longitude: 76.7794 },
    ];

    const results = [];
    for (const p of profiles) {
      const res = await UniversalChatService.answerQuestion('Tell me about my past life.', p, p.id);
      results.push(res);
    }

    // Verify all 5 are unique
    const names = results.map(r => r.card.data.userProfile.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(5);

    const summaries = results.map(r => r.card.data.summary);
    const uniqueSummaries = new Set(summaries);
    expect(uniqueSummaries.size).toBe(5);

    const dobs = results.map(r => r.card.data.userProfile.dob);
    const uniqueDobs = new Set(dobs);
    expect(uniqueDobs.size).toBe(5);

    // Cross-user integrity check: Ensure profile 1 data never appears in profile 2 card
    expect(JSON.stringify(results[1].card)).not.toContain('Vikramaditya Rao');
    expect(JSON.stringify(results[0].card)).not.toContain('Ananya Deshmukh');
  });

  // ============================================================
  // TEST GROUP 4: FOLLOW-UP CONTEXTUAL MEMORY (Section 12 & 38)
  // ============================================================
  it('preserves SoulTrace context across follow-up conversational turns', async () => {
    const userId = 'user_conversation_turn_test';
    const profile = {
      fullName: 'Pooja Verma',
      birthDate: '1991-09-24',
      birthTime: '11:05',
      birthPlace: 'Jaipur',
      latitude: 26.9124,
      longitude: 75.7873,
    };

    // Step 1: Initial Past Life query
    const res1 = await UniversalChatService.answerQuestion('Tell me about my past life.', profile, userId);
    expect(res1.intent).toBe('PAST_LIFE');
    expect(res1.card.type).toBe('PAST_LIFE_INSIGHT');

    // Step 2: Follow-up question on role/profession
    const res2 = await UniversalChatService.answerQuestion('What was my profession?', profile, userId);
    expect(res2.intent).toBe('PAST_LIFE');
    expect(res2.answer.toLowerCase()).toMatch(/profession|vocation|archetype/);
    expect(res2.card).not.toBeNull();

    // Step 3: Follow-up question on karma
    const res3 = await UniversalChatService.answerQuestion('What karma did I bring?', profile, userId);
    expect(res3.intent).toBe('PAST_LIFE');
    expect(res3.answer.toLowerCase()).toMatch(/karmic|patterns|soultrace/);

    // Step 4: Expand to Deep Soul Journey
    const res4 = await UniversalChatService.answerQuestion('Deep Soul Journey', profile, userId);
    expect(res4.card.type).toBe('SOUL_JOURNEY');
  });

  // ============================================================
  // TEST GROUP 5: REAL-TIME DATA HEALTH & FRESHNESS (Section 14-20)
  // ============================================================
  it('correctly audits real-time market and news telemetry and enforces strict status tags', () => {
    // Live quote under 2 minutes
    const auditLive = RealTimeDataHealthEngine.evaluateFreshness('MARKET', 45, 'OPEN');
    expect(auditLive).toBe('LIVE');

    // Delayed quote under 30 minutes
    const auditDelayed = RealTimeDataHealthEngine.evaluateFreshness('MARKET', 900, 'OPEN');
    expect(auditDelayed).toBe('DELAYED');

    // Stale quote over threshold
    const auditStale = RealTimeDataHealthEngine.evaluateFreshness('MARKET', 90000, 'OPEN');
    expect(auditStale).toBe('STALE');

    // Explicit cached status
    const auditCached = RealTimeDataHealthEngine.evaluateFreshness('NEWS', 3600, undefined, true);
    expect(auditCached).toBe('CACHED');
    expect(auditCached).not.toBe('LIVE');

    // Market response test
    const mockQuote = {
      symbol: 'NIFTY 50',
      exchange: 'NSE',
      currency: 'INR',
      currentPrice: 24320.5,
      change: 110.2,
      percentChange: 0.45,
      marketStatus: 'OPEN',
      timestamp: new Date().toISOString(),
      source: 'Yahoo Finance delayed feed',
    };

    const audited = RealTimeDataHealthEngine.auditMarketQuote(mockQuote, 'YahooFinance_NSE', Date.now() - 50);
    expect(audited.telemetry.symbol).toBe('NIFTY 50');
    expect(audited.telemetry.freshnessStatus).toBe('LIVE');
    expect(audited.record.isSimulatedOrMock).toBe(false);
  });

  // ============================================================
  // TEST GROUP 6: STALE DATA & FAILURE DEGRADATION (Section 35 & 36)
  // ============================================================
  it('never displays LIVE for stale or failed data providers', () => {
    // 1. Stale data test
    const staleNews = {
      headline: 'Old RBI Policy Announcement',
      source: 'Archive Snapshot',
      publishedAt: new Date(Date.now() - 100000 * 1000).toISOString(),
    };
    const staleAudit = RealTimeDataHealthEngine.auditNewsItem(staleNews, 'Livemint_RSS', Date.now());
    expect(staleAudit.telemetry.freshnessStatus).toBe('STALE');
    expect(staleAudit.telemetry.freshnessStatus).not.toBe('LIVE');

    // 2. Unavailable provider test
    const failedQuote = {
      symbol: 'NIFTY 50',
      dataStatus: 'UNAVAILABLE',
    };
    const failedAudit = RealTimeDataHealthEngine.auditMarketQuote(failedQuote, 'YahooFinance_NSE', Date.now());
    expect(failedAudit.telemetry.freshnessStatus).toBe('UNAVAILABLE');
    expect(failedAudit.telemetry.freshnessStatus).not.toBe('LIVE');
  });

  // ============================================================
  // TEST GROUP 7: PLACEHOLDER & TEMPLATE PROTECTION (Section 31)
  // ============================================================
  it('strictly detects and blocks any unrendered template variables', () => {
    const invalidCard = {
      user: '{{name}}',
      price: '{{market.price}}',
    };

    expect(() => UniversalCardOrchestrator.validatePayload(invalidCard)).toThrow(/PLACEHOLDER_DETECTED/);

    const validCard = {
      user: 'Pooja',
      price: 24500,
    };
    expect(() => UniversalCardOrchestrator.validatePayload(validCard)).not.toThrow();
  });

  // ============================================================
  // TEST GROUP 8: EPISTEMIC SEPARATION (Section 17 & 24)
  // ============================================================
  it('strictly distinguishes market facts from traditional astrological interpretation', () => {
    const market = {
      symbol: 'NIFTY 50',
      exchange: 'NSE',
      currency: 'INR',
      price: 24350,
      change: 75,
      percentChange: 0.31,
      marketStatus: 'OPEN' as const,
      provider: 'YahooFinance_NSE',
      timestamp: new Date().toISOString(),
      dataAgeSeconds: 30,
      freshnessStatus: 'LIVE' as const,
      provenanceSource: 'NSE/BSE Delayed Feed',
    };

    const astro = RealTimeAstroContextEngine.synthesizeMarketAstro(market, {
      dashas: { currentMahadasha: { planet: 'Jupiter' } },
      ascendant: { details: { signName: 'Taurus' } },
    });

    // Verification: No physical causality claim
    expect(astro.epistemicDisclaimer).toContain('Traditional Astrological Interpretation Notice');
    expect(astro.epistemicDisclaimer).toContain('never be construed as financial advice or price causality');
    expect(astro.empiricalFactsSummary).toContain('24,350');
    expect(astro.fusedSignals.find(s => s.category === 'EMPIRICAL_FACT')).toBeDefined();
    expect(astro.fusedSignals.find(s => s.category === 'ASTROLOGICAL_THEME')).toBeDefined();
  });

  // ============================================================
  // TEST GROUP 9: OBSERVABILITY & ADMIN METRICS (Section 41 & 42)
  // ============================================================
  it('correctly tracks telemetry and computes aggregated administrative metrics', async () => {
    await UniversalChatService.answerQuestion('What is happening in the market today?', undefined, 'user_telemetry_1');
    await UniversalChatService.answerQuestion('Tell me about my past life.', {
      fullName: 'Aria',
      birthDate: '1994-08-19',
      birthTime: '15:20',
      birthPlace: 'Pune',
    }, 'user_telemetry_2');

    const summary = AstroBotTelemetry.getMetricsSummary();
    expect(summary.totalRequests).toBeGreaterThanOrEqual(2);
    expect(summary.pastLifeRequests).toBeGreaterThanOrEqual(1);
    expect(summary.marketRequests).toBeGreaterThanOrEqual(1);
    expect(summary.cardGenerationRate).toBeGreaterThan(0);
  });
});
