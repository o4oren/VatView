# Story 6.2: Live/Scheduled Toggle in List Tab

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to switch between live VATSIM clients and scheduled ATC bookings and prefiled flights in the List tab,
so that I can see both who is on the network now and who is planned to fly or control.

## Acceptance Criteria

1. **AC1 — Segmented Live/Scheduled toggle added to VatsimListView:** A `Live | Scheduled` segmented control appears at the top of `VatsimListView.jsx`, above the search field. Default is `Live` mode. Tapping `Scheduled` switches to scheduled mode. Tapping `Live` returns to live mode. Toggle is implemented with two `Pressable` chips styled like `FilterChipsRow` chips (same active/inactive visual language, accent border when active).

2. **AC2 — Live mode is unchanged:** In Live mode, all existing behaviour is preserved exactly: FilterChipsRow (Pilots | ATC chips), search field, `aggregatedClients()` logic, `onItemPress()` (dispatches `clientSelected`, `flyToClient`, navigates to Map), `ClientCard` rendering. Zero regression to existing live functionality.

3. **AC3 — Scheduled mode: combined ATC bookings + prefiles list:** In Scheduled mode, a single `FlatList` shows ATC bookings (`state.vatsimLiveData.bookings`) and prefiled flights (`state.vatsimLiveData.prefiles`), combined and sorted by planned start time (bookings use `booking.start`, prefiles use `prefile.flight_plan?.deptime`). FilterChipsRow is hidden in Scheduled mode (not rendered, not just hidden with opacity).

4. **AC4 — Scheduled mode: ATC booking card layout:** Each booking card shows inline (no navigation, no stack push):
   - Callsign (`body` variant, bold)
   - Booking type label (`caption` / `activeTheme.text.secondary`)
   - Division/subdivision if present (`caption` / `activeTheme.text.secondary`)
   - Time window: `"HH:MM – HH:MM UTC"` (start and end in UTC, `data` variant or `caption`)
   - Card is a `Pressable` that expands inline to reveal full fields on tap (same accordion pattern — no navigation)

5. **AC5 — Scheduled mode: prefile card layout:** Each prefile card shows inline:
   - Callsign (`body` variant, bold)
   - `"DEP → ARR"` airports (`caption` / `activeTheme.text.secondary`)
   - Aircraft type (`data` variant)
   - Estimated off-block time (`caption` / `activeTheme.text.secondary`)
   - Card is a `Pressable` that expands inline on tap to reveal full fields

6. **AC6 — Inline expand (no stack push):** Tapping a Scheduled card expands it in-place, revealing all available fields. Tapping again collapses. Tapping a different card while one is already expanded collapses the previously expanded card and expands the new one (only one card expanded at a time). No `navigation.navigate()` call. This is distinct from live client behaviour which navigates to Map.

7. **AC7 — Date filter chip in Scheduled mode:** A single date-filter chip (calendar icon + label) appears below the toggle in Scheduled mode. It is hidden in Live mode. Tapping opens a pure-JS date picker (same `DateRangePickerModal` pattern from `VatsimEventsView.jsx` — supporting full date range selection). When a date range is set, it filters bookings and prefiles to those whose planned date overlaps the selected range. A `×` clear control removes the filter. The chip turns accent-colored when active.

8. **AC8 — Search filters both modes:** The existing callsign search field works in both Live and Scheduled modes. In Scheduled mode it filters by callsign prefix (case-insensitive). The search field placeholder changes to `"Search callsign..."` in both modes (unchanged).

9. **AC9 — Empty state in Scheduled mode:** If no scheduled entries exist (after date filtering), show `"No scheduled traffic"` centered in `body-sm` / `activeTheme.text.muted`. If date filter active and zero results, show `"No scheduled traffic for [date]"`.

10. **AC10 — BookingsView.jsx and BookingDetails.jsx deleted:** Both files at `app/components/BookingsView/BookingsView.jsx` and `app/components/BookingsView/BookingDetails.jsx` (if it exists — it may already be absent) are deleted. The `app/components/BookingsView/` directory is removed entirely.

