---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
  - step-e-01-discovery
  - step-e-02-review
  - step-e-03-edit
lastEdited: '2026-03-16'
editHistory:
  - date: '2026-03-16'
    changes: 'Added FR44: Ground aircraft zoom-dependent visibility — hide parked/slow aircraft (≤5kt) at non-local zoom, fade in progressively at local zoom. Map view only.'
classification:
  projectType: mobile_app
  domain: aviation_simulation
  complexity: medium
  projectContext: brownfield
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-VatView-2026-03-14.md'
  - '_bmad-output/project-context.md'
  - 'docs/index.md'
  - 'docs/project-overview.md'
  - 'docs/architecture.md'
  - 'docs/state-management.md'
  - 'docs/data-models.md'
  - 'docs/api-contracts.md'
  - 'docs/component-inventory.md'
  - 'docs/asset-inventory.md'
  - 'docs/source-tree-analysis.md'
  - 'docs/technology-stack.md'
  - 'docs/development-guide.md'
  - 'docs/privacy.md'
---

# Product Requirements Document - VatView

**Author:** Oren
**Date:** 2026-03-14

## Executive Summary

VatView is a cross-platform mobile app (iOS + Android) that shows live VATSIM network activity — pilot positions, ATC coverage, events, bookings, and weather — on an interactive map. Published since 2021 with ~3,000 active users, it is the only native mobile app that combines real-time VATSIM tracking with ATC booking visibility and event discovery in a single interface.

This PRD covers **Phase 1: Visual Modernization** — a full redesign of VatView's UI layer. The current react-native-paper Material Design interface feels dated and visually congested; the map competes for screen space with opaque chrome. Phase 1 transforms VatView into an immersive "floating HUD" experience: full-bleed edge-to-edge map, translucent frosted-glass UI elements, NativeWind/Tailwind-based theming (light + dark), progressive disclosure to reduce information density, and responsive landscape support. Every existing feature is preserved and restyled.

The redesign targets two outcomes: (1) generate community buzz and grow the active user base from ~3,000 toward 4,500+ through a dramatically elevated visual experience, and (2) lay the architectural foundation for Phase 2 — single-surface navigation, aviation theme collection, and social features (friends, self-tracking, airspace alerts) — without requiring a second rewrite.

### What Makes This Special

No other VATSIM mobile tool combines ATC bookings, events, and live tracking in a polished, immersive native package. The differentiator is not any single feature — it's presenting this unique feature set through a premium, aviation-inspired interface that no competitor matches on mobile. The "wow" moment is immediate: the first time a user opens the redesigned app and sees the full-bleed translucent map, they know this is no longer a utility — it's an aviation instrument.

Web-based alternatives (map.vatsim.net, SimAware) lack native feel, offline state, and push potential. Other VATSIM mobile apps are abandoned or feature-limited. FlightRadar24 is visually polished but tracks real-world traffic, not VATSIM. VatView occupies a unique position: the only actively maintained, feature-rich, native VATSIM mobile app — and Phase 1 gives it a visual identity worthy of that position.

## Project Classification

- **Project Type:** Mobile App — cross-platform React Native (Expo), iOS + Android
- **Domain:** Aviation/Simulation — virtual ATC network tooling for the VATSIM community
- **Complexity:** Medium — no regulatory requirements, but involves a full UI framework migration (react-native-paper to NativeWind), real-time data pipeline (20s polling), map rendering performance, and preserving all existing functionality across two platforms
- **Project Context:** Brownfield — published app with active users, app store presence, and established data architecture. All existing features must carry forward unchanged in functionality.

## Success Criteria

### User Success

- **Immediate delight:** Users experience a visible "wow" on first launch post-update — the full-bleed translucent map signals a premium, maintained app
- **Store ratings:** App Store and Google Play ratings improve or maintain current level; new reviews mention the redesign positively
- **Continued engagement:** Session duration and frequency maintained or improved — users aren't confused or disrupted by the new UI
- **New UI adoption:** Users interact with new design elements — theme toggle, floating filter chips, progressive disclosure levels — within their first week

### Business Success

- **Existing user retention:** >90% of pre-upgrade active users still active at 30 days post-launch
- **User growth:** Active user base grows from ~3,000 toward 4,500+ within 3-6 months post-launch
- **Community buzz:** Measurable engagement on VATSIM forums, Reddit, Discord — comments, shares, new install spikes in the week after launch
- **App store perception:** Updated screenshots drive higher conversion rates; no spike in negative reviews

### Technical Success

