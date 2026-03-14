---
title: 'ATC TRACON Polygon Rendering + FIR GeoJSON Migration'
slug: 'atc-tracon-polygons-fir-geojson-migration'
created: '2026-03-14'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['react-native-maps', 'expo-sqlite', 'expo-file-system/legacy', 'async-storage', 'redux', 'redux-thunk']
files_to_modify: ['app/common/staticDataAcessLayer.js', 'app/common/storageService.js', 'app/common/consts.js', 'app/common/boundaryService.js', 'app/redux/actions/staticAirspaceDataActions.js', 'app/redux/actions/vatsimLiveDataActions.js', 'app/redux/actions/appActions.js', 'app/redux/reducers/vatsimLiveDataReducer.js', 'app/redux/reducers/staticAirspaceDataReducer.js', 'app/components/mainApp/MainApp.jsx', 'app/components/vatsimMapView/AirportMarkers.jsx', 'app/components/vatsimMapView/CTRPolygons.jsx', 'app/components/vatsimMapView/MapComponent.jsx', 'app/components/About/About.jsx', 'App.js', 'CLAUDE.md', '_bmad-output/project-context.md']
code_patterns: ['Redux thunks with (dispatch, getState) signature', 'FileSystem.writeAsStringAsync/readAsStringAsync for JSON persistence', 'AsyncStorage for boolean flags and small values', 'initDb() drops and recreates SQLite tables on version change', 'GeoJSON [lon,lat] must be converted to {latitude,longitude} for react-native-maps', 'Latitude ±90 clamped to ±85 for map rendering']
test_patterns: ['No test suite configured']
---

# Tech-Spec: ATC TRACON Polygon Rendering + FIR GeoJSON Migration

**Created:** 2026-03-14

## Overview

### Problem Statement

APP/DEP controllers on the VatView map are rendered as generic 80km circles around their airport coordinates. This is inaccurate — real TRACON airspace boundaries vary significantly in size and shape. Meanwhile, FIR boundary data is fetched as a pipe-delimited `.dat` file, parsed line-by-line, and stored across two SQLite tables (`fir_boundaries` + `boundary_points`), adding unnecessary complexity when the same data is available as clean GeoJSON.

### Solution

1. **TRACON polygons:** Fetch `TRACONBoundaries.geojson` from the SimAware TRACON Project (latest GitHub release), match APP/DEP controllers by callsign prefix against TRACON `prefix` arrays, and render actual polygon boundaries. Fall back to the current 80km circle when no TRACON match exists.
2. **FIR GeoJSON migration:** Replace the `.dat` fetch + SQLite storage pipeline with direct GeoJSON fetch (`Boundaries.geojson` from VatSpy Data Project latest GitHub release). Store the file on disk via Expo FileSystem, parse once at startup into an in-memory lookup keyed by the FIR `Boundary` reference field, and query that lookup during polling — eliminating the SQLite boundary tables entirely.
3. **Auto-updating boundary data:** Decouple boundary data freshness from app releases. On cold start, load from local files immediately; in the background, check GitHub latest release tags and download updated files if a new release is available. New data is picked up on the next app start.

### Scope

**In Scope:**
- Fetch and cache `TRACONBoundaries.geojson` from SimAware TRACON Project latest GitHub release
- Fetch and cache `Boundaries.geojson` from VatSpy Data Project latest GitHub release
- Match APP/DEP controllers to TRACON polygons by callsign prefix (with suffix-aware matching for DEP-specific boundaries)
- Render TRACON polygons with same colors as current APP circles
- Deduplicate polygons when APP and DEP resolve to the same TRACON geometry
- Circle fallback for APP/DEP controllers without TRACON data
- Migrate FIR boundaries from `.dat`/SQLite to `Boundaries.geojson`/in-memory lookup
- Remove SQLite `fir_boundaries` and `boundary_points` tables
- Background release-tag checking for automatic boundary data updates
- Bump `STATIC_DATA_VERSION` to trigger initial migration
- Update project documentation (CLAUDE.md, project-context.md, architecture docs)

**Out of Scope:**
- VATGlasses sector-level integration (Phase 1.5)
- UI redesign, new visual styling, floating HUD (Phase 1)
- Aviation themes, landscape mode (Phase 1)
- Altitude-layered airspace, bandbox/split detection (Phase 1.5)
- Hot-swapping in-memory lookups mid-session (new data picked up on next cold start only)

## Context for Development

### Codebase Patterns

