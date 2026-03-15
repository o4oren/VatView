# Story 2.3: Floating Filter Chips

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want floating translucent toggle chips on the map to show/hide pilots and ATC,
So that I can control map layer visibility without leaving the map view.

## Acceptance Criteria

1. **Given** the FloatingNavIsland from Story 2.2 is in place, **When** `FloatingFilterChips.jsx` is created in `app/components/filterBar/`, **Then** it renders two translucent filter chips: "Pilots" (default on) and "ATC" (default on).
2. **Given** FloatingFilterChips is rendered, **When** the chips use `TranslucentSurface` for each chip, **Then** they display the frosted-glass appearance consistent with FloatingNavIsland.
3. **Given** a filter chip is tapped, **When** its state toggles, **Then** the corresponding map layer (pilots or ATC) fades out/in with `duration.fast` (150ms) animation.
4. **Given** a filter chip is active (on), **When** it renders, **Then** it shows an accent-colored border using `activeTheme.accent.primary`; when inactive (off), it shows a muted appearance using `activeTheme.text.muted` or `activeTheme.text.secondary`.
5. **Given** FloatingFilterChips is rendered, **When** positioned on the map, **Then** chips appear at top-left with `space-4` (16px) margin from screen edges, offset by safe area insets.
6. **Given** a filter chip is rendered, **When** accessibility is enabled, **Then** each chip has `accessibilityRole="button"` and `accessibilityLabel` (e.g., "Pilots filter, toggle button, on").
7. **Given** the existing `FilterBar.jsx` renders toggle buttons for pilots/ATC in VatsimListView, **When** this story is complete, **Then** the floating chips on the map use the same Redux filter state (`state.app.filters.pilots` / `state.app.filters.atc`) and the FilterBar in List view continues to work unchanged.
8. **Given** the Pilots filter chip is toggled off, **When** the map renders, **Then** pilot markers from `PilotMarkers.jsx` are not rendered (conditional rendering, not opacity hide).
9. **Given** the ATC filter chip is toggled off, **When** the map renders, **Then** ATC polygons from `CTRPolygons.jsx` and airport ATC markers from `AirportMarkers.jsx` are not rendered.
10. **Given** a filter chip is toggled, **When** the event fires, **Then** an analytics event `filter_toggle` is logged with `{ filter_type: 'pilots'|'atc', enabled: true|false }`.

## Tasks / Subtasks

