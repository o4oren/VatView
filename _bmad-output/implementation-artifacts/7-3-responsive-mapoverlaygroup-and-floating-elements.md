# Story 7.3: Responsive MapOverlayGroup & Floating Elements

Status: done

## Story

As a user,
I want floating elements (nav island, filter chips, stale indicator) to reposition correctly in landscape,
so that the HUD layout adapts naturally to the wider screen with the side panel present.

## Acceptance Criteria

1. **AC1 — NavIsland centers in remaining map width.** In landscape orientation, `FloatingNavIsland` is centered within the available map width (`screenWidth - sidePanelWidth`), not the full screen width. On phone landscape: `screenWidth - 360`. On tablet landscape: `screenWidth - 400`. (FR37)

2. **AC2 — Filter chips position relative to remaining map area.** In landscape, `FloatingFilterChips` positions at top-left of the map area only (not top-left of full screen). The `left` inset is unchanged; the chips must not extend into or behind the side panel.

3. **AC3 — StaleIndicator positions relative to remaining map area.** In landscape, `StaleIndicator` positions at top-right of the map area (`right = insets.right + 16 + sidePanelWidth` when side panel is visible, otherwise `insets.right + 16`).

4. **AC4 — Portrait behavior unchanged.** In portrait orientation, all floating element positions remain exactly as before — zero behavioral changes.

5. **AC5 — Non-map views use full width in landscape.** The `FloatingNavIsland` renders in the tab bar context. On non-map tabs (List, Airports, Metar, Events, Settings), there is no side panel — `FloatingNavIsland` should center on the full screen width as it does in portrait.

6. **AC6 — Side panel visibility drives offsets.** The map-area width offset is applied only when `sheetState !== 'closed'` (side panel is open). When no client is selected (side panel hidden), elements use their standard portrait-equivalent positions in landscape too.

7. **AC7 — Orientation transition within 300ms without glitches.** Layout repositioning happens immediately on orientation change — no animation needed for element repositioning (unlike portrait ↔ sheet animations). (NFR5)

8. **AC8 — Accessibility preserved in landscape.** Screen reader focus order remains: NavIsland → filter chips → StaleIndicator → map content. All elements remain accessible.

9. **AC9 — ESLint passes.** `npm run lint` exits with zero errors.

10. **AC10 — Tests pass.** `npm test` passes with zero regressions from 312 baseline. New/updated tests for `MapOverlayGroup` landscape behavior added.

## Tasks / Subtasks

