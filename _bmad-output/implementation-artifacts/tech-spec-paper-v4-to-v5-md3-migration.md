---
title: 'react-native-paper v4 to v5 migration (MD3)'
slug: 'paper-v4-to-v5-md3-migration'
created: '2026-03-12'
status: 'completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['react-native-paper 5.15.0', 'react-native-paper-dates 0.23.4', 'React Native 0.81.5', 'Expo SDK 54']
files_to_modify: ['package.json', 'app/common/theme.js', 'app/components/mainApp/MainApp.jsx', 'app/components/airportView/AirportListItem.jsx', 'app/components/clientDetails/AirportAtcDetails.jsx', 'app/components/clientDetails/PilotDetails.jsx', 'app/components/BookingsView/BookingsView.jsx', 'app/components/EventsView/VatsimEventsView.jsx', 'app/components/EventsView/EventListItem.jsx', 'app/components/About/About.jsx', 'app/components/networkStatus/networkStatus.jsx']
code_patterns: ['MD3LightTheme replaces DefaultTheme', 'Title/Caption/Paragraph replaced with Text variant prop', 'accent renamed to secondary in MD3', 'Colors replaced with theme refs', 'Button color prop renamed to textColor', 'IconButton color prop renamed to iconColor', 'All color literals pulled into theme.js using standard MD3 color slots']
test_patterns: ['No test suite — manual verification + npm run lint']
---

# Tech-Spec: react-native-paper v4 to v5 migration (MD3)

**Created:** 2026-03-12

## Overview

### Problem Statement

VatView uses react-native-paper v4.4.1 which is unmaintained and does not support Fabric/New Architecture. This blocks upgrading to Expo SDK 55 (which mandates New Architecture). Paper v5 added Fabric support in v5.13.0.

### Solution

Fully migrate to paper v5 with MD3 (Material Design 3) theme. Update all files that import from react-native-paper: migrate theme system, replace removed typography components, update renamed props, and pull all color literals into theme.js using standard MD3 color slots.

### Scope

**In Scope:**
- Bump `react-native-paper` to `^5.x` and `react-native-paper-dates` to `^0.23.x`
- Migrate theme from `DefaultTheme` → `MD3LightTheme` with proper MD3 color slots
- Replace removed typography: `Title` → `Text variant="titleLarge"`, `Caption` → `Text variant="bodySmall"`, `Paragraph` → `Text variant="bodyMedium"`
- Rename `accent` → `secondary` in theme
- Rename Button `color` → `textColor`, IconButton `color` → `iconColor`
- Replace all `Colors.*` imports and inline color literals with theme references
- Lint clean after changes

**Out of Scope:**
- Expo 55 upgrade (separate effort)
- Navigation or other dependency upgrades
- New paper v5 component features (e.g., SegmentedButtons, Tooltip)

## Context for Development

### Codebase Patterns

- Project uses plain JS/JSX, no TypeScript
- All colors must come from `app/common/theme.js` — no inline color literals (ESLint error)
- Styles defined via `StyleSheet.create()` only
- Components use `export default function ComponentName()`
- Semicolons required, single quotes, 4-space indentation

### Technical Decisions

- **Full MD3 migration** — not MD2 compat mode. Long-term maintainability over short-term convenience.
- **Standard MD3 color slots** for color literals — map existing hardcoded colors to MD3 semantic slots.
- **Build verified:** paper 5.15.0 + paper-dates 0.23.4 builds and runs cleanly on Expo 54 / iOS (spiked 2026-03-12).
- **Keep `theme.blueGrey` wrapper structure** — consumers access `theme.blueGrey.theme.colors.*`.

### Color Literal → MD3 Slot Mapping

| Current Literal | Used In | MD3 Slot | Rationale |
| --------------- | ------- | -------- | --------- |
| `color={'grey'}` on Button | AirportListItem:72, AirportAtcDetails:38 | `onSurfaceVariant` | Grey text on surface = MD3 `onSurfaceVariant` |
| `color={'white'}` on IconButton | MainApp:111 | `onPrimary` | White icon on primary-colored header |
| `Colors.blue50` on IconButton | BookingsView:95, VatsimEventsView:93 | `secondaryContainer` | Light blue accent for interactive elements |
| `Colors.white` in StyleSheet | VatsimEventsView:123 | `surface` | White background surface |

## Implementation Plan

### Tasks

- [x] Task 1: Bump dependencies in package.json
  - File: `package.json`
  - Action: Change `react-native-paper` from `^4.4.1` to `^5.x` and `react-native-paper-dates` from `^0.4.6` to `^0.23.x`
  - Run: `npm install`
  - Notes: Build spike confirmed these versions work. `@react-navigation/material-bottom-tabs@6.2.29` is compatible with paper 5.15.0.

