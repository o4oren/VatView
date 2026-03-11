---
title: 'Expo SDK 55 Full Upgrade'
slug: 'expo-sdk-55-full-upgrade'
created: '2026-03-11'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - expo@55
  - react-native@0.79
  - react@19
  - react-navigation@7
  - react-native-paper@5
  - '@redux-devtools/extension'
  - '@babel/eslint-parser'
files_to_modify:
  - package.json
  - app.json
  - App.js
  - babel.config.js (delete)
  - metro.config.js (delete)
  - .eslintrc.json
  - app/common/theme.js
  - app/components/mainApp/MainApp.jsx
  - app/components/mainApp/MainTabNavigator.jsx
  - app/components/vatsimMapView/VatsimMapView.jsx
  - app/components/About/About.jsx
  - app/components/EventsView/VatsimEventsView.jsx
  - app/components/EventsView/EventListItem.jsx
  - app/components/EventsView/EventDetailsView.jsx
  - app/components/BookingsView/BookingsView.jsx
  - app/components/BookingsView/BookingDeatils.jsx
  - app/components/clientDetails/PilotDetails.jsx
  - app/components/clientDetails/AtcDetails.jsx
  - app/components/clientDetails/AirportAtcDetails.jsx
  - app/components/airportView/AirportListItem.jsx
  - app/components/networkStatus/networkStatus.jsx
  - app/components/settings/Settings.jsx
  - app/components/filterBar/FilterBar.jsx
  - app/components/MetarView/MetarView.jsx
  - app/components/LoadingView/LoadingView.jsx
  - app/components/vatsimListView/VatsimListView.jsx
  - app/components/airportView/AirportSearchList.jsx
code_patterns:
  - redux-4-thunks
  - react-navigation-stack-tabs
  - react-native-paper-material-design
  - expo-sqlite-async
  - expo-file-system-already-migrated
  - useNavigation-hook-pattern
  - navigation-as-prop-pattern (legacy)
  - Card-Title-render-props
  - Title-Paragraph-Caption-removed-in-v5
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
- `react-native-paper` v4 API used in 20 files (DefaultTheme, Provider, Card, List, Title, Paragraph, Caption, Avatar, etc.)
- React Navigation 6 used in 6 files: Stack at root, Bottom Tabs inside; `screenOptions` function pattern and navigation-as-prop pattern
- `@gorhom/bottom-sheet` for client detail panels on map
- `expo-sqlite` async API via singleton `getDb()` in `staticDataAcessLayer.js`
- `react-native-fs` is a dead dependency — `storageService.js` already uses `expo-file-system`
- Firebase Crashlytics for crash reporting
- `@formatjs/intl-*` polyfills loaded in `App.js` for Hermes/Android
- `redux-devtools-extension` used in App.js (line 9/15) — `composeWithDevTools`
- 6 dead dependencies: `reanimated-bottom-sheet`, `react-navigation` v5, `@react-native-community/masked-view`, `react-native-localize`, `add`, `react-native-fs`

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `package.json` | All dependencies — primary target for upgrades |
| `app.json` | Expo config, bundle IDs, Google Maps API keys |
| `App.js` | Entry point: PaperProvider theme, composeWithDevTools, StatusBar import |
| `app/common/theme.js` | Paper theme: DefaultTheme, accent color, blueGrey palette → MD3 migration |
| `app/components/mainApp/MainApp.jsx` | Root navigator: NavigationContainer, Stack.Navigator, screenOptions func, Menu, IconButton |
| `app/components/mainApp/MainTabNavigator.jsx` | Bottom tabs: createBottomTabNavigator, @expo/vector-icons |
| `app/components/About/About.jsx` | Paper: Title, Paragraph, Avatar, Divider → all need v5 migration |
| `app/components/clientDetails/PilotDetails.jsx` | Paper: Card.Title (left/right render props), Caption, ProgressBar |
| `app/components/clientDetails/AtcDetails.jsx` | Paper: Card.Title (left/right render props), Avatar |
| `app/components/clientDetails/AirportAtcDetails.jsx` | Paper: Card.Title, Button; Navigation: useNavigation |
| `app/components/airportView/AirportListItem.jsx` | Paper: Card, List.Accordion, List.Item; Navigation: useNavigation; @expo/vector-icons |
| `app/components/EventsView/VatsimEventsView.jsx` | Paper: IconButton, Colors.blue50, DatePickerModal; Navigation: nav-as-prop |
| `app/components/EventsView/EventListItem.jsx` | Paper: Card, Title; Navigation: nav-as-prop |
| `app/components/EventsView/EventDetailsView.jsx` | Paper: Card.Title, Card.Cover; route params via props |
| `app/components/BookingsView/BookingsView.jsx` | Paper: IconButton, Colors.blue50, DatePickerModal |
| `app/components/BookingsView/BookingDeatils.jsx` | Paper: Card.Title, Card.Content |
| `app/components/networkStatus/networkStatus.jsx` | Paper: Title, Card.Title, Card.Content |
| `app/components/settings/Settings.jsx` | Paper: List.Item, List.Icon, Checkbox |
| `app/components/filterBar/FilterBar.jsx` | Paper: ToggleButton, Searchbar |
| `app/components/MetarView/MetarView.jsx` | Paper: Divider, Searchbar; route params via props |
| `app/components/LoadingView/LoadingView.jsx` | Paper: Avatar, ProgressBar |
| `app/components/vatsimListView/VatsimListView.jsx` | Paper: Card wrapper |
| `app/components/airportView/AirportSearchList.jsx` | Paper: Searchbar |
| `.eslintrc.json` | Lint config — babel-eslint not configured but installed |
| `babel.config.js` | Default only — delete |
| `metro.config.js` | Default only — delete |

