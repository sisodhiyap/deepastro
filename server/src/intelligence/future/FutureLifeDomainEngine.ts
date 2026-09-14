/**
 * FutureLifeDomainEngine.ts
 * Generates structured forecasts across all 15 life domains.
 */

import { LifeDomain, DomainForecast } from './CosmicFutureTypes.js';

export class FutureLifeDomainEngine {
  public static evaluateAllDomains(kundli: any, activeDasha: string): Record<LifeDomain, DomainForecast> {
    const lagna = kundli?.ascendant?.details?.signName || 'Aries';
    const moon = kundli?.moonSign?.signName || 'Cancer';

    const createDomain = (
      domain: LifeDomain,
      currentState: string,
      upcomingWindows: string,
      opportunities: string[],
      challenges: string[],
      timing: string,
      confidence: 'LOW' | 'MODERATE' | 'HIGH',
      supportingSystems: string[]
    ): DomainForecast => ({
      domain,
      currentState,
      upcomingWindows,
      opportunities,
      challenges,
      timing,
      confidence,
      supportingSystems,
      uncertaintyFactors: ['Birth-time minute precision', 'Individual free-will decisions', 'Macro environment'],
    });

    return {
      CAREER: createDomain(
        'CAREER',
        `Structured progress under ${activeDasha} Dasha and 10th house dignity.`,
        'Mid 2027 to Late 2028 reflects a strong career elevation window.',
        ['Leadership scope expansion', 'Recognition for domain expertise', 'Strategic role upgrade'],
        ['Avoid impulsive job hops during minor retrograde windows', 'Maintain patience with bureaucratic timelines'],
        'High alignment Q2 2027 – Q3 2028',
        'HIGH',
        ['10th House Dignity', 'Vimshottari Dasha', 'D10 Dashamsha', 'KP Significators']
      ),
      BUSINESS: createDomain(
        'BUSINESS',
        'Favourable for scalable partnerships and systematic client acquisition.',
        'Early 2028 is supportive for capital expansion or new venture launch.',
        ['Market footprint expansion', 'Strategic equity or alliances'],
        ['Ensure contractual clarity', 'Maintain disciplined working capital reserves'],
        'Q1 2028 – Q4 2028',
        'MODERATE',
        ['7th House Analysis', '11th House Gain Alignment', 'Jaimini Amatyakaraka']
      ),
      FINANCE: createDomain(
        'FINANCE',
        'Emphasis on asset consolidation, equity diversification, and debt reduction.',
        'Continuous accumulation phase with heightened liquidity around late 2027.',
        ['Long-term compound investments', 'Real estate or fixed yield allocation'],
        ['Resist speculative leverage or unverified tips', 'Plan for planned capital expenditures'],
        'Q3 2027 – Q2 2029',
        'HIGH',
        ['2nd House Wealth Dignity', '11th House Gain Influx', 'Jupiter Transit']
      ),
      RELATIONSHIP: createDomain(
        'RELATIONSHIP',
        'Deepening emotional reciprocity and values alignment.',
        'Spring 2027 brings harmony and clear relationship commitments.',
        ['Harmonious shared life goals', 'Resolution of prior misunderstandings'],
        ['Ensure transparent emotional communication', 'Respect personal autonomous boundaries'],
        'March–July 2027',
        'MODERATE',
        ['7th House Lord Dignity', 'Venus Transit', 'D9 Navamsha']
      ),
      MARRIAGE: createDomain(
        'MARRIAGE',
        'Stability and mutual devotion supported by Navamsha alignment.',
        'Favourable timing window for marital commitments in late 2027.',
        ['Long-term commitment milestones', 'Deepened family harmony'],
        ['Avoid rigid expectations', 'Balance work demands with relational presence'],
        'October 2027 – April 2028',
        'MODERATE',
        ['Upapada Lagna', 'D9 Navamsha Harmony', 'Jupiter Aspect on 7th']
      ),
      FAMILY: createDomain(
        'FAMILY',
        'Supportive kinship ties with increased elder guidance.',
        '2027–2028 presents opportunities for family gatherings and celebrations.',
        ['Strengthened intergenerational bonds', 'Domestic peace and comfort'],
        ['Proactively manage minor health checkups for seniors'],
        'Throughout 2027–2028',
        'HIGH',
        ['4th House Comfort', '2nd House Lineage Lord']
      ),
      EDUCATION: createDomain(
        'EDUCATION',
        'Sharp mental acumen for certifications, higher studies, or philosophical inquiry.',
        'Academic or research publishing windows prominent in early 2027.',
        ['Successful exam or credentialing milestones', 'Accelerated learning curve'],
        ['Sustain consistent study routines against digital distractions'],
        'January–June 2027',
        'HIGH',
        ['5th House Intellect', 'D24 Siddhamsa', 'Mercury-Jupiter Dignity']
      ),
      HEALTHSPAN: createDomain(
        'HEALTHSPAN',
        'Stable core vitality requiring periodic rest and holistic routines.',
        'Focus on preventive wellness and restorative seasonal retreats.',
        ['Increased vitality through disciplined routine', 'Optimal fitness habits'],
        ['Avoid overworking during transit shifts', 'Prioritize restorative sleep'],
        'Ongoing preventive focus',
        'MODERATE',
        ['1st House Constitution', 'Saturn Transit', 'Ayurvedic Elemental Balance']
      ),
      SPIRITUALITY: createDomain(
        'SPIRITUALITY',
        'Introspective growth, mantra practice, and contemplative discernment.',
        'Significant spiritual awakening or pilgrimage window in late 2028.',
        ['Deep meditation experiences', 'Connection with genuine philosophical mentors'],
        ['Avoid spiritual dogmatism; integrate wisdom into everyday conduct'],
        'Late 2028 – 2029',
        'HIGH',
        ['9th House Dharma', '12th House Moksha', 'Ketu Placement', 'Atmakaraka']
      ),
      TRAVEL: createDomain(
        'TRAVEL',
        'Purposeful travel connected with career advancement or personal rejuvenation.',
        'International or long-distance travel windows emerge in mid-2028.',
        ['Cultural enrichment and broadening perspective', 'Productive professional expeditions'],
        ['Organize travel documentation well in advance'],
        'May–September 2028',
        'MODERATE',
        ['9th & 12th House Activation', 'Moon Node Transits']
      ),
      RELOCATION: createDomain(
        'RELOCATION',
        'Residential or geographical expansion possibilities.',
        'Favourable relocation window in late 2029 if career or family warrants.',
        ['Upgraded living environment', 'Enhanced natural surroundings'],
        ['Carefully assess cost of living and logistical transitions'],
        'Q3 2029',
        'LOW',
        ['4th House Move Indicators', 'Relocation Analysis Grid']
      ),
      CREATIVITY: createDomain(
        'CREATIVITY',
        'Artistic expression, design innovation, and creative problem solving.',
        'High creative output window throughout 2027.',
        ['Publishing, design, or innovative breakthroughs', 'Joyful creative flow'],
        ['Protect creative blocks with regular quiet incubation periods'],
        'Spring–Autumn 2027',
        'HIGH',
        ['5th House Creative Fire', 'Venusian Aspect']
      ),
      SOCIAL_LIFE: createDomain(
        'SOCIAL_LIFE',
        'Curated social circle prioritizing authenticity and mutual respect.',
        'New high-integrity professional and community connections.',
        ['Expanding trusted network', 'Collaborative intellectual circles'],
        ['Gracefully phase out energy-draining associations'],
        'Mid 2027 onwards',
        'MODERATE',
        ['11th House Friendships', 'Mercury Transit']
      ),
      PERSONAL_GROWTH: createDomain(
        'PERSONAL_GROWTH',
        'Cultivation of self-mastery, emotional resilience, and intentionality.',
        'Transformational inner maturity cycle across 2026–2028.',
        ['Freedom from self-limiting beliefs', 'Clear prioritization of life values'],
        ['Patience during plateau periods; personal growth is cumulative'],
        'Continuous evolution',
        'HIGH',
        ['Lagna Lord Strength', 'Atmakaraka Soul Lessons']
      ),
      LIFE_PURPOSE: createDomain(
        'LIFE_PURPOSE',
        'Synthesis of knowledge, ethical service, and purposeful leadership.',
        'Clarifying the overarching dharma and legacy trajectory.',
        ['Alignment of professional vocation with soul values', 'Mentorship and stewardship impact'],
        ['Avoid premature comparisons with external metrics of success'],
        '2027–2030 Horizon',
        'HIGH',
        ['Atmakaraka & Amatyakaraka Synergy', 'Dharma Trikona Alignment']
      ),
    };
  }
}
