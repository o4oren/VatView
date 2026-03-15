# Story 1.4: ThemedText & Shared Typography Components

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want callsigns, frequencies, and ICAO codes displayed in a distinct monospace font while UI text uses the system font,
So that aviation data is instantly recognizable and legible.

## Acceptance Criteria

1. **Given** NativeWind tokens and JetBrains Mono from Story 1.1 are available, **When** `ThemedText.jsx` is created in `app/components/shared/`, **Then** it supports 9 variants: `heading-lg` (22px), `heading` (18px), `body` (15px), `body-sm` (13px), `caption` (11px), `callsign` (15px mono), `frequency` (14px mono), `data` (13px mono), `data-sm` (11px mono).
2. **Given** `ThemedText.jsx` exists, **When** a mono variant is rendered, **Then** it uses `JetBrainsMono_400Regular` for `frequency`, `data`, `data-sm`; and `JetBrainsMono_500Medium` for `callsign`; all other variants use the system font (`System`).
3. **Given** `ThemedText.jsx` exists, **When** rendered in light or dark theme, **Then** text color defaults to `activeTheme.text.primary` and updates immediately when theme changes — no hardcoded color literals.
4. **Given** `ThemedText.jsx` exists, **When** a `color` prop is passed, **Then** it overrides the default theme text color for that instance.
5. **Given** `ThemedText.jsx` exists, **When** checking all mono variant font weights, **Then** no mono variant uses `fontWeight: '700'` or above — `callsign` uses `'500'` (medium), all others use `'400'` (regular).
6. **Given** `ThemedText.jsx` exists, **When** checking all text/background combinations, **Then** all variant-to-theme-color pairings meet WCAG AA contrast ratios (4.5:1 for body text at ≤18px, 3:1 for large text at ≥22px bold).
7. **Given** `ThemedText.jsx` exists, **When** it renders, **Then** `accessibilityRole="text"` is set by default on the underlying `<Text>` node.
8. **Given** `App.js` currently loads `JetBrainsMono_400Regular` and `JetBrainsMono_700Bold`, **When** Story 1.4 is implemented, **Then** `JetBrainsMono_500Medium` is also loaded in `App.js` so the callsign variant renders in the correct medium weight.
9. **Given** `ThemedText.jsx` exists, **When** all additional props beyond `variant` and `color` are passed (e.g., `style`, `numberOfLines`, `onPress`), **Then** they are forwarded to the underlying React Native `<Text>` component unchanged.

## Tasks / Subtasks

