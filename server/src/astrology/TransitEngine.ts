/**
 * Transit Engine (Gochara)
 * Dynamically computes planetary transit positions for any requested date/time
 * and cross-references them against the native's natal chart geometry (Lagna & Chandra Lagna).
 * Tracks Sade Sati, Kantaka Shani, Ashtama Shani, Guru Gochara, and planetary aspects.
 */

import { ZODIAC_SIGNS, VEDIC_RASHI_NAMES, getJulianDay, getLahiriAyanamsha, normalizeDegrees, BirthTimeInput } from './astronomyMath.js';
import { calculateAllPlanets, PlanetData } from './PlanetEngine.js';
import { TransitInteraction, SadeSatiAnalysis } from './AstrologyFactSet.js';

export class TransitEngine {
  /**
   * Calculates dynamic planetary transits for a given evaluation date against natal positions
   */
  public static calculateTransits(
    natalAscSignIndex: number,
    natalMoonSignIndex: number,
    natalPlanets: readonly PlanetData[],
    evaluationDate: Date = new Date()
  ): {
    transitDate: string;
    planetaryTransits: TransitInteraction[];
    sadeSati: SadeSatiAnalysis;
    highlightedActivations: string[];
  } {
    const now = evaluationDate;
    const timeInput: BirthTimeInput = {
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
      day: now.getUTCDate(),
      hour: now.getUTCHours(),
      minute: now.getUTCMinutes(),
      second: now.getUTCSeconds(),
    };
    const jd = getJulianDay(timeInput, 0);

    // Calculate dynamic transit positions at the evaluation timestamp
    const transitPlanets = calculateAllPlanets(jd, natalAscSignIndex * 30);

    const interactions: TransitInteraction[] = [];
    const activations: string[] = [];

    let saturnTransitSignIndex = 9; // default fallback

    for (const tp of transitPlanets) {
      const houseFromLagna = ((tp.signIndex - natalAscSignIndex + 12) % 12) + 1;
      const houseFromMoon = ((tp.signIndex - natalMoonSignIndex + 12) % 12) + 1;

      if (tp.name === 'Saturn') {
        saturnTransitSignIndex = tp.signIndex;
      }

      // Calculate classical Vedic aspects (Drishti)
      const aspectingHouses: number[] = [(houseFromLagna + 6) % 12 || 12]; // All planets aspect 7th
      if (tp.name === 'Saturn') {
        aspectingHouses.push((houseFromLagna + 2) % 12 || 12); // 3rd aspect
        aspectingHouses.push((houseFromLagna + 9) % 12 || 12); // 10th aspect
      } else if (tp.name === 'Jupiter') {
        aspectingHouses.push((houseFromLagna + 4) % 12 || 12); // 5th aspect
        aspectingHouses.push((houseFromLagna + 8) % 12 || 12); // 9th aspect
      } else if (tp.name === 'Mars') {
        aspectingHouses.push((houseFromLagna + 3) % 12 || 12); // 4th aspect
        aspectingHouses.push((houseFromLagna + 7) % 12 || 12); // 8th aspect
      }

      // Detect activated natal planets
      const activatedPlanets = natalPlanets
        .filter(np => np.signIndex === tp.signIndex || aspectingHouses.includes(np.house))
        .map(np => np.name);

      let desc = `Transit ${tp.name} operates in ${tp.signName} (House ${houseFromLagna} from Lagna, House ${houseFromMoon} from Moon).`;
      if (tp.name === 'Jupiter' && [1, 2, 5, 7, 9, 11].includes(houseFromMoon)) {
        desc += ' Auspicious Guru Gochara blessing career clarity, fortune, and wisdom.';
        activations.push(`Benefic Jupiter transit activates House ${houseFromLagna} (Dharma & Expansion).`);
      } else if (tp.name === 'Saturn') {
        if (houseFromMoon === 8) {
          desc += ' Ashtama Shani period calling for discipline, patience, and mindful health.';
          activations.push('Ashtama Shani active: Maintain grounded routines and avoid speculative risks.');
        } else if (houseFromMoon === 4) {
          desc += ' Ardha-Ashtama / Kantaka Shani encouraging domestic balance and stability.';
        }
      }

      interactions.push({
        planet: tp.name,
        transitSign: tp.signName,
        transitSignIndex: tp.signIndex,
        transitHouse: houseFromLagna,
        transitHouseFromMoon: houseFromMoon,
        isRetrograde: tp.isRetrograde,
        aspectsNatalHouses: aspectingHouses,
        activatesNatalPlanets: activatedPlanets,
        description: desc,
      });
    }

    // Evaluate Sade Sati status
    const diffFromMoon = ((saturnTransitSignIndex - natalMoonSignIndex + 12) % 12);
    let sadeSati: SadeSatiAnalysis;

    if (diffFromMoon === 11) {
      sadeSati = {
        isInSadeSati: true,
        currentPhase: 'Rising (1st Phase - 12th from Moon)',
        moonSign: ZODIAC_SIGNS[natalMoonSignIndex],
        saturnTransitSign: ZODIAC_SIGNS[saturnTransitSignIndex],
        description: 'Saturn transits the 12th house from natal Moon: Initial phase focusing on mental discipline, expenses, and inner reflection.',
        remedies: ['Recite Hanuman Chalisa on Tuesdays & Saturdays', 'Offer mustard oil lamp on Saturday dusk', 'Practice silent evening meditation'],
      };
      activations.push('Sade Sati Phase 1 (Rising) active: Cultivate patience and structure in financial planning.');
    } else if (diffFromMoon === 0) {
      sadeSati = {
        isInSadeSati: true,
        currentPhase: 'Peak (2nd Phase - Over Moon)',
        moonSign: ZODIAC_SIGNS[natalMoonSignIndex],
        saturnTransitSign: ZODIAC_SIGNS[saturnTransitSignIndex],
        description: 'Saturn transits over natal Moon (Janma Shani): Peak metamorphic cycle requiring emotional mastery and perseverance.',
        remedies: ['Chant Shani Beej Mantra: Om Sham Shanaishcharaya Namah', 'Perform charitable acts to elderly and laborers', 'Wear iron ring crafted from horseshoe on middle finger'],
      };
      activations.push('Sade Sati Phase 2 (Peak) active: Major life restructuring and character crystallization.');
    } else if (diffFromMoon === 1) {
      sadeSati = {
        isInSadeSati: true,
        currentPhase: 'Setting (3rd Phase - 2nd from Moon)',
        moonSign: ZODIAC_SIGNS[natalMoonSignIndex],
        saturnTransitSign: ZODIAC_SIGNS[saturnTransitSignIndex],
        description: 'Saturn transits the 2nd house from natal Moon: Concluding phase stabilizing wealth, speech, and familial responsibilities.',
        remedies: ['Support educational initiatives for underprivileged', 'Maintain honest and measured speech', 'Chant Maha Mrityunjaya Mantra'],
      };
      activations.push('Sade Sati Phase 3 (Setting) active: Fruitful stabilization following previous discipline.');
    } else {
      sadeSati = {
        isInSadeSati: false,
        currentPhase: 'None',
        moonSign: ZODIAC_SIGNS[natalMoonSignIndex],
        saturnTransitSign: ZODIAC_SIGNS[saturnTransitSignIndex],
        description: 'Native is currently free from Shani Sade Sati transit.',
        remedies: ['Continue standard spiritual grounding and dharma rituals'],
      };
    }

    return {
      transitDate: evaluationDate.toISOString(),
      planetaryTransits: interactions,
      sadeSati,
      highlightedActivations: activations,
    };
  }
}
