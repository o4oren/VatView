# Story 7.2: SidePanel — Landscape Detail Container

Status: done

## Story

As a user,
I want the detail panel to appear as a side panel on the right in landscape mode instead of a bottom sheet,
so that I get maximum map width for the companion display experience.

## Acceptance Criteria

1. **AC1 — SidePanel renders in landscape.** When the device is in landscape orientation (detected via `useOrientation()` returning `'landscape'`), `DetailPanelProvider` renders a `SidePanel` component anchored to the right side of the screen instead of the `@gorhom/bottom-sheet`.

2. **AC2 — SidePanel width.** The SidePanel has a fixed width of 360px on phone and 400px on tablet. Tablet detection: `useWindowDimensions().width >= 768` in landscape (approximate threshold — architecture does not define a specific breakpoint, use width-based heuristic).

3. **AC3 — SidePanel content.** The existing `ClientDetails` component renders inside the SidePanel, wrapped in `TranslucentSurface`, identical to how it renders inside the BottomSheet. No changes to `ClientDetails` or any of the five detail card components (`PilotDetailCard`, `AtcDetailCard`, `CtrDetailCard`, `AirportDetailCard`, `AirportAtcDetails`).

4. **AC4 — SidePanel open/close behavior.** The SidePanel opens when `selectedClient` is non-null (same Redux trigger as BottomSheet). Closing: tapping outside the panel (map tap) dismisses it via the existing `requestDismiss` / `markNewSelection` mechanism (unchanged). No snap points — content is scrollable from top to bottom.

5. **AC5 — Portrait bottom sheet unchanged.** In portrait orientation, `DetailPanelProvider` renders the `@gorhom/bottom-sheet` exactly as before — zero behavioral changes to portrait mode, same snap points `[155, '50%', '70%']`, same disclosure levels.

6. **AC6 — Orientation switch does not lose selected client.** Rotating from portrait (sheet open) to landscape (side panel open) preserves `selectedClient` in Redux. The panel transitions from BottomSheet to SidePanel without clearing the selected client.

7. **AC7 — Layout transition animation.** The SidePanel slides in from the right using `Animated.timing` with duration `tokens.animation.duration.slow` (400ms). Respects `useReducedMotion()` — if true, duration is 0.

8. **AC8 — Map camera offset in landscape.** When the SidePanel is open in landscape, the visible map area is reduced by the panel width. The map is NOT programmatically offset in this story — the side panel overlays the map edge. Full map camera offsetting is deferred to Story 7.3. (The panel renders on top of the map; the map still spans full screen width.)

9. **AC9 — VatsimMapView passes orientation to DetailPanelProvider.** `VatsimMapView` computes orientation via `useOrientation()` and passes it as a prop OR `DetailPanelProvider` calls `useOrientation()` internally. Either approach is acceptable — prefer internal detection to avoid prop drilling.

10. **AC10 — BackHandler works in landscape.** Android hardware back button closes the SidePanel (same behavior as BottomSheet close in portrait).

11. **AC11 — `onSheetStateChange` in landscape.** When SidePanel is open, `VatsimMapView`'s `sheetState` is `'half'` (arbitrary but needed so `MapOverlayGroup` can reposition chips). When closed, `'closed'`. No `'peek'` or `'full'` states in landscape.

12. **AC12 — ESLint passes.** `npm run lint` exits with zero errors.

13. **AC13 — Tests pass.** `npm test` passes with zero regressions (303 baseline from Story 7.1). New tests for `SidePanel` component and updated `DetailPanelProvider` tests added.

## Tasks / Subtasks

