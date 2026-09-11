/**
 * DeepAstro Sovereign Memory Reasoning Engine
 * Enforces consent boundaries: memories are strictly partitioned per user,
 * and AI-proposed facts remain unconfirmed until explicit user assent.
 */

import { UserMemoryItem } from './IntelligenceTypes.js';

export class MemoryReasoningEngine {
  private static memories: Map<string, UserMemoryItem[]> = new Map();

  public static addMemory(item: Omit<UserMemoryItem, 'memoryId' | 'createdAt'>): UserMemoryItem {
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const fullItem: UserMemoryItem = {
      ...item,
      memoryId,
      createdAt: new Date().toISOString(),
    };

    const list = this.memories.get(item.userId) || [];
    list.push(fullItem);
    this.memories.set(item.userId, list);
    return fullItem;
  }

  public static proposeMemory(userId: string, content: string, type: UserMemoryItem['type']): UserMemoryItem {
    return this.addMemory({
      userId,
      type,
      content,
      source: 'AI_PROPOSED',
      confirmed: false, // Invariant: AI suggestions are unconfirmed
      confidence: 0.7,
    });
  }

  public static confirmMemory(userId: string, memoryId: string): boolean {
    const list = this.memories.get(userId);
    if (!list) return false;

    const target = list.find((m) => m.memoryId === memoryId);
    if (target) {
      target.confirmed = true;
      target.confidence = 1.0;
      return true;
    }
    return false;
  }

  public static getConfirmedMemories(userId: string): UserMemoryItem[] {
    const list = this.memories.get(userId) || [];
    return list.filter((m) => m.confirmed);
  }

  public static getAllMemories(userId: string): UserMemoryItem[] {
    return this.memories.get(userId) || [];
  }

  public static deleteMemory(userId: string, memoryId: string): boolean {
    const list = this.memories.get(userId);
    if (!list) return false;

    const initialLen = list.length;
    const filtered = list.filter((m) => m.memoryId !== memoryId);
    this.memories.set(userId, filtered);
    return filtered.length < initialLen;
  }

  public static purgeUserMemories(userId: string): void {
    this.memories.delete(userId);
  }
}
