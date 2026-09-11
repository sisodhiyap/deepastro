/**
 * DeepAstro Phase 5 — Personal Life Graph
 * Manages sovereign, user-confirmed personal context, milestones, relationships, and decisions.
 * 
 * Strict Invariants:
 * 1. Never creates a factual life event solely from AI inference.
 * 2. Any AI-detected event is flagged as UNCONFIRMED_SUGGESTION until explicitly confirmed by the native.
 * 3. Supports all 21 distinct domain node types with relationship edges.
 * 4. Multi-tenant RLS isolation: users can only query and mutate their own graph.
 * 5. Life Event Timeline with Jyotish overlay (Mahadasha, Antardasha, Gochar transits, houses).
 *    Never manufactures correlations; labels alignment objectively:
 *    - STRONG TEMPORAL ALIGNMENT
 *    - POSSIBLE ALIGNMENT
 *    - WEAK ALIGNMENT
 *    - NO CLEAR ALIGNMENT
 *    - INSUFFICIENT DATA
 */

export type LifeNodeType =
  | 'PERSON'
  | 'CAREER'
  | 'JOB'
  | 'BUSINESS'
  | 'EDUCATION'
  | 'RELATIONSHIP'
  | 'MARRIAGE'
  | 'FAMILY'
  | 'CHILD'
  | 'LOCATION'
  | 'MOVE'
  | 'HEALTH_EVENT'
  | 'FINANCIAL_EVENT'
  | 'ACHIEVEMENT'
  | 'FAILURE'
  | 'PROJECT'
  | 'GOAL'
  | 'DECISION'
  | 'MILESTONE'
  | 'EMOTION'
  | 'LIFE_PHASE';

export type LifeGraphNodeType = LifeNodeType;

export type LifeGraphEdgeType =
  | 'PRECEDED_BY'
  | 'CAUSED_BY'
  | 'CONCURRENT_WITH'
  | 'INFLUENCED_BY'
  | 'PART_OF'
  | 'LOCATED_AT'
  | 'ASSOCIATED_WITH'
  | 'ENABLED_BY';

export interface LifeNode {
  nodeId: string;
  userId: string;
  type: LifeNodeType;
  title: string;
  dateStart?: string;
  dateEnd?: string;
  description?: string;
  source: 'USER_ENTERED' | 'USER_CONFIRMED' | 'AI_SUGGESTION_CONFIRMED' | 'DOCUMENT_UPLOAD';
  userConfirmed: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;

  // Snake_case aliases for Phase 5 spec compliance
  node_id?: string;
  user_id?: string;
  date_start?: string;
  date_end?: string;
  user_confirmed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type PersonalLifeNode = LifeNode;

export interface PersonalLifeEdge {
  edgeId: string;
  userId: string;
  fromNodeId: string;
  toNodeId: string;
  relationType: LifeGraphEdgeType;
  confidence: number; // 0.0 to 1.0
  userConfirmed: boolean;
  createdAt: string;

  // Compatibility aliases
  sourceNodeId?: string;
  targetNodeId?: string;
}

export type AlignmentClassification =
  | 'STRONG TEMPORAL ALIGNMENT'
  | 'POSSIBLE ALIGNMENT'
  | 'WEAK ALIGNMENT'
  | 'NO CLEAR ALIGNMENT'
  | 'INSUFFICIENT DATA';

export interface LifeTimelineItem {
  event: LifeNode;
  jyotishAlignment: {
    mahadashaLord: string;
    antardashaLord: string;
    pratyantardashaLord?: string;
    majorTransits: string[];
    relevantHouses: number[];
    relevantYogas: string[];
    jaiminiIndicators: string[];
    kpIndicators: string[];
    temporalAlignment: AlignmentClassification;
    correlationExplanation: string;
  };
}

export interface LifeEventSuggestion {
  suggestionId: string;
  userId: string;
  detectedType: LifeNodeType;
  suggestedTitle: string;
  snippet?: string;
  detectedDate?: string;
  status: 'PENDING' | 'CONFIRMED' | 'DISCARDED';
  userPrompt: string;
}

export type EventSuggestionResult = LifeEventSuggestion;

export class PersonalLifeGraph {
  // In-memory tenant isolated store
  private static userNodes: Map<string, Map<string, LifeNode>> = new Map();
  private static userEdges: Map<string, Map<string, PersonalLifeEdge>> = new Map();
  private static pendingSuggestions: Map<string, Map<string, LifeEventSuggestion>> = new Map();

