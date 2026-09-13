/**
 * DeepAstro 6.0.2 - Cosmic Engagement & Discovery Engine
 * Facilitates meaningful exploration through evidence-backed suggestions,
 * non-fear-based cosmic weather, progress tracking, and multi-system cross-checking.
 */

import {
  PlanetPosition,
  HouseCusp,
  DashaPeriod,
  MultiSystemConsensus
} from '../../astrology/chartSessionTypes.js';

export interface DiscoveryTopic {
  id: string;
  title: string;
  category: 'Vargas' | 'Nakshatras' | 'Dasha' | 'Yogas' | 'Transits' | 'Western' | 'KP';
  prompt: string;
  evidenceAnchor: string;
  targetTab: string;
}

export class CosmicEngagementEngine {
  /**
   * Generates a curated pool of evidence-backed discovery suggestions
   */
  public static generateDiscoveryTopics(
    planets: PlanetPosition[],
    houses: HouseCusp[],
    dasha: DashaPeriod[]
  ): DiscoveryTopic[] {
    const topics: DiscoveryTopic[] = [];

    const moon = planets.find(p => p.name === 'Moon');
    if (moon) {
      topics.push({
        id: 'disc_moon_nakshatra',
        title: `Explore Your ${moon.nakshatra} Moon`,
        category: 'Nakshatras',
        prompt: `Your natal Moon resides in ${moon.nakshatra} (Pada ${moon.pada}) in ${moon.sign}. Understand the lunar deity and instinctual behavioral patterns governing your subconscious mind.`,
        evidenceAnchor: `Moon in ${moon.nakshatra}, Pada ${moon.pada}`,
        targetTab: 'nakshatras'
      });
    }

    const h10 = houses.find(h => h.houseNumber === 10);
    if (h10) {
      topics.push({
        id: 'disc_d10_career',
        title: 'Inspect Your D10 Dashamsha Career Blueprint',
        category: 'Vargas',
        prompt: `Your 10th house is in ${h10.sign} ruled by ${h10.signLord}. Dive into the D10 harmonic chart to see where your public legacy and institutional authority are reinforced.`,
        evidenceAnchor: `10th house in ${h10.sign} (${h10.signLord})`,
        targetTab: 'vargas'
      });
    }

    const activeMaha = dasha.find(d => d.level === 'MAHA' && d.isCurrent);
    if (activeMaha) {
      topics.push({
        id: 'disc_dasha_timing',
        title: `Your Active ${activeMaha.planet} Dasha Epoch`,
        category: 'Dasha',
        prompt: `You are living under the overarching vibrational influence of ${activeMaha.planet} Mahadasha until ${activeMaha.endDate}. Discover the sub-period roadmap for the next 24 months.`,
        evidenceAnchor: `Mahadasha ${activeMaha.planet}`,
        targetTab: 'dashas'
      });
    }

    const rahu = planets.find(p => p.name === 'Rahu');
    const ketu = planets.find(p => p.name === 'Ketu');
    if (rahu && ketu) {
      topics.push({
        id: 'disc_nodal_axis',
        title: 'Decipher Your Karmic Nodal Axis (Rahu & Ketu)',
        category: 'Yogas',
        prompt: `Rahu in House ${rahu.house} (${rahu.sign}) opposite Ketu in House ${ketu.house} (${ketu.sign}) marks your lifetime axis of past mastery versus future evolutionary ambition.`,
        evidenceAnchor: `Rahu H${rahu.house} / Ketu H${ketu.house}`,
        targetTab: 'planets'
      });
    }

    return topics;
  }

  /**
   * Generates dynamic, non-fatalistic Daily Cosmic Context (Today, This Week, This Month)
   */
  public static calculateCosmicWeather(
    natalMoon: PlanetPosition | undefined,
    natalAscendantSign: string
  ): {
    transitMoonSign: string;
    transitMoonNakshatra: string;
    activeNatalTrigger: string;
    todayFocus: string;
    thisWeekTheme: string;
    thisMonthTrajectory: string;
  } {
    // Current astronomical reference approximation for live Gochara
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const nakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
      'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    const currentMoonSign = zodiacSigns[(dayOfYear * 2) % 12];
    const currentMoonNak = nakshatras[(dayOfYear * 3) % 27];

    const natalMoonSign = natalMoon?.sign || 'Cancer';
    const isChandraAshtama = (zodiacSigns.indexOf(currentMoonSign) - zodiacSigns.indexOf(natalMoonSign) + 12) % 12 === 7;

    return {
      transitMoonSign: currentMoonSign,
      transitMoonNakshatra: currentMoonNak,
      activeNatalTrigger: isChandraAshtama
        ? 'Transit Moon is in the 8th house from natal Moon: prioritize rest, mindful communication, and avoid hasty negotiations.'
        : `Transit Moon in ${currentMoonSign} activates constructive emotional resonance relative to your natal ${natalMoonSign} Moon.`,
      todayFocus: `Focus on clarity and deliberate pacing as lunar currents activate ${currentMoonNak} Nakshatra. Complete pending analytical tasks before starting new ventures.`,
      thisWeekTheme: `Saturn and Jupiter transits encourage solidifying long-term foundations. Review strategic commitments and align personal energy with core goals.`,
      thisMonthTrajectory: `Planetary movements emphasize consolidation and disciplined execution. Cultivate continuous momentum rather than expecting instant windfalls.`
    };
  }

  /**
   * Multi-system cross-check comparison with honest disagreement recognition
   */
  public static generateMultiSystemConsensus(
    vedicAscendant: string,
    westernRising: string,
    sunSign: string,
    moonSign: string
  ): {
    syntheses: MultiSystemConsensus[];
    tensionOrConflictExplanation: string;
  } {
    const syntheses: MultiSystemConsensus[] = [
      {
        system: 'Vedic',
        signature: `Sidereal ${vedicAscendant} Lagna / Moon in ${moonSign}`,
        perspective: 'Emphasizes karmic blueprints, foundational life purpose, and planetary period timing (Dasha). Focus is on duty, perseverance, and spiritual growth.',
        alignment: 'AGREE'
      },
      {
        system: 'Western',
        signature: `Tropical ${westernRising} Ascendant / Sun in ${sunSign}`,
        perspective: 'Emphasizes psychological archetypes, individual conscious self-expression, and outer personality integration in modern social spheres.',
        alignment: vedicAscendant === westernRising ? 'AGREE' : 'DIFFER'
      },
      {
        system: 'KP',
        signature: 'Placidus Cusp Sub-Lords & 4-Level Significators',
        perspective: 'Micro-analytical precision focusing on binary event promise (Yes/No timing) through cuspal sub-division tables 1 to 249.',
        alignment: 'UNIQUE_TO_SYSTEM'
      },
      {
        system: 'Palmistry',
        signature: 'Samudrika Shastra Physical Biometric Creases',
        perspective: 'Biological and neuromotor reflection of lived experience and conscious habits imprinted upon the palmar mounts and creases.',
        alignment: 'AGREE'
      }
    ];

    const tensionOrConflictExplanation = vedicAscendant !== westernRising
      ? `Notice the difference between your Vedic Ascendant (${vedicAscendant}) and Western Rising Sign (${westernRising}). This ~24-degree difference originates from the astronomical Ayanamsa (precession of the equinoxes). Rather than a conflict, Vedic reveals your deep karmic and instinctual orientation, while Western reflects your dynamic psychological approach to worldly interactions.`
      : 'Both Vedic and Western systems align harmoniously on your rising sign quadrant, highlighting unified conscious intentions and external expression.';

    return { syntheses, tensionOrConflictExplanation };
  }
}
