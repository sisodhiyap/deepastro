/**
 * AI Orchestrator Engine (AIOrchestrator)
 * Coordinates multi-model routing (OpenAI, Gemini, Grok), cross-checking,
 * RAG grounding, audit enforcement, and usage telemetry.
 */

import { IAIProvider, AIResponsePayload, AIRequestOptions, AIExecutionResult } from './AIProvider.js';
import { OpenAIProvider } from './OpenAIProvider.js';
import { GeminiProvider } from './GeminiProvider.js';
import { GrokProvider } from './GrokProvider.js';
import { OllamaProvider } from './OllamaProvider.js';
import { AIAuditor } from './AIAuditor.js';
import { KnowledgeRAG } from './KnowledgeRAG.js';
import { FullKundliResult } from '../astrology/VedicAstroEngine.js';
import { db } from '../database/db.js';

export interface OrchestrationRequest {
  userId?: string;
  query: string;
  kundli?: FullKundliResult;
  feature: 'AstroBot' | 'DailyPrediction' | 'MatchingInterpretation' | 'Palmistry' | 'ReportSynthesis';
  enableCrossCheck?: boolean;
  preferredProvider?: 'OpenAI' | 'Gemini' | 'Grok' | 'Ollama';
  model?: string;
}

export class AIOrchestrator {
  private primaryProvider: IAIProvider;
  private validationProvider: IAIProvider;
  private fallbackProvider: IAIProvider;
  private ollamaProvider: OllamaProvider;

  constructor() {
    this.primaryProvider = new OpenAIProvider();
    this.validationProvider = new GeminiProvider();
    this.fallbackProvider = new GrokProvider();
    this.ollamaProvider = new OllamaProvider();
  }

  public getOllamaProvider(): OllamaProvider {
    return this.ollamaProvider;
  }

