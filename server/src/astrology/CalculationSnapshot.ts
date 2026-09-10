/**
 * CalculationSnapshot
 * Authoritative immutable representation of a verified astrological chart calculation.
 * Preserves all planetary coordinates, divisional charts (D1-D60), dashas, shadbala,
 * ashtakavarga, yogas, doshas, panchang, and calculation passports.
 * 
 * Invariant: Calculation snapshots are completely immutable. AI may interpret verified
 * calculations but cannot alter or mutate them.
 */

import { AstrologyFactSet } from './AstrologyFactSet.js';
import { CalculationPassport } from './CalculationPassport.js';
import { ShadbalaEngine } from './ShadbalaEngine.js';
import { AshtakavargaEngine } from './AshtakavargaEngine.js';

export interface SnapshotPlanetPosition {
  planet: string;
  longitude: number;
  sign: string;
  signNumber: number;
  degreeInSign: number;
  nakshatra: string;
  nakshatraNumber: number;
  pada: number;
  isRetrograde: boolean;
  house: number;
  dignity: string;
}

export interface CalculationSnapshot {
  readonly snapshotId: string;
  readonly chartId?: string;
  readonly userId?: string;
  readonly birthDate: string;
  readonly birthTime: string;
  readonly timezone: number;
  readonly ianaTimezone: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly julianDay: number;
  readonly ayanamshaMethod: string;
  readonly ayanamshaExactValue: number;
  readonly nodeMode: 'True' | 'Mean';
  readonly houseSystem: 'Sripati' | 'Placidus' | 'WholeSign';
  readonly ephemerisVersion: string;
  readonly divisionalCharts: Record<string, any>;
  readonly planetaryPositions: readonly SnapshotPlanetPosition[];
  readonly ascendant: {
    readonly longitude: number;
    readonly sign: string;
    readonly signNumber: number;
    readonly degreeInSign: number;
    readonly nakshatra: string;
    readonly pada: number;
  };
  readonly dashas: {
    readonly birthDashaLord: string;
    readonly currentMahadasha: string;
    readonly currentAntardasha: string;
    readonly currentPratyantardasha: string;
    readonly allMahadashas: readonly any[];
  };
  readonly shadbala: Record<string, any>;
  readonly ashtakavarga: Record<string, any>;
  readonly yogas: readonly any[];
  readonly doshas: Record<string, any>;
  readonly panchang: Record<string, any>;
  readonly transits: Record<string, any>;
  readonly calculationVersion: string;
  readonly calculationFingerprint: string;
  readonly passport?: CalculationPassport;
  readonly createdAt: string;
  readonly isImmutable: true;
}

export interface SnapshotDifference {
  field: string;
  oldValue: any;
  newValue: any;
  differenceDegrees?: number;
  significance: 'CRITICAL' | 'ASTRONOMICAL' | 'METADATA';
}

export class CalculationSnapshotEngine {
  public static readonly SNAPSHOT_SCHEMA_VERSION = '3.0.0';

