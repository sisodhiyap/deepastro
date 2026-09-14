import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIOrchestrator } from '../server/src/ai/AIOrchestrator.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';

describe('AI Fail-Safe Cascading Mesh & Zero-Token-Exhaustion Protection', () => {
  const testProfile: BirthProfileInput = {
    name: 'Failover Native',
    birthDate: '1990-01-01',
    birthTime: '12:00',
    birthPlace: 'Varanasi, India',
    latitude: 25.3176,
    longitude: 82.9739,
    timezone: 5.5,
    gender: 'Male',
    isApproximateTime: false,
  };
  const testKundli = VedicAstroEngine.calculateKundli(testProfile);

  beforeEach(() => {
    process.env.Z53_API_KEY = 'sk-or-v1-test-key-z53-flash-test';
    process.env.OPENAI_API_KEY = 'sk-proj-test-key-openai';
    process.env.GEMINI_API_KEY = 'AQ.Ab8RN6-test-key-gemini';
  });

  it('provides comprehensive health status for all 5 AI engines', () => {
    const orchestrator = new AIOrchestrator();
    const statuses = orchestrator.getProviderHealthStatus();

    expect(statuses).toHaveLength(5);
    const names = statuses.map((s) => s.name);
    expect(names).toContain('Z53Flash');
    expect(names).toContain('OpenAI');
    expect(names).toContain('Gemini');
    expect(names).toContain('Grok');
    expect(names).toContain('Ollama (Local)');

    const z53 = statuses.find((s) => s.name === 'Z53Flash')!;
    expect(z53.contextCapacityTokens).toBe(1310720);
    expect(z53.coolingDown).toBe(false);
  });

  it('invokes deterministic Jyotish floor if all remote providers fail or are unconfigured', async () => {
    const orchestrator = new AIOrchestrator();

    // Mock all providers to fail to simulate total external outage / quota exhaustion
    vi.spyOn(orchestrator.getZ53Provider(), 'generateInterpretation').mockRejectedValue(
      new Error('Quota exceeded 429')
    );
    vi.spyOn(orchestrator.getOpenAIProvider(), 'generateInterpretation').mockRejectedValue(
      new Error('Insufficient quota')
    );
    vi.spyOn(orchestrator.getGeminiProvider(), 'generateInterpretation').mockRejectedValue(
      new Error('RESOURCE_EXHAUSTED')
    );
    vi.spyOn(orchestrator.getGrokProvider(), 'generateInterpretation').mockRejectedValue(
      new Error('Credit expired')
    );
    vi.spyOn(orchestrator.getOllamaProvider(), 'generateInterpretation').mockRejectedValue(
      new Error('Local service unreachable')
    );

    const result = await orchestrator.orchestrate({
      userId: 'test-user-1',
      query: 'What does my destiny hold?',
      kundli: testKundli,
      feature: 'AstroBot',
    });

    expect(result).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.summary).toContain(testKundli.ascendant.details.signName);
    expect(result.interpretation).toContain(testKundli.dashas.currentMahadasha.planet);
    expect(result.evidence.some((e) => e.includes('Deterministic Jyotish Engine'))).toBe(true);
    expect(result.confidence).toBe('High');
  });

  it('automatically cascades to secondary provider when primary encounters 429 quota error', async () => {
    const orchestrator = new AIOrchestrator();

    // Ensure isConfigured returns true for both
    vi.spyOn(orchestrator.getZ53Provider(), 'isConfigured', 'get').mockReturnValue(true);
    vi.spyOn(orchestrator.getGeminiProvider(), 'isConfigured', 'get').mockReturnValue(true);

    // Simulate primary (Z53Flash) hitting quota limit
    const quotaErr: any = new Error('HTTP 429: rate_limit_exceeded');
    quotaErr.isQuotaOrRateLimit = true;
    quotaErr.statusCode = 429;
    vi.spyOn(orchestrator.getZ53Provider(), 'generateInterpretation').mockRejectedValue(quotaErr);

    // Mock Gemini (secondary in cascade) returning valid response
    vi.spyOn(orchestrator.getGeminiProvider(), 'generateInterpretation').mockResolvedValue({
      provider: 'Gemini',
      model: 'gemini-1.5-pro',
      content: {
        summary: 'Successful fallback to Gemini model.',
        evidence: ['Calculated via secondary failover layer.'],
        interpretation: 'Transits align harmoniously.',
        confidence: 'High',
        recommendations: ['Proceed with confidence.'],
        remedies: ['Morning sun reflection.'],
        disclaimer: 'Traditional Vedic interpretation.',
      },
      rawText: 'Gemini synthesis',
      promptTokens: 100,
      completionTokens: 150,
      totalTokens: 250,
      latencyMs: 120,
    });

    const result = await orchestrator.orchestrate({
      userId: 'test-user-2',
      query: 'How is my business prospects?',
      kundli: testKundli,
      feature: 'ReportSynthesis',
      preferredProvider: 'Z53Flash',
    });

    expect(result).toBeDefined();
    expect(result.summary).toBe('Successful fallback to Gemini model.');

    // Verify Z53Flash is put on cooldown
    const statuses = orchestrator.getProviderHealthStatus();
    const z53Status = statuses.find((s) => s.name === 'Z53Flash')!;
    expect(z53Status.coolingDown).toBe(true);
    expect(z53Status.cooldownRemainingSeconds).toBeGreaterThan(0);
  });
});
