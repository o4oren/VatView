# My VATSIM Identity — Design Spec

**Date:** 2026-04-01  
**Status:** Approved

## Overview

Add personal VATSIM identity to VatView: the user can enter their own CID and a list of friends' CIDs in Settings. When online, the user's aircraft marker and friends' markers are rendered in distinct colors. A "center on me" button appears on the map when the user is online, panning to and selecting their aircraft on tap.

---

## 1. State & Persistence

### Redux (`app` slice)

Two new fields in `appReducer.js` default state:

```js
myCid: '',        // string — empty string means "not set"
friendCids: [],   // string[] — list of friend CIDs
```

### Action creators (`appActions.js`)

Two new async thunks, following the `savePollingInterval` pattern:

- `saveMyCid(cid)` — writes to `AsyncStorage` key `MY_CID`, dispatches `MY_CID_CHANGED`
- `saveFriendCids(cids)` — writes JSON array to `AsyncStorage` key `FRIEND_CIDS`, dispatches `FRIEND_CIDS_CHANGED`

### Storage (`storageService.js`)

Two new `AsyncStorage` keys: `MY_CID` (string) and `FRIEND_CIDS` (JSON-serialised `string[]`).

Both loaded in `retrieveSavedState()` and merged into the Redux initial state at startup alongside the existing persisted fields. If absent (first launch), `myCid` defaults to `''` and `friendCids` defaults to `[]`.

---

## 2. Marker Color Logic

### Role classification

New pure helper in `iconsHelper.js`:

```js
getPilotMarkerRole(pilot, myCid, friendCids) // returns 'me' | 'friend' | 'other'
```

- Returns `'me'` if `myCid` is non-empty and `String(pilot.cid) === myCid`
- Returns `'friend'` if `friendCids` includes `String(pilot.cid)`
- Otherwise returns `'other'`

### Role colors

New exported constant in `aircraftIconService.js`:

```js
export const PILOT_ROLE_COLORS = {
  me:     { dark: '#C0C8D0', light: '#E53935' },
  friend: { dark: '#00BFA5', light: '#00BFA5' },
  other:  null,  // null = use theme accent.primary as today
};
```

The active theme (dark/light) is already available via `ThemeProvider`.

### Icon pre-rendering

`aircraftIconService.init(theme)` currently renders one bitmap per aircraft type using `theme.accent.primary`. It will instead render **three passes** — one per role — producing three independent caches:

```
cache.me     — icons rendered in PILOT_ROLE_COLORS.me[themeKey]
cache.friend — icons rendered in PILOT_ROLE_COLORS.friend[themeKey]
cache.other  — icons rendered in theme.accent.primary (unchanged)
```

`themeKey` is `'dark'` if `theme.surface.base === '#0D1117'`, else `'light'` — matching the two values in `themeTokens.js`.

`getMarkerImage(aircraftType, role)` updated to look up the correct cache.

### PilotMarkers changes

- Reads `myCid` and `friendCids` from Redux via `useSelector`
- Calls `getPilotMarkerRole` per pilot to determine role
- Passes the role's pre-rendered image (from `getMarkerImage(type, role)`) to `PilotMarkerItem`
- `pilotMarkerItemPropsEqual` updated to include `pilotRole` in equality check to prevent stale renders

---

## 3. "My VATSIM" Settings Sub-screen

### New screen: `app/components/settings/MyVatsimSettings.jsx`

Content:

1. **My CID field** — `TextInput` with numeric keyboard, label "My VATSIM CID", helper text "Used to highlight your aircraft on the map". On blur/submit dispatches `saveMyCid`. Submitting empty string clears the CID.
2. **Friends list** — `friendCids` from Redux rendered as teal (`#00BFA5`) pills. Each pill has an ✕ button; tapping it removes that CID and dispatches `saveFriendCids(updatedList)`.
3. **Add friend** — `TextInput` (numeric keyboard) + "Add" button. Validates: non-empty, numeric, not already in list. On valid add: appends to list, dispatches `saveFriendCids`, clears input.

### Navigation

The new screen is pushed onto the existing root `Stack.Navigator` (same stack as Event Details, ATC Bookings, Metar). Back navigation is automatic.

### Settings.jsx changes

New tappable row added at the top of the Settings section, above Appearance:

- Label: "My VATSIM"
- Subtitle: "CID & friends list"
- Trailing `›` chevron
- `onPress`: `navigation.navigate('MyVatsimSettings')`

---

## 4. "Center on Me" Map Button

### New component: `app/components/mapOverlay/CenterOnMeButton.jsx`

Behaviour:
- Reads `myCid` from Redux. If empty → renders nothing.
- Reads `pilots` from `vatsimLiveData.clients.pilots`. Finds pilot where `String(pilot.cid) === myCid`. If not found (not online) → renders nothing.
- When visible: circular button, positioned **top-right**, below the stale indicator.
  - `top: insets.top + 16 + 44` (16px top offset matching stale indicator + 36px stale indicator height + 8px gap; use a named constant `STALE_INDICATOR_HEIGHT = 36`)
  - `right: insets.right + 16 + panelOffset`
  - `panelOffset` passed as prop from `MapOverlayGroup`, same as stale indicator already receives
- Icon: `MaterialCommunityIcons` `crosshairs-gps` (already available via `@expo/vector-icons`)
- Styled with `activeTheme.surface.elevated` background and `activeTheme.accent.primary` icon color
- On press:
  1. `dispatch(flyToClient({ latitude: pilot.latitude, longitude: pilot.longitude, delta: 0.35 }))`
  2. `dispatch(clientSelected(pilot))`

### MapOverlayGroup changes

`CenterOnMeButton` added to `MapOverlayGroup.jsx`, receiving `panelOffset` so it respects the landscape side panel.

---

## Files Changed / Created

| File | Change |
|---|---|
| `app/redux/reducers/appReducer.js` | Add `myCid`, `friendCids` fields + two new action cases |
| `app/redux/actions/appActions.js` | Add `saveMyCid`, `saveFriendCids` thunks + action constants |
| `app/common/storageService.js` | Add `MY_CID`, `FRIEND_CIDS` keys; load in `retrieveSavedState` |
| `app/common/iconsHelper.js` | Add `getPilotMarkerRole` helper |
| `app/common/aircraftIconService.js` | Add `PILOT_ROLE_COLORS`; render 3-pass cache; update `getMarkerImage` signature |
| `app/components/vatsimMapView/PilotMarkers.jsx` | Use role-based images; update memo comparator |
| `app/components/settings/Settings.jsx` | Add "My VATSIM" navigation row |
| `app/components/settings/MyVatsimSettings.jsx` | **New** — CID + friends list screen |
| `app/components/mapOverlay/CenterOnMeButton.jsx` | **New** — center-on-me FAB |
| `app/components/mapOverlay/MapOverlayGroup.jsx` | Add `CenterOnMeButton` |
| `app/components/mainApp/MainTabNavigator.jsx` | Register `MyVatsimSettings` in Stack.Navigator |