- **Redux thunks:** Signature is `(dispatch, getState) => { ... }`. Action modules export a `default` object with named functions. Dispatched via `dispatch(allActions.module.action)` (no parentheses for thunks).
- **Static data fetch:** `api.vatsim.net/api/map_data/` returns metadata with dynamic URLs. `getFirBoundaries()` and `getVATSpyData()` fetch in parallel from `MainApp.jsx`.
- **File persistence:** `storageService.js` uses `expo-file-system/legacy` for large JSON blobs (`FileSystem.writeAsStringAsync`/`readAsStringAsync`) and `AsyncStorage` for boolean flags.
- **SQLite pattern:** `staticDataAcessLayer.js` (typo in name, do not rename) uses `getDb()` singleton. Mix of sync/async: `runSync`/`getAllSync` in `.then()` callbacks, `runAsync`/`getFirstAsync` with `await`.
- **FIR boundary flow:** `.dat` → parse → `insertFirBoundaries()` + `insertPoints()` → SQLite → per-poll `getFirsFromDB()` + `getFirPointsFromDB()` → `cachedFirBoundaries` Redux state → `CTRPolygons.jsx` renders.
- **APP/DEP flow:** `AirportMarkers.jsx:68-80` renders `<Circle>` for facility type `APP` (5). Note: both APP and DEP controllers use the same facility constant `APP` (5).
- **Coordinate format:** GeoJSON uses `[longitude, latitude]`; react-native-maps uses `{latitude, longitude}` — conversion required.
- **Latitude clamping:** Current `.dat` parser clamps exactly `== 90` to `85` and `== -90` to `-85` (strict equality, not range clamping). Preserve this exact behavior: `lat === 90 ? 85 : lat === -90 ? -85 : lat`.
- **Version check:** `MainApp.jsx:91-109` checks `STATIC_DATA_VERSION`, `airportsLoaded`, `firBoundariesLoaded`, staleness (>30 days) → calls `initDb()` + dispatches fetch thunks.
- **Loading gate:** `isReady()` requires `airportsLoaded && firBoundariesLoaded && firs.length > 0` before starting live polling.
- **Two-stage FIR lookup:** VATSpy `.dat` FIR entries have 4 fields: `icao`, `name`, `prefix`, `firBoundary`. The `firBoundary` field (token[3]) is the **reference ID** used to look up geometry in the boundary data. This is the same pattern used by FSTrAk. The GeoJSON feature `properties.id` matches this `firBoundary` reference. Example: FIR with `icao=CZEG, prefix=CZEG, firBoundary=CZEG` maps to GeoJSON feature `id=CZEG`. For subdivisions: the `.dat` may have `firBoundary=EDGG` while GeoJSON has features `EDGG`, `EDGG-N`, `EDGG-C`, etc.

### Technical Decisions

1. **Two separate in-memory lookups** — `firBoundaryLookup` (keyed by GeoJSON feature `id`) and `traconBoundaryLookup` (keyed by prefix). Clean separation, no key collisions, and Phase 1.5 (VATGlasses) slots in as a third lookup later.
2. **TRACON suffix matching** — Exact prefix+suffix match first (e.g., `ATL_DEP` matches TRACON with `prefix: ["ATL"], suffix: "DEP"`), fall back to prefix-only (no suffix field). When APP and DEP resolve to the same TRACON entry, render one polygon tappable for both. Deduplication uses a `Set` scoped to the entire render pass (not per-airport) to handle cases where multiple airports share a TRACON.
3. **GitHub latest-release fetch** — Fetch from `https://api.github.com/repos/{owner}/{repo}/releases/latest` API. Returns JSON with `tag_name` and `assets[]` array. Find the correct asset by matching `asset.name` against the expected filename. Download via `asset.browser_download_url`. Store release tag in AsyncStorage (`traconReleaseTag`, `firGeoJsonReleaseTag`).
4. **No hot-swapping** — Background downloads write new files to disk; in-memory lookups only refreshed on next cold start. Simpler, no mid-render data swap risk.
5. **Decoupled versioning** — `STATIC_DATA_VERSION` bump triggers the initial migration (drop SQLite tables, first fetch). After that, boundary updates flow independently via release-tag checks.
6. **Update documentation** — CLAUDE.md, project-context.md, and architecture docs updated to reflect new data pipeline.
7. **FIR GeoJSON keying strategy (derived from FSTrAk pattern):** The `firBoundaryLookup` is keyed by the GeoJSON feature `properties.id` (e.g., `"CZEG"`, `"EDGG"`, `"EDGG-N"`). During live polling, the lookup is queried using the FIR's `firBoundary` field from `staticAirspaceData.firs`. There is no `isExtention` concept in GeoJSON — instead, features have distinct IDs for subdivisions. The existing fallback chain in `CTRPolygons.jsx` (prefix → FIR ICAO → firBoundary → iterate) already handles this because it ultimately looks up `cachedFirBoundaries[firIcao]` where `firIcao` comes from the FIR's `icao` field which matches the GeoJSON `id`. The `isExtention` field is NOT used in the GeoJSON-based lookup — see Task 1 and Task 10 for how this is handled.

### Data Source Details

**SimAware TRACON Project:**
- Repo: `vatsimnetwork/simaware-tracon-project`
- Release asset: `TRACONBoundaries.geojson` (NOT `.json` — verified from GitHub releases API)
- Latest release example: `v1.2.6` with asset download URL `https://github.com/vatsimnetwork/simaware-tracon-project/releases/download/v1.2.6/TRACONBoundaries.geojson`
- Schema per entry: `properties.id` (facility ID, e.g., "A80"), `properties.prefix` (array of callsign prefixes, e.g., `["ATL"]`), `properties.name` (radio name), `properties.suffix` (optional, e.g., "DEP")
- Geometry: **Both `Polygon` and `MultiPolygon`** types — parser must handle both by normalizing to a consistent array-of-rings structure
- Example: Atlanta TRACON `{id: "A80", prefix: ["ATL"], name: "Atlanta Approach"}` with MultiPolygon boundary

**VatSpy Data Project Boundaries:**
- Repo: `vatsimnetwork/vatspy-data-project`
- Release asset: `Boundaries.geojson` (verified — available as release asset alongside `FIRBoundaries.dat` and `VATSpy.dat`)
- Latest release example: `v2602.2` with asset download URL `https://github.com/vatsimnetwork/vatspy-data-project/releases/download/v2602.2/Boundaries.geojson`
- Schema per feature: `properties.id` (boundary reference ID, e.g., "EDGG", "EDGG-N"), `properties.oceanic` ("0"/"1"), `properties.label_lon/lat`, `properties.region`, `properties.division`
- Feature IDs map to FIR `firBoundary` field from VATSpy `.dat` data. Subdivisions use hyphenated IDs (e.g., "EDGG-N", "EDGG-C").
- **No `isExtention` field** — extensions are separate features with distinct IDs (e.g., "ADR-E" for Adriatic extension)
- Geometry: `MultiPolygon` with `[longitude, latitude]` coordinate pairs

