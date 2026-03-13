---
title: 'Firebase Analytics Event Tracking'
slug: 'firebase-analytics-event-tracking'
created: '2026-03-13'
stepsCompleted: [1, 2, 3, 4]
status: 'implementation-complete'
tech_stack: ['@react-native-firebase/app', '@react-native-firebase/analytics', 'expo 55', 'react-native 0.83', 'redux 5', 'redux-thunk 3', '@react-navigation/native 7', '@gorhom/bottom-sheet 5', 'react-native-maps 1.26']
files_to_modify: ['package.json', 'app.json', 'GoogleService-Info.plist', 'App.js', 'app/components/mainApp/MainApp.jsx', 'app/components/mainApp/MainTabNavigator.jsx', 'app/components/vatsimMapView/VatsimMapView.jsx', 'app/common/analyticsMiddleware.js (NEW)', 'app/common/analytics.js (NEW)']
code_patterns: ['Redux middleware for centralized analytics', 'legacy_createStore with thunkMiddleware + composeWithDevTools', 'allActions.appActions.actionName() dispatch pattern', 'useCallback memoized handlers in marker components', '6 existing commented-out Analytics calls in codebase']
test_patterns: ['No test suite - manual verification via Firebase DebugView']
---

# Tech-Spec: Firebase Analytics Event Tracking

**Created:** 2026-03-13

## Overview

### Problem Statement

VatView has no analytics — no visibility into how users interact with the app, which features matter, or what drives retention. Firebase project config files exist (`google-services.json`, `GoogleService-Info.plist`, project: `vatviewanalytics`) but no analytics code is implemented.

### Solution

Add Firebase Analytics using a centralized, **whitelist-based** Redux middleware approach. The middleware selectively intercepts specific Redux actions (`CLIENT_SELECTED`, filter actions) and fires corresponding analytics events using a `category_action` naming convention — minimizing per-component code changes. Screen tracking hooks into the existing `onStateChange` handler in `MainApp.jsx`. A `user_type` Firebase user property (anonymous/linked) is set at session start for segmentation across all reports.

### Scope

**In Scope:**
- Install `@react-native-firebase/app` + `@react-native-firebase/analytics`
- Enable analytics in existing Firebase config (`IS_ANALYTICS_ENABLED`)
- Create analytics Redux middleware intercepting existing actions
- `screen_view` tracking via `MainApp.jsx` `onStateChange`
- `nav_tab_switch`, `map_marker_tap_pilot`, `map_marker_tap_atc`, `sheet_open`/`sheet_close` events (using `category_action` naming convention)
- Firebase user property: `user_type` (anonymous/linked) for cross-report segmentation
- Global properties: platform, app version, session ID, user ID

**Out of Scope:**
- Tier 3 enrichment events (map zoom/pan, filters, list taps, self-tracking detection)
- Tier 4 analysis (retention cohorts, dashboards)
- VATSIM CID linking as analytics dimension
- Firebase dashboard/funnel configuration

## Context for Development

### Codebase Patterns

