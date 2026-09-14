import { db } from '../database/db.js';
/**
 * DeepAstro Phase 6 — Classical Knowledge API Routes
 * Endpoints for Knowledge Graph Explorer, Classical Sources, Search,
 * Methodology Profiles, Rule Explanation, and Evidence Bundles.
 */

import { Router, Response } from 'express';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { JyotishKnowledgeGraph } from '../knowledge/JyotishKnowledgeGraph.js';
import { JyotishSourceRegistry } from '../knowledge/JyotishSourceRegistry.js';
import { MethodologyService } from '../knowledge/MethodologyProfile.js';
import { KnowledgeRAGRouterV2 } from '../knowledge/KnowledgeRAGRouterV2.js';
import { JyotishReasoningEngine } from '../knowledge/JyotishReasoningEngine.js';
import { VedicAstroEngine } from '../astrology/VedicAstroEngine.js';
import { CalculationSnapshotEngine } from '../astrology/CalculationSnapshot.js';

const router = Router();

// GET /api/knowledge/search — Hybrid classical knowledge search
router.get('/search', (req, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    if (!q) {
      return res.status(400).json({ error: 'Search query parameter "q" is required.' });
    }

    const ragResult = KnowledgeRAGRouterV2.retrieve(q);
    res.json({
      success: true,
      query: q,
      domain: ragResult.targetDomain,
      itemCount: ragResult.items.length,
      results: ragResult.items.map((i) => ({
        knowledgeId: i.knowledgeObject.knowledgeId,
        concept: i.knowledgeObject.concept,
        entityType: i.knowledgeObject.entityType,
        definition: i.knowledgeObject.definition,
        rules: i.knowledgeObject.rules,
        sources: i.sources.map((s) => ({
          sourceId: s.sourceId,
          title: s.title,
          author: s.authorOrTradition,
          status: s.verificationStatus,
        })),
        scores: i.scores,
        methodologyVariants: i.methodologyVariants,
      })),
      conflicts: ragResult.conflictingMethodologies,
      confidence: ragResult.confidence,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/knowledge/sources — List all canonical classical sources
router.get('/sources', (_req, res: Response) => {
  try {
    const sources = JyotishSourceRegistry.getAllVerifiedSources();
    res.json({
      success: true,
      count: sources.length,
      sources,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/knowledge/methodology — Retrieve active methodology profile & variants
router.get('/methodology', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'anonymous';
    const profile = MethodologyService.getUserProfile(userId);
    const variants = MethodologyService.getVariants('CONCEPT_CHARA_KARAKA');

    res.json({
      success: true,
      activeProfile: profile,
      standardVariants: variants,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/knowledge/graph/:concept — Explore concept and semantic relationships
router.get('/graph/:concept', (req, res: Response) => {
  try {
    const conceptName = req.params.concept;
    const knowledge = JyotishKnowledgeGraph.getByConcept(conceptName);

    if (!knowledge) {
      return res.status(404).json({ error: `Concept "${conceptName}" not found in knowledge graph.` });
    }

    const outgoing = JyotishKnowledgeGraph.getOutgoingRelations(knowledge.knowledgeId);
    const incoming = JyotishKnowledgeGraph.getIncomingRelations(knowledge.knowledgeId);
    const citations = JyotishSourceRegistry.getCitationsForRule(knowledge.knowledgeId);

    res.json({
      success: true,
      concept: knowledge,
      relationships: {
        outgoing,
        incoming,
      },
      citations,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/knowledge/explain-rule — Explain why a user has or does not have a specific yoga/dosha
router.post('/explain-rule', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conceptName, birthProfile } = req.body;

    if (!conceptName) {
      return res.status(400).json({ error: 'conceptName is required (e.g. "Gaja Kesari Yoga").' });
    }

    let profileInput = birthProfile;
    if (!profileInput && req.user) {
      profileInput = db.getBirthProfile(req.user.userId);
    }
    if (!profileInput || !profileInput.birthDate || !profileInput.birthTime) {
      return res.status(400).json({
        error: 'BIRTH_PROFILE_REQUIRED',
        message: 'Birth profile required to evaluate personalized concept explanation.',
      });
    }

    const factSet = VedicAstroEngine.createAstrologyFactSet(profileInput);
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet);

    const explanation = JyotishReasoningEngine.explainRule(conceptName, snapshot);

    res.json({
      success: true,
      explanation,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/knowledge/reason — Compile structured EvidenceBundle for inquiry
router.post('/reason', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query, birthProfile, userContext, researchContext } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query is required.' });
    }

    const profileInput = birthProfile || {
      name: 'Reasoning Native',
      birthDate: '1992-10-24',
      birthTime: '08:45',
      birthPlace: 'New Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    };

    const factSet = VedicAstroEngine.createAstrologyFactSet(profileInput);
    const snapshot = CalculationSnapshotEngine.createSnapshot(factSet);

    const evidenceBundle = JyotishReasoningEngine.buildEvidenceBundle({
      query,
      snapshot,
      userContext,
      researchContext,
    });

    res.json({
      success: true,
      evidenceBundle,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export { router as knowledgeRoutes };