### Startup & Update Flow

```
Cold start → check local boundary files on disk (FileSystem)
  ├─ FILES EXIST → parse into in-memory lookups, start app immediately
  │                └─ Background: GET /repos/.../releases/latest for each repo
  │                    ├─ Same tag as stored → done
  │                    └─ New tag → download new files, write to disk, update stored tag
  │                       (picked up on next cold start)
  └─ NO FILES → fetch from GitHub latest release, store files, store tag
                 ├─ SUCCESS → parse into in-memory lookups, then start app
                 └─ FAILURE → log error, start app without boundary data
                              (FIR/TRACON polygons won't render, circles still work)
                              retry on next cold start
```

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `app/components/vatsimMapView/AirportMarkers.jsx` | APP/DEP circle rendering (lines 68-80) — add TRACON polygon rendering with circle fallback |
| `app/components/vatsimMapView/CTRPolygons.jsx` | FIR polygon rendering — switch from SQLite `cachedFirBoundaries` to in-memory `firBoundaryLookup` |
| `app/components/vatsimMapView/MapComponent.jsx` | Map composition — may need to pass TRACON lookup or adjust marker generation |
| `app/redux/actions/staticAirspaceDataActions.js` | `.dat` fetch + SQLite insert — replace `getFirBoundaries()` with GeoJSON fetch; add TRACON fetch; add background release-tag check |
| `app/redux/actions/vatsimLiveDataActions.js` | `cachedFirBoundaries` built from SQLite per poll (lines 181-193) — switch to in-memory lookup query |
| `app/redux/actions/appActions.js` | `saveFirBoundariesLoaded` — adjust for new boundary loading flow |
| `app/redux/reducers/vatsimLiveDataReducer.js` | Redux state shape — may need `traconBoundaries` in state |
| `app/common/staticDataAcessLayer.js` | SQLite schema — remove `fir_boundaries` + `boundary_points` tables and related functions |
| `app/common/storageService.js` | Add boundary file storage/retrieval; add release tag storage; clean up dead code |
| `app/common/consts.js` | Bump `STATIC_DATA_VERSION` from 434; `APP_RADIUS` stays as fallback |
| `app/components/mainApp/MainApp.jsx` | Initialization — add boundary file loading + in-memory parsing; add background release-tag check; adjust `isReady()` gate |
| `app/common/theme.js` | `theme.blueGrey.appCircleStroke` / `theme.blueGrey.appCircleFill` / `theme.blueGrey.appCircleStrokeWidth` (lines 332-334) — reuse for TRACON polygon styling |
| `App.js` | Startup state hydration — parse boundary files into in-memory lookups and include in preloaded Redux state |
| `app/components/About/About.jsx` | About page — add SimAware TRACON attribution (below line 49) + display boundary data release tags in Version Info section (after line 56) |

### Existing Bugs to Fix During Migration

1. **`storeFirBoundaries(null)`** in `staticAirspaceDataActions.js:120` — writes `"null"` to disk on every FIR fetch. Wasteful no-op. Removed as part of Task 3 (which removes the entire `getFirBoundaries` thunk that calls it). Task 2 removes the `storeFirBoundaries` function definition from `storageService.js`.
2. **Duplicate `deleteAsync`** in `storageService.js:12-13` — `clearStorage()` deletes `FIR_BOUNDARIES` twice. Fix when refactoring storage in Task 2.

## Implementation Plan

### Tasks

