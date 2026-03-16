# Story 3.4: Zoom-Aware Airport Markers — Infrastructure & Image Markers

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want airport markers that adapt to zoom level — showing only staffed airports at wide zoom and adding unstaffed airports as I zoom in,
So that the map stays clean at continental view but reveals more airports as I focus on a region.

## Acceptance Criteria

1. **AC1 — Zoom level tracking:** `MapComponent.jsx` extracts the current zoom level from the `onRegionChangeComplete` callback using `Math.log2(360 / region.latitudeDelta)` and passes it to `AirportMarkers` as a prop. The zoom level is stored as component-local state (NOT dispatched to Redux) to avoid triggering unrelated re-renders on every pan/zoom gesture.

2. **AC2 — Continental zoom (3-4):** At zoom levels 3-4 (`latitudeDelta` ~22.5-45), only airports with at least one staffed ATC position appear. Each staffed airport renders as a small blue dot with ICAO code at 8px font size, using a native `Image` marker (pre-rendered bitmap) for 60fps performance.

3. **AC3 — Regional zoom (5-6):** At zoom levels 5-6 (`latitudeDelta` ~5.6-11.25), staffed airports render as a dot + ICAO at 11px font size. Unstaffed airports **that have active traffic** (pilots with matching departure or arrival in their flight plan) additionally appear as small grey dots with green ▲ departure count and/or red ▼ arrival count — no ICAO label. Unstaffed airports with zero traffic do NOT render. All use native `Image` markers.

4. **AC4 — ATC filter toggle:** Airport markers are hidden when the ATC filter chip is toggled off. The Android transparency workaround is preserved — TRACON polygons and APP circles stay in the React tree with TRANSPARENT fill/stroke when hidden (existing behavior from Story 3.3). Airport dot markers are conditionally rendered (not in tree when hidden) since they are native Image markers that don't suffer from the Android ghost overlay issue.

5. **AC5 — Staffed vs unstaffed color:** Airport dot color is `activeTheme.atc.staffed` (blue) when any ATC position is staffed at that airport. Unstaffed airports use `activeTheme.text.muted` (grey). Colors adapt to light/dark theme.

6. **AC6 — Touch targets:** All airport markers have a minimum 44x44px touch target, achieved via the marker's `anchor` and inherent tap area. On tap, `dispatch(allActions.appActions.clientSelected(airport))` fires (existing behavior preserved).

7. **AC7 — Performance at scale:** Rendering hundreds of airports at continental/regional zoom maintains 60fps panning. This is achieved by using pre-rendered bitmap `Image` markers instead of View-based markers. The `tracksViewChanges={false}` prop is set on all airport markers.

8. **AC8 — Existing TRACON/APP overlay behavior preserved:** All TRACON polygon and APP fallback circle rendering from Story 3.3 continues to work identically — caching with stale eviction, theme token colors, Android transparency workaround. TRACON/APP overlays render at all zoom levels (they are large enough to be meaningful even at continental zoom).

9. **AC9 — Image marker generation infrastructure:** A new utility generates airport marker bitmaps (dot + optional ICAO text + optional ▲/▼ traffic indicators) at the required sizes and colors, suitable for use as `Image` marker sources on both iOS and Android. This infrastructure will also be used by Story 3.5 for local-zoom View-based markers.

10. **AC10 — Traffic counts aggregation:** During each 20-second VATSIM data poll, `vatsimLiveDataActions.js` computes a `trafficCounts` map (`Map<icao, {departures: number, arrivals: number}>`) by scanning all pilots' `flight_plan.departure` and `flight_plan.arrival` fields. This is stored in `vatsimLiveData.clients.trafficCounts` and available to AirportMarkers and future stories (3.5, 4.4, 5.2).

## Tasks / Subtasks

