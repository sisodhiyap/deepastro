import 'dotenv/config';
import { runDatabaseCertification } from './certifySupabase.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const connectionString = process.env.DATABASE_URL || process.argv[2] || process.env.SUPABASE_DATABASE_URL;

  if (!connectionString) {
    console.error('ERROR: No DATABASE_URL provided. Cannot run live certification without live connection string.');
    process.exit(1);
  }

  const sanitized = connectionString.replace(/:[^:@]+@/, ':****@');
  console.log('Using target database URI:', sanitized);

  console.log('Starting DeepAstro 12-Phase Live Supabase Certification...\n');
  const { allPassed, reportMarkdown } = await runDatabaseCertification(connectionString);

  const reportPath = path.resolve(process.cwd(), 'DEEPASTRO_DATABASE_CERTIFICATION.md');
  fs.writeFileSync(reportPath, reportMarkdown, 'utf8');
  console.log(`\nCertification complete! Report written to: ${reportPath}`);
  console.log(`Final Outcome: ${allPassed ? 'CERTIFIED & READY' : 'FAILED / INCOMPLETE'}`);

  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal error during certification execution:', err);
  process.exit(1);
});
