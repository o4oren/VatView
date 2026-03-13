# VatView — Project Overview

## What Is VatView?

VatView is a **cross-platform React Native mobile app** for tracking live [VATSIM](https://www.vatsim.net) (Virtual Air Traffic Simulation Network) activity. It shows real-time pilot positions, ATC coverage, airport information, events, and weather data on an interactive map.

Published on:
- [App Store (iOS)](https://apps.apple.com/us/app/vatview/id1562497035)
- [Google Play (Android)](https://play.google.com/store/apps/details?id=com.gevahim.vatview)

**App version:** 1.9.1 | **Package ID:** `com.gevahim.vatview`

---

## Repository

- **GitHub:** https://github.com/o4oren/VatView
- **Type:** Monolith (single React Native codebase targeting iOS + Android)
- **Language:** JavaScript (JSX) — no TypeScript

---

## Core Features

| Feature | Description |
|---|---|
| Live Map | Pilots displayed as aircraft icons on Google Maps, updating every 20s |
| ATC Polygons | FIR/CTR/UIR airspace coverage areas drawn as polygons |
| Airport Markers | Airports with active ATC highlighted on map |
| Client Details | Tap a pilot/ATC → bottom sheet with full details (flight plan, frequency, ATIS) |
| Pilot/ATC List | Searchable and filterable list of all online clients |
| Airport View | Search airports, view active ATC + arriving/departing traffic |
| Events | Upcoming VATSIM events |
| ATC Bookings | Scheduled ATC bookings |
| METAR | Real-time weather for any airport |
| Network Status | Live data feed connectivity status |

---

## Quick Reference

| Item | Value |
|---|---|
| Framework | React Native 0.74.5 + Expo SDK 51 |
| UI Library | react-native-paper v4 (Material Design) |
| State | Redux 4 + redux-thunk |
| Maps | react-native-maps 1.14.0 (Google Maps) |
| Database | expo-sqlite 14 (airports + FIR boundaries) |
| Build | EAS Build + EAS Submit |
| Primary color | `#2a5d99` (blueGrey theme) |
| Live data | Polls VATSIM API every 20 seconds |
| Static data | Versioned via `STATIC_DATA_VERSION` in `consts.js` |

---

## Architecture Summary

- **Entry:** `App.js` → rehydrates Redux store → renders `MainApp.jsx`
- **Navigation:** Stack navigator wrapping bottom tab navigator (4 tabs)
- **Data:** Redux thunks fetch from VATSIM APIs; SQLite stores static airport + FIR data
- **Theme:** All colors/styles from `app/common/theme.js`

See [architecture.md](./architecture.md) for full details.

---

## Documentation Index

- [Architecture](./architecture.md) — Full architectural overview
- [Technology Stack](./technology-stack.md) — All dependencies with versions
- [State Management](./state-management.md) — Redux store, actions, data flow
- [Data Models](./data-models.md) — SQLite schema, AsyncStorage keys, Redux store shape
- [API Contracts](./api-contracts.md) — External VATSIM APIs consumed
- [Component Inventory](./component-inventory.md) — All UI components + utilities
- [Source Tree Analysis](./source-tree-analysis.md) — Annotated directory structure
- [Development Guide](./development-guide.md) — Setup, build, run, deploy
- [Asset Inventory](./asset-inventory.md) — Icons, images, graphics
- [Project Context](../_bmad-output/project-context.md) — AI agent implementation rules