- All user interactions flow through Redux actions (`appActions.js`) — ideal for middleware interception
- Navigation uses React Navigation with `onStateChange` in `MainApp.jsx` (commented-out analytics line at ~line 143)
- Plain JS/JSX codebase, no TypeScript
- `react-native-paper` for UI, `@gorhom/bottom-sheet` for detail panel
- Expo managed workflow with dev client

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `App.js:16,112` | Redux store creation — `createStore` with `thunkMiddleware` + `composeWithDevTools`. Analytics middleware inserts here. |
| `app/components/mainApp/MainApp.jsx:138-148` | `onStateChange` handler with commented-out `Analytics.setCurrentScreen` at line 143. Screen names from `navigationRef.current.getCurrentRoute().name`. |
| `app/components/mainApp/MainTabNavigator.jsx:22-73` | Tab config: Map, List, Airports, Events screen names. |
| `app/redux/actions/appActions.js:6-15` | Action constants: `CLIENT_SELECTED`, `ATC_FILTER_CLICKED`, `PILOTS_FILTER_CLICKED`, `SEARCH_QUERY_CHANGED`, `REGION_UPDATED`, `AIRPORT_SELECTED`. |
| `app/components/vatsimMapView/VatsimMapView.jsx:21-32,53-66` | Bottom sheet: `@gorhom/bottom-sheet`, snap points `[300,400]`, index `-1`. Driven by Redux `selectedClient` via `useEffect`. No `onChange` callback currently. |
| `app/components/vatsimMapView/PilotMarkers.jsx:54-60` | `onPress` dispatches `clientSelected(pilot)`. Toggle behavior: same pilot tapped again = deselect (`clientSelected(null)`). |
| `app/components/vatsimMapView/AirportMarkers.jsx:46-48` | `onPress` dispatches `clientSelected(airport)`. Same `CLIENT_SELECTED` action as pilots — distinguish by `cid` (pilot) vs `icao` (airport). |
| `app.json:55-74` | Expo plugins array — no Firebase plugin yet. |
| `GoogleService-Info.plist:25-26` | `IS_ANALYTICS_ENABLED` key at line 25, `<false>` value at line 26 — must flip to true. |
| `google-services.json` | Android Firebase config, project `vatviewanalytics`. |

### Existing Commented-Out Analytics Calls

| File | Line(s) | Event | Parameters |
| ---- | ------- | ----- | ---------- |
| `MainApp.jsx` | 143 | `setCurrentScreen` | `(screenName, screenClass)` |
| `MetarView.jsx` | 28-31 | `request_METAR` | `{icao, purpose}` |
| `CTRPolygons.jsx` | 15-18 | `SelectAirport` | `{callsign, purpose}` |
| `AirportListItem.jsx` | 45-48 | `ExpandedArrivals` | `{action, airport}` |
| `AirportListItem.jsx` | 51-55 | `ExpandedDepartures` | `{action, airport}` |
| `AirportListItem.jsx` | 58-63 | `ExpandedAtc` | `{action, airport}` |

### Technical Decisions

- **Whitelist-based Redux middleware:** Only fire analytics on explicitly mapped action types — not a catch-all. Prevents event bloat (Firebase has a 500 event-type limit, 25 custom params per event)
- **`category_action` naming convention:** e.g., `map_marker_tap`, `nav_tab_switch`, `sheet_open` — scannable in Firebase console and extensible for Tier 3
- **Firebase user properties for segmentation:** `user_type` set as a persistent user property (not an event param) — enables segmentation across all reports without per-event overhead
- **Firebase native SDK over Expo Analytics:** Better event customization, already have config files
- **Tier 1+2 first:** Foundation properties + core events provide maximum insight with minimum implementation
- **Dev client rebuild required:** `@react-native-firebase/app` requires native module linking — new dev client build needed after install

### Product Question Mapping

Each tracked event should answer a specific product question:

