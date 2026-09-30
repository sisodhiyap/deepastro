# True Osculating Lunar Node Specification (Meeus True Node)

## 1. Frozen Calculation Contract
The True Lunar Node (`TRUE_NODE`) calculation in DeepAstro is a frozen astronomical contract implemented in `PlanetEngine.ts`.

- **Convention:** Meeus Chapter 47 (ELP-2000 periodic perturbation series).
- **Osculating Ascending Node (Rahu):**
  $$\Omega_{\text{mean}} = 125.0445479 - 1934.1362891 \cdot T + 0.0020754 \cdot T^2 + \dots$$
  $$\Omega_{\text{true}} = \Omega_{\text{mean}} + \sum \Delta \Omega_{\text{periodic}}$$
  Where periodic terms account for solar elongation ($D$), solar anomaly ($M$), lunar anomaly ($M'$), and lunar argument of latitude ($F$).

- **Descending Node (Ketu):**
  $$\text{Ketu} \equiv (\text{Rahu} + 180^\circ) \pmod{360^\circ}$$
  *Under no circumstances is Ketu independently calculated.*

## 2. Invariance Guarantees
1. **Mathematical Invariant:**
   $$\|(\text{Rahu} + 180^\circ) - \text{Ketu}\| < 10^{-6\circ}$$
2. **Velocity & Direct Motion:**
   Node velocity is computed via numerical differentiation:
   $$\text{speed} = \frac{\Omega_{\text{true}}(t + \Delta t) - \Omega_{\text{true}}(t - \Delta t)}{2 \Delta t}$$
   Because the osculating node experiences solar perturbations, its velocity can occasionally become positive (direct motion / *vakra*). Direct motion is dynamically derived and never hardcoded to retrograde.
3. **Passport Declaration:**
   Every chart payload includes:
   ```json
   "nodeModel": "TRUE_NODE",
   "nodeCalculationVersion": "MEEUS_TRUE_NODE_V1"
   ```
   Charts missing this passport are flagged as legacy in the UI with a 1-click recalculation action.