- **Zero functional regression:** Every feature from the current app works identically in the new UI — list view, airport view, events, bookings, METAR, client details, ATC polygons, all of it
- **Performance parity or better:** 20-second polling cycle, map rendering, and marker updates perform at least as well as the current app on both platforms
- **Crash stability:** No increase in crash rate post-migration as measured by Firebase Crashlytics. NativeWind + react-native-maps + @gorhom/bottom-sheet compatibility validated
- **Both platforms stable:** iOS and Android tested with no new crash patterns

### Measurable Outcomes

| Metric | Target | Timeframe | Measurement |
|---|---|---|---|
| Existing user retention | >90% | 30 days post-launch | Firebase DAU/WAU comparison |
| App store rating | No regression; ideally improvement | 3 months post-launch | App Store Connect / Play Console |
| New installs/week | Sustained lift vs. baseline | 3-6 months post-launch | Store analytics |
| Session duration | Maintained or increased | 30 days post-launch | Firebase Analytics |
| Crash-free rate | No regression from pre-upgrade | 7 days post-launch | Firebase Crashlytics |

## Product Scope

### MVP (Phase 1)

All must ship together as a single store release:

1. **NativeWind/Tailwind migration** — Replace react-native-paper with NativeWind across all components
2. **Full-bleed map** — Map extends edge-to-edge, no opaque chrome bars
3. **Floating navigation island** — Translucent pill replaces bottom tab bar
4. **Translucent bottom sheet** — Frosted glass (~0.45 opacity) detail panels, map visible through
5. **Floating filter chips** — Semi-transparent toggleable filters on the map
6. **Light + Dark themes** — NativeWind design tokens, custom Google Maps JSON styling per theme, system preference + manual toggle
7. **Progressive disclosure** — Three levels: glanceable, tap for more, pull up for full detail
8. **All existing features preserved** — Every screen restyled in the new design language
9. **Landscape orientation + adaptive panels** — Side panels in landscape, bottom sheet in portrait, responsive floating elements

### Growth (Post-MVP OTA Updates)

- **Refined aircraft markers** — Smaller, cleaner, directional; preserve aircraft-type icons
- **Cinematic fly-to** — Smooth animated map transitions
- **Airport staffing badges** — Colored dots showing which positions are online
- **Whisper notifications** — Brief fade-in/fade-out for ATC online/offline events

### Vision (Phase 2+)

- Single-surface navigation (collapse tabs into map-centric UI)
- Aviation theme collection (Day VFR, Night Ops, Radar)
- Full micro-animation suite + radar sweep effects
- Time slider history replay
- Social features (show friends, track me, airspace alerts)
- VATGlasses sector-level ATC visualization (Phase 1.5)

## User Journeys

### Journey 1: "Pre-flight Check" — Marcus, Active VATSIM Pilot

Marcus flies VATSIM twice a week on his PC. His sim is loading and he grabs his phone to check what's happening on the network.

**Opening Scene:** Marcus taps VatView. The app opens to a full-bleed map — translucent, edge-to-edge, no chrome competing for space. If this is his first time post-update, the change is immediate and wordless — no tutorial, no "what's new" modal. Just a dramatically better map.

**Rising Action:** He pinches to zoom into his departure region. Floating filter chips let him toggle ATC visibility. He spots his departure airport has TWR and APP staffed — the TRACON polygon glows on the map. He taps the airport marker; a frosted-glass bottom sheet slides up showing staffed positions. He swipes up for full detail — progressive disclosure, three levels deep. He checks ATC bookings to see if center coverage is expected during his flight time.

**Climax:** Marcus finds a staffed route with booked enroute coverage for his flight window. He knows exactly where to fly. He props his tablet in landscape next to his sim — the bottom sheet becomes a side panel, the map fills the screen. It looks like a real radar scope sitting next to his cockpit.

**Resolution:** Marcus flies his session with VatView open as a companion display. The 20-second updates keep him aware of ATC changes. After landing, he screenshots the landscape view and posts it to the VATSIM Discord — "VatView just got a massive upgrade."

**Capabilities revealed:** Full-bleed map, floating filter chips, translucent bottom sheet with progressive disclosure, ATC bookings access, landscape adaptive layout, TRACON polygon rendering, 20s live updates.

---

### Journey 2: "Coverage Scan" — Priya, VATSIM Controller

Priya controls approach at a busy European hub. She's about to log on and wants to see the network state first.

**Opening Scene:** Priya opens VatView on her phone. The dark theme map (matching her preference) shows the network at a glance — staffed sectors are immediately visible without pinching through clutter.

