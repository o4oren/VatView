# VatView — API Contracts

VatView is a **consumer-only** app — it calls external APIs but exposes none of its own.

---

## External APIs Consumed

### 1. VATSIM Live Data Feed

| Field | Value |
|---|---|
| URL | `https://data.vatsim.net/v3/vatsim-data.json` |
| Method | GET |
| Poll interval | Every 20 seconds |
| Called from | `vatsimLiveDataActions.js` → `updateData` thunk |
| Redux action | `DATA_UPDATED` |

**Response shape (relevant fields):**
```json
{
  "pilots": [{ "cid": 123, "callsign": "BAW1", "latitude": 51.5, "longitude": -0.1, "flight_plan": { "departure": "EGLL", "arrival": "KJFK", "aircraft": "B738" }, ... }],
  "controllers": [{ "cid": 456, "callsign": "EGLL_TWR", "facility": 4, "frequency": "118.500", ... }],
  "atis": [{ "callsign": "EGLL_ATIS", "text_atis": [...], ... }]
}
```

**Post-processing in app:**
- Pilots enriched with aircraft icon + key via `createKey()`
- Controllers sorted into `ctr`, `fss`, `airportAtc`, `obs`, `other` maps by `facility` code
- Airport coordinates fetched from SQLite for airport ATC
- FIR boundary polygons fetched from SQLite for CTR/FSS

---

### 2. VATSIM Events

| Field | Value |
|---|---|
| URL | `https://my.vatsim.net/api/v1/events/all` |
| Method | GET |
| Called from | `vatsimLiveDataActions.js` → `updateEvents` thunk |
| Redux action | `EVENTS_UPDATED` |
| Timing | Once on app load |

---

### 3. ATC Bookings

| Field | Value |
|---|---|
| URL | `https://atc-bookings.vatsim.net/api/booking` |
| Method | GET |
| Called from | `vatsimLiveDataActions.js` → `updateBookings` thunk |
| Redux action | `BOOKINGS_UPDATED` |
| Timing | Once on app load |

**Post-processing:** `start` and `end` fields converted from `"YYYY-MM-DD HH:MM:SS"` to `Date` objects by appending `'T'` and `'Z'`.

---

### 4. VATSIM Static Map Data (Bootstrap)

| Field | Value |
|---|---|
| URL | `https://api.vatsim.net/api/map_data/` |
| Method | GET |
| Called from | `staticAirspaceDataActions.js` |
| Timing | On startup if static data is stale/missing |

**Returns:** JSON with `fir_boundaries_dat_url` and `vatspy_dat_url` URLs, which are then fetched:

#### 4a. FIR Boundaries DAT file
- Pipe-delimited text format
- Fields: ICAO, isOceanic, isExtension, pointCount, minLat, minLon, maxLat, maxLon, centerLat, centerLon
- Followed by N coordinate lines per FIR
- Parsed and inserted into SQLite `fir_boundaries` + `boundary_points` tables
- Chunked insertion in batches; `firBoundariesLoaded=true` dispatched when >520 FIRs inserted

#### 4b. VATSpy DAT file
- Pipe-delimited text format with section headers: `[Countries]`, `[Airports]`, `[FIRs]`, `[UIRs]`, `[IDL]`
- Airports inserted into SQLite in chunks of 140 (Android SQLite parameter limit)
- Countries, FIRs, UIRs stored in Redux `staticAirspaceData` slice and persisted to Expo FileSystem

---

### 5. METAR Weather Data

| Field | Value |
|---|---|
| URL | (dynamically constructed per ICAO) |
| Called from | `metarActions.js` |
| Redux action | stored in `metar` slice keyed by ICAO |
| Parsing | `aewx-metar-parser` library |
