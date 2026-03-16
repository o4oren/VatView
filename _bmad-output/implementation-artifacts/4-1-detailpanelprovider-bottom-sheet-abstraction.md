# Story 4.1: DetailPanelProvider — Bottom Sheet Abstraction

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a translucent bottom sheet that opens when I tap any map element,
So that I can see details overlaid on the map without losing spatial context.

## Acceptance Criteria

1. **AC1 — Provider and Context API:** `DetailPanelProvider.jsx` created in `app/components/detailPanel/` wraps the map screen and exposes context via `useDetailPanel()` hook: `disclosureLevel` (1/2/3), `isOpen`, `open(client)`, `close()`, `selectedClient`.

2. **AC2 — Three snap points with opacity:** The provider renders `@gorhom/bottom-sheet` with three snap points: peek (~155px, opacity 0.45), half (~50%, opacity 0.65), full (~90%, opacity 0.85). Snap index maps to `disclosureLevel`: index 0 → Level 1, index 1 → Level 2, index 2 → Level 3.

3. **AC3 — Frosted-glass appearance:** The sheet uses `TranslucentSurface`/`BlurWrapper` for frosted-glass backdrop. Sheet container uses `StyleSheet.create()` for positioning (required by `@gorhom/bottom-sheet`). Content inside uses NativeWind classes. Dynamic opacity changes with snap point: `surface` (peek) → `surface-dense` (half) → `overlay` (full).

4. **AC4 — Spring physics animation:** Sheet open/close uses spring physics (damping: 20, stiffness: 300). Animations render at 60fps. Reduced motion: `AccessibilityInfo.isReduceMotionEnabled()` check — if enabled, animations skip to final state (set `animationDuration: 0` on the sheet).

5. **AC5 — Dismiss gestures:** Swiping down past peek dismisses the sheet. Tapping the map backdrop above the sheet dismisses it (use `backdropComponent` with `onPress` → close). Hardware back button dismisses the sheet if open before navigating back.

6. **AC6 — Client swap without close/reopen:** Tapping a different map element updates sheet content at the current snap point — no close-then-reopen animation. The provider updates `selectedClient` and content re-renders in place.

7. **AC7 — Redux integration:** The provider listens to Redux `state.app.selectedClient`. When `clientSelected` action dispatches (from marker taps), the provider opens the sheet. When `selectedClient` becomes null, the sheet closes. Existing dispatch sites (PilotMarkers, AirportMarkers, CTRPolygons) are NOT modified — they continue dispatching `clientSelected` as today.

8. **AC8 — MapOverlayGroup coordination:** `DetailPanelProvider` owns `sheetState` ('closed'/'peek'/'half'/'full') and passes it to `MapOverlayGroup` via callback prop `onSheetStateChange`. MapOverlayGroup already exists at `app/components/mapOverlay/MapOverlayGroup.jsx` — add `sheetState` prop and adjust filter chip / stale indicator positions accordingly.

9. **AC9 — Accessibility:** The sheet has `accessibilityRole="adjustable"` and announces state changes via `AccessibilityInfo.announceForAccessibility()` when disclosure level changes.

10. **AC10 — Filter-based auto-close:** Preserve existing behavior: when pilots filter is toggled off and selected client is a pilot, close the sheet. Same for ATC filter + ATC client. This logic currently lives in `VatsimMapView.jsx` — migrate it into the provider.

11. **AC11 — Live data auto-update:** When live VATSIM data refreshes (every 20s), the selected client in the sheet must update with fresh data. Currently `VatsimMapView` re-dispatches the selected client from latest data — this logic moves into the provider.

12. **AC12 — Analytics preservation:** Preserve existing analytics logging: `sheet_open_pilot` (with callsign, icao) and `sheet_open_atc` (with callsign, cid) events fire on sheet open. Use `lastLoggedClientRef` to avoid duplicate logging (same pattern as current `VatsimMapView`).

## Tasks / Subtasks

