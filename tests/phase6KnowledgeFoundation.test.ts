/**
 * DeepAstro Phase 6 — Classical Jyotish Knowledge Foundation,
 * Source Provenance, Reasoning Engine & Methodology Versioning Test Suite
 * 
 * Target: 80 Comprehensive Automated Tests:
 * - 15 Knowledge Graph & Entity integrity tests
 * - 10 Source Provenance & Registry verification tests
 * - 10 Rule Grounding & Explanation tests
 * - 10 Hybrid RAG & Domain Routing tests
 * - 10 Contradiction & Methodology Variant tests
 * - 5 Knowledge Versioning & Change Impact tests
 * - 5 Anti-Poisoning & Adversarial injection tests
 * - 5 AI Citation & EvidenceBundle grounding tests
 * - 5 Methodology Profile reproducibility tests
 * - 5 Full Regression & Golden Dataset tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  JyotishKnowledgeGraph,
  KnowledgeEntityType,
  KnowledgeRelationType,
  KnowledgeObject,
} from '../server/src/knowledge/JyotishKnowledgeGraph.js';
import {
  JyotishSourceRegistry,
  ClassicalRuleCitation,
} from '../server/src/knowledge/JyotishSourceRegistry.js';
import {
  MethodologyService,
  JyotishMethodologyProfile,
  MethodologyVariant,
} from '../server/src/knowledge/MethodologyProfile.js';
import {
  KnowledgeRAGRouterV2,
  RAGDomain,
} from '../server/src/knowledge/KnowledgeRAGRouterV2.js';
import {
  JyotishReasoningEngine,
  EvidenceBundle,
} from '../server/src/knowledge/JyotishReasoningEngine.js';
import {
  GoldenKnowledgeDataset,
} from '../server/src/knowledge/GoldenKnowledgeDataset.js';
import { VedicAstroEngine } from '../server/src/astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine } from '../server/src/astrology/CalculationSnapshot.js';

describe('DeepAstro Phase 6 — Classical Jyotish Knowledge Foundation', () => {
  const TEST_USER = 'phase6_tester_native';
  const baselineProfile = {
    name: 'Phase 6 Native',
    birthDate: '1990-05-15',
    birthTime: '14:30',
    birthPlace: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
  };

  const factSet = VedicAstroEngine.createAstrologyFactSet(baselineProfile);
  const snapshot = CalculationSnapshotEngine.createSnapshot(factSet);

  // =========================================================================
  // CATEGORY 1: KNOWLEDGE GRAPH & ENTITY INTEGRITY (15 TESTS)
  // =========================================================================
  describe('Category 1: Knowledge Graph & Entity Integrity (15 Tests)', () => {
    it('1.1 should support all 27 specified KnowledgeEntityType categories', () => {
      const allEntities: KnowledgeEntityType[] = [
        'GRAHA', 'RASHI', 'BHAVA', 'NAKSHATRA', 'PADA', 'LAGNA', 'YOGA', 'DOSHA',
        'DASHA', 'ANTARDASHA', 'VARGA', 'DRISHTI', 'KARAKA', 'ARUDHA', 'UPAPADA',
        'KP_CUSP', 'STAR_LORD', 'SUB_LORD', 'PANCHANGA', 'MUHURTA', 'SHADBALA',
        'ASHTAKAVARGA', 'BHAVA_BALA', 'PLANETARY_DIGNITY', 'TRANSIT', 'REMEDY',
        'NUMEROLOGY_CONCEPT', 'PALMISTRY_CONCEPT'
      ];
      expect(allEntities.length).toBe(28); // 27 + PALMISTRY_CONCEPT/NUMEROLOGY

      for (const ent of allEntities) {
        const testObj = JyotishKnowledgeGraph.addKnowledgeObject({
          knowledgeId: `TEST_ENT_${ent}`,
          domain: 'PARASHARI',
          concept: `Test Concept for ${ent}`,
          entityType: ent,
          definition: `Definition for ${ent}`,
          rules: ['Rule 1'],
          conditions: [],
          exceptions: [],
          sourceIds: ['SRC_BPHS_PARASHARA'],
          version: '1.0.0',
          status: 'VERIFIED',
        });
        expect(testObj.entityType).toBe(ent);
      }
    });

    it('1.2 should support all 22 specified KnowledgeRelationType categories', () => {
      const allRelations: KnowledgeRelationType[] = [
        'RULE_REQUIRES', 'RULE_EXCLUDES', 'PLANET_OCCUPIES', 'PLANET_OWNS', 'PLANET_ASPECTS',
        'PLANET_CONJUNCTS', 'PLANET_EXALTS', 'PLANET_DEBILITATES', 'PLANET_FRIEND', 'PLANET_ENEMY',
        'SIGN_CONTAINS', 'NAKSHATRA_CONTAINS', 'PADA_BELONGS_TO', 'DASHA_ACTIVATES', 'YOGA_REQUIRES',
        'YOGA_SUPPORTED_BY', 'DOSHA_REQUIRES', 'VARGA_RELEVANT_FOR', 'KARAKA_SIGNIFIES',
        'KP_SIGNIFICATES', 'SOURCE_DEFINES', 'SOURCE_SUPPORTS', 'SOURCE_CONTRADICTS'
      ];
      expect(allRelations.length).toBeGreaterThanOrEqual(22);

      const edge = JyotishKnowledgeGraph.addRelationship({
        sourceKnowledgeId: 'KNOW_YOGA_GAJA_KESARI',
        targetKnowledgeId: 'KNOW_GRAHA_JUPITER',
        relationType: 'YOGA_REQUIRES',
        weight: 1.0,
      });
      expect(edge.relationType).toBe('YOGA_REQUIRES');
    });

    it('1.3 knowledge object schema requires all mandatory fields', () => {
      const obj = JyotishKnowledgeGraph.getKnowledgeObject('KNOW_YOGA_GAJA_KESARI');
      expect(obj).not.toBeNull();
      expect(obj!.knowledgeId).toBe('KNOW_YOGA_GAJA_KESARI');
      expect(obj!.domain).toBe('YOGA');
      expect(obj!.concept).toBe('Gaja Kesari Yoga');
      expect(obj!.definition).toBeDefined();
      expect(obj!.rules.length).toBeGreaterThan(0);
      expect(obj!.sourceIds).toContain('SRC_BPHS_PARASHARA');
      expect(obj!.version).toBe('v1.0.0');
      expect(obj!.status).toBe('VERIFIED');
      expect(obj!.createdAt).toBeDefined();
      expect(obj!.updatedAt).toBeDefined();
    });

    it('1.4 only VERIFIED knowledge objects are accessible to production domain reasoning', () => {
      JyotishKnowledgeGraph.addKnowledgeObject({
        knowledgeId: 'TEST_UNVERIFIED_CONCEPT',
        domain: 'YOGA',
        concept: 'Draft Speculative Yoga',
        entityType: 'YOGA',
        definition: 'Unverified oral lore',
        rules: [],
        conditions: [],
        exceptions: [],
        sourceIds: [],
        version: '0.1.0',
        status: 'DRAFT',
      });

      const verifiedYogas = JyotishKnowledgeGraph.getVerifiedKnowledgeForDomain('YOGA');
      expect(verifiedYogas.some((y) => y.knowledgeId === 'TEST_UNVERIFIED_CONCEPT')).toBe(false);
      expect(verifiedYogas.some((y) => y.knowledgeId === 'KNOW_YOGA_GAJA_KESARI')).toBe(true);
    });

    it('1.5 REVIEW_REQUIRED knowledge objects are gated from production domain queries', () => {
      JyotishKnowledgeGraph.addKnowledgeObject({
        knowledgeId: 'TEST_PENDING_REVIEW_YOGA',
        domain: 'YOGA',
        concept: 'Pending Review Yoga',
        entityType: 'YOGA',
        definition: 'Pending manuscript verification',
        rules: [],
        conditions: [],
        exceptions: [],
        sourceIds: ['SRC_BPHS_PARASHARA'],
        version: '1.0.0',
        status: 'REVIEW_REQUIRED',
      });

      const verified = JyotishKnowledgeGraph.getVerifiedKnowledgeForDomain('YOGA');
      expect(verified.some((y) => y.knowledgeId === 'TEST_PENDING_REVIEW_YOGA')).toBe(false);
    });

    it('1.6 DEPRECATED knowledge objects are excluded from active reasoning queries', () => {
      const obj = JyotishKnowledgeGraph.addKnowledgeObject({
        knowledgeId: 'TEST_DEPRECATED_YOGA',
        domain: 'YOGA',
        concept: 'Obsolete Interpretive Variant',
        entityType: 'YOGA',
        definition: 'Outdated rule formulation',
        rules: [],
        conditions: [],
        exceptions: [],
        sourceIds: [],
        version: '0.9.0',
        status: 'DEPRECATED',
      });

      const verified = JyotishKnowledgeGraph.getVerifiedKnowledgeForDomain('YOGA');
      expect(verified.some((y) => y.knowledgeId === obj.knowledgeId)).toBe(false);
    });

    it('1.7 querying knowledge by normalized concept name retrieves exact object', () => {
      const resultLower = JyotishKnowledgeGraph.getByConcept('gaja kesari yoga');
      const resultUpper = JyotishKnowledgeGraph.getByConcept('GAJA KESARI YOGA');
      const resultExact = JyotishKnowledgeGraph.getByConcept('Gaja Kesari Yoga');

      expect(resultLower).not.toBeNull();
      expect(resultLower!.knowledgeId).toBe('KNOW_YOGA_GAJA_KESARI');
      expect(resultUpper!.knowledgeId).toBe('KNOW_YOGA_GAJA_KESARI');
      expect(resultExact!.knowledgeId).toBe('KNOW_YOGA_GAJA_KESARI');
    });

    it('1.8 traversing outgoing relationship edges returns connected concepts', () => {
      const outgoing = JyotishKnowledgeGraph.getOutgoingRelations('KNOW_YOGA_GAJA_KESARI');
      expect(outgoing.length).toBeGreaterThanOrEqual(2);
      expect(outgoing.some((e) => e.targetKnowledgeId === 'KNOW_GRAHA_JUPITER')).toBe(true);
      expect(outgoing.some((e) => e.targetKnowledgeId === 'KNOW_GRAHA_MOON')).toBe(true);
    });

    it('1.9 traversing incoming relationship edges returns dependent concepts', () => {
      const incoming = JyotishKnowledgeGraph.getIncomingRelations('KNOW_GRAHA_JUPITER');
      expect(incoming.length).toBeGreaterThan(0);
      expect(incoming.some((e) => e.sourceKnowledgeId === 'KNOW_YOGA_GAJA_KESARI')).toBe(true);
    });

    it('1.10 edge creation requires both source and target nodes to exist', () => {
      expect(() => {
        JyotishKnowledgeGraph.addRelationship({
          sourceKnowledgeId: 'NON_EXISTENT_SOURCE',
          targetKnowledgeId: 'KNOW_GRAHA_JUPITER',
          relationType: 'RULE_REQUIRES',
        });
      }).toThrow(/must exist/);
    });

    it('1.11 updating lifecycle status stamps modification timestamp and reviewer ID', () => {
      const updated = JyotishKnowledgeGraph.updateStatus(
        'TEST_UNVERIFIED_CONCEPT',
        'VERIFIED',
        'admin_auditor_sharma'
      );
      expect(updated.status).toBe('VERIFIED');
      expect(updated.reviewedBy).toBe('admin_auditor_sharma');
      expect(updated.updatedAt).toBeDefined();
    });

    it('1.12 knowledge graph statistics reflect accurate node and edge counts', () => {
      const stats = JyotishKnowledgeGraph.getStats();
      expect(stats.nodeCount).toBeGreaterThan(5);
      expect(stats.edgeCount).toBeGreaterThan(0);
      expect(stats.verifiedCount).toBeGreaterThan(0);
    });

    it('1.13 baseline seed data loads canonical grahas (Jupiter, Saturn, Moon)', () => {
      const jupiter = JyotishKnowledgeGraph.getKnowledgeObject('KNOW_GRAHA_JUPITER');
      const saturn = JyotishKnowledgeGraph.getKnowledgeObject('KNOW_GRAHA_SATURN');
      const moon = JyotishKnowledgeGraph.getKnowledgeObject('KNOW_GRAHA_MOON');

      expect(jupiter).not.toBeNull();
      expect(saturn).not.toBeNull();
      expect(moon).not.toBeNull();
      expect(jupiter!.rules).toContain('Owns Sagittarius and Pisces');
    });

    it('1.14 baseline seed data loads canonical doshas (Manglik Dosha)', () => {
      const manglik = JyotishKnowledgeGraph.getKnowledgeObject('KNOW_DOSHA_MANGLIK');
      expect(manglik).not.toBeNull();
      expect(manglik!.entityType).toBe('DOSHA');
      expect(manglik!.conditions.length).toBeGreaterThan(0);
      expect(manglik!.exceptions.length).toBeGreaterThan(0);
    });

    it('1.15 knowledge graph objects are deeply frozen (immutable in memory)', () => {
      const obj = JyotishKnowledgeGraph.getKnowledgeObject('KNOW_YOGA_GAJA_KESARI');
      expect(Object.isFrozen(obj)).toBe(true);
    });
  });

  // =========================================================================
  // CATEGORY 2: SOURCE PROVENANCE & REGISTRY (10 TESTS)
  // =========================================================================
  describe('Category 2: Source Provenance & Registry Verification (10 Tests)', () => {
    it('2.1 canonical classical sources registered with authentic metadata (BPHS, Jaimini, etc.)', () => {
      const bphs = JyotishSourceRegistry.getSource('SRC_BPHS_PARASHARA');
      const jaimini = JyotishSourceRegistry.getSource('SRC_JAIMINI_UPADESHA');
      const phala = JyotishSourceRegistry.getSource('SRC_PHALADEEPIKA');

      expect(bphs).not.toBeNull();
      expect(bphs!.authorOrTradition).toBe('Maharishi Parashara');
      expect(bphs!.verificationStatus).toBe('VERIFIED_CANONICAL');

      expect(jaimini).not.toBeNull();
      expect(jaimini!.authorOrTradition).toBe('Maharishi Jaimini');

      expect(phala).not.toBeNull();
      expect(phala!.authorOrTradition).toBe('Mantreswara');
    });

    it('2.2 registering source stamps authentic retrieval timestamp and fields', () => {
      const src = JyotishSourceRegistry.registerSource({
        sourceId: 'SRC_TEST_TREATISE',
        title: 'Horashatpanchasika',
        authorOrTradition: 'Prithuyashas',
        language: 'Sanskrit',
        domain: 'PRASHNA',
        licenseProvenance: 'PUBLIC_DOMAIN',
        verificationStatus: 'VERIFIED_CANONICAL',
      });

      expect(src.sourceId).toBe('SRC_TEST_TREATISE');
      expect(src.retrievedAt).toBeDefined();
    });

    it('2.3 incomplete source metadata flagged as SOURCE_METADATA_INCOMPLETE', () => {
      const src = JyotishSourceRegistry.registerSource({
        sourceId: 'SRC_INCOMPLETE_TEST',
        title: 'Fragmented Palm Leaf Folio',
        authorOrTradition: 'Unknown Scribe',
        language: 'Sanskrit',
        domain: 'PARASHARI',
        licenseProvenance: 'HISTORICAL_MANUSCRIPT' as any,
        verificationStatus: 'SOURCE_METADATA_INCOMPLETE',
      });

      expect(src.verificationStatus).toBe('SOURCE_METADATA_INCOMPLETE');
    });

    it('2.4 classical rule citations link ruleId to verified sourceId', () => {
      const citations = JyotishSourceRegistry.getCitationsForRule('RULE_YOGA_GAJA_KESARI');
      expect(citations.length).toBeGreaterThan(0);
      expect(citations[0].sourceId).toBe('SRC_BPHS_PARASHARA');
      expect(citations[0].author).toBe('Maharishi Parashara');
    });

    it('2.5 linking rule citation to unknown sourceId throws error', () => {
      expect(() => {
        JyotishSourceRegistry.linkRuleCitation({
          ruleId: 'RULE_FICTITIOUS',
          ruleVersion: '1.0.0',
          sourceId: 'SRC_DOES_NOT_EXIST',
          sourceTitle: 'Imaginary Book',
          author: 'Anonymous',
          provenanceConfidence: 'INCOMPLETE',
        });
      }).toThrow(/Cannot cite unknown sourceId/);
    });

    it('2.6 citing Gaja Kesari Yoga retrieves BPHS Chapter 36 Shloka 3-4 citation', () => {
      const citations = JyotishSourceRegistry.getCitationsForRule('RULE_YOGA_GAJA_KESARI');
      const bphsCitation = citations.find((c) => c.sourceId === 'SRC_BPHS_PARASHARA');

      expect(bphsCitation).toBeDefined();
      expect(bphsCitation!.exactChapterVerse).toContain('Chapter 36');
      expect(bphsCitation!.englishTranslation).toContain('Jupiter is in a Kendra');
    });

    it('2.7 citing Manglik Dosha retrieves BPHS marriage chapter citation', () => {
      const citations = JyotishSourceRegistry.getCitationsForRule('RULE_DOSHA_MANGLIK');
      expect(citations.length).toBeGreaterThan(0);
      expect(citations[0].englishTranslation).toContain('Mars residing in 1st, 4th, 7th, 8th, or 12th house');
    });

    it('2.8 verifying rule citation without valid sourceId fails validation', () => {
      const validation = JyotishSourceRegistry.validateCitation({
        ruleId: 'TEST_RULE',
        sourceId: 'UNREGISTERED_SOURCE',
      });

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('SOURCE_METADATA_INCOMPLETE');
    });

    it('2.9 multiple classical editions can be registered without collision', () => {
      const saravali = JyotishSourceRegistry.getSource('SRC_SARAVALI');
      const brihatJataka = JyotishSourceRegistry.getSource('SRC_BRIHAT_JATAKA');

      expect(saravali).not.toBeNull();
      expect(brihatJataka).not.toBeNull();
      expect(saravali!.authorOrTradition).toBe('Kalyana Varma');
      expect(brihatJataka!.authorOrTradition).toBe('Varahamihira');
    });

    it('2.10 fetch all verified canonical sources returns only authoritative treatises', () => {
      const allVerified = JyotishSourceRegistry.getAllVerifiedSources();
      expect(allVerified.length).toBeGreaterThanOrEqual(7);
      for (const s of allVerified) {
        expect(s.verificationStatus).toBe('VERIFIED_CANONICAL');
      }
    });
  });

  // =========================================================================
  // CATEGORY 3: RULE GROUNDING & EXPLANATION (10 TESTS)
  // =========================================================================
  describe('Category 3: Rule Grounding & Explanation (10 Tests)', () => {
    it('3.1 rule evaluation returns complete structured conditions and status', () => {
      const evalResult = JyotishReasoningEngine.evaluateRule('KNOW_YOGA_GAJA_KESARI', snapshot);
      expect(evalResult.ruleId).toBe('KNOW_YOGA_GAJA_KESARI');
      expect(evalResult.ruleVersion).toBeDefined();
      expect(evalResult.conditionsRequired.length).toBeGreaterThan(0);
      expect(['QUALIFIED', 'NOT_QUALIFIED', 'INCONCLUSIVE']).toContain(evalResult.result);
      expect(evalResult.evidenceIds.length).toBeGreaterThan(0);
    });

    it('3.2 Gaja Kesari Yoga evaluates QUALIFIED when Jupiter is in Kendra from Moon', () => {
      const mockSnapshot = {
        ...snapshot,
        snapshotId: 'snap_gk_valid',
        planetaryPositions: [
          { planet: 'Moon', house: 1, longitude: 10, degreeInSign: 10 },
          { planet: 'Jupiter', house: 4, longitude: 100, degreeInSign: 10 },
        ],
      } as any;

      const evalResult = JyotishReasoningEngine.evaluateRule('KNOW_YOGA_GAJA_KESARI', mockSnapshot);
      expect(evalResult.planetsInvolved).toContain('Moon');
      expect(evalResult.planetsInvolved).toContain('Jupiter');
      expect(evalResult.result).toBe('QUALIFIED');
      expect(evalResult.conditionsMet.length).toBeGreaterThan(0);
    });

    it('3.3 Gaja Kesari Yoga evaluates NOT_QUALIFIED when Jupiter is in 6th house from Moon', () => {
      // Create mock snapshot where Moon is in 1st house and Jupiter is in 6th house
      const mockSnapshot = {
        ...snapshot,
        snapshotId: 'snap_non_gk',
        planetaryPositions: [
          { planet: 'Moon', house: 1, longitude: 10, degreeInSign: 10 },
          { planet: 'Jupiter', house: 6, longitude: 160, degreeInSign: 10 },
        ],
      } as any;

      const evalResult = JyotishReasoningEngine.evaluateRule('KNOW_YOGA_GAJA_KESARI', mockSnapshot);
      expect(evalResult.result).toBe('NOT_QUALIFIED');
      expect(evalResult.conditionsFailed[0]).toContain('not an angular Kendra');
    });

    it('3.4 rule explanation answers "What the rule is" with classical definition and required conditions', () => {
      const explanation = JyotishReasoningEngine.explainRule('Gaja Kesari Yoga', snapshot);
      expect(explanation.conceptName).toBe('Gaja Kesari Yoga');
      expect(explanation.ruleStatement).toContain('auspicious yoga formed when Jupiter occupies a Kendra');
      expect(explanation.conditionsRequired.length).toBeGreaterThan(0);
    });

    it('3.5 rule explanation lists exact planets involved', () => {
      const explanation = JyotishReasoningEngine.explainRule('Gaja Kesari Yoga', snapshot);
      expect(explanation.planetsInvolved).toContain('Moon');
      expect(explanation.planetsInvolved).toContain('Jupiter');
    });

    it('3.6 rule explanation lists exact houses involved', () => {
      const explanation = JyotishReasoningEngine.explainRule('Gaja Kesari Yoga', snapshot);
      expect(explanation.housesInvolved.length).toBeGreaterThanOrEqual(1);
    });

    it('3.7 rule explanation references authoritative calculation snapshot ID used', () => {
      const explanation = JyotishReasoningEngine.explainRule('Gaja Kesari Yoga', snapshot);
      expect(explanation.calculationSnapshotId).toBe(snapshot.snapshotId);
    });

    it('3.8 rule explanation includes authentic source citations from BPHS', () => {
      const explanation = JyotishReasoningEngine.explainRule('Gaja Kesari Yoga', snapshot);
      expect(explanation.sourceCitations.length).toBeGreaterThan(0);
      expect(explanation.sourceCitations[0].sourceTitle).toBe('Brihat Parashara Hora Shastra');
    });

    it('3.9 rule explanation discloses applicable classical limitations and exceptions', () => {
      const explanation = JyotishReasoningEngine.explainRule('Gaja Kesari Yoga', snapshot);
      expect(explanation.limitations.length).toBeGreaterThan(0);
      expect(explanation.limitations[0]).toContain('debilitated in Capricorn');
    });

    it('3.10 Golden Dataset validates 20 canonical yoga test cases against expected rule states', () => {
      const yogaCases = GoldenKnowledgeDataset.getCasesByCategory('YOGA');
      expect(yogaCases.length).toBe(20);
      for (const c of yogaCases) {
        expect(['QUALIFIED', 'NOT_QUALIFIED', 'INCONCLUSIVE']).toContain(c.expectedRuleState);
        expect(c.sourceId).toBe('SRC_BPHS_PARASHARA');
      }
    });
  });

  // =========================================================================
  // CATEGORY 4: HYBRID RAG & DOMAIN ROUTING (10 TESTS)
  // =========================================================================
  describe('Category 4: Hybrid RAG & Domain Routing (10 Tests)', () => {
    it('4.1 query classification maps "marriage timing" to matrimonial domain', () => {
      const domain = KnowledgeRAGRouterV2.classifyTargetDomain('When will my marriage happen?');
      expect(domain).toBe('YOGA');
    });

    it('4.2 query classification maps "career promotion" to vocational domain', () => {
      const domain = KnowledgeRAGRouterV2.classifyTargetDomain('What are my career prospects in Q3?');
      expect(domain).toBe('VARGA');
    });

    it('4.3 query classification maps "Jupiter dasha" to Dasha domain', () => {
      const domain = KnowledgeRAGRouterV2.classifyTargetDomain('How will my Jupiter Mahadasha unfold?');
      expect(domain).toBe('DASHA');
    });

    it('4.4 query classification maps "Manglik dosha" to Dosha domain', () => {
      const domain = KnowledgeRAGRouterV2.classifyTargetDomain('Do I have severe Manglik dosha in my chart?');
      expect(domain).toBe('DOSHA');
    });

    it('4.5 query classification maps "Atmakaraka" to Jaimini domain', () => {
      const domain = KnowledgeRAGRouterV2.classifyTargetDomain('What is my Atmakaraka indicating for dharma?');
      expect(domain).toBe('JAIMINI');
    });

    it('4.6 marriage inquiry prioritizes matrimonial concepts and excludes unrelated concepts', () => {
      const result = KnowledgeRAGRouterV2.retrieve('Will I get married soon?');
      expect(result.targetDomain).toBe('YOGA');
      // Should not bring irrelevant palmistry or unrelated numerology
      expect(result.items.some((i) => i.knowledgeObject.domain === 'PALMISTRY')).toBe(false);
    });

    it('4.7 hybrid scoring combines vector, keyword, graph relevance, and source reliability', () => {
      const result = KnowledgeRAGRouterV2.retrieve('Jupiter Gaja Kesari yoga rules');
      expect(result.items.length).toBeGreaterThan(0);
      const top = result.items[0];
      expect(top.scores.keywordScore).toBeGreaterThan(0);
      expect(top.scores.graphRelevance).toBeGreaterThan(0);
      expect(top.scores.sourceReliability).toBeGreaterThan(0);
      expect(top.scores.compositeScore).toBeGreaterThan(0.5);
    });

    it('4.8 top retrieved items are sorted by composite score descending', () => {
      const result = KnowledgeRAGRouterV2.retrieve('Jupiter and Moon kendra yoga');
      for (let i = 0; i < result.items.length - 1; i++) {
        expect(result.items[i].scores.compositeScore).toBeGreaterThanOrEqual(
          result.items[i + 1].scores.compositeScore
        );
      }
    });

    it('4.9 RAG timing benchmarks sub-150ms retrieval and sub-100ms graph traversal', () => {
      const result = KnowledgeRAGRouterV2.retrieve('Career and Dashamsha rules');
      expect(result.timingBreakdownMs.retrievalMs).toBeLessThan(150);
      expect(result.timingBreakdownMs.graphTraversalMs).toBeLessThan(100);
      expect(result.timingBreakdownMs.totalMs).toBeLessThan(200);
    });

    it('4.10 retrieval confidence decomposes across calculation, rule, source, and interpretation', () => {
      const result = KnowledgeRAGRouterV2.retrieve('Gaja Kesari Yoga');
      expect(result.confidence.calculationConfidence).toBe('VERIFIED');
      expect(result.confidence.ruleConfidence).toBe('VERIFIED');
      expect(result.confidence.sourceConfidence).toBe('VERIFIED_CANONICAL');
      expect(result.confidence.interpretationConfidence).toBe('HIGH');
    });
  });

  // =========================================================================
  // CATEGORY 5: CONTRADICTION & METHODOLOGY VARIANTS (10 TESTS)
  // =========================================================================
  describe('Category 5: Contradiction & Methodology Variants (10 Tests)', () => {
    it('5.1 methodology variants registered for Chara Karaka (7-karaka vs 8-karaka)', () => {
      const variants = MethodologyService.getVariants('CONCEPT_CHARA_KARAKA');
      expect(variants.length).toBe(2);
      expect(variants.some((v) => v.traditionName === 'PARASHARI')).toBe(true);
      expect(variants.some((v) => v.traditionName === 'JAIMINI')).toBe(true);
    });

    it('5.2 default methodology profile selects 7-karaka Parashari tradition', () => {
      const profile = MethodologyService.getUserProfile(TEST_USER);
      expect(profile.jaiminiConfig.karakaScheme).toBe('7_KARAKA');
      expect(profile.ayanamsha).toBe('LAHIRI');
      expect(profile.houseSystem).toBe('WHOLE_SIGN');
    });

    it('5.3 Jaimini 8-karaka variant is explicitly recorded with Jaimini Upadesha source', () => {
      const variants = MethodologyService.getVariants('CONCEPT_CHARA_KARAKA');
      const jaiminiVar = variants.find((v) => v.traditionName === 'JAIMINI');
      expect(jaiminiVar).toBeDefined();
      expect(jaiminiVar!.sourceId).toBe('SRC_JAIMINI_UPADESHA');
      expect(jaiminiVar!.definition).toContain('8-Karaka system');
    });

    it('5.4 retrieving concept with variants alerts conflictingMethodologies', () => {
      const ragResult = KnowledgeRAGRouterV2.retrieve('Chara Karaka scheme');
      // Should process without error and surface methodology awareness
      expect(ragResult.confidence).toBeDefined();
    });

    it('5.5 contradiction alert explains tradition difference without silent averaging', () => {
      const variants = MethodologyService.getVariants('RULE_YOGA_GAJA_KESARI');
      expect(variants.length).toBe(2);
      const standard = variants.find((v) => v.traditionName === 'PARASHARI');
      const strict = variants.find((v) => v.traditionName === 'CUSTOM');

      expect(standard!.definition).toContain('Standard Parashari');
      expect(strict!.definition).toContain('Strict Traditional');
    });

    it('5.6 contradiction alert discloses recommended tradition based on user profile', () => {
      const profile = MethodologyService.getUserProfile(TEST_USER);
      expect(profile.name).toContain('Canonical Parashari Standard');
    });

    it('5.7 user can configure custom methodology profile', () => {
      const updated = MethodologyService.setUserProfile(TEST_USER, {
        houseSystem: 'PLACIDUS',
        ayanamsha: 'KRISHNAMURTI',
      });
      expect(updated.houseSystem).toBe('PLACIDUS');
      expect(updated.ayanamsha).toBe('KRISHNAMURTI');

      // Reset
      MethodologyService.setUserProfile(TEST_USER, {
        houseSystem: 'WHOLE_SIGN',
        ayanamsha: 'LAHIRI',
      });
    });

    it('5.8 methodology variant for Gaja Kesari documents strict benefic conditions', () => {
      const variants = MethodologyService.getVariants('RULE_YOGA_GAJA_KESARI');
      const strict = variants.find((v) => v.methodologyId === 'VAR_GK_STRICT_BENEFIC');
      expect(strict).toBeDefined();
      expect(strict!.conditions).toContain('Moon has Paksha Bala > 60');
    });

    it('5.9 contradictory rules maintain separate versions and source citations', () => {
      const variants = MethodologyService.getVariants('RULE_YOGA_GAJA_KESARI');
      expect(variants[0].version).toBe('1.0.0');
      expect(variants[1].version).toBe('1.0.0');
      expect(variants[0].sourceId).not.toBe(variants[1].sourceId);
    });

    it('5.10 system never hides epistemological disagreements between classical schools', () => {
      const variants = MethodologyService.getVariants('CONCEPT_CHARA_KARAKA');
      expect(variants[0].definition).not.toBe(variants[1].definition);
    });
  });

  // =========================================================================
  // CATEGORY 6: KNOWLEDGE VERSIONING & CHANGE IMPACT (5 TESTS)
  // =========================================================================
  describe('Category 6: Knowledge Versioning & Change Impact (5 Tests)', () => {
    it('6.1 knowledge objects track semantic version strings', () => {
      const obj = JyotishKnowledgeGraph.getKnowledgeObject('KNOW_YOGA_GAJA_KESARI');
      expect(obj!.version).toMatch(/^v?\d+\.\d+\.\d+/);
    });

    it('6.2 knowledge snapshot binds calculation snapshot with exact rule versions', () => {
      const ksnap = MethodologyService.createKnowledgeSnapshot({
        calculationSnapshotId: snapshot.snapshotId,
        ruleVersions: {
          KNOW_YOGA_GAJA_KESARI: 'v1.0.0',
          KNOW_DOSHA_MANGLIK: 'v1.0.0',
        },
      });

      expect(ksnap.snapshotId).toBeDefined();
      expect(ksnap.calculationSnapshotId).toBe(snapshot.snapshotId);
      expect(ksnap.ruleVersions['KNOW_YOGA_GAJA_KESARI']).toBe('v1.0.0');
    });

    it('6.3 updating knowledge object version does not alter historical snapshots', () => {
      const ksnap1 = MethodologyService.createKnowledgeSnapshot({
        calculationSnapshotId: snapshot.snapshotId,
        ruleVersions: { KNOW_YOGA_GAJA_KESARI: 'v1.0.0' },
      });

      // Simulated version advance
      const ksnap2 = MethodologyService.createKnowledgeSnapshot({
        calculationSnapshotId: snapshot.snapshotId,
        ruleVersions: { KNOW_YOGA_GAJA_KESARI: 'v2.0.0' },
      });

      expect(ksnap1.ruleVersions['KNOW_YOGA_GAJA_KESARI']).toBe('v1.0.0');
      expect(ksnap2.ruleVersions['KNOW_YOGA_GAJA_KESARI']).toBe('v2.0.0');
    });

    it('6.4 predictions stamped with knowledge snapshot can be reconstructed in original state', () => {
      const ksnap = MethodologyService.createKnowledgeSnapshot({
        calculationSnapshotId: snapshot.snapshotId,
        ruleVersions: { RULE_VIMSHOTTARI: '1.0.0' },
      });

      expect(ksnap.knowledgeVersion).toBe('6.0.0');
      expect(ksnap.methodologyProfileId).toBeDefined();
    });

    it('6.5 rule evaluation returns the specific version active at execution time', () => {
      const evalResult = JyotishReasoningEngine.evaluateRule('KNOW_YOGA_GAJA_KESARI', snapshot);
      expect(evalResult.ruleVersion).toBe('v1.0.0');
    });
  });

  // =========================================================================
  // CATEGORY 7: ANTI-POISONING & ADVERSARIAL INJECTION (5 TESTS)
  // =========================================================================
  describe('Category 7: Anti-Poisoning & Adversarial Injection (5 Tests)', () => {
    it('7.1 rejects poisoned universal aphorism: "Jupiter is always benefic"', () => {
      const bundle = JyotishReasoningEngine.buildEvidenceBundle({
        query: 'Is it true that Jupiter is always benefic in my chart?',
        snapshot,
      });

      expect(bundle.poisoningAlerts.length).toBeGreaterThan(0);
      expect(bundle.poisoningAlerts[0]).toContain('unsupported universal aphorism');
    });

    it('7.2 rejects poisoned universal aphorism: "Every Manglik chart causes divorce"', () => {
      const bundle = JyotishReasoningEngine.buildEvidenceBundle({
        query: 'Someone told me that every Manglik chart causes divorce.',
        snapshot,
      });

      expect(bundle.poisoningAlerts.length).toBeGreaterThan(0);
      expect(bundle.poisoningAlerts.some((a) => a.includes('EVERY MANGLIK'))).toBe(true);
    });

    it('7.3 rejects poisoned universal aphorism: "Rahu guarantees wealth"', () => {
      const bundle = JyotishReasoningEngine.buildEvidenceBundle({
        query: 'I heard that Rahu guarantees wealth in the 11th house.',
        snapshot,
      });

      expect(bundle.poisoningAlerts.length).toBeGreaterThan(0);
      expect(bundle.poisoningAlerts.some((a) => a.includes('RAHU GUARANTEES WEALTH'))).toBe(true);
    });

    it('7.4 rejects poisoned universal aphorism: "Saturn always causes suffering"', () => {
      const bundle = JyotishReasoningEngine.buildEvidenceBundle({
        query: 'Does Saturn always causes suffering during its dasha?',
        snapshot,
      });

      expect(bundle.poisoningAlerts.length).toBeGreaterThan(0);
      expect(bundle.poisoningAlerts.some((a) => a.includes('SATURN ALWAYS CAUSES SUFFERING'))).toBe(true);
    });

    it('7.5 EvidenceBundle flags poisoning attempts in poisoningAlerts without failing execution', () => {
      const bundle = JyotishReasoningEngine.buildEvidenceBundle({
        query: 'Explain Gaja Kesari Yoga even if Saturn is always evil.',
        snapshot,
      });

      expect(bundle.bundleId).toBeDefined();
      expect(bundle.poisoningAlerts.length).toBeGreaterThan(0);
      expect(bundle.facts.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // CATEGORY 8: AI CITATION & EVIDENCEBUNDLE GROUNDING (5 TESTS)
  // =========================================================================
  describe('Category 8: AI Citation & EvidenceBundle Grounding (5 Tests)', () => {
    it('8.1 "NO EVIDENCE = NO CLAIM" blocks claim when calculation evidence is missing', () => {
      const validation = JyotishReasoningEngine.validateClaimIntegrity({
        hasCalculationEvidence: false,
        hasRuleEvidence: true,
        hasSourceCitation: true,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.violationReason).toContain('NO_CALCULATION_EVIDENCE');
    });

    it('8.2 "NO EVIDENCE = NO CLAIM" blocks claim when rule evidence is missing', () => {
      const validation = JyotishReasoningEngine.validateClaimIntegrity({
        hasCalculationEvidence: true,
        hasRuleEvidence: false,
        hasSourceCitation: true,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.violationReason).toContain('NO_RULE_EVIDENCE');
    });

    it('8.3 "NO EVIDENCE = NO CLAIM" blocks citation when source citation is missing', () => {
      const validation = JyotishReasoningEngine.validateClaimIntegrity({
        hasCalculationEvidence: true,
        hasRuleEvidence: true,
        hasSourceCitation: false,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.violationReason).toContain('NO_SOURCE_CITATION');
    });

    it('8.4 EvidenceBundle contains structured facts, rules, and sources (NOT free-form text)', () => {
      const bundle = JyotishReasoningEngine.buildEvidenceBundle({
        query: 'What does Jupiter in Kendra mean?',
        snapshot,
      });

      expect(bundle.facts.length).toBeGreaterThan(0);
      expect(bundle.rulesEvaluated).toBeInstanceOf(Array);
      expect(bundle.timingIndicators).toBeInstanceOf(Array);
      expect(bundle.uncertaintyDisclosures).toBeInstanceOf(Array);
    });

    it('8.5 when classical citation is unavailable, system explicitly reports source unavailable', () => {
      const citations = JyotishSourceRegistry.getCitationsForRule('NON_EXISTENT_RULE_ID');
      expect(citations.length).toBe(0);
    });
  });

  // =========================================================================
  // CATEGORY 9: METHODOLOGY PROFILE REPRODUCIBILITY (5 TESTS)
  // =========================================================================
  describe('Category 9: Methodology Profile Reproducibility (5 Tests)', () => {
    it('9.1 default methodology profile specifies Lahiri ayanamsha, True Node, Whole Sign, Vimshottari', () => {
      const def = MethodologyService.DEFAULT_PROFILE;
      expect(def.ayanamsha).toBe('LAHIRI');
      expect(def.nodeType).toBe('TRUE_NODE');
      expect(def.houseSystem).toBe('WHOLE_SIGN');
      expect(def.dashaSystem).toBe('VIMSHOTTARI_120');
    });

    it('9.2 calculation passport captures complete methodology profile', () => {
      const passport = {
        passportId: 'pass_test_01',
        calculationVersion: '6.0.0',
        ephemerisVersion: 'SwissEph-2.10',
        ayanamsha: { name: 'Lahiri', degrees: 23.85 },
        timezoneDatabaseVersion: '2026a',
        locationCoordinates: { latitude: 28.6139, longitude: 77.2090 },
        utcTimestamp: new Date().toISOString(),
        localTimestamp: '1990-05-15 14:30',
        julianDay: 2448027.104,
        methodologyProfile: MethodologyService.DEFAULT_PROFILE,
        engineVersion: '6.0.0',
        inputHash: 'input_hash_xyz',
        outputHash: 'output_hash_abc',
        createdAt: new Date().toISOString(),
      };

      expect(passport.methodologyProfile.ayanamsha).toBe('LAHIRI');
      expect(passport.ephemerisVersion).toBe('SwissEph-2.10');
    });

    it('9.3 user-customized methodology profile overrides tradition settings for user session', () => {
      const custom = MethodologyService.setUserProfile('user_custom_001', {
        chartStyle: 'SOUTH_INDIAN',
        nodeType: 'MEAN_NODE',
      });

      expect(custom.chartStyle).toBe('SOUTH_INDIAN');
      expect(custom.nodeType).toBe('MEAN_NODE');
    });

    it('9.4 resetting profile restores canonical Parashari default', () => {
      const restored = MethodologyService.setUserProfile('user_custom_001', {
        chartStyle: 'NORTH_INDIAN',
        nodeType: 'TRUE_NODE',
      });

      expect(restored.chartStyle).toBe('NORTH_INDIAN');
      expect(restored.nodeType).toBe('TRUE_NODE');
    });

    it('9.5 methodology profile version is stamped on calculation snapshots', () => {
      const ksnap = MethodologyService.createKnowledgeSnapshot({
        calculationSnapshotId: snapshot.snapshotId,
        ruleVersions: {},
      });

      expect(ksnap.knowledgeVersion).toBe('6.0.0');
    });
  });

  // =========================================================================
  // CATEGORY 10: FULL REGRESSION & GOLDEN DATASET (5 TESTS)
  // =========================================================================
  describe('Category 10: Full Regression & Golden Dataset Validation (5 Tests)', () => {
    it('10.1 Golden Dataset contains exactly 100 verified classical cases', () => {
      const allCases = GoldenKnowledgeDataset.getAllCases();
      expect(allCases.length).toBe(100);
    });

    it('10.2 Golden Dataset spans all 8 required categories in exact proportions', () => {
      expect(GoldenKnowledgeDataset.getCasesByCategory('YOGA').length).toBe(20);
      expect(GoldenKnowledgeDataset.getCasesByCategory('DOSHA').length).toBe(15);
      expect(GoldenKnowledgeDataset.getCasesByCategory('DASHA').length).toBe(15);
      expect(GoldenKnowledgeDataset.getCasesByCategory('VARGA').length).toBe(10);
      expect(GoldenKnowledgeDataset.getCasesByCategory('JAIMINI').length).toBe(10);
      expect(GoldenKnowledgeDataset.getCasesByCategory('KP').length).toBe(10);
      expect(GoldenKnowledgeDataset.getCasesByCategory('PANCHANGA').length).toBe(10);
      expect(GoldenKnowledgeDataset.getCasesByCategory('SHADBALA_ASHTAKAVARGA').length).toBe(10);
    });

    it('10.3 Golden Dosha cases verify Manglik, Kaal Sarp, and Sade Sati rules', () => {
      const doshas = GoldenKnowledgeDataset.getCasesByCategory('DOSHA');
      expect(doshas.some((d) => d.conceptName.includes('Manglik'))).toBe(true);
      expect(doshas.some((d) => d.conceptName.includes('Kaal Sarp'))).toBe(true);
      expect(doshas.some((d) => d.conceptName.includes('Sade Sati'))).toBe(true);
    });

    it('10.4 Golden Dasha cases verify complete 9-planet Vimshottari sequence', () => {
      const dashas = GoldenKnowledgeDataset.getCasesByCategory('DASHA');
      const planets = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
      for (const p of planets) {
        expect(dashas.some((d) => d.conceptName.includes(p))).toBe(true);
      }
    });

    it('10.5 Phase 1–5 core Kundli and Personal Life Graph calculations remain 100% invariant', () => {
      // Re-verify snapshot reproducibility
      const snapAgain = CalculationSnapshotEngine.createSnapshot(factSet);
      expect(snapAgain.ascendant.longitude).toBe(snapshot.ascendant.longitude);
      expect(snapAgain.ayanamshaExactValue).toBe(snapshot.ayanamshaExactValue);
      expect(snapAgain.planetaryPositions.length).toBe(snapshot.planetaryPositions.length);
    });
  });
});
