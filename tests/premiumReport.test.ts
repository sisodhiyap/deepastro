import { describe, it, expect } from 'vitest';
import { VedicAstroEngine, BirthProfileInput } from '../server/src/astrology/VedicAstroEngine.js';
import { ReportDataAdapter } from '../server/src/reports/PremiumKundliReportGenerator/ReportDataAdapter.js';
import { PDFQualityValidator } from '../server/src/reports/PremiumKundliReportGenerator/PDFQualityValidator.js';
import { ReportComposer } from '../server/src/reports/PremiumKundliReportGenerator/ReportComposer.js';
import { PremiumPDFRenderer } from '../server/src/reports/PremiumKundliReportGenerator/PremiumPDFRenderer.js';

describe('Premium Janam Kundli — My Life Blueprint Generator', () => {
  const testInput: BirthProfileInput = {
    name: 'Aarav Mehta',
    birthDate: '1996-08-14',
    birthTime: '07:42',
    birthPlace: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    gender: 'Male',
  };

  it('correctly adapts deterministic Vedic engine data to canonical KundliReport format', () => {
    const kundli = VedicAstroEngine.calculateKundli(testInput);
    const report = ReportDataAdapter.adapt(testInput, 'north');

    // Profile checks
    expect(report.profile.name).toBe('Aarav Mehta');
    expect(report.snapshot.ascendantSign).toContain(kundli.ascendant.details.signName);
    expect(report.snapshot.moonSign).toContain(kundli.moonSign.signName);
    expect(report.snapshot.nakshatra).toBe(kundli.moonNakshatra.name);

    // Snapshot Kootas & Panchang
    expect(report.snapshot.tithi).toBeDefined();
    expect(report.snapshot.vashya).toBeDefined();
    expect(report.snapshot.yoni).toBeDefined();
    expect(report.snapshot.nadi).toBeDefined();

    // 9 Planets
    expect(report.planets).toHaveLength(9);
    const planetNames = report.planets.map((p) => p.name);
    expect(planetNames).toContain('Sun');
    expect(planetNames).toContain('Moon');
    expect(planetNames).toContain('Mars');
    expect(planetNames).toContain('Mercury');
    expect(planetNames).toContain('Jupiter');
    expect(planetNames).toContain('Venus');
    expect(planetNames).toContain('Saturn');
    expect(planetNames).toContain('Rahu');
    expect(planetNames).toContain('Ketu');

    // 12 Houses
    expect(report.houses).toHaveLength(12);
    expect(report.houses[0].houseNumber).toBe(1);
    expect(report.houses[11].houseNumber).toBe(12);

    // Yogas & Doshas
    expect(report.yogas.length).toBeGreaterThanOrEqual(1);
    expect(report.doshas.length).toBeGreaterThanOrEqual(1);
    report.doshas.forEach((d) => {
      expect(['PRESENT', 'NOT PRESENT', 'INCONCLUSIVE', 'ABSENT']).toContain(d.status);
    });

    // Dasha & Forecasts
    expect(report.activeDasha.currentMahadasha).toBe(kundli.dashas.currentMahadasha.planet);
    expect(report.tenYearForecast.length).toBeGreaterThan(0);

    // Numerology
    expect(report.numerology.lifePath.number).toBeGreaterThanOrEqual(1);
    expect(report.numerology.destinyName.number).toBeGreaterThanOrEqual(1);

    // Action Plan / Blueprint
    expect(report.finalBlueprint.topActionsForYearAhead).toHaveLength(3);
    expect(report.whatToDoAndAvoid.whatToDo.length).toBeGreaterThanOrEqual(3);
    expect(report.whatToDoAndAvoid.whatToAvoid.length).toBeGreaterThanOrEqual(3);
  });

  it('validates layout, data, logic, and safety via PDFQualityValidator', () => {
    const composed = ReportComposer.compose(testInput, 'north');
    const validationResult = PDFQualityValidator.validate(composed.report);

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toHaveLength(0);
    expect(validationResult.metrics.pageCount).toBe(5);
    expect(validationResult.metrics.planetsCount).toBe(9);
    expect(validationResult.metrics.housesCount).toBe(12);
  });

  it('blocks safety violations, guaranteed claims, and fatalistic predictions', () => {
    const composed = ReportComposer.compose(testInput, 'north');

    // Simulate unsafe fatalistic content
    const badReport = JSON.parse(JSON.stringify(composed.report));
    badReport.finalBlueprint.executiveSummary = 'This chart guarantees financial ruin and death prediction.';

    const result = PDFQualityValidator.validate(badReport);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.issues.some((i) => i.category === 'SAFETY')).toBe(true);
  });

  it('blocks raw LLM reasoning chain (<think>) from entering reports', () => {
    const composed = ReportComposer.compose(testInput, 'north');

    const thinkReport = JSON.parse(JSON.stringify(composed.report));
    thinkReport.houses[0].insight = '<think>I should tell the user about their lagna</think> Great leadership.';

    const result = PDFQualityValidator.validate(thinkReport);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.message.includes('<think>'))).toBe(true);
  });

  it('mathematically renders North Indian SVG chart without hardcoded coordinates', () => {
    const kundli = VedicAstroEngine.calculateKundli(testInput);
    const chartSvg = ReportComposer.generateNorthIndianSvg(kundli.ascendant.details.signIndex, kundli.planets);

    expect(chartSvg).toContain('<svg');
    expect(chartSvg).toContain('viewBox="0 0 400 400"');
    // Gold diamond borders
    expect(chartSvg).toContain('stroke="#D4AF37"');
    // Lagna sign and Asc label
    expect(chartSvg).toContain('Asc');
  });

  it('renders exact 5-page luxury HTML publication matching visual specification', () => {
    const composed = ReportComposer.compose(testInput, 'north');
    const html = PremiumPDFRenderer.renderHtml(composed.report);

    expect(composed.validation.isValid).toBe(true);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('MY LIFE BLUEPRINT');
    expect(html).toContain('Aarav Mehta');
    // Exact 5 pages
    expect(html).toContain('PAGE 01 / 05');
    expect(html).toContain('PAGE 02 / 05');
    expect(html).toContain('PAGE 03 / 05');
    expect(html).toContain('PAGE 04 / 05');
    expect(html).toContain('PAGE 05 / 05');
    // 12 Numbered section badges
    expect(html).toContain('class="sec-num"');
    expect(html).toContain('>1</span>');
    expect(html).toContain('BIRTH PROFILE &amp; KUNDLI SNAPSHOT');
    expect(html).toContain('>2</span>');
    expect(html).toContain('RASHI KUNDLI');
    expect(html).toContain('>12</span>');
    expect(html).toContain('FINAL PERSONAL BLUEPRINT');
  });

  it('enforces strict data parity between engine calculations and report representations', () => {
    const kundli = VedicAstroEngine.calculateKundli(testInput);
    const composed = ReportComposer.compose(testInput, 'north');
    const rep = composed.report;

    // Lagna parity
    expect(rep.snapshot.ascendantSign).toContain(kundli.ascendant.details.signName);

    // Moon Rashi parity
    expect(rep.snapshot.moonSign).toContain(kundli.moonSign.signName);

    // Moon Nakshatra parity
    expect(rep.snapshot.nakshatra).toBe(kundli.moonNakshatra.name);

    // Dasha parity
    expect(rep.activeDasha.currentMahadasha).toBe(kundli.dashas.currentMahadasha.planet);
    expect(rep.activeDasha.currentAntardasha).toBe(kundli.dashas.currentAntardasha.planet);

    // 9 Planets parity
    kundli.planets.forEach((p) => {
      const repPlanet = rep.planets.find((rp) => rp.name === p.name);
      expect(repPlanet).toBeDefined();
      expect(repPlanet?.signName).toBe(p.signName);
      expect(repPlanet?.house).toBe(p.house);
    });
  });
});
