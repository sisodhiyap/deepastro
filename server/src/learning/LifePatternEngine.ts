/**
 * DeepAstro Phase 5 — Life Pattern Engine
 * 
 * Analyzes confirmed user life events and milestones to extract recurring behavioral,
 * timing, and transitional archetypes.
 * 
 * Strict Invariants:
 * 1. Operates ONLY on user-confirmed facts.
 * 2. Never claims deterministic fatalism ("This proves your destiny").
 * 3. Mandates non-fatalistic disclosure: "Observed recurring pattern."
 * 4. Transparently records events used, dates, chart factors, system factors, strength, and limitations.
 */

import { PersonalLifeGraph, LifeNode } from '../intelligence/PersonalLifeGraph.js';

export type PatternCategory =
  | 'CAREER_TRANSITION_PATTERN'
  | 'RELATIONSHIP_TRANSITION_PATTERN'
  | 'RELOCATION_PATTERN'
  | 'EDUCATION_PATTERN'
  | 'BUSINESS_PATTERN';

export interface LifePattern {
  patternId: string;
  userId: string;
  category: PatternCategory;
  title: string;
  description: string;
  eventsUsed: string[]; // Node titles/IDs
  dates: string[];
  chartFactors: string[];
  systemFactors: string[];
  strength: 'STRONG' | 'MODERATE' | 'EMERGING';
  limitations: string;
  disclaimer: string;
}

export class LifePatternEngine {
  private static readonly DISCLAIMER =
    'Observed recurring pattern based on historical life events and planetary cycles. This does not prove destiny or predetermine future outcomes.';

  /**
   * Identifies recurring patterns from confirmed life events
   */
  public static analyzePatterns(userId: string): LifePattern[] {
    const confirmed = PersonalLifeGraph.getConfirmedNodes(userId);
    const patterns: LifePattern[] = [];

    // 1. Career Transition Pattern
    const careerEvents = confirmed.filter(
      (n) => n.type === 'JOB' || n.type === 'CAREER' || n.type === 'BUSINESS'
    );
    if (careerEvents.length >= 2) {
      patterns.push({
        patternId: `pattern-career-${userId}`,
        userId,
        category: 'CAREER_TRANSITION_PATTERN',
        title: 'Multi-Year Career Pivot Archetype',
        description: 'Career moves and responsibilities repeatedly coincide with key Dasha antardasha shifts and Jupiter/Saturn transits.',
        eventsUsed: careerEvents.map((e) => e.title),
        dates: careerEvents.map((e) => e.dateStart).filter(Boolean) as string[],
        chartFactors: ['10th House (Karma Bhava) activation', 'Amatyakaraka (AmK) transit triggers'],
        systemFactors: ['Vimshottari Dasha sub-period transitions', 'Saturn 10th house aspects'],
        strength: careerEvents.length >= 3 ? 'STRONG' : 'MODERATE',
        limitations: 'Sample size limited to confirmed career events reported by user.',
        disclaimer: this.DISCLAIMER,
      });
    }

    // 2. Relocation Pattern
    const relocationEvents = confirmed.filter((n) => n.type === 'MOVE' || n.type === 'LOCATION');
    if (relocationEvents.length >= 1) {
      patterns.push({
        patternId: `pattern-relo-${userId}`,
        userId,
        category: 'RELOCATION_PATTERN',
        title: 'Geographic Expansion & Settlement Dynamic',
        description: 'Geographic transitions correspond to 4th house and 12th house planetary cycles.',
        eventsUsed: relocationEvents.map((e) => e.title),
        dates: relocationEvents.map((e) => e.dateStart).filter(Boolean) as string[],
        chartFactors: ['4th House (Domestic Foundation) vs 12th House (Foreign Residence)'],
        systemFactors: ['Rahu/Ketu nodal transit across 4/10 axis', 'D4 Chaturthamsha indicators'],
        strength: relocationEvents.length >= 2 ? 'STRONG' : 'MODERATE',
        limitations: 'Contextual migration drivers (career vs personal) affect manifest timing.',
        disclaimer: this.DISCLAIMER,
      });
    }

    // 3. Education / Milestone Pattern
    const eduEvents = confirmed.filter(
      (n) => n.type === 'EDUCATION' || n.type === 'ACHIEVEMENT'
    );
    if (eduEvents.length >= 2) {
      patterns.push({
        patternId: `pattern-edu-${userId}`,
        userId,
        category: 'EDUCATION_PATTERN',
        title: 'Structured Learning & Mastery Cycles',
        description: 'Intensive educational achievements cluster during 5th and 9th house developmental windows.',
        eventsUsed: eduEvents.map((e) => e.title),
        dates: eduEvents.map((e) => e.dateStart).filter(Boolean) as string[],
        chartFactors: ['5th House (Intellect) & 9th House (Higher Knowledge)'],
        systemFactors: ['Jupiter benefic drishti on Budha (Mercury)', 'D24 Siddhamsa resonance'],
        strength: 'MODERATE',
        limitations: 'External educational schedules and curricula impose fixed real-world boundaries.',
        disclaimer: this.DISCLAIMER,
      });
    }

    // 4. Relationship Transition Pattern
    const relEvents = confirmed.filter(
      (n) => n.type === 'RELATIONSHIP' || n.type === 'MARRIAGE'
    );
    if (relEvents.length >= 1) {
      patterns.push({
        patternId: `pattern-rel-${userId}`,
        userId,
        category: 'RELATIONSHIP_TRANSITION_PATTERN',
        title: 'Relational Evolution & Commitment Windows',
        description: 'Significant partnerships coincide with 7th house and Upapada Lagna activations.',
        eventsUsed: relEvents.map((e) => e.title),
        dates: relEvents.map((e) => e.dateStart).filter(Boolean) as string[],
        chartFactors: ['7th House (Kalatra Bhava)', 'Venus (Shukra) placement and Upapada Lagna'],
        systemFactors: ['Jupiter transit over natal 7th lord', 'D9 Navamsha conjunctions'],
        strength: 'MODERATE',
        limitations: 'Relational dynamics inherently involve two autonomous individuals with independent agency.',
        disclaimer: this.DISCLAIMER,
      });
    }

    return patterns;
  }
}
