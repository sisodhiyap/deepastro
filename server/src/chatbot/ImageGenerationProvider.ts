/**
 * Image Generation Provider
 * Generates unique images via OpenAI DALL-E 3 or supported provider.
 * Includes graceful fallback to high-quality domain-curated Unsplash/Cosmic visual artifacts
 * so that chatbot answers NEVER fail or freeze even without active OpenAI image credits.
 */

import { ImagePromptSpec } from './CardImagePromptBuilder.js';

export interface GeneratedVisual {
  imageUrl: string;
  provider: 'OPENAI_DALLE3' | 'CURATED_HIGH_RES_FALLBACK';
  promptUsed: string;
  generatedAt: string;
}

const FALLBACK_DOMAINS: Record<string, string> = {
  CAREER: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
  WEATHER: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1200&auto=format&fit=crop',
  FINANCIAL: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop',
  KP_TECHNICAL: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop',
  RELATIONSHIP: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop',
  SCIENCE: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
  COSMIC_STORY: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop'
};

export class ImageGenerationProvider {
  public static async generateImage(spec: ImagePromptSpec): Promise<GeneratedVisual> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + apiKey
          },
          body: JSON.stringify({
            model: process.env.IMAGE_MODEL || 'dall-e-3',
            prompt: spec.prompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard'
          }),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (res.ok) {
          const data = (await res.json()) as any;
          const url = data.data?.[0]?.url;
          if (url) {
            return {
              imageUrl: url,
              provider: 'OPENAI_DALLE3',
              promptUsed: spec.prompt,
              generatedAt: new Date().toISOString()
            };
          }
        }
      } catch (err) {
        // Fall through to domain fallback
      }
    }

    const fallback = FALLBACK_DOMAINS[spec.styleTheme] || FALLBACK_DOMAINS.COSMIC_STORY;
    return {
      imageUrl: fallback,
      provider: 'CURATED_HIGH_RES_FALLBACK',
      promptUsed: spec.prompt,
      generatedAt: new Date().toISOString()
    };
  }

  public static async generateVisual(spec: ImagePromptSpec): Promise<string> {
    const res = await this.generateImage(spec);
    return res.imageUrl;
  }
}
