# DEEPASTRO PHASE 5 — PREDICTION CALIBRATION AUDIT

**Audit Reference**: PCE-V5-2026-09  
**Component**: `server/src/learning/PredictionCalibrationEngine.ts`  
**Test Suite**: `tests/phase5PersonalIntelligence.test.ts` (Category 2: Tests 2.1–2.10)  
**Status**: 100% AUDIT PASS  

---

## 1. System Calibration Philosophy

DeepAstro enforces strict honesty and intellectual rigor:
> [!CAUTION]
> Historical calibration metrics describe **SYSTEM CONSISTENCY AND CALIBRATION**.  
> They must **NEVER** be displayed to the user as empirical scientific proof of astrology (e.g. *"Astrology is 87% accurate"*).  
> All presentations must display: **"DeepAstro historical calibration"** and prominently disclose the sample size, evaluated count, and limitations.

---

## 2. Calibration Mathematical Formulation

`PredictionCalibrationEngine.computeMetricsV2(entries)` computes:

### 1. Directional Consistency
$$\text{Directional Consistency} = \frac{N_{\text{HAPPENED}} + N_{\text{PARTIALLY\_HAPPENED}}}{N_{\text{EVALUATED}}}$$
Measures whether the thematic direction of the planetary indication harmonized with lived reality.

### 2. Timing Window Consistency
$$\text{Timing Consistency} = \frac{N_{\text{HAPPENED}} - N_{\text{TIMING\_WRONG}}}{N_{\text{EVALUATED}}}$$
Strictly penalizes predictions where the thematic event occurred outside the defined astrological timing window.

### 3. Mean Specificity Score
$$\overline{\text{Specificity}} = \frac{1}{N} \sum_{i=1}^{N} \text{SpecificityScore}_i$$
Enforces penalized weighting on vague Barnum/Forer statements while rewarding precise domain, time window, direction, and calculation anchors.

### 4. Brier Calibration Score
$$\text{Brier Score} = \frac{1}{N_{\text{EVALUATED}}} \sum_{i=1}^{N_{\text{EVALUATED}}} (P_i - O_i)^2$$
Where $P_i \in \{0.90, 0.75, 0.55, 0.35\}$ is the numeric probability proxy of the confidence class (`VERIFIED`, `HIGH`, `MODERATE`, `LOW`), and $O_i \in \{1.0, 0.6, 0.0\}$ is the observed binary outcome.  
Lower scores indicate superior probabilistic calibration ($0.0$ being perfect calibration).

### 5. False Positive & False Negative Rates
- **False Positive**: High confidence ($P_i \ge 0.7$) prediction where outcome was `DID_NOT_HAPPEN`.
- **False Negative**: Low confidence ($P_i \le 0.4$) prediction where outcome was `HAPPENED`.

---

## 3. Mandatory Public Disclosures

Whenever calibration metrics are retrieved via `GET /api/predictions/calibration`:
- **Label**: `"DeepAstro historical calibration"`
- **Limitations Notice**:
  `"Sample size: N (Evaluated: M). Internal calibration metrics describe system consistency and evidence alignment, not empirical scientific proof."`
- **Zero Fabrication**: When sample size is 0 or low, DeepAstro displays uninflated baseline metrics with explicit sample size disclosures.
