---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# VatView - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for VatView, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can view a full-bleed, edge-to-edge interactive map as the primary app surface
FR2: User can view live pilot positions as aircraft-type-specific markers on the map, updated every 20 seconds
FR3: User can view ATC coverage areas as polygon overlays (FIR boundaries, TRACON polygons) on the map
FR4: User can view airport markers with active ATC indicators on the map
FR5: User can pan, zoom, and interact with the map without UI chrome obstructing the map edges
FR6: User can tap a pilot marker to view pilot details in a translucent bottom sheet
FR7: User can tap a controller/ATC element to view controller details in a translucent bottom sheet
FR8: User can tap an airport marker to view airport ATC details in a translucent bottom sheet
FR9: User can view glanceable summary information (level 1) for any selected client without additional interaction
FR10: User can tap to expand to moderate detail (level 2) for a selected client
FR11: User can pull up to view full detail (level 3) for a selected client, including flight plan, ATIS text, or full ATC info
FR12: User can navigate between Map, List, Airports, and Events views via a floating navigation island
FR13: User can access About, Settings, Network Status, Event Details, ATC Bookings, and METAR screens from the navigation structure
FR14: User can return to the map view from any other screen
FR15: User can toggle pilot visibility on the map via floating filter chips
FR16: User can toggle ATC visibility on the map via floating filter chips
FR17: User can search for pilots and controllers by callsign or other identifiers in the list view
FR18: User can search for airports by ICAO or IATA code
FR19: User can view a filterable list of all online pilots and controllers
FR20: User can tap a list item to view client details
FR21: User can search for and select an airport to view its details
FR22: User can view active ATC positions at a selected airport
FR23: User can view arriving and departing traffic at a selected airport
FR24: User can view a list of upcoming VATSIM events
FR25: User can tap an event to view its full details
FR26: User can view a list of ATC bookings
FR27: User can view details of individual ATC bookings
FR28: User can view METAR weather data for any airport
FR29: User can switch between light and dark themes
FR30: App can automatically follow system theme preference
FR31: User can manually override theme selection in Settings
FR32: Map styling adjusts to match the active theme (custom Google Maps JSON per theme)
FR33: All UI elements (navigation island, bottom sheet, filter chips) render with translucent frosted-glass appearance (~0.45 opacity)
FR34: User can use the app in portrait orientation on phone and tablet
FR35: User can use the app in landscape orientation on phone and tablet
FR36: App adapts layout between portrait (bottom sheet) and landscape (side panel) automatically
FR37: Floating UI elements reposition responsively when orientation changes
FR38: User can access a Settings screen to configure theme preference
FR39: App displays live VATSIM data refreshed every 20 seconds
FR40: App loads events and ATC bookings on launch
FR41: App displays network connectivity status
FR42: App persists last-known state for display on cold start
FR43: All current VatView features (TRACON polygons, FIR boundaries, aircraft-type icons, METAR parsing, ATC facility categorization) continue to function identically in the redesigned UI

### NonFunctional Requirements

NFR1: Map interactions (pan, zoom, tap) must remain fluid with no perceptible lag during 20-second data refresh cycles
NFR2: Marker rendering for up to 1,500+ simultaneous pilots must complete within the 20-second refresh window without dropped frames
NFR3: Bottom sheet open/close animations must render at 60fps, including backdrop blur effect
NFR4: Backdrop blur (frosted glass) must not cause visible stutter on mid-range devices (2-3 year old phones). If blur causes frame drops below 30fps on a target device, fall back to semi-transparent solid background
NFR5: Orientation change (portrait to landscape and back) must complete layout transition within 300ms with no visual glitches
NFR6: Theme switching must apply immediately with no app restart required
NFR7: App cold start time must not regress from current performance
NFR8: App must gracefully handle VATSIM live data API unavailability — display last-known data and indicate stale state, not crash or show empty screen
NFR9: App must gracefully handle VATSIM events and bookings API unavailability — show cached or empty state without blocking other functionality
NFR10: Google Maps rendering must function with custom JSON styling for both light and dark themes without fallback to default map appearance
NFR11: App must handle Google Maps API errors without crashing — degrade to map without custom styling if needed
NFR12: App must function identically on iOS and Android with no platform-specific visual regressions
NFR13: NativeWind styling must coexist with any remaining StyleSheet.create() usage during migration without visual conflicts
NFR14: All existing third-party library integrations (react-native-maps, @gorhom/bottom-sheet, react-native-reanimated, Firebase Crashlytics) must continue functioning after NativeWind migration
NFR15: Translucent UI elements must maintain consistent opacity (~0.45) across all screens and both themes
NFR16: No hardcoded color values — all colors must flow through the design token system for theme consistency
NFR17: Custom Google Maps styling must visually complement each theme (light and dark) without clashing or reducing map readability

### Additional Requirements

**From Architecture:**
- NativeWind v4.2.2 must be validated for compatibility with react-native-maps before migrating map overlay components
- NativeWind v4.2.2 must be validated for compatibility with @gorhom/bottom-sheet v5 before migrating detail panels
- BlurWrapper component must implement platform-based rendering: iOS native backdrop blur (expo-blur), Android semi-transparent solid background with 1px border + elevation shadow (permanent design decision, no Android blur)
- ThemeContext architecture: NativeWind `dark:` variants for UI + lightweight React context for Maps styling, manual override, and persisted preference
- FloatingNavIsland is wired as the Tab Navigator's custom `tabBar` and overlays content via absolute `tabBarStyle`; it receives `{ state, navigation }` and calls `navigation.navigate()` — React Navigation continues managing screen state
- DetailPanelProvider abstraction built now (portrait bottom sheet), landscape side panel container deferred but abstraction ready
- Progressive disclosure uses a single complete card per detail type with content ordered by information priority; the bottom sheet snap points control how much of the card is physically visible — no conditional content rendering
- AircraftIconService: SVG-to-bitmap pipeline replacing iconsHelper.js — pre-renders FSTrAk SVG silhouettes into cached ImageSource objects for native map markers
- Zoom-aware airport markers: five bands (Global ≤4, Continental 5-6, Regional 7-8, Local 9-10, Airport >10) with Image markers at Global zoom and View-based markers with ATC badges at Continental+ zoom
- Animation token system: duration.fast (150ms), duration.normal (250ms), duration.slow (400ms), spring.sheet (damping 20, stiffness 300)
- Tab cross-fade transitions (250ms) instead of hard cuts
- MapOverlayGroup orchestrates all floating element positions based on sheet state, orientation, and nav island visibility
- Migration order: Infrastructure → Theme → Shared components → Map navigation → Map screen → Detail views → List → Airport → Events/Bookings → Secondary screens → Polish/remove react-native-paper
- NativeWind and StyleSheet.create() coexistence rules: never mix within a single component; use StyleSheet for @gorhom/bottom-sheet container and react-native-maps Marker/Polygon styles
- All Reanimated animations must use `useAnimatedStyle()` with shared values, never NativeWind class toggling
- JetBrains Mono font bundled for aviation data display (callsigns, frequencies, ICAO codes, flight plan strings)
- 5 new detail card components for progressive disclosure (1 per detail type: pilot, ATC, CTR, airport-ATC, airport)

