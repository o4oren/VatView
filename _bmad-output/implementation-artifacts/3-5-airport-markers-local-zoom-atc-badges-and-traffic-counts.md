# Story 3.5: Airport Markers — Local Zoom ATC Badges & Traffic Counts

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see ATC letter badges and traffic counts on airport markers when zoomed in to a region,
So that I can assess airport staffing and activity at a glance without tapping.

## Acceptance Criteria

1. **AC1 — View-based markers at Continental+ zoom:** When the map is at Continental zoom (5+) or above, airport markers switch from Skia-bitmap Image markers to React Native View-based markers with two-row layout (Row 1: dot + ICAO + traffic counts, Row 2: ATC letter badges). At Global zoom (≤4), the existing Image markers from Story 3.4 continue to render (staffed only, no traffic counts). Five zoom bands: Global (≤4), Continental (5-6), Regional (7-8), Local (9-10), Airport (>10).

2. **AC2 — ATC letter badges:** At Continental+ zoom, staffed airport markers display ATC letter badges below the ICAO code as colored pills with white letter text. Each badge is a single letter representing a staffed facility type:
   - **C** — Clearance Delivery (facility=2, `DEL`)
   - **G** — Ground (facility=3, `GND`)
   - **T** — Tower (facility=4, `TWR_ATIS`, callsign does NOT end with `ATIS`)
   - **A** (blue) — Approach/Departure (facility=5, `APP`)
   - **A** (cyan) — ATIS (facility=4, `TWR_ATIS`, callsign ends with `ATIS`; OR from `json.atis` array)
   Only badges for positions that are currently staffed appear. Unstaffed airports show ICAO only — no badges.

3. **AC3 — Badge colors with theme tokens:** Badge colors are defined as theme tokens in `themeTokens.js` and adapt to light/dark theme:
   | Badge | Dark | Light |
   |-------|------|-------|
   | C | `#656d76` | `#8b949e` |
   | G | `#1a7f37` | `#1a7f37` |
   | T | `#d29922` | `#bf8700` |
   | A (Approach) | `#3b7dd8` | `#2a6bc4` |
   | A (ATIS) | `#0ea5e9` | `#0284c7` |

4. **AC4 — Traffic count indicators:** At Continental+ zoom, all airport markers (staffed and unstaffed-with-traffic) display traffic count indicators: green ▲ with departure count and/or red ▼ with arrival count. Only non-zero counts are shown. At Global zoom, traffic counts are hidden. Uses the existing `trafficCounts` data from Redux (Story 3.4).

5. **AC5 — ICAO monospace rendering:** The ICAO code on View-based markers renders in monospace font (JetBrains Mono). Badge letters also use a bold weight for readability.

6. **AC6 — Smooth zoom transition:** The switch between Image markers (Global) and View-based markers (Continental+) should be as smooth as possible when zooming across the threshold. The marker position remains anchored to the airport coordinate. Note: React will destroy the Image marker and create a View marker — a single-frame gap is expected and acceptable. This is NOT a bug. Visual consistency (same dot color, similar ICAO size, dot on same coordinate) minimizes the perceived transition.

7. **AC7 — Touch targets:** All local-zoom View-based markers have a minimum 44x44px touch target. On tap, `dispatch(allActions.appActions.clientSelected(airport))` fires (existing behavior preserved).

8. **AC8 — ATC filter toggle preserved:** View-based airport markers respect the ATC filter chip toggle — hidden when the filter is off. The existing Android transparency workaround for TRACON polygons and APP circles remains unchanged.

9. **AC9 — Performance at local zoom:** View-based markers at local zoom maintain smooth panning. At local zoom, the number of visible airports is bounded (typically <50 on screen), so View-based markers are acceptable. `tracksViewChanges` handling: try `false` from the start; if Android renders blank marker bitmaps on first frame, fall back to a `useEffect`-based `true` → `false` flip after a short delay (~100ms). This is a known `react-native-maps` Android quirk with View-based markers.

