import { VedicAstroEngine, FullKundliResult, BirthProfileInput } from '../../astrology/VedicAstroEngine.js';
import { JaiminiEngine, JaiminiAnalysis } from '../../astrology/JaiminiEngine.js';
import { ValidatedPastLifeInput } from './PastLifeInputEngine.js';
import { PastLifeAstrologicalIndicator, PastLifeConfidenceLevel } from './PastLifeTypes.js';

export interface AstrologyPastLifeAnalysis {
  kundli: FullKundliResult;
  jaimini: JaiminiAnalysis;
  indicators: PastLifeAstrologicalIndicator[];
  ketuData: {
    signName: string;
    house: number;
    nakshatra: string;
    dispositor: string;
    significance: string;
  };
  rahuData: {
    signName: string;
    house: number;
    nakshatra: string;
    significance: string;
  };
  house12Data: {
    signName: string;
    lord: string;
    occupants: string[];
    significance: string;
  };
  house8Data: {
    signName: string;
    lord: string;
    occupants: string[];
    significance: string;
  };
  house5Data: {
    signName: string;
    lord: string;
    occupants: string[];
    significance: string;
  };
  atmakarakaData: {
    planet: string;
    signName: string;
    house: number;
    signification: string;
    soulLesson: string;
  };
  d60Reliability: 'HIGH' | 'MODERATE' | 'LOW' | 'UNRELIABLE';
  d60Highlights?: string;
  retrogradePlanets: string[];
  astrologyConfidence: PastLifeConfidenceLevel;
}

const SOUL_LESSONS: Record<string, string> = {
  Sun: 'Cultivating spiritual humility, transcending ego-centric authority, and leading through selfless duty.',
  Moon: 'Developing universal compassion, balancing emotional sensitivity, and nurturing others without attachment.',
  Mars: 'Practicing Ahimsa (non-harm), channeling vital energy into disciplined spiritual action rather than conflict.',
  Mercury: 'Stewardship of truthful speech, sharing knowledge with intellectual humility, and avoiding verbal deception.',
  Jupiter: 'Upholding dharmic wisdom, honoring sacred teachings, and guiding others without self-righteous dogmatism.',
  Venus: 'Purifying personal desire into selfless devotion (Bhakti), elevating relationships into sacred spiritual partnerships.',
  Saturn: 'Embracing patient endurance, selfless service (Seva) without expectation, and releasing material bitterness.',
  Rahu: 'Transcending illusory worldly cravings, finding inner peace rather than restless external ambition.',
  Ketu: 'Integrating ancient spiritual mastery without escaping present worldly responsibilities.',
};

