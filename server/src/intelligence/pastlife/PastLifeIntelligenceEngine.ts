import crypto from 'crypto';
import { PastLifeInputEngine, ValidatedPastLifeInput } from './PastLifeInputEngine.js';
import { PastLifeCalculationAdapter, PastLifeCalculatedSnapshot } from './PastLifeCalculationAdapter.js';
import { PastLifeAstrologyEngine, AstrologyPastLifeAnalysis } from './PastLifeAstrologyEngine.js';
import { PastLifeVargaEngine } from './PastLifeVargaEngine.js';
import { PastLifeJaiminiEngine } from './PastLifeJaiminiEngine.js';
import { PastLifeKPEngine } from './PastLifeKPEngine.js';
import { PastLifeNumerologyEngine, NumerologyPastLifeAnalysis } from './PastLifeNumerologyEngine.js';
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
  public static readonly VERSION = '2.1.0-soultrace';
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
      soulJourneyModules: this.buildSoulJourneyModules(calculatedSnapshot, astro, num, {
        archetype,
        setting: {
          description: narrative.setting.description,
          environment: narrative.setting.environment,
          period: narrative.setting.period,
          region: narrative.setting.region,
        },
        narrative: {
          title: narrative.title,
          summary: narrative.summary,
          story: narrative.story,
          soul_message: narrative.soul_message,
        },
        current_life_connections: karma.connections,
        astrological_indicators: astro.indicators,
        vedic_references: vedicSources,
        purana_references: puranaReferences,
      }),
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

  private static buildSoulJourneyModules(
    snapshot: PastLifeCalculatedSnapshot,
    astro: AstrologyPastLifeAnalysis,
    num: NumerologyPastLifeAnalysis,
    baseContext: {
      archetype: any;
      setting: any;
      narrative: any;
      current_life_connections: any[];
      astrological_indicators: any[];
      vedic_references: any[];
      purana_references: any[];
    }
  ): NonNullable<PastLifeInsightSchema['soulJourneyModules']> {
    const { kundli, atmakaraka, ketuPlacement, rahuPlacement, currentDasha, d9LagnaSign } = snapshot;
    const planets = kundli.planets;
    const saturn: any = planets.find(p => p.name === 'Saturn') || { house: 10, signName: 'Capricorn', degreeInSign: 15 };
    const sun: any = planets.find(p => p.name === 'Sun') || { house: 1, signName: 'Aries', degreeInSign: 10 };
    const moon: any = planets.find(p => p.name === 'Moon') || { house: 4, signName: 'Cancer', degreeInSign: 12 };
    const jupiter: any = planets.find(p => p.name === 'Jupiter') || { house: 9, signName: 'Sagittarius', degreeInSign: 18 };
    const ketu: any = planets.find(p => p.name === 'Ketu') || { house: ketuPlacement.house, signName: ketuPlacement.sign, degreeInSign: 5 };
    const rahu: any = planets.find(p => p.name === 'Rahu') || { house: rahuPlacement.house, signName: rahuPlacement.sign, degreeInSign: 5 };

    // 1. Karmic Patterns Data
    const karmicPatterns = {
      narrative: `Your soul carries deep wisdom from past experiences centered on ${atmakaraka.planet} in ${atmakaraka.sign} (House ${atmakaraka.house}). Certain patterns continue to surface in this life, offering opportunities for completion and spiritual growth.`,
      dominantTheme: {
        planet: 'Saturn',
        sanskritName: 'Shani',
        keywords: 'Discipline • Responsibility • Karmic Maturity',
        explanation: `Saturn in House ${saturn.house} (${saturn.signName}) acts as your soul's karmic anchor, teaching structured endurance, ethical stewardship, and enduring patience across life cycles.`,
      },
      karmicAxis: {
        axis: 'Rahu - Ketu',
        nodes: `Rahu in ${rahuPlacement.sign} (House ${rahuPlacement.house}) • Ketu in ${ketuPlacement.sign} (House ${ketuPlacement.house})`,
        themes: 'Material vs Spiritual Balance • Release & Transcend',
        balance: `Transitioning from past-life comfort in House ${ketuPlacement.house} toward conscious evolutionary integration in House ${rahuPlacement.house}.`,
      },
      keyPatterns: [
        {
          id: 'pattern_1',
          theme: 'Authority & Responsibility',
          evidence: `Past life experiences with power, control and duty (Sun in ${sun.signName}, House ${sun.house} & Saturn in House ${saturn.house}).`,
          strength: (saturn.house === 10 || saturn.house === 1 || sun.house === 10 || sun.house === 1) ? ('Strong' as const) : ('Moderate' as const),
          icon: 'Shield',
        },
        {
          id: 'pattern_2',
          theme: 'Emotional Detachment',
          evidence: `Tendency to withdraw emotionally in relationships to safeguard inner sanctum (Ketu in House ${ketuPlacement.house}, Moon in House ${moon.house}).`,
          strength: (ketuPlacement.house === 4 || ketuPlacement.house === 12 || moon.house === 12 || moon.house === 8) ? ('Strong' as const) : ('Moderate' as const),
          icon: 'Orbit',
        },
        {
          id: 'pattern_3',
          theme: 'Service & Healing',
          evidence: `Karmic inclination towards helping and healing others through disciplined practice (6th/12th axis & ${jupiter.signName} resonance).`,
          strength: (ketuPlacement.house === 6 || jupiter.house === 6 || jupiter.house === 12 || saturn.house === 6) ? ('Strong' as const) : ('Strong' as const),
          icon: 'Flower2',
        },
        {
          id: 'pattern_4',
          theme: 'Spiritual Seeking',
          evidence: `Deep past life practice in spirituality, sacred wisdom, and contemplative insight (Atmakaraka ${atmakaraka.planet} in House ${atmakaraka.house}).`,
          strength: (ketuPlacement.house === 12 || ketuPlacement.house === 9 || ketuPlacement.house === 8 || atmakaraka.house === 9 || atmakaraka.house === 12) ? ('Strong' as const) : ('Moderate' as const),
          icon: 'Sparkles',
        },
        {
          id: 'pattern_5',
          theme: 'Material Attachment',
          evidence: `Lessons around conscious stewardship and letting go of material possessions (Rahu in House ${rahuPlacement.house}, ${rahuPlacement.sign}).`,
          strength: (rahuPlacement.house === 2 || rahuPlacement.house === 11) ? ('Moderate' as const) : ('Mild' as const),
          icon: 'Compass',
        },
      ],
      relatedPlanets: [
        {
          name: 'Saturn',
          signification: 'Karmic Lessons',
          house: saturn.house,
          sign: saturn.signName,
          degree: typeof saturn.degreeInSign === 'number' ? Number(saturn.degreeInSign.toFixed(1)) : 15,
        },
        {
          name: 'Rahu',
          signification: 'Worldly Desires',
          house: rahuPlacement.house,
          sign: rahuPlacement.sign,
          degree: typeof rahu.degreeInSign === 'number' ? Number(rahu.degreeInSign.toFixed(1)) : 10,
        },
        {
          name: 'Ketu',
          signification: 'Spiritual Liberation',
          house: ketuPlacement.house,
          sign: ketuPlacement.sign,
          degree: typeof ketu.degreeInSign === 'number' ? Number(ketu.degreeInSign.toFixed(1)) : 10,
        },
      ],
      influencedHouses: [
        {
          house: 4,
          title: 'Home & Roots',
          significance: 'Inner psychological tranquility, mother lineage, and emotional anchor.',
        },
        {
          house: 8,
          title: 'Transformation',
          significance: 'Hidden karmic resolution, esoteric learning, and deep psychological rebirth.',
        },
        {
          house: 10,
          title: 'Career & Duty',
          significance: 'Dharmic duty, public contribution, and the ethical use of vocational power.',
        },
        {
          house: 12,
          title: 'Spirituality',
          significance: 'Moksha, sacred solitude, and dissolution of lingering subconscious debts.',
        },
      ],
      insightQuote: {
        quote: 'Your challenges are not punishments, but invitations to become the highest version of your soul.',
        author: 'DEEPASTRO',
      },
    };

    // 2. Past Life Influences Data
    const pastLifeInfluences = {
      archetype: baseContext.archetype.primary.replace(/_/g, ' '),
      setting: baseContext.setting,
      narrative: baseContext.narrative,
      currentLifeConnections: baseContext.current_life_connections,
      astrologicalIndicators: baseContext.astrological_indicators,
      vedicReferences: baseContext.vedic_references,
      puranaReferences: baseContext.purana_references,
    };

    // 3. Soul Lessons Data
    const soulLessons = {
      primaryLesson: {
        title: astro.atmakarakaData.soulLesson,
        reason: `Derived from Atmakaraka ${atmakaraka.planet} in ${atmakaraka.sign} (House ${atmakaraka.house}), holding the highest sidereal degree in your chart.`,
        indicators: [
          `Atmakaraka: ${atmakaraka.planet} (${atmakaraka.sign} ${atmakaraka.degrees.toFixed(2)}°)`,
          `House: ${atmakaraka.house}`,
          `Navamsha (D9) Lagna: ${d9LagnaSign}`,
        ],
      },
      secondaryLessons: [
        {
          title: 'Patient Endurance & Duty Without Resentment',
          reason: `Anchored by Saturn in House ${saturn.house} (${saturn.signName}).`,
          indicators: [`Saturn: House ${saturn.house}`, `Karmic Duty: ${saturn.signName}`],
        },
        {
          title: `Transcending Attachment to Comfort in House ${ketuPlacement.house}`,
          reason: `Ketu in ${ketuPlacement.sign} (${ketuPlacement.nakshatra}) signifies mastery that must not become a refuge from present dharma.`,
          indicators: [`Ketu: House ${ketuPlacement.house}`, `Nakshatra: ${ketuPlacement.nakshatra}`],
        },
        {
          title: `Embracing Conscious Evolution in House ${rahuPlacement.house}`,
          reason: `Rahu in ${rahuPlacement.sign} represents the unfamiliar edge of personal growth in this life cycle.`,
          indicators: [`Rahu: House ${rahuPlacement.house}`, `Sign: ${rahuPlacement.sign}`],
        },
      ],
      supportingPlanets: [
        { planet: atmakaraka.planet, role: 'Atmakaraka (Soul Guide)', placement: `${atmakaraka.sign} House ${atmakaraka.house}` },
        { planet: 'Saturn', role: 'Karmic Taskmaster', placement: `${saturn.signName} House ${saturn.house}` },
        { planet: 'Ketu', role: 'Past Life Anchor', placement: `${ketuPlacement.sign} House ${ketuPlacement.house}` },
        { planet: 'Rahu', role: 'Evolutionary Edge', placement: `${rahuPlacement.sign} House ${rahuPlacement.house}` },
      ],
      supportingHouses: [atmakaraka.house, ketuPlacement.house, rahuPlacement.house, 12],
      dashaContext: `Current Vimshottari period: ${currentDasha.mahadasha} Mahadasha with ${currentDasha.antardasha} Antardasha accelerates the conscious integration of this soul lesson.`,
      practicalReflection: 'Reflect upon recurring moments where you are invited to respond with patient integrity rather than reflexive defense. Every conscious choice dissolves historical inertia.',
    };

    // 4. Life Purpose Data
    const amk = snapshot.charaKarakas.find(k => k.karaka.includes('Amatyakaraka'))?.planet || 'Mercury';
    const ascSign = kundli.ascendant.details?.signName || kundli.houses[0]?.signName || 'Aries';
    const lifePurpose = {
      coreDirection: {
        title: `Dharmic Alignment of ${atmakaraka.planet} & ${ascSign} Lagna`,
        explanation: `Your soul has chosen this embodiment to unite the instinctual vitality of ${ascSign} Lagna with the ethical clarity of Atmakaraka ${atmakaraka.planet}. Your highest purpose unfolds when your daily actions serve both personal truth and collective benefit.`,
        indicators: [
          `Ascendant: ${ascSign} (${kundli.ascendant.degrees.toFixed(2)}°)`,
          `Atmakaraka: ${atmakaraka.planet} in House ${atmakaraka.house}`,
          `Amatyakaraka: ${amk}`,
        ],
      },
      careerAndContribution: {
        title: `Vocational Mastery Governed by ${amk} & 10th House (${kundli.houses[9]?.signName || 'Duty'})`,
        explanation: `Your vocational dharma thrives when work involves depth, problem-solving, ethical leadership, and mentorship rather than superficial compliance.`,
        indicators: [
          `Amatyakaraka (Career Signifier): ${amk}`,
          `10th House Cusp: ${kundli.houses[9]?.signName || 'Capricorn'} (Lord: ${kundli.houses[9]?.lord || 'Saturn'})`,
        ],
      },
      growthDirection: {
        title: `Evolutionary Leap: Expanding Into House ${rahuPlacement.house} (${rahuPlacement.sign})`,
        explanation: `Your soul's frontier requires courageous engagement with ${rahuPlacement.sign} themes in House ${rahuPlacement.house}, cultivating authentic worldly contribution while staying rooted in your spiritual center.`,
        indicators: [
          `Rahu Placement: House ${rahuPlacement.house}`,
          `Sign & Nakshatra: ${rahuPlacement.sign} (${rahuPlacement.nakshatra})`,
        ],
      },
      currentDashaContext: `Active ${currentDasha.mahadasha} / ${currentDasha.antardasha} period triggers pivotal opportunities for aligning career and deeper spiritual dharma.`,
      transitContext: `Major planetary transits across your ${atmakaraka.sign} and ${ascSign} axis provide cosmic tailwinds for stepping into authentic purpose.`,
      practicalReflection: 'True purpose is not an external destination to reach, but an inner frequency of conscious dedication brought to everything you touch.',
    };

    return {
      karmicPatterns,
      pastLifeInfluences,
      soulLessons,
      lifePurpose,
    };
  }
}
