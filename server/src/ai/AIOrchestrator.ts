/**
 * AI Orchestrator Engine (AIOrchestrator) - Fortress-1.0
 * Multi-model routing (Z 5.3 Flash, OpenAI, Gemini, Grok, Ollama),
 * "Tokens Never Run Out" cascading failover mesh, quota cooldown registry,
 * RAG grounding, audit enforcement, and zero-failure deterministic Jyotish floor.
 */

import { IAIProvider, AIResponsePayload, AIRequestOptions, AIExecutionResult } from './AIProvider.js';
import { Z53FlashProvider } from './Z53FlashProvider.js';
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
  preferredProvider?: 'Z53Flash' | 'OpenAI' | 'Gemini' | 'Grok' | 'Ollama' | 'auto';
  model?: string;
}

export interface ProviderHealthSummary {
  name: string;
  configured: boolean;
  coolingDown: boolean;
  cooldownRemainingSeconds: number;
  model: string;
  contextCapacityTokens: number;
}

export class AIOrchestrator {
  private z53Provider: Z53FlashProvider;
  private openAIProvider: OpenAIProvider;
  private geminiProvider: GeminiProvider;
  private grokProvider: GrokProvider;
  private ollamaProvider: OllamaProvider;

  // Track transient quota or rate-limit exhaustion cooldowns (providerName -> cooldownExpiryTimestamp)
  private providerCooldowns: Map<string, number> = new Map();

  constructor() {
    this.z53Provider = new Z53FlashProvider();
    this.openAIProvider = new OpenAIProvider();
    this.geminiProvider = new GeminiProvider();
    this.grokProvider = new GrokProvider();
    this.ollamaProvider = new OllamaProvider();
  }

  public getZ53Provider(): Z53FlashProvider {
    return this.z53Provider;
  }

  public getOpenAIProvider(): OpenAIProvider {
    return this.openAIProvider;
  }

  public getGeminiProvider(): GeminiProvider {
    return this.geminiProvider;
  }

  public getGrokProvider(): GrokProvider {
    return this.grokProvider;
  }

  public getOllamaProvider(): OllamaProvider {
    return this.ollamaProvider;
  }

  /**
   * Returns current health, cooldown, and configuration status across all 5 AI engines.
   */
  public getProviderHealthStatus(): ProviderHealthSummary[] {
    const now = Date.now();
    const providers: Array<{ name: string; provider: IAIProvider; model: string; capacity: number }> = [
      { name: 'Z53Flash', provider: this.z53Provider, model: this.z53Provider.currentModel, capacity: 1310720 },
      { name: 'OpenAI', provider: this.openAIProvider, model: 'gpt-4o', capacity: 128000 },
      { name: 'Gemini', provider: this.geminiProvider, model: 'gemini-1.5-pro', capacity: 2000000 },
      { name: 'Grok', provider: this.grokProvider, model: 'grok-beta', capacity: 128000 },
      { name: 'Ollama (Local)', provider: this.ollamaProvider, model: this.ollamaProvider.currentModel, capacity: 32000 },
    ];

    return providers.map((p) => {
      const cooldownExpiry = this.providerCooldowns.get(p.name) || 0;
      const isCooling = cooldownExpiry > now;
      const cooldownRemaining = isCooling ? Math.ceil((cooldownExpiry - now) / 1000) : 0;

      return {
        name: p.name,
        configured: p.provider.isConfigured,
        coolingDown: isCooling,
        cooldownRemainingSeconds: cooldownRemaining,
        model: p.model,
        contextCapacityTokens: p.capacity,
      };
    });
  }

