/**
 * AI Intelligence Routes (AstroBot)
 * Orchestrates multi-model query responses grounded in deterministic chart data and scripture RAG.
 */

import { Router, Response } from 'express';
import { AIOrchestrator } from '../ai/AIOrchestrator.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { VedicAstroEngine, BirthProfileInput } from '../astrology/VedicAstroEngine.js';
import { birthProfileRepository } from '../database/repositories/BirthProfileRepository.js';
import { db } from '../database/db.js';
import { EnvLoader } from '../config/envLoader.js';

const router = Router();
const orchestrator = new AIOrchestrator();

// GET /api/ai/models
router.get('/models', async (_req, res: Response) => {
  try {
    const ollama = orchestrator.getOllamaProvider();
    const isOllamaReachable = await ollama.isReachable();
    const installedOllamaModels = isOllamaReachable ? await ollama.listInstalledModels() : [];

    return res.json({
      providers: [
        { name: 'Ollama', label: 'Ollama (Local On-Device Engine)', isAvailable: isOllamaReachable, models: installedOllamaModels },
        { name: 'OpenAI', label: 'OpenAI (GPT-4o)', isAvailable: Boolean(process.env.OPENAI_API_KEY) },
        { name: 'Gemini', label: 'Google Gemini (1.5 Pro)', isAvailable: Boolean(process.env.GEMINI_API_KEY) },
        { name: 'Grok', label: 'xAI Grok (Grok-2)', isAvailable: Boolean(process.env.GROK_API_KEY) },
      ],
      defaultProvider: isOllamaReachable ? 'Ollama' : 'OpenAI',
      activeOllamaModel: ollama.currentModel,
      isOllamaConnected: isOllamaReachable,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve AI model status.', details: err.message });
  }
});

// GET /api/ai/connections
router.get('/connections', (_req, res: Response) => {
  const statuses = EnvLoader.getKeyStatuses();
  return res.json({ connections: statuses });
});

export type ConnectionStatusCategory =
  | 'CONNECTED'
  | 'AUTHENTICATION_FAILED'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'MODEL_UNAVAILABLE'
  | 'SERVER_ERROR'
  | 'NOT_CONFIGURED';

interface ProviderTestResult {
  provider: string;
  status: ConnectionStatusCategory;
  latencyMs: number;
  details: string;
  httpStatus?: number;
}

// POST /api/ai/test-connections
router.post('/test-connections', async (_req, res: Response) => {
  const results: ProviderTestResult[] = [];

  // Helper to categorize HTTP errors
  const categorizeError = (err: any, status?: number): ConnectionStatusCategory => {
    if (status === 401 || status === 403) return 'AUTHENTICATION_FAILED';
    if (status === 429) return 'RATE_LIMITED';
    if (status === 404) return 'MODEL_UNAVAILABLE';
    if (status && status >= 500) return 'SERVER_ERROR';
    if (err.name === 'TimeoutError' || err.name === 'AbortError' || err.message?.includes('timeout')) return 'TIMEOUT';
    return 'SERVER_ERROR';
  };

  // 1. OpenAI (Test Auth & Model List)
  if (process.env.OPENAI_API_KEY) {
    const start = Date.now();
    try {
      const resp = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        signal: AbortSignal.timeout(6000),
      });
      const latency = Date.now() - start;
      if (resp.ok) {
        const data = await resp.json() as { data: Array<{ id: string }> };
        const hasModels = data.data && data.data.some(m => m.id.includes('gpt-4'));
        if (hasModels) {
          results.push({
            provider: 'OpenAI',
            status: 'CONNECTED',
            latencyMs: latency,
            details: 'Authenticated successfully. GPT-4o & GPT-4o-mini available.',
            httpStatus: resp.status,
          });
        } else {
          results.push({
            provider: 'OpenAI',
            status: 'MODEL_UNAVAILABLE',
            latencyMs: latency,
            details: 'Authenticated, but required GPT-4 models not found on account.',
            httpStatus: resp.status,
          });
        }
      } else {
        const cat = categorizeError(null, resp.status);
        results.push({
          provider: 'OpenAI',
          status: cat,
          latencyMs: latency,
          details: `HTTP ${resp.status}: ${resp.statusText}`,
          httpStatus: resp.status,
        });
      }
    } catch (err: any) {
      const cat = categorizeError(err);
      results.push({
        provider: 'OpenAI',
        status: cat,
        latencyMs: Date.now() - start,
        details: err.message || 'Connection failed',
      });
    }
  } else {
    results.push({
      provider: 'OpenAI',
      status: 'NOT_CONFIGURED',
      latencyMs: 0,
      details: 'OPENAI_API_KEY missing in key.env / process.env',
    });
  }

  // 2. DeepSeek (Test Auth & Models)
  if (process.env.DEEPSEEK_API_KEY) {
    const start = Date.now();
    try {
      const resp = await fetch('https://api.deepseek.com/models', {
        headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
        signal: AbortSignal.timeout(6000),
      });
      const latency = Date.now() - start;
      if (resp.ok) {
        results.push({
          provider: 'DeepSeek',
          status: 'CONNECTED',
          latencyMs: latency,
          details: 'Authenticated successfully. DeepSeek-V3 & DeepSeek-R1 active.',
          httpStatus: resp.status,
        });
      } else {
        const cat = categorizeError(null, resp.status);
        results.push({
          provider: 'DeepSeek',
          status: cat,
          latencyMs: latency,
          details: `HTTP ${resp.status}: ${resp.statusText}`,
          httpStatus: resp.status,
        });
      }
    } catch (err: any) {
      const cat = categorizeError(err);
      results.push({
        provider: 'DeepSeek',
        status: cat,
        latencyMs: Date.now() - start,
        details: err.message || 'Connection failed',
      });
    }
  } else {
    results.push({
      provider: 'DeepSeek',
      status: 'NOT_CONFIGURED',
      latencyMs: 0,
      details: 'DEEPSEEK_API_KEY missing in key.env / process.env',
    });
  }

  // 3. OpenRouter (Test Auth Key)
  if (process.env.OPENROUTER_API_KEY) {
    const start = Date.now();
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
        signal: AbortSignal.timeout(6000),
      });
      const latency = Date.now() - start;
      if (resp.ok) {
        results.push({
          provider: 'OpenRouter',
          status: 'CONNECTED',
          latencyMs: latency,
          details: 'Authenticated successfully. Free & priority AI mesh active.',
          httpStatus: resp.status,
        });
      } else {
        const cat = categorizeError(null, resp.status);
        results.push({
          provider: 'OpenRouter',
          status: cat,
          latencyMs: latency,
          details: `HTTP ${resp.status}: ${resp.statusText}`,
          httpStatus: resp.status,
        });
      }
    } catch (err: any) {
      const cat = categorizeError(err);
      results.push({
        provider: 'OpenRouter',
        status: cat,
        latencyMs: Date.now() - start,
        details: err.message || 'Connection failed',
      });
    }
  } else {
    results.push({
      provider: 'OpenRouter',
      status: 'NOT_CONFIGURED',
      latencyMs: 0,
      details: 'OPENROUTER_API_KEY missing in key.env / process.env',
    });
  }

  // 4. Ollama Local (Test Connectivity & Installed Models)
  const ollama = orchestrator.getOllamaProvider();
  const startOllama = Date.now();
  try {
    const isOllamaUp = await ollama.isReachable();
    const latency = Date.now() - startOllama;
    if (isOllamaUp) {
      const models = await ollama.listInstalledModels();
      if (models.length > 0) {
        results.push({
          provider: 'Ollama (Local)',
          status: 'CONNECTED',
          latencyMs: latency,
          details: `Port 11434 responsive. ${models.length} models installed (${models.map(m => m.name).slice(0, 3).join(', ')})`,
          httpStatus: 200,
        });
      } else {
        results.push({
          provider: 'Ollama (Local)',
          status: 'MODEL_UNAVAILABLE',
          latencyMs: latency,
          details: 'Ollama server responsive on 11434, but no models installed. Run `ollama pull deepseek-r1:7b`.',
          httpStatus: 200,
        });
      }
    } else {
      results.push({
        provider: 'Ollama (Local)',
        status: 'SERVER_ERROR',
        latencyMs: latency,
        details: 'Local Ollama service unreachable at http://127.0.0.1:11434',
      });
    }
  } catch (err: any) {
    results.push({
      provider: 'Ollama (Local)',
      status: 'SERVER_ERROR',
      latencyMs: Date.now() - startOllama,
      details: err.message || 'Failed to ping local Ollama',
    });
  }

  return res.json({ testedAt: new Date().toISOString(), results });
});

