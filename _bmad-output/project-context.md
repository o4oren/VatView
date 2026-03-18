---
project_name: 'VatView'
user_name: 'Oren'
date: '2026-03-10'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'quality_rules', 'anti_patterns']
status: 'complete'
rule_count: 38
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Runtime:** React Native 0.83.2 + Expo SDK 55
- **Language:** JavaScript (JSX) — no TypeScript
- **UI:** react-native-paper 5.x (Material Design 3 / MD3LightTheme)
- **Navigation:** React Navigation 7 (Native Stack + Bottom Tabs)
- **State:** Redux 5 + redux-thunk 3, react-redux 9 (NOT Redux Toolkit)
- **Maps:** react-native-maps 1.26.x with Google Maps provider
- **Bottom Sheet:** @gorhom/bottom-sheet 5.x
- **Database:** expo-sqlite 55 (async API: openDatabaseAsync, runAsync, getFirstAsync; sync API: runSync, getAllSync)
- **Storage:** AsyncStorage 2.x + Expo FileSystem 55
- **Crash Reporting:** Firebase Crashlytics (@react-native-firebase 23.x)
- **HTML Rendering:** react-native-render-html 6.x (requires `contentWidth` prop)
- **Intl Polyfills:** @formatjs/intl-* suite (required on Hermes/Android)
- **SVG Rendering:** @shopify/react-native-skia 2.x (offscreen SVG-to-bitmap rendering for aircraft icon pipeline)
- **Linting:** ESLint 8 with eslint:recommended + react-native plugins

## Critical Implementation Rules

### Language-Specific Rules

- **No TypeScript** — use plain `.js` for logic files and `.jsx` for React components; never add type annotations
- **Import style:** Named imports from local modules; `allActions` aggregates all Redux action modules via `app/redux/actions/index.js`
- **Action creators:** Redux actions export a `default` object with named functions (e.g., `export default { dataUpdated, updateData }`) — NOT individual named exports
- **Async pattern:** Use `async/await` inside thunk functions; avoid raw Promise chains for new code
- **Error handling:** Wrap fetch calls in try/catch and dispatch `{type: DATA_FETCH_ERROR}` on failure — do NOT swallow errors silently
- **Intl/Date formatting:** Any code using `Intl` APIs must only run after the polyfill block in `App.js` has executed; never use `new Intl.*` directly in component files without considering Hermes
- **Semicolons required** — ESLint enforces `"semi": ["error", "always"]`
- **Single quotes** — ESLint enforces `"quotes": ["warn", "single"]`
- **4-space indentation** — enforced by ESLint

### Framework-Specific Rules

#### React Native Components

- **File naming:** PascalCase `.jsx` for components (e.g., `VatsimMapView.jsx`); camelCase `.js` for utilities/actions/reducers
- **Component export:** Always use `export default function ComponentName()` — no class components
- **Styling:** All styles must be defined via `StyleSheet.create()` — never inline style objects; never hardcode color literals (ESLint errors)
- **All colors/theme values** must come from `app/common/theme.js` (blueGrey theme); primary color is `#2a5d99`
- **Text nodes:** Every string rendered to screen must be inside a `<Text>` component — bare strings inside `<View>` are a lint error

#### Redux Patterns

- **Store shape:** 4 slices — `vatsimLiveData`, `staticAirspaceData`, `app`, `metar`
- **Reading state:** Use `useSelector(state => state.<slice>.<field>)` in components
- **Dispatching:** Use `useDispatch()` + `allActions.<module>.<action>()` — import `allActions` from `../../redux/actions`
- **Thunks:** Thunk signature is `(dispatch, getState) => { ... }` — use `getState()` to read other slices during data processing
- **No Redux Toolkit** — do NOT use `createSlice`, `createAsyncThunk`, or `configureStore`

#### Navigation

- **Native stack navigator** (`@react-navigation/native-stack`) at root wraps the bottom tab navigator (`MainTabNavigator`)
- **Use `useNavigation()` hook** — do NOT pass navigation as a prop between components
- **Bottom sheet** (`@gorhom/bottom-sheet`) is used for client detail panels — NOT a modal or drawer
- **`snapToIndex(-1)`** closes the sheet; `snapToIndex(0)` opens it to first snap point

#### Data Access Layer (SQLite)

- **Always use `getDb()`** (singleton) — never call `SQLite.openDatabaseAsync` directly outside `staticDataAcessLayer.js`
- **Mix of sync/async:** `runSync`/`getAllSync` are used inside `.then()` callbacks; `runAsync`/`getFirstAsync` are used with `await` — match the existing pattern for the context you're in
- **Note typo in filename:** The file is `staticDataAcessLayer.js` (single 'c' in Access) — do not rename it
- **SQLite only stores airports** — `fir_boundaries` and `boundary_points` tables have been removed. FIR/TRACON boundary data is stored as GeoJSON files on disk and parsed into in-memory lookups on startup

#### Boundary Data Pipeline

