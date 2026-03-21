# Story 3.2: Pilot Markers with SVG Aircraft Icons

Status: done

## Story

As a user,
I want to see live pilot positions as aircraft-type silhouettes rotated to their heading on the map,
so that I can identify aircraft types and flight directions at a glance.

## Acceptance Criteria

1. **AC1 — SVG bitmap markers:** `PilotMarkers.jsx` uses `getMarkerImage()` from `aircraftIconService.js` (via `iconsHelper.js` wrapper) instead of PNG `require()` paths. Pilots render as native `Image` markers using cached SVG-to-bitmap output.
2. **AC2 — Heading rotation:** Markers are rotated to show heading direction. Android uses native `rotation` prop with `flat={true}`; iOS uses CSS transform `rotate`.
3. **AC3 — Live updates:** Markers update every 20 seconds when live data refreshes from `vatsim-data.json`.
4. **AC4 — Performance:** Rendering 1,500+ simultaneous pilots completes without dropped frames (60fps panning maintained).
5. **AC5 — Cold start:** Persisted Redux state renders last-known pilot positions on cold start before fresh data arrives.
6. **AC6 — Filter integration:** Pilot markers are hidden when the Pilots filter chip is toggled off.
7. **AC7 — Clustering compatibility:** `ClusteredPilotMarkers.jsx` continues functioning with the new marker images.
8. **AC8 — Component refactor:** `generatePilotMarkers` is refactored from a hook-calling function into a proper `<PilotMarkers />` React component with `React.memo`, giving React independent render lifecycle control.

## Tasks / Subtasks

