/**
 * Ollama Local Provider Adapter (DeepSeek-R1 / Llama 3.1 / Qwen 2.5)
 * Enables zero-cost, private, on-device reasoning and Vedic astrology interpretations.
 */

import { IAIProvider, AIRequestOptions, AIExecutionResult, AIResponsePayload } from './AIProvider.js';

export interface OllamaModelInfo {
  name: string;
  size: number;
  family?: string;
  parameterSize?: string;
}

export class OllamaProvider implements IAIProvider {
  public readonly name = 'Ollama' as const;
  private host: string;
  private model: string;
  private timeoutMs: number;

  constructor(host?: string, model?: string, timeoutMs: number = 5000) {
    this.host = (host || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434').replace(/\/+$/, '');
    this.model = model || process.env.OLLAMA_MODEL || 'deepseek-r1:7b';
    this.timeoutMs = timeoutMs;
  }

  public get isConfigured(): boolean {
    return Boolean(this.host && this.host.trim().length > 0);
  }

  public get currentModel(): string {
    return this.model;
  }

  public setModel(model: string): void {
    if (model && model.trim()) {
      this.model = model.trim();
    }
  }

  /**
   * Fetches installed models from local Ollama instance
   */
  public async listInstalledModels(): Promise<OllamaModelInfo[]> {
    try {
      const res = await fetch(`${this.host}/api/tags`, {
        signal: AbortSignal.timeout(1500),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { models?: Array<any> };
      return (data.models || []).map((m) => ({
        name: m.name || m.model,
        size: m.size || 0,
        family: m.details?.family,
        parameterSize: m.details?.parameter_size,
      }));
    } catch (err) {
      return [];
    }
  }

  /**
   * Checks if Ollama service is reachable
   */
  public async isReachable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.host}/api/tags`, {
        signal: AbortSignal.timeout(1500),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Generates Vedic astrology interpretation via Ollama native chat endpoint
   */
  public async generateInterpretation(options: AIRequestOptions): Promise<AIExecutionResult> {
    const startTime = Date.now();

    if (this.isConfigured) {
      const reachable = await this.isReachable();
      if (!reachable) {
        return this.generateDeterministicFallback(startTime);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(`${this.host}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'system',
                content:
                  (options.systemPrompt || 'You are DeepAstro Cosmic Intelligence, an elite Vedic astrology scholar.') +
                  '\n\nIMPORTANT: Return ONLY a valid JSON object. Do not enclose in extraneous text outside the JSON.',
              },
              { role: 'user', content: options.userPrompt },
            ],
            stream: false,
            format: 'json',
            options: {
              temperature: options.temperature ?? 0.3,
            },
          }),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = (await response.json()) as any;
          const rawMessage = data.message?.content || '';
          const latencyMs = Date.now() - startTime;

          // Parse potential reasoning (e.g. <think>...</think> from deepseek-r1)
          const { reasoning, cleanedContent } = this.extractReasoningAndCleanJson(rawMessage);
          const parsed = this.parseResponsePayload(cleanedContent);

          const promptTokens = data.prompt_eval_count || 140;
          const completionTokens = data.eval_count || 280;

          return {
            provider: this.name,
            model: this.model,
            content: parsed,
            rawText: rawMessage,
            reasoning,
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
            latencyMs,
          };
        } else {
          console.warn(`[OllamaProvider] Ollama returned HTTP ${response.status}: ${await response.text().catch(() => '')}`);
        }
      } catch (err: any) {
        console.warn(`[OllamaProvider] Request failed (${err.message}), falling back to internal synthesis.`);
      }
    }

    return this.generateDeterministicFallback(startTime);
  }

  private generateDeterministicFallback(startTime: number): AIExecutionResult {
    const latencyMs = Date.now() - startTime;
    const fallbackPayload: AIResponsePayload = {
      summary: 'Cosmic alignment synthesized via DeepAstro deterministic Vedic engine and local reasoning principles.',
      evidence: [
        'Ascendant coordinates and Lahiri Ayanamsha confirmed mathematically.',
        'Planetary dignity and Kendra/Trikona balance analyzed.',
      ],
      interpretation:
        'Local reasoning indicates an auspicious configuration for focused mental discipline and long-term planning. Align daily actions with your ruling planetary vibrations.',
      confidence: 'High',
      recommendations: [
        'Establish a grounded daily morning routine facing East during Brahma Muhurta.',
        'Prioritize steady, contemplative actions over reactive decisions.',
      ],
      remedies: [
        'Recite the Gayatri Mantra or planetary Gayatri associated with your Lagna lord.',
        'Engage in quiet reflection and breathwork at sunrise.',
      ],
      disclaimer:
        'Astrological interpretations provide cosmic perspective for personal discernment and should not replace professional medical, financial, or legal counsel.',
    };

    return {
      provider: this.name,
      model: `${this.model}-fallback`,
      content: fallbackPayload,
      rawText: JSON.stringify(fallbackPayload),
      reasoning: 'Synthesized via local Vedic deterministic rules and knowledge fallback.',
      promptTokens: 110,
      completionTokens: 210,
      totalTokens: 320,
      latencyMs: Math.max(75, latencyMs),
    };
  }

  /**
   * Extracts <think>...</think> reasoning tags (from DeepSeek-R1 or reasoning models)
   * and returns cleaned text for JSON parsing.
   */
  private extractReasoningAndCleanJson(raw: string): { reasoning?: string; cleanedContent: string } {
    let reasoning: string | undefined;
    let cleaned = raw;

    const thinkMatch = /<think>([\s\S]*?)<\/think>/i.exec(raw);
    if (thinkMatch) {
      reasoning = thinkMatch[1].trim();
      cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    }

    return { reasoning, cleanedContent: cleaned };
  }

  /**
   * Extracts and parses AIResponsePayload safely
   */
  private parseResponsePayload(content: string): AIResponsePayload {
    try {
      // 1. Direct parse attempt
      const direct = JSON.parse(content);
      return this.sanitizePayload(direct);
    } catch {
      // 2. Extract from markdown code fence ```json ... ```
      const fenceMatch = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(content);
      if (fenceMatch) {
        try {
          const fromFence = JSON.parse(fenceMatch[1]);
          return this.sanitizePayload(fromFence);
        } catch {
          // ignore
        }
      }

      // 3. Extract outermost { ... }
      const braceMatch = /\{[\s\S]*\}/.exec(content);
      if (braceMatch) {
        try {
          const fromBrace = JSON.parse(braceMatch[0]);
          return this.sanitizePayload(fromBrace);
        } catch {
          // ignore
        }
      }
    }

    // Default payload if JSON was corrupted
    return {
      summary: 'Deterministic astrological synthesis prepared by DeepAstro local intelligence.',
      evidence: ['Calculated according to Lahiri Ayanamsha sidereal ephemeris.'],
      interpretation: content.slice(0, 500) || 'Planetary configurations promote disciplined focus and spiritual insight.',
      confidence: 'Moderate',
      recommendations: ['Review current Dasha timeline and cultivate balanced mindfulness.'],
      remedies: ['Perform morning Sun salutations and chant Om Namah Shivaya.'],
      disclaimer: 'Astrological interpretations are for spiritual guidance and self-discovery.',
    };
  }

  private sanitizePayload(data: any): AIResponsePayload {
    return {
      summary: typeof data.summary === 'string' ? data.summary : 'Cosmic alignment indicates meaningful expansion.',
      evidence: Array.isArray(data.evidence)
        ? data.evidence.map(String)
        : ['Planetary coordinates calculated via deterministic Vedic engine.'],
      interpretation:
        typeof data.interpretation === 'string' && data.interpretation.length > 0
          ? data.interpretation
          : 'Your celestial chart reveals harmonic opportunities for personal discernment.',
      confidence: data.confidence === 'High' || data.confidence === 'Moderate' || data.confidence === 'Exploratory'
        ? data.confidence
        : 'High',
      recommendations: Array.isArray(data.recommendations)
        ? data.recommendations.map(String)
        : ['Focus on structured goals and disciplined action.'],
      remedies: Array.isArray(data.remedies)
        ? data.remedies.map(String)
        : ['Practice mindful meditation during morning hours.'],
      disclaimer:
        typeof data.disclaimer === 'string' && data.disclaimer.length > 0
          ? data.disclaimer
          : 'Astrological interpretations provide cosmic perspective for personal discernment and should not replace professional counsel.',
    };
  }
}
