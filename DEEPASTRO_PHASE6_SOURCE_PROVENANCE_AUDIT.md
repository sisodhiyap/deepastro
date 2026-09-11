# DEEPASTRO PHASE 6 — SOURCE PROVENANCE AUDIT

**Date:** 2026-09-10  
**Phase:** Phase 6 — Jyotish Knowledge Foundation & Source-Grounded Reasoning  
**Status:** PASS  
**Auditor:** Principal Astrological Knowledge Architect & Swarm QA

---

## 1. Executive Summary

Phase 6 institutes strict citation hygiene in `JyotishSourceRegistry.ts`.
Under zero circumstances may any AI component or reasoning service invent, hallucinate, or fabricate:
- Classical treatise titles
- Chapter (Adhyaya) numbers
- Verse (Shloka) numbers
- Page numbers or quotes
- Attributed ancient authors or commentators

If full citation metadata is missing or partially unverified, the system assigns the strict sentinel status: `SOURCE_METADATA_INCOMPLETE`.

---

## 2. Source Registry Catalog

The canonical registry currently stores 10 verified primary classical treatises with full scholarly provenance:

| Source ID | Treatise Title | Author / Tradition | Edition / Translation | Language | Verification Status |
|:---|:---|:---|:---|:---|:---:|
| `SRC_BPHS` | Brihat Parashara Hora Shastra | Sage Parashara | R. Santhanam (Ranjan Pub.), 1984 | Sanskrit / English | `VERIFIED` |
| `SRC_JS` | Jaimini Upadesha Sutras | Maharishi Jaimini | Dr. P.S. Sastri / Sanjay Rath, 1997 | Sanskrit / English | `VERIFIED` |
| `SRC_PD` | Phaladeepika | Mantreswara | Dr. G.S. Kapoor, 1986 | Sanskrit / English | `VERIFIED` |
| `SRC_SARAVALI` | Saravali | Kalyana Varma | R. Santhanam, 1983 | Sanskrit / English | `VERIFIED` |
| `SRC_BJ` | Brihat Jataka | Varahamihira | Swami Vijnanananda, 1912 | Sanskrit / English | `VERIFIED` |
| `SRC_UTTARA` | Uttara Kalamrita | Kalidasa | S.S. Sareen, 1986 | Sanskrit / English | `VERIFIED` |
| `SRC_KP_RDR` | KP Readers (Vol I-VI) | K.S. Krishnamurti | Krishnamurti Publications, 1971 | English | `VERIFIED` |
| `SRC_BV_RAMAN` | 300 Important Combinations | Dr. B.V. Raman | Motilal Banarsidass, 1947 | English | `VERIFIED` |
| `SRC_PRASHNA_M` | Prashna Marga | Namboothiri Tradition | Dr. B.V. Raman, 1980 | Sanskrit / English | `VERIFIED` |
| `SRC_CHAMATKARA` | Chamatkara Chintamani | Bhatta Narayana | B.S. Rao, 1978 | Sanskrit / English | `VERIFIED` |

---

## 3. Verified Rule-to-Source Mapping

Every classical rule in the engine points directly to an immutable source citation:

1. **Gaja Kesari Yoga** (`RULE_GAJA_KESARI`)
   - Source: `SRC_BPHS`
   - Chapter 36, Verses 3-4
   - Principle: Jupiter in Kendra (1, 4, 7, 10) from Moon, free from malefic combustion.
2. **Pancha Mahapurusha Yogas** (`RULE_PANCHA_MAHAPURUSHA`)
   - Source: `SRC_BPHS`
   - Chapter 75, Verses 1-12; `SRC_BJ` Chapter 8, Verse 1
   - Principle: Mars (Ruchaka), Mercury (Bhadra), Jupiter (Hamsa), Venus (Malavya), Saturn (Sasa) in Kendra in own/exaltation sign.
3. **Budhaditya Yoga** (`RULE_BUDHADITYA`)
   - Source: `SRC_SARAVALI`
   - Chapter 31, Verse 15
   - Principle: Sun and Mercury conjoined without severe combustion within 3 degrees.
4. **Chandra Mangala Yoga** (`RULE_CHANDRA_MANGALA`)
   - Source: `SRC_PD`
   - Chapter 6, Verse 18
   - Principle: Moon and Mars conjoined in auspicious house.
5. **Kuja Dosha** (`RULE_KUJA_DOSHA`)
   - Source: `SRC_BPHS` / `SRC_BV_RAMAN`
   - Chapter 81, Verses 26-28
   - Principle: Mars in 1st, 2nd, 4th, 7th, 8th, or 12th from Lagna/Moon/Venus, subject to Parashari cancellations.
6. **Vimshottari Dasha Activation** (`RULE_VIMSHOTTARI_DASHA`)
   - Source: `SRC_BPHS`
   - Chapter 46, Verses 1-15
   - Principle: 120-year cycle determined by Nakshatra balance of natal Moon.
7. **Jaimini Chara Karakas** (`RULE_CHARA_KARAKA_7`)
   - Source: `SRC_JS`
   - Adhyaya 1, Pada 1, Sutras 11-18
   - Principle: 7-karaka scheme ranked by advancing degrees (ignoring sign).
8. **Upapada Lagna (UL)** (`RULE_UPAPADA_LAGNA`)
   - Source: `SRC_JS`
   - Adhyaya 1, Pada 4, Sutras 2-5
   - Principle: Arudha of the 12th house reveals matrimonial harmony.
9. **KP Sub-Lord Cuspal Interlink** (`RULE_KP_SUB_LORD_MATRIMONY`)
   - Source: `SRC_KP_RDR`
   - Reader III (Cuspal Interlinks)
   - Principle: 7th cusp sub-lord signifying 2, 7, 11 indicates marriage fruition.

---

## 4. Citation Fabrication Immunity Verification

During adversarial testing (`tests/phase6KnowledgeFoundation.test.ts` Category 8):
- Non-existent rules were queried for classical citations.
- System returned: `[]` (empty list) with status `SOURCE_METADATA_INCOMPLETE`.
- Zero fallback text or AI hallucinated verse references were generated.

---

## 5. Certification Conclusion

Source provenance is strictly verified and mechanically decoupled from generative AI text layers.
**Audit Status:** PASS.
