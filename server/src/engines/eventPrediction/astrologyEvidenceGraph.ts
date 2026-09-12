/**
 * Astrology Evidence Graph Engine
 * Foundation for explainable, auditable astrological predictions.
 * Represents entities and relationships as a directed graph.
 */

export type NodeType =
  | 'Planet'
  | 'House'
  | 'Sign'
  | 'Nakshatra'
  | 'StarLord'
  | 'SubLord'
  | 'Cusp'
  | 'Dasha'
  | 'Varga'
  | 'Transit'
  | 'Event';

export type EdgeType =
  | 'occupies'
  | 'owns'
  | 'signifies'
  | 'rules'
  | 'aspects'
  | 'connects'
  | 'supports'
  | 'challenges'
  | 'activates';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  relation: EdgeType;
  weight?: number; // 0.0 to 1.0
  evidenceDetail: string;
}

export interface AstrologyEvidenceGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export class AstrologyEvidenceGraphBuilder {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  public addNode(id: string, type: NodeType, label: string, metadata?: Record<string, any>): this {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id, type, label, metadata });
    }
    return this;
  }

  public addEdge(from: string, to: string, relation: EdgeType, detail: string, weight: number = 1.0): this {
    const id = `edge_${from}_${relation}_${to}_${this.edges.length}`;
    this.edges.push({
      id,
      from,
      to,
      relation,
      weight,
      evidenceDetail: detail,
    });
    return this;
  }

  public build(): AstrologyEvidenceGraph {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: [...this.edges],
    };
  }
}
