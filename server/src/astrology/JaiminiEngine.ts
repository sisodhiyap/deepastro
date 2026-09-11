/**
 * Jaimini Astrology Engine (Upadesha Sutras)
 * Implements deterministic Jaimini system calculations:
 * - 7 Chara Karakas (AK, AmK, BK, MK, PK, GK, DK)
 * - Jaimini Rashi Drishti (Sign Aspects)
 * - Arudha Lagna (AL / Pada Lagna) & Upapada Lagna (UL)
 * - Chara Dasha basic periods
 * 
 * Strict Invariant:
 * Jaimini calculations are explicitly labeled and maintained distinct from Parashari doctrine.
 */

import { PlanetData } from './PlanetEngine.js';
import { DegreeDetails } from './astronomyMath.js';

export interface AscendantData {
  degrees?: number;
  details: DegreeDetails;
}

export interface CharaKaraka {
  role: 'Atmakaraka' | 'Amatyakaraka' | 'Bhratrukaraka' | 'Matrukaraka' | 'Putrakaraka' | 'Gnatikaraka' | 'Darakaraka';
  code: 'AK' | 'AmK' | 'BK' | 'MK' | 'PK' | 'GK' | 'DK';
  planet: string;
  degreeInSign: number;
  signName: string;
  house: number;
  signification: string;
}

export interface JaiminiAnalysis {
  methodology: 'Jaimini Sutras (7-Chara Karaka Scheme)';
  engineVersion: '1.0.0-jaimini';
  charaKarakas: CharaKaraka[];
  atmakaraka: CharaKaraka;
  amatyakaraka: CharaKaraka;
  darakaraka: CharaKaraka;
  arudhaLagna: {
    signIndex: number;
    signName: string;
    houseFromLagna: number;
    description: string;
  };
  upapadaLagna: {
    signIndex: number;
    signName: string;
    houseFromLagna: number;
    description: string;
  };
  rashiDrishti: Array<{
    signName: string;
    aspectsSigns: string[];
    signType: 'Moveable' | 'Fixed' | 'Dual';
  }>;
  charaDashaSequence: Array<{
    signName: string;
    order: number;
    durationYears: number;
  }>;
}

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_LORDS: Record<number, string> = {
  0: 'Mars',       // Aries
  1: 'Venus',      // Taurus
  2: 'Mercury',    // Gemini
  3: 'Moon',       // Cancer
  4: 'Sun',        // Leo
  5: 'Mercury',    // Virgo
  6: 'Venus',      // Libra
  7: 'Mars',       // Scorpio
  8: 'Jupiter',    // Sagittarius
  9: 'Saturn',     // Capricorn
  10: 'Saturn',    // Aquarius
  11: 'Jupiter',   // Pisces
};