**Rising Action:** She zooms into her region. Adjacent sectors' staffing is clear — she can see who's online around her without tapping each position. She checks ATC bookings to see if anyone is scheduled to cover the enroute sector above her. She taps a nearby controller marker — the frosted bottom sheet shows frequency, ATIS text, and rating.

**Climax:** Priya sees a gap in coverage — no one is booked for the center position above her sector for the next two hours. She decides to log on early to provide extended coverage. The progressive disclosure means she got from "open app" to "coverage decision" in under 30 seconds.

**Resolution:** Priya logs on. Later, between sessions, she opens Settings and toggles to light theme for daytime use. She notices the theme changes the map styling too — the whole app feels cohesive.

**Capabilities revealed:** Dark theme with custom map styling, glanceable ATC coverage, ATC bookings, controller detail bottom sheet, theme toggle in Settings, progressive disclosure speed.

---

### Journey 3: "Event Night" — Jake, Casual Spectator

Jake used to fly on VATSIM but hasn't in months. A friend mentions a big cross-the-pond event tonight. He opens VatView to watch.

**Opening Scene:** Jake opens the app — he hasn't seen it since the update. The full-bleed translucent map stops him. "Whoa, this looks completely different." No onboarding interrupts the moment.

**Rising Action:** He navigates to the Events tab via the floating navigation island. He finds the cross-the-pond event, taps it for details. He goes back to the map and zooms out to the Atlantic — dozens of aircraft are crossing, ATC sectors are fully staffed. He taps individual pilots to see their flight plans in the frosted bottom sheet. He rotates his phone to landscape — the map expands, the detail panel slides to the side.

**Climax:** Jake watches the stream of traffic crossing the ocean in real time. The immersive full-bleed view makes it feel like watching a live radar feed, not browsing an app. He screenshots the landscape view with all the oceanic tracks visible.

**Resolution:** Jake shares the screenshot on Reddit with "VatView got a serious glow-up." The post gets engagement. Two of his friends download the app. Jake starts thinking about flying VATSIM again.

**Capabilities revealed:** Events navigation via floating nav island, event details, full-bleed map at wide zoom, pilot detail bottom sheet, landscape mode on phone, visual appeal driving organic sharing.

---

### Journey 4: "Quick METAR Check" — Marcus (Edge Case/Secondary Flow)

Marcus is already in his sim but needs a quick weather check for his alternate airport.

**Opening Scene:** Marcus has VatView open in landscape on his tablet as a companion. He needs METAR for his alternate.

**Rising Action:** He taps the Airports tab on the floating nav island. He searches for the airport by ICAO code. The airport view shows current ATC, arriving/departing traffic, and he navigates to METAR.

**Climax:** The METAR loads. Weather is marginal — he decides to pick a different alternate. He taps back to the map and the full-bleed view returns instantly.

**Resolution:** Quick in-and-out. The floating nav island and progressive disclosure meant he didn't lose his map context for long. The whole interaction took under 15 seconds.

**Capabilities revealed:** Floating nav island tab switching, airport search, METAR integration, quick navigation flow, landscape continuity.

---

### Journey Requirements Summary

| Capability Area | Revealed By Journeys |
|---|---|
| Full-bleed edge-to-edge map | All journeys — core experience |
| Floating navigation island | Jake (events), Marcus (airports), Priya (navigation) |
| Translucent bottom sheet (3-level progressive disclosure) | Marcus (ATC detail), Priya (controller detail), Jake (pilot detail) |
| Floating filter chips | Marcus (ATC toggle) |
| Light + Dark themes with map styling | Priya (dark), Priya (light toggle in Settings) |
| Theme toggle in Settings | Priya |
| Landscape adaptive layout (side panel) | Marcus (tablet companion), Jake (phone landscape) |
| Events via floating nav | Jake |
| ATC bookings access | Marcus, Priya |
| Airport search + METAR | Marcus (edge case) |
| TRACON polygons + FIR boundaries | Marcus, Priya |
| 20-second live data updates | Marcus (companion use) |
| All existing features preserved | All journeys — no regression |
| No onboarding/what's new interruption | Jake (first post-update open) |

## Mobile App Technical Requirements

### Platform & Migration

- iOS and Android via single React Native/Expo codebase; maintain current OS support matrix
- Google Maps provider on both platforms (existing)
- **UI Framework Migration:** react-native-paper v5 → NativeWind (Tailwind CSS for React Native). Every component using react-native-paper must be restyled: buttons, cards, text variants, surface containers, app bars, bottom tab navigator
- **Compatibility validation required:** NativeWind must work with react-native-maps, @gorhom/bottom-sheet, and react-native-reanimated
- Incremental migration possible: NativeWind and StyleSheet.create() can coexist during transition

