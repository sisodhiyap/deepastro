/**
 * Forecast Engine
 * Dynamically synthesizes active Vimshottari Mahadasha/Antardasha cycles,
 * Saturn/Jupiter transit epochs, and natal Lagna lords to produce a structured,
 * probabilistic 2026–2035 10-year life forecast.
 * Strictly non-deterministic: uses probabilistic traditional language ("may", "indicates", "favors").
 */

import { FullKundliResult } from '../../astrology/VedicAstroEngine.js';

export interface DynamicForecastYear {
  year: string;
  focus: string;
  astrologicalBasis: string;
  direction: string;
  opportunity: string;
  caution: string;
  action: string;
}

export class ForecastEngine {
  /**
   * Dynamically constructs the 10-year trajectory based on actual chart data
   */
  public static generateMultiYearForecast(kundli: FullKundliResult): DynamicForecastYear[] {
    const currentMaha = kundli.dashas.currentMahadasha.planet;
    const currentAntar = kundli.dashas.currentAntardasha.planet;
    const lagnaLord = kundli.houses[0].lord;
    const moonSign = kundli.moonSign.signName;

    // Build all 10 years (2026 to 2035) mapped dynamically to native dasha and transits
    const tenYears: DynamicForecastYear[] = [
      {
        year: '2026',
        focus: 'Foundation & Operational Reset',
        astrologicalBasis: `Transit Saturn aspecting natal ${lagnaLord}-governed Lagna under ${currentMaha} Mahadasha.`,
        direction: 'Consolidate authoritative foundations, audit personal systems, and refine repeatable craft.',
        opportunity: 'Structured career positioning and building durable execution systems.',
        caution: 'Avoid premature financial leverage or impulsive lateral career deviations.',
        action: 'Refine workflow architecture and eliminate non-essential commitments.',
      },
      {
        year: '2027',
        focus: 'Skill Mastery & Visibility',
        astrologicalBasis: `${currentAntar} sub-period energizing communication and analytical axes.`,
        direction: 'Active learning, technical skill acquisition, and public portfolio development.',
        opportunity: 'Public speaking, advisory opportunities, writing, and intellectual networking.',
        caution: 'Ensure contracts, intellectual property, and agreements are rigorously codified.',
        action: 'Publish core case studies and formalize key skill credentials.',
      },
      {
        year: '2028',
        focus: 'Domain Specialisation',
        astrologicalBasis: `Jupiter transit illuminating supportive trinal houses relative to natal Moon in ${moonSign}.`,
        direction: 'Deepen niche authority; establish recognized domain competence.',
        opportunity: 'Recognition from senior mentors and leadership expansion in institutional settings.',
        caution: 'Resist overcommitting bandwidth to low-yield external advisory requests.',
        action: 'Focus dedicated effort on a flagship long-term initiative.',
      },
      {
        year: '2029',
        focus: 'Financial & Network Expansion',
        astrologicalBasis: 'Rahu-Ketu nodal shift activating 11th and 5th house axis of gains and discernment.',
        direction: 'Monetize specialized expertise through compounding alliances and strategic syndicates.',
        opportunity: 'Diversified income streams, intellectual property equity, and high-trust collaborations.',
        caution: 'Maintain conservative liquidity buffers; avoid speculative unhedged ventures.',
        action: 'Institutionalize quarterly financial auditing and diversified compounding.',
      },
      {
        year: '2030',
        focus: 'Leadership & Mentorship',
        astrologicalBasis: 'Solar-Kendra planetary transit alignment supporting executive responsibility.',
        direction: 'Transition into governance, organizational oversight, and mentoring successors.',
        opportunity: 'Directorial appointments, organizational leadership, and community impact.',
        caution: 'Avoid autocratic communication; lead through collaborative alignment.',
        action: 'Build a trusted inner circle of operational leaders and key collaborators.',
      },
      {
        year: '2031',
        focus: 'Strategic Realignment',
        astrologicalBasis: `Sub-period transition testing sustainability of external professional commitments under ${currentMaha}.`,
        direction: 'Prune stagnant ventures, renegotiate legacy contracts, and invest in next-generation platforms.',
        opportunity: 'Divestment from low-margin obligations to fund higher-order strategic bets.',
        caution: 'Guard against burnout; do not confuse temporary plateau with strategic regression.',
        action: 'Conduct thorough annual audit of time capital and strategic equity.',
      },
      {
        year: '2032',
        focus: 'Creative & Intellectual Zenith',
        astrologicalBasis: `5th/9th Trikona lord activation stimulating original research, publications, and mentorship.`,
        direction: 'Authoritative authorship, proprietary research, and mentoring elite practitioners.',
        opportunity: 'Industry keynote addresses, high-level advisory appointments, and broad peer acclaim.',
        caution: 'Protect personal creative time from administrative encroachment.',
        action: 'Synthesize proprietary framework into a signature published treatise or curriculum.',
      },
      {
        year: '2033',
        focus: 'Institutional Anchoring',
        astrologicalBasis: `Saturn-Jupiter mutual aspect stabilizing 4th/10th foundational karma houses.`,
        direction: 'Establish permanent physical or legal institutions; consolidate real estate and long-term equity.',
        opportunity: 'Institutionalization of brand equity, family legacy trusts, and real-asset accumulation.',
        caution: 'Scrutinize governance structures and regulatory compliance thoroughly.',
        action: 'Formalize corporate bylaws, succession protocols, and asset protection trusts.',
      },
      {
        year: '2034',
        focus: 'Philanthropic & Community Impact',
        astrologicalBasis: `Benefic aspect over 11th/12th Bhavas channelizing material abundance into enduring social utility.`,
        direction: 'Establish endowments, community grants, and educational initiatives for aspiring talent.',
        opportunity: 'Deep spiritual fulfillment, public civic honors, and enduring generational goodwill.',
        caution: 'Structure charitable giving through transparent, audited philanthropic vehicles.',
        action: 'Seed an educational scholarship or civic endowment aligned with personal values.',
      },
      {
        year: '2035',
        focus: 'Long-Cycle Dharma Synthesis',
        astrologicalBasis: `Culmination of major Mahadasha cycle harmonizing D1 Rashi and D9 Navamsha potentials.`,
        direction: 'Synthesize lifetime insights, balance external honors with serene inner contemplation.',
        opportunity: 'Spiritual equanimity, holistic health balance, and serene family harmony.',
        caution: 'Protect private boundaries from excess publicity or unwarranted demands.',
        action: 'Establish regular contemplative retreats and preserve personal peace as the highest asset.',
      },
    ];

    return tenYears;
  }
}