- [x] **Task 1: Create boundary service module**
  - File: `app/common/boundaryService.js` (NEW)
  - Action: Create a new utility module that handles all boundary data operations:
    - `fetchLatestRelease(owner, repo)` — calls `https://api.github.com/repos/{owner}/{repo}/releases/latest` with `Accept: application/vnd.github.v3+json` header. Returns `{tag: response.tag_name, assets: response.assets}`. Each asset has `{name, browser_download_url}`.
    - `findAssetUrl(assets, filename)` — finds the asset in the `assets` array where `asset.name === filename` and returns `asset.browser_download_url`. Throws if not found.
    - `downloadBoundaryFile(url, localPath)` — downloads a file from a URL and writes to `FileSystem.documentDirectory + localPath`.
    - `parseFirGeoJson(rawJson)` — parses `Boundaries.geojson` FeatureCollection into `firBoundaryLookup` object. **Keying strategy:** Each GeoJSON feature is keyed by its `properties.id` (e.g., `"CZEG"`, `"EDGG"`, `"EDGG-N"`). The lookup is: `lookup[featureId] = [{points, center, isOceanic, icao, pointCount}]`. Convert `[lon, lat]` → `{latitude, longitude}`. Clamp latitude using strict equality: `lat === 90 ? 85 : lat === -90 ? -85 : lat`. Calculate center from `properties.label_lat` / `properties.label_lon` (parse as floats). Map `properties.oceanic` `"1"` → `1`, `"0"` → `0`. Set `isExtention = false` for all entries (the concept doesn't exist in GeoJSON — subdivisions are separate keyed features). Handle `MultiPolygon` geometry: extract all coordinate rings from `geometry.coordinates`, flatten one level (MultiPolygon has `[polygon[ring[coord]]]`).
    - `parseTraconJson(rawJson)` — parses TRACON data into `traconBoundaryLookup` object. Build two indexes: `byPrefix[prefix]` (array of TRACON entries matching that prefix, excluding suffix-specific) and `byPrefixAndSuffix[prefix + '_' + suffix]` for suffix-specific entries. **Handle both `Polygon` and `MultiPolygon` geometry types:** normalize `Polygon` to `MultiPolygon` by wrapping: if `geometry.type === 'Polygon'`, treat `geometry.coordinates` as `[geometry.coordinates]`. Then convert all rings' `[lon, lat]` → `{latitude, longitude}`. Each entry stores: `{id, name, prefix, suffix, polygons: [[{latitude, longitude}]]}` where `polygons` is an array of coordinate rings.
    - `lookupTracon(traconLookup, callsignPrefix, callsignSuffix)` — takes the lookup object as a parameter (no Redux dependency). Check `byPrefixAndSuffix[callsignPrefix + '_' + callsignSuffix]` first (for DEP-specific), fall back to `byPrefix[callsignPrefix]` (entries without suffix field). Returns the matching TRACON entry or null.
  - Notes: This module is pure data logic, no Redux dependency. The `lookupTracon` function takes the lookup as a parameter so it can be called from `AirportMarkers.jsx` which reads the lookup from Redux and passes it in. The `firBoundaryLookup` output shape preserves `{icao, points, center, isOceanic, isExtention}` fields even though `isExtention` is always `false` in GeoJSON — this ensures `CTRPolygons.jsx` doesn't need changes.

- [x] **Task 2: Update storage service for boundary files + release tags**
  - File: `app/common/storageService.js`
  - Action:
    - Add constants: `TRACON_BOUNDARIES = 'TRACON_BOUNDARIES'`, `FIR_GEOJSON = 'FIR_GEOJSON'`, `TRACON_RELEASE_TAG = 'TRACON_RELEASE_TAG'`, `FIR_GEOJSON_RELEASE_TAG = 'FIR_GEOJSON_RELEASE_TAG'`
    - Add `storeTraconBoundaries(json)` — writes JSON string to `FileSystem.documentDirectory + TRACON_BOUNDARIES`
    - Add `storeFirGeoJson(json)` — writes JSON string to `FileSystem.documentDirectory + FIR_GEOJSON`
    - Add `storeReleaseTag(key, tag)` — `AsyncStorage.setItem(key, tag)`
    - Add `getReleaseTag(key)` — `AsyncStorage.getItem(key)`, returns string or null. **Export this function** so `About.jsx` can import it.
    - Update `retrieveSavedState()` — read `TRACON_BOUNDARIES` and `FIR_GEOJSON` files from FileSystem (try/catch, return null if not found). Add `traconBoundaries` and `firGeoJson` to `retrievedData` as raw JSON strings.
    - Remove `storeFirBoundaries()` function definition entirely
    - Remove `FIR_BOUNDARIES` constant
    - Fix `clearStorage()` — remove duplicate `deleteAsync` call on line 13. Remove deletion of old `FIR_BOUNDARIES` file. Add deletion of `TRACON_BOUNDARIES` and `FIR_GEOJSON` files. Add removal of release tag AsyncStorage keys (`TRACON_RELEASE_TAG`, `FIR_GEOJSON_RELEASE_TAG`).
  - Notes: Keep the existing `storeStaticAirspaceData` and other functions unchanged.

- [x] **Task 3: Update static data actions — replace `.dat` fetch with GeoJSON + TRACON fetch**
  - File: `app/redux/actions/staticAirspaceDataActions.js`
  - Action:
    - Remove the entire `getFirBoundaries()` thunk (lines 49-121). This also removes the `storeFirBoundaries(null)` call.
    - Remove `storeFirBoundaries` import from storageService.
    - Remove `insertFirBoundaries` import from staticDataAcessLayer.
    - Add imports: `fetchLatestRelease`, `findAssetUrl`, `parseFirGeoJson`, `parseTraconJson` from `boundaryService.js`. `storeFirGeoJson`, `storeTraconBoundaries`, `storeReleaseTag`, `getReleaseTag` from `storageService.js`.
    - Add `getBoundaryData` thunk with **try/catch error handling**:
      ```
      getBoundaryData = async (dispatch, getState) => {
        try {
          // Fetch FIR GeoJSON from latest release
          const firRelease = await fetchLatestRelease('vatsimnetwork', 'vatspy-data-project');
          const firAssetUrl = findAssetUrl(firRelease.assets, 'Boundaries.geojson');
          const firResponse = await fetch(firAssetUrl);
          const firRawJson = await firResponse.text();
          await storeFirGeoJson(firRawJson);
          await storeReleaseTag('FIR_GEOJSON_RELEASE_TAG', firRelease.tag);

          // Fetch TRACON from latest release
          const traconRelease = await fetchLatestRelease('vatsimnetwork', 'simaware-tracon-project');
          const traconAssetUrl = findAssetUrl(traconRelease.assets, 'TRACONBoundaries.geojson');
          const traconResponse = await fetch(traconAssetUrl);
          const traconRawJson = await traconResponse.text();
          await storeTraconBoundaries(traconRawJson);
          await storeReleaseTag('TRACON_RELEASE_TAG', traconRelease.tag);

          // Parse into lookups and dispatch
          const firLookup = parseFirGeoJson(JSON.parse(firRawJson));
          const traconLookup = parseTraconJson(JSON.parse(traconRawJson));
          dispatch(boundaryDataUpdated(firLookup, traconLookup));
          dispatch(appActions.saveFirBoundariesLoaded(true));
        } catch (err) {
          console.error('getBoundaryData failed:', err);
          // On first install, this means no boundary data yet.
          // Set firBoundariesLoaded = true anyway so app doesn't stay stuck on loading.
          // FIR/TRACON polygons won't render but circles still work as fallback.
          dispatch(appActions.saveFirBoundariesLoaded(true));
        }
      }
      ```
    - Add `checkBoundaryUpdates` thunk for background release-tag checking:
      ```
      checkBoundaryUpdates = async (dispatch, getState) => {
        try {
          const [currentFirTag, currentTraconTag] = await Promise.all([
            getReleaseTag('FIR_GEOJSON_RELEASE_TAG'),
            getReleaseTag('TRACON_RELEASE_TAG')
          ]);
          const [firRelease, traconRelease] = await Promise.all([
            fetchLatestRelease('vatsimnetwork', 'vatspy-data-project'),
            fetchLatestRelease('vatsimnetwork', 'simaware-tracon-project')
          ]);
          if (firRelease.tag !== currentFirTag) {
            const url = findAssetUrl(firRelease.assets, 'Boundaries.geojson');
            const resp = await fetch(url);
            await storeFirGeoJson(await resp.text());
            await storeReleaseTag('FIR_GEOJSON_RELEASE_TAG', firRelease.tag);
          }
          if (traconRelease.tag !== currentTraconTag) {
            const url = findAssetUrl(traconRelease.assets, 'TRACONBoundaries.geojson');
            const resp = await fetch(url);
            await storeTraconBoundaries(await resp.text());
            await storeReleaseTag('TRACON_RELEASE_TAG', traconRelease.tag);
          }
        } catch (err) {
          console.log('Background boundary update check failed:', err);
          // Silent failure — not critical, will retry next cold start
        }
      }
      ```
    - Add `BOUNDARY_DATA_UPDATED` action type and `boundaryDataUpdated(firLookup, traconLookup)` action creator
    - Update default export: remove `getFirBoundaries`, `firBoundariesUpdated`. Add `getBoundaryData`, `checkBoundaryUpdates`, `boundaryDataUpdated`.
  - Notes: The `getVATSpyData()` thunk stays unchanged — it still fetches VATSpy `.dat` for airports/FIRs/UIRs metadata (not boundary polygons). Asset lookup uses `findAssetUrl()` from `boundaryService.js` which matches by exact filename.

- [x] **Task 4: Update SQLite schema — remove boundary tables**
  - File: `app/common/staticDataAcessLayer.js`
  - Action:
    - In `initDb()`: remove the `drop table` and `create table` statements for `fir_boundaries` and `boundary_points` (lines 14-15 for drops, lines 29-43 for creates+indexes)
    - Remove exported functions: `insertFirBoundaries()`, `insertPoints()`, `getFirsFromDB()`, `getFirPointsFromDB()`, `countFirBoundaries()`
    - Keep all airport-related functions unchanged (`insertAirports`, `getAirportsByICAOAsync`, `findAirportsByCodeOrNamePrefixAsync`, `getAirportsByCodesArray`, `countAirports`)
  - Notes: The `getDb()` singleton and airports table remain — only boundary-related code is removed.

- [x] **Task 5: Update Redux state — add boundary lookups**
  - File: `app/redux/reducers/staticAirspaceDataReducer.js`
  - Action: Handle `BOUNDARY_DATA_UPDATED` action — store `firBoundaryLookup` and `traconBoundaryLookup` in `staticAirspaceData` state slice. Add to initial state: `firBoundaryLookup: {}`, `traconBoundaryLookup: {}`. **Critical:** These same keys must be present in the `preloadedState` built in `App.js` (Task 8) — if `preloadedState` overrides the reducer's initial state, the keys must exist in both places.
  - File: `app/redux/reducers/vatsimLiveDataReducer.js`
  - Action: No changes needed — `cachedFirBoundaries` continues to be built per poll cycle and stored in `vatsimLiveData` state. The difference is how it gets populated (from in-memory lookup instead of SQLite).
  - Notes: The boundary lookups live in `staticAirspaceData` because they're static reference data. The per-poll `cachedFirBoundaries` in `vatsimLiveData` is still populated each cycle — it just reads from the in-memory lookup instead of SQLite.

- [x] **Task 6: Update live data polling — use in-memory lookups instead of SQLite**
  - File: `app/redux/actions/vatsimLiveDataActions.js`
  - Action:
    - Remove imports of `getFirsFromDB` and `getFirPointsFromDB` from `staticDataAcessLayer.js`
    - Replace lines 181-193 (the `getFirsFromDB().then(...)` block) with in-memory lookup:
      ```
      // Build cachedFirBoundaries from in-memory lookup
      const firBoundaryLookup = getState().staticAirspaceData.firBoundaryLookup;
      firsTocCache.forEach(icao => {
        if (firBoundaryLookup[icao]) {
          json.cachedFirBoundaries[icao] = firBoundaryLookup[icao];
        }
      });
      dispatch(dataUpdated(json));
      ```
    - This eliminates the async SQLite queries that happened every 20 seconds. The dispatch is now synchronous after data processing — no more `.then()` chain.
  - Notes: The `firsTocCache` building logic (lines 164-179) stays the same — it still resolves CTR/FSS prefixes, UIR child FIRs, and prefix→ICAO lookups via `staticAirspaceData.firs`. The FIR's `icao` and `firBoundary` fields are used to look up in `firBoundaryLookup` which is keyed by GeoJSON feature `id`. Since VATSpy `.dat` FIR entries have `firBoundary` matching the GeoJSON `id`, the existing resolution chain works: prefix → find FIR record → use `fir.icao` (or `fir.firBoundary`) → look up in `firBoundaryLookup`.

- [x] **Task 7: Update initialization flow in MainApp**
  - File: `app/components/mainApp/MainApp.jsx`
  - Action:
    - In the version-check `useEffect` (lines 91-109):
      - Replace `dispatch(allActions.staticAirspaceDataActions.getFirBoundaries)` with `dispatch(allActions.staticAirspaceDataActions.getBoundaryData)`
      - Keep `initDb()` call but it now only handles airports table
    - Add a new `useEffect` for background release-tag checking (runs after app is ready):
      ```
      useEffect(() => {
        if (isReady()) {
          dispatch(allActions.staticAirspaceDataActions.checkBoundaryUpdates);
        }
      }, [airportsLoaded, firBoundariesLoaded]);
      ```
    - `isReady()` logic stays the same — still checks `airportsLoaded && firBoundariesLoaded && firs.length > 0`
  - Notes: Boundary file parsing on cold start happens in `App.js` (Task 8), not here. By the time `MainApp` renders, the lookups are already in the Redux store from preloaded state.

- [x] **Task 8: Update App.js — parse boundary files on startup**
  - File: `App.js`
  - Action:
    - Import `parseFirGeoJson` and `parseTraconJson` from `boundaryService.js`
    - After `retrieveSavedState()` returns, check if `retrievedData.firGeoJson` and `retrievedData.traconBoundaries` are non-null raw JSON strings
    - If yes, parse them: `const firLookup = parseFirGeoJson(JSON.parse(retrievedData.firGeoJson))` and `const traconLookup = parseTraconJson(JSON.parse(retrievedData.traconBoundaries))`
    - Include the parsed lookups in the preloaded Redux state: add `firBoundaryLookup: firLookup` and `traconBoundaryLookup: traconLookup` to the `staticAirspaceData` slice of `preloadedState`. **Must include these keys even when empty** (`firBoundaryLookup: {}`, `traconBoundaryLookup: {}`) so they're always present in the state shape, matching the reducer initial state from Task 5.
  - Notes: If boundary files don't exist yet (first install), the lookups will be empty objects — `getBoundaryData` will fetch and populate them during the version-check flow in `MainApp.jsx`. The `retrievedData.firGeoJson` and `retrievedData.traconBoundaries` are raw JSON strings from `storageService.js`, so they need `JSON.parse()` before passing to the parsers.

- [x] **Task 9: Render TRACON polygons in AirportMarkers**
  - File: `app/components/vatsimMapView/AirportMarkers.jsx`
  - Action:
    - Add import: `{Polygon} from 'react-native-maps'`
    - Add import: `{lookupTracon} from '../../common/boundaryService'`
    - Add `useSelector` to read `traconBoundaryLookup`: `const traconBoundaryLookup = useSelector(state => state.staticAirspaceData.traconBoundaryLookup);`
    - Add a `renderedTracons = new Set()` **before the outer `for (const icao in airportAtc)` loop** (not inside it) to track which TRACON polygons have been rendered across all airports. This handles the case where two different airports (e.g., ATL and AHN) share the same TRACON facility.
    - In the `case APP:` block (line 68-80), replace the `<Circle>` with TRACON polygon logic:
      ```
      case APP:
        app = true;
        const callsignPrefix = atc.callsign.split('_')[0];
        const callsignSuffix = atc.callsign.split('_').pop();
        const tracon = lookupTracon(traconBoundaryLookup, callsignPrefix, callsignSuffix);
        if (tracon) {
          const traconKey = tracon.id + '_' + (tracon.suffix || '');
          if (!renderedTracons.has(traconKey)) {
            renderedTracons.add(traconKey);
            tracon.polygons.forEach((ring, i) => {
              airportMarkers.push(
                <Polygon
                  key={atc.key + '-tracon-' + i}
                  coordinates={ring}
                  strokeColor={theme.blueGrey.appCircleStroke}
                  fillColor={theme.blueGrey.appCircleFill}
                  strokeWidth={theme.blueGrey.appCircleStrokeWidth}
                  geodesic={true}
                  tappable={true}
                  onPress={() => onPress(airport)}
                />
              );
            });
          }
        } else {
          // Fallback: 80km circle (current behavior)
          airportMarkers.push(
            <Circle
              key={atc.key}
              center={{latitude: atc.latitude, longitude: atc.longitude}}
              radius={APP_RADIUS}
              title={atc.callsign}
              strokeColor={theme.blueGrey.appCircleStroke}
              fillColor={theme.blueGrey.appCircleFill}
              strokeWidth={theme.blueGrey.appCircleStrokeWidth}
            />
          );
        }
        break;
      ```
  - Notes: `lookupTracon` takes the lookup object as first parameter (no Redux inside it). The `useSelector` hook is used alongside the existing `useDispatch` and `useCallback` hooks already in this function. The `renderedTracons` Set is recreated each render cycle (correct behavior — no stale state).

- [x] **Task 10: Verify CTRPolygons compatibility**
  - File: `app/components/vatsimMapView/CTRPolygons.jsx`
  - Action:
    - **Verify** (not change) that the data shape from `parseFirGeoJson` matches what `CTRPolygons.jsx` expects:
      - `fir.points` must be `[{latitude, longitude}, ...]` ✓ (from GeoJSON coordinate conversion)
      - `fir.center` must be `{latitude, longitude}` ✓ (from `label_lat/label_lon`)
      - `fir.isOceanic` must be an integer ✓ (mapped from `properties.oceanic`)
      - `fir.icao` must be a string ✓ (from `properties.id`)
    - **Note on `isExtention`:** Line 67 checks `fir.isExtention === false`. Since `parseFirGeoJson` sets `isExtention = false` for all GeoJSON entries, this condition is always true, meaning all FIR boundaries pass the filter. This is correct — in the GeoJSON model, extensions are separate features with their own IDs and are included/excluded based on whether they appear in `firBoundaryLookup` for the queried key.
    - If any shape mismatch is found during implementation, fix it in `parseFirGeoJson` (Task 1), NOT in `CTRPolygons.jsx`.
  - Notes: This task is primarily a verification step. If the data shapes align (which they should given Task 1's output spec), no code changes are needed here.

- [x] **Task 11: Update documentation**
  - Files: `CLAUDE.md`, `_bmad-output/project-context.md`
  - Action:
    - **CLAUDE.md**: Update Architecture > Data Storage Strategy table — remove FIR boundary SQLite rows, add FileSystem entries for `Boundaries.geojson` and `TRACONBoundaries.geojson`. Update Data Flow section to reflect in-memory boundary lookups instead of SQLite queries. Add mention of GitHub release-tag auto-update mechanism.
    - **project-context.md**: Update Technology Stack section if needed. Update Data Access Layer rules — note that `fir_boundaries` and `boundary_points` tables no longer exist. Add TRACON matching pattern to VATSIM Domain Rules. Update Performance Gotchas — remove "FIR boundary points are fetched per-FIR sequentially" since that's eliminated.
  - Notes: Keep documentation lean and focused on what agents need to know for future work. Use correct filename `TRACONBoundaries.geojson` (not `.json`).

- [x] **Task 12: Add TRACON attribution + data version display in About page**
  - File: `app/components/About/About.jsx`
  - Action:
    - **Add SimAware TRACON attribution** after the existing VATSpy attribution block (after line 49's closing `</Text>`). Follow the same pattern:
      ```
      <Text variant="bodyMedium">
        <Text>The VatView app uses (but does not include or distribute) data from the </Text>
        <Text style={styles.link} onPress={() => { Linking.openURL('https://github.com/vatsimnetwork/simaware-tracon-project'); }}>SimAware TRACON Project</Text>
      </Text>
      ```
    - **Add data release versions** to the Version Info section, after the React Native version `<Text>` (after line 56). Display the stored GitHub release tags for both boundary data sources:
      ```
      <Text variant="bodySmall">VATSpy Boundaries: {firGeoJsonReleaseTag || 'N/A'}</Text>
      <Text variant="bodySmall">TRACON Boundaries: {traconReleaseTag || 'N/A'}</Text>
      ```
    - Add `useEffect` + `useState` to load release tags on mount:
      ```
      const [firGeoJsonReleaseTag, setFirGeoJsonReleaseTag] = useState(null);
      const [traconReleaseTag, setTraconReleaseTag] = useState(null);
      useEffect(() => {
        getReleaseTag('FIR_GEOJSON_RELEASE_TAG').then(setFirGeoJsonReleaseTag);
        getReleaseTag('TRACON_RELEASE_TAG').then(setTraconReleaseTag);
      }, []);
      ```
    - Import `getReleaseTag` from `../../common/storageService` and `{useState, useEffect}` from `react`.
  - Notes: The existing VATSpy attribution text says "VAT-Spy Client Data Update Project" — the new attribution is for a different repo (SimAware TRACON). Both repos are under the `vatsimnetwork` GitHub org.

- [x] **Task 13: Bump STATIC_DATA_VERSION (DO THIS LAST)**
  - File: `app/common/consts.js`
  - Action: Change `STATIC_DATA_VERSION` from `434` to `435`. This triggers the version-check flow in `MainApp.jsx` on next app launch, causing:
    - `initDb()` — drops and recreates SQLite tables (now only airports)
    - `getBoundaryData` dispatch — fetches GeoJSON + TRACON from GitHub releases
    - `getVATSpyData` dispatch — re-fetches airports/FIRs/UIRs as before
  - Notes: **This task MUST be the last code change committed.** It triggers the migration on existing installs. All other tasks (1-12) must be complete and working before this is applied. If committed prematurely, existing users' apps will attempt the new flow before the code is ready.

### Acceptance Criteria

- [x] AC 1: Given an APP controller is online (e.g., `ATL_APP`) and a TRACON polygon exists for prefix `ATL`, when the map renders, then the actual TRACON polygon boundary is drawn with `appCircleStroke`/`appCircleFill` colors instead of an 80km circle.

- [x] AC 2: Given an APP controller is online and NO TRACON polygon exists for its prefix, when the map renders, then the existing 80km circle is drawn as fallback (same as current behavior).

- [x] AC 3: Given both `ATL_APP` and `ATL_DEP` are online and both resolve to the same TRACON entry (no `suffix` field), when the map renders, then only one polygon is drawn (deduplicated), not two overlapping polygons.

- [x] AC 4: Given `ATL_DEP` is online and a TRACON entry exists with `prefix: ["ATL"], suffix: "DEP"`, when the map renders, then the DEP-specific TRACON polygon is drawn (separate from the general APP polygon).

- [x] AC 5: Given the app is launched for the first time (no local boundary files), when the app starts and GitHub is reachable, then `Boundaries.geojson` and `TRACONBoundaries.geojson` are fetched from GitHub latest releases, stored on disk, parsed into in-memory lookups, and the app proceeds to render FIR and TRACON polygons correctly.

- [x] AC 6: Given boundary files exist on disk from a previous session, when the app cold-starts, then boundary lookups are parsed from local files immediately without network calls, and the app starts without delay.

- [x] AC 7: Given the app has started with cached boundary files, when background release-tag check detects a new GitHub release, then new boundary files are downloaded and written to disk silently (no UI change), and the updated data is available on the next cold start.

- [x] AC 8: Given the app has started with cached boundary files, when the background release-tag check fails (network error, GitHub unreachable), then the error is logged silently and the app continues using cached data without any user-visible impact.

- [x] AC 9: Given a CTR controller is online (e.g., `EDGG_CTR`), when the map renders, then FIR boundary polygons are drawn correctly from the GeoJSON-sourced in-memory lookup (same visual result as the old `.dat`/SQLite pipeline).

- [x] AC 10: Given `STATIC_DATA_VERSION` has been bumped, when an existing user upgrades and launches the app, then old SQLite boundary tables are dropped, fresh data is fetched from GitHub releases, and the app renders correctly with the new data pipeline.

- [x] AC 11: Given the GeoJSON boundary data contains latitude values of exactly ±90°, when parsed, then those values are clamped to ±85° (strict equality check, not range clamp — matching existing `.dat` parser behavior).

- [x] AC 12: Given the app has fetched boundary data from GitHub releases, when the user opens the About screen, then the SimAware TRACON Project attribution is displayed alongside the existing VATSpy attribution, and both boundary data release tags (VATSpy Boundaries, TRACON Boundaries) are shown in the Version Info section.

- [x] AC 13: Given the app is launched for the first time and GitHub is unreachable, when the boundary fetch fails, then the app still progresses past the loading screen (does not get stuck), FIR/TRACON polygons are absent but APP circles render as fallback, and the app retries boundary fetch on next cold start.

## Additional Context

### Dependencies

- **GitHub REST API** — unauthenticated, 60 requests/hour rate limit. Two calls per cold start (one per repo for release-tag check). Well within limits for a mobile app.
- **SimAware TRACON Project** (`vatsimnetwork/simaware-tracon-project`) — community-maintained, same governance as VATSpy Data Project. Used by map.vatsim.net, SimAware, VATSIM Radar. Latest release: `v1.2.6`, asset: `TRACONBoundaries.geojson`.
- **VatSpy Data Project** (`vatsimnetwork/vatspy-data-project`) — already used by VatView for `.dat` file. `Boundaries.geojson` is available as a release asset. Latest release: `v2602.2`, assets include `Boundaries.geojson`, `FIRBoundaries.dat`, `VATSpy.dat`.
- No new npm packages required.

### Testing Strategy

No automated test suite exists. Manual testing plan:

1. **Fresh install test:** Uninstall app, reinstall, verify boundary data fetches from GitHub and renders correctly on first launch.
2. **Fresh install offline test:** Uninstall app, enable airplane mode, reinstall — verify app gets past loading screen (AC 13), shows circles for APP controllers, and fetches boundary data on next launch with network.
3. **Upgrade test:** Use a build with old `STATIC_DATA_VERSION`, upgrade to new build, verify migration triggers and renders correctly.
4. **TRACON polygon test:** Find airports with known TRACON data (e.g., ATL, LAX, JFK) — verify polygon shape matches SimAware/map.vatsim.net. Find airports without TRACON data — verify 80km circle fallback.
5. **FIR polygon regression test:** Verify CTR controller polygons (e.g., EDGG_CTR, EGTT_CTR) look identical to before migration.
6. **DEP-specific test:** Find a DEP controller with a suffix-specific TRACON entry and verify it renders its own polygon.
7. **Deduplication test:** When both APP and DEP are online at the same airport, verify only one polygon renders (not two overlapping).
8. **Offline test:** Enable airplane mode after first successful load, restart app, verify it starts from cached files.
9. **Background update test:** Change stored release tag to a fake old value, restart app, verify new files are downloaded in background (check logs).
10. **About page test:** Verify TRACON attribution appears, verify both release tags display in Version Info.

### Notes

**High-risk items:**
- FIR GeoJSON data shape must exactly match what `CTRPolygons.jsx` expects. The `parseFirGeoJson` function is the critical translation layer — get this wrong and all CTR/FSS polygons break. Compare output against current `getFirPointsFromDB` output carefully.
- The GeoJSON `id` → VATSpy `firBoundary` mapping is the key integration point. Verify with real data that `firsTocCache` codes (derived from callsign prefixes and FIR metadata) correctly resolve to GeoJSON feature IDs.

**Known limitations:**
- GitHub rate limit of 60/hr unauthenticated. If a user force-restarts the app rapidly, release-tag checks may be rate-limited. This is a silent failure — app uses cached data.
- TRACON data coverage is not 100% worldwide — some regions have sparse data. Circle fallback ensures no regression.
- `isExtention` is always `false` in GeoJSON-parsed data. This means the `isExtention === false` filter in `CTRPolygons.jsx:67` always passes, which is correct since GeoJSON already separates extensions as distinct features.

**Future considerations (out of scope):**
- Phase 1.5 VATGlasses integration will add a third lookup (`vatglassesLookup`) alongside `firBoundaryLookup` and `traconBoundaryLookup`.
- The `boundaryService.js` module is designed to accommodate this — add a `parseVatglassesJson` function and a third lookup.
- Consider caching parsed lookups (not just raw JSON) to avoid re-parsing on every cold start if files are large. For now, parse time should be negligible.
