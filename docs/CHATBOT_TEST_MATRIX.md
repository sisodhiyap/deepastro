# Chatbot & Real Telemetry Test Matrix

## 1. Test Summary
- **Total Test Files**: 56
- **Total Test Cases**: 930
- **Pass Rate**: 100% (3 consecutive clean test cycles)

## 2. Dedicated Suites
- `tests/universalChatbotAnswerCard.test.ts`: Validates question routing, image prompt differentiation, Answer Card schema conformance, real Open-Meteo weather ingestion, real market telemetry, and deterministic KP Prashna 1-249 generation.
- `tests/deepastro6TruthAudit.test.ts`: Validates truth preservation, market quotes, currency tags, and calculation immutability.
- `tests/deepastro6TruthHardening.test.ts`: Verifies absence of fake simulated statuses and enforces strict secret scanning and client distribution safety.
