# Story 4.2: Pilot Detail — Three-Level Progressive Disclosure

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to tap a pilot marker and see their details progressively — callsign and route at a glance, then flight data, then full flight plan,
so that I can get exactly the depth of information I need without navigating away from the map.

## Acceptance Criteria

1. **AC1 — Level 1 peek content:** When user taps a pilot marker, the sheet opens to peek showing `PilotLevel1Summary`: callsign (mono/callsign variant), aircraft type, departure ICAO → arrival ICAO, current altitude, groundspeed.

2. **AC2 — Level 2 half content:** Swiping to half shows `PilotLevel2Details` ADDED below Level 1: route summary string, heading, distance remaining, time enroute, progress bar (departure → current position → arrival).

3. **AC3 — Level 3 full content:** Swiping to full shows `PilotLevel3Full` ADDED below Level 1+2: full flight plan text, transponder code, server info, remarks, time online (calculated from logon_time), pilot rating, flight rules (IFR/VFR).

4. **AC4 — Additive rendering:** Content is additive — Level 1 is always visible at all disclosure levels. Level 2 adds below Level 1. Level 3 adds below Level 1+2. Content is NEVER replaced.

5. **AC5 — Aviation data typography:** All aviation data (callsign, ICAO codes, frequencies, flight plan route, transponder, aircraft type) renders in JetBrains Mono via `ThemedText` with appropriate variants (`callsign`, `data`, `data-sm`).

6. **AC6 — PilotDetails uses provider API:** `PilotDetails.jsx` uses `useDetailPanel()` to read `disclosureLevel` and conditionally render Level sub-components. Does NOT access bottom sheet refs directly.

7. **AC7 — ClientDetails routing preserved:** `ClientDetails.jsx` continues to route to `PilotDetails` when the selected client is a pilot (facility === null). No changes to ClientDetails routing logic.

8. **AC8 — No react-native-paper in new code:** New sub-components (`PilotLevel1Summary`, `PilotLevel2Details`, `PilotLevel3Full`) use ThemedText, NativeWind classes, and StyleSheet.create() — no react-native-paper imports. PilotDetails.jsx is migrated away from Paper's Card/Text/ProgressBar/Avatar.

9. **AC9 — Accessibility:** Each level section has appropriate `accessibilityLabel` describing its content. Aviation data fields include semantic labels (e.g., "Altitude 35000 feet", not just "35000").

