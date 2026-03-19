---
layout: default
title: Release Notes — VatView
---

# VatView Release Notes

---

## 2.0.0

VatView 2.0 is a complete visual redesign — rebuilt from the ground up with an immersive, full-bleed map experience, a modern floating UI, and landscape orientation support.

### What's New

**Immersive Map Interface**
- The map now fills the entire screen edge-to-edge — no more chrome or navigation bars covering the map
- All UI elements float over the map as translucent pills and panels
- New floating navigation island at the bottom replaces the traditional tab bar
- Smooth cross-fade transitions between tabs
- Light and dark themes with custom map styling for each

**Redesigned Detail Panels**
- Tapping a pilot, controller, or airport opens a translucent bottom sheet with progressive disclosure
- Swipe up to reveal more detail — flight plan, route, weather, ATC info
- Landscape mode shows details in a side panel instead of a bottom sheet

**Aircraft Icons**
- Aircraft markers now use type-specific SVG icons for 50+ aircraft types
- Icons match aircraft category (narrow-body, wide-body, turboprop, GA, helicopter, military)
- Ground aircraft (parked / taxiing slowly) are hidden at wider zoom levels to reduce clutter

**ATC Overlays**
- Real TRACON boundary polygons replace the previous 80km circles for approach controls
- FIR/UIR boundaries rendered as polygons with theme-aware colors
- UIR boundaries show the merged outer boundary across combined sectors
- Airport markers show staffed ATC positions and traffic count badges

**Landscape Orientation**
- The app now works in landscape — rotate your device for a wider map view
- Detail panel slides in from the right in landscape mode
- Navigation island and filter chips reposition correctly for landscape

**List & Search**
- Tap any pilot or controller in the list to jump directly to their location on the map
- Filter chips match the floating map filter style
- Scheduled flights tab shows upcoming bookings and prefiles with date filtering

**Events & Bookings**
- Dedicated Events tab with full event details and route info
- ATC Bookings view shows upcoming staffing schedules

**Settings**
- Theme picker (light/dark)
- Version info including OTA update channel and build details

### Under the Hood
- Migrated from React Native Paper to NativeWind/Tailwind CSS
- Custom design token system for consistent theming across all components
- Improved Android stability — fixed ghost marker duplicates after app resume
- Fixed iOS marker tap race condition on the bottom sheet
- Firebase Crashlytics integrated for crash reporting
