# Vimshottari Dasha Hierarchy Specification

## 1. Mathematical Model (120-Year Universal Cycle)
The Vimshottari system maps the 120-year human planetary cycle derived from the natal Moon's Janma Nakshatra.

### Planetary Rulers & Durations:
| Sequence | Planet | Duration (Years) | Nakshatras Ruled |
| :---: | :--- | :---: | :--- |
| 1 | **Ketu** | 7 | Ashwini, Magha, Mula |
| 2 | **Venus** | 20 | Bharani, Purva Phalguni, Purva Ashadha |
| 3 | **Sun** | 6 | Krittika, Uttara Phalguni, Uttara Ashadha |
| 4 | **Moon** | 10 | Rohini, Hasta, Shravana |
| 5 | **Mars** | 7 | Mrigashira, Chitra, Dhanishta |
| 6 | **Rahu** | 18 | Ardra, Swati, Shatabhisha |
| 7 | **Jupiter** | 16 | Punarvasu, Vishakha, Purva Bhadrapada |
| 8 | **Saturn** | 19 | Pushya, Anuradha, Uttara Bhadrapada |
| 9 | **Mercury** | 17 | Ashlesha, Jyeshtha, Revati |

---

## 2. 3-Level Sub-Period Hierarchy
1. **Level 1 (Mahadasha):** Derived from the natal Moon's position within the Janma Nakshatra ($13^\circ 20'$ span). The remaining balance is allocated proportionally:
   $$\text{balanceYears} = \left(1.0 - \frac{\text{degreesInNakshatra}}{13^\circ 20'}\right) \cdot \text{rulerYears}$$
2. **Level 2 (Antardasha):**
   $$\text{durationYears} = \frac{\text{mahadashaDuration} \cdot \text{antardashaRulerYears}}{120}$$
3. **Level 3 (Pratyantardasha):**
   $$\text{durationDays} = \frac{\text{antardashaDurationDays} \cdot \text{pratyantardashaRulerYears}}{120}$$

---

## 3. Boundary & Continuity Guarantees
- **Strict Continuity:** The $N$-th sub-period end timestamp is mathematically clamped to the parent period end timestamp ($t_{\text{end}, 9} \equiv t_{\text{end}, \text{parent}}$), eliminating floating-point gaps or overlaps.
- **Zero Invalids:** All timestamps are strictly verified ISO strings with $t_{\text{start}} < t_{\text{end}}$.
- **Timezone Consistency:** Displayed in the local birth timezone as indicated in user settings.
