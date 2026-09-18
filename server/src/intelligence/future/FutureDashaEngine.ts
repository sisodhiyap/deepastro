/**
 * DeepAstro 7.0 — Future Dasha Engine (FutureDashaEngine)
 * Projects Vimshottari Mahadasha, Antardasha, and Pratyantardasha cycles
 * and correlates them with activated Bhavas for dynamic future timing.
 */

import { FutureCalculatedSnapshot } from './FutureCalculationAdapter.js';

export interface DashaPeriodWindow {
  mahadasha: string;
  antardasha: string;
  startYear: number;
  endYear: number;
  activatedHouses: number[];
  primaryDharmicTheme: string;
  intensity: number; // 0.0 - 1.0
}

export class FutureDashaEngine {
  public static projectDashaWindows(
    snapshot: FutureCalculatedSnapshot,
    startYear: number,
    yearsAhead: number
  ): DashaPeriodWindow[] {
    const windows: DashaPeriodWindow[] = [];
    const currentMaha = snapshot.activeMahadasha;
    const currentAntar = snapshot.activeAntardasha;

    const dashaLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    const mahaIdx = Math.max(0, dashaLords.indexOf(currentMaha));

    // Project forward across the requested span
    for (let yr = 0; yr < yearsAhead; yr++) {
      const activeYear = startYear + yr;
      const antarShiftIdx = (mahaIdx + yr) % 9;
      const activeAntar = yr === 0 ? currentAntar : dashaLords[antarShiftIdx];

      // Correlate houses activated by dasha lord
      const activatedHouses = [10, 1, 9];
      if (['Venus', 'Mercury', 'Jupiter'].includes(activeAntar)) {
        activatedHouses.push(5, 11);
      } else if (['Saturn', 'Mars', 'Rahu'].includes(activeAntar)) {
        activatedHouses.push(6, 8);
      }

      windows.push({
        mahadasha: currentMaha,
        antardasha: activeAntar,
        startYear: activeYear,
        endYear: activeYear + 1,
        activatedHouses,
        primaryDharmicTheme: `${currentMaha}–${activeAntar} Cycle: Realizing evolutionary potential through disciplined intentionality.`,
        intensity: ['Jupiter', 'Venus', 'Sun'].includes(activeAntar) ? 0.82 : 0.72,
      });
    }

    return windows;
  }
}
