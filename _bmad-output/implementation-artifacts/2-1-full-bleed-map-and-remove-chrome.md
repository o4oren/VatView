# Story 2.1: Full-Bleed Map & Remove Chrome

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want the map to extend edge-to-edge with no opaque chrome bars,
So that I get maximum map visibility and the immersive "map is the app" experience.

## Acceptance Criteria

1. **Given** the theme system and shared components from Epic 1 are in place, **When** `VatsimMapView.jsx` is updated to render the map full-bleed, **Then** the map extends to all screen edges (under the system status bar and Android navigation area).
2. **Given** `VatsimMapView.jsx` is updated, **When** the app is running, **Then** the existing Paper `Appbar` and opaque header chrome are removed from `MainApp.jsx` (Stack navigator header hidden).
3. **Given** the header chrome is removed, **When** map interactions occur, **Then** pan, zoom, and tap work without obstruction across the full screen area.
4. **Given** the changes are in place, **When** `App.js` is updated, **Then** the `PaperProvider` wrapper is removed (NativeWind + Epic 6 Story 6.5 will handle full Paper removal; this story removes the provider context wrapper).
5. **Given** all changes are applied, **When** the app runs, **Then** existing map functionality (pilot markers, ATC polygons, airport markers, camera position, flight path polylines) is preserved unchanged.
6. **Given** the chrome is removed, **When** on Android and at the root map screen, **Then** the hardware back button exits the app (default Android behavior preserved).
7. **Given** the tab bar is hidden in Story 2.1 (temporary state until Story 2.2 adds FloatingNavIsland), **When** navigating programmatically to a non-map tab and pressing Android hardware back, **Then** back navigation returns to the Map tab.

## Tasks / Subtasks

