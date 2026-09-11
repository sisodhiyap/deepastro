import { describe, it, expect } from 'vitest';
import { OllamaProvider } from '../server/src/ai/OllamaProvider.js';
import { AIOrchestrator } from '../server/src/ai/AIOrchestrator.js';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { db } from '../server/src/database/db.js';

describe('Ollama Local Provider & Reasoning Engine', () => {
  const testBirthProfile: BirthProfileInput = {
    name: 'Test Native',
    birthDate: '1995-08-15',
    birthTime: '10:30',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    gender: 'Male',
    isApproximateTime: false,
  };
  const sampleKundli = VedicAstroEngine.calculateKundli(testBirthProfile);

  it('initializes with default model deepseek-r1:7b and configurable host', () => {
    const provider = new OllamaProvider('http://127.0.0.1:11434', 'deepseek-r1:7b');
    expect(provider.name).toBe('Ollama');
    expect(provider.currentModel).toBe('deepseek-r1:7b');
    expect(provider.isConfigured).toBe(true);

    provider.setModel('llama3.1:latest');
    expect(provider.currentModel).toBe('llama3.1:latest');
  });

  it('correctly handles reasoning tags <think> and JSON extraction', async () => {
    const provider = new OllamaProvider();
    const mockRawWithThinking = `
<think>
Native has Libra ascendant with Moon in Gemini.
Checking 9th house transit and Jupiter aspect.
The native is asking for general guidance.
Synthesizing structured Vedic JSON.
</think>
\`\`\`json
{
  "summary": "Intellectual clarity and harmonious planetary focus.",
  "evidence": ["Ascendant ruled by Venus in friendly dignities."],
  "interpretation": "Local reasoning engine notes strong communicative potential.",
  "confidence": "High",
  "recommendations": ["Dedicate morning to focused meditation."],
  "remedies": ["Chant Gayatri mantra."],
  "disclaimer": "Astrological interpretations provide cosmic guidance."
}
\`\`\`
    `.trim();

    // Access private parser via typed any
    const { reasoning, cleanedContent } = (provider as any).extractReasoningAndCleanJson(mockRawWithThinking);
    expect(reasoning).toContain('Native has Libra ascendant');
    expect(cleanedContent).not.toContain('<think>');

    const parsed = (provider as any).parseResponsePayload(cleanedContent);
    expect(parsed.summary).toBe('Intellectual clarity and harmonious planetary focus.');
    expect(parsed.confidence).toBe('High');
    expect(parsed.recommendations.length).toBe(1);
  });

  it('produces valid fallback synthesis when offline', async () => {
    // Port 11499 is guaranteed unreachable
    const offlineProvider = new OllamaProvider('http://127.0.0.1:11499', 'deepseek-r1:7b', 1000);
    const result = await offlineProvider.generateInterpretation({
      userPrompt: 'Analyze my current Mahadasha',
    });

    expect(result.provider).toBe('Ollama');
    expect(result.model).toBe('deepseek-r1:7b-fallback');
    expect(result.content.summary).toBeTruthy();
    expect(result.content.evidence.length).toBeGreaterThan(0);
    expect(result.totalTokens).toBeGreaterThan(0);
  });

  it('integrates seamlessly with AIOrchestrator and logs zero-cost telemetry', async () => {
    const orchestrator = new AIOrchestrator();
    const initialLogCount = db.aiUsageLogs.length;

    const response = await orchestrator.orchestrate({
      userId: 'usr_test_ollama',
      query: 'What does my current Mahadasha indicate for personal growth?',
      kundli: sampleKundli,
      feature: 'AstroBot',
      preferredProvider: 'Ollama',
      model: 'deepseek-r1:7b',
    });

    expect(response).toBeDefined();
    expect(response.summary.length).toBeGreaterThan(10);
    expect(response.evidence.length).toBeGreaterThan(0);

    // Verify DB telemetry was recorded
    expect(db.aiUsageLogs.length).toBe(initialLogCount + 1);
    const latestLog = db.aiUsageLogs[db.aiUsageLogs.length - 1];
    expect(latestLog.provider).toBe('Ollama');
    expect(latestLog.estimatedCostCents).toBe(0); // 100% free local compute!
  }, 90000);
});
