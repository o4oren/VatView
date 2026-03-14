---
stepsCompleted: [1, 2, 3, 4, 'complete']
session_active: false
workflow_completed: true
inputDocuments: []
session_topic: 'VatView UI/UX modernization — visual refresh, design system direction, layout flexibility'
session_goals: 'Explore design alternatives beyond Material Design, enable landscape mode, elevate overall look and feel for an aviation tracking app'
selected_approach: 'AI-Recommended Techniques'
techniques_used: ['Cross-Pollination', 'SCAMPER Method', 'Morphological Analysis']
ideas_generated: 90
technique_execution_complete: true
selected_direction: 'Direction 3 — Progressive Transformation (Phase 1 → Phase 2)'
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** Oren
**Date:** 2026-03-14

## Session Overview

**Topic:** VatView UI/UX modernization — visual refresh, design system direction, layout flexibility
**Goals:** Explore design alternatives beyond Material Design, enable landscape mode, elevate overall look and feel for an aviation tracking app

### Context Guidance

_VatView is a React Native (Expo) app using react-native-paper (Material Design), react-native-maps with Google Maps, and @gorhom/bottom-sheet. Current aesthetic is blueGrey Material Design theme. The app shows live VATSIM data on maps and lists._

### Session Setup

_Oren wants to modernize VatView's visual identity, potentially moving away from Material Design, while addressing the user-requested landscape mode. The session will explore design directions, layout strategies, and modern UI patterns suitable for an aviation data tracking app._

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** VatView UI/UX modernization with focus on design alternatives, landscape mode, and elevated look and feel

**Recommended Techniques:**

- **Cross-Pollination:** Steal design ideas from other domains — aviation instruments, gaming HUDs, weather apps, automotive dashboards, premium apps, and more
- **SCAMPER Method:** Systematically deconstruct every aspect of VatView's current UI through seven lenses
- **Morphological Analysis:** Map out all design parameters and identify coherent design direction combinations

## Technique Execution Results

### Cross-Pollination (50 ideas generated)

**Domains Explored:** Aviation instruments, gaming HUDs, weather/radar apps, automotive dashboards, music/discovery apps, data visualization, social/community apps, photography/creative tools, wearable/minimal interfaces, navigation/wayfinding, ambient awareness, accessibility/personalization

**Key Breakthroughs:**
- Full-bleed map with floating translucent HUD elements (from gaming HUDs)
- Aviation-flavored selectable theme system (from cockpit/avionics design)
- Landscape as premium "Radar Mode" (from cockpit MFDs)
- Animated data freshness — radar sweep on refresh (from radar apps)
- Progressive disclosure — three levels of detail depth (from FR24/automotive)
- Sectional chart aesthetic for light theme (from VFR charts)
- Map style synced to theme selection (from weather apps)

**Ideas Generated:**

