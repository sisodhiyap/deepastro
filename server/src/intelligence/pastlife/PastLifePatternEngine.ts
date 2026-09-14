import { AstrologyPastLifeAnalysis } from './PastLifeAstrologyEngine.js';
import { NumerologyPastLifeAnalysis } from './PastLifeNumerologyEngine.js';
import { PastLifeArchetype, PastLifeConfidenceLevel } from './PastLifeTypes.js';

export class PastLifePatternEngine {
  public static determineArchetype(
    astro: AstrologyPastLifeAnalysis,
    num: NumerologyPastLifeAnalysis,
    isMixed: boolean
  ): {
    primary: PastLifeArchetype;
    secondary: PastLifeArchetype;
    supporting: PastLifeArchetype;
    confidence: PastLifeConfidenceLevel;
    description: string;
  } {
    const scores: Record<PastLifeArchetype, number> = {
      SCHOLAR: 0,
      TEACHER: 0,
      SPIRITUAL_SEEKER: 0,
      MONASTIC: 0,
      HEALER: 0,
      ARTISAN: 0,
      TRADER: 0,
      ADMINISTRATOR: 0,
      LEADER: 0,
      WARRIOR_ARCHETYPE: 0,
      TRAVELER: 0,
      CARETAKER: 0,
      COMMUNITY_SERVANT: 0,
      PHILOSOPHER: 0,
      TEMPLE_SERVICE: 0,
      ARTIST: 0,
      CRAFTSPERSON: 0,
      DIPLOMAT: 0,
      EXPLORER: 0,
      HOUSEHOLDER: 0,
      GUIDE: 0,
      MIXED_ARCHETYPE: 0,
    };

    // Score from Atmakaraka
    const ak = astro.atmakarakaData.planet;
    if (ak === 'Jupiter') {
      scores.TEACHER += 35;
      scores.SCHOLAR += 30;
      scores.PHILOSOPHER += 25;
      scores.TEMPLE_SERVICE += 20;
    } else if (ak === 'Mercury') {
      scores.SCHOLAR += 35;
      scores.ARTISAN += 25;
      scores.TRADER += 20;
      scores.DIPLOMAT += 25;
    } else if (ak === 'Sun') {
      scores.LEADER += 35;
      scores.ADMINISTRATOR += 30;
      scores.WARRIOR_ARCHETYPE += 20;
    } else if (ak === 'Mars') {
      scores.WARRIOR_ARCHETYPE += 35;
      scores.LEADER += 25;
      scores.EXPLORER += 20;
    } else if (ak === 'Venus') {
      scores.ARTIST += 35;
      scores.HEALER += 25;
      scores.HOUSEHOLDER += 20;
    } else if (ak === 'Moon') {
      scores.CARETAKER += 35;
      scores.HEALER += 30;
      scores.COMMUNITY_SERVANT += 25;
    } else if (ak === 'Saturn') {
      scores.MONASTIC += 35;
      scores.COMMUNITY_SERVANT += 30;
      scores.CRAFTSPERSON += 25;
    }

    // Score from Ketu house
    const kh = astro.ketuData.house;
    if (kh === 12) {
      scores.MONASTIC += 40;
      scores.SPIRITUAL_SEEKER += 35;
      scores.TEMPLE_SERVICE += 25;
    } else if (kh === 9) {
      scores.PHILOSOPHER += 40;
      scores.TEACHER += 35;
      scores.GUIDE += 30;
    } else if (kh === 5) {
      scores.SCHOLAR += 35;
      scores.ARTIST += 30;
      scores.TEACHER += 25;
    } else if (kh === 8) {
      scores.HEALER += 35;
      scores.SPIRITUAL_SEEKER += 30;
      scores.PHILOSOPHER += 25;
    } else if (kh === 10) {
      scores.ADMINISTRATOR += 35;
      scores.LEADER += 30;
    } else if (kh === 3 || kh === 7) {
      scores.TRAVELER += 35;
      scores.EXPLORER += 30;
      scores.TRADER += 25;
    } else if (kh === 4) {
      scores.CARETAKER += 35;
      scores.HOUSEHOLDER += 30;
    } else if (kh === 6) {
      scores.COMMUNITY_SERVANT += 35;
      scores.HEALER += 30;
    }

    // Score from Numerology Life Path
    const lp = num.lifePath;
    if (lp === 7 || lp === 11) {
      scores.SPIRITUAL_SEEKER += 25;
      scores.PHILOSOPHER += 20;
    } else if (lp === 8 || lp === 22) {
      scores.ADMINISTRATOR += 25;
      scores.LEADER += 20;
    } else if (lp === 3) {
      scores.ARTIST += 25;
      scores.TEACHER += 20;
    } else if (lp === 9 || lp === 33) {
      scores.COMMUNITY_SERVANT += 25;
      scores.GUIDE += 25;
    } else if (lp === 5) {
      scores.TRAVELER += 25;
      scores.EXPLORER += 20;
    }

    if (isMixed) {
      scores.MIXED_ARCHETYPE = 95;
    }

    const sorted = (Object.entries(scores) as [PastLifeArchetype, number][])
      .sort((a, b) => b[1] - a[1]);

    const primary = sorted[0][0];
    const secondary = sorted[1][0];
    const supporting = sorted[2][0];

    const descriptionMap: Record<PastLifeArchetype, string> = {
      SCHOLAR: 'A devoted keeper and interpreter of sacred texts, natural philosophy, and systemic knowledge.',
      TEACHER: 'A guide and preceptor who illuminated pathways of wisdom for students and seekers.',
      SPIRITUAL_SEEKER: 'An earnest seeker who questioned surface appearances to discover metaphysical reality.',
      MONASTIC: 'A practitioner of contemplative discipline who embraced simplicity, prayer, and inner stillness.',
      HEALER: 'A practitioner of restorative herbal, energetic, or counseling arts dedicated to relieving distress.',
      ARTISAN: 'A skilled creator who channeled divine harmony into architecture, sculpture, or material forms.',
      TRADER: 'A mediator of commerce and ideas whose journeys bridged distant communities with integrity.',
      ADMINISTRATOR: 'A steward of civil order, ethical governance, and fair distribution of communal resources.',
      LEADER: 'A guiding figure who assumed protective responsibility and steered people through vital transitions.',
      WARRIOR_ARCHETYPE: 'A defender of ethical boundaries and protector of the vulnerable guided by honor.',
      TRAVELER: 'A voyager across river ports and pilgrim roads who connected disparate cultures and teachings.',
      CARETAKER: 'A selfless protector of family and lineage who provided refuge, nourishment, and warmth.',
      COMMUNITY_SERVANT: 'A tireless helper who found spiritual fulfillment in practical, quiet service to others.',
      PHILOSOPHER: 'A contemplative thinker dedicated to resolving deep existential and moral inquiries.',
      TEMPLE_SERVICE: 'A dedicated steward of sacred rituals, sanctuary spaces, and communal spiritual gatherings.',
      ARTIST: 'A visionary storyteller, musician, or poet who preserved sacred memories through expressive beauty.',
      CRAFTSPERSON: 'A master of practical material arts whose patience and precision mirrored cosmic order.',
      DIPLOMAT: 'A peacemaker who reconciled conflicting factions through discerning speech and balance.',
      EXPLORER: 'A pioneer drawn to unexplored horizons of geography, mind, and human potential.',
      HOUSEHOLDER: 'A pillar of society who fulfilled spiritual dharma through hospitality, family, and duty.',
      GUIDE: 'A trusted elder whose counsel steered souls toward their own latent wisdom.',
      MIXED_ARCHETYPE: 'A synthesis of contemplative seeker and practical leader, navigating both spiritual retreat and civic responsibility.',
    };

    return {
      primary,
      secondary,
      supporting,
      confidence: isMixed ? 'MODERATE' : 'HIGH',
      description: descriptionMap[primary] || descriptionMap.SPIRITUAL_SEEKER,
    };
  }
}
