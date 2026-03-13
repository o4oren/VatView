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
- **`staticAirspaceData`** — Airport database, FIR/UIR boundaries, countries. Loaded once (or on version change) from external sources into SQLite.
- **`app`** — UI state: selected client/airport, map filters, loading flags.
- **`metar`** — Cached METAR weather data by ICAO.

### Data Storage Strategy

| Data type | Storage |
|---|---|
| Redux state (small) | AsyncStorage |
| Large JSON blobs (FIR boundaries) | Expo FileSystem |
| Structured static data (airports, FIRs) | Expo SQLite (`app/common/staticDataAcessLayer.js`) |

On startup, `App.js` calls `retrieveSavedState()` to rehydrate the store before rendering. Static data version is checked and SQLite is repopulated if outdated.

### Navigation

React Navigation stack navigator at root with a bottom tab navigator inside:

```
Stack.Navigator
├── MainTabNavigator (bottom tabs)
│   ├── Map → VatsimMapView (map + bottom sheet for client details)
│   ├── List → VatsimListView (filterable pilot/ATC list)
│   ├── Airports → AirportDetailsView
│   └── Events → VatsimEventsView
├── About, Settings, Network Status (modal screens)
├── Event Details, ATC Bookings, Metar (stack screens)
```

### Key Directories

- `app/components/` — Feature-organized React components
- `app/redux/actions/` — Redux thunk action creators (async data fetching)
- `app/redux/reducers/` — State reducers
- `app/common/` — Utilities: `theme.js` (Material Design + Google Maps styling), `consts.js` (facility codes), `staticDataAcessLayer.js` (SQLite wrapper), `storageService.js`, `iconsHelper.js`, `metarTools.js`, `airportTools.js`

### Data Flow

1. `App.js` initializes Redux store, loads persisted state
2. `MainApp.jsx` checks static data freshness, loads airports/FIRs into SQLite, starts live data polling
3. `vatsimLiveDataActions.js` fetches live JSON, processes controllers by facility type, dispatches `DATA_UPDATED`
4. Map components subscribe to Redux via `useSelector`, render clustered pilot markers and ATC polygons
5. On marker tap → dispatch `clientSelected` → bottom sheet opens with `ClientDetails`

### Key Technical Details

- **Maps:** `react-native-maps` with Google Maps; custom blueGrey map style defined in `app/common/theme.js`
- **UI:** `react-native-paper` (Material Design) throughout
- **Bottom sheet:** `@gorhom/bottom-sheet` for client detail panel in map view
- **Intl polyfills:** Extensive `@formatjs/intl-*` polyfills required for Hermes engine on Android
- **Firebase:** Crashlytics for crash reporting (`@react-native-firebase/crashlytics`)
- **No TypeScript** — project uses plain JSX/JS with ESLint (`.eslintrc.json`)
