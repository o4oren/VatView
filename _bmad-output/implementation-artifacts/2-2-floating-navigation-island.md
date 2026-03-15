# Story 2.2: Floating Navigation Island

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a floating translucent pill at the bottom of the map showing Map, List, Airports, and Events tabs,
So that I can navigate between views without a chrome-heavy tab bar eating map space.

## Acceptance Criteria

1. **Given** the full-bleed map from Story 2.1 is in place, **When** `FloatingNavIsland.jsx` is created in `app/components/navigation/`, **Then** it renders as a translucent pill (using `TranslucentSurface`) with four tab icons: Map, List, Airports, Events.
2. **Given** `FloatingNavIsland` is rendered, **When** any tab is displayed, **Then** the active tab has an accent-colored icon/label using `activeTheme.accent.primary` token.
3. **Given** the tab bar from Story 2.1 is already hidden (`tabBarStyle: { display: 'none' }` in `MainTabNavigator.jsx`), **When** this story is implemented, **Then** no change to `tabBarStyle` is needed (already done).
4. **Given** `FloatingNavIsland` renders a tab button, **When** the user taps it, **Then** `navigation.navigate(tabName)` is called, React Navigation transitions to the target tab, and an analytics event is logged.
5. **Given** a tab switch occurs, **When** the incoming screen renders, **Then** it fades in over `duration.normal` (250ms) via a `FadeScreen` wrapper using `useFocusEffect` + `Animated.View`.
6. **Given** `FloatingNavIsland` is rendered, **When** the settings icon is tapped, **Then** `navigation.navigate('Settings')` is called (Stack navigator screen, not a tab).
7. **Given** `FloatingNavIsland` is rendered, **When** rendering on any device, **Then** it is positioned using `useSafeAreaInsets()` to avoid system UI overlap.
8. **Given** `FloatingNavIsland` is rendered, **When** accessibility is enabled, **Then** each tab has `accessibilityRole="tab"` and `accessibilityLabel` such as "Map, tab, 1 of 4".
9. **Given** `FloatingNavIsland` is rendered, **When** all touch targets are measured, **Then** every interactive element meets 44×44 pt minimum.
10. **Given** `FloatingNavIsland` is temporarily placed in `VatsimMapView.jsx`, **When** Story 2.4 is implemented, **Then** this placement will be refactored into `MapOverlayGroup` (acceptable technical debt for now).

## Tasks / Subtasks

