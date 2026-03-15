# Story 2.4: MapOverlayGroup — Floating Element Orchestrator

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want all floating elements (nav island, filter chips, stale indicator) to be positioned correctly and not overlap each other,
So that the map HUD feels polished and intentional regardless of screen state.

## Acceptance Criteria

1. **Given** FloatingNavIsland, FloatingFilterChips, and StaleIndicator from previous stories exist, **When** `MapOverlayGroup.jsx` is created in `app/components/mapOverlay/`, **Then** it wraps all floating elements on the map view and manages their z-ordering and spatial relationships.
2. **Given** MapOverlayGroup is rendered, **When** StaleIndicator is positioned, **Then** it appears at top-right with `space-4` (16px) margin from screen edges, offset by safe area insets.
3. **Given** MapOverlayGroup is rendered, **When** FloatingFilterChips is positioned, **Then** chips appear at top-left (existing behavior, now managed by MapOverlayGroup).
4. **Given** MapOverlayGroup is rendered, **When** FloatingNavIsland is rendered via the `tabBar` prop, **Then** it remains at bottom-center (managed by MainTabNavigator, not repositioned by MapOverlayGroup — MapOverlayGroup is aware of its position for spacing coordination).
5. **Given** all floating elements are rendered, **When** their positions are calculated, **Then** all maintain `space-4` (16px) minimum margin from screen edges and from each other.
6. **Given** MapOverlayGroup is rendered in `VatsimMapView.jsx`, **When** the map view mounts, **Then** `VatsimMapView.jsx` uses `MapOverlayGroup` to render FloatingFilterChips and StaleIndicator (no independent positioning of these elements outside MapOverlayGroup).
7. **Given** MapOverlayGroup wraps floating elements, **When** a user interacts with the map, **Then** map gestures (pan, zoom, tap on markers) work correctly through/around the floating elements via `pointerEvents="box-none"`.
8. **Given** MapOverlayGroup is rendered with accessibility enabled, **When** a screen reader traverses the map, **Then** the focus order follows: NavIsland → filter chips → StaleIndicator → map content.
9. **Given** the VATSIM live data feed is active, **When** StaleIndicator is rendered in MapOverlayGroup, **Then** it derives its `status` prop from Redux state: 'live' when `general.update_timestamp` exists and is within 90 seconds of now, 'stale' when timestamp is older than 90 seconds, 'error' when `general` is empty/undefined.

## Tasks / Subtasks

