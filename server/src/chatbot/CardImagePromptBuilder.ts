/**
 * CardImagePromptBuilder
 * Constructs contextual, art-direction grade image prompts tailored specifically
 * to the question, domain, answer theme, and cosmic mood.
 * Never requests critical text/numbers inside the image.
 */

export interface ImagePromptSpec {
  prompt: string;
  negativePrompt: string;
  aspectRatio: '4:5' | '1:1' | '16:9';
  styleTheme: 'COSMIC_STORY' | 'EDITORIAL' | 'TELEMETRY' | 'FINANCIAL' | 'KP_TECHNICAL' | 'WEATHER' | 'SCIENCE' | 'RELATIONSHIP' | 'CAREER' | 'NEWS';
  visualConcept: string;
}

export class CardImagePromptBuilder {
  public static buildPrompt(question: string, domain: string, answerTheme: string): ImagePromptSpec {
    const q = question.toLowerCase();
    let styleTheme: ImagePromptSpec['styleTheme'] = 'COSMIC_STORY';
    let visualConcept = 'Deep space cosmic illumination';
    let prompt = '';

    const negativePrompt =
      'text, words, typography, letters, watermarks, signatures, labels, bad anatomy, blurry, low resolution, disfigured, deformed, noisy, grainy';

    if (domain === 'CAREER' || q.includes('promotion') || q.includes('job')) {
      styleTheme = 'CAREER';
      visualConcept = 'Ascending glowing celestial stairway towards an illuminated radiant portal';
      prompt =
        'A sharp cinematic composition of a lone ambitious professional in an elegant dark suit ascending luminous neon celestial stairs towards an radiant astronomical solar portal. Background of deep sapphire cosmic nebula with subtle golden constellations, planetary rings of Saturn, cinematic lighting, ultra-realistic digital art, 8k resolution, elegant, inspiring, Unreal Engine 5 render style.';
    } else if (domain === 'WEATHER' || q.includes('weather') || q.includes('rain')) {
      styleTheme = 'WEATHER';
      visualConcept = 'Atmospheric meteorological clouds and dynamic sunlight interaction';
      prompt =
        'A breathtaking cinematic view of atmospheric meteorological phenomenon, cumulus clouds meeting golden volumetric sun rays over modern horizon, subtle rain curtain in the distance, crystal-clear atmospheric telemetry, majestic natural sky dynamics, photo-realistic national geographic style, hyper-detailed, 8k resolution.';
    } else if (domain === 'MARKET' || domain === 'FINANCE' || q.includes('nifty') || q.includes('stock')) {
      styleTheme = 'FINANCIAL';
      visualConcept = 'Futuristic financial market telemetry interwoven with celestial orbit lines';
      prompt =
        'A sleek futuristic financial control city beneath glowing planetary orbits. Holographic candle charts and vector trendlines floating subtly in obsidian space with deep violet, cyan, and metallic gold luminescence. Cinematic depth of field, sophisticated hedge-fund terminal aesthetic, ultra-clean, 8k.';
    } else if (domain === 'KP_PRASHNA' || domain === 'KP') {
      styleTheme = 'KP_TECHNICAL';
      visualConcept = 'Astronomical horary division clock with radiant stellar nodes';
      prompt =
        'Intricate sacred geometry of astronomical horary divisions, glowing golden starlight nodes and 249 sub-division lines mapping across a midnight obsidian celestial sphere, glowing cyan zodiac markers, elegant scientific astrology aesthetic, crisp macro rendering, hyper-detailed.';
    } else if (domain === 'RELATIONSHIP' || q.includes('marriage') || q.includes('love')) {
      styleTheme = 'RELATIONSHIP';
      visualConcept = 'Harmonious constellation bridge linking two luminous soul archetypes';
      prompt =
        'Two radiant celestial silhouette figures standing on opposite sides of a luminous starlight bridge across a vibrant magenta and deep indigo nebula. Gentle constellation particles, planetary alignment of Venus and Jupiter glowing in background, romantic, ethereal, highly refined digital art, 8k.';
    } else if (domain === 'SCIENCE' || q.includes('quantum') || q.includes('eclipse')) {
      styleTheme = 'SCIENCE';
      visualConcept = 'Astrophysical phenomenon visualization with gravitational lensing';
      prompt =
        'Accurate cinematic visualization of astrophysical spacetime curvature and solar light refraction, brilliant corona glow, scientific clarity, deep black space with pinpoint starfields, James Webb telescope aesthetic, stunning educational science illustration.';
    } else {
      styleTheme = 'COSMIC_STORY';
      visualConcept = 'Vibrant cosmic observatory overlooking celestial planetary alignment';
      prompt =
        'An awe-inspiring mystical cosmic observatory overlooking ancient planetary alignments. A solitary contemplative seeker gazing at glowing spiral galaxies and shimmering nebula dust, deep purple, gold and turquoise chromatic palette, cinematic mood, 8k wallpaper quality.';
    }

    return {
      prompt,
      negativePrompt,
      aspectRatio: '4:5',
      styleTheme,
      visualConcept
    };
  }

  public static build(params: {
    question: string;
    domain: string;
    answerTheme?: string;
    emotionalTone?: string;
    visualConcept?: string;
  }): ImagePromptSpec & { subject: string } {
    const spec = this.buildPrompt(params.question, params.domain, params.answerTheme || '');
    return {
      ...spec,
      subject: params.visualConcept || spec.visualConcept
    };
  }
}
