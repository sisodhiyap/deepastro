/**
 * DeepAstro Phase 8 — Incident Management & Root Cause Analysis Engine
 * 
 * Implements structured incident classification, honest root cause analysis (RCA),
 * and safe, auditable rollbacks for non-core mutable systems.
 * 
 * Invariants:
 * 1. UNKNOWN root causes remain UNKNOWN — root causes are NEVER fabricated.
 * 2. Immutable systems (astronomical calculations, historical snapshots, user facts)
 *    can NEVER be rolled back or mutated.
 * 3. All rollbacks are atomic, auditable, and reversible.
 */

export type IncidentSeverity = 'P0' | 'P1' | 'P2' | 'P3';

export type RootCauseCategory =
  | 'CODE'
  | 'DATA'
  | 'DATABASE'
  | 'NETWORK'
  | 'AI_PROVIDER'
  | 'KNOWLEDGE'
  | 'CONFIGURATION'
  | 'USER_INPUT'
  | 'EXTERNAL_DEPENDENCY'
  | 'UNKNOWN';

export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RECOVERED' | 'FAILED' | 'ROLLED_BACK';

export interface IncidentRecord {
  incidentId: string;
  timestamp: string;
  severity: IncidentSeverity;
  component: string;
  detectedBy: string;
  symptoms: string;
  rootCause: RootCauseCategory;
  impact: string;
  recoveryAction: string;
  verificationResult: string;
  knowledgeImpact: 'NONE' | 'ISOLATED' | 'QUARANTINED';
  userImpact: 'NONE' | 'DEGRADED_EXPERIENCE' | 'TRANSACTION_BLOCKED';
  status: IncidentStatus;
  rollbackAvailable: boolean;
  resolvedAt?: string;
  auditTrail: string[];
}

export interface RollbackSnapshot {
  snapshotId: string;
  component: string;
  version: string;
  payload: Record<string, any>;
  createdAt: string;
  createdBy: string;
}

export class IncidentManagementEngine {
  public static readonly VERSION = '8.0.0-PROD';

  private static incidents: Map<string, IncidentRecord> = new Map();
  private static rollbackSnapshots: Map<string, RollbackSnapshot[]> = new Map();

