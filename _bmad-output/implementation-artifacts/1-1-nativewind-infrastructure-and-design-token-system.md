# Story 1.1: NativeWind Infrastructure & Design Token System

Status: ready-for-dev

## Story

As a developer,
I want the NativeWind/Tailwind infrastructure installed and configured with the complete design token system,
So that all subsequent component migration has a consistent styling foundation.

## Acceptance Criteria

1. **Given** the existing Expo SDK 55 / React Native 0.83 project, **When** NativeWind v4.2.2 and Tailwind CSS 3.4.x are installed, **Then** `tailwind.config.js` exists with the complete token system (colors, opacity, blur, animation, spacing, borderRadius, fontFamily including JetBrains Mono)
2. **Given** NativeWind is installed, **When** the Babel config is updated, **Then** `babel.config.js` includes the NativeWind Babel preset with `jsxImportSource: "nativewind"` and `nativewind/babel` preset
3. **Given** NativeWind is installed, **When** the Metro config is created, **Then** `metro.config.js` wraps the Expo default config with `withNativeWind()` pointing to `./global.css`
4. **Given** Tailwind is configured, **When** `global.css` is created at project root, **Then** it contains `@tailwind base`, `@tailwind components`, `@tailwind utilities` directives and is imported in `App.js`
5. **Given** NativeWind is configured, **When** a test component uses NativeWind classes including `dark:` variant, **Then** it renders correctly on both iOS and Android
6. **Given** NativeWind is configured, **When** NativeWind-styled components render alongside existing `StyleSheet.create()` components, **Then** no visual conflicts occur — coexistence validated
7. **Given** NativeWind is configured, **When** a View with NativeWind classes overlays a MapView (`react-native-maps`), **Then** positioning, z-index, and overflow work correctly. If incompatible, document that map overlays use StyleSheet for positioning while NativeWind handles visual styling
8. **Given** NativeWind is configured, **When** NativeWind classes are applied to content inside `@gorhom/bottom-sheet` BottomSheetView, **Then** styles apply correctly. Known limitation: `className` doesn't apply to BottomSheetView directly — content must be wrapped in a regular View
9. **Given** JetBrains Mono font is bundled, **When** the app loads, **Then** the font is available for monospace text rendering (callsigns, frequencies, ICAO codes)
10. **Given** the theme token system is configured in `tailwind.config.js`, **Then** it includes all UX-spec tokens: surface colors (base/elevated/overlay), text hierarchy (primary/secondary/muted), accent colors, ATC semantic colors, status indicators, opacity levels (0.45/0.65/0.85), blur values (iOS 20/Android 0), animation durations (150ms/250ms/400ms), easing, spring config, fontFamily (sans + mono)
11. **Given** `theme.js` is modified to add new exports, **When** existing components import the default export, **Then** all existing properties (`blueGrey`, `googleDefault`, `firStrokeColor`, `firFillColor`, `uirStrokeColor`, `uirFillColor`, `aircraftColor`, `blueGreyNew`) remain accessible and unchanged

## Tasks / Subtasks

