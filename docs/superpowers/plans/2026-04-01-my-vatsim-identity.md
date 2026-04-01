# My VATSIM Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a personal VATSIM identity feature — user's own CID and friends list stored in Redux/AsyncStorage, pilot markers colored by role (me/friend/other), and a "center on me" button on the map.

**Architecture:** Two new fields (`myCid`, `friendCids`) added to the existing `app` Redux slice, persisted to AsyncStorage following the `savePollingInterval` pattern. Aircraft icon service extended to pre-render three role-colored bitmap caches. New settings sub-screen for CID/friends management, and a new map overlay button that centers on the user's aircraft when online.

**Tech Stack:** React Native (Expo), Redux, AsyncStorage, `aircraftIconService` (Skia SVG→PNG), `react-native-maps` Marker, `@expo/vector-icons` MaterialCommunityIcons, Jest + react-test-renderer

---

## File Map

| File | Change |
|---|---|
| `app/redux/reducers/appReducer.js` | Add `myCid`, `friendCids` defaults + two new action cases |
| `app/redux/actions/appActions.js` | Add `saveMyCid`, `saveFriendCids` thunks + action constants |
| `app/common/storageService.js` | Add `MY_CID` / `FRIEND_CIDS` keys; load in `retrieveSavedState` |
| `app/common/iconsHelper.js` | Add `getPilotMarkerRole` helper |
| `app/common/aircraftIconService.js` | Add `PILOT_ROLE_COLORS`; 3-pass cache render; update `getMarkerImage(type, role)` |
| `app/components/vatsimMapView/PilotMarkers.jsx` | Role-based images; update memo comparator |
| `app/components/settings/Settings.jsx` | Add "My VATSIM" nav row |
| `app/components/settings/MyVatsimSettings.jsx` | **New** — CID + friends list screen |
| `app/components/mapOverlay/CenterOnMeButton.jsx` | **New** — center-on-me button |
| `app/components/mapOverlay/MapOverlayGroup.jsx` | Add `CenterOnMeButton` |
| `app/components/mainApp/MainApp.jsx` | Register `MyVatsimSettings` in Stack.Navigator |
| `__tests__/iconsHelper.test.js` | Add `getPilotMarkerRole` tests |
| `__tests__/aircraftIconService.test.js` | Add role cache + `getMarkerImage(type, role)` tests |
| `__tests__/PilotMarkers.test.js` | Add role-coloring + memo comparator tests |
| `__tests__/Settings.test.js` | Add "My VATSIM" row test |
| `__tests__/MyVatsimSettings.test.js` | **New** — full settings screen tests |
| `__tests__/CenterOnMeButton.test.js` | **New** — button visibility + press tests |
| `__tests__/MapOverlayGroup.test.js` | Add `CenterOnMeButton` presence tests |

---

## Task 1: Redux state + persistence for myCid and friendCids

**Files:**
- Modify: `app/redux/reducers/appReducer.js`
- Modify: `app/redux/actions/appActions.js`
- Modify: `app/common/storageService.js`

- [ ] **Step 1: Add storage helpers to storageService.js**

In `app/common/storageService.js`, add after the `POLLING_INTERVAL` constant block:

```js
const MY_CID = 'MY_CID';
const FRIEND_CIDS = 'FRIEND_CIDS';

export const storeMyCid = async (cid) => {
    try {
        await AsyncStorage.setItem(MY_CID, cid);
    } catch (err) {
        console.log('Error storing myCid', err);
    }
};

export const storeFriendCids = async (cids) => {
    try {
        await AsyncStorage.setItem(FRIEND_CIDS, JSON.stringify(cids));
    } catch (err) {
        console.log('Error storing friendCids', err);
    }
};
```

Then in `retrieveSavedState()`, add before the final `return retrievedData;`:

```js
try {
    const myCid = await AsyncStorage.getItem(MY_CID);
    retrievedData.myCid = myCid !== null ? myCid : '';
} catch (err) {
    console.log('Error retrieving myCid', err);
    retrievedData.myCid = '';
}

try {
    const friendCids = await AsyncStorage.getItem(FRIEND_CIDS);
    retrievedData.friendCids = friendCids !== null ? JSON.parse(friendCids) : [];
} catch (err) {
    console.log('Error retrieving friendCids', err);
    retrievedData.friendCids = [];
}
```

- [ ] **Step 2: Add action constants and thunks to appActions.js**

In `app/redux/actions/appActions.js`, add after the `POLLING_INTERVAL_CHANGED` constant:

```js
export const MY_CID_CHANGED = 'MY_CID_CHANGED';
export const FRIEND_CIDS_CHANGED = 'FRIEND_CIDS_CHANGED';
```

Add these imports at the top alongside existing storage imports:
```js
import {
    storeAirportsLoaded,
    storeFirBoundariesLoaded,
    storeInitialRegion,
    storePollingInterval,
    storeMyCid,
    storeFriendCids,
} from '../../common/storageService';
```

Add these action creators and thunks before the `export default` block:

```js
const myCidChanged = (cid) => ({
    type: MY_CID_CHANGED,
    payload: cid,
});

const friendCidsChanged = (cids) => ({
    type: FRIEND_CIDS_CHANGED,
    payload: cids,
});

export const saveMyCid = (cid) => async (dispatch) => {
    await storeMyCid(cid);
    dispatch(myCidChanged(cid));
};

export const saveFriendCids = (cids) => async (dispatch) => {
    await storeFriendCids(cids);
    dispatch(friendCidsChanged(cids));
};
```

