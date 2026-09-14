import { AstrologyPastLifeAnalysis } from './PastLifeAstrologyEngine.js';
import { NumerologyPastLifeAnalysis } from './PastLifeNumerologyEngine.js';
import { PastLifeKarmicPattern, PastLifeCurrentLifeConnection, PastLifeSpiritualGuidance } from './PastLifeTypes.js';

export class PastLifeKarmaEngine {
  public static analyze(
    astro: AstrologyPastLifeAnalysis,
    num: NumerologyPastLifeAnalysis
  ): {
    patterns: PastLifeKarmicPattern[];
    connections: PastLifeCurrentLifeConnection[];
    guidance: PastLifeSpiritualGuidance[];
    themes: string[];
    unfinishedLessons: string[];
  } {
    const patterns: PastLifeKarmicPattern[] = [];
    const themes: string[] = [];
    const unfinishedLessons: string[] = [];

    // 1. Ketu house analysis
    const kh = astro.ketuData.house;
    if (kh === 12 || kh === 8 || kh === 4) {
      patterns.push({
        pattern: 'Moksha & Solitary Contemplation',
        debt_or_blessing: 'BLESSING',
        current_life_expression: 'Natural inclination toward meditation, quiet spaces, deep introspection, and spiritual philosophy.',
        resolution_path: 'Honoring spiritual solitude without neglecting daily practical responsibilities.',
      });
      themes.push('Spiritual Solitude', 'Contemplative Discernment');
    } else if (kh === 10 || kh === 1 || kh === 9) {
      patterns.push({
        pattern: 'Dharmic Leadership & Public Service',
        debt_or_blessing: 'BLESSING',
        current_life_expression: 'Instinctive capacity to organize, guide, and accept moral responsibility for groups.',
        resolution_path: 'Serving as a humble guide rather than seeking personal acclaim or credit.',
      });
      themes.push('Ethical Guidance', 'Dharmic Stewardship');
    } else if (kh === 2 || kh === 6 || kh === 10) {
      patterns.push({
        pattern: 'Selfless Labor & Duty (Seva)',
        debt_or_blessing: 'NEUTRAL_CYCLE',
        current_life_expression: 'Strong dedication to detail, duty, and helping those facing hardship.',
        resolution_path: 'Practicing service with joy rather than feelings of burdened obligation.',
      });
      themes.push('Devoted Service', 'Practical Craftsmanship');
    } else {
      patterns.push({
        pattern: 'Knowledge Sharing & Cultural Exploration',
        debt_or_blessing: 'BLESSING',
        current_life_expression: 'Innate curiosity regarding ancient wisdom, sacred sciences, and cross-cultural truths.',
        resolution_path: 'Translating intellectual understanding into compassionate real-world action.',
      });
      themes.push('Knowledge Stewardship', 'Philosophical Inquisitiveness');
    }

    // 2. Atmakaraka lesson
    unfinishedLessons.push(astro.atmakarakaData.soulLesson);

    // 3. Karmic Debts from numerology
    if (num.karmicNumbers.length > 0) {
      patterns.push({
        pattern: `Karmic Cycle ${num.karmicNumbers[0]}`,
        debt_or_blessing: 'DEBT',
        current_life_expression: 'Recurring lessons that invite deeper emotional balance, humility, and steadfast integrity.',
        resolution_path: 'Conscious ethical action and patience when temporary obstacles arise.',
      });
    }

    // 4. Current life connections
    const connections: PastLifeCurrentLifeConnection[] = [
      {
        area: 'career',
        symbolic_connection: `Your Ketu in House ${astro.ketuData.house} and Atmakaraka in ${astro.atmakarakaData.signName} suggest vocational success when work involves depth, ethics, and independent problem-solving.`,
        actionable_guidance: 'Choose roles where intellectual or creative integrity is valued over purely political maneuvering.',
      },
      {
        area: 'relationships',
        symbolic_connection: `The Rahu-Ketu nodal axis reflects a transition from solitary focus toward meaningful, mutually supportive partnerships in this lifetime.`,
        actionable_guidance: 'Cultivate open emotional presence; avoid retreating into defensive emotional self-reliance.',
      },
      {
        area: 'learning',
        symbolic_connection: `Strong 5th/8th house resonance provides an affinity for symbolic languages, classical wisdom, astronomy, psychology, and spiritual literature.`,
        actionable_guidance: 'Study foundational texts systematically; intuitive insights will unlock rapidly upon disciplined study.',
      },
      {
        area: 'spirituality',
        symbolic_connection: `Atmakaraka ${astro.atmakarakaData.planet} calls for an authentic spiritual path grounded in inner truth rather than external dogma.`,
        actionable_guidance: 'Dedicate daily quiet time to breathwork, prayer, or contemplative silence at dawn or dusk.',
      },
      {
        area: 'life_purpose',
        symbolic_connection: `Your Life Path vibration (${num.lifePath}) harmonizes with your soul lesson: bridging personal wisdom with public benefit.`,
        actionable_guidance: 'Allow your lived experience to guide and encourage those navigating similar spiritual questions.',
      },
    ];

    // 5. Spiritual Guidance / Remedies
    const guidance: PastLifeSpiritualGuidance[] = [
      {
        category: 'reflection',
        guidance: `Regular contemplation on the qualities of ${astro.atmakarakaData.planet}: cultivating patience, non-attachment, and clarity.`,
        traditional_context: 'Classical Jaimini tradition recommends honoring the deity or ethical ideal associated with the Atmakaraka.',
      },
      {
        category: 'charity',
        guidance: 'Offering support to educational initiatives, libraries, elderly care, or animal sanctuaries on Saturdays or Thursdays.',
        traditional_context: 'Puranic Dana (selfless charity) cleanses past residual karmic obligations without ritualistic coercion.',
      },
      {
        category: 'service',
        guidance: 'Engaging in Seva (selfless community service) where no public recognition is sought or received.',
        traditional_context: 'The Bhagavad Gita identifies Nishkama Karma as the ultimate purifier of accumulated impressions.',
      },
    ];

    return {
      patterns,
      connections,
      guidance,
      themes,
      unfinishedLessons,
    };
  }
}
