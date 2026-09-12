/**
 * KP Sub-Division Engine
 * Implements the complete deterministic KP stellar sub-division model:
 * Sign Lord -> Star Lord -> Sub Lord -> Sub-Sub Lord -> Sub-Sub-Sub Lord
 * Includes the 249-Sub division index mapping and high-precision boundary continuity.
 */

export const VIMSHOTTARI_LORDS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
] as const;

export type PlanetLord = typeof VIMSHOTTARI_LORDS[number];

export const VIMSHOTTARI_YEARS: Record<PlanetLord, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const SIGN_LORDS: Record<number, string> = {
  0: 'Mars',
  1: 'Venus',
  2: 'Mercury',
  3: 'Moon',
  4: 'Sun',
  5: 'Mercury',
  6: 'Venus',
  7: 'Mars',
  8: 'Jupiter',
  9: 'Saturn',
  10: 'Saturn',
  11: 'Jupiter',
};

export const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Svati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

export interface SubDivisionDetails {
  longitude: number;
  signIndex: number;
  signName: string;
  signLord: string;
  nakshatraIndex: number;
  nakshatraName: string;
  nakshatraNumber: number; // 1-27
  pada: number; // 1-4
  starLord: string;
  subLord: string;
  subSubLord: string;
  subSubSubLord: string;
  degInSign: number;
  degInNakshatra: number;
  degInSub: number;
  subNumber249: number; // 1-249
}

export class KPSubDivisionEngine {
  public static readonly NAKSHATRA_SPAN = 360.0 / 27.0; // 13.333333333333334°

  /**
   * Normalize longitude to [0, 360)
   */
  public static normalize(deg: number): number {
    let d = deg % 360.0;
    if (d < 0) d += 360.0;
    return Math.abs(d) < 1e-12 ? 0 : d;
  }

  public static getSignLord(longitude: number): string {
    const norm = this.normalize(longitude);
    const signIdx = Math.floor(norm / 30.0);
    return SIGN_LORDS[signIdx];
  }

  public static getNakshatra(longitude: number): {
    index: number;
    name: string;
    number: number;
    pada: number;
    degInNakshatra: number;
  } {
    const norm = this.normalize(longitude);
    const nakshatraIndex = Math.min(26, Math.floor(norm / this.NAKSHATRA_SPAN));
    const degInNakshatra = norm - nakshatraIndex * this.NAKSHATRA_SPAN;
    const padaSpan = this.NAKSHATRA_SPAN / 4.0;
    const pada = Math.min(4, Math.floor(degInNakshatra / padaSpan) + 1);

    return {
      index: nakshatraIndex,
      name: NAKSHATRA_NAMES[nakshatraIndex],
      number: nakshatraIndex + 1,
      pada,
      degInNakshatra,
    };
  }

  public static getStarLord(longitude: number): string {
    const { index } = this.getNakshatra(longitude);
    return VIMSHOTTARI_LORDS[index % 9];
  }

  public static getSubLord(longitude: number): { subLord: string; degInSub: number; subSpan: number } {
    const norm = this.normalize(longitude);
    const nakshatraIndex = Math.min(26, Math.floor(norm / this.NAKSHATRA_SPAN));
    const degInNakshatra = norm - nakshatraIndex * this.NAKSHATRA_SPAN;
    const starLordIndex = nakshatraIndex % 9;

    let accumulated = 0;
    let selectedLord: string = VIMSHOTTARI_LORDS[starLordIndex];
    let selectedSpan = 0;
    let degInSub = 0;

    for (let i = 0; i < 9; i++) {
      const lordIdx = (starLordIndex + i) % 9;
      const lord = VIMSHOTTARI_LORDS[lordIdx];
      const span = (this.NAKSHATRA_SPAN * VIMSHOTTARI_YEARS[lord]) / 120.0;

      if (degInNakshatra >= accumulated && (degInNakshatra < accumulated + span || i === 8)) {
        selectedLord = lord;
        selectedSpan = span;
        degInSub = degInNakshatra - accumulated;
        break;
      }
      accumulated += span;
    }

    return { subLord: selectedLord, degInSub, subSpan: selectedSpan };
  }

