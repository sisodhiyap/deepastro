# DeepAstro Comprehensive Multi-Tier Testing Strategy

## 1. Test Architecture
DeepAstro operates a multi-layer verification matrix ensuring zero mathematical regression, zero UI overflow, and high resilience:

```
┌────────────────────────────────────────────────────────┐
│             Layer 5: Production Smoke Tests            │
│   Live /api, /api/health, live Kundli API execution    │
├────────────────────────────────────────────────────────┤
│           Layer 4: Browser & Responsive Audits         │
│   Playwright E2E, 9-viewport responsive overflow tests │
├────────────────────────────────────────────────────────┤
│         Layer 3: Cross-Layer Parity & Property         │
│   5-profile geographical matrix, 1000-cycle invariants │
├────────────────────────────────────────────────────────┤
│        Layer 2: Service & Subsystem Integration        │
│   Auth, DB Persistence, RAG, AI evidence, PDF engine  │
├────────────────────────────────────────────────────────┤
│               Layer 1: Unit & Mathematics              │
│   Meeus True Node, Lahiri Ayanamsha, KP Cusps, Dasha   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Test Execution Commands
```bash
# Run full Vitest suite (138+ test files, 1400+ tests)
npm test

# Run specific mathematical and regression suites
npx vitest run tests/crossLayerParityAndMultiProfile.test.ts
npx vitest run tests/databasePersistenceAndResilience.test.ts
npx vitest run tests/trueNodeAndNavamsaRepair.test.ts
npx vitest run tests/deeptiCalibrationRegression.test.ts

# Run responsive overflow audit across viewports
npx vitest run tests/globalResponsiveOverflowAudit.test.ts
```

---

## 3. Strict Acceptance Criteria
- **Zero Failures:** 100% test pass rate required prior to production release.
- **No Test Weakening:** Mathematical thresholds must not be softened to bypass failing calculations.
- **Authenticity Gate:** Features without genuine test assets (e.g. Kundli OCR upload) must report `UPLOAD E2E NOT EXECUTED - REASON: NO REAL KUNDLI TEST ASSET` rather than fabricating simulated test passes.
