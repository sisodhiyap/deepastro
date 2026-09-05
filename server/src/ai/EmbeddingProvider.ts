/**
 * EmbeddingProvider
 * Embeddings abstraction for pgvector semantic search.
 * Includes provider and version metadata.
 * Honestly reports if embedding generation is unavailable, triggering deterministic fallback.
 */

export interface EmbeddingResult {
  vector: number[];
  model: string;
  version: string;
  dimension: number;
  provider: string;
}

export interface IEmbeddingProvider {
  isAvailable(): Promise<boolean>;
  generateEmbedding(text: string): Promise<EmbeddingResult | null>;
}

export class EmbeddingProvider implements IEmbeddingProvider {
  private openaiApiKey?: string;
  private geminiApiKey?: string;
  private ollamaHost: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.ollamaHost = (process.env.OLLAMA_HOST || 'http://127.0.0.1:11434').replace(/\/+$/, '');
  }

  public async isAvailable(): Promise<boolean> {
    if (this.openaiApiKey && this.openaiApiKey.startsWith('sk-')) return true;
    if (this.geminiApiKey && this.geminiApiKey.length > 10) return true;
    try {
      const res = await fetch(`${this.ollamaHost}/api/tags`, {
        signal: AbortSignal.timeout(1500),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async generateEmbedding(text: string): Promise<EmbeddingResult | null> {
    if (!text || text.trim().length === 0) return null;

    // 1. OpenAI text-embedding-3-small (1536 dim)
    if (this.openaiApiKey && this.openaiApiKey.startsWith('sk-')) {
      try {
        const res = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: text.slice(0, 4000),
          }),
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const json = (await res.json()) as any;
          const vector = json.data?.[0]?.embedding;
          if (vector && Array.isArray(vector)) {
            return {
              vector,
              model: 'text-embedding-3-small',
              version: 'v3.1',
              dimension: vector.length,
              provider: 'OpenAI',
            };
          }
        }
      } catch (err) {
        // Continue to next provider
      }
    }

    // 2. Ollama local embeddings
    try {
      const res = await fetch(`${this.ollamaHost}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'nomic-embed-text',
          prompt: text.slice(0, 2000),
        }),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const json = (await res.json()) as any;
        if (json.embedding && Array.isArray(json.embedding)) {
          return {
            vector: json.embedding,
            model: 'nomic-embed-text',
            version: 'v1.5',
            dimension: json.embedding.length,
            provider: 'Ollama',
          };
        }
      }
    } catch {
      // Ollama not responding or embedding model not pulled
    }

    // Explicitly return null if no embedding engine is reachable
    return null;
  }
}

export const embeddingProvider = new EmbeddingProvider();
