/**
 * DeepAstro 7.0 — Past Life Jaimini Engine (PastLifeJaiminiEngine)
 * Evaluates Jaimini Chara Karakas (Atmakaraka, Amatyakaraka, Darakaraka)
 * and Karakamsha dispositions for soul evolution and past life traits.
 */

import { PastLifeCalculatedSnapshot } from './PastLifeCalculationAdapter.js';

export interface JaiminiSoulEvaluation {
  atmakaraka: {
    planet: string;
    sign: string;
    house: number;
    soulLesson: string;
    spiritualArchetype: string;
  };
  amatyakaraka: {
    planet: string;
    careerAndServiceTheme: string;
  };
  darakaraka: {
    planet: string;
    karmicMirrorTheme: string;
  };
  karakamshaSign: string;
  karakamshaGuidance: string;
  signals: string[];
}

export class PastLifeJaiminiEngine {
  public static evaluate(snapshot: PastLifeCalculatedSnapshot): JaiminiSoulEvaluation {
    const ak = snapshot.atmakaraka;
    const amkData = snapshot.charaKarakas.find(k => k.karaka.includes('AmK')) || snapshot.charaKarakas[1];
    const dkData = snapshot.charaKarakas.find(k => k.karaka.includes('DK')) || snapshot.charaKarakas[snapshot.charaKarakas.length - 1];

    const akLessons: Record<string, { lesson: string; archetype: string }> = {
      Sun: {
        lesson: 'Overcoming spiritual pride and ego identification; realizing humble service.',
        archetype: 'Rishi / Dharmic Sovereign',
      },
      Moon: {
        lesson: 'Cultivating universal emotional detachment while preserving profound unconditional empathy.',
        archetype: 'Compassionate Caretaker / Sanctuary Guardian',
      },
      Mars: {
        lesson: 'Transforming aggressive or defensive impulse into disciplined spiritual courage and protection of truth.',
        archetype: 'Dharmic Protector / Martial Ascetic',
      },
      Mercury: {
        lesson: 'Transcending intellectual cleverness into truthful, unattached speech and profound Vedic inquiry.',
        archetype: 'Classical Scholar / Sacred Scribe',
      },
      Jupiter: {
        lesson: 'Surrendering dogmatic assumptions to become an open vessel for timeless wisdom.',
        archetype: 'Preceptor / Philosophical Sage',
      },
      Venus: {
        lesson: 'Purifying sensory cravings into sacred devotion, elevated aesthetics, and divine love.',
        archetype: 'Devotional Mystic / Sacred Artisan',
      },
      Saturn: {
        lesson: 'Embracing endurance, hardship, and service to the marginalized without bitterness.',
        archetype: 'Renunciant Monk / Patient Builder',
      },
    };

    const akInfo = akLessons[ak.planet] || akLessons['Sun'];

    // Karakamsha (Navamsha sign of Atmakaraka)
    const karakamshaSign = snapshot.d9LagnaSign;
    const karakamshaGuidance = `Karakamsha aligns with ${karakamshaSign}, directing soul evolution toward synthesis of ${akInfo.archetype} faculties.`;

    const signals: string[] = [
      `Atmakaraka ${ak.planet} in House ${ak.house} (${ak.sign}): ${akInfo.archetype}`,
      `Amatyakaraka ${amkData ? amkData.planet : 'Jupiter'}: Dedicated service through principled discipline`,
      `Darakaraka ${dkData ? dkData.planet : 'Venus'}: Karmic relationships serve as reflective mirrors for spiritual purification`,
      karakamshaGuidance,
    ];

    return {
      atmakaraka: {
        planet: ak.planet,
        sign: ak.sign,
        house: ak.house,
        soulLesson: akInfo.lesson,
        spiritualArchetype: akInfo.archetype,
      },
      amatyakaraka: {
        planet: amkData ? amkData.planet : 'Jupiter',
        careerAndServiceTheme: `Vocation grounded in ${amkData ? amkData.planet : 'Jupiter'} principles of sustained contribution.`,
      },
      darakaraka: {
        planet: dkData ? dkData.planet : 'Venus',
        karmicMirrorTheme: `Intimate partnerships reflect soul lessons of mutual respect and karmic debt repayment.`,
      },
      karakamshaSign,
      karakamshaGuidance,
      signals,
    };
  }
}
