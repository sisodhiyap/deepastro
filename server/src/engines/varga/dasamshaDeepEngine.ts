/**
 * Dasamsha (D10) Deep Career Intelligence Engine
 * Specialized analysis for career, status, leadership, and professional destiny:
 * - D10 Lagna, 10th House, and 10th Lord
 * - Sun (Authority), Saturn (Work ethic), Mercury (Strategy), Jupiter (Leadership)
 * - Career themes, strengths, challenges, and growth vectors
 */

import { PlanetData, SIGN_LORDS } from '../../astrology/PlanetEngine.js';
import { SingleVargaChart, ShodashavargaEngine } from './shodashavargaEngine.js';

export interface DasamshaCareerAnalysis {
  d10Chart: SingleVargaChart;
  d10AscendantSign: string;
  tenthHouseD10: {
    sign: string;
    signLord: string;
    occupants: string[];
  };
  keyKarakas: {
    sun: { sign: string; house: number; role: string };
    saturn: { sign: string; house: number; role: string };
    mercury: { sign: string; house: number; role: string };
    jupiter: { sign: string; house: number; role: string };
  };
  careerThemes: string[];
  careerStrengths: string[];
  careerChallenges: string[];
  favorableEnvironments: string[];
}

export class DasamshaDeepEngine {
  /**
   * Analyzes D10 Dasamsha in depth
   */
  public static analyze(params: {
    planets: PlanetData[];
    ascendantLongitude: number;
  }): DasamshaCareerAnalysis {
    const { planets, ascendantLongitude } = params;
    const d10Chart = ShodashavargaEngine.calculateSingleVarga({
      division: 10,
      planets,
      ascendantLongitude,
    });

    const tenthSignIdx = (d10Chart.ascendantSignIndex + 9) % 12;
    const tenthLord = SIGN_LORDS[tenthSignIdx];
    const tenthOccupants = d10Chart.planets
      .filter((p) => p.houseInVarga === 10)
      .map((p) => p.planet);

    const sun = d10Chart.planets.find((p) => p.planet === 'Sun');
    const saturn = d10Chart.planets.find((p) => p.planet === 'Saturn');
    const mercury = d10Chart.planets.find((p) => p.planet === 'Mercury');
    const jupiter = d10Chart.planets.find((p) => p.planet === 'Jupiter');

    const careerThemes: string[] = [
      `D10 Lagna in ${d10Chart.ascendantSignName} sets the operational tone for professional identity.`,
      `10th house in D10 falls in ${SIGN_LORDS[tenthSignIdx]} domain with ${tenthOccupants.length > 0 ? tenthOccupants.join(', ') : 'no occupants, ruled by ' + tenthLord}.`,
    ];

    const careerStrengths: string[] = [];
    const careerChallenges: string[] = [];
    const favorableEnvironments: string[] = [];

    // Sun placement
    if (sun && [1, 5, 9, 10].includes(sun.houseInVarga)) {
      careerStrengths.push('Sun in a prominent Dharma/Kendra house in D10 confers executive capability and recognition.');
    } else if (sun && [6, 8, 12].includes(sun.houseInVarga)) {
      careerChallenges.push('Sun in Dusthana in D10 calls for managing authority dynamics and avoiding unnecessary bureaucratic friction.');
    }

    // Saturn placement
    if (saturn && [3, 6, 10, 11].includes(saturn.houseInVarga)) {
      careerStrengths.push('Saturn in an Upachaya house in D10 grants steady discipline, endurance, and compounding career growth over time.');
    }

    // Mercury & Jupiter
    if (mercury && [1, 4, 10, 11].includes(mercury.houseInVarga)) {
      favorableEnvironments.push('Analytical strategy, communication, data architecture, or commerce.');
    }
    if (jupiter && [1, 5, 9, 10].includes(jupiter.houseInVarga)) {
      favorableEnvironments.push('Advisory roles, leadership, institutional governance, mentorship.');
    }

    if (favorableEnvironments.length === 0) {
      favorableEnvironments.push('Independent domain mastery, technical problem solving, structured professional services.');
    }

    return {
      d10Chart,
      d10AscendantSign: d10Chart.ascendantSignName,
      tenthHouseD10: {
        sign: d10Chart.planets.find((p) => p.houseInVarga === 10)?.signName || 'Unknown',
        signLord: tenthLord,
        occupants: tenthOccupants,
      },
      keyKarakas: {
        sun: { sign: sun?.signName || 'Unknown', house: sun?.houseInVarga || 1, role: 'Authority & Vision' },
        saturn: { sign: saturn?.signName || 'Unknown', house: saturn?.houseInVarga || 1, role: 'Perseverance & Karma' },
        mercury: { sign: mercury?.signName || 'Unknown', house: mercury?.houseInVarga || 1, role: 'Intellect & Execution' },
        jupiter: { sign: jupiter?.signName || 'Unknown', house: jupiter?.houseInVarga || 1, role: 'Wisdom & Leadership' },
      },
      careerThemes,
      careerStrengths,
      careerChallenges,
      favorableEnvironments,
    };
  }
}
