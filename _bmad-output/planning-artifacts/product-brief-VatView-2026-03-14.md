---
stepsCompleted: [1, 2, 3, 4, 5, 'complete']
workflow_completed: true
inputDocuments:
  - '_bmad-output/brainstorming/vatview-2.0-ui-redesign-and-roadmap.md'
  - '_bmad-output/project-context.md'
  - 'docs/index.md'
  - 'docs/project-overview.md'
  - 'docs/architecture.md'
  - 'docs/technology-stack.md'
date: 2026-03-14
author: Oren
---

# Product Brief: VatView

## Executive Summary

VatView is the premier mobile companion for VATSIM pilots — a live, interactive map showing real-time ATC coverage, pilot positions, events, and booked controller times. Launched in 2021 and available on both iOS and Android, VatView has established a loyal user base with unique features like aircraft-type-specific icons, TRACON polygon rendering, and ATC booking visibility.

Phase 1 is a visual modernization that transforms VatView from a functional but dated Material Design app into an immersive aviation experience. The map becomes the app — full-bleed, edge-to-edge — with translucent floating UI elements, light and dark themes, and responsive landscape support. The goal is to ship a dramatically elevated look and feel that generates community buzz, attracts new users, and lays the architectural foundation for Phase 2's single-surface navigation, aviation theme collection, and upcoming social features (friends, self-tracking, airspace alerts).

---

## Core Vision

### Problem Statement

VatView's current UI, built on react-native-paper's Material Design components, feels congested and visually dated. The map — the core of the experience — competes for screen space with opaque chrome bars and tab navigation. Information density is high by default with no progressive disclosure. The overall aesthetic doesn't match the premium, aviation-flavored experience that VATSIM pilots expect from their primary mobile tracking tool.

Visual quality signals data trustworthiness. When a pilot checks ATC coverage before connecting, a polished app says "this data is accurate, this tool is maintained." A dated UI undermines confidence in the very data that is VatView's reason to exist.

### Problem Impact

- **Perceived reliability:** The dated look undercuts trust in the data — users subconsciously associate visual polish with accuracy and maintenance quality
- **Growth ceiling:** New users comparing VatView to polished apps like FlightRadar24 may dismiss it despite VatView's superior VATSIM-specific feature set
- **Visual congestion:** Too much information shown at all times — the app feels cramped rather than purposeful, with no hierarchy between glanceable and deep-dive data
- **Missing landscape:** Pilots using tablets or wanting a cockpit-companion view cannot orient horizontally — a repeatedly requested feature
- **Buzz potential untapped:** VatView's unique features (ATC bookings, events, TRACON polygons) deserve a visual frame worthy of sharing on VATSIM forums, Reddit, and Discord

### Why Existing Solutions Fall Short

- **map.vatsim.net / SimAware:** Web-based, not native mobile — no offline state, no push potential, no native feel
- **Other VATSIM mobile apps:** Either abandoned, limited in features, or similarly dated in design
- **FlightRadar24:** Beautiful but tracks real-world traffic, not VATSIM — different audience entirely
- **No VATSIM mobile app** currently offers: immersive full-bleed map, translucent HUD, progressive disclosure, landscape mode, or the combination of events + ATC bookings + live tracking in a polished native package

### Proposed Solution

Transform VatView's visual layer through a "floating HUD" design philosophy — the emotional shift from "utility app" to "aviation instrument":

1. **Full-bleed map** — Map extends edge-to-edge; no opaque bars or reserved chrome. The map IS the app
2. **Floating translucent UI** — Navigation island, filter chips, and detail panels float over the map with backdrop blur (frosted glass, ~0.45 opacity). Every UI element is see-through
3. **Progressive disclosure** — Show less by default. Glanceable → tap for more → pull up for full detail. Reduce congestion by design, not just by styling
4. **Light + Dark themes** — NativeWind/Tailwind-based design tokens: one accent color used sparingly, monospaced callsigns, custom Google Maps JSON styling per theme
5. **Refined markers** — Preserve aircraft-type-specific icons (existing strength) with a cleaner, more compact treatment
6. **Responsive landscape** — Adaptive layout with side panels in landscape, bottom sheet in portrait. Implemented last, leveraging the orientation-agnostic floating HUD architecture

