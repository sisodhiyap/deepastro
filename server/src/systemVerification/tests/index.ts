/**
 * DeepAstro Central System Verification Test Matrix Registry
 */
import { SystemTestCase } from '../types.js';
import { authTests } from './authTests.js';
import { workspaceTests } from './workspaceTests.js';
import { birthTests } from './birthTests.js';
import { astrologyTests } from './astrologyTests.js';
import { verificationTests } from './verificationTests.js';
import { jyotishRuleTests } from './jyotishRuleTests.js';
import { panchangTests } from './panchangTests.js';
import { numerologyTests } from './numerologyTests.js';
import { reportTests } from './reportTests.js';
import { pdfTests } from './pdfTests.js';
import { aiTests } from './aiTests.js';
import { ragTests } from './ragTests.js';
import { factCheckTests } from './factCheckTests.js';
import { safetyTests } from './safetyTests.js';
import { palmistryTests } from './palmistryTests.js';
import { databaseTests } from './databaseTests.js';
import { securityTests } from './securityTests.js';
import { frontendTests } from './frontendTests.js';
import { errorTests } from './errorTests.js';
import { perfTests } from './perfTests.js';

export const ALL_SYSTEM_TESTS: SystemTestCase[] = [
  ...authTests,
  ...workspaceTests,
  ...birthTests,
  ...astrologyTests,
  ...verificationTests,
  ...jyotishRuleTests,
  ...panchangTests,
  ...numerologyTests,
  ...reportTests,
  ...pdfTests,
  ...aiTests,
  ...ragTests,
  ...factCheckTests,
  ...safetyTests,
  ...palmistryTests,
  ...databaseTests,
  ...securityTests,
  ...frontendTests,
  ...errorTests,
  ...perfTests,
];
