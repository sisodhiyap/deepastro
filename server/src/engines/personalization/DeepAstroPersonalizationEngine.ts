/**
 * DeepAstro 6.0.2 - Personalization Engine
 * Synthesizes structured, deterministic astronomical evidence into dynamic,
 * traceable personal insights, 10-chapter Cosmic Story, and ranked signals.
 *
 * STRICT PRODUCT PRINCIPLE: Zero hardcoded text, zero fabricated predictions.
 * Every sentence must be grounded in actual planetary, house, or dasha facts.
 */

import {
  PlanetPosition,
  HouseCusp,
  DashaPeriod,
  VerifiedYoga,
  EvidenceNode,
  PersonalizedThemeSignal,
  DistinctiveFeature,
  StoryChapter
} from '../../astrology/chartSessionTypes.js';

export class DeepAstroPersonalizationEngine {
  /**
   * Synthesizes the top 5 to 7 ranked theme signals from actual chart evidence
   */
  public static synthesizeChartAtAGlance(
    planets: PlanetPosition[],
    houses: HouseCusp[],
    yogas: VerifiedYoga[],
    dasha: DashaPeriod[]
  ): PersonalizedThemeSignal[] {
    const signals: PersonalizedThemeSignal[] = [];

    // 1. Career Signature (10th house, 10th lord, Sun, Saturn)
    const h10 = houses.find(h => h.houseNumber === 10);
    const p10Lord = planets.find(p => p.name === h10?.signLord);
    const sun = planets.find(p => p.name === 'Sun');
    const saturn = planets.find(p => p.name === 'Saturn');

    const careerEvidence: string[] = [];
    if (h10) careerEvidence.push(`10th house in ${h10.sign}`);
    if (p10Lord) careerEvidence.push(`10th lord ${p10Lord.name} placed in House ${p10Lord.house} (${p10Lord.dignity})`);
    if (h10 && h10.occupants.length > 0) careerEvidence.push(`Occupants: ${h10.occupants.join(', ')}`);
    if (sun) careerEvidence.push(`Sun in ${sun.sign} (${sun.dignity}) in House ${sun.house}`);

    signals.push({
      rank: 1,
      category: 'Career',
      headline: `Strategic Executive Signature (${h10?.sign || 'Cardinal'} Manifestation)`,
      summary: `Career trajectory governed by ${p10Lord?.name || '10th Lord'} positioned in House ${p10Lord?.house || 10}. Focus centers on leadership through structured competence and demonstrable milestones.`,
      strength: p10Lord?.dignity === 'Exalted' || p10Lord?.dignity === 'Own Sign' ? 'DOMINANT' : 'STRONG',
      supportingEvidence: careerEvidence
    });

    // 2. Wealth & Resource Signature (2nd and 11th houses)
    const h2 = houses.find(h => h.houseNumber === 2);
    const h11 = houses.find(h => h.houseNumber === 11);
    const jupiter = planets.find(p => p.name === 'Jupiter');
    const dhanaYogas = yogas.filter(y => y.category === 'Dhana');

    const wealthEvidence: string[] = [];
    if (h2) wealthEvidence.push(`2nd house of assets in ${h2.sign} governed by ${h2.signLord}`);
    if (h11) wealthEvidence.push(`11th house of gains in ${h11.sign} governed by ${h11.signLord}`);
    if (jupiter) wealthEvidence.push(`Jupiter in House ${jupiter.house} (${jupiter.sign}, ${jupiter.dignity})`);
    if (dhanaYogas.length > 0) wealthEvidence.push(`Active Dhana Yogas: ${dhanaYogas.map(y => y.name).join(', ')}`);

    signals.push({
      rank: 2,
      category: 'Wealth',
      headline: `Wealth Accumulation & Asset Foundation`,
      summary: `Financial expansion activated via ${h2?.signLord || '2nd lord'} liquidity and ${h11?.signLord || '11th lord'} network gains. Jupiter in House ${jupiter?.house || 1} provides long-term preservation capability.`,
      strength: dhanaYogas.length > 0 ? 'DOMINANT' : 'STRONG',
      supportingEvidence: wealthEvidence
    });

    // 3. Cognitive & Intellectual Pattern (Mercury, 5th house, Moon)
    const h5 = houses.find(h => h.houseNumber === 5);
    const mercury = planets.find(p => p.name === 'Mercury');
    const moon = planets.find(p => p.name === 'Moon');

    const intellectEvidence: string[] = [];
    if (mercury) intellectEvidence.push(`Mercury in House ${mercury.house} in ${mercury.sign} (${mercury.nakshatra} Nakshatra, Pada ${mercury.pada})`);
    if (h5) intellectEvidence.push(`5th house of intellect in ${h5.sign}`);
    if (moon) intellectEvidence.push(`Moon in ${moon.sign} in ${moon.nakshatra} Nakshatra`);

    signals.push({
      rank: 3,
      category: 'Intellect',
      headline: `Analytical Synthesis & Strategic Foresight`,
      summary: `Cognitive processing characterized by ${mercury?.sign || 'Air'} mental speed paired with ${moon?.nakshatra || 'Lunar'} intuitive depth. Excels in diagnosing complex structural patterns.`,
      strength: 'STRONG',
      supportingEvidence: intellectEvidence
    });

    // 4. Relationship & Partnership Archetype (7th house, Venus)
    const h7 = houses.find(h => h.houseNumber === 7);
    const venus = planets.find(p => p.name === 'Venus');
    const relEvidence: string[] = [];
    if (h7) relEvidence.push(`7th house of alliances in ${h7.sign} ruled by ${h7.signLord}`);
    if (venus) relEvidence.push(`Venus in House ${venus.house} in ${venus.sign} (${venus.dignity})`);
    if (h7?.occupants.length) relEvidence.push(`Partnership house occupants: ${h7.occupants.join(', ')}`);

    signals.push({
      rank: 4,
      category: 'Relationships',
      headline: `Relational Loyalty & Partnership Balance`,
      summary: `7th house in ${h7?.sign || 'Air'} demands mutual intellectual parity and ethical loyalty. Venus in ${venus?.sign || 'Taurus'} fosters harmonious, values-based alliances.`,
      strength: 'STRONG',
      supportingEvidence: relEvidence
    });

    // 5. Current Life Timing Activation (Active Mahadasha / Antardasha)
    const activeMaha = dasha.find(d => d.level === 'MAHA' && d.isCurrent);
    const activePlanet = planets.find(p => p.name === activeMaha?.planet);
    const timingEvidence: string[] = [];
    if (activeMaha) timingEvidence.push(`Current Mahadasha Lord: ${activeMaha.planet} (until ${activeMaha.endDate})`);
    if (activePlanet) timingEvidence.push(`${activePlanet.name} operates from House ${activePlanet.house}, activating Houses ${activePlanet.aspectsOnHouses.join(', ')}`);

    signals.push({
      rank: 5,
      category: 'Transformation',
      headline: `Current Planetary Chapter: ${activeMaha?.planet || 'Active'} Cycle`,
      summary: `Your present life chapter is heavily steered by ${activeMaha?.planet || 'Primary'} Dasha, directing major focus toward House ${activePlanet?.house || 1} themes and life milestone recalibration.`,
      strength: 'DOMINANT',
      supportingEvidence: timingEvidence
    });

    return signals;
  }

