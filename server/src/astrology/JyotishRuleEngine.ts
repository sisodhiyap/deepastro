/**
 * JyotishRuleEngine
 * Formal Vedic Astrological Rule Engine.
 * Evaluates classical astrological conditions (Yogas, Doshas, Dignity, Lordship,
 * Aspects, Varga conditions, Dasha relationships) completely deterministically.
 * AI models NEVER determine whether a rule is satisfied.
 */

import { FullKundliResult } from './VedicAstroEngine.js';
import { PlanetName } from './PlanetEngine.js';

export type RuleEvaluationResult = 'QUALIFIED' | 'NOT_QUALIFIED' | 'INCONCLUSIVE';

export interface JyotishRuleDefinition {
  ruleId: string;
  version: string;
  domain: 'YOGA' | 'DOSHA' | 'DIGNITY' | 'LORDSHIP' | 'ASPECT' | 'VARGA' | 'DASHA';
  name: string;
  conditions: string[];
  exceptions?: string[];
  sourceReferences: Array<{ text: string; chapter?: string; verse?: string }>;
}

export interface EvaluatedJyotishRule extends JyotishRuleDefinition {
  result: RuleEvaluationResult;
  involvedPlanets: PlanetName[];
  involvedHouses: number[];
  evidence: string[];
  strengthMultiplier: number; // 0.0 to 1.0
}

export interface JyotishRuleEvaluationReport {
  engineVersion: string;
  evaluatedAt: string;
  rulesEvaluatedCount: number;
  qualifiedCount: number;
  rules: EvaluatedJyotishRule[];
}

export class JyotishRuleEngine {
  public static readonly VERSION = '1.0.0-classical';

