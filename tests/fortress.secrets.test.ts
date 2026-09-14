import { describe, it, expect } from 'vitest';
import { DeepAstroIntelligenceGateway } from '../server/src/intelligence/gateway/DeepAstroIntelligenceGateway.js';
import fs from 'fs';
import path from 'path';

describe('DEEPASTRO FORTRESS â€” Secret Protection & Sanitization', () => {
  it('Sanitizes database credentials, API keys, and internal filesystem paths', () => {
    const dirtyPayload = {
      userSummary: 'Your reading is complete.',
      internalDetails: 'Connected to postgres://admin:SuperSecretPass@db.deepastro.internal:5432/astro',
      openaiKey: 'sk-abcdef1234567890123456789012',
      localPath: 'C:\\Users\\developer\\Desktop\\secrets\\key.env',
      password: 'hiddenPassword123',
    };

    const sanitized = DeepAstroIntelligenceGateway.sanitizeResponse<any>(dirtyPayload);

    expect(sanitized.userSummary).toBe('Your reading is complete.');
    expect(sanitized.internalDetails).toContain('[REDACTED_DATABASE_URI]');
    expect(sanitized.openaiKey).toContain('[REDACTED_API_KEY]');
    expect(sanitized.password).toBeUndefined(); // Forbidden key deleted
  });

  it('Verifies dist build directory contains zero exposed .map sourcemap files', () => {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath, { recursive: true }) as string[];
      const mapFiles = files.filter((f) => String(f).endsWith('.map'));
      expect(mapFiles.length).toBe(0);
    }
  });
});