- [x] Task 1: Create `MapOverlayGroup.jsx` in `app/components/mapOverlay/` (AC: #1, #5, #7)
  - [x] 1.1: Create file with imports: `React` from 'react'; `View, StyleSheet` from 'react-native'; `useSafeAreaInsets` from 'react-native-safe-area-context'; `FloatingFilterChips` from '../filterBar/FloatingFilterChips'; `StaleIndicator` from '../shared/StaleIndicator'
  - [x] 1.2: Implement `MapOverlayGroup` as a `View` with `StyleSheet.absoluteFillObject` and `pointerEvents="box-none"` so map gestures pass through non-interactive areas
  - [x] 1.3: Render `FloatingFilterChips` — it already positions itself at top-left via its own StyleSheet; MapOverlayGroup is the single render point
  - [x] 1.4: Render `StaleIndicator` wrapped in a positioning `View` at top-right: `position: 'absolute'`, `top: insets.top + 16`, `right: insets.right + 16`; the wrapper uses `pointerEvents="box-none"`
  - [x] 1.5: Accept a `dataStatus` prop (string: 'live' | 'stale' | 'error') and pass it to `StaleIndicator` as `status`
  - [x] 1.6: Define z-index ordering via `zIndex` in StyleSheet: FloatingFilterChips container at 10, StaleIndicator container at 10 (same layer — no overlap since top-left vs top-right)

- [x] Task 2: Derive data freshness status for StaleIndicator (AC: #9)
  - [x] 2.1: In `VatsimMapView.jsx`, add `useSelector` to read `state.vatsimLiveData.general` from Redux
  - [x] 2.2: Create a `useDataStatus` helper function (inline in VatsimMapView or in MapOverlayGroup) that computes status: parse `general.update_timestamp` (ISO 8601 string from VATSIM API), compare to `Date.now()` — if within 90s → 'live', if older → 'stale', if `general` is empty/undefined → 'error'
  - [x] 2.3: Pass computed `dataStatus` to `<MapOverlayGroup dataStatus={dataStatus} />`

- [x] Task 3: Refactor `VatsimMapView.jsx` to use `MapOverlayGroup` (AC: #6)
  - [x] 3.1: Import `MapOverlayGroup` from `'../mapOverlay/MapOverlayGroup'`
  - [x] 3.2: Remove direct `<FloatingFilterChips />` rendering — it is now rendered inside MapOverlayGroup
  - [x] 3.3: Remove `FloatingFilterChips` import from VatsimMapView
  - [x] 3.4: Render `<MapOverlayGroup dataStatus={dataStatus} />` between `<MapComponent />` and `<BottomSheet>` (same position where FloatingFilterChips was)
  - [x] 3.5: Ensure BottomSheet still renders after MapOverlayGroup so it layers above floating elements

- [x] Task 4: Configure accessibility focus order (AC: #8)
  - [x] 4.1: In MapOverlayGroup, set `accessibilityViewIsModal={false}` on the container so screen readers can traverse all children
  - [x] 4.2: Add `importantForAccessibility="yes"` on FloatingFilterChips and StaleIndicator containers
  - [x] 4.3: Verify render order matches desired focus order: FloatingFilterChips first (maps to "filter chips"), then StaleIndicator (maps to "StaleIndicator → map content"). NavIsland focus order is controlled by MainTabNavigator's tabBar rendering and naturally comes first in the accessibility tree since it's in the parent navigator
  - [x] 4.4: StaleIndicator already has `accessibilityLabel={`Data status: ${status}`}` and `accessible={true}` — no changes needed to the component itself

- [x] Task 5: Lint and verification (AC: all)
  - [x] 5.1: Run `npm run lint` — 0 new errors beyond the 5 pre-existing warnings
  - [ ] 5.2: Verify MapOverlayGroup renders on map view with FloatingFilterChips at top-left and StaleIndicator at top-right
  - [ ] 5.3: Verify filter chips still toggle pilot/ATC markers correctly (no regression from refactor)
  - [ ] 5.4: Verify StaleIndicator shows green dot when live data is flowing
  - [ ] 5.5: Verify map gestures (pan, zoom, marker tap) work through MapOverlayGroup
  - [ ] 5.6: Verify BottomSheet still opens/closes correctly on marker tap
  - [ ] 5.7: Verify floating elements don't overlap each other (top-left chips vs top-right indicator)
  - [ ] 5.8: Verify safe area positioning on notched devices (elements below status bar, away from notch)

## Dev Notes

### Architectural Context

MapOverlayGroup is a centralized layout orchestrator for all floating elements on the map view. Per the architecture decision document, it:
- Wraps all floating elements and manages z-ordering and spatial relationships
- Is located at `app/components/mapOverlay/MapOverlayGroup.jsx`
- Will eventually receive props like `sheetState`, `orientation`, `navIslandVisible`, `zoomLevel` for coordinated repositioning (Stories 4.1 and 7.3)
- For THIS story (2.4), the scope is: static positioning of FloatingFilterChips + StaleIndicator, with pointerEvents passthrough

### Critical Constraint: FloatingNavIsland Lives in MainTabNavigator

FloatingNavIsland is rendered via the `tabBar` prop in `MainTabNavigator.jsx` — it is NOT a child of VatsimMapView and CANNOT be moved into MapOverlayGroup. This is by design (Story 2.2): React Navigation manages the tab bar lifecycle, caching, and screen state through the tabBar prop.

**Implication:** MapOverlayGroup manages FloatingFilterChips and StaleIndicator. NavIsland's position (bottom-center, `bottom: insets.bottom + 16`) is a known constant for spacing calculations but is not controlled by MapOverlayGroup.

**Accessibility:** NavIsland is rendered by the tab navigator parent, so it naturally comes first in the accessibility tree. MapOverlayGroup's children (filter chips, then StaleIndicator) come after, matching the desired focus order: NavIsland → filter chips → StaleIndicator → map content.

### FloatingFilterChips — No Internal Changes

FloatingFilterChips already positions itself at top-left via its own `StyleSheet.create()` with `position: 'absolute'`, `top: insets.top + 16`, `left: insets.left + 16`, `zIndex: 10`. MapOverlayGroup simply becomes its render parent — no changes to FloatingFilterChips.jsx are needed.

### StaleIndicator — Positioning Wrapper Needed

StaleIndicator (`app/components/shared/StaleIndicator.jsx`) is a 10px dot that accepts a `style` prop for positioning and a `status` prop ('live' | 'stale' | 'error'). It is currently NOT rendered anywhere in the app. MapOverlayGroup will:
1. Render it at top-right via a positioning wrapper View
2. Pass it a `status` derived from VATSIM data freshness

### Data Freshness Logic

The VATSIM API response (polled every 20s) includes `general.update_timestamp` (ISO 8601 string). This is stored in `state.vatsimLiveData.general`. The freshness check:
- Parse `general.update_timestamp` to epoch ms
- Compare to `Date.now()`
- If delta < 90s → 'live' (allows for ~4 missed polls before flagging stale)
- If delta >= 90s → 'stale'
- If `general` is empty/undefined → 'error'

Note: Story 2.4 now derives the `error` state from missing/invalid `general.update_timestamp`. A future story can add a dedicated Redux fetch-error signal if more nuanced loading vs. error behavior is needed.

### pointerEvents Strategy

MapOverlayGroup uses `pointerEvents="box-none"` on its container View. This means:
- The container itself does not capture touches (map gestures pass through)
- Child views (FloatingFilterChips, StaleIndicator wrapper) capture touches on their own interactive surfaces
- This is the same pattern used throughout React Native for overlay containers

### z-Index Ordering

| Element | z-Index | Position |
|---|---|---|
| MapComponent | 0 (base) | Full screen |
| MapOverlayGroup container | (inherits from render order) | absoluteFillObject |
| FloatingFilterChips | 10 (existing) | Top-left |
| StaleIndicator wrapper | 10 | Top-right |
| BottomSheet | native elevation | Bottom (rendered after MapOverlayGroup) |
| FloatingNavIsland | (implicit, via tabBar) | Bottom-center |

### Future Extensibility (Not In Scope)

Per the architecture doc, MapOverlayGroup will eventually:
- Respond to `sheetState` changes (Story 4.1: DetailPanelProvider passes sheet state up)
- Respond to `orientation` changes (Story 7.3: landscape repositioning)
- Handle NavIsland auto-hide coordination
- Animate floating element repositioning with `duration.normal` (250ms)

This story sets up the structural foundation. Future stories add the coordination logic.

### New Files

| File | Action |
|---|---|
| `app/components/mapOverlay/MapOverlayGroup.jsx` | NEW — floating element orchestrator |

### Modified Files

| File | Change |
|---|---|
| `app/components/vatsimMapView/VatsimMapView.jsx` | Replace direct FloatingFilterChips with MapOverlayGroup, add data freshness selector |

### Existing Files NOT Modified

| File | Reason |
|---|---|
| `app/components/filterBar/FloatingFilterChips.jsx` | Self-positioning — no changes needed |
| `app/components/shared/StaleIndicator.jsx` | Already accepts `status` and `style` props — no changes needed |
| `app/components/navigation/FloatingNavIsland.jsx` | Rendered via tabBar prop in MainTabNavigator — not managed by MapOverlayGroup |
| `app/components/mainApp/MainTabNavigator.jsx` | No changes — NavIsland stays as tabBar |

### MapOverlayGroup.jsx — Target Implementation

```javascript
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FloatingFilterChips from '../filterBar/FloatingFilterChips';
import StaleIndicator from '../shared/StaleIndicator';

export default function MapOverlayGroup({dataStatus = 'live'}) {
    const insets = useSafeAreaInsets();

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
            <FloatingFilterChips />
            <View
                style={[
                    styles.staleIndicatorContainer,
                    {top: insets.top + 16, right: insets.right + 16},
                ]}
                pointerEvents="box-none"
            >
                <StaleIndicator status={dataStatus} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    staleIndicatorContainer: {
        position: 'absolute',
        zIndex: 10,
    },
});
```

### VatsimMapView.jsx — Integration Changes

```javascript
// ADD import:
import MapOverlayGroup from '../mapOverlay/MapOverlayGroup';

// REMOVE import:
// import FloatingFilterChips from '../filterBar/FloatingFilterChips';

// ADD selector in component body:
const general = useSelector(state => state.vatsimLiveData.general);

// ADD data status computation:
function getDataStatus(general) {
    if (!general || !general.update_timestamp) {
        return 'error';
    }
    const updateTime = new Date(general.update_timestamp).getTime();
    if (Number.isNaN(updateTime)) {
        return 'error';
    }
    const delta = Date.now() - updateTime;
    return delta < 90000 ? 'live' : 'stale';
}
const dataStatus = getDataStatus(general);

// REPLACE in JSX:
// <FloatingFilterChips />
// WITH:
// <MapOverlayGroup dataStatus={dataStatus} />
```

### ESLint Constraints (from Story 2.1, 2.2, 2.3 learnings)

- **4-space indentation, single quotes, semicolons** — enforced
- **`no-inline-styles`**: All static styles in `StyleSheet.create()`. Dynamic `top: insets.top + 16` and `right: insets.right + 16` are acceptable inline overrides (data-driven, same pattern as FloatingFilterChips and FloatingNavIsland)
- **`no-color-literals`**: All colors from theme tokens — StaleIndicator handles its own colors internally
- **`no-unused-styles`**: Remove any StyleSheet entries not referenced in JSX
- **5 pre-existing ESLint warnings in plugin files** — do not treat as new errors

### Previous Story Intelligence (from Story 2.3)

**Patterns to follow:**
- `FloatingFilterChips.jsx` pattern: `StyleSheet.create()` for positioning, `useSafeAreaInsets()` for safe area, `position: 'absolute'` with inset-aware overrides
- `zIndex: 10` for floating elements above the map
- `pointerEvents="box-none"` for overlay containers that don't capture touches

**Learnings to apply:**
- Filter selector lives in `MapComponent.jsx`, not VatsimMapView — filter chips dispatch Redux actions, MapComponent reads filter state. No change needed for this story.
- The 150ms layer fade was deferred — transitions remain simple conditional renders. MapOverlayGroup does not add animation for this story.
- Always call marker generators unconditionally to preserve hook order — not relevant to MapOverlayGroup but important context for future sheet-state coordination.

**Review feedback from Story 2.3:**
- Accessibility labels must be specific and descriptive (e.g., "toggle button" format)
- Left safe area inset must be applied for landscape/notched devices
- Both `top` and `left`/`right` insets must be applied (not just `top`)

### Project Structure Notes

- `app/components/mapOverlay/` is a NEW directory created for this story
- `MapOverlayGroup.jsx` follows PascalCase `.jsx` convention for components
- Import paths use relative `../` navigation from `mapOverlay/` to `filterBar/` and `shared/`
- `useSafeAreaInsets` is an existing dependency (used by FloatingFilterChips, FloatingNavIsland)
- No new npm dependencies needed

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.4 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — MapOverlayGroup decision: centralized orchestrator, location, props, z-ordering strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md — "FloatingNavIsland is wired as Tab Navigator's custom tabBar" — cannot be moved into MapOverlayGroup]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 4.1 AC: "MapOverlayGroup is notified of sheet state changes" — future integration point]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 7.3: "Responsive MapOverlayGroup" — future landscape orientation story]
- [Source: _bmad-output/planning-artifacts/architecture.md — Screen reader order: "NavIsland → filter chips → StaleIndicator → map markers → DetailSheet"]
- [Source: _bmad-output/project-context.md — ESLint rules, Redux patterns, no-inline-styles, no-color-literals, StyleSheet.create() requirement]
- [Source: app/components/shared/StaleIndicator.jsx — accepts `status` ('live'|'stale'|'error') and `style` props, 10px dot with pulse animation]
- [Source: app/components/filterBar/FloatingFilterChips.jsx — self-positioning at top-left, zIndex: 10, pointerEvents on chipPressable only]
- [Source: app/components/vatsimMapView/VatsimMapView.jsx — current render order: MapComponent → FloatingFilterChips → BottomSheet]
- [Source: app/redux/reducers/vatsimLiveDataReducer.js — `general` field from VATSIM API stored in state, DATA_FETCH_ERROR dispatched but not tracked in reducer]
- [Source: _bmad-output/implementation-artifacts/2-3-floating-filter-chips.md — positioning patterns, ESLint constraints, review learnings]
- [Source: _bmad-output/implementation-artifacts/2-2-floating-navigation-island.md — tabBar prop pattern, safe area patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

None — clean implementation, no debugging required.

### Completion Notes List

- Created `MapOverlayGroup.jsx` as centralized floating element orchestrator with `absoluteFillObject` + `pointerEvents="box-none"` overlay pattern
- FloatingFilterChips rendered as child (self-positioning at top-left via own styles)
- StaleIndicator positioned at top-right via absolute wrapper with safe area insets
- Added `getDataStatus()` function in VatsimMapView to derive 'live'/'stale'/'error' from `general.update_timestamp` (90s threshold)
- Replaced direct FloatingFilterChips render in VatsimMapView with MapOverlayGroup
- Configured accessibility: `accessibilityViewIsModal={false}`, `importantForAccessibility="yes"` on child containers
- Render order preserved: MapComponent → MapOverlayGroup → BottomSheet (BottomSheet layers above)
- ESLint passes with 0 new errors (5 pre-existing plugin warnings only)
- Added map background deselection so tapping empty map space clears the selected aircraft and closes the detail sheet
- Added Android overlay persistence for polygon/circle/path cleanup so old ATC overlays and pilot paths are hidden instead of leaving ghost artifacts after unmount
- Tasks 5.2–5.8 are manual device verification tasks left unchecked for user testing

### Change Log

- 2026-03-15: Implemented Story 2.4 — MapOverlayGroup floating element orchestrator
- 2026-03-15: Senior review fixes applied — error-state stale indicator, Android overlay cleanup, and map background deselection

### File List

| File | Action |
|---|---|
| `app/components/mapOverlay/MapOverlayGroup.jsx` | NEW — floating element orchestrator component |
| `app/components/vatsimMapView/VatsimMapView.jsx` | MODIFIED — replaced FloatingFilterChips with MapOverlayGroup, added data freshness selector |

### Senior Developer Review (AI)

- Reviewer: Oren
- Date: 2026-03-15
- Outcome: Changes applied; follow-up documentation discrepancy intentionally left unresolved per user request
- High issue fixed: `MapOverlayGroup` now receives `'error'` status when `general.update_timestamp` is missing or invalid
- Medium issue fixed: map accessibility ordering is now explicitly nudged within `VatsimMapView` / `MapOverlayGroup` using `experimental_accessibilityOrder`
- Medium issue fixed: Android polygon/circle overlays now stay mounted and toggle transparent when inactive, preventing dormant ATC overlays after filter changes or controller churn
- Medium issue fixed: pilot route polylines now use the same mounted-and-hide pattern on Android, and tapping empty map space clears the selection and route
- Remaining issue intentionally not fixed: the story `File List` does not document the extra source files changed for the overlay cleanup work