Add to the `export default` object:
```js
saveMyCid: saveMyCid,
saveFriendCids: saveFriendCids,
```

- [ ] **Step 3: Add fields and cases to appReducer.js**

In `app/redux/reducers/appReducer.js`, add to the imports at the top:
```js
import {
    CLIENT_SELECTED, REGION_UPDATED, AIRPORT_SELECTED,
    ATC_FILTER_CLICKED, PILOTS_FILTER_CLICKED, SEARCH_QUERY_CHANGED, LOADING_DB, AIRPORTS_LOADED, FIR_BOUNDARIES_LOADED,
    FLY_TO_CLIENT, FLY_TO_CONSUMED, POLLING_INTERVAL_CHANGED, MY_CID_CHANGED, FRIEND_CIDS_CHANGED,
} from '../actions/appActions';
```

Add `myCid: ''` and `friendCids: []` to the default state object:

```js
const appReducer = (state = {
    firBoundariesLoaded: false,
    airportsLoaded: false,
    loadingDb: { airports: 0, firs: 0 },
    initialRegion: {},
    selectedClient: undefined,
    selectedAirport: undefined,
    pendingFlyTo: null,
    pollingInterval: 60000,
    myCid: '',
    friendCids: [],
    filters: {pilots: true, atc: true, searchQuery: ''}
}, action) => {
```

Add two new cases before `default:`:

```js
case MY_CID_CHANGED:
    return {...state, myCid: action.payload};
case FRIEND_CIDS_CHANGED:
    return {...state, friendCids: action.payload};
```

- [ ] **Step 4: Wire myCid and friendCids into the preloaded state in App.js**

In `App.js`, the `preloadedState.app` object is built manually. Add `myCid` and `friendCids` to it so the persisted values are loaded at startup:

```js
const preloadedState = {
    app: {
        initialRegion: state.savedState.initialRegion != null ? state.savedState.initialRegion.region : INITIAL_REGION,
        selectedAirport: state.savedState.selectedAirport != null ? state.savedState.selectedAirport : null,
        filters: {pilots: true, atc: true, searchQuery: ''},
        airportsLoaded: state.savedState.airportsLoaded || false,
        firBoundariesLoaded: (state.savedState.firGeoJson && state.savedState.traconBoundaries)
            ? (state.savedState.firBoundariesLoaded || false)
            : false,
        loadingDb: { airports: 0, firs: 0 },
        pollingInterval: state.pollingInterval || 60000,
        myCid: state.savedState.myCid || '',
        friendCids: state.savedState.friendCids || [],
    },
    // ... rest unchanged
};
```

- [ ] **Step 5: Verify the app still starts (smoke check)**

Run: `npm run lint`
Expected: no new errors

- [ ] **Step 6: Commit**

```bash
git add app/redux/reducers/appReducer.js app/redux/actions/appActions.js app/common/storageService.js App.js
git commit -m "feat: add myCid and friendCids to app Redux slice with AsyncStorage persistence"
```

---

## Task 2: getPilotMarkerRole helper + tests

**Files:**
- Modify: `app/common/iconsHelper.js`
- Modify: `__tests__/iconsHelper.test.js`

- [ ] **Step 1: Write the failing tests**

Add to `__tests__/iconsHelper.test.js`:

```js
import { getPilotMarkerRole } from '../app/common/iconsHelper';

describe('getPilotMarkerRole', () => {
    const makePilot = (cid) => ({ cid });

    it('returns "me" when myCid matches pilot cid', () => {
        expect(getPilotMarkerRole(makePilot(1234567), '1234567', [])).toBe('me');
    });

    it('returns "me" when pilot cid is a number matching string myCid', () => {
        expect(getPilotMarkerRole(makePilot(999), '999', [])).toBe('me');
    });

    it('returns "friend" when pilot cid is in friendCids', () => {
        expect(getPilotMarkerRole(makePilot(555), '', ['555', '666'])).toBe('friend');
    });

    it('returns "other" when pilot matches neither', () => {
        expect(getPilotMarkerRole(makePilot(111), '999', ['555'])).toBe('other');
    });

    it('returns "other" when myCid is empty string', () => {
        expect(getPilotMarkerRole(makePilot(999), '', [])).toBe('other');
    });

    it('"me" takes priority over "friend" if same CID in both', () => {
        expect(getPilotMarkerRole(makePilot(111), '111', ['111'])).toBe('me');
    });

    it('returns "other" when friendCids is empty and myCid does not match', () => {
        expect(getPilotMarkerRole(makePilot(123), '456', [])).toBe('other');
    });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npx jest __tests__/iconsHelper.test.js --no-coverage 2>&1 | tail -20`
Expected: FAIL — `getPilotMarkerRole is not a function`

- [ ] **Step 3: Implement getPilotMarkerRole in iconsHelper.js**

Add to `app/common/iconsHelper.js` after the `getAtcIcon` function:

```js
export const getPilotMarkerRole = (pilot, myCid, friendCids) => {
    const cidStr = String(pilot.cid);
    if (myCid && cidStr === myCid) return 'me';
    if (friendCids.includes(cidStr)) return 'friend';
    return 'other';
};
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npx jest __tests__/iconsHelper.test.js --no-coverage 2>&1 | tail -20`
Expected: PASS — all 7 tests green

- [ ] **Step 5: Commit**

