/**
 * DeepAstro 7.0 — Future Transit Engine (FutureTransitEngine)
 * Projects major Gochara (transit) cycles for Saturn, Jupiter, and Rahu/Ketu
 * against natal Lagna and Chandra (Moon) positions.
 */

import { FutureCalculatedSnapshot } from './FutureCalculationAdapter.js';

export interface TransitProjectionYear {
  year: number;
  saturnTransit: { sign: string; houseFromMoon: number; isSadeSati: boolean; theme: string };
  jupiterTransit: { sign: string; houseFromMoon: number; isFavorable: boolean; theme: string };
  rahuKetuAxis: { rahuSign: string; ketuSign: string; axisTheme: string };
  favorableWindows: string[];
  cautionWindows: string[];
}

export class FutureTransitEngine {
  public static projectTransits(
    snapshot: FutureCalculatedSnapshot,
    startYear: number,
    yearsAhead: number
  ): TransitProjectionYear[] {
    const projections: TransitProjectionYear[] = [];
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const moonIdx = Math.max(0, signs.indexOf(snapshot.moonSign));

    // Classical transit rates: Saturn ~2.5 years/sign, Jupiter ~1 year/sign, Rahu ~1.5 years/sign
    // Base 2026 reference: Saturn in Pisces, Jupiter in Taurus/Gemini, Rahu in Aquarius
    const saturnBaseSign = 'Pisces';
    const jupiterBaseSign = 'Taurus';
    const rahuBaseSign = 'Aquarius';

    const saturnStartIdx = signs.indexOf(saturnBaseSign);
    const jupiterStartIdx = signs.indexOf(jupiterBaseSign);
    const rahuStartIdx = signs.indexOf(rahuBaseSign);

    for (let yr = 0; yr < yearsAhead; yr++) {
      const activeYear = startYear + yr;
      const sIdx = (saturnStartIdx + Math.floor(yr / 2.5)) % 12;
      const jIdx = (jupiterStartIdx + yr) % 12;
      const rIdx = (rahuStartIdx - Math.floor(yr / 1.5) + 24) % 12; // Retrograde
      const kIdx = (rIdx + 6) % 12;

      const saturnSign = signs[sIdx];
      const jupiterSign = signs[jIdx];
      const rahuSign = signs[rIdx];
      const ketuSign = signs[kIdx];

      // Houses from Moon
      const saturnHouseFromMoon = ((sIdx - moonIdx + 12) % 12) + 1;
      const isSadeSati = [12, 1, 2].includes(saturnHouseFromMoon);

      const jupiterHouseFromMoon = ((jIdx - moonIdx + 12) % 12) + 1;
      const isJupiterFavorable = [2, 5, 7, 9, 11].includes(jupiterHouseFromMoon);

      projections.push({
        year: activeYear,
        saturnTransit: {
          sign: saturnSign,
          houseFromMoon: saturnHouseFromMoon,
          isSadeSati,
          theme: isSadeSati
            ? `Saturn transiting House ${saturnHouseFromMoon} from Moon: Deep restructuring and karmic discipline.`
            : `Saturn in ${saturnSign}: Grounded foundation building and steady professional endurance.`,
        },
        jupiterTransit: {
          sign: jupiterSign,
          houseFromMoon: jupiterHouseFromMoon,
          isFavorable: isJupiterFavorable,
          theme: isJupiterFavorable
            ? `Jupiter transiting House ${jupiterHouseFromMoon} from Moon: Auspicious expansion, learning, and mentors.`
            : `Jupiter in ${jupiterSign}: Reflective contemplation and consolidating internal resources.`,
        },
        rahuKetuAxis: {
          rahuSign,
          ketuSign,
          axisTheme: `Rahu in ${rahuSign} / Ketu in ${ketuSign}: Evolutionary balance between worldly innovation and spiritual discernment.`,
        },
        favorableWindows: [
          `Q2 ${activeYear}: Jupiter transit peak window supporting new initiatives.`,
          `Q4 ${activeYear}: Direct planetary motion favoring stable execution.`,
        ],
        cautionWindows: [
          `Late Q3 ${activeYear}: Retrograde station calls for thorough review before contractual commitments.`,
        ],
      });
    }

    return projections;
  }
}
