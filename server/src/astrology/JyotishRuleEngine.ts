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

    // ──────────────────────────────────────────────────────────────────────────
    // 1. YOGA: Gaja Kesari Yoga (Brihat Parashara Hora Shastra Ch. 36)
    // ──────────────────────────────────────────────────────────────────────────
    const gkHouseDiff = jupiter && moon ? (((jupiter.house - moon.house + 12) % 12) + 1) : 0;
    const isGk = [1, 4, 7, 10].includes(gkHouseDiff);
    const jupDebilitated = jupiter?.dignity === 'Debilitated';
    rules.push({
      ruleId: 'RULE_YOGA_GAJA_KESARI',
      version: this.VERSION,
      domain: 'YOGA',
      name: 'Gaja Kesari Yoga',
      conditions: ['Jupiter in a Kendra (1, 4, 7, 10) from the natal Moon.'],
      exceptions: ['Weakened if Jupiter is debilitated or heavily combust.'],
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '36', verse: '3-4' }],
      result: isGk ? (jupDebilitated ? 'QUALIFIED' : 'QUALIFIED') : 'NOT_QUALIFIED',
      involvedPlanets: ['Jupiter', 'Moon'],
      involvedHouses: [jupiter.house, moon.house],
      evidence: isGk
        ? [`Jupiter in House ${jupiter.house} is ${gkHouseDiff} houses from Moon (House ${moon.house}).`]
        : [`Jupiter is in House ${jupiter.house}, not in a Kendra from Moon (House ${moon.house}).`],
      strengthMultiplier: !isGk ? 0 : jupDebilitated ? 0.5 : 1.0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 2. YOGA: Budhaditya Yoga (Phaladeepika Ch. 6)
    // ──────────────────────────────────────────────────────────────────────────
    const isBudhaditya = sun && mercury && sun.house === mercury.house;
    const combustMercury = mercury?.isCombust;
    rules.push({
      ruleId: 'RULE_YOGA_BUDHADITYA',
      version: this.VERSION,
      domain: 'YOGA',
      name: 'Budhaditya Yoga',
      conditions: ['Sun and Mercury conjoined in the same bhava.'],
      exceptions: ['Deep combustion within 3 degrees may reduce sharpness of intellect.'],
      sourceReferences: [{ text: 'Phaladeepika', chapter: '6', verse: '11' }],
      result: isBudhaditya ? 'QUALIFIED' : 'NOT_QUALIFIED',
      involvedPlanets: ['Sun', 'Mercury'],
      involvedHouses: isBudhaditya ? [sun.house] : [],
      evidence: isBudhaditya
        ? [`Sun and Mercury occupy House ${sun.house} together.${combustMercury ? ' Mercury is combust.' : ''}`]
        : ['Sun and Mercury are in separate houses.'],
      strengthMultiplier: !isBudhaditya ? 0 : combustMercury ? 0.6 : 0.95,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 3. YOGA: Ruchaka Yoga — Mars Pancha Mahapurusha (BPHS Ch. 75)
    // ──────────────────────────────────────────────────────────────────────────
    const marsKendra = [1, 4, 7, 10].includes(mars.house);
    const marsOwnOrExalt = mars.dignity === 'Exalted' || mars.dignity === 'Own Sign';
    const isRuchaka = marsKendra && marsOwnOrExalt;
    rules.push({
      ruleId: 'RULE_YOGA_RUCHAKA',
      version: this.VERSION,
      domain: 'YOGA',
      name: 'Ruchaka Yoga (Pancha Mahapurusha)',
      conditions: ['Mars in a Kendra (1, 4, 7, 10) in own sign (Aries/Scorpio) or exaltation (Capricorn).'],
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '75', verse: '1-3' }],
      result: isRuchaka ? 'QUALIFIED' : 'NOT_QUALIFIED',
      involvedPlanets: ['Mars'],
      involvedHouses: isRuchaka ? [mars.house] : [],
      evidence: isRuchaka
        ? [`Mars occupies House ${mars.house} with dignity: ${mars.dignity}.`]
        : [`Mars in House ${mars.house} does not satisfy Kendra + Exalt/Own sign criteria.`],
      strengthMultiplier: isRuchaka ? 1.0 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 4. DOSHA: Manglik Dosha & Classical Nivritti (Cancellations)
    // ──────────────────────────────────────────────────────────────────────────
    const manglikLagnaHouses = [1, 2, 4, 7, 8, 12];
    const isManglikFromLagna = manglikLagnaHouses.includes(mars.house);
    const cancellations = kundli.doshas?.manglik?.cancellations || [];
    const hasCancellation = cancellations.length > 0;
    rules.push({
      ruleId: 'RULE_DOSHA_MANGLIK',
      version: this.VERSION,
      domain: 'DOSHA',
      name: 'Kuja / Manglik Dosha',
      conditions: ['Mars placed in 1st, 2nd, 4th, 7th, 8th, or 12th bhava from Lagna or Moon.'],
      exceptions: cancellations,
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '81', verse: '47' }],
      result: isManglikFromLagna ? 'QUALIFIED' : 'NOT_QUALIFIED',
      involvedPlanets: ['Mars'],
      involvedHouses: [mars.house],
      evidence: isManglikFromLagna
        ? [`Mars occupies House ${mars.house}.${hasCancellation ? ' Classical cancellation active.' : ''}`]
        : [`Mars is placed in auspicious upachaya/trine House ${mars.house}.`],
      strengthMultiplier: isManglikFromLagna ? (hasCancellation ? 0.3 : 0.8) : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 5. DOSHA: Sade Sati Status (Shani Gochara Transit)
    // ──────────────────────────────────────────────────────────────────────────
    const isSadeSati = Boolean(kundli.doshas?.sadeSati?.isActive);
    rules.push({
      ruleId: 'RULE_DOSHA_SADE_SATI',
      version: this.VERSION,
      domain: 'DOSHA',
      name: 'Shani Sade Sati 7.5-Year Transit',
      conditions: ['Transiting Saturn within 1 sign before, conjunct, or 1 sign after natal Moon.'],
      sourceReferences: [{ text: 'Jataka Parijata', chapter: '15', verse: '12' }],
      result: isSadeSati ? 'QUALIFIED' : 'NOT_QUALIFIED',
      involvedPlanets: ['Saturn', 'Moon'],
      involvedHouses: [moon.house],
      evidence: [kundli.doshas?.sadeSati?.description || (isSadeSati ? 'Active Sade Sati phase.' : 'No active Sade Sati transit.')],
      strengthMultiplier: isSadeSati ? 0.75 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 6. VARGA: Vargottama Condition (D1 Sign === D9 Navamsa Sign)
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
    rules.push({
      ruleId: 'RULE_VARGA_VARGOTTAMA',
      version: this.VERSION,
      domain: 'VARGA',
      name: 'Vargottama Graha (D1 = D9 Auspicious Parity)',
      conditions: ['Planet occupies identical sign in both Rashi (D1) and Navamsa (D9).'],
      sourceReferences: [{ text: 'Saravali', chapter: '41', verse: '3' }],
      result: hasVargottama ? 'QUALIFIED' : 'NOT_QUALIFIED',
      involvedPlanets: vargottamaPlanets,
      involvedHouses: [],
      evidence: hasVargottama
        ? [`Planets in identical sign in D1 & D9: ${vargottamaPlanets.join(', ')}.`]
        : ['No planets currently in exact Vargottama positions.'],
      strengthMultiplier: hasVargottama ? 1.0 : 0,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 7. DASHA: Mahadasha-Antardasha Sambandha (Planetary Relationship)
    // ──────────────────────────────────────────────────────────────────────────
    const md = kundli.dashas.currentMahadasha.planet;
    const ad = kundli.dashas.currentAntardasha.planet;
    rules.push({
      ruleId: 'RULE_DASHA_SAMBANDHA',
      version: this.VERSION,
      domain: 'DASHA',
      name: 'Vimshottari Dasha Lord Synergy',
      conditions: ['Active period ruler and sub-period ruler evaluation.'],
      sourceReferences: [{ text: 'Brihat Parashara Hora Shastra', chapter: '52', verse: '1-6' }],
      result: 'QUALIFIED',
      involvedPlanets: [md, ad],
      involvedHouses: [],
      evidence: [`Active Mahadasha lord ${md} with Antardasha lord ${ad}.`],
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