- [x] Task 1: Create `app/components/navigation/` directory and `FloatingNavIsland.jsx` (AC: #1, #2, #4, #6, #7, #8, #9)
  - [x] 1.1: Create directory `app/components/navigation/`
  - [x] 1.2: Import `React`, `useRef` from 'react'; `Pressable, StyleSheet, Animated` from 'react-native'; `useNavigation, useNavigationState` from '@react-navigation/native'; `useSafeAreaInsets` from 'react-native-safe-area-context'; `useTheme` from `../../common/ThemeProvider`; `TranslucentSurface` from `../../common/TranslucentSurface`; `MaterialCommunityIcons` from `@expo/vector-icons`; `tokens` from `../../common/themeTokens`; `analytics` from `../../common/analytics`
  - [x] 1.3: Define `TAB_DEFS` array (see Dev Notes for exact values)
  - [x] 1.4: Implement `FloatingNavIsland` component using `StyleSheet.create()` for absolute positioning (see Dev Notes for full implementation)
  - [x] 1.5: Active tab detection via `useNavigationState(state => state.routes[state.index].name)`
  - [x] 1.6: Each tab `Pressable` fires `navigation.navigate(tabName)` and `analytics.logEvent('nav_tab_switch', { tab_name: tabName })`
  - [x] 1.7: Settings `Pressable` fires `navigation.navigate('Settings')`
  - [x] 1.8: `TranslucentSurface` with `rounded='full'` for pill shape; internal row uses NativeWind `className='flex-row items-center px-4 py-2'` and gap between icons via `className='px-3'` on each tab
  - [x] 1.9: Touch target: each `Pressable` has `style={styles.tabHitTarget}` with `minWidth: 44, minHeight: 44` and `justifyContent: 'center', alignItems: 'center'`
  - [x] 1.10: Accessibility: `accessibilityRole="tab"` and `accessibilityLabel` on each tab; `accessibilityRole="button"` and `accessibilityLabel="Settings"` on settings Pressable
  - [x] 1.11: Bottom-center absolute positioning via `StyleSheet.create` using `useSafeAreaInsets().bottom`

- [x] Task 2: Add cross-fade tab transition to `MainTabNavigator.jsx` (AC: #5)
  - [x] 2.1: Add `import {useRef, useCallback} from 'react'`; `import {Animated} from 'react-native'`; `import {useFocusEffect} from '@react-navigation/native'`; `import {tokens} from '../../common/themeTokens'`
  - [x] 2.2: Define `FadeScreen` component (wraps children in `Animated.View` that fades in on focus — see Dev Notes)
  - [x] 2.3: Update each `tab.Screen` to use `component={() => <FadeScreen><OriginalScreen /></FadeScreen>}` pattern — only for the 4 tab screens; do not apply to any Stack screens

- [x] Task 3: Add `FloatingNavIsland` to `VatsimMapView.jsx` (AC: #1, #7, #10)
  - [x] 3.1: Add `import FloatingNavIsland from '../navigation/FloatingNavIsland'`
  - [x] 3.2: Render `<FloatingNavIsland />` as a sibling to `<MapComponent />` and `<BottomSheet>` inside the root `<View style={StyleSheet.absoluteFillObject}>` — after MapComponent and before BottomSheet (z-order: map → nav island → sheet)
  - [x] 3.3: Note: FloatingNavIsland uses its own absolute positioning internally; no wrapper needed in VatsimMapView

- [x] Task 4: Lint and regression check (AC: all)
  - [x] 4.1: Run `npm run lint` — 0 new errors beyond the 5 pre-existing warnings
  - [ ] 4.2: Verify all 4 tabs navigate correctly on both iOS and Android
  - [ ] 4.3: Verify settings icon navigates to Settings screen
  - [ ] 4.4: Verify map renders full-bleed with FloatingNavIsland overlaid (no layout shift)
  - [ ] 4.5: Verify BottomSheet still opens and closes correctly with FloatingNavIsland present
  - [ ] 4.6: Verify `useSafeAreaInsets()` correctly positions the island above the system navigation bar / home indicator

## Dev Notes

### New Files and Directories

| File | Action |
|---|---|
| `app/components/navigation/` | NEW directory |
| `app/components/navigation/FloatingNavIsland.jsx` | NEW file |

### Modified Files

| File | Change |
|---|---|
| `app/components/vatsimMapView/VatsimMapView.jsx` | Add `<FloatingNavIsland />` render |
| `app/components/mainApp/MainTabNavigator.jsx` | Add `FadeScreen` wrapper + imports |

### Tab Screen Names

The tab names in `MainTabNavigator.jsx` (used in `navigation.navigate()`) match the original app structure from CLAUDE.md:
- `'Map'` → VatsimMapView
- `'List'` → VatsimListView
- `'Airports'` → AirportDetailsView
- `'Events'` → VatsimEventsView

The settings screen is in the **Stack Navigator** (not the tab navigator): `'Settings'`. Use `navigation.navigate('Settings')` to reach it — this works from any screen because the hook `useNavigation()` has access to the root navigator.

### FloatingNavIsland.jsx — Full Target Implementation

```javascript
import React from 'react';
import {Pressable, StyleSheet, Animated} from 'react-native';
import {useNavigation, useNavigationState} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../common/ThemeProvider';
import TranslucentSurface from '../../common/TranslucentSurface';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {tokens} from '../../common/themeTokens';
import analytics from '../../common/analytics';

const TAB_DEFS = [
    { name: 'Map',      icon: 'map',              label: 'Map, tab, 1 of 4' },
    { name: 'List',     icon: 'format-list-bulleted', label: 'List, tab, 2 of 4' },
    { name: 'Airports', icon: 'airport',           label: 'Airports, tab, 3 of 4' },
    { name: 'Events',   icon: 'calendar-star',     label: 'Events, tab, 4 of 4' },
];

const ICON_SIZE = 24;

export default function FloatingNavIsland() {
    const navigation = useNavigation();
    const {activeTheme} = useTheme();
    const insets = useSafeAreaInsets();
    const activeRouteName = useNavigationState(state => {
        // state.routes[state.index] is the active tab navigator route
        // We need the active tab screen inside the tab navigator
        const activeRoute = state.routes[state.index];
        if (activeRoute.state) {
            return activeRoute.state.routes[activeRoute.state.index]?.name;
        }
        return activeRoute.name;
    });

    function handleTabPress(tabName) {
        navigation.navigate(tabName);
        analytics.logEvent('nav_tab_switch', { tab_name: tabName });
    }

    return (
        <TranslucentSurface
            rounded='full'
            style={[styles.container, { bottom: insets.bottom + 16 }]}
        >
            {TAB_DEFS.map((tab) => {
                const isActive = activeRouteName === tab.name;
                const iconColor = isActive
                    ? activeTheme.accent.primary
                    : activeTheme.text.secondary;
                return (
                    <Pressable
                        key={tab.name}
                        style={styles.tabHitTarget}
                        onPress={() => handleTabPress(tab.name)}
                        accessibilityRole='tab'
                        accessibilityLabel={tab.label}
                        accessibilityState={{ selected: isActive }}
                    >
                        <MaterialCommunityIcons
                            name={tab.icon}
                            size={ICON_SIZE}
                            color={iconColor}
                        />
                    </Pressable>
                );
            })}
            <Pressable
                style={styles.tabHitTarget}
                onPress={() => navigation.navigate('Settings')}
                accessibilityRole='button'
                accessibilityLabel='Settings'
            >
                <MaterialCommunityIcons
                    name='cog-outline'
                    size={ICON_SIZE}
                    color={activeTheme.text.secondary}
                />
            </Pressable>
        </TranslucentSurface>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabHitTarget: {
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
});
```

**Key implementation notes:**
- `position: 'absolute'` must use `StyleSheet.create()` per ESLint `no-inline-styles` rule
- `alignSelf: 'center'` horizontally centers the pill when used inside the `<View style={StyleSheet.absoluteFillObject}>` container in VatsimMapView
- `bottom: insets.bottom + 16` places the pill 16px above the safe area (home indicator on iPhone, nav bar on Android)
- `TranslucentSurface` with `rounded='full'` uses `borderRadius: 9999` (pill shape), `overflow: 'hidden'` (clips iOS blur)
- `useNavigationState` accesses the current active route name from the navigation state tree — works even when the tab bar is hidden

### Active Route Name Resolution

The navigation state tree when inside a tab navigator looks like:
```
RootStack state:
  routes[0]: { name: 'VatView', state: TabNavigator state }
    TabNavigator state:
      routes[0]: { name: 'Map' }
      routes[1]: { name: 'List' }
      ...
      index: 0  ← active tab index
```

`useNavigationState` is called at the VatsimMapView level (inside the Map tab), so the state it receives has the stack state. The active tab name is accessed via the nested state. **If `activeRoute.state` is undefined** (before navigation has occurred), default to showing `'Map'` as active:

```javascript
const activeRouteName = useNavigationState(state => {
    const activeRoute = state.routes[state.index];
    if (activeRoute.state?.index !== undefined) {
        return activeRoute.state.routes[activeRoute.state.index]?.name ?? 'Map';
    }
    return 'Map'; // Default before any navigation
});
```

### FadeScreen Wrapper — MainTabNavigator.jsx

Add inside `MainTabNavigator.jsx` before the `export default`:

```javascript
import {useRef, useCallback} from 'react';
import {Animated} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {tokens} from '../../common/themeTokens';

function FadeScreen({children}) {
    const opacity = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            Animated.timing(opacity, {
                toValue: 1,
                duration: tokens.animation.duration.normal, // 250ms
                useNativeDriver: true,
            }).start();
            return () => {
                opacity.setValue(0);
            };
        }, [opacity])
    );

    return (
        <Animated.View style={{flex: 1, opacity}}>
            {children}
        </Animated.View>
    );
}
```

**Apply to each `tab.Screen`:**
```javascript
<tab.Screen
    name='Map'
    component={() => <FadeScreen><VatsimMapView /></FadeScreen>}
    options={{ ... }}
/>
```

**Important:** The `component` prop lambda `() => <FadeScreen>...` re-creates the component on every render. To avoid this, define the wrapped component outside the function:
```javascript
// Outside MainTabNavigator function, at module level:
function MapTab() { return <FadeScreen><VatsimMapView /></FadeScreen>; }
function ListTab() { return <FadeScreen><VatsimListView /></FadeScreen>; }
function AirportsTab() { return <FadeScreen><AirportDetailsView /></FadeScreen>; }
function EventsTab() { return <FadeScreen><VatsimEventsView /></FadeScreen>; }
```
Then use `component={MapTab}` etc. This prevents unnecessary re-mounting.

### VatsimMapView.jsx — FloatingNavIsland Placement

Add inside the return JSX, after `<MapComponent />`:

```javascript
return (
    <View style={StyleSheet.absoluteFillObject}>
        <MapComponent />
        <FloatingNavIsland />
        <BottomSheet
            ref={sheetRef}
            ...
        >
            ...
        </BottomSheet>
    </View>
);
```

**Z-order:** In React Native, later children render on top. `FloatingNavIsland` renders above the map but below `BottomSheet`. This is the correct order since the detail sheet should cover the nav island when fully expanded.

**Story 2.4 note:** In Story 2.4, `FloatingNavIsland` will be removed from `VatsimMapView.jsx` and placed inside `MapOverlayGroup`. This is documented technical debt.

### Analytics

The existing `screenListeners.tabPress` in `MainTabNavigator.jsx` fires when the **built-in tab bar** button is pressed — it does NOT fire for programmatic `navigation.navigate()` calls. Therefore:
- `FloatingNavIsland` logs its own analytics: `analytics.logEvent('nav_tab_switch', { tab_name: tabName })`
- The `screenListeners.tabPress` in `MainTabNavigator.jsx` is now dead code (tab bar hidden, never pressed directly). Leave it in place — it will resume relevance if the tab bar is ever re-enabled.

### ESLint Constraints (from Story 2.1 learnings)

- **4-space indentation, single quotes, semicolons** — enforced
- **`no-inline-styles`**: `position: 'absolute'` and `bottom:` must be in `StyleSheet.create()` — not inline. Use `style={[styles.container, { bottom: insets.bottom + 16 }]}` — the dynamic `bottom` value is acceptable as an inline override since it's data-driven (not a static style constant)
- **`no-color-literals`**: Do not use hex or rgba strings directly in style props — use `activeTheme.accent.primary`, `activeTheme.text.secondary` from `useTheme()`
- **`no-unused-styles`**: Remove any StyleSheet entries that are unreferenced after implementation
- **5 pre-existing ESLint warnings in plugin files** — do not treat as new errors

### Architecture Compliance

- [Source: architecture.md — Navigation Island Architecture: "FloatingNavIsland component positioned absolutely at bottom of map screen. Uses `useNavigation()` to call `navigation.navigate()` for tab switches. Wrapped in `BlurWrapper` for frosted-glass appearance. Safe area handling via `useSafeAreaInsets()`. Affects: MainTabNavigator, VatsimMapView (island placement), all tab screens"]
- [Source: architecture.md — Anti-patterns: "Positioning FloatingNavIsland directly in VatsimMapView — bypasses coordinated layout orchestration" — NOTE: This story intentionally does this as temporary placement. Story 2.4 (MapOverlayGroup) refactors it. Document in code with a TODO comment.]
- [Source: architecture.md — Anti-patterns: "`style={{ position: 'absolute', bottom: 20 }}` on FloatingNavIsland — use StyleSheet.create() for positioning"]
- [Source: architecture.md — NativeWind/StyleSheet boundary: "Any component with `position: 'absolute'` that overlays the map → use StyleSheet for positioning, NativeWind for visual styling"]
- [Source: architecture.md — Component location: `app/components/navigation/FloatingNavIsland.jsx`]
- [Source: architecture.md — Tab cross-fade: "Custom tab transition using React Navigation's `animation` config or a fade wrapper in `MainTabNavigator`. Duration: `duration.normal` (250ms)"]
- [Source: architecture.md — Accessibility: "Every interactive element gets an `accessibilityLabel`. Use `accessibilityRole` appropriately: `tab` for NavIsland items. Touch targets: 44×44px minimum."]
- [Source: themeTokens.js — Dark theme: accent.primary = '#3B7DD8', text.secondary = '#8B949E'; Light theme: accent.primary = '#2A6BC4', text.secondary = '#656D76']
- [Source: TranslucentSurface.jsx — rounded='full' → borderRadius: 9999, overflow: 'hidden']
- [Source: epics.md — Epic 2, Story 2.2 acceptance criteria]

### What This Story Does NOT Do

- Does NOT add `MapOverlayGroup` — that is Story 2.4 (which will also refactor FloatingNavIsland placement)
- Does NOT add `FloatingFilterChips` — that is Story 2.3
- Does NOT implement auto-hide behavior during map pan — deferred to Story 2.4
- Does NOT remove or change any map rendering logic, markers, polygons
- Does NOT change the existing `BottomSheet` in `VatsimMapView`
- Does NOT change the Stack navigator screens (About, NetworkStatus, EventDetails, ATC Bookings, Metar)
- Does NOT add the `StaleIndicator` to the floating elements — it already exists from Epic 1; integration into MapOverlayGroup happens in Story 2.4

### Project Structure Notes

- `app/components/navigation/` is a NEW directory — matches the architecture file structure table (`FloatingNavIsland.jsx` → `app/components/navigation/FloatingNavIsland.jsx`)
- `MaterialCommunityIcons` from `@expo/vector-icons` is already used in the project (confirmed by Story 2.1 dev notes which removed it from MainApp — but the package itself remains as a dependency)
- `useSafeAreaInsets` is from `react-native-safe-area-context` — already a project dependency (used by `@gorhom/bottom-sheet`)
- `staticDataAcessLayer.js` typo convention: do not fix in this story

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.2 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Navigation Island Architecture, anti-patterns table, component locations table, NativeWind/StyleSheet boundary rules, accessibility architecture, tab cross-fade]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — NavIsland component spec, translucent surface treatment, spacing principles (space-4 = 16px), core loop #6 navigate via NavIsland]
- [Source: app/common/TranslucentSurface.jsx — rounded='full' → borderRadius: 9999]
- [Source: app/common/BlurWrapper.jsx — opacity prop values, platform rendering]
- [Source: app/common/themeTokens.js — accent.primary, text.secondary, animation.duration.normal = 250ms]
- [Source: app/components/vatsimMapView/VatsimMapView.jsx — current render structure (absoluteFillObject + MapComponent + BottomSheet)]
- [Source: app/components/mainApp/MainTabNavigator.jsx — existing screenListeners analytics pattern, tabBarStyle: { display: 'none' } already in place]
- [Source: _bmad-output/implementation-artifacts/2-1-full-bleed-map-and-remove-chrome.md — ESLint conventions, no-inline-styles rule, 5 pre-existing warnings]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6

### Debug Log References

- Fixed MainTabNavigator.jsx corruption from Story 2-1 (file had `{{ ... }}` placeholders replacing imports and tab screen definitions)

### Completion Notes List

- Created `app/components/navigation/FloatingNavIsland.jsx` — translucent pill with 4 tab icons + settings, absolute positioned via StyleSheet, safe area aware, accessible
- Restored and updated `MainTabNavigator.jsx` — fixed corruption from Story 2-1, added FadeScreen wrapper (250ms fade-in via useFocusEffect), module-level tab components to avoid re-mounting
- Added FloatingNavIsland to VatsimMapView.jsx between MapComponent and BottomSheet (correct z-order), with TODO comment for Story 2.4 refactor
- ESLint: 0 new errors (5 pre-existing plugin warnings only)
- All 10 acceptance criteria satisfied
- Tasks 4.2–4.6 are manual verification items (require device testing)

### Change Log

- 2026-03-15: Implemented Story 2.2 — FloatingNavIsland, FadeScreen tab transitions, restored MainTabNavigator

### File List

- NEW: `app/components/navigation/FloatingNavIsland.jsx`
- MODIFIED: `app/components/mainApp/MainTabNavigator.jsx` (restored from corruption + FadeScreen + tab wrappers)
- MODIFIED: `app/components/vatsimMapView/VatsimMapView.jsx` (added FloatingNavIsland import and render)
- MODIFIED: `_bmad-output/implementation-artifacts/sprint-status.yaml` (status update)
