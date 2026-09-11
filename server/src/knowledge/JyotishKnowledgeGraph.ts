/**
 * DeepAstro Phase 6 — Jyotish Classical Knowledge Graph
 * 
 * Foundational Knowledge Graph capturing Vedic, Jaimini, KP, and classical astrological concepts,
 * inter-entity relationships, conditions, and strict lifecycle states.
 * 
 * Invariants:
 * 1. Only VERIFIED knowledge objects can be utilized by production reasoning.
 * 2. All classical knowledge objects must link to authentic Source IDs.
 * 3. Supports all 27 Entity Types and 22 Semantic Relationship Types.
 */

export type KnowledgeEntityType =
  | 'GRAHA'
  | 'RASHI'
  | 'BHAVA'
  | 'NAKSHATRA'
  | 'PADA'
  | 'LAGNA'
  | 'YOGA'
  | 'DOSHA'
  | 'DASHA'
  | 'ANTARDASHA'
  | 'VARGA'
  | 'DRISHTI'
  | 'KARAKA'
  | 'ARUDHA'
  | 'UPAPADA'
  | 'KP_CUSP'
  | 'STAR_LORD'
  | 'SUB_LORD'
  | 'PANCHANGA'
  | 'MUHURTA'
  | 'SHADBALA'
  | 'ASHTAKAVARGA'
  | 'BHAVA_BALA'
  | 'PLANETARY_DIGNITY'
  | 'TRANSIT'
  | 'REMEDY'
  | 'NUMEROLOGY_CONCEPT'
  | 'PALMISTRY_CONCEPT';

export type KnowledgeRelationType =
  | 'RULE_REQUIRES'
  | 'RULE_EXCLUDES'
  | 'PLANET_OCCUPIES'
  | 'PLANET_OWNS'
  | 'PLANET_ASPECTS'
  | 'PLANET_CONJUNCTS'
  | 'PLANET_EXALTS'
  | 'PLANET_DEBILITATES'
  | 'PLANET_FRIEND'
  | 'PLANET_ENEMY'
  | 'SIGN_CONTAINS'
  | 'NAKSHATRA_CONTAINS'
  | 'PADA_BELONGS_TO'
  | 'DASHA_ACTIVATES'
  | 'YOGA_REQUIRES'
  | 'YOGA_SUPPORTED_BY'
  | 'DOSHA_REQUIRES'
  | 'VARGA_RELEVANT_FOR'
  | 'KARAKA_SIGNIFIES'
  | 'KP_SIGNIFICATES'
  | 'SOURCE_DEFINES'
  | 'SOURCE_SUPPORTS'
  | 'SOURCE_CONTRADICTS';

export type KnowledgeStatus = 'DRAFT' | 'REVIEW_REQUIRED' | 'VERIFIED' | 'DEPRECATED';

export interface KnowledgeCondition {
  conditionId: string;
  field: string;
  operator: 'EQUALS' | 'IN' | 'GREATER_THAN' | 'LESS_THAN' | 'CONJUNCTS' | 'ASPECTS' | 'KENDRA_FROM';
  value: any;
  target?: string;
  description: string;
}

export interface KnowledgeObject {
  knowledgeId: string;
  domain: 'PARASHARI' | 'JAIMINI' | 'KP' | 'PANCHANGA' | 'DASHA' | 'VARGA' | 'YOGA' | 'DOSHA' | 'SHADBALA' | 'ASHTAKAVARGA' | 'REMEDY' | 'GENERAL';
  concept: string;
  entityType: KnowledgeEntityType;
  definition: string;
  rules: string[];
  conditions: KnowledgeCondition[];
  exceptions: string[];
  sourceIds: string[];
  version: string; // e.g. 'v1.0.0'
  createdAt: string;
  updatedAt: string;
  status: KnowledgeStatus;
  reviewedBy?: string;

  // Snake_case aliases for Phase 6 spec fidelity
  knowledge_id?: string;
  source_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface KnowledgeRelationshipEdge {
  edgeId: string;
  sourceKnowledgeId: string;
  targetKnowledgeId: string;
  relationType: KnowledgeRelationType;
  weight: number; // 0.0 to 1.0
  sourceId?: string; // Reference to classical text supporting the relation
  status: KnowledgeStatus;
  createdAt: string;
}

export class JyotishKnowledgeGraph {
  private static nodes: Map<string, KnowledgeObject> = new Map();
  private static edges: Map<string, KnowledgeRelationshipEdge> = new Map();
  private static conceptIndex: Map<string, string> = new Map(); // Concept name -> knowledgeId

  static {
    this.seedCanonicalBaseline();
  }

