# DeepAstro Database Architecture Specification (Checkpoint 9)

## 1. Architectural Philosophy
DeepAstro enforces strict separation between:
1. **Deterministic Astronomical Calculations**: Completely stateless, mathematical, and uncoupled from persistence.
2. **Relational Metadata & Audit Trails**: Managed via PostgreSQL, typed repositories, and parameterized queries.
3. **Binary Artifacts**: HTML, PDF, and chiromancy imagery stored in an abstracted `ArtifactStorage` layer, never exposing raw filesystem paths.

```
Routes
  ↓
Services (ReportGenerationService, PipelineStageRunner)
  ↓
Repositories (ReportRepository, UserRepository, CalculationRepository, BirthProfileRepository)
  ↓
PostgreSQL Database
```

---

## 2. Table Catalog & Relational Schemas

The database schema (`server/src/database/migrations/001_checkpoint9_schema.sql`) implements all 25 mandated tables:

1. **`users`**: User identity, roles (CLIENT, ASTROLOGER, ADMIN, SUPER_ADMIN), authentication tokens.
2. **`birth_profiles`**: User natal birth details (latitude, longitude, date, time, timezone, ayanamsha, house system).
3. **`kundli_calculations`**: Deterministic calculation caching keyed by SHA-256 astronomical fingerprint (independent of native's name).
4. **`kundli_planets`**: Normalized planetary positions, signs, degrees, speed, combustion, and dignity.
5. **`kundli_houses`**: 12 Bhava cusps, signs, degrees, and bhava lords.
6. **`kundli_vargas`**: Divisional charts (D1 Rashi, D9 Navamsa, D10 Dashamsha, D2 to D60).
7. **`kundli_yogas`**: Evaluated Yogas (Gajakesari, Budhaditya, Raja, Dhana, Viparita, etc.).
8. **`kundli_doshas`**: Evaluated Doshas (Manglik / Kuja, Sade Sati, Kaal Sarp, Pitra, etc.).
9. **`dasha_periods`**: Vimshottari Mahadasha, Antardasha, and Pratyantardasha periods.
10. **`transits`**: Gochara transit calculations against natal Moon and Lagna.
11. **`numerology_reports`**: Life path, destiny, soul urge, personality, and birth numbers.
12. **`palmistry_reports`**: Samudrika Shastra multi-stage analysis with feature confidence.
13. **`reports`**: Master report records, status, integrity status, score, calculation fingerprint, and versioning.
14. **`report_versions`**: Immutable historical version snapshots with model and prompt versions.
15. **`report_pipeline_runs`**: Orchestrated job runs, duration, and completion status.
16. **`report_pipeline_stages`**: 23 individual persisted stages (PENDING, RUNNING, COMPLETED, WARNING, FAILED, BLOCKED).
17. **`report_claims`**: Claim-level audited statements with rule/calculation provenance.
18. **`report_sources`**: Trusted classical source citations (BPHS, Phaladeepika, Brihat Jataka, etc.).
19. **`ai_runs`**: Execution log of all AI provider calls (OpenAI, Gemini, Groq, Ollama).
20. **`ai_consensus_results`**: Multi-model consensus and recorded disagreements.
21. **`verification_results`**: Independent secondary astronomical verification logs.
22. **`pdf_artifacts`**: Binary PDF records, SHA-256 hashes, byte sizes, and page counts.
23. **`knowledge_sources`**: Authoritative Vedic texts for KnowledgeRAG.
24. **`knowledge_chunks`**: Text chunks with pgvector embeddings and domain tags.
25. **`audit_logs`**: System security and administrative action audit trails.

---

## 3. Migration Safety & Version Tracking
- Schema migrations are managed by `MigrationRunner` through the `schema_migrations` table.
- Applied migrations are recorded with their timestamp.
- Legacy file-backed reports in `./data/reports/` are migrated non-destructively into PostgreSQL via `ReportStoreMigrationService`.

---

## 4. Astronomical Fingerprint & Caching Invariant
- Calculation fingerprint is computed via SHA-256 over:
  `birthDate | birthTime | latitude | longitude | timezone | ayanamsa | houseSystem | ephemerisVersion | engineVersion`
- **Native's name is strictly excluded** from the fingerprint calculation.
- Two different people born at the exact same coordinates and time receive the identical astronomical calculation from cache, while preserving distinct user report records.
