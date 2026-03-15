# Story 1.3: BlurWrapper & TranslucentSurface Components

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want UI elements to have a translucent frosted-glass appearance over the map,
So that I can see the map beneath floating UI elements, creating the immersive HUD experience.

## Acceptance Criteria

1. **Given** the theme system from Story 1.2 is in place, **When** `BlurWrapper.jsx` is created in `app/common/`, **Then** on iOS it renders `BlurView` from `expo-blur` with native backdrop blur using the `tint` and `intensity` props.
2. **Given** `BlurWrapper.jsx` exists, **When** rendering on Android, **Then** it renders a semi-transparent solid `View` background using the `surface.border` color token for a 1px border and `elevation: 4` shadow — no blur attempted (permanent platform design decision).
3. **Given** `BlurWrapper.jsx` exists, **When** it is used, **Then** it accepts `intensity` (default: `20`, used on iOS only) and `opacity` prop with three string presets: `'surface'` (0.45), `'surface-dense'` (0.65), `'overlay'` (0.85) — all mapped from `themeTokens.js`.
4. **Given** `BlurWrapper.jsx` exists, **When** `opacity` is `'surface'`, **Then** the background color is derived from `activeTheme.surface.elevated`; for `'surface-dense'` from `activeTheme.surface.elevatedDense`; for `'overlay'` from `activeTheme.surface.overlay`.
5. **Given** `TranslucentSurface.jsx` is created in `app/common/`, **When** used in a screen, **Then** it wraps `BlurWrapper` with `overflow: 'hidden'` (required for iOS blur shape-clipping) and applies border radius, giving the standard floating panel appearance.
6. **Given** `TranslucentSurface.jsx` exists, **When** used, **Then** it accepts `opacity` ('surface' | 'surface-dense' | 'overlay'), `intensity` (passed to BlurWrapper on iOS), `style`, `children`, and `rounded` (default `'xl'`) props.
7. **Given** both components exist, **When** rendering in light theme, **Then** iOS uses `tint='light'` BlurView and Android uses `lightTheme.surface.elevated` RGBA background; in dark theme, iOS uses `tint='dark'` and Android uses `darkTheme.surface.elevated` RGBA background.
8. **Given** both components exist, **When** displayed over the map, **Then** the default `'surface'` opacity preset maintains consistent ~0.45 opacity across both light and dark themes (NFR15).
9. **Given** the codebase, **When** checking all files for `expo-blur` imports, **Then** only `BlurWrapper.jsx` imports from `expo-blur` — all other components obtain blur behavior exclusively through `BlurWrapper` or `TranslucentSurface`.

## Tasks / Subtasks

