---
title: 'Expo SDK 55 Full Upgrade'
slug: 'expo-sdk-55-full-upgrade'
created: '2026-03-11'
status: 'in-progress'
stepsCompleted: [1]
tech_stack:
  - expo@55
  - react-native@0.79
  - react@19
  - react-navigation@7
  - react-native-paper@5
files_to_modify:
  - package.json
  - app.json
  - App.js
  - babel.config.js
  - metro.config.js
  - app/components/mainApp/MainApp.jsx
  - app/components/mainApp/MainTabNavigator.jsx
  - app/components/vatsimMapView/VatsimMapView.jsx
  - app/common/theme.js
  - app/common/storageService.js
  - app/redux/actions/staticAirspaceDataActions.js
code_patterns:
  - redux-4-thunks
  - react-navigation-stack-tabs
  - react-native-paper-material-design
  - expo-sqlite-async
  - expo-file-system
test_patterns: []
---

# Tech-Spec: Expo SDK 55 Full Upgrade

**Created:** 2026-03-11

## Overview

### Problem Statement

VatView is on Expo SDK 52 (partially upgraded from 51) with outdated dependencies, deprecated packages, and React Navigation 6. Several packages are unmaintained or deprecated. The app needs to be brought current to leverage the latest platform capabilities, security fixes, and New Architecture support.

### Solution

Incrementally upgrade Expo SDK 52 → 53 → 54 → 55, upgrading all dependencies at each step, replacing deprecated packages, migrating to React Navigation 7, replacing `react-native-fs` with `expo-file-system`, enabling New Architecture, and fixing all breaking changes until the app builds and runs on both iOS and Android.

### Scope

**In Scope:**

- Expo SDK 52 → 55 (incremental upgrades via `npx expo install expo@latest` + `--fix`)
- React Navigation 6 → 7 migration (breaking API changes)
- Replace deprecated packages:
  - `@react-native-community/masked-view` → `@react-native-masked-view/masked-view`
  - `react-navigation` v5 (remove — unused legacy peer dep)
  - `reanimated-bottom-sheet` v1-alpha (remove — `@gorhom/bottom-sheet` already in use)
  - `redux-devtools-extension` → `@redux-devtools/extension`
  - `babel-eslint` → `@babel/eslint-parser`
  - `react-native-paper` v4 → v5 (Material Design v3 API migration)
- Replace `react-native-fs` with `expo-file-system` (already a dependency)
- Enable New Architecture (default in SDK 53+)
- Delete redundant config files (`babel.config.js`, `metro.config.js` — both are defaults)
- Remove implicit packages (`@babel/core`, `babel-preset-expo`, `expo-constants`)
- Fix all breaking changes at each SDK bump
- Verify builds on iOS simulator and Android emulator

**Out of Scope:**

- General code quality pass / bug hunting beyond upgrade breakage
- New features or architectural refactoring
- TypeScript migration
- Redux Toolkit migration
- App Store / Play Store submissions

## Context for Development

### Codebase Patterns

- Plain JavaScript/JSX — no TypeScript
- Redux 4 + redux-thunk 2 — NOT Redux Toolkit; 4 slices: `vatsimLiveData`, `staticAirspaceData`, `app`, `metar`
- All styles via `StyleSheet.create()` — no inline styles, no color literals
- All colors from `app/common/theme.js` (blueGrey theme, primary `#2a5d99`)
- `react-native-paper` v4 API used throughout (DefaultTheme, Provider, Surface, Card, etc.)
- React Navigation 6: Stack at root, Bottom Tabs inside, Material Bottom Tabs for main nav
- `@gorhom/bottom-sheet` for client detail panels on map
- `expo-sqlite` async API via singleton `getDb()` in `staticDataAcessLayer.js`
- `react-native-fs` used in `storageService.js` for large JSON blob persistence
- Firebase Crashlytics for crash reporting
- `@formatjs/intl-*` polyfills loaded in `App.js` for Hermes/Android

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `package.json` | All dependencies — primary target for upgrades |
| `app.json` | Expo config, bundle IDs, Google Maps API keys |
| `App.js` | Entry point, store creation, Intl polyfills, PaperProvider |
| `app/components/mainApp/MainApp.jsx` | Navigation container, data orchestration, polling |
| `app/components/mainApp/MainTabNavigator.jsx` | Bottom tab navigator — React Nav migration target |
| `app/common/theme.js` | Theme definition — Paper v5 migration target |
| `app/common/storageService.js` | `react-native-fs` usage — replace with `expo-file-system` |
| `app/redux/actions/staticAirspaceDataActions.js` | `react-native-fs` usage for FIR boundaries |
| `.eslintrc.json` | Lint config — `babel-eslint` parser replacement |
| `babel.config.js` | Default only — delete |
| `metro.config.js` | Default only — delete |

### Technical Decisions

- **Incremental SDK upgrades** (52→53→54→55) rather than jumping directly to reduce risk of compounding breaking changes
- **React Navigation 7**: Requires migrating from `screenOptions` prop patterns to new API; `@react-navigation/material-bottom-tabs` is removed in v7 — use `react-native-paper`'s built-in bottom navigation or `@react-navigation/bottom-tabs` with custom tab bar
- **react-native-paper v5**: Theme API changes from `DefaultTheme` to `MD3LightTheme`; component API changes (e.g., `Card.Title` → different prop names)
- **New Architecture**: Enabled by default in SDK 53+; `react-native-fs` is incompatible — replacing with `expo-file-system` resolves this
- **React 19** (SDK 54+): `useContext` → `use(Context)`, `Context.Provider` → `Context`, `forwardRef` removal — audit all component usage

## Implementation Plan

### Tasks

_To be completed in Step 2 (Deep Investigation)_

### Acceptance Criteria

_To be completed in Step 3 (Generate)_

## Additional Context

### Dependencies

- JDK 17 required for Android builds (installed via sdkman: `17.0.13-amzn`)
- CocoaPods requires `LANG=en_US.UTF-8` / `LC_ALL=en_US.UTF-8` environment variables
- Google Maps API keys in `app.json` must be preserved
- Firebase config files (`GoogleService-Info.plist`, `google-services.json`) must be preserved through prebuild

### Testing Strategy

- After each SDK bump: `npx expo-doctor` to validate compatibility
- After all upgrades: `npx expo run:android` on emulator, `npx expo run:ios` on simulator
- Manual smoke test: map loads, pilot markers appear, ATC polygons render, bottom sheet opens, list view filters work

### Notes

- `expo-status-bar` deep import already fixed (`App.js` line 13)
- iOS CocoaPods UTF-8 encoding issue is an environment problem, not a code issue
- Android duplicate launcher icons (`.png` + `.webp`) resolved by prebuild --clean
- `add` package in dependencies appears to be accidental — consider removing
