# VatView — Asset Inventory

---

## App Assets (`assets/`)

### Aircraft Icons (`assets/aircraft/blue-2A5D99/`)

Custom blue (#2A5D99) aircraft silhouette PNGs, 64×64px:

| File | Aircraft Type | Used For |
|---|---|---|
| `airbus-a320-icon-64.png` | A320 family | A319, A320, A321, A20N, A21N |
| `airbus-a330-icon-64.png` | A330/A350 family | A330, A332, A333, A350, A306, A310 |
| `airbus-a340-icon-64.png` | A340 family | A340, A342, A343, A346 |
| `airbus-a380-icon-64.png` | A380 family | A380, A388, A389 |
| `boeing-737-icon-64.png` | B737 family | B733–B739, B764 |
| `boeing-747-icon-64.png` | B747 family | B741, B742, B744, B748 |
| `boeing-777-icon-64.png` | B777 family | B772, B773, B77W, B77L |
| `boeing-787-dreamliner-icon-64.png` | B787 family | B788, B789, B78J, B78W |
| `cessna-icon-64.png` | General Aviation | C172, C182, C152, PA22, etc. |
| `fokker-100-icon-64.png` | Business Jets | CRJ, E-jets, smaller aircraft |

### ATC Icons (`assets/atc/`)

Two sizes (64px and 32px) for ATC facility markers:

| File | Usage |
|---|---|
| `tower-64.png` / `tower-32.png` | TWR (Tower) controllers |
| `radio-antenna-64.png` / `radio-antenna-32.png` | ATIS stations |
| `radar-64.png` / `radar-32.png` | General ATC / CTR |
| `tower-radar-64.png` / `tower-radar-32.png` | Combined tower+radar |
| `antenna-radar-64.png` / `antenna-radar-32.png` | Combined antenna+radar |

### App Icons & Splash

| File | Usage |
|---|---|
| `icon-256.png`, `icon-512.png` | App icon variants |
| `adaptive-icon.png` | Android adaptive icon foreground |
| `splash.png` | Expo splash screen |
| `favicon.png` | Web favicon |
| `GND.png` | Ground controller icon |
| `VATSIM_Logo_Official_500px.png` | About screen logo |
| `social.png` | Social sharing image |
| `airplane.png` | General airplane asset |
| `aircraftCodes.json` | Aircraft type code reference data |
| `logos/` | Additional logo variants |

---

## Graphics (`graphics/`)

| Directory | Contents |
|---|---|
| `graphics/Aircraft/` | Additional aircraft silhouettes |
| `graphics/atc/` | Additional ATC icon variants |
| `graphics/icons/` | App icon variants including `icon-1024-background.png` (app store) |
| `graphics/screenshots/` | App store screenshots (iOS + Android) |
| `graphics/store/` | App store badge images (appstore.png, Google Play badge) |
| `graphics/web/` | Web assets |

---

## Asset Loading Pattern

All assets use `require()` with static paths at module load time (React Native bundler requirement).
Centralized in `app/common/iconsHelper.js` — never use `require()` for assets directly in components.

```js
// Correct pattern
import { getAircraftIcon, mapIcons } from '../../common/iconsHelper';
const [icon, size] = getAircraftIcon(pilot.flight_plan.aircraft);

// Never do this in components
const icon = require('../../assets/aircraft/...');
```
