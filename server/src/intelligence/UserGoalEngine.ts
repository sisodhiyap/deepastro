/**
 * DeepAstro 3.1 — User Goal & Goal Evolution Engine (UserGoalEngine)
 * Manages confirmed life goals across 7 domains with historical versioning.
 * Invariant: Goals evolve over time; historical versions are preserved immutably.
 */

import { UserGoalItem } from './IntelligenceTypes.js';

export class UserGoalEngine {
  private static userGoals: Map<string, UserGoalItem[]> = new Map();

  /**
   * Registers a new user-confirmed goal.
   */
  public static addGoal(params: {
    userId: string;
    domain: UserGoalItem['domain'];
    title: string;
    description: string;
    targetDate?: string;
    userConfirmed?: boolean;
  }): UserGoalItem {
    const { userId, domain, title, description, targetDate, userConfirmed = true } = params;
    const list = this.userGoals.get(userId) || [];

    const now = new Date().toISOString();
    const newGoal: UserGoalItem = {
      goalId: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      version: 1,
      domain,
      title,
      description,
      targetDate,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      userConfirmed,
      history: [
        {
          version: 1,
          title,
          description,
          status: 'ACTIVE',
          changedAt: now,
          reason: 'Initial goal established',
        },
      ],
    };

    list.push(newGoal);
    this.userGoals.set(userId, list);
    return newGoal;
  }

  /**
   * Evolves an existing goal without erasing historical versions.
   */
  public static evolveGoal(params: {
    userId: string;
    goalId: string;
    newTitle: string;
    newDescription: string;
    newStatus?: UserGoalItem['status'];
    reason?: string;
  }): UserGoalItem | null {
    const { userId, goalId, newTitle, newDescription, newStatus = 'EVOLVED', reason } = params;
    const list = this.userGoals.get(userId) || [];
    const target = list.find((g) => g.goalId === goalId);

    if (!target) return null;

    const now = new Date().toISOString();
    const nextVersion = target.version + 1;

    // Archive current state into history
    target.history.push({
      version: nextVersion,
      title: newTitle,
      description: newDescription,
      status: newStatus,
      changedAt: now,
      reason: reason || 'Goal evolved through user progression',
    });

    target.version = nextVersion;
    target.title = newTitle;
    target.description = newDescription;
    target.status = newStatus;
    target.updatedAt = now;

    return target;
  }

  /**
   * Retrieves active goals for a user, optionally filtered by domain.
   */
  public static getActiveGoals(userId: string, domain?: string): UserGoalItem[] {
    const list = this.userGoals.get(userId) || [];
    return list.filter((g) => {
      const active = g.status === 'ACTIVE' || g.status === 'EVOLVED';
      if (!domain) return active;
      return active && g.domain.toUpperCase() === domain.toUpperCase();
    });
  }

  /**
   * Retrieves full goal history for a user.
   */
  public static getAllGoals(userId: string): UserGoalItem[] {
    return this.userGoals.get(userId) || [];
  }
}
