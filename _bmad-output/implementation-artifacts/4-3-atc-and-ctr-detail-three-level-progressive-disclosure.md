# Story 4.3: ATC & CTR Detail — Single Complete Cards

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to tap an ATC polygon or controller element and see their details progressively,
so that I can quickly check frequencies and coverage without leaving the map.

## Acceptance Criteria

1. **AC1 — AtcDetailCard component:** A single `AtcDetailCard.jsx` component exists in `app/components/clientDetails/` containing all ATC controller detail content ordered by information priority. No conditional rendering based on disclosure level.

2. **AC2 — CtrDetailCard component:** A single `CtrDetailCard.jsx` component exists in `app/components/clientDetails/` containing CTR/Center controller detail. The card top shows the primary controller; scrolling reveals all controllers in the FIR. No conditional rendering based on disclosure level.

3. **AC3 — AtcDetails.jsx simplified:** `AtcDetails.jsx` becomes a thin wrapper that renders `<AtcDetailCard atc={atc} />` unconditionally (same role as PilotDetails.jsx after Story 4.2.1).

4. **AC4 — CtrDetails.jsx simplified:** `CtrDetails.jsx` becomes a thin wrapper that renders `<CtrDetailCard ctr={ctr} prefix={prefix} />` unconditionally.

5. **AC5 — ATC peek content (~155px):** The visible portion at peek shows: callsign (mono/callsign variant), frequency, facility type short label (TWR/APP/DEP/GND/DEL/FSS), ATIS indicator (if ATIS text is present). For FSS controllers, the UIR name from `state.staticAirspaceData.uirs` is shown as the sector label instead of a FIR name.

6. **AC6 — ATC half content (~50%):** The half snap additionally shows: controller name + CID, controller rating, time online (logon time formatted), ATIS summary (first line of text_atis array if available).

7. **AC7 — ATC full content (~70%):** The complete card shows: full ATIS text (all lines), remarks section if present.

8. **AC8 — CTR peek content (~155px):** The visible portion at peek shows: CTR callsign (mono), frequency, facility type label (CTR/Enroute), sector name (FIR name from firResolver).

9. **AC9 — CTR half content (~50%):** Additionally shows: primary controller name + CID, rating, time online, list of all controllers in FIR (callsign + frequency for each).

10. **AC10 — CTR full content (~70%):** The complete card shows: full ATIS text for each controller that has it, any remarks.

11. **AC11 — Visual design parity with PilotDetailCard:** Same ThemedText variants, dividers (StyleSheet.hairlineWidth + activeTheme.surface.border), DataField sub-component, spacing, and NativeWind avoidance (StyleSheet.create() only). No react-native-paper Card/Avatar/Text usage.

12. **AC12 — Old react-native-paper code removed:** The old `AtcDetails.jsx` and `CtrDetails.jsx` implementations using `react-native-paper` Card, Avatar, Text components are replaced entirely. No react-native-paper imports in these two files.

13. **AC13 — ClientDetails.jsx routing unchanged:** `ClientDetails.jsx` already routes to `AtcDetails` and `CtrDetails` correctly — no changes needed.

14. **AC14 — Tests written:** `__tests__/AtcDetailCard.test.js` and `__tests__/CtrDetailCard.test.js` created. `__tests__/AtcDetails.test.js` and `__tests__/CtrDetails.test.js` updated to verify thin-wrapper rendering. Full test suite passes with zero regressions.

15. **AC15 — Cross-platform validation:** Manual testing confirms peek/half/full snap points show the expected content portions on both iOS and Android.

## Tasks / Subtasks