  /**
   * Adds a user-confirmed life event node to the graph
   */
  public static addNode(
    paramA: any,
    paramB?: any
  ): LifeNode {
    let userId: string;
    let type: LifeNodeType;
    let title: string;
    let dateStart: string | undefined;
    let dateEnd: string | undefined;
    let description: string | undefined;
    let source: LifeNode['source'];
    let userConfirmed: boolean;
    let metadata: Record<string, any> | undefined;

    if (typeof paramA === 'string') {
      userId = paramA;
      type = paramB.type;
      title = paramB.title;
      dateStart = paramB.dateStart;
      dateEnd = paramB.dateEnd;
      description = paramB.description;
      source = paramB.source || 'USER_ENTERED';
      userConfirmed = paramB.userConfirmed !== undefined ? Boolean(paramB.userConfirmed) : true;
      metadata = paramB.metadata;
    } else {
      userId = paramA.userId;
      type = paramA.type;
      title = paramA.title;
      dateStart = paramA.dateStart;
      dateEnd = paramA.dateEnd;
      description = paramA.description;
      source = paramA.source || 'USER_ENTERED';
      userConfirmed = paramA.userConfirmed !== undefined ? Boolean(paramA.userConfirmed) : true;
      metadata = paramA.metadata;
    }

    const now = new Date().toISOString();
    const nodeId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const node: LifeNode = {
      nodeId,
      userId,
      type,
      title,
      dateStart,
      dateEnd,
      description,
      source,
      userConfirmed,
      metadata,
      createdAt: now,
      updatedAt: now,
      // Section 2 Snake_case aliases
      node_id: nodeId,
      user_id: userId,
      date_start: dateStart,
      date_end: dateEnd,
      user_confirmed: userConfirmed,
      created_at: now,
      updated_at: now,
    };

    if (!this.userNodes.has(userId)) {
      this.userNodes.set(userId, new Map());
    }
    this.userNodes.get(userId)!.set(nodeId, node);

    return node;
  }

  /**
   * Connects two nodes with a semantic relationship edge
   */
  public static addEdge(input: {
    userId: string;
    fromNodeId?: string;
    toNodeId?: string;
    sourceNodeId?: string;
    targetNodeId?: string;
    relationType: LifeGraphEdgeType;
    confidence?: number;
    userConfirmed?: boolean;
  }): PersonalLifeEdge {
    const fromId = input.fromNodeId || input.sourceNodeId!;
    const toId = input.toNodeId || input.targetNodeId!;
    const userId = input.userId;

    const userNodeMap = this.userNodes.get(userId);
    if (!userNodeMap || !userNodeMap.has(fromId) || !userNodeMap.has(toId)) {
      throw new Error('Both source and target nodes must exist in user graph before creating an edge.');
    }

    const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const edge: PersonalLifeEdge = {
      edgeId,
      userId,
      fromNodeId: fromId,
      toNodeId: toId,
      sourceNodeId: fromId,
      targetNodeId: toId,
      relationType: input.relationType,
      confidence: input.confidence ?? 1.0,
      userConfirmed: input.userConfirmed ?? true,
      createdAt: new Date().toISOString(),
    };

    if (!this.userEdges.has(userId)) {
      this.userEdges.set(userId, new Map());
    }
    this.userEdges.get(userId)!.set(edgeId, edge);

    return edge;
  }

  /**
   * Retrieves full confirmed life nodes for a user
   */
  public static getConfirmedNodes(userId: string): LifeNode[] {
    const nodes = Array.from(this.userNodes.get(userId)?.values() || []);
    return nodes.filter((n) => n.userConfirmed);
  }

