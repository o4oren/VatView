# Story 4.5: List View Client Card Polish

Status: done

## Story

As a user,
I want list view client cards to show aircraft type icons for pilots and colored facility badges for ATC controllers,
so that I can identify the aircraft type and ATC facility at a glance without reading text.

## Acceptance Criteria

1. **AC1 — Pilot list items: aircraft type icon:** Each pilot row in `VatsimListView` shows the aircraft SVG icon (same bitmap used for map markers, from `client.image`) in the left slot at 28×28dp with `resizeMode="contain"`. Falls back to `✈` text if `client.image` is null.

2. **AC2 — ATC list items: single-letter colored badge:** Each ATC row shows a single-letter badge in the left slot matching the map airport badge style — solid facility color background, white text, `JetBrainsMono_500Medium` 9px bold, `borderRadius: 3`. Letters: `C` (DEL/clearance), `G` (GND/ground), `T` (TWR/tower), `A` (APP/approach), `E` (CTR/en-route), `F` (FSS).

3. **AC3 — Facility label below badge:** A short muted label (e.g. `TWR`, `APP`, `CTR`, `FSS`) is shown below the badge letter in small caption text.

4. **AC4 — CTR and FSS badge colors:** Two new badge color tokens added. CTR: teal (`#1A7A6E` light / `#2BA99A` dark). FSS: purple (`#8250DF` light / `#A371F7` dark). These are added to `themeTokens.js` and `airportBadgeHelper.js`.

5. **AC5 — Bottom sheet airport badge letter color:** In `AirportDetailCard`, badge letters use `#FFFFFF` (white) to match the map airport badge style, instead of `activeTheme.text.primary`.

6. **AC6 — No regressions:** ESLint produces no new errors.

## Tasks / Subtasks

