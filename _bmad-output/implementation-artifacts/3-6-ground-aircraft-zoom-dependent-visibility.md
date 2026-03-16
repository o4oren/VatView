# Story 3.6: Ground Aircraft Zoom-Dependent Visibility

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want ground aircraft to only appear when I'm zoomed in to airport level,
So that the map is not cluttered with parked aircraft and I can focus on en-route traffic.

## Acceptance Criteria

1. **AC1 — Ground aircraft hidden at non-airport zoom:** When a pilot's groundspeed is 5 knots or below AND the map zoom is at Local (≤10) or below, that pilot's marker is NOT rendered on the map. At Airport zoom (>10), ground aircraft markers appear normally.

2. **AC2 — Airborne aircraft unaffected:** Pilots with groundspeed above 5 knots render at ALL zoom levels, exactly as they do today. No change to their behavior.

3. **AC3 — Immediate appearance when moving:** A ground aircraft that begins moving (groundspeed exceeds 5 knots in the next data update) immediately appears at full opacity regardless of zoom level. No fade-in delay — the 20-second poll cycle is the natural transition.

4. **AC4 — Map view only:** This filtering applies ONLY to the map view (`PilotMarkers` component). The list view (`VatsimListView`) continues to show all pilots regardless of groundspeed or zoom level. No changes to list view code.

5. **AC5 — Constants for tuning:** The groundspeed threshold (5 knots) and the zoom breakpoint (Airport zoom, i.e., `ZOOM_LOCAL_MAX = 10`) are defined as named constants in `consts.js` for easy future tuning.

6. **AC6 — Pilot filter chip interaction:** The existing Pilots filter chip toggle continues to work — when pilots filter is off, ALL pilot markers are hidden (including ground aircraft at airport zoom). When pilots filter is on, ground aircraft visibility follows the zoom rules.

7. **AC7 — Selected client exception:** If a ground aircraft is the currently selected client (bottom sheet is open for it), it should remain visible regardless of zoom level so the user doesn't lose context.

## Tasks / Subtasks

