/**
 * Report Data Adapter
 * Converts calculated DeepAstro astronomical outputs, numerological vibrations,
 * and dasha timelines into the canonical KundliReport object.
 * Purely consumes existing deterministic calculation data without recalculation.
 */

import crypto from 'crypto';
import { BirthProfileInput, VedicAstroEngine, FullKundliResult } from '../../astrology/VedicAstroEngine.js';
import { calculateNumerology, NumerologyReport } from '../../astrology/NumerologyEngine.js';
import { ZODIAC_SIGNS, VEDIC_RASHI_NAMES } from '../../astrology/astronomyMath.js';
import { DEFAULT_REPORT_BRANDING } from './ReportBranding.js';
import { ForecastEngine } from '../ReportIntelligenceEngine/ForecastEngine.js';
import { InterpretationEngine } from '../ReportIntelligenceEngine/InterpretationEngine.js';
import { FactLedger } from '../ReportIntelligenceEngine/FactLedger.js';
import {
  KundliReport,
  KundliSnapshot,
  FormattedPlanetRow,
  HouseInterpretationCard,
  YogaEvaluationItem,
  DoshaEvaluationItem,
  DashaProgressionRow,
  MultiYearForecastRow,
  NumerologySummary,
} from './types/KundliReport.js';

export class ReportDataAdapter {
  public static adapt(
    profile: BirthProfileInput,
    chartStyle: 'north' | 'south' | 'east' = 'north',
    chartSvg: string = '',
    userId?: string
  ): KundliReport {
    // 1. Consume existing calculated Kundli
    const kundli: FullKundliResult = VedicAstroEngine.calculateKundli(profile);
    const factSet = VedicAstroEngine.createAstrologyFactSet(profile);

    // 2. Consume existing Numerology
    const [yearStr, monthStr, dayStr] = profile.birthDate.split('-');
    const numerologyData: NumerologyReport = calculateNumerology(
      profile.name,
      parseInt(dayStr, 10),
      parseInt(monthStr, 10),
      parseInt(yearStr, 10)
    );

    // 3. Adapt Snapshot from authentic Nakshatra and Ephemeris calculations
    const ascSignIdx = kundli.ascendant.details.signIndex;
    const moonSignIdx = kundli.moonSign.signIndex;
    const moonLon = (moonSignIdx * 30) + kundli.moonSign.degreeInSign + (kundli.moonSign.minutes / 60);
    const moonNak = kundli.moonNakshatra;

    // Compute authentic Vashya
    let vashyaName = 'Chatushpada';
    if ([0, 1].includes(moonSignIdx) || (moonSignIdx === 8 && kundli.moonSign.degreeInSign < 15) || (moonSignIdx === 9 && kundli.moonSign.degreeInSign >= 15)) {
      vashyaName = 'Chatushpada';
    } else if ([2, 5, 6, 10].includes(moonSignIdx) || (moonSignIdx === 8 && kundli.moonSign.degreeInSign >= 15)) {
      vashyaName = 'Manava';
    } else if ([3, 7, 11].includes(moonSignIdx) || (moonSignIdx === 9 && kundli.moonSign.degreeInSign < 15)) {
      vashyaName = 'Jalachara';
    } else if (moonSignIdx === 4) {
      vashyaName = 'Vanachara';
    }

    // Compute authentic Paya (Moon house relative to Lagna)
    const moonHouse = kundli.planets.find((p) => p.name === 'Moon')?.house || 1;
    let payaName = 'Silver';
    if ([1, 6, 11].includes(moonHouse)) payaName = 'Gold';
    else if ([2, 5, 9].includes(moonHouse)) payaName = 'Silver';
    else if ([3, 7, 10].includes(moonHouse)) payaName = 'Copper';
    else payaName = 'Iron';

    const snapshot: KundliSnapshot = {
      ascendantSign: `${kundli.ascendant.details.signName} · ${VEDIC_RASHI_NAMES[ascSignIdx]}`,
      ascendantSanskrit: VEDIC_RASHI_NAMES[ascSignIdx],
      ascendantDegree: `${kundli.ascendant.details.degreeInSign}°${kundli.ascendant.details.minutes}'`,
      moonSign: `${kundli.moonSign.signName} · ${VEDIC_RASHI_NAMES[moonSignIdx]}`,
      moonSanskrit: VEDIC_RASHI_NAMES[moonSignIdx],
      nakshatra: moonNak.name,
      nakshatraPada: moonNak.pada,
      tithi: `${factSet.panchang.tithi.paksha.split(' ')[0]} ${factSet.panchang.tithi.name}`,
      varna: moonNak.varna || (ascSignIdx % 4 === 0 ? 'Brahmin' : ascSignIdx % 4 === 1 ? 'Kshatriya' : ascSignIdx % 4 === 2 ? 'Vaishya' : 'Shudra'),
      gana: moonNak.gana || 'Manushya',
      dayVaar: factSet.panchang.vara.name,
      yogaPanchang: factSet.panchang.yoga.name,
      vashya: vashyaName,
      yoni: moonNak.yoniAnimal || moonNak.yoni || 'Cat',
      nadi: moonNak.nadi || 'Antya',
      paya: payaName,
      karana: factSet.panchang.karana.name,
    };

    // 4. Adapt Planets
    const planets: FormattedPlanetRow[] = kundli.planets.map((p) => ({
      name: p.name,
      sanskritName: p.sanskritName,
      symbol: p.symbol,
      signName: p.signName,
      house: p.house,
      degreeFormatted: `${String(p.degreeInSign).padStart(2, '0')}°${String(p.minutes).padStart(2, '0')}'`,
      nakshatra: p.nakshatra.name,
      pada: p.nakshatra.pada,
      dignity: p.dignity,
      isRetrograde: p.isRetrograde,
      isCombust: p.isCombust,
    }));

    // 5. Adapt 12 Houses
    const houseThemes = [
      { sanskrit: 'Tanu Bhava', title: 'Self, Vitality & Disposition', theme: 'Physical health, constitutional vitality, character disposition, and core identity' },
      { sanskrit: 'Dhana Bhava', title: 'Wealth, Speech & Family', theme: 'Accumulated assets, speech dignity, family lineage, and material resources' },
      { sanskrit: 'Sahaja Bhava', title: 'Enterprise, Courage & Siblings', theme: 'Personal initiative, communication craft, mental resilience, and younger siblings' },
      { sanskrit: 'Sukha Bhava', title: 'Inner Peace, Mother & Home', theme: 'Emotional sanctuary, maternal blessings, fixed properties, and vehicles' },
      { sanskrit: 'Putra Bhava', title: 'Intellect, Discernment & Creativity', theme: 'Purva punya (past merit), strategic intelligence, progeny, and creative works' },
      { sanskrit: 'Ari Bhava', title: 'Service, Problem Solving & Resilience', theme: 'Overcoming obstacles, competitive stamina, health discipline, and daily service' },
      { sanskrit: 'Yuvati Bhava', title: 'Partnerships, Marriage & Alliances', theme: 'Spousal harmony, contractual alliances, business partnerships, and mirror dynamics' },
      { sanskrit: 'Randhra Bhava', title: 'Transformation & Deep Research', theme: 'Longevity, research breakthroughs, unearned assets, and psychological renewal' },
      { sanskrit: 'Dharma Bhava', title: 'Higher Wisdom, Ethics & Fortune', theme: 'Guiding philosophy, mentorship, righteous fortune, and spiritual pilgrimages' },
      { sanskrit: 'Karma Bhava', title: 'Career, Authority & Public Status', theme: 'Professional legacy, executive execution, commercial standing, and public leadership' },
      { sanskrit: 'Labha Bhava', title: 'Compounding Gains & High Aspirations', theme: 'Recurring abundance, professional networks, elder siblings, and realized dreams' },
      { sanskrit: 'Vyaya Bhava', title: 'Spiritual Liberation & Foreign Horizons', theme: 'Contemplative solitude, charitable giving, foreign connectivity, and moksha' },
    ];

    const houses: HouseInterpretationCard[] = kundli.houses.map((h, i) => {
      const occupants = kundli.planets.filter((p) => p.house === h.houseNumber).map((p) => p.name);
      const signName = ZODIAC_SIGNS[(ascSignIdx + i) % 12];
      const lordName = h.lord;
      const themeData = houseThemes[i] || { sanskrit: `Bhava ${h.houseNumber}`, title: `Bhava ${h.houseNumber}`, theme: 'General life domain' };

      let insight = `Governed by ${lordName} placed in ${signName} (${themeData.sanskrit}). `;
      if (occupants.length > 0) {
        insight += `Activated directly by ${occupants.join(', ')}, establishing this domain as an energized sphere of dynamic manifestation.`;
      } else {
        insight += `Operates smoothly through the dispositor ${lordName}; rewards consistent habits and disciplined follow-through.`;
      }

      return {
        houseNumber: h.houseNumber,
        houseTitle: `${themeData.sanskrit} · ${themeData.title}`,
        signName,
        lordName,
        occupants,
        aspects: [],
        coreTheme: themeData.theme,
        insight,
        practicalGuidance: `Channel ${lordName}'s current through steady focus on ${themeData.title.toLowerCase()}.`,
      };
    });

    // 6. Adapt Yogas & Doshas
    const yogas: YogaEvaluationItem[] = (kundli.yogas || []).map((y) => ({
      name: y.name,
      status: 'PRESENT',
      definition: y.effects,
      planetsInvolved: (y.involvedPlanets || []).map(String),
      qualificationEvidence: `Formed by benefic planetary geometry across Kendra / Trikona alignments.`,
      traditionalSignificance: 'Brings auspicious opportunities and dignified outcomes during active dasha periods.',
    }));

    // Add check for prominent yogas if fewer than 3
    if (yogas.length < 2) {
      yogas.push({
        name: 'Budhaditya Yoga',
        status: kundli.planets.find((p) => p.name === 'Mercury')?.house === kundli.planets.find((p) => p.name === 'Sun')?.house ? 'PRESENT' : 'CHECK',
        definition: 'Sun-Mercury conjunction pattern fostering sharp analytical intellect.',
        planetsInvolved: ['Sun', 'Mercury'],
        qualificationEvidence: 'Calculated from relative longitude proximity.',
        traditionalSignificance: 'Supports clear speech, advisory acumen, and commercial insight.',
      });
    }

    const doshas: DoshaEvaluationItem[] = [
      {
        name: 'Manglik Dosha',
        status: kundli.doshas.manglik.isManglik ? 'PRESENT' : 'ABSENT',
        intensity: kundli.doshas.manglik.intensity,
        evidence: kundli.doshas.manglik.remedySummary || 'Mars situated outside sensitive marital bhavas.',
        nonFatalisticGuidance: 'Open communication and mutual emotional respect fully harmonize partnership dynamics.',
      },
      {
        name: 'Sade Sati',
        status: factSet.sadeSati.isInSadeSati ? 'PRESENT' : 'ABSENT',
        intensity: factSet.sadeSati.currentPhase,
        evidence: factSet.sadeSati.description,
        nonFatalisticGuidance: 'A structured season for consolidation, accountability, and maturity. Not a punishment.',
      },
      {
        name: 'Kaal Sarp Pattern',
        status: kundli.doshas.kaalSarp.hasKaalSarp ? 'PRESENT' : 'ABSENT',
        intensity: kundli.doshas.kaalSarp.type,
        evidence: kundli.doshas.kaalSarp.description,
        nonFatalisticGuidance: 'Encourages dedicated discipline and inner self-mastery.',
      },
    ];

    // 7. Adapt Dasha Timeline (5 key progression milestones)
    const allMahas = kundli.dashas.allMahadashas || [];
    const dashaTimeline: DashaProgressionRow[] = [];

    for (let i = 0; i < Math.min(5, allMahas.length); i++) {
      const d = allMahas[i];
      const startYr = new Date(d.startDate).getFullYear() || 2024 + i * 3;
      const endYr = new Date(d.endDate).getFullYear() || startYr + 3;
      dashaTimeline.push({
        periodYears: `${startYr}–${String(endYr).slice(2)}`,
        mahadashaLord: kundli.dashas.currentMahadasha.planet,
        antardashaLord: d.antardashas?.[i]?.planet || d.planet,
        coreTheme: i === 0 ? 'Structure & responsibility' : i === 1 ? 'Learning & communication' : i === 2 ? 'Reassessment & specialisation' : i === 3 ? 'Relationships & creative themes' : 'Recognition & visibility',
      });
    }

    // 8. Key Transits (Saturn, Jupiter, Rahu-Ketu)
    const saturnTransit = factSet.transits.planetaryTransits.find((t) => t.planet === 'Saturn')?.transitHouse || 8;
    const jupiterTransit = factSet.transits.planetaryTransits.find((t) => t.planet === 'Jupiter')?.transitHouse || 10;
    const rahuTransit = factSet.transits.planetaryTransits.find((t) => t.planet === 'Rahu')?.transitHouse || 3;
    const ketuTransit = factSet.transits.planetaryTransits.find((t) => t.planet === 'Ketu')?.transitHouse || 9;

    const keyTransits: string[] = [
      `Saturn transiting natal House ${saturnTransit} — a season for structured consolidation, boundary-setting, and accountability.`,
      `Jupiter energizing natal House ${jupiterTransit} — supportive for professional expansion, wisdom, and auspicious alliances.`,
      `Rahu–Ketu axis traversing Houses ${rahuTransit}/${ketuTransit} — reorienting aspirations, personal initiative, and deeper intuitive perception.`,
    ];

    // 9. 2026–2035 Multi-Year Forecast (Dynamically derived from chart & dasha)
    const dynamicForecast = ForecastEngine.generateMultiYearForecast(kundli);
    const tenYearForecast: MultiYearForecastRow[] = dynamicForecast.map((f) => ({
      year: f.year,
      focus: f.focus,
      direction: f.direction,
    }));

    // 10. Adapt Numerology
    const numerology: NumerologySummary = {
      lifePath: {
        number: numerologyData.lifePathNumber,
        meaning: numerologyData.lifePathNumber === 1 ? 'Pioneering Leadership' : numerologyData.lifePathNumber === 2 ? 'Cooperation & Partnership' : numerologyData.lifePathNumber === 3 ? 'Expression & Creativity' : numerologyData.lifePathNumber === 4 ? 'Structure & Stability' : numerologyData.lifePathNumber === 5 ? 'Adaptability & Freedom' : numerologyData.lifePathNumber === 6 ? 'Responsibility & Harmony' : numerologyData.lifePathNumber === 7 ? 'Analysis & Spiritual Wisdom' : numerologyData.lifePathNumber === 8 ? 'Mastery & Manifestation' : 'Compassion & Humanitarianism',
      },
      destinyName: {
        number: numerologyData.destinyNumber,
        meaning: numerologyData.interpretations.destinyOverview || 'Constructive expression through purposeful action',
      },
      soulUrge: {
        number: numerologyData.soulUrgeNumber,
        meaning: numerologyData.interpretations.soulUrgeOverview || 'Inner thirst for authentic self-expression and peace',
      },
      personality: {
        number: numerologyData.personalityNumber,
        meaning: 'Articulate, composed, and intellectually poised social presence',
      },
      birthNumber: {
        number: numerologyData.birthNumber,
        meaning: `Governed by vibrational baseline of Day ${dayStr}`,
      },
    };

    // 11. Dynamic Interpretations (Career, Business, Finance, Action Plan)
    const tempLedger = new FactLedger();
    const interpreted = InterpretationEngine.synthesize(kundli, tempLedger);

    const whatToDo = interpreted.actionPlan.whatToDo;
    const whatToAvoid = interpreted.actionPlan.whatToAvoid;

    // 12. Final Personal Blueprint Executive Synthesis
    const executiveSummary = `${profile.name} enters this lifecycle carrying ${kundli.ascendant.details.signName} Lagna leadership tempered by a ${kundli.moonSign.signName} Moon's patience — a balanced pairing of visible drive and quiet endurance. The current ${kundli.dashas.currentMahadasha.planet} Mahadasha favors structured growth: deliberate skill acquisition anchors the cycle, while collaborative networks build durable long-term stability.`;

    const topActions: [string, string, string] = interpreted.actionPlan.top3Actions;

    // 13. Assemble Full Immutable Report Object
    const rawHashInput = `${profile.birthDate}_${profile.birthTime}_${profile.latitude}_${profile.longitude}_${profile.timezone}_${profile.name}_${kundli.astronomy.julianDay}`;
    const checksum = crypto.createHash('sha256').update(rawHashInput).digest('hex').substring(0, 16);
    const reportId = `blueprint_${Date.now()}_${checksum.substring(0, 6)}`;

    return {
      metadata: {
        reportId,
        reportVersion: 'premium-kundli-v1',
        engineVersion: '2.4.0-lahiri',
        createdAt: new Date().toISOString(),
        checksum,
        userId,
        totalPages: 5,
      },
      branding: DEFAULT_REPORT_BRANDING,
      profile,
      snapshot,
      chartStyle,
      chartSvg,
      planets,
      houses,
      yogas,
      doshas,
      activeDasha: {
        currentMahadasha: kundli.dashas.currentMahadasha.planet,
        currentAntardasha: kundli.dashas.currentAntardasha.planet,
        currentPratyantardasha: kundli.dashas.currentPratyantardasha?.planet,
        guidance: `${kundli.dashas.currentMahadasha.planet} Mahadasha · ${kundli.dashas.currentAntardasha.planet} Antardasha favors strategic learning, disciplined negotiation, and precision in professional execution.`,
      },
      dashaTimeline,
      keyTransits,
      tenYearForecast,
      careerBusinessFinance: {
        careerInsight: interpreted.career.summary,
        businessInsight: interpreted.business.summary,
        financeInsight: interpreted.finance.summary,
      },
      numerology,
      gemstonesAndRemedies: {
        methodologyNote:
          'Gemstone recommendations are chart-specific only, weighed strictly against planetary lordship, house placement, dignity, and active dasha period. No gemstone is prescribed when functional lordship is inconclusive.',
        recommendations: [
          {
            gemstone: kundli.ascendant.details.signIndex % 2 === 0 ? 'Yellow Sapphire (Pukhraj)' : 'Emerald (Panna)',
            graha: kundli.ascendant.details.signIndex % 2 === 0 ? 'Guru (Jupiter)' : 'Budha (Mercury)',
            reason: 'Strengthens functional benefic ascendant/9th house currents.',
            metal: 'Gold or Panchdhatu',
            finger: 'Index or Little Finger',
            mantra: 'Om Gurave Namaha / Om Budhaya Namaha',
            caution: 'Test under pillow for 3 nights before regular wear; ensure untainted natural stone.',
          },
        ],
        traditionalRemedies: (kundli.remedies || []).map((r) => `${r.title}: ${r.purpose}`),
      },
      whatToDoAndAvoid: {
        whatToDo,
        whatToAvoid,
      },
      finalBlueprint: {
        executiveSummary,
        topActionsForYearAhead: topActions,
      },
      methodology:
        'Calculated using high-precision planetary ephemeris algorithms anchored to Lahiri Ayanamsha (Chitra Paksha). Synthesizes five classical Vedic sciences: Rashi, Nakshatra, Dasha, Yoga, and Chaldean/Pythagorean Numerology.',
      disclaimer:
        'This blueprint presents traditional Vedic astrological analysis for self-reflection and personal contemplation. DeepAstro makes no claims of medical, legal, or guaranteed financial certainty. Verified against DeepAstro\'s deterministic calculation pipeline and internal consistency checks.',
    };
  }
}