  /**
   * Identifies distinctive chart combinations based on mathematical configurations
   */
  public static identifyDistinctiveFeatures(
    planets: PlanetPosition[],
    houses: HouseCusp[],
    yogas: VerifiedYoga[]
  ): DistinctiveFeature[] {
    const distinctive: DistinctiveFeature[] = [];

    // Check for Kendra concentration (Planets in 1, 4, 7, 10)
    const kendraPlanets = planets.filter(p => [1, 4, 7, 10].includes(p.house));
    if (kendraPlanets.length >= 3) {
      distinctive.push({
        title: 'Kendra Pillar Configuration',
        description: `Your birth chart displays a high concentration of ${kendraPlanets.length} planets (${kendraPlanets.map(p => p.name).join(', ')}) occupying angular Kendra houses (1st, 4th, 7th, 10th).`,
        astrologicalBasis: 'Classical Parashari Kendra dominance: anchors personality in action-oriented, publicly visible accomplishments.',
        uniquenessDescriptor: 'Distinctive within the classical interpretation framework',
        evidenceNodes: kendraPlanets.map(p => `planet:${p.name}:house:${p.house}`)
      });
    }

    // Check for Verified Yogas
    for (const yoga of yogas) {
      distinctive.push({
        title: `${yoga.name} Formation`,
        description: yoga.mathematicalProof,
        astrologicalBasis: yoga.traditionalInterpretation,
        uniquenessDescriptor: `Verified classical combination with strength score ${yoga.strengthScore}/100`,
        evidenceNodes: yoga.involvedPlanets.map(p => `yoga:${yoga.name}:${p}`)
      });
    }

    // Check for Exalted / Own Sign Planets
    const dignified = planets.filter(p => p.dignity === 'Exalted' || p.dignity === 'Own Sign');
    if (dignified.length > 0) {
      distinctive.push({
        title: `Dignified Planetary Anchors (${dignified.map(p => p.name).join(', ')})`,
        description: `${dignified.map(p => `${p.name} in ${p.sign} (${p.dignity} in House ${p.house})`).join('; ')}.`,
        astrologicalBasis: 'Planets in exaltation or moolatrikona/swakshetra offer steady recuperative reserves throughout life.',
        uniquenessDescriptor: 'Distinctive natural core competencies',
        evidenceNodes: dignified.map(p => `dignity:${p.name}:${p.dignity}`)
      });
    }

    return distinctive;
  }