- [x] Task 1: Create BlurWrapper.jsx — platform-aware translucency primitive (AC: #1, #2, #3, #4, #7, #8, #9)
  - [x] 1.1: Create `app/common/BlurWrapper.jsx`
  - [x] 1.2: Import `BlurView` from `expo-blur` (already installed: `expo-blur ~55.0.9`)
  - [x] 1.3: Import `Platform, View, StyleSheet` from `react-native`; import `useTheme` from `./ThemeProvider`; import `tokens` from `./themeTokens`
  - [x] 1.4: Define `BG_COLOR_MAP` helper inside component or as pure function: maps `opacity` prop + `activeTheme` → correct RGBA string (`'surface'→activeTheme.surface.elevated`, `'surface-dense'→activeTheme.surface.elevatedDense`, `'overlay'→activeTheme.surface.overlay`)
  - [x] 1.5: iOS branch — `Platform.OS === 'ios'`: render `<BlurView tint={isDark ? 'dark' : 'light'} intensity={intensity} style={[{backgroundColor}, style]} {...props}>{children}</BlurView>`
  - [x] 1.6: Android branch — render `<View style={[styles.androidBase, {backgroundColor, borderColor: activeTheme.surface.border}, style]} {...props}>{children}</View>`
  - [x] 1.7: Create `styles = StyleSheet.create({ androidBase: { borderWidth: 1, elevation: 4 } })`
  - [x] 1.8: Default props: `intensity = tokens.blur.surfaceIos` (= 20), `opacity = 'surface'`
  - [x] 1.9: Export `BlurWrapper` as default

- [x] Task 2: Create TranslucentSurface.jsx — styled wrapper for floating panels (AC: #5, #6, #7)
  - [x] 2.1: Create `app/common/TranslucentSurface.jsx`
  - [x] 2.2: Import `StyleSheet` from `react-native`; import `BlurWrapper` from `./BlurWrapper`
  - [x] 2.3: Accept props: `children`, `opacity = 'surface'`, `intensity`, `rounded = 'xl'`, `style`, `...props`
  - [x] 2.4: Render `<BlurWrapper opacity={opacity} intensity={intensity} style={[styles.base, style]} {...props}>{children}</BlurWrapper>`
  - [x] 2.5: `styles.base` must include `overflow: 'hidden'` (critical — clips iOS blur to border radius) and `borderRadius: 16` (matching rounded-xl / 16px design token)
  - [x] 2.6: Export `TranslucentSurface` as default

- [x] Task 3: Verify theme correctness and AC compliance (AC: #7, #8, #9)
  - [x] 3.1: Confirm BlurView `tint` prop changes with `isDark` — no hardcoded 'dark' or 'light' strings
  - [x] 3.2: Confirm Android `backgroundColor` comes from `activeTheme.surface.*` tokens only — no hardcoded RGBA values
  - [x] 3.3: Confirm `borderColor` uses `activeTheme.surface.border` — no hardcoded color
  - [x] 3.4: Search codebase: only `BlurWrapper.jsx` contains `from 'expo-blur'` (AC #9)

- [x] Task 4: Lint and regression check
  - [x] 4.1: Run `npm run lint` — fix any new errors introduced
  - [x] 4.2: Confirm `ThemeProvider.jsx` still exports `useTheme` correctly (BlurWrapper depends on it)
  - [x] 4.3: Confirm no existing file is broken by the new additions (no modified existing files expected in this story)

## Dev Notes

### Overview

This story creates two new files in `app/common/`: `BlurWrapper.jsx` and `TranslucentSurface.jsx`. No existing files are modified. These components form the visual foundation for all floating HUD elements introduced in Epic 2 and beyond.

### Component Hierarchy

```
TranslucentSurface
└── BlurWrapper
    ├── iOS: <BlurView> (expo-blur, native UIVisualEffectView)
    └── Android: <View> (solid translucency with border + elevation)
```

**Rule:** Future Epic 2+ components (NavIsland, FilterChip, DetailSheet) will import `TranslucentSurface` from `app/common/TranslucentSurface.jsx`. They must NEVER import `expo-blur` directly. `BlurWrapper` is a primitive — typically only `TranslucentSurface` uses it, not feature components.

### expo-blur API (v55 / Expo SDK 55)

`expo-blur` is already installed at `~55.0.9`. The `BlurView` API:
- `tint`: `'light' | 'dark' | 'default' | 'extraLight' | 'regular' | 'prominent'` — use `'light'` or `'dark'` to match the active theme. The tint controls the saturation and color tone of the blur overlay.
- `intensity`: `0–100` — `20` is the design token default (`tokens.blur.surfaceIos`). Higher values = stronger blur.
- `style`: standard React Native style — pass `backgroundColor` here to add a color tint on top of the blur effect (this is how we layer the surface RGBA color over the OS blur).
- `experimentalBlurMethod` — do NOT use (Android experimental, not relevant here).

**Important:** iOS BlurView renders natively via `UIVisualEffectView` — it is hardware-accelerated and has essentially zero performance cost even with multiple overlapping layers. The `overflow: 'hidden'` on the parent container is what clips the blur to match the border radius.

### Platform Design Decision

The Android fallback is **not a degradation** — it is a permanent design decision:
- Android's software blur cannot reliably maintain 60fps with multiple overlapping translucent layers on React Native's current rendering stack.
- The Android version uses semi-transparent solid panels that look intentionally premium (clean glass-panel aesthetic).
- Both platforms share the same opacity values, color tokens, and border radius — only the blur effect differs.
- This decision must NOT be revisited or "fixed" in future stories unless there is a native Android blur solution. Do not use `experimentalBlurMethod` from expo-blur.

### Design Token Mapping

The `opacity` prop maps to these token values (from `app/common/themeTokens.js`):

| opacity prop | tokens key | dark background | light background |
|---|---|---|---|
| `'surface'` | `tokens.opacity.surface` = 0.45 | `rgba(22, 27, 34, 0.45)` | `rgba(255, 255, 255, 0.50)` |
| `'surface-dense'` | `tokens.opacity.surfaceDense` = 0.65 | `rgba(22, 27, 34, 0.65)` | `rgba(255, 255, 255, 0.70)` |
| `'overlay'` | `tokens.opacity.overlay` = 0.85 | `rgba(22, 27, 34, 0.85)` | `rgba(255, 255, 255, 0.90)` |

These exact RGBA strings are already stored in `themeTokens.js` as `darkTheme.surface.elevated`, `darkTheme.surface.elevatedDense`, `darkTheme.surface.overlay` (and light equivalents). **Do NOT hardcode these values** — always access via `activeTheme.surface.*` from `useTheme()`.

### Border and Shadow

- **iOS:** No explicit border needed — BlurView's visual effect provides natural separation from the map background. If a border is needed, it should be applied on a wrapper View (deferred to Epic 2).
- **Android:** `borderWidth: 1` + `borderColor: activeTheme.surface.border` + `elevation: 4`. The border provides the panel separation that blur would otherwise provide on iOS. The `surface.border` token is `rgba(0,0,0,0.08)` (light) or `rgba(255,255,255,0.08)` (dark) — a very subtle 1px hairline.

### NativeWind / className Usage

NativeWind `className` does NOT reliably work on `BlurView` (expo-blur is not a core React Native component). Use **StyleSheet only** in `BlurWrapper.jsx`.

In `TranslucentSurface.jsx`, all styling should be done via StyleSheet as well, since the primary consumer is `BlurWrapper` (which uses StyleSheet). If a future story requires NativeWind className on `TranslucentSurface`, it can be applied to an outer wrapper View — but this story does not introduce that pattern.

### overflow: 'hidden' Is Critical

`overflow: 'hidden'` in `TranslucentSurface`'s `styles.base` is mandatory for iOS. Without it, the BlurView renders its blur effect beyond its visible bounds (rect with border radius is clipped visually by the layout engine, but the blur effect bleeds outside). This causes visible artifacts at the corners of the panel.

### Border Radius Alignment

Use `borderRadius: 16` in `TranslucentSurface.styles.base`. This corresponds to `rounded-2xl` in Tailwind (16px). The UX spec uses `rounded-2xl` for floating panels. Future stories (Epic 2) may pass a different `rounded` prop — for now the default 16px is hardcoded in `styles.base` since only one radius value is needed in this story.

### useTheme Hook

`useTheme()` is exported from `app/common/ThemeProvider.jsx` (implemented in Story 1.2). It returns:
```javascript
{
    isDark,           // boolean
    activeTheme,      // lightTheme or darkTheme object from themeTokens.js
    activeMapStyle,   // for map use (not needed here)
    themePreference,  // 'system' | 'light' | 'dark'
    toggleTheme,      // function
}
```

BlurWrapper needs `isDark` (for BlurView `tint`) and `activeTheme` (for background color and border color).

### Project Structure Notes

- Both new files go in `app/common/` — they are app-wide primitives used by all feature areas
- PascalCase `.jsx` for React components (BlurWrapper.jsx, TranslucentSurface.jsx)
- No TypeScript, 4-space indent, semicolons, single quotes — match existing code style in `ThemeProvider.jsx`
- Do NOT add JSDoc/PropTypes annotations — not used in this project
- No test suite configured in this project (`npm run lint` is the only automated check)

### What This Story Does NOT Do

- Does NOT modify any existing files (App.js, MapComponent.jsx, etc.)
- Does NOT create NavIsland, FilterChip, or any Epic 2 UI — those come in Epic 2
- Does NOT wire TranslucentSurface into any existing screen — just creates the component
- Does NOT add Android experimental blur (`experimentalBlurMethod`) — permanent design decision
- Does NOT use NativeWind className on BlurView or BlurWrapper — StyleSheet only

### Previous Story Learnings (1-1 and 1-2)

- `themeTokens.js` is a CJS module (`module.exports`) — import from it using ESM `import { tokens, darkTheme, lightTheme } from './themeTokens'` (Metro handles the interop)
- `useTheme()` from `ThemeProvider.jsx` is the ONLY way to access the active theme — do NOT import lightTheme/darkTheme directly and choose based on system preference yourself
- NativeWind `className` works on standard RN Views/Text; partial support on third-party components — for BlurView, use StyleSheet
- The project has 5 pre-existing ESLint warnings in plugin files — do not treat those as new errors

### Git Context

Recent commits show a clean implementation pattern:
- Story 1-1: Infrastructure files only (babel/metro/css/tailwind configs + themeTokens.js + theme.js changes)
- Story 1-2: New component files (ThemeProvider.jsx, StatusBarController.jsx) + minimal App.js modifications

This story follows the pattern: create new files, do not modify existing ones.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1 Story 1.3 acceptance criteria and user story]
- [Source: _bmad-output/planning-artifacts/architecture.md — BlurWrapper platform strategy, NFR4 (blur performance), NFR15 (opacity consistency), NFR16 (no hardcoded colors)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Translucency design intent, Platform-Aware Blur Strategy, Component Library Specification for TranslucentSurface]
- [Source: _bmad-output/implementation-artifacts/1-1-nativewind-infrastructure-and-design-token-system.md — themeTokens.js structure, NativeWind compatibility matrix]
- [Source: _bmad-output/implementation-artifacts/1-2-theme-provider-and-dual-map-styling.md — useTheme() API, ThemeProvider exports, coding conventions]
- [Source: app/common/themeTokens.js — tokens.blur.surfaceIos (= 20), tokens.opacity.*, darkTheme.surface.*, lightTheme.surface.*]
- [Source: app/common/ThemeProvider.jsx — useTheme() hook, ThemeContext exports]
- [Source: expo-blur ~55.0.9 — BlurView props: tint, intensity, style]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

None.

### Completion Notes List

- Created `BlurWrapper.jsx`: platform-aware translucency primitive. iOS uses `expo-blur` `BlurView` with `tint` driven by `isDark` and `intensity` defaulting to `tokens.blur.surfaceIos` (20). Android uses solid `View` with `borderWidth: 1`, `elevation: 4`, and colors from `activeTheme.surface.*` tokens.
- Created `TranslucentSurface.jsx`: styled wrapper with `overflow: 'hidden'` and `borderRadius: 16` to clip iOS blur to rounded shape. Accepts `opacity`, `intensity`, `rounded`, `style`, and `children` props.
- `getBgColor` pure function maps `opacity` prop (`'surface'`, `'surface-dense'`, `'overlay'`) to the correct RGBA string from `activeTheme.surface.*` — no hardcoded values.
- `npm run lint` passes with 0 errors (5 pre-existing warnings in plugin files unchanged).
- Confirmed only `BlurWrapper.jsx` imports from `expo-blur` (AC #9).
- No existing files were modified.

### File List

- app/common/BlurWrapper.jsx (new)
- app/common/TranslucentSurface.jsx (new)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)

### Change Log

- 2026-03-15: Implemented Story 1.3 — Created BlurWrapper.jsx and TranslucentSurface.jsx as platform-aware translucency primitives for the HUD layer system.
- 2026-03-15: Code review fixes — TranslucentSurface: implemented BORDER_RADIUS_MAP so `rounded` prop is functional (was silently ignored); corrected default from `'xl'` to match Tailwind-aligned 16px preset; BlurWrapper: added JSDoc-style comments documenting iOS overflow constraint and Android intensity no-op.
