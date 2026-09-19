import {
  TarotCard,
  TarotDraw,
  TarotPosition,
  TarotOrientation,
  AstroTarotContext,
  TarotQuestionCategory,
  TarotSession,
} from '../types/tarot.js';
import { TAROT_DECK, VERIFY_TAROT_DECK } from '../data/tarotDeck.js';
import { generateTarotInterpretation } from './tarotInterpretation.js';

/**
 * DeepAstro Tarot Engine
 * Cryptographically secure randomized card draws, subtle astrology-weighted
 * probability modulation, and strict validation.
 */

// Generate cryptographically secure random float [0, 1) using Web Crypto or Node Crypto
export const getSecureRandom = (): number => {
  const globalCrypto = typeof globalThis !== 'undefined' ? (globalThis as any).crypto : (typeof window !== 'undefined' ? (window as any).crypto : undefined);
  if (globalCrypto && typeof globalCrypto.getRandomValues === 'function') {
    const array = new Uint32Array(1);
    globalCrypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }
  return 0.5;
};

// Generate cryptographically secure random integer [min, max]
export const getSecureRandomInt = (min: number, max: number): number => {
  return Math.floor(getSecureRandom() * (max - min + 1)) + min;
};

// Simple DJB2-based hash for generating reproducible session seeds
export const hashString = (str: string): string => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

export interface DrawOptions {
  userId?: string;
  question?: string;
  category?: TarotQuestionCategory;
  astroContext?: AstroTarotContext;
  applyAstroWeighting?: boolean; // Default true, max ±12%
}

/**
 * Three-Card Spread Positions
 */
export const SPREAD_POSITIONS: {
  position: TarotPosition;
  title: string;
  prompt: string;
}[] = [
  {
    position: 'root',
    title: 'ROOT / PAST',
    prompt: 'What energy has shaped and grounded this situation?',
  },
  {
    position: 'present',
    title: 'PRESENT / NOW',
    prompt: 'What energy surrounds your consciousness right now?',
  },
  {
    position: 'direction',
    title: 'DIRECTION / NEXT',
    prompt: 'What likely path or guidance should you consciously consider?',
  },
];

/**
 * Default Astrological Context if user profile is pending
 */
export const DEFAULT_ASTRO_CONTEXT: AstroTarotContext = {
  dominantTheme: 'Spiritual Awakening & Purpose',
  secondaryTheme: 'Material Mastery & Resource Flow',
  emotionalTheme: 'Clarity & Discernment',
  spiritualTheme: 'Dharmic Alignment',
  sunSign: 'Surya (Solar Consciousness)',
  moonSign: 'Chandra (Intuitive Mind)',
  ascendant: 'Lagna (Soul Vessel)',
  activeTransitGraha: 'Brihaspati (Jupiter)',
  moonPhase: 'Shukla Paksha (Waxing Light)',
  confidence: 0.94,
};

/**
 * Subtle Astrological Weighting Calculation (Max ±12%)
 * Ensures NO card is ever guaranteed or prevented.
 */
const calculateCardWeight = (
  card: TarotCard,
  astroContext: AstroTarotContext,
  category: TarotQuestionCategory
): number => {
  let weight = 1.0; // Base weight

  const catUpper = (category || 'GENERAL LIFE').toUpperCase();
  const domTheme = (astroContext.dominantTheme || '').toLowerCase();

  // 1. Category alignment bonus (up to +8%)
  if (catUpper.includes('LOVE') && (card.suit === 'cups' || card.name === 'The Lovers' || card.name === 'The Empress')) {
    weight += 0.08;
  } else if (catUpper.includes('CAREER') && (card.suit === 'wands' || card.name === 'The Emperor' || card.name === 'The Chariot')) {
    weight += 0.08;
  } else if (catUpper.includes('FINANCE') && (card.suit === 'pentacles' || card.name === 'Wheel of Fortune')) {
    weight += 0.08;
  } else if (catUpper.includes('SPIRITUALITY') && (card.arcana === 'major' || card.name === 'The Hermit' || card.name === 'The High Priestess')) {
    weight += 0.08;
  }

  // 2. Astrological element alignment bonus (up to +4%)
  if (domTheme.includes('fire') && card.element === 'Fire') {
    weight += 0.04;
  } else if (domTheme.includes('water') && card.element === 'Water') {
    weight += 0.04;
  } else if (domTheme.includes('air') && card.element === 'Air') {
    weight += 0.04;
  } else if (domTheme.includes('earth') && card.element === 'Earth') {
    weight += 0.04;
  }

  // Clamp weight between 0.88 and 1.12 (strict ±12% ceiling as per specification)
  return Math.min(1.12, Math.max(0.88, weight));
};

/**
 * Weighted Sample Without Replacement for 3 Cards
 */
