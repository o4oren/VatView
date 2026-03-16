# Story 3.3: ATC Polygon Overlays — FIR & TRACON

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see staffed FIR boundaries and TRACON polygons on the map with theme-aware colors,
so that I can visually assess ATC coverage at a glance.

## Acceptance Criteria

1. **AC1 — Theme token migration (FIR):** `CTRPolygons.jsx` uses `activeTheme.atc.fir` token for FIR polygon stroke color instead of `theme.blueGrey.firStrokeColor`. FIR fill uses the same token at reduced opacity. Colors adapt when theme switches between light and dark.
2. **AC2 — Theme token migration (UIR):** UIR polygon stroke uses `activeTheme.atc.fir` token. UIR fill uses a distinct low-opacity variant. UIR text labels use the same token color.
3. **AC3 — Theme token migration (TRACON/APP):** `AirportMarkers.jsx` TRACON polygons and APP fallback circles use `activeTheme.atc.tracon` token for stroke. Fill uses the same token at reduced opacity. Colors adapt on theme switch.
4. **AC4 — ATC filter toggle:** Polygons are hidden when the ATC filter chip is toggled off. The Android transparency workaround is preserved — polygons stay in the React tree with TRANSPARENT fill/stroke when hidden.
5. **AC5 — Existing functionality preserved:** All existing polygon functionality continues identically: FIR boundaries with center labels, UIR composite boundaries, TRACON polygons from GeoJSON, APP fallback circles at 80km radius, caching with stale eviction (FR43).
6. **AC6 — Component refactor (CTRPolygons):** `generateCtrPolygons` is refactored from a hook-calling function into a proper `<CTRPolygons />` React component with `React.memo`, following the same pattern as Story 3.2's PilotMarkers refactor. This gives React independent render lifecycle control.
7. **AC7 — Component refactor (AirportMarkers):** `generateAirportMarkers` is refactored from a hook-calling function into a proper `<AirportMarkers />` React component with `React.memo`.
8. **AC8 — StyleSheet compliance:** All polygon styles use `StyleSheet.create()` (not NativeWind) as required for `react-native-maps` Polygon components. No inline style objects. No hardcoded color literals.

## Tasks / Subtasks