### Technical Decisions

- **Incremental SDK upgrades** (52→53→54→55) rather than jumping directly to reduce risk of compounding breaking changes
- **React Navigation 7**: `screenOptions` function receiving `{ navigation }` param is deprecated → use `useNavigation()` hook. `@react-navigation/material-bottom-tabs` removed → use `@react-navigation/bottom-tabs` (already in use). Navigation-as-prop pattern in EventListItem/VatsimEventsView → migrate to `useNavigation()` hook
- **react-native-paper v5**: `DefaultTheme` → `MD3LightTheme`; `accent` → `secondary`; `Title`/`Paragraph`/`Caption` components REMOVED → use `Text` with `variant` prop; `Card.Title` API restructured; `Colors.blue50` constant gone → use theme colors; `react-native-paper-dates` needs compatible version
- **New Architecture**: Enabled by default in SDK 53+; `react-native-fs` already replaced with `expo-file-system` — just remove dead dep
- **React 19** (SDK 54+): `useContext` → `use(Context)`, `Context.Provider` → `Context`, `forwardRef` removal — audit all component usage
- **Dead dependencies**: Remove 6 unused packages: `reanimated-bottom-sheet`, `react-navigation`, `@react-native-community/masked-view`, `react-native-localize`, `add`, `react-native-fs`
- **@expo/vector-icons**: Still functional in SDK 55 but on deprecation path. Keep for now, note for future migration to `expo-symbols`

## Implementation Plan

### Phase 0: Clean Up Dead Dependencies

- [ ] Task 0.1: Remove dead dependencies from package.json
  - File: `package.json`
  - Action: Remove these unused packages: `reanimated-bottom-sheet`, `react-navigation`, `@react-native-community/masked-view`, `react-native-localize`, `add`, `react-native-fs`
  - Notes: None of these are imported anywhere in the codebase. Verified by grep.

- [ ] Task 0.2: Replace redux-devtools-extension
  - File: `App.js`
  - Action: Change `import { composeWithDevTools } from 'redux-devtools-extension'` → `import { composeWithDevTools } from '@redux-devtools/extension'`
  - File: `package.json`
  - Action: Remove `redux-devtools-extension`, add `@redux-devtools/extension`

