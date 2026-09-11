/**
 * DeepAstro Phase 6 — Methodology Profiles, Variants & Calculation Passport
 * 
 * Defines reproducible computation profiles, methodology variants (Parashari vs Jaimini vs KP),
 * and immutable knowledge snapshots.
 * 
 * Strict Invariant:
 * Never silently choose between conflicting classical traditions.
 * Explicitly document methodology variants with their respective sources and conditions.
 */

export interface MethodologyVariant {
  methodologyId: string;
  traditionName: 'PARASHARI' | 'JAIMINI' | 'KP' | 'CUSTOM';
  definition: string;
  conditions: string[];
  sourceId: string;
  version: string;
  isDefault: boolean;
}

export interface JyotishMethodologyProfile {
  profileId: string;
  name: string;
  ayanamsha: 'LAHIRI' | 'KRISHNAMURTI' | 'RAMAN' | 'FAGAN_BRADLEY';
  nodeType: 'TRUE_NODE' | 'MEAN_NODE';
  houseSystem: 'WHOLE_SIGN' | 'SRIPATI' | 'PLACIDUS';
  chartStyle: 'NORTH_INDIAN' | 'SOUTH_INDIAN' | 'EAST_INDIAN';
  dashaSystem: 'VIMSHOTTARI_120' | 'YOGINI_36' | 'CHARA_JAIMINI';
  vargaMethod: 'PARASHARI_TRADITIONAL' | 'JAIMINI_VARGA';
  jaiminiConfig: {
    karakaScheme: '7_KARAKA' | '8_KARAKA';
    arudhaExceptionRule: 'ADVANCE_10_HOUSES' | 'NO_EXCEPTION';
    charDashaVariant: 'KN_RAO' | 'SUTRAS_CANONICAL';
  };
  kpConfig: {
    ayanamsha: 'KP_NEW' | 'KP_OLD';
    cuspSystem: 'PLACIDUS';
    subLordSubdivisions: 249;
  };
  panchangMethod: 'DRIG_GANITA' | 'SURYA_SIDDHANTA';
  version: string;
}

export interface CalculationPassportV2 {
  passportId: string;
  calculationVersion: string;
  ephemerisVersion: string;
  ayanamsha: {
    name: string;
    degrees: number;
  };
  timezoneDatabaseVersion: string;
  locationCoordinates: {
    latitude: number;
    longitude: number;
  };
  utcTimestamp: string;
  localTimestamp: string;
  julianDay: number;
  methodologyProfile: JyotishMethodologyProfile;
  engineVersion: string;
  inputHash: string;
  outputHash: string;
  createdAt: string;
}

export interface KnowledgeSnapshot {
  snapshotId: string;
  calculationSnapshotId: string;
  knowledgeVersion: string;
  ruleVersions: Record<string, string>; // ruleId -> version
  researchSnapshotId?: string;
  lifeContextSnapshotId?: string;
  methodologyProfileId: string;
  createdAt: string;
}

export class MethodologyService {
  public static readonly DEFAULT_PROFILE: JyotishMethodologyProfile = {
    profileId: 'METHOD_DEFAULT_PARASHARI',
    name: 'Canonical Parashari Standard (Lahiri + Whole Sign + Vimshottari)',
    ayanamsha: 'LAHIRI',
    nodeType: 'TRUE_NODE',
    houseSystem: 'WHOLE_SIGN',
    chartStyle: 'NORTH_INDIAN',
    dashaSystem: 'VIMSHOTTARI_120',
    vargaMethod: 'PARASHARI_TRADITIONAL',
    jaiminiConfig: {
      karakaScheme: '7_KARAKA',
      arudhaExceptionRule: 'ADVANCE_10_HOUSES',
      charDashaVariant: 'SUTRAS_CANONICAL',
    },
    kpConfig: {
      ayanamsha: 'KP_NEW',
      cuspSystem: 'PLACIDUS',
      subLordSubdivisions: 249,
    },
    panchangMethod: 'DRIG_GANITA',
    version: '6.0.0',
  };

  private static variants: Map<string, MethodologyVariant[]> = new Map(); // concept/ruleId -> variants
  private static userProfiles: Map<string, JyotishMethodologyProfile> = new Map();

  static {
    this.seedVariants();
  }