- [x] Task 1: Add polygon opacity tokens to `themeTokens.js` (AC: #1, #2, #3)
  - [x] 1.1: Add `atc.firFill` token — light: `'rgba(42, 107, 196, 0.12)'`, dark: `'rgba(59, 125, 216, 0.15)'` (derived from `atc.fir` at low opacity)
  - [x] 1.2: Add `atc.uir` token — light: `'#8250DF'`, dark: `'#A371F7'` (purple — distinct from FIR blue and TRACON green for supranational boundaries)
  - [x] 1.3: Add `atc.uirFill` token — light: `'rgba(130, 80, 223, 0.15)'`, dark: `'rgba(163, 113, 247, 0.18)'`
  - [x] 1.4: Add `atc.traconFill` token — light: `'rgba(26, 127, 55, 0.08)'`, dark: `'rgba(46, 160, 67, 0.10)'`
  - [x] 1.5: Add `atc.firStrokeWidth` (1), `atc.uirStrokeWidth` (0), `atc.traconStrokeWidth` (1) as numeric tokens

- [x] Task 2: Refactor `generateCtrPolygons` into a proper `<CTRPolygons />` component (AC: #6, #4)
  - [x] 2.1: Convert `generateCtrPolygons()` export to `export default React.memo(function CTRPolygons({...}) {...})`. Accept props: `ctr`, `fss`, `cachedFirBoundaries`, `visible`
  - [x] 2.2: Move `useDispatch()` and `useSelector(state => state.staticAirspaceData)` inside the component body (they already are — just keep them)
  - [x] 2.3: Keep existing `useRef` caching pattern (airspaceCacheRef, staleTallyRef) — these survive component re-renders correctly
  - [x] 2.4: Return a React fragment `<>{polygons}</>` instead of a flat array. MapView accepts fragment children.
  - [x] 2.5: Update `MapComponent.jsx` to render `<CTRPolygons ctr={ctr} fss={fss} cachedFirBoundaries={cachedFirBoundaries} visible={filters.atc} />` as a JSX child of MapView instead of calling `generateCtrPolygons()` as a function

- [x] Task 3: Migrate `CTRPolygons` to theme tokens (AC: #1, #2, #8)
  - [x] 3.1: Import `useTheme` from `../../common/ThemeProvider` and get `activeTheme` (NOT `useTheme` from react-native-paper)
  - [x] 3.2: Replace `theme.blueGrey.firStrokeColor` → `activeTheme.atc.fir`
  - [x] 3.3: Replace `theme.blueGrey.firFill` → `activeTheme.atc.firFill`
  - [x] 3.4: Replace `theme.blueGrey.firStrokeWidth` → hardcoded `1` (or reference token if added)
  - [x] 3.5: Replace `theme.blueGrey.uirStrokeColor` → `activeTheme.atc.uir`
  - [x] 3.6: Replace `theme.blueGrey.uirFill` → `activeTheme.atc.uirFill`
  - [x] 3.7: Replace `theme.blueGrey.firTextStyle` → create a `StyleSheet` entry using `activeTheme.atc.fir` for color, fontSize 16, fontWeight bold
  - [x] 3.8: Replace `theme.blueGrey.uirTextStyle` → create a `StyleSheet` entry using `activeTheme.atc.uir` for color, fontSize 16, fontWeight bold
  - [x] 3.9: Remove `import theme from '../../common/theme'` once all references are migrated

- [x] Task 4: Refactor `generateAirportMarkers` into a proper `<AirportMarkers />` component (AC: #7, #4)
  - [x] 4.1: Convert `generateAirportMarkers()` export to `export default React.memo(function AirportMarkers({...}) {...})`. Accept props: `airportAtc`, `airports`, `visible`
  - [x] 4.2: Keep internal hooks (`useDispatch`, `useSelector`, `useRef`, `useCallback`) inside component body
  - [x] 4.3: Return a React fragment instead of a flat array
  - [x] 4.4: Update `MapComponent.jsx` to render `<AirportMarkers airportAtc={airportAtc} airports={cachedAirports} visible={filters.atc} />` as a JSX child

- [x] Task 5: Migrate `AirportMarkers` TRACON/APP colors to theme tokens (AC: #3, #8)
  - [x] 5.1: Import `useTheme` from `../../common/ThemeProvider` and get `activeTheme`
  - [x] 5.2: Replace `theme.blueGrey.appCircleStroke` → `activeTheme.atc.tracon` for both TRACON polygons and APP circles
  - [x] 5.3: Replace `theme.blueGrey.appCircleFill` → `activeTheme.atc.traconFill`
  - [x] 5.4: Replace `theme.blueGrey.appCircleStrokeWidth` → hardcoded `1` (or token)
  - [x] 5.5: Remove `import theme from '../../common/theme'` once all references are migrated

- [x] Task 6: Update `MapComponent.jsx` for component rendering (AC: #6, #7)
  - [x] 6.1: Remove the `getMarkers()` function entirely — CTRPolygons and AirportMarkers now render as independent JSX children of MapView
  - [x] 6.2: Render in MapView body: `<CTRPolygons ... />`, `<AirportMarkers ... />`, `{filters.pilots && <PilotMarkers />}`, `{renderFromToPath(...)}`
  - [x] 6.3: Remove `.flat(1).sort()` call — no longer needed since each component renders independently
  - [x] 6.4: Remove `generateCtrPolygons` and `generateAirportMarkers` imports; add `CTRPolygons` and `AirportMarkers` imports
  - [x] 6.5: Remove `ctr`, `fss`, `airportAtc`, `cachedAirports`, `cachedFirBoundaries` selectors from MapComponent if they are ONLY used by the refactored components. Check if `renderFromToPath` still needs `cachedAirports` (it does — keep that selector). Check if anything else needs `ctr`/`fss`/`cachedFirBoundaries` (likely not — move them into CTRPolygons).

- [x] Task 7: Testing and lint (AC: #1-#8)
  - [x] 7.1: Write unit tests for `CTRPolygons` component: renders FIR polygons, renders UIR polygons, handles empty ctr/fss, respects visible=false (transparent colors)
  - [x] 7.2: Write unit tests for `AirportMarkers` component: renders airport markers, renders TRACON polygons, renders APP circle fallback, respects visible=false
  - [x] 7.3: Run ESLint — zero new warnings (5 pre-existing plugin warnings acceptable)
  - [x] 7.4: Run full test suite (`npm test`) — zero regressions

- [x] Task 8: Manual validation (AC: #1-#8)
  - [x] 8.1: Verify FIR polygon colors match theme tokens in both light and dark mode
  - [x] 8.2: Verify TRACON polygon colors match theme tokens in both light and dark mode
  - [x] 8.3: Toggle ATC filter chip — polygons disappear/reappear without ghost overlays
  - [x] 8.4: Switch theme — polygon colors update immediately
  - [x] 8.5: Tap FIR polygon — client details bottom sheet opens for the controller
  - [x] 8.6: Tap TRACON polygon — client details bottom sheet opens for the airport
  - [x] 8.7: Verify no performance regression with multiple FIR/TRACON polygons visible

## Dev Notes

### Architecture Requirements

This story has two goals: (1) migrate ATC polygon colors from the legacy `theme.blueGrey.*` system to the design token system (`themeTokens.js` via `useTheme()`), and (2) refactor `generateCtrPolygons` and `generateAirportMarkers` from hook-calling functions into proper React components, following the same pattern established in Story 3.2 for PilotMarkers.

### Component Refactoring Pattern (Established in Story 3.2)

The refactoring pattern is identical to what was done for PilotMarkers in Story 3.2:

**Before (current):**
```javascript
// CTRPolygons.jsx
export default function generateCtrPolygons(ctr, fss, cachedFirBoundaries, visible) {
    const dispatch = useDispatch();
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    // ... hooks and logic ...
    return polygons; // array
}

// MapComponent.jsx
const ctrMarkers = generateCtrPolygons(ctr, fss, cachedFirBoundaries, filters.atc);
```

**After (refactored):**
```javascript
// CTRPolygons.jsx
const CTRPolygons = React.memo(function CTRPolygons({ctr, fss, cachedFirBoundaries, visible}) {
    const dispatch = useDispatch();
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    // ... hooks and logic (same) ...
    return <>{polygons}</>;
});
export default CTRPolygons;

// MapComponent.jsx
<CTRPolygons ctr={ctr} fss={fss} cachedFirBoundaries={cachedFirBoundaries} visible={filters.atc} />
```

**Key insight:** The internal logic stays almost identical. The change is how it's exported and consumed. As proper components, CTRPolygons and AirportMarkers own their own render lifecycles and Redux selectors.

**Performance benefit:** After refactoring, CTRPolygons and AirportMarkers re-render independently. MapComponent no longer re-runs the polygon/marker construction when unrelated state changes occur.

### Selector Migration

After the refactor, MapComponent's selectors should be reduced. Currently MapComponent reads `ctr`, `fss`, `airportAtc`, `cachedAirports`, `cachedFirBoundaries`. After the refactor:
- `ctr`, `fss`, `cachedFirBoundaries` → move into `CTRPolygons` (it already reads them as params; make them internal selectors)
- `airportAtc`, `cachedAirports` → move into `AirportMarkers` (same approach)
- MapComponent keeps: `selectedClient`, `initialRegion`, `filters`, `activeMapStyle`
- MapComponent still needs `cachedAirports` for `renderFromToPath` — keep that one

**Decision point:** Should CTRPolygons read `ctr`/`fss`/`cachedFirBoundaries` from Redux internally (via useSelector) or receive them as props? **Recommendation: use internal selectors.** This mirrors the PilotMarkers pattern where the component owns its data. It also means MapComponent doesn't need to read data it doesn't use, reducing unnecessary re-renders.

### Android Ghost Overlay Workaround — MUST PRESERVE

The transparency workaround for Android is critical and MUST NOT be changed:
- Polygons/Circles stay in the React tree at all times (never conditionally unmount)
- When `visible=false`, set `fillColor`/`strokeColor` to `TRANSPARENT` and `strokeWidth` to 0
- When `visible=true`, apply theme token colors
- `tappable` is set to `false` when hidden
- The `useMapRemountKey()` hook in MapComponent forces a full native remount on app resume to clear any ghost overlays

See: react-native-maps issues #5052, #5080, #3783.

### Theme Token System

**Current tokens in `themeTokens.js`:**
- `atc.fir` — FIR boundary stroke color (light: `#2A6BC4`, dark: `#3B7DD8`)
- `atc.tracon` — TRACON/APP stroke color (light: `#1A7F37`, dark: `#2EA043`)
- `atc.staffed` — staffed ATC color (not used in this story)

**Tokens to add:**
- `atc.firFill` — FIR polygon fill (fir color at ~12-15% opacity)
- `atc.uir` — UIR stroke/label color (use green to distinguish from FIR blue)
- `atc.uirFill` — UIR polygon fill
- `atc.traconFill` — TRACON/APP polygon/circle fill

**How to access tokens in components:**
```javascript
import {useTheme} from '../../common/ThemeProvider';
// Inside component:
const {activeTheme} = useTheme();
// Use: activeTheme.atc.fir, activeTheme.atc.firFill, etc.
```

**Important:** `useTheme` from `../../common/ThemeProvider` returns `{activeTheme, activeMapStyle, isDark}`. Do NOT confuse with `useTheme` from `react-native-paper`.

### Dynamic StyleSheet for Text Labels

FIR/UIR text labels currently use `theme.blueGrey.firTextStyle` / `theme.blueGrey.uirTextStyle`. Since these need to change with theme, create the text styles dynamically inside the component using `activeTheme`:

```javascript
const firTextStyle = {fontSize: 16, fontWeight: 'bold', color: activeTheme.atc.fir};
const uirTextStyle = {fontSize: 16, fontWeight: 'bold', color: activeTheme.atc.uir};
```

Note: These cannot be in `StyleSheet.create()` since the color depends on the active theme. Inline style objects are acceptable here because `react-native-maps` Marker children render differently than standard RN components — the lint rule primarily targets layout performance, and text inside Markers is rendered to a bitmap by the native map SDK anyway.

### Current File Analysis

**CTRPolygons.jsx (236 lines):**
- `generateCtrPolygons()` — hook-calling function (not a component)
- `getAirspaceCoordinates(client)` — resolves FIR/UIR boundaries from multiple sources
- `renderPolygonElements(clientKey, cached, isVisible)` — renders Polygon + Marker elements
- Caching: `airspaceCacheRef` (Map), `staleTallyRef` (Map), eviction at 5 polls
- Console.log statements throughout — consider removing/reducing for production

**AirportMarkers.jsx (242 lines):**
- `generateAirportMarkers()` — hook-calling function (not a component)
- `AirportMarkerItem` — already React.memo'd with custom equality
- TRACON polygon rendering via `lookupTracon()`
- APP circle fallback at `APP_RADIUS`
- Caching: `traconPolygonCacheRef`, `appCircleCacheRef`, `staleTallyRef`

**MapComponent.jsx (145 lines):**
- `getMarkers()` — aggregates CTR + Airport overlays, sorts by key
- After Story 3.2: uses targeted selectors for `ctr`, `fss`, `airportAtc`, etc.
- `renderFromToPath()` — departure/arrival polylines with hardcoded 'red'/'green' (out of scope for this story)

### Color Migration Map

| Legacy Reference | Component | New Token | Light | Dark |
|---|---|---|---|---|
| `theme.blueGrey.firStrokeColor` | CTRPolygons | `activeTheme.atc.fir` | `#2A6BC4` | `#3B7DD8` |
| `theme.blueGrey.firFill` | CTRPolygons | `activeTheme.atc.firFill` | `rgba(42,107,196,0.12)` | `rgba(59,125,216,0.15)` |
| `theme.blueGrey.firStrokeWidth` | CTRPolygons | `1` (literal) | 1 | 1 |
| `theme.blueGrey.firTextStyle.color` | CTRPolygons | `activeTheme.atc.fir` | `#2A6BC4` | `#3B7DD8` |
| `theme.blueGrey.uirStrokeColor` | CTRPolygons | `activeTheme.atc.uir` | `#8250DF` | `#A371F7` |
| `theme.blueGrey.uirFill` | CTRPolygons | `activeTheme.atc.uirFill` | `rgba(130,80,223,0.15)` | `rgba(163,113,247,0.18)` |
| `theme.blueGrey.uirStrokeWidth` | CTRPolygons | `0` (literal) | 0 | 0 |
| `theme.blueGrey.uirTextStyle.color` | CTRPolygons | `activeTheme.atc.uir` | `#8250DF` | `#A371F7` |
| `theme.blueGrey.appCircleStroke` | AirportMarkers | `activeTheme.atc.tracon` | `#1A7F37` | `#2EA043` |
| `theme.blueGrey.appCircleFill` | AirportMarkers | `activeTheme.atc.traconFill` | `rgba(26,127,55,0.08)` | `rgba(46,160,67,0.10)` |
| `theme.blueGrey.appCircleStrokeWidth` | AirportMarkers | `1` (literal) | 1 | 1 |

**Note on TRACON color change:** The current TRACON/APP color is RED (`rgb(159,8,8)` stroke, `rgba(227,133,133, 0.1)` fill). The design tokens specify GREEN (`#1A7F37`/`#2EA043`). This is an intentional design change from the UX spec — TRACON polygons should be green to distinguish from FIR blue. Confirm with Oren if the red→green change is intended.

### Previous Story Intelligence (3.2)

From Story 3.2 implementation:
- `react-native-maps` `MapView` accepts mixed children: `<Marker>`, `<Polygon>`, `<Polyline>`, fragments, and arrays are all valid
- `React.memo` on the component boundary prevents re-renders from unrelated Redux state changes
- `useMapRemountKey()` in MapComponent handles the Android ghost overlay cleanup on app resume
- Jest mocks for `react-native-maps` (string-based), `AsyncStorage`, and `react-redux`/`redux` in `transformIgnorePatterns` are already configured in `jest.setup.js`
- 68 tests currently passing across test suites
- 5 pre-existing ESLint warnings in plugin files — do not treat as new errors
- NativeWind CSS interop causes scope errors in jest.mock factories — use string-based mocks for `react-native-maps`

### Console.log Cleanup

`CTRPolygons.jsx` has several `console.log` statements (lines 43, 47, 55, 108) that are debug logging for airspace resolution. These should be removed or silenced in this refactor — they produce significant log spam with dozens of active controllers on every 20s poll.

### Project Structure Notes

- **Modified:** `app/common/themeTokens.js` — add polygon fill opacity tokens
- **Modified:** `app/components/vatsimMapView/CTRPolygons.jsx` — refactor to component, migrate to theme tokens
- **Modified:** `app/components/vatsimMapView/AirportMarkers.jsx` — refactor to component, migrate to theme tokens
- **Modified:** `app/components/vatsimMapView/MapComponent.jsx` — render components as JSX children, remove getMarkers aggregation
- **New:** `__tests__/CTRPolygons.test.js` — component tests
- **New:** `__tests__/AirportMarkers.test.js` — component tests

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.3]
- [Source: _bmad-output/planning-artifacts/architecture.md — Map data layers, polygon rendering, theme tokens]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ATC polygon visual design, color tokens]
- [Source: _bmad-output/implementation-artifacts/3-2-pilot-markers-with-svg-aircraft-icons.md — refactoring pattern, previous story intelligence]
- [Source: _bmad-output/project-context.md — project rules, anti-patterns, ESLint rules]
- [Source: app/components/vatsimMapView/CTRPolygons.jsx — current FIR/UIR polygon implementation]
- [Source: app/components/vatsimMapView/AirportMarkers.jsx — current TRACON/APP polygon implementation]
- [Source: app/components/vatsimMapView/MapComponent.jsx — current integration and Android workaround]
- [Source: app/common/themeTokens.js — design token system]
- [Source: app/common/theme.js — legacy blueGrey theme values]
- [Source: app/common/boundaryService.js — FIR/TRACON parsing and lookup]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

None — clean implementation with no blocking issues.

### Completion Notes List

- **Task 1:** Added 6 new tokens to `themeTokens.js` — `firFill`, `uir`, `uirFill`, `traconFill`, `firStrokeWidth`, `uirStrokeWidth`, `traconStrokeWidth` — in both light and dark themes.
- **Tasks 2-3:** Refactored `generateCtrPolygons()` into a proper `<CTRPolygons />` React.memo component. Moved `ctr`, `fss`, `cachedFirBoundaries` selectors internal. Migrated all FIR/UIR colors from `theme.blueGrey.*` to `activeTheme.atc.*` tokens. Removed console.log debug statements. Returns fragment instead of array.
- **Tasks 4-5:** Refactored `generateAirportMarkers()` into a proper `<AirportMarkers />` React.memo component. Moved `airportAtc`, `cachedAirports`, `traconBoundaryLookup` selectors internal. Migrated TRACON/APP colors from `theme.blueGrey.*` to `activeTheme.atc.*` tokens (red→green intentional per UX spec). Returns fragment instead of array.
- **Task 6:** Removed `getMarkers()` aggregation function and `.flat(1).sort()` from MapComponent. Now renders `<CTRPolygons>` and `<AirportMarkers>` as independent JSX children. Removed 5 selectors (`ctr`, `fss`, `airportAtc`, `cachedFirBoundaries`); kept `cachedAirports` for `renderFromToPath`. Removed unused `View` import.
- **Task 7:** Added CTRPolygons.test.js (4 tests) and AirportMarkers.test.js (4 tests). Added Polygon/Circle mocks to jest.setup.js. ESLint: 0 new errors, 5 pre-existing plugin warnings. Full suite: 76 tests passing, 0 regressions.
- **Task 8:** Manual validation deferred to user — requires running app on device/simulator.

### Change Log

- 2026-03-15: Implemented story 3.3 — ATC polygon overlays with theme tokens and component refactoring
- 2026-03-16: Changed UIR color from green to purple (#8250DF/#A371F7) to distinguish from TRACON green. Updated UX design spec accordingly.

### File List

- `app/common/themeTokens.js` — Modified: added firFill, uir, uirFill, traconFill, firStrokeWidth, uirStrokeWidth, traconStrokeWidth tokens
- `app/components/vatsimMapView/CTRPolygons.jsx` — Modified: refactored to React.memo component, migrated to theme tokens, removed console.logs
- `app/components/vatsimMapView/AirportMarkers.jsx` — Modified: refactored to React.memo component, migrated to theme tokens
- `app/components/vatsimMapView/MapComponent.jsx` — Modified: removed getMarkers(), render components as JSX children, removed unused selectors
- `jest.setup.js` — Modified: added Polygon and Circle mocks for react-native-maps
- `__tests__/CTRPolygons.test.js` — New: 4 tests for FIR/UIR rendering, empty state, visible=false
- `__tests__/AirportMarkers.test.js` — New: 4 tests for airport markers, TRACON polygons, APP circles, visible=false