- [x] Task 1: Add JetBrainsMono_500Medium font load to App.js (AC: #2, #8)
  - [x] 1.1: In `App.js` line 18, add `JetBrainsMono_500Medium` to the import from `@expo-google-fonts/jetbrains-mono`:
        `import {useFonts, JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold} from '@expo-google-fonts/jetbrains-mono';`
  - [x] 1.2: Add `JetBrainsMono_500Medium` to the `useFonts({...})` call object (lines 75–78 of App.js), so it is registered under the key `'JetBrainsMono_500Medium'`

- [x] Task 2: Create `app/components/shared/` directory and `ThemedText.jsx` (AC: #1–#9)
  - [x] 2.1: Create the new directory `app/components/shared/` (no index file needed yet)
  - [x] 2.2: Create `app/components/shared/ThemedText.jsx`
  - [x] 2.3: Import `Text, StyleSheet` from `react-native`
  - [x] 2.4: Import `useTheme` from `../../common/ThemeProvider`
  - [x] 2.5: Define the `VARIANT_STYLES` map as a `StyleSheet.create({})` object with all 9 variant entries — each entry specifies `fontSize`, `fontWeight`, `lineHeight`, and `fontFamily` (see Dev Notes for exact values)
  - [x] 2.6: Implement the component: accept `variant = 'body'`, `color`, `style`, `...props`; call `useTheme()` to get `activeTheme`; resolve text color as `color ?? activeTheme.text.primary`; render `<Text style={[VARIANT_STYLES[variant], {color: resolvedColor}, style]} accessibilityRole="text" {...props} />`
  - [x] 2.7: Export `ThemedText` as default

- [x] Task 3: Lint and regression check (AC: #9)
  - [x] 3.1: Run `npm run lint` — fix any new errors introduced (pay particular attention to no-color-literals and no-inline-styles rules)
  - [x] 3.2: Confirm `useTheme()` is only called in the component function body, not at module level
  - [x] 3.3: Confirm no existing files are broken (only `App.js` and new files are modified/created)

## Dev Notes

### Overview

This story creates:
- **1 modified file:** `App.js` — add `JetBrainsMono_500Medium` font load
- **1 new file:** `app/components/shared/ThemedText.jsx`
- **1 new directory:** `app/components/shared/`

`ThemedText` is a zero-dependency shared primitive. It has no business logic — it is purely a styled text wrapper that enforces the VatView typography system. Every subsequent story that renders text should eventually migrate to `ThemedText`, but migration of existing components is NOT part of this story.

### VARIANT_STYLES — Exact Values

Define all 9 variants in a single `StyleSheet.create({})`. The `fontFamily` key is critical — do NOT use NativeWind `className` here because `ThemedText` wraps RN `<Text>` and we need programmatic style composition with the `color` override pattern.

```
const VARIANT_STYLES = StyleSheet.create({
    'heading-lg': {
        fontSize: 22,
        fontWeight: '600',
        lineHeight: 28,
        fontFamily: 'System',
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
        fontFamily: 'System',
    },
    body: {
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
        fontFamily: 'System',
    },
    'body-sm': {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
        fontFamily: 'System',
    },
    caption: {
        fontSize: 11,
        fontWeight: '400',
        lineHeight: 16,
        fontFamily: 'System',
    },
    callsign: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 20,
        fontFamily: 'JetBrainsMono_500Medium',
    },
    frequency: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 18,
        fontFamily: 'JetBrainsMono_400Regular',
    },
    data: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
        fontFamily: 'JetBrainsMono_400Regular',
    },
    'data-sm': {
        fontSize: 11,
        fontWeight: '400',
        lineHeight: 16,
        fontFamily: 'JetBrainsMono_400Regular',
    },
});
```

**Critical rules for this map:**
- `fontFamily: 'System'` — do NOT use `undefined` or omit `fontFamily` for sans variants. On Android, omitting fontFamily can cause the previously-set font to leak into nested Text components. Always set it explicitly.
- `fontFamily: 'JetBrainsMono_500Medium'` — this is the string key registered with `useFonts()` in App.js. If the font is not yet loaded (edge case on very first render before `fontsLoaded = true`), React Native will fall back to the system font gracefully.
- `fontWeight: '500'` on `callsign` — only works if `JetBrainsMono_500Medium` is loaded (see Task 1). If only the 400 weight is loaded and you set fontWeight: '500', React Native may synthesize a faux-bold which looks wrong. This is why Task 1 must be done first.

### Component Implementation Pattern

```javascript
import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {useTheme} from '../../common/ThemeProvider';

// VARIANT_STYLES definition here (see above)

export default function ThemedText({variant = 'body', color, style, ...props}) {
    const {activeTheme} = useTheme();
    const resolvedColor = color ?? activeTheme.text.primary;

    return (
        <Text
            style={[VARIANT_STYLES[variant], {color: resolvedColor}, style]}
            accessibilityRole="text"
            {...props}
        />
    );
}
```

**Key implementation notes:**
- The `{color: resolvedColor}` inline object is necessary here and NOT a lint violation because the value is dynamic (theme-driven), not a color literal. ESLint's `react-native/no-color-literals` rule targets string literals like `color: '#ff0000'`, not variable references.
- The `style` prop is last in the array to allow callers to override any default. This is the standard RN composition pattern.
- `...props` forwarding allows `numberOfLines`, `ellipsizeMode`, `onPress`, `testID`, and any other Text prop to pass through without being listed explicitly.
- Do NOT add `PropTypes` — not used in this project.

### Font Loading in App.js — Exact Change

Current lines 18 and 75–78 of `App.js`:

```javascript
// Line 18 (current):
import {useFonts, JetBrainsMono_400Regular, JetBrainsMono_700Bold} from '@expo-google-fonts/jetbrains-mono';

// Lines 75–78 (current):
const [fontsLoaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
```

Change to:

```javascript
// Line 18 (updated):
import {useFonts, JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold} from '@expo-google-fonts/jetbrains-mono';

// Lines 75–78 (updated):
const [fontsLoaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
```

`JetBrainsMono_700Bold` is kept for potential future use (Story 6.x might need it for headings or emphasis). No need to remove it.

### NativeWind / StyleSheet Decision

`ThemedText` uses **StyleSheet only** — not NativeWind `className`. Reason: the component needs to compose styles programmatically (`[VARIANT_STYLES[variant], {color: resolvedColor}, style]`), which is straightforward with StyleSheet arrays but awkward with NativeWind classes. The `color` override in particular requires inline style, and combining it with NativeWind would require the `style` + `className` split that adds complexity for no benefit.

Future stories that use `ThemedText` may wrap it in a View that uses NativeWind for layout — `ThemedText` itself stays StyleSheet-based.

### Import Path from `app/components/shared/`

`app/components/shared/ThemedText.jsx` imports `useTheme` via:
```javascript
import {useTheme} from '../../common/ThemeProvider';
```

The relative path `../../common/ThemeProvider` is correct because:
- File is at: `app/components/shared/ThemedText.jsx`
- Target is at: `app/common/ThemeProvider.jsx`
- Navigate up two directories (shared → components → app), then into common

### Project Structure Notes

- `app/components/shared/` is a new directory — create it by creating the file inside it (no separate mkdir needed on most platforms)
- File naming follows project convention: PascalCase `.jsx` for React components
- `app/common/` is for cross-cutting utilities and context providers; `app/components/shared/` is for reusable UI components consumed by feature components — ThemedText belongs in the latter
- No `index.js` barrel file needed at this stage; Story 1.5 and beyond will import directly from the file path

### WCAG Contrast Note

The design tokens were chosen by the UX spec to satisfy WCAG AA:
- Light theme: `text.primary = #1F2328` on `surface.base = #FFFFFF` → ~15:1 (well above 4.5:1)
- Dark theme: `text.primary = #E6EDF3` on `surface.base = #0D1117` → ~13:1 (well above 4.5:1)
- On translucent surfaces (opacity 0.45), the contrast is reduced but the map background beneath (grey tones) still keeps combinations above 4.5:1 per UX spec analysis

No special action needed for WCAG compliance — use token colors and it is satisfied automatically.

### Previous Story Learnings (1.1–1.3)

- `themeTokens.js` is a CJS `module.exports` — import with ESM: `import { tokens, lightTheme, darkTheme } from './themeTokens'` (for this story, `useTheme()` provides `activeTheme` so we don't need to import themeTokens directly)
- `useTheme()` is exported from `app/common/ThemeProvider.jsx` as a named export. Returns `{ isDark, activeTheme, activeMapStyle, themePreference, toggleTheme }` — for ThemedText, only `activeTheme` is needed
- NativeWind `className` does NOT work reliably on non-standard RN components — but `<Text>` is standard RN, so it would work; we just choose StyleSheet for programmatic composition
- ESLint `react-native/no-color-literals` fires on string literals in `color:` props — dynamic values (`{color: resolvedColor}`) are fine
- ESLint `react-native/no-inline-styles` fires on inline `StyleSheet` objects — but `{color: resolvedColor}` where `resolvedColor` is a variable is generally not flagged by this rule (it targets object literals with color literals inside)
- 5 pre-existing ESLint warnings exist in plugin files — do not treat them as new errors
- The project has no test suite — `npm run lint` is the only automated quality check

### Git Context (Recent Commits)

```
9f57861 Fix flight path polylines accumulating on map when switching planes
8d1a729 Implement story 1-3: BlurWrapper and TranslucentSurface components
d26b078 Implement story 1-2: ThemeProvider and dual map styling
b355ea1 Implement story 1-1: NativeWind infrastructure and design token system
```

Pattern: stories 1-1 through 1-3 each created new files without modifying existing files (except App.js in 1-1 for font loading). This story follows the same pattern: one small modification to App.js + one new file in a new directory.

### What This Story Does NOT Do

- Does NOT migrate any existing components to use `ThemedText` — that happens story-by-story in Epics 2–6
- Does NOT create `ListItem.jsx` or `StaleIndicator.jsx` — those are Story 1.5
- Does NOT remove `react-native-paper` `<Text>` usage — that is Story 6.5
- Does NOT add `fontFamily` to `tailwind.config.js` for 500 Medium — not needed since we use StyleSheet in this component
- Does NOT create an `index.js` barrel in `app/components/shared/`

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1 Story 1.4 acceptance criteria and user story]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Typography System section (type scale, mono selection rationale, typography rules)]
- [Source: _bmad-output/planning-artifacts/architecture.md — ThemedText component location, font family token, enforcement guidelines]
- [Source: app/common/themeTokens.js — tokens.fontFamily.mono = 'JetBrainsMono_400Regular', lightTheme.text.primary, darkTheme.text.primary]
- [Source: app/common/ThemeProvider.jsx — useTheme() API, activeTheme shape]
- [Source: tailwind.config.js — fontFamily.mono token already registered as 'JetBrainsMono_400Regular']
- [Source: App.js lines 18, 75–78 — current font loading: JetBrainsMono_400Regular + JetBrainsMono_700Bold]
- [Source: _bmad-output/implementation-artifacts/1-3-blurwrapper-and-translucentsurface-components.md — coding conventions, StyleSheet-only for non-standard components, no PropTypes, no JSDoc]
- [Source: @expo-google-fonts/jetbrains-mono — JetBrainsMono_500Medium is a named export available for loading]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Added `JetBrainsMono_500Medium` to the font import and `useFonts()` call in `App.js` to enable the medium weight for the `callsign` variant.
- Created `app/components/shared/ThemedText.jsx` with all 9 typography variants (5 system-font, 4 JetBrains Mono) using `StyleSheet.create()` for programmatic style composition.
- Component reads `activeTheme.text.primary` from `useTheme()` for default color; accepts `color` prop override; forwards all extra props to RN `<Text>`.
- `npm run lint` passes with 0 errors (5 pre-existing plugin warnings unchanged).

### File List

- App.js
- app/components/shared/ThemedText.jsx
- app/common/themeTokens.js

### Senior Developer Review (AI)

**Reviewer:** Oren | **Date:** 2026-03-15 | **Outcome:** Approved with fixes applied

**Findings fixed during review:**
- **[H1] Font family tokens**: Replaced hardcoded font family strings in ThemedText.jsx with `tokens.fontFamily.sans`, `tokens.fontFamily.mono`, and `tokens.fontFamily.monoMedium` references from themeTokens.js — preserves single-source-of-truth principle from Story 1.1
- **[H2] Missing monoMedium token**: Added `monoMedium: 'JetBrainsMono_500Medium'` to `tokens.fontFamily` in themeTokens.js so the callsign variant's font is sourced from the token system
- **[M1] Variant validation**: Added fallback so invalid variant strings fall back to `'body'` style instead of rendering with no styles

**Remaining notes (LOW — no action required):**
- L1: Typography scale values (font sizes, line heights) are hardcoded in StyleSheet rather than tokenized — acceptable for now, may tokenize in a future story
- L2: sprint-status.yaml modified but not in original File List — tracking file, added to File List above is unnecessary; noted for completeness