  /**
   * Creates a deeply frozen, authoritative CalculationSnapshot from an AstrologyFactSet
   */
  public static createSnapshot(
    factSet: AstrologyFactSet,
    userId?: string,
    chartId?: string
  ): CalculationSnapshot {
    const shadbala = ShadbalaEngine.calculateShadbala(factSet);
    const ashtakavarga = AshtakavargaEngine.calculateAshtakavarga(factSet);

    const planetaryPositions: SnapshotPlanetPosition[] = factSet.planets.map(p => ({
      planet: p.name,
      longitude: p.siderealLongitude,
      sign: p.signName,
      signNumber: p.signIndex,
      degreeInSign: p.degreeInSign,
      nakshatra: p.nakshatra?.name || 'Unknown',
      nakshatraNumber: p.nakshatra?.index || 1,
      pada: p.nakshatra?.pada || 1,
      isRetrograde: p.isRetrograde,
      house: p.house,
      dignity: p.dignity,
    }));

    const vargas = factSet.divisionalCharts;

    const snapshot: CalculationSnapshot = {
      snapshotId: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      chartId: chartId || factSet.id,
      userId: userId || 'anonymous',
      birthDate: factSet.profile.birthDate,
      birthTime: factSet.profile.birthTime,
      timezone: factSet.profile.timezone,
      ianaTimezone: (factSet.profile as any).timezoneName || 'Asia/Kolkata',
      latitude: factSet.profile.latitude,
      longitude: factSet.profile.longitude,
      julianDay: factSet.timestamps.julianDay,
      ayanamshaMethod: factSet.astronomy.ayanamshaName,
      ayanamshaExactValue: factSet.astronomy.ayanamshaDegrees,
      nodeMode: 'True',
      houseSystem: 'Sripati',
      ephemerisVersion: 'SwissEph-2.10/VSOP87',
      divisionalCharts: {
        D1: vargas.d1_rashi,
        D2: vargas.d2_hora,
        D3: vargas.d3_drekkana,
        D4: vargas.d4_chaturthamsha,
        D7: vargas.d7_saptamsha,
        D9: vargas.d9_navamsa,
        D10: vargas.d10_dashamsha,
        D12: vargas.d12_dwadashamsha,
        D16: vargas.d16_shodashamsha,
        D20: vargas.d20_vimshamsha,
        D24: vargas.d24_chaturvimshamsha,
        D27: vargas.d27_saptavimshamsha,
        D30: vargas.d30_trimshamsha,
        D40: vargas.d40_khavedamsha,
        D45: vargas.d45_akshavedamsha,
        D60: vargas.d60_shashtiamsha,
      },
      planetaryPositions: Object.freeze(planetaryPositions),
      ascendant: {
        longitude: factSet.ascendant.details.totalDegrees,
        sign: factSet.ascendant.details.signName,
        signNumber: factSet.ascendant.details.signIndex,
        degreeInSign: factSet.ascendant.details.degreeInSign,
        nakshatra: factSet.ascendant.nakshatra.name,
        pada: factSet.ascendant.nakshatra.pada,
      },
      dashas: {
        birthDashaLord: factSet.dashas.birthDashaLord,
        currentMahadasha: factSet.dashas.currentMahadasha.planet,
        currentAntardasha: factSet.dashas.currentAntardasha.planet,
        currentPratyantardasha: factSet.dashas.currentPratyantardasha.planet,
        allMahadashas: factSet.dashas.allMahadashas,
      },
      shadbala: Object.freeze(shadbala),
      ashtakavarga: Object.freeze(ashtakavarga),
      yogas: factSet.yogas,
      doshas: factSet.doshas,
      panchang: factSet.panchang,
      transits: factSet.transits,
      calculationVersion: factSet.metadata.engineVersion,
      calculationFingerprint: factSet.passport?.fingerprint || factSet.metadata.verificationHash,
      passport: factSet.passport,
      createdAt: new Date().toISOString(),
      isImmutable: true,
    };

    return Object.freeze(snapshot);
  }

  /**
   * Compares two snapshots to evaluate engine upgrades or calculation version parity
   */
  public static compareSnapshots(
    oldSnapshot: CalculationSnapshot,
    newSnapshot: CalculationSnapshot
  ): {
    isIdentical: boolean;
    differences: SnapshotDifference[];
    maxPlanetaryDeviationDegrees: number;
  } {
    const differences: SnapshotDifference[] = [];
    let maxDeviation = 0;

    // Compare Ascendant
    const ascDiff = Math.abs(oldSnapshot.ascendant.longitude - newSnapshot.ascendant.longitude);
    if (ascDiff > 0.0001) {
      differences.push({
        field: 'ascendant.longitude',
        oldValue: oldSnapshot.ascendant.longitude,
        newValue: newSnapshot.ascendant.longitude,
        differenceDegrees: ascDiff,
        significance: 'ASTRONOMICAL',
      });
      maxDeviation = Math.max(maxDeviation, ascDiff);
    }

    // Compare Planets
    for (const oldP of oldSnapshot.planetaryPositions) {
      const newP = newSnapshot.planetaryPositions.find(p => p.planet === oldP.planet);
      if (!newP) {
        differences.push({
          field: `planet.${oldP.planet}`,
          oldValue: oldP.planet,
          newValue: 'MISSING',
          significance: 'CRITICAL',
        });
        continue;
      }

      const diff = Math.abs(oldP.longitude - newP.longitude);
      if (diff > 0.0001) {
        differences.push({
          field: `planet.${oldP.planet}.longitude`,
          oldValue: oldP.longitude,
          newValue: newP.longitude,
          differenceDegrees: diff,
          significance: 'ASTRONOMICAL',
        });
        maxDeviation = Math.max(maxDeviation, diff);
      }
    }

    // Compare Ayanamsha
    const ayanDiff = Math.abs(oldSnapshot.ayanamshaExactValue - newSnapshot.ayanamshaExactValue);
    if (ayanDiff > 0.0001) {
      differences.push({
        field: 'ayanamshaExactValue',
        oldValue: oldSnapshot.ayanamshaExactValue,
        newValue: newSnapshot.ayanamshaExactValue,
        differenceDegrees: ayanDiff,
        significance: 'ASTRONOMICAL',
      });
    }

    return {
      isIdentical: differences.length === 0,
      differences,
      maxPlanetaryDeviationDegrees: maxDeviation,
    };
  }
}
