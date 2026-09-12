/**
 * Western Synastry Engine
 */
import { WesternChartOutput } from './westernEngine.js';
import { calculateAngularDifference, ASPECT_DEFINITIONS, AspectType } from './westernAspects.js';

export interface SynastryAspect {
  planetA: string;
  planetB: string;
  aspectType: AspectType;
  exactAngle: number;
  actualAngle: number;
  orb: number;
  nature: 'Harmonious' | 'Dynamic' | 'Neutral' | 'Adjustment';
  theme: string;
}

export interface SynastryReport {
  personA: { name: string; sunSign: string; moonSign: string; ascendantSign: string };
  personB: { name: string; sunSign: string; moonSign: string; ascendantSign: string };
  interAspects: SynastryAspect[];
  resonanceMetrics: {
    harmoniousScore: number;
    dynamicGrowthScore: number;
    chemistryScore: number;
    communicationScore: number;
    compositeSummary: string;
  };
  disclaimer: string;
}

export class WesternSynastryEngine {
  public static compareCharts(
    chartA: WesternChartOutput,
    nameA: string,
    chartB: WesternChartOutput,
    nameB: string
  ): SynastryReport {
    const interAspects: SynastryAspect[] = [];
    let harmoniousCount = 0;
    let dynamicCount = 0;
    let chemistryCount = 0;
    let communicationCount = 0;

    for (const pA of chartA.planets) {
      for (const pB of chartB.planets) {
        const diff = calculateAngularDifference(pA.longitude, pB.longitude);
        for (const def of ASPECT_DEFINITIONS) {
          const orb = Math.abs(diff - def.angle);
          if (orb <= def.defaultOrb) {
            let theme = pA.name + ' ' + def.type + ' ' + pB.name;
            if (def.nature === 'Harmonious') harmoniousCount++;
            if (def.nature === 'Dynamic') dynamicCount++;
            if ((pA.name === 'Venus' && pB.name === 'Mars') || (pA.name === 'Mars' && pB.name === 'Venus') || (pA.name === 'Sun' && pB.name === 'Moon') || (pA.name === 'Moon' && pB.name === 'Sun')) {
              chemistryCount++;
              theme += ' (Core Magnetic Chemistry)';
            }
            if (pA.name === 'Mercury' || pB.name === 'Mercury') {
              communicationCount++;
              theme += ' (Intellectual Exchange)';
            }
            interAspects.push({
              planetA: nameA + '\'s ' + pA.name,
              planetB: nameB + '\'s ' + pB.name,
              aspectType: def.type,
              exactAngle: def.angle,
              actualAngle: Number(diff.toFixed(2)),
              orb: Number(orb.toFixed(2)),
              nature: def.nature,
              theme
            });
          }
        }
      }
    }
    const totalAspects = Math.max(1, interAspects.length);
    const harmoniousScore = Math.min(98, Math.round((harmoniousCount / totalAspects) * 100) + 20);
    const dynamicGrowthScore = Math.min(95, Math.round((dynamicCount / totalAspects) * 100) + 15);
    const chemistryScore = Math.min(99, Math.round((chemistryCount / 4) * 50) + 40);
    const communicationScore = Math.min(95, Math.round((communicationCount / 4) * 45) + 45);
    return {
      personA: {
        name: nameA,
        sunSign: chartA.planets.find(p => p.name === 'Sun')?.sign || 'Aries',
        moonSign: chartA.planets.find(p => p.name === 'Moon')?.sign || 'Aries',
        ascendantSign: chartA.angles.ascendant.sign
      },
      personB: {
        name: nameB,
        sunSign: chartB.planets.find(p => p.name === 'Sun')?.sign || 'Aries',
        moonSign: chartB.planets.find(p => p.name === 'Moon')?.sign || 'Aries',
        ascendantSign: chartB.angles.ascendant.sign
      },
      interAspects,
      resonanceMetrics: {
        harmoniousScore,
        dynamicGrowthScore,
        chemistryScore,
        communicationScore,
        compositeSummary: 'Calculated ' + interAspects.length + ' cross-chart astrological inter-aspects. High mutual engagement identified across emotional and mental archetypes.'
      },
      disclaimer: 'Synastry reports represent traditional astrological archetypes and symbolic relationship patterns for reflective exploration. They are not psychological assessments or deterministic guarantees of interpersonal compatibility.'
    };
  }
}