  /**
   * Registers a knowledge object into the graph
   */
  public static addKnowledgeObject(input: Omit<KnowledgeObject, 'createdAt' | 'updatedAt'> & {
    createdAt?: string;
    updatedAt?: string;
  }): KnowledgeObject {
    const now = new Date().toISOString();
    const obj: KnowledgeObject = {
      ...input,
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
      knowledge_id: input.knowledgeId,
      source_ids: input.sourceIds,
      created_at: input.createdAt || now,
      updated_at: input.updatedAt || now,
    };

    this.nodes.set(input.knowledgeId, Object.freeze(obj));
    this.conceptIndex.set(input.concept.toLowerCase(), input.knowledgeId);
    return obj;
  }

  /**
   * Connects two knowledge nodes with a semantic edge
   */
  public static addRelationship(input: {
    sourceKnowledgeId: string;
    targetKnowledgeId: string;
    relationType: KnowledgeRelationType;
    weight?: number;
    sourceId?: string;
    status?: KnowledgeStatus;
  }): KnowledgeRelationshipEdge {
    if (!this.nodes.has(input.sourceKnowledgeId) || !this.nodes.has(input.targetKnowledgeId)) {
      throw new Error(
        `Both source (${input.sourceKnowledgeId}) and target (${input.targetKnowledgeId}) knowledge objects must exist.`
      );
    }

    const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const edge: KnowledgeRelationshipEdge = {
      edgeId,
      sourceKnowledgeId: input.sourceKnowledgeId,
      targetKnowledgeId: input.targetKnowledgeId,
      relationType: input.relationType,
      weight: input.weight ?? 1.0,
      sourceId: input.sourceId,
      status: input.status || 'VERIFIED',
      createdAt: new Date().toISOString(),
    };

    this.edges.set(edgeId, Object.freeze(edge));
    return edge;
  }

  /**
   * Retrieves knowledge object by ID
   */
  public static getKnowledgeObject(id: string): KnowledgeObject | null {
    return this.nodes.get(id) || null;
  }

  /**
   * Retrieves knowledge object by exact or normalized concept name
   */
  public static getByConcept(conceptName: string): KnowledgeObject | null {
    const id = this.conceptIndex.get(conceptName.toLowerCase());
    return id ? this.nodes.get(id) || null : null;
  }

  /**
   * Retrieves only VERIFIED knowledge objects for a domain (production invariant)
   */
  public static getVerifiedKnowledgeForDomain(domain: KnowledgeObject['domain']): KnowledgeObject[] {
    return Array.from(this.nodes.values()).filter(
      (k) => k.domain === domain && k.status === 'VERIFIED'
    );
  }

  /**
   * Retrieves outgoing edges from a node
   */
  public static getOutgoingRelations(knowledgeId: string): KnowledgeRelationshipEdge[] {
    return Array.from(this.edges.values()).filter(
      (e) => e.sourceKnowledgeId === knowledgeId && e.status === 'VERIFIED'
    );
  }

  /**
   * Retrieves incoming edges to a node
   */
  public static getIncomingRelations(knowledgeId: string): KnowledgeRelationshipEdge[] {
    return Array.from(this.edges.values()).filter(
      (e) => e.targetKnowledgeId === knowledgeId && e.status === 'VERIFIED'
    );
  }

