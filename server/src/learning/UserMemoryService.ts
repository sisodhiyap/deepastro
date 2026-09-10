/**
 * User Memory Service ("My Cosmic Memory")
 * Manages explicit, user-confirmed memory entries with rigorous provenance tracking.
 * 
 * Absolute Invariants:
 * 1. Zero fabrication: Never hallucinate or synthesize memories not originating from the user.
 * 2. Zero inference of unconfirmed life events: Real-world events are only stored as facts if user-confirmed.
 * 3. Strict tenant isolation: Users can only query, modify, or delete their own memories.
 * 4. User sovereignty: Full visibility, editing, granular forgetting, export, and disable toggles.
 */

import { db, UserMemoryRecord } from '../database/db.js';
import { PersonalizationProfileService } from './PersonalizationProfile.js';

export type MemoryCategory =
  | 'profile'
  | 'preferences'
  | 'goals'
  | 'interests'
  | 'previous_questions'
  | 'previous_readings'
  | 'confirmed_life_events'
  | 'rejected_interpretations'
  | 'feedback'
  | 'communication_preferences';

export type MemorySource =
  | 'USER_EXPLICIT'
  | 'USER_SURVEY'
  | 'CHAT_INTERACTION'
  | 'FEEDBACK_FORM';

export type MemoryConfidence = 'VERIFIED' | 'HIGH' | 'MODERATE' | 'LOW';

export type MemoryType = 'FACT' | 'PREFERENCE' | 'HISTORICAL' | 'GOAL';

export interface AddMemoryInput {
  category: MemoryCategory;
  content: string;
  source: MemorySource;
  confidence?: MemoryConfidence;
  userConfirmed?: boolean;
  memoryType?: MemoryType;
  provenance?: Record<string, any>;
}

export class UserMemoryService {
  /**
   * Retrieves all memories for a specific user, strictly respecting user isolation.
   * If personalization is disabled in profile, returns empty list for prediction context unless explicitly requested for management.
   */
  public static getMemories(userId: string, options?: { includeWhenDisabled?: boolean }): UserMemoryRecord[] {
    const profile = PersonalizationProfileService.getProfile(userId);
    if (!profile.personalizationEnabled && !options?.includeWhenDisabled) {
      return [];
    }

    const all = Array.from(db.userMemories.values());
    return all.filter(m => m.userId === userId);
  }

  /**
   * Retrieves memories by category
   */
  public static getMemoriesByCategory(userId: string, category: MemoryCategory): UserMemoryRecord[] {
    const memories = this.getMemories(userId);
    return memories.filter(m => m.category === category);
  }

  /**
   * Adds a new explicit user memory
   */
  public static addMemory(userId: string, input: AddMemoryInput): UserMemoryRecord {
    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Memory content cannot be empty');
    }

    // Invariant: Real-life events require explicit confirmation to be marked VERIFIED fact
    const isLifeEvent = input.category === 'confirmed_life_events';
    const userConfirmed = input.userConfirmed ?? (input.source === 'USER_EXPLICIT');
    const confidence = input.confidence || (isLifeEvent && !userConfirmed ? 'LOW' : (userConfirmed ? 'VERIFIED' : 'HIGH'));

    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const record: UserMemoryRecord = {
      id,
      userId,
      category: input.category,
      content: input.content.trim(),
      source: input.source,
      confidence,
      userConfirmed,
      memoryType: input.memoryType || 'DYNAMIC' as any,
      provenance: input.provenance || { sourceMethod: 'UserMemoryService.addMemory', addedAt: now },
      createdAt: now,
      updatedAt: now,
    };

    db.userMemories.set(id, record);
    return record;
  }

  /**
   * Updates an existing memory belonging to the user
   */
  public static editMemory(
    userId: string,
    memoryId: string,
    updates: { content?: string; userConfirmed?: boolean; confidence?: MemoryConfidence }
  ): UserMemoryRecord {
    const memory = db.userMemories.get(memoryId);
    if (!memory || memory.userId !== userId) {
      throw new Error('Memory not found or access denied');
    }

    if (updates.content !== undefined) {
      if (updates.content.trim().length === 0) {
        throw new Error('Memory content cannot be empty');
      }
      memory.content = updates.content.trim();
    }

    if (updates.userConfirmed !== undefined) {
      memory.userConfirmed = updates.userConfirmed;
      if (memory.userConfirmed) {
        memory.confidence = 'VERIFIED';
      }
    }

    if (updates.confidence !== undefined) {
      memory.confidence = updates.confidence;
    }

    memory.updatedAt = new Date().toISOString();
    db.userMemories.set(memoryId, memory);
    return memory;
  }

  /**
   * Forgets (deletes) a specific memory entry
   */
  public static forgetMemory(userId: string, memoryId: string): boolean {
    const memory = db.userMemories.get(memoryId);
    if (!memory || memory.userId !== userId) {
      return false;
    }

    db.userMemories.delete(memoryId);
    return true;
  }

  /**
   * Forgets all memories for a user ("Forget All My Memories")
   */
  public static forgetAllMemories(userId: string): number {
    let count = 0;
    for (const [id, record] of db.userMemories.entries()) {
      if (record.userId === userId) {
        db.userMemories.delete(id);
        count++;
      }
    }
    return count;
  }

  /**
   * Exports all memories for user data ownership compliance
   */
  public static exportMemories(userId: string): { total: number; memories: UserMemoryRecord[] } {
    const memories = this.getMemories(userId, { includeWhenDisabled: true });
    return {
      total: memories.length,
      memories,
    };
  }
}