- [ ] Task 0.3: Replace babel-eslint and fix ESLint config
  - File: `package.json`
  - Action: Remove `babel-eslint` from devDependencies, add `@babel/eslint-parser`. Note: `@babel/eslint-parser` may require ESLint 8+ — if so, also upgrade `eslint` to ^8.0.0 and update `eslint-config-airbnb` and plugins to compatible versions.
  - File: `.eslintrc.json`
  - Action: Add `"parser": "@babel/eslint-parser"` if needed. Also fix the duplicate `"plugins"` key — lines 10-14 define `["react", "react-native", "react-hooks"]` but lines 26-29 redefine `["react", "react-native"]`, silently dropping `react-hooks`. Merge into a single `plugins` array.

- [ ] Task 0.4: Clean up commented-out dead code in App.js
  - File: `App.js`
  - Action: Remove the commented-out `react-native-localize` references (lines 54-55: `// let RNLocalize = require('react-native-localize')` and the related timezone line). This dead code will confuse future agents.

- [ ] Task 0.5: Delete metro.config.js (default only)
  - File: `metro.config.js` — delete (only contains `getDefaultConfig` default)
  - Notes: Do NOT delete `babel.config.js` yet — SDK 52 requires it. Defer deletion to Phase 1 (after SDK 53 upgrade makes it optional).

- [ ] Task 0.6: Run `npm install` and verify app still builds
  - Action: `npm install && npx expo-doctor`

### Phase 1: Expo SDK 52 → 53

