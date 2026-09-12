/**
 * Personal Financial Astrology Engine
 * Evaluates personal Jyotish wealth significations (Dhana & Labha Bhavas):
 * - 2nd House: Accumulated Liquid Capital & Treasury
 * - 5th House: Speculative Discernment & Equity Intellect
 * - 8th House: Sudden Volatility, Inheritances & Joint Capital
 * - 9th House: Long-term Fortune & Sovereign Favor
 * - 10th House: Vocational Eminence & Enterprise
 * - 11th House: Cash Flow Multipliers & Network Gains
 *
 * MANDATORY REGULATORY COMPLIANCE:
 * This analysis is strictly cultural, historical, and reflective.
 * It does NOT guarantee financial success, cannot predict specific stock returns,
 * and must never be used as a substitute for professional financial risk profiling.
 */

export interface WealthHouseAnalysis {
  houseNumber: number;
  houseName: string;
  signName: string;
  signLord: string;
  occupants: string[];
  traditionalTheme: string;
  strengthAssessment: 'Favorable' | 'Neutral' | 'Demanding';
}

export interface PersonalFinancialCosmicProfile {
  wealthTemperament: {
    archetype: 'Strategic Capital Allocator' | 'Conservative Preserver' | 'Dynamic Enterprise Builder' | 'Analytical Researcher';
    riskOrientation: 'Conservative' | 'Balanced Growth' | 'Tactical Aggressive';
    traditionalDescription: string;
  };
  keyWealthHouses: WealthHouseAnalysis[];
  dashaFinancialContext: {
    activeMahadasha: string;
    activeAntardasha: string;
    traditionalDashaTheme: string;
  };
  recommendedTraditionalAvenues: string[];
  cosmicCautionWindows: string[];
  disclaimer: string;
}

export class PersonalFinancialAstroEngine {
  public static analyzeChart(chartData: any): PersonalFinancialCosmicProfile {
    const planets = chartData.planets || [];
    const houses = chartData.houses || [];
    const ascendantSign = chartData.ascendant?.sign || 'Aries';

    // Map wealth houses
    const wealthHouseNumbers = [2, 5, 8, 9, 10, 11];
    const wealthHouseNames: Record<number, string> = {
      2: '2nd House (Dhana Bhava - Liquid Capital & Savings)',
      5: '5th House (Suta Bhava - Speculative Acumen & Intellect)',
      8: '8th House (Randhra Bhava - Volatility, Mergers & Joint Capital)',
      9: '9th House (Bhagya Bhava - Long-Term Fortune & Grace)',
      10: '10th House (Karma Bhava - Vocational Leadership & Enterprise)',
      11: '11th House (Labha Bhava - Revenue Gains & Liquid Inflows)'
    };

    const keyWealthHouses: WealthHouseAnalysis[] = wealthHouseNumbers.map(hNum => {
      const houseInfo = houses.find((h: any) => h.houseNumber === hNum) || {};
      const occupants = planets.filter((p: any) => p.house === hNum).map((p: any) => p.name);

      let strength: 'Favorable' | 'Neutral' | 'Demanding' = 'Neutral';
      if (occupants.some((p: string) => ['Jupiter', 'Venus', 'Mercury'].includes(p))) {
        strength = 'Favorable';
      } else if (occupants.some((p: string) => ['Saturn', 'Mars', 'Rahu', 'Ketu'].includes(p))) {
        strength = 'Demanding';
      }

      return {
        houseNumber: hNum,
        houseName: wealthHouseNames[hNum],
        signName: houseInfo.signName || 'Unknown',
        signLord: houseInfo.signLord || 'Unknown',
        occupants,
        traditionalTheme: 'Traditional texts link this house with ' + (hNum === 2 ? 'treasury preservation' : hNum === 5 ? 'discretionary capital deployment' : hNum === 8 ? 'unanticipated market cycles' : hNum === 9 ? 'macro alignment and institutional favor' : hNum === 10 ? 'corporate governance' : 'cumulative net yield') + '.',
        strengthAssessment: strength
      };
    });

    // Determine archetype based on 2nd, 5th, and 11th house occupants
    const h2Occupants = planets.filter((p: any) => p.house === 2).map((p: any) => p.name);
    const h5Occupants = planets.filter((p: any) => p.house === 5).map((p: any) => p.name);

    let archetype: 'Strategic Capital Allocator' | 'Conservative Preserver' | 'Dynamic Enterprise Builder' | 'Analytical Researcher' = 'Strategic Capital Allocator';
    let riskOrientation: 'Conservative' | 'Balanced Growth' | 'Tactical Aggressive' = 'Balanced Growth';

    if (h2Occupants.includes('Saturn') || h2Occupants.includes('Sun')) {
      archetype = 'Conservative Preserver';
      riskOrientation = 'Conservative';
    } else if (h5Occupants.includes('Mars') || h5Occupants.includes('Rahu')) {
      archetype = 'Dynamic Enterprise Builder';
      riskOrientation = 'Tactical Aggressive';
    } else if (h5Occupants.includes('Mercury') || h5Occupants.includes('Jupiter')) {
      archetype = 'Analytical Researcher';
      riskOrientation = 'Balanced Growth';
    }

    const dasha = chartData.dasha || {};
    const md = dasha.mahadasha?.planet || 'Jupiter';
    const ad = dasha.antardasha?.planet || 'Saturn';

    return {
      wealthTemperament: {
        archetype,
        riskOrientation,
        traditionalDescription: 'Your natal planetary configuration reflects the ' + archetype + ' archetype. Traditional Jyotish emphasizes disciplined risk mitigation before capital allocation.',
      },
      keyWealthHouses,
      dashaFinancialContext: {
        activeMahadasha: md,
        activeAntardasha: ad,
        traditionalDashaTheme: 'Operating in the ' + md + '-' + ad + ' cycle. Traditional texts recommend evaluating liquidity buffers and exercising prudence regarding high-leverage commitments.',
      },
      recommendedTraditionalAvenues: [
        'Diversified index allocations over speculative single-stock concentration',
        'Systematic investment plans (SIP) aligned with long-term compound interest',
        'Allocation to defensive tangible assets during volatile planetary transitions'
      ],
      cosmicCautionWindows: [
        'Avoid impulsive high-leverage trades during retrograde Mercury cycles',
        'Maintain strict stop-loss and cash reserves during eclipse seasons'
      ],
      disclaimer: 'Astrological wealth analysis is strictly educational, cultural, and reflective. It is not financial advice, does not guarantee positive returns, and must never override personal financial planning or SEBI-registered advisory counsel.'
    };
  }
}