export class JaiminiEngine {
  /**
   * Evaluates complete Jaimini analysis for a chart
   */
  public static calculateJaimini(planets: PlanetData[], ascendant: AscendantData): JaiminiAnalysis {
    // 1. Calculate 7 Chara Karakas (excluding Rahu & Ketu in standard 7-karaka scheme)
    const physicalPlanets = planets.filter((p) =>
      ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(p.name)
    );

    const sortedByDegree = [...physicalPlanets].sort((a, b) => {
      const degA = a.siderealLongitude % 30;
      const degB = b.siderealLongitude % 30;
      return degB - degA; // Descending degree
    });

    const KARAKA_ROLES: Array<{
      role: CharaKaraka['role'];
      code: CharaKaraka['code'];
      signification: string;
    }> = [
      { role: 'Atmakaraka', code: 'AK', signification: 'Soul indicator, primary spiritual and life lesson planet' },
      { role: 'Amatyakaraka', code: 'AmK', signification: 'Mind, career execution, vocation, and chief counselor' },
      { role: 'Bhratrukaraka', code: 'BK', signification: 'Siblings, mentors, teachers, and energetic co-travelers' },
      { role: 'Matrukaraka', code: 'MK', signification: 'Mother, emotional stability, landed assets, and heart peace' },
      { role: 'Putrakaraka', code: 'PK', signification: 'Children, intellect, creative intelligence, and mantra' },
      { role: 'Gnatikaraka', code: 'GK', signification: 'Kinsmen, obstacles, karmic disputes, and immune vitality' },
      { role: 'Darakaraka', code: 'DK', signification: 'Spouse, life partnership, deep intimate alliances' },
    ];

    const charaKarakas: CharaKaraka[] = sortedByDegree.map((p, idx) => ({
      role: KARAKA_ROLES[idx].role,
      code: KARAKA_ROLES[idx].code,
      planet: p.name,
      degreeInSign: parseFloat((p.siderealLongitude % 30).toFixed(4)),
      signName: p.signName,
      house: p.house,
      signification: KARAKA_ROLES[idx].signification,
    }));

    const atmakaraka = charaKarakas.find((k) => k.code === 'AK')!;
    const amatyakaraka = charaKarakas.find((k) => k.code === 'AmK')!;
    const darakaraka = charaKarakas.find((k) => k.code === 'DK')!;

    // 2. Arudha Lagna (AL)
    const lagnaSignIndex = ascendant.details.signIndex;
    const lagnaLordName = SIGN_LORDS[lagnaSignIndex];
    const lagnaLordPlanet = planets.find((p) => p.name === lagnaLordName);
    const lagnaLordSignIndex = lagnaLordPlanet ? lagnaLordPlanet.signIndex : lagnaSignIndex;

    const distanceLagnaToLord = (lagnaLordSignIndex - lagnaSignIndex + 12) % 12;
    let arudhaSignIndex = (lagnaLordSignIndex + distanceLagnaToLord) % 12;

    // Jaimini exception: If AL falls on Lagna or 7th from Lagna, add 10 signs
    if (arudhaSignIndex === lagnaSignIndex || arudhaSignIndex === (lagnaSignIndex + 6) % 12) {
      arudhaSignIndex = (arudhaSignIndex + 9) % 12;
    }

    const arudhaHouseFromLagna = ((arudhaSignIndex - lagnaSignIndex + 12) % 12) + 1;

    // 3. Upapada Lagna (UL) - Arudha of the 12th house
    const h12SignIndex = (lagnaSignIndex + 11) % 12;
    const h12LordName = SIGN_LORDS[h12SignIndex];
    const h12LordPlanet = planets.find((p) => p.name === h12LordName);
    const h12LordSignIndex = h12LordPlanet ? h12LordPlanet.signIndex : h12SignIndex;

    const distanceH12ToLord = (h12LordSignIndex - h12SignIndex + 12) % 12;
    let upapadaSignIndex = (h12LordSignIndex + distanceH12ToLord) % 12;

    if (upapadaSignIndex === h12SignIndex || upapadaSignIndex === (h12SignIndex + 6) % 12) {
      upapadaSignIndex = (upapadaSignIndex + 9) % 12;
    }

    const upapadaHouseFromLagna = ((upapadaSignIndex - lagnaSignIndex + 12) % 12) + 1;

    // 4. Jaimini Rashi Drishti (Sign Aspects)
    const rashiDrishti = SIGN_NAMES.map((name, signIdx) => {
      const isMoveable = [0, 3, 6, 9].includes(signIdx);
      const isFixed = [1, 4, 7, 10].includes(signIdx);
      const signType: 'Moveable' | 'Fixed' | 'Dual' = isMoveable ? 'Moveable' : isFixed ? 'Fixed' : 'Dual';

      const aspectsSigns: string[] = [];
      if (isMoveable) {
        // Aspects all Fixed signs except adjacent
        const fixedSigns = [1, 4, 7, 10];
        const adjacent = (signIdx + 1) % 12;
        for (const f of fixedSigns) {
          if (f !== adjacent) aspectsSigns.push(SIGN_NAMES[f]);
        }
      } else if (isFixed) {
        // Aspects all Moveable signs except adjacent
        const moveableSigns = [0, 3, 6, 9];
        const adjacent = (signIdx + 11) % 12;
        for (const m of moveableSigns) {
          if (m !== adjacent) aspectsSigns.push(SIGN_NAMES[m]);
        }
      } else {
        // Dual aspects all other Dual signs
        const dualSigns = [2, 5, 8, 11];
        for (const d of dualSigns) {
          if (d !== signIdx) aspectsSigns.push(SIGN_NAMES[d]);
        }
      }

      return {
        signName: name,
        aspectsSigns,
        signType,
      };
    });

    // 5. Chara Dasha Sequence
    const isDirectOrder = [0, 1, 2, 6, 7, 8].includes(lagnaSignIndex);
    const charaDashaSequence = Array.from({ length: 12 }, (_, i) => {
      const currentSignIdx = isDirectOrder ? (lagnaSignIndex + i) % 12 : (lagnaSignIndex - i + 12) % 12;
      const sLord = SIGN_LORDS[currentSignIdx];
      const lordPl = planets.find((p) => p.name === sLord);
      const lordSignIdx = lordPl ? lordPl.signIndex : currentSignIdx;

      let duration = (lordSignIdx - currentSignIdx + 12) % 12;
      if (duration === 0) duration = 12;

      return {
        signName: SIGN_NAMES[currentSignIdx],
        order: i + 1,
        durationYears: duration,
      };
    });

    return {
      methodology: 'Jaimini Sutras (7-Chara Karaka Scheme)',
      engineVersion: '1.0.0-jaimini',
      charaKarakas,
      atmakaraka,
      amatyakaraka,
      darakaraka,
      arudhaLagna: {
        signIndex: arudhaSignIndex,
        signName: SIGN_NAMES[arudhaSignIndex],
        houseFromLagna: arudhaHouseFromLagna,
        description: `External social perception, status projection, and public manifestation in ${SIGN_NAMES[arudhaSignIndex]} (House ${arudhaHouseFromLagna})`,
      },
      upapadaLagna: {
        signIndex: upapadaSignIndex,
        signName: SIGN_NAMES[upapadaSignIndex],
        houseFromLagna: upapadaHouseFromLagna,
        description: `Sustenance of committed marriage and sacred partnership in ${SIGN_NAMES[upapadaSignIndex]} (House ${upapadaHouseFromLagna})`,
      },
      rashiDrishti,
      charaDashaSequence,
    };
  }
}
