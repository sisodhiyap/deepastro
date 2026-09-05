/**
 * DeepAstro Key & Environment Loader
 * Automatically reads key.env and .env, mapping labeled keys ((open ai), (gemini), (deepseek), etc.)
 * into process.env and maintaining connection status.
 */

import fs from 'fs';
import path from 'path';

export interface KeyStatusReport {
  provider: string;
  isConfigured: boolean;
  status: 'CONFIGURED' | 'NOT_CONFIGURED';
  source: string;
}

export class EnvLoader {
  private static loaded = false;

  public static load(): void {
    if (this.loaded) return;

    // 1. Try local key.env, then Desktop key.env
    const possibleKeyPaths = [
      path.resolve(process.cwd(), 'key.env'),
      path.resolve(process.cwd(), '../key.env'),
      'C:\\Users\\sisod\\Desktop\\key.env',
    ];

    let foundKeyPath: string | null = null;
    for (const p of possibleKeyPaths) {
      if (fs.existsSync(p)) {
        foundKeyPath = p;
        break;
      }
    }

    if (foundKeyPath) {
      console.log(`[EnvLoader] Found key.env at: ${foundKeyPath}`);
      try {
        const rawContent = fs.readFileSync(foundKeyPath, 'utf8');
        this.parseAndInjectKeyEnv(rawContent);
      } catch (err: any) {
        console.warn(`[EnvLoader] Failed reading ${foundKeyPath}:`, err.message);
      }
    }

    // Default Ollama local endpoint if not specified
    if (!process.env.OLLAMA_HOST) {
      process.env.OLLAMA_HOST = 'http://127.0.0.1:11434';
    }
    if (!process.env.OLLAMA_MODEL) {
      process.env.OLLAMA_MODEL = 'deepseek-r1:7b';
    }

    this.loaded = true;
  }

  private static parseAndInjectKeyEnv(content: string): void {
    const lines = content.split('\n');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      // Check standard KEY=VALUE
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0 && !line.startsWith('(')) {
        const k = line.substring(0, eqIdx).trim();
        const v = line.substring(eqIdx + 1).trim();
        if (k && v && !process.env[k]) {
          process.env[k] = v;
        }
        continue;
      }

      // Check custom labeled formats: (label) value
      if (line.startsWith('(')) {
        const closeParen = line.indexOf(')');
        if (closeParen > 0) {
          const label = line.substring(1, closeParen).toLowerCase().trim();
          let value = line.substring(closeParen + 1).trim();

          // If line has "key is: xyz" or "project: xyz" or "xyz"
          if (value.toLowerCase().includes('key is:')) {
            value = value.split(/key is:/i)[1].trim();
          } else if (value.includes(':') && !value.startsWith('http')) {
            const parts = value.split(':');
            const candidate = parts.slice(1).join(':').trim();
            if (candidate.length > 5) {
              value = candidate;
            }
          }

          if (value.length > 5) {
            this.mapLabelToEnv(label, value);
          }
        }
      }
    }
  }

  private static mapLabelToEnv(label: string, value: string): void {
    if (label.includes('open ai') || label === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        process.env.OPENAI_API_KEY = value;
      }
    } else if (label.includes('deepseek')) {
      if (!process.env.DEEPSEEK_API_KEY) {
        process.env.DEEPSEEK_API_KEY = value;
      }
    } else if (label.includes('groq')) {
      if (!process.env.GROK_API_KEY) {
        process.env.GROK_API_KEY = value;
      }
    } else if (label.includes('open router') || label.includes('openrouter')) {
      if (!process.env.OPENROUTER_API_KEY) {
        process.env.OPENROUTER_API_KEY = value;
      }
    } else if (label.includes('gemini') || label.includes('google api')) {
      if (!process.env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = value;
      }
    } else if (label.includes('github')) {
      if (!process.env.GITHUB_TOKEN) {
        process.env.GITHUB_TOKEN = value;
      }
    } else if (label.includes('figma')) {
      if (!process.env.FIGMA_TOKEN) {
        process.env.FIGMA_TOKEN = value;
      }
    } else if (label.includes('vercel')) {
      if (!process.env.VERCEL_TOKEN) {
        process.env.VERCEL_TOKEN = value;
      }
    }
  }

  public static getKeyStatuses(): KeyStatusReport[] {
    return [
      {
        provider: 'OpenAI',
        isConfigured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')),
        status: process.env.OPENAI_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
        source: 'server_env',
      },
      {
        provider: 'DeepSeek',
        isConfigured: Boolean(process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.startsWith('sk-')),
        status: process.env.DEEPSEEK_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
        source: 'server_env',
      },
      {
        provider: 'OpenRouter',
        isConfigured: Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.startsWith('sk-or-')),
        status: process.env.OPENROUTER_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
        source: 'server_env',
      },
      {
        provider: 'Google Gemini',
        isConfigured: Boolean(process.env.GEMINI_API_KEY),
        status: process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
        source: 'server_env',
      },
      {
        provider: 'Groq',
        isConfigured: Boolean(process.env.GROK_API_KEY && process.env.GROK_API_KEY.startsWith('gsk_')),
        status: process.env.GROK_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
        source: 'server_env',
      },
      {
        provider: 'Ollama (Local)',
        isConfigured: Boolean(process.env.OLLAMA_HOST || true),
        status: 'CONFIGURED',
        source: 'local_service',
      },
    ];
  }
}