  public static getSubSubLord(longitude: number): { subSubLord: string; degInSubSub: number } {
    const { subLord, degInSub, subSpan } = this.getSubLord(longitude);
    const subLordIdx = VIMSHOTTARI_LORDS.indexOf(subLord as PlanetLord);

    let accumulated = 0;
    let selectedLord: string = subLord;
    let degInSubSub = 0;

    for (let i = 0; i < 9; i++) {
      const lordIdx = (subLordIdx + i) % 9;
      const lord = VIMSHOTTARI_LORDS[lordIdx];
      const span = (subSpan * VIMSHOTTARI_YEARS[lord]) / 120.0;

      if (degInSub >= accumulated && (degInSub < accumulated + span || i === 8)) {
        selectedLord = lord;
        degInSubSub = degInSub - accumulated;
        break;
      }
      accumulated += span;
    }

    return { subSubLord: selectedLord, degInSubSub };
  }

  public static getSubSubSubLord(longitude: number): string {
    const { subLord, degInSub, subSpan } = this.getSubLord(longitude);
    const subLordIdx = VIMSHOTTARI_LORDS.indexOf(subLord as PlanetLord);

    let accumulatedSubSub = 0;
    let subSubLordIdx = subLordIdx;
    let subSubSpan = 0;
    let degInSubSub = 0;

    for (let i = 0; i < 9; i++) {
      const idx = (subLordIdx + i) % 9;
      const lord = VIMSHOTTARI_LORDS[idx];
      const span = (subSpan * VIMSHOTTARI_YEARS[lord]) / 120.0;
      if (degInSub >= accumulatedSubSub && (degInSub < accumulatedSubSub + span || i === 8)) {
        subSubLordIdx = idx;
        subSubSpan = span;
        degInSubSub = degInSub - accumulatedSubSub;
        break;
      }
      accumulatedSubSub += span;
    }

    let accumulatedSub3 = 0;
    let selectedLord: string = VIMSHOTTARI_LORDS[subSubLordIdx];

    for (let i = 0; i < 9; i++) {
      const idx = (subSubLordIdx + i) % 9;
      const lord = VIMSHOTTARI_LORDS[idx];
      const span = (subSubSpan * VIMSHOTTARI_YEARS[lord]) / 120.0;
      if (degInSubSub >= accumulatedSub3 && (degInSubSub < accumulatedSub3 + span || i === 8)) {
        selectedLord = lord;
        break;
      }
      accumulatedSub3 += span;
    }

    return selectedLord;
  }

  /**
   * Computes the 1-249 KP Horary Sub number
   * 249 is reached because the 27 nakshatras x 9 subs = 243 subs,
   * plus 6 sub-lords that are split by zodiac sign boundaries (Aries/Taurus, Cancer/Leo, etc.),
   * yielding exactly 249 distinct sign-nakshatra-sub intervals.
   */
  public static getKP249SubNumber(longitude: number): number {
    const norm = this.normalize(longitude);
    let count = 0;

    for (let n = 0; n < 27; n++) {
      const nStart = n * this.NAKSHATRA_SPAN;
      const starLordIdx = n % 9;

      let subAccum = 0;
      for (let s = 0; s < 9; s++) {
        const subLordIdx = (starLordIdx + s) % 9;
        const subLord = VIMSHOTTARI_LORDS[subLordIdx];
        const span = (this.NAKSHATRA_SPAN * VIMSHOTTARI_YEARS[subLord]) / 120.0;
        const subStart = nStart + subAccum;
        const subEnd = subStart + span;

        const startSign = Math.floor(subStart / 30.0);
        const endSign = Math.floor((subEnd - 1e-9) / 30.0);

        if (startSign !== endSign) {
          // Crosses sign boundary: split into 2 table entries
          count++;
          if (norm >= subStart && norm < (startSign + 1) * 30.0) {
            return count;
          }
          count++;
          if (norm >= (startSign + 1) * 30.0 && norm < subEnd + 1e-9) {
            return count;
          }
        } else {
          count++;
          if (norm >= subStart && norm < subEnd + 1e-9) {
            return count;
          }
        }
        subAccum += span;
      }
    }
    return Math.min(249, Math.max(1, count));
  }