| Event | Product Question |
| ----- | --------------- |
| `screen_view` | Which screens do users visit? What's the tab distribution? (#12) |
| `nav_tab_switch` | How do users navigate between tabs? What are common flows? (#13) |
| `map_marker_tap_pilot` | How often do users tap aircraft? Browse vs search behavior? (#9) |
| `map_marker_tap_atc` | Are ATC markers tapped as often as aircraft? Pilot vs ATC enthusiasts? (#10) |
| `sheet_open` / `sheet_close` | How long do users engage with detail views? Curiosity vs interest? (#11) |
| `session_start` / `session_end` | Session duration, frequency, time-of-day patterns? (#16, #17, #18) — **Note:** Firebase SDK auto-tracks these; no custom implementation needed |
| `user_type` property | How does behavior differ between anonymous and linked users? (#20) |

## Implementation Plan

### Tasks

- [x] Task 1: Install Firebase packages and configure Expo plugin
  - File: `package.json`
  - Action: Run `npx expo install @react-native-firebase/app @react-native-firebase/analytics`
  - File: `app.json`
  - Action: Add `@react-native-firebase/app` to the `plugins` array with `"analyticsCollectionEnabled": true`
  - Notes: Must be added alongside existing plugins (expo-build-properties, react-native-maps, etc.)

- [x] Task 2: Enable analytics in Firebase config files
  - File: `GoogleService-Info.plist:25-26`
  - Action: Change the `IS_ANALYTICS_ENABLED` value (key at line 25, value at line 26) from `<false></false>` to `<true></true>`
  - Notes: Android `google-services.json` does not need an explicit analytics flag — plugin config handles it

- [x] Task 3: Create analytics utility module
  - File: `app/common/analytics.js` (NEW)
  - Action: Create a thin wrapper around `@react-native-firebase/analytics` that exports:
    - `logEvent(eventName, params)` — wraps `analytics().logEvent()` with `category_action` naming enforcement
    - `logScreenView(screenName, screenClass)` — wraps `analytics().logScreenView()`
    - `setUserProperty(name, value)` — wraps `analytics().setUserProperty()`
    - `setUserId(id)` — wraps `analytics().setUserId()`
  - Notes: Wrapper provides a single import point and allows easy mocking/disabling. All event names must use snake_case `category_action` format. Import as `import analytics from '../common/analytics'` following existing common module pattern. **Every exported function must wrap its Firebase call in try/catch — analytics failures must never crash the app.** In `__DEV__` mode, log errors to `console.warn`; in production, silently swallow. This is critical because Firebase initialization could fail (misconfigured plist, missing native module) and analytics is non-essential functionality.

- [x] Task 4: Create Redux analytics middleware
  - File: `app/common/analyticsMiddleware.js` (NEW)
  - Action: Create a whitelist-based Redux middleware that intercepts specific action types and fires analytics events. **Critical: the `clientSelected` action creator wraps the client in `{selectedClient: client}`, so the client object is at `action.payload.selectedClient`, NOT `action.payload` directly.** Whitelist mapping:
    - `CLIENT_SELECTED` where `action.payload.selectedClient` has `cid` field → `map_marker_tap_pilot` with params `{callsign, cid}`
    - `CLIENT_SELECTED` where `action.payload.selectedClient` has `icao` field → `map_marker_tap_atc` with params `{icao}` (airport object from SQLite may not have a `name` field — verify `getAirportByCode()` return shape in `staticDataAccessLayer.js` before including `name`)
    - `CLIENT_SELECTED` where `action.payload.selectedClient` is `null` → `sheet_close` (deselection)
  - Notes: Middleware runs AFTER `next(action)` so state is already updated. Only whitelisted action types fire events — all others pass through silently. All wrapper functions in `analytics.js` must wrap calls in try/catch — analytics failures must never crash the app (log to console.warn in __DEV__ only).

- [x] Task 5: Wire middleware into Redux store
  - File: `App.js:16`
  - Action: Import `analyticsMiddleware` and add it to `applyMiddleware(thunkMiddleware, analyticsMiddleware)` in the `composedEnhancer`
  - Notes: Analytics middleware should come AFTER thunk middleware in the chain so it only sees resolved actions, not thunks.

- [x] Task 6: Add screen view tracking
  - File: `app/components/mainApp/MainApp.jsx:138-148`
  - Action: Import `analytics` from `../common/analytics`. Replace the commented-out line 143 with:
    ```javascript
    analytics.logScreenView(currentRouteName, currentRouteName);
    ```
  - Notes: This fires on every navigation state change where route name differs from previous. **Important: Verify that `getCurrentRoute().name` returns the tab screen name (Map, List, Airports, Events) for nested tab navigators, not the parent stack screen name ("VatView").** In React Navigation v7, `getCurrentRoute()` should resolve to the deepest focused route, but this must be tested. If it returns "VatView" for all tabs, use `navigationRef.current.getCurrentRoute()` with the `state` property to drill into the nested tab navigator and extract the active tab name. Expected screen names: Map, List, Airports, Events, About, Settings, Network status, Event Details, ATC Bookings, Metar.

- [x] Task 7: Add bottom sheet open tracking
  - File: `app/components/vatsimMapView/VatsimMapView.jsx:53-66`
  - Action: Add `onChange` callback to the `BottomSheet` component:
    ```javascript
    onChange={(index) => {
        if (index >= 0) {
            const client = selectedClient;
            if (client) {
                const eventName = client.cid ? 'sheet_open_pilot' : 'sheet_open_atc';
                const params = client.cid
                    ? { callsign: client.callsign, cid: client.cid }
                    : { icao: client.icao };
                analytics.logEvent(eventName, params);
            }
        }
    }}
    ```
  - Notes: `index >= 0` means sheet is visible (snap point 0 or 1). `index === -1` means closed. Import `analytics` from `../../common/analytics`. The `sheet_close` is handled by the middleware when `CLIENT_SELECTED` fires with `null`. **Critical: deduplicate events.** The live data poll (every 20s) re-dispatches `clientSelected` for the currently selected pilot with updated data, which triggers the `useEffect` → `snapToIndex(0)` → `onChange`. To prevent spurious `sheet_open` events every 20s, track the last-logged client in a `useRef` and only fire the analytics event if the client `cid`/`icao` actually changed:
    ```javascript
    const lastLoggedClientRef = useRef(null);
    // in onChange:
    const clientKey = client.cid || client.icao;
    if (clientKey !== lastLoggedClientRef.current) {
        lastLoggedClientRef.current = clientKey;
        analytics.logEvent(eventName, params);
    }
    // reset ref when sheet closes (index === -1):
    if (index === -1) lastLoggedClientRef.current = null;
    ```

- [x] Task 8: Add explicit `nav_tab_switch` event tracking
  - File: `app/components/mainApp/MainTabNavigator.jsx`
  - Action: Add a `screenListeners` prop to `tab.Navigator` to fire a `nav_tab_switch` event on each tab change:
    ```javascript
    screenListeners={({ route }) => ({
        tabPress: () => {
            analytics.logEvent('nav_tab_switch', { tab_name: route.name });
        },
    })}
    ```
  - Notes: Import `analytics` from `../../common/analytics`. This is separate from `screen_view` — it specifically tracks tab bar taps (user intent to switch tabs), while `screen_view` tracks all navigation transitions including programmatic ones. Provides the data for product question #13.

- [x] Task 9: Set user properties on app start
  - File: `app/components/mainApp/MainApp.jsx`
  - Action: In the component initialization (after store is hydrated), call:
    ```javascript
    analytics.setUserProperty('user_type', 'anonymous');
    ```
  - Notes: Default to `anonymous`. When/if VATSIM CID linking is implemented in future, update to `linked`. This user property persists across sessions and enables segmentation in all Firebase reports.

- [ ] Task 10 (manual): Rebuild dev client
  - Action: Run `npx expo prebuild --clean` then build new dev client for iOS and Android
  - Notes: Required because `@react-native-firebase/app` includes native modules. Existing dev client will not work after adding Firebase packages.

### Acceptance Criteria

- [ ] AC 1: Given the app is launched, when any screen is navigated to, then a `screen_view` event with `screen_name` and `screen_class` params is logged (visible in `__DEV__` console and/or Firebase DebugView). **Verify that tab screens log as "Map", "List", "Airports", "Events" — not "VatView".**
- [ ] AC 2: Given the user is on the Map tab, when they tap a pilot marker, then a `map_marker_tap_pilot` event with `callsign` and `cid` params is logged
- [ ] AC 3: Given the user is on the Map tab, when they tap an airport/ATC marker, then a `map_marker_tap_atc` event with `icao` param is logged
- [ ] AC 4: Given a marker is selected and the bottom sheet is open, when the sheet snaps to a visible index, then a `sheet_open_pilot` or `sheet_open_atc` event is logged. **Given the same marker stays selected during live data polling (20s refresh), then NO duplicate `sheet_open` events are logged.**
- [ ] AC 5: Given the bottom sheet is open, when the user taps the same marker again (deselect) or pans away, then a `sheet_close` event is logged
- [ ] AC 6: Given the user taps a tab in the bottom tab bar, then a `nav_tab_switch` event with `tab_name` param is logged
- [ ] AC 7: Given the app is launched, when the user property panel is checked in Firebase DebugView, then `user_type` is set to `anonymous`
- [ ] AC 8: Given any analytics event fires, when viewed in Firebase DebugView, then platform, app version, and session metadata are automatically attached by the Firebase SDK
- [ ] AC 9: Given the analytics middleware is active, when non-whitelisted Redux actions fire (e.g., `REGION_UPDATED`, `DATA_UPDATED`), then NO analytics events are logged for those actions
- [ ] AC 10: Given the app is built on both iOS and Android, when the dev client runs, then Firebase initializes without errors in the console
- [ ] AC 11: Given Firebase fails to initialize (e.g., misconfigured plist), when any analytics function is called, then the app does NOT crash — errors are silently caught and logged to console.warn in `__DEV__` only

## Additional Context

### Dependencies

- `@react-native-firebase/app` — Firebase core SDK (native module, requires dev client rebuild)
- `@react-native-firebase/analytics` — Firebase Analytics SDK
- Existing `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) — already in project root
- `expo-insights` already installed — can coexist with Firebase Analytics (different data pipelines)

### Testing Strategy

- **No automated tests** — project has no test suite configured
- **Local verification (no Firebase Console needed):**
  1. In `analytics.js` wrapper, add a `__DEV__` console.log before each Firebase call: `console.log('[Analytics]', eventName, params)` — allows verifying events via Metro/Xcode/adb logcat without Firebase Console access
  2. Verify middleware fires correctly via Redux DevTools — confirm whitelisted actions produce log output and non-whitelisted actions do not
- **Firebase DebugView verification (requires Console access):**
  1. Enable debug mode: `adb shell setprop debug.firebase.analytics.app com.gevahim.vatview` (Android) or add `-FIRDebugEnabled` launch argument (iOS)
  2. Open Firebase Console → DebugView
  3. Walk through each AC: navigate screens, tap markers, open/close bottom sheet
  4. Verify each event appears with correct name and parameters
- **Smoke test:** Confirm app launches without crash on both platforms after Firebase integration

### Notes

- **Brainstorming reference:** `_bmad-output/brainstorming/brainstorming-session-2026-03-13-002.md`
- **Risk — Dev client rebuild:** Firebase native modules require a fresh dev client build. If the build fails, check Expo SDK 55 compatibility with the latest `@react-native-firebase` version. Fall back to pinning a compatible version.
- **Risk — Event naming:** Firebase event names are permanent once logged — cannot rename retroactively. The `category_action` convention must be decided before first production deployment.
- **Future Tier 3 extension:** The analytics middleware whitelist is designed to be easily extended. Adding `REGION_UPDATED` → `map_zoom` or `ATC_FILTER_CLICKED` → `list_filter_atc` requires only adding an entry to the whitelist map.
- **Existing commented-out analytics calls** in `MetarView.jsx`, `CTRPolygons.jsx`, and `AirportListItem.jsx` are Tier 3 scope. Do NOT uncomment them in this spec — they use a different naming convention and should be migrated to the `category_action` pattern in a follow-up.
- **Privacy/consent:** Firebase Analytics does NOT require ATT (App Tracking Transparency) on iOS because it uses first-party data and does not track across apps. However, the app's privacy policy should be updated to disclose analytics data collection. Firebase Analytics is GDPR-compliant when configured correctly (data retention settings, IP anonymization). No opt-out toggle is required for this initial implementation but should be considered for a future Settings screen enhancement.
- **Crashlytics discrepancy:** `CLAUDE.md` references `@react-native-firebase/crashlytics` but no Firebase SDK is currently installed. This spec adds only `@react-native-firebase/app` + `analytics`. Adding Crashlytics is a separate effort — note that `@react-native-firebase/app` (installed here) is a prerequisite for Crashlytics.
- **`session_start` / `session_end`:** Firebase Analytics automatically tracks these events — no custom implementation needed. Session timeout is 30 minutes of inactivity by default. The product questions (#16, #17, #18) about session duration and frequency are answered by Firebase's built-in session tracking.
