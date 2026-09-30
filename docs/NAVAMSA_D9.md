# Navamsa (D9) Divisional Architecture & House Contract

## 1. Navamsa Calculation Definition
Navamsa (D9) represents the 9th harmonic division of the sidereal zodiac ($30^\circ / 9 = 3^\circ 20'$ per Navamsa Pada). It is the primary chart for dharma, inner soul disposition, marriage partnership, and life trajectory beyond age 30.

### Classical Navamsa Formula:
For any celestial point with sidereal longitude $\lambda$:
1. Determine Rashi Index ($0 \dots 11$):
   $$\text{rashi} = \lfloor \lambda / 30^\circ \rfloor$$
2. Determine Pada Index within Rashi ($0 \dots 8$):
   $$\text{pada} = \lfloor (\lambda \pmod{30^\circ}) / (3^\circ 20') \rfloor$$
3. Starting Sign based on element:
   - **Fire signs (Aries, Leo, Sagittarius):** Starts in Aries ($0$).
   - **Earth signs (Taurus, Virgo, Capricorn):** Starts in Capricorn ($9$).
   - **Air signs (Gemini, Libra, Aquarius):** Starts in Libra ($6$).
   - **Water signs (Cancer, Scorpio, Pisces):** Starts in Cancer ($3$).
4. Navamsa Sign:
   $$\text{navamsaSign} = (\text{startSign} + \text{pada}) \pmod{12}$$

---

## 2. D9 House Allocation Contract (Critical Rule)
The house placement of any planet in D9 **must strictly reference the D9 Ascendant**, NEVER the D1 Ascendant:
$$\text{houseInVarga} = ((\text{planetNavamsaSign} - \text{d9AscendantSign} + 12) \pmod{12}) + 1$$

- **House 1:** Contains the D9 Ascendant sign.
- **House 7:** Contains $(\text{d9AscendantSign} + 6) \pmod{12}$, representing the marital axis.

---

## 3. UI Presentation Contract
- **Side-by-Side (Desktop):** D1 Rashi (left) and D9 Navamsa (right) rendered in high-contrast cosmic card frames.
- **Stacked (Mobile):** D1 followed by D9.
- **Header Badges:**
  - `D1 Rashi Lagna: [Sign] [DD°MM']`
  - `D9 Navamsa Lagna: [Sign] [DD°MM']`
- **Supported Styles:** North Indian, South Indian, East Indian.
- **D9 Deep Insights:** Identifies Vargottama planets (identical sign in D1 and D9), Pushkara Navamsa placements, and 7th house occupants.
