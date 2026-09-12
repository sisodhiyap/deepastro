/**
 * KP System Configuration Engine — RULESET_KP_V1
 * Strict Configuration for Krishnamurti Paddhati (KP) Calculations.
 *
 * Invariants:
 * - KP utilizes unequal Placidus house cusps.
 * - Whole-sign houses are strictly forbidden for KP cusps.
 * - Star/Sub/Sub-sub lords are calculated with continuous, unrounded precision.
 */

export type KPAyanamsaType = 'KP_NEW' | 'KP_ORIGINAL' | 'LAHIRI';
export type KPHouseSystem = 'Placidus';

export interface KPConfig {
  KP_MODE: boolean;
  KP_AYANAMSA: KPAyanamsaType;
  HOUSE_SYSTEM: KPHouseSystem;
  VERSION: string;
}

export interface KPCalculationMetadata {
  kpAyanamsa: KPAyanamsaType;
  ayanamsaValue: number;
  houseSystem: KPHouseSystem;
  latitude: number;
  longitude: number;
  calculationTimestamp: string;
  calculationVersion: string;
}

export const DEFAULT_KP_CONFIG: KPConfig = {
  KP_MODE: true,
  KP_AYANAMSA: 'KP_NEW',
  HOUSE_SYSTEM: 'Placidus',
  VERSION: 'RULESET_KP_V1',
};

export class KPConfigEngine {
  private static activeConfig: KPConfig = { ...DEFAULT_KP_CONFIG };

  public static getConfig(): KPConfig {
    return { ...this.activeConfig };
  }

  public static setConfig(overrides: Partial<KPConfig>): KPConfig {
    if (overrides.HOUSE_SYSTEM && overrides.HOUSE_SYSTEM !== 'Placidus') {
      throw new Error('KP_INVALID_CONFIG: KP system strictly mandates Placidus house system.');
    }
    this.activeConfig = {
      ...this.activeConfig,
      ...overrides,
    };
    return this.getConfig();
  }

  public static buildMetadata(params: {
    ayanamsaValue: number;
    latitude: number;
    longitude: number;
    config?: Partial<KPConfig>;
  }): KPCalculationMetadata {
    const cfg = params.config ? { ...this.activeConfig, ...params.config } : this.activeConfig;
    return {
      kpAyanamsa: cfg.KP_AYANAMSA,
      ayanamsaValue: params.ayanamsaValue,
      houseSystem: cfg.HOUSE_SYSTEM,
      latitude: params.latitude,
      longitude: params.longitude,
      calculationTimestamp: new Date().toISOString(),
      calculationVersion: cfg.VERSION,
    };
  }
}