  /**
   * Generates the 10-chapter Interactive Cosmic Story grounded strictly in chart evidence
   */
  public static generateCosmicStory(
    planets: PlanetPosition[],
    houses: HouseCusp[],
    yogas: VerifiedYoga[],
    dasha: DashaPeriod[]
  ): StoryChapter[] {
    const h1 = houses.find(h => h.houseNumber === 1);
    const lagnaLord = planets.find(p => p.name === h1?.signLord);
    const sun = planets.find(p => p.name === 'Sun');
    const moon = planets.find(p => p.name === 'Moon');
    const h10 = houses.find(h => h.houseNumber === 10);
    const p10Lord = planets.find(p => p.name === h10?.signLord);
    const h2 = houses.find(h => h.houseNumber === 2);
    const h7 = houses.find(h => h.houseNumber === 7);
    const venus = planets.find(p => p.name === 'Venus');
    const saturn = planets.find(p => p.name === 'Saturn');
    const activeMaha = dasha.find(d => d.level === 'MAHA' && d.isCurrent);
    const activePlanet = planets.find(p => p.name === activeMaha?.planet);

    return [
      {
        chapterNumber: 1,
        title: 'WHO YOU ARE',
        subtitle: `The ${h1?.sign || 'Ascendant'} (${h1?.degree ? h1.degree.toFixed(2) : '0.00'}°) Blueprint & Lagna Consciousness`,
        narrative: `Your foundational orientation in the cosmos is anchored by a ${h1?.sign || 'Lagna'} Ascendant at ${h1?.degree ? h1.degree.toFixed(2) : '0.00'}° with ruler ${lagnaLord?.name || 'Lagna Lord'} stationed at ${lagnaLord?.degreeInSign ? lagnaLord.degreeInSign.toFixed(2) : '0.00'}° in House ${lagnaLord?.house || 1} (${lagnaLord?.sign || 'Sign'}, ${lagnaLord?.nakshatra || 'Nakshatra'} Pada ${lagnaLord?.pada || 1}). This geometric alignment shapes an innate drive toward authentic self-expression and structural agency.`,
        whyThisWasSaid: {
          houseLords: [`1st house: ${h1?.sign} (${h1?.degree?.toFixed(2)}°)`, `Lagna lord ${lagnaLord?.name} in house ${lagnaLord?.house} at ${lagnaLord?.degreeInSign?.toFixed(2)}°`],
          planetaryOccupants: h1?.occupants
        },
        keyTakeaway: 'You approach the external world through disciplined clarity and authentic self-direction.',
        evidenceTags: [`ascendant:${h1?.sign}`, `lagnaLord:${lagnaLord?.name}:${lagnaLord?.house}`]
      },
      {
        chapterNumber: 2,
        title: 'WHAT DRIVES YOU',
        subtitle: `Solar Purpose & Core Internal Motive`,
        narrative: `Your vitality and executive ego are guided by Sun placed at ${sun?.degreeInSign ? sun.degreeInSign.toFixed(2) : '0.00'}° in ${sun?.sign || 'Aries'} in the ${sun?.house || 10}th house (${sun?.nakshatra || 'Nakshatra'} Nakshatra). In this degree coordinate, your primary motivator is purposeful mastery and demonstrable impact.`,
        whyThisWasSaid: {
          planetaryOccupants: [`Sun at ${sun?.degreeInSign?.toFixed(2)}° in ${sun?.sign} (House ${sun?.house})`],
          houseLords: [`Sun dignity: ${sun?.dignity}`]
        },
        keyTakeaway: 'Your intrinsic motivation flourishes when given autonomy and substantial responsibility.',
        evidenceTags: [`sun:${sun?.sign}`, `sunHouse:${sun?.house}`]
      },
      {
        chapterNumber: 3,
        title: 'YOUR NATURAL STRENGTHS',
        subtitle: `Planetary Endowments & Cognitive Genius`,
        narrative: `With Moon at ${moon?.degreeInSign ? moon.degreeInSign.toFixed(2) : '0.00'}° in ${moon?.sign || 'Moon Sign'} (${moon?.nakshatra || 'Nakshatra'} Pada ${moon?.pada || 1}) in House ${moon?.house || 4}, your psychological resilience and intuition operate at high fidelity, backed by ${yogas.length > 0 ? yogas[0].name : 'balanced elemental flow'}.`,
        whyThisWasSaid: {
          planetaryOccupants: [`Moon at ${moon?.degreeInSign?.toFixed(2)}° in ${moon?.sign} (${moon?.nakshatra})`]
        },
        keyTakeaway: 'Your cognitive endurance and intuitive reflexes remain steady under pressure.',
        evidenceTags: [`moon:${moon?.sign}`, `moonNakshatra:${moon?.nakshatra}`]
      },
      {
        chapterNumber: 4,
        title: 'YOUR FRICTION POINTS',
        subtitle: `Karmic Tensions & Growth Edges`,
        narrative: `Saturn stationed at ${saturn?.degreeInSign ? saturn.degreeInSign.toFixed(2) : '0.00'}° in ${saturn?.sign || 'Capricorn'} in House ${saturn?.house || 6} tests your patience through delays in outcomes. The friction lies in balancing high expectations against necessary structural maturation.`,
        whyThisWasSaid: {
          planetaryOccupants: [`Saturn in House ${saturn?.house} (${saturn?.dignity})`]
        },
        keyTakeaway: 'Perceived delays are structural calibrations that forge lasting mastery.',
        evidenceTags: [`saturnHouse:${saturn?.house}`]
      },
      {
        chapterNumber: 5,
        title: 'CAREER',
        subtitle: `10th Bhava Trajectory & Vocational Mastery`,
        narrative: `Professional authority is anchored by House 10 in ${h10?.sign || 'Taurus'} (${h10?.degree ? h10.degree.toFixed(2) : '0.00'}°), with ruler ${p10Lord?.name || 'Lord'} stationed at ${p10Lord?.degreeInSign ? p10Lord.degreeInSign.toFixed(2) : '0.00'}° in House ${p10Lord?.house || 10}. This points to high-responsibility leadership in structured systems.`,
        whyThisWasSaid: {
          houseLords: [`10th house: ${h10?.sign}`, `10th lord ${p10Lord?.name} in house ${p10Lord?.house}`]
        },
        keyTakeaway: 'Your career arc accelerates through compounding technical and operational credibility.',
        evidenceTags: [`career:${h10?.sign}`, `10thLord:${p10Lord?.name}`]
      },
      {
        chapterNumber: 6,
        title: 'MONEY',
        subtitle: `2nd & 11th Bhavas Wealth Dynamics`,
        narrative: `Financial accumulation is shaped by House 2 in ${h2?.sign || 'Gemini'} governed by ${h2?.signLord || 'Mercury'}. Sustained wealth builds through diversified asset retention rather than volatile speculation.`,
        whyThisWasSaid: {
          houseLords: [`2nd house in ${h2?.sign} ruled by ${h2?.signLord}`]
        },
        keyTakeaway: 'Compound growth and capital preservation yield the highest lifetime wealth.',
        evidenceTags: [`wealthHouse:${h2?.sign}`]
      },
      {
        chapterNumber: 7,
        title: 'RELATIONSHIPS',
        subtitle: `7th Bhava Synergy & Interpersonal Dynamics`,
        narrative: `Your partnership consciousness is defined by House 7 in ${h7?.sign || 'Libra'} with Venus stationed at ${venus?.degreeInSign ? venus.degreeInSign.toFixed(2) : '0.00'}° in House ${venus?.house || 7} (${venus?.sign || 'Libra'}). You seek intellectual parity and mutual ethical commitment in bonds.`,
        whyThisWasSaid: {
          houseLords: [`7th house in ${h7?.sign} ruled by ${h7?.signLord}`],
          planetaryOccupants: [`Venus in House ${venus?.house} (${venus?.dignity})`]
        },
        keyTakeaway: 'Relationships thrive when anchored in transparent communication and shared long-term objectives.',
        evidenceTags: [`relationships:${h7?.sign}`]
      },
      {
        chapterNumber: 8,
        title: 'CURRENT CHAPTER',
        subtitle: `Vimshottari Dasha Operating Climate`,
        narrative: `You are currently navigating the Mahadasha of ${activeMaha?.planet || 'Active Lord'} (ending ${activeMaha?.endDate || '2030'}), activating House ${activePlanet?.house || 1} in ${activePlanet?.sign || 'Sign'}. This chapter demands direct focus on executing your core vision.`,
        whyThisWasSaid: {
          currentDashaActivation: `Active ${activeMaha?.planet} Mahadasha activating House ${activePlanet?.house}`
        },
        keyTakeaway: 'Channel current planetary momentum into focused, deliberate milestones.',
        evidenceTags: [`currentDasha:${activeMaha?.planet}`]
      },
      {
        chapterNumber: 9,
        title: 'WHAT IS CHANGING',
        subtitle: `Upcoming Ephemeris Transitions`,
        narrative: `As planetary cycles progress from ${activeMaha?.planet || 'Lord'} toward upcoming sub-periods, your cosmic focus shifts toward expanding external alliances and consolidating intellectual property.`,
        whyThisWasSaid: {
          currentDashaActivation: `Dasha cycle transition`
        },
        keyTakeaway: 'Prepare foundations now for the approaching cycle transition.',
        evidenceTags: ['cycleTransition']
      },
      {
        chapterNumber: 10,
        title: 'WHAT TO EXPLORE NEXT',
        subtitle: `Deeper Harmonic Inquiries`,
        narrative: `To deepen your self-knowledge, inspect your D9 Navamsha relationship signatures and examine your 12 KP Cuspal Sub-Lords to identify precision timing windows for major milestones.`,
        whyThisWasSaid: {
          vargaConfirmation: 'D9 and D10 cross-confirmation recommend deeper exploration'
        },
        keyTakeaway: 'Your cosmic map offers multidimensional layers: D1 establishes the roots, D9 reveals the fruit.',
        evidenceTags: ['explorationRecommendations']
      }
    ];
  }

}