- [ ] Task 1.1: Upgrade Expo SDK to 53
  - Action: `npx expo install expo@^53.0.0 && npx expo install --fix`
  - Notes: SDK 53 enables New Architecture by default. React Native upgrades to ~0.77.x. Remove `"newArchEnabled": true` from app.json if present (it's the default now).

- [ ] Task 1.1b: Delete babel.config.js (now safe after SDK 53)
  - File: `babel.config.js` — delete (SDK 53+ auto-manages babel config)
  - Notes: Was deferred from Phase 0 because SDK 52 required this file.

- [ ] Task 1.1c: Audit expo-localization API changes
  - File: `App.js`
  - Action: Check if `require('expo-localization').timezone` still works in SDK 53's `expo-localization`. The API may have changed to `Localization.getCalendars()` or `Localization.timezone` may have moved. This is in the critical polyfill code path that runs on every Android startup.
  - Notes: If the API changed, update the timezone access pattern accordingly.

- [ ] Task 1.2: Run diagnostics
  - Action: `npx expo-doctor`
  - Action: Fix any flagged incompatibilities

- [ ] Task 1.3: Regenerate native projects
  - Action: `npx expo prebuild --clean`
  - Action: `cd ios && LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install --repo-update`

- [ ] Task 1.4: Verify build
  - Action: Build Android (`sdk use java 17.0.13-amzn && npx expo run:android`)
  - Action: Build iOS (`npx expo run:ios`)
  - Action: Fix any compilation errors

### Phase 2: Expo SDK 53 → 54

- [ ] Task 2.1: Upgrade Expo SDK to 54
  - Action: `npx expo install expo@^54.0.0 && npx expo install --fix`
  - Notes: SDK 54 brings React 19 and React Native ~0.78.x. Key React 19 changes: `useContext(Ctx)` → `use(Ctx)`, `<Ctx.Provider>` → `<Ctx>`, `forwardRef` removal.

- [ ] Task 2.2: Upgrade react-redux for React 19 compatibility
  - File: `package.json`
  - Action: Upgrade `react-redux` from v7 to v8+ (`npx expo install react-redux@^8.0.0`). react-redux v7 uses `useContext` internally and is incompatible with React 19. v8+ is required.
  - Action: Also search codebase for `useContext`, `Context.Provider`, `forwardRef` usage in app code and update if found.
  - Notes: The app's own code uses `useSelector`/`useDispatch` (not direct `useContext`), but the library implementing those hooks must itself be React 19 compatible. Also check `redux-devtools-extension` replacement works with react-redux v8.

- [ ] Task 2.3: Install react-native-worklets (required for reanimated in SDK 54+)
  - Action: `npx expo install react-native-worklets`
  - Notes: Required dependency for react-native-reanimated to work in SDK 54+

- [ ] Task 2.4: Run diagnostics and rebuild
  - Action: `npx expo-doctor && npx expo prebuild --clean`
  - Action: Build and verify on both platforms

### Phase 3: Expo SDK 54 → 55

- [ ] Task 3.1: Upgrade Expo SDK to 55
  - Action: `npx expo install expo@latest && npx expo install --fix`
  - Notes: SDK 55 is the latest stable. React Native ~0.79.x.

- [ ] Task 3.2: Run diagnostics and rebuild
  - Action: `npx expo-doctor && npx expo prebuild --clean`
  - Action: Build and verify on both platforms

- [ ] Task 3.3: Housekeeping per SDK 54/55 guidelines
  - File: `package.json`
  - Action: Remove implicit packages if still present: `@babel/core`, `expo-constants`. Note: `babel-preset-expo` is NOT in package.json (only referenced in the now-deleted babel.config.js), so no action needed for it.
  - Action: Delete `sdkVersion` from `app.json` if present
  - Notes: These are auto-managed by Expo in SDK 54+

- [ ] Task 3.4: Upgrade react-native-render-html
  - File: `package.json`
  - Action: Upgrade `react-native-render-html` from v5.1.0 to latest v6.x (`npx expo install react-native-render-html@^6.0.0`). v5 is ancient and likely incompatible with RN 0.79 + New Architecture.
  - File: `app/components/EventsView/EventDetailsView.jsx`
  - File: `app/components/EventsView/EventListItem.jsx`
  - Action: Update any v6 breaking API changes (v6 renamed some props and changed the rendering engine). Check import paths and component props.
  - Notes: This is a critical missed dependency — without this upgrade, event detail screens will likely crash.

- [ ] Task 3.5: Upgrade fast-xml-parser
  - File: `package.json`
  - Action: Check if `fast-xml-parser` v3 still works with the current codebase. If deprecation warnings appear or it causes issues, upgrade to v4 (`npx expo install fast-xml-parser@^4.0.0`). v4 has breaking changes in parser options — audit usage in the codebase.
  - Notes: Used for parsing METAR/VATSIM XML data. Test that parsing still works after any upgrade.

### Phase 4: React Navigation 6 → 7

- [ ] Task 4.1: Upgrade React Navigation packages
  - File: `package.json`
  - Action: Install v7 versions: `npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs`
  - Action: Migrate from `@react-navigation/stack` (JS-based) to `@react-navigation/native-stack` (native, recommended in v7). This means changing `createStackNavigator` → `createNativeStackNavigator` in MainApp.jsx. Native-stack has different screen option names (e.g., `headerMode` removed, `TransitionPresets` not available — use `animation` prop instead).
  - Action: Remove `@react-navigation/stack`, `@react-navigation/material-bottom-tabs`, `@react-navigation/material-top-tabs`, and `react-native-tab-view`
  - Notes: If native-stack causes issues with the current header/menu pattern, fall back to keeping `@react-navigation/stack` v7 (still supported but not recommended).

- [ ] Task 4.2: Migrate MainApp.jsx (root navigator)
  - File: `app/components/mainApp/MainApp.jsx`
  - Action: Update `screenOptions` function — the `({ navigation })` parameter pattern is deprecated in v7. Extract navigation actions using `useNavigation()` hook or move menu into a separate header component.
  - Action: Verify `NavigationContainer` ref and `onStateChange` patterns still work in v7
  - Action: Update any changed Screen option names

- [ ] Task 4.3: Migrate MainTabNavigator.jsx (bottom tabs)
  - File: `app/components/mainApp/MainTabNavigator.jsx`
  - Action: Verify `createBottomTabNavigator` API compatibility with v7
  - Action: Update `screenOptions` prop names if any changed (e.g., `tabBarStyle`, `tabBarItemStyle`)
  - Notes: This file uses static screenOptions (not function), so migration should be straightforward

- [ ] Task 4.4: Migrate navigation-as-prop pattern
  - File: `app/components/EventsView/VatsimEventsView.jsx`
  - Action: Replace `{navigation}` prop with `useNavigation()` hook. Remove navigation prop passing to EventListItem.
  - File: `app/components/EventsView/EventListItem.jsx`
  - Action: Replace `{event, navigation}` props with `{event}` only. Add `const navigation = useNavigation()` inside component. Add `import { useNavigation } from '@react-navigation/native'`.

- [ ] Task 4.5: Verify route params access
  - File: `app/components/EventsView/EventDetailsView.jsx`
  - Action: Verify `props.route.params` access pattern works in v7
  - File: `app/components/MetarView/MetarView.jsx`
  - Action: Verify `{route}` destructured prop works in v7
  - Notes: These patterns are generally forward-compatible but should be tested

- [ ] Task 4.6: Verify existing useNavigation usage
  - File: `app/components/airportView/AirportListItem.jsx`
  - File: `app/components/clientDetails/AirportAtcDetails.jsx`
  - Action: Verify `useNavigation()` + `navigation.navigate()` still works (should be fine in v7)

### Phase 5: react-native-paper v4 → v5

- [ ] Task 5.1: Upgrade Paper and related packages
  - File: `package.json`
  - Action: `npx expo install react-native-paper@^5.0.0`
  - Action: Upgrade `react-native-paper-dates` to v0.22+ (the v5-compatible line). Check npm for the latest version that supports Paper v5. If no compatible version exists, replace `DatePickerModal` with a custom date picker or use `@react-native-community/datetimepicker` as fallback. This affects `BookingsView.jsx` and `VatsimEventsView.jsx`.
  - Notes: Paper v5 uses Material Design 3. Significant API changes.

- [ ] Task 5.2: Migrate theme configuration
  - File: `app/common/theme.js`
  - Action: Replace `import { DefaultTheme } from 'react-native-paper'` → `import { MD3LightTheme } from 'react-native-paper'`
  - Action: Replace `accent` color key → `secondary`
  - Action: Map existing color palette to MD3 design tokens (surface, inverseSurface, error, errorContainer, outlineVariant, etc.)
  - Action: Preserve custom `blueGrey` structure and Google Maps style (non-Paper related)
  - Notes: Primary color `#2a5d99` should map to `primary` token. Keep the same visual identity.

- [ ] Task 5.3: Migrate removed components (Title, Paragraph, Caption)
  - File: `app/components/About/About.jsx`
  - Action: Replace `<Title>` → `<Text variant="titleLarge">`, `<Paragraph>` → `<Text variant="bodyMedium">`
  - File: `app/components/EventsView/EventListItem.jsx`
  - Action: Replace `<Title>` → `<Text variant="titleLarge">`
  - File: `app/components/networkStatus/networkStatus.jsx`
  - Action: Replace `<Title>` → `<Text variant="titleLarge">`
  - File: `app/components/clientDetails/PilotDetails.jsx`
  - Action: Replace `<Caption>` → `<Text variant="bodySmall">`
  - Notes: Remove Title, Paragraph, Caption from all import statements

- [ ] Task 5.4: Migrate Card.Title usage (9 files)
  - Files: `AirportListItem.jsx`, `PilotDetails.jsx`, `AtcDetails.jsx`, `AirportAtcDetails.jsx`, `BookingDeatils.jsx`, `EventDetailsView.jsx`, `EventListItem.jsx`, `networkStatus.jsx`, `BookingsView.jsx`
  - Action: Verify Card.Title API in v5 — `title`, `subtitle`, `left`, `right` render prop signatures may have changed
  - Action: Update any breaking prop changes while preserving visual appearance
  - Notes: Card.Title with left/right render props is the most heavily used pattern (9 files)

- [ ] Task 5.5: Migrate Colors constant usage
  - File: `app/components/BookingsView/BookingsView.jsx`
  - Action: Replace `Colors.blue50` → use theme color via `useTheme()` hook or define in theme.js
  - File: `app/components/EventsView/VatsimEventsView.jsx`
  - Action: Replace `Colors.blue50` AND `Colors.white` (used in StyleSheet) → use theme colors
  - Notes: The `Colors` export is removed in Paper v5. Search all files for any `Colors.` usage.

- [ ] Task 5.6: Migrate IconButton `color` → `iconColor` prop
  - File: `app/components/mainApp/MainApp.jsx`
  - Action: Replace `color={'white'}` → `iconColor={'white'}` on IconButton (or better, use theme color)
  - File: `app/components/BookingsView/BookingsView.jsx`
  - Action: Replace `color={Colors.blue50}` → `iconColor={theme.colors.primary}` (or equivalent)
  - File: `app/components/EventsView/VatsimEventsView.jsx`
  - Action: Same — `color` → `iconColor`
  - Notes: In Paper v5, `IconButton`'s `color` prop was renamed to `iconColor`. This is a guaranteed runtime breakage.

- [ ] Task 5.7: Fix hardcoded color literals during theme migration
  - File: `app/components/mainApp/MainApp.jsx`
  - Action: Replace hardcoded `backgroundColor: '#2A5D99'`, `headerTintColor: '#ffffff'`, `color={'white'}` with references to `theme.js` colors. These violate the project's own lint rules and will diverge from the new MD3 theme.
  - File: `app/components/EventsView/VatsimEventsView.jsx`
  - Action: Replace hardcoded `backgroundColor: '#4d7199'` with theme reference
  - Notes: While these are pre-existing violations, the theme overhaul is the right time to fix them.

- [ ] Task 5.8: Verify remaining Paper components
  - Files: `FilterBar.jsx` (ToggleButton, Searchbar), `Settings.jsx` (List.Item, List.Icon, Checkbox), `MetarView.jsx` (Divider, Searchbar), `LoadingView.jsx` (Avatar, ProgressBar), `MainApp.jsx` (Menu, Menu.Item), `VatsimListView.jsx` (Card), `AirportSearchList.jsx` (Searchbar)
  - Action: Test each component for v5 API compatibility. Fix any prop name changes.
  - Notes: Most of these are lower-risk (Searchbar, Divider, Avatar, ProgressBar are generally stable)

- [ ] Task 5.9: Update PaperProvider in App.js
  - File: `App.js`
  - Action: Verify PaperProvider accepts the migrated theme object
  - Action: Update StatusBar color access if theme structure changed

### Phase 6: Final Verification

- [ ] Task 6.1: Clean install and diagnostics
  - Action: `rm -rf node_modules .expo && npm install && npx expo-doctor`

- [ ] Task 6.2: Regenerate native projects
  - Action: `npx expo prebuild --clean`
  - Action: `cd ios && LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install --repo-update`

- [ ] Task 6.3: Build and run Android
  - Action: `sdk use java 17.0.13-amzn && npx expo run:android`
  - Action: Verify app launches, map loads, data appears

- [ ] Task 6.4: Build and run iOS
  - Action: `npx expo run:ios`
  - Action: Verify app launches, map loads, data appears

- [ ] Task 6.5: Run ESLint
  - Action: `npm run lint`
  - Action: Fix any new lint errors introduced by migration

- [ ] Task 6.6: Update project-context.md
  - File: `_bmad-output/project-context.md`
  - Action: Update Technology Stack section with new versions (Expo 55, RN 0.79, React 19, Nav 7, Paper v5)
  - Action: Update any rules that changed (e.g., Paper v5 API patterns, removed components)

### Acceptance Criteria

- [ ] AC 1: Given the upgraded project, when running `npx expo-doctor`, then no errors are reported for SDK 55 compatibility
- [ ] AC 2: Given an Android emulator with JDK 17, when running `npx expo run:android`, then the app builds successfully and installs on the emulator
- [ ] AC 3: Given an iOS simulator, when running `npx expo run:ios`, then the app builds successfully and installs on the simulator
- [ ] AC 4: Given the app is running on either platform, when the app launches, then the map view loads with pilot markers and ATC data within 30 seconds
- [ ] AC 5: Given the app is running, when tapping a pilot marker on the map, then the bottom sheet opens showing pilot details with Card.Title and flight info
- [ ] AC 6: Given the app is running, when navigating to the List tab, then the pilot/ATC list renders with filter bar (ToggleButton, Searchbar) functional
- [ ] AC 7: Given the app is running, when navigating to the Events tab, then events load and tapping an event navigates to Event Details view
- [ ] AC 8: Given the app is running, when navigating to the Airports tab and selecting an airport, then METAR data loads and airport details render correctly
- [ ] AC 9: Given the upgraded package.json, when checking dependencies, then none of the 6 dead packages are present (reanimated-bottom-sheet, react-navigation, masked-view, react-native-localize, add, react-native-fs)
- [ ] AC 10: Given the upgraded codebase, when running `npm run lint`, then no new lint errors are introduced by the migration
- [ ] AC 11: Given the theme migration, when viewing the app, then the visual appearance matches the pre-upgrade blueGrey theme (primary `#2a5d99`, same general color scheme)
- [ ] AC 12: Given the upgraded app running on either platform, when checking the JS runtime, then New Architecture is active (verify via Expo dev menu or `global.__turboModuleProxy` check)
- [ ] AC 13: Given the upgraded package.json, when checking `react-redux`, then version is 8.x+ (React 19 compatible)
- [ ] AC 14: Given the Events tab, when viewing event details with HTML content, then `react-native-render-html` v6 renders correctly without crashes

## Additional Context

### Dependencies

- JDK 17 required for Android builds (installed via sdkman: `17.0.13-amzn`)
- CocoaPods requires `LANG=en_US.UTF-8` / `LC_ALL=en_US.UTF-8` environment variables
- Google Maps API keys in `app.json` must be preserved
- Firebase config files (`GoogleService-Info.plist`, `google-services.json`) must be preserved through prebuild
- `react-native-worklets` required for reanimated in SDK 54+
- `@redux-devtools/extension` replaces `redux-devtools-extension`
- `@babel/eslint-parser` replaces `babel-eslint`

### Testing Strategy

- After each SDK bump: `npx expo-doctor` to validate compatibility
- After Phase 3 (SDK 55): verify builds on both platforms before proceeding to library migrations
- After Phase 4 (Navigation): test all navigation flows (tab switching, stack push/pop, deep links)
- After Phase 5 (Paper v5): visual inspection of every screen for theme/component regressions
- After Phase 6 (Final): full smoke test on both platforms — map, list, airports, events, bookings, settings, about
- Run `npm run lint` at final stage to catch style regressions

### Notes

- `expo-status-bar` deep import already fixed (`App.js` line 13)
- iOS CocoaPods UTF-8 encoding issue is an environment problem — set `LANG`/`LC_ALL` before pod install
- Android duplicate launcher icons (`.png` + `.webp`) resolved by `prebuild --clean`
- `@expo/vector-icons` still works in SDK 55 — defer migration to `expo-symbols` to a future task
- `react-native-paper-dates` v0.4.6 may not be compatible with Paper v5 — check for updated version
- The `add` package is accidental (npm artifact) — removing it has zero code impact
- `react-native-fs` is already unused in code — storageService.js uses expo-file-system
- If Paper v5 visual changes are too drastic, consider using `MD2Theme` compat mode (Paper v5 supports it) to preserve Material Design 2 look while gaining v5 compatibility
- **Risk window (F14):** Between Phase 2 (React 19) and Phase 4 (Nav 7), React Navigation 6 runs under React 19. If Nav 6 uses deprecated React patterns internally (like `defaultProps` on function components), the app may crash. Mitigate by completing Phase 4 immediately after Phase 3. If builds break, fast-track Nav 7 upgrade.
- **Version verification (F17):** SDK 54/55 version numbers and their corresponding RN versions are based on current knowledge. Verify actual versions at implementation time — `npx expo install --fix` will resolve correct compatible versions automatically.
- `react-native-render-html` v5 is likely incompatible with RN 0.79 + New Architecture. v6 migration is critical for event detail screens.
- `fast-xml-parser` v3 is deprecated. v4 has breaking changes in parser options. Test METAR/VATSIM data parsing after any upgrade.
