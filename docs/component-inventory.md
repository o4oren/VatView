# VatView — Component Inventory

All components are React Native functional components using hooks. No class components.
Files: PascalCase `.jsx` | Utilities/Actions/Reducers: camelCase `.js`

---

## Application Root

| File | Component | Description |
|---|---|---|
| `App.js` | `App` | Root: store creation, polyfills, PaperProvider |
| `app/components/mainApp/MainApp.jsx` | `mainApp` | NavigationContainer + Stack.Navigator; data loading orchestration |
| `app/components/mainApp/MainTabNavigator.jsx` | `MainTabNavigator` | Bottom tab navigator (Map, List, Airports, Events) |
| `app/components/LoadingView/LoadingView.jsx` | `LoadingView` | Shown while SQLite DB populates |

---

## Navigation Screens (Stack)

| Screen Name | Component File | Type |
|---|---|---|
| `VatView` (root) | `MainTabNavigator.jsx` | Bottom tabs container |
| `About` | `About/About.jsx` | Modal screen |
| `Settings` | `settings/Settings.jsx` | Modal screen |
| `Network status` | `networkStatus/networkStatus.jsx` | Modal screen |
| `Event Details` | `EventsView/EventDetailsView.jsx` | Stack screen |
| `ATC Bookings` | `BookingsView/BookingsView.jsx` | Stack screen |
| `Metar` | `MetarView/MetarView.jsx` | Stack screen |

---

## Tab Screens

| Tab | Component File | Description |
|---|---|---|
| Map | `vatsimMapView/VatsimMapView.jsx` | Interactive map + bottom sheet for client details |
| List | `vatsimListView/VatsimListView.jsx` | Filterable pilot/ATC list |
| Airports | `airportView/AirportDetailsView.jsx` | Airport search + details |
| Events | `EventsView/VatsimEventsView.jsx` | VATSIM events list |

---

## Map Feature Components

| File | Component | Description |
|---|---|---|
| `vatsimMapView/MapComponent.jsx` | `MapComponent` | Core `react-native-maps` component |
| `vatsimMapView/PilotMarkers.jsx` | `PilotMarkers` | Individual pilot aircraft markers |
| `vatsimMapView/ClusteredPilotMarkers.jsx` | `ClusteredPilotMarkers` | Clustered pilot markers (new, in-progress) |
| `vatsimMapView/AirportMarkers.jsx` | `AirportMarkers` | Airport markers with ATC indicators |
| `vatsimMapView/CTRPolygons.jsx` | `CTRPolygons` | FIR/CTR/UIR airspace polygons |

---

## Client Detail Components

| File | Component | Description |
|---|---|---|
| `clientDetails/ClientDetails.jsx` | `ClientDetails` | Router: selects pilot vs ATC detail view |
| `clientDetails/PilotDetails.jsx` | `PilotDetails` | Full pilot info: flight plan, altitude, speed |
| `clientDetails/AtcDetails.jsx` | `AtcDetails` | ATC controller info: frequency, rating, ATIS |
| `clientDetails/CtrDetails.jsx` | `CtrDetails` | CTR/Enroute controller details |
| `clientDetails/AirportAtcDetails.jsx` | `AirportAtcDetails` | Airport-specific ATC view (TWR, GND, DEL, APP) |

---

## Airport Feature Components

| File | Component | Description |
|---|---|---|
| `airportView/AirportDetailsView.jsx` | `AirportDetailsView` | Search + airport detail display |
| `airportView/AirportSearchList.jsx` | `AirportSearchList` | Search results list |
| `airportView/AirportListItem.jsx` | `AirportListItem` | Single airport row in list |

---

## Events & Bookings Feature Components

| File | Component | Description |
|---|---|---|
| `EventsView/VatsimEventsView.jsx` | `VatsimEventsView` | Events list screen |
| `EventsView/EventListItem.jsx` | `EventListItem` | Single event row |
| `EventsView/EventDetailsView.jsx` | `EventDetailsView` | Full event detail screen |
| `BookingsView/BookingsView.jsx` | `BookingsView` | ATC bookings list |
| `BookingsView/BookingDeatils.jsx` | `BookingDeatils` | Single booking details (note typo in filename) |

---

## Utility Components

| File | Component | Description |
|---|---|---|
| `filterBar/FilterBar.jsx` | `FilterBar` | Pilot/ATC toggle filters + search input |
| `MetarView/MetarView.jsx` | `MetarView` | METAR weather data display |
| `networkStatus/networkStatus.jsx` | `NetworkStatus` | Connection/data status screen |
| `settings/Settings.jsx` | `Settings` | App settings screen |
| `About/About.jsx` | `About` | About screen |

---

## Common Utilities (`app/common/`)

| File | Exports | Description |
|---|---|---|
| `theme.js` | `default` (blueGrey object) | All colors, map style, react-native-paper theme |
| `consts.js` | Named constants | Facility codes, STATIC_DATA_VERSION, timeouts, VATSIM codes |
| `iconsHelper.js` | `getAircraftIcon`, `mapIcons`, `iconSizes` | Aircraft type → icon/size mapping |
| `staticDataAcessLayer.js` | DB functions | SQLite singleton + CRUD for airports + FIR tables |
| `storageService.js` | Named exports | AsyncStorage + FileSystem persistence helpers |
| `airportTools.js` | `findAirportByCodeInAptList` | Airport lookup helpers |
| `metarTools.js` | METAR utilities | Weather data helpers |
| `createKey.js` | `createKey` | Unique key generation for clients |

---

## Design System

- **Theme:** blueGrey (defined in `app/common/theme.js`)
- **Primary color:** `#2a5d99`
- **UI library:** react-native-paper v4 (Material Design v2)
- **Icons:** MaterialCommunityIcons via @expo/vector-icons
- **Map style:** Custom blueGrey Google Maps style (37 style rules)
- **All colors must reference `theme.js`** — no hardcoded color literals (ESLint enforced)
