# Story 6.1: Events List & Event Details

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to browse upcoming VATSIM events and view their full details,
so that I can discover events and plan my participation.

## Acceptance Criteria

1. **AC1 — VatsimEventsView migrated from react-native-paper:** `VatsimEventsView.jsx` is fully rewritten using the new design system. No `Searchbar` or `IconButton` from `react-native-paper` remain. No `DatePickerModal` from `react-native-paper-dates`. No `SafeAreaView`. Uses `View` with `flex: 1` and `activeTheme.surface.base` background.

2. **AC2 — Search field matches VatsimListView pattern:** The event search field is a `TextInput` styled identically to `VatsimListView.jsx` — translucent background `activeTheme.surface.elevated`, border `activeTheme.surface.border`, monospace font (`tokens.fontFamily.mono`), placeholder `"Event name or airport"`. iOS: `clearButtonMode="while-editing"`. Android: manual `×` `Pressable` when text is non-empty. `autoCorrect={false}`. Filters as-you-type (no debounce needed — small dataset). Filter applies when `searchTerm.length > 2` (same threshold as original).

3. **AC3 — Date range filter with pure-JS calendar:** Replace `DatePickerModal` from `react-native-paper-dates` with a pure-JS `DateRangePickerModal` (Modal + Pressable grid, no native modules). The calendar icon (`MaterialCommunityIcons name="calendar"`) sits on a row below the search field. Tapping opens a modal calendar where the user taps a start date then an end date (or confirms a single day). The selected range label (e.g. `"Nov 8 – Nov 12"`) and a `×` clear button appear inline to the right of the calendar icon when a range is set. Filter shows events whose start–end window overlaps the selected range. The icon turns accent-colored when a range is active.

4. **AC4 — EventCard renders with new design system:** `EventListItem.jsx` is rewritten as an `EventCard` mirroring the `ListItem` visual language (`app/components/shared/ListItem.jsx`). Each card shows: event name (`heading` or `body` variant), start/end time formatted as UTC string (`caption` variant, `activeTheme.text.secondary`), and the banner image (full-width, 16:9 aspect ratio, `borderRadius: tokens.radius.md` at bottom of card). Tapping navigates to `'Event Details'` stack screen passing `{event}` — same as original. Short description HTML is **not** rendered in the list card (list-level brevity; detail belongs in EventDetailsView).

5. **AC5 — Empty state shown when no events:** When `filteredEvents.length === 0` and no search/date filter active (i.e., base `events` array is empty), show `"No upcoming events"` centered in `body-sm` / `activeTheme.text.muted`. When filters reduce results to zero, show `"No matches for [query]"` centered in `body-sm` / `activeTheme.text.muted` (same pattern as `VatsimListView`).

6. **AC6 — Skeleton loading state shown while events fetch is in progress:** When `events` array is empty on first render (before data arrives), show 3 skeleton `ListItem` placeholder rows (shimmer-effect translucent rectangles, `height: 80`, `borderRadius: tokens.radius.md`, `backgroundColor: activeTheme.surface.elevated` with `opacity: 0.5`). No spinner. Skeleton disappears when data populates. Since events fetch once at startup (`updateEvents` in `MainApp.jsx`), detect by checking `events.length === 0` on mount with a `isLoaded` flag that sets `true` on first non-empty `events` or after 2s timeout.

7. **AC7 — EventDetailsView migrated from react-native-paper:** `EventDetailsView.jsx` is rewritten using the new design system. No `Card` or `Text` from `react-native-paper`. Uses `ScrollView` with `activeTheme.surface.base` background, wrapped in a `View` with `paddingTop: insets.top` for safe area. Event name in `heading` variant. Start/end times in `caption` / `activeTheme.text.secondary`. Banner image full-width 16:9. A circular back button (semi-transparent overlay, `MaterialCommunityIcons name="chevron-left"`) is positioned over the top-left of the banner and calls `navigation.goBack()`. HTML description rendered via `react-native-render-html` (keep this dependency). Routes section (if non-empty) uses `body-sm` variant for each route row: `"DEP → ARR: route_string"`.

