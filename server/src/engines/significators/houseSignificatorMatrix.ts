/**
 * KP House Significator Matrix Engine
 * Builds a comprehensive 12 Houses x 9 Planets matrix.
 * Shows:
 *  - Primary (✓): Level 1 or Level 2
 *  - Secondary (○): Level 3 or Level 4
 *  - None (—)
 * With complete expandable WHY explanation for each cell.
 */

import { PlanetSignificators } from './fourLevelSignificators.js';

export type SignificationGrade = 'PRIMARY' | 'SECONDARY' | 'NONE';

export interface MatrixCell {
  house: number;
  planet: string;
  grade: SignificationGrade;
  symbol: '✓' | '○' | '—';
  levels: (1 | 2 | 3 | 4)[];
  reasons: string[];
}

export interface HouseSignificatorRow {
  house: number;
  planets: Record<string, MatrixCell>;
  primaryPlanets: string[];
  secondaryPlanets: string[];
  allPlanets: string[];
}

export class HouseSignificatorMatrixEngine {
  public static readonly PLANET_LIST = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ];

  /**
   * Generates the 12 x 9 Matrix from computed 4-level significators
   */
  public static generateMatrix(
    significators: Record<string, PlanetSignificators>
  ): HouseSignificatorRow[] {
    const matrix: HouseSignificatorRow[] = [];

    for (let house = 1; house <= 12; house++) {
      const rowCells: Record<string, MatrixCell> = {};
      const primaryPlanets: string[] = [];
      const secondaryPlanets: string[] = [];
      const allPlanets: string[] = [];

      for (const planet of this.PLANET_LIST) {
        const sig = significators[planet];
        const activeLevels: (1 | 2 | 3 | 4)[] = [];
        const reasons: string[] = [];

        if (sig) {
          if (sig.level1.includes(house)) activeLevels.push(1);
          if (sig.level2.includes(house)) activeLevels.push(2);
          if (sig.level3.includes(house)) activeLevels.push(3);
          if (sig.level4.includes(house)) activeLevels.push(4);

          for (const ev of sig.evidence) {
            if (ev.house === house) {
              reasons.push(`[L${ev.level}] ${ev.reason}`);
            }
          }
        }

        let grade: SignificationGrade = 'NONE';
        let symbol: '✓' | '○' | '—' = '—';

        if (activeLevels.includes(1) || activeLevels.includes(2)) {
          grade = 'PRIMARY';
          symbol = '✓';
          primaryPlanets.push(planet);
          allPlanets.push(planet);
        } else if (activeLevels.includes(3) || activeLevels.includes(4)) {
          grade = 'SECONDARY';
          symbol = '○';
          secondaryPlanets.push(planet);
          allPlanets.push(planet);
        }

        rowCells[planet] = {
          house,
          planet,
          grade,
          symbol,
          levels: activeLevels,
          reasons: reasons.length > 0 ? reasons : ['No significator connection detected under KP rules.'],
        };
      }

      matrix.push({
        house,
        planets: rowCells,
        primaryPlanets,
        secondaryPlanets,
        allPlanets,
      });
    }

    return matrix;
  }
}
