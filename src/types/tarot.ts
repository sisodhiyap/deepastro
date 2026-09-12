/**
 * DeepAstro Tarot Engine Type Definitions
 * Strict contracts for the 78-card Tarot deck, cryptographic draws,
 * astrological correspondences, and synthesis interpretation engine.
 */

export type TarotArcana = 'major' | 'minor';
export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type TarotOrientation = 'upright' | 'reversed';
export type TarotPosition = 'root' | 'present' | 'direction';

export type TarotElement = 'Fire' | 'Water' | 'Air' | 'Earth' | 'Spirit' | string;

export interface TarotMeaningDetail {
  keywords: string[];
  meaning: string;
  love: string;
  career: string;
  finance: string;
  spirituality: string;
  advice: string;
}

export interface TarotCorrespondence {
  astrologicalSign?: string;
  planet?: string;
  element: TarotElement;
  vedicAnalogy?: string; // Vedic graha or devata archetype
  vedicGuna: 'Sattva' | 'Rajas' | 'Tamas' | string;
  chakra?: string;
}

export interface TarotCard {
  id: string;
  name: string;
  arcana: TarotArcana;
  suit?: TarotSuit;
  number: number;
  element: TarotElement;
  planet?: string;
  zodiac?: string;
  numerology: string;
  archetype: string;
  keywords: string[];
  symbolicPrompt: string;
  iconSymbol: string; // Unicode or SVG symbolic glyph
  gradient: string;   // Card theme styling
  upright: TarotMeaningDetail;
  reversed: TarotMeaningDetail;
  correspondences: TarotCorrespondence;
}

export interface TarotDraw {
  card: TarotCard;
  orientation: TarotOrientation;
  position: TarotPosition;
  positionTitle: string;
  positionPrompt: string;
}

export interface AstroTarotContext {
  dominantTheme: string;
  secondaryTheme: string;
  emotionalTheme: string;
  spiritualTheme: string;
  sunSign?: string;
  moonSign?: string;
  ascendant?: string;
  activeTransitGraha?: string;
  moonPhase?: string;
  confidence: number;
}

export interface TarotPatternAnalysis {
  majorCount: number;
  minorCount: number;
  suitCounts: {
    wands: number;
    cups: number;
    swords: number;
    pentacles: number;
  };
  elementCounts: Record<string, number> & {
    Fire: number;
    Water: number;
    Air: number;
    Earth: number;
    Spirit: number;
  };
  uprightCount: number;
  reversedCount: number;
  dominantTheme: string;
  elementalBalance: string;
}

export interface TarotInterpretation {
  story: string;
  narrativeStory?: string;
  cosmicCrossReading: string;
  keyMessage: string;
  reflectionQuestion: string;
  actionStep: string;
  patternAnalysis: TarotPatternAnalysis;
  relevance: 'High' | 'Very High' | 'Exceptional';
}

export interface TarotSession {
  sessionId: string;
  userId: string;
  question: string;
  questionCategory: string;
  drawnCards: TarotDraw[];
  astroContext: AstroTarotContext;
  interpretation: TarotInterpretation;
  createdAt: string;
  favorite?: boolean;
  isFavorite?: boolean;
  notes?: string;
  userNote?: string;
  cards?: any[];
}

export type TarotQuestionCategory =
  | 'GENERAL LIFE'
  | 'LOVE & RELATIONSHIPS'
  | 'CAREER & PURPOSE'
  | 'FINANCE & ABUNDANCE'
  | 'FAMILY & HARMONY'
  | 'DECISION & CROSSROADS'
  | 'PERSONAL GROWTH'
  | 'SPIRITUALITY'
  | 'TODAY\'S ENERGY' | 'TODAY’S ENERGY'
  | 'FUTURE DIRECTION'
  | 'SURPRISE ME';

export type TarotSavedReading = TarotSession & { cards?: any[] };
