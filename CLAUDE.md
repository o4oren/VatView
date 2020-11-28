# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Is

VatView is a cross-platform React Native (Expo) mobile app for tracking live VATSIM (Virtual Air Traffic Simulation Network) data — pilots, ATC controllers, airports, and events — on an interactive map and list views.

## Commands

```bash
npm start          # Start Expo dev client
npm run android    # Build and run on Android
npm run ios        # Build and run on iOS
npm run lint       # Run ESLint
```

No test suite is configured.

## Deployment

### Production Builds & Store Submission

```bash
npx eas-cli@latest build --profile production          # Build both platforms
npx eas-cli@latest submit -p ios --latest               # Submit to App Store Connect
npx eas-cli@latest submit -p android --latest           # Submit to Google Play
```

### OTA Updates (JS-only fixes)

For JavaScript-only changes (no native code modifications), push an over-the-air update without rebuilding:

```bash
npx eas-cli@latest update --branch production --message "Description of fix"
```

**Note:** OTA updates only work on builds that were built with `channel: "production"` in `eas.json`. If the build predates the channel config, you must rebuild and resubmit to the stores.

## Architecture

### State Management (Redux)

Four Redux slices combined in `app/redux/reducers/rootReducer.js`:

- **`vatsimLiveData`** — Live VATSIM feed data (pilots, controllers, events, bookings). Polled every 20 seconds from `https://data.vatsim.net/v3/vatsim-data.json`.
- **`staticAirspaceData`** — Airport database, FIR/UIR boundaries, TRACON boundaries, countries. Loaded once (or on version change) from external sources. Includes in-memory `firBoundaryLookup` and `traconBoundaryLookup`.
- **`app`** — UI state: selected client/airport, map filters, loading flags.
- **`metar`** — Cached METAR weather data by ICAO.

### Data Storage Strategy

| Data type | Storage |
|---|---|
| Redux state (small) | AsyncStorage |
| FIR boundary GeoJSON (`Boundaries.geojson`) | Expo FileSystem → parsed to in-memory lookup on startup |
| TRACON boundary GeoJSON (`TRACONBoundaries.geojson`) | Expo FileSystem → parsed to in-memory lookup on startup |
| Boundary release tags | AsyncStorage |
| Structured static data (airports) | Expo SQLite (`app/common/staticDataAcessLayer.js`) |

On startup, `App.js` calls `retrieveSavedState()` to rehydrate the store before rendering. Boundary GeoJSON files are parsed into in-memory lookups (`firBoundaryLookup`, `traconBoundaryLookup`) and included in preloaded Redux state. Static data version is checked and SQLite is repopulated if outdated. Boundary data auto-updates via GitHub release tag checks in background (`checkBoundaryUpdates` thunk).

### Navigation

React Navigation stack navigator at root with a bottom tab navigator inside. The native tab bar is replaced by `FloatingNavIsland` — a translucent floating pill rendered via the `tabBar` prop. Settings and About are merged into a single Settings tab.

```
Stack.Navigator
├── MainTabNavigator (bottom tabs, custom tabBar = FloatingNavIsland)
│   ├── Map → VatsimMapView (map + bottom sheet for client details)
│   ├── List → VatsimListView (filterable pilot/ATC list)
│   ├── Airports → AirportDetailsView
│   ├── Metar → MetarView (METAR weather search)
│   ├── Events → VatsimEventsView
│   └── Settings → Settings (includes About info)
├── Network Status (modal screen)
├── Event Details, ATC Bookings, Metar (stack screens — Metar stack screen kept for navigation.navigate('Metar', { icao }) pre-fill from other screens)
```

Tab screens are wrapped in `FadeScreen` for a 250ms cross-fade transition on focus.

### Key Directories

- `app/components/` — Feature-organized React components
- `app/redux/actions/` — Redux thunk action creators (async data fetching)
- `app/redux/reducers/` — State reducers
- `app/common/` — Utilities: `theme.js` (Material Design + Google Maps styling), `consts.js` (facility codes), `staticDataAcessLayer.js` (SQLite wrapper), `storageService.js`, `boundaryService.js` (GeoJSON parsing, TRACON lookup, GitHub release fetching), `iconsHelper.js`, `metarTools.js`, `airportTools.js`

### Data Flow

1. `App.js` initializes Redux store, loads persisted state, parses boundary GeoJSON files into in-memory lookups
2. `MainApp.jsx` checks static data freshness, loads airports into SQLite, fetches boundary data from GitHub releases if needed, starts live data polling
3. `vatsimLiveDataActions.js` fetches live JSON, processes controllers by facility type, builds `cachedFirBoundaries` from in-memory `firBoundaryLookup`, dispatches `DATA_UPDATED`
4. Map components subscribe to Redux via `useSelector`, render pilot markers, TRACON polygons (or circle fallback), and FIR boundary polygons
5. On marker tap → dispatch `clientSelected` → bottom sheet opens with `ClientDetails`
6. Background `checkBoundaryUpdates` compares stored release tags against GitHub latest releases, downloads new files if available (picked up on next cold start)

### Debugging: Injecting a Fake Controller for Local Testing

To preview a UIR/FIR/TRACON boundary without an active online controller (e.g. during development), temporarily inject a fake controller into the live data feed inside `updateData` in `app/redux/actions/vatsimLiveDataActions.js`, right after `let json = await response.json();`:

```js
// Optionally clear real data to isolate the fake controller:
json.controllers = [];
json.pilots = [];
// Push a fake controller with the desired callsign:
json.controllers.push({
    cid: 0,
    name: 'DEBUG Preview',
    callsign: 'EURN_FSS',   // change to the callsign you want to test
    frequency: '133.000',
    facility: 1,
    rating: 1,
    server: 'LOCAL',
    visual_range: 0,
    text_atis: [],
    last_updated: new Date().toISOString(),
    logon_time: new Date().toISOString()
});
// To also force-cache the FIR boundary polygon (after firsTocCache is built):
// if (!firsTocCache.includes('EURN')) firsTocCache.push('EURN');
```

Remove before committing. Never leave these lines uncommented in production code.

### Key Technical Details

- **Maps:** `react-native-maps` with Google Maps; custom blueGrey map style defined in `app/common/theme.js`
- **UI:** `react-native-paper` (Material Design) throughout
- **Bottom sheet:** `@gorhom/bottom-sheet` for client detail panel in map view
- **Intl polyfills:** Extensive `@formatjs/intl-*` polyfills required for Hermes engine on Android
- **Firebase:** Crashlytics for crash reporting (`@react-native-firebase/crashlytics`)
- **No TypeScript** — project uses plain JSX/JS with ESLint (`.eslintrc.json`)