  /**
   * Evaluates the comprehensive classical Jyotish rule catalog against the deterministic Kundli fact set.
   */
  public static evaluateAllRules(kundli: FullKundliResult): JyotishRuleEvaluationReport {
    const rules: EvaluatedJyotishRule[] = [];
    const planetsMap = new Map(kundli.planets.map((p) => [p.name, p]));

    const sun = planetsMap.get('Sun')!;
    const moon = planetsMap.get('Moon')!;
    const mars = planetsMap.get('Mars')!;
    const mercury = planetsMap.get('Mercury')!;
    const jupiter = planetsMap.get('Jupiter')!;
    const venus = planetsMap.get('Venus')!;
    const saturn = planetsMap.get('Saturn')!;

    const isApprox = Boolean(kundli.profile?.isApproximateTime);

    // ──────────────────────────────────────────────────────────────────────────
    // 1. YOGA: Gaja Kesari Yoga (Brihat Parashara Hora Shastra Ch. 36)
    // ──────────────────────────────────────────────────────────────────────────
    const gkHouseDiff = jupiter && moon ? (((jupiter.house - moon.house + 12) % 12) + 1) : 0;
    const isGk = [1, 4, 7, 10].includes(gkHouseDiff);
    const jupDebilitated = jupiter?.dignity === 'Debilitated';
    const moonNearCusp = (moon.siderealLongitude % 30 < 0.75) || (moon.siderealLongitude % 30 > 29.25);
    const gkResult: RuleEvaluationResult = (isApprox && moonNearCusp)
      ? 'INCONCLUSIVE'
      : isGk ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_YOGA_GAJA_KESARI',
      version: this.VERSION,
      domain: 'YOGA',
      name: 'Gaja Kesari Yoga',
      conditions: ['Jupiter in a Kendra (1, 4, 7, 10) from the natal Moon.'],
      exceptions: ['Weakened if Jupiter is debilitated or heavily combust.'],
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '36', verse: '3-4' }],
      result: gkResult,
      involvedPlanets: ['Jupiter', 'Moon'],
      involvedHouses: [jupiter.house, moon.house],
      evidence: gkResult === 'INCONCLUSIVE'
        ? ['Birth time is marked as approximate and Moon is within 0.75° of sign cusp; Kendra relationship cannot be confirmed.']
        : isGk
          ? [`Jupiter in House ${jupiter.house} is ${gkHouseDiff} houses from Moon (House ${moon.house}).`]
          : [`Jupiter is in House ${jupiter.house}, not in a Kendra from Moon (House ${moon.house}).`],
      strengthMultiplier: gkResult === 'QUALIFIED' ? (jupDebilitated ? 0.5 : 1.0) : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 2. YOGA: Budhaditya Yoga (Phaladeepika Ch. 6)
    // ──────────────────────────────────────────────────────────────────────────
    const isBudhaditya = sun && mercury && sun.house === mercury.house;
    const combustMercury = mercury?.isCombust;
    const mercNearCusp = (mercury.siderealLongitude % 30 < 0.5) || (mercury.siderealLongitude % 30 > 29.5);
    const budhadityaResult: RuleEvaluationResult = (isApprox && mercNearCusp)
      ? 'INCONCLUSIVE'
      : isBudhaditya ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_YOGA_BUDHADITYA',
      version: this.VERSION,
      domain: 'YOGA',
      name: 'Budhaditya Yoga',
      conditions: ['Sun and Mercury conjoined in the same bhava.'],
      exceptions: ['Deep combustion within 3 degrees may reduce sharpness of intellect.'],
      sourceReferences: [{ text: 'Phaladeepika', chapter: '6', verse: '11' }],
      result: budhadityaResult,
      involvedPlanets: ['Sun', 'Mercury'],
      involvedHouses: isBudhaditya ? [sun.house] : [],
      evidence: budhadityaResult === 'INCONCLUSIVE'
        ? ['Mercury is on sign boundary cusp with approximate birth time; conjoined house status is inconclusive.']
        : isBudhaditya
          ? [`Sun and Mercury occupy House ${sun.house} together.${combustMercury ? ' Mercury is combust.' : ''}`]
          : ['Sun and Mercury are in separate houses.'],
      strengthMultiplier: budhadityaResult === 'QUALIFIED' ? (combustMercury ? 0.6 : 0.95) : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 3. YOGA: Ruchaka Yoga — Mars Pancha Mahapurusha (BPHS Ch. 75)
    // ──────────────────────────────────────────────────────────────────────────
    const marsKendra = [1, 4, 7, 10].includes(mars.house);
    const marsOwnOrExalt = mars.dignity === 'Exalted' || mars.dignity === 'Own Sign';
    const isRuchaka = marsKendra && marsOwnOrExalt;
    const ruchakaResult: RuleEvaluationResult = isApprox
      ? 'INCONCLUSIVE'
      : isRuchaka ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_YOGA_RUCHAKA',
      version: this.VERSION,
      domain: 'YOGA',
      name: 'Ruchaka Yoga (Pancha Mahapurusha)',
      conditions: ['Mars in a Kendra (1, 4, 7, 10) in own sign (Aries/Scorpio) or exaltation (Capricorn).'],
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '75', verse: '1-3' }],
      result: ruchakaResult,
      involvedPlanets: ['Mars'],
      involvedHouses: isRuchaka ? [mars.house] : [],
      evidence: ruchakaResult === 'INCONCLUSIVE'
        ? ['Birth time marked as approximate; Ascendant Kendra cannot be definitively established without birth time rectification.']
        : isRuchaka
          ? [`Mars occupies Kendra House ${mars.house} with dignity: ${mars.dignity}.`]
          : [`Mars in House ${mars.house} does not satisfy Kendra + Exalt/Own sign criteria.`],
      strengthMultiplier: ruchakaResult === 'QUALIFIED' ? 1.0 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 4. YOGA: Bhadra Yoga — Mercury Pancha Mahapurusha (BPHS Ch. 75)
    // ──────────────────────────────────────────────────────────────────────────
    const mercKendra = [1, 4, 7, 10].includes(mercury.house);
    const mercOwnOrExalt = ['Exalted', 'Own Sign', 'Moolatrikona'].includes(mercury.dignity);
    const isBhadra = mercKendra && mercOwnOrExalt;
    const bhadraResult: RuleEvaluationResult = isApprox
      ? 'INCONCLUSIVE'
      : isBhadra ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_YOGA_BHADRA',
      version: this.VERSION,
      domain: 'YOGA',
      name: 'Bhadra Yoga (Pancha Mahapurusha)',
      conditions: ['Mercury in Kendra (1, 4, 7, 10) in own sign (Gemini) or exaltation (Virgo).'],
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '75', verse: '4-6' }],
      result: bhadraResult,
      involvedPlanets: ['Mercury'],
      involvedHouses: isBhadra ? [mercury.house] : [],
      evidence: bhadraResult === 'INCONCLUSIVE'
        ? ['Birth time marked as approximate; Lagna-dependent Kendra is inconclusive.']
        : isBhadra
          ? [`Mercury occupies Kendra House ${mercury.house} with dignity: ${mercury.dignity}.`]
          : [`Mercury in House ${mercury.house} does not satisfy Kendra + Exalt/Own sign criteria.`],
      strengthMultiplier: bhadraResult === 'QUALIFIED' ? 0.95 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 5. YOGA: Hamsa Yoga — Jupiter Pancha Mahapurusha (BPHS Ch. 75)
    // ──────────────────────────────────────────────────────────────────────────
    const jupKendra = [1, 4, 7, 10].includes(jupiter.house);
    const jupOwnOrExalt = ['Exalted', 'Own Sign', 'Moolatrikona'].includes(jupiter.dignity);
    const isHamsa = jupKendra && jupOwnOrExalt;
    const hamsaResult: RuleEvaluationResult = isApprox
      ? 'INCONCLUSIVE'
      : isHamsa ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_YOGA_HAMSA',
      version: this.VERSION,
      domain: 'YOGA',
      name: 'Hamsa Yoga (Pancha Mahapurusha)',
      conditions: ['Jupiter in Kendra (1, 4, 7, 10) in own sign (Sagittarius/Pisces) or exaltation (Cancer).'],
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '75', verse: '7-9' }],
      result: hamsaResult,
      involvedPlanets: ['Jupiter'],
      involvedHouses: isHamsa ? [jupiter.house] : [],
      evidence: hamsaResult === 'INCONCLUSIVE'
        ? ['Birth time marked as approximate; Lagna Kendra is inconclusive.']
        : isHamsa
          ? [`Jupiter occupies Kendra House ${jupiter.house} with dignity: ${jupiter.dignity}.`]
          : [`Jupiter in House ${jupiter.house} does not satisfy Kendra + Exalt/Own sign criteria.`],
      strengthMultiplier: hamsaResult === 'QUALIFIED' ? 1.0 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 6. YOGA: Malavya Yoga — Venus Pancha Mahapurusha (BPHS Ch. 75)
    // ──────────────────────────────────────────────────────────────────────────
    const venKendra = [1, 4, 7, 10].includes(venus.house);
    const venOwnOrExalt = ['Exalted', 'Own Sign', 'Moolatrikona'].includes(venus.dignity);
    const isMalavya = venKendra && venOwnOrExalt;
    const malavyaResult: RuleEvaluationResult = isApprox
      ? 'INCONCLUSIVE'
      : isMalavya ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_YOGA_MALAVYA',
      version: this.VERSION,
      domain: 'YOGA',
      name: 'Malavya Yoga (Pancha Mahapurusha)',
      conditions: ['Venus in Kendra (1, 4, 7, 10) in own sign (Taurus/Libra) or exaltation (Pisces).'],
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '75', verse: '10-12' }],
      result: malavyaResult,
      involvedPlanets: ['Venus'],
      involvedHouses: isMalavya ? [venus.house] : [],
      evidence: malavyaResult === 'INCONCLUSIVE'
        ? ['Birth time marked as approximate; Lagna Kendra is inconclusive.']
        : isMalavya
          ? [`Venus occupies Kendra House ${venus.house} with dignity: ${venus.dignity}.`]
          : [`Venus in House ${venus.house} does not satisfy Kendra + Exalt/Own sign criteria.`],
      strengthMultiplier: malavyaResult === 'QUALIFIED' ? 0.95 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 7. YOGA: Shasha Yoga — Saturn Pancha Mahapurusha (BPHS Ch. 75)
    // ──────────────────────────────────────────────────────────────────────────
    const satKendra = [1, 4, 7, 10].includes(saturn.house);
    const satOwnOrExalt = ['Exalted', 'Own Sign', 'Moolatrikona'].includes(saturn.dignity);
    const isShasha = satKendra && satOwnOrExalt;
    const shashaResult: RuleEvaluationResult = isApprox
      ? 'INCONCLUSIVE'
      : isShasha ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_YOGA_SHASHA',
      version: this.VERSION,
      domain: 'YOGA',
      name: 'Shasha Yoga (Pancha Mahapurusha)',
      conditions: ['Saturn in Kendra (1, 4, 7, 10) in own sign (Capricorn/Aquarius) or exaltation (Libra).'],
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '75', verse: '13-15' }],
      result: shashaResult,
      involvedPlanets: ['Saturn'],
      involvedHouses: isShasha ? [saturn.house] : [],
      evidence: shashaResult === 'INCONCLUSIVE'
        ? ['Birth time marked as approximate; Lagna Kendra is inconclusive.']
        : isShasha
          ? [`Saturn occupies Kendra House ${saturn.house} with dignity: ${saturn.dignity}.`]
          : [`Saturn in House ${saturn.house} does not satisfy Kendra + Exalt/Own sign criteria.`],
      strengthMultiplier: shashaResult === 'QUALIFIED' ? 0.9 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 8. YOGA: Chandra Mangala Yoga (Moon & Mars conjoined)
    // ──────────────────────────────────────────────────────────────────────────
    const isChandraMangala = moon && mars && moon.house === mars.house;
    const cmResult: RuleEvaluationResult = (isApprox && ((moon.siderealLongitude % 30 < 0.5) || (mars.siderealLongitude % 30 < 0.5)))
      ? 'INCONCLUSIVE'
      : isChandraMangala ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_YOGA_CHANDRA_MANGALA',
      version: this.VERSION,
      domain: 'YOGA',
      name: 'Chandra Mangala Yoga',
      conditions: ['Moon and Mars conjoined in the same bhava.'],
      sourceReferences: [{ text: 'Phaladeepika', chapter: '6', verse: '15' }],
      result: cmResult,
      involvedPlanets: ['Moon', 'Mars'],
      involvedHouses: isChandraMangala ? [moon.house] : [],
      evidence: cmResult === 'INCONCLUSIVE'
        ? ['Moon or Mars is cuspal with approximate time; conjunction status inconclusive.']
        : isChandraMangala
          ? [`Moon and Mars are conjoined in House ${moon.house}.`]
          : ['Moon and Mars are in separate houses.'],
      strengthMultiplier: cmResult === 'QUALIFIED' ? 0.85 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 9. YOGA: Amala Yoga (Benefics in 10th from Lagna or Moon)
    // ──────────────────────────────────────────────────────────────────────────
    const h10Planets = kundli.planets.filter((p) => p.house === 10);
    const hasAmala = h10Planets.some((p) => ['Jupiter', 'Venus', 'Mercury'].includes(p.name));
    const amalaResult: RuleEvaluationResult = isApprox
      ? 'INCONCLUSIVE'
      : hasAmala ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_YOGA_AMALA',
      version: this.VERSION,
      domain: 'YOGA',
      name: 'Amala Yoga',
      conditions: ['Natural benefics (Jupiter, Venus, Mercury) situated in the 10th house.'],
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '36', verse: '16' }],
      result: amalaResult,
      involvedPlanets: h10Planets.map((p) => p.name),
      involvedHouses: [10],
      evidence: amalaResult === 'INCONCLUSIVE'
        ? ['Birth time marked as approximate; 10th house cusp is inconclusive.']
        : hasAmala
          ? [`Benefic in 10th house: ${h10Planets.map((p) => p.name).join(', ')}.`]
          : ['No natural benefics occupy the 10th house.'],
      strengthMultiplier: amalaResult === 'QUALIFIED' ? 0.85 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 10. DOSHA: Manglik Dosha & Classical Nivritti (Cancellations)
    // ──────────────────────────────────────────────────────────────────────────
    const manglikLagnaHouses = [1, 2, 4, 7, 8, 12];
    const isManglikFromLagna = manglikLagnaHouses.includes(mars.house);
    const cancellations = kundli.doshas?.manglik?.cancellations || [];
    const hasCancellation = cancellations.length > 0;
    const manglikResult: RuleEvaluationResult = isApprox
      ? 'INCONCLUSIVE'
      : isManglikFromLagna ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_DOSHA_MANGLIK',
      version: this.VERSION,
      domain: 'DOSHA',
      name: 'Kuja / Manglik Dosha',
      conditions: ['Mars placed in 1st, 2nd, 4th, 7th, 8th, or 12th bhava from Lagna or Moon.'],
      exceptions: cancellations,
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '81', verse: '47' }],
      result: manglikResult,
      involvedPlanets: ['Mars'],
      involvedHouses: [mars.house],
      evidence: manglikResult === 'INCONCLUSIVE'
        ? ['Birth time marked as approximate; Lagna-dependent Mars placement cannot be definitively confirmed.']
        : isManglikFromLagna
          ? [`Mars occupies House ${mars.house}.${hasCancellation ? ' Classical cancellation active.' : ''}`]
          : [`Mars is placed in auspicious upachaya/trine House ${mars.house}.`],
      strengthMultiplier: manglikResult === 'QUALIFIED' ? (hasCancellation ? 0.3 : 0.8) : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 11. DOSHA: Kaal Sarp Dosha
    // ──────────────────────────────────────────────────────────────────────────
    const isKaalSarp = Boolean(kundli.doshas?.kaalSarp?.hasKaalSarp);
    const ksResult: RuleEvaluationResult = isApprox
      ? 'INCONCLUSIVE'
      : isKaalSarp ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_DOSHA_KAAL_SARP',
      version: this.VERSION,
      domain: 'DOSHA',
      name: 'Kaal Sarp Yoga / Dosha',
      conditions: ['All 7 primary planets hemmed between Rahu and Ketu axis.'],
      sourceReferences: [{ text: 'Bhrigu Samhita', chapter: 'Kaal Sarp Adhyaya' }],
      result: ksResult,
      involvedPlanets: ['Rahu', 'Ketu'],
      involvedHouses: kundli.doshas?.kaalSarp ? [kundli.doshas.kaalSarp.rahuHouse, kundli.doshas.kaalSarp.ketuHouse] : [],
      evidence: ksResult === 'INCONCLUSIVE'
        ? ['Birth time marked as approximate; house-specific Kaal Sarp alignment is inconclusive.']
        : isKaalSarp
          ? [`${kundli.doshas.kaalSarp.type} Kaal Sarp formed along houses ${kundli.doshas.kaalSarp.rahuHouse}-${kundli.doshas.kaalSarp.ketuHouse}.`]
          : ['All planets are not hemmed between the Rahu-Ketu nodal axis.'],
      strengthMultiplier: ksResult === 'QUALIFIED' ? (kundli.doshas?.kaalSarp?.isPartial ? 0.4 : 0.85) : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 12. DOSHA: Sade Sati Status (Shani Gochara Transit)
    // ──────────────────────────────────────────────────────────────────────────
    const isSadeSati = Boolean(kundli.doshas?.sadeSati?.isActive);
    const sadeSatiResult: RuleEvaluationResult = (isApprox && moonNearCusp)
      ? 'INCONCLUSIVE'
      : isSadeSati ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_DOSHA_SADE_SATI',
      version: this.VERSION,
      domain: 'DOSHA',
      name: 'Shani Sade Sati 7.5-Year Transit',
      conditions: ['Transiting Saturn within 1 sign before, conjunct, or 1 sign after natal Moon.'],
      sourceReferences: [{ text: 'Jataka Parijata', chapter: '15', verse: '12' }],
      result: sadeSatiResult,
      involvedPlanets: ['Saturn', 'Moon'],
      involvedHouses: [moon.house],
      evidence: sadeSatiResult === 'INCONCLUSIVE'
        ? ['Moon is at sign boundary with approximate time; natal Moon sign assignment is inconclusive.']
        : [kundli.doshas?.sadeSati?.description || (isSadeSati ? 'Active Sade Sati phase.' : 'No active Sade Sati transit.')],
      strengthMultiplier: sadeSatiResult === 'QUALIFIED' ? 0.75 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 13. DOSHA: Pitra Dosha
    // ──────────────────────────────────────────────────────────────────────────
    const isPitra = Boolean(kundli.doshas?.pitraDosha?.hasPitraDosha);
    const pitraResult: RuleEvaluationResult = isApprox
      ? 'INCONCLUSIVE'
      : isPitra ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_DOSHA_PITRA',
      version: this.VERSION,
      domain: 'DOSHA',
      name: 'Pitra Dosha',
      conditions: ['Affliction to Sun (Pitru karaka) or 9th house by Rahu/Ketu/Saturn.'],
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: 'Pitra Dosha Adhyaya' }],
      result: pitraResult,
      involvedPlanets: ['Sun', 'Rahu'],
      involvedHouses: [9],
      evidence: pitraResult === 'INCONCLUSIVE'
        ? ['Birth time marked as approximate; 9th house cusp alignment is inconclusive.']
        : isPitra
          ? [kundli.doshas?.pitraDosha?.reason || 'Pitra dosha detected.']
          : ['No severe affliction to Sun or 9th house.'],
      strengthMultiplier: pitraResult === 'QUALIFIED' ? 0.7 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 14. VARGA: Vargottama Condition (D1 Sign === D9 Navamsa Sign)
    // ──────────────────────────────────────────────────────────────────────────
    const vargottamaPlanets: PlanetName[] = [];
    const d9 = kundli.vargas?.d9_navamsa;
    if (d9 && Array.isArray(d9)) {
      for (const p of kundli.planets) {
        const d9Pos = d9.find((dp: any) => dp.planet === p.name);
        if (d9Pos && d9Pos.signIndex === p.signIndex) {
          vargottamaPlanets.push(p.name);
        }
      }
    }
    const hasVargottama = vargottamaPlanets.length > 0;
    const vargottamaResult: RuleEvaluationResult = hasVargottama ? 'QUALIFIED' : 'NOT_QUALIFIED';

    rules.push({
      ruleId: 'RULE_VARGA_VARGOTTAMA',
      version: this.VERSION,
      domain: 'VARGA',
      name: 'Vargottama Graha (D1 = D9 Auspicious Parity)',
      conditions: ['Planet occupies identical sign in both Rashi (D1) and Navamsa (D9).'],
      sourceReferences: [{ text: 'Saravali', chapter: '41', verse: '3' }],
      result: vargottamaResult,
      involvedPlanets: vargottamaPlanets,
      involvedHouses: [],
      evidence: hasVargottama
        ? [`Planets in identical sign in D1 & D9: ${vargottamaPlanets.join(', ')}.`]
        : ['No planets currently in exact Vargottama positions.'],
      strengthMultiplier: hasVargottama ? 1.0 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 15. DASHA: Mahadasha-Antardasha Sambandha (Planetary Relationship)
    // ──────────────────────────────────────────────────────────────────────────
    const md = kundli.dashas.currentMahadasha.planet;
    const ad = kundli.dashas.currentAntardasha.planet;
    const dashaResult: RuleEvaluationResult = (isApprox && moonNearCusp)
      ? 'INCONCLUSIVE'
      : 'QUALIFIED';

    rules.push({
      ruleId: 'RULE_DASHA_SAMBANDHA',
      version: this.VERSION,
      domain: 'DASHA',
      name: 'Vimshottari Dasha Lord Synergy',
      conditions: ['Active period ruler and sub-period ruler evaluation.'],
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '52', verse: '1-6' }],
      result: dashaResult,
      involvedPlanets: [md, ad],
      involvedHouses: [],
      evidence: dashaResult === 'INCONCLUSIVE'
        ? ['Moon is at nakshatra cusp with approximate time; active Mahadasha balance is inconclusive.']
        : [`Active Mahadasha lord ${md} with Antardasha lord ${ad}.`],
      strengthMultiplier: md === ad ? 0.9 : 0.8,
    });

    const qualifiedCount = rules.filter((r) => r.result === 'QUALIFIED').length;

    return {
      engineVersion: this.VERSION,
      evaluatedAt: new Date().toISOString(),
      rulesEvaluatedCount: rules.length,
      qualifiedCount,
      rules,
    };
  }
}
