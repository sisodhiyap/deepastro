# Contextual Image Generation Architecture

## 1. Separation Principle
The image generator NEVER generates critical factual numbers, dates, KP planetary calculations, or text paragraphs. The visual art provides atmospheric context, mood, visual story, and symbolic framing; the DeepAstro application renders all text, metrics, and data overlays deterministically on top.

## 2. CardImagePromptBuilder
Constructs structured prompts based on:
- Question text & semantic intent
- Domain (CAREER, WEATHER, FINANCIAL, KP_TECHNICAL, RELATIONSHIP, SCIENCE, COSMIC_STORY)
- Answer theme & emotional tone
- Style parameters and negative prompts (banning bad anatomy, blurry artifacts, and visible text).

## 3. ImageGenerationProvider
Supports:
- **Primary**: OpenAI DALL-E 3 official generation endpoint.
- **Fallback**: Curated high-resolution thematic astronomical & domain visual artifacts ensuring zero failure or user disruption during network or quota events.