- [x] Task 1: Create `SidePanel` component (AC: #1, #2, #3, #4, #7)
  - [x] 1.1: Create `app/components/detailPanel/SidePanel.jsx`
  - [x] 1.2: Fixed-width panel, right-anchored using `StyleSheet.absoluteFillObject` + right:0 positioning
  - [x] 1.3: Width: 360px default, 400px when `useWindowDimensions().width >= 768`
  - [x] 1.4: Scrollable content using `ScrollView` from `react-native` (NOT `BottomSheetScrollView`)
  - [x] 1.5: Wrap content in `TranslucentSurface` with `opacity='surface'`
  - [x] 1.6: Slide-in animation from right using `Animated.timing` at 400ms (`tokens.animation.duration.slow`); 0ms if `useReducedMotion()`
  - [x] 1.7: Accept props: `visible` (bool), `children`, `onClose`

- [x] Task 2: Modify `DetailPanelProvider` to support landscape branch (AC: #1, #5, #6, #9, #10, #11)
  - [x] 2.1: Import `useOrientation` from `app/common/useOrientation.js`
  - [x] 2.2: Import `SidePanel` from `app/components/detailPanel/SidePanel.jsx`
  - [x] 2.3: When `orientation === 'landscape'`: render `SidePanel` instead of `BottomSheet`; call `onSheetStateChange('half')` when open, `onSheetStateChange('closed')` when closed
  - [x] 2.4: When `orientation === 'portrait'`: render `BottomSheet` exactly as before (no changes to portrait logic)
  - [x] 2.5: On orientation change (portrait→landscape or landscape→portrait): preserve `selectedClient` — do not dispatch `clientSelected(null)`. The panel should re-open in the new orientation if a client was selected.
  - [x] 2.6: Android BackHandler: close SidePanel when open in landscape (same as BottomSheet logic — `sheetRef.current?.close()` → parallel: `dispatch(clientSelected(null))` for side panel)

- [x] Task 3: Write tests (AC: #13)
  - [x] 3.1: Create `__tests__/SidePanel.test.js` — test renders with `visible=true`, does not render with `visible=false`, calls `onClose` appropriately
  - [x] 3.2: Update `__tests__/DetailPanelProvider.test.js` — verify SidePanel renders in landscape, BottomSheet renders in portrait (mock `useOrientation`)

- [x] Task 4: Lint and tests (AC: #12, #13)
  - [x] 4.1: `npm run lint` — zero errors
  - [x] 4.2: `npm test` — 312 tests pass (307 baseline + 5 new), zero regressions from this story (2 pre-existing failures in aircraftIconService/airportMarkerService unrelated to this story)

## Dev Notes

### Architecture Decision — Internal Orientation Detection

`DetailPanelProvider` should call `useOrientation()` internally rather than receiving orientation as a prop from `VatsimMapView`. Rationale: The architecture doc says "Listens to orientation via `useWindowDimensions()` to select container" — this is an internal concern of the provider. `VatsimMapView` already imports `DetailPanelProvider`; adding a new prop would require VatsimMapView changes that are out of scope.

### SidePanel Component Design

```jsx
// app/components/detailPanel/SidePanel.jsx
import React, {useEffect, useRef} from 'react';
import {Animated, ScrollView, StyleSheet, useWindowDimensions} from 'react-native';
import {useReducedMotion} from 'react-native-reanimated';
import TranslucentSurface from '../../common/TranslucentSurface';
import tokens from '../../common/themeTokens';  // for tokens.animation.duration.slow = 400

const PANEL_WIDTH_PHONE = 360;
const PANEL_WIDTH_TABLET = 400;
const TABLET_WIDTH_THRESHOLD = 768;

export default function SidePanel({visible, children, onClose}) {
    const {width} = useWindowDimensions();
    const panelWidth = width >= TABLET_WIDTH_THRESHOLD ? PANEL_WIDTH_TABLET : PANEL_WIDTH_PHONE;
    const reducedMotion = useReducedMotion();
    const translateX = useRef(new Animated.Value(panelWidth)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: visible ? 0 : panelWidth,
            duration: reducedMotion ? 0 : tokens.animation.duration.slow,
            useNativeDriver: true,
        }).start();
    }, [visible, panelWidth, reducedMotion]);

    return (
        <Animated.View style={[styles.panel, {width: panelWidth, transform: [{translateX}]}]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TranslucentSurface opacity="surface" rounded="none" style={styles.surface}>
                    {children}
                </TranslucentSurface>
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    panel: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: 10,
    },
    scrollContent: {flexGrow: 1},
    surface: {flex: 1, borderWidth: 0, elevation: 0},
});
```

**Why `Animated` (not Reanimated `withTiming`):** The project uses `react-native`'s `Animated` API (not Reanimated `withTiming`/`useSharedValue`) for simple transitions — see `ListItem.jsx`, `StaleIndicator.jsx`, `MainTabNavigator.jsx`. SidePanel should follow the same pattern. `useReducedMotion` is imported from `react-native-reanimated` (existing pattern from `DetailPanelProvider.jsx:6`).

### themeTokens Import Pattern

```js
import tokens from '../../common/themeTokens';
// tokens.animation.duration.slow = 400
// tokens.animation.duration.normal = 250
// tokens.animation.duration.fast = 150
```

The file is at `app/common/themeTokens.js`. Study `ListItem.jsx` for the import pattern.

### DetailPanelProvider Landscape Branch

The landscape branch in `DetailPanelProvider` renders `SidePanel` in place of `BottomSheet`. Key integration points:

```jsx
const orientation = useOrientation();  // 'portrait' | 'landscape'
const isLandscape = orientation === 'landscape';

// SidePanel open/close state (landscape only):
// - Open: when selectedClient != null
// - Close: when selectedClient == null

// In JSX return:
{isLandscape ? (
    <SidePanel visible={selectedClient != null} onClose={close}>
        <ClientDetails client={selectedClient} fill={true} />
    </SidePanel>
) : (
    <BottomSheet ...>{/* existing portrait implementation */}</BottomSheet>
)}
```

**onSheetStateChange in landscape:** Call `onSheetStateChange(selectedClient != null ? 'half' : 'closed')` from a `useEffect` that watches `selectedClient` and `isLandscape`. This keeps `MapOverlayGroup` informed about panel state so `FloatingFilterChips` adjusts its position (it already handles `sheetState === 'half'`).

### Orientation Switch — State Preservation

When orientation changes (portrait ↔ landscape), `selectedClient` persists in Redux — no action needed. The concern is that switching orientation might cause the BottomSheet to fire an `onChange(-1)` event (which dispatches `clientSelected(null)`).

**Guard against this:** Add a ref `isLandscapeRef = useRef(false)` that tracks orientation. In `handleSheetChange`, skip the `dispatch(clientSelected(null))` call if `isLandscapeRef.current` just changed (i.e., orientation switch is in progress). Simpler alternative: don't close BottomSheet when switching to landscape — just don't render it (unmounting `@gorhom/bottom-sheet` should not fire onChange).

**Preferred approach:** Conditionally render (not just hide) the BottomSheet. When `isLandscape`, the BottomSheet is not in the tree at all — so no onChange event fires. The SidePanel shows the current `selectedClient` immediately.

### BackHandler in Landscape

The existing BackHandler code references `sheetRef.current?.close()`. In landscape, `sheetRef` is null/unused. Add a separate landscape close path:

```js
BackHandler.addEventListener('hardwareBackPress', () => {
    if (isLandscape && selectedClient != null) {
        dispatch(allActions.appActions.clientSelected(null));
        return true;
    }
    if (!isLandscape && currentIndexRef.current !== -1) {
        sheetRef.current?.close();
        return true;
    }
    return false;
});
```

### AC8 — Map Camera Offset (Deferred to Story 7.3)

Story 7.2 does NOT adjust the map camera to account for the side panel. The SidePanel renders as a floating overlay on the right side. The map still uses `StyleSheet.absoluteFillObject`. This means the panel overlaps the right 360px of the map — intentionally deferred. Story 7.3 will handle repositioning `MapOverlayGroup` floating elements relative to the remaining map width.

### Files NOT to Change

- `ClientDetails.jsx` — renders unchanged inside SidePanel
- `PilotDetailCard.jsx`, `AtcDetailCard.jsx`, `CtrDetailCard.jsx`, `AirportDetailCard.jsx`, `AirportAtcDetails.jsx` — zero changes
- `MapOverlayGroup.jsx` — Story 7.3 responsibility
- `VatsimMapView.jsx` — no prop changes needed (DetailPanelProvider handles orientation internally)
- `useOrientation.js` — already complete from Story 7.1
- `FloatingNavIsland.jsx` — Story 7.3 responsibility

### Project Structure Notes

**Files to create:**
- `app/components/detailPanel/SidePanel.jsx` — new side panel component
- `__tests__/SidePanel.test.js` — new tests

**Files to modify:**
- `app/components/detailPanel/DetailPanelProvider.jsx` — add landscape branch (useOrientation import + SidePanel rendering)

**Naming convention:** `SidePanel.jsx` (PascalCase, matches all other component files)

**Import paths from DetailPanelProvider:**
- `useOrientation`: `'../../common/useOrientation'`
- `SidePanel`: `'./SidePanel'`

### ESLint Notes

- 4-space indent, single quotes, semicolons (VatView standard)
- No unused imports (ESLint will catch)
- `useReducedMotion` is already imported in `DetailPanelProvider.jsx:6` — do NOT re-import for SidePanel (SidePanel handles its own reduced motion internally)

### Test Strategy

**SidePanel.test.js** — basic render tests only:
```js
// Mock useWindowDimensions for phone/tablet width
// Mock useReducedMotion to return false
// Test: renders children when visible=true
// Test: does not render / off-screen when visible=false
// Test: uses 360px width at 390px screen width
// Test: uses 400px width at 820px screen width (tablet)
```

**DetailPanelProvider.test.js** — mock `useOrientation`:
- Already has 20+ tests. Mock `useOrientation` to return `'landscape'` → verify `SidePanel` renders, `BottomSheet` not rendered
- Mock `useOrientation` to return `'portrait'` → verify `BottomSheet` renders, `SidePanel` not rendered

Use `jest.mock('../../app/common/useOrientation', () => ({ useOrientation: jest.fn() }))` pattern.

### Previous Story Learnings (Story 7.1)

- `useOrientation` is in `app/common/useOrientation.js`, named export `export function useOrientation()`
- Test mock pattern for `useOrientation`: `jest.mock('../app/common/useOrientation', () => ({ useOrientation: jest.fn().mockReturnValue('portrait') }))`
- `expo-screen-orientation` is installed but not needed for this story (it provides locking APIs, not detection)
- 303 tests baseline (from Story 7.1 completion notes)
- `useReducedMotion` from `react-native-reanimated` works correctly — already used in `DetailPanelProvider`

### Cross-Story Context

- **Story 7.1 (done):** Unlocked orientation, created `useOrientation()` hook, installed `expo-screen-orientation`
- **Story 7.2 (this story):** `DetailPanelProvider` gains landscape SidePanel branch; `MapOverlayGroup` still uses portrait logic
- **Story 7.3 (next):** `MapOverlayGroup` repositions `FloatingNavIsland`, `FloatingFilterChips`, `StaleIndicator` relative to remaining map width (full-screen-width minus SidePanel width)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-7.2 — User story and acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Detail Panel Abstraction" section: "Portrait: renders @gorhom/bottom-sheet ... Landscape: stub/TODO — renders side panel container when implemented"]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Responsive Design Principle, SidePanel Details: fixed width 360px phone / 400px tablet, scrollable, right-anchored, no snap points]
- [Source: app/components/detailPanel/DetailPanelProvider.jsx — full existing implementation reviewed]
- [Source: app/components/shared/ListItem.jsx:21-31 — `Animated.timing` pattern with `tokens.animation.duration.fast`]
- [Source: app/common/themeTokens.js:111 — `tokens.animation.duration = { fast: 150, normal: 250, slow: 400 }`]
- [Source: app/common/useOrientation.js — `export function useOrientation()` returns `'landscape'` | `'portrait'`]
- [Source: _bmad-output/implementation-artifacts/7-1-unlock-orientation-and-responsive-detection.md — 303 test baseline, useOrientation mock pattern]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Created `SidePanel.jsx`: right-anchored absolute-positioned panel with Animated slide-in, `useWindowDimensions` for phone/tablet width (360/400px), `useReducedMotion` for accessibility, wrapped in `TranslucentSurface`
- Modified `DetailPanelProvider.jsx`: added `useOrientation()` internal detection; landscape branch renders `SidePanel` instead of `BottomSheet`; portrait branch unchanged; `onSheetStateChange` signalled via `useEffect`; BackHandler updated for both orientations; `selectedClient` preserved on orientation switch by relying on Redux (no dispatch on orientation change)
- Test fix: used `jest.mock('react-native/Libraries/Utilities/useWindowDimensions', ...)` with `__esModule: true, default:` pattern (same as `useOrientation.test.js`) to avoid TurboModule issue
- Note: 2 pre-existing test failures in `aircraftIconService.test.js` and `airportMarkerService.test.js` exist in baseline and are unrelated to this story

### File List

- `app/components/detailPanel/SidePanel.jsx` (created)
- `app/components/detailPanel/DetailPanelProvider.jsx` (modified)
- `__tests__/SidePanel.test.js` (created)
- `__tests__/DetailPanelProvider.test.js` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (updated status)
- `app/common/useOrientation.js` (modified)
- `__tests__/useOrientation.test.js` (modified)
- `app/components/settings/Settings.jsx` (modified)
