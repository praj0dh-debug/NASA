/**
 * Landing Component Tests
 * ────────────────────────
 * Tests for the BeanMachine-styled Junior Astronaut landing page components.
 *
 * Validates:
 * - Component file structure and exports
 * - BeanMachineNav: missions dropdown, keyboard handling, accessibility
 * - HeroSection: Junior Astronaut mission headline, subheading, CTA
 * - ServiceGrid: 4 STEM flight disciplines with correct content
 * - StarField: props interface, decorative aria-hidden
 * - SpaceShowcase: CSS-only illustrations (no external images)
 * - Button: new 'bean' variant
 * - Tailwind/CSS configuration updates
 * - App.tsx integration with landing components
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcDir = resolve(root, 'src');
const landingDir = resolve(srcDir, 'components', 'landing');

/**
 * Helper: reads a source file relative to the project root.
 */
async function readSrc(relPath) {
  return readFile(resolve(root, relPath), 'utf-8');
}

// ══════════════════════════════════════════════════════
// FILE EXISTENCE & STRUCTURE
// ══════════════════════════════════════════════════════

test('1. All landing component files exist', async () => {
  const files = [
    'BeanMachineNav.tsx',
    'HeroSection.tsx',
    'ServiceGrid.tsx',
    'SpaceShowcase.tsx',
    'StarField.tsx',
    'index.ts',
  ];
  for (const file of files) {
    await access(resolve(landingDir, file), constants.F_OK);
  }
});

test('2. Landing barrel index exports all components', async () => {
  const src = await readSrc('src/components/landing/index.ts');
  const exports = ['BeanMachineNav', 'HeroSection', 'ServiceGrid', 'SpaceShowcase', 'StarField'];
  for (const name of exports) {
    assert.ok(src.includes(name), `Barrel should export ${name}`);
  }
});

test('3. Each landing component exports a named React.FC', async () => {
  const components = [
    { file: 'BeanMachineNav.tsx', name: 'BeanMachineNav' },
    { file: 'HeroSection.tsx', name: 'HeroSection' },
    { file: 'ServiceGrid.tsx', name: 'ServiceGrid' },
    { file: 'SpaceShowcase.tsx', name: 'SpaceShowcase' },
    { file: 'StarField.tsx', name: 'StarField' },
  ];

  for (const { file, name } of components) {
    const src = await readSrc(`src/components/landing/${file}`);
    assert.ok(
      src.includes(`export const ${name}`) || src.includes(`export function ${name}`),
      `${file} should have a named export "${name}"`
    );
    assert.ok(
      src.includes('React.FC') || src.includes('React.FunctionComponent') || src.includes(': React.FC'),
      `${file} should be typed as a React functional component`
    );
  }
});

// ══════════════════════════════════════════════════════
// JUNIOR ASTRONAUT BEANMACHINE NAV
// ══════════════════════════════════════════════════════

test('4. BeanMachineNav: contains all required nav items for Junior Astronaut mission', async () => {
  const src = await readSrc('src/components/landing/BeanMachineNav.tsx');

  // Nav links
  assert.ok(src.includes("'Home'"), 'Nav should include Home');
  assert.ok(src.includes("'Missions'"), 'Nav should include Missions');
  assert.ok(src.includes("'Curriculum'"), 'Nav should include Curriculum');
  assert.ok(src.includes("'Badges'"), 'Nav should include Badges');
  assert.ok(src.includes("'Flight Log'"), 'Nav should include Flight Log');

  // CTA
  assert.ok(src.includes('Launch Mission'), 'Nav should include Launch Mission CTA');

  // Brand/Logo
  assert.ok(src.includes('Junior') && src.includes('Astronaut'), 'Nav should brand as Junior Astronaut');
});

test('5. BeanMachineNav: Missions dropdown has flight mission items', async () => {
  const src = await readSrc('src/components/landing/BeanMachineNav.tsx');
  const missions = ['Rocket Launch', 'Space Station Ops', 'Lunar Base', 'Mars Rover Coding', 'Satellite Design', 'Asteroid Deflection'];
  for (const m of missions) {
    assert.ok(src.includes(`'${m}'`), `Missions dropdown should include "${m}"`);
  }
});

test('6. BeanMachineNav: Curriculum dropdown has STEM curriculum items', async () => {
  const src = await readSrc('src/components/landing/BeanMachineNav.tsx');
  assert.ok(src.includes("'NGSS Science Standards'"), 'Curriculum dropdown should include NGSS Standards');
  assert.ok(src.includes("'Flight Physics Engine'"), 'Curriculum dropdown should include Flight Physics Engine');
});