### Orientation & Layout

- Portrait (existing) + Landscape (new) on both phone and tablet
- Adaptive layout: bottom sheet in portrait, side panel in landscape
- Floating UI elements reposition responsively across orientations

### Theme Architecture

- Design tokens via NativeWind/Tailwind config
- Light theme, dark theme, system auto-detection, manual toggle in Settings
- Custom Google Maps JSON styling per theme (existing pattern in `theme.js`, needs two style sets)
- Token structure should accommodate future aviation themes (Phase 2) without restructuring

### Unchanged Behaviors

- No offline mode — app is a live data viewer; persisted Redux state shows last-known data on cold start (no change)
- No push notifications in Phase 1; architecture should not preclude future addition
- No changes to age rating, content policy, or permissions
- Updated App Store and Google Play screenshots required after redesign

## Project Scoping & Risk Strategy

### MVP Strategy

**Approach:** Experience MVP — the goal is not to prove VatView works (it already does) but to prove the new visual identity elevates the experience enough to drive growth and community buzz. Every existing feature must work; the "minimum" is a complete visual transformation, not a feature subset.

**Resources:** Solo developer with AI-assisted development (Claude Code + BMAD). AI tooling handles migration grunt work; human judgment for design decisions, compatibility validation, and quality assessment.

**Journey Coverage:** All four journeys (Marcus pre-flight, Priya coverage scan, Jake event night, Marcus METAR check) are fully supported by MVP. No journey is deferred.

### Risk Mitigation

**Technical Risks:**

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| NativeWind incompatible with react-native-maps | Blocks full-bleed map | Medium | Validate in isolation before migrating any components. Fallback: StyleSheet.create() with custom design token system |
| NativeWind incompatible with @gorhom/bottom-sheet | Blocks translucent panels | Medium | Same early validation. Bottom sheet can use StyleSheet while other components use NativeWind |
| Backdrop blur performance on older devices | Poor UX on low-end hardware | Medium | Test on oldest supported devices early. Fallback: semi-transparent solid background |
| Migration introduces regressions | Broken features post-launch | High | Migrate and test one component at a time. Manual testing on both platforms after each batch |

**Market Risks:**

| Risk | Impact | Mitigation |
|---|---|---|
| Existing users dislike the redesign | Churn, negative reviews | No change to functionality — only visual. Users keep muscle memory. Monitor reviews post-launch |
| Redesign doesn't generate expected buzz | No growth payoff | Updated screenshots + announcement post on VATSIM forums/Discord. Low effort, high potential |

**Resource Risks:**

| Risk | Impact | Mitigation |
|---|---|---|
| Solo developer burnout on 28-component migration | Stalled project | AI-assisted migration for repetitive restyling. Focus human effort on design decisions and validation |
| Scope creep during migration | Never ships | Strict Phase 1 boundary — no new features, only restyle. Growth features ship as post-launch OTA |

## Functional Requirements

### Map Experience

- **FR1:** User can view a full-bleed, edge-to-edge interactive map as the primary app surface
- **FR2:** User can view live pilot positions as aircraft-type-specific markers on the map, updated every 20 seconds
- **FR3:** User can view ATC coverage areas as polygon overlays (FIR boundaries, TRACON polygons) on the map
- **FR4:** User can view airport markers with active ATC indicators on the map
- **FR5:** User can pan, zoom, and interact with the map without UI chrome obstructing the map edges
- **FR6:** User can tap a pilot marker to view pilot details in a translucent bottom sheet
- **FR7:** User can tap a controller/ATC element to view controller details in a translucent bottom sheet
- **FR8:** User can tap an airport marker to view airport ATC details in a translucent bottom sheet

### Map Filtering

- **FR44:** Ground aircraft (groundspeed 5 knots or below) are not rendered on the map at regional and continental zoom levels. As the user zooms toward local level, ground aircraft markers fade in progressively (opacity scales with zoom). At full local zoom (airport fills the viewport), ground aircraft are fully opaque. This filtering applies to the map view only; list view shows all pilots regardless of zoom.

### Progressive Disclosure

- **FR9:** User can view glanceable summary information (level 1) for any selected client without additional interaction
- **FR10:** User can tap to expand to moderate detail (level 2) for a selected client
- **FR11:** User can pull up to view full detail (level 3) for a selected client, including flight plan, ATIS text, or full ATC info

