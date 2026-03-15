# Story 1.2: Theme Provider & Dual Map Styling

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want the app to detect my system theme preference and style the map accordingly,
So that VatView matches my device's light/dark setting from the moment I open it.

## Acceptance Criteria

1. **Given** the NativeWind infrastructure from Story 1.1 is in place, **When** `ThemeProvider.jsx` is created and wrapped around the app in `App.js`, **Then** `ThemeContext` provides `isDark`, `activeMapStyle`, `toggleTheme()`, and `themePreference` ('system' | 'light' | 'dark')
2. **Given** `theme.js` already exports `lightTheme`, `darkTheme`, `lightMapStyle`, and `darkMapStyle` from Story 1.1, **When** ThemeProvider initializes, **Then** it selects the correct theme palette and map style based on current color scheme
3. **Given** the app is running, **When** the device system color scheme changes, **Then** `useColorScheme()` detects the change and the app automatically updates to the matching theme (if `themePreference === 'system'`)
4. **Given** the user manually selects a theme override (light or dark), **When** the selection is made via `toggleTheme()`, **Then** the preference is persisted to AsyncStorage and restored on next cold start
5. **Given** `MapComponent.jsx` currently uses `theme.blueGrey.customMapStyle`, **When** ThemeProvider is active, **Then** `MapComponent.jsx` reads `activeMapStyle` from ThemeContext and applies it as the `customMapStyle` prop on MapView
6. **Given** a theme change occurs (system or manual), **When** the theme transitions, **Then** the change applies instantly with no app restart (NFR6)
7. **Given** the dark map style is active, **When** viewing the map, **Then** the map style visually complements the dark UI tokens — deep navy/charcoal base, subtle road lines, muted labels (NFR17)
8. **Given** NativeWind `dark:` variant is configured, **When** ThemeProvider toggles to dark mode, **Then** NativeWind's `colorScheme` is set to 'dark' and all `dark:` CSS classes activate throughout the app

## Tasks / Subtasks