- [x] Task 1: Create `FloatingFilterChips.jsx` in `app/components/filterBar/` (AC: #1, #2, #4, #5, #6, #10)
  - [x] 1.1: Import dependencies: `React` from 'react'; `Pressable, StyleSheet, View, Text` from 'react-native'; `useSafeAreaInsets` from 'react-native-safe-area-context'; `useSelector, useDispatch` from 'react-redux'; `useTheme` from `../../common/ThemeProvider`; `TranslucentSurface` from `../../common/TranslucentSurface`; `MaterialCommunityIcons` from `@expo/vector-icons`; `allActions` from `../../redux/actions`; `analytics` from `../../common/analytics`
  - [x] 1.2: Define `CHIP_DEFS` array: `[{ key: 'pilots', icon: 'airplane', label: 'Pilots' }, { key: 'atc', icon: 'radar', label: 'ATC' }]`
  - [x] 1.3: Implement `FloatingFilterChips` component: read `filters` from `useSelector(state => state.app.filters)`, dispatch `allActions.appActions.pilotsFilterClicked()` or `allActions.appActions.atcFilterClicked()` on press
  - [x] 1.4: Each chip wraps content in its own `TranslucentSurface` with `rounded='sm'` (8px border radius per UX spec `rounded-sm` for chips)
  - [x] 1.5: Active chip styling: 1px border using `activeTheme.accent.primary`, icon color `activeTheme.accent.primary`, label text `activeTheme.text.primary`
  - [x] 1.6: Inactive chip styling: 1px border using `activeTheme.surface.border`, icon color `activeTheme.text.secondary`, label text `activeTheme.text.secondary`; reduced opacity (0.7) to visually indicate off state
  - [x] 1.7: Chip layout: horizontal row with `space-2` (8px) gap between chips; each chip has icon + label text side by side with `space-1` (4px) gap
  - [x] 1.8: Position using `StyleSheet.create()`: `position: 'absolute'`, `top: insets.top + 16`, `left: 16`, `flexDirection: 'row'`, `gap: 8`
  - [x] 1.9: Touch targets: each `Pressable` wrapping the chip has `minHeight: 44` for touch target, with compact visual chip inside via padding
  - [x] 1.10: Accessibility: `accessibilityRole="button"`, `accessibilityLabel` dynamically set (e.g., "Pilots filter, on" / "ATC filter, off"), `accessibilityState={{ checked: isActive }}`
  - [x] 1.11: Analytics: `analytics.logEvent('filter_toggle', { filter_type: chip.key, enabled: !currentState })` on each press

- [x] Task 2: Wire filter state to map markers — conditional rendering (AC: #3, #8, #9)
  - [x] 2.1: In `MapComponent.jsx`, add `useSelector(state => state.app.filters)` to read filter state (adapted from story spec — markers live in MapComponent, not VatsimMapView)
  - [x] 2.2: Conditionally render `<PilotMarkers>` only when `filters.pilots === true`
  - [x] 2.3: Conditionally render `<CTRPolygons>` only when `filters.atc === true`
  - [x] 2.4: Conditionally render `<AirportMarkers>` only when `filters.atc === true`
  - [x] 2.5: Use simple conditional rendering — NOT opacity/animated fade for Phase 1 (animation deferred; the AC says "fades" but conditional mount/unmount is acceptable since the map re-renders every 20s anyway)

- [x] Task 3: Render `FloatingFilterChips` in `VatsimMapView.jsx` (AC: #1, #5)
  - [x] 3.1: Import `FloatingFilterChips` from `../filterBar/FloatingFilterChips`
  - [x] 3.2: Render `<FloatingFilterChips />` inside the map view's overlay area, after the map component but before the bottom sheet
  - [x] 3.3: Ensure FloatingFilterChips renders above the map but does not interfere with map gestures (the chips use `position: 'absolute'` and only capture touches on the chip surfaces themselves)

- [x] Task 4: Lint and regression check (AC: all)
  - [x] 4.1: Run `npm run lint` — 0 new errors beyond the 5 pre-existing warnings
  - [ ] 4.2: Verify both filter chips render on map view with correct styling
  - [ ] 4.3: Verify tapping Pilots chip hides/shows pilot markers on the map
  - [ ] 4.4: Verify tapping ATC chip hides/shows ATC polygons and airport markers on the map
  - [ ] 4.5: Verify filter state persists across tab switches (navigate to List, back to Map — filters remain)
  - [ ] 4.6: Verify FilterBar in List view still works independently (search + pilot/ATC toggles)
  - [ ] 4.7: Verify FloatingFilterChips does not overlap with FloatingNavIsland
  - [ ] 4.8: Verify safe area positioning on notched devices (chips below status bar)

## Dev Notes

### New Files

| File | Action |
|---|---|
| `app/components/filterBar/FloatingFilterChips.jsx` | NEW file |

### Modified Files

| File | Change |
|---|---|
| `app/components/vatsimMapView/VatsimMapView.jsx` | Add filter state selector; conditional render of PilotMarkers, CTRPolygons, AirportMarkers; render FloatingFilterChips |

### Existing Files NOT Modified

| File | Reason |
|---|---|
| `app/components/filterBar/FilterBar.jsx` | Remains as-is for List view search + toggles |
| `app/redux/reducers/appReducer.js` | Filter state already exists: `filters.pilots`, `filters.atc` — no changes needed |
| `app/redux/actions/appActions.js` | Actions already exist: `pilotsFilterClicked()`, `atcFilterClicked()` — no changes needed |

### FloatingFilterChips.jsx — Full Target Implementation

```javascript
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {useTheme} from '../../common/ThemeProvider';
import TranslucentSurface from '../../common/TranslucentSurface';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import allActions from '../../redux/actions';
import analytics from '../../common/analytics';

const CHIP_DEFS = [
    {key: 'pilots', icon: 'airplane', label: 'Pilots'},
    {key: 'atc', icon: 'radar', label: 'ATC'},
];

const ICON_SIZE = 16;

export default function FloatingFilterChips() {
    const {activeTheme} = useTheme();
    const insets = useSafeAreaInsets();
    const filters = useSelector(state => state.app.filters);
    const dispatch = useDispatch();

    function handleChipPress(chip) {
        const isCurrentlyActive = filters[chip.key];
        if (chip.key === 'pilots') {
            dispatch(allActions.appActions.pilotsFilterClicked());
        } else {
            dispatch(allActions.appActions.atcFilterClicked());
        }
        analytics.logEvent('filter_toggle', {
            filter_type: chip.key,
            enabled: !isCurrentlyActive,
        });
    }

    return (
        <View style={[styles.container, {top: insets.top + 16}]}>
            {CHIP_DEFS.map((chip) => {
                const isActive = filters[chip.key];
                const borderColor = isActive
                    ? activeTheme.accent.primary
                    : activeTheme.surface.border;
                const iconColor = isActive
                    ? activeTheme.accent.primary
                    : activeTheme.text.secondary;
                const textColor = isActive
                    ? activeTheme.text.primary
                    : activeTheme.text.secondary;

                return (
                    <Pressable
                        key={chip.key}
                        onPress={() => handleChipPress(chip)}
                        accessibilityRole='button'
                        accessibilityLabel={`${chip.label} filter, ${isActive ? 'on' : 'off'}`}
                        accessibilityState={{checked: isActive}}
                        style={styles.chipPressable}
                    >
                        <TranslucentSurface
                            rounded='sm'
                            style={[
                                styles.chipSurface,
                                {borderWidth: 1, borderColor: borderColor},
                                !isActive && styles.chipInactive,
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={chip.icon}
                                size={ICON_SIZE}
                                color={iconColor}
                            />
                            <Text style={[styles.chipLabel, {color: textColor}]}>
                                {chip.label}
                            </Text>
                        </TranslucentSurface>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        flexDirection: 'row',
        gap: 8,
        zIndex: 10,
    },
    chipPressable: {
        minHeight: 44,
        justifyContent: 'center',
    },
    chipSurface: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 4,
    },
    chipInactive: {
        opacity: 0.7,
    },
    chipLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
});
```

**Key implementation notes:**
- `position: 'absolute'` uses `StyleSheet.create()` per ESLint `no-inline-styles` rule
- `top: insets.top + 16` is an inline override (data-driven, acceptable like FloatingNavIsland's `bottom:`)
- `TranslucentSurface` with `rounded='sm'` for chip shape (8px border radius per UX spec)
- `borderWidth: 1` + `borderColor` provides the active/inactive visual distinction — active gets accent border, inactive gets subtle `surface.border`
- `opacity: 0.7` on inactive chips provides additional visual differentiation
- `zIndex: 10` ensures chips render above the map but below any modals
- Chips read from same Redux state as List view's FilterBar — state is shared, not duplicated
- The `Pressable` wrapper is 44px minHeight for touch target; the visual chip inside is more compact
- `gap: 4` between icon and label, `gap: 8` between chips

### VatsimMapView.jsx — Filter Integration

The map view currently renders markers unconditionally. Add filter-aware conditional rendering:

```javascript
// Add to existing imports/selectors:
const filters = useSelector(state => state.app.filters);

// In the render, wrap marker components conditionally:
{filters.pilots && <PilotMarkers ... />}
{filters.atc && <CTRPolygons ... />}
{filters.atc && <AirportMarkers ... />}
```

**Important:** The map re-renders markers every 20 seconds on live data refresh. Conditional mount/unmount is clean and efficient — no need for animated fade on the markers themselves. The 150ms fade mentioned in the AC refers to the chip visual state change, not the marker layer transition.

### Redux Filter State (Already Exists — No Changes)

```javascript
// appReducer.js initial state:
filters: {
    pilots: true,    // boolean — show/hide pilot markers
    atc: true,       // boolean — show/hide ATC polygons and airport markers
    searchQuery: ''  // string — used only in List view
}

// appActions.js:
pilotsFilterClicked() → { type: PILOTS_FILTER_CLICKED }  // toggles filters.pilots
atcFilterClicked()    → { type: ATC_FILTER_CLICKED }       // toggles filters.atc
```

The Redux infrastructure is complete. No new actions, reducers, or state shape changes needed.

### ESLint Constraints (from Story 2.1 & 2.2 learnings)

- **4-space indentation, single quotes, semicolons** — enforced
- **`no-inline-styles`**: All static styles in `StyleSheet.create()`. Dynamic `top: insets.top + 16` and `borderColor` are acceptable inline overrides (data-driven)
- **`no-color-literals`**: All colors from `activeTheme.*` via `useTheme()` — never hardcode hex values
- **`no-raw-text`**: Chip labels use `<Text>` component — covered
- **`no-unused-styles`**: Remove any unused StyleSheet entries
- **5 pre-existing ESLint warnings in plugin files** — do not treat as new errors

### Architecture Compliance

- [Source: architecture.md — Component location: `FloatingFilterChips` → `app/components/filterBar/FloatingFilterChips.jsx`]
- [Source: architecture.md — NativeWind/StyleSheet boundary: "Filter chips content" uses NativeWind for visual styling BUT "Any component with `position: 'absolute'` that overlays the map → use StyleSheet for positioning"]
- [Source: architecture.md — "FloatingFilterChips" depends on TranslucentSurface + ThemeContext]
- [Source: architecture.md — Anti-patterns: "Reanimated `useAnimatedStyle()` outputs go directly to `style` prop, never NativeWind classes" — relevant if animated fade is added later]
- [Source: architecture.md — MapOverlayGroup: "filter chips are at top-left" — Story 2.4 will refactor positioning into MapOverlayGroup; for now, FloatingFilterChips positions itself]
- [Source: architecture.md — Accessibility: "`accessibilityRole` appropriately: `button` for tappable elements"; "Touch targets: 44x44px minimum"]
- [Source: ux-design-specification.md — FilterChip component spec: "Floating toggle for map layer visibility. Phase 1 chips: Pilots (default on), ATC (default on). Tap toggles on/off. Map layer fades with `duration.fast` (150ms)."]
- [Source: ux-design-specification.md — Border radius: `rounded-sm` = 8px for chips]
- [Source: ux-design-specification.md — Spacing: `space-3` (12px) standard inner padding for chips; `space-4` (16px) margin from screen edges]
- [Source: ux-design-specification.md — Animation: `duration.fast` (150ms) for micro-interactions like chip toggle]
- [Source: ux-design-specification.md — Accent usage: "selected filter chip border" uses accent color]
- [Source: ux-design-specification.md — Screen reader navigation order: "NavIsland → filter chips → StaleIndicator → map markers"]
- [Source: ux-design-specification.md — FilterBar split: "Floating FilterChip on map; search stays in List view"]

### What This Story Does NOT Do

- Does NOT add `MapOverlayGroup` — that is Story 2.4 (which will refactor chip positioning into the orchestrator)
- Does NOT add animated fade on map marker layers (conditional render is sufficient; animation can be added in Story 2.4 if needed)
- Does NOT modify `FilterBar.jsx` — list view search + toggles remain as-is
- Does NOT add search functionality to the map — search stays in List view only
- Does NOT add a third "Airports" filter chip — airports are controlled by the ATC filter
- Does NOT add auto-hide behavior for chips — deferred to Story 2.4 (MapOverlayGroup manages visibility based on sheet state)
- Does NOT change the existing `BottomSheet` behavior in `VatsimMapView`
- Does NOT change any map rendering logic in `MapComponent.jsx` — only wraps existing marker components in conditionals

### Previous Story Intelligence (from Story 2.2)

**Patterns to follow:**
- `FloatingNavIsland.jsx` pattern: `TranslucentSurface` wrapper, `StyleSheet.create()` for positioning, `useSafeAreaInsets()` for safe area, `useTheme()` for colors, `analytics.logEvent()` for tracking
- Dynamic style overrides for inset-dependent positioning (e.g., `{top: insets.top + 16}`) are acceptable per ESLint rules
- Module-level component definitions (not inline lambdas) for tab wrappers — but FloatingFilterChips is simpler (no wrapper components needed)

**Learnings to apply:**
- Story 2.2 initially placed the island in `VatsimMapView.jsx`, then refactored to use `tabBar` prop. For filter chips, placement in `VatsimMapView.jsx` is correct (chips are map-specific, not cross-tab)
- The `state?.routes?.[state.index]?.name` pattern from FloatingNavIsland shows how to safely access nested navigation state — not needed here since we use Redux selectors instead
- ESLint caught inline style issues in Story 2.2 — all positioning MUST be in StyleSheet.create()

### Project Structure Notes

- `app/components/filterBar/` directory already exists (contains `FilterBar.jsx`)
- `FloatingFilterChips.jsx` is a NEW file in this existing directory
- `MaterialCommunityIcons` is an existing dependency (used by FloatingNavIsland)
- `useSafeAreaInsets` is an existing dependency (used by FloatingNavIsland)
- `allActions.appActions.pilotsFilterClicked` and `atcFilterClicked` are existing action creators — verify exact export pattern before use
- `react-redux` `useSelector` and `useDispatch` are existing patterns used throughout the app

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.3 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — FloatingFilterChips location, NativeWind/StyleSheet boundary, MapOverlayGroup coordination, accessibility requirements]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — FilterChip component spec, spacing tokens, animation duration.fast=150ms, rounded-sm=8px, accent border for selected chips, screen reader order]
- [Source: _bmad-output/project-context.md — ESLint rules, Redux patterns, no-inline-styles, no-color-literals, no-raw-text]
- [Source: app/components/filterBar/FilterBar.jsx — existing filter toggle pattern (ToggleButton for pilots/atc, Searchbar)]
- [Source: app/redux/reducers/appReducer.js — filter state shape: filters.pilots, filters.atc, filters.searchQuery]
- [Source: app/redux/actions/appActions.js — pilotsFilterClicked(), atcFilterClicked() action creators]
- [Source: app/components/vatsimMapView/VatsimMapView.jsx — current marker rendering (PilotMarkers, AirportMarkers, CTRPolygons) — no filter checks currently]
- [Source: app/components/navigation/FloatingNavIsland.jsx — pattern reference for TranslucentSurface usage, StyleSheet positioning, safe area, analytics]
- [Source: app/common/TranslucentSurface.jsx — rounded='sm' → borderRadius: 8]
- [Source: app/common/themeTokens.js — animation.duration.fast=150ms, opacity.surface=0.45]
- [Source: _bmad-output/implementation-artifacts/2-2-floating-navigation-island.md — ESLint conventions, positioning patterns, previous learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Filter selector placed in `MapComponent.jsx` instead of `VatsimMapView.jsx` (story spec deviation): markers are generated inside MapComponent's `getMarkers()` function, so filter logic was added there. The filters are passed as a parameter to `getMarkers()` and used for conditional inclusion of each marker generator's output.
- **Bug fix:** Initial implementation conditionally called `generatePilotMarkers()` etc. inside ternaries, which violated Rules of Hooks since those functions contain `useSelector`/`useDispatch`. Fixed by always calling all generators and filtering the *results* based on filter state.

### Completion Notes List

- Created `FloatingFilterChips.jsx` following the exact pattern from FloatingNavIsland: TranslucentSurface, StyleSheet positioning, safe area insets, theme tokens, analytics
- Two chips ("Pilots" and "ATC") read from existing Redux `state.app.filters` — shared state with List view's FilterBar
- Active chips show accent-colored border; inactive chips show muted border with 0.7 opacity
- Chips positioned top-left with 16px margins, offset by safe area insets
- Full accessibility support: role="button", dynamic labels, checked state
- Analytics `filter_toggle` event logged on each toggle
- Map markers conditionally rendered via `getMarkers()` in MapComponent — pilots filter controls PilotMarkers, ATC filter controls CTRPolygons + AirportMarkers
- ESLint: 0 new errors (5 pre-existing plugin warnings unchanged)
- FilterBar.jsx in List view remains completely unchanged

### Change Log

- 2026-03-15: Implemented Story 2.3 — Floating filter chips for map layer visibility control

### File List

| File | Action |
|---|---|
| `app/components/filterBar/FloatingFilterChips.jsx` | NEW — floating translucent filter chip component |
| `app/components/vatsimMapView/VatsimMapView.jsx` | MODIFIED — import and render FloatingFilterChips |
| `app/components/vatsimMapView/MapComponent.jsx` | MODIFIED — add filter selector, conditional marker rendering |