### Navigation

- **FR12:** User can navigate between Map, List, Airports, and Events views via a floating navigation island
- **FR13:** User can access About, Settings, Network Status, Event Details, ATC Bookings, and METAR screens from the navigation structure
- **FR14:** User can return to the map view from any other screen

### Filtering & Search

- **FR15:** User can toggle pilot visibility on the map via floating filter chips
- **FR16:** User can toggle ATC visibility on the map via floating filter chips
- **FR17:** User can search for pilots and controllers by callsign or other identifiers in the list view
- **FR18:** User can search for airports by ICAO or IATA code

### Client List

- **FR19:** User can view a filterable list of all online pilots and controllers
- **FR20:** User can tap a list item to view client details

### Airport View

- **FR21:** User can search for and select an airport to view its details
- **FR22:** User can view active ATC positions at a selected airport
- **FR23:** User can view arriving and departing traffic at a selected airport

### Events & Bookings

- **FR24:** User can view a list of upcoming VATSIM events
- **FR25:** User can tap an event to view its full details
- **FR26:** User can view a list of ATC bookings
- **FR27:** User can view details of individual ATC bookings

### Weather

- **FR28:** User can view METAR weather data for any airport

### Theming & Appearance

- **FR29:** User can switch between light and dark themes
- **FR30:** App can automatically follow system theme preference
- **FR31:** User can manually override theme selection in Settings
- **FR32:** Map styling adjusts to match the active theme (custom Google Maps JSON per theme)
- **FR33:** All UI elements (navigation island, bottom sheet, filter chips) render with translucent frosted-glass appearance (~0.45 opacity)

### Orientation & Layout

- **FR34:** User can use the app in portrait orientation on phone and tablet
- **FR35:** User can use the app in landscape orientation on phone and tablet
- **FR36:** App adapts layout between portrait (bottom sheet) and landscape (side panel) automatically
- **FR37:** Floating UI elements reposition responsively when orientation changes

### Settings

- **FR38:** User can access a Settings screen to configure theme preference

### Network & Data

- **FR39:** App displays live VATSIM data refreshed every 20 seconds
- **FR40:** App loads events and ATC bookings on launch
- **FR41:** App displays network connectivity status
- **FR42:** App persists last-known state for display on cold start

### Existing Feature Parity

- **FR43:** All current VatView features (TRACON polygons, FIR boundaries, aircraft-type icons, METAR parsing, ATC facility categorization) continue to function identically in the redesigned UI

## Non-Functional Requirements

### Performance

- **NFR1:** Map interactions (pan, zoom, tap) must remain fluid with no perceptible lag during 20-second data refresh cycles
- **NFR2:** Marker rendering for up to 1,500+ simultaneous pilots must complete within the 20-second refresh window without dropped frames
- **NFR3:** Bottom sheet open/close animations must render at 60fps, including backdrop blur effect
- **NFR4:** Backdrop blur (frosted glass) must not cause visible stutter on mid-range devices (2-3 year old phones). If blur causes frame drops below 30fps on a target device, fall back to semi-transparent solid background
- **NFR5:** Orientation change (portrait to landscape and back) must complete layout transition within 300ms with no visual glitches
- **NFR6:** Theme switching must apply immediately with no app restart required
- **NFR7:** App cold start time must not regress from current performance. Improvements welcome if low-effort

### Integration

- **NFR8:** App must gracefully handle VATSIM live data API unavailability — display last-known data and indicate stale state, not crash or show empty screen
- **NFR9:** App must gracefully handle VATSIM events and bookings API unavailability — show cached or empty state without blocking other functionality
- **NFR10:** Google Maps rendering must function with custom JSON styling for both light and dark themes without fallback to default map appearance
- **NFR11:** App must handle Google Maps API errors without crashing — degrade to map without custom styling if needed

### Compatibility

- **NFR12:** App must function identically on iOS and Android with no platform-specific visual regressions
- **NFR13:** NativeWind styling must coexist with any remaining StyleSheet.create() usage during migration without visual conflicts
- **NFR14:** All existing third-party library integrations (react-native-maps, @gorhom/bottom-sheet, react-native-reanimated, Firebase Crashlytics) must continue functioning after NativeWind migration

### Visual Quality

- **NFR15:** Translucent UI elements must maintain consistent opacity (~0.45) across all screens and both themes
- **NFR16:** No hardcoded color values — all colors must flow through the design token system for theme consistency
- **NFR17:** Custom Google Maps styling must visually complement each theme (light and dark) without clashing or reducing map readability
