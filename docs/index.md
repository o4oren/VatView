# VatView — Documentation Index

> **Primary entry point for AI-assisted development.**
> Read this index before implementing any feature.

---

## Project Overview

- **Type:** Monolith mobile app (iOS + Android)
- **Primary Language:** JavaScript (JSX) — no TypeScript
- **Architecture:** Component-Redux-Thunk (unidirectional data flow)
- **App Version:** 1.9.1

## Quick Reference

- **Framework:** React Native 0.74.5 + Expo SDK 51
- **UI:** react-native-paper v4 (Material Design v2)
- **State:** Redux 4 + redux-thunk (NOT Redux Toolkit)
- **Maps:** react-native-maps 1.14.0 (Google Maps)
- **Database:** expo-sqlite 14
- **Primary color:** `#2a5d99`
- **Data refresh:** VATSIM API polled every 20s
- **Entry point:** `App.js` → `MainApp.jsx` → `MainTabNavigator.jsx`

---

## Generated Documentation

### Core

- [Project Overview](./project-overview.md) — What the app is and does
- [Architecture](./architecture.md) — Full architecture: patterns, navigation, data flow, domain model
- [Technology Stack](./technology-stack.md) — All dependencies with exact versions

### Data & State

- [State Management](./state-management.md) — Redux slices, actions, data flow diagrams
- [Data Models](./data-models.md) — SQLite schema, AsyncStorage, FileSystem, Redux store shape
- [API Contracts](./api-contracts.md) — All external VATSIM APIs consumed

### Code Organization

- [Component Inventory](./component-inventory.md) — All 28 UI components + utilities
- [Source Tree Analysis](./source-tree-analysis.md) — Annotated directory tree with entry points

### Development

- [Development Guide](./development-guide.md) — Setup, run, lint, build (EAS), deploy
- [Asset Inventory](./asset-inventory.md) — Aircraft icons, ATC icons, app store graphics

### AI Agent Rules

- [Project Context](../_bmad-output/project-context.md) — Critical implementation rules for AI agents

---

## Existing Documentation

- [README](../README.md) — Project intro + TODO list
- [CLAUDE.md](../CLAUDE.md) — Claude Code AI agent instructions
- [Privacy Policy](./privacy.md) — App privacy policy

---

## Getting Started

```bash
npm install
npm run android    # or: npm run ios
npm run lint       # check code style
```

For full setup instructions see [Development Guide](./development-guide.md).

---

## Key Files to Know

- `app/common/theme.js` — ALL colors + map style — must use this, never hardcode
- `app/common/consts.js` — `STATIC_DATA_VERSION` + facility codes — bump version on schema change
- `app/common/staticDataAcessLayer.js` — SQLite singleton — only DB access layer (note typo in name)
- `app/redux/actions/index.js` — `allActions` aggregator — import this in components
- `app/components/mainApp/MainApp.jsx` — Data orchestration + navigation root

---

Documentation generated: 2026-03-10 | Scan level: deep

