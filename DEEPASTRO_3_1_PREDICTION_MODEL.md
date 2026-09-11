# DEEPASTRO 3.1 — PREDICTION & CALIBRATION SPECIFICATION

## 1. Prediction De-duplication (`PredictionMemoryEngine`)
To prevent repetitive forecast spam, DeepAstro 3.1 tracks all formulated predictions:
- Identifies overlaps in domain, time window, primary planetary drivers, and user goal associations.
- When an inquiry matches an existing active prediction, the engine references the existing record or refines the contextual nuances rather than generating an identical duplicate.

## 2. Uncertainty Composition (`UncertaintyCompositionEngine`)
Rather than displaying synthetic percentages (e.g. 97.43%), DeepAstro synthesizes uncertainty from six grounded dimensions:
1. **Birth-Time Sensitivity**: Assesses rising sign / lagna stability under a ±4 minute perturbation.
2. **Cusp & Boundary Proximity**: Alerts if planets or Ascendant degrees sit within 2° of a rashi boundary.
3. **Contradiction Tension**: Quantifies divergence between classical authorities (e.g. Parashari strength vs KP sub-lord delay).
4. **Context Sufficiency**: Evaluates whether verified life context is available.
5. **Historical Calibration Sample Size**: Flags uncertainty if confirmed outcome history is below statistical significance ($N < 5$).
6. **External World Data Freshness**: Checks recency of external relocation and market research data.

### Composite Rating:
Categorized strictly into discrete bands: `LOW`, `MODERATE`, or `HIGH`, accompanied by an itemized list of contributing reasons.