- [x] Task 1: Add ground aircraft constants (AC: #5)
  - [x] 1.1: Add `GROUND_SPEED_THRESHOLD = 5` to `app/common/consts.js` (after zoom band constants)
  - [x] 1.2: Add a comment: `// Ground aircraft (≤ this speed in knots) hidden below Airport zoom`

- [x] Task 2: Add zoom-aware filtering to PilotMarkers (AC: #1, #2, #3, #4, #6, #7)
  - [x] 2.1: Accept `zoomLevel` prop in `PilotMarkers` — passed from `MapComponent.jsx` (same pattern as `AirportMarkers`)
  - [x] 2.2: Import `getZoomBand` and `GROUND_SPEED_THRESHOLD` from `consts.js`
  - [x] 2.3: Compute `zoomBand = getZoomBand(zoomLevel)` inside PilotMarkers render
  - [x] 2.4: In the `pilots.map()` loop, before rendering each pilot, check: if `pilot.groundspeed <= GROUND_SPEED_THRESHOLD && zoomBand !== 'airport'`, skip that pilot (do NOT render). Exception: if pilot is the selected client, always render.
  - [x] 2.5: Read `selectedClient` from Redux (already subscribed via `useSelector`) — compare `pilot.callsign === selectedClient?.callsign` for the exception
  - [x] 2.6: Use `.filter().map()` or conditional return inside `.map()` — prefer `.filter().map()` for clarity since the filter is simple

- [x] Task 3: Pass zoomLevel to PilotMarkers from MapComponent (AC: #1)
  - [x] 3.1: In `MapComponent.jsx`, change `<PilotMarkers />` to `<PilotMarkers zoomLevel={zoomLevel} />`
  - [x] 3.2: This is a one-line change — `zoomLevel` state already exists in MapComponent

- [x] Task 4: Update PilotMarkerItem memo comparator (AC: #1)
  - [x] 4.1: No change needed to `pilotMarkerItemPropsEqual` — the filtering happens in PilotMarkers (parent), not in PilotMarkerItem. PilotMarkerItem only renders if the parent decides to include it.

- [x] Task 5: Testing (AC: #1-#7)
  - [x] 5.1: Add unit tests for ground aircraft filtering in `__tests__/PilotMarkers.test.js`:
    - Pilot with groundspeed=0 at global zoom → NOT rendered
    - Pilot with groundspeed=5 at local zoom → NOT rendered
    - Pilot with groundspeed=5 at airport zoom → rendered
    - Pilot with groundspeed=6 at global zoom → rendered (above threshold)
    - Pilot with groundspeed=0 but is selectedClient → rendered regardless of zoom
  - [x] 5.2: Verify existing PilotMarkers tests still pass
  - [x] 5.3: Run ESLint — zero new warnings
  - [x] 5.4: Run full test suite (`npm test`) — zero regressions (1 pre-existing AirportMarkers test failure, not caused by this story)

- [ ] Task 6: Manual validation (AC: #1-#7)
  - [ ] 6.1: At global/continental zoom: parked aircraft (0 kts) are hidden
  - [ ] 6.2: At airport zoom (>10): parked aircraft appear
  - [ ] 6.3: En-route aircraft (cruising) visible at all zoom levels
  - [ ] 6.4: Taxi aircraft (1-5 kts) hidden at non-airport zoom, visible at airport zoom
  - [ ] 6.5: Toggle pilots filter chip: all pilot markers disappear/reappear
  - [ ] 6.6: Tap a ground aircraft at airport zoom, then zoom out — marker stays visible while selected
  - [ ] 6.7: List view still shows all pilots including ground aircraft

## Dev Notes

### Architecture Requirements

This is a **simple filtering story** — no new components, no new services, no new Redux state. The change is purely in the render logic of `PilotMarkers.jsx` and a one-line prop pass in `MapComponent.jsx`.

**Pattern:** Same zoom-aware rendering pattern used by `AirportMarkers` — `MapComponent` owns `zoomLevel` state and passes it down to child marker components that use `getZoomBand()` to determine visibility.

### Implementation Approach

The filtering is a **render-time decision** in `PilotMarkers`. The VATSIM live data continues to include all pilots in Redux state — no data-layer changes. This keeps the list view unaffected and avoids any data integrity issues.

**Key logic (pseudocode):**

```javascript
const zoomBand = getZoomBand(zoomLevel);
const isGroundAtNonAirportZoom = (pilot) =>
    pilot.groundspeed <= GROUND_SPEED_THRESHOLD && zoomBand !== 'airport';

// In render:
pilots
  .filter(pilot => !isGroundAtNonAirportZoom(pilot) || pilot.callsign === selectedClient?.callsign)
  .map(pilot => <PilotMarkerItem ... />)
```

### Existing Code to Modify

1. **`app/common/consts.js`** — Add `GROUND_SPEED_THRESHOLD` constant
2. **`app/components/vatsimMapView/PilotMarkers.jsx`** — Add zoom filtering logic, accept `zoomLevel` prop
3. **`app/components/vatsimMapView/MapComponent.jsx`** — Pass `zoomLevel` to `<PilotMarkers>`

### Critical: Do NOT Change

- **Redux state shape** — No new slices, no new fields. Filtering is render-only.
- **`vatsimLiveDataActions.js`** — Do NOT filter pilots during data processing. All pilots must remain in `state.vatsimLiveData.clients.pilots`.
- **`PilotMarkerItem`** — No changes needed to the individual marker component or its memo comparator.
- **List view** — `VatsimListView` must NOT be affected. It reads from the same Redux state and shows all pilots.
- **AirportMarkers** — No changes. Ground aircraft filtering is independent of airport marker rendering.

### VATSIM Data Notes

- `pilot.groundspeed` is a number in knots, available on every pilot object from the VATSIM API
- Parked aircraft typically have `groundspeed: 0`
- Taxi aircraft typically have `groundspeed: 1-30` (the 5kt threshold catches most truly parked/pushback aircraft)
- The threshold is intentionally low (5 kts) to avoid hiding aircraft that are taxiing actively — active taxi is interesting to see at airport zoom

### Previous Story Intelligence (3.5)

From Story 3.5:

- `PilotMarkers` currently does NOT receive `zoomLevel` — it renders all pilots unconditionally
- `MapComponent.jsx` already has `zoomLevel` state and passes it to `AirportMarkers` — same pattern reused here
- `selectedClient` is already subscribed in `PilotMarkers` via `useSelector` (line 52 of PilotMarkers.jsx)
- 124 tests pass across all suites — baseline for regression testing
- 5 pre-existing ESLint warnings in plugin files — do not treat as new errors

### Git Intelligence

Recent commits:

- `dd72741` — Story 3.5: ATC badges and traffic counts
- `6ae11ae` — Story 3.4: Zoom-aware airport markers
- `6437c9e` — Added FR44 to PRD (this story's requirement)

Files likely touched by this story are minimal: `consts.js` (add constant), `PilotMarkers.jsx` (add filter), `MapComponent.jsx` (pass prop).

### Existing Code Patterns to Follow

- **Component style:** `React.memo(function ComponentName({props}) {...})` — PilotMarkers already uses this pattern
- **Redux selectors:** `useSelector(state => state.app.selectedClient)` — already in PilotMarkers
- **Imports:** `import {getZoomBand, GROUND_SPEED_THRESHOLD} from '../../common/consts'`
- **No TypeScript** — plain `.jsx`
- **StyleSheet.create()** — not needed for this story (no new UI elements)
- **Semicolons required**, single quotes, 4-space indentation

### Project Structure Notes

- **Modified:** `app/common/consts.js` — add `GROUND_SPEED_THRESHOLD` constant
- **Modified:** `app/components/vatsimMapView/PilotMarkers.jsx` — add zoom-aware ground filtering
- **Modified:** `app/components/vatsimMapView/MapComponent.jsx` — pass `zoomLevel` prop to PilotMarkers
- **Modified:** `__tests__/PilotMarkers.test.js` — add ground filtering tests

No new files created. This is a minimal, focused change.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.6, lines 487-502]
- [Source: _bmad-output/planning-artifacts/prd.md — FR44, line 303]
- [Source: _bmad-output/project-context.md — project rules, consts.js conventions]
- [Source: app/components/vatsimMapView/PilotMarkers.jsx — current implementation, 83 lines]
- [Source: app/components/vatsimMapView/MapComponent.jsx — zoomLevel state, PilotMarkers usage]
- [Source: app/common/consts.js — zoom band constants and getZoomBand(), lines 68-83]
- [Source: _bmad-output/implementation-artifacts/3-5-airport-markers-local-zoom-atc-badges-and-traffic-counts.md — previous story patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

### Completion Notes List

- Task 1: Added `GROUND_SPEED_THRESHOLD = 5` constant to `consts.js` after zoom band constants
- Task 2: Added `.filter()` chain in `PilotMarkers` render — filters out pilots with `groundspeed <= 5` at non-airport zoom. Selected client exception preserves visibility. Uses `getZoomBand()` for zoom detection.
- Task 3: Passed `zoomLevel={zoomLevel}` prop from `MapComponent` to `<PilotMarkers>` — one-line change
- Task 4: No changes needed to `PilotMarkerItem` memo comparator — filtering happens in parent
- Task 5: 13 PilotMarkers tests pass (8 ground filtering tests + 5 existing/memo tests). Added 2 `MapComponent` integration tests covering `zoomLevel` prop wiring and pilots-filter gating. 0 new lint errors. 130/131 tests pass with the same pre-existing `AirportMarkers` failure unrelated to this story.
- Senior review fixes: Hardened `PilotMarkers` so pilots with missing or non-numeric `groundspeed` still render below airport zoom instead of being incorrectly hidden. Added integration coverage for `MapComponent` to prove `zoomLevel` is passed to `PilotMarkers` and that the pilots filter still suppresses all pilot markers when disabled.

### Change Log

- 2026-03-16: Implemented Story 3.6 — Ground aircraft zoom-dependent visibility. Added GROUND_SPEED_THRESHOLD constant, zoom-aware filtering in PilotMarkers, zoomLevel prop pass from MapComponent.
- 2026-03-16: Senior review fixes — preserved visibility for pilots with missing/non-numeric groundspeed, added `MapComponent` integration coverage for PilotMarkers prop wiring and pilots-filter gating, reconciled the story file list with git, and synced sprint tracking.

### File List

**Modified files:**

- `app/common/consts.js`
- `app/components/vatsimMapView/PilotMarkers.jsx`
- `app/components/vatsimMapView/MapComponent.jsx`
- `__tests__/PilotMarkers.test.js`
- `__tests__/MapComponent.test.js`
- `_bmad-output/implementation-artifacts/3-6-ground-aircraft-zoom-dependent-visibility.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Senior Developer Review (AI)

**Outcome:** Approved

- Fixed during review: `PilotMarkers.jsx` now treats missing or non-numeric `groundspeed` as an unknown state and preserves the previous visible-marker behavior below airport zoom.
- Fixed during review: `__tests__/MapComponent.test.js` now verifies that `zoomLevel` is passed to `PilotMarkers` and that turning the pilots filter off removes `PilotMarkers` from the map tree.
- Fixed during review: the story `File List` now matches the actual git changes, including the sprint tracking update.
- Verification after fixes: `npx jest --runInBand --runTestsByPath __tests__/PilotMarkers.test.js __tests__/MapComponent.test.js` passed (15/15), `npx eslint` on the updated files reported no new issues, and the full suite remains at 130/131 with the same pre-existing `AirportMarkers` failure.