- [x] Task 1: Create AtcDetailCard.jsx (AC: #1, #5, #6, #7, #11, #12)
  - [x] 1.1: Create `app/components/clientDetails/AtcDetailCard.jsx`
  - [x] 1.2: Section 1 (Peek ~155px): callsign row + frequency + facility short label + ATIS indicator dot
  - [x] 1.3: Divider, then Section 2 (Half ~50%): controller name/CID row + rating + time online + ATIS first line (if present)
  - [x] 1.4: Divider, then Section 3 (Full ~70%): full ATIS text (all lines joined) + remarks (if present)
  - [x] 1.5: Format time online using same `formatTimeOnline()` helper as PilotDetailCard (copy or extract to shared util)
  - [x] 1.6: Use `ATC_RATINGS` lookup map for rating display (see Dev Notes)
  - [x] 1.7: Use `facilities[atc.facility].short` for facility type label
  - [x] 1.8: ATIS indicator: small colored dot (activeTheme.accent.primary) shown in callsign row when `atc.text_atis` is non-empty
  - [x] 1.9: Apply same StyleSheet.create() patterns, ThemedText variants, useTheme() as PilotDetailCard
  - [x] 1.10: For FSS facility — use `useSelector(state => state.staticAirspaceData.uirs)` to look up UIR name: `uirs[prefix]?.name` shown as sector label beneath the callsign row (same position as facility name for other types)

- [x] Task 2: Create CtrDetailCard.jsx (AC: #2, #8, #9, #10, #11, #12)
  - [x] 2.1: Create `app/components/clientDetails/CtrDetailCard.jsx`
  - [x] 2.2: Accept props: `ctr` (array of controller objects), `prefix` (string)
  - [x] 2.3: Section 1 (Peek ~155px): primary controller callsign (mono) + frequency + "CTR" facility label + sector name from `getFirFromPrefix(prefix, firs)` from Redux state
  - [x] 2.4: Divider, then Section 2 (Half ~50%): primary controller name/CID + rating + time online + list of ALL controllers in FIR (callsign + frequency row for each)
  - [x] 2.5: Divider, then Section 3 (Full ~70%): full ATIS text for each controller that has it (labeled by callsign) + any remarks
  - [x] 2.6: Primary controller = first element in `ctr` array (highest facility type; already sorted by Redux)
  - [x] 2.7: Use `useSelector` to read `state.staticAirspaceData.firs` for sector name lookup
  - [x] 2.8: Apply same styling conventions as AtcDetailCard

- [x] Task 3: Simplify AtcDetails.jsx (AC: #3, #12)
  - [x] 3.1: Replace entire AtcDetails.jsx content: import AtcDetailCard, return `<AtcDetailCard atc={props.atc} />`
  - [x] 3.2: Remove all react-native-paper imports (Card, Avatar, Text)
  - [x] 3.3: Remove `showAtis` prop (no longer needed — card always shows ATIS)
  - [x] 3.4: Verify ClientDetails.jsx passes `atc={props.client}` correctly (it does — no change needed)

- [x] Task 4: Simplify CtrDetails.jsx (AC: #4, #12)
  - [x] 4.1: Replace entire CtrDetails.jsx content: import CtrDetailCard, return `<CtrDetailCard ctr={ctr} prefix={prefix} />`
  - [x] 4.2: Remove react-native-paper references if any

- [x] Task 5: Write tests (AC: #14)
  - [x] 5.1: Create `__tests__/AtcDetailCard.test.js` — test callsign/frequency/facility renders at peek, name/rating/ATIS renders in full card, ATIS indicator present when text_atis exists, absent when empty
  - [x] 5.2: Test missing ATIS gracefully omits ATIS sections
  - [x] 5.3: Test missing remarks omits remarks section (fixed in review)
  - [x] 5.4: Create `__tests__/CtrDetailCard.test.js` — test single controller case, multiple controllers case, sector name renders, all controllers listed
  - [x] 5.5: Update (or create) `__tests__/AtcDetails.test.js` — verify thin wrapper renders AtcDetailCard
  - [x] 5.6: Update (or create) `__tests__/CtrDetails.test.js` — verify thin wrapper renders CtrDetailCard
  - [x] 5.7: Run full test suite — zero regressions
  - [x] 5.8: Run ESLint — zero new warnings

- [x] Task 6: Manual validation (AC: #15)
  - [x] 6.1: Tap TRACON polygon → sheet opens at peek showing callsign, frequency, facility type
  - [x] 6.2: Swipe to half → controller name, rating, logon time, ATIS first line visible
  - [x] 6.3: Swipe to full → full ATIS text visible
  - [x] 6.4: Tap FIR polygon → sheet opens at peek showing CTR callsign, frequency, sector name
  - [x] 6.5: Swipe to half → list of all FIR controllers visible
  - [x] 6.6: Verify ATIS indicator dot appears when controller has ATIS text
  - [x] 6.7: Verify no react-native-paper components visible (no Card chrome, no old Avatar style)
  - [x] 6.8: Test on both iOS and Android

## Dev Notes

### Core Concept: Single-Card Model (Same as PilotDetailCard)

This story applies the exact same single-card architecture established in Story 4.2.1 to ATC and CTR detail panels. The bottom sheet's snap points (`[155, '50%', '70%']`) physically gate what the user sees — **no conditional rendering in component code**.

**What changes:** Replace old `AtcDetails.jsx` and `CtrDetails.jsx` (react-native-paper based) with two new card components.
**What does NOT change:** `ClientDetails.jsx` routing, `DetailPanelProvider`, sheet snap points, `TranslucentSurface`, `MapOverlayGroup`.

### Content Order for AtcDetailCard

**Section 1 — Peek visible (~155px):**
- Callsign row: `<ThemedText variant="callsign">{atc.callsign}</ThemedText>` + facility short label + ATIS dot indicator
- Frequency: `<ThemedText variant="data">{atc.frequency}</ThemedText>`

**Divider**

**Section 2 — Half visible (~50%):**
- Controller name + CID row: `<ThemedText variant="body-sm">{atc.name}</ThemedText>` + `<ThemedText variant="caption">{' (' + atc.cid + ')'}</ThemedText>`
- Rating row: `<ThemedText variant="data">{ATC_RATINGS[atc.rating]}</ThemedText>`
- Time online (formatted): `<ThemedText variant="body-sm">{formatTimeOnline(atc.logon_time)}</ThemedText>`
- ATIS first line (if `atc.text_atis?.length > 0`): `<ThemedText variant="data-sm">{atc.text_atis[0]}</ThemedText>`

**Divider**

**Section 3 — Full visible (~70%):**
- Full ATIS (all lines joined): only if `atc.text_atis?.length > 1` or to show complete ATIS
- Remarks section: only if `atc.text_atis` contains remarks data

### Content Order for CtrDetailCard

**Section 1 — Peek visible (~155px):**
- Primary callsign row: callsign (mono) + "CTR" label + sector name
- Primary frequency

**Divider**

**Section 2 — Half visible (~50%):**
- Primary controller name/CID + rating + time online
- All FIR controllers list (compact row per controller: callsign + frequency)

**Divider**

**Section 3 — Full visible (~70%):**
- Full ATIS text for each controller that has it (labeled with callsign header)

### VATSIM Controller Data Schema

A controller object from `state.vatsimLiveData.clients` has these fields:
```javascript
{
  callsign: 'EGLL_TWR',       // String — ATC station callsign
  name: 'John Smith',         // String — controller's real name
  cid: 1234567,               // Number — VATSIM CID
  frequency: '118.700',       // String — radio frequency
  facility: 4,                // Number — facility type (see consts.js: OBS=0, FSS=1, DEL=2, GND=3, TWR_ATIS=4, APP=5, CTR=6)
  rating: 5,                  // Number — ATC rating (1=S1, 2=S2, 3=S3, 4=C1, 5=C3, 7=I1, 8=I3, 10=SUP, 11=ADM)
  logon_time: '2024-01-01T12:00:00.000000Z', // ISO string
  text_atis: ['ATIS INFO A', 'RUNWAY 27L IN USE', 'QNH 1013'], // Array of strings (may be null/empty)
  server: 'USA-WEST',         // String
  // key: unique identifier for React list rendering
}
```

**CtrDetails context:** `state.vatsimLiveData.clients.ctr` is a dictionary keyed by prefix (e.g., `'EGTT'`), where each value is an array of controller objects for that FIR (sorted highest facility type first by Redux).

### ATC_RATINGS Lookup Map

```javascript
const ATC_RATINGS = {
    1: 'S1',
    2: 'S2',
    3: 'S3',
    4: 'C1',
    5: 'C3',
    7: 'I1',
    8: 'I3',
    10: 'SUP',
    11: 'ADM',
};
```

### formatTimeOnline Helper

Copy from `PilotDetailCard.jsx` exactly — same function, same behavior:
```javascript
function formatTimeOnline(logonTime) {
    if (!logonTime) return null;
    const logonDate = new Date(logonTime);
    const now = new Date();
    const diffMs = now - logonDate;
    if (isNaN(diffMs) || diffMs < 0) return '0m';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return hours + 'h ' + minutes + 'm';
    return minutes + 'm';
}
```

> **Note for future:** Consider extracting `formatTimeOnline` and `DataField` to a shared util if used in 3+ places after Story 4.4. For now, copy is fine (only 2 uses).

### ClientDetails.jsx — Routing (DO NOT CHANGE)

Current routing in `ClientDetails.jsx` already handles all cases correctly:
```javascript
// if airport
if (props.client.icao != null) → AirportAtcDetails
// if CTR
if (props.client.facility === CTR) → CtrDetails (with ctr array + prefix)
// if pilot
if (props.client.facility == null) → PilotDetails
// else (APP, TWR, GND, DEL, FSS, OBS)
→ AtcDetails (with atc object)
```

**Important:** `showAtis` prop is passed to `AtcDetails` from `ClientDetails` (`showAtis={!!props.showAtis}`) — but it's also passed from `AirportAtcDetails`. After this story, `AtcDetailCard` always shows ATIS, so `showAtis` prop can be **ignored** (not destructured) in the new `AtcDetails.jsx` thin wrapper. Do NOT remove it from `ClientDetails.jsx` call site to avoid breaking `AirportAtcDetails` (which also calls `AtcDetails`).

Wait — **actually re-check this**: `AirportAtcDetails.jsx` also calls `<AtcDetails atc={atc} showAtis={...} />`. After this story, `AtcDetails` will ignore `showAtis` and always show ATIS. This is the correct behavior per Epic 4 design (single card always renders full content, sheet snap points gate visibility).

### CtrDetails.jsx — Props Interface

Current `ClientDetails.jsx` passes to `CtrDetails`:
```javascript
<CtrDetails ctr={centers[prefix]} prefix={prefix} />
```
The new `CtrDetails.jsx` thin wrapper must accept both `ctr` and `prefix` and pass them to `CtrDetailCard`:
```javascript
export default function CtrDetails({ctr, prefix}) {
    return <CtrDetailCard ctr={ctr} prefix={prefix} />;
}
```

### FSS Controllers and UIR Names

FSS (Flight Service Station, `facility === 1`) controllers are routed to `AtcDetails` (not `CtrDetails`) by `ClientDetails.jsx`. They cover UIR (Upper Information Region) airspace rather than a standard FIR.

The old `AtcDetails.jsx` displayed the UIR name like this:
```javascript
// facility === FSS:
(uirs[prefix] ? uirs[prefix].name + ', ' : '') + facilities[atc.facility].long
```

`state.staticAirspaceData.uirs` is a dictionary keyed by prefix (e.g., `'KZOA'` → `{ name: 'Oakland Oceanic', firs: [...] }`).

In `AtcDetailCard`, handle FSS by reading uirs from Redux and showing the UIR name as the sector label:
```javascript
const uirs = useSelector(state => state.staticAirspaceData.uirs);
const prefix = atc.callsign.split('_')[0];
const sectorName = atc.facility === FSS
    ? (uirs[prefix]?.name || null)
    : null;  // non-FSS controllers don't need a sector name in the ATC card
```

Show `sectorName` beneath the callsign row if non-null (same as the airport name line in PilotDetailCard). Don't attempt FIR lookup in `AtcDetailCard` — that complexity is only needed for CTR (handled by `CtrDetailCard`).

### firResolver.js Usage in CtrDetailCard

To get the sector/FIR name for display:
```javascript
import {useSelector} from 'react-redux';
import {getFirFromPrefix} from '../../common/firResolver';

// Inside CtrDetailCard:
const firs = useSelector(state => state.staticAirspaceData.firs);
const fir = getFirFromPrefix(prefix, firs);
const sectorName = fir?.name || prefix;
```

### Components to REUSE (Do NOT Recreate)

- **`ThemedText`** (`app/components/shared/ThemedText.jsx`) — ALL text. Variants: `callsign` (15px mono medium), `data` (13px mono), `data-sm` (11px mono), `body` (15px), `body-sm` (13px), `caption` (11px), `heading` (18px).
- **`useTheme()`** (`app/common/ThemeProvider.jsx`) — `{ isDark, activeTheme }`. Use `activeTheme.text.*`, `activeTheme.surface.*`, `activeTheme.accent.*`.
- **`DataField`** sub-component — copy from PilotDetailCard (label + value pattern). Used for rating, online time, etc.
- **`facilities`** (`app/common/consts.js`) — `facilities[atc.facility].short` → 'TWR', 'APP', 'CTR', etc.
- **`getFirFromPrefix`** (`app/common/firResolver.js`) — get FIR object from prefix string.

### ESLint Rules

Same rules as all components in this codebase:
- No inline styles — `StyleSheet.create()` only
- No color literals — all from `activeTheme` via `useTheme()`
- No raw text outside `<ThemedText>`
- Semicolons required, single quotes, 4-space indentation

### Testing Pattern

Tests use string mocks for `@gorhom/bottom-sheet` if needed. Standard mock patterns from previous stories:
```javascript
jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
}));
jest.mock('../../common/ThemeProvider', () => ({
    useTheme: () => ({
        activeTheme: {
            text: { primary: '#fff', secondary: '#aaa', muted: '#666' },
            surface: { border: '#333' },
            accent: { primary: '#4FC3F7' },
        },
    }),
}));
jest.mock('../../common/firResolver', () => ({
    getFirFromPrefix: jest.fn(() => ({ name: 'Scottish Control', icao: 'EGPX' })),
}));
```

Current test baseline: **166/166 pass** (from Story 4.2.1). ESLint baseline: 5 pre-existing warnings in plugin files.

### Project Structure Notes

**New files:**
- `app/components/clientDetails/AtcDetailCard.jsx`
- `app/components/clientDetails/CtrDetailCard.jsx`
- `__tests__/AtcDetailCard.test.js`
- `__tests__/CtrDetailCard.test.js`

**Modified files:**
- `app/components/clientDetails/AtcDetails.jsx` — simplified to thin wrapper (removes react-native-paper)
- `app/components/clientDetails/CtrDetails.jsx` — simplified to thin wrapper (removes react-native-paper)

**Unchanged files:**
- `app/components/clientDetails/ClientDetails.jsx` — routing unchanged
- `app/components/detailPanel/DetailPanelProvider.jsx` — unchanged
- `app/components/clientDetails/AirportAtcDetails.jsx` — unchanged (still calls AtcDetails with showAtis)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.3 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — AtcDetailCard, CtrDetailCard component spec]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ATC detail panel content priority]
- [Source: app/components/clientDetails/AtcDetails.jsx — Old implementation (react-native-paper), data schema reference]
- [Source: app/components/clientDetails/CtrDetails.jsx — Old implementation, props interface]
- [Source: app/components/clientDetails/ClientDetails.jsx — Routing logic (unchanged)]
- [Source: app/components/clientDetails/PilotDetailCard.jsx — Pattern to follow: single card, StyleSheet, ThemedText, DataField, formatTimeOnline]
- [Source: app/common/consts.js — facility constants, facilities array]
- [Source: app/common/firResolver.js — getFirFromPrefix for sector name lookup]
- [Source: _bmad-output/implementation-artifacts/4-2-1-refactor-pilot-detail-single-card.md — Previous story learnings]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

None.

### Completion Notes List

- Created `AtcDetailCard.jsx` — single-card component with peek/half/full sections using same StyleSheet/ThemedText/DataField patterns as PilotDetailCard. Includes ATC_RATINGS map, formatTimeOnline helper, ATIS dot indicator, FSS UIR name lookup.
- Created `CtrDetailCard.jsx` — single-card component for CTR/Center controllers. Shows primary controller at peek, all FIR controllers list at half, per-controller ATIS at full. Uses getFirFromPrefix for sector name.
- Simplified `AtcDetails.jsx` to thin wrapper (removed all react-native-paper imports).
- Simplified `CtrDetails.jsx` to thin wrapper (removed react-native-paper).
- Fixed scrolling in `DetailPanelProvider.jsx`: removed `flex: 1` from translucentSurface and replaced `flexGrow: 1` with `paddingBottom: 16` on scrollContent — content was previously capped at sheet height, preventing scroll.
- 35 new tests added across 4 test files. Full suite: 201/201 pass, 0 regressions.

### File List

- `app/components/clientDetails/AtcDetailCard.jsx` (new)
- `app/components/clientDetails/CtrDetailCard.jsx` (new)
- `app/components/clientDetails/AtcDetails.jsx` (modified — thin wrapper)
- `app/components/clientDetails/CtrDetails.jsx` (modified — thin wrapper)
- `app/components/detailPanel/DetailPanelProvider.jsx` (modified — scrolling fix)
- `__tests__/AtcDetailCard.test.js` (new)
- `__tests__/CtrDetailCard.test.js` (new)
- `__tests__/AtcDetails.test.js` (new)
- `__tests__/CtrDetails.test.js` (new)
