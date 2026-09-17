import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('DeepAstro 6.0.3 Canonical Session Scroll Isolation & Three-Region Architecture Suite', () => {
  const rootDir = path.resolve(__dirname, '..');
  const appShellPath = path.join(rootDir, 'src', 'components', 'layout', 'AppShell.tsx');
  const topNavPath = path.join(rootDir, 'src', 'components', 'layout', 'TopNav.tsx');
  const myCosmosPath = path.join(rootDir, 'src', 'pages', 'MyCosmosPage.tsx');

  it('verifies AppShell isolates workspace layout for my-cosmos without outer scroll coupling', () => {
    const appShell = fs.readFileSync(appShellPath, 'utf8');
    expect(appShell).toContain("activeTab === 'my-cosmos'");
    expect(appShell).toContain('flex-1 min-h-0 w-full overflow-hidden flex flex-col relative card-safe');
    expect(appShell).toContain('overflow-x-hidden');
  });

  it('verifies TopNav navigation header maintains highest z-index (z-50) and shrink-0', () => {
    const topNav = fs.readFileSync(topNavPath, 'utf8');
    expect(topNav).toContain('z-50');
    expect(topNav).toContain('shrink-0');
    expect(topNav).toContain('sticky top-0');
  });

  it('verifies Canonical Session 6.0.3 header is structurally stationary at z-40 shrink-0 outside the content scroll container', () => {
    const myCosmos = fs.readFileSync(myCosmosPath, 'utf8');
    expect(myCosmos).toContain('CANONICAL SESSION 6.0.3');
    expect(myCosmos).toContain('shrink-0 border-b border-slate-800/80 bg-[#111827]/95 backdrop-blur-xl');
    expect(myCosmos).toContain('z-40');
  });

  it('verifies Module Sidebar has independent scroll container (w-72 shrink-0 overflow-y-auto)', () => {
    const myCosmos = fs.readFileSync(myCosmosPath, 'utf8');
    expect(myCosmos).toContain('hidden lg:flex flex-col w-72 shrink-0 border-r border-slate-800/80 bg-[#0B0F17]/80 overflow-y-auto');
  });

  it('verifies Main Content Pane has independent scroll container (flex-1 min-h-0 overflow-y-auto overflow-x-hidden card-safe)', () => {
    const myCosmos = fs.readFileSync(myCosmosPath, 'utf8');
    expect(myCosmos).toContain('flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-6 card-safe');
  });

  it('verifies mobile responsive layout uses horizontal strip and fluid natural scroll without nested scroll trap', () => {
    const myCosmos = fs.readFileSync(myCosmosPath, 'utf8');
    expect(myCosmos).toContain('lg:hidden shrink-0 border-b border-slate-800/80 bg-[#0B0F17]/95 px-3 py-2 overflow-x-auto');
    expect(myCosmos).toContain('overflow-y-auto lg:overflow-hidden');
  });
});