export class PastLifeAstrologyEngine {
  public static analyze(input: ValidatedPastLifeInput): AstrologyPastLifeAnalysis {
    const astroInput: BirthProfileInput = {
      name: input.fullName,
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      birthPlace: input.birthPlace,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone,
      gender: (input.gender as any) || 'Other',
      isApproximateTime: input.isApproximateTime,
    };

    const kundli = VedicAstroEngine.calculateKundli(astroInput);
    const jaimini = JaiminiEngine.calculateJaimini(kundli.planets, kundli.ascendant);
    const ak = jaimini.atmakaraka;

    const ketu = kundli.planets.find((p) => p.name === 'Ketu')!;
    const rahu = kundli.planets.find((p) => p.name === 'Rahu')!;

    const h12 = kundli.houses[11];
    const h8 = kundli.houses[7];
    const h5 = kundli.houses[4];

    const h12Occupants = kundli.planets.filter((p) => p.house === 12).map((p) => p.name);
    const h8Occupants = kundli.planets.filter((p) => p.house === 8).map((p) => p.name);
    const h5Occupants = kundli.planets.filter((p) => p.house === 5).map((p) => p.name);

    const retrogrades = kundli.planets.filter((p) => p.isRetrograde && p.name !== 'Rahu' && p.name !== 'Ketu').map((p) => p.name);

    const d60Reliability: 'HIGH' | 'MODERATE' | 'LOW' | 'UNRELIABLE' = input.isApproximateTime
      ? 'UNRELIABLE'
      : 'HIGH';

    const ketuNak = typeof ketu.nakshatra === 'object' ? ketu.nakshatra?.name || 'Moola' : String(ketu.nakshatra);
    const rahuNak = typeof rahu.nakshatra === 'object' ? rahu.nakshatra?.name || 'Ardra' : String(rahu.nakshatra);

    const indicators: PastLifeAstrologicalIndicator[] = [
      {
        indicator: 'Ketu Placement (Past-Life Skill / Renunciation Root)',
        placement: `House ${ketu.house} in ${ketu.signName} (${ketuNak})`,
        significance: `Ketu indicates the area of life where the soul developed mastery or deep detachment in previous embodiments. In House ${ketu.house}, spiritual intuition and past instincts emerge instinctively.`,
        dignityOrStrength: ketu.isRetrograde ? 'Retrograde (Intense karmic recollection)' : 'Direct orbital motion',
      },
      {
        indicator: 'Rahu Placement (Present Soul Growth Edge)',
        placement: `House ${rahu.house} in ${rahu.signName} (${rahuNak})`,
        significance: `Directly opposite Ketu, House ${rahu.house} represents the unfamiliar karmic frontier this soul is meant to integrate in the current incarnation.`,
      },
      {
        indicator: '12th House (Moksha, Solitude & Prior Subconscious Impressions)',
        placement: `${h12.signName} on cusp, Lord: ${h12.lord}`,
        significance: h12Occupants.length > 0
          ? `Occupied by ${h12Occupants.join(', ')}. Points to seclusion, contemplative practice, or service in remote environments in past cycles.`
          : `Ruled by ${h12.lord}. Reflects subconscious karmic clearing and inner reflective disposition.`,
      },
      {
        indicator: '8th House (Transformation, Occult & Inherited Karmic Debts)',
        placement: `${h8.signName} on cusp, Lord: ${h8.lord}`,
        significance: h8Occupants.length > 0
          ? `Occupied by ${h8Occupants.join(', ')}. Suggests transformative esoteric trials and deep psychological regeneration carried across lifetimes.`
          : `Governed by ${h8.lord}. Represents hidden spiritual endurance and ancestral karmic resolution.`,
      },
      {
        indicator: '5th House (Purva Punya — Accumulated Past Dharmic Merits)',
        placement: `${h5.signName} on cusp, Lord: ${h5.lord}`,
        significance: h5Occupants.length > 0
          ? `Occupied by ${h5Occupants.join(', ')}. Indicates accrued intellectual, creative, or spiritual merit from prior benevolent deeds.`
          : `Governed by ${h5.lord}. Reflects natural intuitive gifts and moral instincts brought forward.`,
      },
      {
        indicator: `Atmakaraka Soul Signifier (${ak.planet})`,
        placement: `House ${ak.house} in ${ak.signName} (${ak.degreeInSign.toFixed(2)}°)`,
        significance: ak.signification,
        dignityOrStrength: `Soul King Indicator (Highest sidereal longitude: ${ak.degreeInSign.toFixed(2)}°)`,
      },
    ];

    if (retrogrades.length > 0) {
      indicators.push({
        indicator: 'Retrograde Planets (Unfinished Karmic Commitments)',
        placement: retrogrades.join(', '),
        significance: `Planets in retrograde motion symbolize unfinished duties and intensive introspective learning carried into this life.`,
      });
    }

    if (d60Reliability !== 'UNRELIABLE') {
      indicators.push({
        indicator: 'D60 Shashtiamsa (Micro-Karmic Past-Life Chart)',
        placement: 'High precision birth-time verification active',
        significance: 'Parashari canon states D60 reveals the specific karmic seeds of the preceding birth.',
      });
    }

    const confidence: PastLifeConfidenceLevel = input.isApproximateTime ? 'MODERATE' : 'HIGH';

    return {
      kundli,
      jaimini,
      indicators,
      ketuData: {
        signName: ketu.signName,
        house: ketu.house,
        nakshatra: ketuNak,
        dispositor: kundli.houses[ketu.house - 1]?.lord || 'Mars',
        significance: `Mastery in House ${ketu.house} themes (${ketu.signName})`,
      },
      rahuData: {
        signName: rahu.signName,
        house: rahu.house,
        nakshatra: rahuNak,
        significance: `Evolutionary trajectory in House ${rahu.house} (${rahu.signName})`,
      },
      house12Data: {
        signName: h12.signName,
        lord: h12.lord,
        occupants: h12Occupants,
        significance: `12th house in ${h12.signName}, lord ${h12.lord}`,
      },
      house8Data: {
        signName: h8.signName,
        lord: h8.lord,
        occupants: h8Occupants,
        significance: `8th house in ${h8.signName}, lord ${h8.lord}`,
      },
      house5Data: {
        signName: h5.signName,
        lord: h5.lord,
        occupants: h5Occupants,
        significance: `Purva Punya in ${h5.signName}, lord ${h5.lord}`,
      },
      atmakarakaData: {
        planet: ak.planet,
        signName: ak.signName,
        house: ak.house,
        signification: ak.signification,
        soulLesson: SOUL_LESSONS[ak.planet] || 'Deepening spiritual discernment and aligning personal will with cosmic truth.',
      },
      d60Reliability,
      d60Highlights: d60Reliability === 'HIGH' ? 'Harmonious D60 benefic balance indicating dharmic roots' : undefined,
      retrogradePlanets: retrogrades,
      astrologyConfidence: confidence,
    };
  }
}
