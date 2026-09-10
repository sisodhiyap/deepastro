/**
 * DeepAstro User Memory & Privacy Test Suite
 * Validates:
 * 1. Explicit memory creation, editing, and deletion ("My Cosmic Memory").
 * 2. Strict tenant isolation: User A cannot read, edit, or delete User B's memories.
 * 3. Memory disable toggle: Disabling personalization suppresses memories from prediction queries.
 * 4. "Forget All Memories" complete erasure.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UserMemoryService } from '../server/src/learning/UserMemoryService.js';
import { PersonalizationProfileService } from '../server/src/learning/PersonalizationProfile.js';
import { db } from '../server/src/database/db.js';

describe('DeepAstro User Memory & Privacy Isolation Suite', () => {
  const userA = 'user_alex_101';
  const userB = 'user_bianca_202';

  beforeEach(() => {
    // Reset database memory tables
    db.userMemories.clear();
    db.personalizationProfiles.clear();
  });

  it('allows user to add explicit memories and stores them with verified provenance', () => {
    const memory = UserMemoryService.addMemory(userA, {
      category: 'goals',
      content: 'Transition into deep tech AI architecture by Q3 2026',
      source: 'USER_EXPLICIT',
      userConfirmed: true,
      memoryType: 'GOAL',
    });

    expect(memory.id).toBeDefined();
    expect(memory.userId).toBe(userA);
    expect(memory.content).toBe('Transition into deep tech AI architecture by Q3 2026');
    expect(memory.confidence).toBe('VERIFIED');
    expect(memory.userConfirmed).toBe(true);

    const list = UserMemoryService.getMemories(userA);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(memory.id);
  });

  it('strictly isolates memories between User A and User B (Zero Cross-Tenant Leakage)', () => {
    // User A adds confidential career goal
    UserMemoryService.addMemory(userA, {
      category: 'goals',
      content: 'CONFIDENTIAL: Planning equity buyout of partner in London',
      source: 'USER_EXPLICIT',
    });

    // User B adds family interest
    UserMemoryService.addMemory(userB, {
      category: 'interests',
      content: 'Vedic meditation and Sanskrit chanting',
      source: 'USER_EXPLICIT',
    });

    // Query User A
    const memoriesA = UserMemoryService.getMemories(userA);
    expect(memoriesA).toHaveLength(1);
    expect(memoriesA[0].content).toContain('equity buyout');
    expect(memoriesA.some(m => m.userId === userB)).toBe(false);

    // Query User B
    const memoriesB = UserMemoryService.getMemories(userB);
    expect(memoriesB).toHaveLength(1);
    expect(memoriesB[0].content).toContain('Vedic meditation');
    expect(memoriesB.some(m => m.userId === userA)).toBe(false);

    // Assert User B cannot edit User A's memory
    expect(() => {
      UserMemoryService.editMemory(userB, memoriesA[0].id, { content: 'Hacked by User B' });
    }).toThrow(/not found or access denied/i);

    // Assert User B cannot delete User A's memory
    const deleteAttempt = UserMemoryService.forgetMemory(userB, memoriesA[0].id);
    expect(deleteAttempt).toBe(false);

    // User A's memory remains uncorrupted
    const verifyA = UserMemoryService.getMemories(userA);
    expect(verifyA[0].content).toContain('equity buyout');
  });

  it('respects memory correction and editing', () => {
    const memory = UserMemoryService.addMemory(userA, {
      category: 'preferences',
      content: 'Prefers reading in Hindi',
      source: 'USER_SURVEY',
    });

    const updated = UserMemoryService.editMemory(userA, memory.id, {
      content: 'Prefers reading in English with Sanskrit terminology',
      userConfirmed: true,
    });

    expect(updated.content).toBe('Prefers reading in English with Sanskrit terminology');
    expect(updated.userConfirmed).toBe(true);
    expect(updated.confidence).toBe('VERIFIED');
  });

  it('supports "Forget All Memories" for complete data erasure', () => {
    UserMemoryService.addMemory(userA, { category: 'goals', content: 'Goal 1', source: 'USER_EXPLICIT' });
    UserMemoryService.addMemory(userA, { category: 'goals', content: 'Goal 2', source: 'USER_EXPLICIT' });
    UserMemoryService.addMemory(userB, { category: 'goals', content: 'User B Goal', source: 'USER_EXPLICIT' });

    const deletedCount = UserMemoryService.forgetAllMemories(userA);
    expect(deletedCount).toBe(2);

    expect(UserMemoryService.getMemories(userA)).toHaveLength(0);
    // User B's memory is untouched
    expect(UserMemoryService.getMemories(userB)).toHaveLength(1);
  });

  it('suppresses memory retrieval when personalization is disabled by user', () => {
    UserMemoryService.addMemory(userA, {
      category: 'interests',
      content: 'High-frequency trading astrology',
      source: 'USER_EXPLICIT',
    });

    // Disable personalization in profile
    PersonalizationProfileService.setToggles(userA, { personalizationEnabled: false });

    // Active prediction context retrieval must return empty
    const contextMemories = UserMemoryService.getMemories(userA);
    expect(contextMemories).toHaveLength(0);

    // Explicit management retrieval can still show data to the user
    const managementMemories = UserMemoryService.getMemories(userA, { includeWhenDisabled: true });
    expect(managementMemories).toHaveLength(1);
  });
});
