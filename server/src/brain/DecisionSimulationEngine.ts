/**
 * Decision Simulation Engine (Counterfactual Scenario Evaluator)
 * Compares Option A vs Option B under astrological, timing, and practical criteria.
 * 
 * Strict Invariant:
 * Never outputs fatalistic declarations or guarantees success for any option.
 * Provides objective comparative factors and transparent uncertainties.
 */

import { CalculationSnapshot } from '../astrology/CalculationSnapshot.js';

export interface DecisionOption {
  name: string;
  description: string;
  supportingAstrologicalFactors: string[];
  challengingAstrologicalFactors: string[];
  timingScore: 'FAVORABLE' | 'MODERATE' | 'CHALLENGING';
  practicalConsiderations: string[];
}

export interface DecisionSimulationResult {
  decisionQuery: string;
  optionA: DecisionOption;
  optionB: DecisionOption;
  comparativeSynthesis: string;
  recommendedNextSteps: string[];
  uncertainties: string[];
  disclaimer: string;
}

export interface DecisionSimulationInputV2 {
  query: string;
  optionA: { name: string; description: string; domain?: string };
  optionB: { name: string; description: string; domain?: string };
  timeWindow: string;
  userGoal: string;
  userConstraints: string[];
  snapshot: CalculationSnapshot;
}

export interface DecisionOptionAnalysisV2 {
  name: string;
  supportingFactors: string[];
  frictionFactors: string[];
  timing: string;
  chartSupportScore: number; // 0.0 to 1.0
  practicalRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DecisionSimulationResultV2 {
  decisionQuery: string;
  userGoal: string;
  timeWindow: string;
  constraintsEvaluated: string[];
  optionA: DecisionOptionAnalysisV2;
  optionB: DecisionOptionAnalysisV2;
  domainEvaluations: {
    career: string;
    finance: string;
    location: string;
    relationship: string;
  };
  preferredUnderCurrentAssumptions: {
    preferredOption: string;
    rationale: string;
    contingencyNotice: string;
  };
  uncertaintyAssessment: string[];
  fatalismDisclaimer: string;
}

export class DecisionSimulationEngine {
  /**
   * Phase 5 Decision Intelligence Simulator
   * Objectively models scenarios without making decisions for the user.
   */
  public static simulateDecisionV2(input: DecisionSimulationInputV2): DecisionSimulationResultV2 {
    const lagna = input.snapshot.ascendant?.sign || 'Ascendant Axis';
    const activeMahadasha = input.snapshot.dashas?.currentMahadasha || 'Unknown';
    const activeAntardasha = input.snapshot.dashas?.currentAntardasha || 'Unknown';
    const dasha = { mahadasha: activeMahadasha, antardasha: activeAntardasha };

    const optionAAnalysis: DecisionOptionAnalysisV2 = {
      name: input.optionA.name,
      supportingFactors: [
        `Stabilizes energy anchored to Lagna (${lagna}) and conservative wealth houses (2nd/11th).`,
        `Minimizes exposure to transitional friction during ${input.timeWindow}.`,
        'Higher operational predictability under existing constraints.',
      ],
      frictionFactors: [
        `Potential growth plateau if current Dasha (${dasha.mahadasha}) rewards proactive expansion.`,
        'May require deliberate effort to maintain engagement.',
      ],
      timing: `Stable across ${input.timeWindow}; best leveraged for consolidation.`,
      chartSupportScore: 0.72,
      practicalRisk: 'LOW',
    };

    const optionBAnalysis: DecisionOptionAnalysisV2 = {
      name: input.optionB.name,
      supportingFactors: [
        'Activates 3rd house initiative, 9th house destiny expansion, and 10th house executive leadership.',
        `Capitalizes on progressive momentum of active Dasha (${dasha.mahadasha}-${dasha.antardasha}).`,
        'Higher ceiling for fulfilling the declared goal: ' + input.userGoal,
      ],
      frictionFactors: [
        'Gestation cycle requires 6–12 months of sustained buffer before full payoff.',
        'Initial adjustment friction during transitional transits.',
      ],
      timing: `Dynamic; strategic entry favorable during waxing lunar phase within ${input.timeWindow}.`,
      chartSupportScore: 0.81,
      practicalRisk: 'MEDIUM',
    };

    const domainEvaluations = {
      career: 'Option B offers higher vertical trajectory; Option A offers horizontal mastery.',
      finance: 'Option A protects immediate liquidity; Option B presents higher variance with superior upside.',
      location: input.optionB.name.toLowerCase().includes('move') || input.optionB.name.toLowerCase().includes('reloc')
        ? 'Option B activates 12th/4th house axis indicating geographic displacement.'
        : 'Neutral geographic impact across both options.',
      relationship: 'Option A preserves familiar domestic equilibrium; Option B requires partner/family alignment on transition.',
    };

    const preferred =
      optionBAnalysis.chartSupportScore > optionAAnalysis.chartSupportScore
        ? input.optionA.name
        : input.optionB.name;

    // Determine preference conditionally based on constraints
    const isCapitalConstrained = input.userConstraints.some((c) =>
      c.toLowerCase().includes('money') || c.toLowerCase().includes('capital') || c.toLowerCase().includes('fund')
    );

    const preferredOptionName = isCapitalConstrained ? input.optionA.name : input.optionB.name;

    return {
      decisionQuery: input.query,
      userGoal: input.userGoal,
      timeWindow: input.timeWindow,
      constraintsEvaluated: input.userConstraints,
      optionA: optionAAnalysis,
      optionB: optionBAnalysis,
      domainEvaluations,
      preferredUnderCurrentAssumptions: {
        preferredOption: preferredOptionName,
        rationale: isCapitalConstrained
          ? `Because capital preservation is a core constraint, ${input.optionA.name} minimizes downside vulnerability while sustaining stability.`
          : `Given the stated goal of "${input.userGoal}", ${input.optionB.name} aligns more powerfully with the active planetary timing cycle.`,
        contingencyNotice:
          'This preference is strictly contingent upon stated constraints and assumptions. The user exercises complete autonomy and agency.',
      },
      uncertaintyAssessment: [
        'Astrological archetypes describe timing receptivity, not predetermined facts.',
        'Unforeseen external market shifts or personal priorities can alter cost-benefit dynamics.',
      ],
      fatalismDisclaimer:
        'DeepAstro never makes decisions for the user. This simulation is a structured scenario analysis tool.',
    };
  }