**Implementation sequence** (landscape last, architecture-ready from step 2):

```
Step 1: NativeWind/Tailwind migration (strip react-native-paper)
Step 2: Full-bleed map + floating nav island
Step 3: Translucent bottom sheet + floating filter chips
Step 4: Light/Dark theme tokens + custom map styling
Step 5: Quick wins (markers, fly-to, badges)
Step 6: Landscape orientation + adaptive panels
Step 7: Polish & ship
```

**Highest-risk item:** NativeWind migration touches every component. Must validate compatibility with react-native-maps and @gorhom/bottom-sheet early. If NativeWind doesn't play well, the styling approach needs to flex.

**Scope flex candidate:** Landscape (Step 6) can ship as a fast-follow OTA update — it's pure JS layout logic, no native code changes. Phase 1 without landscape is still a dramatic upgrade.

### Key Differentiators

- **Only native VATSIM mobile app** with an immersive, aviation-inspired HUD aesthetic
- **ATC bookings + events** — killer features no competitor surfaces as well on mobile
- **Aircraft-type-specific icons** — existing strength, refined not replaced
- **Phase 2 pipeline:** Architecture designed for single-surface navigation, aviation theme collection, and social features (show friends, track me, airspace alerts) — a moat no web-based tool can match
- **Solo developer passion project** — ships fast, iterates on community feedback, no corporate roadmap friction

### Phase 2 Readiness (designed for, not yet built)

Phase 1 architectural choices explicitly enable Phase 2 without a second rewrite:

- **Theme tokens** structured to accept additional aviation themes (Day VFR, Night Ops, Radar)
- **Navigation architecture** that can collapse tabs into single-surface map-centric navigation
- **Component system** ready to host social features without rearchitecting
- **Floating element positioning** built with responsive values, making landscape and future layout modes configuration changes rather than construction

### Success Metrics

- **Buzz:** Measurable engagement on VATSIM forums, Reddit, Discord posts announcing the update (comments, shares, new install spikes in the week after launch)
- **Downloads:** Increase in weekly installs post-launch vs. baseline
- **Retention:** Existing user retention maintained or improved through the transition
- **App Store perception:** Updated screenshots drive higher conversion rates
- **User sentiment:** "Wow" reactions, positive reviews mentioning the new look

---

## Target Users

### Primary Users

**Persona 1: "Pre-flight Planner" — The Active VATSIM Pilot**

*Typical user: Flies VATSIM weekly on PC/Mac, checks phone before and during sessions*

- **Context:** About to start a flight sim session and wants to know where ATC is staffed, what events are running, and whether their route has coverage. Opens VatView on their phone while their sim loads.
- **Current pain:** The cramped map makes it hard to quickly scan ATC coverage. Pinching and scrolling through opaque chrome to find what they need. The app works but doesn't feel like the premium cockpit companion it could be.
- **What success looks like:** Opens VatView, instantly sees the full picture — staffed sectors glowing on a clean map, a quick tap reveals details, and the whole experience feels like glancing at an aviation instrument. Keeps it open on a tablet in landscape as a companion display during the flight.
- **"Aha" moment (Phase 1):** The first time they see the full-bleed translucent HUD — "this looks like a real radar scope, not a generic app."

**Persona 2: "The Controller on Break" — VATSIM ATC**

*Typical user: Controls a position on VATSIM, checks VatView to see the network state*

- **Context:** Checks what's staffed around their sector, sees inbound traffic, looks at ATC bookings to plan their next session. May check before logging on to see if coverage is needed.
- **Current pain:** Same visual congestion issues. Hard to quickly parse which adjacent sectors are staffed vs. not.
- **What success looks like:** Glanceable ATC coverage map with clear staffing visibility. ATC bookings (a killer feature) are easy to find and browse.