- [x] Task 2: Migrate theme.js to MD3
  - File: `app/common/theme.js`
  - Action:
    - Change import from `import {DefaultTheme} from 'react-native-paper'` to `import {MD3LightTheme} from 'react-native-paper'`
    - Replace `...DefaultTheme` with `...MD3LightTheme`
    - Replace `...DefaultTheme.colors` with `...MD3LightTheme.colors`
    - Rename `accent: '#2a5d99'` to `secondary: '#2a5d99'`
    - Add new MD3 color slots needed by components:
      - `onPrimary: '#ffffff'` (for white-on-primary icon buttons)
      - `onSurfaceVariant: '#808080'` (for grey button text, maps to the `'grey'` literal)
      - `secondaryContainer: '#e3f2fd'` (for light blue accent, maps to `Colors.blue50`)
      - `surface: '#ffffff'` (for white surface backgrounds)
    - Keep existing custom properties: `primary`, `text`, `placeholder`, `onBackground`
  - Notes: The `theme.blueGrey.theme` wrapper structure stays intact. All consumers that access `theme.blueGrey.theme.colors.primary` etc. will continue to work.

- [x] Task 3: Update MainApp.jsx — IconButton color prop
  - File: `app/components/mainApp/MainApp.jsx`
  - Action: Line 111 — change `color={'white'}` to `iconColor={theme.blueGrey.theme.colors.onPrimary}`
  - Notes: Need to add `import theme from '../../common/theme';` at top of file.

- [x] Task 4: Update AirportListItem.jsx — Button color prop
  - File: `app/components/airportView/AirportListItem.jsx`
  - Action: Line 72 — change `color={'grey'}` to `textColor={theme.blueGrey.theme.colors.onSurfaceVariant}`
  - Notes: `theme` is already imported in this file.

- [x] Task 5: Update AirportAtcDetails.jsx — Button color prop
  - File: `app/components/clientDetails/AirportAtcDetails.jsx`
  - Action: Line 38 — change `color={'grey'}` to `textColor={theme.blueGrey.theme.colors.onSurfaceVariant}`
  - Notes: Need to add `import theme from '../../common/theme';` at top of file.

- [x] Task 6: Update BookingsView.jsx — Colors import
  - File: `app/components/BookingsView/BookingsView.jsx`
  - Action:
    - Line 4: Change import from `{IconButton, Searchbar, Colors}` to `{IconButton, Searchbar}`
    - Add `import theme from '../../common/theme';`
    - Line 95: Change `color={Colors.blue50}` to `iconColor={theme.blueGrey.theme.colors.secondaryContainer}`
  - Notes: Remove `Colors` from import entirely, use theme reference.

- [x] Task 7: Update VatsimEventsView.jsx — Colors import + StyleSheet
  - File: `app/components/EventsView/VatsimEventsView.jsx`
  - Action:
    - Line 6: Change import from `{IconButton, Searchbar, Colors}` to `{IconButton, Searchbar}`
    - Line 93: Change `color={Colors.blue50}` to `iconColor={theme.blueGrey.theme.colors.secondaryContainer}`
    - Line 123: Change `backgroundColor: Colors.white` to `backgroundColor: theme.blueGrey.theme.colors.surface`
  - Notes: `theme` is already imported in this file.

- [x] Task 8: Update About.jsx — Title + Paragraph removal
  - File: `app/components/About/About.jsx`
  - Action:
    - Line 2: Change import from `{Paragraph, Avatar, Text, Title, Divider}` to `{Avatar, Text, Divider}`
    - Line 19: Change `<Title>About VatView</Title>` to `<Text variant="titleLarge">About VatView</Text>`
    - Lines 20, 33, 39, 45: Change all `<Paragraph>` to `<Text variant="bodyMedium">` and `</Paragraph>` to `</Text>`
  - Notes: Straightforward find-and-replace within the file.

- [x] Task 9: Update networkStatus.jsx — Title removal
  - File: `app/components/networkStatus/networkStatus.jsx`
  - Action:
    - Line 2: Change import from `{Text, Title, Card}` to `{Text, Card}`
    - Line 37: Change `<Title>VATSIM Network Status</Title>` to `<Text variant="titleLarge">VATSIM Network Status</Text>`

- [x] Task 10: Update EventListItem.jsx — Title removal
  - File: `app/components/EventsView/EventListItem.jsx`
  - Action:
    - Line 4: Change import from `{Card, Text, Title}` to `{Card, Text}`
    - Line 22: Change `<Title>{event.name}</Title>` to `<Text variant="titleLarge">{event.name}</Text>`

