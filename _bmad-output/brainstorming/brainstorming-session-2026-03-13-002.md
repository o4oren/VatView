---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Firebase Analytics event tracking strategy for VatView — screen transitions and user interaction events'
session_goals: 'Define which screen changes and user interactions (aircraft, ATC, buttons, etc.) to track with Firebase Analytics to gain actionable product insights'
selected_approach: 'ai-recommended'
techniques_used: ['Question Storming', 'Morphological Analysis', 'Role Playing']
ideas_generated: 22
context_file: ''
session_continued: true
continuation_date: '2026-03-13'
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Oren
**Date:** 2026-03-13

## Session Overview

**Topic:** Firebase Analytics event tracking strategy for VatView — screen transitions and user interaction events
**Goals:** Define which screen changes and user interactions (aircraft, ATC, buttons, etc.) to track with Firebase Analytics to gain actionable product insights

### Session Setup

_Session initialized to explore what events VatView should log through Firebase Analytics. The app has a map-centric UX with bottom sheet details, list views, airport views, and event views. Key interaction patterns include tapping aircraft/ATC markers on the map, filtering lists, viewing airport details, and navigating between tabs. The goal is to capture data that reveals how users actually use the app and what features matter most._

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Firebase Analytics event tracking strategy with focus on actionable product insights

**Recommended Techniques:**

- **Question Storming:** Start by generating the product questions analytics must answer — ensures every tracked event has a purpose
- **Morphological Analysis:** Systematically map the event space (screens × interaction types × user intent × data dimensions) for comprehensive coverage
- **Role Playing:** Embody different user personas to discover interactions and journeys the systematic grid might miss

**AI Rationale:** This sequence moves from "what do we want to know?" → "what's the complete event space?" → "what would real users actually do?" — building a tracking strategy that is both comprehensive and insight-driven.

## Technique Execution Results

### Technique 1: Question Storming

**Focus:** Generate the product questions that analytics must answer before defining events.

**Ideas Generated:**

