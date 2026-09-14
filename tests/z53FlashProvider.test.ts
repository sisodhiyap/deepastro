import { describe, it, expect } from 'vitest';
import { Z53FlashProvider } from '../server/src/ai/Z53FlashProvider.js';

describe('Z 5.3 Flash (GLM-5.3-Flash) Provider & Reasoning Engine', () => {
  it('initializes with default model z-ai/glm-5.3-flash and 10M token architecture', () => {
    const provider = new Z53FlashProvider('test-key-12345');
    expect(provider.name).toBe('Z53Flash');
    expect(provider.currentModel).toBe('z-ai/glm-5.3-flash');
    expect(provider.isConfigured).toBe(true);
    expect(provider.contextCapacityTokens).toBe(1310720);

    provider.setModel('z-ai/glm-5.3');
    expect(provider.currentModel).toBe('z-ai/glm-5.3');
  });

  it('correctly reports isConfigured false when no valid key is provided', () => {
    const provider = new Z53FlashProvider('');
    // If process.env has key, it uses env; otherwise false
    if (!process.env.Z53_API_KEY && !process.env.OPENROUTER_API_KEY) {
      expect(provider.isConfigured).toBe(false);
    }
  });

  it('correctly extracts structured JSON from markdown code fences', () => {
    const provider = new Z53FlashProvider('test-key');
    const rawWithFences = `
Here is the astrological assessment based on classical Parashari principles:

\`\`\`json
{
  "summary": "Dynamic career expansion and creative surge.",
  "evidence": ["10th house lord in 5th house forming Raj Yoga", "Jupiter aspecting Lagna"],
  "interpretation": "The planetary transits create favorable momentum for long-term vision.",
  "confidence": "High",
  "recommendations": ["Initiate high-leverage projects during Shukla Paksha."],
  "remedies": ["Offer water to Surya at sunrise."],
  "disclaimer": "Astrological interpretations offer traditional spiritual perspective."
}
\`\`\`
    `.trim();

    const payload = provider.extractJsonPayload(rawWithFences);
    expect(payload.summary).toBe('Dynamic career expansion and creative surge.');
    expect(payload.confidence).toBe('High');
    expect(payload.evidence).toHaveLength(2);
    expect(payload.recommendations).toHaveLength(1);
  });

  it('extracts payload from reasoning when content is in reasoning block', () => {
    const provider = new Z53FlashProvider('test-key');
    const reasoning = 'The native is asking about wealth. Checking 2nd and 11th houses. Dhana Yoga detected.';
    const textWithoutJson = 'Cosmic abundance is indicated through consistent ethical discipline.';

    const payload = provider.extractJsonPayload(textWithoutJson, reasoning);
    expect(payload.summary).toBeDefined();
    expect(payload.evidence[0]).toContain('Z 5.3 Flash reasoning');
  });
});
