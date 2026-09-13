# DeepAstro Universal Intelligence Chatbot Architecture

## 1. System Overview
The DeepAstro Universal Intelligence Chatbot is a unified, multi-system conversational intelligence engine designed to process diverse user queries across astrology, finance, real-time market data, meteorological weather, news, KP Prashna, relationship dynamics, science, and general inquiry.

## 2. Architectural Pipeline
```text
User Question
      ↓
Intent Understanding (UniversalQuestionRouter)
      ↓
Domain Classification & Routing
      ↓
Tool Invocation (DeepAstroToolRegistry)
      ↓
Deterministic Astrology / Real Data Feeds (Weather/Market/News)
      ↓
Evidence Graph & Fact Checking
      ↓
AI Synthesis & Direct Answer Generation
      ↓
Card Specification Generation (DeepAstroAnswerCardSpec)
      ↓
Contextual Image Generation (CardImagePromptBuilder + ImageGenerationProvider)
      ↓
Exact Answer Card Composition (HTML/SVG/Canvas)
      ↓
Export / Download (PNG, WebP, PDF)
```

## 3. Core Modules
- **UniversalQuestionRouter**: Classifies inquiries into domains (CAREER, FINANCE, MARKET, WEATHER, KP_PRASHNA, RELATIONSHIP, SCIENCE, etc.) and infers required external or astrological context.
- **DeepAstroToolRegistry**: Unified gateway invoking existing production microservices (`VedicAstroEngine`, `KPPrashnaEngine`, `MarketDataService`, `globalWeatherProvider`, `NewsProvider`).
- **UniversalChatService**: Orchestrates the 17-step synthesis, provenance attribution, evidence graph generation, and card production.
- **DeepAstroAnswerCard**: Frontend visual interface conforming strictly to the dark cosmic aesthetic (`#0a101f`, cyan/violet/gold glow accents, glass panels, 4:5 ratio).
