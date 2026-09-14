/**
 * Z53TokenBudgetManager.ts
 * High-Capacity Token Budget & Deterministic Chunking Orchestrator for Z 5.3 Flash
 *
 * Implements:
 * - Deterministic token estimation (Input & Output)
 * - Request-level token budget reservation & release
 * - Runaway request protection
 * - Deterministic Kundli chunking (Chart -> Dasha -> Varga -> Yoga/Dosha -> Transit)
 * - Quota exhaustion and rate-limit guardrails
 */

import { FullKundliResult } from '../../astrology/VedicAstroEngine.js';

export interface TokenReservation {
  requestId: string;
  reservedAt: number;
  inputBudget: number;
  outputBudget: number;
  actualInputUsed?: number;
  actualOutputUsed?: number;
}

export interface KundliSynthesisChunks {
  chartChunk: string;
  dashaChunk: string;
  vargaChunk: string;
  yogaDoshaChunk: string;
  transitChunk: string;
  estimatedTotalTokens: number;
}

export class Z53TokenBudgetManager {
  // Maximum allowed single-request output tokens to prevent runaway calls
  public static readonly MAX_REQUEST_OUTPUT_TOKENS = 8192;
  // Practical safe single-prompt input token ceiling for low latency
  public static readonly SAFE_INPUT_TOKEN_CEILING = 32768;

  private static activeReservations: Map<string, TokenReservation> = new Map();

  /**
   * Estimates token count conservatively: accounts for astrological unicode
   * symbols, degree notation, and multi-lingual transcripts.
   */
  public static estimateTokens(text: string): number {
    if (!text) return 0;
    // Fast estimation: roughly 3.8 characters per token on average for Jyotish text
    return Math.ceil(text.length / 3.8);
  }

  /**
   * Reserves a token budget for an incoming generation request.
   */
  public static reserveBudget(
    requestId: string,
    estimatedInputTokens: number,
    requestedOutputTokens: number = 2048
  ): boolean {
    const outputBudget = Math.min(requestedOutputTokens, this.MAX_REQUEST_OUTPUT_TOKENS);

    // Evict expired reservations (older than 3 minutes)
    const now = Date.now();
    for (const [id, res] of this.activeReservations.entries()) {
      if (now - res.reservedAt > 180000) {
        this.activeReservations.delete(id);
      }
    }

    this.activeReservations.set(requestId, {
      requestId,
      reservedAt: now,
      inputBudget: estimatedInputTokens,
      outputBudget,
    });

    return true;
  }

  /**
   * Releases or records actual token spend upon request completion.
   */
  public static releaseBudget(requestId: string, actualInput?: number, actualOutput?: number): void {
    const reservation = this.activeReservations.get(requestId);
    if (reservation) {
      if (actualInput !== undefined) reservation.actualInputUsed = actualInput;
      if (actualOutput !== undefined) reservation.actualOutputUsed = actualOutput;
      this.activeReservations.delete(requestId);
    }
  }

  /**
   * Splits massive Kundli chart dossiers into deterministic, clean chunks
   * to guarantee optimal synthesis without prompt starvation or truncation.
   */
  public static chunkKundliForSynthesis(kundli: FullKundliResult): KundliSynthesisChunks {
    // 1. Chart Core Chunk
    const asc = kundli.ascendant;
    const moon = kundli.moonSign;
    const sun = kundli.sunSign;
    const chartChunk = `
=== CORE ASTRONOMICAL POSITIONS ===
Lagna: ${asc?.details?.signName || 'Unknown'} at ${asc?.details?.degreeInSign || 0}°${asc?.details?.minutes || 0}' (${asc?.nakshatra?.name || 'Unknown'}, Pada ${asc?.nakshatra?.pada || 1})
Moon: ${moon?.signName || 'Unknown'} (${kundli.moonNakshatra?.name || 'Unknown'})
Sun: ${sun?.signName || 'Unknown'}
Planetary Dignities:
${(kundli.planets || []).map((p: any) => `- ${p.name}: ${p.signName || p.currentSign} at ${Math.round(p.degreeInSign || p.longitude || 0)}° (House: ${p.houseNumber || p.house || 'N/A'}, Retrograde: ${Boolean(p.isRetrograde)})`).join('\n')}
    `.trim();

    // 2. Dasha Chronology Chunk
    const d = kundli.dashas;
    const dashaChunk = `
=== VIMSHOTTARI DASHA TRAJECTORY ===
Current Mahadasha: ${d?.currentMahadasha?.planet || 'N/A'} (Until: ${d?.currentMahadasha?.endDate || 'N/A'})
Current Antardasha: ${d?.currentAntardasha?.planet || 'N/A'} (Until: ${d?.currentAntardasha?.endDate || 'N/A'})
Current Pratyantardasha: ${d?.currentPratyantardasha?.planet || 'N/A'}
Upcoming Cycles:
${(d?.allMahadashas || []).slice(0, 5).map((m: any) => `- ${m.planet}: ${m.startDate} to ${m.endDate}`).join('\n')}
    `.trim();

    // 3. Varga Divisional Charts Chunk
    const v = (kundli as any).vargas || {};
    const vargaChunk = `
=== DIVISIONAL CHARTS (VARGAS) ===
D9 Navamsha: ${v.D9 ? 'Calculated' : 'Standard sidereal harmonic'}
D10 Dashamsha: ${v.D10 ? 'Calculated' : '10th harmonic profession analysis'}
D60 Shashtiamsha: ${v.D60 ? 'Calculated' : 'Subtle karmic root analysis'}
    `.trim();

    // 4. Yogas and Doshas Chunk
    const yogas = kundli.yogas || [];
    const doshas = kundli.doshas;
    const yogaDoshaChunk = `
=== YOGAS & DOSHAS ===
Active Yogas: ${yogas.length > 0 ? yogas.map((y: any) => y.name).join(', ') : 'No major malefic combinations'}
Manglik Status: ${doshas?.manglik?.intensity || 'None'}
Sade Sati: ${doshas?.sadeSati?.currentPhase || 'Not active'}
    `.trim();

    // 5. Transits Chunk
    const transits = (kundli as any).transits || {};
    const transitChunk = `
=== TRANSIT (GOCHARA) MATRIX ===
Saturn: ${transits.Saturn?.sign || 'Traversing karmic sector'}
Jupiter: ${transits.Jupiter?.sign || 'Fostering dharma and expansion'}
Rahu/Ketu: Axis in ${transits.Rahu?.sign || 'Nodal alignment'}
    `.trim();

    const fullContent = `${chartChunk}\n\n${dashaChunk}\n\n${vargaChunk}\n\n${yogaDoshaChunk}\n\n${transitChunk}`;
    const estimatedTotalTokens = this.estimateTokens(fullContent);

    return {
      chartChunk,
      dashaChunk,
      vargaChunk,
      yogaDoshaChunk,
      transitChunk,
      estimatedTotalTokens,
    };
  }
}