**From UX Design:**
- Custom design system built on NativeWind/Tailwind primitives — no off-the-shelf component library for visible UI elements
- Platform-aware blur strategy: iOS uses native backdrop blur via expo-blur; Android uses semi-transparent solid background + 1px border + elevation (permanent platform design decision)
- Dynamic opacity strategy: 0.45 default, 0.65 for dense map backgrounds, 0.85 for full-detail panels
- ATC letter badges on airport markers: C (grey/Clearance), G (green/Ground), T (amber/Tower), A (blue/Approach), A (cyan/ATIS)
- Traffic count indicators: green up-arrow departures, red down-arrow arrivals
- Aircraft markers as SVG silhouettes from FSTrAk project, rotated to heading, theme-aware coloring
- Dark theme as "hero" aesthetic; light theme as clean modern counterpart
- Color system: Primary accent #3B7DD8 (dark), #2A6BC4 (light); surface.base #0D1117 (dark), #FFFFFF (light)
- Typography: System sans for UI text, JetBrains Mono for aviation data; 9 type variants defined
- Spacing system: 4px-based, biased toward larger values; 64px minimum list item height
- StaleIndicator as single source of truth for data state: green (live), amber pulse (stale), red pulse (error)
- Empty states: always explain why empty with muted text, never block other functionality
- Skeleton placeholders for list-based loading (not spinners), inline loading for content areas
- Search in List/Airport/Events views only (not on map — filter chips only on map)
- WCAG 2.1 AA compliance: 4.5:1 contrast ratios, 44x44px touch targets, screen reader labels, reduced motion support
- Reduced motion: all duration tokens resolve to 0ms when system "Reduce Motion" enabled
- Screen reader navigation order on map: NavIsland → filter chips → StaleIndicator → map markers → DetailSheet
- No onboarding/what's new modal — design must be self-evident
- Context preservation: tab switching preserves scroll position, search text, map position
- Back navigation: hardware back dismisses sheet first, then returns to Map, then exits app

### FR Coverage Map

FR1: Epic 2 — Full-bleed edge-to-edge map
FR2: Epic 3 — Live pilot markers updated every 20s
FR3: Epic 3 — ATC polygon overlays (FIR/TRACON)
FR4: Epic 3 — Airport markers with ATC indicators
FR5: Epic 2 — Map interaction without chrome obstruction
FR6: Epic 4 — Tap pilot → translucent bottom sheet
FR7: Epic 4 — Tap controller → translucent bottom sheet
FR8: Epic 4 — Tap airport → translucent bottom sheet
FR9: Epic 4 — Level 1 glanceable summary
FR10: Epic 4 — Level 2 expanded detail
FR11: Epic 4 — Level 3 full detail
FR12: Epic 2 — Floating navigation island
FR13: Epic 2 — Access to all screens from navigation
FR14: Epic 2 — Return to map from any screen
FR15: Epic 2 — Pilot filter chip
FR16: Epic 2 — ATC filter chip
FR17: Epic 5 — Search pilots/controllers by callsign
FR18: Epic 5 — Search airports by ICAO/IATA
FR19: Epic 5 — Filterable pilot/ATC list
FR20: Epic 5 — Tap list item → client details
FR21: Epic 5 — Airport search and selection
FR22: Epic 5 — Airport ATC positions
FR23: Epic 5 — Airport arriving/departing traffic
FR24: Epic 6 — Upcoming events list
FR25: Epic 6 — Event full details
FR26: Epic 6 — ATC bookings list
FR27: Epic 6 — Booking details
FR28: Epic 5 — METAR weather data
FR29: Epic 1 — Light/dark theme switching
FR30: Epic 1 — System theme auto-detection
FR31: Epic 1 — Manual theme override
FR32: Epic 1 — Theme-aware map styling
FR33: Epic 1 — Translucent frosted-glass appearance
FR34: Epic 7 — Portrait orientation support
FR35: Epic 7 — Landscape orientation support
FR36: Epic 7 — Adaptive layout (sheet ↔ side panel)
FR37: Epic 7 — Responsive floating element repositioning
FR38: Epic 6 — Settings screen for theme preference
FR39: Epic 3 — Live data refreshed every 20s
FR40: Epic 6 — Events/bookings loaded on launch
FR41: Epic 6 — Network connectivity status
FR42: Epic 3 — Persisted state on cold start
FR43: Epic 3 — Feature parity (all existing features)
FR44: Epic 3 — Ground aircraft hidden at non-local zoom, fade in at local zoom

## Epic List

### Epic 1: Foundation — Theme System & Design Tokens
Users see a cohesive, theme-aware app with light/dark mode support. The app's visual foundation (NativeWind, tokens, blur/translucency, typography) is in place. All subsequent UI work builds on this.
**FRs covered:** FR29, FR30, FR31, FR32, FR33

### Epic 2: Immersive Map & Floating Navigation
Users experience the full-bleed edge-to-edge map as the primary app surface. Navigation via a floating translucent island replaces the tab bar. Filter chips float over the map. The core "map is the app" experience is delivered.
**FRs covered:** FR1, FR5, FR12, FR13, FR14, FR15, FR16

