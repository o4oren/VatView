---
title: 'Fix Android map view: navigation bar color and ATC marker icon fallback'
slug: 'fix-android-navbar-and-atc-markers'
created: '2026-03-13'
status: 'completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['react-native-maps', 'react-navigation', 'expo', 'react-native', 'react-native-paper']
files_to_modify: ['app.json', 'app/components/vatsimMapView/AirportMarkers.jsx', 'app/components/vatsimMapView/PilotMarkers.jsx']
code_patterns: ['generator functions for marker creation', 'Platform.OS branching for icon sizes', 'static require() for all map icons', 'Redux useSelector for live data in marker generators', 'composite keys with timestamps on airport markers']
test_patterns: []
---

# Tech-Spec: Fix Android map view: navigation bar color and ATC marker icon fallback

**Created:** 2026-03-13

## Overview

### Problem Statement

On Android (Samsung S24, preview build with Expo SDK 55), two visual bugs are present:

1. **Visible navigation bar:** The Android system navigation bar (below the bottom tab bar) displays as a grey/black bar, creating a jarring visual break. Root cause: `app.json` has `androidNavigationBar` configured with a visible black background.
2. **Markers degrade to red pins:** After the app runs for some time (through multiple 20-second live data refresh cycles), some ATC airport markers lose their custom icons and fall back to the default red Google Maps pin markers. Root causes: (a) null image fallback in `AirportMarkers.jsx` when facility type doesn't match any branch, (b) unstable marker keys using `icao + '_' + lastUpdated` causing constant mount/unmount cycles.

### Solution

1. Hide the Android system navigation bar using immersive mode (`"visible": "immersive"`) in `app.json`.
2. Fix `AirportMarkers.jsx`: add default icon fallback for unrecognized facility types, and stabilize marker keys by removing the `lastUpdated` component.
3. Add defensive null guard on pilot marker image prop as belt-and-suspenders.

### Scope

**In Scope:**
- Android system navigation bar — hide with immersive mode
- AirportMarkers null image fallback
- AirportMarkers key stabilization
- Pilot marker defensive null guard

**Out of Scope:**
- iOS-specific styling
- Any other map features or UI changes
- Tab bar styling (tab bar itself is correctly blue)
- CTR polygon markers (keying is stable, no image issues)

## Context for Development

### Codebase Patterns

- Project uses plain JS/JSX (no TypeScript)
- All colors must come from `app/common/theme.js` — no hardcoded color literals (ESLint enforced)
- `react-native-maps` with Google Maps provider for map rendering
- Markers use platform-specific icon sizes (32px for iOS, 64px for Android) via `Platform.OS` branching
- All map icons are static `require()` in `iconsHelper.js` — never dynamic URIs
- `generateAirportMarkers()` and `generatePilotMarkers()` are generator functions, not React components
- Live data refreshes every 20 seconds via Redux thunk; reducer fully replaces `clients` object on `DATA_UPDATED`
- `getAircraftIcon()` in `iconsHelper.js` always returns B737 as fallback — safe for pilots
- Airport marker keys currently: `airport.icao + '_' + lastUpdated` (unstable — changes every update)
- Pilot marker keys: `pilot.key` = `callsign_cid` (stable — correct)
- `tracksViewChanges={Platform.OS === 'android'}` used on both airport and pilot markers

### Files to Reference

| File | Purpose | Key Findings |
| ---- | ------- | ------------ |
| `app.json` (lines 22-25) | Android nav bar config | Currently visible with black bg — change to immersive mode |
| `app/components/vatsimMapView/AirportMarkers.jsx` | ATC marker rendering | Null image when facility type unrecognized; unstable key with `lastUpdated` |
| `app/components/vatsimMapView/PilotMarkers.jsx` | Pilot marker rendering | Stable keys, safe image fallback via `getAircraftIcon()` |
| `app/components/vatsimMapView/MapComponent.jsx` | Orchestrates all marker generators | Calls `generateAirportMarkers()` and `generatePilotMarkers()` |
| `app/common/theme.js` (line 320) | Theme colors | `primary: '#2a5d99'` |
| `app/common/iconsHelper.js` | Map icon assets and `getAircraftIcon()` | All static requires; aircraft icon always falls back to B737 |
| `app/redux/reducers/vatsimLiveDataReducer.js` | Live data state | `DATA_UPDATED` fully replaces `clients` — disconnected clients are removed |
| `app/redux/actions/vatsimLiveDataActions.js` | Data fetch and processing | Processes controllers by facility type into `airportAtc`, `ctr`, `fss`, etc. |

### Technical Decisions

- **Nav bar fix is declarative** — set `"visible": "immersive"` in `app.json` `androidNavigationBar` config. Nav bar hides automatically, user swipes from bottom to reveal temporarily.
- **Airport marker key** should use `airport.icao` only (stable) — removing `lastUpdated` prevents unnecessary marker re-creation
- **Fallback icon** for unrecognized airport ATC facility types: use `tower` icon (most generic ATC icon)
- **Pilot markers** are already safe but add a null guard on `pilot.image` as defense in depth
- **No changes needed** to the data flow/reducer — `DATA_UPDATED` correctly replaces the full `clients` object

### Root Cause Analysis

**AirportMarkers.jsx — image assignment gap (lines 76-87):**

The facility type if/else chain covers: `app`, `ground || tower`, `atis || delivery`. If none of these flags are true (e.g., unrecognized facility type), `image` stays `null` (initialized on line 37). When `<Marker>` renders with `source={null}`, Google Maps falls back to the default red pin.

