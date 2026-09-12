/**
 * Western Psychological Archetypes Engine
 */
import { WesternChartOutput } from './westernEngine.js';

export interface ArchetypeProfile {
  bigThree: {
    sun: { sign: string; theme: string; coreDrive: string };
    moon: { sign: string; theme: string; emotionalNeed: string };
    ascendant: { sign: string; theme: string; outwardStyle: string };
  };
  dominantElement: { element: string; count: number; trait: string };
  dominantModality: { modality: string; count: number; trait: string };
  keyArchetypes: Array<{ title: string; placement: string; narrative: string }>;
  disclaimer: string;
}

const SIGN_ARCHETYPES: Record<string, { sunDrive: string; moonNeed: string; ascStyle: string }> = {
  Aries: { sunDrive: 'Pioneering initiative, courageous self-expression', moonNeed: 'Directness, immediate emotional autonomy', ascStyle: 'Dynamic, direct, assertive presence' },
  Taurus: { sunDrive: 'Stabilizing resources, building enduring physical value', moonNeed: 'Tactile comfort, grounding, predictability', ascStyle: 'Calm, patient, grounded aura' },
  Gemini: { sunDrive: 'Connecting ideas, intellectual agility, curious exploration', moonNeed: 'Mental stimulation, verbal processing', ascStyle: 'Quick-witted, expressive, engaging demeanor' },
  Cancer: { sunDrive: 'Nurturing sanctuary, protective emotional bonding', moonNeed: 'Deep emotional safety, intimacy, psychic resonance', ascStyle: 'Warm, receptive, protective bearing' },
  Leo: { sunDrive: 'Creative radiance, heartfelt leadership, heroic self-actualization', moonNeed: 'Affirmation, celebratory warmth, loyalty', ascStyle: 'Regal, charismatic, radiant projection' },
  Virgo: { sunDrive: 'Refining systems, precision craftsmanship, humble service', moonNeed: 'Order, useful functionality, bodily peace', ascStyle: 'Observant, modest, perceptive composure' },
  Libra: { sunDrive: 'Harmonizing relationships, aesthetic balance, objective justice', moonNeed: 'Equilibrium, diplomatic partnership, beauty', ascStyle: 'Charming, graceful, socially poised carriage' },
  Scorpio: { sunDrive: 'Transformative penetration, psychological truth, emotional mastery', moonNeed: 'Raw vulnerability, total honesty, emotional depth', ascStyle: 'Intense, magnetic, penetrating gaze' },
  Sagittarius: { sunDrive: 'Philosophical expansion, quest for universal meaning, freedom', moonNeed: 'Horizons to explore, philosophical optimism', ascStyle: 'Expansive, jovial, adventurous spirit' },
  Capricorn: { sunDrive: 'Mastering tangible structures, disciplined achievement, legacy', moonNeed: 'Respect, competence, self-reliance', ascStyle: 'Authoritative, reserved, dignified gravity' },
  Aquarius: { sunDrive: 'Innovative humanitarian vision, radical authenticity, systemic change', moonNeed: 'Intellectual freedom, community belonging, individuality', ascStyle: 'Unconventional, visionary, observant detached elegance' },
  Pisces: { sunDrive: 'Mystical dissolution of boundaries, universal empathy, artistic imagination', moonNeed: 'Spiritual transcendent connection, poetic quietude', ascStyle: 'Dreamy, ethereal, empathetic presence' }
};

export class WesternArchetypesEngine {
  public static generateProfile(chart: WesternChartOutput): ArchetypeProfile {
    const sunPlanet = chart.planets.find(p => p.name === 'Sun')!;
    const moonPlanet = chart.planets.find(p => p.name === 'Moon')!;
    const ascSign = chart.angles.ascendant.sign;

    const sunData = SIGN_ARCHETYPES[sunPlanet.sign] || SIGN_ARCHETYPES['Aries'];
    const moonData = SIGN_ARCHETYPES[moonPlanet.sign] || SIGN_ARCHETYPES['Taurus'];
    const ascData = SIGN_ARCHETYPES[ascSign] || SIGN_ARCHETYPES['Gemini'];

    let topElement: 'Fire' | 'Earth' | 'Air' | 'Water' = 'Fire';
    let maxElement = -1;
    (Object.entries(chart.elementDistribution) as Array<['Fire' | 'Earth' | 'Air' | 'Water', number]>).forEach(([el, count]) => {
      if (count > maxElement) {
        maxElement = count;
        topElement = el;
      }
    });

    let topModality: 'Cardinal' | 'Fixed' | 'Mutable' = 'Cardinal';
    let maxModality = -1;
    (Object.entries(chart.modalityDistribution) as Array<['Cardinal' | 'Fixed' | 'Mutable', number]>).forEach(([mod, count]) => {
      if (count > maxModality) {
        maxModality = count;
        topModality = mod;
      }
    });

    const elementTraits: Record<string, string> = {
      Fire: 'High vitality, enthusiastic drive, intuitive action, and inspirational presence.',
      Earth: 'Pragmatic discernment, sensory grounding, methodical execution, and physical resilience.',
      Air: 'Conceptual perspective, social objectivity, linguistic dexterity, and dialectical synthesis.',
      Water: 'Deep empathy, somatic receptivity, psychic intuition, and emotional resonance.'
    };

    const modalityTraits: Record<string, string> = {
      Cardinal: 'Instigating new cycles, visionary initiation, leadership, and proactive momentum.',
      Fixed: 'Sustaining focus, resolute conviction, structural loyalty, and enduring perseverance.',
      Mutable: 'Adaptive integration, contextual flexibility, versatile synthesis, and transitional evolution.'
    };

    const keyArchetypes: Array<{ title: string; placement: string; narrative: string }> = [
      {
        title: 'Core Purpose Vector',
        placement: 'Sun in ' + sunPlanet.sign + ' (House ' + sunPlanet.house + ')',
        narrative: 'You manifest purposeful vitality by ' + sunData.sunDrive + '. Located in the ' + sunPlanet.house + 'th house, your energy concentrates in real-world manifestations of this sector.'
      },
      {
        title: 'Emotional Sanctuary & Processing',
        placement: 'Moon in ' + moonPlanet.sign + ' (House ' + moonPlanet.house + ')',
        narrative: 'Your intuitive baseline requires ' + moonData.moonNeed + '. Emotional resilience is nurtured through grounding the emotional themes of the ' + moonPlanet.house + 'th house.'
      },
      {
        title: 'Outer Presentation & Interface',
        placement: 'Ascendant in ' + ascSign,
        narrative: 'The world perceives your instinctual style as: ' + ascData.ascStyle + '. This is the psychological filter through which all personal experiences enter.'
      }
    ];

    return {
      bigThree: {
        sun: { sign: sunPlanet.sign, theme: 'The Solar Core in ' + sunPlanet.sign, coreDrive: sunData.sunDrive },
        moon: { sign: moonPlanet.sign, theme: 'The Lunar Sanctuary in ' + moonPlanet.sign, emotionalNeed: moonData.moonNeed },
        ascendant: { sign: ascSign, theme: 'The Ascending Mask in ' + ascSign, outwardStyle: ascData.ascStyle }
      },
      dominantElement: { element: topElement, count: maxElement, trait: elementTraits[topElement] },
      dominantModality: { modality: topModality, count: maxModality, trait: modalityTraits[topModality] },
      keyArchetypes,
      disclaimer: 'Astrological psychological profiles are cultural, symbolic, and archetypal frameworks designed for self-reflection. They are not medical, clinical, or psychometric assessments and do not constitute scientific psychology.'
    };
  }
}