test('7. BeanMachineNav: handles Escape key to close dropdowns', async () => {
  const src = await readSrc('src/components/landing/BeanMachineNav.tsx');
  assert.ok(src.includes("e.key === 'Escape'"), 'Should check for Escape key');
  assert.ok(src.includes('setOpenDropdown(null)'), 'Should close dropdown on Escape');
  assert.ok(src.includes('setMobileOpen(false)'), 'Should close mobile menu on Escape');
});

test('8. BeanMachineNav: closes dropdowns on outside click', async () => {
  const src = await readSrc('src/components/landing/BeanMachineNav.tsx');
  assert.ok(src.includes('handleClickOutside'), 'Should handle outside clicks');
  assert.ok(src.includes('mousedown'), 'Should listen for mousedown events');
});

test('9. BeanMachineNav: scrolled state triggers background change', async () => {
  const src = await readSrc('src/components/landing/BeanMachineNav.tsx');
  assert.ok(src.includes('scrolled'), 'Should track scroll state');
  assert.ok(src.includes('window.scrollY'), 'Should check scroll position');
  assert.ok(src.includes('backdrop-blur'), 'Should apply backdrop blur on scroll');
});

test('10. BeanMachineNav: has accessible CTA button (green accent)', async () => {
  const src = await readSrc('src/components/landing/BeanMachineNav.tsx');
  assert.ok(src.includes('bg-emerald-500'), 'Launch button should have emerald/green background');
  assert.ok(src.includes('#missions'), 'Launch button should link to #missions');
});

test('11. BeanMachineNav: has mobile hamburger menu with toggle', async () => {
  const src = await readSrc('src/components/landing/BeanMachineNav.tsx');
  assert.ok(src.includes('mobileOpen'), 'Should track mobile menu state');
  assert.ok(src.includes('md:hidden'), 'Hamburger should be hidden on desktop');
  assert.ok(
    src.includes('data-testid="mobile-menu-toggle"'),
    'Mobile toggle should have test id'
  );
  assert.ok(
    src.includes('data-testid="mobile-menu"'),
    'Mobile menu panel should have test id'
  );
});

// ══════════════════════════════════════════════════════
// HERO SECTION
// ══════════════════════════════════════════════════════

test('12. HeroSection: contains Junior Astronaut headline text', async () => {
  const src = await readSrc('src/components/landing/HeroSection.tsx');
  assert.ok(
    src.includes('Train Like a NASA Astronaut'),
    'Should have "Train Like a NASA Astronaut"'
  );
  assert.ok(
    src.includes('Master the Cosmos'),
    'Should have "Master the Cosmos"'
  );
});

test('13. HeroSection: contains subheading text focused on STEM simulators', async () => {
  const src = await readSrc('src/components/landing/HeroSection.tsx');
  assert.ok(
    src.includes('Authentic aerospace engineering simulators'),
    'Should have the subheading about aerospace engineering'
  );
});

test('14. HeroSection: has Launch Mission CTA button', async () => {
  const src = await readSrc('src/components/landing/HeroSection.tsx');
  assert.ok(src.includes('Launch Mission'), 'Should have "Launch Mission" CTA');
  assert.ok(src.includes('#missions'), 'CTA should link to missions section');
});

test('15. HeroSection: uses StarField component', async () => {
  const src = await readSrc('src/components/landing/HeroSection.tsx');
  assert.ok(src.includes('StarField'), 'Should use StarField for star background');
});

test('16. HeroSection: has CSS-illustrated planet with surface details', async () => {
  const src = await readSrc('src/components/landing/HeroSection.tsx');
  assert.ok(src.includes('rounded-full'), 'Should have circular planet element');
  assert.ok(
    src.includes('bg-gradient-to-br from-indigo') || src.includes('from-indigo-400'),
    'Planet should have indigo gradient'
  );
});

test('17. HeroSection: has SVG mountain range', async () => {
  const src = await readSrc('src/components/landing/HeroSection.tsx');
  assert.ok(src.includes('<svg'), 'Should have SVG elements');
  assert.ok(src.includes('mountainGrad') || src.includes('mountain'), 'Should have mountain gradients');
  assert.ok(src.includes('snowGrad') || src.includes('snow'), 'Should have snow-capped peaks');
});

