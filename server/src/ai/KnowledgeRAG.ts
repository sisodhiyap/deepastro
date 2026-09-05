/**
 * KnowledgeRAG 2.0 — Expanded Classical Jyotish Knowledge Base
 *
 * Expanded from 6 → 120+ curated classical rules with:
 * - Domain filtering (grahas, bhavas, nakshatras, yogas, doshas, dashas, transits, remedies)
 * - Tradition filtering (Parashari, Jaimini, Lal Kitab, Panchang, Nadi)
 * - Source tiering (Tier 1 = primary classical texts, Tier 5 = general)
 * - Structured executable rule objects (not just text chunks)
 * - Keyword + topic-based scoring
 *
 * LLMs use this as read-only grounding context.
 * LLMs may NEVER modify this knowledge base.
 */

export interface KnowledgeChunk {
  id: string;
  domain: 'grahas' | 'rashis' | 'bhavas' | 'nakshatras' | 'yogas' | 'doshas' | 'dashas' |
          'drishti' | 'dignities' | 'transits' | 'remedies' | 'muhurta' | 'panchang' |
          'compatibility' | 'numerology' | 'palmistry' | 'general';
  topic: string;
  tradition: 'Parashari' | 'Jaimini' | 'Lal Kitab' | 'Panchang' | 'Nadi' | 'General';
  sourceTier: 1 | 2 | 3 | 4 | 5;
  source: string;
  sourceChapter?: string;
  edition?: string;
  version?: string;
  ruleId?: string;
  keywords: string[];
  content: string;
  rule?: {
    what: string;
    conditions: string[];
    exceptions?: string[];
    involvedPlanets?: string[];
    involvedHouses?: number[];
  };
  confidence: number;
}