- [ ] Task 1: Add zoom level tracking to MapComponent (AC: #1)
  - [ ] 1.1: Add `useState` for `zoomLevel` in `MapComponent`, initialized from `initialRegion.latitudeDelta` using `Math.log2(360 / latitudeDelta)` (default to ~4 if `latitudeDelta` is missing/undefined)
  - [ ] 1.2: Update the `onRegionChangeComplete` callback to compute zoom level from `region.latitudeDelta` and call `setZoomLevel()` — keep the existing `saveInitialRegion` dispatch as-is
  - [ ] 1.3: Pass `zoomLevel` as a prop to `<AirportMarkers>`: `<AirportMarkers visible={filters.atc} zoomLevel={zoomLevel} />`

- [ ] Task 2: Add airport marker theme tokens (AC: #5)
  - [ ] 2.1: Add `atc.airportDot` token to both light and dark themes in `themeTokens.js` — same value as `atc.staffed` (light: `#2A6BC4`, dark: `#3B7DD8`) — this provides a semantic alias for airport marker dot color
  - [ ] 2.2: Add `atc.airportDotUnstaffed` token — use `text.muted` value (light: `#8B949E`, dark: `#484F58`) — grey for unstaffed airports

- [ ] Task 3: Add traffic counts aggregation to data pipeline (AC: #10)
  - [ ] 3.1: In `vatsimLiveDataActions.js`, after processing pilots, compute `trafficCounts` — a plain object keyed by ICAO: `{ [icao]: { departures: number, arrivals: number } }`. Single pass over the pilots array, incrementing departure count for `flight_plan.departure` and arrival count for `flight_plan.arrival`. Skip pilots with missing/empty flight plans.
  - [ ] 3.2: Add `trafficCounts` to the `clients` object dispatched in `DATA_UPDATED` action (alongside existing `pilots`, `airportAtc`, `ctr`, `fss`)
  - [ ] 3.3: Update `vatsimLiveDataReducer.js` to store `trafficCounts` in `state.clients.trafficCounts` (default: `{}`)
  - [ ] 3.4: Add unit test for traffic counts aggregation — verify correct departure/arrival counting, missing flight plan handling

- [ ] Task 4: Create airport marker bitmap generation utility (AC: #9, #7)
  - [ ] 4.1: Create `app/common/airportMarkerService.js` — a utility that generates airport marker bitmaps using `@shopify/react-native-skia` offscreen canvas (same approach as `aircraftIconService.js` from Story 3.1)
  - [ ] 4.2: Implement `generateAirportDot(color, sizeDp)` — renders a filled circle of the given color at the given size
  - [ ] 4.3: Implement `generateAirportDotWithIcao(color, icao, fontSize, sizeDp)` — renders a dot with ICAO text label to the right, using JetBrains Mono font
  - [ ] 4.4: Implement `generateTrafficDot(color, departures, arrivals, sizeDp)` — renders a grey dot with green ▲ count and/or red ▼ count. Only show ▲ if departures > 0, only show ▼ if arrivals > 0. Use compact layout (dot + symbols side by side)
  - [ ] 4.5: Implement a caching layer keyed by visual signature (e.g., `${color}-${icao}-${fontSize}` for staffed, `${color}-${dep}-${arr}` for unstaffed traffic) — return cached bitmap on repeat calls; invalidate cache on theme change
  - [ ] 4.6: Export `getAirportMarkerImage(icao, isStaffed, zoomBand, activeTheme, trafficInfo)` — returns the appropriate pre-rendered bitmap. `trafficInfo` is `{departures, arrivals}` or null. `zoomBand` is one of: `'continental'`, `'regional'`, `'local'`
  - [ ] 4.7: Ensure Android compatibility — use the same `SkImage.encodeToBase64()` → data URI pattern established in `aircraftIconService.js` for Android `image` prop
  - [ ] 4.8: Ensure iOS compatibility — use the same pattern established in `aircraftIconService.js` for iOS child `<Image>` rendering

- [ ] Task 5: Add zoom band constants (AC: #2, #3)
  - [ ] 5.1: Add zoom band constants to `consts.js`: `ZOOM_CONTINENTAL_MAX = 4`, `ZOOM_REGIONAL_MAX = 6`, `ZOOM_LOCAL_MIN = 7`
  - [ ] 5.2: Add a helper function `getZoomBand(zoomLevel)` in `consts.js` that returns `'continental'`, `'regional'`, or `'local'` based on the thresholds
  - [ ] 5.3: Add `AIRPORT_MARKER_FONT_CONTINENTAL = 8`, `AIRPORT_MARKER_FONT_REGIONAL = 11` constants

- [ ] Task 6: Redesign AirportMarkers for zoom-aware rendering (AC: #2, #3, #4, #5, #6, #7, #8, #10)
  - [ ] 6.1: Accept new `zoomLevel` prop (default: 4). Compute `zoomBand` from `getZoomBand(zoomLevel)`.
  - [ ] 6.2: Add internal selector for `trafficCounts`: `useSelector(state => state.vatsimLiveData.clients.trafficCounts)`
  - [ ] 6.3: Derive the unstaffed-with-traffic set: iterate `trafficCounts` keys, filter to ICAOs NOT in `airportAtc`, look up airport data from `cachedAirports`. This is bounded by active pilot count (~200-400 unique airports at peak), not the full airport database.
  - [ ] 6.4: At continental zoom band: render only staffed airports. Use `getAirportMarkerImage(icao, true, 'continental', activeTheme, null)` for the marker image.
  - [ ] 6.5: At regional zoom band: render staffed airports with `getAirportMarkerImage(icao, true, 'regional', activeTheme, null)` (blue dot + ICAO). Additionally render unstaffed-with-traffic airports with `getAirportMarkerImage(icao, false, 'regional', activeTheme, {departures, arrivals})` (grey dot + ▲/▼ counts, no ICAO label). Unstaffed airports with zero traffic do NOT render.
  - [ ] 6.6: At local zoom band (7+): for this story, render the same as regional (Story 3.5 will add View-based markers with ATC badges and traffic counts at local zoom)
  - [ ] 6.7: Keep existing TRACON polygon and APP circle rendering logic unchanged — these render at all zoom levels when `visible=true`
  - [ ] 6.8: Keep the existing `AirportMarkerItem` component but update it to handle the new image sources from `airportMarkerService`
  - [ ] 6.9: Preserve the Android ghost overlay workaround for TRACON polygons and APP circles (existing behavior)
  - [ ] 6.10: Ensure `tracksViewChanges={false}` on all airport markers for performance

- [ ] Task 7: Testing and lint (AC: #1-#10)
  - [ ] 7.1: Update `__tests__/AirportMarkers.test.js` — add tests for: continental zoom shows only staffed airports, regional zoom shows staffed + unstaffed-with-traffic, unstaffed with no traffic NOT rendered, zoom prop changes marker rendering
  - [ ] 7.2: Add unit tests for `airportMarkerService.js` — mock Skia offscreen canvas, test caching behavior, test theme change invalidation, test traffic dot rendering with ▲/▼
  - [ ] 7.3: Add test for MapComponent zoom level calculation — verify `onRegionChangeComplete` updates zoomLevel state
  - [ ] 7.4: Add test for traffic counts aggregation in data actions — verify correct counting from pilot flight plans
  - [ ] 7.5: Run ESLint — zero new warnings (5 pre-existing plugin warnings acceptable)
  - [ ] 7.6: Run full test suite (`npm test`) — zero regressions

- [ ] Task 8: Manual validation (AC: #1-#10)
  - [ ] 8.1: At continental zoom (Europe view): only staffed airports visible, small dot + ICAO, panning is smooth
  - [ ] 8.2: At regional zoom (UK view): staffed airports with ICAO, unstaffed-with-traffic as grey dots with ▲/▼ counts, panning is smooth
  - [ ] 8.3: Verify unstaffed airports with zero traffic do NOT appear
  - [ ] 8.4: Zoom in/out: markers transition between continental and regional rendering
  - [ ] 8.5: Toggle ATC filter chip: airport markers disappear/reappear
  - [ ] 8.6: Switch theme: airport marker colors update (blue staffed, grey unstaffed adapt)
  - [ ] 8.7: Tap staffed airport marker: bottom sheet opens with airport details
  - [ ] 8.8: Tap unstaffed-with-traffic airport marker: bottom sheet opens with airport info
  - [ ] 8.9: TRACON polygons still render correctly at all zoom levels
  - [ ] 8.10: Test on both iOS and Android

## Dev Notes

### Architecture Requirements

This story introduces **zoom-aware airport marker rendering** — the first component in VatView that changes its visual presentation based on map zoom level. The architecture pattern established here (zoom tracking in MapComponent, zoom band classification, conditional rendering) will be reused by Story 3.5 (ATC badges at local zoom) and Story 3.6 (ground aircraft fade-in at local zoom).

**Key architectural decision:** Zoom level is tracked as **MapComponent-local state**, NOT dispatched to Redux. This avoids:
- Unnecessary Redux re-renders for every pan/zoom gesture
- Persisting zoom level to AsyncStorage (the region itself is already persisted)
- Triggering re-renders in components that don't need zoom level

AirportMarkers receives `zoomLevel` as a prop from MapComponent. React.memo ensures AirportMarkers only re-renders when `zoomLevel` crosses a band threshold or when live data updates.

### Airport Marker Bitmap Pipeline

This story introduces `airportMarkerService.js` — a Skia-based bitmap generation utility modeled after `aircraftIconService.js` (Story 3.1). The pipeline:

1. `AirportMarkers` calls `getAirportMarkerImage(icao, isStaffed, zoomBand, activeTheme, trafficInfo)`
2. `airportMarkerService` checks its cache for a matching bitmap
3. If cache miss: renders a dot + optional ICAO text OR ▲/▼ traffic indicators to an offscreen Skia canvas → exports as bitmap
4. Returns the bitmap reference suitable for `<Marker image={...}>` (Android) or `<Image source={...}>` (iOS)

**Three marker visual types:**
- **Staffed:** Blue dot + ICAO text (JetBrains Mono) — at continental (8px) and regional (11px)
- **Unstaffed with traffic:** Grey dot + green ▲ count + red ▼ count — compact, no ICAO label
- **Unstaffed without traffic:** Not rendered at all

**Why Skia and not static PNGs?** Airports need dynamic marker images — the ICAO code is unique per airport, and colors change with theme. Pre-rendering static PNGs for thousands of airports isn't feasible. Skia offscreen rendering generates bitmaps on demand and caches them.

**Caching strategy:**
- Cache key: `${color}-${icao}-${fontSize}` (unique per visual appearance)
- Cache invalidation: clear entire cache on theme change (same approach as aircraftIconService)
- Cache is warm after first render cycle — subsequent 20s polls hit cache for all visible airports

### Zoom Level Calculation

`react-native-maps` `onRegionChangeComplete` provides `region.latitudeDelta`. Convert to Google Maps zoom level:

```javascript
const zoomLevel = Math.log2(360 / region.latitudeDelta);
```

| Zoom | latitudeDelta | Band |
|------|---------------|------|
| 3 | ~45 | Continental |
| 4 | ~22.5 | Continental |
| 5 | ~11.25 | Regional |
| 6 | ~5.6 | Regional |
| 7 | ~2.8 | Local |
| 8+ | <1.4 | Local |

The zoom level is a continuous float. `getZoomBand()` classifies it into discrete bands using the threshold constants.

### Unstaffed Airport Rendering — Traffic-Based (Party Mode Design Decision)

Currently, `AirportMarkers` only renders airports that have entries in `airportAtc` (staffed). This story adds rendering of **unstaffed airports that have active traffic** at regional zoom and above.

**Design rationale (from party mode review):** Showing ALL unstaffed airports from the database (~10k) would cause both performance problems (10k React Marker components) and UX clutter. Instead, only show unstaffed airports where pilots are actively departing from or arriving to. This means every marker on the map has a *reason* to be there — zero visual noise.

**Data pipeline:**
1. `vatsimLiveDataActions.js` computes `trafficCounts` during each 20s poll — a single pass over the pilots array counting departures/arrivals per ICAO
2. `trafficCounts` is stored in `clients.trafficCounts` in Redux (reusable by Stories 3.5, 4.4, 5.2)
3. `AirportMarkers` reads `trafficCounts`, cross-references with `airportAtc` to find unstaffed-with-traffic airports
4. Unstaffed-with-traffic airports render as grey dot + green ▲ departure count + red ▼ arrival count

**Performance:** The unstaffed-with-traffic set is bounded by active pilot count (~200-400 unique airports at peak traffic), not the full airport database. No viewport filtering needed.

**Zoom behavior:**
- **Continental (3-4):** Staffed only. Clean, predictable — no magic traffic thresholds.
- **Regional (5-6):** Staffed + unstaffed-with-traffic. Every dot has a reason.
- **Local (7+):** Same as regional for this story. Story 3.5 adds View-based markers with ATC badges.

### Android Ghost Overlay Workaround — PRESERVED

The existing workaround for TRACON polygons and APP circles remains unchanged:
- Polygons/Circles stay in the React tree at all times
- When `visible=false`: TRANSPARENT fill/stroke, strokeWidth 0, tappable=false
- `useMapRemountKey()` in MapComponent forces native remount on app resume

Airport dot markers (native Image markers) do NOT need this workaround — they can be conditionally rendered without ghost overlay issues. Only `Polygon` and `Circle` components from `react-native-maps` exhibit the ghost overlay bug.

### Current AirportMarkers Analysis (Post Story 3.3)

**AirportMarkers.jsx (251 lines) — current state:**
- `React.memo` component accepting `visible` prop (refactored in Story 3.3)
- Internal Redux selectors: `airportAtc`, `cachedAirports`, `traconBoundaryLookup`
- `AirportMarkerItem` — React.memo'd sub-component with platform-specific rendering (Android: `image` prop, iOS: child `<Image>`)
- Uses `getAtcIcon()` from `iconsHelper.js` for PNG-based ATC icons (tower, antenna, radar, etc.)
- TRACON polygon and APP circle caching with stale eviction at 5 polls

**What changes:**
- Accept `zoomLevel` prop
- Replace `getAtcIcon()` with `getAirportMarkerImage()` for dot-based markers
- Add `trafficCounts` selector and unstaffed-with-traffic airport rendering at regional+ zoom
- Remove the per-ATC-type icon logic (tower/antenna/radar) — Story 3.4 uses simple colored dots. The ATC-type-specific icons will return in Story 3.5 as ATC letter badges.

**What stays the same:**
- TRACON polygon rendering logic (lines 164-202)
- APP circle rendering logic (lines 204-238)
- Android transparency workaround for polygons/circles
- `onPress` dispatch to `clientSelected`
- Stale eviction caching pattern

### Previous Story Intelligence (3.3)

From Story 3.3 implementation:
- Component refactoring pattern: `React.memo(function ComponentName({props}) {...})` with internal selectors works cleanly
- `react-native-maps` MapView accepts mixed children: Markers, Polygons, Circles, fragments — all valid
- Jest mocks for `react-native-maps` use string-based approach in `jest.setup.js` (Polygon, Circle, Marker already mocked)
- 76 tests currently passing across all suites
- 5 pre-existing ESLint warnings in plugin files — do not treat as new errors
- `activeTheme` from `useTheme()` provides all color tokens; `activeTheme.atc.*` for ATC-related colors
- `tracksViewChanges={false}` is critical for Image marker performance

### Git Intelligence

Recent commits (Story 3.3):
- `d8b9b0a` — Implement story 3-3: ATC polygon overlays with theme tokens
- `6437c9e` — Add FR44: Ground aircraft zoom-dependent visibility (PRD update)
- `2d20d39` — Add flight track visualization to Phase 2+ vision in PRD

Files modified in Story 3.3: `themeTokens.js`, `CTRPolygons.jsx`, `AirportMarkers.jsx`, `MapComponent.jsx`, `jest.setup.js` + new test files. These are the same files this story will touch.

### Project Structure Notes

- **Modified:** `app/components/vatsimMapView/MapComponent.jsx` — add zoom level state, pass to AirportMarkers
- **Modified:** `app/components/vatsimMapView/AirportMarkers.jsx` — accept zoomLevel prop, zoom-conditional rendering, traffic-based unstaffed airports, replace ATC icons with dot markers
- **Modified:** `app/common/themeTokens.js` — add airport dot color tokens
- **Modified:** `app/common/consts.js` — add zoom band constants
- **Modified:** `app/redux/actions/vatsimLiveDataActions.js` — add trafficCounts aggregation during poll cycle
- **Modified:** `app/redux/reducers/vatsimLiveDataReducer.js` — store trafficCounts in clients
- **New:** `app/common/airportMarkerService.js` — Skia-based airport marker bitmap generator (dot, dot+ICAO, dot+▲/▼)
- **Modified:** `__tests__/AirportMarkers.test.js` — add zoom-aware and traffic-based tests
- **New:** `__tests__/airportMarkerService.test.js` — bitmap generation tests

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.4]
- [Source: _bmad-output/planning-artifacts/architecture.md — Zoom-Aware Airport Markers section]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Zoom-Dependent Airport Display, ATC badges, marker types]
- [Source: _bmad-output/implementation-artifacts/3-3-atc-polygon-overlays-fir-and-tracon.md — previous story patterns, component refactoring, theme token usage]
- [Source: _bmad-output/project-context.md — project rules, anti-patterns, ESLint rules]
- [Source: app/components/vatsimMapView/AirportMarkers.jsx — current implementation (post Story 3.3)]
- [Source: app/components/vatsimMapView/MapComponent.jsx — current integration, onRegionChangeComplete]
- [Source: app/common/themeTokens.js — current design token system]
- [Source: app/common/iconsHelper.js — current ATC icon approach (being replaced)]
- [Source: app/common/consts.js — existing constants, INITIAL_REGION]
- [Source: app/common/airportTools.js — getAirportByCode, cachedAirports structure]
- [Source: app/redux/actions/appActions.js — saveInitialRegion, region handling]
- [Source: app/redux/reducers/appReducer.js — app state shape, initialRegion]
- [Source: app/redux/actions/vatsimLiveDataActions.js — pilot data processing, flight_plan.departure/arrival fields]
- [Source: app/common/aircraftIconService.js — Skia offscreen bitmap pipeline pattern to follow]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