**[Engagement #1]**: Daily/Weekly/Monthly Active Users
_Concept_: Track unique user sessions to measure DAU, WAU, MAU — the baseline health metric for the app.
_Novelty_: Essential starting point every other question builds on.

**[Engagement #2]**: User Retention Rate
_Concept_: What percentage of users return after Day 1, Day 7, Day 30? Are we keeping the people we attract?
_Novelty_: Requires tracking first-open event and subsequent session starts to build cohort curves.

**[Engagement #3]**: Acquisition Source
_Concept_: Where are new users coming from? App store search, direct link, word of mouth? What's driving installs?
_Novelty_: Firebase can attribute install sources — need to define what "first session" behavior looks like.

**[Engagement #4]**: What Feature or Action Correlates with Retention?
_Concept_: Is there an "aha moment" — a specific action in the first session that predicts whether a user comes back?
_Novelty_: Requires correlating first-session events with return visits — the classic activation metric.

**[Segmentation #5]**: How Does Behavior Differ by Platform?
_Concept_: Do iOS users engage differently than Android users? Different session lengths, different features used, different retention curves?
_Novelty_: Platform as a dimension on every event reveals if the experience is truly equal.

**[Segmentation #6]**: How Does Behavior Differ by App Version?
_Concept_: When we ship a new version, does engagement go up or down? Do specific features get used more after an update?
_Novelty_: Version tracking on every event lets you measure the impact of each release.

**[Segmentation #7]**: How Does Activity Level Segment Users?
_Concept_: Can we define user tiers — casual (1x/week), regular (3-4x/week), power user (daily)? What does each tier do differently?
_Novelty_: Moving beyond "active/inactive" binary to a spectrum that reveals different user needs.

**[Map Interaction #8]**: How Do Users Navigate the Map?
_Concept_: Do users zoom in to specific regions/airports or stay zoomed out watching global traffic? How much do they pan/scroll?
_Novelty_: Zoom level distribution reveals "big picture watchers" vs "local trackers" — different use cases.

**[Map Interaction #9]**: How Often Do Users Tap Aircraft Markers?
_Concept_: What percentage of sessions include tapping a pilot marker? How many markers per session? Quick browse or deep read?
_Novelty_: Tap frequency + detail sheet engagement reveals if the map is a "browse" or "search" experience.

**[Map Interaction #10]**: How Often Do Users Tap ATC Markers?
_Concept_: Are ATC markers tapped as frequently as aircraft? Do certain facility types (Center, Approach, Tower) get more attention?
_Novelty_: ATC vs pilot tap ratio could reveal distinct user segments — pilot vs ATC enthusiasts.

**[Map Interaction #11]**: What Happens After a Tap?
_Concept_: When a user taps a marker and the bottom sheet opens — how long do they read it? Do they dismiss quickly or scroll through details?
_Novelty_: Post-tap behavior is the real engagement signal — a tap is curiosity, dwell time is interest.

**[Navigation #12]**: Which Tabs Do Users Actually Use?
_Concept_: What's the distribution across Map, List, Airports, Events? Is the map 90% of usage or more balanced?
_Novelty_: Tab distribution reveals whether VatView is perceived as a "map app" or a "multi-tool."

**[Navigation #13]**: What's the Screen Flow Sequence?
_Concept_: What paths do users take through the app? Map → List → back to Map? Are there common journeys or random?
_Novelty_: Flow sequences reveal user intent patterns.

**[Navigation #14]**: How Often Are Menu Items Accessed?
_Concept_: Settings, About, Network Status — how frequently are these opened? Which menu items get tapped vs ignored?
_Novelty_: Menu usage reveals what users care about beyond the core experience.

**[Navigation #15]**: Every Screen Transition as an Event
_Concept_: Log every screen change with source → destination. Build a complete picture of how users move through the app.
_Novelty_: Tracking transitions rather than screens reveals the app's actual UX graph.

**[Session #16]**: What's the Average Session Duration?
_Concept_: How long do users keep VatView open? Quick 30-second check or 20-minute monitoring session? Distinct patterns?
_Novelty_: Session length clusters could reveal fundamentally different use cases.

**[Session #17]**: How Many Sessions Per Day Per User?
_Concept_: Do users open the app once and stay, or check in multiple times? "Leave it open" vs "quick glance" app.
_Novelty_: Frequency × duration gives the real engagement picture.

**[Session #18]**: What Time of Day Do Users Open the App?
_Concept_: Is there a peak usage hour? Does it correlate with VATSIM peak traffic or user leisure patterns?
_Novelty_: Time-of-day patterns reveal whether users check for a reason or browse habitually.

**[Session #19]**: Do Sessions Cluster Around VATSIM Events?
_Concept_: Does app usage spike when major VATSIM events are happening? Are events a growth driver?
_Novelty_: Direct correlation between VATSIM event schedule and app usage.

### Technique 2: Morphological Analysis

**Focus:** Systematically map the complete event space across all screens and interaction types.

**Event Map:**

| Screen | Events |
|---|---|
| Map | `screen_view`, `map_zoom`, `map_pan`, `marker_tap_pilot`, `marker_tap_atc`, `bottom_sheet_open`, `bottom_sheet_close`, `filter_toggle` |
| List | `screen_view`, `list_filter_change`, `list_item_tap`, `list_scroll` |
| Airports | `screen_view`, `airport_select`, `airport_detail_view` |
| Events | `screen_view`, `event_tap`, `event_detail_view` |
| ATC Bookings / Metar / Event Details | `screen_view`, `item_tap` |
| Settings / About / Network Status | `screen_view`, `setting_change` |

**Global Properties (every event):** `platform`, `app_version`, `session_id`, `timestamp`, `user_id`

**Global Navigation Events:** `tab_switch` (source → destination), `menu_open`, `screen_transition`

### Technique 3: Role Playing

**Focus:** Stress-test the event map through VATSIM user personas.

**[User Identity #20]**: VATSIM CID Linked vs Anonymous User
_Concept_: Track whether a user has connected their VATSIM identity. Splits the user base into two meaningful cohorts.
_Novelty_: Fundamental segmentation dimension for every other metric.

**[Self-Tracking #21]**: User Viewing Their Own Flight/Position
_Concept_: Detect when a user taps or searches for their own callsign/CID. "Watching myself fly" is a distinct high-engagement use case.
_Novelty_: Self-tracking sessions are probably longer, more frequent, and the strongest retention signal.

**[Controller Behavior #22]**: ATC User Checking Their Own FIR/Position
_Concept_: Does a linked controller user zoom into or view their own controlled airspace? Pre-session planning tool.
_Novelty_: Reveals VatView as a planning tool for controllers — a use case worth designing for.

## Idea Organization and Prioritization

### Thematic Organization

**Theme 1: User Identity & Segmentation** (#1, #2, #3, #5, #6, #7, #20)
Foundation layer — dimensions attached to every event.

**Theme 2: Activation & Retention Drivers** (#4, #19)
Highest strategic value — the "why do they stay?" questions.

**Theme 3: Map Interactions** (#8, #9, #10, #11)
Core experience layer — where most engagement likely lives.

**Theme 4: Navigation & Screen Flow** (#12, #13, #14, #15)
App structure layer — reveals how the UX actually gets used.

**Theme 5: Session Patterns** (#16, #17, #18)
Temporal layer — when and how long.

**Theme 6: VATSIM-Specific Behavior** (#21, #22)
Differentiator — what makes VatView analytics unique vs generic app analytics.

### Implementation Priority

**Tier 1 — Foundation (attach to every event):**
- Platform, app version, session ID, timestamp, user ID, VATSIM CID (if linked)

**Tier 2 — Core Events (implement first):**
- `session_start` / `session_end` (duration, frequency, time-of-day)
- `screen_view` on every screen change (with source → destination)
- `tab_switch` with source/destination
- `marker_tap_pilot` / `marker_tap_atc` (with object details)
- `bottom_sheet_open` / `bottom_sheet_close` (with dwell time)

**Tier 3 — Enrichment (implement next):**
- `map_zoom` / `map_pan` (zoom level buckets, not continuous)
- `filter_toggle`, `list_filter_change`, `list_item_tap`
- `airport_select`, `event_tap`, `menu_open`, `setting_change`
- Self-tracking detection (user viewing own callsign/CID)

**Tier 4 — Analysis (derive from data):**
- Retention cohorts, activation metrics, session clustering around events
- User segmentation by activity level
- Tab distribution analysis, screen flow graphs

## Session Summary

**Key Achievements:**
- 22 ideas generated across 6 themes covering the full analytics event space
- Clear 4-tier implementation priority from foundation to advanced analysis
- Complete event map covering all screens and interaction types
- VATSIM-specific tracking insights (CID linking, self-tracking) as unique differentiators

**Next Steps:**
1. Implement Tier 1 foundation properties and Tier 2 core events
2. Validate event naming convention consistency with Firebase best practices
3. Add Tier 3 enrichment events as capacity allows
4. Set up Firebase dashboards to answer the prioritized product questions