```bash
git add app/common/iconsHelper.js __tests__/iconsHelper.test.js
git commit -m "feat: add getPilotMarkerRole helper to iconsHelper"
```

---

## Task 3: aircraftIconService 3-pass role cache + tests

**Files:**
- Modify: `app/common/aircraftIconService.js`
- Modify: `__tests__/aircraftIconService.test.js`

- [ ] **Step 1: Write the failing tests**

Add to `__tests__/aircraftIconService.test.js`:

```js
import { PILOT_ROLE_COLORS } from '../app/common/aircraftIconService';

describe('PILOT_ROLE_COLORS', () => {
    it('exports me colors for dark and light', () => {
        expect(PILOT_ROLE_COLORS.me.dark).toBe('#C0C8D0');
        expect(PILOT_ROLE_COLORS.me.light).toBe('#E53935');
    });

    it('exports friend colors for dark and light', () => {
        expect(PILOT_ROLE_COLORS.friend.dark).toBe('#00BFA5');
        expect(PILOT_ROLE_COLORS.friend.light).toBe('#00BFA5');
    });

    it('exports null for other (uses theme accent)', () => {
        expect(PILOT_ROLE_COLORS.other).toBeNull();
    });
});

describe('getMarkerImage with role', () => {
    const darkTheme = { accent: { primary: '#5BA0E6' }, surface: { base: '#0D1117' } };
    const lightTheme = { accent: { primary: '#2A6BC4' }, surface: { base: '#FFFFFF' } };

    it('returns a valid entry for role "me" on dark theme', async () => {
        await init(darkTheme);
        const result = getMarkerImage('B738', 'me');
        expect(result).not.toBeNull();
        expect(result.image.uri).toBeDefined();
        expect(result.sizeDp).toBeGreaterThan(0);
    });

    it('returns a valid entry for role "friend" on dark theme', async () => {
        await init(darkTheme);
        const result = getMarkerImage('B738', 'friend');
        expect(result).not.toBeNull();
        expect(result.image.uri).toBeDefined();
    });

    it('returns a valid entry for role "other" on dark theme', async () => {
        await init(darkTheme);
        const result = getMarkerImage('B738', 'other');
        expect(result).not.toBeNull();
        expect(result.image.uri).toBeDefined();
    });

    it('returns a valid entry for role "me" on light theme', async () => {
        await init(lightTheme);
        const result = getMarkerImage('B738', 'me');
        expect(result).not.toBeNull();
    });

    it('falls back to "other" cache when role is undefined', async () => {
        await init(darkTheme);
        const withRole = getMarkerImage('B738', 'other');
        const withoutRole = getMarkerImage('B738', undefined);
        expect(withoutRole.sizeDp).toBe(withRole.sizeDp);
    });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npx jest __tests__/aircraftIconService.test.js --no-coverage 2>&1 | tail -20`
Expected: FAIL — `PILOT_ROLE_COLORS is not defined` and `getMarkerImage` tests fail

- [ ] **Step 3: Update aircraftIconService.js**

Replace the cache variables and `init`/`getMarkerImage` in `app/common/aircraftIconService.js`.

Add after the `cacheDir` declaration:

```js
export const PILOT_ROLE_COLORS = {
    me:     { dark: '#C0C8D0', light: '#E53935' },
    friend: { dark: '#00BFA5', light: '#00BFA5' },
    other:  null,
};
```

Replace the existing cache variable:
```js
// Before:
let cache = {};
let currentAccentColor = null;

// After:
let caches = { me: {}, friend: {}, other: {} };
let currentAccentColor = null;
```

Replace the `init` function:

```js
export const init = async (theme) => {
    const accentColor = theme.accent.primary;
    const themeKey = theme.surface.base === '#0D1117' ? 'dark' : 'light';

    if (cacheDir.exists) {
        cacheDir.delete();
    }
    cacheDir.create({ intermediates: true });

    const svgSources = await loadSvgSources();
    const newCaches = { me: {}, friend: {}, other: {} };

    const roleColors = {
        me: PILOT_ROLE_COLORS.me[themeKey],
        friend: PILOT_ROLE_COLORS.friend[themeKey],
        other: accentColor,
    };

    for (const role of ['me', 'friend', 'other']) {
        const fillColor = roleColors[role];
        for (const [iconKey, svgXml] of Object.entries(svgSources)) {
            const typeInfo = AIRCRAFT_TYPES[iconKey];
            const targetDp = getTargetDp(typeInfo.scale);
            const renderPx = Math.round(targetDp * pixelRatio);
            const filename = `${role}-${iconKey}.png`;
            newCaches[role][iconKey] = {
                image: renderSvgToBitmap(svgXml, fillColor, renderPx, renderPx, filename),
                sizeDp: targetDp,
            };
        }
    }

    caches = newCaches;
    currentAccentColor = accentColor;
};
```

Replace `getMarkerImage`:

```js
export const getMarkerImage = (aircraftType, role = 'other') => {
    const { iconKey } = resolveIconKey(aircraftType);
    const roleCache = caches[role] || caches.other;
    return roleCache[iconKey] || null;
};
```

Update `isInitialized`:

```js
export const isInitialized = () => Object.keys(caches.other).length > 0;
```

- [ ] **Step 4: Fix existing test that checks cache count**

In `__tests__/aircraftIconService.test.js`, find the test:
```js
it('populates cache and getMarkerImage returns valid entry after init', async () => {
```