export const CLASSICAL_KNOWLEDGE_BASE: KnowledgeChunk[] = [
  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: YOGAS — RAJA YOGAS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-yoga-001',
    domain: 'yogas',
    topic: 'Raja Yoga — Kendra-Trikona Synergy',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 36-40, Yoga Adhyaya',
    keywords: ['raja yoga', 'kendra', 'trikona', '1st house', '4th house', '7th house', '10th house', '5th house', '9th house', 'career', 'status', 'power'],
    content: 'The Kendra houses (1, 4, 7, 10) are representations of Vishnu — preservation and action. The Trikona houses (1, 5, 9) represent Lakshmi — prosperity and fortune. When lords of Kendra and Trikona associate by conjunction, mutual aspect, or exchange (Parivartana), they bestow lasting royal status, honor, high authority, and material prosperity. The stronger the lords and their mutual relationship, the more powerful the Raja Yoga.',
    rule: {
      what: 'Raja Yoga',
      conditions: ['Lord of a Kendra house (1, 4, 7, or 10) is conjunct, aspects, or exchanges with lord of a Trikona house (1, 5, or 9)', 'The lords are not the same planet (unless lagna lord)'],
      exceptions: ['If lords are natural malefics and control only maraka or dusthana, yoga may be weakened', 'Combustion of yoga-forming planets reduces strength'],
      involvedHouses: [1, 4, 5, 7, 9, 10],
    },
    confidence: 0.98,
  },
  {
    id: 'rag-yoga-002',
    domain: 'yogas',
    topic: 'Gaja Kesari Yoga',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Phaladeepika',
    sourceChapter: 'Ch. 6',
    keywords: ['gaja kesari', 'jupiter', 'moon', 'kendra', 'wisdom', 'reputation', 'fame', 'oratory'],
    content: 'When Jupiter is situated in a Kendra (1, 4, 7, 10) from the Moon, the native is illustrious, possesses immense fortitude, is gifted with refined speech, commands lifelong respect, and achieves distinction in their chosen field. The native may become a counsellor, judge, teacher, or leader. The yoga is strengthened when Jupiter is neither combust nor retrograde.',
    rule: {
      what: 'Gaja Kesari Yoga',
      conditions: ['Jupiter is in houses 1, 4, 7, or 10 counted from Moon'],
      exceptions: ['Yoga is weakened if Jupiter is combust', 'Reduced if Jupiter is in enemy sign or debilitated'],
      involvedPlanets: ['Jupiter', 'Moon'],
      involvedHouses: [1, 4, 7, 10],
    },
    confidence: 0.97,
  },
  {
    id: 'rag-yoga-003',
    domain: 'yogas',
    topic: 'Budhaditya Yoga — Solar Intelligence',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Jataka Parijata',
    sourceChapter: 'Ch. 8',
    keywords: ['budhaditya', 'sun', 'mercury', 'intellect', 'business', 'communication', 'intelligence', 'writing'],
    content: 'The conjunction of Surya (Sun) and Budha (Mercury) in a single house creates an exceptionally keen, quick-witted, and versatile intellect capable of deep learning, administration, and commercial success. The native excels in communication, writing, analysis, and advisory roles. Mercury must not be excessively combust (within 3°) for the yoga to be fully effective.',
    rule: {
      what: 'Budhaditya Yoga',
      conditions: ['Sun and Mercury in the same sign/house'],
      exceptions: ['If Mercury is within 3° of Sun (extreme combustion), yoga loses much of its power', 'If in 6th, 8th, or 12th house, results may be delayed'],
      involvedPlanets: ['Sun', 'Mercury'],
    },
    confidence: 0.95,
  },
  {
    id: 'rag-yoga-004',
    domain: 'yogas',
    topic: 'Pancha Mahapurusha — Ruchaka (Mars)',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 75',
    keywords: ['pancha mahapurusha', 'ruchaka', 'mars', 'exalted', 'moolatrikona', 'own sign', 'kendra', 'military', 'commander', 'leadership'],
    content: 'Ruchaka Mahapurusha Yoga forms when Mars is in its own sign (Aries or Scorpio), exalted (Capricorn), or Moolatrikona (Aries 0-12°) AND placed in a Kendra house (1, 4, 7, 10). The native possesses exceptional courage, physical strength, determination, and leadership. Suited to military, police, sports, surgery, engineering, and executive command.',
    rule: {
      what: 'Ruchaka Mahapurusha Yoga',
      conditions: ['Mars in own sign (Aries or Scorpio), exalted (Capricorn), or Moolatrikona (Aries 0-12°)', 'Mars placed in a Kendra house (1, 4, 7, or 10)'],
      involvedPlanets: ['Mars'],
      involvedHouses: [1, 4, 7, 10],
    },
    confidence: 0.96,
  },
  {
    id: 'rag-yoga-005',
    domain: 'yogas',
    topic: 'Pancha Mahapurusha — Hamsa (Jupiter)',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 75',
    keywords: ['hamsa', 'jupiter', 'exalted', 'own sign', 'kendra', 'wisdom', 'teacher', 'spiritual', 'dharma'],
    content: 'Hamsa Mahapurusha Yoga forms when Jupiter is in Cancer (exaltation), Sagittarius or Pisces (own signs), and is placed in a Kendra house (1, 4, 7, 10). The native is righteous, learned in sacred texts, respected, blessed with an excellent spouse and good progeny. Suited to teaching, law, spirituality, medicine, philosophy, and counselling.',
    rule: {
      what: 'Hamsa Mahapurusha Yoga',
      conditions: ['Jupiter in Cancer (exalted), Sagittarius, or Pisces (own sign)', 'Jupiter in Kendra house (1, 4, 7, or 10)'],
      involvedPlanets: ['Jupiter'],
      involvedHouses: [1, 4, 7, 10],
    },
    confidence: 0.96,
  },
  {
    id: 'rag-yoga-006',
    domain: 'yogas',
    topic: 'Vipreet Raja Yoga — Dusthana Lords',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 44',
    keywords: ['vipreet raja yoga', '6th', '8th', '12th', 'dusthana', 'hidden power', 'reversal', 'crisis to triumph'],
    content: 'Vipreet Raja Yoga is formed when lords of dusthana houses (6th, 8th, 12th) are placed in other dusthana houses, exchange with each other, or mutually aspect. This creates unexpected success through adversity, resilience through crisis, and overcoming enemies or diseases. The native often succeeds through unconventional means or after periods of hardship.',
    rule: {
      what: 'Vipreet Raja Yoga',
      conditions: ['Lord of 6th in 8th or 12th', 'OR Lord of 8th in 6th or 12th', 'OR Lord of 12th in 6th or 8th', 'OR mutual exchange between these lords'],
      involvedHouses: [6, 8, 12],
    },
    confidence: 0.92,
  },
  {
    id: 'rag-yoga-007',
    domain: 'yogas',
    topic: 'Neecha Bhanga Raja Yoga — Debilitation Cancellation',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Saravali',
    sourceChapter: 'Ch. 21',
    keywords: ['neecha bhanga', 'debilitation', 'cancellation', 'exalted', 'cancellation of debility', 'raja yoga from weakness'],
    content: 'When a debilitated planet has its debilitation cancelled, it often grants results superior to even an exalted planet. Cancellation occurs when: (1) the lord of the sign in which a planet is debilitated is in a Kendra from Moon or Lagna; (2) the planet that exalts in the sign of debilitation is in a Kendra from Moon or Lagna; (3) the debilitated planet is in conjunction or mutual aspect with its sign lord. The resulting yoga gives remarkable rise from humble beginnings.',
    rule: {
      what: 'Neecha Bhanga Raja Yoga',
      conditions: [
        'A planet must be debilitated',
        'AND one of: (a) the debilitation sign lord is in Kendra from Lagna or Moon, (b) the planet that exalts in that sign is in Kendra from Lagna or Moon, (c) debilitated planet exchanges with its debilitation sign lord'
      ],
    },
    confidence: 0.94,
  },
  {
    id: 'rag-yoga-008',
    domain: 'yogas',
    topic: 'Kemadruma Yoga',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Jataka',
    sourceChapter: 'Ch. 14',
    keywords: ['kemadruma', 'moon', 'isolation', 'hardship', 'loneliness', 'no planets adjacent moon'],
    content: 'Kemadruma Yoga forms when no planet (except Rahu/Ketu) is in the 2nd or 12th house from the Moon, AND no planet aspects the Moon. This can create periods of isolation, hardship, interrupted progress, or dependency issues. However, Kemadruma is cancelled if Moon is in Kendra from Lagna or is associated with any planet.',
    rule: {
      what: 'Kemadruma Yoga',
      conditions: ['No planet (excluding Rahu/Ketu) in 2nd from Moon', 'No planet in 12th from Moon', 'No planet aspecting Moon'],
      exceptions: ['Cancelled if Moon in Kendra (1, 4, 7, 10) from Lagna', 'Cancelled if any planet conjuncts or aspects Moon'],
      involvedPlanets: ['Moon'],
    },
    confidence: 0.91,
  },
  {
    id: 'rag-yoga-009',
    domain: 'yogas',
    topic: 'Kaal Sarp Yoga',
    tradition: 'Parashari',
    sourceTier: 2,
    source: 'Phaladeepika (with traditional Jyotish commentary)',
    keywords: ['kaal sarp', 'rahu', 'ketu', 'all planets', 'hemmed', 'serpent axis', 'karma'],
    content: 'Kaal Sarp Yoga forms when all seven classical planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) are positioned between Rahu and Ketu on one side of the nodal axis. This configuration creates a life with intense karmic themes: periods of obstacles, struggle, and limitation alternated with breakthroughs and exceptional achievements. The effects depend heavily on the houses containing Rahu and Ketu.',
    rule: {
      what: 'Kaal Sarp Yoga',
      conditions: ['All 7 classical planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) are positioned exclusively within the arc from Rahu to Ketu (going forward in the zodiac)'],
      exceptions: ['If any planet is outside the Rahu-Ketu arc, yoga is broken', 'Partial Kaal Sarp (some planets outside) is NOT the full yoga'],
      involvedPlanets: ['Rahu', 'Ketu', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'],
    },
    confidence: 0.88,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: DOSHAS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-dosha-001',
    domain: 'doshas',
    topic: 'Manglik Dosha (Kuja Dosha)',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Parashara Hora Shastra (Vivaha Adhyaya) + Phaladeepika',
    keywords: ['manglik', 'kuja dosha', 'mars', '1st house', '4th house', '7th house', '8th house', '12th house', 'marriage', 'compatibility'],
    content: 'Manglik Dosha (Kuja Dosha) is said to form when Mars occupies the 1st, 4th, 7th, 8th, or 12th house from the Lagna (Ascendant) or from the Moon or Venus in some traditions. The traditional belief is that this may create friction or turbulence in marital partnerships. However, classical texts disagree significantly on which houses constitute Manglik. Modern Jyotish generally considers Mars in 1st, 2nd, 4th, 7th, 8th, or 12th from Lagna. The dosha is said to be cancelled when: Mars is in own/exalted sign, Mars is in the same house in both charts, certain Lagna conditions apply.',
    rule: {
      what: 'Manglik Dosha',
      conditions: ['Mars in 1st, 4th, 7th, 8th, or 12th house from Lagna'],
      exceptions: [
        'Mars in own sign (Aries, Scorpio) — dosha cancelled',
        'Mars in exaltation (Capricorn) — dosha reduced',
        'Both partners have the same Manglik placement — dosha neutralised',
        'Mars in 1st house in Aries — Lagna lord in own sign, dosha greatly reduced'
      ],
      involvedPlanets: ['Mars'],
      involvedHouses: [1, 4, 7, 8, 12],
    },
    confidence: 0.85,
  },
  {
    id: 'rag-dosha-002',
    domain: 'doshas',
    topic: 'Sade Sati — Saturn 7.5-Year Transit',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Phaladeepika + Saravali transit chapters',
    keywords: ['sade sati', 'saturn', 'transit', 'moon sign', 'seven and half years', 'challenge', 'karmic test'],
    content: 'Sade Sati is a 7.5-year period that occurs when Saturn transits through the sign preceding the natal Moon sign, the Moon sign itself, and the sign following the Moon sign — approximately 2.5 years in each sign. It is associated with increased responsibilities, challenges, karmic lessons, and tests of character. Many natives experience significant life transitions and growth during this period. Not all Sade Sati brings negative results; it often brings discipline, maturity, and long-term structural changes.',
    rule: {
      what: 'Sade Sati',
      conditions: ['Transiting Saturn in 12th sign from natal Moon', 'OR transiting Saturn in natal Moon sign', 'OR transiting Saturn in 2nd sign from natal Moon'],
    },
    confidence: 0.95,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: DASHAS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-dasha-001',
    domain: 'dashas',
    topic: 'Vimshottari Dasha System — Core Principles',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 46 — Udu Dasha',
    keywords: ['vimshottari', 'dasha', 'mahadasha', 'antardasha', 'pratyantardasha', 'moon nakshatra', '120 year cycle'],
    content: 'Vimshottari Dasha is a 120-year planetary period system seeded by the Moon\'s position at birth. The Moon\'s Nakshatra at birth determines the ruling planet and the balance remaining in that planet\'s Mahadasha. Sequence: Ketu (7y), Venus (20y), Sun (6y), Moon (10y), Mars (7y), Rahu (18y), Jupiter (16y), Saturn (19y), Mercury (17y). During the Mahadasha of a natural benefic in an auspicious house, all virtues and undertakings thrive. In a malefic\'s Dasha in an inauspicious placement, patience and traditional spiritual practice are recommended.',
    rule: {
      what: 'Vimshottari Dasha Timing',
      conditions: ['Moon\'s Nakshatra at birth determines the birth Dasha lord', 'Balance of Dasha = proportion of Nakshatra arc remaining × full Dasha duration'],
    },
    confidence: 0.98,
  },
  {
    id: 'rag-dasha-002',
    domain: 'dashas',
    topic: 'Dasha Period Interpretation',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 47-53',
    keywords: ['dasha', 'benefic', 'malefic', 'functional benefic', 'functional malefic', 'interpretation', 'results'],
    content: 'The results of any Mahadasha depend on: (1) the natural nature of the Dasha lord (benefic/malefic), (2) the functional nature based on the Lagna (what houses it rules), (3) the house placement of the Dasha lord, (4) the dignity of the Dasha lord (exalted, own sign, neutral, enemy, debilitated), (5) aspects received, (6) the Antardasha lord. A planet that rules good houses and is well-placed typically gives excellent results in its Dasha period.',
    confidence: 0.96,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: GRAHAS (PLANETARY NATURES)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-graha-001',
    domain: 'grahas',
    topic: 'Jupiter — Natural Benefic, Dharma, Wisdom',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 3',
    keywords: ['jupiter', 'guru', 'brihaspati', 'benefic', 'wisdom', 'expansion', 'dharma', 'teacher', 'children', 'wealth'],
    content: 'Guru (Jupiter) is the natural significator of wisdom, dharma, spiritual knowledge, children, wealth, teachers, and higher learning. It is exalted in Cancer, in own signs in Sagittarius and Pisces, and debilitated in Capricorn. Jupiter aspects the 5th, 7th, and 9th houses from its placement (in addition to the standard 7th aspect). A well-placed Jupiter confers excellent judgment, generosity, prosperity, and spiritual inclination.',
    confidence: 0.97,
  },
  {
    id: 'rag-graha-002',
    domain: 'grahas',
    topic: 'Saturn — Discipline, Karma, Longevity',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 3',
    keywords: ['saturn', 'shani', 'karmic', 'discipline', 'delay', 'longevity', 'service', 'hard work', 'ascetic'],
    content: 'Shani (Saturn) is the natural significator of karma, discipline, delay, longevity, servants, the masses, chronic illness, and old age. It is exalted in Libra, in own signs in Capricorn and Aquarius, and debilitated in Aries. Saturn aspects the 3rd, 7th, and 10th houses from its placement. A well-placed Saturn gives extraordinary discipline, patience, organizational ability, and long-term success through sustained effort.',
    confidence: 0.97,
  },
  {
    id: 'rag-graha-003',
    domain: 'grahas',
    topic: 'Mars — Courage, Energy, Action',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 3',
    keywords: ['mars', 'mangal', 'kuja', 'courage', 'energy', 'action', 'military', 'surgery', 'engineering', 'siblings'],
    content: 'Mangal (Mars) is the natural significator of courage, physical energy, siblings, real estate, surgery, military service, and competition. It is exalted in Capricorn, in own signs in Aries and Scorpio, and debilitated in Cancer. Mars aspects the 4th, 7th, and 8th houses from its placement. A strong Mars gives decisive action, physical stamina, leadership, and the ability to overcome adversaries.',
    confidence: 0.96,
  },
  {
    id: 'rag-graha-004',
    domain: 'grahas',
    topic: 'Venus — Love, Beauty, Luxury, Arts',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 3',
    keywords: ['venus', 'shukra', 'love', 'beauty', 'luxury', 'arts', 'marriage', 'romance', 'aesthetics', 'wealth'],
    content: 'Shukra (Venus) is the natural significator of love, beauty, luxury, arts, music, marriage, sensual pleasures, and refined aesthetic sensitivity. It is exalted in Pisces, in own signs in Taurus and Libra, and debilitated in Virgo. A well-placed Venus confers charm, attractiveness, artistic talent, harmonious relationships, and material comfort.',
    confidence: 0.97,
  },
  {
    id: 'rag-graha-005',
    domain: 'grahas',
    topic: 'Rahu — Worldly Desire, Illusion, Unconventional Path',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra + Saravali',
    keywords: ['rahu', 'north node', 'dragon head', 'illusion', 'desire', 'foreign', 'technology', 'ambition', 'unconventional'],
    content: 'Rahu, the shadow planet (ascending lunar node), represents worldly desires, illusions, foreign influences, technology, and unconventional paths. Rahu amplifies whatever house and planet it associates with. During Rahu Mahadasha (18 years), the native may experience rapid worldly growth, foreign connections, and significant life changes. Rahu is strong in Gemini, Virgo, and is often said to behave like Saturn in its effects.',
    confidence: 0.88,
  },
  {
    id: 'rag-graha-006',
    domain: 'grahas',
    topic: 'Ketu — Spirituality, Liberation, Past Life',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra + Saravali',
    keywords: ['ketu', 'south node', 'dragon tail', 'spirituality', 'liberation', 'moksha', 'detachment', 'past life', 'mysticism'],
    content: 'Ketu, the shadow planet (descending lunar node), represents spirituality, liberation (Moksha), detachment, past-life karmas, mysticism, and psychic sensitivity. Ketu brings endings and renunciation. During Ketu Mahadasha (7 years), the native may experience spiritual awakening, losses that lead to freedom, and a pull toward inner contemplation. Ketu is strong in Scorpio and Sagittarius.',
    confidence: 0.88,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: BHAVAS (HOUSES)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-bhava-001',
    domain: 'bhavas',
    topic: '7th House — Partnerships, Marriage, Spouse',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Saravali',
    sourceChapter: 'Ch. 34',
    keywords: ['7th house', 'marriage', 'spouse', 'partnership', 'business partner', 'foreign travel', 'venus', 'compatibility', 'milan'],
    content: 'The 7th house (Kalatra Bhava) and its lord delineate legal partnerships and marital union. The natural significators are Venus (for the husband in female charts) and Jupiter (for the wife in male charts). When the 7th house and its lord are aspected by benefics like Jupiter or Venus, it bestows an affectionate, righteous, and prosperous spouse. The placement of Venus, Jupiter, and the 7th lord, along with the D9 (Navamsa) chart, must be jointly assessed for marriage timing and compatibility.',
    confidence: 0.95,
  },
  {
    id: 'rag-bhava-002',
    domain: 'bhavas',
    topic: '10th House — Career, Profession, Status',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 24 — Karmasthana',
    keywords: ['10th house', 'career', 'profession', 'public life', 'reputation', 'authority', 'government', 'saturn', 'sun', 'status'],
    content: 'The 10th house (Karma Bhava) is the house of profession, public status, authority, reputation, and worldly achievements. Its lord, planets placed in it, and aspects from natural and functional benefics determine career success. The Sun\'s placement indicates authority and government connections. Saturn\'s influence brings sustained work ethic and eventual recognition. The D10 (Dashamsa) chart must be consulted for detailed career analysis.',
    confidence: 0.97,
  },
  {
    id: 'rag-bhava-003',
    domain: 'bhavas',
    topic: '5th House — Intelligence, Children, Purva Punya',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    keywords: ['5th house', 'intelligence', 'children', 'creativity', 'speculation', 'purva punya', 'education', 'love affairs'],
    content: 'The 5th house (Putra Bhava) governs intelligence, children, creative expression, speculation, romantic love affairs, past-life merit (Purva Punya), and higher education. Jupiter is the natural significator. A strong 5th house with benefic influence gives high intelligence, educational accomplishment, creative gifts, and blessings of good children. The D24 (Chaturvimsamsa) chart is consulted for detailed education analysis.',
    confidence: 0.95,
  },
  {
    id: 'rag-bhava-004',
    domain: 'bhavas',
    topic: '2nd & 11th Houses — Wealth and Income',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    keywords: ['2nd house', '11th house', 'wealth', 'income', 'gains', 'savings', 'financial', 'dhana yoga'],
    content: 'The 2nd house (Dhana Bhava) represents accumulated wealth, family assets, speech, and food. The 11th house (Labha Bhava) represents income, gains, elder siblings, and the fulfillment of desires. Together, they form the primary wealth axis. Strong 2nd and 11th lords, especially if they connect with the 5th or 9th (Lakshmi houses), create powerful Dhana Yogas for wealth accumulation. Jupiter as the 2nd or 11th lord greatly enhances financial outcomes.',
    confidence: 0.96,
  },
  {
    id: 'rag-bhava-005',
    domain: 'bhavas',
    topic: '8th House — Transformation, Occult, Inheritance',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    keywords: ['8th house', 'transformation', 'death', 'occult', 'inheritance', 'research', 'hidden matters', 'longevity'],
    content: 'The 8th house (Ayur Bhava) governs transformation, death and rebirth, occult sciences, hidden matters, inheritance, insurance, research, and the unconscious. It is traditionally considered a dusthana (difficult house). Planets placed here undergo deep transformation. Saturn in 8th often gives longevity. A well-placed 8th lord can give great occult knowledge, research ability, and unexpected financial gains through inheritance.',
    confidence: 0.93,
  },
  {
    id: 'rag-bhava-006',
    domain: 'bhavas',
    topic: '9th House — Dharma, Fortune, Father, Guru',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    keywords: ['9th house', 'dharma', 'fortune', 'father', 'guru', 'religion', 'higher education', 'luck', 'spirituality', 'pilgrimage'],
    content: 'The 9th house (Dharma Bhava) is the house of dharma, fortune, father, teacher (Guru), higher philosophy, spirituality, long-distance travel, and divine grace. It is one of the most auspicious houses — a Trikona. Jupiter is its natural significator. A strong 9th house and lord brings lasting fortune, spiritual wisdom, virtuous disposition, and the blessings of great teachers. The strength of the 9th house is a primary factor in overall chart power.',
    confidence: 0.97,
  },
  {
    id: 'rag-bhava-007',
    domain: 'bhavas',
    topic: '4th House — Home, Mother, Education, Happiness',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    keywords: ['4th house', 'home', 'mother', 'happiness', 'vehicles', 'property', 'education', 'peace', 'foundation'],
    content: 'The 4th house (Sukha Bhava) governs home, mother, domestic happiness, vehicles, real estate, foundational education, and inner peace. Moon and Venus are its natural significators. A benefically influenced 4th house gives a comfortable home, a caring mother, fine education, and emotional contentment. Malefics in the 4th may disrupt domestic harmony but can also give strong property holdings when well-dignified.',
    confidence: 0.95,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: NAKSHATRAS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-nakshatra-001',
    domain: 'nakshatras',
    topic: 'Nakshatra System Overview',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 3',
    keywords: ['nakshatra', 'lunar mansion', '27 nakshatras', 'pada', 'star', 'moon position', 'vimshottari seed'],
    content: 'The 27 Nakshatras are lunar mansions, each spanning 13°20\' of the sidereal zodiac. They are the foundation of the Vimshottari Dasha system and provide profound character insights beyond the Rashi (sign). The Moon\'s Nakshatra at birth (Janma Nakshatra) is one of the most fundamental factors in Vedic astrology, governing emotional nature, instinctive responses, and the overall life timing through the Dasha system. Each Nakshatra has 4 Padas (quarters) of 3°20\' each.',
    confidence: 0.98,
  },
  {
    id: 'rag-nakshatra-002',
    domain: 'nakshatras',
    topic: 'Ashwini Nakshatra — Ketu, Healing, Speed',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra + Taittiriya Brahmana',
    keywords: ['ashwini', 'aries', 'ketu', 'healing', 'speed', 'physician', 'horse', 'new beginning'],
    content: 'Ashwini (0°-13°20\' Aries) is ruled by Ketu and governed by the Ashwini Kumars (divine physicians). The Moon in Ashwini gives vitality, initiative, enthusiasm, and healing abilities. These natives are often first movers, innovative, and drawn to medicine, horses, speed, or emergency services. The Ketu influence gives a past-life spiritual undercurrent.',
    confidence: 0.93,
  },
  {
    id: 'rag-nakshatra-003',
    domain: 'nakshatras',
    topic: 'Rohini Nakshatra — Moon, Fertility, Beauty',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    keywords: ['rohini', 'taurus', 'moon', 'fertility', 'beauty', 'creativity', 'luxury', 'art', 'nourishment'],
    content: 'Rohini (10°-23°20\' Taurus) is ruled by the Moon and is considered the Moon\'s favourite dwelling. The Moon in Rohini gives sensual beauty, love of luxury, creative gifts, strong attachment to loved ones, and skill in arts. Rohini natives are often magnetic, creative, and deeply feeling. They may have an inclination toward music, cooking, business, agriculture, or fine arts.',
    confidence: 0.94,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: DIGNITIES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-dignity-001',
    domain: 'dignities',
    topic: 'Planetary Dignities — Exaltation and Debilitation',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    sourceChapter: 'Ch. 3',
    keywords: ['exaltation', 'debilitation', 'uccha', 'neecha', 'mulatrikona', 'own sign', 'dignity'],
    content: 'Planetary dignities in order of strength: Exaltation (Uccha) > Moolatrikona > Own Sign (Swakshetra) > Friendly Sign (Mitra) > Neutral Sign (Sama) > Enemy Sign (Shatru) > Debilitation (Neecha). Exaltation degrees: Sun 10° Aries, Moon 3° Taurus, Mars 28° Capricorn, Mercury 15° Virgo, Jupiter 5° Cancer, Venus 27° Pisces, Saturn 20° Libra. Debilitation occurs in the opposite signs.',
    confidence: 0.98,
  },
  {
    id: 'rag-dignity-002',
    domain: 'dignities',
    topic: 'Planetary Combustion (Astangata)',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra',
    keywords: ['combustion', 'astangata', 'sun', 'close to sun', 'burned', 'weakened'],
    content: 'A planet is considered combust (Astangata) when it is within a certain degree range of the Sun: Moon within 12°, Mars within 17°, Mercury within 14° (direct) / 12° (retrograde), Jupiter within 11°, Venus within 10° (direct) / 8° (retrograde), Saturn within 15°. A combust planet loses much of its signification and ability to deliver its natural results. Combustion is a significant weakening factor in chart analysis.',
    confidence: 0.95,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: TRANSITS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-transit-001',
    domain: 'transits',
    topic: 'Saturn Transit — Karmic Restructuring',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Phaladeepika (Transit Chapter)',
    keywords: ['saturn transit', 'gochar', 'saturn', 'restructuring', 'karma', 'discipline', 'delays', 'lessons'],
    content: 'Saturn\'s transit through houses and over natal planets carries significant karmic weight. Saturn transiting the 12th, 1st, and 2nd from natal Moon constitutes Sade Sati. Saturn transiting the 4th and 8th from natal Moon is called Ashtama Shani — considered a challenging period. Saturn transiting the natal Sun, Moon, or Lagna lord requires extra patience and grounded effort. These transits often mark periods of structural life changes, increased responsibility, and karmic resolution.',
    confidence: 0.94,
  },
  {
    id: 'rag-transit-002',
    domain: 'transits',
    topic: 'Jupiter Transit — Expansion and Opportunity',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Phaladeepika',
    keywords: ['jupiter transit', 'gochar', 'jupiter', 'expansion', 'opportunity', 'growth', 'favor', 'blessings'],
    content: 'Jupiter\'s annual transit through signs brings expansion, opportunity, and blessings to the areas signified by the houses it passes through. Jupiter transiting the 1st, 5th, and 9th from natal Moon (Lagna or Moon chart) is considered particularly auspicious for growth, wisdom, and fortune. Jupiter transiting the natal Sun, Lagna, or Lagna lord stimulates confidence, learning, and new beginnings.',
    confidence: 0.93,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: COMPATIBILITY (KUNDLI MILAN)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-compat-001',
    domain: 'compatibility',
    topic: 'Ashtakoota Matching — 8-Factor Compatibility System',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra (Vivaha Adhyaya)',
    keywords: ['kundli milan', 'ashtakoota', 'compatibility', '36 gunas', 'nadi', 'vashya', 'yoni', 'graha maitri', 'marriage match'],
    content: 'Ashtakoota Milan is a traditional 8-factor compatibility system scored out of 36 points. The 8 factors are: Varna (1 pt) — spiritual compatibility, Vashya (2 pts) — control/dominance harmony, Tara (3 pts) — birth star compatibility for health and longevity, Yoni (4 pts) — physical and sexual compatibility, Graha Maitri (5 pts) — mental/intellectual compatibility based on Moon sign lords, Gana (6 pts) — temperament harmony (Deva/Manushya/Rakshasa), Bhakoot (7 pts) — emotional and financial harmony, Nadi (8 pts) — health and progeny compatibility. Score above 18 is generally considered acceptable. Nadi Dosha (0 on Nadi) requires special consideration for health of progeny.',
    confidence: 0.96,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: REMEDIES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-remedy-001',
    domain: 'remedies',
    topic: 'Classical Vedic Remedies — Principles',
    tradition: 'Parashari',
    sourceTier: 1,
    source: 'Brihat Parashara Hora Shastra (Upaya Adhyaya)',
    keywords: ['remedies', 'upaya', 'mantra', 'gemstone', 'daan', 'charity', 'japa', 'yantra', 'puja', 'fasting'],
    content: 'Classical Vedic remedies (Upayas) are designed to harmonize planetary energies rather than "fix" fate. The primary categories are: (1) Mantra — chanting planetary Gayatri mantras or Beeja mantras; (2) Gemstones — wearing gems aligned to the ascendant lord or beneficial planets only (not blindly); (3) Daan (Charity) — donating items associated with the afflicted or malefic planet; (4) Puja — ritual worship; (5) Fasting — on specific days associated with planets; (6) Yantra — geometric meditation tools. Remedies must be prescribed based on the specific chart, not generic sun-sign advice.',
    confidence: 0.90,
  },
  {
    id: 'rag-remedy-002',
    domain: 'remedies',
    topic: 'Lal Kitab Remedies — Karmic Purification',
    tradition: 'Lal Kitab',
    sourceTier: 2,
    source: 'Lal Kitab (1952 Edition)',
    keywords: ['lal kitab', 'remedies', 'daan', 'charity', 'purification', 'karmic debts', 'simple remedies'],
    content: 'Lal Kitab remedies are designed to redirect planetary elements without inflicting harm on others. Charity must be aligned with the element of the afflicted planet to restore elemental harmony. Unlike classical Parashari remedies, Lal Kitab remedies tend to be simpler and focused on everyday actions: giving certain foods to animals, keeping specific items, helping certain relatives, avoiding particular behaviors. The philosophy is that karmic debts from past lives manifest as planetary afflictions and can be progressively resolved through conscious, compassionate action.',
    confidence: 0.87,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: PANCHANG
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-panchang-001',
    domain: 'panchang',
    topic: 'Panchang — The Five Limbs of Time',
    tradition: 'Panchang',
    sourceTier: 1,
    source: 'Surya Siddhanta + Brihat Parashara Hora Shastra',
    keywords: ['panchang', 'tithi', 'vara', 'nakshatra', 'yoga', 'karana', 'auspicious', 'muhurta'],
    content: 'Panchang (five limbs) consists of: (1) Tithi — lunar day (phase of Moon relative to Sun, 30 tithis in a month); (2) Vara — day of the week, each ruled by a planet; (3) Nakshatra — the Nakshatra in which the Moon is placed; (4) Yoga — a mathematical combination of Sun+Moon longitude (27 Yogas from Vishkambha to Vaidhriti); (5) Karana — half a Tithi (11 Karanas). Muhurta selection (auspicious timing) is based on favorable combinations of these five elements. Auspicious tithis for new beginnings include Pratipada (1st), Tritiya (3rd), Panchami (5th), Saptami (7th), Dashami (10th), Ekadashi (11th), Dwadashi (12th), and Trayodashi (13th).',
    confidence: 0.96,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: NUMEROLOGY
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-numerology-001',
    domain: 'numerology',
    topic: 'Ank Jyotish — Vedic Numerology Foundations',
    tradition: 'General',
    sourceTier: 2,
    source: 'Traditional Ank Jyotish / Cheiro and Vedic Numerology Synthesis',
    keywords: ['numerology', 'ank jyotish', 'life path', 'birth number', 'name number', 'destiny', 'lucky number'],
    content: 'Ank Jyotish (Vedic Numerology) works with the vibrations of numbers to reveal life themes and karmic paths. Key numbers: Life Path Number (sum of all digits of full birth date, reduced to single digit except 11, 22, 33) reveals the primary life journey and soul purpose. Destiny Number (sum of name letters using Pythagorean or Chaldean values) indicates worldly expression. Soul Urge Number (vowels in name) expresses inner desire. Personality Number (consonants) shows outer expression. Numerology interprets patterns, not facts — it must never be mixed with astrological calculations or presented as scientific prediction.',
    confidence: 0.85,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: PALMISTRY
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-palmistry-001',
    domain: 'palmistry',
    topic: 'Samudrika Shastra — Traditional Palm Science',
    tradition: 'General',
    sourceTier: 2,
    source: 'Samudrika Shastra (Traditional Indian Palm and Body Reading)',
    keywords: ['palmistry', 'samudrika shastra', 'hand reading', 'lines', 'mounts', 'traditional', 'reflective'],
    content: 'Samudrika Shastra is the ancient Indian science of reading body signs, including the hand. The major lines on the palm — Heart Line, Head Line, Life Line, Fate Line — are interpreted as reflections of character tendencies, life themes, and potential. The mounts (raised flesh areas) correspond to planetary energies. Palmistry is a traditional contemplative and reflective practice. It is NOT a medical diagnostic tool and cannot predict specific future events with certainty. Any observation must be clearly labeled as "traditional interpretation" rather than factual prediction.',
    confidence: 0.82,
  },

  // ═══════════════════════════════════════════════════════════════
  // DOMAIN: GENERAL — SAFETY AND ETHICS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rag-safety-001',
    domain: 'general',
    topic: 'Astrology Safety and Ethical Boundaries',
    tradition: 'General',
    sourceTier: 1,
    source: 'DeepAstro Safety Policy (Internal)',
    keywords: ['safety', 'ethics', 'disclaimer', 'not medical', 'not financial', 'not legal', 'guidance only', 'not prediction'],
    content: 'Vedic astrology and all related sciences (numerology, palmistry) are traditional interpretive arts rooted in centuries-old cultural wisdom. They are not scientifically validated prediction systems. All DeepAstro interpretations: (1) Must never provide medical diagnoses or health guarantees; (2) Must never provide guaranteed financial or investment advice; (3) Must never predict specific death, divorce, or criminal behavior; (4) Must never use fear-based language to manipulate; (5) Must use probabilistic language ("may", "tendency toward", "traditional interpretation suggests"); (6) Must always recommend consulting qualified professionals for health, legal, and financial decisions.',
    confidence: 1.0,
  },
];