### Epic 3: Map Data Layers — Pilots, ATC & Airports
Users see live pilots as SVG-based aircraft markers, ATC coverage as polygon overlays, and airports with zoom-aware ATC badges and traffic indicators — all updated every 20 seconds on the immersive map.
**FRs covered:** FR2, FR3, FR4, FR39, FR42, FR43, FR44

### Epic 3 contains 6 stories (3.1-3.6) after adding ground aircraft zoom filtering.
### Epic 4 contains 5 stories (4.1-4.4 + 4.2.1) after single-card refactor.

### Epic 4: Progressive Disclosure Detail Panels
Users tap any map element (pilot, controller, airport) and get a translucent bottom sheet with a single complete detail card — the sheet snap points (peek/half/full) control how much of the card is physically visible. All rendered over the visible map.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR11a

### Epic 5: List, Airport & Search Views
Users browse filterable lists of pilots/controllers, search and view airport details (ATC, traffic, METAR), and search by callsign or ICAO code — all restyled in the new design language.
**FRs covered:** FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR28

### Epic 6: Events, Bookings & Secondary Screens
Users discover VATSIM events, view event details, browse ATC bookings, check network status, and access Settings/About — completing full feature parity with the current app.
**FRs covered:** FR24, FR25, FR26, FR27, FR38, FR40, FR41

### Epic 7: Landscape Orientation & Responsive Layout
Users can rotate to landscape and get an adaptive companion-display layout — side panel replaces bottom sheet, floating elements reposition, and the app works beautifully on tablets propped next to a flight sim.
**FRs covered:** FR34, FR35, FR36, FR37

## Epic 1: Foundation — Theme System & Design Tokens

Users see a cohesive, theme-aware app with light/dark mode support. The app's visual foundation (NativeWind, tokens, blur/translucency, typography) is in place. All subsequent UI work builds on this.

### Story 1.1: NativeWind Infrastructure & Design Token System

As a developer,
I want the NativeWind/Tailwind infrastructure installed and configured with the complete design token system,
So that all subsequent component migration has a consistent styling foundation.

**Acceptance Criteria:**

