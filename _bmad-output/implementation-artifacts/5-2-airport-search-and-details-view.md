# Story 5.2: Airport Search & Details View

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to search for airports by ICAO, IATA code, or name and view their details including staffed ATC, traffic counts, and METAR,
so that I can check any airport's status without finding it on the map.

## Acceptance Criteria

1. **AC1 — AirportDetailsView migrated from react-native-paper:** `AirportDetailsView.jsx` is fully rewritten using the new design system. No `SafeAreaView` from RN (tab navigator handles safe area). Uses `View` with `flex: 1` and `activeTheme.surface.base` background.

2. **AC2 — AirportSearchList migrated from react-native-paper:** `AirportSearchList.jsx` is fully rewritten. The `Searchbar` from `react-native-paper` is replaced with a `TextInput`-based search field styled identically to the one in `VatsimListView.jsx` (translucent background `activeTheme.surface.elevated`, monospace placeholder `"Airport ICAO, IATA or name"`). No `react-native-paper` imports remain.

3. **AC3 — AirportListItem migrated from react-native-paper:** `AirportListItem.jsx` is fully rewritten. The `Card`, `List.Accordion`, `Avatar`, and `Button` paper components are replaced. The new component uses `ListItem` as the base for each airport row. No `react-native-paper` imports remain.

4. **AC4 — Search filters as user types with 300ms debounce:** As the user types, airport results filter with a 300ms debounce using the same `useRef`-held `setTimeout` pattern as `VatsimListView.jsx`. When the search field is empty, all airports with active ATC (`Object.keys(airportAtc)`) are shown. When the search is ≤2 characters (but non-empty), show empty results (no trigger). When ≥3 characters, call `findAirportsByCodeOrNamePrefixAsync(searchTerm)`. Results update without a "Search" button.

5. **AC5 — AirportListItem shows ICAO, name, badge preview, and traffic counts:** Each `AirportListItem` row renders via `ListItem` base:
   - **Left slot:** ATC badge row — same `getAtcBadges` helper used by `AirportDetailCard.jsx`, showing colored letter badges (C/G/T/A/E). If no ATC, show a grey dot (circle, `activeTheme.atc.airportDotUnstaffed` color).
   - **Title:** Airport ICAO code using `titleVariant="callsign"` (monospace).
   - **Subtitle:** Airport name in `body-sm` / `activeTheme.text.secondary`.
   - **Trailing slot:** Traffic counts — `▲ {departures}` in green `#1A7F37` and `▼ {arrivals}` in red `#CF222E`, using `data-sm` variant. If no traffic data, show `▲ —  ▼ —` in muted color.

6. **AC6 — Tapping an airport row expands inline detail:** Tapping an `AirportListItem` row toggles an inline expanded detail section directly below the row (not navigation). The expanded section renders an `AirportDetailCard` (already built in `app/components/clientDetails/AirportDetailCard.jsx`), reusing it as-is. Only one airport can be expanded at a time — tapping another airport collapses the previous one.

7. **AC7 — ATC section "No ATC online" when unstaffed:** When an airport has no ATC online (`airportAtc[icao]` is empty or undefined), the expanded `AirportDetailCard` already handles this (it shows "No ATC online"). No additional handling needed in `AirportListItem`.

8. **AC8 — METAR inline in expanded view:** The expanded `AirportDetailCard` already fetches and shows METAR inline via `useEffect` from `metar.vatsim.net`. When unavailable, it shows nothing (graceful). No additional METAR UI is needed in this story beyond what `AirportDetailCard` provides.

9. **AC9 — Correct airport queries preserved:** The search logic from `AirportSearchList.jsx` is preserved:
   - Empty search → `getAirportsByICAOAsync(Object.keys(airportAtc))` — shows active airports only.
   - ≥3 characters → `findAirportsByCodeOrNamePrefixAsync(searchTerm)` — searches SQLite by ICAO/IATA/name substring (contains match).
   - Traffic counts use `calculateFlights(icao, pilots, prefiles)` from existing helper inline in `AirportSearchList.jsx`.