- [x] Task 11: Update PilotDetails.jsx — Caption removal
  - File: `app/components/clientDetails/PilotDetails.jsx`
  - Action:
    - Line 2: Change import from `{Avatar, Caption, Card, List, ProgressBar, Text}` to `{Avatar, Card, List, ProgressBar, Text}`
    - Lines 71, 73: Change `<Caption>` to `<Text variant="bodySmall">` and `</Caption>` to `</Text>`
    - Lines 94, 95: Change `<Caption style={styles.name}>` to `<Text variant="bodySmall" style={styles.name}>` and `</Caption>` to `</Text>`

- [x] Task 12: Run lint and verify
  - Action: Run `npm run lint` and fix any remaining issues
  - Notes: Key things to check:
    - No `Colors` imports remaining
    - No inline color literals (`color={'grey'}`, `color={'white'}`)
    - No removed component imports (`Title`, `Caption`, `Paragraph`)
    - All files pass ESLint

### Acceptance Criteria

- [x] AC 1: Given paper v5 is installed, when running `npx expo run:ios`, then the app builds without errors
- [x] AC 2: Given the theme is migrated to MD3LightTheme, when the app loads, then the primary color (#2a5d99) is correctly applied to the header, tab bar, and all themed components
- [x] AC 3: Given Title components are replaced with Text variant="titleLarge", when viewing About, Network Status, and Event List screens, then titles render with appropriate large styling
- [x] AC 4: Given Caption components are replaced with Text variant="bodySmall", when viewing PilotDetails (with a flight plan), then route and remarks text render in smaller body style, and airport names below the progress bar render correctly
- [x] AC 5: Given Paragraph components are replaced with Text variant="bodyMedium", when viewing the About screen, then body text paragraphs render with appropriate medium styling
- [x] AC 6: Given Button color prop is replaced with textColor, when tapping METAR on AirportListItem or AirportAtcDetails, then the button text appears in grey (onSurfaceVariant) and navigates to Metar screen
- [x] AC 7: Given IconButton color prop is replaced with iconColor, when viewing the header menu dots icon, then it appears white on the blue header
- [x] AC 8: Given Colors.blue50 is replaced with theme.secondaryContainer, when viewing BookingsView or VatsimEventsView, then the calendar icon button renders in a light blue shade
- [x] AC 9: Given Colors.white is replaced with theme.surface, when viewing VatsimEventsView, then the flat list background is white
- [x] AC 10: Given all changes are complete, when running `npm run lint`, then zero errors are reported

## Additional Context

### Dependencies

- react-native-paper: ^4.4.1 → ^5.x (verified: 5.15.0 works)
- react-native-paper-dates: ^0.4.6 → ^0.23.x (verified: 0.23.4 works)
- `@react-navigation/material-bottom-tabs@6.2.29` — confirmed compatible with paper 5.15.0

### Testing Strategy

- No test suite configured — manual verification
- Run `npm run lint` after all changes — must pass with zero errors
- Visual verification on iOS simulator for each affected screen:
  - Map view (header + menu icon)
  - Airport details (METAR button, ATC/flight lists)
  - Pilot details (captions, progress bar, airport names)
  - Events view (title, search, calendar icon, list background)
  - Bookings view (calendar icon, search)
  - About screen (title, paragraphs, dividers)
  - Network status (title, cards)

### Notes

- **Risk:** MD3 theme may slightly alter default component styling (elevation, border radius, spacing) compared to v4. Visual review should flag any unacceptable differences.
- **Future consideration:** Once on paper v5, individual components can be gradually updated to use MD3 design tokens and new features in future sprints.
- **paper-dates v0.23.4** — the `DatePickerModal` component's props (`mode`, `visible`, `onDismiss`, `date`, `onConfirm`, `validRange`, `saveLabel`) appear stable between versions. Verify visually that the date picker renders correctly.
- Files that only use stable components (Card, List, Searchbar, Avatar, Checkbox, ProgressBar, Divider, ToggleButton, Menu) need no code changes — just verify they render correctly with the new theme.

## Review Notes
- Adversarial review completed
- Findings: 6 total, 5 fixed, 1 skipped (F6 — low/undecided semantic token choice)
- Resolution approach: auto-fix
- Additional fixes beyond original spec: FilterBar.jsx ToggleButton `color` → `iconColor`, theme `text`/`placeholder` → MD3 slots `onSurface`/`outline`, `onBackground` moved to custom `inactiveTabTint` property, package.json semver fixed, BookingsView `validRange.start` → `startDate`