test('18. HeroSection: has spacecraft elements', async () => {
  const src = await readSrc('src/components/landing/HeroSection.tsx');
  const spacecraftMatches = src.match(/Spacecraft/g) || [];
  assert.ok(spacecraftMatches.length >= 2, 'Should have at least 2 spacecraft');
});

test('19. HeroSection: dark blue-purple gradient background', async () => {
  const src = await readSrc('src/components/landing/HeroSection.tsx');
  assert.ok(
    src.includes('#0a0b2e') || src.includes('#12153f') || src.includes('#1a1050'),
    'Should use dark blue-purple gradient colors'
  );
});

// ══════════════════════════════════════════════════════
// SERVICE GRID (FLIGHT DISCIPLINES)
// ══════════════════════════════════════════════════════

test('20. ServiceGrid: defines exactly 4 STEM flight disciplines', async () => {
  const src = await readSrc('src/components/landing/ServiceGrid.tsx');
  const expected = [
    { title: 'Propulsion & Orbit', subtitle: 'Rocket staging & Newton’s laws' },
    { title: 'Life Support Ops', subtitle: 'Orbital station power & oxygen grids' },
    { title: 'Lunar Geology', subtitle: 'Artemis habitats & sample analysis' },
    { title: 'Autonomous Robotics', subtitle: 'Mars rover block programming' },
  ];
  for (const { title, subtitle } of expected) {
    assert.ok(src.includes(title), `Should include discipline "${title}"`);
    assert.ok(src.includes(subtitle), `Should include subtitle "${subtitle}"`);
  }
});

test('21. ServiceGrid: has "Flight Training Disciplines" heading', async () => {
  const src = await readSrc('src/components/landing/ServiceGrid.tsx');
  assert.ok(src.includes('Flight Training Disciplines'), 'Should have section heading');
});

test('22. ServiceGrid: has description paragraph about Junior Astronaut STEM Academy', async () => {
  const src = await readSrc('src/components/landing/ServiceGrid.tsx');
  assert.ok(
    src.includes('Junior Astronaut STEM Academy'),
    'Should have Junior Astronaut STEM Academy description paragraph'
  );
});

test('23. ServiceGrid: uses icon components for each discipline', async () => {
  const src = await readSrc('src/components/landing/ServiceGrid.tsx');
  const icons = ['Rocket', 'Radio', 'Moon', 'Cpu'];
  for (const icon of icons) {
    assert.ok(src.includes(icon), `Should use ${icon} icon`);
  }
});

test('24. ServiceGrid: has 4-column grid layout on desktop', async () => {
  const src = await readSrc('src/components/landing/ServiceGrid.tsx');
  assert.ok(src.includes('md:grid-cols-4'), 'Should have 4 columns on medium+ screens');
  assert.ok(src.includes('grid-cols-2'), 'Should have 2 columns on small screens');
});

test('25. ServiceGrid: has hover interactions on cards', async () => {
  const src = await readSrc('src/components/landing/ServiceGrid.tsx');
  assert.ok(src.includes('hover:-translate-y'), 'Cards should lift on hover');
  assert.ok(src.includes('hover:shadow'), 'Cards should glow on hover');
  assert.ok(src.includes('group-hover:scale'), 'Icons should scale on hover');
});

// ══════════════════════════════════════════════════════
// STAR FIELD
// ══════════════════════════════════════════════════════

test('26. StarField: accepts count prop with default', async () => {
  const src = await readSrc('src/components/landing/StarField.tsx');
  assert.ok(src.includes('count'), 'Should accept count prop');
  assert.ok(src.includes('= 120') || src.includes('=120'), 'Default count should be 120');
});

test('27. StarField: uses useMemo for stable star generation', async () => {
  const src = await readSrc('src/components/landing/StarField.tsx');
  assert.ok(src.includes('useMemo'), 'Should use useMemo for performance');
});

test('28. StarField: marks container as aria-hidden', async () => {
  const src = await readSrc('src/components/landing/StarField.tsx');
  assert.ok(src.includes('aria-hidden="true"'), 'Should be decorative / aria-hidden');
});

// ══════════════════════════════════════════════════════
// SPACE SHOWCASE
// ══════════════════════════════════════════════════════

test('29. SpaceShowcase: has dome cityscape SVG', async () => {
  const src = await readSrc('src/components/landing/SpaceShowcase.tsx');
  assert.ok(src.includes('<svg'), 'Should have SVG elements');
  assert.ok(src.includes('domeGrad'), 'Should have dome gradient');
  assert.ok(src.includes('buildingGrad'), 'Should have building gradient');
});

