import crypto from 'crypto';
import { PastLifeInputEngine, ValidatedPastLifeInput } from './PastLifeInputEngine.js';
import { PastLifeCalculationAdapter } from './PastLifeCalculationAdapter.js';
import { PastLifeAstrologyEngine } from './PastLifeAstrologyEngine.js';
import { PastLifeVargaEngine } from './PastLifeVargaEngine.js';
import { PastLifeJaiminiEngine } from './PastLifeJaiminiEngine.js';
import { PastLifeKPEngine } from './PastLifeKPEngine.js';
import { PastLifeNumerologyEngine } from './PastLifeNumerologyEngine.js';
import { PastLifeKarmaEngine } from './PastLifeKarmaEngine.js';
import { PastLifeVedicKnowledgeEngine } from './PastLifeVedicKnowledgeEngine.js';
import { PastLifePuranicKnowledgeEngine } from './PastLifePuranicKnowledgeEngine.js';
import { VishnuPuranaKnowledgeAdapter } from './VishnuPuranaKnowledgeAdapter.js';
import { PastLifeEvidenceEngine } from './PastLifeEvidenceEngine.js';
import { PastLifeConvergenceEngine } from './PastLifeConvergenceEngine.js';
import { PastLifeContradictionEngine } from './PastLifeContradictionEngine.js';
import { PastLifeConfidenceEngine } from './PastLifeConfidenceEngine.js';
import { PastLifePatternEngine } from './PastLifePatternEngine.js';
import { PastLifeNarrativeEngine } from './PastLifeNarrativeEngine.js';
import { PastLifePersonalizationEngine } from './PastLifePersonalizationEngine.js';
import { PastLifeVisualThemeEngine } from './PastLifeVisualThemeEngine.js';
import { PastLifeVisualPromptEngine } from './PastLifeVisualPromptEngine.js';
import { PastLifeCardEngine } from './PastLifeCardEngine.js';
import { PastLifeAuditEngine } from './PastLifeAuditEngine.js';
import {
  PastLifeInsightSchema,
  PastLifeGenerationRequest,
  PastLifeUserFeedback,
} from './PastLifeTypes.js';
import { BirthProfileRecord } from '../../database/db.js';

export class PastLifeIntelligenceEngine {
  public static readonly VERSION = '2.0.0-soultrace';
  public static readonly KNOWLEDGE_VERSION = '7.0.0-canon';

