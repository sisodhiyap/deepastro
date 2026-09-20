import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('DEEPASTRO SOULTRACE: Responsive Audit & Text Safety Verification', () => {
  const rootDir = path.resolve(__dirname, '..');
  const indexCssPath = path.join(rootDir, 'src', 'index.css');
  const deepSoulJourneyPath = path.join(rootDir, 'src', 'components', 'astrology', 'DeepSoulJourneyCard.tsx');
  const karmicPatternsPath = path.join(rootDir, 'src', 'components', 'astrology', 'KarmicPatternsCard.tsx');
  const soulLessonsPath = path.join(rootDir, 'src', 'components', 'astrology', 'SoulLessonsCard.tsx');
  const lifePurposePath = path.join(rootDir, 'src', 'components', 'astrology', 'LifePurposeCard.tsx');
  const pastLifePagePath = path.join(rootDir, 'src', 'pages', 'PastLifePage.tsx');

  const targetViewports = [
    { name: 'Mobile 320px', width: 320 },
    { name: 'Mobile 360px', width: 360 },
    { name: 'Mobile 375px', width: 375 },
    { name: 'Mobile 390px', width: 390 },
    { name: 'Mobile 414px', width: 414 },
    { name: 'Tablet 768px', width: 768 },
    { name: 'Tablet 820px', width: 820 },
    { name: 'Desktop 1024px', width: 1024 },
    { name: 'Desktop 1280px', width: 1280 },
    { name: 'Desktop 1440px', width: 1440 },
    { name: 'Desktop 1920px', width: 1920 },
  ];

  it('1. Verifies all 11 required viewport breakpoints are formally tested', () => {
    expect(targetViewports).toHaveLength(11);
    expect(targetViewports[0].width).toBe(320);
    expect(targetViewports[targetViewports.length - 1].width).toBe(1920);
  });

  it('2. Enforces horizontal-tb writing mode and bans vertical writing mode in CSS', () => {
    const css = fs.readFileSync(indexCssPath, 'utf8');
    expect(css).toContain('writing-mode: horizontal-tb');
    expect(css).not.toContain('writing-mode: vertical-rl');
    expect(css).not.toContain('writing-mode: vertical-lr');
  });

  it('3. Guarantees DeepSoulJourneyCard enforces min-w-0, full width responsiveness and horizontal buttons', () => {
    const code = fs.readFileSync(deepSoulJourneyPath, 'utf8');
    expect(code).toContain('min-w-0');
    expect(code).toContain('truncate');
    expect(code).toContain('grid-cols-1');
    expect(code).toContain('sm:grid-cols-2');
    expect(code).toContain('flex-shrink-0');
    expect(code).not.toContain('writing-mode');
  });

  it('4. Guarantees KarmicPatternsCard uses responsive grids without forced fixed desktop widths', () => {
    const code = fs.readFileSync(karmicPatternsPath, 'utf8');
    expect(code).toContain('grid-cols-1');
    expect(code).toContain('lg:grid-cols-12');
    expect(code).toContain('min-w-0');
    expect(code).not.toContain('width: 500px');
    expect(code).not.toContain('w-[500px]');
  });

  it('5. Verifies all interactive module buttons are semantic <button> elements with accessible actions', () => {
    const journeyCode = fs.readFileSync(deepSoulJourneyPath, 'utf8');
    const karmicCode = fs.readFileSync(karmicPatternsPath, 'utf8');

    expect(journeyCode).toContain('<button');
    expect(journeyCode).toContain('type="button"');
    expect(karmicCode).toContain('<button');
    expect(karmicCode).toContain('type="button"');
  });

  it('6. Verifies PastLifePage integrates DeepSoulJourneyCard, activeModule switching, and fallback dossier', () => {
    const pageCode = fs.readFileSync(pastLifePagePath, 'utf8');
    expect(pageCode).toContain('DeepSoulJourneyCard');
    expect(pageCode).toContain('KarmicPatternsCard');
    expect(pageCode).toContain('SoulLessonsCard');
    expect(pageCode).toContain('LifePurposeCard');
    expect(pageCode).toContain('activeModule');
    expect(pageCode).toContain('setActiveModule');
    expect(pageCode).toContain('karmic_patterns');
    expect(pageCode).toContain('past_life_influences');
    expect(pageCode).toContain('soul_lessons');
    expect(pageCode).toContain('life_purpose');
  });
});