**AirportMarkers.jsx — unstable keys (line 91):**

Key: `airport.icao + '_' + lastUpdated`. Every ATC update changes `lastUpdated`, so React treats the same airport as a NEW marker each cycle. Old marker unmounts, new one mounts. If mounting races with image assignment, the marker can briefly (or permanently) show the default red pin.

**Combined effect:** The unstable keys cause constant marker churn, and any timing where the image is null during mount produces a red pin that may persist if the next cycle also re-creates the marker.

## Implementation Plan

### Tasks

- [x] Task 1: Hide Android navigation bar with immersive mode
  - File: `app.json`
  - Action: In the `androidNavigationBar` object, add `"visible": "immersive"`. The `backgroundColor` and `barStyle` can remain as-is (they apply when the bar is temporarily revealed via swipe).
  - Notes: Immersive mode hides the navigation bar; user swipes from the bottom edge to reveal it temporarily, then it auto-hides. Requires a new native build to take effect.

- [x] Task 2: Add fallback icon for unrecognized ATC facility types
  - File: `app/components/vatsimMapView/AirportMarkers.jsx`
  - Action: After the facility type if/else chain (after line 87), add a final fallback: if `image` is still `null`, assign the tower icon (`Platform.OS === 'ios' ? mapIcons.tower32 : mapIcons.tower64`). This ensures every airport marker always has a valid icon.
  - Notes: The tower icon is the most generic ATC representation. This is defense in depth — even if new facility types are added to VATSIM in the future, markers will render with a reasonable icon rather than the red pin.

- [x] Task 3: Stabilize airport marker keys
  - File: `app/components/vatsimMapView/AirportMarkers.jsx`
  - Action: Change the marker key on line 91 from `airport.icao + '_' + lastUpdated` to just `airport.icao`. The ICAO code is unique per airport and stable across data refreshes.
  - Notes: This prevents React from unmounting and remounting the same airport marker every 20 seconds. React will now update the existing marker's props in place, which is more efficient and eliminates the mount-race condition that can produce red pins. Also update the APP circle key on line 46 if it uses a similar unstable pattern.

- [x] Task 4: Add defensive null guard on pilot marker image
  - File: `app/components/vatsimMapView/PilotMarkers.jsx`
  - Action: Add a null check on `pilot.image` before rendering the marker. If `pilot.image` is null/undefined, skip rendering that marker (return `null` from the map callback) or use a default B737 icon from `mapIcons`.
  - Notes: `getAircraftIcon()` already returns B737 as fallback, so this should never trigger. This is purely belt-and-suspenders to prevent any future regression from showing red pins.

### Acceptance Criteria

- [ ] AC 1: Given the app is running on Android, when the user views any screen, then the system navigation bar should be hidden (immersive mode). When the user swipes from the bottom edge, the navigation bar should appear temporarily and then auto-hide.

- [ ] AC 2: Given the app is running with live VATSIM data showing ATC markers, when an airport has ATC with an unrecognized facility type, then the marker should display the tower icon (not the default red Google Maps pin).

- [ ] AC 3: Given the app has been running for several minutes with live data refreshing every 20 seconds, when ATC controllers connect and disconnect from airports, then no markers should degrade to default red Google Maps pins.

- [ ] AC 4: Given the app is displaying pilot markers on the map, when a pilot's image data is null or undefined for any reason, then the marker should either not render or display a default aircraft icon (not the default red Google Maps pin).

- [ ] AC 5: Given the app is running with live data refreshes, when ATC data updates for an airport, then the existing airport marker should update in place (not unmount and remount), verified by stable marker keys using ICAO code only.

## Additional Context

### Dependencies

- No new dependencies required. All fixes use existing APIs and assets.
- `app.json` change requires a new native build (EAS Build or local build) — will not take effect via Expo hot-reload or OTA update.

### Testing Strategy

- **Manual testing (primary):** No test suite is configured in this project.
  1. Build a new preview APK after changes
  2. Install on Samsung S24 (or Android emulator)
  3. Verify navigation bar is blue on all screens
  4. Let the app run for 5+ minutes with live data, monitoring for any red pin markers
  5. Zoom to areas with active ATC to verify all airport markers show custom icons
  6. Watch for marker "flicker" during data refresh cycles — there should be none after key stabilization

### Notes

- The `app.json` navigation bar change requires a new native build — it cannot be verified via Expo Go or hot reload
- The key stabilization (Task 3) is the highest-impact fix — it eliminates the marker churn that amplifies the null image issue
- `tracksViewChanges={Platform.OS === 'android'}` remains correct — Android needs this for marker rotation/updates, but with stable keys the re-render overhead is now on existing markers (cheap) rather than mount/unmount cycles (expensive)
- Future consideration: the APP circle markers (line 46) use `atc.key` which is stable — no changes needed there

## Review Notes
- Adversarial review completed
- Findings: 7 total, 5 fixed, 2 skipped (noise)
- Resolution approach: fix all real findings per user direction
- F1: Key now uses ATC composition suffix instead of just ICAO (fixes iOS staleness)
- F2: Changed from immersive mode to theme-colored nav bar per user preference
- F3: Pilot markers use B737 fallback with console.warn instead of silent filter
- F4: Added console.warn for unknown facility types in fallback
- F5: Added empty array guard on airportAtc entries
- F7: Cleaned up unused MapView import