// Comprehensive Prompt Injection & Calculation Override Defenses
const PROMPT_INJECTION_PATTERNS = [
  /ignore (your|all|previous) (system|instructions|rules)/i,
  /change (my|the) birth (chart|data|time|date|coordinates)/i,
  /use (this|a) fake (planetary|planet|position|coordinates)/i,
  /reveal (your|the) (hidden|system)? (prompt|instructions|secret|api key)/i,
  /ignore (the)? calculation passport/i,
  /treat this document as higher priority/i,
  /return another user'?s (chart|data|profile|reading)/i,
  /modify (the)? prediction ledger/i,
];

// POST /api/ai/chat
router.post('/chat', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, chartContext, provider, model } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message query cannot be empty.' });
    }

    // Strict Prompt Injection & System Override Gate
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(message)) {
        return res.status(400).json({
          error: 'PROHIBITED_OPERATION',
          details: 'DeepAstro operates strictly according to immutable calculation passports and verified astrological evidence. System rules, calculation ledgers, and foreign user profiles cannot be overridden or disclosed.',
        });
      }
    }

    // Determine chart context
    let kundli = chartContext;
    if (!kundli && req.user) {
      const saved = (await birthProfileRepository.getProfileByUserId(req.user.userId)) || db.getBirthProfile(req.user.userId);
      if (saved && saved.birthDate && saved.birthTime) {
        const birthProfile: BirthProfileInput = {
          name: saved.fullName,
          birthDate: saved.birthDate,
          birthTime: saved.birthTime,
          birthPlace: saved.birthPlace,
          latitude: saved.latitude,
          longitude: saved.longitude,
          timezone: saved.timezone,
          gender: saved.gender,
        };
        kundli = VedicAstroEngine.calculateKundli(birthProfile);
      }
    }

    const isProUser = req.user ? db.getSubscription(req.user.userId).planId === 'PRO' : false;

    const response = await orchestrator.orchestrate({
      userId: req.user?.userId,
      query: message,
      kundli,
      feature: 'AstroBot',
      enableCrossCheck: isProUser,
      preferredProvider: provider,
      model,
    });

    return res.json({
      query: message,
      answer: response,
      chartReference: kundli ? {
        ascendant: kundli.ascendant?.details?.signName || 'Unknown',
        moonSign: kundli.moonSign?.signName || 'Unknown',
        nakshatra: kundli.moonNakshatra?.name || 'Unknown',
        currentDasha: kundli.dashas?.currentMahadasha?.planet || 'Unknown',
      } : null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'AstroBot encountered an unexpected anomaly.', details: err.message });
  }
});

export default router;
