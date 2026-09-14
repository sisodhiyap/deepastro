import { PastLifeArchetype, PastLifeVisualTheme } from './PastLifeTypes.js';

export class PastLifeVisualPromptEngine {
  public static buildPrompt(
    archetype: PastLifeArchetype,
    theme: PastLifeVisualTheme,
    settingDesc: string,
    akPlanet: string
  ): string {
    return `Masterpiece digital painting, cinematic lighting. An ancient soul portrayed as a ${archetype.replace(/_/g, ' ').toLowerCase()} in ${settingDesc}. Atmospheric theme: ${theme}. Celestial symbolism honoring ${akPlanet}. Rich dark obsidian and midnight indigo background with luminous 24k gold filigree accents, sacred geometry mandala subtle in the starry sky. Warm amber lantern glow, deep cinematic volumetric fog, ultra-detailed architectural textures, 8k resolution, elegant spiritual dignity, no modern elements, hyper-detailed fine art.`;
  }
}