11. **AC11 — "ATC Bookings" stack screen removed from navigator:** The `Stack.Screen` registration `<Stack.Screen name="ATC Bookings" component={BookingsView} />` is removed from `MainApp.jsx`. The `import BookingsView` line is removed.

12. **AC12 — All react-native-paper and react-native-paper-dates imports removed:** `BookingsView.jsx` uses `Searchbar`, `IconButton` from react-native-paper and `DatePickerModal` from react-native-paper-dates — all these are gone (the file is deleted). No new paper imports introduced.

13. **AC13 — Both themes render correctly:** All colors come from `activeTheme` tokens. No color literals (except approved uses). Both light and dark themes render without regressions.

14. **AC14 — Safe area insets handled correctly:** VatsimListView is a tab screen — top safe area padding already handled via `paddingTop: insets.top + 12` on the FilterChipsRow/controls row. The new Live/Scheduled toggle row and the date chip row must also use the same inset. The toggle sits inside the existing controls area. No `SafeAreaView` introduced.

15. **AC15 — ESLint passes:** Zero new ESLint errors or warnings introduced.

16. **AC16 — Tests written:** `__tests__/VatsimListView.test.js` extended with Scheduled mode tests (minimum 8 new tests). Full suite passes with zero regressions (baseline: 277 from story 6.1).

17. **AC17 — Skeleton loading state shown while bookings are fetching:** In Scheduled mode, if `bookings.length === 0` and bookings have not yet loaded, show 3 skeleton placeholder rows (same pattern as `VatsimEventsView` AC6: `height: 80`, `borderRadius: tokens.radius.md`, `backgroundColor: activeTheme.surface.elevated`, `opacity: 0.5`). Use an `isScheduledLoaded` flag: set to `true` on first non-empty `bookings` or after a 2s timeout. `"No scheduled traffic"` empty state only shown after `isScheduledLoaded === true`.

## Tasks / Subtasks