### Secondary Users

**Persona 3: "The Armchair Watcher" — VATSIM Spectator/Enthusiast**

*Typical user: Former VATSIM pilot, aviation enthusiast, or curious newcomer who likes watching live traffic*

- **Context:** Opens VatView to browse — watches traffic during big events, checks out busy airports, casually explores. May have discovered VATSIM through an app store search for aviation apps.
- **Current pain:** The dated look doesn't invite exploration. No visual delight to reward casual browsing.
- **What success looks like:** The immersive full-bleed map makes watching VATSIM traffic a visually engaging experience. Events are easy to discover. The app is beautiful enough to show a friend — "look at this cool thing."
- **Growth potential:** These users are the most likely to share screenshots and generate organic buzz. A visually stunning app turns passive watchers into evangelists.

### User Journey

**Discovery:** App store search ("VATSIM", "VATSIM map", "flight tracking"). No active marketing — growth is entirely organic through app store presence and occasional word-of-mouth on VATSIM forums/Discord.

**Onboarding:** User opens the app and lands directly on the live map with active pilots and ATC. No sign-up required. Value is immediate — they see the network in real time within seconds.

**Core Usage:** Quick pre-flight ATC check (1-2 minutes), extended companion use during a flight session (30+ minutes on tablet), or casual browsing during events. ATC bookings and events are key "come back" features — reasons to open the app even when not flying.

**Success Moment (Phase 1):** The visual upgrade makes users feel pride in showing the app to others. The full-bleed map with translucent HUD elements transforms the perception from "handy utility" to "this is my go-to aviation tool."

**Long-term:** VatView becomes the reflexive first check before any VATSIM session — "let me see what's going on." Phase 2 social features (friends, self-tracking, alerts) deepen this into a daily habit.

---

## Success Metrics

### User Success Metrics

| Metric | What it measures | How to track |
|---|---|---|
| **Retained core usage** | Existing users don't churn during the transition | Firebase: DAU/WAU stability post-launch vs. pre-launch baseline. Target: >90% of pre-upgrade active users still active at 30 days |
| **Session engagement** | Users spend at least as much time in-app as before | Firebase: average session duration maintained or increased |
| **New UI adoption** | Users interact with new design elements (theme toggle, floating nav, filter chips) | Firebase: event tracking on specific new UI interactions |

### Business Objectives

VatView is a passion project with no revenue model. Success is measured in product quality, user health, and community growth — not financials.

| Objective | Target | Timeframe |
|---|---|---|
| **Don't lose existing users** | >90% of pre-upgrade active users retained | 30 days post-launch |
| **Grow active user base** | From ~3,000 toward 4,500+ active users | 3-6 months post-launch |
| **Positive user sentiment** | No spike in negative reviews; new reviews mention the redesign positively | 3 months post-launch |

### Key Performance Indicators

**Primary KPIs (track weekly post-launch):**

1. **Active users** — Firebase MAU/WAU. Baseline: ~3,000. Goal: sustained growth
2. **Existing user retention** — Percentage of pre-upgrade users still active at Day 7 and Day 30. Target: >90%
3. **App store rating** — No regression; ideally improvement from new reviews

**Secondary KPIs (track monthly):**

4. **New UI element adoption** — Percentage of users who used theme toggle, floating nav, filter chips within first 7 days
5. **New installs per week** — Sustained lift vs. pre-launch baseline

---

## MVP Scope (Phase 1)

### Core Features (Must Ship)

