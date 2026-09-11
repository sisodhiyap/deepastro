/**
 * DeepAstro Phase 8 — Governance, Health & Self-Healing API Routes
 * 
 * Exposes monitored REST endpoints for:
 * - System brain health & anomaly telemetry
 * - 14-layer Independent Validation Harness
 * - Incident management & root cause analysis
 * - Self-healing orchestrator simulation & status
 * - Governed self-learning proposals & promotion gates
 * - Production release gating evaluation
 */

import { Router, Request, Response } from 'express';
import { DeepAstroHealthEngine } from '../services/DeepAstroHealthEngine.js';
import { IndependentValidationHarness } from '../systemVerification/IndependentValidationHarness.js';
import { IncidentManagementEngine } from '../services/IncidentManagementEngine.js';
import { DeepAstroSelfHealingOrchestrator, SelfHealingLevel } from '../services/DeepAstroSelfHealingOrchestrator.js';
import { DeepAstroLearningGovernanceEngine } from '../learning/DeepAstroLearningGovernanceEngine.js';
import { DeepAstroReleaseGate } from '../services/DeepAstroReleaseGate.js';

export const governanceRouter = Router();

/**
 * GET /api/governance/health
 * Returns status of all 16 subsystems + active anomalies
 */
governanceRouter.get('/health', (_req: Request, res: Response) => {
  try {
    const health = DeepAstroHealthEngine.getBrainHealth();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/validation
 * Executes and returns the 14-layer Independent Validation Harness
 */
governanceRouter.get('/validation', (_req: Request, res: Response) => {
  try {
    const auditReport = IndependentValidationHarness.runCompleteAudit();
    res.json(auditReport);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/incidents
 * Returns all logged production incidents
 */
governanceRouter.get('/incidents', (_req: Request, res: Response) => {
  try {
    const incidents = IncidentManagementEngine.getAllIncidents();
    res.json(incidents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/self-healing/simulate
 * Simulates a subsystem incident and orchestrates safe recovery
 */
governanceRouter.post('/self-healing/simulate', (req: Request, res: Response) => {
  try {
    const { component, severity, symptoms, level, context } = req.body;
    const incident = IncidentManagementEngine.createIncident({
      component: component || 'AI_providers',
      severity: severity || 'P1',
      detectedBy: 'API_SIMULATOR',
      symptoms: symptoms || 'Simulated provider timeout',
    });

    const parsedLevel = Number(level);
    const targetLevel: SelfHealingLevel = (parsedLevel >= 0 && parsedLevel <= 6 ? parsedLevel : 2) as SelfHealingLevel;
    const recoveryResult = DeepAstroSelfHealingOrchestrator.executeSelfHealing(incident, targetLevel, context);

    res.json({
      incident,
      recoveryResult,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/proposals
 * Returns all active self-learning proposals
 */
governanceRouter.get('/proposals', (_req: Request, res: Response) => {
  try {
    const proposals = DeepAstroLearningGovernanceEngine.getAllProposals();
    const activeParameters = DeepAstroLearningGovernanceEngine.getActiveParameters();
    res.json({ proposals, activeParameters });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/proposals
 * Submits a new learning proposal to the governance engine
 */
governanceRouter.post('/proposals', (req: Request, res: Response) => {
  try {
    const proposal = DeepAstroLearningGovernanceEngine.submitProposal(req.body);
    res.json(proposal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/proposals/:id/validate
 * Runs offline, shadow, adversarial testing on proposal
 */
governanceRouter.post('/proposals/:id/validate', (req: Request, res: Response) => {
  try {
    const proposalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = DeepAstroLearningGovernanceEngine.runProposalValidation(proposalId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/proposals/:id/promote
 * Admin approval gate to promote proposal with bounded parameters
 */
governanceRouter.post('/proposals/:id/promote', (req: Request, res: Response) => {
  try {
    const { adminId, approved, notes } = req.body;
    const proposalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = DeepAstroLearningGovernanceEngine.promoteProposal(
      proposalId,
      adminId || 'ADMIN-LEAD',
      approved !== false,
      notes || 'Standard promotion'
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/release-gate
 * Evaluates the 12-gate release criteria
 */
governanceRouter.get('/release-gate', (req: Request, res: Response) => {
  try {
    const checks: Record<string, boolean> = {};
    if (req.query.unitTests === 'false') checks.unitTests = false;
    if (req.query.security === 'false') checks.security = false;
    const evaluation = DeepAstroReleaseGate.evaluateRelease(checks);
    res.json(evaluation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