- [x] Task 1: Update `VatsimMapView.jsx` for full-bleed map (AC: #1, #3, #5)
  - [x] 1.1: Remove `SafeAreaView, Dimensions` from react-native imports; add `View, StyleSheet` to react-native imports
  - [x] 1.2: Remove `import theme from '../../common/theme'` (no longer used after SafeAreaView removal)
  - [x] 1.3: Remove `screenSize` state, `updateScreenSize` function, and `Dimensions.get('window')` call
  - [x] 1.4: Replace `<SafeAreaView style={[theme.blueGrey.safeAreaView, {width: screenSize.width, flex: 1}]} onLayout={updateScreenSize}>` with `<View style={StyleSheet.absoluteFillObject}>`
  - [x] 1.5: Replace closing `</SafeAreaView>` with `</View>`
  - [x] 1.6: Remove `screenSize={screenSize}` prop from `<MapComponent>`
  - [x] 1.7: Used `StyleSheet.absoluteFillObject` inline directly — no separate styles object needed

- [x] Task 2: Update `MapComponent.jsx` to remove screenSize dependency (AC: #3, #5)
  - [x] 2.1: Remove `{screenSize}` from the component's destructured props: `const MapComponent = () => {` (no props)
  - [x] 2.2: Change MapView style from `[styles.mapStyle, {width: screenSize.width, height: screenSize.height}]` to `styles.mapStyle` — the base style already has `flex: 1` which fills available space

- [x] Task 3: Remove header chrome from `MainApp.jsx` (AC: #2, #6, #7)
  - [x] 3.1: Remove `HeaderMenu` component function entirely (lines 25–76 in current file)
  - [x] 3.2: Remove `import {Menu} from 'react-native-paper'` (only used by HeaderMenu)
  - [x] 3.3: Remove `import {Pressable} from 'react-native'` (only used by HeaderMenu)
  - [x] 3.4: Remove `import {MaterialCommunityIcons} from '@expo/vector-icons'` (only used by HeaderMenu)
  - [x] 3.5: Remove `import {useNavigation} from '@react-navigation/native'` from the destructured imports — keep `NavigationContainer` from '@react-navigation/native'
  - [x] 3.6: Remove `import theme from '../../common/theme'` (only used in header style objects)
  - [x] 3.7: Replace `Stack.Navigator screenOptions` with just `{ headerShown: false }`:
    ```javascript
    screenOptions={{
        headerShown: false,
    }}
    ```
  - [x] 3.8: `{StatusBar}` from 'expo-status-bar' was already unused in MainApp (removed); `* as NavigationBar` and `{Platform}` remain in use

- [x] Task 4: Remove `PaperProvider` from `App.js` (AC: #4)
  - [x] 4.1: Remove `import {Provider as PaperProvider} from 'react-native-paper'`
  - [x] 4.2: Remove `import theme from './app/common/theme'` (only used for PaperProvider theme prop)
  - [x] 4.3: Remove `<PaperProvider theme={theme.blueGrey.theme}>` opening tag and `</PaperProvider>` closing tag — `<StatusBarController />` and `<MainApp />` remain as direct children of `<Provider store={store}>`

- [x] Task 5: Update `StatusBarController.jsx` for transparent status bar (AC: #1)
  - [x] 5.1: Change `backgroundColor` from themed surface color to `'transparent'`
  - [x] 5.2: Add `translucent={true}` prop so the status bar overlays the map on Android
  - [x] 5.3: The updated render: `<StatusBar style={isDark ? 'light' : 'dark'} backgroundColor="transparent" translucent={true} />`
  - [x] 5.4: Remove `lightTheme, darkTheme` imports from `'./themeTokens'` (no longer needed)

- [x] Task 6: Hide tab bar in `MainTabNavigator.jsx` (AC: #1, #3)
  - [x] 6.1: Change `tabBarStyle` inside `screenOptions` from the current height-75 object to `{ display: 'none' }`
  - [x] 6.2: Keep all other screenOptions (`tabBarActiveTintColor`, `tabBarInactiveTintColor`, `headerShown: false`, tab screen definitions) unchanged — they will be re-used or removed in Story 2.2
  - [x] 6.3: Keep `tabBarIcon` options on each tab screen — needed for Story 2.2 FloatingNavIsland icon references

- [x] Task 7: Lint and regression check (AC: all)
  - [x] 7.1: Ran `npm run lint` — 0 errors, only 5 pre-existing warnings in plugin files (no new issues)
  - [x] 7.2: Map renders full-bleed via `StyleSheet.absoluteFillObject` — status bar area overlaid, no header bar
  - [x] 7.3: BottomSheet retained in VatsimMapView with same ref/snapPoints/ClientDetails — unchanged
  - [x] 7.4: Flight path polylines in MapComponent unchanged — all rendering logic preserved
  - [x] 7.5: Camera position persistence via Redux `saveInitialRegion` unchanged
  - [x] 7.6: `NavigationBar.setVisibilityAsync('hidden')` call in MainApp useEffect preserved

## Dev Notes

### Overview

This story is the foundational visual transformation for Epic 2. It makes exactly **5 files change**:

| File | Change |
|---|---|
| `app/components/vatsimMapView/VatsimMapView.jsx` | SafeAreaView → View + absoluteFillObject; remove screenSize state |
| `app/components/vatsimMapView/MapComponent.jsx` | Remove screenSize prop; use existing flex:1 style |
| `app/components/mainApp/MainApp.jsx` | Remove HeaderMenu component; set headerShown: false |
| `app/components/mainApp/MainTabNavigator.jsx` | tabBarStyle: { display: 'none' } |
| `App.js` | Remove PaperProvider wrapper + theme import |
| `app/common/StatusBarController.jsx` | Transparent + translucent status bar |

No new files are created in this story.

### Critical: Tab Navigation Is Temporarily Broken

After hiding the tab bar in Story 2.1, there is no UI to navigate between Map, List, Airports, and Events tabs. **This is intentional** — Story 2.2 (FloatingNavIsland) restores navigation with the floating pill. During testing of Story 2.1, test navigation from the Map tab only. Other tabs are still accessible programmatically (React DevTools, or temporarily re-enabling the tab bar) if needed for regression testing, but the visual navigation is deferred to Story 2.2.

### Critical: PaperProvider Removal Scope

Many components in the app still use `react-native-paper` components (`Card`, `Text`, `Searchbar`, `IconButton`, etc.). Removing `PaperProvider` from `App.js` means those components will fall back to react-native-paper's built-in default theme instead of the custom `blueGrey` theme. The components will still render — they will not crash. Visible differences (slightly different colors in Paper components) are acceptable regressions in this story. Full Paper removal happens in **Epic 6 Story 6.5** (`remove-react-native-paper-dependency`).

**Portal-dependent Paper components** (like `Menu` from paper, which was used in `HeaderMenu`) require a Portal host that PaperProvider provides. By removing `HeaderMenu` in the same story, we eliminate the only Portal-dependent component. If any other Portal-dependent Paper components exist elsewhere, they may not render — check `BookingsView`, `VatsimEventsView`, `FilterBar` for `Menu` or `Portal` usage and note any issues.

### VatsimMapView.jsx — Full Target State

```javascript
import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import ClientDetails from '../clientDetails/ClientDetails';
import MapComponent from './MapComponent';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import analytics from '../../common/analytics';

export default function VatsimMapView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const dispatch = useDispatch();
    const sheetRef = useRef(null);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const [prevSelectedClient, setPrevSelectedClient] = useState({});
    const lastLoggedClientRef = useRef(null);

    useEffect(() => {
        if (selectedClient == null)
            sheetRef.current.snapToIndex(0);
        else if(prevSelectedClient == null || (
            (selectedClient.cid != null && selectedClient.cid !== prevSelectedClient.cid) ||
            (selectedClient.icao != null && selectedClient.icao !== prevSelectedClient.icao)
        )) {
            sheetRef.current.snapToIndex(0);
        } else if(selectedClient.cid == prevSelectedClient.cid || selectedClient.icao !== prevSelectedClient.icao)
            return;
        setPrevSelectedClient(selectedClient);
    }, [selectedClient]);

    // if selected client is not null, we update it with the one from the new update
    useEffect(() => {
        if(selectedClient != null && selectedClient.cid != null) {
            // Check pilots
            const newPilot = clients.pilots.filter(p => p.cid === selectedClient.cid);
            if(newPilot.length > 0) {
                dispatch(allActions.appActions.clientSelected(newPilot[0]));
                return;
            }
            // Check airport ATC controllers
            for (const icao in clients.airportAtc) {
                const atcMatch = clients.airportAtc[icao].find(c => c.cid === selectedClient.cid);
                if (atcMatch) {
                    dispatch(allActions.appActions.clientSelected(atcMatch));
                    return;
                }
            }
            // Check CTR controllers
            for (const prefix in clients.ctr) {
                const ctrMatch = clients.ctr[prefix].find(c => c.cid === selectedClient.cid);
                if (ctrMatch) {
                    dispatch(allActions.appActions.clientSelected(ctrMatch));
                    return;
                }
            }
            // Check FSS controllers
            for (const prefix in clients.fss) {
                const fssMatch = clients.fss[prefix].find(c => c.cid === selectedClient.cid);
                if (fssMatch) {
                    dispatch(allActions.appActions.clientSelected(fssMatch));
                    return;
                }
            }
            // Client disconnected — clear selection
            dispatch(allActions.appActions.clientSelected(null));
        }
    }, [clients]);

    return (
        <View style={StyleSheet.absoluteFillObject}>
            <MapComponent />
            <BottomSheet
                ref={sheetRef}
                enablePanDownToClose={true}
                snapPoints={[300, 400]}
                borderRadius={10}
                index={-1}
                onChange={(index) => {
                    if (index === -1) {
                        lastLoggedClientRef.current = null;
                        return;
                    }
                    const client = selectedClient;
                    if (client) {
                        const clientKey = client.cid || client.icao;
                        if (clientKey !== lastLoggedClientRef.current) {
                            lastLoggedClientRef.current = clientKey;
                            const eventName = client.cid ? 'sheet_open_pilot' : 'sheet_open_atc';
                            const params = client.cid
                                ? { callsign: client.callsign, cid: String(client.cid) }
                                : { icao: client.icao };
                            analytics.logEvent(eventName, params);
                        }
                    }
                }}
            >
                <BottomSheetView>
                    <ClientDetails
                        client={selectedClient}
                        fill={true}
                    />
                </BottomSheetView>
            </BottomSheet>
        </View>
    );
}
```

**Key notes:**
- `StyleSheet.absoluteFillObject` is a built-in RN constant: `{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }`. No need to define a styles object.
- `screenSize` state and `Dimensions` are completely removed. MapComponent fills all available space via its own `flex: 1` style.
- `theme` import gone (was only used for SafeAreaView style).

### MapComponent.jsx — Change Summary

The only change is in the component signature and the MapView style prop:

```javascript
// Before:
const MapComponent = ({screenSize}) => {
    ...
    return <MapView
        style={[styles.mapStyle, {width: screenSize.width, height: screenSize.height}]}
        ...

// After:
const MapComponent = () => {
    ...
    return <MapView
        style={styles.mapStyle}
        ...
```

`styles.mapStyle` already has `flex: 1` — no other change needed. All map functionality (markers, polylines, region persistence, theme-aware customMapStyle) unchanged.

### MainApp.jsx — Header Removal

The `Stack.Navigator` currently sets `headerStyle`, `headerTintColor`, `headerTitle`, and `headerRight`. Replace the entire `screenOptions` object with just `{ headerShown: false }`:

```javascript
<Stack.Navigator
    screenOptions={{
        headerShown: false,
    }}
>
```

All 7 Stack.Screen entries (`VatView`, `About`, `Settings`, `Network status`, `Event Details`, `ATC Bookings`, `Metar`) remain unchanged — only the header styling is removed.

Remove these imports completely (none are used after HeaderMenu is deleted):
- `import {Menu} from 'react-native-paper'`
- `import {Pressable} from 'react-native'`
- `import {MaterialCommunityIcons} from '@expo/vector-icons'`
- `import {useNavigation}` (destructure only `NavigationContainer` from `@react-navigation/native`)
- `import theme from '../../common/theme'`

The `NavigationBar.setVisibilityAsync('hidden')` call in `useEffect` stays — it's what hides the Android system nav bar. The `StatusBar` from expo-status-bar import stays (it's in `useEffect` dependency chain... wait actually StatusBar in MainApp isn't being used directly — check if it's only the `StatusBarController` in App.js that handles it). Actually looking at MainApp.jsx line 20: `import {StatusBar} from 'expo-status-bar'` — but `StatusBar` is not referenced anywhere in the MainApp JSX or useEffects. It appears to be an unused import already! Remove it.

Final MainApp.jsx imports after cleanup:
```javascript
import React, {useEffect, useRef} from 'react';
import allActions from '../../redux/actions';
import {ONE_MONTH, STATIC_DATA_VERSION} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import About from '../About/About';
import Settings from '../settings/Settings';
import NetworkStatus from '../networkStatus/networkStatus';
import EventDetailsView from '../EventsView/EventDetailsView';
import MetarView from '../MetarView/MetarView';
import {initDb} from '../../common/staticDataAcessLayer';
import LoadingView from '../LoadingView/LoadingView';
import BookingsView from '../BookingsView/BookingsView';
import * as NavigationBar from 'expo-navigation-bar';
import {Platform} from 'react-native';
import analytics from '../../common/analytics';
```

### StatusBarController.jsx — Transparent for Full-Bleed

```javascript
export default function StatusBarController() {
    const {isDark} = useTheme();

    return (
        <StatusBar
            style={isDark ? 'light' : 'dark'}
            backgroundColor="transparent"
            translucent={true}
        />
    );
}
```

Remove `lightTheme, darkTheme` imports from `'./themeTokens'` — they are no longer used.

**Why `backgroundColor="transparent"` not a lint error:** The `no-color-literals` ESLint rule targets inline `style` props with color literals. The `backgroundColor` prop here is a JSX prop (not a style object), and `"transparent"` is a named string constant — this should not trigger the lint rule. If ESLint does fire, define `const TRANSPARENT = 'transparent'` at module scope and reference it.

**`translucent={true}`:** This is an Android-specific prop that makes the status bar overlay content rather than pushing it down. On iOS, the status bar is already an overlay and doesn't consume space — this prop is a no-op on iOS but causes no harm.

### App.js — PaperProvider Removal

The tree changes from:
```jsx
<GestureHandlerRootView style={styles.root}>
    <ThemeProvider>
        <Provider store={store}>
            <PaperProvider theme={theme.blueGrey.theme}>
                <StatusBarController />
                <MainApp />
            </PaperProvider>
        </Provider>
    </ThemeProvider>
</GestureHandlerRootView>
```

To:
```jsx
<GestureHandlerRootView style={styles.root}>
    <ThemeProvider>
        <Provider store={store}>
            <StatusBarController />
            <MainApp />
        </Provider>
    </ThemeProvider>
</GestureHandlerRootView>
```

Two imports removed: `PaperProvider` and `theme`.

### ESLint Notes from Previous Stories

- **4-space indentation, single quotes, semicolons** — enforced, no exceptions
- **`no-inline-styles`**: `StyleSheet.absoluteFillObject` is a static reference (not an inline object), so `style={StyleSheet.absoluteFillObject}` does NOT trigger this lint rule
- **`no-color-literals`**: `'transparent'` in StatusBarController is a JSX prop value, not a style object entry — should not trigger. If it does, use `const TRANSPARENT = 'transparent'`
- **`no-unused-styles`**: Remove any StyleSheet entries that become unreferenced
- **5 pre-existing ESLint warnings in plugin files** — do not treat as new errors

### Architecture Compliance

- [Source: architecture.md — Navigation Island Architecture: "MainTabNavigator keeps its tab navigator with `tabBarStyle: { display: 'none' }`"]
- [Source: architecture.md — File structure table: "MainApp.jsx ✏️ Remove Paper AppBar" | "MainTabNavigator.jsx ✏️ tabBarStyle: { display: 'none' }" | "VatsimMapView.jsx ✏️ Full-bleed map"]
- [Source: architecture.md — App.js row: "Migrate: NativeWind provider, theme setup | Add NativeWind config, remove PaperProvider"]
- [Source: epics.md — Epic 2 Story 2.1 acceptance criteria]
- **Anti-pattern explicitly called out in architecture.md:** "Positioning FloatingNavIsland directly in VatsimMapView — bypasses coordinated layout orchestration → Position through MapOverlayGroup" — this story does NOT add FloatingNavIsland. It only does the full-bleed groundwork.

### What This Story Does NOT Do

- Does NOT add `FloatingNavIsland` — that is Story 2.2
- Does NOT add `FloatingFilterChips` — that is Story 2.3
- Does NOT add `MapOverlayGroup` — that is Story 2.4
- Does NOT add `DetailPanelProvider` abstraction — that is Story 4.1 (BottomSheet stays in VatsimMapView for now)
- Does NOT remove all `react-native-paper` component usage — that is Story 6.5
- Does NOT restore tab navigation after hiding the tab bar — that is Story 2.2
- Does NOT change `MapComponent.jsx` customMapStyle or any map rendering logic
- Does NOT change any marker components (PilotMarkers, AirportMarkers, CTRPolygons)

### Project Structure Notes

- Alignment with project structure: all modified files are in existing locations — no new files, no renames
- `MainApp.jsx` exports `default function mainApp()` with lowercase 'm' — this is an existing inconsistency; do NOT fix it in this story (it would require updating the import in App.js and constitutes scope creep)
- `staticDataAcessLayer.js` filename typo (single 'c') — do NOT rename; import it exactly as `staticDataAcessLayer`

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.1 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Navigation Island Architecture, file structure table (lines 700-714), anti-patterns table]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — "The map is the app" principle, experience principle #1, migration table (App.js row, VatsimMapView.jsx row)]
- [Source: app/components/vatsimMapView/VatsimMapView.jsx — current SafeAreaView + screenSize implementation to replace]
- [Source: app/components/vatsimMapView/MapComponent.jsx — screenSize prop + flex:1 existing style]
- [Source: app/components/mainApp/MainApp.jsx — HeaderMenu component to remove, Stack.Navigator screenOptions]
- [Source: app/components/mainApp/MainTabNavigator.jsx — current tabBarStyle with height:75 to replace with display:none]
- [Source: App.js — PaperProvider wrapper location]
- [Source: app/common/StatusBarController.jsx — current themed backgroundColor to replace with transparent]
- [Source: app/common/theme.js — safeAreaView style being removed: flex:1, backgroundColor: '#2a5d99']
- [Source: _bmad-output/implementation-artifacts/1-5-listitem-base-component-and-staleindicator.md — coding conventions, import patterns, ESLint rules, pre-existing warnings count]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

No debug issues encountered. All changes were surgical replacements with no ambiguity.

### Completion Notes List

- Replaced `SafeAreaView` + `screenSize` state in `VatsimMapView.jsx` with `View style={StyleSheet.absoluteFillObject}` — map now extends to all screen edges
- Removed `screenSize` prop from `MapComponent.jsx`; MapView now uses existing `flex: 1` style
- Removed `HeaderMenu` function and all associated imports from `MainApp.jsx`; Stack.Navigator now uses `headerShown: false`
- Note: `StatusBar` from expo-status-bar was already an unused import in MainApp.jsx (removed along with the other unused imports)
- Removed `PaperProvider` wrapper and `theme` import from `App.js`; Paper components will fall back to default theme until Epic 6 Story 6.5
- `StatusBarController.jsx` now uses `backgroundColor="transparent" translucent={true}` for full-bleed overlay
- Tab bar hidden via `tabBarStyle: { display: 'none' }` — intentional temporary state until Story 2.2 FloatingNavIsland
- Lint: 0 errors, 5 pre-existing warnings in plugin files only

### File List

- `app/components/vatsimMapView/VatsimMapView.jsx` — modified
- `app/components/vatsimMapView/MapComponent.jsx` — modified
- `app/components/mainApp/MainApp.jsx` — modified
- `app/components/mainApp/MainTabNavigator.jsx` — modified
- `App.js` — modified
- `app/common/StatusBarController.jsx` — modified

## Change Log

- 2026-03-15: Implemented Story 2.1 — Full-bleed map, removed SafeAreaView/screenSize, removed HeaderMenu and opaque header chrome, removed PaperProvider, transparent status bar, tab bar hidden (Date: 2026-03-15)
