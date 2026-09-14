/**
 * DeepAstro AI Provider Abstraction
 * Defines common contracts, structured schemas, token metrics, and multi-tier
 * fail-safe standards across Z 5.3 Flash, OpenAI, Gemini, Grok, and Ollama.
 */

export interface AIResponsePayload {
  summary: string;
  evidence: string[];
  interpretation: string;
  confidence: 'High' | 'Moderate' | 'Exploratory';
  recommendations: string[];
  remedies: string[];
  disclaimer: string;
}

export interface AIRequestOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  modelOverride?: string;
  timeoutMs?: number;
}

export interface AIExecutionResult {
  provider: 'OpenAI' | 'Gemini' | 'Grok' | 'Ollama' | 'Z53Flash';
  model: string;
  content: AIResponsePayload;
  rawText: string;
  reasoning?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  fallbackChain?: string[];
  failoverReason?: string;
}

export interface IAIProvider {
  readonly name: 'OpenAI' | 'Gemini' | 'Grok' | 'Ollama' | 'Z53Flash';
  readonly isConfigured: boolean;
  readonly contextCapacityTokens?: number;
  generateInterpretation(options: AIRequestOptions): Promise<AIExecutionResult>;
}