  /**
   * Reverse lookup: Given a KP Horary seed number (1 to 249),
   * returns the starting longitude and division details for that sub.
   */
  public static getLongitudeFor249Seed(seedNumber: number): {
    startLongitude: number;
    endLongitude: number;
    signIndex: number;
    signName: string;
    signLord: string;
    nakshatraName: string;
    starLord: string;
    subLord: string;
  } {
    const target = Math.max(1, Math.min(249, Math.round(seedNumber)));
    let count = 0;

    for (let n = 0; n < 27; n++) {
      const nStart = n * this.NAKSHATRA_SPAN;
      const starLordIdx = n % 9;
      const starLord = VIMSHOTTARI_LORDS[starLordIdx];

      let subAccum = 0;
      for (let s = 0; s < 9; s++) {
        const subLordIdx = (starLordIdx + s) % 9;
        const subLord = VIMSHOTTARI_LORDS[subLordIdx];
        const span = (this.NAKSHATRA_SPAN * VIMSHOTTARI_YEARS[subLord]) / 120.0;
        const subStart = nStart + subAccum;
        const subEnd = subStart + span;

        const startSign = Math.floor(subStart / 30.0);
        const endSign = Math.floor((subEnd - 1e-9) / 30.0);

        if (startSign !== endSign) {
          // Part 1: in startSign
          count++;
          if (count === target) {
            return {
              startLongitude: subStart,
              endLongitude: (startSign + 1) * 30.0,
              signIndex: startSign,
              signName: ZODIAC_SIGNS[startSign],
              signLord: SIGN_LORDS[startSign],
              nakshatraName: NAKSHATRA_NAMES[n],
              starLord,
              subLord,
            };
          }
          // Part 2: in endSign
          count++;
          if (count === target) {
            return {
              startLongitude: (startSign + 1) * 30.0,
              endLongitude: subEnd,
              signIndex: endSign,
              signName: ZODIAC_SIGNS[endSign],
              signLord: SIGN_LORDS[endSign],
              nakshatraName: NAKSHATRA_NAMES[n],
              starLord,
              subLord,
            };
          }
        } else {
          count++;
          if (count === target) {
            return {
              startLongitude: subStart,
              endLongitude: subEnd,
              signIndex: startSign,
              signName: ZODIAC_SIGNS[startSign],
              signLord: SIGN_LORDS[startSign],
              nakshatraName: NAKSHATRA_NAMES[n],
              starLord,
              subLord,
            };
          }
        }
        subAccum += span;
      }
    }

    // Default fallback to 0° Aries
    return {
      startLongitude: 0,
      endLongitude: 0.77777778,
      signIndex: 0,
      signName: 'Aries',
      signLord: 'Mars',
      nakshatraName: 'Ashwini',
      starLord: 'Ketu',
      subLord: 'Ketu',
    };
  }

  /**
   * Resolves complete sub-division details for any sidereal coordinate
   */
  public static resolveDetails(longitude: number): SubDivisionDetails {
    const norm = this.normalize(longitude);
    const signIndex = Math.floor(norm / 30.0);
    const degInSign = norm % 30.0;
    const signLord = SIGN_LORDS[signIndex];

    const nakshatra = this.getNakshatra(norm);
    const starLord = VIMSHOTTARI_LORDS[nakshatra.index % 9];
    const { subLord, degInSub } = this.getSubLord(norm);
    const { subSubLord } = this.getSubSubLord(norm);
    const subSubSubLord = this.getSubSubSubLord(norm);
    const subNumber249 = this.getKP249SubNumber(norm);

    return {
      longitude: norm,
      signIndex,
      signName: ZODIAC_SIGNS[signIndex],
      signLord,
      nakshatraIndex: nakshatra.index,
      nakshatraName: nakshatra.name,
      nakshatraNumber: nakshatra.number,
      pada: nakshatra.pada,
      starLord,
      subLord,
      subSubLord,
      subSubSubLord,
      degInSign,
      degInNakshatra: nakshatra.degInNakshatra,
      degInSub,
      subNumber249,
    };
  }
}