- [x] Task 1: Create ThemeProvider.jsx with ThemeContext (AC: #1, #2, #3, #4, #8)
  - [x] 1.1: Create `app/common/ThemeProvider.jsx` with `ThemeContext` using `React.createContext()`
  - [x] 1.2: Implement `useColorScheme()` from `react-native` to detect system preference
  - [x] 1.3: Implement `themePreference` state ('system' | 'light' | 'dark') with AsyncStorage persistence
  - [x] 1.4: On mount, read persisted preference from AsyncStorage key `'themePreference'`; default to `'system'`
  - [x] 1.5: Derive `isDark` boolean: if preference is 'system', use `useColorScheme()` result; otherwise use preference directly
  - [x] 1.6: Derive `activeTheme` (lightTheme or darkTheme from themeTokens.js) and `activeMapStyle` (lightMapStyle or darkMapStyle from theme.js) based on `isDark`
  - [x] 1.7: Implement `toggleTheme(newPreference)` function that updates state and persists to AsyncStorage
  - [x] 1.8: Set NativeWind's color scheme via `useColorScheme` from `nativewind` — call `setColorScheme('dark')` or `setColorScheme('light')` when `isDark` changes
  - [x] 1.9: Export `ThemeContext`, `ThemeProvider`, and a `useTheme()` convenience hook
- [x] Task 2: Wrap App.js with ThemeProvider (AC: #1, #6)
  - [x] 2.1: Import `ThemeProvider` in `App.js`
  - [x] 2.2: Wrap existing component tree: `ThemeProvider` goes inside `GestureHandlerRootView` but outside `Provider` (Redux) — see provider hierarchy in Dev Notes
  - [x] 2.3: Verify StatusBar style updates based on theme (light-content for dark, dark-content for light)
- [x] Task 3: Update MapComponent.jsx to use ThemeContext (AC: #5, #7)
  - [x] 3.1: Import `useTheme` from ThemeProvider in `MapComponent.jsx`
  - [x] 3.2: Replace `theme.blueGrey.customMapStyle` with `activeMapStyle` from `useTheme()`
  - [x] 3.3: Verify map re-renders with new style when theme changes (MapView accepts dynamic `customMapStyle`)
- [x] Task 4: Run lint and verify no regressions (AC: #6)
  - [x] 4.1: Run `npm run lint` — fix any new lint errors
  - [x] 4.2: Verify existing screens still render correctly (no broken imports, no missing theme values)
  - [x] 4.3: Verify `PaperProvider` still works alongside ThemeProvider (coexistence during migration)

## Dev Notes

### Architecture Requirements

**ThemeProvider is a lightweight React context** — NOT a Redux slice. Architecture decision: NativeWind handles all UI component theming via `dark:` class variants; ThemeContext only provides map style selection, `isDark` boolean, and manual override persistence.

**Provider Hierarchy (after this story):**
```
<GestureHandlerRootView>        ← existing
  <ThemeProvider>                ← NEW — this story
    <Provider store={store}>     ← existing Redux
      <PaperProvider>            ← existing (removed in Epic 6)
        <StatusBar />
        <MainApp />
      </PaperProvider>
    </Provider>
  </ThemeProvider>
</GestureHandlerRootView>
```

ThemeProvider MUST be outside Redux Provider because it doesn't depend on Redux state — it only depends on system color scheme and AsyncStorage.

### NativeWind Dark Mode Integration

NativeWind v4 uses `setColorScheme()` from the `nativewind` package to control dark mode. This is how you make `dark:` class variants work:

```javascript
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
// useNativeWindColorScheme returns { colorScheme, setColorScheme, toggleColorScheme }
```

**Critical:** There are TWO `useColorScheme` hooks in play:
1. `useColorScheme` from `react-native` — reads the system OS preference (returns 'light' | 'dark')
2. `useColorScheme` from `nativewind` — controls NativeWind's dark mode rendering (provides `setColorScheme`)

Name them distinctly to avoid confusion (e.g., `useColorScheme` for RN, `useNativeWindColorScheme` for NativeWind).

### AsyncStorage Key

Use `'themePreference'` as the AsyncStorage key. Values: `'system'`, `'light'`, `'dark'`.

The app already uses AsyncStorage extensively (see `app/common/storageService.js`). Import from `@react-native-async-storage/async-storage` which is already a project dependency.

### Current MapComponent.jsx State

`MapComponent.jsx` at `app/components/vatsimMapView/MapComponent.jsx` currently:
- Imports `theme` from `../../common/theme`
- Uses `theme.blueGrey.customMapStyle` on line 26
- This must change to `activeMapStyle` from ThemeContext
- The `theme` import can remain for other potential uses, but map style comes from context now

### Current theme.js Exports

`theme.js` already exports (from Story 1-1):
- Named: `lightTheme`, `darkTheme`, `lightMapStyle`, `darkMapStyle`, `tokens`
- Default: `{ blueGrey: { theme, customMapStyle }, googleDefault: { customMapStyle }, ... color constants }`

The `lightMapStyle` and `darkMapStyle` named exports from `theme.js` are what ThemeProvider should import for `activeMapStyle`.

### Current App.js Structure

App.js currently:
1. Imports `global.css` (NativeWind)
2. Loads JetBrains Mono fonts via `useFonts`
3. Loads saved state from AsyncStorage
4. Parses boundary GeoJSON
5. Creates Redux store with preloaded state
6. Renders: `GestureHandlerRootView > Provider > PaperProvider > StatusBar + MainApp`

The ThemeProvider insertion point is between `GestureHandlerRootView` and `Provider`.

### StatusBar Behavior

Currently hardcoded: `style="light"` and `backgroundColor={theme.blueGrey.theme.colors.primary}`.

After this story, StatusBar should respond to theme:
- Dark mode: `style="light"` (white text on dark status bar)
- Light mode: `style="dark"` (dark text on light status bar)
- The `backgroundColor` prop only affects Android and can use `activeTheme.surface.base` or remain as-is for now (will be refined in Epic 2 with full-bleed map)

### What This Story Does NOT Do

- Does NOT create a Settings UI for theme selection — that's Story 6-3
- Does NOT create BlurWrapper or TranslucentSurface — those are Story 1-3
- Does NOT modify any list views, detail panels, or other screens — just ThemeProvider + MapComponent
- Does NOT remove react-native-paper — that's Story 6-5

### Previous Story (1-1) Learnings

- `themeTokens.js` is a **CJS module** (uses `module.exports`) for Node.js/Tailwind compatibility — ThemeProvider should import from it using ESM `import` syntax (works because Metro handles the interop)
- NativeWind and StyleSheet coexist fine — no conflicts
- `theme.js` default export must remain working for backward compatibility (other files still import `theme.blueGrey.customMapStyle`)
- MapView accepts `customMapStyle` as a dynamic prop — it re-renders when the value changes

### Project Structure Notes

- `ThemeProvider.jsx` goes in `app/common/` (utility-level, shared across all features)
- PascalCase `.jsx` for React components, per project conventions
- No TypeScript, 4-space indent, semicolons, single quotes
- Do NOT add `@param` or JSDoc type annotations

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Theme Context Architecture, Provider Hierarchy]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Design Token Architecture, Theme Switching Journey]
- [Source: _bmad-output/planning-artifacts/prd.md — FR29-33 (Theming), NFR6 (Theme no restart), NFR17 (Visual quality)]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1 Story 1.2 acceptance criteria]
- [Source: _bmad-output/project-context.md — Technology Stack, Framework Rules, Anti-Patterns]
- [Source: _bmad-output/implementation-artifacts/1-1-nativewind-infrastructure-and-design-token-system.md — Previous story learnings, compatibility findings]
- [Source: NativeWind v4 dark mode — https://www.nativewind.dev/docs/dark-mode]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- ESLint passed with 0 new errors (only 5 pre-existing warnings in plugin files)
- Verified NativeWind `darkMode: 'class'` already configured in `tailwind.config.js` — `setColorScheme()` works without error
- Verified `@react-native-async-storage/async-storage` is already a project dependency

### Completion Notes List

- **Task 1:** Created `app/common/ThemeProvider.jsx` with full ThemeContext implementation. Uses `useColorScheme` from `react-native` for system detection, `useColorScheme` from `nativewind` for NativeWind dark mode sync (`setColorScheme`). State: `themePreference` ('system'|'light'|'dark') persisted to AsyncStorage key `'themePreference'`. Derives `isDark`, `activeTheme`, `activeMapStyle`. Exports `ThemeProvider` (default), `useTheme` hook, and `ThemeContext`.
- **Task 2:** Wrapped App.js component tree with `<ThemeProvider>` inside `GestureHandlerRootView` but outside Redux `Provider`. Created `app/common/StatusBarController.jsx` — extracts StatusBar to a child component that uses `useTheme()` to dynamically set `style="light"` (dark mode) or `style="dark"` (light mode). Removed unused direct `StatusBar` import from App.js.
- **Task 3:** Updated `MapComponent.jsx` to import `useTheme` from ThemeProvider, replaced hardcoded `theme.blueGrey.customMapStyle` with `activeMapStyle` from context. Removed unused `theme` import. MapView re-renders dynamically when theme changes.
- **Task 4:** ESLint passes with 0 errors. All imports resolve correctly. PaperProvider remains functional alongside ThemeProvider — no conflicts in provider hierarchy.

### Known Limitations

- **PaperProvider dark theme not wired:** `PaperProvider` in `App.js` remains hardcoded to `theme.blueGrey.theme` (a light MD3 theme). A dark MD3 Paper theme is not yet defined in `theme.js`. Full Paper dark theme support is deferred to Epic 6 (Story 6-5: Remove react-native-paper). `ThemeContext` correctly provides `activeTheme` token objects for NativeWind-based components, but Paper components will remain light-themed until Epic 6.

### Change Log

- 2026-03-15: Initial implementation — ThemeProvider with system detection, NativeWind dark mode sync, AsyncStorage persistence, StatusBarController, MapComponent theme integration
- 2026-03-15: Code review fixes — (H1) added input validation to `toggleTheme()`; (H2/M3) fixed cold-start theme flash by calling `setColorScheme` directly inside load effect and gating children render on `isLoaded`; (M1) restored `backgroundColor` prop on `StatusBarController` for Android using theme token colors; (H3) documented PaperProvider dark theme as known limitation deferred to Epic 6

### File List

- `app/common/ThemeProvider.jsx` — NEW: ThemeContext provider with system detection, NativeWind sync, AsyncStorage persistence
- `app/common/StatusBarController.jsx` — NEW: Theme-aware StatusBar component using useTheme() hook
- `App.js` — MODIFIED: Added ThemeProvider wrapper, replaced StatusBar with StatusBarController, added imports
- `app/components/vatsimMapView/MapComponent.jsx` — MODIFIED: Replaced hardcoded map style with activeMapStyle from ThemeContext
