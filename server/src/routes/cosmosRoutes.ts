import { Router, Request, Response } from 'express';
import { ChartSessionService, ChartSessionInput } from '../services/ChartSessionService.js';
import { ChartSession } from '../astrology/chartSessionTypes.js';

export const cosmosRoutes = Router();

// 1. Canonical Chart Session Creation / Retrieval
cosmosRoutes.post('/session', async (req: Request, res: Response) => {
  try {
    const { name, date, birthDate, time, birthTime, latitude, longitude, timezone, city, birthPlace, country, gender, ayanamsa, houseSystem } = req.body;

    const finalDate = birthDate || date;
    const finalTime = birthTime || time;

    if (!finalDate || !finalTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing birth date or time.',
        validation: { passed: false, checks: { positionChecks: false, houseChecks: false, nakshatraChecks: false, dashaChecks: false, timezoneChecks: false }, diagnostics: ['Birth date and time are mandatory for astronomical calculation.'] }
      });
    }

    const input: ChartSessionInput = {
      name: name || 'Explorer',
      birthDate: finalDate,
      birthTime: finalTime,
      birthPlace: birthPlace || city || 'New Delhi',
      latitude: typeof latitude === 'number' ? latitude : 28.6139,
      longitude: typeof longitude === 'number' ? longitude : 77.2090,
      timezone: typeof timezone === 'number' ? timezone : 5.5,
      country: country || 'India',
      gender: gender || 'other',
      ayanamsa: ayanamsa || 'Lahiri',
      houseSystem: houseSystem || 'Placidus',
    };

    const session = await ChartSessionService.getOrCreateSession(input);
    return res.json({
      success: true,
      session,
      fingerprint: session.birthDataFingerprint,
      validation: session.validation,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to construct canonical ChartSession',
    });
  }
});

// 2. Retrieve session by fingerprint
cosmosRoutes.get('/session/:fingerprint', async (req: Request, res: Response) => {
  try {
    const fingerprint = Array.isArray(req.params.fingerprint) ? req.params.fingerprint[0] : req.params.fingerprint;
    const session = ChartSessionService.getSession(fingerprint);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'ChartSession not found for fingerprint: ' + fingerprint,
      });
    }
    return res.json({ success: true, session });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Dynamic Insights by Depth
cosmosRoutes.get('/insights/:fingerprint', async (req: Request, res: Response) => {
  try {
    const fingerprint = Array.isArray(req.params.fingerprint) ? req.params.fingerprint[0] : req.params.fingerprint;
    const depth = ((req.query.depth as string) || 'STANDARD') as 'QUICK' | 'STANDARD' | 'DEEP' | 'TECHNICAL';
    const session = ChartSessionService.getSession(fingerprint);
    if (!session) {
      return res.status(404).json({ success: false, error: 'ChartSession not found.' });
    }

    const filtered = ChartSessionService.getInsightsByDepth(session, depth);
    return res.json({
      success: true,
      fingerprint,
      depth,
      insights: filtered,
      storyChapters: session.personalization.cosmicStory.filter(c => depth === 'QUICK' ? [1, 2, 5].includes(c.chapterNumber) : true),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Ask DeepAstro (Strictly evidence-grounded AI consultation with honest fallback)
cosmosRoutes.post('/ask', async (req: Request, res: Response) => {
  try {
    const { session, sessionFingerprint, query } = req.body;
    let chartSession: ChartSession | undefined = session;
    if (!chartSession && sessionFingerprint) {
      chartSession = ChartSessionService.getSession(sessionFingerprint);
    }

    if (!chartSession) {
      return res.status(400).json({
        success: false,
        error: 'A valid ChartSession or active sessionFingerprint is required to ask DeepAstro.',
      });
    }

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Question or query is required.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        status: 'UNAVAILABLE',
        reason: 'AI interpretation service key is unconfigured. Astronomical calculations remain 100% active.',
        dependency: 'Gemini Generative Language API',
        retryable: false,
        timestamp: new Date().toISOString(),
        availableEvidence: chartSession.evidenceGraph.slice(0, 6).map(n => ({
          label: n.label,
          detail: n.detail,
          strength: n.strength,
        })),
      });
    }

    const evidenceSummary = chartSession.evidenceGraph.map(n => 
      `- [${n.category}] ${n.label}: ${n.detail} (Strength: ${n.strength})`
    ).slice(0, 15).join('\n');

    const dashaSummary = `Mahadasha: ${chartSession.dasha.currentMahaDasha}, Antardasha: ${chartSession.dasha.currentAntarDasha}`;
    const yogasSummary = chartSession.yogas.map(y => `${y.name} (${y.category}): ${y.mathematicalProof}`).join('; ');

    const prompt = `You are DeepAstro's AI interpretation engine.
IMPORTANT ARCHITECTURAL RULE:
- You are strictly an INTERPRETATION LAYER.
- NEVER calculate or invent astronomical values.
- Ground your answer ONLY on the supplied evidence below.
- If evidence is missing, state it honestly.

NATIVE CHART PROFILE:
- Name: ${chartSession.identity.userName}
- Ascendant (Lagna): ${chartSession.vedic.ascendantSign} (${chartSession.vedic.ascendantDegree.toFixed(2)}°)
- Moon Sign: ${chartSession.vedic.moonSign} | Nakshatra: ${chartSession.vedic.moonNakshatra} Pada ${chartSession.vedic.moonPada}
- Sun Sign: ${chartSession.vedic.sunSign}
- Active Dasha: ${dashaSummary}
- Key Yogas: ${yogasSummary || 'Standard planetary alignments'}

ASTRONOMICAL EVIDENCE GRAPH:
${evidenceSummary}

USER INQUIRY:
"${query}"

RESPOND IN CLEAN JSON FORMAT:
{
  "answer": "Detailed astrological synthesis directly addressing user inquiry",
  "why": "The core astronomical reasoning explaining why this manifestation occurs",
  "evidenceNodes": ["Exact planetary placement or aspect 1", "Placement or lord 2"],
  "methodology": "Parashari / KP / Jaimini principles applied",
  "limitations": "Any planetary caveats or current transits to watch"
}`;

    const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (response.ok) {
          const resultJson: any = await response.json();
          const rawText = resultJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return res.json({
              success: true,
              data: parsed,
              fingerprint: chartSession.birthDataFingerprint,
            });
          }
        }
      } catch (err) {
        lastError = err;
      }
    }

    return res.status(503).json({
      status: 'UNAVAILABLE',
      reason: 'Gemini AI synthesis request failed or timed out: ' + (lastError?.message || 'service error'),
      dependency: 'Gemini Generative Language API',
      retryable: true,
      timestamp: new Date().toISOString(),
      availableEvidence: chartSession.evidenceGraph.slice(0, 5),
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Daily Cosmic Weather
cosmosRoutes.get('/weather/:fingerprint', async (req: Request, res: Response) => {
  try {
    const fingerprint = Array.isArray(req.params.fingerprint) ? req.params.fingerprint[0] : req.params.fingerprint;
    const session = ChartSessionService.getSession(fingerprint);
    if (!session) {
      return res.status(404).json({ success: false, error: 'ChartSession not found.' });
    }

    return res.json({
      success: true,
      weather: session.currentCosmicWeather,
      fingerprint,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default cosmosRoutes;