**[Aviation UI #1]**: Dark Glass Cockpit Theme — Deep charcoal background, cyan/green data overlays, amber highlights
**[Aviation UI #2]**: Selectable Aviation Theme System — Day VFR, Night Ops, Radar themes; each a complete coherent palette
**[Aviation UI #3]**: Time-of-Day Auto Theme — App shifts themes based on local time; lockable for preference
**[Automotive UI #4]**: Theme-Aware Typography & Density — Each theme adjusts font weight, contrast, spacing
**[Aviation UI #5]**: Map Style Synced to Theme — Google Maps custom styling shifts with selected theme
**[Aviation UI #6]**: Sectional Chart Aesthetic for Light Theme — Cream background, aviation-specific colors from VFR charts
**[Gaming HUD #7]**: Floating HUD-Style Data Overlays — Lightweight transparent overlays instead of traditional panels
**[Gaming HUD #8]**: Contextual Info Density — Progressive detail reveal as you zoom in on the map
**[Gaming HUD #9]**: Full-Bleed Map with Floating Control Islands — Map edge-to-edge, navigation as floating pills
**[Gaming HUD #10]**: Translucent Bottom Sheet — Frosted-glass panel; map visible through detail view
**[Gaming HUD #11]**: Floating Filter Chips — Semi-transparent toggleable chips on the map
**[Gaming HUD #12]**: Fade-In Contextual Actions — Radial/arc menu on long-press, spatially anchored
**[Layout #13]**: Landscape as "Radar Mode" — Wide aspect ratio transforms the experience; side panels instead of bottom
**[Layout #14]**: Adaptive Panel Positioning — Bottom sheet in portrait, side panel in landscape
**[Weather/Radar #15]**: Layered Data Toggle System — Compact vertical strip for toggling data layers like Windy
**[Weather/Radar #16]**: Animated Data Freshness Pulse — Radar sweep animation on data refresh; fade-in/fade-out for connections
**[Weather/Radar #17]**: Heat Map / Activity Density Overlay — Soft gradient showing traffic/ATC density
**[Premium #18]**: Refined Light Typography — Inter/SF Pro, generous spacing, monospaced callsigns
**[Premium #19]**: Subtle Micro-Animations — Spring physics, smooth interpolation, intentional motion
**[Premium #20]**: Curated Color Restraint — Neutral base + ONE accent color used sparingly
**[Automotive #21]**: Glanceable Status Bar — Thin floating strip showing network vitals at a glance
**[Automotive #22]**: Progressive Disclosure Cards — Info appears in stages: quick peek → pull up → full detail
**[Automotive #23]**: Split-Screen Companion View (Landscape) — Map 60-70% + live feed/list 30-40%
**[Music/Discovery #24]**: "Now Active" Hero Cards — Personalized landing with featured events/busy airports
**[Music/Discovery #25]**: Smooth Tab Transitions — Shared-element morphing between views
**[Music/Discovery #26]**: Search as Spotlight — Floating search pill expands to full-screen translucent overlay
**[DataViz #27]**: Airport Sparklines — Tiny trend charts for traffic/ATC activity over time
**[DataViz #28]**: Pilot Trail Lines — Faint trails behind aircraft showing recent path
**[DataViz #29]**: ATC Coverage as Soft Glow — Radial glow instead of hard polygon boundaries
**[DataViz #30]**: Flight Path Arc Visualization — Great-circle arcs with progress gradient
**[Social #31]**: Pilot/Controller Profile Glimpse — Rating, hours, home vACC as subtle profile info
**[Social #32]**: Event Countdown & Live Badge — Countdown badges on map at event locations
**[Social #33]**: "Watching" / Favorites — Mark pilots/airports as favorites with subtle map highlighting
**[Creative Tool #34]**: Gesture-First Navigation — Minimize visible buttons; swipe-based navigation
**[Creative Tool #35]**: "Focus Mode" — Strip UI to absolute essentials for pure observation
**[Creative Tool #36]**: Cinematic Map Transitions — Smooth fly-to animations when navigating locations
**[Minimal #37]**: Priority-Based Information Architecture — Strict hierarchy: what's visible at each interaction level
**[Minimal #38]**: Compact Marker Redesign — Smaller, cleaner directional markers encoding heading/altitude
**[Minimal #39]**: Whisper Notifications — Brief fade-in/fade-out text for updates, non-intrusive
**[Tablet #40]**: Multi-Panel Dashboard Layout — Map + sidebar with live feed for larger screens
**[Tablet #41]**: Picture-in-Picture Detail View — Floating draggable resizable cards for pilot details
**[Navigation #42]**: Quick-Glance Airport Badges — Colored dots on airports showing ATC staffing status
**[Navigation #43]**: Swipe-Between Related Views — Horizontal swiping to cycle through nearby airports/pilots
**[Navigation #44]**: Route Weather Strip — Horizontal METAR strip along pilot's route
**[Ambient #45]**: Network Pulse Indicator — Breathing dot reflecting network activity level
**[Ambient #46]**: Sunrise/Sunset Terminator Line — Day/night gradient on the map
**[Ambient #47]**: Arrivals/Departures Particle Flow — Animated particles showing traffic flow at airports
**[Personalization #48]**: Configurable HUD Layout — Draggable floating elements, saved per orientation
**[Personalization #49]**: Information Density Slider — Minimal → Standard → Dense, one control
**[Personalization #50]**: Colorblind-Safe Data Encoding — Shape, pattern, size as redundant channels

### SCAMPER Method (34 ideas generated)

**S — Substitute:**
**[SCAMPER-S #51]**: Substitute react-native-paper with Custom Design System — Purpose-built components for HUD philosophy
**[SCAMPER-S #52]**: Substitute Bottom Tabs with Floating Navigation — Compact translucent pill with auto-hide
**[SCAMPER-S #53]**: Substitute Stack Navigation with Fluid Transitions — Shared-element morphing, spatial not stack-based
**[SCAMPER-S #54]**: Substitute Google Maps Default with Custom Tile Styling — Bespoke VatView map look
**[SCAMPER-S #55]**: Substitute Static Icons with Animated Micro-Icons — Subtle animation on aircraft markers

**C — Combine:**
**[SCAMPER-C #56]**: Combine Map + List into Unified View — Synced tray + map on one screen
**[SCAMPER-C #57]**: Combine Airport View + Map View — Airports as a zoom level, not a separate screen
**[SCAMPER-C #58]**: Combine Events + Map as Event Overlay — Events as toggleable map layer
**[SCAMPER-C #59]**: Combine METAR + Airport + Pilot in Contextual Cards — Related data always co-located
**[SCAMPER-C #60]**: Combine Navigation into the Map — Tabs disappear; the app IS the map

**A — Adapt:**
**[SCAMPER-A #61]**: Adapt Apple Maps Transition Model — Everything is zoom/overlay, never leave the map
**[SCAMPER-A #62]**: Adapt FR24 Aircraft Popup Pattern — Compact info strip → pull up for more
**[SCAMPER-A #63]**: Adapt Spotify Dynamic Landing — Personalized opening view of user's region/favorites
**[SCAMPER-A #64]**: Adapt Gaming Minimap — Corner overview for spatial context when zoomed in
**[SCAMPER-A #65]**: Adapt Platform-Native Feel — iOS/Android native blur, haptics, spring animations

**M — Modify / Magnify:**
**[SCAMPER-M #66]**: Magnify Map to 100% Screen — True edge-to-edge, no reserved chrome
**[SCAMPER-M #67]**: Magnify Markers on Interaction — Lens effect spreading overlapping markers
**[SCAMPER-M #68]**: Magnify Event Presence — App mood shifts during major events
**[SCAMPER-M #69]**: Modify Information Hierarchy — ATC coverage dominant, aircraft secondary, airports tertiary
**[SCAMPER-M #70]**: Magnify Sense of Scale — Visual cues conveying network enormity

**P — Put to Other Uses:**
**[SCAMPER-P #71]**: Map as Widget / Screensaver — Live mini-map on home screen or desk display
**[SCAMPER-P #72]**: Detail Panel as Shareable Card — Export branded flight info as image for sharing
**[SCAMPER-P #73]**: Events as Community Calendar — Rich filterable calendar with device integration
**[SCAMPER-P #74]**: List as ATC Frequency Reference — Compact frequency card for simmers

**E — Eliminate:**
**[SCAMPER-E #75]**: Eliminate Tab Bar — Everything lives on the map
**[SCAMPER-E #76]**: Eliminate Separate Settings Screen — Settings as floating overlay panel
**[SCAMPER-E #77]**: Eliminate Default Clutter — Minimal by default, toggle layers on by choice
**[SCAMPER-E #78]**: Eliminate Redundant Data Display — Progressive disclosure ruthlessly applied
**[SCAMPER-E #79]**: Eliminate Loading Dead Screens — Show cached data immediately, refresh flows in

**R — Reverse / Rearrange:**
**[SCAMPER-R #80]**: Reverse Entry Point — Start from search/discovery screen
**[SCAMPER-R #81]**: Reverse Info Flow — Push notifications for staffing/events based on preferences
**[SCAMPER-R #82]**: Rearrange ATC-Centric View — Coverage sectors as primary, pilots as secondary
**[SCAMPER-R #83]**: Reverse Time — Time slider to scrub through recent network history
**[SCAMPER-R #84]**: Rearrange Vertical Scroll on Map — Scrolling detail card over the map surface

### Morphological Analysis

**Design Parameters Mapped:** 8 parameters with 3-5 options each

**Three Design Directions Identified:**

**Direction 1 — Pragmatic Evolution:** Existing component library, light/dark toggle, floating nav island, adaptive chrome, translucent bottom sheet, responsive landscape, refined visuals, subtle animations.

**Direction 2 — Aviation HUD:** Custom design system, multi-theme aviation collection, single-surface map, floating HUD elements, progressive disclosure, distinct radar mode landscape, atmospheric data viz, full micro-animation suite.

**Direction 3 — Progressive Transformation (SELECTED):** Build Direction 2 incrementally through Direction 1.

| Parameter | Phase 1 | Phase 2 |
|---|---|---|
| Design System | NativeWind/Tailwind | Evolve to custom system |
| Themes | Light + Dark | Add aviation themes |
| Navigation | Floating nav island | Collapse into single-surface |
| Map Chrome | Adaptive chrome | Full floating HUD |
| Detail View | Translucent sheet | Progressive disclosure |
| Landscape | Responsive layout | Full radar mode |
| Data Viz | Refined current | Atmospheric + adaptive |
| Animation | Subtle transitions | Full suite |

## Creative Facilitation Narrative

_This session moved from broad cross-domain inspiration (50 ideas across 12+ domains) through systematic deconstruction of VatView's current design (SCAMPER, 34 ideas) to structured parameter mapping (Morphological Analysis). The breakthrough moment was when the "full-bleed map with floating HUD" concept emerged from gaming domain cross-pollination and was immediately validated by Oren. This became the north star for all subsequent ideation. The decision to pursue a Progressive Transformation approach reflects Oren's ambition to fully revamp the app while maintaining a pragmatic shipping cadence._

### Session Highlights

**Key Design Thesis:** VatView 2.0 is an immersive aviation radar window, not a traditional mobile app. The map IS the app. Everything floats.

**User Creative Strengths:** Oren showed strong instinct for balancing ambition with pragmatism — immediately gravitating toward ideas that were exciting but wanting to understand feasibility. His preference for light themes while acknowledging dark theme popularity led to the multi-theme system idea.

**Breakthrough Moments:**
1. "Map can be full screen. Information and buttons floating and somewhat transparent." — the core HUD concept crystallized
2. "Replacing react-native-paper is big, but I want to revamp the app." — commitment to bold direction
3. "It excites me, I am not sure how it plays out." — honest about single-surface uncertainty, leading to the phased approach
4. Selection of Direction 3 — ambitious vision with pragmatic execution path

## Idea Organization and Prioritization

### Thematic Organization

**7 Themes Identified:**

1. **Spatial Architecture** (The Map IS the App) — #9, #52, #56, #57, #58, #60, #66, #75, #77
2. **Floating HUD System** — #7, #10, #11, #21, #26, #34, #76, #79
3. **Aviation Identity & Theme System** — #2, #3, #4, #5, #6, #18, #20, #51, #54
4. **Landscape & Orientation** — #13, #14, #23, #40, #48
5. **Progressive Disclosure & Info Hierarchy** — #8, #22, #37, #38, #49, #62, #69, #78
6. **Alive & Animated Data** — #16, #17, #19, #28, #29, #30, #36, #45, #46, #55, #67
7. **Smart Features & Engagement** — #24, #27, #31, #32, #33, #39, #42, #44, #63, #72, #73, #81, #83

### Prioritization Results — Phase 1 Confirmed Priorities

**Core Phase 1 Deliverables (Oren-confirmed):**

1. **Full-bleed map** — Map goes edge-to-edge, 100% of screen (#9, #66)
2. **Floating & translucent UI** — Navigation island, filter chips, translucent bottom sheet, all floating on the map (#7, #10, #11, #52)
3. **Light + Dark theme** — NativeWind/Tailwind-based theming as foundation for future aviation theme collection (#20, #51)
4. **Responsive landscape layout** — Adaptive panel positioning, side panels in landscape (#14, #23)

**Quick Wins to Ship Alongside Phase 1:**
- Airport staffing badges on map (#42)
- Cinematic fly-to map transitions (#36)
- Compact marker redesign (#38)
- Whisper notifications (#39)

**Phase 2 Flagships (Build Toward):**
- Single-surface collapse — no tabs (#60, #75)
- Aviation theme collection — Day VFR, Night Ops, Radar (#2, #5, #6)
- Full micro-animation suite with radar sweep (#16, #19, #55)
- Time slider history replay (#83)
- Progressive disclosure three-level detail (#22, #62)

### Action Plan — Phase 1 Implementation

**Priority 1: Full-Bleed Map + Floating HUD Foundation**
- Remove react-native-paper dependency; adopt NativeWind/Tailwind for styling
- Extend map to full screen edge-to-edge
- Replace bottom tab navigator with floating translucent navigation island (pill shape, auto-hide capable)
- Convert filter controls to floating semi-transparent chips
- Upgrade @gorhom/bottom-sheet with backdrop blur / frosted glass effect
- **Success Metric:** Map visible behind all UI elements; no opaque chrome bars

**Priority 2: Light + Dark Theme System**
- Define design tokens (colors, spacing, typography, shadows) in a theme configuration
- Create light theme: warm neutral base, refined typography (Inter or SF Pro), monospaced callsigns, one accent color
- Create dark theme: charcoal base with high-contrast data overlays
- Implement custom Google Maps JSON styling per theme (light map / dark map)
- Wire theme switching to system preference + manual toggle
- **Success Metric:** Both themes feel cohesive and intentional; map style matches app chrome

**Priority 3: Responsive Landscape Layout**
- Enable landscape orientation support across all screens
- Implement adaptive detail panel: bottom sheet in portrait, side panel in landscape
- Reposition floating HUD elements per orientation (filter chips, nav island, status strip)
- Test split-screen companion layout in landscape for larger devices
- **Success Metric:** Landscape feels deliberately designed, not just rotated

**Priority 4: Quick Wins**
- Add colored staffing-status dots to airport markers on the map
- Implement smooth animated fly-to when navigating to a location
- Redesign aircraft markers: smaller, cleaner, directional
- Add subtle fade-in/fade-out whisper text for ATC online/offline events

### Implementation Sequence

```
Step 1: Strip react-native-paper → NativeWind/Tailwind migration
Step 2: Full-bleed map + floating nav island (core architecture)
Step 3: Translucent bottom sheet + floating filter chips (HUD system)
Step 4: Light/Dark theme tokens + custom map styling
Step 5: Landscape orientation + adaptive panel positioning
Step 6: Quick wins (badges, fly-to, markers, whispers)
Step 7: Polish, test, ship Phase 1
```

## Session Summary and Insights

**Key Achievements:**
- 90 ideas generated across 3 structured creativity techniques + 1 extension
- 7 coherent themes identified from idea clustering
- Clear two-phase strategy selected (Progressive Transformation)
- Phase 1 priorities confirmed with concrete implementation sequence
- Strong design thesis established: "VatView 2.0 is an immersive aviation radar window"

**Core Design Thesis:**
The map IS the app. Everything floats. The UI is translucent. Themes are aviation-flavored. Landscape is a premium mode. Information reveals progressively. The network feels alive.

**Session Reflections:**
This session successfully moved from open creative exploration to a concrete, prioritized, actionable plan. The Progressive Transformation strategy allows Oren to ship a dramatic visual upgrade (Phase 1) while building toward the full single-surface aviation HUD vision (Phase 2). Each phase is independently valuable and shippable.

---

## Session Extension: VATGlasses Data Discovery (2026-03-14)

**Discovery:** Oren found the VATGlasses data repository — a rich, community-maintained dataset of sector-level airspace definitions used by vatglasses.uk.

### Data Source
**VATGlasses Data** — Community-maintained sector data:
https://github.com/lennycolton/vatglasses-data

**Schema (per region JSON file):**

| Section | Contents |
|---|---|
| **airspace** | Named sectors with actual polygon boundaries, altitude bands (min/max FL), ownership chains, group assignments |
| **positions** | Controller positions with callsign prefixes, frequency, type (CTR/APP/TWR), colors, and conditional color rules based on other online positions |
| **groups** | Named groupings (e.g. "London") with assigned colors |
| **callsigns** | Suffix → role mapping (DEL, GND, TWR, APP, DEP) with sub-suffixes |
| **airports** | Airport-to-callsign mapping with aliases |

**Key capabilities beyond SimAware TRACON:**
- Sector-level polygons (not just facility-level) with altitude bands
- Ownership chains showing bandbox → split hierarchy
- Conditional coloring rules that change based on what other positions are online
- Position frequency and callsign data

### New Ideas Generated

**[VATGlasses #85]**: Sector-Aware ATC Visualization — Show actual sector boundaries that the controller owns, with proper altitude filtering, instead of just "FIR polygon = online"

**[VATGlasses #86]**: Bandbox/Split Detection — Use ownership chain + online positions to show whether sectors are combined (bandboxed) or split, color-coded differently

**[VATGlasses #87]**: Altitude-Layered Airspace View — Since sectors have min/max FL, offer a layer slider to show airspace at different altitudes (like real radar)

**[VATGlasses #88]**: Dynamic Sector Coloring — Use VATGlasses' conditional color rules to show realistic sector colors that change based on staffing state

**[VATGlasses #89]**: Dual Data Source Fallback Strategy — Use VATGlasses as primary where available (richer data), fall back to SimAware TRACON → VATSpy → circle, giving the best possible accuracy per region

**[VATGlasses #90]**: "Who Controls Me Here" Query — Given a position + altitude, trace the ownership chain to show which controller actually has responsibility — useful for pilots

### Phasing Decision

VATGlasses integration is **separated into its own phase (Phase 1.5)** rather than bundled into Phase 1 or 2:

- **Phase 1 is already ambitious** — ripping out react-native-paper, full-bleed map, HUD system, themes, landscape
- **VATGlasses deserves focused effort** — callsign matching, ownership chain resolution, altitude filtering, conditional coloring, multi-source fallback
- **Ships independently** after Phase 1 gives it the visual foundation to shine
- **Potential differentiator** — no other VATSIM mobile app does sector-level visualization with split awareness (desktop-tool territory)

---

## Phase 0.1: ATC TRACON Polygon Rendering (Pre-UI Improvement)

**Discovery:** During mockup review, Oren identified that accurate ATC sector polygons are a high-value improvement that can ship independently before the UI redesign.

### Current State
- **CTR/FSS**: Rendered as FIR polygons from `FIRBoundaries.dat` via VATSpy Data Project — works well
- **APP/DEP**: Rendered as a **generic 80km circle** around the airport — inaccurate
- **TWR/GND/DEL**: Point markers only — no area rendering

### Data Source Discovered
**SimAware TRACON Project** — Official VATSIM community repository:
https://github.com/vatsimnetwork/simaware-tracon-project

- Contains `TRACONBoundaries.json` with actual polygon data for APP/DEP facilities worldwide
- Same data used by **map.vatsim.net**, **SimAware**, and **VATSIM Radar**
- Matching logic: callsign prefix/suffix → polygon lookup, fallback to circle if no match
- Maintained by the same contributor community as VATSpy Data Project
- Shared contributor approval between both projects

### Additional Data Source
**VATSpy Data Project** also offers `Boundaries.geojson` (RFC 7946):
https://github.com/vatsimnetwork/vatspy-data-project/blob/master/Boundaries.geojson

This is the same FIR boundary data VatView already uses, but in cleaner GeoJSON format instead of the pipe-delimited `.dat` file.

### Phase 0.1 Implementation Plan

1. **Fetch `TRACONBoundaries.json`** from SimAware TRACON Project (bundle in static data or fetch on version change)
2. **On APP/DEP controller online** — match callsign prefix/suffix against TRACON data
3. **If match found** — render actual TRACON polygon instead of the 80km circle
4. **If no match** — keep current circle fallback (same behavior as map.vatsim.net)
5. **Optional**: Migrate FIR boundaries from `.dat` parsing to `Boundaries.geojson` for cleaner code

### Why Phase 0.1
- Ships on the **current app** with no UI changes required
- Immediately visible improvement to all users
- Uses official VATSIM data sources (same as map.vatsim.net)
- Lays groundwork for Phase 1's enhanced data visualization (soft glows, layered toggles)
- Addresses Oren's observation that airport ATC staffing visualization is a key feature

---

## Design Decisions Captured During Mockup Review

1. **Aircraft type icons should be preserved** — VatView's existing aircraft-type-specific icons are a strong feature; they just get the refined, compact treatment in the new design
2. **Panel translucency target: ~0.45 opacity** — Map should be clearly visible through the bottom sheet / side panel with backdrop blur
3. **Airport staffing badges** — Show which specific positions are online (DEL, GND, TWR, APP, ATIS) as tiny colored badges below airport markers on the map

---

## Figma Mockups

**File:** https://www.figma.com/design/8dx9CbHB3ETrQaVkPwgKEE

| Page | Description |
|---|---|
| 1-2 | Original mockups (CSS-simulated map) |
| 3-4 | v2 with real map tiles, FIR boundaries, ATC glows, staffing badges (0.8 opacity panels) |
| 5-6 | Same with 0.6 opacity panels |
| 7-8 | Same with 0.45 opacity panels (preferred) |

**HTML mockup source files:** `_bmad-output/mockups/`

---

## Complete Roadmap

| Phase | Focus | Key Deliverables |
|---|---|---|
| **0.1** | ATC Polygon Accuracy | TRACON polygon rendering for APP/DEP, optional GeoJSON migration |
| **1** | Visual Modernization | Full-bleed map, floating HUD, NativeWind, light/dark themes, landscape support |
| **1.5** | VATGlasses Sector Intelligence | Sector-level ATC visualization, bandbox/split detection, altitude layers, dynamic coloring, multi-source fallback |
| **2** | Aviation HUD Vision | Single-surface map, aviation theme collection, full animation suite, progressive disclosure |