| # | Feature | Description | Risk |
|---|---|---|---|
| 1 | **NativeWind/Tailwind migration** | Replace react-native-paper with NativeWind. All existing components restyled. | Highest risk — touches every component. Validate compatibility with react-native-maps and @gorhom/bottom-sheet first. |
| 2 | **Full-bleed map** | Map extends edge-to-edge. No opaque chrome bars. | Depends on #1 completing successfully. |
| 3 | **Floating navigation island** | Replace bottom tab bar with a floating translucent pill. Auto-hide capable. | Core architectural change — defines the new interaction model. |
| 4 | **Translucent bottom sheet** | Upgrade @gorhom/bottom-sheet with backdrop blur / frosted glass (~0.45 opacity). Map visible through detail panels. | Need to validate blur performance on lower-end devices. |
| 5 | **Floating filter chips** | Semi-transparent toggleable filter controls floating on the map. | Straightforward once #1-3 are in place. |
| 6 | **Light + Dark themes** | NativeWind design tokens: neutral base, one accent color, monospaced callsigns. Custom Google Maps JSON styling per theme. System preference + manual toggle. | Medium — theme token architecture must support future aviation themes (Phase 2). |
| 7 | **Progressive disclosure** | Reduce default information density. Three levels: glanceable → tap for more → pull up for full detail. | Requires rethinking what's shown at each level — design decisions needed per view. |
| 8 | **All existing features preserved** | List view, airport view, events, ATC bookings, METAR, network status, client details — everything carries over, restyled in the new design language. | Migration scope — every screen needs attention. |

### Quick Wins (Ship if time allows)

These enhance the Phase 1 experience but can slip to a fast-follow OTA update without blocking launch:

| Feature | Description |
|---|---|
| **Refined aircraft markers** | Smaller, cleaner, directional — preserve aircraft-type icons |
| **Cinematic fly-to** | Smooth animated map transitions when navigating to a location |
| **Airport staffing badges** | Colored dots on airport markers showing which positions are online |
| **Whisper notifications** | Brief fade-in/fade-out text for ATC online/offline events |

### Scope Flex Candidate

**Landscape orientation + adaptive panels** — Implemented last (Step 6). Bottom sheet becomes side panel in landscape, floating elements reposition. Can ship as a fast-follow OTA update since it's pure JS layout logic. Phase 1 without landscape is still a dramatic upgrade.

### Out of Scope (Phase 2+)

| Feature | Phase | Rationale |
|---|---|---|
| Single-surface navigation (no tabs) | Phase 2 | Requires the floating nav foundation from Phase 1 |
| Aviation theme collection (Day VFR, Night Ops, Radar) | Phase 2 | Theme token architecture built in Phase 1 supports this |
| Full micro-animation suite + radar sweep | Phase 2 | Polish layer on top of Phase 1's foundation |
| Time slider history replay | Phase 2 | New data infrastructure needed |
| Social features (show friends, track me, airspace alerts) | Phase 2+ | Requires backend/account system |
| VATGlasses sector-level ATC visualization | Phase 1.5 | Separate data integration effort, ships independently |
| Marketing, app store optimization | N/A | Hobby project — organic growth only |

### MVP Success Criteria

Phase 1 is ready to ship when:

1. **All 8 core features functional** — full-bleed map, floating HUD, themes, progressive disclosure, all existing features working
2. **No regression in core functionality** — every feature from the current app works in the new UI
3. **Both platforms stable** — iOS and Android tested, no new crash patterns in Firebase Crashlytics
4. **Visual target met** — implemented UI matches Figma mockups at the ~0.45 opacity translucency level
5. **Performance maintained** — 20-second polling cycle, map rendering, and marker updates perform at least as well as current app

### Future Vision

Phase 1 is the foundation for a multi-phase transformation:

| Phase | Focus | Builds on |
|---|---|---|
| **Phase 1** (this brief) | Visual modernization — HUD, themes, progressive disclosure, landscape | Current app |
| **Phase 1.5** | VATGlasses sector-level ATC visualization, bandbox/split detection, altitude layers | Phase 1's enhanced map + data viz foundation |
| **Phase 2** | Single-surface navigation, aviation theme collection, full animation suite, progressive disclosure depth | Phase 1's floating nav + theme token architecture |
| **Phase 2+** | Social features — show friends, track me, airspace alerts. The differentiator moat. | Phase 2's account/backend infrastructure |

The long-term vision: **VatView is an immersive aviation radar window, not a traditional mobile app.** The map IS the app. Everything floats. The network feels alive. And eventually, it knows who your friends are.