- [x] Task 1: Extend VatsimListView.jsx with Live/Scheduled toggle (AC: #1, #2, #14, #15)
  - [x] 1.1: Add `mode` state (`'live' | 'scheduled'`, default `'live'`)
  - [x] 1.2: Single chip row: Pilots/ATC (or date) chips left-aligned; Live/Scheduled toggle chips right-aligned — same `TranslucentSurface` chip design as `FilterChipsRow`; `paddingTop: insets.top + 12`
  - [x] 1.3: Conditionally render `FilterChipsRow` (left) only in Live mode; date chip (left) only in Scheduled mode
  - [x] 1.4: Ensure Live mode behaviour is byte-for-byte identical to before (no regressions)

- [x] Task 2: Implement Scheduled mode data and filtering (AC: #3, #7, #8, #9)
  - [x] 2.1: Add `useSelector` for `state.vatsimLiveData.bookings` and `state.vatsimLiveData.prefiles`
  - [x] 2.2: Combine bookings + prefiles into `scheduledItems` sorted by planned start time
  - [x] 2.3: Add `scheduledDateStart` / `scheduledDateEnd` state (Date | null) for date range filter
  - [x] 2.4: Implement date range filtering on `scheduledItems` (bookings overlap range; prefiles match by deptime date)
  - [x] 2.5: Implement callsign search filtering in Scheduled mode
  - [x] 2.6: Implement empty state for Scheduled mode

- [x] Task 3: Implement ScheduledCard component (inline expand) (AC: #4, #5, #6, #13)
  - [x] 3.1: Create `app/components/vatsimListView/ScheduledCard.jsx`
  - [x] 3.2: Distinguish booking vs prefile by `item._type` discriminator (`'booking'` | `'prefile'`)
  - [x] 3.3: Render collapsed booking card: callsign, UTC date, time window `HH:MM – HH:MM UTC`, type/division subtitle
  - [x] 3.4: Render collapsed prefile card: callsign, `DEP → ARR`, `aircraft_short` (fallback to `aircraft`), deptime
  - [x] 3.5: Render expanded state with all available fields on tap
  - [x] 3.6: Toggle expand/collapse per-item using `expandedKey` state with `LayoutAnimation`

- [x] Task 4: Extract shared DatePickerModal and implement date filter chip (AC: #7)
  - [x] 4.1: Extract `DateRangePickerModal` from `VatsimEventsView.jsx` to `app/components/shared/DatePickerModal.jsx`; (supports full range)
  - [x] 4.2: Update `VatsimEventsView.jsx` to import `DatePickerModal` from `'../shared/DatePickerModal'` and remove the inline implementation
  - [x] 4.3: Date filter chip lives in the right-aligned chip row (inline with Live/Scheduled toggles); visible only in Scheduled mode
  - [x] 4.4: Date filter supports a full range — chip label shows `18 Mar` (single day) or `18 Mar – 20 Mar` (range); `×` clears both start and end

- [x] Task 5: Delete BookingsView files and update navigator (AC: #10, #11, #12)
  - [x] 5.1: Delete `app/components/BookingsView/BookingsView.jsx`
  - [x] 5.2: Delete `app/components/BookingsView/BookingDetails.jsx` if it exists
  - [x] 5.3: Remove `app/components/BookingsView/` directory (if empty after deletions)
  - [x] 5.4: Remove `import BookingsView` from `app/components/mainApp/MainApp.jsx`
  - [x] 5.5: Remove `<Stack.Screen name="ATC Bookings" component={BookingsView} />` from `MainApp.jsx`

- [x] Task 6: Write tests (AC: #16, #17)
  - [x] 6.1: Extend `__tests__/VatsimListView.test.js` (minimum 8 new tests):
    - Test: renders Live/Scheduled toggle chips
    - Test: Live mode shows ClientCard items (existing tests must still pass)
    - Test: Scheduled mode shows booking callsign
    - Test: Scheduled mode shows prefile callsign and DEP→ARR
    - Test: Scheduled mode shows skeleton rows when `bookings` is empty and not yet loaded
    - Test: Scheduled mode shows empty state "No scheduled traffic" when loaded and no items
    - Test: Search filters scheduled items by callsign prefix (case-insensitive)
    - Test: `parseDeptime` handles undefined, null, empty string, and valid "HHMM" input without throwing
  - [x] 6.2: Run full suite — confirm 285+ tests pass (277 baseline + ≥8 new) with zero regressions
  - [x] 6.3: Run ESLint — zero new warnings

- [x] Task 8: Add ATC badges and aircraft icons to ScheduledCard (post-implementation enhancement)
  - [x] 8.1: Add `FACILITY_BADGE` map and `SUFFIX_TO_FACILITY` lookup to `ScheduledCard.jsx` (same badges as `ClientCard`)
  - [x] 8.2: Implement `facilityFromCallsign(callsign)` — derives facility number from callsign suffix (`_DEL`, `_GND`, `_TWR`, `_ATIS`, `_APP`, `_DEP`, `_CTR`, `_FSS`)
  - [x] 8.3: Add `LeftSlot` component to `ScheduledCard.jsx` — bookings render colored facility badge + short label; prefiles render aircraft bitmap icon (via `getAircraftIcon`) or ✈ emoji fallback
  - [x] 8.4: Restructure card body to horizontal row: `LeftSlot` (40px wide) + `cardContent` (`flex:1`) — vertically centered (`alignItems: 'center'`)

- [x] Task 7: Manual validation (AC: #2, #6, #7, #13, #14)
  - [x] 7.1: Navigate to List tab — Live mode shows pilots/ATC as before
  - [x] 7.2: Tap Scheduled — list switches to bookings+prefiles
  - [x] 7.3: Tap a booking card — expands inline to reveal full fields
  - [x] 7.4: Tap calendar chip — date range picker appears; select a range — list filters
  - [x] 7.5: Tap × — date filter clears
  - [x] 7.6: Test in both light and dark themes — no color regressions
  - [x] 7.7: Confirm no "ATC Bookings" tab/button exists anywhere after BookingsView removal

## Dev Notes

### Big Picture: What This Story Does

`VatsimListView.jsx` gains a `Live | Scheduled` mode toggle. Live mode is entirely unchanged. Scheduled mode replaces the now-deleted `BookingsView.jsx` tab with an inline, integrated experience.

| What changes | How |
|---|---|
| `VatsimListView.jsx` | Add mode toggle, Scheduled data/filter/render/skeleton logic |
| `app/components/vatsimListView/ScheduledCard.jsx` | New component for booking/prefile cards with inline expand |
| `app/components/shared/DatePickerModal.jsx` | New shared component extracted from VatsimEventsView; `singleDate` prop |
| `app/components/EventsView/VatsimEventsView.jsx` | Update to import `DatePickerModal` from shared (remove inline impl) |
| `app/components/BookingsView/BookingsView.jsx` | **DELETED** |
| `app/components/BookingsView/BookingDetails.jsx` | **DELETED** (may already be absent) |
| `app/components/mainApp/MainApp.jsx` | Remove BookingsView import + Stack.Screen |
| `__tests__/VatsimListView.test.js` | Extended with Scheduled mode tests (≥8 new) |

**No Redux changes.** `bookings` and `prefiles` are already in the store, already fetched on startup via `updateBookings` (dispatched at `MainApp.jsx:73`) and the live data poll respectively.

> ⚠️ **`MainApp.jsx:73` dispatch quirk:** The line reads `dispatch(allActions.vatsimLiveDataActions.updateBookings)` — passing the thunk *function reference* directly, without calling it. This is intentional and works because Redux Thunk intercepts function arguments. Do **not** change this line or add parentheses; doing so would double-dispatch or break the fetch.

### Data Shapes

**ATC Booking** (`state.vatsimLiveData.bookings` — each item):
```javascript
{
    id: number,
    callsign: string,          // e.g. "EGLL_APP"
    start: Date,               // already parsed to Date object by updateBookings thunk
    end: Date,                 // already parsed to Date object by updateBookings thunk
    type: string,              // booking type label
    division: string | null,
    subdivision: string | null,
    // possibly more fields from API
}
```
The `updateBookings` thunk (vatsimLiveDataActions.js:274-296) parses `booking.start.replace(' ', 'T') + 'Z'` and `booking.end` similarly. By the time data reaches Redux, `start` and `end` are `Date` objects.

**Prefile** (`state.vatsimLiveData.prefiles` — each item):
```javascript
{
    callsign: string,           // e.g. "BAW123"
    cid: number,
    name: string,
    flight_plan: {
        departure: string,      // ICAO
        arrival: string,        // ICAO
        aircraft: string,       // aircraft type string
        deptime: string,        // "HHMM" UTC (e.g. "1430")
        ete: string,            // estimated enroute time
        route: string,
        altitude: string,
    } | null,
}
```
Prefiles come raw from the VATSIM v3 feed (`json.prefiles` in `DATA_UPDATED` action). No Date parsing is done — `deptime` is a `"HHMM"` string.

**Distinguish booking vs prefile:** Bookings have `item.start` as a `Date` object. Prefiles have `item.flight_plan`. Use: `item.start instanceof Date` → booking; else → prefile.

### Combining and Sorting Scheduled Items

```javascript
const scheduledItems = useMemo(() => {
    const bookingItems = bookings.map(b => ({ ...b, _type: 'booking' }));
    const prefileItems = prefiles.map(p => ({ ...p, _type: 'prefile' }));
    const combined = [...bookingItems, ...prefileItems];
    // Sort by planned time ascending
    combined.sort((a, b) => {
        const aTime = a._type === 'booking' ? a.start?.getTime() : parseDeptime(a.flight_plan?.deptime);
        const bTime = b._type === 'booking' ? b.start?.getTime() : parseDeptime(b.flight_plan?.deptime);
        return (aTime || 0) - (bTime || 0);
    });
    return combined;
}, [bookings, prefiles]);
```

Helper for deptime string `"HHMM"` → ms-since-epoch-today (for sort only):
```javascript
const parseDeptime = (deptime) => {
    if (!deptime || deptime.length < 4) return 0;
    const h = parseInt(deptime.slice(0, 2), 10);
    const m = parseInt(deptime.slice(2, 4), 10);
    const d = new Date();
    d.setUTCHours(h, m, 0, 0);
    return d.getTime();
};
```

### Date Filtering

For bookings, filter where `booking.start` date matches selected date (by UTC date string):
```javascript
const selectedDateStr = scheduledDate?.toDateString();
const filtered = scheduledItems.filter(item => {
    if (item._type === 'booking') {
        return item.start?.toDateString() === selectedDateStr
            || item.end?.toDateString() === selectedDateStr;
    }
    // prefile: parse deptime to a Date, compare
    const deptimeDate = parseDeptimeToDate(item.flight_plan?.deptime);
    return deptimeDate?.toDateString() === selectedDateStr;
});
```

### Pure-JS Date Picker Extraction

Extract `DateRangePickerModal` from `VatsimEventsView.jsx` to `app/components/shared/DatePickerModal.jsx`. Add a `singleDate` boolean prop (default `false`). When `singleDate={true}`, the picker closes after the first tap and calls `onConfirm` with that single date. When `singleDate={false}` (default), behaviour is identical to the current range picker in VatsimEventsView.

After extraction:
- `VatsimEventsView.jsx` imports `DatePickerModal` from `'../shared/DatePickerModal'` with no `singleDate` prop (range mode)
- `VatsimListView.jsx` imports `DatePickerModal` from `'../shared/DatePickerModal'` with `singleDate` prop

**Do NOT use `@react-native-community/datetimepicker`** — native module not available in the dev client binary (confirmed in story 6.1 review — crashed Android).

### Toggle Chip Visual Style

Mirror the `FilterChipsRow` chip visual exactly:
```javascript
// Active chip style (same as FilterChipsRow active state):
{
    borderWidth: 1.5,
    borderColor: activeTheme.accent.primary,
    borderRadius: tokens.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
}
// Inactive chip:
{
    borderWidth: 1,
    borderColor: activeTheme.surface.border,
    opacity: 0.6,
    // rest same
}
```
Reference: `app/components/shared/FilterChipsRow.jsx`.

### Safe Area Insets

VatsimListView already uses `useSafeAreaInsets()`. The Live/Scheduled toggle row should be inside the existing controls area at the top with `paddingTop: insets.top + 12`. Toggle goes **above** the FilterChipsRow (or replaces the top controls entirely when in Scheduled mode where FilterChipsRow is hidden).

Recommended layout:
```
View (flex:1, surface.base background)
├── View (controlsRow, paddingTop: insets.top + 12)
│   ├── Live | Scheduled toggle chips (always visible)
│   └── FilterChipsRow (Live mode only)
├── View (date chip row — Scheduled mode only)
├── View (searchContainer — always visible)
└── FlatList / empty state
```

### Skeleton Loading for Scheduled Mode

Bookings fetch asynchronously on app launch. Scheduled mode needs a loading guard to avoid flashing "No scheduled traffic" on every cold start.

```javascript
const [isScheduledLoaded, setIsScheduledLoaded] = useState(false);

useEffect(() => {
    if (bookings.length > 0) setIsScheduledLoaded(true);
}, [bookings]);

// 2-second fallback timeout
useEffect(() => {
    const timer = setTimeout(() => setIsScheduledLoaded(true), 2000);
    return () => clearTimeout(timer);
}, []);
```

In Scheduled mode render logic:
```javascript
if (!isScheduledLoaded && bookings.length === 0) {
    // Show skeleton rows
    return [0,1,2].map(i => (
        <View key={i} style={[styles.skeletonRow, { backgroundColor: activeTheme.surface.elevated }]} />
    ));
}
```

Skeleton style (same as VatsimEventsView):
```javascript
skeletonRow: {
    height: 80,
    borderRadius: tokens.radius.md,
    marginHorizontal: 16,
    marginVertical: 6,
    opacity: 0.5,
}
```

### Inline Expand Pattern

No existing accordion component in the codebase — implement simple per-item expand toggle:

```javascript
const [expandedKey, setExpandedKey] = useState(null);

const handleCardPress = (key) => {
    setExpandedKey(prev => prev === key ? null : key);
};
```

Use the booking `id` or `callsign+start.getTime()` as the key. For prefiles use `callsign`.

Collapsed height: ~60-72px (similar to ClientCard).
Expanded: reveals all available fields with a smooth height animation (optional: `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)` before state update — no extra library needed).

### Time Formatting

UTC time display for bookings:
```javascript
const formatUTCTime = (date) => {
    if (!date) return '?';
    return date.toUTCString().slice(17, 22); // "HH:MM"
};
// e.g. "14:30"
// Time window: `${formatUTCTime(booking.start)} – ${formatUTCTime(booking.end)} UTC`
```

Deptime for prefiles (`"HHMM"` → `"HH:MM UTC"`):
```javascript
const formatDeptime = (deptime) => {
    if (!deptime || deptime.length < 4) return '';
    return `${deptime.slice(0, 2)}:${deptime.slice(2, 4)} UTC`;
};
```

### What NOT to Do

- Do **NOT** add a new Redux slice or action — `bookings` and `prefiles` are already in `state.vatsimLiveData`.
- Do **NOT** re-fetch bookings — `updateBookings` is dispatched at app startup in `MainApp.jsx:73`. The store already populates on launch.
- Do **NOT** use `navigation.navigate()` from Scheduled card taps — expansion is inline only.
- Do **NOT** create a new tab screen — the Scheduled mode lives inside `VatsimListView`, which is already the `List` tab.
- Do **NOT** keep `BookingsView.jsx` or any import of it — it is fully replaced.
- Do **NOT** use `SafeAreaView` — use `useSafeAreaInsets`.
- Do **NOT** use color literals — all colors from `activeTheme`.
- Do **NOT** use `@react-native-community/datetimepicker` — requires native rebuild, not available in dev client.
- Do **NOT** add new ESLint disable comments unless for raw-text in ThemedText (use `/* eslint-disable react-native/no-raw-text */` at file top if needed for `×` or `→`).

### Navigator Cleanup

In `app/components/mainApp/MainApp.jsx`:

```javascript
// REMOVE this import (line ~13):
import BookingsView from '../BookingsView/BookingsView';

// REMOVE this Stack.Screen (lines ~143-145):
<Stack.Screen name="ATC Bookings" component={BookingsView} />
```

No other navigation changes needed. The `updateBookings` dispatch (line 73) stays — bookings data is still needed for Scheduled mode.

### ScheduledCard — ATC Badges and Aircraft Icons

`ScheduledCard.jsx` mirrors the `ClientCard` left-slot pattern:

**Bookings** — facility derived from callsign suffix via `facilityFromCallsign()`:

| Suffix | Facility | Badge letter | Token key |
|--------|----------|--------------|-----------|
| `_DEL` | DEL (2)  | C | clearance |
| `_GND` | GND (3)  | G | ground |
| `_TWR` | TWR (4)  | T | tower |
| `_ATIS`| TWR (4)  | A | atis (ATIS override) |
| `_APP`, `_DEP` | APP (5) | A | approach |
| `_CTR` | CTR (6)  | E | ctr |
| `_FSS` | FSS (1)  | F | fss |

Badge color: `activeTheme.atc.badge[badge.tokenKey]`. Falls back to `activeTheme.text.muted` + letter `?` for unknown suffixes.

**Prefiles** — `getAircraftIcon(fp.aircraft)` returns `[image, imageSize]`. Renders `<Image>` if image is non-null, else ✈ emoji in `activeTheme.accent.primary`.

Card layout:
```
<Pressable (card)>
  <View (cardBody, flexDirection:'row', alignItems:'center')>
    <LeftSlot (width:40, marginRight:8) />
    <View (cardContent, flex:1)>
      {collapsed rows}
      {expanded fields}
    </View>
  </View>
</Pressable>
```

### ScheduledCard Component

Recommended to create `app/components/vatsimListView/ScheduledCard.jsx`:

```javascript
// Props: item (_type: 'booking' | 'prefile'), isExpanded, onPress
// Renders collapsed summary + optional expanded detail section
```

Collapsed booking:
- Row: callsign (body bold) + time window (caption, right-aligned)
- Row 2: type label + division (caption, secondary color)

Collapsed prefile:
- Row: callsign (body bold) + deptime (caption, right-aligned)
- Row 2: DEP → ARR (caption, secondary) + aircraft type (data variant)

Expanded (both): all available fields from the data object rendered as label/value rows using `caption`/`data` variants.

### ThemedText Variants (reference)

- `heading` — large title bold
- `body` — 15px (default body)
- `body-sm` — 14px
- `caption` — 11px
- `data` — JetBrains Mono 13px (for callsigns, codes, times)
- `data-sm` — JetBrains Mono 11px

Use `data` variant for callsigns and time values in scheduled cards to match the monospace data display pattern used throughout the app.

### ESLint Rules

- No inline styles — `StyleSheet.create()` only.
- No color literals.
- No raw text outside `<ThemedText>` — use `/* eslint-disable react-native/no-raw-text */` at file top for `×`, `→` chars.
- Semicolons, single quotes, 4-space indent.

### Testing Pattern

Extend `__tests__/VatsimListView.test.js`. Current mock pattern:
```javascript
jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector(mockState())),
    useDispatch: jest.fn(() => jest.fn()),
}));
```

Add bookings and prefiles to `mockState()`:
```javascript
const mockState = (overrides = {}) => ({
    vatsimLiveData: {
        clients: { pilots: [], airportAtc: {}, ctr: {}, fss: {}, obs: [], other: [] },
        bookings: [],
        prefiles: [],
        ...overrides.vatsimLiveData,
    },
    app: {
        filters: { pilots: true, atc: true, searchQuery: '' },
        ...overrides.app,
    },
});
```

Mock for pure-JS `DateRangePickerModal`/`DatePickerModal` — use `jest.mock('../app/components/shared/DatePickerModal', () => 'DatePickerModal')` (or inline mock if kept inline).

### Previous Story Intelligence

From story 6.1 (Events List & Event Details — done, review approved):
- Pure-JS `DateRangePickerModal` pattern is established in `VatsimEventsView.jsx`. Reuse or extract to shared.
- `@react-native-community/datetimepicker` **MUST NOT be used** — crashed Android dev client (native module not in binary). Use pure-JS picker only.
- `LayoutAnimation` for smooth accordion animation — no extra library.
- `useMemo` for derived filtered data (used in VatsimEventsView after refactor).
- `StyleSheet.absoluteFill` for overlay positioning.
- ESLint `/* eslint-disable react-native/no-raw-text */` needed for `×` and `→` chars.

From story 5.1 (VatsimListView — done):
- `FilterChipsRow` is at `app/components/shared/FilterChipsRow.jsx` — not in `vatsimListView/`.
- `ClientCard` is at `app/components/vatsimListView/ClientCard.jsx`.
- `aggregatedClients()` function must be preserved intact in Live mode.
- `onItemPress()` dispatches `clientSelected` + `flyToClient` + `navigation.navigate('Map')` — preserve for Live mode.
- Debounce timer cleanup in `useEffect` return is important for search.

From story 4.5 (List View Card Polish — done):
- `ClientCard` uses facility badge system (`CTR`, `GND`, `TWR`, `APP`, `DEL`, `ATIS`) — do not touch for this story.

### Project Structure Notes

**Files to modify:**
- `app/components/vatsimListView/VatsimListView.jsx` — add mode toggle + Scheduled logic + skeleton loading
- `app/components/EventsView/VatsimEventsView.jsx` — replace inline DateRangePickerModal with import from shared
- `app/components/mainApp/MainApp.jsx` — remove BookingsView import + Stack.Screen
- `__tests__/VatsimListView.test.js` — extend with Scheduled mode tests (≥8 new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — update story status

**Files to create:**
- `app/components/vatsimListView/ScheduledCard.jsx` — booking/prefile card with inline expand
- `app/components/shared/DatePickerModal.jsx` — extracted from VatsimEventsView; `singleDate` prop for single-date vs range mode

**Files to delete:**
- `app/components/BookingsView/BookingsView.jsx`
- `app/components/BookingsView/BookingDetails.jsx` (if exists — may already be absent per explore findings)
- `app/components/BookingsView/` directory (if empty after deletions)

**No Redux changes, no new dependencies, no native module changes.**

### References

- [Source: app/components/vatsimListView/VatsimListView.jsx — Base component to extend]
- [Source: app/components/vatsimListView/ClientCard.jsx — Live mode card pattern]
- [Source: app/components/shared/FilterChipsRow.jsx — Toggle chip visual style reference]
- [Source: app/components/BookingsView/BookingsView.jsx — File to DELETE; reference for existing booking filter logic]
- [Source: app/redux/reducers/vatsimLiveDataReducer.js:23 — `bookings: []` and `prefiles: []` initial state]
- [Source: app/redux/reducers/vatsimLiveDataReducer.js:32-33 — `BOOKINGS_UPDATED` updates state.vatsimLiveData.bookings]
- [Source: app/redux/actions/vatsimLiveDataActions.js:274-296 — `updateBookings` thunk; booking.start/end parsed to Date objects]
- [Source: app/components/mainApp/MainApp.jsx:73 — `updateBookings` dispatched on app launch (keep this)]
- [Source: app/components/mainApp/MainApp.jsx:143-145 — `Stack.Screen name="ATC Bookings"` to REMOVE]
- [Source: app/components/EventsView/VatsimEventsView.jsx — DateRangePickerModal pure-JS implementation to extract/reuse]
- [Source: app/components/shared/ThemedText.jsx — Variants: heading, body, body-sm, caption, data, data-sm]
- [Source: app/common/themeTokens.js — tokens.fontFamily.mono, tokens.radius.md/lg, tokens.animation.duration.normal]
- [Source: __tests__/VatsimListView.test.js — Existing test file to extend; mock patterns]
- [Source: _bmad-output/implementation-artifacts/6-1-events-list-and-event-details.md — DateRangePickerModal implementation notes + @react-native-community/datetimepicker failure]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.2 — Acceptance criteria source]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Single chip row layout: Pilots/ATC (or date) chips left-aligned, Live/Scheduled toggles right-aligned — all using `TranslucentSurface` chip design matching `FilterChipsRow`
- Extracted `DateRangePickerModal` from VatsimEventsView to `app/components/shared/DatePickerModal.jsx`; `singleDate` prop supported but Scheduled mode uses full range picker
- Date filter supports a range (`scheduledDateStart` / `scheduledDateEnd`); chip label shows `18 Mar` or `18 Mar – 20 Mar`; bookings filtered by overlap, prefiles by deptime date
- `ScheduledCard.jsx`: collapsed booking shows callsign, UTC date, `HH:MM – HH:MM UTC` time window, type/division; collapsed prefile shows `aircraft_short` (fallback to `aircraft`)
- Deleted `BookingsView.jsx`, `BookingDeatils.jsx`, and `BookingsView/` directory; removed Stack.Screen from MainApp.jsx
- `parseDeptime` exported as named export for testability
- 289 tests pass, 0 regressions; ESLint clean on all modified files
- `isScheduledLoaded` guard prevents flashing "No scheduled traffic" on cold start
- `ScheduledCard.jsx` has a `LeftSlot` showing ATC facility badge (derived from callsign suffix) for bookings, and aircraft bitmap icon / ✈ fallback for prefiles — matching the live `ClientCard` visual language; card body is a horizontal row with slot (40px) + content (flex:1), vertically centered

### File List

- app/components/vatsimListView/VatsimListView.jsx (modified)
- app/components/vatsimListView/ScheduledCard.jsx (created)
- app/components/shared/DatePickerModal.jsx (created)
- app/components/EventsView/VatsimEventsView.jsx (modified)
- app/components/mainApp/MainApp.jsx (modified)
- __tests__/VatsimListView.test.js (modified)
- app/components/BookingsView/BookingsView.jsx (deleted)
- app/components/BookingsView/BookingDeatils.jsx (deleted)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)

### Change Log

- 2026-03-18: Story 6.2 implemented — Live/Scheduled toggle in VatsimListView, ScheduledCard with inline expand, shared DatePickerModal extracted, BookingsView deleted, 12 new tests added (289 total)
- 2026-03-18: Post-implementation refinements — chip row layout (filters left, toggles right), booking card shows UTC date, prefile shows aircraft_short, date filter upgraded to full range picker
- 2026-03-18: Added ATC facility badges (derived from callsign suffix) and aircraft icons/✈ fallback to ScheduledCard, matching ClientCard visual language; card layout restructured to horizontal LeftSlot + content row
