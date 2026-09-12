/**
 * KP Four-Level Significator Engine
 * Strictly computes the classical 4-Level KP Significator Hierarchy:
 * - Level 1: Planet in the constellation (star) of an occupant of a house (Strongest)
 * - Level 2: Planet occupying the house
 * - Level 3: Planet in the constellation (star) of the owner of the house
 * - Level 4: Planet owning the house
 * Includes Node (Rahu/Ketu) agent representation.
 */

import { KPPlanetRow } from '../kp/kpPlanetaryTable.js';
import { KPCuspItem } from '../kp/kpCuspEngine.js';

export interface SignificatorEvidence {
  level: 1 | 2 | 3 | 4;
  house: number;
  reason: string;
  sourcePlanet?: string;
}

export interface PlanetSignificators {
  planet: string;
  level1: number[];
  level2: number[];
  level3: number[];
  level4: number[];
  allHouses: number[];
  evidence: SignificatorEvidence[];
}

export class FourLevelSignificatorsEngine {
  /**
   * Calculates the 4-level significators for all 9 planets
   */
  public static calculateSignificators(
    planets: KPPlanetRow[],
    cusps: KPCuspItem[]
  ): Record<string, PlanetSignificators> {
    const result: Record<string, PlanetSignificators> = {};

    // 1. Map occupants of each house (House -> planets occupying it)
    const occupantsByHouse: Record<number, string[]> = {};
    for (let h = 1; h <= 12; h++) occupantsByHouse[h] = [];
    for (const p of planets) {
      occupantsByHouse[p.houseOccupied]?.push(p.planet);
    }

    // 2. Map owners of each house (House -> sign lord of cusp)
    const ownerByHouse: Record<number, string> = {};
    for (const c of cusps) {
      ownerByHouse[c.cusp] = c.signLord;
    }

    // 3. Evaluate each planet
    for (const p of planets) {
      const pName = p.planet;
      const starLordOfP = p.starLord; // Planet in whose star p resides

      const l1Houses: number[] = [];
      const l2Houses: number[] = [];
      const l3Houses: number[] = [];
      const l4Houses: number[] = [];
      const evidenceList: SignificatorEvidence[] = [];

      // LEVEL 2: House occupied by p
      l2Houses.push(p.houseOccupied);
      evidenceList.push({
        level: 2,
        house: p.houseOccupied,
        reason: `${pName} physically occupies House ${p.houseOccupied}`,
      });

      // LEVEL 4: Houses owned by p
      for (const h of p.housesOwned) {
        l4Houses.push(h);
        evidenceList.push({
          level: 4,
          house: h,
          reason: `${pName} rules the sign on Cusp ${h}`,
        });
      }

      // LEVEL 1: Planet in the star of an occupant of a house
      // Find what star lord p is posited in
      const planetWhoseStarOccupied = planets.find(
        (other) => other.planet.toLowerCase() === starLordOfP.toLowerCase()
      );
      if (planetWhoseStarOccupied) {
        const occHouse = planetWhoseStarOccupied.houseOccupied;
        l1Houses.push(occHouse);
        evidenceList.push({
          level: 1,
          house: occHouse,
          reason: `${pName} is in the star (${p.nakshatra}) of ${starLordOfP}, who occupies House ${occHouse}`,
          sourcePlanet: starLordOfP,
        });

        // LEVEL 3: Planet in the star of the owner of a house
        for (const ownedHouse of planetWhoseStarOccupied.housesOwned) {
          l3Houses.push(ownedHouse);
          evidenceList.push({
            level: 3,
            house: ownedHouse,
            reason: `${pName} is in the star (${p.nakshatra}) of ${starLordOfP}, who owns House ${ownedHouse}`,
            sourcePlanet: starLordOfP,
          });
        }
      }

      // Node (Rahu / Ketu) proxy significations:
      // If p is Rahu or Ketu, it also adopts the significations of its sign lord
      if (pName === 'Rahu' || pName === 'Ketu') {
        const signLordPlanet = planets.find(
          (other) => other.planet.toLowerCase() === p.signLord.toLowerCase()
        );
        if (signLordPlanet) {
          evidenceList.push({
            level: 2,
            house: signLordPlanet.houseOccupied,
            reason: `${pName} represents sign lord ${p.signLord} (occupying H${signLordPlanet.houseOccupied})`,
            sourcePlanet: p.signLord,
          });
          l2Houses.push(signLordPlanet.houseOccupied);
        }
      }

      const allUnique = Array.from(
        new Set([...l1Houses, ...l2Houses, ...l3Houses, ...l4Houses])
      ).sort((a, b) => a - b);

      result[pName] = {
        planet: pName,
        level1: Array.from(new Set(l1Houses)).sort((a, b) => a - b),
        level2: Array.from(new Set(l2Houses)).sort((a, b) => a - b),
        level3: Array.from(new Set(l3Houses)).sort((a, b) => a - b),
        level4: Array.from(new Set(l4Houses)).sort((a, b) => a - b),
        allHouses: allUnique,
        evidence: evidenceList,
      };
    }

    return result;
  }
}
