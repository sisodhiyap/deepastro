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
import { KPEngine } from '../../astrology/KPEngine.js';
import { ShadbalaEngine } from '../../astrology/ShadbalaEngine.js';
import { AshtakavargaEngine } from '../../astrology/AshtakavargaEngine.js';
import { JaiminiEngine } from '../../astrology/JaiminiEngine.js';
import { EngineRegistry } from './EngineRegistry.js';
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
        } else {
          throw new Error(`CHART_NOT_FOUND: Chart ${chartId} not found.`);
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
        'PREDICTION_CONTEXT_INCOMPLETE: Complete verified Kundli parameters (birthDate, birthTime, latitude, longitude) are required to generate Future Intelligence.'
      );
    }

    // 2. Parse and normalize coordinates and timezone
    const lat = Number(rawChart.latitude);
    const lon = Number(rawChart.longitude);
    if (isNaN(lat) || isNaN(lon)) {
      throw new Error('PREDICTION_CONTEXT_INCOMPLETE: Valid latitude and longitude are strictly required.');
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

    // 4. Calculate Master Vedic Kundli & Universal FactSet via VedicAstroEngine
    const fullKundli = VedicAstroEngine.calculateKundli(birthProfileInput);
    const factSet = VedicAstroEngine.createAstrologyFactSet(birthProfileInput);

    // 4b. Multi-Engine Lineage Calculations
    const kpAnalysis = KPEngine.calculateKP(
      fullKundli.planets,
      fullKundli.ascendant,
      { isApproximateTime: birthProfileInput.isApproximateTime }
    );
    const shadbala = ShadbalaEngine.calculateShadbala(factSet);
    const ashtakavarga = AshtakavargaEngine.calculateAshtakavarga(factSet);
    const jaimini = JaiminiEngine.calculateJaimini(fullKundli.planets as any, fullKundli.ascendant as any);

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

    // 7. Extract Planetary Strengths & Dignities (enriched with Shadbala)
    const planetaryStrength: Record<string, any> = {};
    for (const p of fullKundli.planets) {
      const sh = shadbala[p.name];
      planetaryStrength[p.name] = {
        dignity: p.dignity,
        isRetrograde: p.isRetrograde,
        isCombust: p.isCombust,
        speed: p.speed,
        house: p.house,
        shadbalaScore: sh?.totalRupas || 1.0,
      };
    }

    // 8. Extract Aspects & Bhavas
    const aspects: Record<string, number[]> = {};
    const drishti: Record<string, number[]> = {};
    const planetaryDegrees: Record<string, number> = {};
    const planetarySigns: Record<string, string> = {};
    const planetaryRetrograde: Record<string, boolean> = {};
    const planetaryCombustion: Record<string, boolean> = {};
    const planetaryDignity: Record<string, string> = {};

    for (const p of fullKundli.planets) {
      aspects[p.name] = p.aspectsToHouses || [];
      drishti[p.name] = p.aspectsToHouses || [];
      planetaryDegrees[p.name] = p.degreeInSign;
      planetarySigns[p.name] = p.signName;
      planetaryRetrograde[p.name] = p.isRetrograde;
      planetaryCombustion[p.name] = p.isCombust;
      planetaryDignity[p.name] = p.dignity;
    }

    const houseLords: Record<number, string> = {};
    for (const h of fullKundli.houses) {
      houseLords[h.houseNumber] = h.lord;
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

    // 12. Build Cryptographic Data Lineage and Coverage Report
    const dataLineage = EngineRegistry.buildLineage({
      chartId: chartId || 'primary',
      userId,
      calculationFingerprint,
      calculationVersion: CalculationSnapshotService.ENGINE_VERSION,
      predictionVersion: 'FUTURE_INTELLIGENCE_V1',
      consumedEngines: [
        {
          engineId: 'D1_RASHI_ENGINE',
          engineVersion: '1.0.0-sidereal',
          inputData: { birthDate: birthProfileInput.birthDate, birthTime: birthProfileInput.birthTime, lat, lon, tz },
          outputData: fullKundli.planets.map((p) => ({ name: p.name, lon: p.siderealLongitude })),
          relevance: 'Primary concrete physical foundation for houses, planets, and baseline timing',
        },
        {
          engineId: 'TRUE_NODE_ENGINE',
          engineVersion: '1.0.0-meeus',
          inputData: { birthDate: birthProfileInput.birthDate, birthTime: birthProfileInput.birthTime },
          outputData: { rahu: rahu?.siderealLongitude, ketu: ketu?.siderealLongitude },
          relevance: 'True Node astronomical evolutionary axis',
        },
        {
          engineId: 'VIMSHOTTARI_DASHA_ENGINE',
          engineVersion: '1.0.0-vimshottari',
          inputData: { moonNakshatra: fullKundli.moonNakshatra },
          outputData: { currentMaha: fullKundli.dashas.currentMahadasha.planet, currentAnta: fullKundli.dashas.currentAntardasha.planet },
          relevance: 'Master temporal progression driver',
        },
        {
          engineId: 'VARGA_SHODASHAVARGA_ENGINE',
          engineVersion: '1.0.0-bphs',
          inputData: { planetCoordinates: fullKundli.planets.map(p => p.siderealLongitude) },
          outputData: { d9Count: d9.length, d10Count: d10.length, d60Count: d60.length },
          relevance: 'D9 relationship/dharma and D10 career authority refinement',
        },
        {
          engineId: 'KP_STELLAR_ENGINE',
          engineVersion: '1.0.0-kp',
          inputData: { isApproximateTime: birthProfileInput.isApproximateTime },
          outputData: { status: kpAnalysis.status, cuspsCount: kpAnalysis.cusps.length },
          relevance: 'Cuspal sub-lord verification and stellar significator timing',
        },
        {
          engineId: 'SHADBALA_ENGINE',
          engineVersion: '1.0.0-shadbala',
          inputData: { factSetId: factSet.id },
          outputData: Object.keys(shadbala).map(k => ({ planet: k, rupas: shadbala[k].totalRupas })),
          relevance: '6-fold BPHS planetary strength scaling',
        },
        {
          engineId: 'ASHTAKAVARGA_ENGINE',
          engineVersion: '1.0.0-ashtakavarga',
          inputData: { factSetId: factSet.id },
          outputData: { totalBindus: ashtakavarga.totalBindus, savLength: ashtakavarga.sarvashtakavarga.length },
          relevance: 'SAV transit house potency and bindu support evaluation',
        },
        {
          engineId: 'JAIMINI_ENGINE',
          engineVersion: '1.0.0-jaimini',
          inputData: { planetsCount: fullKundli.planets.length },
          outputData: { atmakaraka: jaimini.atmakaraka.planet, amatyakaraka: jaimini.amatyakaraka.planet, darakaraka: jaimini.darakaraka.planet },
          relevance: 'Chara Karaka soul and status significator confirmation',
        },
        {
          engineId: 'YOGA_ENGINE',
          engineVersion: '1.0.0-yoga',
          inputData: { planets: fullKundli.planets.length, houses: fullKundli.houses.length },
          outputData: { yogasCount: (fullKundli.yogas || []).length },
          relevance: 'Classical Raja & Dhana Yoga activation tracking',
        },
        {
          engineId: 'DOSHA_ENGINE',
          engineVersion: '1.0.0-dosha',
          inputData: { moonSign: fullKundli.moonSign.signName },
          outputData: { sadeSatiActive: fullKundli.doshas?.sadeSati?.isActive },
          relevance: 'Sade Sati & nodal cycle contextual mindfulness',
        },
        {
          engineId: 'NUMEROLOGY_ENGINE',
          engineVersion: '1.0.0-numerology',
          inputData: { birthDate: birthProfileInput.birthDate, name: birthProfileInput.name },
          outputData: { lifePath: numerologyProfile.lifePathNumber },
          relevance: 'Secondary Personal Year & Personal Month cyclic support',
        },
      ],
    });

    const engineCoverage = EngineRegistry.buildCoverageReport({
      kpStatus: kpAnalysis.status,
      hasVargas: Boolean(sv),
      hasShadbala: Boolean(shadbala),
      hasAshtakavarga: Boolean(ashtakavarga),
      hasJaimini: Boolean(jaimini),
    });

    return {
      userId,
      chartId: chartId || 'primary',
      birthDate: birthProfileInput.birthDate,
      birthTime: birthProfileInput.birthTime,
      birthPlace: birthProfileInput.birthPlace,
      latitude: birthProfileInput.latitude,
      longitude: birthProfileInput.longitude,
      timezone: birthProfileInput.timezone,
      utcOffset: tz,
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
      houseLords,
      planetaryDegrees,
      planetarySigns,
      planetaryRetrograde,
      planetaryCombustion,
      planetaryDignity,
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
      drishti,
      kpAnalysis,
      shadbala,
      ashtakavarga,
      jaimini,
      dataLineage,
      engineCoverage,
    };
  }
}

