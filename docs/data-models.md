# VatView — Data Models

---

## SQLite Database (`vatsim_static_data.db`)

Managed exclusively through `app/common/staticDataAcessLayer.js` (note: intentional typo in filename).

### Table: `airports`

| Column | Type | Notes |
|---|---|---|
| `icao` | TEXT | Primary key (conflict: ignore) |
| `iata` | TEXT | Nullable |
| `name` | TEXT | |
| `latitude` | REAL | |
| `longitude` | REAL | |
| `fir` | TEXT | FIR the airport belongs to |
| `isPseaudo` | INTEGER | Boolean (0/1) — pseudo airports |

**Indexes:** `airports_iata_index` on `iata`, also on `name`

**Source:** VATSpy DAT file, inserted in chunks of 140 rows (Android `?` parameter limit)

---

### Table: `fir_boundaries`

| Column | Type | Notes |
|---|---|---|
| `icao` | TEXT | Composite PK |
| `isOceanic` | INTEGER | Composite PK — Boolean |
| `isExtention` | INTEGER | Composite PK — Boolean |
| `latitude` | REAL | Center latitude |
| `longitude` | REAL | Center longitude |
| `pointCount` | INTEGER | Number of boundary polygon points |

**Index:** `firBoundaries_index` on `icao`

---

### Table: `boundary_points`

| Column | Type | Notes |
|---|---|---|
| `icao` | TEXT | Foreign key → `fir_boundaries` |
| `isOceanic` | INTEGER | Foreign key → `fir_boundaries` |
| `isExtention` | INTEGER | Foreign key → `fir_boundaries` |
| `latitude` | REAL | |
| `longitude` | REAL | |

**Index:** `boundary_points_index` on `icao`

**Note:** `isExtention` is a typo for "extension" — preserved as-is in schema.

---

## AsyncStorage (Key-Value)

Small primitive data persisted across app launches:

| Key | Type | Content |
|---|---|---|
| `SAVED_INITIAL_REGION` | JSON string | Last map region `{ region: { latitude, longitude, latitudeDelta, longitudeDelta } }` |
| `SELECTED_AIRPORT` | JSON string | Last selected airport object |
| `AIRPORTS_LOADED` | JSON boolean | Whether airport SQLite table is populated |
| `FIR_BOUNDARIES_LOADED` | JSON boolean | Whether FIR boundaries SQLite table is populated |

---

## Expo FileSystem (Large JSON Blobs)

Stored in `FileSystem.documentDirectory`:

| Filename | Type | Content |
|---|---|---|
| `STATIC_AIRSPACE_DATA` | JSON string | `{ countries, airports:{icao:{},iata:{}}, firs:[], uirs:{}, lastUpdated, version }` |
| `FIR_BOUNDARIES` | JSON string | Deprecated — now stored as `null` (legacy, kept for compatibility) |

---

## Redux Store Shape

### `vatsimLiveData` slice

```js
{
  clients: {
    pilots: [],           // Array of pilot objects (enriched with image, imageSize, key)
    ctr: {},              // Map: prefix → controller[]  (Enroute)
    fss: {},              // Map: prefix → controller[]  (Flight Service Station)
    airportAtc: {},       // Map: icao → controller[]    (TWR, GND, DEL, APP, ATIS)
    obs: {},              // Map: prefix → observer
    other: {},            // Map: prefix → other client
    controllerCount: 0
  },
  cachedAirports: {
    icao: {},             // Map: icao → airport object
    iata: {}              // Map: iata → { icao }  (pointer only)
  },
  cachedFirBoundaries: {}, // Map: icao → firWithPoints[]
  events: {},              // VATSIM events data
  bookings: []             // ATC bookings array (start/end as Date objects)
}
```

### `staticAirspaceData` slice

```js
{
  countries: {},          // Map: prefix → { country, callsign }
  airports: { icao: {}, iata: {} },
  firs: [],               // Array: { icao, name, prefix, firBoundary }
  uirs: {},               // Map: icao → { icao, name, firs:[] }
  firBoundaries: {},      // Loaded FIR polygon data (from FileSystem, legacy)
  lastUpdated: 0,         // Unix timestamp
  version: 0              // Compared against STATIC_DATA_VERSION constant
}
```

### `app` slice

```js
{
  selectedClient: null,         // Currently selected pilot or ATC
  selectedAirport: null,        // Currently selected airport
  initialRegion: {              // Map camera region
    latitude, longitude, latitudeDelta, longitudeDelta
  },
  filters: {
    pilots: true,
    atc: true,
    searchQuery: ''
  },
  airportsLoaded: false,
  firBoundariesLoaded: false,
  loadingDb: {
    airports: 0,   // count of airports inserted
    firs: 0        // count of FIRs inserted
  },
  theme: {},
  navigation: {}
}
```

### `metar` slice

```js
{
  // Keyed by ICAO code
  "EGLL": { /* parsed METAR object */ },
  ...
}
```
