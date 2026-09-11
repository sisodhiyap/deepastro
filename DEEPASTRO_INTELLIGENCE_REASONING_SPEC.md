# DEEPASTRO INTELLIGENCE UPGRADE 3.0: REASONING SPECIFICATION

## 1. Intent Classification Architecture
The system parses incoming prompts into 28 discrete intent classifications:
`CAREER`, `JOB`, `BUSINESS`, `MONEY`, `RELATIONSHIP`, `MARRIAGE`, `FAMILY`, `EDUCATION`, `HEALTH`, `SPIRITUALITY`, `RELOCATION`, `TRAVEL`, `TIMING`, `DECISION`, `PERSONALITY`, `LIFE_PATTERN`, `PAST_EVENT`, `FUTURE_PERIOD`, `COMPATIBILITY`, `DAILY_GUIDANCE`, `MUHURTA`, `PANCHANGA`, `NUMEROLOGY`, `PALMISTRY`, `GENERAL_ASTROLOGY`, `REPORT`, `RESEARCH`, `OTHER`.

Each classified inquiry is enriched with:
- **Time Horizon**: `IMMEDIATE_TODAY`, `THIS_WEEK`, `NEXT_3_MONTHS`, `NEXT_6_MONTHS`, `NEXT_YEAR`, `MULTI_YEAR`, `PAST_PERIOD`
- **Urgency**: `LOW`, `MODERATE`, `HIGH`
- **Emotional Tone**: `ANXIOUS`, `NEUTRAL`, `CONFIDENT`, `CURIOUS`
- **Depth Requirement**: `BEGINNER`, `STANDARD`, `EXPERT`

## 2. Multi-System Evidence Fusion Engine
The engine fuses observations across multiple deterministic frameworks:
- **Parashari**: House lords, Bhavas, Yogas, Shadbala, Vimsottari Dasha.
- **Jaimini**: Chara Karakas (Atmakaraka, Amatyakaraka), Chara Dasha, Arudha Padas.
- **KP System**: Sub-lords, cusp significators, stellar occupancy.
- **Transits (Gochara)**: Ashtakavarga bindus, Sade Sati, Jupiter/Saturn double transits.
- **Numerology & Palmistry**: Core numbers and verified palm mount indicators when provided.

### Convergence Classifications
- `STRONG_CONVERGENCE`: 3 or more systems independently align in direction and timing.
- `MODERATE_CONVERGENCE`: 2 systems align with neutral indicators elsewhere.
- `MIXED`: Equal supportive and obstructive indications across systems.
- `CONTRADICTORY`: Direct diametric opposition between major systems.
- `INSUFFICIENT`: Insufficient calculated factors to draw an inference.

## 3. Contradiction Isolation (Zero False Consensus)
When classical systems diverge (e.g. Parashari indicates 10th-house career surge while KP indicates delay through 6th/8th sub-lord), the system **never averages them into an ambiguous forecast**.
Instead, it produces an explicit contradiction block:
1. **What Agrees**: Shared recognition of career focus.
2. **What Disagrees**: Discrepancy between timing speed vs friction/delay.
3. **Reason for Divergence**: Differing technical lenses (Bhava lord dignity vs stellar sub-lord connections).
4. **Resolution Criterion**: Conditions or transits that will dissolve the impasse.

## 4. Counterfactual Decision Simulation
For decision inquiries ("Should I take Job A or Job B?"), the engine:
1. Parses explicit options, priority weights, and constraints.
2. Evaluates each option independently against the native's D1/D10 chart, current Dasha, and transits.
3. Quantifies astrological resonance, supportive time windows, and inherent risks for each path.
4. **Preserves Native Agency**: The output explicitly refuses to mandate choices ("Astrology does not make decisions for you; here are the comparative alignments...").