  public static generate(
    userId: string,
    profile?: Partial<BirthProfileRecord> | null,
    request?: PastLifeGenerationRequest
  ): {
    success: boolean;
    data?: PastLifeInsightSchema & {
      convergence?: any;
      calculationFingerprint?: string;
      vargaEvaluation?: any;
      jaiminiEvaluation?: any;
      kpEvaluation?: any;
    };
    provenance?: {
      calculationFingerprint: string;
      sources: string[];
      engineVersion: string;
      generatedAt: string;
    };
    error?: string;
    missingFields?: string[];
  } {
    // 1. Validate real birth input
    const validation = PastLifeInputEngine.validate(userId, profile, request?.overrides);
    if (!validation.valid || !validation.data) {
      return {
        success: false,
        error: validation.error,
        missingFields: validation.missingFields,
      };
    }

    const input = validation.data;

    // 2. Canonical Calculation Adaptation & Deterministic Fingerprint
    const calculatedSnapshot = PastLifeCalculationAdapter.adapt(input);
    const fingerprint = calculatedSnapshot.fingerprint;

    // 3. Varga Engine (D1, D9 Navamsha, D60 Shashtiamsa)
    const vargaEval = PastLifeVargaEngine.evaluate(calculatedSnapshot);

    // 4. Jaimini Engine (Chara Karakas, Karakamsha)
    const jaiminiEval = PastLifeJaiminiEngine.evaluate(calculatedSnapshot);

    // 5. KP Engine (12th & 8th house cuspal sublords)
    const kpEval = PastLifeKPEngine.evaluate(calculatedSnapshot);

    // 6. Astrology Engine analysis
    const astro = PastLifeAstrologyEngine.analyze(input);

    // 7. Numerology Engine
    const num = PastLifeNumerologyEngine.analyze(input);

    // 8. Karmic synthesis
    const karma = PastLifeKarmaEngine.analyze(astro, num);

    // 9. Classical Vedic & Puranic textual knowledge
    const vedicSources = PastLifeVedicKnowledgeEngine.getReferencesForIndicators(
      astro.atmakarakaData.planet,
      astro.ketuData.house
    );
    const puranaNodes = PastLifePuranicKnowledgeEngine.getPuranicContext(karma.themes[0] || 'Dharma');
    const puranaReferences = puranaNodes.map(p => ({
      sourceId: p.purana.toLowerCase().replace(/\s+/g, '_'),
      title: `${p.purana}: ${p.section}`,
      authorOrTradition: 'Classical Puranic Literature',
      philosophicalTheme: p.corePrinciple,
      provenance: p.provenance,
    }));

    // 10. Multi-system evidence compilation
    const evidence = PastLifeEvidenceEngine.compileEvidence(astro, num);

    // 11. Multi-system convergence matrix
    const convergence = PastLifeConvergenceEngine.evaluateConvergence({
      astroIndicators: astro.indicators,
      vargaSignals: vargaEval.supportingSignals,
      jaiminiSignals: jaiminiEval.signals,
      kpSignals: kpEval.kpSignals,
      numerologyIndicators: num.indicators,
    });

    // 12. Contradiction reasoning
    const contradictionResult = PastLifeContradictionEngine.evaluate(evidence);

    // 13. Confidence determination
    const confidence = PastLifeConfidenceEngine.calculate(
      astro,
      num,
      contradictionResult.isMixedArchetype
    );

    // 14. Archetype pattern matching
    const archetype = PastLifePatternEngine.determineArchetype(
      astro,
      num,
      contradictionResult.isMixedArchetype
    );

    // 15. Calibrated narrative generation
    const narrative = PastLifeNarrativeEngine.generate(
      input.fullName,
      archetype,
      astro,
      num,
      request?.language || 'en'
    );

    // 16. Visual theme and artwork prompt
    const visualTheme = PastLifeVisualThemeEngine.selectTheme(archetype.primary, astro.ketuData.house);
    const artworkPrompt = PastLifeVisualPromptEngine.buildPrompt(
      archetype.primary,
      visualTheme.theme,
      narrative.setting.description,
      astro.atmakarakaData.planet
    );

    // 17. Personalization
    PastLifePersonalizationEngine.personalize(input, karma.themes, karma.connections);

    // Build immutable provenance hash
    const hashData = `${input.userId}_${input.birthDate}_${input.birthTime}_${fingerprint}_${this.VERSION}`;
    const hash = crypto.createHash('sha256').update(hashData).digest('hex').substring(0, 16);
    const readingId = `soul_${Date.now()}_${hash.substring(0, 8)}`;
    const nowIso = new Date().toISOString();

    const schema: PastLifeInsightSchema & {
      convergence: any;
      calculationFingerprint: string;
      vargaEvaluation: any;
      jaiminiEvaluation: any;
      kpEvaluation: any;
    } = {
      id: readingId,
      user_id: input.userId,
      generated_at: nowIso,
      calculation_snapshot_id: `snap_${fingerprint}`,
      calculationFingerprint: fingerprint,
      interpretation_status: 'COMPLETE',
      classification: 'PAST LIFE INSIGHT — TRADITIONAL / SPIRITUAL INTERPRETATION',
      epistemic_notice: 'Past-life insights are traditional spiritual interpretations derived from the user\'s real astronomical birth coordinates and DeepAstro\'s classical calculation core; they are not empirically provable historical records.',
      confidence,
      archetype,
      setting: {
        description: narrative.setting.description,
        environment: narrative.setting.environment,
        period: narrative.setting.period,
        region: narrative.setting.region,
        confidence: confidence.overall,
      },
      role: {
        title: narrative.role.title,
        description: narrative.role.description,
        confidence: confidence.overall,
      },
      user_profile_summary: {
        name: input.fullName,
        birthDate: input.birthDate,
        birthTime: input.birthTime,
        birthPlace: input.birthPlace,
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone,
      },
      themes: Array.from(new Set([...karma.themes, num.primaryVibrationTheme])),
      experiences: [
        `Immersion in ${narrative.setting.environment.toLowerCase()} cultivating contemplative focus.`,
        `Fulfilling community trust through the ethical application of ${astro.atmakarakaData.planet} qualities.`,
        `Encountering transformative trials that spurred inner spiritual inquiry.`,
      ],
      relationships: [
        'Mentorship with demanding yet compassionate classical teachers.',
        'Karmic soul bonds with seekers sharing mutual philosophical aspirations.',
        'Protective responsibility toward companions reflecting Darakaraka themes.',
      ],
      unfinished_lessons: karma.unfinishedLessons,
      karmic_patterns: karma.patterns,
      current_life_connections: karma.connections,
      spiritual_guidance: karma.guidance,
      astrological_indicators: astro.indicators,
      numerology_indicators: num.indicators,
      vedic_references: vedicSources,
      purana_references: puranaReferences,
      contradictions: contradictionResult.contradictions,
      uncertainty_notes: confidence.uncertainty_notes,
      narrative: {
        title: narrative.title,
        summary: narrative.summary,
        story: narrative.story,
        soul_message: narrative.soul_message,
      },
      visual_direction: {
        theme: visualTheme.theme,
        primary_motif: visualTheme.primary_motif,
        palette_accents: visualTheme.palette_accents,
        artwork_prompt: artworkPrompt,
        atmosphere: visualTheme.atmosphere,
      },
      convergence,
      vargaEvaluation: vargaEval,
      jaiminiEvaluation: jaiminiEval,
      kpEvaluation: kpEval,
      provenance: {
        engine_version: this.VERSION,
        calculation_version: '7.0.0',
        knowledge_version: this.KNOWLEDGE_VERSION,
        rag_version: '3.0.0',
        hash,
      },
      version: '2.0',
    };

    // 18. Record audit trail
    PastLifeAuditEngine.record(schema);

    return {
      success: true,
      data: schema,
      provenance: {
        calculationFingerprint: fingerprint,
        sources: [
          'Vedic Ephemeris (Swiss Lahiri)',
          'Jaimini Sutras (Chara Karakas)',
          'KP Cuspal Sublords (12th & 8th Houses)',
          'Navamsha (D9) & Shashtiamsa (D60)',
          'Pythagorean & Vedic Numerology Cycles',
          'Classical Puranic Canon (Vishnu Purana, Bhagavata)',
        ],
        engineVersion: this.VERSION,
        generatedAt: nowIso,
      },
    };
  }

  public static getReading(readingId: string, requestingUserId: string): { success: boolean; data?: PastLifeInsightSchema; error?: string } {
    const reading = PastLifeAuditEngine.getReadingById(readingId);
    if (!reading) {
      return { success: false, error: 'READING_NOT_FOUND' };
    }
    const audit = PastLifeAuditEngine.verifyUserAccess(readingId, requestingUserId);
    if (!audit.allowed) {
      return { success: false, error: 'ACCESS_DENIED' };
    }
    return { success: true, data: reading };
  }

  public static submitFeedback(feedback: PastLifeUserFeedback): { success: boolean; error?: string } {
    PastLifeAuditEngine.recordFeedback(feedback);
    return { success: true };
  }

  public static recordFeedback(feedback: PastLifeUserFeedback): { success: boolean; error?: string } {
    return this.submitFeedback(feedback);
  }

  public static getUserHistory(userId: string): PastLifeInsightSchema[] {
    return PastLifeAuditEngine.getUserReadings(userId);
  }

  public static getObservatoryMetrics(): {
    totalReadings: number;
    feedbackCount: number;
    averageConfidence: string;
    archetypeDistribution: Record<string, number>;
  } {
    return PastLifeAuditEngine.getObservatoryMetrics();
  }
}
