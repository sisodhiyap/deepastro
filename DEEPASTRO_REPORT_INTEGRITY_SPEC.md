# DeepAstro Report Integrity Engine Specification (Checkpoint 9)

## 1. Overview
The **DeepAstro Report Integrity Engine** (`ReportIntegrityEngine`) enforces a strict multi-layer quality gate for astrological dossiers.
Under no circumstances may a report be delivered or marked `VERIFIED` if any critical gate failure occurs.

DeepAstro earns user trust through evidence-based rigor:
- **Calculation Verified**: Deterministic planetary degrees, houses, and dashas computed from mathematical algorithms.
- **Rule Verified**: Classical Jyotish rules (Parashara, Phaladeepika, Jaimini) evaluated formally without AI hallucinations.
- **Source Referenced**: Provenance citations with genuine text references (BPHS, Jataka Parijata, etc.).
- **AI Cross-Checked**: Multi-model consensus where deterministic calculation always overrules generative output.
- **Safety Audited**: Zero medical diagnosis, no wealth guarantees, no fear-mongering or fatalistic predictions.
- **PDF Verified**: Real `%PDF-` binary with round-trip text extraction verifying chart metrics verbatim.

---

## 2. Nine-Part Integrity Gate Structure

Every report generation run evaluates the following 9 mandatory checks:

| Check ID | Gate Component | Severity | Description |
|---|---|---|---|
| `CHK_CALC_01` | Deterministic Astronomical Calculation | CRITICAL | Verifies all 9 Navagrahas, Ascendant, and 12 Bhavas are non-null and valid. |
| `CHK_ASTRONOMY_02` | Astronomical Verification Engine | CRITICAL | Verifies secondary mathematical cross-checks within tolerances. |
| `CHK_RULES_03` | Formal Jyotish Rule Engine | HIGH | Verifies classical rules (Gajakesari, Manglik, Sade Sati, Vargottama, Dignity). |
| `CHK_CLAIMS_04` | Claim-Level Fact Checking | CRITICAL | All claims evaluated into VERIFIED, SUPPORTED, or BLOCKED. |
| `CHK_SAFETY_05` | Ethics and Safety Audit | CRITICAL | Prohibits medical advice, fatalistic threats, and investment guarantees. |
| `CHK_PDF_GEN_06` | Binary PDF Artifact Generation | CRITICAL | Validates file existence, non-zero size, and `%PDF-` signature. |
| `CHK_PDF_ROUNDTRIP_07`| PDF Text Extraction Round-Trip | CRITICAL | Verifies native name, Lagna, Moon sign, and dashas exist in extracted PDF text. |
| `CHK_PDF_QA_08` | PDF Visual QA & Layout Inspection | HIGH | Validates page count, table structure, glyph rendering, and non-blank pages. |
| `CHK_OWNERSHIP_09` | User Authorization & Ownership | CRITICAL | Enforces multi-tenant isolation; reports are user-scoped. |

---

## 3. Integrity Status Classifications
- `VERIFIED`: All 9 checks passed with zero critical failures and zero blocked claims. Download permitted.
- `VERIFIED_WITH_WARNINGS`: Minor non-critical warnings (e.g. secondary tolerance margin, partial scriptural citation). Download permitted with advisories.
- `REVIEW_REQUIRED`: Disagreements between AI models or low confidence in non-essential interpretive sections. Requires astrologer review.
- `BLOCKED`: Astronomical conflict, prohibited fatalistic predictions, blocked claims, corrupt PDF, or ownership violation. **Report download strictly prohibited.**

---

## 4. DeepAstro Report Integrity Score (0–100)
- The numerical score is strictly designated **DeepAstro Report Integrity**.
- It is **NEVER** referred to as "accuracy score", "scientific accuracy", or "astrological accuracy".
- Base score is calculated additively from verified stages and subtracted by warnings and claim rejections.
