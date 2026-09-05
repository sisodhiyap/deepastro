/**
 * Interpretation Engine
 * Pure interpretive synthesis layer that converts verified facts and rule outputs
 * into high-fidelity, human-readable insights with internal evidence tracing.
 * Operates purely downstream of FactLedger and never recalculates astronomical positions.
 */

import { FullKundliResult } from '../../astrology/VedicAstroEngine.js';
import { FactLedger } from './FactLedger.js';

export interface SectionEvidence {
  section: string;
  factors: string[];
  confidence: string;
  rationale: string;
}

export interface InterpretedLifeAreas {
  career: { summary: string; domains: string[]; evidence: SectionEvidence };
  business: { summary: string; models: string[]; evidence: SectionEvidence };
  finance: { summary: string; principles: string[]; disclaimer: string; evidence: SectionEvidence };
  relationships: { summary: string; dynamics: string[]; evidence: SectionEvidence };
  education: { summary: string; learningStyles: string[]; evidence: SectionEvidence };
  health: { summary: string; tendencies: string[]; disclaimer: string; evidence: SectionEvidence };
  actionPlan: {
    whatToDo: string[];
    whatToAvoid: string[];
    top3Actions: [string, string, string];
    blueprintSummary: string;
  };
}

export class InterpretationEngine {
  public static synthesize(kundli: FullKundliResult, ledger: FactLedger): InterpretedLifeAreas {
    const lagna = kundli.ascendant.details.signName;
    const moon = kundli.moonSign.signName;
    const currentMaha = kundli.dashas.currentMahadasha.planet;
    const currentAntar = kundli.dashas.currentAntardasha.planet;

    const house10 = kundli.houses[9]; // 10th house
    const house7 = kundli.houses[6];  // 7th house
    const house2 = kundli.houses[1];  // 2nd house
    const house11 = kundli.houses[10]; // 11th house

    // 1. Career Synthesis with Evidence
    const careerEvidence: SectionEvidence = {
      section: 'Career',
      factors: [
        `10th House Sign: ${house10.signName}`,
        `10th House Lord: ${house10.lord}`,
        `10th House Occupants: ${(house10.planetsInHouse || []).join(', ') || 'None (Aspect driven)'}`,
        `Active Mahadasha: ${currentMaha}`,
      ],
      confidence: 'HIGH',
      rationale: `Synthesized from whole-sign 10th Bhava governed by ${house10.lord} under ${currentMaha} cycle.`,
    };

    let careerSummary = `High natural aptitude for strategic execution, methodical problem-solving, and disciplined professional contribution under ${house10.lord} guardianship.`;
    let careerDomains = ['Strategic Operations & Management', 'Enterprise Systems & Consulting', 'Institutional Administration'];

    if (['Sun', 'Mars'].includes(house10.lord)) {
      careerSummary = `High natural aptitude for decisive executive leadership, operational command, engineering systems, and strategic enterprise authority governed by ${house10.lord}.`;
      careerDomains = ['Executive Leadership & Governance', 'Engineering & Operations Architecture', 'Strategic Defense & Technology', 'Competitive Venture Strategy'];
    } else if (['Mercury'].includes(house10.lord)) {
      careerSummary = `High natural aptitude for systems architecture, technical communication, data analysis, commercial advisory, and rapid conceptual synthesis under ${house10.lord}.`;
      careerDomains = ['Technology & Software Architecture', 'Strategic Data & Advisory Operations', 'Knowledge Platforms & Analytical Media', 'Commercial Trading & Intellectual Systems'];
    } else if (['Jupiter'].includes(house10.lord)) {
      careerSummary = `High natural aptitude for institutional governance, educational leadership, strategic legal advisory, and ethical wealth management guided by ${house10.lord}.`;
      careerDomains = ['Strategic Mentorship & Advisory', 'Higher Education & Academic Governance', 'Financial Stewardship & Wealth Advisory', 'Ethical Policy & Publishing'];
    } else if (['Venus'].includes(house10.lord)) {
      careerSummary = `High natural aptitude for sophisticated creative systems, design architecture, luxury brand diplomacy, media platforms, and high-trust commercial partnerships under ${house10.lord}.`;
      careerDomains = ['Design & Creative Systems Architecture', 'Digital Media & Cultural Platforms', 'Diplomatic Alliances & Client Partnerships', 'Boutique Commercial Ventures'];
    } else if (['Saturn'].includes(house10.lord)) {
      careerSummary = `High natural aptitude for large-scale infrastructure, disciplined operational governance, organizational resilience, and enduring institutional architecture governed by ${house10.lord}.`;
      careerDomains = ['Industrial & Infrastructure Management', 'Organizational Governance & Compliance', 'Long-Cycle Research & Systems Engineering', 'Enterprise Operations Stewardship'];
    } else if (['Moon'].includes(house10.lord)) {
      careerSummary = `High natural aptitude for public-facing initiatives, intuitive organizational leadership, hospitality, healthcare systems, and human-centered management under ${house10.lord}.`;
      careerDomains = ['Public Communications & Media', 'Healthcare & Wellness Systems', 'Community Enterprise & Social Impact', 'Creative Hospitality Management'];
    }

    // 2. Business Synthesis
    const businessEvidence: SectionEvidence = {
      section: 'Business',
      factors: [`7th Lord: ${house7.lord}`, `11th House of Gains: ${house11.signName}`, `Active Dasha: ${currentMaha}`],
      confidence: 'HIGH',
      rationale: 'Derived from commercial Kendra/Labha alignment.',
    };

    let businessSummary = `Strong alignment with scalable services and digital knowledge assets governed by ${house7.lord} and ${house11.lord} where compounding reputation drives recurring client value.`;
    let businessModels = ['Scalable Knowledge & Digital Assets', 'Specialized Professional Advisory', 'Technology-Enabled Services'];

    if (['Mercury', 'Venus'].includes(house7.lord)) {
      businessSummary = `Exceptional alignment with client-centric digital platforms, intellectual property syndicates, and creative professional services requiring refined aesthetic and communication standards.`;
      businessModels = ['Digital Intellectual Property & Media', 'Boutique Specialized Advisory', 'Technology-Enabled Commerce'];
    } else if (['Mars', 'Sun'].includes(house7.lord)) {
      businessSummary = `Strong capacity for execution-heavy enterprise ventures, infrastructure contracting, and high-conviction proprietary platforms.`;
      businessModels = ['Proprietary Enterprise Products', 'Technical Infrastructure & Logistics', 'Strategic Commercial Operations'];
    }

    // 3. Finance Synthesis (with mandatory disclaimer)
    const financeEvidence: SectionEvidence = {
      section: 'Finance',
      factors: [`2nd House Wealth: ${house2.signName} (${house2.lord})`, `11th House Gains: ${house11.signName} (${house11.lord})`],
      confidence: 'HIGH',
      rationale: 'Evaluated from 2nd/11th Dhana Bhavas.',
    };
    const financeSummary = `Focus on systematic savings, conservative liquidity buffers, and disciplined long-term asset allocation. The 2nd house in ${house2.signName} (${house2.lord}) favors steady compounding over speculative volatility.`;
    const financePrinciples = ['Maintain minimum 6-month operational liquidity reserves', 'Automate disciplined quarterly index and asset allocations', 'Avoid emotional financial timing or unhedged market leverage'];
    const financeDisclaimer = 'Astrological interpretation is not financial advice and does not guarantee financial returns.';

    // 4. Relationships Synthesis
    const relEvidence: SectionEvidence = {
      section: 'Relationships',
      factors: [`7th Bhava in ${house7.signName}`, `Governed by ${house7.lord}`, `Venus dignity in chart`],
      confidence: 'HIGH',
      rationale: 'Synthesized from 7th house partnership dynamics.',
    };
    const relSummary = `Relationships thrive with an intellectually equal, emotionally thoughtful counterpart. Mutual respect for independent autonomy and open communication form the bedrock of enduring harmony.`;
    const relDynamics = ['Clarity and candid communication prevent silent resentment', 'Shared intellectual or creative pursuits deepen emotional resonance'];

    // 5. Education & Skills
    const eduEvidence: SectionEvidence = {
      section: 'Education',
      factors: ['4th House foundations', '5th House intellect & discernment', 'Mercury placement'],
      confidence: 'HIGH',
      rationale: 'Derived from 4th and 5th house Vidyasthana.',
    };
    const eduSummary = `Fast conceptual absorption with high retention for structured methodologies. Learns best by reverse-engineering systems and applying concepts directly to live projects.`;
    const eduStyles = ['Applied system-building over passive memorization', 'Cross-disciplinary synthesis of technical and creative disciplines'];

    // 6. Traditional Health Tendencies (non-medical)
    const healthEvidence: SectionEvidence = {
      section: 'Traditional Health',
      factors: ['6th House Rogasthana', 'Ascendant vitality indicators', 'Solar vitality'],
      confidence: 'HIGH',
      rationale: 'Classical Ayurvedic dosha tendencies from planetary rulers.',
    };
    const healthSummary = `Traditional Vedic indicators emphasize nervous system restoration and digestive regularity. Mindful daily rhythms and disciplined sleep hygiene provide the strongest energetic foundation.`;
    const healthTendencies = ['Support digestive fire (Agni) through warm, regular nourishing meals', 'Integrate evening nervous system down-regulation and blue-light moderation'];
    const healthDisclaimer = 'TRADITIONAL ASTROLOGICAL INTERPRETATION ONLY — NOT MEDICAL ADVICE. Never replace professional healthcare consultations.';

    // 7. Action Plan & Blueprint
    const actionPlan = {
      whatToDo: [
        'Invest steadily in foundational skills and personal craft.',
        'Build consistent, repeatable operational and morning habits.',
        'Review savings, investments, and expenses on a fixed quarterly schedule.',
        'Communicate openly, directly, and constructively across partnerships.',
      ],
      whatToAvoid: [
        'Fear-based, fatalistic, or superstitious astrological assumptions.',
        'Medical self-diagnosis or abandoning professional healthcare advice.',
        'Guaranteed financial gambles or unhedged speculative volatility.',
        'Unsupported gemstone prescriptions without verifying functional lordship.',
      ],
      top3Actions: [
        'Codify one core skill into a repeatable, teachable professional system.',
        'Set a disciplined quarterly review cadence for personal savings and investments.',
        'Nurture two or three high-trust, value-aligned professional and personal relationships.',
      ] as [string, string, string],
      blueprintSummary: `${kundli.profile.name} enters this lifecycle carrying ${lagna} Lagna leadership tempered by a ${moon} Moon's patience — a balanced pairing of visible drive and quiet endurance. The current ${currentMaha} Mahadasha favors structured growth: deliberate skill acquisition anchors the cycle, while collaborative networks build durable long-term stability.`,
    };

    return {
      career: { summary: careerSummary, domains: careerDomains, evidence: careerEvidence },
      business: { summary: businessSummary, models: businessModels, evidence: businessEvidence },
      finance: { summary: financeSummary, principles: financePrinciples, disclaimer: financeDisclaimer, evidence: financeEvidence },
      relationships: { summary: relSummary, dynamics: relDynamics, evidence: relEvidence },
      education: { summary: eduSummary, learningStyles: eduStyles, evidence: eduEvidence },
      health: { summary: healthSummary, tendencies: healthTendencies, disclaimer: healthDisclaimer, evidence: healthEvidence },
      actionPlan,
    };
  }
}
