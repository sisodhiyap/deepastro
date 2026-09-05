/**
 * DeepAstro AI Provider Abstraction
 * Defines common contracts, structured schemas, and token metrics across OpenAI, Gemini, and Grok.
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
}

export interface AIExecutionResult {
  provider: 'OpenAI' | 'Gemini' | 'Grok' | 'Ollama';
  model: string;
  content: AIResponsePayload;
  rawText: string;
  reasoning?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
}

export interface IAIProvider {
  readonly name: 'OpenAI' | 'Gemini' | 'Grok' | 'Ollama';
  readonly isConfigured: boolean;
  generateInterpretation(options: AIRequestOptions): Promise<AIExecutionResult>;
}