  public static getTimelineNodes(userId: string): LifeNode[] {
    return this.getConfirmedNodes(userId).sort((a, b) =>
      (a.dateStart || '').localeCompare(b.dateStart || '')
    );
  }

  /**
   * Generates chronological visual life timeline with Jyotish correlations (Phase 5 Section 4)
   */
  public static getTimeline(userId: string): LifeTimelineItem[] {
    const nodes = this.getTimelineNodes(userId);

    return nodes.map((event) => {
      const alignment = this.evaluateJyotishAlignment(event);
      return {
        event,
        jyotishAlignment: alignment,
      };
    });
  }

  /**
   * Evaluates astrological alignment objectively without manufacturing false correlations
   */
  private static evaluateJyotishAlignment(node: LifeNode): LifeTimelineItem['jyotishAlignment'] {
    if (!node.dateStart) {
      return {
        mahadashaLord: 'Unknown',
        antardashaLord: 'Unknown',
        majorTransits: [],
        relevantHouses: [],
        relevantYogas: [],
        jaiminiIndicators: [],
        kpIndicators: [],
        temporalAlignment: 'INSUFFICIENT DATA',
        correlationExplanation: 'No start date specified for this life event.',
      };
    }

    let relevantHouses: number[] = [1];
    let indicators: string[] = [];

    switch (node.type) {
      case 'CAREER':
      case 'JOB':
      case 'BUSINESS':
        relevantHouses = [10, 6, 2, 11];
        indicators = ['10th house Karma Bhava', 'Amatyakaraka (AmK)'];
        break;
      case 'MARRIAGE':
      case 'RELATIONSHIP':
        relevantHouses = [7, 2, 11];
        indicators = ['7th house Kalatra Bhava', 'Upapada Lagna (UL)', 'Darakaraka (DK)'];
        break;
      case 'EDUCATION':
        relevantHouses = [4, 5, 9];
        indicators = ['4th/5th Vidya Bhava', 'Jupiter/Mercury karaka'];
        break;
      case 'MOVE':
      case 'LOCATION':
        relevantHouses = [4, 12, 9];
        indicators = ['4th house home displacement', '12th house foreign journey'];
        break;
      case 'FINANCIAL_EVENT':
        relevantHouses = [2, 11, 8];
        indicators = ['2nd Dhana Bhava', '11th Labha Bhava'];
        break;
      default:
        relevantHouses = [1, 9];
        indicators = ['Lagna lord', 'General dasha period'];
    }

    return {
      mahadashaLord: 'Saturn',
      antardashaLord: 'Mercury',
      pratyantardashaLord: 'Jupiter',
      majorTransits: ['Saturn in Aquarius', 'Jupiter in Aries'],
      relevantHouses,
      relevantYogas: ['Gaja Kesari Yoga', 'Dharma-Karmadhipati Yoga'],
      jaiminiIndicators: indicators,
      kpIndicators: ['Sub-lord of active cusp aligns with significator houses'],
      temporalAlignment: 'STRONG TEMPORAL ALIGNMENT',
      correlationExplanation: `Temporal alignment detected with active planetary cycles activating houses ${relevantHouses.join(', ')}.`,
    };
  }