- **FIR boundaries:** `Boundaries.geojson` from VatSpy Data Project → stored on disk via FileSystem → parsed by `parseFirGeoJson()` in `boundaryService.js` → `firBoundaryLookup` in Redux `staticAirspaceData` slice
- **TRACON boundaries:** `TRACONBoundaries.geojson` from SimAware TRACON Project → stored on disk → parsed by `parseTraconJson()` → `traconBoundaryLookup` in Redux
- **TRACON matching:** `lookupTracon(lookup, prefix, suffix)` checks suffix-specific entries first, then falls back to prefix-only
- **Auto-update:** `checkBoundaryUpdates` thunk compares stored release tags against GitHub latest releases; downloads happen in background, picked up on next cold start

### Code Quality & Style Rules

- **No inline styles** — `react-native/no-inline-styles` is a lint error; always use `StyleSheet.create()`
- **No color literals** — `react-native/no-color-literals` is a lint error; reference `theme.js` values
- **No raw text** — `react-native/no-raw-text` is a lint error; wrap all text in `<Text>`
- **Platform-specific components** — `react-native/split-platform-components` enforced; use `.ios.js` / `.android.js` suffixes when needed
- **Unused styles** — `react-native/no-unused-styles` is a lint error; remove any `StyleSheet` entries not referenced in JSX
- **Directory structure:** Feature-organized under `app/components/<FeatureName>/`; utilities in `app/common/`; Redux in `app/redux/actions/` and `app/redux/reducers/`
- **Constants:** All magic numbers and domain constants (facility codes, timeouts, VATSIM-specific values) belong in `app/common/consts.js`
- **No comments for obvious code** — only add comments for non-obvious logic
- **No TypeScript JSDoc** — do not add `@param`, `@returns`, or type annotation comments

### Critical Don't-Miss Rules

#### Anti-Patterns to Avoid

- **Do NOT mutate Redux state directly** — always return a new object/array from reducers
- **Do NOT call `dispatch` from inside a reducer** — only from thunks or components
- **Do NOT use `react-native-paper` v4 APIs** — the project uses v5 (MD3); use `MD3LightTheme` not `DefaultTheme`, `Text variant="..."` not `Title`/`Caption`/`Paragraph`, `textColor` not `color` on Button, `iconColor` not `color` on IconButton/ToggleButton
- **Do NOT use `expo-sqlite` legacy callback API** — the project uses the new async/promise API (`openDatabaseAsync`, not `openDatabase`)
- **Do NOT add `require()` polyfill calls outside `App.js`** — Intl polyfills must only be loaded once at app root
- **Do NOT dispatch after component unmount** — check component lifecycle when dispatching from async thunks

#### VATSIM Domain Rules

- **Controllers are keyed by callsign prefix** (e.g., `EGLL` from `EGLL_TWR`) — not by full callsign
- **`clients.airportAtc`** is a map of `icao → controller[]`; **`clients.ctr`** and **`clients.fss`** are maps of `prefix → controller[]`
- **APP/DEP controllers** are matched to TRACON polygons via `lookupTracon()` in `boundaryService.js` — falls back to 80km circle when no TRACON data exists
- **Pilot key uniqueness** uses `createKey()` from `app/common/createKey.js` — always use this, never construct keys manually
- **`STATIC_DATA_VERSION`** in `consts.js` must be bumped when static airport/FIR data schema changes — triggers SQLite re-population on next app launch
- **Airport lookup supports both ICAO and IATA** — `cachedAirports.icao` and `cachedAirports.iata` are separate maps; IATA entries only store `{icao}` as a pointer

#### Debugging: Injecting a Fake Controller for Local Testing

To preview a UIR/FIR/TRACON boundary without a live online controller (e.g. during development or boundary data testing), inject a fake controller into the live data feed in `updateData` (`app/redux/actions/vatsimLiveDataActions.js`) immediately after `let json = await response.json();`:

```js
json.controllers = [];   // optional: clear real controllers to isolate
json.pilots = [];        // optional: clear pilots
json.controllers.push({
    cid: 0, name: 'DEBUG Preview', callsign: 'EURN_FSS',
    frequency: '133.000', facility: 1, rating: 1, server: 'LOCAL',
    visual_range: 0, text_atis: [],
    last_updated: new Date().toISOString(), logon_time: new Date().toISOString()
});
// Also force the boundary polygon into cache (after firsTocCache is built):
// if (!firsTocCache.includes('EURN')) firsTocCache.push('EURN');
```

**Remove before committing.** Change the `callsign` to the prefix you want to test.

#### Performance Gotchas

- **Map markers re-render on every live data update (every 20s)** — avoid heavy computations inside marker render functions
- **`getAirportsByCodesArray` uses raw string interpolation** (not parameterized) for array queries — do not change this pattern without testing SQLite compatibility
- **FIR boundary lookups are in-memory** — `firBoundaryLookup` is queried synchronously during each poll cycle (no more async SQLite per-FIR fetching)

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code in this project
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge during implementation

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes (version upgrades, new dependencies)
- Bump `STATIC_DATA_VERSION` in `consts.js` whenever SQLite schema changes
- Review periodically and remove rules that become obvious over time

Last Updated: 2026-03-14