export const drawThreeUniqueCards = (
  deck: TarotCard[],
  astroContext: AstroTarotContext,
  category: TarotQuestionCategory,
  applyWeighting: boolean = true
): { card: TarotCard; orientation: TarotOrientation }[] => {
  const pool = [...deck];
  const results: { card: TarotCard; orientation: TarotOrientation }[] = [];

  for (let step = 0; step < 3; step++) {
    let totalWeight = 0;
    const weights: number[] = [];

    for (const card of pool) {
      const w = applyWeighting ? calculateCardWeight(card, astroContext, category) : 1.0;
      weights.push(w);
      totalWeight += w;
    }

    // Pick random target in [0, totalWeight)
    const threshold = getSecureRandom() * totalWeight;
    let accumulated = 0;
    let selectedIndex = 0;

    for (let i = 0; i < pool.length; i++) {
      accumulated += weights[i];
      if (accumulated >= threshold) {
        selectedIndex = i;
        break;
      }
    }

    const [drawnCard] = pool.splice(selectedIndex, 1);

    // Cryptographic 50/50 flip for Upright vs Reversed
    const orientation: TarotOrientation = getSecureRandom() > 0.5 ? 'upright' : 'reversed';

    results.push({ card: drawnCard, orientation });
  }

  return results;
};

/**
 * Validate Draw Integrity
 */
export const validateDrawIntegrity = (drawnCards: TarotDraw[]): boolean => {
  if (!drawnCards || drawnCards.length !== 3) return false;

  const cardIds = new Set(drawnCards.map((d) => d.card.id));
  if (cardIds.size !== 3) return false; // Must be unique

  const positions = new Set(drawnCards.map((d) => d.position));
  if (positions.size !== 3) return false;

  // Verify all belong to verified 78-card deck
  const deckIds = new Set(TAROT_DECK.map((c) => c.id));
  for (const d of drawnCards) {
    if (!deckIds.has(d.card.id)) return false;
    if (d.orientation !== 'upright' && d.orientation !== 'reversed') return false;
  }

  return true;
};

/**
 * Main Orchestrator: Execute "✦ SHUFFLE TO DESTINY" Session
 */
export const executeShuffleToDestiny = (options: DrawOptions = {}): TarotSession => {
  // 1. Deck integrity pre-check
  const deckValidation = VERIFY_TAROT_DECK();
  if (!deckValidation.valid) {
    console.error('Deck integrity check warning:', deckValidation);
  }

  const userId = options.userId || 'seeker_' + Math.floor(getSecureRandom() * 10000000).toString(36);
  const category = options.category || 'GENERAL LIFE';
  const question = options.question || `What cosmic perspective should I receive regarding my ${category.toLowerCase()}?`;
  const astroContext = options.astroContext || DEFAULT_ASTRO_CONTEXT;
  const applyWeighting = options.applyAstroWeighting !== false;

  // 2. Cryptographic Draw of exactly 3 unique cards
  const drawnRaw = drawThreeUniqueCards(TAROT_DECK, astroContext, category, applyWeighting);

  // 3. Assign to ROOT, PRESENT, DIRECTION
  const drawnCards: TarotDraw[] = drawnRaw.map((raw, idx) => ({
    card: raw.card,
    orientation: raw.orientation,
    position: SPREAD_POSITIONS[idx].position,
    positionTitle: SPREAD_POSITIONS[idx].title,
    positionPrompt: SPREAD_POSITIONS[idx].prompt,
  }));

  // 4. Validate before finalizing
  if (!validateDrawIntegrity(drawnCards)) {
    throw new Error('Tarot draw validation failed: Duplicate cards or invalid spread detected.');
  }

  // 5. Generate Session Seed and ID
  const timestamp = new Date().toISOString();
  const entropy = getSecureRandom().toString();
  const sessionId = 'destiny_' + hashString(`${userId}_${timestamp}_${entropy}`);

  // 6. Generate Comprehensive Interpretation
  const interpretation = generateTarotInterpretation(drawnCards, astroContext, category, question);

  const session: TarotSession = {
    sessionId,
    userId,
    question,
    questionCategory: category,
    drawnCards,
    astroContext,
    interpretation,
    createdAt: timestamp,
  };

  // Save to local journal storage if available
  saveToJournalStorage(session);

  return session;
};

/**
 * Draw Single Daily Tarot Card (Cached per day)
 */
