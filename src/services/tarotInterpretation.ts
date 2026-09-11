import {
  TarotDraw,
  AstroTarotContext,
  TarotQuestionCategory,
  TarotInterpretation,
  TarotPatternAnalysis,
} from '../types/tarot.js';

/**
 * DeepAstro Tarot Interpretation Engine
 * Synthesizes three-card progressions, cross-references with astrological snapshots,
 * conducts elemental pattern analysis, and generates reflective, non-deterministic guidance.
 */

export const generateTarotInterpretation = (
  drawnCards: TarotDraw[],
  astroContext: AstroTarotContext,
  category: TarotQuestionCategory,
  question: string
): TarotInterpretation => {
  const [root, present, direction] = drawnCards;

  // 1. Conduct Pattern Analysis
  const patternAnalysis = analyzeSpreadPatterns(drawnCards);

  // 2. Build Narrative Story (Card 1 -> Card 2 -> Card 3)
  const story = buildThreeCardNarrative(root, present, direction, category);

  // 3. Cosmic Cross-Reading (Astro Context + Tarot Archetypes)
  const cosmicCrossReading = buildCosmicCrossReading(drawnCards, astroContext, category);

  // 4. Key Message & Action Step
  const keyMessage = buildKeyMessage(present, direction, category);
  const actionStep = buildActionStep(direction, category);
  const reflectionQuestion = buildReflectionQuestion(present, direction, category);

  // 5. Calculate Relevance
  let relevance: 'High' | 'Very High' | 'Exceptional' = 'High';
  if (patternAnalysis.majorCount >= 2 || patternAnalysis.elementalBalance.includes('Dominant')) {
    relevance = 'Very High';
  }
  if (patternAnalysis.majorCount === 3) {
    relevance = 'Exceptional';
  }

  return {
    story,
    cosmicCrossReading,
    keyMessage,
    reflectionQuestion,
    actionStep,
    patternAnalysis,
    relevance,
  };
};

/**
 * Analyze Spread Patterns (Major Arcana count, suit balance, elemental dominance)
 */
export const analyzeSpreadPatterns = (drawnCards: TarotDraw[]): TarotPatternAnalysis => {
  let majorCount = 0;
  let minorCount = 0;
  let uprightCount = 0;
  let reversedCount = 0;

  const suitCounts = {
    wands: 0,
    cups: 0,
    swords: 0,
    pentacles: 0,
  };

  const elementCounts = {
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0,
    Spirit: 0,
  };

  for (const draw of drawnCards) {
    if (draw.card.arcana === 'major') {
      majorCount++;
    } else {
      minorCount++;
      if (draw.card.suit) {
        suitCounts[draw.card.suit]++;
      }
    }

    if (draw.orientation === 'upright') {
      uprightCount++;
    } else {
      reversedCount++;
    }

    if (draw.card.element && elementCounts[draw.card.element] !== undefined) {
      elementCounts[draw.card.element]++;
    }
  }

  // Determine dominant theme
  let dominantTheme = 'Balanced Elemental Influx';
  if (majorCount >= 2) {
    dominantTheme = 'Profound Archetypal / Dharmic Crossroads';
  } else if (suitCounts.wands >= 2) {
    dominantTheme = 'Active Fire: Initiative, Passion & Creative Momentum';
  } else if (suitCounts.cups >= 2) {
    dominantTheme = 'Deep Water: Intuition, Emotional Truth & Relational Flow';
  } else if (suitCounts.swords >= 2) {
    dominantTheme = 'Sharp Air: Mental Discernment, Clarity & Strategic Truth';
  } else if (suitCounts.pentacles >= 2) {
    dominantTheme = 'Grounded Earth: Material Manifestation, Stability & Wealth';
  }

  // Determine elemental balance description
  const elementsPresent = Object.entries(elementCounts)
    .filter(([_, count]) => count > 0)
    .map(([el, count]) => `${el} (${count})`)
    .join(', ');

  const elementalBalance = `${elementsPresent} — ${reversedCount > 0 ? `${reversedCount} card(s) internalized/reversed` : 'All cards direct/upright'}`;

  return {
    majorCount,
    minorCount,
    suitCounts,
    elementCounts,
    uprightCount,
    reversedCount,
    dominantTheme,
    elementalBalance,
  };
};

/**
 * Three-Card Narrative Progression
 */
