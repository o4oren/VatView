# VatView — Source Tree Analysis

## Repository Structure

```
VatView/                                    # Project root
├── App.js                                  # ⭐ Entry point: Redux store, polyfills, PaperProvider
├── index.js                                # Expo entry: registers App component
├── app.json                                # Expo config: bundle IDs, API keys, version (1.9.1)
├── eas.json                                # EAS Build config: development/preview/production profiles
├── package.json                            # Dependencies (React Native 0.74.5, Expo SDK 51)
├── babel.config.js                         # Babel config
├── metro.config.js                         # Metro bundler config
├── .eslintrc.json                          # ESLint rules (4-space, single quotes, no inline styles)
├── CLAUDE.md                               # Claude Code AI agent instructions
│
├── app/                                    # 📦 All application source code
│   ├── common/                             # 🔧 Shared utilities and constants
│   │   ├── theme.js                        # ⭐ ALL colors + map style + react-native-paper theme
│   │   ├── consts.js                       # ⭐ STATIC_DATA_VERSION, facility codes, timeouts
│   │   ├── staticDataAcessLayer.js         # ⭐ SQLite singleton + CRUD (note: intentional typo)
│   │   ├── storageService.js               # AsyncStorage + FileSystem persistence helpers
│   │   ├── iconsHelper.js                  # Aircraft type → icon/size mapping, all asset requires
│   │   ├── airportTools.js                 # Airport lookup utilities
│   │   ├── metarTools.js                   # METAR weather data helpers
│   │   └── createKey.js                    # Unique key generator for client objects
│   │
│   ├── components/                         # 🖥️ React Native UI components
│   │   ├── mainApp/
│   │   │   ├── MainApp.jsx                 # ⭐ NavigationContainer + Stack navigator + data orchestration
│   │   │   └── MainTabNavigator.jsx        # Bottom tab navigator (Map, List, Airports, Events)
│   │   ├── vatsimMapView/
│   │   │   ├── VatsimMapView.jsx           # Map screen + @gorhom/bottom-sheet for client details
│   │   │   ├── MapComponent.jsx            # react-native-maps core component
│   │   │   ├── PilotMarkers.jsx            # Individual aircraft map markers
│   │   │   ├── ClusteredPilotMarkers.jsx   # Clustered markers (new feature, in-progress)
│   │   │   ├── AirportMarkers.jsx          # Airport markers with ATC status indicators
│   │   │   └── CTRPolygons.jsx             # FIR/CTR/UIR airspace polygon overlays
│   │   ├── clientDetails/
│   │   │   ├── ClientDetails.jsx           # Router: pilot vs ATC detail dispatch
│   │   │   ├── PilotDetails.jsx            # Pilot: flight plan, altitude, speed, route
│   │   │   ├── AtcDetails.jsx              # ATC: frequency, rating, ATIS text
│   │   │   ├── CtrDetails.jsx              # CTR/Enroute controller details
│   │   │   └── AirportAtcDetails.jsx       # Airport ATC: TWR/GND/DEL/APP combined view
│   │   ├── airportView/
│   │   │   ├── AirportDetailsView.jsx      # Airport search screen
│   │   │   ├── AirportSearchList.jsx       # Search results
│   │   │   └── AirportListItem.jsx         # Single airport row
│   │   ├── vatsimListView/
│   │   │   └── VatsimListView.jsx          # Filterable pilot+ATC list
│   │   ├── EventsView/
│   │   │   ├── VatsimEventsView.jsx        # Events list screen
│   │   │   ├── EventListItem.jsx           # Single event row
│   │   │   └── EventDetailsView.jsx        # Event detail screen
│   │   ├── BookingsView/
│   │   │   ├── BookingsView.jsx            # ATC bookings list
│   │   │   └── BookingDeatils.jsx          # Booking details (note: intentional typo in filename)
│   │   ├── filterBar/
│   │   │   └── FilterBar.jsx               # Pilot/ATC toggle filters + search
│   │   ├── MetarView/
│   │   │   └── MetarView.jsx               # METAR weather display
│   │   ├── networkStatus/
│   │   │   └── networkStatus.jsx           # Network/data status screen
│   │   ├── LoadingView/
│   │   │   └── LoadingView.jsx             # DB loading splash
│   │   ├── settings/
│   │   │   └── Settings.jsx                # App settings (partially disabled in nav)
│   │   └── About/
│   │       └── About.jsx                   # About screen
│   │
│   └── redux/                              # 🔄 State management
│       ├── actions/
│       │   ├── index.js                    # ⭐ allActions aggregator (imported by all components)
│       │   ├── appActions.js               # UI state: selection, filters, DB flags
│       │   ├── vatsimLiveDataActions.js    # Live VATSIM feed polling + data processing
│       │   ├── staticAirspaceDataActions.js # Static data bootstrap: VATSpy + FIR boundaries
│       │   └── metarActions.js             # METAR fetch + cache
│       └── reducers/
│           ├── rootReducer.js              # combineReducers
│           ├── appReducer.js               # UI state reducer
│           ├── vatsimLiveDataReducer.js    # Live data reducer
│           ├── staticAirspaceDataReducer.js # Static data reducer
│           └── metarReducer.js             # METAR cache reducer
│
├── assets/                                 # 📸 Bundled app assets
│   ├── aircraft/blue-2A5D99/               # 10× aircraft silhouette PNGs (64px, brand blue)
│   ├── atc/                                # 10× ATC facility icons (32px + 64px variants)
│   ├── aircraftCodes.json                  # Aircraft type code reference
│   ├── adaptive-icon.png                   # Android adaptive icon
│   ├── splash.png                          # Expo splash screen
│   └── ...                                 # App icons, logos
│
├── graphics/                               # 🖼️ Marketing + app store graphics
│   ├── icons/                              # App store icons (1024px)
│   ├── screenshots/                        # iOS + Android screenshots
│   └── store/                              # App store badges
│
├── android/                                # 🤖 Android native project (Gradle)
│   └── app/build.gradle                    # Android build config
│
├── ios/                                    # 🍎 iOS native project (not fully set up)
│
├── docs/                                   # 📖 Project documentation
│   ├── index.md                            # GitHub Pages landing page
│   └── privacy.md                          # Privacy policy
│
├── google-services.json                    # Firebase config (Android)
├── GoogleService-Info.plist                # Firebase config (iOS)
└── credentials/                            # EAS build credentials (gitignored)
```