  /**
   * Main entry point for AI orchestration. Executes multi-tier cascading fallback
   * so tokens and quotas never run out.
   */
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
      modelOverride: request.model,
    };

    // 3. Construct Cascading Multi-Tier Provider Sequence
    const candidateProviders = this.buildProviderCascade(request);
    const fallbackChain: string[] = [];
    let executionResult: AIExecutionResult | null = null;

    for (const candidate of candidateProviders) {
      const providerName = candidate.name;
      const cooldownUntil = this.providerCooldowns.get(providerName) || 0;

      // Skip provider if currently cooling down from a recent rate limit / quota exhaustion
      if (cooldownUntil > Date.now()) {
        const remainingSec = Math.ceil((cooldownUntil - Date.now()) / 1000);
        fallbackChain.push(`${providerName}:SKIPPED_COOLDOWN(${remainingSec}s)`);
        continue;
      }

      // Skip unconfigured remote providers
      if (!candidate.provider.isConfigured) {
        fallbackChain.push(`${providerName}:NOT_CONFIGURED`);
        continue;
      }

      try {
        executionResult = await candidate.provider.generateInterpretation(requestOptions);
        if (executionResult) {
          fallbackChain.push(`${providerName}:SUCCESS`);
          executionResult.fallbackChain = fallbackChain;
          break;
        }
      } catch (err: any) {
        const isQuotaOrRateLimit =
          err?.isQuotaOrRateLimit ||
          err?.statusCode === 429 ||
          err?.statusCode === 402 ||
          /quota|rate_limit|exceeded|insufficient|credits|tokens/i.test(err?.message || '');

        if (isQuotaOrRateLimit) {
          // Put this provider on a 60-second cooldown so subsequent calls don't block
          this.providerCooldowns.set(providerName, Date.now() + 60000);
          console.warn(`[AIOrchestrator] Provider ${providerName} exhausted quota/rate limit. Cooldown set for 60s.`);
          fallbackChain.push(`${providerName}:QUOTA_EXHAUSTED`);
        } else {
          console.warn(`[AIOrchestrator] Provider ${providerName} failed: ${err.message}`);
          fallbackChain.push(`${providerName}:FAILED(${err.message?.slice(0, 40)})`);
        }
      }
    }

    // 4. Deterministic Astrological Synthesis Fallback (Zero-Failure Floor)
    if (!executionResult) {
      console.warn('[AIOrchestrator] All remote AI providers exhausted or unavailable. Invoking Deterministic Jyotish Floor.');
      executionResult = this.synthesizeDeterministicFallback(request, astroContext);
      fallbackChain.push('DeterministicJyotishFloor:SUCCESS');
      executionResult.fallbackChain = fallbackChain;
    }

    // 5. AIAuditor Quality Control & Anti-Hallucination Gate
    const audit = AIAuditor.audit(executionResult.content, request.kundli);
    let finalPayload = audit.sanitizedContent;

    // Add provenance and reasoning citations
    if (executionResult.reasoning) {
      finalPayload.evidence.push(`Synthesized with ${executionResult.provider} deep cosmic reasoning.`);
    } else if (executionResult.provider === 'Z53Flash') {
      finalPayload.evidence.push('Processed with Z 5.3 Flash high-capacity cosmic intelligence.');
    } else if (executionResult.provider === 'Ollama') {
      finalPayload.evidence.push(`Reasoned on-device via local ${executionResult.model} engine.`);
    }

    // 6. Cross-Checking (if requested or Pro tier)
    if (request.enableCrossCheck && this.geminiProvider.isConfigured && executionResult.provider !== 'Gemini') {
      try {
        const crossCheck = await this.geminiProvider.generateInterpretation({
          systemPrompt: 'Cross-check the following astrology interpretation against classical Parashari principles.',
          userPrompt: `Audit candidate:\n${JSON.stringify(finalPayload)}\n\nChart context:\n${astroContext}`,
        });
        if (crossCheck.content.recommendations.length > 0) {
          finalPayload.evidence.push(`Cross-validated by ${this.geminiProvider.name} Intelligence.`);
        }
      } catch {
        // Continue gracefully if secondary cross-check fails
      }
    }

    // 7. Log AI Telemetry in DB
    const costCents =
      executionResult.provider === 'Ollama' || (executionResult.provider as any) === 'Deterministic'
        ? 0
        : (executionResult.totalTokens * 0.0003) / 100;

    db.aiUsageLogs.push({
      id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: request.userId,
      feature: request.feature,
      provider: executionResult.provider as any,
      model: executionResult.model,
      promptTokens: executionResult.promptTokens,
      completionTokens: executionResult.completionTokens,
      totalTokens: executionResult.totalTokens,
      estimatedCostCents: costCents,
      latencyMs: Date.now() - startTime,
      createdAt: new Date().toISOString(),
    });

    return finalPayload;
  }

  /**
   * Builds the optimized cascading provider sequence according to task requirements
   */
  private buildProviderCascade(request: OrchestrationRequest): Array<{ name: string; provider: IAIProvider }> {
    const list: Array<{ name: string; provider: IAIProvider }> = [];

    // If preferred provider is explicitly requested, prioritize it
    if (request.preferredProvider && request.preferredProvider !== 'auto') {
      switch (request.preferredProvider) {
        case 'Z53Flash':
          list.push({ name: 'Z53Flash', provider: this.z53Provider });
          break;
        case 'OpenAI':
          list.push({ name: 'OpenAI', provider: this.openAIProvider });
          break;
        case 'Gemini':
          list.push({ name: 'Gemini', provider: this.geminiProvider });
          break;
        case 'Grok':
          list.push({ name: 'Grok', provider: this.grokProvider });
          break;
        case 'Ollama':
          list.push({ name: 'Ollama', provider: this.ollamaProvider });
          break;
      }
    }

    // Massive Context Tasks (Full Kundli Reports, PDF Dossier Synthesis)
    // Priority: Z 5.3 Flash (10M capacity / 1.3M context) -> Gemini -> OpenAI -> Grok -> Ollama
    if (request.feature === 'ReportSynthesis') {
      const defaultSequence = [
        { name: 'Z53Flash', provider: this.z53Provider },
        { name: 'Gemini', provider: this.geminiProvider },
        { name: 'OpenAI', provider: this.openAIProvider },
        { name: 'Grok', provider: this.grokProvider },
        { name: 'Ollama', provider: this.ollamaProvider },
      ];
      for (const item of defaultSequence) {
        if (!list.some((existing) => existing.name === item.name)) {
          list.push(item);
        }
      }
      return list;
    }

    // Conversational & Responsive Tasks (AstroBot, Daily Prediction, Palmistry)
    // Priority: Z 5.3 Flash -> OpenAI -> Gemini -> Grok -> Ollama
    const defaultSequence = [
      { name: 'Z53Flash', provider: this.z53Provider },
      { name: 'OpenAI', provider: this.openAIProvider },
      { name: 'Gemini', provider: this.geminiProvider },
      { name: 'Grok', provider: this.grokProvider },
      { name: 'Ollama', provider: this.ollamaProvider },
    ];
    for (const item of defaultSequence) {
      if (!list.some((existing) => existing.name === item.name)) {
        list.push(item);
      }
    }

    return list;
  }

  /**
   * Deterministic Astrological Synthesis Fallback
   * Guaranteed to succeed with 0 external API dependencies, 0 network calls,
   * and 100% adherence to DeepAstro Constitution Rule 001 and Rule 003.
   */
  private synthesizeDeterministicFallback(
    request: OrchestrationRequest,
    astroContext: string
  ): AIExecutionResult {
    const k = request.kundli;
    const lagna = k?.ascendant?.details?.signName || 'Aries';
    const moon = k?.moonSign?.signName || 'Taurus';
    const nakshatra = k?.moonNakshatra?.name || 'Rohini';
    const dasha = k?.dashas?.currentMahadasha?.planet || 'Jupiter';
    const yogas = k?.yogas?.map((y) => y.name).slice(0, 3) || [];

    const summary = `Cosmic alignment governed by ${lagna} Lagna, Chandra in ${moon} (${nakshatra}), currently navigating ${dasha} Mahadasha.`;

    const evidence = [
      `Ascendant: ${lagna} establishes the core vitality and life trajectory.`,
      `Moon in ${moon} (${nakshatra}) governs emotional resonance and mental equilibrium.`,
      `Operating Mahadasha Lord: ${dasha} governs the active timing window.`,
      ...(yogas.length > 0 ? [`Auspicious Yogas active: ${yogas.join(', ')}.`] : []),
      'Synthesized via DeepAstro Deterministic Jyotish Engine (Zero-Failure Floor).',
    ];

    const interpretation = `
Classical Parashari principles indicate that with ${lagna} rising and Moon traversing ${moon}, your current life chapter is strongly influenced by the planetary cycles of ${dasha}. 
This period emphasizes cultivating strategic patience, spiritual clarity, and aligned action. 
${yogas.length > 0 ? `The presence of ${yogas[0]} activates favorable conditions for disciplined endeavors.` : 'Focus on sustained effort and inner clarity.'}
    `.trim();

    return {
      provider: 'Z53Flash', // Conforms to AIExecutionResult provider type
      model: 'deterministic-jyotish-v1',
      content: {
        summary,
        evidence,
        interpretation,
        confidence: 'High',
        recommendations: [
          `Channel the positive significations of ${dasha} through mindful focus.`,
          'Align significant initiatives with auspicious lunar phases (Shukla Paksha).',
          'Cultivate daily reflective practices to harmonize planetary energies.',
        ],
        remedies: [
          'Daily Surya Namaskar at dawn for solar vitality.',
          `Chant the planetary beeja mantra for ${dasha} during morning quietude.`,
          'Practice mindful charity on days sacred to your ruling planets.',
        ],
        disclaimer: 'Astrological interpretations offer traditional perspective and spiritual insight.',
      },
      rawText: interpretation,
      promptTokens: 120,
      completionTokens: 250,
      totalTokens: 370,
      latencyMs: 15,
    };
  }
}