  /**
   * Registers a methodology variant for a rule or concept
   */
  public static registerVariant(ruleOrConceptId: string, variant: MethodologyVariant): void {
    if (!this.variants.has(ruleOrConceptId)) {
      this.variants.set(ruleOrConceptId, []);
    }
    this.variants.get(ruleOrConceptId)!.push(Object.freeze(variant));
  }

  /**
   * Retrieves all conflicting or alternative methodology variants for a rule or concept
   */
  public static getVariants(ruleOrConceptId: string): MethodologyVariant[] {
    return this.variants.get(ruleOrConceptId) || [];
  }

  /**
   * Retrieves user's methodology profile or defaults to canonical Parashari
   */
  public static getUserProfile(userId: string): JyotishMethodologyProfile {
    return this.userProfiles.get(userId) || this.DEFAULT_PROFILE;
  }

  /**
   * Updates user's methodology profile
   */
  public static setUserProfile(userId: string, profile: Partial<JyotishMethodologyProfile>): JyotishMethodologyProfile {
    const current = this.getUserProfile(userId);
    const updated: JyotishMethodologyProfile = {
      ...current,
      ...profile,
      profileId: `user_profile_${userId}`,
      version: '6.0.0',
    };
    this.userProfiles.set(userId, Object.freeze(updated));
    return updated;
  }

  /**
   * Creates a KnowledgeSnapshot binding a prediction to exact knowledge and calculation states
   */
  public static createKnowledgeSnapshot(input: {
    calculationSnapshotId: string;
    ruleVersions: Record<string, string>;
    researchSnapshotId?: string;
    lifeContextSnapshotId?: string;
    methodologyProfileId?: string;
  }): KnowledgeSnapshot {
    return {
      snapshotId: `ksnap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      calculationSnapshotId: input.calculationSnapshotId,
      knowledgeVersion: '6.0.0',
      ruleVersions: input.ruleVersions,
      researchSnapshotId: input.researchSnapshotId,
      lifeContextSnapshotId: input.lifeContextSnapshotId,
      methodologyProfileId: input.methodologyProfileId || this.DEFAULT_PROFILE.profileId,
      createdAt: new Date().toISOString(),
    };
  }

  private static seedVariants(): void {
    // Chara Karaka Scheme: 7-Karaka (Parashara/Jaimini standard) vs 8-Karaka (including Rahu)
    this.registerVariant('CONCEPT_CHARA_KARAKA', {
      methodologyId: 'VAR_CHARA_7',
      traditionName: 'PARASHARI',
      definition: '7-Karaka system: Only 7 physical grahas are considered. Rahu and Ketu are excluded from chara karaka determination.',
      conditions: ['Compute highest degrees among Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn'],
      sourceId: 'SRC_BPHS_PARASHARA',
      version: '1.0.0',
      isDefault: true,
    });

    this.registerVariant('CONCEPT_CHARA_KARAKA', {
      methodologyId: 'VAR_CHARA_8',
      traditionName: 'JAIMINI',
      definition: '8-Karaka system: Rahu is evaluated alongside 7 physical grahas by calculating (30 - Rahu degree) to reflect retrograde motion.',
      conditions: ['Evaluate 8 grahas including Rahu reverse degrees'],
      sourceId: 'SRC_JAIMINI_UPADESHA',
      version: '1.0.0',
      isDefault: false,
    });

    // Yoga: Amrita Yoga / Pushkara Navamsha interpretation
    this.registerVariant('RULE_YOGA_GAJA_KESARI', {
      methodologyId: 'VAR_GK_STANDARD',
      traditionName: 'PARASHARI',
      definition: 'Standard Parashari: Jupiter in Kendra (1, 4, 7, 10) from the Moon.',
      conditions: ['Jupiter in houses 1, 4, 7, 10 from natal Moon'],
      sourceId: 'SRC_BPHS_PARASHARA',
      version: '1.0.0',
      isDefault: true,
    });

    this.registerVariant('RULE_YOGA_GAJA_KESARI', {
      methodologyId: 'VAR_GK_STRICT_BENEFIC',
      traditionName: 'CUSTOM',
      definition: 'Strict Traditional: Jupiter in Kendra from Moon, but Moon must not be waning Krishna Chaturdashi/Amavasya, and Jupiter must not be conjunct Rahu.',
      conditions: ['Jupiter in Kendra from Moon', 'Moon has Paksha Bala > 60', 'Jupiter not within 5 degrees of Rahu'],
      sourceId: 'SRC_PHALADEEPIKA',
      version: '1.0.0',
      isDefault: false,
    });
  }
}