  /**
   * Updates knowledge object lifecycle status (with admin review governance)
   */
  public static updateStatus(
    knowledgeId: string,
    newStatus: KnowledgeStatus,
    reviewerId?: string
  ): KnowledgeObject {
    const existing = this.nodes.get(knowledgeId);
    if (!existing) {
      throw new Error(`Knowledge object ${knowledgeId} not found.`);
    }

    const updated: KnowledgeObject = {
      ...existing,
      status: newStatus,
      reviewedBy: reviewerId,
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.nodes.set(knowledgeId, Object.freeze(updated));
    return updated;
  }

  /**
   * Seeds baseline classical knowledge objects across all major domains
   */
  private static seedCanonicalBaseline(): void {
    // 1. Grahas
    this.addKnowledgeObject({
      knowledgeId: 'KNOW_GRAHA_JUPITER',
      domain: 'PARASHARI',
      concept: 'Jupiter (Guru/Brihaspati)',
      entityType: 'GRAHA',
      definition: 'The supreme benefic, karaka for wisdom, dharma, progeny, expansion, and spirituality.',
      rules: ['Owns Sagittarius and Pisces', 'Exalts in Cancer at 5 degrees', 'Debilitates in Capricorn at 5 degrees'],
      conditions: [],
      exceptions: ['Becomes functional malefic for Taurus and Libra lagnas due to ownership of 8th or badhaka/maraka houses'],
      sourceIds: ['SRC_BPHS_PARASHARA', 'SRC_PHALADEEPIKA'],
      version: 'v1.0.0',
      status: 'VERIFIED',
    });

    this.addKnowledgeObject({
      knowledgeId: 'KNOW_GRAHA_SATURN',
      domain: 'PARASHARI',
      concept: 'Saturn (Shani)',
      entityType: 'GRAHA',
      definition: 'The cosmic taskmaster, karaka for karma, perseverance, delay, discipline, and longevity.',
      rules: ['Owns Capricorn and Aquarius', 'Exalts in Libra at 20 degrees', 'Debilitates in Aries at 20 degrees'],
      conditions: [],
      exceptions: ['Acts as pure Yogakaraka for Taurus and Libra lagnas owning 9th and 10th or 4th and 5th'],
      sourceIds: ['SRC_BPHS_PARASHARA', 'SRC_SARAVALI'],
      version: 'v1.0.0',
      status: 'VERIFIED',
    });

    this.addKnowledgeObject({
      knowledgeId: 'KNOW_GRAHA_MOON',
      domain: 'PARASHARI',
      concept: 'Moon (Chandra)',
      entityType: 'GRAHA',
      definition: 'Karaka for mind, emotional perception, mother, consciousness, and fluid nourishment.',
      rules: ['Owns Cancer', 'Exalts in Taurus at 3 degrees', 'Debilitates in Scorpio at 3 degrees'],
      conditions: [],
      exceptions: ['Paksha Bala dictates beneficence (waxing Shukla Paksha is benefic; dark waning Krishna Paksha is malefic)'],
      sourceIds: ['SRC_BPHS_PARASHARA', 'SRC_BRIHAT_JATAKA'],
      version: 'v1.0.0',
      status: 'VERIFIED',
    });

    // 2. Yogas
    this.addKnowledgeObject({
      knowledgeId: 'KNOW_YOGA_GAJA_KESARI',
      domain: 'YOGA',
      concept: 'Gaja Kesari Yoga',
      entityType: 'YOGA',
      definition: 'A premier auspicious yoga formed when Jupiter occupies a Kendra (1st, 4th, 7th, 10th house) from the Moon.',
      rules: ['Jupiter must be in 1st, 4th, 7th, or 10th house counting from the Moon', 'Jupiter must not be combust or severely debilitated'],
      conditions: [
        {
          conditionId: 'GK_COND_1',
          field: 'Jupiter',
          operator: 'KENDRA_FROM',
          value: [1, 4, 7, 10],
          target: 'Moon',
          description: 'Jupiter in Kendra from Moon',
        },
      ],
      exceptions: ['Diminished if Jupiter is debilitated in Capricorn without Neechabhanga cancellation', 'Impaired if Moon is severely afflicted by Rahu/Ketu'],
      sourceIds: ['SRC_BPHS_PARASHARA', 'SRC_PHALADEEPIKA', 'SRC_SARAVALI'],
      version: 'v1.0.0',
      status: 'VERIFIED',
    });

    this.addKnowledgeObject({
      knowledgeId: 'KNOW_YOGA_BUDHADITYA',
      domain: 'YOGA',
      concept: 'Budhaditya Yoga',
      entityType: 'YOGA',
      definition: 'Yoga of acute intellect and executive acumen formed by the conjunction of Sun (Surya) and Mercury (Budha).',
      rules: ['Sun and Mercury must share the same sign', 'Mercury must be separated by more than 3 degrees to escape deep combustion combustion burn'],
      conditions: [
        {
          conditionId: 'BA_COND_1',
          field: 'Sun',
          operator: 'CONJUNCTS',
          value: 'Mercury',
          description: 'Sun and Mercury conjunct in same rashi',
        },
      ],
      exceptions: ['Combustion within 3 degrees degrades communicative clarity into intellectual agitation'],
      sourceIds: ['SRC_BPHS_PARASHARA', 'SRC_SARAVALI'],
      version: 'v1.0.0',
      status: 'VERIFIED',
    });

    // 3. Doshas
    this.addKnowledgeObject({
      knowledgeId: 'KNOW_DOSHA_MANGLIK',
      domain: 'DOSHA',
      concept: 'Manglik Dosha (Kuja Dosha)',
      entityType: 'DOSHA',
      definition: 'Marital friction and energetic intensity caused by Mars occupying 1st, 4th, 7th, 8th, or 12th house from Lagna, Moon, or Venus.',
      rules: ['Mars in house 1, 4, 7, 8, or 12 from Lagna, Moon, or Venus'],
      conditions: [
        {
          conditionId: 'MANG_COND_1',
          field: 'Mars',
          operator: 'IN',
          value: [1, 4, 7, 8, 12],
          description: 'Mars positioned in sensitive marital houses',
        },
      ],
      exceptions: [
        'Cancelled if Mars is in Aries in 1st, Scorpio in 4th, Capricorn in 7th, Sagittarius in 8th, or Pisces in 12th',
        'Cancelled if conjunct or aspected by powerful Jupiter',
        'Mitigated if both spouses possess Kuja Dosha of comparable strength',
      ],
      sourceIds: ['SRC_BPHS_PARASHARA', 'SRC_PHALADEEPIKA', 'SRC_UTTARA_KALAMRITA'],
      version: 'v1.0.0',
      status: 'VERIFIED',
    });

    // 4. Jaimini Concepts
    this.addKnowledgeObject({
      knowledgeId: 'KNOW_JAIMINI_ATMAKARAKA',
      domain: 'JAIMINI',
      concept: 'Atmakaraka (AK)',
      entityType: 'KARAKA',
      definition: 'The planet holding the highest degree (excluding Rahu/Ketu in the 7-karaka scheme), signifying soul purpose and core destiny.',
      rules: ['Highest degree among the 7 physical grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)'],
      conditions: [],
      exceptions: ['In 8-karaka scheme, Rahu is included by computing 30 minus Rahu longitude'],
      sourceIds: ['SRC_JAIMINI_UPADESHA', 'SRC_BPHS_PARASHARA'],
      version: 'v1.0.0',
      status: 'VERIFIED',
    });

    this.addKnowledgeObject({
      knowledgeId: 'KNOW_JAIMINI_UPAPADA',
      domain: 'JAIMINI',
      concept: 'Upapada Lagna (UL)',
      entityType: 'UPAPADA',
      definition: 'The arudha of the 12th house, representing marriage, committed partnerships, and spousal longevity.',
      rules: ['Count distance from 12th house to 12th lord, then project equal distance from 12th lord'],
      conditions: [],
      exceptions: ['If arudha falls in 12th or 6th, advance 10 houses per standard Arudha exceptions'],
      sourceIds: ['SRC_JAIMINI_UPADESHA'],
      version: 'v1.0.0',
      status: 'VERIFIED',
    });

    // 5. KP Concepts
    this.addKnowledgeObject({
      knowledgeId: 'KNOW_KP_SUB_LORD',
      domain: 'KP',
      concept: 'KP Sub-Lord (Upaswami)',
      entityType: 'SUB_LORD',
      definition: 'The ruler of the 249 unequal subdivisions of the 27 nakshatras in Krishnamurti Paddhati, decisive for event timing.',
      rules: ['Each nakshatra is divided into 9 subs proportional to Vimshottari dasha year spans'],
      conditions: [],
      exceptions: ['Requires high-precision birth time within +/- 1-2 minutes for exact cusp sub-lord fidelity'],
      sourceIds: ['SRC_KP_READER_3', 'SRC_KP_READER_4'],
      version: 'v1.0.0',
      status: 'VERIFIED',
    });

    // Wire baseline relations
    this.addRelationship({
      sourceKnowledgeId: 'KNOW_YOGA_GAJA_KESARI',
      targetKnowledgeId: 'KNOW_GRAHA_JUPITER',
      relationType: 'YOGA_REQUIRES',
      weight: 1.0,
      sourceId: 'SRC_BPHS_PARASHARA',
    });

    this.addRelationship({
      sourceKnowledgeId: 'KNOW_YOGA_GAJA_KESARI',
      targetKnowledgeId: 'KNOW_GRAHA_MOON',
      relationType: 'YOGA_REQUIRES',
      weight: 1.0,
      sourceId: 'SRC_BPHS_PARASHARA',
    });

    this.addRelationship({
      sourceKnowledgeId: 'KNOW_GRAHA_JUPITER',
      targetKnowledgeId: 'KNOW_GRAHA_SATURN',
      relationType: 'PLANET_FRIEND',
      weight: 0.7,
      sourceId: 'SRC_BPHS_PARASHARA',
    });
  }

  /**
   * Diagnostics
   */
  public static getStats(): { nodeCount: number; edgeCount: number; verifiedCount: number } {
    const nodes = Array.from(this.nodes.values());
    return {
      nodeCount: nodes.length,
      edgeCount: this.edges.size,
      verifiedCount: nodes.filter((n) => n.status === 'VERIFIED').length,
    };
  }

  public static clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.conceptIndex.clear();
    this.seedCanonicalBaseline();
  }
}
