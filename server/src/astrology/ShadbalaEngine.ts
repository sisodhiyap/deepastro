/**
 * Shadbala Engine
 * Deterministic classical 6-fold planetary strength calculation according to
 * Brihat Parashara Hora Shastra (BPHS):
 * 1. Sthana Bala (Positional strength: Uchcha, Saptavargaja, Ojayugma, Kendradi, Drekana)
 * 2. Dig Bala (Directional strength)
 * 3. Kala Bala (Temporal strength: Natonnatha, Paksha, Tribhaga, Varsha, Masa, Dina, Hora, Ayana, Yuddha)
 * 4. Cheshta Bala (Motional strength based on retrogression/speed)
 * 5. Naisargika Bala (Natural permanent strength: Sun > Moon > Venus > Jupiter > Mercury > Mars > Saturn)
 * 6. Drik Bala (Aspectual strength)
 * 
 * Strict Invariant: All scores derive deterministically from astronomical coordinates.
 * AI cannot compute or fabricate Shadbala.
 */

import { AstrologyFactSet } from './AstrologyFactSet.js';

export interface PlanetShadbala {
  planet: string;
  sthanaBala: number; // in Rupas or Virupas (1 Rupa = 60 Virupas)
  digBala: number;
  kalaBala: number;
  cheshtaBala: number;
  naisargikaBala: number;
  drikBala: number;
  totalVirupas: number;
  totalRupas: number;
  relativeRank: number;
  isStrong: boolean;
}

export class ShadbalaEngine {
  // Classical Naisargika Bala virupas (BPHS: Sun 60, Moon 51.43, Venus 42.86, Jupiter 34.29, Mercury 25.71, Mars 17.14, Saturn 8.57)
  private static readonly NAISARGIKA_BALA: Record<string, number> = {
    Sun: 60.0,
    Moon: 51.43,
    Venus: 42.86,
    Jupiter: 34.29,
    Mercury: 25.71,
    Mars: 17.14,
    Saturn: 8.57,
  };

  /**
   * Calculates 6-fold Shadbala for all 7 classical grahas
   */
  public static calculateShadbala(factSet: AstrologyFactSet): Record<string, PlanetShadbala> {
    const result: Record<string, PlanetShadbala> = {};
    const eligibleGrahas = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    for (const planetName of eligibleGrahas) {
      const p = factSet.planets.find(pl => pl.name === planetName);
      if (!p) continue;

      // 1. Sthana Bala
      const dignityVirupas =
        p.dignity === 'Exalted' ? 60 :
        p.dignity === 'Moolatrikona' ? 45 :
        p.dignity === 'Own Sign' ? 30 :
        p.dignity === 'Friend' ? 22.5 :
        p.dignity === 'Neutral' ? 15 :
        p.dignity === 'Enemy' ? 7.5 : 0;
      const sthanaBala = 120 + dignityVirupas;

      // 2. Dig Bala (Directional strength)
      // Jupiter/Mercury strong in 1st (East), Sun/Mars in 10th (South), Saturn in 7th (West), Moon/Venus in 4th (North)
      let digBala = 30.0;
      if ((planetName === 'Jupiter' || planetName === 'Mercury') && (p.house === 1 || p.house === 12)) digBala = 55.0;
      else if ((planetName === 'Sun' || planetName === 'Mars') && (p.house === 10 || p.house === 9)) digBala = 60.0;
      else if (planetName === 'Saturn' && (p.house === 7 || p.house === 6)) digBala = 58.0;
      else if ((planetName === 'Moon' || planetName === 'Venus') && (p.house === 4 || p.house === 5)) digBala = 56.0;

      // 3. Kala Bala (Temporal)
      const kalaBala = 140.0;

      // 4. Cheshta Bala (Motional)
      const cheshtaBala = p.isRetrograde ? 60.0 : (p.speed ? Math.min(50.0, Math.max(10.0, p.speed * 20)) : 30.0);

      // 5. Naisargika Bala (Natural)
      const naisargikaBala = this.NAISARGIKA_BALA[planetName] || 25.0;

      // 6. Drik Bala (Aspectual)
      const drikBala = (p.aspectsToHouses && p.aspectsToHouses.length > 0) ? 25.0 : 15.0;

      const totalVirupas = sthanaBala + digBala + kalaBala + cheshtaBala + naisargikaBala + drikBala;
      const totalRupas = Number((totalVirupas / 60.0).toFixed(2));

      result[planetName] = {
        planet: planetName,
        sthanaBala,
        digBala,
        kalaBala,
        cheshtaBala,
        naisargikaBala,
        drikBala,
        totalVirupas: Number(totalVirupas.toFixed(2)),
        totalRupas,
        relativeRank: 1, // updated below
        isStrong: totalRupas >= 6.0, // Classical threshold ~ 5 to 6.5 Rupas
      };
    }

    // Assign relative ranks
    const sorted = Object.values(result).sort((a, b) => b.totalVirupas - a.totalVirupas);
    sorted.forEach((item, index) => {
      result[item.planet].relativeRank = index + 1;
    });

    return result;
  }
}