test('30. SpaceShowcase: uses StarField', async () => {
  const src = await readSrc('src/components/landing/SpaceShowcase.tsx');
  assert.ok(src.includes('StarField'), 'Should use StarField component');
});

// ══════════════════════════════════════════════════════
// MISSING ASSETS — GRACEFUL HANDLING
// ══════════════════════════════════════════════════════

test('31. Landing components use CSS/SVG — no external image imports', async () => {
  const files = ['HeroSection.tsx', 'SpaceShowcase.tsx', 'StarField.tsx', 'ServiceGrid.tsx'];
  for (const file of files) {
    const src = await readSrc(`src/components/landing/${file}`);
    const imageImportRegex = /import\s+.*\s+from\s+['"].*\.(png|jpg|jpeg|gif|webp)['"]/;
    assert.ok(!imageImportRegex.test(src), `${file} should not import raster images`);
  }
});

// ══════════════════════════════════════════════════════
// ACCESSIBILITY
// ══════════════════════════════════════════════════════

test('32. BeanMachineNav: has aria-label, aria-expanded, aria-haspopup, roles', async () => {
  const src = await readSrc('src/components/landing/BeanMachineNav.tsx');
  assert.ok(src.includes('aria-label="Main navigation"'), 'Nav aria-label');
  assert.ok(src.includes('aria-expanded'), 'Dropdown aria-expanded');
  assert.ok(src.includes('aria-haspopup="true"'), 'Dropdown aria-haspopup');
  assert.ok(src.includes('role="menu"'), 'Dropdown menu role');
  assert.ok(src.includes('role="menuitem"'), 'Menu item role');
  assert.ok(src.includes('role="navigation"'), 'Nav role');
});

test('33. HeroSection: has aria-label and decorative elements marked hidden', async () => {
  const src = await readSrc('src/components/landing/HeroSection.tsx');
  assert.ok(src.includes('aria-label="Hero section"'), 'Hero section aria-label');
  const hiddenCount = (src.match(/aria-hidden="true"/g) || []).length;
  assert.ok(hiddenCount >= 3, 'Should mark multiple decorative elements as aria-hidden');
});

test('34. ServiceGrid: has aria-label on section', async () => {
  const src = await readSrc('src/components/landing/ServiceGrid.tsx');
  assert.ok(src.includes('aria-label='), 'Services section aria-label');
});

// ══════════════════════════════════════════════════════
// DATA-TESTID ATTRIBUTES
// ══════════════════════════════════════════════════════

test('35. All landing components have data-testid attributes', async () => {
  const testIds = {
    'BeanMachineNav.tsx': ['beanmachine-nav', 'nav-logo', 'nav-contact-btn', 'mobile-menu-toggle'],
    'HeroSection.tsx': ['hero-section', 'hero-headline', 'hero-cta'],
    'ServiceGrid.tsx': ['service-grid', 'service-heading'],
    'StarField.tsx': ['star-field'],
    'SpaceShowcase.tsx': ['space-showcase'],
  };

  for (const [file, ids] of Object.entries(testIds)) {
    const src = await readSrc(`src/components/landing/${file}`);
    for (const id of ids) {
      assert.ok(
        src.includes(`data-testid="${id}"`),
        `${file} should have data-testid="${id}"`
      );
    }
  }
});

// ══════════════════════════════════════════════════════
// BUTTON COMPONENT
// ══════════════════════════════════════════════════════

test('36. Button: includes new "bean" variant', async () => {
  const src = await readSrc('src/components/common/Button.tsx');
  assert.ok(src.includes("'bean'"), 'Button should accept bean variant');
  assert.ok(src.includes('bg-emerald-500'), 'Bean variant should use emerald background');
});

// ══════════════════════════════════════════════════════
// TAILWIND CONFIG
// ══════════════════════════════════════════════════════

test('37. Tailwind config: includes BeanMachine theme extensions', async () => {
  const src = await readSrc('tailwind.config.js');
  assert.ok(src.includes('bean:'), 'Should define bean color palette');
  assert.ok(src.includes("850:"), 'Should include space-850 shade');
  assert.ok(src.includes("750:"), 'Should include space-750 shade');
  assert.ok(src.includes('twinkle'), 'Should define twinkle animation');
  assert.ok(src.includes('#0a0b2e'), 'Should reference BeanMachine dark color');
});

// ══════════════════════════════════════════════════════
// GLOBAL CSS
// ══════════════════════════════════════════════════════

test('38. Global CSS: includes BeanMachine theme and smooth scrolling', async () => {
  const src = await readSrc('src/styles/globals.css');
  assert.ok(src.includes('#0a0b2e'), 'CSS should use BeanMachine dark background');
  assert.ok(src.includes('scroll-behavior: smooth'), 'Should enable smooth scrolling');
  assert.ok(src.includes('landing-gradient'), 'Should define landing gradient utilities');
  assert.ok(src.includes('a11y-high-contrast'), 'Should preserve high contrast mode');
  assert.ok(src.includes('a11y-colorblind'), 'Should preserve colorblind mode');
  assert.ok(src.includes('text-size-large'), 'Should preserve text scaling');
});

// ══════════════════════════════════════════════════════
// APP.TSX INTEGRATION
// ══════════════════════════════════════════════════════

test('39. App.tsx: imports all landing components', async () => {
  const src = await readSrc('src/App.tsx');
  assert.ok(src.includes('BeanMachineNav'), 'Should import BeanMachineNav');
  assert.ok(src.includes('HeroSection'), 'Should import HeroSection');
  assert.ok(src.includes('ServiceGrid'), 'Should import ServiceGrid');
  assert.ok(src.includes('SpaceShowcase'), 'Should import SpaceShowcase');
});

test('40. App.tsx: conditionally renders landing vs mission hub', async () => {
  const src = await readSrc('src/App.tsx');
  assert.ok(src.includes('isLandingView'), 'Should have landing view state');
});

test('41. App.tsx: preserves all existing mission routing', async () => {
  const src = await readSrc('src/App.tsx');
  const missions = [
    'RocketLaunchMission',
    'SpaceStationMission',
    'LunarMission',
    'MarsRoverMission',
    'SatelliteMission',
    'AsteroidMission',
  ];
  for (const mission of missions) {
    assert.ok(src.includes(mission), `Should preserve ${mission} routing`);
  }
});

test('42. App.tsx: preserves ProfileHeader, SettingsPanel, modals', async () => {
  const src = await readSrc('src/App.tsx');
  assert.ok(src.includes('ProfileHeader'), 'Should preserve ProfileHeader');
  assert.ok(src.includes('SettingsPanel'), 'Should preserve SettingsPanel');
  assert.ok(src.includes('ChildProfileSetup'), 'Should preserve ChildProfileSetup');
  assert.ok(src.includes('ParentConsentFlow'), 'Should preserve ParentConsentFlow');
  assert.ok(src.includes('RosterView'), 'Should preserve RosterView');
});

test('43. App.tsx: has navigation between landing and mission hub', async () => {
  const src = await readSrc('src/App.tsx');
  assert.ok(src.includes('handleEnterMissionHub'), 'Should have enter mission hub handler');
  assert.ok(src.includes('handleBackToLanding'), 'Should have back to landing handler');
  assert.ok(src.includes('data-testid="enter-mission-hub"'), 'Should have mission hub entry point');
});

test('44. App.tsx: preserves COPPA consent and accessibility footer links', async () => {
  const src = await readSrc('src/App.tsx');
  assert.ok(src.includes('COPPA Parental Consent Gate'), 'Should preserve COPPA link');
  assert.ok(src.includes('WCAG 2.1 AA Accessibility'), 'Should preserve accessibility link');
});

// ══════════════════════════════════════════════════════
// EXISTING COMPONENTS UNCHANGED
// ══════════════════════════════════════════════════════

test('45. Existing components are not modified beyond Button variant', async () => {
  const missionCard = await readSrc('src/components/hub/MissionCard.tsx');
  assert.ok(missionCard.includes('MissionCard'), 'MissionCard should still exist');
  assert.ok(missionCard.includes('soundEffects'), 'MissionCard should still use soundEffects');

  const missionMap = await readSrc('src/components/hub/MissionMap.tsx');
  assert.ok(missionMap.includes('MissionMap'), 'MissionMap should still exist');
  assert.ok(missionMap.includes('NarratorBubble'), 'MissionMap should still use NarratorBubble');

  const progress = await readSrc('src/context/ProgressContext.tsx');
  assert.ok(progress.includes('ProgressProvider'), 'ProgressContext should be unchanged');
  assert.ok(progress.includes('completeMission'), 'ProgressContext should preserve completeMission');

  const user = await readSrc('src/context/UserContext.tsx');
  assert.ok(user.includes('UserProvider'), 'UserContext should be unchanged');
});
