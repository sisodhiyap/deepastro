# DEEPASTRO CONSTITUTION — IMMUTABLE ENGINEERING POLICY
**Version**: `FORTRESS-1.0`  
**Classification**: `PERMANENT_ENGINEERING_LAW`  
**Scope**: All DeepAstro Core Services, Calculation Engines, AI Routing, Database Systems, & Edge Handlers.  

---

## The 20 Immutable Rules of DeepAstro

### Rule 001: Astronomical Calculation Truth Invariance
Astronomical calculation truth (ephemerides, planetary longitudes, house cusps, ascendant, divisional charts) cannot be overridden, altered, or superseded by AI model interpretations. Mathematical reality is supreme.

### Rule 002: Calculation Core Immutability
AI models, machine learning agents, dynamic scripts, and external tools cannot modify the calculation core or its constants. `CalculationCoreProtection.CALCULATION_CORE_MUTABLE` remains permanently `false`.

### Rule 003: Zero Synthetic Data Fabrication
Missing astrological or birth data must never become fabricated data. If an exact birth time, coordinate, or astrological property is missing, the system must clearly indicate unavailability or request rectification rather than generating hallucinated synthetic inputs.

### Rule 004: Explicit Outcome Confirmation
User silence, passive scrolling, or casual conversational remarks ("interesting", "nice", "maybe", "that sounds cool") is never an outcome confirmation. Only structured, deliberate user verification can confirm a prediction outcome.

### Rule 005: Absolute Multi-Tenant Isolation
Private user data (birth records, life events, saved interpretations, private memories, custom questions) must never enter another user's context, prompt window, or public cache.

### Rule 006: Explicit Consent for Sensitive Future Insights
Sensitive future interpretation (deep life challenges, major karmic transitions, longevity themes) strictly requires explicit, recorded user consent.

### Rule 007: Absolute Prohibition of Exact Death Prediction
Exact date, time, or period prediction of death is strictly prohibited across all APIs, engines, AI models, and PDF reports.

### Rule 008: Absolute Prohibition of Cause-of-Death Prediction
Exact cause-of-death prediction or fatalistic morbid forecasting is strictly prohibited.

### Rule 009: Prohibition of Medical Diagnosis
Medical diagnosis, clinical prescribing, or advising discontinuation of professional treatment is strictly prohibited. Astrological interpretations may only discuss classical Ayurvedic dosha themes and general vitality.

### Rule 010: Prohibition of Guaranteed Financial Returns
Guaranteed financial gains, specific stock tips, speculative certainty, or promises of wealth are strictly prohibited. Astrological market analysis is probabilistic macro analysis only.

### Rule 011: Probabilistic and Traditional Context
Predictions must remain probabilistic and grounded in classical traditional Jyotish frameworks, never presented as inescapable deterministic destiny.

### Rule 012: Traceable Evidence Requirement
Every major forecast, life analysis, or future insight must have traceable evidence linking back to specific astrological rules, houses, planetary transits, or dashas.

### Rule 013: Transparent Contradiction Preservation
Contradictory planetary evidence (e.g., conflicting dasha vs. transit signals) must not be silently discarded or harmonized away. It must be explicitly recognized and weighed.

### Rule 014: Authentic Failure over Synthetic Fallback
Unavailable data or disconnected calculation providers must not be replaced with silent synthetic mock data. The system must degrade gracefully with explicit telemetry alerts.

### Rule 015: Zero Demo Profiles in Production
Demo profiles, mock birth charts, or hardcoded personas must never reach production execution paths or pollute authentic user calculations.

### Rule 016: Server-Authoritative Identity Enforcement
Client-supplied identity parameters (`userId`, `profileId`, `roles`, `entitlements`) must never override server-authoritative authenticated session identity. Cross-user IDOR attempts must fail immediately.

### Rule 017: Learning Firewall Preservation
Self-learning, outcome feedback, and calibration systems may optimize scoring weights, explanations, and ranking, but can NEVER mutate astronomical mathematics or core Jyotish rules.

### Rule 018: Private Outcome Consent
Private prediction outcomes and personal validation records require explicit user consent before participating in anonymized collective calibration.

### Rule 019: Provider Independence
No external model provider (OpenAI, Google Gemini, xAI Grok, Anthropic, or Ollama) is the source of DeepAstro's calculation truth. Providers are interchangeable reasoning-language layers.

### Rule 020: Fail Closed on Security Breach
Any security anomaly, privilege escalation attempt, unauthorized access, or calculation core tampering must fail closed immediately with audit logging.
