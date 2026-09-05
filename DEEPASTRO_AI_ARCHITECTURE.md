# DEEPASTRO 2.0 — AI ARCHITECTURE & MULTI-MODEL ORCHESTRATION
**Product: DeepAstro — "Decode Your Life. Discover Your Cosmos."**
**Designed & Created by Prashant Sisodhiya | © 2026 DeepAstro. All Rights Reserved.**

---

## 1. Multi-Model Mesh Architecture

DeepAstro 2.0 implements an intelligent, cost-optimized AI routing mesh across proprietary cloud models and private on-device local engines:

```text
                           +------------------------+
                           |  ORCHESTRATION REQUEST  |
                           +-----------+------------+
                                       |
                   +-------------------v-------------------+
                   |     KNOWLEDGE BASE RAG RETRIEVAL      |
                   |  Parashara, Phaladeepika, Lal Kitab   |
                   +-------------------+-------------------+
                                       |
                   +-------------------v-------------------+
                   |   CANONICAL ASTROLOGY FACT CONTEXT    |
                   | (Ascendant, Moon, Dasha, Transits...) |
                   +-------------------+-------------------+
                                       |
                                ROUTING ENGINE
                                       |
         +-----------------+-----------+-----------+-----------------+
         |                 |                       |                 |
+--------v--------+ +------v---------+    +--------v--------+ +------v--------+
| OpenAI (GPT-4o) | | DeepSeek / OR  |    | Gemini / Grok   | | Local Ollama  |
| Primary Cloud   | | Deep Reasoning |    | Secondary Cloud | | $0 API Compute|
+--------+--------+ +------+---------+    +--------+--------+ +------+--------+
         |                 |                       |                 |
         +-----------------+-----------+-----------+-----------------+
                                       |
                   +-------------------v-------------------+
                   |           4-LAYER AI AUDITOR          |
                   |                                       |
                   |  1. Astronomy Consistency Gate        |
                   |  2. Temporal & Date Verification      |
                   |  3. Safety & Anti-Fatalism Gate       |
                   |  4. Citation & Evidence Verification  |
                   |  * Strip <think> Raw CoT Blocks       |
                   +-------------------+-------------------+
                                       |
                   +-------------------v-------------------+
                   |     STRUCTURED AUDITED RESPONSE       |
                   |  { summary, evidence, interpretation } |
                   +---------------------------------------+
```

---

## 2. 4-Layer AIAuditor 2.0

Every candidate interpretation produced by an LLM is intercepted and audited by `AIAuditor.audit()` before reaching the client:

1. **Layer 1 — Astronomy Consistency Auditor**:
   * Evaluates candidate text against deterministic Lagna, Moon sign, Sun sign, and active Mahadasha lord.
   * If an LLM states "Your Ascendant is Aries" when the native's calculated Lagna is Taurus, the audit flags an astronomical hallucination and sanitizes the claim.
2. **Layer 2 — Temporal Auditor**:
   * Cross-references calendar years, transit time windows, and dasha durations to prevent temporal confusion.
3. **Layer 3 — Safety & Ethics Auditor**:
   * Enforces zero-tolerance against fatalistic declarations, medical diagnoses, guaranteed financial returns, and death predictions.
   * Intercepts adversarial prompt injection attempts (`ignore previous instructions`, `reveal api key`).
4. **Layer 4 — Citation & Evidence Auditor**:
   * Verifies that interpretations cite explicit planetary facts (e.g., `Jupiter aspecting 10th house from Moon`).
   * Automatically attaches authentic scriptural citations from the RAG store.

---

## 3. Privacy & Raw CoT Elimination

* **Zero Chain-of-Thought Storage**: DeepSeek-R1 and similar reasoning models emit `<think>...</think>` tokens during test-time computation.
* DeepAstro 2.0 strips all `<think>` tags via regular expression sanitizers before saving to the database or delivering to the browser.
* Stores only clean, verified evidence points (`factsCited`, `citations`, and `confidence`).

---

## 4. Cost Telemetry & Local Compute Distinction

* Distinguishes cloud token costs from local compute execution:
  * **Cloud API Cost**: Dollar-based billing tracking prompt and completion tokens.
  * **Local Compute ($0 API Cost)**: Executed on-device via Ollama, utilizing local CPU/GPU resources with zero external network transmission.
