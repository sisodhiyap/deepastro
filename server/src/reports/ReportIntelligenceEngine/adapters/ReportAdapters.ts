/**
 * Multi-Channel Report Adapters
 * Renders the single canonical DeepAstroReport / KundliReport across
 * Web, Mobile App, AstroBot Chat, and PDF channels without re-calculating astrology.
 */

import { KundliReport } from '../../PremiumKundliReportGenerator/types/KundliReport.js';

export class PDFReportAdapter {
  public static adaptForPdf(report: KundliReport) {
    return {
      pageSize: 'A4',
      orientation: 'portrait',
      totalPages: report.metadata.totalPages,
      printReadyHtml: true,
      report,
    };
  }
}

export class WebReportAdapter {
  public static adaptForWeb(report: KundliReport) {
    return {
      nativeName: report.profile.name,
      lagna: report.snapshot.ascendantSign,
      rashi: report.snapshot.moonSign,
      nakshatra: report.snapshot.nakshatra,
      currentDasha: `${report.activeDasha.currentMahadasha} / ${report.activeDasha.currentAntardasha}`,
      summary: report.finalBlueprint.executiveSummary,
      topActions: report.finalBlueprint.topActionsForYearAhead,
      planetsCount: report.planets.length,
      housesCount: report.houses.length,
      yogas: report.yogas.filter((y) => y.status === 'PRESENT').map((y) => y.name),
      tenYearForecast: report.tenYearForecast,
      webInteractiveReady: true,
    };
  }
}

export class MobileReportAdapter {
  public static adaptForMobile(report: KundliReport) {
    return {
      compactProfile: {
        name: report.profile.name,
        dob: report.profile.birthDate,
        ascendant: report.snapshot.ascendantSign,
        moon: report.snapshot.moonSign,
      },
      currentCycle: {
        mahadasha: report.activeDasha.currentMahadasha,
        antardasha: report.activeDasha.currentAntardasha,
        guidance: report.activeDasha.guidance,
      },
      dailyFocusPills: report.whatToDoAndAvoid.whatToDo.slice(0, 3),
      cautionsPills: report.whatToDoAndAvoid.whatToAvoid.slice(0, 3),
      top3Priorities: report.finalBlueprint.topActionsForYearAhead,
      mobileCardsCount: 5,
    };
  }
}

export class AstroBotReportAdapter {
  public static adaptForAstroBot(report: KundliReport): string {
    const verifiedLagna = report.snapshot.ascendantSign;
    const verifiedMoon = report.snapshot.moonSign;
    const verifiedDasha = `${report.activeDasha.currentMahadasha} Mahadasha · ${report.activeDasha.currentAntardasha} Antardasha`;

    return `
[Verified DeepAstro Fact Profile]
Native: ${report.profile.name}
Lagna (Ascendant): ${verifiedLagna}
Chandra (Moon Sign): ${verifiedMoon}
Current Dasha: ${verifiedDasha}
Key Yogas: ${report.yogas.filter((y) => y.status === 'PRESENT').map((y) => y.name).join(', ')}
Executive Focus: ${report.finalBlueprint.executiveSummary}
Immediate Action Priorities:
1. ${report.finalBlueprint.topActionsForYearAhead[0]}
2. ${report.finalBlueprint.topActionsForYearAhead[1]}
3. ${report.finalBlueprint.topActionsForYearAhead[2]}
`.trim();
  }
}
