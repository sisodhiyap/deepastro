/**
 * Knowledge Taxonomy & Separation
 * Enforces strict epistemological segregation between canonical classical scriptures,
 * mathematical calculation specifications, interpretive rules, and empirical user outcomes.
 * 
 * Strict Invariant:
 * USER_OUTCOME_EVIDENCE must NEVER be conflated with or cited as CLASSICAL_TEXT or JYOTISH_RULE.
 */

export type KnowledgeCategory =
  | 'CLASSICAL_TEXT'
  | 'JYOTISH_RULE'
  | 'CALCULATION_DOCUMENTATION'
  | 'PANCHANG_RULE'
  | 'INTERPRETATION'
  | 'USER_OUTCOME_EVIDENCE'
  | 'SYSTEM_ERROR'
  | 'ENGINE_VERSION';

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  sourceAuthority: string;
  tradition?: 'PARASHARI' | 'JAIMINI' | 'KP' | 'TAJIKA' | 'MODERN_EMPIRICAL';
  isCanonicalDoctrine: boolean;
  version: string;
  createdAt: string;
}

export class KnowledgeTaxonomyEngine {
  /**
   * Asserts that user outcome evidence is never cited as classical doctrine
   */
  public static validateCitation(item: KnowledgeItem): void {
    if (item.category === 'USER_OUTCOME_EVIDENCE' && item.isCanonicalDoctrine) {
      throw new Error(
        'Epistemological Violation: User outcome evidence cannot be marked as canonical classical doctrine.'
      );
    }
  }

  /**
   * Filters knowledge chunks by requested category
   */
  public static filterKnowledge(items: KnowledgeItem[], allowedCategories: KnowledgeCategory[]): KnowledgeItem[] {
    return items.filter(item => allowedCategories.includes(item.category));
  }
}