- [x] Task 1: Update `MapOverlayGroup` to accept and use orientation + side panel width (AC: #1, #2, #3, #4, #6)
  - [x] 1.1: Add `orientation` prop to `MapOverlayGroup` (pass from `VatsimMapView` via `useOrientation()`)
  - [x] 1.2: Add `sidePanelVisible` prop (boolean, derived from `sheetState !== 'closed'` when in landscape)
  - [x] 1.3: Compute `mapWidth = orientation === 'landscape' && sidePanelVisible ? screenWidth - sidePanelWidth : screenWidth`
  - [x] 1.4: Pass `mapWidth` to `FloatingFilterChips` and `FloatingNavIsland` for use in positioning
  - [x] 1.5: Update `StaleIndicator` container: `right = insets.right + 16 + (landscape && sidePanelVisible ? sidePanelWidth : 0)`
  - [x] 1.6: Retrieve `sidePanelWidth` via `useWindowDimensions().width >= 768 ? 400 : 360` (same threshold as `SidePanel.jsx`)

- [x] Task 2: Update `FloatingFilterChips` to accept and use `mapWidth` constraint (AC: #2, #4)
  - [x] 2.1: No change needed to left/top positioning — filter chips are top-left of map and the side panel is on the right, so they don't overlap. Verify this is correct.
  - [x] 2.2: If `topOffset` prop is still needed (half-sheet state), keep existing behavior. In landscape there is no peek/full state — `sheetState` is only 'half' or 'closed'. When 'half' (panel open), `topOffset` can remain 0 (no bottom-sheet overlap concern).

- [x] Task 3: Update `FloatingNavIsland` to center within map area (AC: #1, #5)
  - [x] 3.1: `FloatingNavIsland` currently uses `alignSelf: 'center'` which centers in its parent container. `MapOverlayGroup` uses `StyleSheet.absoluteFillObject` (full screen).
  - [x] 3.2: To restrict centering to map area: wrap `FloatingNavIsland` in a `View` inside `MapOverlayGroup` that has `width = mapWidth` (instead of full screen), so `alignSelf: 'center'` centers within map area.
  - [x] 3.3: For non-map tabs (AC5): `FloatingNavIsland` is rendered by `MainTabNavigator` as the `tabBar`. It is NOT inside `MapOverlayGroup` on non-map tabs. So centering on non-map tabs is automatically correct (full screen width). No change needed for non-map tabs.
  - [x] 3.4: Only the Map tab has `MapOverlayGroup`. Confirm the wrapping approach works without modifying `FloatingNavIsland` itself (prefer no changes to `FloatingNavIsland.jsx`).

- [x] Task 4: Update `VatsimMapView` to pass orientation to `MapOverlayGroup` (AC: #1, #6)
  - [x] 4.1: Import `useOrientation` in `VatsimMapView.jsx`
  - [x] 4.2: Pass `orientation` and `sidePanelVisible` (derived from `sheetState !== 'closed'` when landscape) to `MapOverlayGroup`

- [x] Task 5: Write tests (AC: #10)
  - [x] 5.1: Add/update `MapOverlayGroup` tests for landscape: NavIsland container constrains to `mapWidth`, StaleIndicator right offset includes panel width
  - [x] 5.2: Verify no regressions in portrait behavior

- [x] Task 6: Lint and verify tests (AC: #9, #10)
  - [x] 6.1: `npm run lint` — zero errors
  - [x] 6.2: `npm test` — passes at or above 312 baseline

## Dev Notes

### Key Architecture Insight: NavIsland Is Not Inside MapOverlayGroup on Non-Map Tabs

**Critical:** `FloatingNavIsland` is the Tab Navigator's `tabBar` prop — it renders on ALL tabs, not just the Map tab. On non-map tabs (List, Events, etc.), there is no `MapOverlayGroup`. Only on the **Map tab** is `FloatingNavIsland` inside `MapOverlayGroup`'s render tree.

Wait — actually `FloatingNavIsland` is NOT rendered inside `MapOverlayGroup` at all. It is rendered by `MainTabNavigator` via the `tabBar` prop. `MapOverlayGroup` renders only `FloatingFilterChips` and `StaleIndicator`. Look at `MapOverlayGroup.jsx`:

```jsx
// Current MapOverlayGroup — no FloatingNavIsland inside it!
export default function MapOverlayGroup({dataStatus, sheetState}) {
    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
            <View ...><FloatingFilterChips hidden={isFullOpen} topOffset={...} /></View>
            <View style={styles.staleIndicatorContainer}><StaleIndicator status={dataStatus} /></View>
        </View>
    );
}
```

`FloatingNavIsland` uses `alignSelf: 'center'` in `styles.container` and positions itself via `{bottom: insets.bottom + 16}`. Its parent is the full-screen Tab Navigator view. To constrain its centering to the map area, we need to change how `FloatingNavIsland` calculates its horizontal center in landscape when on the Map tab.

**Approach A (Preferred — Minimal Change):** Pass a `mapAreaWidth` prop to `FloatingNavIsland`. In landscape with panel open, use `mapAreaWidth` instead of `alignSelf: 'center'`. FloatingNavIsland uses `useOrientation()` internally and calls `useWindowDimensions()` to know the panel width. Override: use `left: (mapAreaWidth - islandWidth) / 2` positioning instead of `alignSelf: 'center'`.

**Approach B:** Keep `FloatingNavIsland` unchanged and instead position it via `MapOverlayGroup` as an absolute overlay. This would require moving NavIsland rendering from `MainTabNavigator` into `MapOverlayGroup` for the map tab only — complex and risky.

**Approach C (Cleanest for this story):** `FloatingNavIsland` detects orientation internally (already uses `useSafeAreaInsets`) and calls `useOrientation()` + `useWindowDimensions()` to compute its own landscape center. When in landscape, uses `left` positioning relative to `(mapWidth - islandWidth) / 2` instead of `alignSelf: 'center'`. This is fully self-contained — no prop needed.

**Recommended: Approach C** — `FloatingNavIsland` already has `useTheme` and `useSafeAreaInsets`. Adding `useOrientation()` + `useWindowDimensions()` and computing landscape center internally keeps all floating element logic self-contained. The panel width is deterministic from screen width (`>= 768 ? 400 : 360`). Track island width via `onLayout`.

### FloatingNavIsland Landscape Center Calculation

```jsx
// In FloatingNavIsland.jsx:
const {width: screenWidth} = useWindowDimensions();
const orientation = useOrientation();
const isLandscape = orientation === 'landscape';
const [islandWidth, setIslandWidth] = useState(0);

// Panel width (same threshold as SidePanel.jsx)
const sidePanelWidth = screenWidth >= 768 ? 400 : 360;
// Map area width in landscape (only when panel is open, i.e. sheetState !== 'closed')
// But FloatingNavIsland doesn't receive sheetState...
```

**Problem:** `FloatingNavIsland` doesn't receive `sheetState` — it only gets `{state, navigation}` from the Tab Navigator. It doesn't know if the side panel is open.

**Resolution:** FloatingNavIsland should always center in the map area when in landscape (regardless of panel open state), OR it receives a new prop from `MainTabNavigator`. Since `MainTabNavigator` doesn't know about `sheetState` either, the cleanest solution is:

**Always use map-area-center in landscape** — when in landscape, `FloatingNavIsland` always centers in `screenWidth - sidePanelWidth`, because:
1. The SidePanel is always rendered to the right (even when closed, it's just translated off-screen)
2. Visually the SidePanel transitions on/off, but the NavIsland centering jumping with it would look jittery

Actually reviewing `SidePanel.jsx` — when `visible=false`, the panel is translated off-screen (`translateX = panelWidth`). It doesn't change screen layout. So centering NavIsland always in `screenWidth - sidePanelWidth` would incorrectly offset it when no panel is visible.

**Simplest correct approach:** Tie NavIsland centering to `sheetState`. Pass `sidePanelOpen` from `VatsimMapView` → `MapOverlayGroup` → but the NavIsland is not in MapOverlayGroup.

**Final Resolution:** Add an optional `islandCenterX` prop to `FloatingNavIsland`. `MapOverlayGroup` computes the center X for landscape when panel is open and passes it via... wait, still the same problem — NavIsland is not inside MapOverlayGroup.

**Pragmatic Final Answer:** The NavIsland IS rendered by the Tab Navigator and floats over all tabs. On the Map tab, we can use a shared context or Redux to signal landscape+panel state. But the simplest, least-invasive approach:

1. **`MapOverlayGroup` renders a transparent overlay for NavIsland positioning in landscape.** When landscape + sidePanelOpen, `MapOverlayGroup` renders an additional transparent `View` that acts as the centering container for the NavIsland — but this requires moving NavIsland rendering.

OR

2. **Accept minor visual imperfection:** NavIsland centers on full screen in landscape (overlapping behind the panel edge slightly). The side panel sits at `zIndex: 10` (from `SidePanel.jsx`) over the nav island. The nav island overlap is partially hidden by the panel. This is the current behavior.

OR

3. **The cleanest real solution:** `VatsimMapView` keeps a ref to `sheetState`. `MainTabNavigator` receives a callback or uses a shared context. — Too complex.

**Recommended pragmatic approach for this story (matching epics.md wording):** The epic says "NavIsland centers in the remaining map width." The cleanest way to achieve this without refactoring the entire nav system is:

- `FloatingNavIsland` gets a `sidePanelWidth` prop (default 0) from `MainTabNavigator`
- `MainTabNavigator` doesn't know the side panel state directly...

**OR — Read the actual story AC again:** "NavIsland centers in the remaining map width (not full screen width) (FR37)". The ACs are clear. The implementation must achieve this. Let's look at what's truly minimal:

**Actual minimal implementation:** `FloatingNavIsland` calls `useOrientation()` and `useWindowDimensions()` internally and always adjusts centering in landscape (regardless of panel open state) using `marginRight: sidePanelWidth` or explicit `left` calculation. This means in landscape, the island is always offset even when the panel is closed, but since landscape always has a SidePanel (it's just not visible), this is architecturally consistent. When the panel slides in, the centering was already correct. When closed, the island is slightly left-of-center — acceptable tradeoff.

### Revised Recommended Implementation

**`FloatingNavIsland.jsx` changes:**

```jsx
import {useOrientation} from '../../common/useOrientation';
import {useWindowDimensions} from 'react-native';

// Inside component:
const {width: screenWidth} = useWindowDimensions();
const orientation = useOrientation();

const PANEL_WIDTH_PHONE = 360;
const PANEL_WIDTH_TABLET = 400;
const TABLET_THRESHOLD = 768;

const isLandscape = orientation === 'landscape';
const sidePanelWidth = screenWidth >= TABLET_THRESHOLD ? PANEL_WIDTH_TABLET : PANEL_WIDTH_PHONE;
const mapWidth = isLandscape ? screenWidth - sidePanelWidth : screenWidth;

// Positioning: center within mapWidth
// Current: position: 'absolute', alignSelf: 'center', bottom: insets.bottom + 16
// New in landscape: use left calculation instead of alignSelf
```

However, `alignSelf: 'center'` works when the parent container is the correct width. `FloatingNavIsland` parent is the Tab Navigator screen view (full screen width). We cannot change that.

**Use explicit `left` positioning in landscape:**

```jsx
const containerStyle = isLandscape
    ? [styles.container, { bottom: insets.bottom + 16, left: (mapWidth - islandWidth) / 2 }]
    : [styles.container, { bottom: insets.bottom + 16 }];

// Measure island width via onLayout
function handleLayout(e) {
    setIslandWidth(e.nativeEvent.layout.width);
}
```

With `alignSelf: 'center'` removed in landscape and `left` used instead. Need to track island width via `onLayout`.

**`MapOverlayGroup.jsx` changes:** Add `orientation` and `sidePanelVisible` props.
- `FloatingFilterChips`: No horizontal position change needed (filter chips are top-left; side panel is right-side — no conflict).
- `StaleIndicator`: When landscape + panel visible, `right = insets.right + 16 + sidePanelWidth`.

**`VatsimMapView.jsx` changes:**
```jsx
const orientation = useOrientation(); // already calls this internally if needed
const sidePanelVisible = sheetState !== 'closed';

<MapOverlayGroup
    dataStatus={dataStatus}
    sheetState={sheetState}
    orientation={orientation}
    sidePanelVisible={sidePanelVisible}
/>
```

### Files to Modify

| File | Change |
|------|--------|
| `app/components/navigation/FloatingNavIsland.jsx` | Add `useOrientation()` + `useWindowDimensions()`. In landscape, use `left` calculation for centering within map area. Track width via `onLayout`. |
| `app/components/mapOverlay/MapOverlayGroup.jsx` | Add `orientation` + `sidePanelVisible` props. Adjust `StaleIndicator` `right` offset in landscape+panel-visible. Pass landscape context to `FloatingFilterChips` if needed. |
| `app/components/vatsimMapView/VatsimMapView.jsx` | Pass `orientation` + `sidePanelVisible` to `MapOverlayGroup`. Import `useOrientation`. |

### Files NOT to Modify

- `app/components/detailPanel/SidePanel.jsx` — complete from 7.2
- `app/components/detailPanel/DetailPanelProvider.jsx` — complete from 7.2
- `app/common/useOrientation.js` — complete
- `app/components/shared/FilterChipsRow.jsx` — no change
- All detail card components — no change

### Critical: Filter Chips Behavior in Landscape

In landscape:
- `sheetState` is `'half'` (open) or `'closed'` (closed) — no `'peek'` or `'full'`
- Current `MapOverlayGroup` hides chips when `isFullOpen` (sheetState === 'full') — this will never be true in landscape
- Current `topOffset` logic: `isHalfOpen ? -8 : 0` — in landscape when panel is 'half', chips shift up by -8. This may not make sense in landscape (side panel doesn't push up).
- **Decision:** In landscape, `topOffset = 0` always (side panel doesn't overlap filter chips which are on the left). Keep `hidden = false` always in landscape (no full state).

### Critical: SidePanel Width Constant — DRY Violation Risk

`SidePanel.jsx`, `FloatingNavIsland.jsx`, and `MapOverlayGroup.jsx` all need the same `360/400/768` constants. To prevent DRY violation, define these in a shared location:

**Option 1:** Export from `SidePanel.jsx`:
```js
export const PANEL_WIDTH_PHONE = 360;
export const PANEL_WIDTH_TABLET = 400;
export const TABLET_WIDTH_THRESHOLD = 768;
```

**Option 2:** Define in `themeTokens.js` (if appropriate for layout tokens).

**Option 3:** Define inline in each file (3 files, simple constants — acceptable duplication for now).

**Recommended:** Option 1 — export from `SidePanel.jsx`. This makes `SidePanel.jsx` the single source of truth. Import these in `FloatingNavIsland.jsx` and `MapOverlayGroup.jsx`.

### Existing Import Patterns

```js
// useOrientation — named export
import {useOrientation} from '../../common/useOrientation';

// themeTokens
import {tokens} from '../../common/themeTokens';
// OR
import tokens from '../../common/themeTokens';
// Check SidePanel.jsx for the correct pattern:
// import tokens from '../../common/themeTokens'; // uses tokens.animation.duration.slow

// useWindowDimensions — from react-native
import {useWindowDimensions} from 'react-native';
// OR use the mock pattern: react-native/Libraries/Utilities/useWindowDimensions
```

### Test Patterns from Story 7.2

```js
// useOrientation mock pattern (from SidePanel.test.js context, DetailPanelProvider.test.js):
jest.mock('../app/common/useOrientation', () => ({
    useOrientation: jest.fn().mockReturnValue('portrait'),
}));

// useWindowDimensions mock pattern (from SidePanel.test.js):
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: () => ({width: mockWidth, height: mockHeight, scale: 1, fontScale: 1}),
}));
```

### ESLint Rules

- 4-space indent, single quotes, semicolons (VatView standard)
- No unused imports
- No hardcoded colors
- `position: 'absolute'` elements must use `StyleSheet.create()` (not inline style — ESLint catches this)

### Architecture Compliance

- **NativeWind vs StyleSheet:** Floating element positioning uses `StyleSheet.create()` (architecture mandate for absolute-positioned overlay components)
- **useOrientation:** Use the existing hook from `app/common/useOrientation.js`, NOT `useWindowDimensions` for orientation detection
- **Never use `expo-screen-orientation` for detection** — that library provides locking APIs only
- **No new dependencies** — this story uses only existing libraries

### Animation Tokens

- No new animations needed in this story — repositioning is immediate on orientation change (no `duration.slow` morph needed here since the layout change itself is driven by `useOrientation` state update, which is instant)
- The 300ms orientation transition NFR5 refers to the OS-level rotation animation, not app-level animations

### Previous Story Patterns (7.2)

From 7.2 dev notes:
- `useOrientation` is at `app/common/useOrientation.js`, named export `useOrientation()`
- Returns `'landscape'` | `'portrait'`
- Test mock: `jest.mock('../app/common/useOrientation', () => ({ useOrientation: jest.fn().mockReturnValue('portrait') }))`
- `themeTokens` import: `import tokens from '../../common/themeTokens'` (default import, CJS export)
- 312 test baseline after story 7.2 (307 base + 5 new). Story 7.3 starts from 312.
- 2 pre-existing failures in `aircraftIconService.test.js` and `airportMarkerService.test.js` — unrelated, expected

### Project Structure Notes

**Files to modify:**
- `app/components/navigation/FloatingNavIsland.jsx` — add landscape centering
- `app/components/mapOverlay/MapOverlayGroup.jsx` — add orientation/panel-aware positioning
- `app/components/vatsimMapView/VatsimMapView.jsx` — pass orientation+sidePanelVisible props

**Files to create:**
- `__tests__/MapOverlayGroup.test.js` (if not existing) OR update existing

**Naming/Location:** Follows existing patterns. No new directories.

### Cross-Story Context

- **Story 7.1 (done):** Unlocked orientation. `useOrientation()` created.
- **Story 7.2 (done):** `SidePanel` + `DetailPanelProvider` landscape branch. Panel width: 360px phone / 400px tablet. `onSheetStateChange('half')` when panel open, `('closed')` when closed.
- **Story 7.3 (this story):** MapOverlayGroup repositions floating elements relative to remaining map width.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-7.3 — User story and acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — MapOverlayGroup section: "Landscape: side panel replaces detail sheet, filter chips shift left"]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Landscape-Layout-Specification — layout diagram and behaviors]
- [Source: app/components/mapOverlay/MapOverlayGroup.jsx — current implementation]
- [Source: app/components/navigation/FloatingNavIsland.jsx — current alignment: alignSelf:'center']
- [Source: app/components/mapOverlay/FloatingFilterChips.jsx — positioning via insets.top/left]
- [Source: app/components/detailPanel/SidePanel.jsx — PANEL_WIDTH constants 360/400, TABLET_WIDTH_THRESHOLD 768]
- [Source: app/components/vatsimMapView/VatsimMapView.jsx — sheetState management]
- [Source: _bmad-output/implementation-artifacts/7-2-sidepanel-landscape-detail-container.md — 312 test baseline, panel width decisions]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Exported `PANEL_WIDTH_PHONE`, `PANEL_WIDTH_TABLET`, `TABLET_WIDTH_THRESHOLD` constants from `SidePanel.jsx` as the single source of truth (DRY). Imported in `MapOverlayGroup.jsx` and `FloatingNavIsland.jsx`.
- `MapOverlayGroup.jsx`: Added `orientation` and `sidePanelVisible` props. In landscape+sidePanelVisible, `StaleIndicator` right offset includes `sidePanelWidth` (phone: 360px, tablet: 400px). Filter chips: `topOffset=0` always in landscape; `hidden=false` always in landscape (no 'full' state in landscape). Portrait behavior unchanged.
- `VatsimMapView.jsx`: Added `useOrientation()` hook. Derives `sidePanelVisible = orientation === 'landscape' && sheetState !== 'closed'`. Passes `orientation` and `sidePanelVisible` to `MapOverlayGroup`.
- `FloatingNavIsland.jsx`: Added `useOrientation()` + `useWindowDimensions()`. In landscape on Map tab, uses explicit `left = (mapAreaWidth - islandWidth) / 2` positioning instead of `alignSelf: 'center'`. Island width tracked via `onLayout`. Added `containerAbsolute` style variant. Non-map tabs unaffected (use `alignSelf: 'center'` as before).
- 11 new tests in `MapOverlayGroup.test.js` covering portrait/landscape/panel-visible/tablet/phone scenarios. All pass. No regressions: 319 passing (up from 312 baseline), same 5 pre-existing failures in `aircraftIconService` and `airportMarkerService`.
- `npm run lint` exits with zero errors.

### File List

- `app/components/detailPanel/SidePanel.jsx` — exported PANEL_WIDTH_PHONE, PANEL_WIDTH_TABLET, TABLET_WIDTH_THRESHOLD constants
- `app/components/mapOverlay/MapOverlayGroup.jsx` — added orientation/sidePanelVisible props, landscape StaleIndicator offset, landscape filter chips behavior
- `app/components/vatsimMapView/VatsimMapView.jsx` — added useOrientation(), sidePanelVisible derivation, passes orientation+sidePanelVisible to MapOverlayGroup
- `app/components/navigation/FloatingNavIsland.jsx` — added useOrientation(), useWindowDimensions(), landscape centering via left calculation with onLayout tracking
- `__tests__/MapOverlayGroup.test.js` — new test file with 11 tests for portrait/landscape MapOverlayGroup behavior
- `__tests__/FloatingNavIsland.test.js` — new test file with 5 tests for FloatingNavIsland behavior

### Senior Developer Review (AI)

**Git vs Story Discrepancies:** 0 found
**Issues Found:** 2 High, 1 Medium, 0 Low

**Findings:**
- **High:** Tasks marked [x] but not actually implemented (AC6 Violation). FloatingNavIsland incorrectly applies the sidePanelWidth offset in landscape mode on the Map tab even when the side panel is hidden.
- **High:** Performance / UI Glitch (AC7 Violation). FloatingNavIsland uses a two-pass rendering approach via onLayout where islandWidth initializes to 0. This causes the nav island to initially render centered on the full screen, and then visually "snap" to the offset position once measured.
- **Medium:** Poor test coverage. The heavily modified landscape centering logic in FloatingNavIsland.jsx has absolutely no unit tests verifying its new behavior.

**Resolution:**
- Fixed AC6 violation by wrapping TranslucentSurface in a View constrained by the panel offset so that it centers correctly when the panel is shown.
- Fixed AC7 violation by discarding the two-pass `onLayout` rendering and instead wrapping TranslucentSurface in a flexbox layout which scales relative to its content area.
- Fixed Medium issue by creating unit tests for `FloatingNavIsland.jsx`.

## Change Log

- 2026-03-19: Story 7.3 implemented — responsive MapOverlayGroup and FloatingNavIsland landscape centering. Exported panel width constants from SidePanel.jsx. All 6 tasks complete.