10. **AC10 — Unstaffed airports at Continental+ zoom:** At Continental+ zoom, unstaffed airports with active traffic render as View-based markers showing: grey dot + ICAO in muted color + traffic counts (▲/▼). No ATC badges. Unstaffed airports with zero traffic do NOT render. At Global zoom, unstaffed airports are hidden entirely.

## Tasks / Subtasks

- [x] Task 1: Add ATC badge theme tokens (AC: #3)
  - [x] 1.1: Add `atc.badge` object to both light and dark themes in `themeTokens.js` with keys: `clearance`, `ground`, `tower`, `approach`, `atis` — using the exact hex values from AC3
  - [x] 1.2: Add `atc.badgeBackground` token for badge pill background — light: `rgba(0,0,0,0.06)`, dark: `rgba(255,255,255,0.10)` (subtle contrast behind letter)

- [x] Task 2: Add badge mapping utility (AC: #2)
  - [x] 2.1: Create a helper function `getAtcBadges(atcList, activeTheme)` in a new `app/common/airportBadgeHelper.js` (NOT in `consts.js` — keep `consts.js` as a pure constants file without theme dependencies). Input: array of ATC controller objects for an airport. Output: array of `{letter, color, key}` objects sorted in facility order (C, G, T, A-approach, A-atis). Deduplicate — if multiple TWR controllers exist, only one T badge.
  - [x] 2.2: ATIS detection: check `controller.callsign.endsWith('ATIS')` for `facility === 4` controllers. Controllers from the `json.atis` array are already added to `airportAtc` with their callsign ending in `_ATIS` — same detection works.
  - [x] 2.3: Add unit tests for `getAtcBadges()` — verify correct badge letters, colors, ordering, deduplication, ATIS vs TWR differentiation, empty input, single controller

- [x] Task 3: Create LocalAirportMarker View-based component (AC: #1, #2, #4, #5, #6, #7)
  - [x] 3.1: Create `app/components/vatsimMapView/LocalAirportMarker.jsx` — a `React.memo` View-based marker component that renders inside a `<Marker>` from `react-native-maps`
  - [x] 3.2: Layout structure: horizontal row containing: colored dot (View with borderRadius) → ICAO text (monospace, JetBrains Mono) → badge row (horizontal, each badge is a colored letter) → traffic counts (▲N ▼M)
  - [x] 3.3: Badge rendering: each badge is a `<Text>` with bold monospace font, colored by theme token. Badges are spaced 2dp apart in a horizontal row. Order: C, G, T, A(approach), A(atis).
  - [x] 3.4: Traffic count rendering: green ▲ with departure count, red ▼ with arrival count. Only show non-zero. Use the same green (`#1A7F37`) and red (`#CF222E`) as `airportMarkerService.js`.
  - [x] 3.5: Staffed marker: blue dot + ICAO (blue) + badge row + traffic counts
  - [x] 3.6: Unstaffed-with-traffic marker: grey dot + ICAO (muted) + traffic counts only (no badges)
  - [x] 3.7: Set `tracksViewChanges={false}` on the `<Marker>` wrapper (with `true` → `false` useEffect fallback if Android renders blank — see AC9). Set `anchor` so the **dot center** sits on the coordinate — account for left padding/margin before the dot (same anchoring problem Story 3.4 solved with `createMarkerResult`). Do NOT naively use `anchor={{x: 0, y: 0.5}}` which would place the View's left edge on the coordinate, not the dot.
  - [x] 3.8: Ensure minimum 44x44px touch target via `style={{minWidth: 44, minHeight: 44}}`
  - [x] 3.9: All styles via `StyleSheet.create()` — no inline styles, no color literals (use theme tokens)

- [x] Task 4: Integrate LocalAirportMarker into AirportMarkers (AC: #1, #6, #8, #10)
  - [x] 4.1: In `AirportMarkers.jsx`, when `zoomBand === 'local'`, render staffed airports using `<LocalAirportMarker>` instead of `<AirportMarkerItem>`. Pass: `airport`, `atcList` (from `airportAtc[icao]`), `trafficInfo`, `activeTheme`, `onPress`.
  - [x] 4.2: For unstaffed-with-traffic at local zoom, also use `<LocalAirportMarker>` with `atcList=[]` (no badges, just ICAO + traffic counts).
  - [x] 4.3: At continental and regional zoom, continue using the existing `<AirportMarkerItem>` with Image markers — NO changes to existing rendering.
  - [x] 4.4: Ensure the `visible` prop (ATC filter toggle) still controls rendering — View-based markers are conditionally rendered (not in tree when hidden), same as current Image markers.

- [x] Task 5: Testing (AC: #1-#10)
  - [x] 5.1: Add unit tests for `LocalAirportMarker` — verify: staffed marker shows badges, unstaffed shows no badges, correct badge letters/colors, traffic counts render, monospace font used, touch target size
  - [x] 5.2: Add unit tests for badge mapping — verify facility-to-badge mapping, ATIS detection, deduplication, ordering
  - [x] 5.3: Update `__tests__/AirportMarkers.test.js` — add tests for: local zoom renders `LocalAirportMarker` (not `AirportMarkerItem`), regional zoom still renders `AirportMarkerItem`, zoom transition between bands
  - [x] 5.4: Run ESLint — zero new warnings (5 pre-existing plugin warnings acceptable)
  - [x] 5.5: Run full test suite (`npm test`) — zero regressions

- [ ] Task 6: Manual validation (AC: #1-#10)
  - [ ] 6.1: At local zoom (city view, 7+): staffed airports show dot + ICAO + ATC badges + traffic counts
  - [ ] 6.2: Badge letters match staffed positions — e.g., EGLL with TWR+GND+APP shows T, G, A badges
  - [ ] 6.3: ATIS badge (cyan A) appears separately from Approach badge (blue A)
  - [ ] 6.4: Unstaffed-with-traffic airports at local zoom show grey dot + ICAO + ▲/▼ counts, no badges
  - [ ] 6.5: Zoom from regional to local: smooth transition, no flicker between Image and View markers
  - [ ] 6.6: Zoom from local to regional: markers switch back to Image markers cleanly
  - [ ] 6.7: Toggle ATC filter chip: all airport markers disappear/reappear
  - [ ] 6.8: Switch theme: all badge colors, dot colors, and text colors update
  - [ ] 6.9: Tap a local-zoom airport marker: bottom sheet opens with airport details
  - [ ] 6.10: TRACON polygons and APP circles still render correctly at local zoom
  - [ ] 6.11: Pan at local zoom with ~20-40 airports visible: smooth, no jank
  - [ ] 6.12: Test on both iOS and Android

## Dev Notes

### Architecture Requirements

This story adds **View-based airport markers at local zoom** — the first time VatView renders React Native Views inside map markers (as opposed to the bitmap Image markers used at continental/regional zoom). The key architectural constraint is **performance**: View-based markers are more expensive than Image markers, but at local zoom the number of visible airports is small enough (~20-50) that this is acceptable.

**Key architectural pattern:** The zoom band system from Story 3.4 (`getZoomBand()` → `'continental'`/`'regional'`/`'local'`) drives conditional rendering. At local zoom, `AirportMarkers` renders `<LocalAirportMarker>` (new View-based component) instead of `<AirportMarkerItem>` (existing Image-based component). This is a **component swap**, not a prop change — the marker type fundamentally changes.

**View-based marker approach:** `react-native-maps` `<Marker>` accepts children — when children are provided, the marker renders the View tree instead of an image. The `<LocalAirportMarker>` component returns a `<Marker>` with child Views for the dot, ICAO text, badge row, and traffic counts. `tracksViewChanges={false}` must be set after the initial render to avoid continuous native bridge calls.

### ATC Badge System

**Badge mapping from facility types:**

The VATSIM data model uses numeric facility types (defined in `consts.js`):
- `DEL = 2` → Badge **C** (Clearance)
- `GND = 3` → Badge **G** (Ground)
- `TWR_ATIS = 4` → Badge **T** (Tower) OR **A** (ATIS)
- `APP = 5` → Badge **A** (Approach)

**ATIS detection is critical:** Facility type 4 (`TWR_ATIS`) is shared between Tower and ATIS controllers. The distinction is made by **callsign suffix**:
- `EGLL_TWR` → Tower → Badge T
- `EGLL_ATIS` → ATIS → Badge A (cyan)

Additionally, VATSIM provides a separate `atis` array in the API response. These are processed by `vatsimLiveDataActions.js` (lines 167-175) and added to `clients.airportAtc[prefix]` with their original callsign (e.g., `EGLL_ATIS`). The same `endsWith('ATIS')` check works for both sources.

**Badge ordering:** Badges should appear in facility hierarchy order: C → G → T → A(approach) → A(atis). This mirrors the controller list sorting in `AirportAtcDetails.jsx`.

**Deduplication:** If multiple controllers of the same facility type exist (e.g., two TWR controllers at a busy airport), only show one badge per type. The badges represent *what's staffed*, not *how many*.

### Badge Color Tokens

The UX design specification defines exact badge colors (from UX spec lines 724-730):

| Badge | Dark Theme | Light Theme |
|-------|-----------|-------------|
| C (Clearance) | `#656d76` (grey) | `#8b949e` (grey) |
| G (Ground) | `#1a7f37` (green) | `#1a7f37` (green) |
| T (Tower) | `#d29922` (amber) | `#bf8700` (amber) |
| A (Approach) | `#3b7dd8` (blue) | `#2a6bc4` (blue) |
| A (ATIS) | `#0ea5e9` (cyan) | `#0284c7` (cyan) |

These must be added as theme tokens under `atc.badge.*` in `themeTokens.js`. Do NOT hardcode these colors in the component.

### View-Based Marker Layout

```
┌─────────────────────────────────────────────┐
│  ●  EGLL  [T] [G] [A] [A]   ▲12  ▼8       │
│  dot ICAO  badges             traffic       │
└─────────────────────────────────────────────┘
      ↑ anchor point (dot center on coordinate)
```

- **Dot:** Small colored circle (View with `borderRadius`). Blue (`atc.airportDot`) for staffed, grey (`atc.airportDotUnstaffed`) for unstaffed.
- **ICAO:** Monospace text (JetBrains Mono). Color matches dot color. This is the **primary read** — largest text element.
- **Badges:** Row of single-letter Text elements, each colored per its theme token. Bold weight. Small rounded background (`atc.badgeBackground`) for visual separation. **Badges should be ~80% of ICAO font size** to establish visual hierarchy — the eye reads ICAO first, then scans badges.
- **Traffic:** Green `▲N` and red `▼M` text. Same colors as `airportMarkerService.js` (`#1A7F37` green, `#CF222E` red). Tertiary visual importance — smallest text.

**Visual hierarchy:** ICAO (primary) → Badges (secondary) → Traffic counts (tertiary). Size and weight should reinforce this reading order.

### react-native-maps Marker with View Children

When a `<Marker>` has child Views, `react-native-maps` renders those children as the marker visual. Key considerations:
- `anchor` prop positions the marker relative to its bounds (e.g., `{x: 0, y: 0.5}` puts the left-center on the coordinate)
- `tracksViewChanges={false}` must be set to prevent continuous re-rendering on the native side
- `tracksViewChanges` should be `true` briefly on first render to capture the View snapshot, then set to `false`. However, for simplicity and given that the data changes every 20s anyway, setting it to `false` from the start and relying on React key changes or prop changes to trigger native re-render is the simpler approach. Test this — if badges don't appear on first render, use a brief `tracksViewChanges={true}` → `false` flip.
- On Android, View-based markers are rendered as bitmaps by the native map SDK. Complex layouts may appear slightly different than expected. Keep the layout simple.
- On iOS, View-based markers render live React Native views. Performance is generally better than Android for View markers.

### Approach vs ATIS Color Distinction Warning

In light theme, Approach blue (`#2a6bc4`) and ATIS cyan (`#0284c7`) are relatively close. The letter distinction (both "A") means color is the ONLY differentiator between these two badges. Validate on-device that the two blues are distinguishable side-by-side on both iOS and Android. If they're too close on real screens, consider making ATIS slightly more saturated or shifting it further toward teal. The dark theme values (`#3b7dd8` vs `#0ea5e9`) have better separation.

### Zoom Transition Considerations

The transition from Image markers (regional) to View markers (local) happens at zoom level 7. This is a React **component swap** — `<AirportMarkerItem>` is destroyed and `<LocalAirportMarker>` is created. The native map SDK will briefly show neither marker during the swap. This is expected and acceptable — do NOT treat it as a bug or try to fix it with complex animation. To minimize the perceived transition:
- Keep the visual style consistent: same dot color, same ICAO text color, similar sizing
- The ICAO text in the View marker should be at approximately the same size as the regional Image marker ICAO text (15px from `AIRPORT_MARKER_FONT_REGIONAL`)
- Position the View marker's dot at the same coordinate as the Image marker's dot

### Existing Code Patterns to Follow

- **Component style:** `React.memo(function ComponentName({props}) {...})` — same pattern as `AirportMarkerItem`, `AirportMarkers`, `PilotMarkers`
- **Theme access:** `useTheme()` hook from `ThemeProvider` → `activeTheme.atc.*`
- **Redux selectors:** `useSelector(state => state.vatsimLiveData.clients.airportAtc)` — already used in `AirportMarkers`
- **Font family:** `tokens.fontFamily.mono` = `'JetBrainsMono_400Regular'`, `tokens.fontFamily.monoMedium` = `'JetBrainsMono_500Medium'`
- **StyleSheet.create():** All styles must use this — no inline styles, no color literals (ESLint enforced)
- **No TypeScript** — plain `.jsx` for components, `.js` for utilities

### Previous Story Intelligence (3.4)

From Story 3.4 implementation:
- `AirportMarkerItem` is already `React.memo`'d with a custom comparator checking `icao`, coordinates, and `markerImage.image.uri`
- `getStaffedMarkerImage()` and `getTrafficMarkerImage()` in `airportMarkerService.js` handle the Image marker bitmaps — these are NOT changed by this story
- `airportMarkerService.js` uses Skia SVG rendering with caching — this stays as-is for continental/regional zoom
- `trafficCounts` is already in Redux at `state.vatsimLiveData.clients.trafficCounts`
- The `renderedStaffedIcaos` set pattern in AirportMarkers correctly separates staffed from unstaffed airports
- 96 tests currently passing across all suites
- 5 pre-existing ESLint warnings in plugin files — do not treat as new errors
- `airportAtc[icao]` is an array of controller objects, each with: `callsign`, `facility` (number 0-6), `latitude`, `longitude`, `key`, `image`, `imageSize`, and other VATSIM fields

### Git Intelligence

Recent commits (Story 3.4):
- `6ae11ae` — Implement story 3-4: Zoom-aware airport markers with traffic counts
- `a1a18c0` — Create story 3-4: Zoom-aware airport markers with traffic-based unstaffed rendering

Files modified in Story 3.4: `MapComponent.jsx` (zoom state), `AirportMarkers.jsx` (zoom-aware rendering), `themeTokens.js` (airport dot tokens), `consts.js` (zoom band constants), `airportMarkerService.js` (new — Skia bitmap generator), `vatsimLiveDataActions.js` (trafficCounts), `vatsimLiveDataReducer.js` (trafficCounts state).

### Project Structure Notes

- **Modified:** `app/common/themeTokens.js` — add `atc.badge.*` color tokens
- **New:** `app/common/airportBadgeHelper.js` — badge mapping utility (separate from consts.js to avoid theme dependency in pure constants file)
- **New:** `app/components/vatsimMapView/LocalAirportMarker.jsx` — View-based marker component
- **Modified:** `app/components/vatsimMapView/AirportMarkers.jsx` — conditional rendering at local zoom
- **New:** `__tests__/LocalAirportMarker.test.js` — View marker tests
- **Modified:** `__tests__/AirportMarkers.test.js` — zoom band component swap tests

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.5]
- [Source: _bmad-output/planning-artifacts/architecture.md — Zoom-Aware Airport Markers section, lines 367-385]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Airport ATC Display Pattern, lines 720-749]
- [Source: _bmad-output/implementation-artifacts/3-4-zoom-aware-airport-markers-infrastructure-and-image-markers.md — previous story patterns, completion notes]
- [Source: _bmad-output/project-context.md — project rules, anti-patterns, ESLint rules]
- [Source: app/components/vatsimMapView/AirportMarkers.jsx — current implementation (post Story 3.4)]
- [Source: app/common/airportMarkerService.js — Skia bitmap pipeline (unchanged by this story)]
- [Source: app/common/themeTokens.js — current design token system]
- [Source: app/common/consts.js — facility types, zoom band constants]
- [Source: app/redux/actions/vatsimLiveDataActions.js — ATIS detection pattern, airportAtc structure]
- [Source: app/components/clientDetails/AirportAtcDetails.jsx — ATIS sorting, facility display]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

### Completion Notes List

- Task 1: Added `atc.badge` color tokens (clearance, ground, tower, approach, atis) and `atc.badgeBackground` to both light and dark themes in `themeTokens.js`
- Task 2: Created `airportBadgeHelper.js` with `getAtcBadges()` function — maps facility types to badge letters with deduplication, ATIS detection via callsign suffix, and facility hierarchy ordering (C→G→T→A-approach→A-atis). 15 unit tests covering all cases.
- Task 3: Created `LocalAirportMarker.jsx` — React.memo View-based marker with horizontal layout: dot → ICAO (JetBrains Mono) → badge row → traffic counts. Uses `tracksViewChanges` true→false flip on Android for initial bitmap capture. All styles via StyleSheet.create with theme tokens.
- Task 4: Integrated LocalAirportMarker into AirportMarkers — at `zoomBand === 'local'`, both staffed and unstaffed-with-traffic airports render View-based markers instead of Image markers. Continental/regional zoom unchanged.
- Task 5: 124 tests pass (28 new), 0 lint errors. Added LocalAirportMarker tests (10), badge helper tests (15), AirportMarkers zoom-band swap tests (4).

### Change Log

- 2026-03-16: Implemented Story 3.5 — ATC badge theme tokens, badge mapping utility, LocalAirportMarker View-based component, integration into AirportMarkers at Continental+ zoom
- 2026-03-16: Redesigned zoom bands from 3 bands to 5 bands (Global/Continental/Regional/Local/Airport). View-based markers with badges now appear at Continental (5+) instead of Local (7+). Badge styling changed to colored pill backgrounds with white text (VATSIM Radar style). Two-row layout: ICAO+traffic on row 1, badges on row 2. Traffic counts hidden at Global zoom.

### File List

**New files:**
- `app/common/airportBadgeHelper.js`
- `app/components/vatsimMapView/LocalAirportMarker.jsx`
- `__tests__/airportBadgeHelper.test.js`
- `__tests__/LocalAirportMarker.test.js`

**Modified files:**
- `app/common/themeTokens.js`
- `app/common/consts.js`
- `app/common/airportMarkerService.js`
- `app/components/vatsimMapView/AirportMarkers.jsx`
- `app/components/vatsimMapView/MapComponent.jsx`
- `__tests__/AirportMarkers.test.js`