**Given** the existing Expo/React Native project
**When** NativeWind v4.2.2 and Tailwind CSS are installed and configured
**Then** `tailwind.config.js` exists with the complete token system (colors, opacity, blur, animation, spacing, borderRadius, fontFamily including JetBrains Mono)
**And** `babel.config.js` includes the NativeWind Babel plugin
**And** `metro.config.js` wraps the existing config with `withNativeWind()`
**And** `global.css` contains Tailwind directives (`@tailwind base/components/utilities`)
**And** JetBrains Mono font is bundled and registered in the app
**And** a test component using NativeWind classes (including `dark:` variant) renders correctly on both iOS and Android
**And** NativeWind classes coexist with existing `StyleSheet.create()` without visual conflicts
**And** NativeWind compatibility with `react-native-maps` is validated: a test View with NativeWind classes overlaying a MapView renders without conflicts (positioning, z-index, overflow). If incompatible, document that map overlays will use StyleSheet for positioning while NativeWind handles visual styling
**And** NativeWind compatibility with `@gorhom/bottom-sheet` is validated: NativeWind classes apply correctly to content rendered inside BottomSheetView (known limitation: className doesn't apply to BottomSheetView directly — content must be wrapped in a regular View). If further issues found, document workarounds

### Story 1.2: Theme Provider & Dual Map Styling

As a user,
I want the app to detect my system theme preference and style the map accordingly,
So that VatView matches my device's light/dark setting from the moment I open it.

**Acceptance Criteria:**

**Given** the NativeWind infrastructure from Story 1.1 is in place
**When** `ThemeProvider.jsx` is created and wrapped around the app in `App.js`
**Then** `ThemeContext` provides `isDark`, `activeMapStyle`, `toggleTheme()`, and `themePreference` ('system' | 'light' | 'dark')
**And** `theme.js` exports `lightTheme`, `darkTheme`, `lightMapStyle` (custom JSON), and `darkMapStyle` (custom JSON — deep navy/charcoal base, subtle road lines, muted labels)
**And** `useColorScheme()` detects the system preference and applies the correct theme automatically
**And** manual override is persisted to AsyncStorage and restored on cold start
**And** `MapComponent.jsx` reads `activeMapStyle` from ThemeContext and applies it as `customMapStyle`
**And** theme changes apply instantly with no app restart (NFR6)
**And** the dark map style visually complements the dark UI tokens and vice versa for light (NFR17)

### Story 1.3: BlurWrapper & TranslucentSurface Components

As a user,
I want UI elements to have a translucent frosted-glass appearance over the map,
So that I can see the map beneath floating UI elements, creating the immersive HUD experience.

**Acceptance Criteria:**

**Given** the theme system from Story 1.2 is in place
**When** `BlurWrapper.jsx` is created in `app/common/`
**Then** on iOS, it renders `BlurView` from `expo-blur` with native backdrop blur
**And** on Android, it renders a semi-transparent solid background with 1px border (`surface.border` token) and elevation shadow — no blur attempted
**And** `BlurWrapper` accepts `intensity` (default 20, iOS only) and `opacity` prop with three presets: 'surface' (0.45), 'surface-dense' (0.65), 'overlay' (0.85)
**And** `TranslucentSurface.jsx` wraps `BlurWrapper` with NativeWind classes for border radius, padding, and theme-aware colors
**And** both components render correctly in light and dark themes
**And** translucent elements maintain consistent opacity (~0.45 default) across both themes (NFR15)
**And** no component imports `expo-blur` directly — only through `BlurWrapper`

### Story 1.4: ThemedText & Shared Typography Components

As a user,
I want callsigns, frequencies, and ICAO codes displayed in a distinct monospace font while UI text uses the system font,
So that aviation data is instantly recognizable and legible.

**Acceptance Criteria:**

**Given** NativeWind tokens and JetBrains Mono from Story 1.1 are available
**When** `ThemedText.jsx` is created in `app/components/shared/`
**Then** it supports 9 variants: heading-lg (22px), heading (18px), body (15px), body-sm (13px), caption (11px), callsign (15px mono), frequency (14px mono), data (13px mono), data-sm (11px mono)
**And** mono variants render in JetBrains Mono; all other variants use the system font
**And** all variants are theme-aware (correct text color per light/dark theme from tokens)
**And** no variant uses bold weight for mono text (medium weight maximum)
**And** all text/background combinations meet WCAG AA contrast ratios (4.5:1 body, 3:1 large)
**And** `ThemedText` includes an `accessibilityRole` of "text" by default

### Story 1.5: ListItem Base Component & StaleIndicator

As a user,
I want list-based views to have consistent, spacious item styling and a subtle data freshness indicator,
So that all lists feel cohesive and I always know if the data is current.

**Acceptance Criteria:**

**Given** TranslucentSurface and ThemedText from Stories 1.3-1.4 are available
**When** `ListItem.jsx` is created in `app/components/shared/`
**Then** it renders with 64px minimum height, three slots (left icon 42x42px, body with title + subtitle, trailing meta/chevron), and a bottom separator
**And** it includes tap highlight feedback with `duration.fast` (150ms) timing
**And** touch target meets 44x44px minimum
**And** it renders correctly in both themes with token-based colors
**When** `StaleIndicator.jsx` is created in `app/components/shared/`
**Then** it shows a green dot for live data, amber dot with slow pulse for stale data, and red dot with pulse for error
**And** pulse animations respect reduced motion (skip to final state when system "Reduce Motion" is enabled)
**And** StaleIndicator has `accessibilityLabel` announcing data state (e.g., "Data status: live")

## Epic 2: Immersive Map & Floating Navigation

Users experience the full-bleed edge-to-edge map as the primary app surface. Navigation via a floating translucent island replaces the tab bar. Filter chips float over the map. The core "map is the app" experience is delivered.

### Story 2.1: Full-Bleed Map & Remove Chrome

As a user,
I want the map to extend edge-to-edge with no opaque chrome bars,
So that I get maximum map visibility and the immersive "map is the app" experience.

**Acceptance Criteria:**

**Given** the theme system and shared components from Epic 1 are in place
**When** `VatsimMapView.jsx` is updated to render the map full-bleed
**Then** the map extends to all screen edges (under status bar and navigation area)
**And** the existing Paper `Appbar` and opaque header chrome are removed from `MainApp.jsx`
**And** map interactions (pan, zoom, tap) work without obstruction across the full screen area
**And** the `PaperProvider` wrapper is removed from `App.js` (NativeWind replaces it)
**And** the existing map functionality (markers, polygons, camera position) is preserved unchanged
**And** Android hardware back button on the root map screen exits the app (default Android behavior preserved after chrome removal)
**And** hardware back from non-map tabs returns to the Map tab

### Story 2.2: Floating Navigation Island

As a user,
I want a floating translucent pill at the bottom of the map showing Map, List, Airports, and Events tabs,
So that I can navigate between views without a chrome-heavy tab bar eating map space.

**Acceptance Criteria:**

**Given** the full-bleed map from Story 2.1 is in place
**When** `FloatingNavIsland.jsx` is created in `app/components/navigation/`
**Then** it renders as a translucent pill (using TranslucentSurface) with four tab icons: Map, List, Airports, Events
**And** the active tab has an accent-colored indicator (`accent.primary` token)
**And** `MainTabNavigator.jsx` wires `FloatingNavIsland` as the Tab Navigator's custom `tabBar` with overlay styling (no built-in tab bar UI)
**And** tapping a tab calls `navigation.navigate(tabName)` via the `tabBar` props — React Navigation manages screen state
**And** tab switches use cross-fade transition animation (`duration.normal`, 250ms)
**And** a settings icon is included for direct access to Settings screen (Settings may be provided as a tab in this implementation)
**And** the NavIsland is positioned using `useSafeAreaInsets()` to avoid system UI overlap
**And** each tab has `accessibilityRole="tab"` and `accessibilityLabel` (e.g., "Map, tab, 1 of 5")
**And** all touch targets meet 44x44px minimum

### Story 2.3: Floating Filter Chips

As a user,
I want floating translucent toggle chips on the map to show/hide pilots and ATC,
So that I can control map layer visibility without leaving the map view.

**Acceptance Criteria:**

**Given** the FloatingNavIsland from Story 2.2 is in place
**When** `FloatingFilterChips.jsx` is created in `app/components/filterBar/`
**Then** it renders two translucent filter chips: "Pilots" (default on) and "ATC" (default on)
**And** chips use TranslucentSurface for the frosted-glass appearance
**And** tapping a chip toggles its state and fades the corresponding map layer with `duration.fast` (150ms)
**And** active chips show accent border; inactive chips show muted appearance
**And** chips are positioned at top-left of the map with `space-4` (16px) margin from edges
**And** each chip has `accessibilityRole="button"` and `accessibilityLabel` (e.g., "Pilots filter, toggle button, on")
**And** the existing `FilterBar.jsx` filter toggles for the map are replaced by these floating chips (search functionality remains in List view)

### Story 2.4: MapOverlayGroup — Floating Element Orchestrator

As a user,
I want all floating elements (nav island, filter chips, stale indicator) to be positioned correctly and not overlap each other,
So that the map HUD feels polished and intentional regardless of screen state.

**Acceptance Criteria:**

**Given** FloatingNavIsland, FloatingFilterChips, and StaleIndicator from previous stories exist
**When** `MapOverlayGroup.jsx` is created in `app/components/mapOverlay/`
**Then** it wraps all floating elements on the map view and manages their z-ordering and spatial relationships
**And** StaleIndicator is positioned at top-right
**And** filter chips are at top-left
**And** NavIsland is at bottom-center
**And** all floating elements maintain `space-4` (16px) minimum margin from screen edges and from each other
**And** `VatsimMapView.jsx` uses `MapOverlayGroup` to render all floating elements (no independent positioning)
**And** map gestures (pan, zoom, tap on markers) work correctly through/around the floating elements
**And** the focus order for screen readers follows: NavIsland → filter chips → StaleIndicator → map content

## Epic 3: Map Data Layers — Pilots, ATC & Airports

Users see live pilots as SVG-based aircraft markers, ATC coverage as polygon overlays, and airports with zoom-aware ATC badges and traffic indicators — all updated every 20 seconds on the immersive map.

### Story 3.1: AircraftIconService — SVG-to-Bitmap Pipeline

As a user,
I want aircraft markers to be resolution-independent SVG silhouettes that match the active theme,
So that pilot markers look sharp on any device and visually belong to the current theme.

**Acceptance Criteria:**

**Precondition:** FSTrAk SVG assets (15 files) must be added to `assets/svg/` before this story can begin. This is an external dependency on Oren providing the assets from the FSTrAk project.

**Given** the theme system from Epic 1 is in place and FSTrAk SVG assets (15 files) are present in `assets/svg/`
**When** `aircraftIconService.js` is created in `app/common/`
**Then** `init(theme)` pre-renders each (aircraftType × sizeVariant × themeColor) combination into cached `ImageSource` objects
**And** `getMarkerImage(aircraftType, sizeVariant)` returns a cached `ImageSource` synchronously
**And** the aircraft type → icon mapping follows the FSTrAk `AircraftResolver` candidate lists (B737, A320, C172, B747, B767, B777, B787, A340, A330, A380, ERJ, DC3, Helicopter, Conc) with `code.includes(candidate)` matching
**And** fallback defaults to B737 at scale 0.75 when no type code matches
**And** cache regenerates on theme change (accent color differs between light/dark)
**And** the existing `iconsHelper.js` API surface (`getAircraftIcon`) is preserved as a wrapper that delegates to the new service

### Story 3.2: Pilot Markers with SVG Aircraft Icons

As a user,
I want to see live pilot positions as aircraft-type silhouettes rotated to their heading on the map,
So that I can identify aircraft types and flight directions at a glance.

**Acceptance Criteria:**

**Given** AircraftIconService from Story 3.1 is initialized
**When** `PilotMarkers.jsx` is updated to use `getMarkerImage()` instead of PNG `require()` paths
**Then** pilots render as native `Image` markers using the cached bitmap from AircraftIconService
**And** markers are rotated to show heading direction
**And** markers update every 20 seconds when live data refreshes (FR39)
**And** rendering 1,500+ simultaneous pilots completes without dropped frames (NFR2)
**And** persisted Redux state renders last-known pilot positions on cold start (FR42)
**And** pilot markers are hidden when the Pilots filter chip is toggled off
**And** `ClusteredPilotMarkers.jsx` continues functioning with the new marker images

**Epic 2 Retro — Performance Refactor Note:** `generatePilotMarkers` is currently a hook-calling function, not a component. As part of this story, refactor it into a proper React component with `React.memo` so React can manage its render lifecycle independently of `MapComponent`. This avoids re-running the full pilot marker loop on every 20s poll when inputs haven't changed.

### Story 3.3: ATC Polygon Overlays — FIR & TRACON

As a user,
I want to see staffed FIR boundaries and TRACON polygons on the map with theme-aware colors,
So that I can visually assess ATC coverage at a glance.

**Acceptance Criteria:**

**Given** the theme token system is in place
**When** `CTRPolygons.jsx` is migrated to use design tokens for polygon colors
**Then** FIR boundaries use `atc.fir` token color for stroke
**And** TRACON polygons use `atc.tracon` token color for fill
**And** staffed ATC polygons use `atc.staffed` token color
**And** polygon colors adapt correctly when theme switches between light and dark
**And** polygons are hidden when the ATC filter chip is toggled off
**And** all existing polygon functionality (FIR boundaries, TRACON circles/polygons, fallback circles) continues identically (FR43)
**And** polygon styles use `StyleSheet.create()` (not NativeWind) as required for `react-native-maps` Polygon components

**Epic 2 Retro — Performance Refactor Note:** `generateCtrPolygons` is currently a hook-calling function, not a component. As part of this story, refactor it into a proper React component with `React.memo`. Also memoize `getMarkers` in `MapComponent.jsx` with `useMemo` and replace the broad `vatsimLiveData` selector with targeted selectors (`clients`, `cachedAirports`, `cachedFirBoundaries`).

### Story 3.4: Zoom-Aware Airport Markers — Infrastructure & Image Markers

As a user,
I want airport markers that adapt to zoom level — showing only staffed airports at wide zoom and adding unstaffed airports as I zoom in,
So that the map stays clean at continental view but reveals more airports as I focus on a region.

**Acceptance Criteria:**

**Given** the theme tokens are available
**When** `MapComponent.jsx` is updated to provide current zoom level via `onRegionChangeComplete` callback
**And** `AirportMarkers.jsx` is redesigned to receive zoom level and render conditionally
**Then** at Global zoom (≤4): only staffed airports show as small dot + ICAO, no traffic counts, using native Image markers for performance
**And** at Continental zoom (5-6) and above: staffed airports show as View-based markers with dot + ICAO + ATC badges + traffic counts; unstaffed airports with active traffic show grey dot + ICAO + ▲/▼ counts (no badges). Unstaffed airports with no traffic do not render.
**And** airport markers are hidden when the ATC filter chip is toggled off
**And** airport dot color is blue when any ATC is staffed, grey when unstaffed with traffic
**And** touch targets meet 44x44px minimum (expanded hit area beyond visual bounds)
**And** rendering hundreds of airports at continental/regional zoom maintains 60fps panning

**Epic 2 Retro — Performance Refactor Note:** `generateAirportMarkers` is currently a hook-calling function, not a component. As part of this story, refactor it into a proper React component with `React.memo` so React can independently manage its render lifecycle and bail out when inputs haven't changed.

### Story 3.5: Airport Markers — Local Zoom ATC Badges & Traffic Counts

As a user,
I want to see ATC letter badges and traffic counts on airport markers when zoomed in to a region,
So that I can assess airport staffing and activity at a glance without tapping.

**Acceptance Criteria:**

**Given** zoom-aware airport marker infrastructure from Story 3.4 is in place
**When** the map is at Continental zoom (5+) or above
**Then** airport markers render as View-based markers with two-row layout: Row 1 = dot + ICAO (monospace) + traffic counts, Row 2 = ATC letter badges as colored pills with white text
**And** ATC letter badges render below the ICAO code: C (grey/Clearance), G (green/Ground), T (amber/Tower), A (blue/Approach), A (cyan/ATIS)
**And** badge colors are pill backgrounds (not text color) — white letter on colored pill, matching VATSIM Radar style
**And** only staffed positions show badges — unstaffed airports show ICAO + traffic only (no badge row)
**And** traffic count indicators show: green ▲ with departure count, red ▼ with arrival count
**And** ICAO code renders in monospace (JetBrains Mono Medium)
**And** badge colors use theme tokens and adapt to light/dark theme
**And** the switch between Image (Global) and View markers (Continental+) is seamless as user zooms across the threshold
**And** dot anchor is computed dynamically via onLayout to sit precisely on the airport coordinate

### Story 3.6: Ground Aircraft Zoom-Dependent Visibility

As a user,
I want ground aircraft to only appear when I'm zoomed in to airport level,
So that the map is not cluttered with parked aircraft and I can focus on en-route traffic.

**Acceptance Criteria:**

**Given** PilotMarkers from Story 3.2 renders pilot markers on the map
**When** a pilot's groundspeed is 5 knots or below
**And** the map is at any zoom level below Airport (≤10)
**Then** that pilot's marker is not rendered on the map
**And** at Airport zoom (>10), ground aircraft markers appear
**And** this filtering applies to the map view only — the list view shows all pilots regardless of zoom level
**And** ground aircraft that begin moving (groundspeed exceeds 5 knots) immediately appear at full opacity regardless of zoom level
**And** the groundspeed threshold and zoom breakpoints are defined as constants for easy tuning

## Epic 4: Progressive Disclosure Detail Panels

Users tap any map element (pilot, controller, airport) and get a translucent bottom sheet with a single complete detail card — the sheet snap points (peek/half/full) control how much of the card is physically visible. All rendered over the visible map.

### Story 4.1: DetailPanelProvider — Bottom Sheet Abstraction

As a user,
I want a translucent bottom sheet that opens when I tap any map element,
So that I can see details overlaid on the map without losing spatial context.

**Acceptance Criteria:**

**Given** TranslucentSurface and the theme system from Epic 1 are in place
**When** `DetailPanelProvider.jsx` is created in `app/components/detailPanel/`
**Then** it wraps the map screen and provides context API: `isOpen`, `open(client)`, `close()`, `selectedClient`
**And** it renders `@gorhom/bottom-sheet` with three snap points: peek (~155px, opacity 0.45), half (~50%, opacity 0.65), full (~90%, opacity 0.85)
**And** the sheet uses TranslucentSurface/BlurWrapper for frosted-glass appearance (StyleSheet for container, NativeWind for content)
**And** sheet open/close uses spring physics animation (`damping: 20, stiffness: 300`)
**And** animations render at 60fps (NFR3) and respect reduced motion setting
**And** swiping down past peek dismisses the sheet; tapping the map above the sheet dismisses it
**And** tapping a different map element updates sheet content at the current snap point (no close-then-reopen)
**And** Redux integration: `clientSelected` action dispatch → provider opens sheet
**And** the sheet has `accessibilityRole="adjustable"` and announces state changes
**And** `MapOverlayGroup` is notified of sheet state changes to coordinate floating element positions (DetailPanelProvider owns the `sheetState` and passes it up to MapOverlayGroup via callback prop)
**And** hardware back button dismisses the sheet if open (before navigating back). Back priority: dismiss sheet → return to Map tab → exit app

### Story 4.2: Pilot Detail — Three-Level Progressive Disclosure *(implemented)*

As a user,
I want to tap a pilot marker and see their details progressively — callsign and route at a glance, then flight data, then full flight plan,
So that I can get exactly the depth of information I need without navigating away from the map.

**Acceptance Criteria:**

**Given** DetailPanelProvider from Story 4.1 is in place
**When** a user taps a pilot marker on the map
**Then** the sheet opens to peek with `PilotLevel1Summary`: callsign (mono/callsign variant), aircraft type, departure → arrival, altitude, groundspeed
**And** swiping to half shows `PilotLevel2Details` ADDED below Level 1: route summary string, heading, distance remaining, time enroute
**And** swiping to full shows `PilotLevel3Full` ADDED below Level 1+2: full flight plan text, transponder code, server info, remarks, time online, pilot rating
**And** content is additive — Level 1 is always visible at all disclosure levels
**And** all aviation data (callsign, frequencies, ICAO codes, flight plan) renders in JetBrains Mono via ThemedText
**And** `PilotDetails.jsx` uses `useDetailPanel()` to read `disclosureLevel` and conditionally render Level sub-components
**And** `ClientDetails.jsx` routes to `PilotDetails` when the selected client is a pilot

*Note: Story 4.2.1 refactors this implementation to the single-card model.*

### Story 4.2.1: Refactor Pilot Detail from Three-Level Components to Single Card

As a developer,
I want to consolidate PilotLevel1Summary, PilotLevel2Details, and PilotLevel3Full into a single PilotDetailCard component,
So that the progressive disclosure is driven purely by sheet snap points rather than conditional content rendering.

**Acceptance Criteria:**

**Given** PilotLevel1Summary, PilotLevel2Details, and PilotLevel3Full exist from the original 4.2 implementation
**When** the refactor is complete
**Then** a single `PilotDetailCard.jsx` component exists in `app/components/clientDetails/` containing all pilot detail content ordered by information priority (glanceable summary at top, full flight plan at bottom)
**And** `PilotLevel1Summary.jsx`, `PilotLevel2Details.jsx`, and `PilotLevel3Full.jsx` are removed
**And** `PilotDetails.jsx` no longer reads `disclosureLevel` from `useDetailPanel()` — it renders `PilotDetailCard` unconditionally
**And** the card scrolls within the sheet when content exceeds the visible area at any snap point
**And** at peek (~155px), the visible portion shows: callsign, aircraft type, departure → arrival, altitude, groundspeed
**And** at half (~50%), the visible portion additionally shows: route summary string, heading, distance remaining, time enroute
**And** at full (~90%), the complete card is visible: full flight plan text, transponder code, server info, remarks, time online, pilot rating
**And** the visual result is identical to the previous three-level implementation — same content, same order, same styling
**And** DetailPanelProvider's `disclosureLevel` context field may be removed or retained for MapOverlayGroup coordination — but it is no longer consumed by detail content components
**And** all existing ThemedText variants and JetBrains Mono usage carry over unchanged
**And** manual testing confirms peek/half/full snap points show the expected content portions on both iOS and Android

### Story 4.3: ATC & CTR Detail — Single Complete Cards

As a user,
I want to tap an ATC polygon or controller element and see their details progressively,
So that I can quickly check frequencies and coverage without leaving the map.

**Acceptance Criteria:**

**Given** DetailPanelProvider from Story 4.1 and the single-card pattern validated in Story 4.2.1 are in place
**When** a user taps a TRACON polygon or APP/DEP controller element
**Then** the sheet opens to peek showing the top of `AtcDetailCard`: callsign (mono), frequency, facility type (TWR/APP/DEP), ATIS indicator
**And** swiping to half reveals more of the card: controller rating, logon time, ATIS summary
**And** swiping to full reveals the complete card: full ATIS text, remarks, sector coverage detail
**When** a user taps a FIR/CTR polygon
**Then** the sheet opens to peek showing the top of `CtrDetailCard`: CTR callsign, frequency, facility type
**And** swiping to half reveals more: controller rating, logon time, ATIS summary, list of all controllers in FIR
**And** swiping to full reveals the complete card: full ATIS text, coverage area detail, ATC bookings for position
**And** both `AtcDetailCard` and `CtrDetailCard` are single components rendering all content ordered by priority — no conditional rendering based on disclosure level
**And** if multiple controllers share a FIR, the card top shows the primary (highest facility type); scrolling reveals all
**And** overlapping polygons: tap targets the smallest (most specific) — TRACON takes priority over FIR
**And** `ClientDetails.jsx` routes to `AtcDetails` or `CtrDetails` based on selected client type

### Story 4.4: Airport Detail — Single Complete Card

As a user,
I want to tap an airport marker and see its staffing, traffic, and details progressively,
So that I can assess airport activity from the map without switching views.

**Acceptance Criteria:**

**Given** DetailPanelProvider from Story 4.1 and the single-card pattern validated in Story 4.2.1 are in place
**When** a user taps an airport marker on the map
**Then** the sheet opens to peek showing the top of `AirportDetailCard`: airport name + ICAO (mono), number of staffed positions, ATC letter badge row, traffic counts (▲ departures / ▼ arrivals)
**And** swiping to half reveals more of the card: list of all staffed positions with individual frequencies, departure/arrival counts
**And** swiping to full reveals the complete card: individual controller details per position, METAR link, ATC bookings for this airport, full traffic board
**And** `AirportDetailCard` is a single component rendering all content ordered by priority — no conditional rendering based on disclosure level
**And** `ClientDetails.jsx` routes to `AirportAtcDetails` when the selected client is an airport
**And** unstaffed airports show ICAO and "No ATC online" in muted text at the card top

## Epic 5: List, Airport & Search Views

Users browse filterable lists of pilots/controllers, search and view airport details (ATC, traffic, METAR), and search by callsign or ICAO code — all restyled in the new design language.

### Story 5.1: Pilot & Controller List View

As a user,
I want to browse a filterable list of all online pilots and controllers styled in the new design language,
So that I can find specific clients by callsign and tap to view their details.

**Acceptance Criteria:**

**Given** ThemedText, ListItem, and the theme system from Epic 1 are in place
**When** `VatsimListView.jsx` is migrated from react-native-paper to NativeWind
**Then** it renders a scrollable list of pilots and controllers using the `ListItem` base component
**And** a search field at the top with translucent background (matching `surface.elevated`) filters by callsign as the user types (300ms debounce)
**And** the search field uses monospace placeholder text ("Search callsign...")
**And** "No matches for [query]" shows in muted text when search returns no results
**And** tapping a list item dispatches `clientSelected` and navigates to the map with the detail sheet open (FR20)
**And** search text is preserved when switching tabs and returning
**And** keyboard dismisses on scroll, on result tap, or on Done/Return key
**And** all react-native-paper imports are removed from this component
**And** the component renders correctly in both light and dark themes

### Story 5.2: Airport Search & Details View

As a user,
I want to search for airports by ICAO or IATA code and view their details including staffed ATC, traffic, and METAR,
So that I can check any airport's status without finding it on the map.

**Acceptance Criteria:**

**Given** ThemedText, ListItem, and the theme system are in place
**When** `AirportDetailsView.jsx`, `AirportSearchList.jsx`, and `AirportListItem.jsx` are migrated to NativeWind
**Then** the airport search field filters as the user types (300ms debounce) by ICAO, IATA, or airport name (FR18, FR21)
**And** `AirportListItem` shows ICAO in monospace, airport name, and ATC badge preview using the `ListItem` base
**And** selecting an airport shows: staffed ATC positions with frequencies (FR22), arriving/departing traffic counts (FR23), and inline METAR data (FR28)
**And** if an airport has no ATC, the ATC section shows "No ATC online" in muted text
**And** if METAR is unavailable, it shows "METAR unavailable for [ICAO]" in muted text (no error modal)
**And** all react-native-paper imports are removed from these components
**And** components render correctly in both themes

### Story 5.3: METAR Weather View

As a user,
I want to view decoded METAR weather data for any airport,
So that I can check weather conditions for planning.

**Acceptance Criteria:**

**Given** the theme system is in place
**When** `MetarView.jsx` is migrated to NativeWind
**Then** METAR text renders in JetBrains Mono (data variant) on a translucent surface
**And** loading state shows inline "Loading..." in muted text where data will appear (no spinner)
**And** if METAR fetch fails, shows "METAR unavailable for [ICAO]" without modal error
**And** all react-native-paper imports are removed
**And** the component renders correctly in both themes

## Epic 6: Events, Bookings & Secondary Screens

Users discover VATSIM events, view event details, browse ATC bookings, check network status, and access Settings/About — completing full feature parity with the current app.

### Story 6.1: Events List & Event Details

As a user,
I want to browse upcoming VATSIM events and view their full details,
So that I can discover events and plan my participation.

**Acceptance Criteria:**

**Given** ThemedText, ListItem, and the theme system are in place
**When** `VatsimEventsView.jsx` and `EventListItem.jsx` are migrated to NativeWind
**Then** the events list renders using `EventCard` components composed on the `ListItem` base, showing event name, date, and banner image
**And** a search/filter field is present at the top of the events view (slot present Phase 1, filtering by name)
**And** events load on app launch (FR40)
**And** if events API returns empty, shows "No upcoming events" centered in muted text
**And** skeleton placeholders (shimmer on `ListItem` shapes) show during load (< 2 seconds)
**When** `EventDetailsView.jsx` is migrated to NativeWind
**Then** tapping an event shows full event details on a translucent surface (FR25)
**And** navigation uses standard React Navigation stack push (slide from right, `duration.normal`)
**And** all react-native-paper imports are removed from these components

### Story 6.2: ATC Bookings List & Details

As a user,
I want to browse ATC bookings and view booking details,
So that I can see what ATC coverage is planned for my flight time.

**Acceptance Criteria:**

**Given** ThemedText, ListItem, and the theme system are in place
**When** `BookingsView.jsx` and `BookingDeatils.jsx` are migrated to NativeWind
**Then** the bookings list renders using the `ListItem` base component with translucent cards
**And** bookings load on app launch (FR40)
**And** if no bookings exist, shows "No ATC bookings scheduled" centered in muted text
**And** tapping a booking shows its full details (FR27)
**And** all react-native-paper imports are removed from these components
**And** components render correctly in both themes

### Story 6.3: Settings with Theme Picker

As a user,
I want a Settings screen where I can choose between System, Dark, and Light themes,
So that I can override the automatic theme detection to suit my preference.

**Acceptance Criteria:**

**Given** ThemeProvider from Epic 1 is in place
**When** `Settings.jsx` is migrated to NativeWind and `ThemePicker.jsx` is created in `app/components/shared/`
**Then** Settings shows a theme section with three options: System (auto), Dark (always dark), Light (always light) (FR38)
**And** the current selection is visually highlighted
**And** selecting an option calls `toggleTheme()` from ThemeContext and the change applies instantly (FR29, FR31, NFR6)
**And** the preference persists to AsyncStorage and restores on cold start (FR30)
**And** the ThemePicker architecture accommodates future Phase 2 aviation themes (additional options can be added without restructuring)
**And** all react-native-paper imports are removed from Settings

### Story 6.4: Network Status, About & LoadingView

As a user,
I want to check network connectivity status, view app information, and see a proper loading screen on first install,
So that I have complete access to all app screens in the new design.

**Acceptance Criteria:**

**Given** the theme system and shared components are in place
**When** `networkStatus.jsx` is migrated to NativeWind
**Then** it displays network connectivity status using theme tokens and ThemedText (FR41)
**And** stale/live state aligns with StaleIndicator behavior
**When** `About.jsx` is migrated to NativeWind
**Then** it renders with theme-aware tokens and translucent surfaces
**When** `LoadingView.jsx` is migrated to NativeWind
**Then** it shows a themed loading screen with progress indicator during first-install SQLite population
**And** all react-native-paper imports are removed from these three components
**And** all components render correctly in both themes

### Story 6.5: Remove react-native-paper Dependency

As a developer,
I want react-native-paper fully removed from the project,
So that the codebase has a single styling system and no unused dependencies.

**Acceptance Criteria:**

**Given** all 28 components have been migrated to NativeWind in Epics 1-6
**When** react-native-paper is uninstalled
**Then** `npm uninstall react-native-paper` completes without errors
**And** no imports from `react-native-paper` remain in any source file
**And** `PaperProvider` is fully removed from the component tree
**And** the app builds and runs correctly on both iOS and Android
**And** `npm run lint` passes with no errors
**And** all existing features continue to function identically (FR43)
**And** manual smoke test of all features on both platforms (iOS + Android) confirms zero functional regression: map markers, polygon overlays, bottom sheet details, list view, airport search, events, bookings, METAR, settings, about, network status

## Epic 7: Landscape Orientation & Responsive Layout

Users can rotate to landscape and get an adaptive companion-display layout — side panel replaces bottom sheet, floating elements reposition, and the app works beautifully on tablets propped next to a flight sim.

### Story 7.1: Unlock Orientation & Responsive Detection

As a user,
I want the app to support landscape orientation on both phone and tablet,
So that I can use VatView as a companion display propped next to my flight simulator.

**Acceptance Criteria:**

**Given** the full-bleed map and floating HUD from Epics 1-2 are in place
**When** `app.json` `"orientation"` is changed from `"portrait"` to `"default"`
**And** `expo-screen-orientation` is installed and configured
**Then** the app renders in both portrait and landscape on phone and tablet (FR34, FR35)
**And** `useWindowDimensions()` detects orientation changes
**And** orientation change does not cause crashes, lost state, or visual glitches on either platform
**And** the map camera position, selected client, and scroll positions are preserved across orientation changes

### Story 7.2: SidePanel — Landscape Detail Container

As a user,
I want the detail panel to appear as a side panel on the right in landscape mode instead of a bottom sheet,
So that I get maximum map width for the companion display experience.

**Acceptance Criteria:**

**Given** orientation detection from Story 7.1 and DetailPanelProvider from Epic 4 are in place
**When** the device is in landscape orientation
**Then** `DetailPanelProvider` renders a `SidePanel` (fixed width: 360px phone, 400px tablet) instead of the bottom sheet
**And** the SidePanel is anchored to the right side of the screen with scrollable content (no snap points)
**And** the same single detail card components (PilotDetailCard, AtcDetailCard, CtrDetailCard, AirportDetailCard) render in the SidePanel with scrollable content — no modification needed
**And** the map camera adjusts to account for side panel occlusion (offset center point)
**And** switching between portrait and landscape transitions layout with `duration.slow` (400ms) morph animation (FR36)
**And** the animation respects reduced motion setting

### Story 7.3: Responsive MapOverlayGroup & Floating Elements

As a user,
I want floating elements (nav island, filter chips, stale indicator) to reposition correctly in landscape,
So that the HUD layout adapts naturally to the wider screen.

**Acceptance Criteria:**

**Given** SidePanel from Story 7.2 and MapOverlayGroup from Epic 2 are in place
**When** the device is in landscape orientation
**Then** NavIsland centers in the remaining map width (not full screen width) (FR37)
**And** filter chips position relative to the remaining map area (top-left of map, not top-left of screen)
**And** StaleIndicator positions relative to the remaining map area
**And** all floating elements maintain proper spacing from each other and from screen/panel edges
**And** non-map views (List, Events, Airports) use full width in landscape (no side panel for these views)
**And** orientation transition completes within 300ms with no visual glitches (NFR5)
**And** all floating elements remain accessible to screen readers in landscape layout
