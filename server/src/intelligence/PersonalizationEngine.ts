/**
 * DeepAstro Personalization Engine (Intelligence Gateway)
 * Re-exports the production-hardened PersonalizationEngine with zero-tolerance prohibited inferences.
 */

export {
  PersonalizationEngine,
} from '../learning/PersonalizationEngine.js';

export type {
  CommunicationPreferences,
  PersonalizedContext,
} from '../learning/PersonalizationEngine.js';

