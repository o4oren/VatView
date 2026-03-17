# Story 4.2.1: Refactor Pilot Detail from Three-Level Components to Single Card

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to consolidate PilotLevel1Summary, PilotLevel2Details, and PilotLevel3Full into a single PilotDetailCard component,
so that the progressive disclosure is driven purely by sheet snap points rather than conditional content rendering.

## Acceptance Criteria

1. **AC1 — Single card component:** A single `PilotDetailCard.jsx` component exists in `app/components/clientDetails/` containing all pilot detail content ordered by information priority (glanceable summary at top, full flight plan at bottom).

2. **AC2 — Three-level components removed:** `PilotLevel1Summary.jsx`, `PilotLevel2Details.jsx`, and `PilotLevel3Full.jsx` are deleted from `app/components/clientDetails/`.

3. **AC3 — No conditional rendering:** `PilotDetails.jsx` no longer reads `disclosureLevel` from `useDetailPanel()` — it renders `PilotDetailCard` unconditionally.

4. **AC4 — Scrollable card:** The card scrolls within the sheet when content exceeds the visible area at any snap point (already handled by `BottomSheetScrollView` in `DetailPanelProvider`).

5. **AC5 — Peek content (~155px):** The visible portion at peek shows: callsign, aircraft type, departure → arrival, altitude, groundspeed, pilot name/CID, airline logo.

6. **AC6 — Half content (~50%):** The visible portion at half additionally shows: HDG/DIST/REM/ETE data grid, progress bar with departure→arrival labels, flight plan route string.

7. **AC7 — Full content (~70%):** The complete card is visible: transponder, server, rating, flight rules, time online, remarks.

8. **AC8 — Visual parity:** The visual result is identical to the previous three-level implementation — same content, same order, same styling, same dividers between sections.

9. **AC9 — Typography preserved:** All existing ThemedText variants and JetBrains Mono usage carry over unchanged (callsign, data, data-sm, body-sm, caption).

10. **AC10 — Tests updated:** Tests for the new PilotDetailCard replace the three removed test files. PilotDetails.test.js updated to verify unconditional rendering (no disclosure level logic). Full test suite passes with zero regressions.

11. **AC11 — Cross-platform validation:** Manual testing confirms peek/half/full snap points show the expected content portions on both iOS and Android.

## Tasks / Subtasks