- [x] Task 1: Aircraft icon in pilot list items (AC: #1)
  - [x] 1.1: In `ClientCard.jsx`, replace `✈` text with `<Image source={client.image}>` at 28×28dp when `client.image` is non-null
  - [x] 1.2: Keep `✈` text fallback for when `client.image` is null

- [x] Task 2: Single-letter ATC badge (AC: #2, #3)
  - [x] 2.1: Add `FACILITY_BADGE` map in `ClientCard.jsx` mapping facility constants to `{letter, tokenKey}`
  - [x] 2.2: Render solid-color badge with white letter matching map airport badge style
  - [x] 2.3: Render short facility label below badge in muted caption text

- [x] Task 3: CTR and FSS badge colors (AC: #4)
  - [x] 3.1: Add `ctr` and `fss` tokens to both light and dark themes in `themeTokens.js`
  - [x] 3.2: Add `E`/`ctr` and `F`/`fss` entries to `airportBadgeHelper.js` BADGE_DEFS

- [x] Task 4: Bottom sheet airport badge letter color (AC: #5)
  - [x] 4.1: In `AirportDetailCard.jsx`, change badge letter color from `activeTheme.text.primary` to `#FFFFFF`

- [x] Task 5: Validation (AC: #6)
  - [x] 5.1: Run `npm run lint` — zero new errors

## Dev Notes

### Aircraft Icon Source

Pilot objects in Redux have `pilot.image` and `pilot.imageSize` pre-resolved by `vatsimLiveDataActions.js` (line 134-136) during each data poll — same bitmaps used by map markers. Data polling only starts after `iconsReady` is true (`MainApp.jsx`), so `client.image` is always set by the time the list renders.

### Badge Style — Matching Map

Map airport badges (`LocalAirportMarker.jsx`) use:
```javascript
const BADGE_TEXT_COLOR = '#FFFFFF';
const BADGE_FONT_SIZE = 9;

badgePill: { borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 }
badgeLetter: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 9, fontWeight: '700', color: '#FFFFFF', lineHeight: 14 }
```
Background is `badge.color` (solid, from `activeTheme.atc.badge[tokenKey]`).

### FACILITY_BADGE Map

```javascript
const FACILITY_BADGE = {
    [DEL]:      { letter: 'C', tokenKey: 'clearance' },
    [GND]:      { letter: 'G', tokenKey: 'ground' },
    [TWR_ATIS]: { letter: 'T', tokenKey: 'tower' },
    [APP]:      { letter: 'A', tokenKey: 'approach' },
    [CTR]:      { letter: 'E', tokenKey: 'ctr' },
    [FSS]:      { letter: 'F', tokenKey: 'fss' },
};
```

### New Theme Tokens

```javascript
// Light theme
badge.ctr: '#1A7A6E'   // teal
badge.fss: '#8250DF'   // purple

// Dark theme
badge.ctr: '#2BA99A'   // teal (brighter)
badge.fss: '#A371F7'   // purple (brighter)
```

### Project Structure Notes

**Modified files:**
- `app/components/vatsimListView/ClientCard.jsx` — aircraft icon + letter badge + facility label
- `app/common/themeTokens.js` — added `ctr` and `fss` badge color tokens
- `app/common/airportBadgeHelper.js` — added CTR/FSS badge definitions

**Unchanged:**
- `app/components/vatsimListView/VatsimListView.jsx`
- All bottom sheet / detail panel components

### References

- [Source: app/components/vatsimMapView/LocalAirportMarker.jsx — badge pill style to match]
- [Source: app/common/airportBadgeHelper.js — BADGE_DEFS pattern]
- [Source: app/common/themeTokens.js — badge token structure]
- [Source: app/redux/actions/vatsimLiveDataActions.js:134-136 — pilot.image / pilot.imageSize source]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- **AC1 (Aircraft icon):** `ClientCard.jsx` left slot for pilots now renders `<Image source={client.image} style={styles.aircraftIcon} resizeMode="contain" />` at 28×28dp. Falls back to `✈` text when `client.image` is null. Icon source is the Redux-resolved bitmap (`pilot.image`) — same as map markers, always initialized before data polling starts.

- **AC2/AC3 (ATC badge):** `FACILITY_BADGE` lookup map added. Left slot renders solid-color badge (`activeTheme.atc.badge[tokenKey]` background, white text) matching map airport badge style exactly — same font, size, border radius, padding. Short facility label (`TWR`, `APP`, etc.) rendered below in muted 8px caption text.

- **AC4 (CTR/FSS colors):** `ctr` (teal) and `fss` (purple) tokens added to both light and dark themes in `themeTokens.js`. `airportBadgeHelper.js` updated with `E`/`ctr` and `F`/`fss` BADGE_DEFS entries — these also apply to airport map badges for any future CTR/FSS at airports.

- **AC5 (Lint):** ESLint clean, zero new errors.

### File List

- app/components/vatsimListView/ClientCard.jsx (modified — aircraft icon, letter badge, facility label)
- app/common/themeTokens.js (modified — added ctr/fss badge color tokens)
- app/common/airportBadgeHelper.js (modified — added CTR/FSS badge definitions)
- app/components/clientDetails/AirportDetailCard.jsx (modified — badge letter color #FFFFFF)
- _bmad-output/implementation-artifacts/4-5-list-view-client-card-polish.md (modified — story tracking)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified — status updated)

### Change Log

- 2026-03-18: Implemented Story 4.5 — aircraft type icons in pilot list items, single-letter colored ATC badges with facility label, CTR/FSS badge color tokens, bottom sheet airport badge letters fixed to white
- 2026-03-18: AI Code Review - Fixed ATIS badge mapping bug and updated test suites. Story marked done.

### Senior Developer Review (AI)

- **Findings:** Found ATIS controllers incorrectly identified as Tower in ClientCard. Test suites (airportBadgeHelper.test.js and ClientCard.test.js) were failing due to missing CTR/FSS coverage and incomplete ThemeProvider mocks.
- **Fixes Applied:** Updated ATIS detection logic in ClientCard.jsx, expanded test coverage and fixed mocks in `__tests__`.
- **Outcome:** Approved and marked done.
