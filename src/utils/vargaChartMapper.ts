/**
 * Varga Chart Mapping Helper
 * Canonical converter mapping divisional chart structures (D9 Navamsa, D10 Dashamsha, etc.)
 * into standardized ChartPlanet structures for SVG chart visualizers (North, South, East).
 *
 * CRITICAL RULE:
 * For any Varga chart, house assignment MUST strictly use:
 * ((planet.signIndex - vargaChart.ascendantSignIndex + 12) % 12) + 1
 * NEVER the D1 Ascendant.
 */

import { ChartPlanet, VargaChart, VargaPlanet } from '../types/astrology.js';

export function mapVargaChartToChartPlanets(
  vargaChart: {
    ascendantSignIndex: number;
    planets: Array<VargaPlanet | { planet?: string; name?: string; signIndex: number; houseInVarga?: number; isVargottama?: boolean; isRetrograde?: boolean; isCombust?: boolean }>;
  } | undefined | null,
  basePlanets: Array<{
    name: string;
    symbol?: string;
    isRetrograde?: boolean;
    isCombust?: boolean;
    signIndex?: number;
    degreeInSign?: number;
  }> = []
): ChartPlanet[] {
  if (!vargaChart || !vargaChart.planets || !Array.isArray(vargaChart.planets)) {
    return [];
  }

  const ascSign = Number(vargaChart.ascendantSignIndex);

  return vargaChart.planets.map((vp) => {
    const rawName = (vp as any).planet || (vp as any).name || '';
    const base = basePlanets.find((b) => b.name.toLowerCase() === rawName.toLowerCase());

    const signIdx = Number(vp.signIndex);
    // House calculation relative to the specific Varga chart Ascendant
    const house = ((signIdx - ascSign + 12) % 12) + 1;

    return {
      name: rawName,
      symbol: base?.symbol || rawName.substring(0, 2),
      house,
      signIndex: signIdx,
      isRetrograde: (vp as any).isRetrograde !== undefined ? (vp as any).isRetrograde : (base?.isRetrograde ?? false),
      isCombust: (vp as any).isCombust !== undefined ? (vp as any).isCombust : (base?.isCombust ?? false),
      degreeInSign: (vp as any).degreeInVarga !== undefined ? (vp as any).degreeInVarga : base?.degreeInSign,
    };
  });
}
