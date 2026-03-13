# VatView — State Management

## Overview

Redux 4 + redux-thunk 2, initialized in `App.js` with `composeWithDevTools`.
**No Redux Toolkit** — uses classic `createStore`, `combineReducers`, and thunk action creators.

---

## Store Initialization

```
App.js
└── createStore(rootReducer, preloadedState, composeWithDevTools(applyMiddleware(thunkMiddleware)))
    └── preloadedState hydrated from retrieveSavedState() (AsyncStorage + Expo FileSystem)
```

The store is created **after** saved state is retrieved from storage (blocking load in `useEffect`).

---

## Slices

| Slice | File | Purpose |
|---|---|---|
| `vatsimLiveData` | `vatsimLiveDataReducer.js` | Live VATSIM feed: pilots, controllers, events, bookings |
| `staticAirspaceData` | `staticAirspaceDataReducer.js` | Airport DB, FIR/UIR boundaries, countries (static, version-controlled) |
| `app` | `appReducer.js` | UI state: selected client/airport, map filters, DB loading flags |
| `metar` | `metarReducer.js` | Cached METAR weather data keyed by ICAO |

---

## Actions Module (`app/redux/actions/index.js`)

All action modules aggregated into `allActions`:

```js
allActions.vatsimLiveDataActions.*
allActions.staticAirspaceDataActions.*
allActions.appActions.*
allActions.metarActions.*
```

**Import pattern in components:**
```js
import allActions from '../../redux/actions';
const dispatch = useDispatch();
dispatch(allActions.appActions.clientSelected(client));
```

---

## Action Types

### `vatsimLiveDataActions.js`
| Action | Trigger |
|---|---|
| `DATA_UPDATED` | Every 20s — live VATSIM feed parsed |
| `EVENTS_UPDATED` | On app launch |
| `BOOKINGS_UPDATED` | On app launch |
| `DATA_FETCH_ERROR` | Network/parse failure |

### `appActions.js`
| Action | Trigger |
|---|---|
| `CLIENT_SELECTED` | Marker/list tap → opens bottom sheet |
| `AIRPORT_SELECTED` | Airport tap |
| `INITIAL_REGION_LOADED` | Map region restore |
| `REGION_UPDATED` | Map moved (persisted to AsyncStorage) |
| `AIRPORTS_LOADED` | SQLite airport table populated |
| `FIR_BOUNDARIES_LOADED` | SQLite FIR table populated |
| `LOADING_DB` | Progress updates during DB load |
| `ATC_FILTER_CLICKED` | Filter bar toggle |
| `PILOTS_FILTER_CLICKED` | Filter bar toggle |
| `SEARCH_QUERY_CHANGED` | Search input change |

### `staticAirspaceDataActions.js`
| Action | Trigger |
|---|---|
| `VATSPY_DATA_UPDATED` | VATSpy DAT parsed + inserted |
| `FIR_BOUNDARIES_UPDATED` | FIR DAT parsed + inserted |

---

## Data Flow

```
App launch
  └── retrieveSavedState() → preloadedState → createStore
        └── MainApp.jsx useEffect
              ├── Check static data freshness (version + age + loaded flags)
              │     ├── stale → initDb() + dispatch getFirBoundaries + getVATSpyData
              │     └── fresh → skip
              ├── dispatch updateEvents (once)
              ├── dispatch updateBookings (once)
              └── When airportsLoaded && firBoundariesLoaded:
                    └── Start setInterval(dispatch updateData, 20_000)

updateData (every 20s):
  fetch vatsim-data.json
    → getAirportsByCodesArray (SQLite sync)
    → enrich pilots with icons + keys
    → sort controllers into type buckets
    → getFirsFromDB + getFirPointsFromDB (for active CTR/FSS)
    → dispatch DATA_UPDATED
```

---

## State Persistence Strategy

| Data | Storage | When persisted |
|---|---|---|
| Map region | AsyncStorage | On map move |
| Selected airport | AsyncStorage | On airport selection |
| DB load flags | AsyncStorage | After SQLite population complete |
| Static airspace data | Expo FileSystem | After VATSpy DAT parsed |
| FIR boundaries | Expo FileSystem | Deprecated (writes null) |

**Version gate:** `STATIC_DATA_VERSION` constant in `consts.js` — if stored version < current, full SQLite repopulation is triggered.