- [ ] Task 1: Install NativeWind and dependencies (AC: #1, #2, #3, #4)
  - [ ] 1.1: Run `npm install nativewind@^4.2.2 react-native-css-interop tailwindcss@^3.4.0`
  - [ ] 1.2: Run `npx expo install expo-blur` (for BlurWrapper in later stories, but dependency needed now)
  - [ ] 1.3: Run `npx expo install @expo-google-fonts/jetbrains-mono expo-font` (if not already present)
  - [ ] 1.4: Create `babel.config.js` with NativeWind presets (see Dev Notes)
  - [ ] 1.5: Create `metro.config.js` with `withNativeWind()` wrapper (see Dev Notes)
  - [ ] 1.6: Create `global.css` at project root with Tailwind directives
  - [ ] 1.7: Import `global.css` in `App.js` (top of file, before other imports)
- [ ] Task 2: Create `tailwind.config.js` with complete design token system (AC: #10)
  - [ ] 2.1: Define color tokens — surface, text, accent, atc, status (light + dark)
  - [ ] 2.2: Define opacity tokens — surface (0.45), surface-dense (0.65), overlay (0.85)
  - [ ] 2.3: Define blur tokens — iOS: 20, Android: 0
  - [ ] 2.4: Define animation tokens — duration (fast/normal/slow), easing, spring
  - [ ] 2.5: Define fontFamily — sans (system), mono (JetBrainsMono_400Regular)
  - [ ] 2.6: Define spacing, borderRadius scales
  - [ ] 2.7: Configure content paths to scan `app/**/*.{js,jsx}`
  - [ ] 2.8: Add NativeWind preset
- [ ] Task 3: Extend `app/common/theme.js` as single source of truth (AC: #10)
  - [ ] 3.1: Export `lightTheme` and `darkTheme` color palettes
  - [ ] 3.2: Export `darkMapStyle` JSON (deep navy/charcoal, subtle roads, muted labels — complement dark UI)
  - [ ] 3.3: Keep existing `blueGreyNew` map style as `lightMapStyle` (rename export)
  - [ ] 3.4: Export Tailwind-compatible token values that `tailwind.config.js` can import
  - [ ] 3.5: Keep all existing exports functional for backward compatibility during migration
- [ ] Task 4: Load JetBrains Mono font in App.js (AC: #9)
  - [ ] 4.1: Import `useFonts` and `JetBrainsMono_400Regular` (and _700Bold) from `@expo-google-fonts/jetbrains-mono`
  - [ ] 4.2: Call `useFonts()` in the App component and handle loading state
  - [ ] 4.3: Verify font renders in a test Text component with `fontFamily: 'JetBrainsMono_400Regular'`
- [ ] Task 5: Validate NativeWind + third-party library compatibility (AC: #5, #6, #7, #8)
  - [ ] 5.1: Create a temporary test component using NativeWind classes (`bg-surface`, `dark:bg-surface-dark`, `text-on-surface`, `rounded-2xl`, `px-4 py-2`)
  - [ ] 5.2: Render test component alongside existing StyleSheet components — verify no conflicts
  - [ ] 5.3: Render a View with NativeWind classes overlaying MapView — document results
  - [ ] 5.4: Render NativeWind-styled content inside BottomSheetView (wrapped in plain View) — document results
  - [ ] 5.5: Remove temporary test component after validation, document findings in Dev Agent Record
  - [ ] 5.6: If MapView or BottomSheet incompatibility found: document specific workaround (StyleSheet for positioning, NativeWind for visual) — do NOT revert NativeWind. Proceed with documented limitations.
- [ ] Task 6: Run lint and verify no regressions (AC: #6)
  - [ ] 6.1: Run `npm run lint` — fix any new lint errors
  - [ ] 6.2: Build and test on both iOS and Android simulators
  - [ ] 6.3: Verify all existing screens still render correctly

## Dev Notes

### Critical Configuration — Exact File Contents

**babel.config.js** (NEW — does not currently exist):
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

**metro.config.js** (NEW — does not currently exist):
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

**global.css** (NEW — project root):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**App.js import** (add at top):
```javascript
import './global.css';
```

### Design Token System — Complete Color Palette & Token Map

**Dark Theme Palette (Hero Theme):**

| Token | Value | Usage |
|---|---|---|
| `surface.base` | `#0D1117` | App background behind map, non-map screen backgrounds |
| `surface.elevated` | `rgba(22, 27, 34, 0.45)` | Translucent floating surfaces (nav island, filter chips, sheet) |
| `surface.elevated-dense` | `rgba(22, 27, 34, 0.65)` | Increased opacity for dense map backgrounds |
| `surface.overlay` | `rgba(22, 27, 34, 0.85)` | Near-opaque for full-detail sheet, non-map screens |
| `surface.border` | `rgba(255, 255, 255, 0.08)` | Subtle 1px border on floating elements |
| `text.primary` | `#E6EDF3` | Primary text — headings, callsigns, key data |
| `text.secondary` | `#8B949E` | Secondary text — labels, descriptions, metadata |
| `text.muted` | `#484F58` | Tertiary text — timestamps, low-priority info |
| `accent.primary` | `#3B7DD8` | Active states, selected indicators |
| `accent.secondary` | `#5BA0E6` | Hover/focus states, subtle highlights |
| `atc.staffed` | `#3B7DD8` | Staffed ATC polygon fill (primary accent, low opacity) |
| `atc.tracon` | `#2EA043` | TRACON polygon fill — distinct from FIR |
| `atc.fir` | `#3B7DD8` | FIR boundary stroke |
| `status.online` | `#3FB950` | Online/active indicators |
| `status.offline` | `#484F58` | Offline/inactive indicators |
| `status.stale` | `#D29922` | Stale data warning |

**Light Theme Palette:**

| Token | Value | Usage |
|---|---|---|
| `surface.base` | `#FFFFFF` | App background behind map |
| `surface.elevated` | `rgba(255, 255, 255, 0.50)` | Translucent floating surfaces — slightly higher opacity for readability |
| `surface.elevated-dense` | `rgba(255, 255, 255, 0.70)` | Increased opacity variant |
| `surface.overlay` | `rgba(255, 255, 255, 0.90)` | Near-opaque for full-detail panels |
| `surface.border` | `rgba(0, 0, 0, 0.08)` | Subtle border on floating elements |
| `text.primary` | `#1F2328` | Primary text |
| `text.secondary` | `#656D76` | Secondary text |
| `text.muted` | `#8B949E` | Tertiary text |
| `accent.primary` | `#2A6BC4` | Active states — slightly deeper than dark theme for contrast |
| `accent.secondary` | `#3B7DD8` | Hover/focus states |
| `atc.staffed` | `#2A6BC4` | Staffed ATC polygon fill |
| `atc.tracon` | `#1A7F37` | TRACON polygon fill |
| `status.online` | `#1A7F37` | Online indicators |
| `status.stale` | `#BF8700` | Stale data warning |

**Non-Color Tokens:**

```
opacity:
  surface: 0.45 — default floating surfaces
  surface-dense: 0.65 — busy map backgrounds
  overlay: 0.85 — full-detail panels

blur:
  surface-ios: 20
  surface-android: 0 (permanent platform decision)

animation:
  duration: { fast: 150ms, normal: 250ms, slow: 400ms }
  easing: cubic-bezier(0.2, 0, 0, 1)
  spring: { damping: 20, stiffness: 300 }

fontFamily:
  sans: system font (default)
  mono: JetBrainsMono_400Regular

spacing: standard Tailwind scale
borderRadius: standard + 2xl for floating elements
```

**Semantic Color Rules:**
- No hardcoded colors — every value from token system (ESLint `react-native/no-color-literals` enforced)
- Accent is a single blue hue — aviation instrument metaphor uses one backlight color
- ATC colors are domain-semantic (staffed, tracon, fir) — functional, not decorative
- Surface opacity scales with information density (0.45 → 0.65 → 0.85)

**Dark Map Style Key Colors (for `darkMapStyle` JSON creation):**
- Land/landscape: `#0D1117` (match surface.base)
- Water: `#161B22` (slightly lighter than land)
- Roads: `#21262D` (subtle, low contrast)
- Labels: `#484F58` (text.muted — recede behind data layers)
- Administrative boundaries: `#30363D`

### Theme.js Extension Pattern

`theme.js` becomes the **single source of truth** for both NativeWind tokens AND Google Maps JSON styles. The file must:
- Export `lightTheme`, `darkTheme` as color palette objects
- Export `lightMapStyle` (current `blueGreyNew`), `darkMapStyle` (new — deep navy/charcoal)
- Export values importable by `tailwind.config.js`
- **Keep all existing exports working** — other files import from theme.js during migration

### Dark Map Style Guidance (from UX spec)

Create `darkMapStyle` Google Maps JSON: deep navy/charcoal base, subtle road lines, muted labels, optimized for polygon visibility and marker contrast. Reference the existing `blueGreyNew` style structure (37 rules) as a template.

### NativeWind Styling Boundaries

| Use NativeWind (`className`) | Use `StyleSheet.create()` |
|---|---|
| All new UI components | `@gorhom/bottom-sheet` container props (`style`, `backgroundStyle`, `handleStyle`) |
| Content inside bottom sheet | `react-native-maps` Marker and Polygon `style` props |
| All text, buttons, cards, lists | `position: 'absolute'` map overlays (use StyleSheet for positioning, NativeWind for visual) |
| Floating nav island content | Reanimated `useAnimatedStyle()` outputs |

**Rule:** If a third-party component doesn't accept `className`, use StyleSheet. Wrap in a View with NativeWind classes for visual styling.

### NativeWind Class Ordering Convention

Follow Tailwind standard: Layout → Sizing → Spacing → Typography → Visual → State variants

```jsx
// Correct
className="flex-1 w-full px-4 py-2 text-base font-medium bg-surface rounded-2xl dark:bg-surface-dark"
```

### Token Usage Rules

- **Never** use NativeWind default palette colors (`bg-gray-100`, `bg-blue-500`) — only custom tokens
- **Never** hardcode colors in style props — use theme tokens
- **Never** import `expo-blur` directly in feature components (future stories use BlurWrapper)

### Provider Hierarchy After This Story

```
<ThemeProvider>                      ← NOT in this story (Story 1-2)
  <GestureHandlerRootView>          ← existing
    <Provider store={store}>         ← existing Redux
      <PaperProvider>                ← existing (removed in Epic 6)
        <StatusBar />
        <MainApp />
      </PaperProvider>
    </Provider>
  </GestureHandlerRootView>
```

ThemeProvider is NOT part of this story — it comes in Story 1-2.

### Key Existing Files Being Modified

| File | Modification |
|---|---|
| `App.js` | Add `import './global.css'`, add `useFonts()` for JetBrains Mono, handle font loading state |
| `app/common/theme.js` | Add `lightTheme`/`darkTheme` palette exports, rename `blueGreyNew` → `lightMapStyle`, add `darkMapStyle`, export Tailwind-importable values. **Keep existing default export working** |
| `package.json` | New deps: nativewind, react-native-css-interop, tailwindcss, expo-blur, @expo-google-fonts/jetbrains-mono |

### Key New Files Being Created

| File | Purpose |
|---|---|
| `tailwind.config.js` | NativeWind preset, content paths, complete design token system |
| `babel.config.js` | NativeWind Babel presets |
| `metro.config.js` | NativeWind Metro wrapper |
| `global.css` | Tailwind directives |

### Current Project State

- **No babel.config.js or metro.config.js exist** — Expo uses defaults. Creating these overrides Expo defaults, so include `babel-preset-expo` and `getDefaultConfig` respectively.
- **React Native 0.83.2, Expo SDK 55, Reanimated 4.2.1** — NativeWind v4.2.2 is compatible (includes Reanimated v4 patch)
- **Do NOT add** `react-native-worklets/plugin` to Babel — Reanimated v4 includes worklets internally
- **Existing theme.js** exports a default object with `blueGrey` and `googleDefault` configs, plus `blueGreyNew` map style and color constants (firStrokeColor, firFillColor, etc.)

### Project Structure Notes

- All new config files go in project root: `tailwind.config.js`, `babel.config.js`, `metro.config.js`, `global.css`
- Font files auto-managed by `@expo-google-fonts/jetbrains-mono` (no manual asset linking needed)
- Alignment with CLAUDE.md: no TypeScript, 4-space indent, semicolons, single quotes, PascalCase .jsx / camelCase .js

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — NativeWind Library Selection, Configuration Files Required, Design Token System, Theme Context Architecture]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Design System Foundation, Design Token Architecture, Platform-Aware Blur Strategy]
- [Source: _bmad-output/planning-artifacts/prd.md — FR29-33 (Theming), NFR4 (Blur fallback), NFR6 (Theme no restart), NFR13 (Coexistence), NFR15-17 (Visual quality)]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1 Story 1.1 acceptance criteria]
- [Source: _bmad-output/project-context.md — Technology Stack, Framework Rules, Anti-Patterns]
- [Source: NativeWind v4 docs — https://www.nativewind.dev/docs/getting-started/installation]
- [Source: @expo-google-fonts/jetbrains-mono — https://www.npmjs.com/package/@expo-google-fonts/jetbrains-mono]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
