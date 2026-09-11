/**
 * Life Context Graph V2 (LifeContextGraphV2)
 * Phase 7 Master Life Graph Engine.
 * Enforces strict confirmation boundaries:
 * - Only USER_CONFIRMED nodes are treated as factual personal context.
 * - AI may propose life events, but CANNOT silently persist or treat them as facts.
 */

import crypto from 'crypto';

export type LifeContextDomain =
  | 'CAREER'
  | 'EDUCATION'
  | 'RELATIONSHIP'
  | 'FAMILY'
  | 'LOCATION'
  | 'BUSINESS'
  | 'FINANCE'
  | 'SPIRITUALITY'
  | 'MAJOR_EVENT'
  | 'GOAL'
  | 'DECISION'
  | 'MILESTONE';

export type ConfirmationStatus = 'PENDING_USER_CONFIRMATION' | 'USER_CONFIRMED' | 'REJECTED';

export interface LifeContextNodeV2 {
  nodeId: string;
  userId: string;
  domain: LifeContextDomain;
  title: string;
  eventDate?: string;
  endDate?: string;
  description?: string;
  source: 'USER_DIRECT_INPUT' | 'AI_PROPOSED' | 'DOCUMENT_IMPORT';
  confidence: number; // 0.0 to 1.0
  confirmationStatus: ConfirmationStatus;
  createdAt: string;
  updatedAt: string;
}

export class LifeContextGraphV2 {
  private static nodes: Map<string, LifeContextNodeV2> = new Map();

  public static resetStore(): void {
    this.nodes.clear();
  }

  public static proposeEventByAI(params: {
    userId: string;
    domain: LifeContextDomain;
    title: string;
    eventDate?: string;
    description?: string;
  }): LifeContextNodeV2 {
    const nodeId = `lcn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    const node: LifeContextNodeV2 = {
      nodeId,
      userId: params.userId,
      domain: params.domain,
      title: params.title,
      eventDate: params.eventDate,
      description: params.description,
      source: 'AI_PROPOSED',
      confidence: 0.6,
      confirmationStatus: 'PENDING_USER_CONFIRMATION',
      createdAt: now,
      updatedAt: now,
    };

    this.nodes.set(nodeId, node);
    return node;
  }

  public static recordUserConfirmedEvent(params: {
    userId: string;
    domain: LifeContextDomain;
    title: string;
    eventDate?: string;
    endDate?: string;
    description?: string;
  }): LifeContextNodeV2 {
    const nodeId = `lcn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    const node: LifeContextNodeV2 = {
      nodeId,
      userId: params.userId,
      domain: params.domain,
      title: params.title,
      eventDate: params.eventDate,
      endDate: params.endDate,
      description: params.description,
      source: 'USER_DIRECT_INPUT',
      confidence: 1.0,
      confirmationStatus: 'USER_CONFIRMED',
      createdAt: now,
      updatedAt: now,
    };

    this.nodes.set(nodeId, node);
    return node;
  }

  public static confirmProposal(userId: string, nodeId: string): LifeContextNodeV2 {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`NODE_NOT_FOUND: ${nodeId}`);
    if (node.userId !== userId) throw new Error(`UNAUTHORIZED_ACCESS: Node does not belong to user ${userId}`);

    node.confirmationStatus = 'USER_CONFIRMED';
    node.confidence = 1.0;
    node.updatedAt = new Date().toISOString();
    return node;
  }

  public static rejectProposal(userId: string, nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`NODE_NOT_FOUND: ${nodeId}`);
    if (node.userId !== userId) throw new Error(`UNAUTHORIZED_ACCESS: Node does not belong to user ${userId}`);

    node.confirmationStatus = 'REJECTED';
    node.updatedAt = new Date().toISOString();
  }

  public static getFactualContext(userId: string): LifeContextNodeV2[] {
    // ONLY returns nodes with confirmationStatus = 'USER_CONFIRMED'
    return Array.from(this.nodes.values()).filter(
      (n) => n.userId === userId && n.confirmationStatus === 'USER_CONFIRMED'
    );
  }

  public static getAllUserNodes(userId: string): LifeContextNodeV2[] {
    return Array.from(this.nodes.values()).filter((n) => n.userId === userId);
  }

  public static deleteUserData(userId: string): number {
    let count = 0;
    for (const [id, node] of this.nodes.entries()) {
      if (node.userId === userId) {
        this.nodes.delete(id);
        count++;
      }
    }
    return count;
  }
}