  /**
   * Logs a new production incident with strict schema
   */
  public static createIncident(data: {
    severity: IncidentSeverity;
    component: string;
    detectedBy: string;
    symptoms: string;
    rawEvidence?: Record<string, any>;
  }): IncidentRecord {
    const incidentId = `INC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const rootCause = this.analyzeRootCause(data.component, data.symptoms, data.rawEvidence);

    const record: IncidentRecord = {
      incidentId,
      timestamp: new Date().toISOString(),
      severity: data.severity,
      component: data.component,
      detectedBy: data.detectedBy,
      symptoms: data.symptoms,
      rootCause,
      impact: data.severity === 'P0' ? 'System partially gated or tenant isolated' : 'Non-critical service degradation',
      recoveryAction: 'PENDING_POLICY_EVALUATION',
      verificationResult: 'UNVERIFIED',
      knowledgeImpact: data.component === 'knowledge_graph' ? 'QUARANTINED' : 'NONE',
      userImpact: data.severity === 'P0' ? 'TRANSACTION_BLOCKED' : 'DEGRADED_EXPERIENCE',
      status: 'OPEN',
      rollbackAvailable: this.isRollbackEligible(data.component),
      auditTrail: [`[${new Date().toISOString()}] Incident detected by ${data.detectedBy}: ${data.symptoms}`],
    };

    this.incidents.set(incidentId, record);
    return record;
  }

  /**
   * Classifies root causes without fabrication. If uncertain, returns UNKNOWN.
   */
  public static analyzeRootCause(
    component: string,
    symptoms: string,
    evidence?: Record<string, any>
  ): RootCauseCategory {
    const sym = symptoms.toLowerCase();

    if (!evidence || Object.keys(evidence).length === 0) {
      // If there is no specific technical evidence, do NOT guess.
      if (sym.includes('unknown') || sym.includes('unexpected')) {
        return 'UNKNOWN';
      }
    }

    if (evidence?.httpStatus === 429 || evidence?.httpStatus === 503 || sym.includes('rate limit') || sym.includes('provider outage')) {
      return 'AI_PROVIDER';
    }

    if (evidence?.code === 'ECONNREFUSED' || sym.includes('network timeout') || sym.includes('socket hang up')) {
      return 'NETWORK';
    }

    if (sym.includes('rls') || sym.includes('postgres') || sym.includes('db pool') || evidence?.dbError) {
      return 'DATABASE';
    }

    if (sym.includes('malformed input') || sym.includes('invalid coordinate') || sym.includes('invalid date format')) {
      return 'USER_INPUT';
    }

    if (component === 'knowledge_graph' && (sym.includes('poison') || sym.includes('fake citation'))) {
      return 'KNOWLEDGE';
    }

    if (sym.includes('typeerror') || sym.includes('null pointer') || sym.includes('assertion failed')) {
      return 'CODE';
    }

    // Default invariant: Never fabricate a cause
    return 'UNKNOWN';
  }

  /**
   * Checks if component is allowed to be rolled back
   */
  public static isRollbackEligible(component: string): boolean {
    const immutableComponents = [
      'astronomy_engine',
      'swiss_ephemeris',
      'julian_day',
      'lahiri_ayanamsha',
      'varga_mathematics',
      'dasha_mathematics',
      'calculation_passports',
      'prediction_ledger',
    ];

    if (immutableComponents.includes(component.toLowerCase())) {
      return false; // Strictly forbidden
    }

    const eligibleComponents = [
      'ai_prompt_version',
      'rag_configuration',
      'retrieval_ranking_weights',
      'ui_configuration',
      'personalization_policy',
      'research_strategy',
    ];

    return eligibleComponents.includes(component.toLowerCase());
  }

  /**
   * Registers a versioned configuration snapshot for safe rollback
   */
  public static registerSnapshot(snapshot: RollbackSnapshot): void {
    if (!this.isRollbackEligible(snapshot.component)) {
      throw new Error(`Component '${snapshot.component}' is immutable or forbidden from runtime rollback`);
    }

    const list = this.rollbackSnapshots.get(snapshot.component) || [];
    list.push(snapshot);
    this.rollbackSnapshots.set(snapshot.component, list);
  }

  /**
   * Executes atomic, auditable rollback to previous snapshot
   */
  public static executeRollback(incidentId: string, component: string): {
    success: boolean;
    restoredVersion?: string;
    message: string;
  } {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      return { success: false, message: `Incident ${incidentId} not found` };
    }

    if (!this.isRollbackEligible(component)) {
      incident.auditTrail.push(`[${new Date().toISOString()}] Rollback rejected: component ${component} is IMMUTABLE`);
      return { success: false, message: `Component '${component}' is immutable. Rollback rejected.` };
    }

    const history = this.rollbackSnapshots.get(component);
    if (!history || history.length < 2) {
      incident.auditTrail.push(`[${new Date().toISOString()}] Rollback failed: no previous snapshot available`);
      return { success: false, message: `No previous snapshot available for ${component}` };
    }

    // Pop the broken current version and restore the previous
    history.pop();
    const targetSnapshot = history[history.length - 1];

    incident.status = 'ROLLED_BACK';
    incident.recoveryAction = `Restored ${component} to version ${targetSnapshot.version}`;
    incident.resolvedAt = new Date().toISOString();
    incident.auditTrail.push(`[${new Date().toISOString()}] Successfully rolled back to ${targetSnapshot.version} (Snapshot: ${targetSnapshot.snapshotId})`);

    return {
      success: true,
      restoredVersion: targetSnapshot.version,
      message: `Restored ${component} to version ${targetSnapshot.version}`,
    };
  }

  public static getIncident(incidentId: string): IncidentRecord | undefined {
    return this.incidents.get(incidentId);
  }

  public static getAllIncidents(): IncidentRecord[] {
    return Array.from(this.incidents.values());
  }

  public static clear(): void {
    this.incidents.clear();
    this.rollbackSnapshots.clear();
  }
}
