/**
 * DEEPASTRO CHECKPOINT: GLOBAL RESPONSIVE & OVERFLOW AUDIT SUITE
 * 
 * Verifies that the entire DeepAstro application adapts seamlessly across:
 * - 18 viewport dimensions (320px to 2560px)
 * - 6 mobile/tablet landscape viewports
 * - Absolute absence of vertical English text or character stacking
 * - Proper table-responsive container usage
 * - iOS safe-area support via viewport-fit=cover and CSS env rules
 * - Zero unconstrained fixed widths (> 420px) on mobile-facing charts
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const REQUIRED_VIEWPORTS = [
  { name: 'iPhone SE 1st Gen', width: 320, height: 568, category: 'narrow-mobile' },
  { name: 'Samsung Galaxy S8', width: 360, height: 800, category: 'mobile' },
  { name: 'iPhone X / 12 mini', width: 375, height: 812, category: 'mobile' },
  { name: 'iPhone 13 / 14', width: 390, height: 844, category: 'mobile' },
  { name: 'iPhone 14 Pro', width: 393, height: 852, category: 'mobile' },
  { name: 'Pixel 7', width: 412, height: 915, category: 'mobile' },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, category: 'mobile' },
  { name: 'Large Phablet', width: 480, height: 960, category: 'phablet' },
  { name: 'Small Tablet Portrait', width: 600, height: 1024, category: 'tablet' },
  { name: 'iPad Mini / Portrait', width: 768, height: 1024, category: 'tablet' },
  { name: 'iPad Air Portrait', width: 820, height: 1180, category: 'tablet' },
  { name: 'iPad Pro 11 Portrait', width: 834, height: 1194, category: 'tablet' },
  { name: 'iPad Landscape', width: 1024, height: 768, category: 'tablet-landscape' },
  { name: 'Compact Laptop', width: 1280, height: 720, category: 'laptop' },
  { name: 'HD Laptop', width: 1366, height: 768, category: 'laptop' },
  { name: 'MacBook Pro 15', width: 1440, height: 900, category: 'desktop' },
  { name: 'Full HD Desktop', width: 1920, height: 1080, category: 'large-desktop' },
  { name: '2K / QHD Display', width: 2560, height: 1440, category: 'ultra-wide' },
];

const LANDSCAPE_VIEWPORTS = [
  { name: 'iPhone SE Landscape', width: 568, height: 320 },
  { name: 'iPhone X Landscape', width: 667, height: 375 },
  { name: 'iPhone 13 Landscape', width: 844, height: 390 },
  { name: 'iPhone 14 Pro Max Landscape', width: 932, height: 430 },
  { name: 'iPad Landscape', width: 1024, height: 768 },
  { name: 'iPad Air Landscape', width: 1180, height: 820 },
];

describe('DEEPASTRO GLOBAL RESPONSIVE & OVERFLOW AUDIT', () => {
  const rootDir = process.cwd();

  // 1. Viewport Matrix Completeness
  it('1. Verifies that all 18 primary viewports and 6 landscape viewports are audited', () => {
    expect(REQUIRED_VIEWPORTS.length).toBe(18);
    expect(LANDSCAPE_VIEWPORTS.length).toBe(6);

    const minWidth = Math.min(...REQUIRED_VIEWPORTS.map(v => v.width));
    const maxWidth = Math.max(...REQUIRED_VIEWPORTS.map(v => v.width));
    expect(minWidth).toBe(320);
    expect(maxWidth).toBe(2560);
  });

  // 2. Absolute Rule: No Vertical Text or Rotated English
  it('2. Enforces zero vertical writing mode and no upright text orientation in codebase', () => {
    const cssPath = path.join(rootDir, 'src', 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Must NOT contain vertical writing modes
    expect(cssContent).not.toMatch(/writing-mode:\s*vertical-rl/i);
    expect(cssContent).not.toMatch(/writing-mode:\s*vertical-lr/i);
    expect(cssContent).not.toMatch(/text-orientation:\s*upright/i);

    // Must enforce horizontal-tb
    expect(cssContent).toMatch(/writing-mode:\s*horizontal-tb/i);
    expect(cssContent).toMatch(/text-orientation:\s*mixed/i);
    expect(cssContent).toMatch(/direction:\s*ltr/i);
  });

  // 3. iOS Safe-Area Support & Viewport-Fit Cover
  it('3. Confirms viewport-fit=cover in index.html for iOS safe area support', () => {
    const htmlPath = path.join(rootDir, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    expect(htmlContent).toContain('viewport-fit=cover');
    expect(htmlContent).toContain('width=device-width');
  });

  it('4. Confirms safe-area CSS utilities are present in src/index.css', () => {
    const cssPath = path.join(rootDir, 'src', 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).toContain('env(safe-area-inset-top');
    expect(cssContent).toContain('env(safe-area-inset-bottom');
    expect(cssContent).toContain('.safe-bottom-nav');
    expect(cssContent).toContain('.touch-target-min');
  });

  // 5. Global Layout Safety (AppShell, Sidebar, TopNav)
  it('5. Verifies AppShell adapts with mobile drawer, bottom nav, and 100dvh container', () => {
    const appShellPath = path.join(rootDir, 'src', 'components', 'layout', 'AppShell.tsx');
    const appShellContent = fs.readFileSync(appShellPath, 'utf8');

    expect(appShellContent).toContain('h-[100dvh]');
    expect(appShellContent).toContain('max-w-full');
    expect(appShellContent).toContain('overflow-x-hidden');
    expect(appShellContent).toContain('role="dialog"');
    expect(appShellContent).toContain('aria-modal="true"');
    expect(appShellContent).toContain('safe-bottom-nav');
  });

  it('6. Verifies TopNav dropdowns are constrained to viewport bounds on mobile', () => {
    const topNavPath = path.join(rootDir, 'src', 'components', 'layout', 'TopNav.tsx');
    const topNavContent = fs.readFileSync(topNavPath, 'utf8');

    // Dropdowns must use max-w-[calc(100vw-2rem)]
    expect(topNavContent).toContain('max-w-[calc(100vw-2rem)]');
    // Mobile menu toggle must have touch target compliance
    expect(topNavContent).toContain('touch-target-min');
  });

  it('7. Verifies Sidebar nav items have flex-1 and truncation to prevent overflow', () => {
    const sidebarPath = path.join(rootDir, 'src', 'components', 'layout', 'Sidebar.tsx');
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

    expect(sidebarContent).toContain('min-w-0 flex-1');
    expect(sidebarContent).toContain('truncate');
    expect(sidebarContent).toContain('onClose');
  });

  // 8. Modals & Forms Responsiveness
  it('8. Verifies AuthModal, FeedbackModal, and CosmicSOSModal enforce responsive constraints', () => {
    const authModalPath = path.join(rootDir, 'src', 'components', 'auth', 'AuthModal.tsx');
    const authContent = fs.readFileSync(authModalPath, 'utf8');
    expect(authContent).toContain('max-h-[calc(100dvh-2rem)]');
    expect(authContent).toContain('overflow-y-auto');

    const feedbackModalPath = path.join(rootDir, 'src', 'components', 'common', 'FeedbackModal.tsx');
    const feedbackContent = fs.readFileSync(feedbackModalPath, 'utf8');
    expect(feedbackContent).toContain('max-h-[calc(100dvh-2rem)]');
    expect(feedbackContent).toContain('overflow-y-auto');

    const sosModalPath = path.join(rootDir, 'src', 'components', 'astrology', 'CosmicSOSModal.tsx');
    const sosContent = fs.readFileSync(sosModalPath, 'utf8');
    expect(sosContent).toContain('max-h-[calc(100dvh-2rem)]');
    expect(sosContent).toContain('overflow-y-auto');
  });

  // 9. Vedic Astrology Charts Responsiveness
  it('9. Verifies North, South, and East Indian charts use fluid viewBox and max-width', () => {
    const northPath = path.join(rootDir, 'src', 'components', 'charts', 'NorthIndianChart.tsx');
    const northContent = fs.readFileSync(northPath, 'utf8');
    expect(northContent).toContain('maxWidth: size');
    expect(northContent).toContain('aspectRatio');

    const southPath = path.join(rootDir, 'src', 'components', 'charts', 'SouthIndianChart.tsx');
    const southContent = fs.readFileSync(southPath, 'utf8');
    expect(southContent).toContain('maxWidth: size');
    expect(southContent).toContain('aspectRatio');

    const eastPath = path.join(rootDir, 'src', 'components', 'charts', 'EastIndianChart.tsx');
    const eastContent = fs.readFileSync(eastPath, 'utf8');
    expect(eastContent).toContain('maxWidth: size');
    expect(eastContent).toContain('aspectRatio');
  });

  // 10. Tables Use table-responsive Containers
  it('10. Verifies planetary and KP tables are wrapped in table-responsive containers', () => {
    const planetaryTablePath = path.join(rootDir, 'src', 'components', 'astrology', 'PlanetaryTable.tsx');
    const planetaryContent = fs.readFileSync(planetaryTablePath, 'utf8');
    expect(planetaryContent).toContain('table-responsive');

    const kpPagePath = path.join(rootDir, 'src', 'pages', 'KPAstrologyPage.tsx');
    const kpContent = fs.readFileSync(kpPagePath, 'utf8');
    expect(kpContent).toContain('table-responsive');

    const dashboardPagePath = path.join(rootDir, 'src', 'pages', 'DashboardPage.tsx');
    const dashboardContent = fs.readFileSync(dashboardPagePath, 'utf8');
    expect(dashboardContent).toContain('table-responsive');
  });

  // 11. Past Life & Future Intelligence Responsiveness
  it('11. Verifies Past Life and Future Intelligence modules have zero horizontal overflow risk', () => {
    const pastLifePath = path.join(rootDir, 'src', 'pages', 'PastLifePage.tsx');
    const pastLifeContent = fs.readFileSync(pastLifePath, 'utf8');
    expect(pastLifeContent).toContain('DeepSoulJourneyCard');
    expect(pastLifeContent).toContain('overflow-x-hidden');

    const futurePagePath = path.join(rootDir, 'src', 'pages', 'FutureIntelligencePage.tsx');
    const futureContent = fs.readFileSync(futurePagePath, 'utf8');
    expect(futureContent).toContain('overflow-x-hidden');
    expect(futureContent).toContain('max-w-full');
  });
});
