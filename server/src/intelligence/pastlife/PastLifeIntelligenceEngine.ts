import crypto from 'crypto';
import { PastLifeInputEngine, ValidatedPastLifeInput } from './PastLifeInputEngine.js';
import { PastLifeAstrologyEngine } from './PastLifeAstrologyEngine.js';
import { PastLifeNumerologyEngine } from './PastLifeNumerologyEngine.js';
import { PastLifeKarmaEngine } from './PastLifeKarmaEngine.js';
import { PastLifeVedicKnowledgeEngine } from './PastLifeVedicKnowledgeEngine.js';
import { VishnuPuranaKnowledgeAdapter } from './VishnuPuranaKnowledgeAdapter.js';
import { PastLifeEvidenceEngine } from './PastLifeEvidenceEngine.js';
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
  public static readonly VERSION = '1.0.0-soultrace';
  public static readonly KNOWLEDGE_VERSION = '6.0.4-canon';

  public static generate(
    userId: string,
    profile?: Partial<BirthProfileRecord> | null,
    request?: PastLifeGenerationRequest
  ): {
    success: boolean;
    data?: PastLifeInsightSchema;
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

    // 2. Consume immutable calculation core & Jaimini
    const astro = PastLifeAstrologyEngine.analyze(input);

    // 3. Consume numerology engine
    const num = PastLifeNumerologyEngine.analyze(input);

    // 4. Synthesize karmic indicators
    const karma = PastLifeKarmaEngine.analyze(astro, num);

    // 5. Gather authentic textual knowledge
    const vedicSources = PastLifeVedicKnowledgeEngine.getReferencesForIndicators(
      astro.atmakarakaData.planet,
      astro.ketuData.house
    );
    const puranaKnowledge = VishnuPuranaKnowledgeAdapter.getPhilosophicalInsight(karma.themes[0] || 'Dharma');

    // 6. Multi-system evidence compilation
    const evidence = PastLifeEvidenceEngine.compileEvidence(astro, num);

    // 7. Contradiction reasoning
    const contradictionResult = PastLifeContradictionEngine.evaluate(evidence);

    // 8. Confidence determination
    const confidence = PastLifeConfidenceEngine.calculate(
      astro,
      num,
      contradictionResult.isMixedArchetype
    );

    // 9. Archetype pattern matching
    const archetype = PastLifePatternEngine.determineArchetype(
      astro,
      num,
      contradictionResult.isMixedArchetype
    );

    // 10. Generate calibrated narrative
    const narrative = PastLifeNarrativeEngine.generate(
      input.fullName,
      archetype,
      astro,
      num,
      request?.language || 'en'
    );

    // 11. Visual theme and artwork prompt
    const visualTheme = PastLifeVisualThemeEngine.selectTheme(archetype.primary, astro.ketuData.house);
    const artworkPrompt = PastLifeVisualPromptEngine.buildPrompt(
      archetype.primary,
      visualTheme.theme,
      narrative.setting.description,
      astro.atmakarakaData.planet
    );

    // 12. Personalization
    PastLifePersonalizationEngine.personalize(input, karma.themes, karma.connections);

    // Build immutable provenance hash
    const hashData = `${input.userId}_${input.birthDate}_${input.birthTime}_${astro.kundli.fingerprint}_${this.VERSION}`;
    const hash = crypto.createHash('sha256').update(hashData).digest('hex').substring(0, 16);
    const readingId = `soul_${Date.now()}_${hash.substring(0, 8)}`;

    const schema: PastLifeInsightSchema = {
      id: readingId,
      user_id: input.userId,
      generated_at: new Date().toISOString(),
      calculation_snapshot_id: `snap_${astro.kundli.fingerprint}`,
      interpretation_status: 'COMPLETE',
      classification: 'PAST LIFE INSIGHT — TRADITIONAL / SPIRITUAL INTERPRETATION',
      epistemic_notice: 'Past-life insights are traditional spiritual interpretations derived from the user\'s provided birth data and DeepAstro\'s astrological and knowledge systems; they are not verified historical facts.',
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
        'Protective responsibility toward younger or vulnerable companions.',
      ],
      unfinished_lessons: karma.unfinishedLessons,
      karmic_patterns: karma.patterns,
      current_life_connections: karma.connections,
      spiritual_guidance: karma.guidance,
      astrological_indicators: astro.indicators,
      numerology_indicators: num.indicators,
      vedic_references: vedicSources,
      purana_references: puranaKnowledge.references,
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
      provenance: {
        engine_version: this.VERSION,
        calculation_version: '6.0.4',
        knowledge_version: this.KNOWLEDGE_VERSION,
        rag_version: '2.0.0',
        hash,
      },
      version: '1.0',
    };

    // 13. Record audit trail
    PastLifeAuditEngine.record(schema);

    return {
      success: true,
      data: schema,
    };
  }

  public static getReading(readingId: string, requestingUserId: string): { success: boolean; data?: PastLifeInsightSchema; error?: string } {
    const reading = PastLifeAuditEngine.getReadingById(readingId);
    if (!reading) {
      return { success: false, error: 'READING_NOT_FOUND' };
    }
    // IDOR Protection: only reading owner or authorized caller may access
    if (reading.user_id !== requestingUserId) {
      return { success: false, error: 'ACCESS_DENIED' };
    }
    return { success: true, data: reading };
  }

  public static getUserHistory(userId: string): PastLifeInsightSchema[] {
    return PastLifeAuditEngine.getUserReadings(userId);
  }

  public static recordFeedback(feedback: PastLifeUserFeedback): void {
    PastLifeAuditEngine.recordFeedback(feedback);
  }

  public static getObservatoryMetrics() {
    return PastLifeAuditEngine.getObservatoryMetrics();
  }
}