---

## Critical Entry Points

| Entry Point | Purpose |
|---|---|
| `index.js` | Expo app registration |
| `App.js` | Store creation, polyfill loading, root providers |
| `app/components/mainApp/MainApp.jsx` | Navigation + static data freshness check + live data polling start |
| `app/components/mainApp/MainTabNavigator.jsx` | Four main app tabs |

## Key Integration Points

| From | To | Via |
|---|---|---|
| Components | Redux store | `useSelector` / `useDispatch` + `allActions` |
| Redux thunks | VATSIM APIs | Native `fetch` |
| Redux thunks | SQLite | `staticDataAcessLayer.js` |
| Redux thunks | File system | `storageService.js` |
| Map components | `react-native-maps` | Google Maps provider |
| Client detail | Bottom sheet | `@gorhom/bottom-sheet` ref |
| Aircraft icons | `require()` | `iconsHelper.js` (centralized) |

## Files to Watch (High Churn Risk)

| File | Why |
|---|---|
| `app/common/consts.js` | `STATIC_DATA_VERSION` must be bumped with schema changes |
| `app/common/theme.js` | All visual changes flow through here |
| `vatsimLiveDataActions.js` | Core data processing pipeline, re-runs every 20s |
| `staticDataAcessLayer.js` | SQLite schema owner |
