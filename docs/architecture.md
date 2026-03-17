# VatView — Architecture

## Executive Summary

VatView is a cross-platform React Native mobile app (iOS + Android) that provides a real-time view of the VATSIM virtual air traffic simulation network. It displays live pilot positions, ATC coverage areas, airport details, events, and weather data on an interactive Google Maps-based interface.

**App Version:** 1.9.1 | **Build Platform:** Expo + EAS

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Language | JavaScript (JSX) — no TypeScript | ES2021 |
| Mobile Framework | React Native | 0.74.5 |
| Build Platform | Expo SDK + EAS | 51 |
| UI Library | react-native-paper (Material Design v2) | ^4.4.1 |
| Navigation | React Navigation (Stack + Bottom Tabs) | ^6.x |
| Maps | react-native-maps (Google Maps) | 1.14.0 |
| Geometry | @turf/union + @turf/helpers | latest |
| State Management | Redux + redux-thunk | 4.0.5 / 2.3.0 |
| Local Database | expo-sqlite | ~14.0.6 |
| Storage | AsyncStorage + Expo FileSystem | 1.23.1 / ^17.0.1 |
| Crash Reporting | Firebase Crashlytics | ^20.1.0 |

---

## Architecture Pattern

**Component-Redux-Thunk** — Unidirectional data flow:

```
External APIs → Redux Thunks → Redux Store → React Components → User Interface
                                    ↑
                            SQLite + FileSystem
                            (static data cache)
```

### Core Principles
- **Functional components only** — hooks throughout, no class components
- **Single store** — 4 slices, prehydrated from persisted storage on launch
- **Thunks for all async** — no sagas, no RTK Query, no Promises in components
- **No TypeScript** — plain JavaScript + ESLint enforcement

---

## Navigation Architecture

```
App.js
└── NavigationContainer
    └── Stack.Navigator (MainApp.jsx)
        ├── VatView [tab] → MainTabNavigator
        │   ├── Map      → VatsimMapView
        │   ├── List     → VatsimListView
        │   ├── Airports → AirportDetailsView
        │   └── Events   → VatsimEventsView
        ├── About         (modal)
        ├── Settings      (modal, partially disabled)
        ├── Network status (modal)
        ├── Event Details  (stack)
        ├── ATC Bookings   (stack)
        └── Metar          (stack)
```

---

## Data Architecture

### Three-Tier Persistence

| Tier | Technology | Data |
|---|---|---|
| Hot (in-memory) | Redux store | Live feed, UI state, METAR cache |
| Warm (key-value) | AsyncStorage | Map region, airport selection, DB load flags |
| Warm (file) | Expo FileSystem | Static airspace JSON (countries, FIRs, UIRs) |
| Cold (relational) | expo-sqlite | Airports table, FIR boundary polygons |

### Static Data Bootstrap Flow

On startup, `MainApp.jsx` checks if static data is fresh:
- Checks: `version < STATIC_DATA_VERSION` OR `!airportsLoaded` OR `!firBoundariesLoaded` OR data age > 1 month
- If stale: drops + recreates SQLite tables, fetches VATSpy DAT + FIR boundaries DAT from VATSIM API
- Airports inserted in chunks of 140 (Android SQLite `?` parameter limit)
- FIR boundaries complete when >520 FIRs inserted

### Live Data Flow (every 20 seconds)

```
setInterval(updateData, 20_000)
    ↓
fetch https://data.vatsim.net/v3/vatsim-data.json
    ↓
Extract unique ICAO prefixes (from controllers + flight plans)
    ↓
getAirportsByCodesArray(prefixes) → SQLite sync query
    ↓
Enrich pilots: aircraft icon + size (iconsHelper) + createKey()
Sort controllers: ctr{} / fss{} / airportAtc{} / obs{} / other{}
    ↓
getFirsFromDB(active CTR+FSS prefixes) → SQLite
getFirPointsFromDB(each FIR) → SQLite
    ↓
dispatch DATA_UPDATED → Redux store → component re-render
```

---

## Redux State Architecture

### 4 Slices

```
rootReducer
├── vatsimLiveData    clients{pilots,ctr,fss,airportAtc}, events, bookings, cachedFirBoundaries
├── staticAirspaceData countries, airports, firs, uirs, lastUpdated, version
├── app               selectedClient, selectedAirport, filters, loadingDb, airportsLoaded, firBoundariesLoaded
└── metar             { [icao]: parsedMetarObject }
```

### Action Modules (via `allActions` aggregator)
- `appActions` — UI state: selection, filters, DB load flags
- `vatsimLiveDataActions` — Live feed polling, events, bookings
- `staticAirspaceDataActions` — Static data bootstrap
- `metarActions` — METAR fetch + cache

---

## Map Feature Architecture

```
VatsimMapView (screen)
├── MapComponent (react-native-maps)
│   ├── PilotMarkers / ClusteredPilotMarkers
│   ├── AirportMarkers
│   └── CTRPolygons (FIR/CTR/UIR airspace overlays)
└── BottomSheet (@gorhom/bottom-sheet)
    └── ClientDetails
        ├── PilotDetails
        ├── AtcDetails
        ├── CtrDetails
        └── AirportAtcDetails
```

**UIR polygon union:** UIR boundaries are composed of multiple adjacent FIR polygons. `CTRPolygons.jsx` uses `@turf/union` to merge all constituent FIR polygons into a single outer boundary, eliminating internal border lines. The union is computed once when the airspace entry is first cached (`airspace.mergedPolygons`) and reused on subsequent renders. Falls back to individual FIR polygons if the union fails.

**Bottom sheet lifecycle:**
- `snapToIndex(0)` — open to 300px on client selection
- `snapToIndex(-1)` — close when `selectedClient = null`
- `enablePanDownToClose={true}`

---

## VATSIM Domain Model

### Facility Types (`consts.js`)
| Code | Value | Description |
|---|---|---|
| OBS | 0 | Observer |
| FSS | 1 | Flight Service Station |
| DEL | 2 | Clearance Delivery |
| GND | 3 | Ground |
| TWR_ATIS | 4 | Tower / ATIS |
| APP | 5 | Approach / Departure |
| CTR | 6 | Enroute |

### External Data Sources
| Source | URL | Frequency |
|---|---|---|
| Live VATSIM feed | `data.vatsim.net/v3/vatsim-data.json` | Every 20s |
| Events | `my.vatsim.net/api/v1/events/all` | On launch |
| ATC Bookings | `atc-bookings.vatsim.net/api/booking` | On launch |
| Static data index | `api.vatsim.net/api/map_data/` | On stale check |
| VATSpy DAT | (resolved from index) | When stale |
| FIR Boundaries DAT | (resolved from index) | When stale |

---

## Testing Strategy

No automated test suite configured. Manual testing on physical device and emulator.

Firebase Crashlytics captures production crashes automatically.

---

## Known Technical Debt

- `staticDataAcessLayer.js` — intentional typo in filename (do not rename)
- `BookingDeatils.jsx` — intentional typo in filename (do not rename)
- FIR boundaries written as `null` to FileSystem (legacy, kept for compatibility)
- `storageService.js` line 88: `retrievedData.initialRegion` overwritten by `selectedAirport` (likely a bug)
- Settings screen navigation item commented out in `MainApp.jsx`
- Mix of sync/async SQLite API — `runSync`/`getAllSync` inside `.then()` callbacks alongside `await runAsync`
- `getAirportsByCodesArray` uses raw string interpolation for SQL IN clause (not parameterized)