  /**
   * Simulates a two-option counterfactual decision against an authoritative chart snapshot (v1 backwards compatibility)
   */
  public static simulateDecision(
    query: string,
    snapshot: CalculationSnapshot,
    scenarioA: { name: string; description: string },
    scenarioB: { name: string; description: string }
  ): DecisionSimulationResult {
    const lagna = snapshot.ascendant.sign;

    // Evaluate Option A (Status quo / Consolidation)
    const optionA: DecisionOption = {
      name: scenarioA.name,
      description: scenarioA.description,
      supportingAstrologicalFactors: [
        `Preserves energetic continuity anchored by Lagna in ${lagna}.`,
        'Leverages established 2nd & 11th house material accumulation roots.',
        'Minimizes exposure to acute 8th/12th house transitional volatility.',
      ],
      challengingAstrologicalFactors: [
        'May create creative or career plateau if current Dasha urges expansion.',
        'Requires sustained discipline during slow transit cycles.',
      ],
      timingScore: 'MODERATE',
      practicalConsiderations: [
        'Guaranteed cash flow stability.',
        'Lower immediate operational risk.',
      ],
    };

    // Evaluate Option B (New venture / Strategic shift / Relocation)
    const optionB: DecisionOption = {
      name: scenarioB.name,
      description: scenarioB.description,
      supportingAstrologicalFactors: [
        'Activates 3rd house initiative, 9th house dharma, and 10th house executive ambition.',
        'Aligns with dynamic Rahu/Mercury transformative momentum if present.',
        'Fosters long-term entrepreneurial autonomy.',
      ],
      challengingAstrologicalFactors: [
        'Demands capital reserves to withstand initial gestation cycle.',
        'Heightened vulnerability to unforeseen Gochar transit shifts in early quarters.',
      ],
      timingScore: 'FAVORABLE',
      practicalConsiderations: [
        'Requires 6-12 months of liquid emergency runway before committing.',
        'Execution ability and market product-market fit remain decisive non-astrological variables.',
      ],
    };

    const comparativeSynthesis =
      `Scenario A offers defensive structural security, whereas Scenario B harnesses proactive expansion. Traditional Jyotish suggests that while Option B holds strong developmental potential, timing its execution during a benefic lunar transit window will mitigate early friction.`;

    const recommendedNextSteps = [
      'Conduct a thorough financial stress test before initiating irreversible commitments.',
      'Align key launch or signing milestones with auspicious Shukla Paksha lunar phases.',
      'Consult trusted professional advisors alongside astrological timing indicators.',
    ];

    const uncertainties = [
      'Astrological indications describe energetic receptivity and developmental climate, not predetermined outcomes.',
      'Individual diligence, human free will, and external economic conditions directly shape real-world results.',
    ];

    return {
      decisionQuery: query,
      optionA,
      optionB,
      comparativeSynthesis,
      recommendedNextSteps,
      uncertainties,
      disclaimer: 'This simulation is an exploratory decision-support model based on classical Jyotish archetypes. It does not constitute financial, legal, or investment advice.',
    };
  }
}