const buildThreeCardNarrative = (
  root: TarotDraw,
  present: TarotDraw,
  direction: TarotDraw,
  category: TarotQuestionCategory
): string => {
  const rootOrientationText = root.orientation === 'upright' ? 'in its direct flow' : 'in an internalized or blocked state';
  const presentOrientationText = present.orientation === 'upright' ? 'radiating clearly' : 'inviting deep introspection';
  const directionOrientationText = direction.orientation === 'upright' ? 'points toward' : 'cautions against unexamined';

  const rootMeaning = root.orientation === 'upright' ? root.card.upright.meaning : root.card.reversed.meaning;
  const presentMeaning = present.orientation === 'upright' ? present.card.upright.meaning : present.card.reversed.meaning;
  const directionMeaning = direction.orientation === 'upright' ? direction.card.upright.meaning : direction.card.reversed.meaning;

  return `The energetic foundation of this reading is anchored in **${root.card.name}** (${root.positionTitle}, ${rootOrientationText}). ${rootMeaning} This indicates that recent events have been fundamentally conditioned by the archetype of ${root.card.archetype.toLowerCase()}.

At the present center of your field emerges **${present.card.name}** (${present.positionTitle}, ${presentOrientationText}). ${presentMeaning} Here, the energy shifts from historical momentum into immediate consciousness, asking you to witness where your attention is currently invested.

Finally, the arc of your inquiry transitions into **${direction.card.name}** (${direction.positionTitle}, ${directionOrientationText}). Rather than a rigid predetermined destiny, this card ${directionMeaning} It offers the most harmonious trajectory should you consciously align with the wisdom revealed across this three-card sequence.`;
};

/**
 * Cosmic Cross-Reading: Distinct Astrological Grounding + Tarot Symbolism
 */
const buildCosmicCrossReading = (
  drawnCards: TarotDraw[],
  astroContext: AstroTarotContext,
  category: TarotQuestionCategory
): string => {
  const transitGraha = astroContext.activeTransitGraha || 'Brihaspati';
  const moonPhase = astroContext.moonPhase || 'Waxing Moon';
  const moonSign = astroContext.moonSign || 'Chandra';
  const dominantTheme = astroContext.dominantTheme || 'Evolution';

  const majorCard = drawnCards.find((d) => d.card.arcana === 'major');
  const anchorCard = majorCard || drawnCards[1];

  const vedicAnalogy = anchorCard.card.correspondences.vedicAnalogy || 'Dharmic reflection';
  const vedicGuna = anchorCard.card.correspondences.vedicGuna || 'Sattva';

  return `**Astrological Context (Deterministic Observation):**
Your celestial coordinates indicate an active transit influence under **${transitGraha}** during the **${moonPhase}**, with natal lunar resonance in **${moonSign}**. The dominant cosmic environment emphasizes **${dominantTheme}**.

**Tarot Mirror (Reflective Archetype):**
In direct resonance with this astronomical weather, the appearance of **${anchorCard.card.name}** brings forth the classical archetype of ${vedicAnalogy}. In Vedic philosophy, this operates through the qualitative frequency of **${vedicGuna} Guna**.

**The Synthesis:**
While planetary transits describe the ambient cosmic weather of your life, the Tarot cards reveal how your personal awareness is currently responding to that weather. The convergence of ${transitGraha}’s expansive gaze with ${anchorCard.card.name}’s symbolism emphasizes that outward progress will occur in direct proportion to your inner clarity.`;
};

/**
 * Key Message Synthesis
 */
const buildKeyMessage = (
  present: TarotDraw,
  direction: TarotDraw,
  category: TarotQuestionCategory
): string => {
  const pAdvice = present.orientation === 'upright' ? present.card.upright.advice : present.card.reversed.advice;
  const dAdvice = direction.orientation === 'upright' ? direction.card.upright.advice : direction.card.reversed.advice;

  return `"${pAdvice} Look toward ${direction.card.name}: ${dAdvice.toLowerCase()}"`;
};

/**
 * Recommended Action Step
 */
const buildActionStep = (
  direction: TarotDraw,
  category: TarotQuestionCategory
): string => {
  const advice = direction.orientation === 'upright' ? direction.card.upright.advice : direction.card.reversed.advice;
  return `Consciously embody ${direction.card.name} (${direction.orientation.toUpperCase()}): ${advice}`;
};

/**
 * Thoughtful Reflection Question
 */
const buildReflectionQuestion = (
  present: TarotDraw,
  direction: TarotDraw,
  category: TarotQuestionCategory
): string => {
  return `What is ${present.card.name} asking you to honestly acknowledge right now, so that ${direction.card.name} can unfold without resistance?`;
};