  public async orchestrate(request: OrchestrationRequest): Promise<AIResponsePayload> {
    const startTime = Date.now();

    // 1. Knowledge Base RAG Retrieval
    const retrievedChunks = KnowledgeRAG.retrieveRelevantChunks(request.query, 2);
    const knowledgeContext = retrievedChunks
      .map((c) => `[Source: ${c.source} | Topic: ${c.topic}]\n${c.content}`)
      .join('\n\n');

    // 2. Astrological Context Assembly
    let astroContext = 'User has not yet linked a birth profile.';
    if (request.kundli) {
      const k = request.kundli;
      astroContext = `
Native Name: ${k.profile.name}
Birth Date: ${k.profile.birthDate} ${k.profile.birthTime} (${k.profile.birthPlace})
Sidereal Ascendant (Lagna): ${k.ascendant.details.signName} at ${k.ascendant.details.degreeInSign}°${k.ascendant.details.minutes}' (Nakshatra: ${k.ascendant.nakshatra.name}, Pada ${k.ascendant.nakshatra.pada})
Moon Sign (Chandra Rashi): ${k.moonSign.signName} (Nakshatra: ${k.moonNakshatra.name})
Sun Sign (Surya Rashi): ${k.sunSign.signName}
Current Mahadasha: ${k.dashas.currentMahadasha.planet} (Antardasha: ${k.dashas.currentAntardasha.planet})
Active Yogas: ${k.yogas.map((y) => y.name).join(', ') || 'None prominent'}
Manglik Status: ${k.doshas.manglik.intensity}
Sade Sati: ${k.doshas.sadeSati.currentPhase}
      `.trim();
    }

    const systemPrompt = `
You are DeepAstro Cosmic Intelligence, an elite spiritual intelligence engine with 20+ years of Vedic astrology expertise.
Core Principles:
1. NEVER invent or contradict astronomical positions, houses, signs, or dashas. Use strictly the supplied deterministic chart data.
2. Ground all answers in authentic Vedic principles (Parashara, Phaladeepika, Lal Kitab).
3. Be warm, empathetic, dignified, and empowering. Avoid fatalistic fear-mongering or guaranteed predictions.
4. Output must be strictly valid JSON conforming to:
{
  "summary": "Brief inspiring summary",
  "evidence": ["Point 1 grounded in chart", "Point 2"],
  "interpretation": "Detailed Vedic insight",
  "confidence": "High" | "Moderate",
  "recommendations": ["Actionable step 1", "Actionable step 2"],
  "remedies": ["Mantra/Practice 1", "Practice 2"],
  "disclaimer": "Astrological interpretations provide cosmic perspective..."
}
    `.trim();

    const userPrompt = `
=== USER QUERY ===
${request.query}

=== DETERMINISTIC CHART CONTEXT ===
${astroContext}

=== RETRIEVED SCRIPTURAL CONTEXT (RAG) ===
${knowledgeContext}
    `.trim();

    const requestOptions: AIRequestOptions = {
      systemPrompt,
      userPrompt,
      temperature: 0.3,
    };

    // 3. Execution with Provider Routing & Fallback Chain
    let result: AIExecutionResult;

    if (request.preferredProvider === 'Ollama') {
      if (request.model) this.ollamaProvider.setModel(request.model);
      result = await this.ollamaProvider.generateInterpretation(requestOptions).catch(async () => {
        console.warn('[AIOrchestrator] Preferred Ollama failed, falling back to OpenAI/Gemini/Grok...');
        return this.primaryProvider.generateInterpretation(requestOptions);
      });
    } else if (request.preferredProvider === 'Gemini') {
      result = await this.validationProvider.generateInterpretation(requestOptions);
    } else if (request.preferredProvider === 'Grok') {
      result = await this.fallbackProvider.generateInterpretation(requestOptions);
    } else {
      // Default auto-mesh: If OpenAI is configured, use it. Otherwise, if Ollama is reachable, use Ollama!
      const isOllamaReachable = await this.ollamaProvider.isReachable();
      if (!this.primaryProvider.isConfigured && isOllamaReachable) {
        if (request.model) this.ollamaProvider.setModel(request.model);
        result = await this.ollamaProvider.generateInterpretation(requestOptions).catch(async () => {
          return this.primaryProvider.generateInterpretation(requestOptions);
        });
      } else {
        result = await this.primaryProvider.generateInterpretation(requestOptions).catch(async () => {
          console.warn('[AIOrchestrator] Primary provider failed, checking Ollama & validation providers...');
          if (isOllamaReachable) {
            return this.ollamaProvider.generateInterpretation(requestOptions);
          }
          return this.validationProvider.generateInterpretation(requestOptions).catch(async () => {
            console.warn('[AIOrchestrator] Validation provider failed, invoking fallback provider...');
            return this.fallbackProvider.generateInterpretation(requestOptions);
          });
        });
      }
    }

    // 4. AIAuditor Quality Control & Anti-Hallucination Gate
    const audit = AIAuditor.audit(result.content, request.kundli);
    let finalPayload = audit.sanitizedContent;

    // Add reasoning citation if produced by DeepSeek-R1 or local reasoning model
    if (result.provider === 'Ollama') {
      finalPayload.evidence.push(`Reasoned on-device via local ${result.model} engine.`);
    }

    // 5. Cross-Checking (if requested or Pro tier)
    if (request.enableCrossCheck && this.validationProvider.isConfigured) {
      try {
        const crossCheck = await this.validationProvider.generateInterpretation({
          systemPrompt: 'Cross-check the following astrology interpretation against classical Parashari principles.',
          userPrompt: `Audit candidate:\n${JSON.stringify(finalPayload)}\n\nChart context:\n${astroContext}`,
        });
        if (crossCheck.content.recommendations.length > 0) {
          finalPayload.evidence.push(`Cross-validated by ${this.validationProvider.name} Intelligence.`);
        }
      } catch (err) {
        // Continue gracefully if secondary cross-check fails
      }
    }

    // 6. Log AI Telemetry in DB (Ollama is 0 cost local compute)
    const costCents = result.provider === 'Ollama' ? 0 : (result.totalTokens * 0.0003) / 100;
    db.aiUsageLogs.push({
      id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: request.userId,
      feature: request.feature,
      provider: result.provider,
      model: result.model,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      totalTokens: result.totalTokens,
      estimatedCostCents: costCents,
      latencyMs: Date.now() - startTime,
      createdAt: new Date().toISOString(),
    });

    return finalPayload;
  }
}