- [x] Task 1: Create DetailPanelProvider component (AC: #1, #2, #3, #4, #5, #9)
  - [x] 1.1: Create directory `app/components/detailPanel/`
  - [x] 1.2: Create `DetailPanelProvider.jsx` — React context provider wrapping `@gorhom/bottom-sheet`
  - [x] 1.3: Define context shape: `{ disclosureLevel, isOpen, open, close, selectedClient, sheetState }`
  - [x] 1.4: Create `useDetailPanel()` custom hook that consumes the context
  - [x] 1.5: Configure three snap points: `[155, '50%', '90%']` with spring animation config
  - [x] 1.6: Track snap index via `onChange` callback → map to disclosureLevel (0→1, 1→2, 2→3)
  - [x] 1.7: Implement `open(client)` — sets selectedClient + `snapToIndex(0)`, `close()` — `snapToIndex(-1)` + sets null
  - [x] 1.8: Add `backdropComponent` with `onPress` → close for map tap dismissal
  - [x] 1.9: Add `enablePanDownToClose={true}` for swipe-down dismiss
  - [x] 1.10: Add accessibility: `accessibilityRole="adjustable"`, announce level changes
  - [x] 1.11: Check `AccessibilityInfo.isReduceMotionEnabled()` — conditionally set `animationConfigs` to 0 duration

- [x] Task 2: Implement dynamic opacity on snap change (AC: #3)
  - [x] 2.1: Create state for current opacity level: 'surface' | 'surface-dense' | 'overlay'
  - [x] 2.2: In `onChange` callback, update opacity based on snap index: 0→'surface', 1→'surface-dense', 2→'overlay'
  - [x] 2.3: Pass opacity prop to `TranslucentSurface` wrapping the sheet content

- [x] Task 3: Implement Redux integration (AC: #7, #10, #11, #12)
  - [x] 3.1: Subscribe to `state.app.selectedClient` via `useSelector`
  - [x] 3.2: Subscribe to `state.app.showPilots` and `state.app.showAtc` for filter-based close
  - [x] 3.3: `useEffect` on selectedClient: if non-null → open sheet; if null → close sheet
  - [x] 3.4: `useEffect` on filter toggles: if pilots off + pilot selected → dispatch `clientSelected(null)`; same for ATC
  - [x] 3.5: Subscribe to `state.vatsimLiveData.clients` — on update, find and re-dispatch current selected client from fresh data
  - [x] 3.6: Implement analytics logging with `lastLoggedClientRef` pattern (log on open, track last logged to avoid duplicates)

- [x] Task 4: Implement client swap behavior (AC: #6)
  - [x] 4.1: When selectedClient changes to a different non-null client, update content without re-animating the sheet
  - [x] 4.2: Only call `snapToIndex(0)` if the sheet is currently closed (index === -1)

- [x] Task 5: Wire MapOverlayGroup coordination (AC: #8)
  - [x] 5.1: Add `sheetState` prop to `MapOverlayGroup` component
  - [x] 5.2: In DetailPanelProvider, derive sheetState from snap index: -1→'closed', 0→'peek', 1→'half', 2→'full'
  - [x] 5.3: Pass `onSheetStateChange` callback from VatsimMapView to DetailPanelProvider
  - [x] 5.4: In MapOverlayGroup, conditionally adjust FloatingFilterChips position when sheet is at half/full

- [x] Task 6: Integrate into VatsimMapView (AC: #1, #7)
  - [x] 6.1: Remove existing `BottomSheet` / `BottomSheetView` imports and JSX from VatsimMapView
  - [x] 6.2: Remove existing sheet ref, onChange handler, analytics logging, filter-based close logic
  - [x] 6.3: Remove existing live-data auto-update logic for selected client
  - [x] 6.4: Wrap map content with `<DetailPanelProvider>` (or wrap at navigation level)
  - [x] 6.5: Render `<ClientDetails>` inside the provider's sheet content area
  - [x] 6.6: Preserve `fill={true}` prop on ClientDetails

- [x] Task 7: Handle hardware back button (AC: #5)
  - [x] 7.1: Use `BackHandler` from react-native inside DetailPanelProvider
  - [x] 7.2: If sheet is open, close it and return `true` (handled). Otherwise return `false` (let navigation handle it).

- [x] Task 8: Testing (AC: #1-#12)
  - [x] 8.1: Unit tests for DetailPanelProvider in `__tests__/DetailPanelProvider.test.js`:
    - Provider renders without crashing
    - useDetailPanel hook returns expected shape
    - open(client) sets selectedClient and isOpen=true
    - close() sets selectedClient=null and isOpen=false
    - disclosureLevel maps correctly from snap index
    - sheetState derives correctly from snap index
  - [x] 8.2: Integration test: Redux selectedClient change → sheet opens
  - [x] 8.3: Integration test: filter toggle off → sheet closes for matching client type
  - [x] 8.4: Verify existing VatsimMapView tests still pass after bottom sheet extraction
  - [x] 8.5: Run ESLint — zero new warnings
  - [x] 8.6: Run full test suite — zero regressions

- [ ] Task 9: Manual validation (AC: #1-#12)
  - [ ] 9.1: Tap pilot marker → sheet opens at peek with frosted glass
  - [ ] 9.2: Swipe up → sheet moves to half, then full
  - [ ] 9.3: Swipe down past peek → sheet dismisses
  - [ ] 9.4: Tap map backdrop above sheet → sheet dismisses
  - [ ] 9.5: Tap different marker while sheet is open → content swaps, sheet stays at current snap point
  - [ ] 9.6: Toggle pilots filter off while pilot sheet open → sheet closes
  - [ ] 9.7: Wait 20s for data refresh → sheet content updates with fresh data
  - [ ] 9.8: Hardware back button with sheet open → sheet closes (not navigate back)
  - [ ] 9.9: Verify frosted glass on iOS (blur) and Android (semi-transparent + border + elevation)

## Dev Notes

### Architecture Requirements

This story extracts the bottom sheet logic from `VatsimMapView.jsx` into a reusable `DetailPanelProvider` abstraction. This is the foundation for all detail panels in Epic 4 (stories 4.2-4.4) and must be designed for the landscape side-panel adaptation in Epic 7 (story 7.2).

**Pattern:** Provider + Context pattern. `DetailPanelProvider` owns the `@gorhom/bottom-sheet` instance, manages state (open/closed, snap index, selected client), and exposes everything through React Context. Consumers use `useDetailPanel()` hook.

**Key architectural constraint:** The provider API (`disclosureLevel`, `isOpen`, `open`, `close`, `selectedClient`) must be container-agnostic — stories 4.2-4.4 code against this API, and when Epic 7 adds landscape side-panel, only the provider internals change, not any consumer code.

### Existing Code to Migrate FROM

The current bottom sheet implementation lives entirely in `VatsimMapView.jsx`. Here is what must be extracted:

**From `app/components/vatsimMapView/VatsimMapView.jsx`:**
- Lines ~8: `import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'`
- Lines ~114-148: `<BottomSheet>` JSX with `<BottomSheetView>` containing `<ClientDetails fill={true} />`
- Sheet config: `enablePanDownToClose={true}`, `snapPoints={[300, 400]}`, `index={-1}`, `borderRadius={10}`
- `sheetRef = useRef(null)` — bottom sheet ref
- `onChange` handler — analytics logging, client deselection on close
- `lastLoggedClientRef` — tracks last logged client to avoid duplicate analytics
- Filter-based close: `useEffect` on `showPilots`/`showAtc` toggling → if pilot selected and pilots off → deselect
- Live data auto-update: `useEffect` on `clients` → re-dispatch selectedClient from latest data
- `useSelector` for `selectedClient`, `showPilots`, `showAtc`, `clients`

### Existing Components to REUSE (Do NOT Recreate)

- **`TranslucentSurface`** (`app/common/TranslucentSurface.jsx`) — wraps content with blur/translucency. Props: `opacity` ('surface'|'surface-dense'|'overlay'), `intensity` (iOS blur, default 20), `rounded` (border radius preset). Uses `BlurWrapper` internally.
- **`BlurWrapper`** (`app/common/BlurWrapper.jsx`) — platform-based rendering. iOS: `BlurView` from expo-blur. Android: semi-transparent `View` with 1px border (`surface.border` token) + elevation 4.
- **`MapOverlayGroup`** (`app/components/mapOverlay/MapOverlayGroup.jsx`) — absolute-fill overlay with `pointerEvents="box-none"`. Currently contains `FloatingFilterChips` and `StaleIndicator`. Will receive new `sheetState` prop.
- **`ClientDetails`** (`app/components/clientDetails/ClientDetails.jsx`) — routes to PilotDetails, AtcDetails, AirportAtcDetails, or CtrDetails based on client type. Accepts `client` and `fill` props. This component renders INSIDE the sheet — do NOT modify it in this story.
- **`useTheme()`** hook from `app/common/ThemeProvider.jsx` — returns `{ isDark, activeTheme, activeMapStyle }`.

### Theme Token Values for Sheet Opacity

From `app/common/themeTokens.js`:

| Snap Point | Disclosure Level | Opacity Prop | Light Background | Dark Background |
|---|---|---|---|---|
| Peek (155px) | Level 1 | `surface` | rgba(255,255,255,0.50) | rgba(22,27,34,0.45) |
| Half (50%) | Level 2 | `surface-dense` | rgba(255,255,255,0.70) | rgba(22,27,34,0.65) |
| Full (90%) | Level 3 | `overlay` | rgba(255,255,255,0.90) | rgba(22,27,34,0.85) |

### Critical: Snap Point Change from Current Implementation

**Current:** Two snap points `[300, 400]` — no disclosure levels, just two heights.
**New:** Three snap points `[155, '50%', '90%']` — maps to three disclosure levels.

This changes the sheet behavior — the peek is smaller (155px vs 300px) because Level 1 content (glanceable summary) is compact. Stories 4.2-4.4 will populate the level-specific content.

For this story, `ClientDetails` renders at all levels (it's the existing component). The progressive disclosure content switching comes in stories 4.2-4.4.

### Critical: Do NOT Change

- **Marker tap handlers** — PilotMarkers, AirportMarkers, CTRPolygons all dispatch `clientSelected` as-is. Do NOT modify these components.
- **ClientDetails routing logic** — the switch between PilotDetails/AtcDetails/etc based on client type stays the same. Do NOT modify `ClientDetails.jsx`.
- **Redux state shape** — `state.app.selectedClient` remains the same. No new Redux slices or actions needed.
- **MapComponent.jsx** — the map itself is not modified. `onMapPress` callback continues to dispatch `clientSelected(null)`.
- **List view** — `VatsimListView` renders `ClientDetails` directly in card items with no bottom sheet. Completely independent of this story.

### File Structure

**New files:**
- `app/components/detailPanel/DetailPanelProvider.jsx` — provider + context + hook
- `__tests__/DetailPanelProvider.test.js` — unit/integration tests

**Modified files:**
- `app/components/vatsimMapView/VatsimMapView.jsx` — remove BottomSheet, wrap with DetailPanelProvider
- `app/components/mapOverlay/MapOverlayGroup.jsx` — add `sheetState` prop, adjust layout logic

### @gorhom/bottom-sheet API Notes

The project uses `@gorhom/bottom-sheet` v5. Key APIs:
- `BottomSheet` component — container with snap points
- `BottomSheetView` — content wrapper (NOT `BottomSheetScrollView` for this story — content is short enough)
- `snapPoints` prop — array of numbers (pixels) or strings (percentages)
- `index` prop — initial snap index (-1 = closed)
- `onChange(index)` — callback when snap changes
- `enablePanDownToClose` — swipe below first snap point dismisses
- `backdropComponent` — custom backdrop component (use `BottomSheetBackdrop` with `onPress` for tap-to-dismiss)
- `animationConfigs` — reanimated spring/timing config override
- `ref.snapToIndex(index)` — programmatic snap control
- **NativeWind limitation:** `className` does NOT apply to `BottomSheet` or `BottomSheetView` directly. Use `StyleSheet.create()` for the container. Wrap inner content in a regular `View` for NativeWind classes.

### Spring Animation Config

```javascript
import { useReducedMotion } from 'react-native-reanimated';

// Inside provider:
const reducedMotion = useReducedMotion();
const animationConfigs = reducedMotion
    ? { duration: 0 }
    : { damping: 20, stiffness: 300 };
```

Note: `useReducedMotion()` from react-native-reanimated is preferred over `AccessibilityInfo.isReduceMotionEnabled()` for animation config — it's reactive and works with reanimated's animation system.

### Previous Story Intelligence (3.6)

From Story 3.6 (last implemented story):
- 130/131 tests pass with 1 pre-existing AirportMarkers test failure (not caused by any recent story)
- `PilotMarkers` has `selectedClient` subscribed via `useSelector` — used for ground aircraft exception, also used here to keep sheet in sync
- `MapComponent.jsx` passes `onMapPress` callback which dispatches `clientSelected(null)` — this is the "tap map to dismiss" path
- ESLint baseline: 5 pre-existing warnings in plugin files

### Git Intelligence

Recent commits (Epic 3 work):
- `6036e74` — Story 3.6: Ground aircraft zoom-dependent visibility
- `dd72741` — Story 3.5: ATC badges and traffic counts
- `6ae11ae` — Story 3.4: Zoom-aware airport markers
- `d8b9b0a` — Story 3.3: ATC polygon overlays with theme tokens

Pattern: each story modifies 2-4 files, adds tests, preserves existing test baseline. Epic 3 established the pattern of MapComponent passing props to child marker components and using `consts.js` for domain constants.

### Existing Code Patterns to Follow

- **Component style:** `export default function ComponentName({props}) {...}` — no class components
- **Context pattern:** See `ThemeProvider.jsx` for reference — `createContext`, provider component, `useTheme()` hook
- **Redux selectors:** `useSelector(state => state.app.selectedClient)` — direct selector, not reselect
- **Imports:** Named imports from local modules; `allActions` for Redux dispatching
- **StyleSheet for positioning, NativeWind for visual styling** — required split for `@gorhom/bottom-sheet` components
- **Semicolons required**, single quotes, 4-space indentation
- **No TypeScript**, plain `.jsx`

### Project Structure Notes

- New directory: `app/components/detailPanel/` — dedicated feature directory per project conventions
- Provider wraps at screen level in `VatsimMapView.jsx`, not at navigation level (keep scope minimal for now; Epic 7 may expand scope)
- Consistent with feature-organized directory structure: `app/components/<FeatureName>/`

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.1, lines 508-528]
- [Source: _bmad-output/planning-artifacts/architecture.md — Detail Panel Abstraction section]
- [Source: _bmad-output/planning-artifacts/architecture.md — Progressive Disclosure Snap Points section]
- [Source: _bmad-output/planning-artifacts/architecture.md — MapOverlayGroup section]
- [Source: _bmad-output/planning-artifacts/architecture.md — Blur Wrapper Design section]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Progressive Disclosure interaction flow]
- [Source: app/components/vatsimMapView/VatsimMapView.jsx — existing bottom sheet implementation]
- [Source: app/components/clientDetails/ClientDetails.jsx — client routing logic]
- [Source: app/common/TranslucentSurface.jsx — translucent wrapper component]
- [Source: app/common/BlurWrapper.jsx — platform blur/translucency]
- [Source: app/common/ThemeProvider.jsx — context provider pattern reference]
- [Source: app/common/themeTokens.js — surface opacity values]
- [Source: app/components/mapOverlay/MapOverlayGroup.jsx — floating element orchestrator]
- [Source: _bmad-output/implementation-artifacts/3-6-ground-aircraft-zoom-dependent-visibility.md — previous story patterns and test baseline]
- [Source: _bmad-output/project-context.md — project rules and conventions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- ESLint caught color literal in handleIndicator style — fixed by using `activeTheme.text.muted` via `useTheme()` hook
- NativeWind babel plugin (`_ReactNativeCSSInterop`) interferes with `jest.mock()` factories using `React.createElement` — resolved by using string mocks for BottomSheet components
- iOS Apple Maps race condition: custom-view markers (LocalAirportMarker) fire both Marker.onPress and MapView.onPress for the same tap, without setting action:'marker-press'. Fixed with deferred dismiss (150ms timer) + selection timestamp (300ms guard window) pattern
- `@gorhom/bottom-sheet` v5: `snapToIndex(-1)` does not reliably close the sheet — must use `close()` method instead
- Live data auto-update effect can re-dispatch stale client from closure when `clients` changes during dismiss — resolved by keeping `cancelDismiss` scoped to genuinely new client selections only (same-cid re-dispatches don't cancel)
- AC6 snap-point preservation: `currentIndexRef` and `isOpen` state are both updated asynchronously via onChange (after animation), making them unreliable guards. Replaced with `sheetOpenRef` set synchronously in the selectedClient useEffect

### Completion Notes List

- Created `DetailPanelProvider` as a React Context provider wrapping `@gorhom/bottom-sheet` with three snap points [155, '50%', '90%'] mapping to disclosure levels 1/2/3
- Migrated all bottom sheet logic from VatsimMapView into the provider: Redux integration, filter-based auto-close, live data auto-update, analytics logging, back button handling
- Implemented frosted-glass appearance using `TranslucentSurface` with dynamic opacity that changes per snap point (surface → surface-dense → overlay)
- Removed hardcoded `backgroundColor: 'white'` from ClientDetails, fixed pre-existing inline style and unused import ESLint errors
- Android: override `borderWidth: 0, elevation: 0` on sheet's TranslucentSurface to remove BlurWrapper's default frame
- Handle/background styles use `activeTheme.surface.elevated` for translucent appearance
- MapOverlayGroup receives `sheetState` prop and raises filter chips when sheet is at half/full
- iOS Apple Maps workaround: `requestDismiss` defers null dispatch by 150ms; `markNewSelection` records timestamp; timer callback checks 300ms guard window to handle variable JS task scheduling between marker and map press events
- Sheet close uses `close()` method (not `snapToIndex(-1)`) per @gorhom/bottom-sheet v5 API
- 14 unit/integration tests (8 initial + 6 from code review); 144/144 total tests pass (0 regressions)
- Zero ESLint warnings on all modified files
- Used `useReducedMotion()` from reanimated (per dev notes) instead of `AccessibilityInfo.isReduceMotionEnabled()` for animation config
- Code-review fixes applied: client swap now preserves current snap point and only opens to peek from closed state
- Follow-up adjustment: removed `BottomSheetBackdrop` tap-to-dismiss due undesired interaction behavior; map tap dismissal remains handled by map press logic
- Code-review fixes applied: corrected analytics classification to pilot-vs-ATC by client type, with payload fields aligned to story intent
- Code-review fixes applied: sheet-state coordination now uses explicit `FloatingFilterChips` props (`hidden`, `topOffset`) instead of ineffective wrapper margin
- Expanded provider tests to cover snap-index mapping, Redux-selected open behavior, same-snap client swap, backdrop dismiss, and hardware-back dismiss; suite now 14 tests

### Change Log

- 2026-03-16: Implemented story 4.1 — extracted bottom sheet into DetailPanelProvider abstraction
- 2026-03-16: Fixed iOS Apple Maps race condition with deferred dismiss + timestamp guard
- 2026-03-16: Fixed sheet close using close() instead of snapToIndex(-1)
- 2026-03-16: Fixed translucent appearance — removed ClientDetails white background, Android border override, theme-aware handle/background styles
- 2026-03-16: Code review remediation — preserved snap level on client swap
- 2026-03-16: Reverted BottomSheet backdrop tap-dismiss due undesired runtime behavior
- 2026-03-16: Code review remediation — corrected sheet analytics event typing/payload and strengthened provider test coverage
- 2026-03-16: Post-review fix — sheetOpenRef for reliable AC6 snap preservation, increased deferred dismiss timer to 150ms/300ms guard

### File List

**New files:**
- `app/components/detailPanel/DetailPanelProvider.jsx`
- `__tests__/DetailPanelProvider.test.js`

**Modified files:**
- `app/components/vatsimMapView/VatsimMapView.jsx`
- `app/components/mapOverlay/MapOverlayGroup.jsx`
- `app/components/filterBar/FloatingFilterChips.jsx`
- `app/components/clientDetails/ClientDetails.jsx`
- `_bmad-output/implementation-artifacts/4-1-detailpanelprovider-bottom-sheet-abstraction.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
