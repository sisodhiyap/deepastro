/**
 * DeepAstro 3.1 — Context Graph Engine (ContextGraphEngine)
 * Generates an ephemeral reasoning graph for every complex inquiry,
 * mapping interactions between calculated celestial mechanics, classical sutras,
 * user-confirmed milestones, active life goals, and real-world factors.
 * Invariant: Correlation is strictly distinguished from causation.
 */

import {
  ContextGraphPayload,
  ContextGraphNode,
  ContextGraphEdge,
  IntentCategory,
} from './IntelligenceTypes.js';
import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';
import { PersonalLifeGraph } from './PersonalLifeGraph.js';

export interface BuildGraphParams {
  userId: string;
  query: string;
  intent: IntentCategory;
  snapshot: CalculationSnapshot;
  activeGoals?: string[];
  worldFacts?: string[];
}

export class ContextGraphEngine {
  public static buildGraph(params: BuildGraphParams): ContextGraphPayload {
    const { userId, query, intent, snapshot, activeGoals = [], worldFacts = [] } = params;
    const nodes: ContextGraphNode[] = [];
    const edges: ContextGraphEdge[] = [];
    let edgeCounter = 1;

    const addEdge = (
      source: string,
      target: string,
      type: ContextGraphEdge['type'],
      weight = 0.8,
      notes?: string
    ) => {
      edges.push({
        id: `edge_${edgeCounter++}`,
        source,
        target,
        type,
        weight,
        notes,
      });
    };

    // 1. User & Question Nodes
    nodes.push({
      id: `user_${userId}`,
      type: 'USER',
      label: `User ${userId.substring(0, 8)}`,
      data: { userId },
    });

    nodes.push({
      id: 'node_query',
      type: 'QUESTION',
      label: query.length > 35 ? `${query.substring(0, 32)}...` : query,
      data: { query, intent },
    });
    addEdge(`user_${userId}`, 'node_query', 'RELATED_TO', 1.0);

    // 2. Deterministic Calculation Node
    const ascSign = snapshot.ascendant.sign;
    const moonPos = snapshot.planetaryPositions.find((p) => p.planet === 'Moon');
    const moonSign = moonPos?.sign || 'Moon Rashi';
    nodes.push({
      id: 'node_calc',
      type: 'CALCULATION',
      label: `Ascendant ${ascSign}, Moon ${moonSign}`,
      data: {
        ascendant: ascSign,
        moonSign,
        passport: snapshot.passport?.fingerprint,
      },
    });
    addEdge('node_query', 'node_calc', 'RELEVANT_TO', 0.95);

    // 3. Active Dasha Cycle Node
    const dashaLabel = `${snapshot.dashas.currentMahadasha}-${snapshot.dashas.currentAntardasha}`;
    nodes.push({
      id: 'node_dasha',
      type: 'DASHA',
      label: `Dasha: ${dashaLabel}`,
      data: {
        mahadasha: snapshot.dashas.currentMahadasha,
        antardasha: snapshot.dashas.currentAntardasha,
      },
    });
    addEdge('node_calc', 'node_dasha', 'ACTIVATES', 0.9);
    addEdge('node_dasha', 'node_query', 'SUPPORTS', 0.85);

    // 4. Relevant Varga Node
    const relevantVarga =
      intent === 'CAREER' || intent === 'JOB' || intent === 'BUSINESS'
        ? 'D10 Dashamsha'
        : intent === 'RELATIONSHIP' || intent === 'MARRIAGE'
        ? 'D9 Navamsha'
        : intent === 'EDUCATION'
        ? 'D24 Chaturvimshamsha'
        : intent === 'RELOCATION'
        ? 'D4 Chaturthamsha'
        : 'D1 Rashi';

    nodes.push({
      id: 'node_varga',
      type: 'VARGA',
      label: relevantVarga,
      data: { varga: relevantVarga, domain: intent },
    });
    addEdge('node_calc', 'node_varga', 'RELATED_TO', 0.88);

    // 5. User Confirmed Milestones (from PersonalLifeGraph)
    const confirmedEvents = PersonalLifeGraph.getConfirmedNodes(userId);
    const domainEvents = confirmedEvents.filter((e) => {
      if (intent === 'CAREER' || intent === 'JOB' || intent === 'BUSINESS') {
        return e.type === 'JOB' || e.type === 'CAREER' || e.type === 'BUSINESS';
      }
      if (intent === 'RELATIONSHIP' || intent === 'MARRIAGE') {
        return e.type === 'MARRIAGE' || e.type === 'RELATIONSHIP';
      }
      if (intent === 'RELOCATION' || intent === 'TRAVEL') {
        return e.type === 'MOVE' || e.type === 'LOCATION';
      }
      return true;
    });

    domainEvents.slice(0, 4).forEach((evt, idx) => {
      const evtId = `evt_${evt.nodeId || idx}`;
      nodes.push({
        id: evtId,
        type: 'LIFE_EVENT',
        label: evt.title,
        data: { date: evt.dateStart, type: evt.type },
        userConfirmed: true,
      });
      addEdge(`user_${userId}`, evtId, 'CONFIRMS', 1.0);
      addEdge(evtId, 'node_dasha', 'CORRELATES_WITH', 0.75, 'Observed cyclical milestone');
    });

    // 6. Active Goals Nodes
    activeGoals.slice(0, 3).forEach((goal, gIdx) => {
      const gId = `goal_${gIdx}`;
      nodes.push({
        id: gId,
        type: 'GOAL',
        label: goal,
        data: { goal },
        userConfirmed: true,
      });
      addEdge(`user_${userId}`, gId, 'SUPPORTS', 1.0);
      addEdge(gId, 'node_query', 'RELEVANT_TO', 0.9);
    });

    // 7. World Facts (if consented research exists)
    worldFacts.slice(0, 2).forEach((wf, wfIdx) => {
      const wfId = `wf_${wfIdx}`;
      nodes.push({
        id: wfId,
        type: 'WORLD_FACT',
        label: wf.length > 30 ? `${wf.substring(0, 27)}...` : wf,
        data: { fact: wf },
      });
      addEdge('node_query', wfId, 'RELATED_TO', 0.7);
    });

    return {
      nodes,
      edges,
      invariants: [
        'CORRELATION != CAUSATION: Planetary cycles indicate environmental support and synchronicity, not fatalistic causality.',
        'IMMUTABLE TRUTH CORE: Ephemeris positions and Varga divisions are read-only.',
        'SOVEREIGN MEMORY: Only user-confirmed nodes possess authoritative context status.',
      ],
    };
  }
}