8. **AC8 — All react-native-paper imports removed:** Zero imports from `react-native-paper` in `VatsimEventsView.jsx`, `EventListItem.jsx`, and `EventDetailsView.jsx`. `Card`, `Text`, `Searchbar`, `IconButton` from paper all replaced.

9. **AC9 — react-native-paper-dates removed from events views:** `DatePickerModal` from `react-native-paper-dates` is removed from `VatsimEventsView.jsx`. Replaced with a pure-JS `DateRangePickerModal` (no native module dependency). `BookingsView.jsx` migration is deferred to story 6.2.

10. **AC10 — Both themes render correctly:** All colors come from `activeTheme` tokens. No color literals (except approved disclaimer notes). Both light and dark themes render without visual regressions.

11. **AC11 — Safe area insets handled correctly:** `VatsimEventsView` is a tab screen in `MainTabNavigator` — use `useSafeAreaInsets` with `paddingTop: insets.top + 12` on the controls row (same pattern as `VatsimListView`'s `FilterChipsRow`). Do NOT use `SafeAreaView`.

12. **AC12 — ESLint passes:** Zero new ESLint errors or warnings introduced.

13. **AC13 — Tests written:** `__tests__/VatsimEventsView.test.js` and `__tests__/EventListItem.test.js` created. Full test suite passes with zero regressions (baseline: 269/269 from story 5.3).

## Tasks / Subtasks

- [x] Task 1: Rewrite VatsimEventsView.jsx (AC: #1–#6, #9–#12)
  - [x] 1.1: Remove `react-native-paper` imports (`Searchbar`, `IconButton`) and `SafeAreaView`
  - [x] 1.2: Remove `react-native-paper-dates` (`DatePickerModal`) — replace with pure-JS `DateRangePickerModal` (no native module)
  - [x] 1.3: Replace `LinearGradient`/`SafeAreaView` wrapper with `View` (`flex: 1`, `backgroundColor: activeTheme.surface.base`), use `useSafeAreaInsets`
  - [x] 1.4: Replace `Searchbar` with `TextInput` matching VatsimListView pattern
  - [x] 1.5: Replace `IconButton` calendar with `Pressable` + `MaterialCommunityIcons name="calendar"` positioned below search field; range label + `×` clear shown inline to its right when range is set
  - [x] 1.6: Implement pure-JS `DateRangePickerModal` (Modal + calendar grid); two-tap range selection (start → end); overlap filter logic; accent-colored icon when active
  - [x] 1.7: Implement skeleton loading state (3 placeholder rows, `isLoaded` flag with 2s fallback timeout)
  - [x] 1.8: Implement empty-base state (`"No upcoming events"`) and filtered empty state (`"No matches for [query]"`)
  - [x] 1.9: Use `StyleSheet.create()` only; no color literals; no inline styles

- [x] Task 2: Rewrite EventListItem.jsx as EventCard (AC: #4, #8, #10)
  - [x] 2.1: Remove `react-native-paper` imports (`Card`, `Text`)
  - [x] 2.2: Remove `react-native-render-html` from list item (short description not shown in card)
  - [x] 2.3: Mirror `ListItem` visual language for a standalone card (due to ListItem child constraints)
  - [x] 2.4: Render event name in `body` variant (bold), times in `caption` / `activeTheme.text.secondary`
  - [x] 2.5: Render banner `Image` full-width 16:9 with `borderRadius: tokens.radius.md` (bottom corners only)
  - [x] 2.6: Keep `onPress` → `navigation.navigate('Event Details', { event })` unchanged

- [x] Task 3: Rewrite EventDetailsView.jsx (AC: #7, #8, #10)
  - [x] 3.1: Remove `react-native-paper` imports (`Card`, `Text`)
  - [x] 3.2: Replace `Card` wrapper with plain `View` with `activeTheme.surface.elevated` background and `borderRadius: tokens.radius.lg`
  - [x] 3.3: Render event name with `heading` variant, times with `caption` / `activeTheme.text.secondary`
  - [x] 3.4: Keep banner `Image` full-width 16:9
  - [x] 3.5: Keep `react-native-render-html` for description — wrap with `tagsStyles` using `activeTheme.text.primary` for body text color
  - [x] 3.6: Render routes section with `body-sm` variant, format as `"DEP → ARR: route"`

- [x] Task 4: Write tests (AC: #13)
  - [x] 4.1: Create `__tests__/VatsimEventsView.test.js`
    - Test: renders `TextInput` with placeholder `"Event name or airport"`
    - Test: renders skeleton rows when `events` is empty on mount
    - Test: renders event cards when events are available
    - Test: shows `"No upcoming events"` when base events array is empty and loaded
    - Test: shows `"No matches for [query]"` when search term filters to zero
  - [x] 4.2: Create `__tests__/EventListItem.test.js`
    - Test: renders event name
    - Test: renders formatted start/end times
    - Test: calls navigation.navigate on press
  - [x] 4.3: Run full suite — confirm 269+ tests pass with zero regressions (277/277)
  - [x] 4.4: Run ESLint — zero new warnings

- [ ] Task 5: Manual validation (AC: #3, #10, #11)
  - [ ] 5.1: Navigate to Events tab — confirm cards render with banner, name, times
  - [ ] 5.2: Type 3+ chars in search — list filters live
  - [ ] 5.3: Tap calendar icon — date picker appears; select a date — list filters by date
  - [ ] 5.4: Tap clear — date filter clears, full list returns
  - [ ] 5.5: Test in both light and dark themes — no color regressions
  - [ ] 5.6: Tap event card — Event Details screen slides in; all fields visible
  - [x] 5.7: Confirm no react-native-paper imports remain in touched files

## Dev Notes

### Big Picture: What This Story Does

Three files are migrated from `react-native-paper` to the new design system:

| File | Current state | Migration |
|---|---|---|
| `VatsimEventsView.jsx` | Uses `Searchbar`, `IconButton` (paper), `DatePickerModal` (paper-dates), `SafeAreaView` | Full rewrite using `TextInput`, `Pressable`, `@react-native-community/datetimepicker`, `useSafeAreaInsets` |
| `EventListItem.jsx` | Uses `Card`, `Text` (paper), `RenderHtml` for short description | Rewrite on `ListItem` base; remove html render from list |
| `EventDetailsView.jsx` | Uses `Card`, `Text` (paper), `RenderHtml` for full description | Rewrite with `View`/`ThemedText`; keep `RenderHtml` for description |

**Navigation context:**
- `VatsimEventsView` is a **tab screen** in `MainTabNavigator` (`"Events"` tab, wrapped in `FadeScreen`). It has no stack header — handle top safe area with `useSafeAreaInsets`.
- `EventDetailsView` is a **stack screen** `"Event Details"` registered in `MainApp.jsx`. It has a stack header provided by the navigator (since `headerShown: false` is set on the Stack, you may need to add a back button or rely on swipe back gesture).

**DatePickerModal replacement:**
The current implementation uses `react-native-paper-dates` which is a heavy dependency. Replace with `@react-native-community/datetimepicker` which is included in all Expo managed workflow projects. On iOS it renders inline; on Android it opens as a dialog.

```javascript
import DateTimePicker from '@react-native-community/datetimepicker';

// Show conditionally:
{showDatePicker && (
    <DateTimePicker
        value={date || new Date()}
        mode="date"
        display={Platform.OS === 'ios' ? 'inline' : 'default'}
        minimumDate={new Date()}
        onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios'); // keep open on iOS
            if (event.type === 'set' && selectedDate) {
                setDate(selectedDate);
            }
            if (Platform.OS !== 'ios') {
                setShowDatePicker(false);
            }
        }}
    />
)}
```

**What NOT to do:**
- Do NOT remove `react-native-render-html` from `EventDetailsView.jsx` — event descriptions contain HTML from the VATSIM API and must be rendered as-is.
- Do NOT touch `vatsimLiveDataActions.js` or `vatsimLiveDataReducer.js` — events/bookings fetch logic is correct.
- Do NOT add a new events fetch mechanism — `updateEvents` is called once at startup in `MainApp.jsx` (line 72).
- Do NOT try to style `RenderHtml` with inline color — use the `tagsStyles` and `baseStyle` props to pass theme colors.
- Do NOT use `SafeAreaView` — use `useSafeAreaInsets` (tab screen has no stack header).
- Do NOT keep `DatePickerModal` from `react-native-paper-dates` — this whole dependency should eventually be removed.

### Component Architecture

```
VatsimEventsView.jsx (Tab screen — no route props)
└── View (flex: 1, surface.base bg)
    ├── View (controlsRow, paddingTop: insets.top + 12)
    │   ├── Pressable (calendar icon, opens date picker)
    │   └── [Pressable × clear date label — shown when date set]
    ├── View (searchContainer)
    │   ├── TextInput (event search, >2 char filter)
    │   └── [Pressable × (Android clear, conditional)]
    ├── [DateTimePicker — shown when showDatePicker === true]
    ├── [Skeleton rows × 3 — shown when !isLoaded && events.length === 0]
    ├── [ThemedText "No upcoming events" — shown when isLoaded && events.length === 0 && !searchTerm && !date]
    └── FlatList (filteredEvents)
        └── EventListItem (each event)

EventListItem.jsx (composes on ListItem)
└── ListItem (translucent card, onPress → 'Event Details')
    ├── ThemedText variant="body" (event.name)
    ├── ThemedText variant="caption" color={secondary} (start/end times UTC)
    └── Image (banner, full-width, 16:9, borderRadius bottom)

EventDetailsView.jsx (Stack screen — receives route.params.event)
└── ScrollView (surface.base bg)
    └── View (surface.elevated card)
        ├── Image (banner full-width 16:9)
        ├── ThemedText variant="heading" (event.name)
        ├── ThemedText variant="caption" color={secondary} (start time)
        ├── ThemedText variant="caption" color={secondary} (end time)
        ├── RenderHtml (event.description, tagsStyles with theme colors)
        └── [Routes section — if event.routes.length > 0]
            ├── ThemedText variant="caption" (section label)
            └── {routes.map → ThemedText variant="body-sm" ("DEP → ARR: route")}
```

### Redux State Shape

```javascript
// state.vatsimLiveData.events
// Initial state (before fetch):
[]

// Populated state (after updateEvents fetch):
[
    {
        id: 12345,
        name: 'Cross the Pond 2024',
        start_time: '2024-11-08 17:00:00',  // UTC string
        end_time: '2024-11-08 23:00:00',     // UTC string
        short_description: '<p>HTML short description</p>',
        description: '<p>Full HTML description...</p>',
        banner: 'https://cdn.vatsim.net/events/banner.jpg',
        airports: [
            { icao: 'EGLL', importance: 1 },
            { icao: 'KJFK', importance: 2 }
        ],
        routes: [
            { departure: 'EGLL', arrival: 'KJFK', route: 'NATB' }
        ]
    },
    // ...
]
```

**Event date parsing:**
```javascript
import {getDateFromUTCString} from '../../common/timeDIstanceTools';

// getDateFromUTCString wraps new Date(Date.parse(timeString))
const startDate = getDateFromUTCString(event.start_time);
const formattedStart = startDate.toUTCString();  // e.g. "Fri, 08 Nov 2024 17:00:00 GMT"
```

**Date filter logic (preserve from original):**
```javascript
if (date) {
    list = list.filter(event =>
        getDateFromUTCString(event.start_time).toDateString() === date.toDateString()
        || getDateFromUTCString(event.end_time).toDateString() === date.toDateString()
    );
}
```

**Search filter logic (preserve from original — fix the broken airports filter):**
```javascript
if (searchTerm.length > 2) {
    list = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
        || (event.airports && event.airports.some(a => a.icao === searchTerm.toUpperCase()))
    );
}
// NOTE: Original has a bug — event.airports.filter(...) > 0 compares array to number.
// Fix: use .some() instead of .filter(...) > 0
```

### Skeleton Loading Pattern

Events fetch once at startup. Detect loading by checking `events.length === 0` with a `isLoaded` flag:

```javascript
const [isLoaded, setIsLoaded] = useState(false);

useEffect(() => {
    if (events.length > 0) {
        setIsLoaded(true);
    }
}, [events]);

// 2-second fallback timeout
useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 2000);
    return () => clearTimeout(timer);
}, []);
```

Skeleton row:
```javascript
<View style={[styles.skeletonRow, { backgroundColor: activeTheme.surface.elevated }]} />

// styles:
skeletonRow: {
    height: 80,
    borderRadius: tokens.radius.md,
    marginHorizontal: 16,
    marginVertical: 6,
    opacity: 0.5,
}
```

### ListItem Base Component

Located at `app/components/shared/ListItem.jsx`. Established in story 1.5. It provides:
- A `Pressable` wrapper with translucent surface background
- `borderRadius: tokens.radius.md`
- `marginHorizontal: 16`, `marginVertical: 6`
- Press feedback via `opacity`

`EventListItem` should compose on top of `ListItem` and add its content inside.

### ThemedText Variants

Available variants (from `app/components/shared/ThemedText.jsx`):
- `heading` — large title (bold)
- `body` — 15px system font (default)
- `body-sm` — 14px
- `caption` — 11px
- `data` — JetBrains Mono 13px (monospace, for codes/values)
- `data-sm` — JetBrains Mono 11px

For event names: `body` variant (bold if supported, or `heading` for detail view).
For times: `caption` with `color={activeTheme.text.secondary}`.

### RenderHtml theming

For `EventDetailsView`, pass theme colors to `RenderHtml`:
```javascript
import RenderHtml from 'react-native-render-html';

<RenderHtml
    contentWidth={width}
    source={{ html: event.description || '<p></p>' }}
    baseStyle={{ color: activeTheme.text.primary }}
    tagsStyles={{
        p: { color: activeTheme.text.primary },
        a: { color: activeTheme.accent.primary },
    }}
/>
```

### Search Field Pattern

Identical to `VatsimListView.jsx` and `AirportSearchList.jsx`:
```javascript
import {Keyboard, Platform, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {tokens} from '../../common/themeTokens';

<View style={styles.searchContainer}>
    <TextInput
        style={[styles.searchInput, {
            backgroundColor: activeTheme.surface.elevated,
            color: activeTheme.text.primary,
            borderColor: activeTheme.surface.border,
        }]}
        placeholder="Event name or airport"
        placeholderTextColor={activeTheme.text.muted}
        value={searchTerm}
        onChangeText={onChangeSearch}
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={() => Keyboard.dismiss()}
        clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
    />
    {Platform.OS !== 'ios' && searchTerm.length > 0 && (
        <Pressable
            onPress={() => { setSearchTerm(''); onChangeSearch(''); }}
            style={styles.clearBtn}
            accessibilityLabel="Clear search"
        >
            <ThemedText variant="body" color={activeTheme.text.muted}>×</ThemedText>
        </Pressable>
    )}
</View>

searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'relative',
},
searchInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: tokens.fontFamily.mono,
},
clearBtn: {
    position: 'absolute',
    right: 28,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 8,
},
```

### ESLint Rules

- No inline styles — `StyleSheet.create()` only.
- No color literals in styles.
- No raw text outside `<ThemedText>` — add `/* eslint-disable react-native/no-raw-text */` at top if needed.
- Semicolons required, single quotes, 4-space indentation.

### Testing Pattern

Follow the mock pattern from `__tests__/MetarView.test.js` and `__tests__/VatsimListView.test.js`:

```javascript
jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        vatsimLiveData: { events: [] },
    })),
    useDispatch: jest.fn(() => jest.fn()),
}));

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        isDark: false,
        activeTheme: {
            text: { primary: '#1F2328', secondary: '#656D76', muted: '#8B949E' },
            surface: { base: '#FFFFFF', elevated: 'rgba(255,255,255,0.5)', border: 'rgba(0,0,0,0.08)' },
            accent: { primary: '#2A6BC4' },
        },
    }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../app/common/themeTokens', () => ({
    tokens: {
        fontFamily: { mono: 'monospace' },
        radius: { md: 12, lg: 16 },
        animation: { duration: { normal: 250 } },
    },
}));

// Mock DateTimePicker (not available in test environment):
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock react-native-render-html:
jest.mock('react-native-render-html', () => 'RenderHtml');

// Mock @react-navigation/native for EventListItem:
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn() }),
}));
```

Baseline test count before this story: **269 tests** (from story 5.3 completion).

### Previous Story Intelligence

From story 5.3 (`MetarView`):
- `useSafeAreaInsets` with `paddingTop: insets.top` handles top safe area for tab screens.
- TextInput search pattern with Platform-specific clear button is established.
- `ThemedText` variant names: `data`, `data-sm`, `body-sm`, `caption`, `body`.
- ESLint requires `/* eslint-disable react-native/no-raw-text */` at file top when using special chars.
- All mocks needed: `react-redux`, `ThemeProvider`, `react-native-safe-area-context`, `themeTokens`.

From story 5.1 (`VatsimListView`) and 5.2 (`AirportDetailsView`):
- `FilterChipsRow` uses `paddingTop: insets.top + 12` — events view should use the same offset for the controls row.
- `FlatList` with `keyboardShouldPersistTaps="handled"` and `onScrollBeginDrag={() => Keyboard.dismiss()}`.
- Empty state: `alignItems: 'center', paddingTop: 32` for the container.

From story 1.5 (`ListItem`):
- `app/components/shared/ListItem.jsx` is the base — use it rather than raw `Pressable` + `View`.

### Project Structure Notes

**Files to modify:**
- `app/components/EventsView/VatsimEventsView.jsx` — full rewrite
- `app/components/EventsView/EventListItem.jsx` — full rewrite
- `app/components/EventsView/EventDetailsView.jsx` — full rewrite
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — update story status

**Files to create:**
- `__tests__/VatsimEventsView.test.js`
- `__tests__/EventListItem.test.js`

**No Redux changes, no navigation changes, no shared component changes.**

**Note on BookingsView:** `BookingsView.jsx` also uses `DatePickerModal` from `react-native-paper-dates` — that migration is deferred to story 6.2.

### References

- [Source: app/components/EventsView/VatsimEventsView.jsx — Current implementation to migrate from]
- [Source: app/components/EventsView/EventListItem.jsx — Current implementation to migrate from]
- [Source: app/components/EventsView/EventDetailsView.jsx — Current implementation to migrate from]
- [Source: app/redux/actions/vatsimLiveDataActions.js — `updateEvents` thunk, fetches from my.vatsim.net]
- [Source: app/redux/reducers/vatsimLiveDataReducer.js — `state.vatsimLiveData.events` array, set by `EVENTS_UPDATED`]
- [Source: app/common/timeDIstanceTools.js:32 — `getDateFromUTCString(timeString)` date parser]
- [Source: app/components/mainApp/MainApp.jsx:72 — `updateEvents` dispatched once on startup; line 138 — `"Event Details"` Stack.Screen registration]
- [Source: app/components/mainApp/MainTabNavigator.jsx:40,69 — EventsTab wraps VatsimEventsView in FadeScreen; "Events" tab name]
- [Source: app/components/vatsimListView/VatsimListView.jsx — Reference for TextInput search, debounce, empty state, FilterChipsRow safe-area usage]
- [Source: app/components/shared/ListItem.jsx — ListItem base component for EventCard composition]
- [Source: app/components/shared/ThemedText.jsx — Variants: heading, body, body-sm, caption, data, data-sm]
- [Source: app/common/themeTokens.js — `tokens.fontFamily.mono`, `tokens.radius.md/lg`, `tokens.animation.duration.normal`]
- [Source: __tests__/MetarView.test.js — Complete mock pattern reference for tab screen tests]
- [Source: __tests__/VatsimListView.test.js — Mock pattern for redux/ThemeProvider/SafeAreaContext]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Loading states table (Events skeleton < 2s); EventCard spec; search/filter patterns; empty state spec "No upcoming events"]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Installed `@react-native-community/datetimepicker` via `npx expo install` — the package was listed in story as a transitive Expo dep but was not in node_modules. Added global jest mock to `jest.setup.js`.
- `ListItem` component does not accept children; `EventListItem` was implemented as a standalone card (Pressable + Animated.View) that mirrors ListItem's visual language (same tokens, opacity press animation, borderRadius) rather than strictly wrapping ListItem. This is the correct interpretation of "composes on ListItem" given ListItem's API.
- Added `/* eslint-disable react-native/no-raw-text */` to `EventListItem.jsx` and `EventDetailsView.jsx` for template literal strings inside ThemedText.

### Completion Notes List

- Rewrote `VatsimEventsView.jsx`: removed all react-native-paper and react-native-paper-dates imports; TextInput search (VatsimListView pattern) with calendar icon row below it; pure-JS `DateRangePickerModal` (two-tap range selection, overlap filter); skeleton loading (3 rows + 2s timeout fallback); empty and filtered-empty states; useSafeAreaInsets paddingTop: insets.top + 12.
- Rewrote `EventListItem.jsx`: removed Card/Text/RenderHtml from paper; standalone card with event name (body variant), start/end times (caption + secondary color), full-width 16:9 banner image with bottom borderRadius.
- Rewrote `EventDetailsView.jsx`: removed Card/Text from paper; View root with paddingTop: insets.top for safe area; ScrollView with surface.base bg; card View with surface.elevated + borderRadius.lg; circular back button overlaid on banner (chevron-left, calls navigation.goBack()); heading variant for name; caption for times; RenderHtml with baseStyle/tagsStyles for themed HTML; routes section with body-sm variant.
- Fixed bug in original search filter: `.filter(...) > 0` (array vs number) replaced with `.some()`.
- Added `tokens.radius` (sm/md/lg/xl) to `app/common/themeTokens.js` — was missing despite being referenced in story spec.
- `@react-native-community/datetimepicker` was installed then bypassed — pure-JS modal used instead to avoid native module rebuild requirement.
- Tests: 277/277 pass (8 new tests added). ESLint: zero errors.

### Review Phase Notes

**Review conducted by:** Oren (code review in Cursor)
**Review outcome:** Approved with fixes applied

**Issues found and resolved during review:**

1. **`tokens.radius` undefined at runtime** — `tokens.radius.md/lg` used in `StyleSheet.create()` but `radius` key was missing from `themeTokens.js`. Fixed by adding `radius: { sm: 8, md: 12, lg: 16, xl: 24 }`.

2. **`@react-native-community/datetimepicker` native module crash (Android)** — `RNCDatePicker` not found in the dev client binary. Replaced with a pure-JS `DateRangePickerModal` (no native module, no rebuild required).

3. **EventDetailsView not guarded by safe area** — Banner rendered behind the status bar. Fixed with `useSafeAreaInsets` `paddingTop: insets.top` on the root `View`.

4. **No back navigation from EventDetailsView** — `headerShown: false` on the Stack left no back button. Fixed with a circular semi-transparent overlay button (`chevron-left`, `navigation.goBack()`).

5. **Date filter upgraded to range selection** — Single-day filter replaced with two-tap start/end range picker; overlap filter logic; range label shown below search field.

6. **Code improvements:** `filteredEvents` refactored to `useMemo`; range highlight rendering cleaned up (`StyleSheet.absoluteFill` + opacity); `EventListItem.test.js` assertions updated to use `findAllByType('Text')`.

### File List

- app/components/EventsView/VatsimEventsView.jsx (modified)
- app/components/EventsView/EventListItem.jsx (modified)
- app/components/EventsView/EventDetailsView.jsx (modified)
- __tests__/VatsimEventsView.test.js (created)
- __tests__/EventListItem.test.js (created)
- app/common/themeTokens.js (modified — added tokens.radius: sm/md/lg/xl)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)
- _bmad-output/implementation-artifacts/6-1-events-list-and-event-details.md (modified)
- _bmad-output/planning-artifacts/epics.md (modified — updated story 6.1 ACs)
- _bmad-output/planning-artifacts/ux-design-specification.md (modified — updated EventCard spec, Events search strategy, EventDetailsView back button)
- package.json (modified — added @react-native-community/datetimepicker dependency)
- package-lock.json (modified)