- [x] Task 1: Create PilotDetailCard.jsx (AC: #1, #5, #6, #7, #8, #9)
  - [x] 1.1: Create `app/components/clientDetails/PilotDetailCard.jsx`
  - [x] 1.2: Merge PilotLevel1Summary content as top section (callsign row, aircraft type, dep→arr, alt/speed, name/CID, airline logo)
  - [x] 1.3: Add divider, then merge PilotLevel2Details content as middle section (data grid: HDG/DIST/REM/ETE, progress bar, flight plan route)
  - [x] 1.4: Add divider, then merge PilotLevel3Full content as bottom section (transponder, server, rating, rules, time online, remarks)
  - [x] 1.5: Preserve all airport data fetching logic (useEffect with getAirportsByICAOAsync) from PilotLevel2Details
  - [x] 1.6: Preserve all helper functions: formatAltitude, formatEnrouteTime, formatTimeOnline, PILOT_RATINGS, FLIGHT_RULES, DataField
  - [x] 1.7: Preserve accessibilityLabels — combine into single card-level label or section-level labels
  - [x] 1.8: Merge all StyleSheet.create() styles from the three components, deduplicating where possible

- [x] Task 2: Simplify PilotDetails.jsx (AC: #3)
  - [x] 2.1: Remove `useDetailPanel` import and `disclosureLevel` usage
  - [x] 2.2: Remove imports of PilotLevel1Summary, PilotLevel2Details, PilotLevel3Full
  - [x] 2.3: Import and render `<PilotDetailCard pilot={pilot} />` unconditionally
  - [x] 2.4: PilotDetails becomes a thin wrapper — just returns `<PilotDetailCard pilot={pilot} />`

- [x] Task 3: Remove three-level components (AC: #2)
  - [x] 3.1: Delete `app/components/clientDetails/PilotLevel1Summary.jsx`
  - [x] 3.2: Delete `app/components/clientDetails/PilotLevel2Details.jsx`
  - [x] 3.3: Delete `app/components/clientDetails/PilotLevel3Full.jsx`

- [x] Task 4: Update tests (AC: #10)
  - [x] 4.1: Create `__tests__/PilotDetailCard.test.js` — test all content renders (callsign, route, data grid, progress bar, transponder, rating, etc.)
  - [x] 4.2: Test missing flight_plan shows "No flight plan filed"
  - [x] 4.3: Test missing airport data gracefully omits distance/progress fields
  - [x] 4.4: Update `__tests__/PilotDetails.test.js` — verify unconditional PilotDetailCard rendering (no disclosure level logic)
  - [x] 4.5: Delete `__tests__/PilotLevel1Summary.test.js`
  - [x] 4.6: Delete `__tests__/PilotLevel2Details.test.js`
  - [x] 4.7: Delete `__tests__/PilotLevel3Full.test.js`
  - [x] 4.8: Run full test suite — zero regressions
  - [x] 4.9: Run ESLint — zero new warnings

- [ ] Task 5: Manual validation (AC: #11)
  - [ ] 5.1: Tap pilot marker → sheet opens at peek, top of card visible (callsign, aircraft, dep→arr, alt, speed)
  - [ ] 5.2: Swipe to half → middle section visible (data grid, progress bar, flight plan)
  - [ ] 5.3: Swipe to full → bottom section visible (transponder, server, rating, rules, time online, remarks)
  - [ ] 5.4: Content scrolls within sheet if it exceeds visible area
  - [ ] 5.5: Tap pilot with no flight plan → "No flight plan filed" shown gracefully
  - [ ] 5.6: Wait 20s → data refreshes in place without flicker
  - [ ] 5.7: Verify on both iOS and Android

### Review Follow-ups (AI)
- [x] [AI-Review][High] Fix `!fp` early return so Section 3 (Rating, Server, Time Online, Transponder) still renders for observers/ground traffic
- [x] [AI-Review][High] Move `accessibilityLabel` from root View to section wrapper Views so text nodes are not swallowed
- [x] [AI-Review][Medium] Fix crash risk by changing `pilot.callsign.substr(0, 3)` to `pilot.callsign?.substring(0, 3)`
- [x] [AI-Review][Medium] Replace meaningless wrapper test in `PilotDetails.test.js` with a test that asserts the exact wrapper behavior
- [x] [AI-Review][Low] Prevent executing empty SQLite query by checking `[fp.departure, fp.arrival].filter(Boolean).length > 0` before querying

## Dev Notes

### Core Concept: Single Card Replaces Three-Level Components

This is a **simplification refactor**, not new functionality. The bottom sheet already has `BottomSheetScrollView` and snap points at `[155, '50%', '70%']` that physically gate what the user sees. The three-level conditional rendering (`disclosureLevel >= 2`, `disclosureLevel >= 3`) duplicated this gating in code. The single card renders ALL content unconditionally — the sheet mechanics do all the work.

**What changes:** Content rendering approach (3 components → 1).
**What does NOT change:** DetailPanelProvider, sheet snap points, animations, TranslucentSurface opacity, ClientDetails routing, MapOverlayGroup coordination.

### Content Order (Top to Bottom in PilotDetailCard)

This is the exact content order matching the existing three-level layout:

**Section 1 — Peek visible (~155px):** (from PilotLevel1Summary)
- Callsign + aircraft type row (left), dep→arr ICAO row (right), airline logo (far right)
- Altitude (ft) + groundspeed (kts) row
- Pilot name + CID

**Divider**

**Section 2 — Half visible (~50%):** (from PilotLevel2Details)
- Data grid: HDG, DIST, REM, ETE (centered items in row)
- Progress bar: departure ICAO → percentage → arrival ICAO, track with fill, airport names
- Flight plan route string (label: "FLIGHT PLAN")

**Divider**

**Section 3 — Full visible (~70%):** (from PilotLevel3Full)
- Grid: SQUAWK, SERVER, RATING, RULES, ONLINE (DataField components)
- Remarks section (if present)

### Existing Code to Merge (Source Files)

All three source files are well-structured and their content merges cleanly into a single component:

**From `PilotLevel1Summary.jsx` (128 lines):**
- `formatAltitude()` helper
- `airlineLogos` import and logo rendering
- Callsign/aircraft/route/altitude/speed layout with flex row for logo
- Missing flight_plan handling ("No flight plan filed")
- Styles: container, contentRow, contentMain, topRow, callsignRow, routeRow, dataRow, nameRow, logo

**From `PilotLevel2Details.jsx` (178 lines):**
- Airport data async fetching (`getAirportsByICAOAsync`, `getDistanceFromLatLonInNm`)
- `useState` for airports, `useEffect` with cleanup for async fetch
- Distance/progress calculations (totalDist, flownDist, remaining, percentage)
- `formatEnrouteTime()` helper
- Custom progress bar (View-based, not react-native-paper)
- Styles: divider, dataGrid, dataItem, progressSection, progressLabels, progressTrack, progressFill, routeSection

**From `PilotLevel3Full.jsx` (140 lines):**
- `PILOT_RATINGS` and `FLIGHT_RULES` lookup maps
- `formatTimeOnline()` helper
- `DataField` sub-component (label + value)
- Styles: divider, section, grid, dataField

### DetailPanelProvider — What NOT to Change

The `DetailPanelProvider` (`app/components/detailPanel/DetailPanelProvider.jsx`) does NOT need any changes. Key points:
- `disclosureLevel` state and `SNAP_TO_DISCLOSURE` mapping remain — they are still used by `MapOverlayGroup` for floating element coordination (filter chips hide at half, nav island hides at full)
- `handleSheetAnimate` still updates `disclosureLevel` — this is consumed via `useDetailPanel()` by MapOverlayGroup, NOT by detail content components
- The `BottomSheetScrollView` already wraps `ClientDetails` — scrolling works automatically
- `SNAP_POINTS = [155, '50%', '70%']` unchanged
- `SNAP_TO_OPACITY` unchanged (all 'surface')

### ClientDetails.jsx — What NOT to Change

`ClientDetails.jsx` routes to `PilotDetails` when `facility === null`. No changes needed. The routing logic is:
```jsx
if (client.facility == null) return <PilotDetails pilot={client} />;
```

### Components to REUSE (Do NOT Recreate)

- **`ThemedText`** (`app/components/shared/ThemedText.jsx`) — ALL text. Variants: `callsign` (15px mono medium), `data` (13px mono), `data-sm` (11px mono), `body` (15px), `body-sm` (13px), `caption` (11px), `heading` (18px).
- **`useTheme()`** (`app/common/ThemeProvider.jsx`) — `{ isDark, activeTheme, activeMapStyle }`. Use `activeTheme.text.*`, `activeTheme.surface.*`, `activeTheme.accent.*`.
- **`getAirportsByICAOAsync`** (`app/common/staticDataAcessLayer.js`) — Async SQLite lookup. Returns `[{ icao, name, latitude, longitude }]`.
- **`getDistanceFromLatLonInNm`** (`app/common/timeDIstanceTools.js`) — Note: file has typo "DIstance" — do NOT rename.
- **`airlineLogos`** (`app/common/airlineLogos.js`) — `airlineLogos[pilot.callsign.substr(0,3)]` for airline logo image.

### ESLint Rules

- No inline styles — `StyleSheet.create()` only
- No color literals — all from `activeTheme` via `useTheme()`
- No raw text outside `<ThemedText>`
- Semicolons required, single quotes, 4-space indentation

### Testing Pattern

Tests use string mocks for `@gorhom/bottom-sheet` components to avoid NativeWind babel plugin interference. Mock pattern from previous stories:
```javascript
jest.mock('@gorhom/bottom-sheet', () => ({
    __esModule: true,
    default: 'BottomSheet',
    BottomSheetScrollView: 'BottomSheetScrollView',
}));
```

For `PilotDetailCard` tests, mock:
- `../../common/ThemeProvider` → return `activeTheme` with standard token structure
- `../../common/staticDataAcessLayer` → mock `getAirportsByICAOAsync` to return test airports
- `../../common/timeDIstanceTools` → mock `getDistanceFromLatLonInNm` to return fixed value
- `../../common/airlineLogos` → mock with test logo

Current test baseline: **173/173 pass**. ESLint baseline: 5 pre-existing warnings in plugin files.

### Project Structure Notes

**New files:**
- `app/components/clientDetails/PilotDetailCard.jsx`
- `__tests__/PilotDetailCard.test.js`

**Modified files:**
- `app/components/clientDetails/PilotDetails.jsx` — simplified to thin wrapper

**Deleted files:**
- `app/components/clientDetails/PilotLevel1Summary.jsx`
- `app/components/clientDetails/PilotLevel2Details.jsx`
- `app/components/clientDetails/PilotLevel3Full.jsx`
- `__tests__/PilotLevel1Summary.test.js`
- `__tests__/PilotLevel2Details.test.js`
- `__tests__/PilotLevel3Full.test.js`

### Previous Story Intelligence (4.2)

From Story 4.2 implementation:
- Airport data async fetch requires `mounted` flag cleanup pattern to avoid state updates on unmounted components
- `formatAltitude` uses `toLocaleString('en-US')` for comma-separated altitude — works on Hermes
- Progress bar uses View-based approach (not react-native-paper) with `activeTheme.accent.primary` fill and `activeTheme.surface.border` track
- `formatTimeOnline` handles NaN and negative diff values (fixed in review)
- Airline logo uses flex row layout (contentMain flex:1 + logo on right) — absolute positioning caused Android overlay issues (fixed in review)
- Dividers use `StyleSheet.hairlineWidth` height with `activeTheme.surface.border` color
- 173/173 tests pass, 0 regressions after story 4.2

### Git Intelligence

Recent commits on 2.0.0 branch:
- `50d30ff` — Correct course: replace three-level progressive disclosure with single-card model (planning artifacts updated)
- `7360bfd` — change route heading to FLIGHT PLAN in PilotLevel2Details
- `d654e37` — adjust Level 3 disclosure height to 70%
- `aa013ee` — Implement story 4-2: Pilot detail three-level progressive disclosure

Pattern: Story implementation creates/modifies files, adds tests, preserves test baseline. Recent commit `50d30ff` already updated planning artifacts (PRD, architecture, UX, epics) to reflect the single-card model.

### References

- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-03-17.md — Story 4.2.1 definition and rationale]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 4.2.1 acceptance criteria, lines 551-571]
- [Source: _bmad-output/planning-artifacts/architecture.md — Single-card content model, lines 544-569]
- [Source: _bmad-output/planning-artifacts/architecture.md — Source tree PilotDetailCard, lines 716-717]
- [Source: app/components/clientDetails/PilotLevel1Summary.jsx — Section 1 source (128 lines)]
- [Source: app/components/clientDetails/PilotLevel2Details.jsx — Section 2 source (178 lines)]
- [Source: app/components/clientDetails/PilotLevel3Full.jsx — Section 3 source (140 lines)]
- [Source: app/components/clientDetails/PilotDetails.jsx — Orchestrator to simplify (18 lines)]
- [Source: app/components/detailPanel/DetailPanelProvider.jsx — Provider unchanged, disclosureLevel retained for MapOverlayGroup]
- [Source: _bmad-output/implementation-artifacts/4-2-pilot-detail-three-level-progressive-disclosure.md — Previous story learnings and change log]
- [Source: _bmad-output/project-context.md — Coding rules and conventions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

None — clean implementation, no debugging required.

### Completion Notes List

- Merged PilotLevel1Summary (128 lines), PilotLevel2Details (178 lines), PilotLevel3Full (140 lines) into single PilotDetailCard.jsx (270 lines)
- PilotDetails.jsx simplified from 18 lines with disclosure gating to 6-line thin wrapper
- All helper functions preserved: formatAltitude, formatEnrouteTime, formatTimeOnline, PILOT_RATINGS, FLIGHT_RULES, DataField
- Airport async fetch with mounted-flag cleanup pattern preserved
- Accessibility labels preserved at card level
- All StyleSheet styles merged and deduplicated (divider shared between sections, renamed grid→fullGrid to avoid collision with dataGrid)
- 20 tests in PilotDetailCard.test.js covering all three sections + edge cases
- 3 tests in PilotDetails.test.js verifying unconditional rendering without disclosureLevel dependency
- Test suite: 166/166 pass (net -7 from consolidated test files removing redundant disclosure-level gating tests)
- ESLint: 0 new warnings
- Task 5 (manual validation) left unchecked — requires user testing on device

### Change Log

- 2026-03-17: Story 4.2.1 implementation — consolidated three-level pilot detail components into single PilotDetailCard
- 2026-03-17: Senior Developer Review (AI) — fixed `!fp` regression, restored fine-grained accessibility nodes, addressed null safety and redundant SQL query.

### File List

**New files:**
- `app/components/clientDetails/PilotDetailCard.jsx`
- `__tests__/PilotDetailCard.test.js`

**Modified files:**
- `app/components/clientDetails/PilotDetails.jsx`
- `__tests__/PilotDetails.test.js`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

**Deleted files:**
- `app/components/clientDetails/PilotLevel1Summary.jsx`
- `app/components/clientDetails/PilotLevel2Details.jsx`
- `app/components/clientDetails/PilotLevel3Full.jsx`
- `__tests__/PilotLevel1Summary.test.js`
- `__tests__/PilotLevel2Details.test.js`
- `__tests__/PilotLevel3Full.test.js`
