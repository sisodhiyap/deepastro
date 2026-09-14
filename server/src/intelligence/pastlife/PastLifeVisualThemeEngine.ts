import { PastLifeArchetype, PastLifeVisualTheme } from './PastLifeTypes.js';

export class PastLifeVisualThemeEngine {
  public static selectTheme(archetype: PastLifeArchetype, ketuHouse: number): {
    theme: PastLifeVisualTheme;
    primary_motif: string;
    palette_accents: string[];
    atmosphere: string;
  } {
    if (archetype === 'SCHOLAR' || archetype === 'PHILOSOPHER') {
      return {
        theme: 'LIBRARY',
        primary_motif: 'Ancient sandstone library with palm-leaf scrolls, celestial astrolabe, and warm golden lantern light',
        palette_accents: ['#F59E0B', '#B45309', '#1E1B4B'],
        atmosphere: 'Scholarly serenity, intellectual reverence, warm amber illumination',
      };
    }

    if (archetype === 'MONASTIC' || archetype === 'SPIRITUAL_SEEKER') {
      return {
        theme: 'MOUNTAIN',
        primary_motif: 'Solitary stone hermitage nestled on a misty Himalayan ridge at sunrise, prayer flags and quiet incense smoke',
        palette_accents: ['#D97706', '#475569', '#0F172A'],
        atmosphere: 'Transcendent stillness, crisp mountain dawn, deep meditative peace',
      };
    }

    if (archetype === 'TEMPLE_SERVICE' || archetype === 'TEACHER') {
      return {
        theme: 'TEMPLE',
        primary_motif: 'Majestic ancient Vedic temple sanctum with carved granite pillars, sacred flame (diya), and celestial alignments',
        palette_accents: ['#F59E0B', '#D97706', '#312E81'],
        atmosphere: 'Sacred devotion, temple bells, incense haze and golden cosmic radiance',
      };
    }

    if (archetype === 'TRAVELER' || archetype === 'EXPLORER') {
      return {
        theme: 'WATER',
        primary_motif: 'Ancient riverside harbor with traditional wooden craft, starlit reflections, and distant temple silhouettes',
        palette_accents: ['#0284C7', '#F59E0B', '#0F172A'],
        atmosphere: 'Voyage into the starlit unknown, sacred river waters, quiet pilgrimage',
      };
    }

    if (archetype === 'LEADER' || archetype === 'ADMINISTRATOR' || archetype === 'WARRIOR_ARCHETYPE') {
      return {
        theme: 'ANCIENT_CITY',
        primary_motif: 'Noble stone citadel with ceremonial gateways, banners of truth, and view over a thriving valley',
        palette_accents: ['#E11D48', '#F59E0B', '#1E293B'],
        atmosphere: 'Dharmic sovereignty, principled fortitude, noble responsibility',
      };
    }

    if (archetype === 'HEALER' || archetype === 'CARETAKER') {
      return {
        theme: 'NATURE',
        primary_motif: 'Lush herbal sanctuary beneath an ancient Banyan tree, medicinal flora, and gentle lotus pond at twilight',
        palette_accents: ['#10B981', '#F59E0B', '#064E3B'],
        atmosphere: 'Restorative warmth, sacred living earth, gentle compassionate light',
      };
    }

    return {
      theme: 'COSMIC',
      primary_motif: 'Celestial mandala hovering over an ancient sacred landscape under a starlit cosmic sky with glowing planetary orbs',
      palette_accents: ['#F59E0B', '#818CF8', '#090D16'],
      atmosphere: 'Cosmic awe, timeless soul journey, harmonious starlight',
    };
  }
}