export const getDailyTarotCard = (userId: string = 'guest'): { card: TarotCard; orientation: TarotOrientation; date: string } => {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `deepastro_daily_tarot_${userId}_${today}`;

  if (typeof window !== 'undefined' && window.localStorage) {
    const cached = window.localStorage.getItem(storageKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fallback to fresh draw
      }
    }
  }

  // Draw 1 card using date-seeded randomness
  const seedString = `${userId}_${today}_daily_tarot`;
  const seedHash = hashString(seedString);
  const seedNum = parseInt(seedHash.substring(0, 4), 16);
  const cardIndex = seedNum % TAROT_DECK.length;

  const card = TAROT_DECK[cardIndex];
  const orientation: TarotOrientation = seedNum % 2 === 0 ? 'upright' : 'reversed';

  const result = { card, orientation, date: today };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(result));
    } catch {
      // Storage quota
    }
  }

  return result;
};

/**
 * Local Journal Storage Helpers (User Isolated & Universal)
 */
const memoryStorage: Record<string, string> = {};
const memoryStorageFallback: Storage = {
  getItem: (key: string) => memoryStorage[key] ?? null,
  setItem: (key: string, value: string) => { memoryStorage[key] = String(value); },
  removeItem: (key: string) => { delete memoryStorage[key]; },
  clear: () => { Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]); },
  key: (index: number) => Object.keys(memoryStorage)[index] ?? null,
  get length() { return Object.keys(memoryStorage).length; },
};

const getLocalStorage = (): Storage => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return memoryStorageFallback;
};

const getTarotStorageKey = (prefix: string, userId?: string): string => {
  if (userId && userId !== 'guest_tarot_seeker') {
    return `${prefix}_${userId}`;
  }
  const storage = getLocalStorage();
  if (storage) {
    const rawUser = storage.getItem('deepastro_user');
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u?.id) return `${prefix}_${u.id}`;
      } catch {}
    }
  }
  return `${prefix}_guest`;
};

export const getJournalHistory = (userId?: string): TarotSession[] => {
  const storage = getLocalStorage();
  if (!storage) return [];
  try {
    const key = getTarotStorageKey('deepastro_tarot_journal', userId);
    let data = storage.getItem(key);
    if (!data && key !== 'deepastro_tarot_journal_guest') {
      // Fallback check for un-scoped legacy items
      data = storage.getItem('deepastro_tarot_journal');
    }
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveToJournalStorage = (session: TarotSession, userId?: string) => {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    const effectiveUserId = userId || session.userId;
    const key = getTarotStorageKey('deepastro_tarot_journal', effectiveUserId);
    const current = getJournalHistory(effectiveUserId);
    const filtered = current.filter((s) => s.sessionId !== session.sessionId);
    const updated = [session, ...filtered].slice(0, 50); // Store up to 50 readings
    storage.setItem(key, JSON.stringify(updated));
  } catch {
    // Storage full
  }
};

export const deleteFromJournalStorage = (sessionId: string, userId?: string) => {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    const key = getTarotStorageKey('deepastro_tarot_journal', userId);
    const current = getJournalHistory(userId);
    const updated = current.filter((s) => s.sessionId !== sessionId);
    storage.setItem(key, JSON.stringify(updated));
  } catch {
    // Storage full
  }
};

export const toggleFavoriteJournal = (sessionId: string, userId?: string): boolean => {
  const storage = getLocalStorage();
  if (!storage) return false;
  try {
    const key = getTarotStorageKey('deepastro_tarot_journal', userId);
    const current = getJournalHistory(userId);
    let newStatus = false;
    const updated = current.map((s) => {
      if (s.sessionId === sessionId) {
        newStatus = !s.favorite;
        return { ...s, favorite: newStatus };
      }
      return s;
    });
    storage.setItem(key, JSON.stringify(updated));
    return newStatus;
  } catch {
    return false;
  }
};

export const getTarotReadings = (userId?: string): any[] => {
  const storage = getLocalStorage();
  if (!storage) return [];
  try {
    const key = getTarotStorageKey('deepastro_tarot_readings', userId);
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const deleteTarotReading = (sessionId: string, userId?: string): void => {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    const key = getTarotStorageKey('deepastro_tarot_readings', userId);
    const list = getTarotReadings(userId).filter((r: any) => r.sessionId !== sessionId);
    storage.setItem(key, JSON.stringify(list));
  } catch {}
};

export const toggleFavoriteTarotReading = (sessionId: string, userId?: string): void => {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    const key = getTarotStorageKey('deepastro_tarot_readings', userId);
    const list = getTarotReadings(userId).map((r: any) => r.sessionId === sessionId ? { ...r, favorite: !r.favorite } : r);
    storage.setItem(key, JSON.stringify(list));
  } catch {}
};

export const addNoteToTarotReading = (sessionId: string, note: string): void => {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    const list = getTarotReadings().map((r: any) => r.sessionId === sessionId ? { ...r, notes: note } : r);
    storage.setItem('deepastro_tarot_readings', JSON.stringify(list));
  } catch {}
};
