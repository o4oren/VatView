# Story 6.3: Settings with Theme Picker

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a single Settings screen that combines theme selection, app information, network status, and version details,
so that I have one place to configure the app and check its status.

## Acceptance Criteria

1. **AC1 — Settings is a single scrollable screen with four sections in order: Theme, About, Network Status, Version.** `Settings.jsx` is the single consolidated screen. All sections render in a `ScrollView` using `activeTheme` tokens — no `LinearGradient`, no `react-native-paper`.

2. **AC2 — Theme section: three options shown.** A `ThemePicker` component renders three selectable options: `System` (auto), `Dark` (always dark), `Light` (always light). The current selection is visually highlighted (accent border + filled background chip, same style as `FilterChipsRow` active chip). Inactive options use inactive chip style. ThemePicker accommodates future additions without restructuring.

3. **AC3 — Theme preference applies instantly and persists.** Tapping an option calls `toggleTheme(preference)` from `useTheme()`. The change applies immediately (map + UI re-render). The preference is persisted to AsyncStorage by `ThemeProvider` (already implemented) and restores on cold start. No additional Redux wiring needed.

4. **AC4 — About section absorbs `About.jsx` content.** Settings shows: VatView logo (`assets/icon-256.png`, 48×48, borderRadius 10), app name (`heading` variant), tagline `"Your mobile VATSIM companion"` (`caption` / `activeTheme.text.secondary`), brief description text (`body-sm` / `activeTheme.text.secondary`), and attribution links (Freepik, Roundicons, VAT-Spy Data Project, SimAware TRACON Project). `About.jsx` is deleted.

5. **AC5 — Network Status section absorbs `networkStatus.jsx` content.** Settings shows pilot count (`state.vatsimLiveData.clients.pilots.length`), ATC count (`state.vatsimLiveData.clients.controllerCount`), and the full VATSIM server list (`state.vatsimLiveData.servers[]` — name, location, hostname_or_ip). If data is unavailable, show `"N/A"`. `networkStatus.jsx` is deleted.

6. **AC6 — Version section.** Shows: App version (`Constants.expoConfig?.version`), Expo SDK (`Constants.expoConfig?.sdkVersion`), React Native version (formatted from `Platform.constants?.reactNativeVersion`), Update Channel (`Updates.channel || 'N/A'`), Update ID (`Updates.updateId || 'N/A'`), VATSpy Boundaries tag (from `getReleaseTag(FIR_GEOJSON_RELEASE_TAG_KEY)`), TRACON Boundaries tag (from `getReleaseTag(TRACON_RELEASE_TAG_KEY)`).

7. **AC7 — Stack screen registrations removed.** `Stack.Screen name="Network status"` and `import NetworkStatus` are removed from `MainApp.jsx`. No `About` stack screen was registered (About was already merged into Settings or not registered), so only the `"Network status"` removal is needed.

8. **AC8 — All react-native-paper imports removed from Settings.** `List`, `Checkbox`, `Text`, `Divider` from `react-native-paper` (used in current `Settings.jsx`) are replaced with NativeWind/custom components. No `react-native-paper` import in `Settings.jsx` or `ThemePicker.jsx`.

9. **AC9 — Both themes render correctly.** All colors come from `activeTheme` tokens. No color literals (except approved uses). Both light and dark themes render without regressions.

10. **AC10 — Safe area insets handled correctly.** Settings is a tab screen. Use `useSafeAreaInsets()` to apply `paddingTop: insets.top + 12` to the top of the ScrollView content area. No `SafeAreaView` component.

11. **AC11 — ESLint passes.** Zero new ESLint errors or warnings introduced.

12. **AC12 — Tests written.** `__tests__/Settings.test.js` created (minimum 6 tests). Full test suite passes with zero regressions.

## Tasks / Subtasks