- [x] Task 1: Refactor `generatePilotMarkers` into a proper React component (AC: #8, #4)
  - [x] 1.1: Convert `generatePilotMarkers()` function in `PilotMarkers.jsx` to `export default React.memo(function PilotMarkers() {...})` — a proper component that returns a fragment of `<PilotMarkerItem>` elements
  - [x] 1.2: Wrap with `React.memo` (no custom equality needed — `useSelector` inside handles poll-cycle re-renders; the memo boundary prevents re-renders from non-pilot state changes like ATC updates, airport data, or app state)
  - [x] 1.3: Update `MapComponent.jsx` to render `<PilotMarkers />` as a JSX child of `<MapView>` instead of calling `generatePilotMarkers()` as a function
  - [x] 1.4: Remove `PilotMarkers` from the `getMarkers()` aggregation function — it now renders directly as a `<MapView>` child
  - [x] 1.5: Handle filter toggle: wrap `<PilotMarkers />` in `{filters.pilots && <PilotMarkers />}` conditional rendering. Markers do NOT suffer from the Android ghost overlay issue (unlike Polygon/Circle) — conditional rendering is safe.

- [x] Task 2: Optimize `MapComponent.jsx` selectors (AC: #4)
  - [x] 2.1: Replace the broad `useSelector(state => state.vatsimLiveData)` with targeted selectors for only what `MapComponent` still needs post-refactor: `useSelector(state => state.vatsimLiveData.clients.ctr)`, `useSelector(state => state.vatsimLiveData.clients.fss)`, `useSelector(state => state.vatsimLiveData.clients.airportAtc)`, `useSelector(state => state.vatsimLiveData.cachedAirports)`, `useSelector(state => state.vatsimLiveData.cachedFirBoundaries)`. Note: `clients.pilots` is no longer needed in `MapComponent` — `PilotMarkers` owns that selector now
  - [x] 2.2: Verify that `MapComponent` no longer re-renders when unrelated `vatsimLiveData` fields change (e.g., `general`, `prefiles`)

- [x] Task 3: Update `PilotMarkers` to use SVG bitmap images (AC: #1, #2, #5)
  - [x] 3.1: Verify `pilot.image` is already a `{ uri }` file path from `aircraftIconService` (assigned in `vatsimLiveDataActions.js` via `getAircraftIcon()`). **This is already working from Story 3.1** — no action needed if verified
  - [x] 3.2: Verify fallback to `mapIcons.B737` PNG when `pilot.image` is null (pre-init edge case). **Already implemented in current code** — verify still works
  - [x] 3.3: Verify heading rotation works correctly with file-URI image sources on both platforms (Android native `rotation` prop, iOS CSS transform)
  - [x] 3.4: Remove `console.warn('Pilot missing image:')` after verification — this was a Story 3.1 debugging aid. Replace with a silent counter or remove entirely to avoid log spam with 1,500 pilots during init window

- [x] Task 4 (optional — currently unused): Update `ClusteredPilotMarkers.jsx` for compatibility (AC: #7)
  - [x] 4.1: Review `ClusteredPilotMarkers.jsx` and update its `PilotMarker` sub-component to use the same `pilot.image` / `pilot.imageSize` pattern from the main `PilotMarkerItem`
  - [x] 4.2: Ensure the cluster marker rendering (single pilot case) correctly handles `{ uri }` image sources, not just `require()` PNG references
  - [x] 4.3: Replace hardcoded color `rgba(42, 93, 153, 0.8)` in cluster badge with theme token (lint rule: no color literals)
  - Note: `ClusteredPilotMarkers.jsx` is not actively used in the app — it's an alternative clustering implementation. These updates keep it compatible but are low priority.

- [x] Task 5: Performance validation — manual device testing (AC: #4, #3)
  - [x] 5.1: Run the app on device with a full VATSIM data set (typical peak: 1,200-1,800 pilots). Verify 60fps map panning with all pilots visible
  - [x] 5.2: Verify the `React.memo` boundary on `PilotMarkers` prevents re-execution of the pilot `.map()` loop when non-pilot Redux state changes (e.g., ATC data update, airport data). Use React DevTools or console logging to confirm.
  - [x] 5.3: Verify individual `PilotMarkerItem` memo prevents re-render when pilot position/heading hasn't changed between 20s polls (most pilots move only slightly per cycle)
  - [x] 5.4: Test filter chip toggle — toggling Pilots off then on should not cause a visible flash or lag
  - Note: These are manual validation steps on a real device/simulator — no automated performance assertions.

- [x] Task 6: Testing and lint (AC: #1-#8)
  - [x] 6.1: Write unit tests for the refactored `PilotMarkers` component: renders correct number of markers, handles empty pilots array, handles null `pilot.image` fallback
  - [x] 6.2: Write test verifying `PilotMarkerItem` memo equality function works correctly (same pilot → no re-render, different heading → re-render)
  - [x] 6.3: Run ESLint — zero new warnings
  - [x] 6.4: Run full test suite (`npm test`) — zero regressions

## Dev Notes

### Architecture Requirements

This story is primarily a **refactoring and integration story**. Story 3.1 already implemented the AircraftIconService SVG-to-bitmap pipeline and wired it into `iconsHelper.js`. The core architectural win is **selector isolation through component boundaries**:

1. **Converting `generatePilotMarkers` to a proper `<PilotMarkers />` component** — the most important change. Currently called as a function inside `getMarkers()`, meaning React has no render boundary between MapComponent and PilotMarkers. After refactoring, `PilotMarkers` owns its own `useSelector(clients.pilots)` and `MapComponent` no longer subscribes to pilot data at all. ATC/airport/app state changes stop triggering 1,500-marker re-evaluation.

2. **Optimizing `MapComponent.jsx` selectors** — the current `useSelector(state => state.vatsimLiveData)` causes re-renders on any slice change. After extracting PilotMarkers, MapComponent only needs `clients.ctr`, `clients.fss`, `clients.airportAtc`, `cachedAirports`, and `cachedFirBoundaries`.

### Current Architecture (What Exists)

**PilotMarkers.jsx (84 lines):**
- `generatePilotMarkers()` — exports a function (not a component) that calls hooks (`useSelector`, `useDispatch`, `useCallback`, `useRef`, `useEffect`)
- `PilotMarkerItem` — already `React.memo`'d with custom equality on `key`, `latitude`, `longitude`, `heading`, `image`, `onPress`
- Platform-specific rendering: Android uses `rotation` prop; iOS uses Image with CSS transform
- Fallback to `mapIcons.B737` PNG when `pilot.image` is null
- Selection toggle: same pilot pressed → deselect, different pilot → select

**MapComponent.jsx (120 lines):**
- Calls `generatePilotMarkers()` as a function inside `getMarkers()`
- Broad `useSelector(state => state.vatsimLiveData)` selector
- Filter toggle: `filters.pilots ? pilotMarkers : []`
- Android workaround for Polygon ghost overlays (NOT needed for Markers)

**vatsimLiveDataActions.js:**
- Lines ~100-106: assigns `pilot.image` and `pilot.imageSize` from `getAircraftIcon()` during every 20s poll
- Already delegates to `aircraftIconService.getMarkerImage()` (Story 3.1)

**ClusteredPilotMarkers.jsx (172 lines):**
- Alternative clustering implementation using `react-native-map-clustering`
- Has its own `PilotMarker` sub-component with different rendering logic
- Contains hardcoded color literal `rgba(42, 93, 153, 0.8)` — needs theme token fix
- Currently unused but must remain functional

### Refactoring Pattern

The refactoring pattern for `generatePilotMarkers` → `<PilotMarkers />`:

**Before (current):**
```javascript
// PilotMarkers.jsx
export default function generatePilotMarkers() {
    const pilots = useSelector(state => state.vatsimLiveData.clients.pilots);
    // ... hooks and logic ...
    return pilots.map(pilot => <PilotMarkerItem ... />);
}

// MapComponent.jsx
const pilotMarkers = generatePilotMarkers(); // Called as function
```

**After (refactored):**
```javascript
// PilotMarkers.jsx
const PilotMarkers = React.memo(function PilotMarkers() {
    const pilots = useSelector(state => state.vatsimLiveData.clients.pilots);
    // ... hooks and logic (same) ...
    return pilots.map(pilot => <PilotMarkerItem ... />);
});
export default PilotMarkers;

// MapComponent.jsx
{filters.pilots && <PilotMarkers />}  // Rendered as JSX component
```

**Key insight:** The internal logic of `PilotMarkers` stays almost identical. The change is how it's exported and consumed. As a proper component, `PilotMarkers` owns its own Redux selectors — `MapComponent` no longer subscribes to pilot data, eliminating cross-concern re-renders.

**MapView children rendering:** `react-native-maps` `<MapView>` accepts mixed children — `<Marker>`, `<Polygon>`, `<Polyline>`, and fragments/arrays are all valid. Returning a fragment of `<PilotMarkerItem>` elements from `<PilotMarkers />` works correctly.

### Android Marker Behavior (Safe for Conditional Rendering)

Unlike Polygon and Circle overlays, `<Marker>` elements do NOT suffer from the Android ghost overlay bug (react-native-maps issues #5052, #5080, #3783). Markers can be safely conditionally rendered (`{visible && <PilotMarkers />}`) without accumulating ghost overlays. The transparency workaround used for CTR polygons is NOT needed for pilot markers.

### Icon Assignment Pipeline (Already Working)

```
vatsimLiveDataActions.updateData() [every 20s]
  → pilot.flight_plan.aircraft → getAircraftIcon(typeCode)
    → aircraftIconService.getMarkerImage(typeCode) → { image: { uri }, sizeDp }
  → pilot.image = image, pilot.imageSize = sizeDp
  → Redux dispatch → PilotMarkers re-renders
```

This pipeline was fully implemented in Story 3.1. Story 3.2 does NOT need to modify the icon assignment logic.

### Performance Strategy: Two-Layer Memoization

**Layer 1 — Component boundary (new in this story):** `React.memo` on `<PilotMarkers />` prevents re-renders from non-pilot state changes (ATC updates, airport data, app state, filter toggles on other layers). This is the **primary performance win** of the refactor — `MapComponent` no longer re-runs the 1,500-pilot `.map()` loop when unrelated Redux state changes.

**Layer 2 — Individual marker memo (already exists):** `PilotMarkerItem` has custom `React.memo` equality comparing `latitude`, `longitude`, `heading`, and `image`. During the 20s poll cycle, `PilotMarkers` WILL re-render (the `pilots` array is a new reference every poll — this is correct since positions update). But most individual `PilotMarkerItem` components bail out because pilots barely move in 20 seconds.

**Native layer optimization:** `tracksViewChanges={false}` on all markers means even when React updates a marker, the native layer doesn't re-render the bitmap. This is essential for 1,500+ markers.

**Sorting elimination:** The `.sort()` call in `getMarkers()` (line 58) currently includes pilot markers. After extraction, pilot markers render independently as `<MapView>` children and no longer participate in this O(n log n) sort.

**Note on structural sharing:** A future optimization could preserve pilot object references in the reducer when lat/lng/heading haven't changed, making Layer 2 memo checks even cheaper (reference equality instead of field comparison). This is NOT in scope for this story — defer to a dedicated performance story if profiling shows need.

### Filter Chip Integration

Current flow (preserved):
1. User presses "Pilots" chip → `dispatch(pilotsFilterClicked())`
2. `appReducer` toggles `state.filters.pilots` boolean
3. `MapComponent` reads `filters.pilots` and conditionally renders `<PilotMarkers />`
4. `VatsimMapView` deselects client if it was a pilot and filter toggled off

### Cold Start Behavior

Redux state is persisted to AsyncStorage via `storageService.js`. On cold start, `retrieveSavedState()` rehydrates the store with last-known `vatsimLiveData.clients.pilots`. Pilot markers render immediately with stale positions. `StaleIndicator` shows a warning until fresh data arrives. This behavior is preserved — no changes needed.

### Project Structure Notes

- **Modified:** `app/components/vatsimMapView/PilotMarkers.jsx` — refactored to React component
- **Modified:** `app/components/vatsimMapView/MapComponent.jsx` — targeted selectors, JSX rendering of PilotMarkers
- **Modified:** `app/components/vatsimMapView/ClusteredPilotMarkers.jsx` — compatibility update for `{ uri }` images, theme token color fix
- **New:** `__tests__/PilotMarkers.test.js` — component tests

### Previous Story Intelligence (3.1)

From Story 3.1 implementation:
- `expo-file-system` uses the modern `File`/`Directory`/`Paths` class-based API (not deprecated legacy API)
- `@shopify/react-native-skia` v2.4.18 is installed and working with Expo SDK 55
- Jest mocks for Skia, expo-asset, expo-file-system are in `jest.setup.js`
- `MainApp.jsx` calls `aircraftIconService.init(activeTheme)` and gates data polling on `iconsReady` flag
- 63 tests currently passing across 3 suites
- 5 pre-existing ESLint warnings in plugin files — do not treat as new errors
- Icon sizing: single resolved size per icon key (not variant-based) — intentional for Android consistency
- `mapIcons.B737` PNG retained as fallback safety net for pre-init edge case
- `react-native-maps` is NOT mocked in `jest.setup.js` yet — PilotMarkers component tests will need `MapView` and `Marker` mocks added

### Git Intelligence

Recent commits on `2.0.0` branch:
- `a9e7279` — Settings view reorganization
- `8372378` — Story 3.1: AircraftIconService SVG-to-bitmap pipeline
- `b4b56fa` — Epic 2 close + Epic 3 performance notes
- `3af17e7` — Memoize ThemeProvider value and dataStatus
- `60a22be` — Optimize overlay caches: cache resolved airspace, evict stale entries

Pattern: Performance optimizations are being applied alongside functional changes (not deferred).

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — AircraftIconService section, Map performance cross-cutting concern]
- [Source: _bmad-output/implementation-artifacts/3-1-aircrafticonservice-svg-to-bitmap-pipeline.md — previous story]
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-03-15.md — performance refactor notes]
- [Source: app/components/vatsimMapView/PilotMarkers.jsx — current implementation]
- [Source: app/components/vatsimMapView/MapComponent.jsx — current integration]
- [Source: app/components/vatsimMapView/ClusteredPilotMarkers.jsx — clustering module]
- [Source: app/redux/actions/vatsimLiveDataActions.js — pilot image assignment]
- [Source: _bmad-output/project-context.md — project rules and anti-patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Jest setup required adding mocks for `react-native-maps` (string mocks), `@react-native-async-storage/async-storage`, and adding `react-redux`/`redux` to `transformIgnorePatterns`
- NativeWind CSS interop causes `_ReactNativeCSSInterop` scope errors in jest.mock factories — resolved by using string-based mocks instead of React.createElement

### Completion Notes List

- ✅ Task 1: Refactored `generatePilotMarkers()` function into `React.memo(function PilotMarkers())` proper component. `PilotMarkerItem` preserved with existing custom equality. `MapComponent` now renders `<PilotMarkers />` as JSX child with `{filters.pilots && <PilotMarkers />}` conditional.
- ✅ Task 2: Replaced broad `useSelector(state => state.vatsimLiveData)` in `MapComponent` with 5 targeted selectors (`clients.ctr`, `clients.fss`, `clients.airportAtc`, `cachedAirports`, `cachedFirBoundaries`). Removed `clients` and `airports` intermediate variables. `getMarkers()` now receives individual data pieces as arguments.
- ✅ Task 3: Verified `pilot.image` assignment pipeline (Story 3.1), fallback to `mapIcons.B737`, and platform-specific rotation. Removed `console.warn('Pilot missing image:')` debug logging.
- ✅ Task 4: Updated `ClusteredPilotMarkers.jsx` — added missing `Image` import, added `mapIcons` import for B737 fallback, applied `pilot.image`/`pilot.imageSize` pattern with fallback, aligned the single-pilot render path with the main `PilotMarkers` platform strategy (Android native `image` + `rotation`, iOS child `Image` + rotate transform), and replaced the hardcoded cluster badge color with a theme token via `useTheme()` (`activeTheme.accent.primary + 'CC'`). Fixed `flex: 1` inline style to `StyleSheet`.
- ✅ Task 5: Manual validation completed — verified smooth panning with a full live data set, confirmed the `PilotMarkers` component boundary avoids unnecessary non-pilot recomputation, confirmed marker-level memo behavior during poll cycles, and verified pilot filter toggle responsiveness.
- ✅ Task 6: Created `__tests__/PilotMarkers.test.js` with 5 tests. Added `react-native-maps` mock and `AsyncStorage` mock to `jest.setup.js`. Added `react-redux`/`redux` to `transformIgnorePatterns`. Exported the `PilotMarkerItem` memo comparator for direct test coverage after the review found the original output-comparison test was too weak. 68/68 tests pass. 0 new ESLint errors (5 pre-existing plugin warnings).
- ✅ Senior review fixes: Installed `react-native-map-clustering`, corrected the clustered single-pilot renderer to match the main marker behavior, strengthened the memo equality test, and reconciled the recorded file list with the actual git changes.
- ✅ Final manual review: Human validation completed for Task 5, clearing the remaining AC4/AC3 performance gate and allowing the story to move to `done`.

### File List

- `app/components/vatsimMapView/PilotMarkers.jsx` — Modified: refactored from function to React.memo component, removed console.warn, extracted defaultImageSize as module-level constant, exported memo comparator for direct unit testing
- `app/components/vatsimMapView/MapComponent.jsx` — Modified: targeted selectors replacing broad vatsimLiveData selector, render PilotMarkers as JSX child, removed pilot markers from getMarkers() sort
- `app/components/vatsimMapView/ClusteredPilotMarkers.jsx` — Modified: added Image/mapIcons imports, useTheme for cluster color, fallback image pattern, platform-specific Android/iOS single-pilot rendering parity with `PilotMarkers`, StyleSheet for flex style
- `__tests__/PilotMarkers.test.js` — New: 5 unit tests for PilotMarkers component and `PilotMarkerItem` memo comparator
- `jest.setup.js` — Modified: added react-native-maps mock, AsyncStorage mock
- `package.json` — Modified: added react-redux/redux to jest transformIgnorePatterns and installed `react-native-map-clustering`
- `package-lock.json` — Modified: lockfile update for the added clustering dependency

## Change Log

- 2026-03-15: Implemented story 3.2 — refactored PilotMarkers from function to React.memo component for selector isolation, optimized MapComponent selectors, updated ClusteredPilotMarkers for { uri } image compatibility and theme token compliance, added 5 component tests
- 2026-03-15: Senior review fixes — installed `react-native-map-clustering`, aligned clustered marker rendering with the main PilotMarkers platform behavior, strengthened the memo equality test, and updated the recorded file list; manual performance validation remains pending so the story returned to `in-progress`
- 2026-03-15: Manual validation completed — verified the remaining performance and interaction checks and advanced the story to `done`

## Senior Developer Review (AI)

**Outcome:** Approved

- Fixed during review: `ClusteredPilotMarkers.jsx` now has its missing dependency installed and its single-pilot path matches the main pilot marker Android/iOS rendering strategy.
- Fixed during review: the weak memoization test was replaced with a direct test of the exported `PilotMarkerItem` comparator so Task 6.2 is now accurately covered.
- Fixed during review: the story File List now includes `package.json` and `package-lock.json`, which were both changed in git.
- Manual validation has now been completed by the user, so the remaining blocker is cleared and the story is approved.