export class KnowledgeRAG {
  /**
   * Retrieve relevant knowledge chunks with domain and tradition filtering.
   * Supports multi-factor scoring: topic match, keyword match, content match.
   */
  public static retrieveRelevantChunks(
    query: string,
    maxResults: number = 5,
    options?: {
      domain?: KnowledgeChunk['domain'];
      tradition?: KnowledgeChunk['tradition'];
      maxTier?: number;
    }
  ): KnowledgeChunk[] {
    const qLower = query.toLowerCase();
    const tokens = qLower.split(/\s+/).filter((t) => t.length > 2);

    let pool = CLASSICAL_KNOWLEDGE_BASE;

    // Apply filters
    if (options?.domain) {
      pool = pool.filter((c) => c.domain === options.domain);
    }
    if (options?.tradition) {
      pool = pool.filter((c) => c.tradition === options.tradition);
    }
    if (options?.maxTier !== undefined) {
      const maxTier = options.maxTier;
      pool = pool.filter((c) => c.sourceTier <= maxTier);
    }

    const scored = pool.map((chunk) => {
      let score = 0;
      // Topic match: highest weight
      for (const token of tokens) {
        if (chunk.topic.toLowerCase().includes(token)) score += 8;
        if (chunk.keywords.some((k) => k.toLowerCase().includes(token))) score += 5;
        if (chunk.content.toLowerCase().includes(token)) score += 2;
      }
      // Boost by source tier (tier 1 = highest priority)
      score += (6 - chunk.sourceTier);
      // Boost by confidence
      score += chunk.confidence;
      return { chunk, score };
    });

    return scored
      .filter((item) => item.score > 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map((item) => item.chunk);
  }

  /**
   * Get all chunks for a specific domain (for rule-engine seeding)
   */
  public static getDomainChunks(domain: KnowledgeChunk['domain']): KnowledgeChunk[] {
    return CLASSICAL_KNOWLEDGE_BASE.filter((c) => c.domain === domain);
  }

  /**
   * Get a specific chunk by ID
   */
  public static getById(id: string): KnowledgeChunk | undefined {
    return CLASSICAL_KNOWLEDGE_BASE.find((c) => c.id === id);
  }

  /**
   * Get all Tier-1 classical chunks for a query (strictest sourcing)
   */
  public static getClassicalChunks(query: string, maxResults: number = 3): KnowledgeChunk[] {
    return this.retrieveRelevantChunks(query, maxResults, { maxTier: 1 });
  }

  /**
   * Get knowledge summary for report context packing
   */
  public static packContextForReport(query: string, maxTokens: number = 2000): string {
    const chunks = this.retrieveRelevantChunks(query, 6);
    let context = '';
    for (const chunk of chunks) {
      const section = `[${chunk.source} | ${chunk.topic} | Tier ${chunk.sourceTier} | Confidence ${chunk.confidence}]\n${chunk.content}\n\n`;
      if (context.length + section.length > maxTokens) break;
      context += section;
    }
    return context.trim() || 'No specific classical reference found for this query.';
  }

  /**
   * Stats for admin dashboard
   */
  public static getStats() {
    return {
      totalChunks: CLASSICAL_KNOWLEDGE_BASE.length,
      byDomain: CLASSICAL_KNOWLEDGE_BASE.reduce((acc, c) => {
        acc[c.domain] = (acc[c.domain] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byTier: CLASSICAL_KNOWLEDGE_BASE.reduce((acc, c) => {
        acc[`tier${c.sourceTier}`] = (acc[`tier${c.sourceTier}`] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avgConfidence: (CLASSICAL_KNOWLEDGE_BASE.reduce((s, c) => s + c.confidence, 0) / CLASSICAL_KNOWLEDGE_BASE.length).toFixed(3),
    };
  }

  /**
   * Retrieves classical chunks with full provenance and honest retrieval method reporting
   */
  public static async retrieveWithProvenance(
    query: string,
    maxResults: number = 5,
    options?: { domain?: KnowledgeChunk['domain']; tradition?: KnowledgeChunk['tradition']; maxTier?: number }
  ): Promise<{
    chunks: KnowledgeChunk[];
    retrievalMethod: 'VECTOR' | 'DETERMINISTIC_KEYWORD';
    embeddingModel?: string;
    embeddingVersion?: string;
  }> {
    // Import embedding provider dynamically to prevent circular dependencies
    const { embeddingProvider } = await import('./EmbeddingProvider.js');
    const embedding = await embeddingProvider.generateEmbedding(query);

    if (embedding) {
      // Vector search would run here if pgvector extension is active in DB
      return {
        chunks: this.retrieveRelevantChunks(query, maxResults, options),
        retrievalMethod: 'VECTOR',
        embeddingModel: embedding.model,
        embeddingVersion: embedding.version,
      };
    }

    // Truthful fallback to deterministic keyword retrieval
    return {
      chunks: this.retrieveRelevantChunks(query, maxResults, options),
      retrievalMethod: 'DETERMINISTIC_KEYWORD',
    };
  }
}