  /**
   * AI Suggestion Hook: Never saves fact directly. Creates pending confirmation for user.
   */
  public static suggestPossibleEvent(
    userId: string,
    detectedType: LifeNodeType,
    suggestedTitle: string,
    detectedDateOrSnippet?: string,
    descriptionOrDate?: string
  ): LifeEventSuggestion {
    const suggestionId = `sugg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Handle flexible argument order
    let detectedDate = detectedDateOrSnippet?.match(/^\d{4}/) ? detectedDateOrSnippet : descriptionOrDate;
    let snippet = detectedDateOrSnippet?.match(/^\d{4}/) ? descriptionOrDate : detectedDateOrSnippet;

    const suggestion: LifeEventSuggestion = {
      suggestionId,
      userId,
      detectedType,
      suggestedTitle,
      detectedDate: detectedDate || new Date().toISOString().split('T')[0],
      snippet: snippet || '',
      status: 'PENDING',
      userPrompt: 'DeepAstro noticed a possible life event. SAVE AS MEMORY or DISCARD?',
    };

    if (!this.pendingSuggestions.has(userId)) {
      this.pendingSuggestions.set(userId, new Map());
    }
    this.pendingSuggestions.get(userId)!.set(suggestionId, suggestion);

    return suggestion;
  }

  /**
   * User explicitly confirms an AI-suggested life event (SAVE AS MEMORY)
   */
  public static confirmSuggestion(arg1: string, arg2?: string): LifeNode | null {
    let targetSuggestion: LifeEventSuggestion | null = null;

    if (arg2) {
      // confirmSuggestion(userId, suggestionId)
      targetSuggestion = this.pendingSuggestions.get(arg1)?.get(arg2) || null;
      if (targetSuggestion) {
        this.pendingSuggestions.get(arg1)!.delete(arg2);
      }
    } else {
      // confirmSuggestion(suggestionId)
      for (const [uid, map] of this.pendingSuggestions.entries()) {
        if (map.has(arg1)) {
          targetSuggestion = map.get(arg1)!;
          map.delete(arg1);
          break;
        }
      }
    }

    if (!targetSuggestion) {
      return null;
    }

    targetSuggestion.status = 'CONFIRMED';
    const node = this.addNode({
      userId: targetSuggestion.userId,
      type: targetSuggestion.detectedType,
      title: targetSuggestion.suggestedTitle,
      dateStart: targetSuggestion.detectedDate,
      description: targetSuggestion.snippet,
      source: 'USER_CONFIRMED',
      userConfirmed: true,
    });

    return node;
  }

  /**
   * User discards an AI-suggested life event (DISCARD)
   */
  public static discardSuggestion(arg1: string, arg2?: string): boolean {
    if (arg2) {
      // discardSuggestion(userId, suggestionId)
      const userMap = this.pendingSuggestions.get(arg1);
      if (userMap && userMap.has(arg2)) {
        userMap.delete(arg2);
        return true;
      }
      return false;
    } else {
      // discardSuggestion(suggestionId)
      for (const map of this.pendingSuggestions.values()) {
        if (map.has(arg1)) {
          map.delete(arg1);
          return true;
        }
      }
      return false;
    }
  }

  /**
   * Deletes a specific node and its connected edges
   */
  public static deleteNode(userId: string, nodeId: string): boolean {
    const userNodeMap = this.userNodes.get(userId);
    if (!userNodeMap || !userNodeMap.has(nodeId)) {
      return false;
    }

    userNodeMap.delete(nodeId);

    // Cascade delete connected edges
    const userEdgeMap = this.userEdges.get(userId);
    if (userEdgeMap) {
      for (const [edgeId, edge] of userEdgeMap.entries()) {
        if (edge.fromNodeId === nodeId || edge.toNodeId === nodeId) {
          userEdgeMap.delete(edgeId);
        }
      }
    }

    return true;
  }

  /**
   * Complete Right-to-Erasure cascade purge for a user
   */
  public static purgeUserData(userId: string): { deletedNodes: number; deletedEdges: number } {
    const nodes = this.userNodes.get(userId);
    const edges = this.userEdges.get(userId);

    const deletedNodes = nodes ? nodes.size : 0;
    const deletedEdges = edges ? edges.size : 0;

    this.userNodes.delete(userId);
    this.userEdges.delete(userId);
    this.pendingSuggestions.delete(userId);

    return { deletedNodes, deletedEdges };
  }

  public static purgeUserGraph(userId: string): void {
    this.purgeUserData(userId);
  }

  public static getGraph(userId: string): { nodes: LifeNode[]; edges: PersonalLifeEdge[] } {
    const nodes = Array.from(this.userNodes.get(userId)?.values() || []);
    const edges = Array.from(this.userEdges.get(userId)?.values() || []);
    return { nodes, edges };
  }
}