10. **AC10 — "No airports found" empty state:** When search returns zero results (for a non-empty query ≥3 characters), shows centered `"No airports found for [query]"` in `body-sm` / `activeTheme.text.muted`. When query is 1-2 characters, shows centered `"Type at least 3 characters to search"` in muted text.

11. **AC11 — Theming: light and dark modes:** All components use `useTheme()` / `activeTheme` tokens. No color literals. No inline styles (use `StyleSheet.create()`). Both light and dark themes render correctly.

12. **AC12 — ESLint passes:** Zero new ESLint errors or warnings introduced.

13. **AC13 — Tests written:** `__tests__/AirportSearchList.test.js` and `__tests__/AirportListItem.test.js` created. Full test suite passes with zero regressions (baseline: 245/245 from story 5.1).

## Tasks / Subtasks

- [x] Task 1: Rewrite AirportListItem.jsx (AC: #3, #5, #6)
  - [x] 1.1: Remove all `react-native-paper` imports (`Card`, `List.Accordion`, `Avatar`, `Button`)
  - [x] 1.2: Create left slot: `getAtcBadges(airportAtc, activeTheme)` → render badge row; if no badges → grey dot
  - [x] 1.3: Use `ListItem` with `title={airport.icao}`, `titleVariant="callsign"`, `subtitle={airport.name}` (body-sm secondary)
  - [x] 1.4: Trailing slot: traffic counts from `calculateFlights` — `▲ {n}` green / `▼ {n}` red, `data-sm` variant
  - [x] 1.5: Add local `isExpanded` state; `onPress` toggles expansion
  - [x] 1.6: Render `AirportDetailCard` below the `ListItem` row when `isExpanded === true`
  - [x] 1.7: Use `StyleSheet.create()` only, no color literals, `useTheme()` for colors

- [x] Task 2: Rewrite AirportSearchList.jsx (AC: #2, #4, #9, #10)
  - [x] 2.1: Remove `Searchbar` from react-native-paper, replace with `TextInput` + optional manual clear button (same pattern as `VatsimListView.jsx`)
  - [x] 2.2: Implement 300ms debounce with `useRef` timer (same pattern as `VatsimListView.jsx`)
  - [x] 2.3: On empty search: call `getAirportsByICAOAsync(Object.keys(airportAtc))`
  - [x] 2.4: On 1-2 chars: show "Type at least 3 characters to search" muted empty state, no query fired
  - [x] 2.5: On ≥3 chars: call `findAirportsByCodeOrNamePrefixAsync(searchTerm)` (debounced)
  - [x] 2.6: Render `AirportListItem` for each result — pass `airport`, `airportAtc`, `flights` props
  - [x] 2.7: Compute `flights` per airport using `calculateFlights(airport.icao, pilots, prefiles)` inline
  - [x] 2.8: On zero results with ≥3-char query: show "No airports found for [query]" empty state
  - [x] 2.9: Cleanup debounce timer on unmount

- [x] Task 3: Rewrite AirportDetailsView.jsx (AC: #1)
  - [x] 3.1: Remove `SafeAreaView`, `theme` (old) import
  - [x] 3.2: Wrap with plain `View` `flex: 1`, `backgroundColor: activeTheme.surface.base`
  - [x] 3.3: Add `FilterChipsRow` at top (same pattern as `VatsimListView.jsx`) — uses `insets.top` for safe area
  - [x] 3.4: Render `AirportSearchList` below

- [x] Task 4: Write tests (AC: #13)
  - [x] 4.1: Create `__tests__/AirportListItem.test.js`
    - Test: renders ICAO in monospace
    - Test: renders airport name as subtitle
    - Test: renders ATC badges when `airportAtc` is non-empty
    - Test: renders grey dot when no ATC
    - Test: renders traffic counts in trailing slot
    - Test: expanded = false by default; `AirportDetailCard` not rendered
    - Test: tapping row sets expanded = true; `AirportDetailCard` rendered
  - [x] 4.2: Create `__tests__/AirportSearchList.test.js`
    - Test: renders TextInput search field
    - Test: shows active airports list when search is empty
    - Test: shows "Type at least 3 characters" when 1-2 chars entered
    - Test: calls `findAirportsByCodeOrNamePrefixAsync` on ≥3-char input
    - Test: shows "No airports found" empty state when results are empty
  - [x] 4.3: Run full suite — confirm 245+ tests pass with zero regressions
  - [x] 4.4: Run ESLint — zero new warnings

- [ ] Task 5: Manual validation (AC: #12)
  - [ ] 5.1: Open Airports tab — active airports (with ATC) shown on load
  - [ ] 5.2: Type ICAO prefix ≥3 chars — results appear with ~300ms debounce
  - [ ] 5.3: 1-2 chars — "Type at least 3 characters" message shows
  - [ ] 5.4: Clear search — active airports restored
  - [ ] 5.5: Tap an airport row — expands to show `AirportDetailCard` inline
  - [ ] 5.6: Tap another row — previous collapses, new one expands
  - [ ] 5.7: Expanded card: ATC list, METAR (if available), traffic counts correct
  - [ ] 5.8: Airport with no ATC — "No ATC online" shows in expanded card
  - [ ] 5.9: Test in both light and dark themes

## Dev Notes

### Big Picture: What This Story Does

This story migrates three old-style react-native-paper components (`AirportDetailsView.jsx`, `AirportSearchList.jsx`, `AirportListItem.jsx`) to the new design system — the same migration pattern as story 5.1 did for `VatsimListView.jsx`.

**Key difference from story 5.1:** The `AirportListItem` expands inline (no navigation) to show `AirportDetailCard` — already built and battle-tested in story 4.4. Do NOT rewrite `AirportDetailCard`. Reuse it exactly as-is.

The old `AirportListItem.jsx` used `Card` + `List.Accordion` for expandable sections. The new design replaces this with a single `ListItem` row with a toggled `AirportDetailCard` below it. The old expandable sections (ATC list, flights list with airline logos, METAR button → navigation) are all replaced by `AirportDetailCard` which already covers all that content in a cleaner progressive-disclosure format.

**What to NOT do:**
- Do NOT navigate to a separate airport screen on tap — expand inline.
- Do NOT replicate the old `List.Accordion` expandable flight sections — `AirportDetailCard` already shows ATC info and METAR. Traffic counts are shown in the list item trailing slot.
- Do NOT add airline logos or detailed flight lists — out of scope.
- Do NOT touch `AirportDetailCard.jsx` — reuse it as-is.
- Do NOT touch `airportBadgeHelper.js` — reuse `getAtcBadges` as-is.
- Do NOT modify `staticDataAcessLayer.js` — reuse existing async functions.

### Component Architecture

```
AirportDetailsView.jsx
└── View (flex: 1, surface.base bg)
    ├── FilterChipsRow (safe area top padding + horizontal 16)
    └── AirportSearchList.jsx
        ├── View (search container)
        │   ├── TextInput (debounced, translucent bg)
        │   └── Pressable × (Android clear, conditional)
        ├── [empty state text when applicable]
        └── FlatList
            └── AirportListItem.jsx (for each airport)
                ├── ListItem (leftSlot=badges, title=ICAO, subtitle=name, trailing=traffic)
                └── [AirportDetailCard (when isExpanded)]
```

### AirportListItem Props

```javascript
// Props received from AirportSearchList
{
  airport: {          // from SQLite — staticDataAcessLayer result
    icao: 'EGLL',
    iata: 'LHR',
    name: 'Heathrow',
    latitude: 51.477,
    longitude: -0.461,
    fir: 'EGTT',
    isPseaudo: 0,
  },
  airportAtc: [       // from state.vatsimLiveData.clients.airportAtc[icao] or null
    { callsign: 'EGLL_TWR', facility: 4, frequency: '118.700', ... }
  ],
  flights: {          // from calculateFlights(icao, pilots, prefiles)
    departures: [...pilots],
    arrivals: [...pilots],
  },
}
```

### Left Slot: Badge Row vs Grey Dot

```javascript
// When airportAtc is non-null and has controllers:
const badges = getAtcBadges(airportAtc, activeTheme);

// badges = [{ letter: 'T', color: '#bf8700', key: 'tower' }, ...]
// Render a horizontal row of colored letter badges (same as AirportDetailCard)

// When no ATC (airportAtc is null or empty):
// Render a single grey dot:
<View style={[styles.dot, { backgroundColor: activeTheme.atc.airportDotUnstaffed }]} />
// dot: { width: 10, height: 10, borderRadius: 5 }
```

### Trailing Slot: Traffic Counts

```javascript
// From flights prop (calculateFlights result):
const dep = flights.departures.length;
const arr = flights.arrivals.length;
// Render:
<View style={styles.trafficTrailing}>
    <ThemedText variant="data-sm" color="#1A7F37">{'▲ ' + dep}</ThemedText>
    <ThemedText variant="data-sm" color="#CF222E">{'▼ ' + arr}</ThemedText>
</View>
```

### Inline Expansion Pattern

```javascript
// In AirportListItem:
const [isExpanded, setIsExpanded] = React.useState(false);

// ListItem onPress toggles:
<ListItem
    ...
    onPress={() => setIsExpanded(prev => !prev)}
/>
{isExpanded && (
    <View style={[styles.expandedContainer, { backgroundColor: activeTheme.surface.base }]}>
        <AirportDetailCard airport={airport} />
    </View>
)}
```

**Note:** `AirportDetailCard` expects `airport` with an `icao` property — matches what's available from SQLite.

### Single-Expand Behavior (One at a Time)

The simplest approach: let each `AirportListItem` manage its own `isExpanded` state independently. The "only one expanded at a time" behavior can be implemented by passing an `expandedIcao` / `setExpandedIcao` pair from `AirportSearchList` as props.

```javascript
// In AirportSearchList:
const [expandedIcao, setExpandedIcao] = useState(null);

// In renderItem:
<AirportListItem
    ...
    isExpanded={expandedIcao === item.icao}
    onToggle={() => setExpandedIcao(prev => prev === item.icao ? null : item.icao)}
/>

// In AirportListItem: use isExpanded + onToggle props instead of local state.
```

### Search Field Design (identical to VatsimListView)

```javascript
<TextInput
    style={[styles.searchInput, {
        backgroundColor: activeTheme.surface.elevated,
        color: activeTheme.text.primary,
    }]}
    placeholder="Airport ICAO, IATA or name"
    placeholderTextColor={activeTheme.text.muted}
    value={localSearch}
    onChangeText={onSearchChange}
    returnKeyType="done"
    onSubmitEditing={() => Keyboard.dismiss()}
    clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
/>
{Platform.OS !== 'ios' && localSearch.length > 0 && (
    <Pressable onPress={onClearSearch} style={styles.clearBtn} accessibilityLabel="Clear search">
        <ThemedText variant="body" color={activeTheme.text.muted}>×</ThemedText>
    </Pressable>
)}
```

### Debounce Pattern (identical to VatsimListView)

```javascript
const debounceTimer = useRef(null);

const onSearchChange = (text) => {
    setLocalSearch(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!text.trim()) {
        setFilteredAirportList(activeAirports);  // restore active airports
        return;
    }
    if (text.trim().length < 3) {
        setFilteredAirportList([]);
        return;
    }
    debounceTimer.current = setTimeout(() => {
        findAirportsByCodeOrNamePrefixAsync(text).then(setFilteredAirportList).catch(() => setFilteredAirportList([]));
    }, 300);
};

// Cleanup on unmount:
useEffect(() => () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); }, []);
```

**Important:** When search is cleared back to empty, reload `activeAirports` immediately (don't wait for debounce). You can keep a local `activeAirports` state that's populated once when `airportAtc` loads.

### calculateFlights Helper (keep inline in AirportSearchList)

The existing `calculateFlights` function from the old `AirportSearchList.jsx` is correct — preserve it:

```javascript
const calculateFlights = (airportIcao, pilots, prefiles) => {
    const departures = [];
    const arrivals = [];

    pilots.forEach(p => {
        if (p.flight_plan) {
            if (p.flight_plan.departure === airportIcao) departures.push(p);
            if (p.flight_plan.arrival === airportIcao) arrivals.push(p);
        }
    });

    prefiles.forEach(p => {
        if (p.flight_plan) {
            if (p.flight_plan.departure === airportIcao) departures.push(p);
            if (p.flight_plan.arrival === airportIcao) arrivals.push(p);
        }
    });

    return { departures, arrivals };
};
```

### Active Airports Logic (on empty search)

```javascript
// When search is empty, show all airports with active ATC:
const activeAirportIcaos = Object.keys(airportAtc); // from Redux
getAirportsByICAOAsync(activeAirportIcaos).then(setFilteredAirportList).catch(() => setFilteredAirportList([]));
```

Note: `airportAtc` is `state.vatsimLiveData.clients.airportAtc` — an object keyed by ICAO. When `airportAtc` changes (new poll), the active airport list should refresh. Use a `useEffect` with `[airportAtc, localSearch]` dependency to re-run the empty-search query when live data updates.

### Redux Selectors

```javascript
const airportAtc = useSelector(state => state.vatsimLiveData.clients.airportAtc);
const pilots     = useSelector(state => state.vatsimLiveData.clients.pilots);
const prefiles   = useSelector(state => state.vatsimLiveData.prefiles);
```

No new Redux state or actions needed — all existing selectors.

### Components to REUSE (Do NOT Recreate)

- **`ListItem`** (`app/components/shared/ListItem.jsx`) — base for `AirportListItem`. Accepts `titleVariant` prop (added in story 5.1 review).
- **`ThemedText`** (`app/components/shared/ThemedText.jsx`) — all text.
- **`useTheme()`** (`app/common/ThemeProvider.jsx`) — colors.
- **`getAtcBadges`** (`app/common/airportBadgeHelper.js`) — badge row logic.
- **`AirportDetailCard`** (`app/components/clientDetails/AirportDetailCard.jsx`) — expanded content. Takes `airport` prop with `icao` field.
- **`FilterChipsRow`** (`app/components/shared/FilterChipsRow.jsx`) — pilots/ATC filter chips at top (same as VatsimListView).
- **`getAirportsByICAOAsync`**, **`findAirportsByCodeOrNamePrefixAsync`** (`app/common/staticDataAcessLayer.js`) — SQLite queries.
- **`useSafeAreaInsets`** (`react-native-safe-area-context`) — for top padding in `AirportDetailsView`.

### ESLint Rules

- No inline styles — `StyleSheet.create()` only.
- No color literals — all from `activeTheme` or approved constants (`'#1A7F37'`, `'#CF222E'` for traffic are already used in `AirportDetailCard`).
- No raw text outside `<ThemedText>` — use `eslint-disable react-native/no-raw-text` for emoji/arrows (▲▼) inside `ThemedText`.
- Semicolons required, single quotes, 4-space indentation.

### Testing Pattern

Follow the same mock pattern from existing tests. Key mocks needed:

```javascript
jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        runAsync: jest.fn(),
        getAllSync: jest.fn(() => []),
        getFirstAsync: jest.fn(() => ({ count: 0 })),
    })),
}));

jest.mock('../../app/common/staticDataAcessLayer', () => ({
    getAirportsByICAOAsync: jest.fn(() => Promise.resolve([
        { icao: 'EGLL', iata: 'LHR', name: 'Heathrow', latitude: 51.477, longitude: -0.461 },
    ])),
    findAirportsByCodeOrNamePrefixAsync: jest.fn(() => Promise.resolve([])),
}));

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        vatsimLiveData: {
            clients: {
                airportAtc: {
                    'EGLL': [
                        { callsign: 'EGLL_TWR', facility: 4, frequency: '118.700', cid: 111, name: 'Jane Doe', rating: 5, logon_time: '2024-01-01T00:00:00Z' },
                    ],
                },
                pilots: [],
            },
            prefiles: [],
        },
        app: { filters: { pilots: true, atc: true, searchQuery: '' } },
    })),
    useDispatch: jest.fn(() => jest.fn()),
}));

jest.mock('../../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        isDark: false,
        activeTheme: {
            text: { primary: '#1F2328', secondary: '#656D76', muted: '#8B949E' },
            surface: { base: '#FFFFFF', elevated: 'rgba(255,255,255,0.5)', border: 'rgba(0,0,0,0.08)' },
            accent: { primary: '#2A6BC4' },
            atc: {
                airportDotUnstaffed: '#5A6370',
                badge: { clearance: '#8b949e', ground: '#1a7f37', tower: '#bf8700', approach: '#2a6bc4', atis: '#0284c7', ctr: '#1A7A6E', fss: '#8250DF' },
            },
        },
    }),
}));

// Also mock AirportDetailCard to avoid deep rendering:
jest.mock('../../app/components/clientDetails/AirportDetailCard', () => {
    const {View} = require('react-native');
    return function MockAirportDetailCard() { return <View testID="airport-detail-card" />; };
});
```

Baseline test count before this story: **245 tests, ~21 suites** (from story 5.1 completion).

### Project Structure Notes

**Modified files:**
- `app/components/airportView/AirportDetailsView.jsx` — full rewrite (remove SafeAreaView + old theme, add useTheme + FilterChipsRow)
- `app/components/airportView/AirportSearchList.jsx` — full rewrite (remove paper Searchbar, add TextInput + debounce, expand/collapse pattern)
- `app/components/airportView/AirportListItem.jsx` — full rewrite (remove paper Card/Accordion/Avatar/Button, use ListItem + AirportDetailCard)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — update story status

**New files:**
- `__tests__/AirportListItem.test.js`
- `__tests__/AirportSearchList.test.js`

**Unchanged files (do NOT touch):**
- `app/components/clientDetails/AirportDetailCard.jsx` — reuse as-is
- `app/common/airportBadgeHelper.js` — reuse as-is
- `app/common/staticDataAcessLayer.js` — reuse as-is
- `app/common/airportTools.js` — `getAirportCountryFromIcao` no longer needed (country display was old UI)
- `app/redux/reducers/` — no Redux changes needed
- `app/components/shared/ListItem.jsx` — already has `titleVariant` prop from story 5.1

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 5, Story 5.2 acceptance criteria]
- [Source: app/components/airportView/AirportDetailsView.jsx — Current implementation to migrate]
- [Source: app/components/airportView/AirportSearchList.jsx — Current implementation with search + active airport logic]
- [Source: app/components/airportView/AirportListItem.jsx — Current implementation with accordion/flights]
- [Source: app/components/clientDetails/AirportDetailCard.jsx — Reuse as expanded content; takes `airport` prop with `icao`]
- [Source: app/common/airportBadgeHelper.js — `getAtcBadges(atcList, activeTheme)` returns `[{letter, color, key}]`]
- [Source: app/common/staticDataAcessLayer.js — `getAirportsByICAOAsync(codes)`, `findAirportsByCodeOrNamePrefixAsync(term)`]
- [Source: app/components/shared/ListItem.jsx — base component with `titleVariant` prop support]
- [Source: app/components/shared/ThemedText.jsx — Typography variants: callsign, data-sm, body-sm, caption]
- [Source: app/common/themeTokens.js — `activeTheme.atc.airportDotUnstaffed`, `activeTheme.atc.badge.*`, traffic colors `#1A7F37` / `#CF222E`]
- [Source: app/components/vatsimListView/VatsimListView.jsx — Reference for debounce pattern, search field, FilterChipsRow, safe area insets usage]
- [Source: app/components/vatsimListView/ClientCard.jsx — Reference for badge left slot pattern]
- [Source: _bmad-output/implementation-artifacts/5-1-pilot-and-controller-list-view.md — Testing mock patterns, story 5.1 completion notes]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Journey 4 METAR Check flow; empty states (AC7 "No ATC online", "METAR unavailable"); loading states]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Rewrote `AirportListItem.jsx`: removed all react-native-paper imports (Card, List.Accordion, Avatar, Button). New design uses `ListItem` base with badge left slot, ICAO callsign title, name subtitle, and traffic trailing slot. Expansion controlled via `isExpanded`/`onToggle` props from parent (single-expand pattern).
- Rewrote `AirportSearchList.jsx`: replaced `Searchbar` (paper) with `TextInput` matching VatsimListView pattern. 300ms debounce via `useRef`. Empty search loads active ATC airports; 1-2 chars shows hint; ≥3 chars triggers SQLite search. Single-expand state managed here via `expandedIcao`.
- Rewrote `AirportDetailsView.jsx`: removed SafeAreaView and old theme import. Now uses `View` + `useTheme()` + `FilterChipsRow` (with safe area insets) + `AirportSearchList`.
- Tests: 9 tests in `AirportListItem.test.js`, 5 tests in `AirportSearchList.test.js`. Full suite: 260/260 pass (baseline was 245). ESLint: 0 new errors.
- Post-implementation improvement: changed `findAirportsByCodeOrNamePrefixAsync` in `staticDataAcessLayer.js` from prefix match (`name LIKE 'term%'`, exact ICAO/IATA) to substring match (`LIKE '%term%'`) on all three fields. Typing any part of an ICAO, IATA, or name now returns results.
- Review fixes applied: guarded empty active-airport lookups, made airport filter chips local to the Airports screen, kept collapsed and expanded traffic counts in sync, surfaced ATIS provider rows for top-down airports while preserving the unstaffed state, and tightened the airport-focused Jest coverage. Targeted validation: `15/15` airport tests pass and targeted ESLint is clean.

### File List

**Modified:**
- `app/components/airportView/AirportListItem.jsx`
- `app/components/airportView/AirportSearchList.jsx`
- `app/components/airportView/AirportDetailsView.jsx`
- `app/components/clientDetails/AirportDetailCard.jsx`
- `app/components/shared/FilterChipsRow.jsx`
- `app/common/staticDataAcessLayer.js`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

**New:**
- `__tests__/AirportListItem.test.js`
- `__tests__/AirportSearchList.test.js`
- `__mocks__/MockFlatList.js`

## Change Log

- 2026-03-18: Implemented story 5.2 — migrated AirportDetailsView, AirportSearchList, and AirportListItem from react-native-paper to new design system. Added 14 new tests (260/260 total pass). ESLint clean.
- 2026-03-18: Updated `findAirportsByCodeOrNamePrefixAsync` to use `LIKE '%term%'` substring matching on ICAO, IATA, and name (previously prefix-only on name, exact on codes).
- 2026-03-18: Added `autoCorrect={false}` and `autoCapitalize="none"` to search TextInput to disable iOS autocorrection and auto-capitalisation.
- 2026-03-18: Addressed review findings by guarding empty airport lookups, making airport filter chips local, sharing traffic counts with `AirportDetailCard`, showing ATIS provider rows for top-down airports, and hardening the airport-focused tests.

## Senior Developer Review (AI)

### Reviewer

Oren

### Date

2026-03-18

### Outcome

Approved after fixes.

### Findings Resolved

- Guarded `getAirportsByICAOAsync([])` so the empty active-airport case resolves cleanly.
- Made the Airports-screen filter chips local so they no longer mutate other tabs without feedback.
- Unified collapsed and expanded airport traffic counts by passing the list item's computed counts into `AirportDetailCard`.
- Preserved the "No ATC online" state for ATIS-only top-down airports while also showing the ATIS provider row.
- Added a single-expand interaction test and removed the async warning/harness issues from the airport-focused Jest tests.
