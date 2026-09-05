/**
 * Standalone CLI Runner for DeepAstro Full System Verification
 * Executes all tests across 22 categories against live Supabase PostgreSQL and local engine.
 */

import dotenv from 'dotenv';
import { EnvLoader } from '../config/envLoader.js';
import { SystemVerificationEngine } from './verificationEngine.js';

dotenv.config();
EnvLoader.load();

async function main() {
  console.log('🌌 ====================================================================');
  console.log('   DEEPASTRO FULL SYSTEM VERIFICATION & EMPIRICAL AUDIT CENTER');
  console.log('   Target Supabase: aws-0-ap-south-1.pooler.supabase.com:6543');
  console.log('====================================================================\n');

  try {
    const report = await SystemVerificationEngine.executeRun();

    console.log('\n====================================================================');
    console.log('DEEPASTRO SYSTEM VERIFICATION RUN COMPLETE');
    console.log('====================================================================\n');

    console.log(`FUNCTIONAL COMPLETION: ${report.functionalCompletion}%`);
    console.log(`TEST COVERAGE:         ${report.testCoverage}%`);
    console.log(`PRODUCTION READINESS:  ${report.productionReadiness}\n`);

    console.log(`TOTAL TESTS: ${report.totalTests}`);
    console.log(`PASS:        ${report.counts.pass}`);
    console.log(`WARNING:     ${report.counts.warning}`);
    console.log(`FAIL:        ${report.counts.fail}`);
    console.log(`BLOCKED:     ${report.counts.blocked}`);
    console.log(`NOT TESTED:  ${report.counts.notTested}\n`);

    console.log('CATEGORY BREAKDOWN:');
    for (const cat of Object.values(report.categorySummaries)) {
      console.log(`  - ${cat.displayName.padEnd(46)}: ${String(cat.completionPercentage + '%').padEnd(7)} (${cat.passCount}/${cat.totalTests} pass)`);
    }

    if (report.readinessBlockers.length > 0) {
      console.log('\nCRITICAL FAILURES / BLOCKERS:');
      for (const b of report.readinessBlockers) {
        console.log(`  - 🔴 ${b}`);
      }
    } else {
      console.log('\nCRITICAL FAILURES: None (All Critical Gates Satisfied)');
    }

    const warnings = report.results.filter((r) => r.status === 'WARNING');
    if (warnings.length > 0) {
      console.log('\nWARNINGS:');
      for (const w of warnings) {
        console.log(`  - ⚠️  [${w.id}] ${w.feature}: ${w.warningNote || 'Warning reported'}`);
      }
    } else {
      console.log('\nWARNINGS: None');
    }

    if (report.regressions.length > 0) {
      console.log('\nREGRESSIONS:');
      for (const reg of report.regressions) {
        console.log(`  - 🔴 [${reg.testId}] ${reg.feature} flipped from ${reg.previousStatus} to ${reg.currentStatus}`);
      }
    } else {
      console.log('\nREGRESSIONS: None');
    }

    console.log('\nReports generated:');
    console.log('  - DEEPASTRO_FULL_SYSTEM_VERIFICATION.md');
    console.log('  - system-verification.json\n');
  } catch (err: any) {
    console.error('Fatal Verification Runner Error:', err);
    process.exit(1);
  }
}

main();