10. **AC10 — Live data reactivity:** When pilot data refreshes every 20s (via DetailPanelProvider's live data auto-update), the displayed values update in place without layout jumps or flicker.

## Tasks / Subtasks

- [x] Task 1: Create PilotLevel1Summary component (AC: #1, #5, #9)
  - [x] 1.1: Create `app/components/clientDetails/PilotLevel1Summary.jsx`
  - [x] 1.2: Render callsign with `ThemedText variant="callsign"`
  - [x] 1.3: Render aircraft type (`flight_plan.aircraft_short`) with `ThemedText variant="data"`
  - [x] 1.4: Render departure → arrival ICAO codes with `ThemedText variant="data"` and arrow separator
  - [x] 1.5: Render altitude (formatted with commas, "ft" suffix) and groundspeed ("kts" suffix) with `ThemedText variant="data"`
  - [x] 1.6: Handle missing flight_plan gracefully — show callsign + "No flight plan filed" in muted text
  - [x] 1.7: Add accessibilityLabel to container with semantic description

- [x] Task 2: Create PilotLevel2Details component (AC: #2, #5, #9)
  - [x] 2.1: Create `app/components/clientDetails/PilotLevel2Details.jsx`
  - [x] 2.2: Render route summary string (`flight_plan.route`) with `ThemedText variant="data-sm"`
  - [x] 2.3: Render heading (degrees), distance remaining (nm), time enroute
  - [x] 2.4: Render progress bar showing departure → current position → arrival (calculate percentage from distances)
  - [x] 2.5: Fetch airport data asynchronously using `getAirportsByICAOAsync` for departure/arrival names and coordinates
  - [x] 2.6: Calculate distances using `getDistanceFromLatLonInNm` from `timeDIstanceTools.js`
  - [x] 2.7: Handle missing airports/distances gracefully — show what's available, omit what's not

- [x] Task 3: Create PilotLevel3Full component (AC: #3, #5, #9)
  - [x] 3.1: Create `app/components/clientDetails/PilotLevel3Full.jsx`
  - [x] 3.2: Render full flight plan text (`flight_plan.route`) with `ThemedText variant="data-sm"` — full route, not truncated
  - [x] 3.3: Render transponder code (`transponder`) with `ThemedText variant="data"`
  - [x] 3.4: Render server info (`server`)
  - [x] 3.5: Render remarks (`flight_plan.remarks`) — handle empty/null
  - [x] 3.6: Render time online — calculate from `logon_time` (ISO timestamp) to human-readable duration (e.g., "2h 34m")
  - [x] 3.7: Render pilot rating (`pilot_rating`) — map numeric value to label
  - [x] 3.8: Render flight rules (`flight_plan.flight_rules`) — IFR/VFR

- [x] Task 4: Redesign PilotDetails.jsx as progressive disclosure orchestrator (AC: #4, #6, #8)
  - [x] 4.1: Import `useDetailPanel` from `../detailPanel/DetailPanelProvider`
  - [x] 4.2: Remove ALL react-native-paper imports (Card, Text, ProgressBar, Avatar, List)
  - [x] 4.3: Render `<PilotLevel1Summary pilot={pilot} />` always
  - [x] 4.4: Render `{disclosureLevel >= 2 && <PilotLevel2Details pilot={pilot} />}` conditionally
  - [x] 4.5: Render `{disclosureLevel >= 3 && <PilotLevel3Full pilot={pilot} />}` conditionally
  - [x] 4.6: Remove airport fetching logic from PilotDetails (moved to PilotLevel2Details)
  - [x] 4.7: Remove all existing StyleSheet styles and inline Paper styles

- [x] Task 5: Write unit tests (AC: #1-#10)
  - [x] 5.1: Create `__tests__/PilotLevel1Summary.test.js` — renders callsign, aircraft, route, alt/speed
  - [x] 5.2: Create `__tests__/PilotLevel2Details.test.js` — renders route, heading, distances
  - [x] 5.3: Create `__tests__/PilotLevel3Full.test.js` — renders transponder, server, remarks, time online, rating
  - [x] 5.4: Create/update `__tests__/PilotDetails.test.js` — tests disclosure level conditional rendering
  - [x] 5.5: Test PilotLevel1Summary handles missing flight_plan
  - [x] 5.6: Test PilotLevel2Details handles missing airport data
  - [x] 5.7: Run ESLint — zero new warnings
  - [x] 5.8: Run full test suite — zero regressions

- [ ] Task 6: Manual validation (AC: #1-#10)
  - [ ] 6.1: Tap pilot marker → sheet opens at peek with Level 1 content
  - [ ] 6.2: Swipe to half → Level 2 content appears below Level 1
  - [ ] 6.3: Swipe to full → Level 3 content appears below Level 1+2
  - [ ] 6.4: Wait 20s → data refreshes in place without flicker
  - [ ] 6.5: Tap pilot with no flight plan → "No flight plan filed" shown gracefully
  - [ ] 6.6: Verify JetBrains Mono font on callsign, ICAO codes, route, transponder
  - [ ] 6.7: Verify both light and dark themes render correctly
  - [ ] 6.8: Verify on iOS and Android

## Dev Notes

### Architecture Pattern: Additive Progressive Disclosure

This story implements the first concrete progressive disclosure content for the `DetailPanelProvider` established in Story 4.1. The pattern established here will be replicated in Stories 4.3 (ATC/CTR) and 4.4 (Airport).

**Architecture contract from architecture.md:**
```jsx
// In PilotDetails.jsx — THE prescribed pattern
const { disclosureLevel } = useDetailPanel();
return (
  <>
    <PilotLevel1Summary pilot={pilot} />
    {disclosureLevel >= 2 && <PilotLevel2Details pilot={pilot} />}
    {disclosureLevel >= 3 && <PilotLevel3Full pilot={pilot} />}
  </>
);
```

**Rules:**
- Level 1 is ALWAYS rendered (base content at peek)
- Level 2 ADDS below Level 1 (never replaces)
- Level 3 ADDS below Level 1+2 (never replaces)
- Each level is a separate sub-component file in `app/components/clientDetails/`

### Content Mapping (from architecture.md disclosure contract)

| Level | Height | Opacity | Pilot Content |
|---|---|---|---|
| Level 1 (peek) | ~155px | 0.45 | Callsign, aircraft type, dep→arr |
| Level 2 (half) | ~50% | 0.65 | Route summary, heading, distance, time enroute, progress bar |
| Level 3 (full) | ~90% | 0.85 | Full flight plan text, transponder, server, remarks, time online, pilot rating, flight rules |

### Pilot Data Fields Available (Redux state)

The pilot object comes from `state.vatsimLiveData.clients.pilots[]` via `state.app.selectedClient`. Key fields:

```
pilot.callsign           — "SWR100" (string)
pilot.name               — "John Doe" (string)
pilot.cid                — 1234567 (number)
pilot.altitude           — 35000 (feet, number)
pilot.groundspeed        — 450 (knots, number)
pilot.heading            — 285 (degrees 0-359, number)
pilot.latitude/longitude — position (numbers)
pilot.transponder        — "2200" (squawk code, string)
pilot.server             — "CANADA" (string)
pilot.pilot_rating       — 0-5 (number)
pilot.logon_time         — "2026-03-16T14:30:00Z" (ISO timestamp, string)
pilot.flight_plan        — object or null:
  .aircraft_short        — "B738" (string)
  .departure             — "KJFK" (ICAO, string)
  .arrival               — "EGLL" (ICAO, string)
  .route                 — "HAPIE3 HAPIE DCT ALLRY..." (string)
  .remarks               — "/v/" (string)
  .flight_rules          — "I" or "V" (string — I=IFR, V=VFR)
  .enroute_time          — minutes (number)
  .cruise_tas            — knots (number)
pilot.image              — ImageURISource (aircraft icon bitmap)
```

### Existing Components to REUSE (Do NOT Recreate)

- **`ThemedText`** (`app/components/shared/ThemedText.jsx`) — ALL text rendering. Variants: `callsign` (15px mono medium), `data` (13px mono), `data-sm` (11px mono), `body` (15px), `body-sm` (13px), `caption` (11px), `heading` (18px). Pass `color` prop for non-primary colors; use `activeTheme.text.secondary` for labels and `activeTheme.text.muted` for deemphasized content.

- **`useTheme()`** (`app/common/ThemeProvider.jsx`) — Returns `{ isDark, activeTheme, activeMapStyle }`. Use `activeTheme.text.*`, `activeTheme.surface.*`, `activeTheme.accent.*` for all colors.

- **`useDetailPanel()`** (`app/components/detailPanel/DetailPanelProvider.jsx`) — Returns `{ disclosureLevel, isOpen, open, close, selectedClient, sheetState }`. Only use `disclosureLevel` in PilotDetails — never access bottom sheet refs directly.

- **`getAirportsByICAOAsync`** (`app/common/staticDataAcessLayer.js`) — Async SQLite lookup. Returns array of airport objects `{ icao, name, latitude, longitude, ... }`. Used for resolving departure/arrival airport names and positions.

- **`getDistanceFromLatLonInNm`** (`app/common/timeDIstanceTools.js`) — Distance calculation. Signature: `({lat, lon}, {lat, lon}) → number (nautical miles)`. Note: file has typo in name ("DIstance") — do NOT rename it.

- **`airlineLogos`** (`app/common/airlineLogos.js`) — Map of 3-letter callsign prefix → logo image. Usage: `airlineLogos[pilot.callsign.substr(0,3)]`.

### Components NOT to Modify

- **`ClientDetails.jsx`** — routing logic unchanged. It already passes `pilot={pilot}` to PilotDetails when `facility === null`. Do NOT modify.
- **`DetailPanelProvider.jsx`** — already handles sheet mechanics, Redux sync, live data updates, analytics. Do NOT modify.
- **`PilotMarkers.jsx`** — continues to dispatch `clientSelected(pilot)`. Do NOT modify.
- **`MapOverlayGroup.jsx`** — already handles sheet state coordination. Do NOT modify.

### react-native-paper Removal in PilotDetails

Current `PilotDetails.jsx` imports these Paper components that must be replaced:

| Paper Component | Replacement |
|---|---|
| `Card`, `Card.Title`, `Card.Content` | Plain `View` with NativeWind classes |
| `Text` (Paper) | `ThemedText` with appropriate variant |
| `ProgressBar` | Custom progress bar using `View` + width percentage |
| `Avatar.Image` | `Image` from react-native (or omit pilot avatar — it's the aircraft icon, already shown on map) |

**Note:** The current PilotDetails renders ALL content in a single view. The redesign splits it into three Level sub-components. Content that was in the old single view redistributes as follows:
- Callsign, aircraft type, dep→arr, altitude, speed → **Level 1**
- Route, heading, distances, progress bar → **Level 2**
- Full flight plan text, remarks, transponder, server, time online, pilot rating → **Level 3**
- Name + CID, airline logo → Evaluate placement (Level 1 subtitle or Level 2 header)

### Styling Approach

**NativeWind classes for visual styling.** StyleSheet.create() ONLY for positioning/layout if needed.

Key token classes:
- `text-primary` → `activeTheme.text.primary` (main text)
- `text-secondary` → `activeTheme.text.secondary` (labels like "Alt:", "Hdg:")
- `text-muted` → `activeTheme.text.muted` (deemphasized content)

**Layout guidelines:**
- Level 1: Compact layout. Row with callsign + aircraft type on left, dep→arr on right. Below: altitude and groundspeed in a row. Total height must fit within ~155px peek.
- Level 2: Standard spacing. Data grid layout. Progress bar full width.
- Level 3: Most spacious. Flight plan text wraps naturally. Label: value pairs.

**Spacing:** Use NativeWind margin/padding classes. Level sections separated by a thin divider or spacing.

### Time Online Calculation

```javascript
// Calculate time online from logon_time
const logonDate = new Date(pilot.logon_time);
const now = new Date();
const diffMs = now - logonDate;
const hours = Math.floor(diffMs / (1000 * 60 * 60));
const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
const timeOnline = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
```

**Note:** Do NOT use `Intl` APIs for formatting — Hermes compatibility concerns per project-context.md.

### Pilot Rating Mapping

```javascript
const PILOT_RATINGS = {
    0: 'NEW',      // New Member
    1: 'PPL',      // Private Pilot License
    2: 'IR',       // Instrument Rating
    3: 'CMEL',     // Commercial Multi-Engine Land
    4: 'ATPL',     // Airline Transport Pilot License
    5: 'IRS',      // Instructor Rating
};
```

### Progress Bar (Custom)

Do NOT use react-native-paper's `ProgressBar`. Build a simple View-based progress indicator:

```jsx
<View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${percentage}%` }]} />
</View>
```

Use `StyleSheet.create()` for the progress bar styles (positioning/sizing). Use theme accent color for the fill. Track background: `activeTheme.surface.border` or similar muted color.

### ESLint Rules to Remember

- No inline styles — all styles via `StyleSheet.create()`
- No color literals — all colors from theme tokens via `useTheme()`
- No raw text — all strings inside `<ThemedText>` (which extends `<Text>`)
- No unused styles — remove any unused StyleSheet entries
- Semicolons required, single quotes, 4-space indentation

### Project Structure Notes

**New files (in `app/components/clientDetails/`):**
- `PilotLevel1Summary.jsx`
- `PilotLevel2Details.jsx`
- `PilotLevel3Full.jsx`

**Modified files:**
- `app/components/clientDetails/PilotDetails.jsx` — complete redesign as orchestrator

**Test files (in `__tests__/`):**
- `PilotLevel1Summary.test.js`
- `PilotLevel2Details.test.js`
- `PilotLevel3Full.test.js`
- `PilotDetails.test.js` (update existing or create)

### Previous Story Intelligence (4.1)

From Story 4.1 (DetailPanelProvider):
- 144/144 tests pass, 0 regressions. ESLint baseline: 5 pre-existing warnings in plugin files.
- `@gorhom/bottom-sheet` v5: use `close()` method, not `snapToIndex(-1)`.
- NativeWind `className` does NOT work on BottomSheet/BottomSheetView directly — use `StyleSheet.create()` for container, NativeWind for inner content.
- `useReducedMotion()` from reanimated for animation config.
- Mock pattern for tests: string mocks for BottomSheet components to avoid NativeWind babel plugin interference.
- `DetailPanelProvider` renders `ClientDetails` with `fill={true}` inside the sheet.
- Sheet opacity transitions are handled by the provider (surface → surface-dense → overlay) — detail components don't manage this.
- iOS Apple Maps race condition workaround (deferred dismiss + timestamp guard) is in the provider — detail components are unaffected.
- Client swap preserves snap point — detail components simply re-render with new props.

### Git Intelligence

Recent commits:
- `a41bdd0` — Restrict platforms to iOS and Android to fix EAS update web bundle failure
- `8f9510a` — Fix bottom sheet background becoming opaque after a few seconds
- `4dab325` — Implement story 4-1: DetailPanelProvider bottom sheet abstraction

Pattern: Each story creates 2-4 new files, modifies 1-3 existing files, adds tests, preserves test baseline.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.2, lines 530-546]
- [Source: _bmad-output/planning-artifacts/architecture.md — Detail Panel Provider Patterns, lines 540-574]
- [Source: _bmad-output/planning-artifacts/architecture.md — Progressive Disclosure Snap Points, lines 235-247]
- [Source: _bmad-output/planning-artifacts/architecture.md — Source tree, lines 719-724]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Pilot peek/half/full content, lines 483-498]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — DetailSheet component, lines 1210-1221]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ClientCard variants, lines 1301-1306]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ThemedText variants, lines 1295-1298]
- [Source: _bmad-output/planning-artifacts/prd.md — FR6, FR9-FR11]
- [Source: app/components/clientDetails/PilotDetails.jsx — current implementation to redesign]
- [Source: app/components/clientDetails/ClientDetails.jsx — routing logic (do not modify)]
- [Source: app/components/detailPanel/DetailPanelProvider.jsx — provider API and context]
- [Source: app/components/shared/ThemedText.jsx — typography variants]
- [Source: app/common/themeTokens.js — theme color tokens]
- [Source: app/common/timeDIstanceTools.js — distance calculation utility]
- [Source: app/common/staticDataAcessLayer.js — airport SQLite lookup]
- [Source: _bmad-output/project-context.md — coding rules and conventions]
- [Source: _bmad-output/implementation-artifacts/4-1-detailpanelprovider-bottom-sheet-abstraction.md — previous story learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

### Completion Notes List

- Tasks 1-4: Created three level sub-components (PilotLevel1Summary, PilotLevel2Details, PilotLevel3Full) and redesigned PilotDetails.jsx as a progressive disclosure orchestrator using `useDetailPanel()`. All react-native-paper imports removed from PilotDetails. Airport data fetching moved to PilotLevel2Details. Custom View-based progress bar replaces Paper's ProgressBar. All aviation data uses ThemedText mono variants. Accessibility labels with semantic descriptions on all three level containers.
- Task 5: Created 4 test files with 29 tests covering all three level components and the orchestrator. Tests verify rendering, conditional disclosure, missing data handling, and no Paper dependencies. Full suite: 173/173 pass, 0 regressions. ESLint: 0 new warnings.
- Task 6: Manual validation deferred to user.

### Change Log

- 2026-03-16: Implemented story 4-2 — three-level progressive disclosure for pilot details. Created PilotLevel1Summary, PilotLevel2Details, PilotLevel3Full sub-components. Redesigned PilotDetails.jsx as orchestrator. Added 29 unit tests. Migrated away from react-native-paper.
- 2026-03-17: Fixed airline logo layout in PilotLevel1Summary — replaced absolute positioning with flex row (contentMain flex:1 + logo on right) to prevent logo from obscuring route and altitude data on Android.

### File List

**New files:**
- `app/components/clientDetails/PilotLevel1Summary.jsx`
- `app/components/clientDetails/PilotLevel2Details.jsx`
- `app/components/clientDetails/PilotLevel3Full.jsx`
- `__tests__/PilotLevel1Summary.test.js`
- `__tests__/PilotLevel2Details.test.js`
- `__tests__/PilotLevel3Full.test.js`
- `__tests__/PilotDetails.test.js`

**Modified files:**
- `app/components/clientDetails/PilotDetails.jsx` — complete redesign as progressive disclosure orchestrator
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status updated to review
