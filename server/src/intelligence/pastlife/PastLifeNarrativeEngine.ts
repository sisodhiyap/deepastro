import { AstrologyPastLifeAnalysis } from './PastLifeAstrologyEngine.js';
import { NumerologyPastLifeAnalysis } from './PastLifeNumerologyEngine.js';
import { PastLifeArchetype } from './PastLifeTypes.js';

export class PastLifeNarrativeEngine {
  public static generate(
    fullName: string,
    archetype: { primary: PastLifeArchetype; secondary: PastLifeArchetype; description: string },
    astro: AstrologyPastLifeAnalysis,
    num: NumerologyPastLifeAnalysis,
    language = 'en'
  ): {
    title: string;
    summary: string;
    story: string;
    soul_message: string;
    setting: {
      description: string;
      environment: string;
      period: string;
      region: string;
    };
    role: {
      title: string;
      description: string;
    };
  } {
    const akPlanet = astro.atmakarakaData.planet;
    const ketuHouse = astro.ketuData.house;

    // Determine setting dynamically from astrological elements
    const sign = astro.ketuData.signName;
    let environment = 'A traditional sanctuary of study and contemplation';
    let region = 'An ancient riverside civilization with established scholastic and spiritual sanctuaries';
    let period = 'A pre-modern era characterized by classical study, sacred apprenticeship, and community balance';

    if (ketuHouse === 12 || ketuHouse === 8) {
      environment = 'A quiet mountain retreat or secluded hermitage surrounded by cedar forests and natural springs';
      region = 'A high-altitude highland sanctuary known for solitary contemplation';
      period = 'A timeless traditional era of monastic discipline and inward exploration';
    } else if (ketuHouse === 10 || ketuHouse === 1) {
      environment = 'A noble civic court and vibrant administrative center with stone archives';
      region = 'A historic regional capital governed by traditional civic and ethical councils';
      period = 'A flourishing historical epoch of civic stewardship and communal flourishing';
    } else if (ketuHouse === 3 || ketuHouse === 7) {
      environment = 'A coastal trading settlement and river-delta crossroads';
      region = 'A vibrant transit corridor connecting pilgrimage routes and maritime commerce';
      period = 'An era of cultural exchange and maritime exploration';
    }

    const roleTitleMap: Record<PastLifeArchetype, string> = {
      SCHOLAR: 'Steward of Classical Wisdom & Sacred Texts',
      TEACHER: 'Preceptor of Philosophical Sciences',
      SPIRITUAL_SEEKER: 'Initiate of the Inner Mysteries',
      MONASTIC: 'Contemplative Anchor of the Hermitage',
      HEALER: 'Practitioner of Sacred Restorative Arts',
      ARTISAN: 'Master Builder of Sacred Geometry',
      TRADER: 'Cross-Regional Merchant of Ideas and Goods',
      ADMINISTRATOR: 'Magistrate of Dharmic Civic Order',
      LEADER: 'Guardian & Council Protector',
      WARRIOR_ARCHETYPE: 'Defender of the Sacred Perimeters',
      TRAVELER: 'Pilgrim of Ancient Trade Roads',
      CARETAKER: 'Keeper of the Lineage Sanctuary',
      COMMUNITY_SERVANT: 'Selfless Steward of the Public Welfare',
      PHILOSOPHER: 'Inquirer of Ultimate Principles',
      TEMPLE_SERVICE: 'Curator of Ritual Rites & Sacred Havens',
      ARTIST: 'Voice of Sacred Verse & Memory',
      CRAFTSPERSON: 'Mason of Enduring Structures',
      DIPLOMAT: 'Arbiter of Communal Treaties',
      EXPLORER: 'Trailblazer of Distant Horizons',
      HOUSEHOLDER: 'Pillar of Hospitality & Lineage Dharma',
      GUIDE: 'Wayfinder for Seeking Souls',
      MIXED_ARCHETYPE: 'Dharmic Counselor & Contemplative Leader',
    };

    const roleTitle = roleTitleMap[archetype.primary] || 'Steward of the Sacred Canon';

    const title = `The Journey of the ${archetype.primary.replace(/_/g, ' ')}: Wisdom Carried Across Lifetimes`;

    const summary = `Traditional Jyotish analysis of your natal chart indicates a strong karmic resonance with the ${archetype.primary.replace(/_/g, ' ')} archetype. In previous cycles of experience, your soul engaged deeply in ${environment.toLowerCase()}, cultivating distinctive capacities in ${archetype.description.toLowerCase()} Today, this heritage surfaces as an instinctive discernment, an aversion to superficiality, and a persistent drive toward meaningful, principled living.`;

    const story = `Across the tapestry of time, every soul weaves a unique thread of consciousness. In your astrological geometry, the convergence of Ketu in House ${ketuHouse} alongside Atmakaraka ${akPlanet} reflects an individual who was deeply immersed in purposeful duty.

Within ${environment.toLowerCase()}, your daily existence was shaped by regular contemplation, intellectual inquiry, and service. Rather than chasing ephemeral worldly applause, your past embodiment concentrated on mastering your craft, upholding communal ethics, and understanding the deeper cosmic order. 

Those around you recognized you for a calm, perceptive demeanor — someone capable of holding steady resolve during times of communal uncertainty. However, this dedication also brought subtle karmic tests: at times, a tendency to withdraw into solitary self-reliance or feeling burdened by the ethical failures of the surrounding world.

In this current life, that accumulated depth returns not as conscious memory, but as quiet innate talent: an instant recognition of authenticity, an organic comfort with reflective silence, and an enduring curiosity about life's ultimate purpose.`;

    // Dynamic soul message - never static
    const soul_message = `“You have crossed rivers of time not to repeat the past, but to illuminate the present. Trust the quiet wisdom you carried across the threshold; let your actions become your sanctuary.”`;

    return {
      title,
      summary,
      story,
      soul_message,
      setting: {
        description: `${environment} within ${region}.`,
        environment,
        period,
        region,
      },
      role: {
        title: roleTitle,
        description: archetype.description,
      },
    };
  }
}
