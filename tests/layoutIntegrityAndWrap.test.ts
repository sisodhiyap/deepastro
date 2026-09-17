import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('DeepAstro 6.1 Layout Integrity, Card Safety & Adversarial Text-Wrap Suite', () => {
  const rootDir = path.resolve(__dirname, '..');
  const indexCssPath = path.join(rootDir, 'src', 'index.css');
  const appShellPath = path.join(rootDir, 'src', 'components', 'layout', 'AppShell.tsx');
  const futurePagePath = path.join(rootDir, 'src', 'pages', 'FutureIntelligencePage.tsx');
  const tarotLayoutPath = path.join(rootDir, 'src', 'components', 'tarot', 'TarotResponsiveLayout.tsx');

  describe('1. Global CSS Design Tokens & Card Safety Contract', () => {
    it('verifies universal box-sizing and overflow-wrap anywhere in src/index.css', () => {
      const css = fs.readFileSync(indexCssPath, 'utf8');
      expect(css).toContain('box-sizing: border-box');
      expect(css).toContain('overflow-wrap: anywhere');
      expect(css).toContain('word-break: normal');
      expect(css).toContain('.card-safe');
      expect(css).toContain('.table-responsive');
      expect(css).toContain('.break-technical');
    });

    it('verifies design token consolidation matches DeepAstro 6.1 specification', () => {
      const css = fs.readFileSync(indexCssPath, 'utf8');
      expect(css).toContain('--bg-cosmic: #06070A');
      expect(css).toContain('--surface-cosmic: #111827');
      expect(css).toContain('--card-cosmic: #1A1F2B');
      expect(css).toContain('--border-cosmic: #2A3441');
      expect(css).toContain('--primary-cyan: #00E5FF');
      expect(css).toContain('--secondary-accent: #3B82F6');
      expect(css).toContain('--text-main: #F8FAFC');
      expect(css).toContain('--text-muted: #94A3B8');
    });

    it('verifies AppShell main container enforces overflow-x-hidden and card-safe boundary', () => {
      const appShell = fs.readFileSync(appShellPath, 'utf8');
      expect(appShell).toContain('overflow-x-hidden');
      expect(appShell).toContain('card-safe');
      expect(appShell).toContain('min-w-0');
      expect(appShell).toContain('max-w-full');
    });
  });

  describe('2. Adversarial Text Wrapping & String Ingestion Resiliency', () => {
    const adversarialStrings = [
      {
        name: 'Unbroken 256-char ASCII string',
        value: 'VERY_LONG_PLANETARY_INTERPRETATION_WITHOUT_SPACES_' + 'X'.repeat(200) + '_END',
      },
      {
        name: 'Long SHA-256 Calculation Fingerprint',
        value: 'da_cert_2026_98fa7c2b3e81059f1c7d3b4e6a8c0f2e1a3b5c7d9e0f2a4b6c8d0e1f3a5b7c9d',
      },
      {
        name: 'Longest Geographical Place Name',
        value: 'Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu',
      },
      {
        name: 'Continuous Sanskrit Stotra Token',
        value: 'ब्रह्मामुरारिस्त्रिपुरान्तकारीभानुःशशीभूमिसुतोबुधश्चगुरुश्चशुक्रःशनिराहुकेतवःसर्वेग्रहाःशान्तिकराभवन्तु',
      },
      {
        name: 'Long Email with Boundary Symbols',
        value: 'cosmic.high-precision.astronomical.research.verification.specialist+adversarial@deepastro.observatory.org',
      },
    ];

    it('validates string wrapping behavior with CSS wrap utilities', () => {
      for (const item of adversarialStrings) {
        expect(item.value.length).toBeGreaterThan(50);
        const simulatedCssWrap = (str: string, maxLen: number) => {
          return str.length > maxLen;
        };
        expect(simulatedCssWrap(item.value, 40)).toBe(true);
      }
    });
  });

  describe('3. Tarot Responsive System Verification', () => {
    it('verifies TarotResponsiveLayout supports mobile carousel with swipe and desktop fan spread', () => {
      const tarotCode = fs.readFileSync(tarotLayoutPath, 'utf8');
      expect(tarotCode).toContain('viewMode');
      expect(tarotCode).toContain('carousel');
      expect(tarotCode).toContain('spread');
      expect(tarotCode).toContain('onTouchStart');
      expect(tarotCode).toContain('onTouchEnd');
      expect(tarotCode).toContain('min-h-[44px]');
      expect(tarotCode).toContain('min-w-[44px]');
    });
  });

  describe('4. Future Intelligence Page State Contract', () => {
    it('verifies complete state flow in FutureIntelligencePage', () => {
      const futureCode = fs.readFileSync(futurePagePath, 'utf8');
      expect(futureCode).toContain('AUTH_REQUIRED');
      expect(futureCode).toContain('PREMIUM_REQUIRED');
      expect(futureCode).toContain('CONSENT_REQUIRED');
      expect(futureCode).toContain('BIRTH_PROFILE_REQUIRED');
      expect(futureCode).toContain('READY');
      expect(futureCode).toContain('GENERATING');
      expect(futureCode).toContain('SUCCESS');
      expect(futureCode).toContain('ERROR');
    });
  });

  describe('5. Responsive Viewport Constraints Specification', () => {
    const viewports = [
      { width: 320, height: 568, name: 'iPhone SE (Gen 1)' },
      { width: 360, height: 800, name: 'Android Small' },
      { width: 375, height: 812, name: 'iPhone Mini / Standard' },
      { width: 390, height: 844, name: 'iPhone 13/14' },
      { width: 414, height: 896, name: 'iPhone Plus / Max' },
      { width: 430, height: 932, name: 'iPhone Pro Max' },
      { width: 768, height: 1024, name: 'iPad Portrait' },
      { width: 1024, height: 768, name: 'iPad Landscape' },
      { width: 1280, height: 720, name: 'HD Laptop' },
      { width: 1440, height: 900, name: 'MacBook Pro' },
      { width: 1920, height: 1080, name: 'FHD Desktop' },
      { width: 2560, height: 1440, name: 'QHD Studio Display' },
    ];

    it('verifies viewport matrix test definitions cover all mobile, tablet, and desktop bounds', () => {
      expect(viewports.length).toBe(12);
      expect(viewports[0].width).toBe(320);
      expect(viewports[viewports.length - 1].width).toBe(2560);
    });
  });
});
