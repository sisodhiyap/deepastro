/**
 * ChartContextResolver.ts
 * Authoritative resolver for CanonicalPredictionContext.
 * Loads the user's selected canonical Kundli snapshot and deterministically extracts:
 * D1-D60, True Node, Nakshatras, Dashas, Numerology, Yogas, and Planetary Strengths.
 */

import { CanonicalPredictionContext } from './types.js';
import { VedicAstroEngine, BirthProfileInput } from '../../astrology/VedicAstroEngine.js';
import { CalculationSnapshotService } from '../../services/CalculationSnapshotService.js';
import { birthProfileRepository } from '../../database/repositories/BirthProfileRepository.js';
import { futureIntelligenceRepository } from '../../database/repositories/FutureIntelligenceRepository.js';
import { calculateNumerology } from '../../astrology/NumerologyEngine.js';
import { db } from '../../database/db.js';
import { AuthBootstrapService } from '../../services/AuthBootstrapService.js';

export class ChartContextResolver {
  public static async resolve(
    userId: string,
    chartId: string = 'primary',
    targetEvaluationDate: Date = new Date()
  ): Promise<CanonicalPredictionContext> {
    if (!userId) {
      throw new Error('AUTH_REQUIRED: A valid authenticated user is required to resolve prediction context.');
    }

    // 1. Resolve Raw Profile by chartId
    let rawChart: any = null;

    if (chartId && chartId !== 'primary') {
      // Look up specific saved chart
      rawChart = await futureIntelligenceRepository.getSavedChartById(chartId, userId);
      if (!rawChart) {
        // Fallback: Check birthProfileRepository by ID
        const bp = await birthProfileRepository.getProfileByUserId(userId);
        if (bp && bp.id === chartId) {
          rawChart = bp;
        }
      }
    }

    if (!rawChart) {
      // Resolve Primary User Profile
      const primaryRes = await CalculationSnapshotService.getCanonicalBirthProfile(userId);
      if (primaryRes.isValid && primaryRes.profile) {
        rawChart = primaryRes.profile;
      } else {
        const bp = (await AuthBootstrapService.getBirthProfile(userId)) ||
                    (await birthProfileRepository.getProfileByUserId(userId)) ||
                    db.getBirthProfile(userId);
        if (bp && bp.birthDate && bp.birthTime) {
          rawChart = bp;
        }
      }
    }

    if (!rawChart || !rawChart.birthDate || !rawChart.birthTime) {
      throw new Error(
        'CHART_NOT_FOUND: Complete verified Kundli parameters (birthDate, birthTime, latitude, longitude) are required to generate Future Intelligence.'
      );
    }

    // 2. Parse and normalize coordinates and timezone
    const lat = Number(rawChart.latitude);
    const lon = Number(rawChart.longitude);
    if (isNaN(lat) || isNaN(lon)) {
      throw new Error('INVALID_COORDINATES: Valid latitude and longitude are strictly required.');
    }

    let tz = 5.5;
    if (typeof rawChart.timezone === 'number') tz = rawChart.timezone;
    else if (typeof rawChart.timezone === 'string') {
      const parsed = parseFloat(rawChart.timezone);
      tz = isNaN(parsed) ? 5.5 : parsed;
    }

    const birthProfileInput: BirthProfileInput = {
      name: rawChart.name || rawChart.fullName || 'Cosmic Native',
      birthDate: String(rawChart.birthDate).trim(),
      birthTime: String(rawChart.birthTime).trim().slice(0, 5),
      birthPlace: rawChart.birthPlace || 'Calculated Coordinates',
      latitude: lat,
      longitude: lon,
      timezone: tz,
      gender: rawChart.gender || 'Other',
      isApproximateTime: Boolean(rawChart.isApproximateTime),
    };

    // 3. Compute Deterministic Calculation Fingerprint
    const calculationFingerprint = CalculationSnapshotService.generateFingerprint(
      birthProfileInput,
      'Lahiri'
    );

    // 4. Calculate Master Vedic Kundli via VedicAstroEngine
    const fullKundli = VedicAstroEngine.calculateKundli(birthProfileInput);

    // 5. Extract True Node
    const rahu = fullKundli.planets.find((p) => p.name === 'Rahu');
    const ketu = fullKundli.planets.find((p) => p.name === 'Ketu');
    const trueNode = {
      rahuLon: rahu?.siderealLongitude || 0,
      ketuLon: ketu?.siderealLongitude || 180,
      isRetrograde: rahu?.isRetrograde ?? true,
      speed: rahu?.speed || -0.05,
      nodeModel: 'TRUE_NODE' as const,
    };

    // 6. Extract Nakshatras and Padas
    const nakshatras: Record<string, any> = {};
    const padas: Record<string, number> = {};
    for (const p of fullKundli.planets) {
      nakshatras[p.name] = p.nakshatra;
      padas[p.name] = p.nakshatra?.pada || 1;
    }

    // 7. Extract Planetary Strengths & Dignities
    const planetaryStrength: Record<string, any> = {};
    for (const p of fullKundli.planets) {
      planetaryStrength[p.name] = {
        dignity: p.dignity,
        isRetrograde: p.isRetrograde,
        isCombust: p.isCombust,
        speed: p.speed,
        house: p.house,
      };
    }

    // 8. Extract Aspects
    const aspects: Record<string, number[]> = {};
    for (const p of fullKundli.planets) {
      aspects[p.name] = p.aspectsToHouses || [];
    }

    // 9. Compute Numerology Profile dynamically from birth date
    const [bYear, bMonth, bDay] = birthProfileInput.birthDate.split('-').map(Number);
    const numerologyProfile = calculateNumerology(
      birthProfileInput.name,
      bDay || 1,
      bMonth || 1,
      bYear || 1990
    );

    // 10. Extract Shodashavargas (D1 to D60)
    const sv = fullKundli.shodashvargas;
    const vargas = fullKundli.vargas;

    const d1 = fullKundli.planets;
    const d9 = sv?.d9_navamsa || (vargas as any)?.d9_navamsa || [];
    const d10 = sv?.d10_dashamsha || (vargas as any)?.d10_dashamsha || [];
    const d12 = sv?.d12_dwadashamsha || [];
    const d16 = sv?.d16_shodashamsha || [];
    const d20 = sv?.d20_vimshamsha || [];
    const d24 = sv?.d24_chaturvimshamsha || [];
    const d27 = sv?.d27_saptavimshamsha || [];
    const d30 = sv?.d30_trimshamsha || [];
    const d40 = sv?.d40_khavedamsha || [];
    const d45 = sv?.d45_akshavedamsha || [];
    const d60 = sv?.d60_shashtiamsha || [];

    // 11. Ascendant
    const ascSignIndex = Math.floor(fullKundli.ascendant.degrees / 30);
    const ascendant = {
      degrees: fullKundli.ascendant.degrees,
      signIndex: ascSignIndex,
      signName: fullKundli.ascendant.details.signName,
      nakshatra: fullKundli.ascendant.nakshatra,
    };

    return {
      userId,
      chartId: chartId || 'primary',
      birthDate: birthProfileInput.birthDate,
      birthTime: birthProfileInput.birthTime,
      birthPlace: birthProfileInput.birthPlace,
      latitude: birthProfileInput.latitude,
      longitude: birthProfileInput.longitude,
      timezone: birthProfileInput.timezone,
      ayanamsha: 'Lahiri (Chitra Paksha)',
      calculationVersion: CalculationSnapshotService.ENGINE_VERSION,
      calculationFingerprint,
      d1,
      d9,
      d10,
      d12,
      d16,
      d20,
      d24,
      d27,
      d30,
      d40,
      d45,
      d60,
      allVargas: sv,
      planetaryPositions: fullKundli.planets,
      houses: fullKundli.houses,
      nakshatras,
      padas,
      ascendant,
      trueNode,
      currentMahadasha: fullKundli.dashas.currentMahadasha,
      currentAntardasha: fullKundli.dashas.currentAntardasha,
      currentPratyantardasha: fullKundli.dashas.currentPratyantardasha,
      numerologyProfile,
      yogas: fullKundli.yogas || [],
      doshas: fullKundli.doshas || { manglik: { isManglik: false }, kaalSarp: { hasKaalSarp: false }, sadeSati: { isSadeSati: false }, pitraDosha: { hasPitraDosha: false } } as any,
      planetaryStrength,
      aspects,
    };
  }
}