- [x] Task 1: Create `ThemePicker.jsx` in `app/components/shared/` (AC: #2, #3, #9)
  - [x] 1.1: Import `useTheme` from `ThemeProvider`; destructure `themePreference`, `toggleTheme`, `activeTheme`
  - [x] 1.2: Render three `Pressable` chips: `System`, `Dark`, `Light` — horizontal row, equal width or auto-sized
  - [x] 1.3: Active chip: `borderWidth: 1.5`, `borderColor: activeTheme.accent.primary`, `borderRadius: tokens.radius.md`, `paddingHorizontal: 12`, `paddingVertical: 6`; inactive: `borderWidth: 1`, `borderColor: activeTheme.surface.border`, `opacity: 0.6`
  - [x] 1.4: Each chip label uses `<ThemedText variant="body-sm">` with `activeTheme.text.primary` (active) or `activeTheme.text.secondary` (inactive)
  - [x] 1.5: `onPress` calls `toggleTheme('system' | 'dark' | 'light')` for each chip

- [x] Task 2: Rewrite `Settings.jsx` (AC: #1, #4, #5, #6, #8, #9, #10, #11)
  - [x] 2.1: Remove all `react-native-paper` imports; remove `LinearGradient` background; add `useTheme`, `useSafeAreaInsets`
  - [x] 2.2: Add `useSelector` for `state.vatsimLiveData` (pilots, controllerCount, servers)
  - [x] 2.3: Add `getReleaseTag` calls for FIR and TRACON tags (already present — keep)
  - [x] 2.4: Build scrollable layout: `View (flex:1, backgroundColor: activeTheme.surface.base)` → `ScrollView (paddingTop: insets.top + 12, paddingHorizontal: 16)`
  - [x] 2.5: **Theme section:** section header (`ThemedText heading`), `<ThemePicker />`
  - [x] 2.6: **About section:** section header, logo + name + tagline row, description text, attribution links (`Pressable` + `ThemedText` for links, `activeTheme.accent.primary` color)
  - [x] 2.7: **Network Status section:** section header, pilot count row, ATC count row, server list (FlatList or map)
  - [x] 2.8: **Version section:** section header, each version field as `ThemedText caption` rows
  - [x] 2.9: Section separators: `View` with `height: 1`, `backgroundColor: activeTheme.surface.border`, `marginVertical: 16`
  - [x] 2.10: Remove `checked` / `setChecked` state (auto-refresh toggle) — not needed (static data auto-refresh is handled elsewhere)
  - [x] 2.11: Run ESLint on the file — fix all warnings

- [x] Task 3: Remove `About.jsx` and `networkStatus.jsx`, update navigator (AC: #4, #5, #7)
  - [x] 3.1: Delete `app/components/About/About.jsx`
  - [x] 3.2: Delete `app/components/networkStatus/networkStatus.jsx`
  - [x] 3.3: Remove `import NetworkStatus from '../networkStatus/networkStatus'` from `MainApp.jsx`
  - [x] 3.4: Remove `<Stack.Screen name="Network status" component={NetworkStatus} />` from `MainApp.jsx`
  - [x] 3.5: Verify no other files import `About` or `NetworkStatus` — remove those imports too if found

- [x] Task 4: Write tests (AC: #12)
  - [x] 4.1: Create `__tests__/Settings.test.js` with mocks for ThemeProvider, react-redux, expo-constants, expo-updates, storageService
  - [x] 4.2: Test: Settings renders without crashing
  - [x] 4.3: Test: Theme section renders three chips (System, Dark, Light)
  - [x] 4.4: Test: active chip corresponds to current `themePreference`
  - [x] 4.5: Test: pressing a chip calls `toggleTheme` with the correct preference value
  - [x] 4.6: Test: About section renders the VatView app name and attribution text
  - [x] 4.7: Test: Network Status section renders pilot count from Redux state
  - [x] 4.8: Run full suite — confirm zero regressions (289 baseline from story 6.2)

### Review Follow-ups (AI)
- [x] [AI-Review][High] Unhandled Promise Rejection Risk in `Settings.jsx`
- [x] [AI-Review][Medium] Test Quality (Missing Act wrappers) in `Settings.test.js`
- [x] [AI-Review][Medium] React Key Anti-Pattern in `Settings.jsx`
- [x] [AI-Review][Medium] Missing Error Handling for Deep Links in `Settings.jsx`
- [x] [AI-Review][Low] Code Style Deviation in `ThemePicker.jsx`

- [ ] Task 5: Manual validation (AC: #3, #9, #10)
  - [ ] 5.1: Navigate to Settings tab — see four sections in order: Theme, About, Network Status, Version
  - [ ] 5.2: Tap Dark — map + UI switch to dark theme instantly
  - [ ] 5.3: Kill and reopen app — dark theme restored
  - [ ] 5.4: Tap System — theme follows device setting
  - [ ] 5.5: Test in both light and dark themes — no color regressions
  - [ ] 5.6: Confirm "Network status" is gone from stack navigator (tapping from anywhere no longer navigates to old screen)

## Dev Notes

### Big Picture: What This Story Does

`Settings.jsx` is completely rewritten — migrated from `react-native-paper` + `LinearGradient` to the theme-aware component system. It absorbs the content of two orphaned components (`About.jsx`, `networkStatus.jsx`), adds a `ThemePicker` UI, and removes two stack screen registrations.

| What changes | How |
|---|---|
| `app/components/settings/Settings.jsx` | Full rewrite: NativeWind + theme tokens, 4 sections, absorbs About + NetworkStatus |
| `app/components/shared/ThemePicker.jsx` | New component: 3-chip System/Dark/Light selector |
| `app/components/About/About.jsx` | **DELETED** — content absorbed into Settings |
| `app/components/networkStatus/networkStatus.jsx` | **DELETED** — content absorbed into Settings |
| `app/components/mainApp/MainApp.jsx` | Remove NetworkStatus import + Stack.Screen |
| `__tests__/Settings.test.js` | New test file (≥6 tests) |

**No Redux changes.** Theme is managed by `ThemeProvider` (React Context + AsyncStorage). Network status data is already in `state.vatsimLiveData`.

### ThemeProvider API (already implemented — do not modify)

Located at `app/common/ThemeProvider.jsx`. The `useTheme()` hook returns:

```javascript
{
    isDark: boolean,                         // true when dark mode is active
    activeTheme: lightTheme | darkTheme,    // token object for current theme
    activeMapStyle: [...],                   // Google Maps style array
    themePreference: 'system' | 'light' | 'dark',  // user's saved preference
    toggleTheme: async (newPreference) => void,     // call to change theme
}
```

`toggleTheme` validates the input (ignores invalid values), updates state, and persists to AsyncStorage with key `'themePreference'`. No Redux involvement. The context is provided by `ThemeProvider` which wraps the app in `App.js`.

### ThemePicker Component Design

```jsx
// app/components/shared/ThemePicker.jsx
// Props: none — reads from useTheme() directly

const OPTIONS = [
    { label: 'System', value: 'system' },
    { label: 'Dark',   value: 'dark'   },
    { label: 'Light',  value: 'light'  },
];
```

Chip row layout:
```
<View flexDirection="row" gap={8}>
  {OPTIONS.map(opt => (
    <Pressable
      key={opt.value}
      onPress={() => toggleTheme(opt.value)}
      style={[chipBase, opt.value === themePreference ? chipActive : chipInactive]}
    >
      <ThemedText variant="body-sm" color={opt.value === themePreference ? activeTheme.text.primary : activeTheme.text.secondary}>
        {opt.label}
      </ThemedText>
    </Pressable>
  ))}
</View>
```

Active chip style (match `FilterChipsRow` active chip — `app/components/shared/FilterChipsRow.jsx`):
```javascript
chipActive: {
    borderWidth: 1.5,
    borderColor: activeTheme.accent.primary,
    borderRadius: tokens.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
}
chipInactive: {
    borderWidth: 1,
    borderColor: activeTheme.surface.border,
    borderRadius: tokens.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    opacity: 0.6,
}
```

### Settings Screen Structure

```
ScrollView (paddingTop: insets.top + 12, paddingHorizontal: 16, backgroundColor: activeTheme.surface.base)
├── Header row: logo (48×48, borderRadius:10) + title block (VatView heading + tagline caption)
│
├── ── Section Divider ──
├── Section: "Appearance"  (ThemedText heading)
│   └── ThemePicker
│
├── ── Section Divider ──
├── Section: "About"  (ThemedText heading)
│   ├── Description text (body-sm, activeTheme.text.secondary)
│   └── Attribution links (caption, activeTheme.accent.primary, Pressable → Linking.openURL)
│
├── ── Section Divider ──
├── Section: "Network Status"  (ThemedText heading)
│   ├── "Pilots: N" row  (body-sm)
│   ├── "ATC: N" row     (body-sm)
│   └── Server rows: "Name  Location  hostname" (caption, data variant)
│
├── ── Section Divider ──
├── Section: "Version"  (ThemedText heading)
│   ├── App: {version}
│   ├── Expo SDK: {sdkVersion}
│   ├── React Native: {major.minor.patch}
│   ├── Update Channel: {channel}
│   ├── Update ID: {updateId}
│   ├── VATSpy Boundaries: {firTag}
│   └── TRACON Boundaries: {traconTag}
│
└── Copyright notice (caption, activeTheme.text.muted)
```

### Network Status Data from Redux

```javascript
const liveData = useSelector(state => state.vatsimLiveData);
// liveData.clients.pilots.length      → pilot count
// liveData.clients.controllerCount    → ATC count
// liveData.servers                    → array of { name, location, hostname_or_ip }
```

Guard with `liveData?.clients` checks — if data not loaded yet, show `"N/A"` or `0`. `liveData.servers` may be `undefined` on first load — use `liveData.servers || []`.

### Version Data

```javascript
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import {Platform} from 'react-native';

// App version
Constants.expoConfig?.version

// Expo SDK
Constants.expoConfig?.sdkVersion

// React Native
const rnVersion = Platform.constants?.reactNativeVersion;
const rnStr = rnVersion
    ? `${rnVersion.major}.${rnVersion.minor}.${rnVersion.patch}`
    : 'N/A';

// OTA
Updates.channel || 'N/A'
Updates.updateId || 'N/A'
```

### Storage for Release Tags

```javascript
import {getReleaseTag, FIR_GEOJSON_RELEASE_TAG_KEY, TRACON_RELEASE_TAG_KEY} from '../../common/storageService';

// In useEffect:
getReleaseTag(FIR_GEOJSON_RELEASE_TAG_KEY).then(setFirGeoJsonReleaseTag);
getReleaseTag(TRACON_RELEASE_TAG_KEY).then(setTraconReleaseTag);
```

This pattern is already in `Settings.jsx` — keep it as-is.

### Auto-Refresh Toggle — Remove It

The current `Settings.jsx` has a `checked` / `setChecked` state for "Auto-refresh static data". This toggle is **not connected to any real functionality** — it reads/writes a local boolean with no effect on app behavior. Remove it in the rewrite. Do not create a replacement; the auto-refresh behavior is handled elsewhere (background `checkBoundaryUpdates` thunk on startup).

### Navigator Cleanup

In `app/components/mainApp/MainApp.jsx`:

```javascript
// REMOVE this import (line ~8):
import NetworkStatus from '../networkStatus/networkStatus';

// REMOVE this Stack.Screen registration:
<Stack.Screen
    name="Network status"
    component={NetworkStatus}
/>
```

Check if any `navigation.navigate('Network status')` calls exist elsewhere — remove those too. The "Network status" modal was previously accessible from the old Settings or elsewhere; that entry point is now gone since the content is inline in Settings.

### What NOT to Do

- Do **NOT** add a new Redux slice or action — `ThemeProvider` manages theme state via React Context + AsyncStorage.
- Do **NOT** call `toggleTheme()` from Redux — it's a context function, not a Redux action.
- Do **NOT** keep `LinearGradient` background — replace with `backgroundColor: activeTheme.surface.base`.
- Do **NOT** use `react-native-paper` components in the new Settings.
- Do **NOT** use `SafeAreaView` — use `useSafeAreaInsets()`.
- Do **NOT** use color literals — all colors from `activeTheme`.
- Do **NOT** use `@react-native-community/datetimepicker` — not relevant here but worth noting for consistency.
- Do **NOT** add new ESLint disable comments unless for raw-text in ThemedText (use `/* eslint-disable react-native/no-raw-text */` at file top if needed for `©`, `→` chars).
- Do **NOT** keep the auto-refresh toggle — it was non-functional and is removed.
- Do **NOT** create a new tab for About or Network Status — these sections live inside Settings.

### ThemedText Variants (reference)

- `heading-lg` — extra large title bold
- `heading` — large title bold
- `body` — 15px (default body)
- `body-sm` — 14px
- `caption` — 11px
- `data` — JetBrains Mono 13px (for callsigns, codes, values)
- `data-sm` — JetBrains Mono 11px

Use `data` variant for version values, server hostnames. Use `body-sm` for description text. Use `caption` for attributions.

### ESLint Rules

- No inline styles — `StyleSheet.create()` only.
- No color literals.
- No raw text outside `<ThemedText>` — use `/* eslint-disable react-native/no-raw-text */` at file top for `©`, `→`, `×` chars if needed.
- Semicolons, single quotes, 4-space indent.

### Testing Pattern

New test file `__tests__/Settings.test.js`. Required mocks:

```javascript
jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        isDark: false,
        themePreference: 'system',
        toggleTheme: jest.fn(),
        activeTheme: {
            text: { primary: '#1F2328', secondary: '#656D76', muted: '#8B949E' },
            surface: { base: '#FFFFFF', elevated: 'rgba(255,255,255,0.5)', border: 'rgba(0,0,0,0.08)' },
            accent: { primary: '#2A6BC4' },
        },
    }),
}));

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        vatsimLiveData: {
            clients: { pilots: [{ callsign: 'TEST123' }], controllerCount: 3 },
            servers: [{ name: 'USA-EAST', location: 'New York', hostname_or_ip: '192.0.2.1' }],
        },
    })),
}));

jest.mock('expo-constants', () => ({
    default: { expoConfig: { version: '2.0.0', sdkVersion: '52.0.0' } },
}));

jest.mock('expo-updates', () => ({
    channel: 'production',
    updateId: 'test-update-id',
}));

jest.mock('../app/common/storageService', () => ({
    getReleaseTag: jest.fn(() => Promise.resolve('v1.0.0')),
    FIR_GEOJSON_RELEASE_TAG_KEY: 'firTag',
    TRACON_RELEASE_TAG_KEY: 'traconTag',
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../app/common/themeTokens', () => ({
    tokens: {
        fontFamily: { mono: 'monospace', monoMedium: 'monospace', sans: 'sans-serif' },
        radius: { md: 12, lg: 16 },
        animation: { duration: { fast: 100, normal: 250 } },
    },
}));
```

`ThemePicker.jsx` may also need its own mock in Settings tests OR test it inline as part of Settings rendering. Simpler: mock `ThemePicker` as a passthrough in Settings tests, and test ThemePicker separately.

### Previous Story Intelligence

From story 6.2 (Live/Scheduled Toggle — done):
- `ThemePicker` chip style follows `FilterChipsRow` active/inactive chip pattern exactly — established and tested.
- `ThemedText` variants in use: `body`, `body-sm`, `caption`, `data` — all working.
- `useTheme()` hook is stable and widely used.
- SafeAreaInsets pattern: `useSafeAreaInsets()` + `paddingTop: insets.top + 12` on the top container.
- No raw text outside `ThemedText` — ESLint rule enforced.

From story 5.3 (MetarView — done):
- MetarView also uses `useTheme()` + `useSafeAreaInsets()` — good reference for tab screen layout pattern.
- `StyleSheet.create()` for all styles — no inline styles.

From story 1.2 (ThemeProvider + dual map styling — done):
- `ThemeProvider` is fully integrated and stable. `toggleTheme()` is the public API. No need to modify it.
- `isDark`, `activeTheme`, `themePreference`, `toggleTheme` are all available via `useTheme()`.

### Project Structure Notes

**Files to modify:**
- `app/components/settings/Settings.jsx` — full rewrite
- `app/components/mainApp/MainApp.jsx` — remove NetworkStatus import + Stack.Screen

**Files to create:**
- `app/components/shared/ThemePicker.jsx` — three-chip theme selector
- `__tests__/Settings.test.js` — new test file (≥6 tests)

**Files to delete:**
- `app/components/About/About.jsx`
- `app/components/networkStatus/networkStatus.jsx`

**No Redux changes, no new dependencies, no native module changes.**

### References

- [Source: app/components/settings/Settings.jsx — Current implementation to rewrite]
- [Source: app/components/About/About.jsx — Content to absorb, then DELETE]
- [Source: app/components/networkStatus/networkStatus.jsx — Content to absorb, then DELETE]
- [Source: app/common/ThemeProvider.jsx — ThemeProvider + useTheme() hook API]
- [Source: app/common/themeTokens.js — lightTheme, darkTheme, tokens definitions]
- [Source: app/components/shared/FilterChipsRow.jsx — Chip visual style reference for ThemePicker]
- [Source: app/components/shared/ThemedText.jsx — Text variants: heading, body, body-sm, caption, data]
- [Source: app/components/mainApp/MainApp.jsx:8 — NetworkStatus import to REMOVE]
- [Source: app/components/mainApp/MainApp.jsx:134-135 — Stack.Screen "Network status" to REMOVE]
- [Source: app/common/storageService.js — getReleaseTag, FIR_GEOJSON_RELEASE_TAG_KEY, TRACON_RELEASE_TAG_KEY]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.3 — Acceptance criteria source]
- [Source: _bmad-output/implementation-artifacts/6-2-atc-bookings-list-and-details.md — ThemePicker chip style + SafeAreaInsets pattern]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Created `ThemePicker.jsx`: three-chip System/Dark/Light selector using `useTheme()`. Active chip uses `borderWidth: 1.5` + accent border; inactive uses `borderWidth: 1` + 0.6 opacity. StyleSheet-only (no inline styles). ESLint clean.
- Rewrote `Settings.jsx`: fully migrated from `react-native-paper` + `LinearGradient` to `activeTheme` tokens + `ThemedText`. Four sections (Appearance, About, Network Status, Version) in a `ScrollView` with `useSafeAreaInsets()` top padding. Removed non-functional auto-refresh toggle.
- Deleted `About.jsx` and `networkStatus.jsx` — content absorbed into Settings.
- Removed `NetworkStatus` import and `Stack.Screen name="Network status"` from `MainApp.jsx`. No other files imported these components.
- `expo-constants` mock needed `__esModule: true` for correct default export interop in tests.
- 7 new tests in `__tests__/Settings.test.js`. Full suite: 296/296 pass (up from 289).

### File List

- app/components/shared/ThemePicker.jsx (created)
- app/components/settings/Settings.jsx (rewritten)
- app/components/About/About.jsx (deleted)
- app/components/networkStatus/networkStatus.jsx (deleted)
- app/components/mainApp/MainApp.jsx (modified — removed NetworkStatus import + Stack.Screen)
- __tests__/Settings.test.js (created)

### Change Log

- 2026-03-18: Story 6.3 implemented — Settings rewritten with ThemePicker, About + NetworkStatus content absorbed, two files deleted, navigator cleaned up, 7 tests added (296 total).