Update the `getMarkerImage` call inside it (it currently calls `getMarkerImage(iconKey)` without role — update to `getMarkerImage(iconKey, 'other')` and update the theme object to include `surface`:

```js
const lightTheme = { accent: { primary: '#2A6BC4' }, surface: { base: '#FFFFFF' } };
const darkTheme = { accent: { primary: '#3B7DD8' }, surface: { base: '#0D1117' } };
```

Also update the `iconsHelper.test.js` `beforeAll` theme:
```js
const lightTheme = { accent: { primary: '#2A6BC4' }, surface: { base: '#FFFFFF' } };
```

- [ ] **Step 5: Run all aircraft icon tests**

Run: `npx jest __tests__/aircraftIconService.test.js __tests__/iconsHelper.test.js --no-coverage 2>&1 | tail -30`
Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add app/common/aircraftIconService.js __tests__/aircraftIconService.test.js __tests__/iconsHelper.test.js
git commit -m "feat: add 3-pass role-colored icon cache to aircraftIconService"
```

---

## Task 4: PilotMarkers role-based rendering + tests

**Files:**
- Modify: `app/components/vatsimMapView/PilotMarkers.jsx`
- Modify: `__tests__/PilotMarkers.test.js`

- [ ] **Step 1: Write the failing tests**

Add to `__tests__/PilotMarkers.test.js`. First update `makeStore` to include identity fields:

```js
const makeStore = (pilots = [], selectedClient = null, myCid = '', friendCids = []) => {
    return createStore(() => ({
        app: { selectedClient, myCid, friendCids },
        vatsimLiveData: { clients: { pilots } },
    }));
};
```

Update `renderMarkers` signature:
```js
const renderMarkers = (pilots, zoomLevel = AIRPORT_ZOOM, selectedClient = null, myCid = '', friendCids = []) => {
    const store = makeStore(pilots, selectedClient, myCid, friendCids);
    // ... rest unchanged
};
```

Add new test suite:

```js
describe('PilotMarkers role coloring', () => {
    it('renders marker for "me" pilot when myCid matches', () => {
        const pilot = makePilot({ key: 'p1', callsign: 'ME001', cid: 1234567 });
        const markers = renderMarkers([pilot], AIRPORT_ZOOM, null, '1234567', []);
        expect(markers).toHaveLength(1);
    });

    it('renders marker for friend pilot when cid in friendCids', () => {
        const pilot = makePilot({ key: 'p1', callsign: 'FRD001', cid: 9999999 });
        const markers = renderMarkers([pilot], AIRPORT_ZOOM, null, '', ['9999999']);
        expect(markers).toHaveLength(1);
    });

    it('renders marker for other pilot when not me or friend', () => {
        const pilot = makePilot({ key: 'p1', callsign: 'OTH001', cid: 1111111 });
        const markers = renderMarkers([pilot], AIRPORT_ZOOM, null, '9999999', ['2222222']);
        expect(markers).toHaveLength(1);
    });
});

describe('PilotMarkerItem memo with pilotRole', () => {
    it('returns false when pilotRole changes', () => {
        const pilot = makePilot();
        const onPress = jest.fn();
        const base = { pilot, pilotImage: pilot.image, pilotImageSize: pilot.imageSize, onPress, pilotRole: 'other' };
        expect(pilotMarkerItemPropsEqual(
            { ...base, pilotRole: 'other' },
            { ...base, pilotRole: 'me' }
        )).toBe(false);
    });

    it('returns true when pilotRole is same', () => {
        const pilot = makePilot();
        const onPress = jest.fn();
        const base = { pilot, pilotImage: pilot.image, pilotImageSize: pilot.imageSize, onPress, pilotRole: 'friend' };
        expect(pilotMarkerItemPropsEqual(base, base)).toBe(true);
    });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npx jest __tests__/PilotMarkers.test.js --no-coverage 2>&1 | tail -20`
Expected: FAIL — makeStore doesn't pass myCid/friendCids and memo comparator doesn't check pilotRole

- [ ] **Step 3: Update PilotMarkers.jsx**

In `app/components/vatsimMapView/PilotMarkers.jsx`:

Add `getPilotMarkerRole` to the import from iconsHelper:
```js
import {mapIcons, getAircraftIcon, getPilotMarkerRole} from '../../common/iconsHelper';
```

Wait — `getAircraftIcon` is not currently imported in PilotMarkers. The correct import is:
```js
import {mapIcons, getPilotMarkerRole} from '../../common/iconsHelper';
```

Update `pilotMarkerItemPropsEqual` to include `pilotRole`:
```js
export const pilotMarkerItemPropsEqual = (prev, next) =>
    prev.pilot.key === next.pilot.key &&
    prev.pilot.latitude === next.pilot.latitude &&
    prev.pilot.longitude === next.pilot.longitude &&
    prev.pilot.heading === next.pilot.heading &&
    prev.pilotImage === next.pilotImage &&
    prev.pilotRole === next.pilotRole &&
    prev.onPress === next.onPress;
```

Update `PilotMarkerItem` to accept `pilotRole` prop (it doesn't use it directly — the image is already role-correct — but it's needed in the memo comparator):
```js
const PilotMarkerItem = React.memo(({pilot, pilotImage, pilotImageSize, onPress, pilotRole: _pilotRole}) => {
```

Update `PilotMarkers` to read identity from Redux and pass role-based images:
```js
const PilotMarkers = React.memo(function PilotMarkers({zoomLevel}) {
    const selectedClient = useSelector(state => state.app.selectedClient);
    const pilots = useSelector(state => state.vatsimLiveData.clients.pilots);
    const myCid = useSelector(state => state.app.myCid);
    const friendCids = useSelector(state => state.app.friendCids);

    const dispatch = useDispatch();
    const selectedClientRef = useRef(selectedClient);
    useEffect(() => {
        selectedClientRef.current = selectedClient;
    }, [selectedClient]);
    const onPress = useCallback((pilot) => {
        if(selectedClientRef.current && pilot.callsign == selectedClientRef.current.callsign) {
            dispatch(allActions.appActions.clientSelected(null));
        } else {
            markNewSelection();
            dispatch(allActions.appActions.clientSelected(pilot));
        }
    }, [dispatch]);

    const zoomBand = getZoomBand(zoomLevel);

    return pilots
        .filter(pilot => {
            const groundspeed = Number(pilot.groundspeed);
            const hasValidGroundspeed = Number.isFinite(groundspeed);
            return (
                zoomBand === 'airport' ||
                pilot.callsign === selectedClient?.callsign ||
                !hasValidGroundspeed ||
                groundspeed > GROUND_SPEED_THRESHOLD
            );
        })
        .map(pilot => {
            const role = getPilotMarkerRole(pilot, myCid, friendCids);
            const entry = getMarkerImage(pilot.flight_plan?.aircraft || null, role);
            const pilotImage = entry ? entry.image : (pilot.image || mapIcons.B737);
            const pilotImageSize = entry ? entry.sizeDp : (pilot.image ? pilot.imageSize : defaultImageSize);

            const markerKey = isAndroid
                ? `${pilot.key}_${coordKey(pilot.latitude, pilot.longitude)}`
                : pilot.key;

            return <PilotMarkerItem
                key={markerKey}
                pilot={pilot}
                pilotImage={pilotImage}
                pilotImageSize={pilotImageSize}
                pilotRole={role}
                onPress={onPress}
            />;
        });
});
```

Also add `getMarkerImage` import at the top of the file:
```js
import {mapIcons, getPilotMarkerRole} from '../../common/iconsHelper';
import {getMarkerImage} from '../../common/aircraftIconService';
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npx jest __tests__/PilotMarkers.test.js --no-coverage 2>&1 | tail -30`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/vatsimMapView/PilotMarkers.jsx __tests__/PilotMarkers.test.js
git commit -m "feat: role-based pilot marker colors in PilotMarkers"
```

---

## Task 5: MyVatsimSettings screen + navigation

**Files:**
- Create: `app/components/settings/MyVatsimSettings.jsx`
- Modify: `app/components/settings/Settings.jsx`
- Modify: `app/components/mainApp/MainApp.jsx`
- Create: `__tests__/MyVatsimSettings.test.js`
- Modify: `__tests__/Settings.test.js`

- [ ] **Step 1: Write the failing Settings test**

In `__tests__/Settings.test.js`, update the `useSelector` mock to include `myCid` and `friendCids`, and update the `useDispatch` mock, and add a navigation mock. Replace the top mock section to add:

```js
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        vatsimLiveData: {
            clients: {pilots: [{callsign: 'TEST123'}], controllerCount: 3},
            servers: [{name: 'USA-EAST', location: 'New York', hostname_or_ip: '192.0.2.1'}],
        },
        app: { pollingInterval: 60000, myCid: '', friendCids: [] },
    })),
    useDispatch: jest.fn(() => jest.fn()),
}));
```

Add a new test at the bottom of the `describe('Settings')` block:

```js
test('renders "My VATSIM" row that navigates to MyVatsimSettings', async () => {
    const tree = await renderSettings();
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('My VATSIM');
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npx jest __tests__/Settings.test.js --no-coverage 2>&1 | tail -20`
Expected: FAIL — "My VATSIM" not in output

- [ ] **Step 3: Create MyVatsimSettings.jsx**

Create `app/components/settings/MyVatsimSettings.jsx`:

```jsx
import React, {useState} from 'react';
import {View, ScrollView, TextInput, Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {useTheme} from '../../common/ThemeProvider';
import ThemedText from '../shared/ThemedText';
import {tokens} from '../../common/themeTokens';
import allActions from '../../redux/actions';

const MyVatsimSettings = () => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const {activeTheme} = useTheme();
    const myCid = useSelector(state => state.app.myCid);
    const friendCids = useSelector(state => state.app.friendCids);
    const [cidInput, setCidInput] = useState(myCid);
    const [friendInput, setFriendInput] = useState('');

    const handleCidBlur = () => {
        dispatch(allActions.appActions.saveMyCid(cidInput.trim()));
    };

    const handleAddFriend = () => {
        const val = friendInput.trim();
        if (!val || !/^\d+$/.test(val) || friendCids.includes(val)) return;
        dispatch(allActions.appActions.saveFriendCids([...friendCids, val]));
        setFriendInput('');
    };

    const handleRemoveFriend = (cid) => {
        dispatch(allActions.appActions.saveFriendCids(friendCids.filter(c => c !== cid)));
    };

    return (
        <View style={[styles.container, {backgroundColor: activeTheme.surface.base}]}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, {paddingTop: insets.top + 12}]}
                keyboardShouldPersistTaps="handled"
            >
                <ThemedText variant="heading" style={styles.sectionHeader}>My VATSIM</ThemedText>

                <ThemedText variant="body-sm" color={activeTheme.text.secondary} style={styles.label}>
                    My VATSIM CID
                </ThemedText>
                <TextInput
                    style={[styles.input, {
                        borderColor: activeTheme.surface.border,
                        color: activeTheme.text.primary,
                        backgroundColor: activeTheme.surface.elevated,
                    }]}
                    value={cidInput}
                    onChangeText={setCidInput}
                    onBlur={handleCidBlur}
                    onSubmitEditing={handleCidBlur}
                    keyboardType="numeric"
                    placeholder="e.g. 1234567"
                    placeholderTextColor={activeTheme.text.muted}
                    returnKeyType="done"
                    testID="cid-input"
                />
                <ThemedText variant="caption" color={activeTheme.text.muted} style={styles.hint}>
                    Used to highlight your aircraft on the map
                </ThemedText>

                <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

                <ThemedText variant="body-sm" color={activeTheme.text.secondary} style={styles.label}>
                    Friends' CIDs
                </ThemedText>

                {friendCids.map(cid => (
                    <View key={cid} style={styles.pillRow}>
                        <View style={styles.pill}>
                            <ThemedText variant="body-sm" color="#00BFA5">{cid}</ThemedText>
                        </View>
                        <Pressable
                            onPress={() => handleRemoveFriend(cid)}
                            accessibilityLabel={`Remove friend ${cid}`}
                            testID={`remove-friend-${cid}`}
                        >
                            <ThemedText variant="body-sm" color={activeTheme.text.secondary} style={styles.removeBtn}>✕</ThemedText>
                        </Pressable>
                    </View>
                ))}

                <View style={styles.addRow}>
                    <TextInput
                        style={[styles.addInput, {
                            borderColor: activeTheme.surface.border,
                            color: activeTheme.text.primary,
                            backgroundColor: activeTheme.surface.elevated,
                        }]}
                        value={friendInput}
                        onChangeText={setFriendInput}
                        keyboardType="numeric"
                        placeholder="Add CID"
                        placeholderTextColor={activeTheme.text.muted}
                        returnKeyType="done"
                        onSubmitEditing={handleAddFriend}
                        testID="friend-input"
                    />
                    <Pressable
                        onPress={handleAddFriend}
                        style={[styles.addBtn, {borderColor: activeTheme.accent.primary}]}
                        testID="add-friend-btn"
                    >
                        <ThemedText variant="body-sm" color={activeTheme.accent.primary}>Add</ThemedText>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
    sectionHeader: { marginBottom: 16 },
    label: { marginBottom: 8 },
    hint: { marginTop: 4, marginBottom: 12 },
    input: {
        borderWidth: 1,
        borderRadius: tokens.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
    },
    divider: { height: 1, marginVertical: 16 },
    pillRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
    pill: {
        borderWidth: 1,
        borderColor: '#00BFA5',
        borderRadius: tokens.radius.xl,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    removeBtn: { paddingHorizontal: 4 },
    addRow: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center' },
    addInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: tokens.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
    },
    addBtn: {
        borderWidth: 1.5,
        borderRadius: tokens.radius.md,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
});

export default MyVatsimSettings;
```

- [ ] **Step 4: Update Settings.jsx to add the My VATSIM row**

In `app/components/settings/Settings.jsx`, add `useNavigation` import:
```js
import {useNavigation} from '@react-navigation/native';
```

Inside the `Settings` component, add:
```js
const navigation = useNavigation();
```

Add this block inside the ScrollView, right after the `<ThemedText variant="heading" style={styles.sectionHeader}>Settings</ThemedText>` line, before the Appearance label:

```jsx
<Pressable
    onPress={() => navigation.navigate('MyVatsimSettings')}
    accessibilityRole="button"
    accessibilityLabel="My VATSIM settings"
    style={[styles.navRow, {borderColor: activeTheme.surface.border}]}
>
    <View style={styles.navRowContent}>
        <ThemedText variant="body">My VATSIM</ThemedText>
        <ThemedText variant="caption" color={activeTheme.text.secondary}>CID &amp; friends list</ThemedText>
    </View>
    <ThemedText variant="body" color={activeTheme.text.secondary}>›</ThemedText>
</Pressable>
```

Add to `styles`:
```js
navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
},
navRowContent: {
    flex: 1,
    gap: 2,
},
```

- [ ] **Step 5: Register MyVatsimSettings in MainApp.jsx**

In `app/components/mainApp/MainApp.jsx`, add import:
```js
import MyVatsimSettings from '../settings/MyVatsimSettings';
```

Add a new Stack.Screen inside the Stack.Navigator, after the Metar screen:
```jsx
<Stack.Screen
    name="MyVatsimSettings"
    component={MyVatsimSettings}
/>
```

- [ ] **Step 6: Write MyVatsimSettings tests**

Create `__tests__/MyVatsimSettings.test.js`:

```js
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        activeTheme: {
            text: {primary: '#E6EDF3', secondary: '#8B949E', muted: '#484F58'},
            surface: {base: '#0D1117', elevated: 'rgba(22,27,34,0.45)', border: 'rgba(255,255,255,0.08)'},
            accent: {primary: '#5BA0E6'},
        },
    }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({top: 44, bottom: 34, left: 0, right: 0}),
}));

jest.mock('../app/common/themeTokens', () => ({
    tokens: {
        radius: {md: 12, lg: 16, xl: 24},
        animation: {duration: {fast: 100, normal: 250}},
    },
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
    const actual = jest.requireActual('react-redux');
    return {
        ...actual,
        useDispatch: () => mockDispatch,
    };
});

import MyVatsimSettings from '../app/components/settings/MyVatsimSettings';

const makeStore = (myCid = '', friendCids = []) =>
    createStore(() => ({app: {myCid, friendCids}}));

const renderScreen = (myCid = '', friendCids = []) => {
    const store = makeStore(myCid, friendCids);
    let tree;
    act(() => {
        tree = renderer.create(
            <Provider store={store}>
                <MyVatsimSettings />
            </Provider>
        );
    });
    return tree;
};

afterEach(() => jest.clearAllMocks());

describe('MyVatsimSettings', () => {
    it('renders without crashing', () => {
        const tree = renderScreen();
        expect(tree.toJSON()).not.toBeNull();
    });

    it('renders CID input pre-filled with myCid from Redux', () => {
        const tree = renderScreen('1234567', []);
        const input = tree.root.find(n => n.props.testID === 'cid-input');
        expect(input.props.value).toBe('1234567');
    });

    it('renders friend pills for each friendCid', () => {
        const tree = renderScreen('', ['9876543', '1122334']);
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('9876543');
        expect(json).toContain('1122334');
    });

    it('renders remove buttons for each friend', () => {
        const tree = renderScreen('', ['9876543']);
        const removeBtn = tree.root.find(n => n.props.testID === 'remove-friend-9876543');
        expect(removeBtn).toBeTruthy();
    });

    it('pressing remove friend dispatches saveFriendCids without that CID', () => {
        const tree = renderScreen('', ['9876543', '1122334']);
        const removeBtn = tree.root.find(n => n.props.testID === 'remove-friend-9876543');
        act(() => { removeBtn.props.onPress(); });
        expect(mockDispatch).toHaveBeenCalled();
    });

    it('add button dispatches saveFriendCids with new CID', () => {
        const tree = renderScreen('', []);
        const friendInput = tree.root.find(n => n.props.testID === 'friend-input');
        const addBtn = tree.root.find(n => n.props.testID === 'add-friend-btn');
        act(() => { friendInput.props.onChangeText('5566778'); });
        act(() => { addBtn.props.onPress(); });
        expect(mockDispatch).toHaveBeenCalled();
    });

    it('add button does not dispatch for non-numeric input', () => {
        const tree = renderScreen('', []);
        const friendInput = tree.root.find(n => n.props.testID === 'friend-input');
        const addBtn = tree.root.find(n => n.props.testID === 'add-friend-btn');
        act(() => { friendInput.props.onChangeText('notacid'); });
        act(() => { addBtn.props.onPress(); });
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('add button does not dispatch for duplicate CID', () => {
        const tree = renderScreen('', ['9876543']);
        const friendInput = tree.root.find(n => n.props.testID === 'friend-input');
        const addBtn = tree.root.find(n => n.props.testID === 'add-friend-btn');
        act(() => { friendInput.props.onChangeText('9876543'); });
        act(() => { addBtn.props.onPress(); });
        expect(mockDispatch).not.toHaveBeenCalled();
    });
});
```

- [ ] **Step 7: Run all settings tests**

Run: `npx jest __tests__/Settings.test.js __tests__/MyVatsimSettings.test.js --no-coverage 2>&1 | tail -30`
Expected: all tests PASS

- [ ] **Step 8: Commit**

```bash
git add app/components/settings/MyVatsimSettings.jsx app/components/settings/Settings.jsx app/components/mainApp/MainApp.jsx __tests__/MyVatsimSettings.test.js __tests__/Settings.test.js
git commit -m "feat: add My VATSIM settings sub-screen with CID and friends list"
```

---

## Task 6: CenterOnMeButton component + MapOverlayGroup integration

**Files:**
- Create: `app/components/mapOverlay/CenterOnMeButton.jsx`
- Modify: `app/components/mapOverlay/MapOverlayGroup.jsx`
- Create: `__tests__/CenterOnMeButton.test.js`
- Modify: `__tests__/MapOverlayGroup.test.js`

- [ ] **Step 1: Write the failing CenterOnMeButton tests**

Create `__tests__/CenterOnMeButton.test.js`:

```js
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        activeTheme: {
            surface: {elevated: 'rgba(22,27,34,0.45)'},
            accent: {primary: '#5BA0E6'},
        },
    }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({top: 44, bottom: 34, left: 0, right: 0}),
}));

jest.mock('@expo/vector-icons', () => ({
    MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
    const actual = jest.requireActual('react-redux');
    return { ...actual, useDispatch: () => mockDispatch };
});

const makeStore = (myCid, pilots) =>
    createStore(() => ({
        app: {myCid},
        vatsimLiveData: {clients: {pilots}},
    }));

const makePilot = (cid) => ({
    cid,
    callsign: `TEST${cid}`,
    latitude: 51.5,
    longitude: -0.1,
    key: `pilot-${cid}`,
    heading: 0,
    groundspeed: 450,
    flight_plan: {},
});

import CenterOnMeButton from '../app/components/mapOverlay/CenterOnMeButton';

const render = (myCid, pilots, panelOffset = 0) => {
    const store = makeStore(myCid, pilots);
    let tree;
    act(() => {
        tree = renderer.create(
            <Provider store={store}>
                <CenterOnMeButton panelOffset={panelOffset} />
            </Provider>
        );
    });
    return tree;
};

afterEach(() => jest.clearAllMocks());

describe('CenterOnMeButton', () => {
    it('renders nothing when myCid is empty', () => {
        const tree = render('', [makePilot(1234567)]);
        expect(tree.toJSON()).toBeNull();
    });

    it('renders nothing when myCid is set but pilot not online', () => {
        const tree = render('1234567', [makePilot(9999999)]);
        expect(tree.toJSON()).toBeNull();
    });

    it('renders button when myCid matches an online pilot', () => {
        const tree = render('1234567', [makePilot(1234567)]);
        expect(tree.toJSON()).not.toBeNull();
    });

    it('dispatches flyToClient and clientSelected on press', () => {
        const pilot = makePilot(1234567);
        const tree = render('1234567', [pilot]);
        const btn = tree.root.find(n => n.props.testID === 'center-on-me-btn');
        act(() => { btn.props.onPress(); });
        expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npx jest __tests__/CenterOnMeButton.test.js --no-coverage 2>&1 | tail -20`
Expected: FAIL — module not found

- [ ] **Step 3: Create CenterOnMeButton.jsx**

Create `app/components/mapOverlay/CenterOnMeButton.jsx`:

```jsx
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useTheme} from '../../common/ThemeProvider';
import allActions from '../../redux/actions';

const STALE_INDICATOR_HEIGHT = 36;

const CenterOnMeButton = ({panelOffset = 0}) => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const {activeTheme} = useTheme();
    const myCid = useSelector(state => state.app.myCid);
    const pilots = useSelector(state => state.vatsimLiveData.clients.pilots);

    if (!myCid) return null;

    const myPilot = pilots.find(p => String(p.cid) === myCid);
    if (!myPilot) return null;

    const handlePress = () => {
        dispatch(allActions.appActions.flyToClient({
            latitude: myPilot.latitude,
            longitude: myPilot.longitude,
            delta: 0.35,
        }));
        dispatch(allActions.appActions.clientSelected(myPilot));
    };

    return (
        <Pressable
            testID="center-on-me-btn"
            onPress={handlePress}
            accessibilityLabel="Center map on my aircraft"
            style={[
                styles.button,
                {
                    top: insets.top + 16 + STALE_INDICATOR_HEIGHT + 8,
                    right: insets.right + 16 + panelOffset,
                    backgroundColor: activeTheme.surface.elevated,
                },
            ]}
        >
            <MaterialCommunityIcons
                name="crosshairs-gps"
                size={20}
                color={activeTheme.accent.primary}
            />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
});

export default CenterOnMeButton;
```

- [ ] **Step 4: Update MapOverlayGroup.jsx to add CenterOnMeButton**

In `app/components/mapOverlay/MapOverlayGroup.jsx`, add import:
```js
import CenterOnMeButton from './CenterOnMeButton';
```

Add `<CenterOnMeButton panelOffset={panelOffset} />` inside the root View, after the stale indicator View:

```jsx
<CenterOnMeButton panelOffset={panelOffset} />
```

- [ ] **Step 5: Run CenterOnMeButton tests**

Run: `npx jest __tests__/CenterOnMeButton.test.js --no-coverage 2>&1 | tail -20`
Expected: all tests PASS

- [ ] **Step 6: Add MapOverlayGroup smoke test for CenterOnMeButton**

In `__tests__/MapOverlayGroup.test.js`, add a mock for `CenterOnMeButton` alongside the other mocks:

```js
jest.mock('../app/components/mapOverlay/CenterOnMeButton', () => 'CenterOnMeButton');
```

Add a test:

```js
it('renders CenterOnMeButton with correct panelOffset in landscape with side panel', () => {
    mockWidth = 844;
    mockOrientation = 'landscape';

    let tree;
    act(() => {
        tree = renderer.create(
            <MapOverlayGroup
                dataStatus="live"
                sheetState="half"
                orientation="landscape"
                sidePanelVisible={true}
            />
        );
    });

    const json = tree.toJSON();
    const centerBtn = json.children.find(c => c.type === 'CenterOnMeButton');
    expect(centerBtn).toBeTruthy();
    expect(centerBtn.props.panelOffset).toBe(400); // PANEL_WIDTH_TABLET for width 844
});
```

- [ ] **Step 7: Run MapOverlayGroup tests**

Run: `npx jest __tests__/MapOverlayGroup.test.js --no-coverage 2>&1 | tail -20`
Expected: all tests PASS

- [ ] **Step 8: Commit**

```bash
git add app/components/mapOverlay/CenterOnMeButton.jsx app/components/mapOverlay/MapOverlayGroup.jsx __tests__/CenterOnMeButton.test.js __tests__/MapOverlayGroup.test.js
git commit -m "feat: add CenterOnMeButton map overlay for tracking own aircraft"
```

---

## Task 7: Full test run + lint

- [ ] **Step 1: Run all tests**

Run: `npx jest --no-coverage 2>&1 | tail -40`
Expected: all test suites PASS, no failures

- [ ] **Step 2: Run lint**

Run: `npm run lint 2>&1 | tail -20`
Expected: no errors

- [ ] **Step 3: Final commit if any lint fixes were needed**

```bash
git add -p
git commit -m "fix: lint corrections for my-vatsim-identity feature"
```

Only create this commit if there were actual lint fixes. Skip if lint was already clean.
