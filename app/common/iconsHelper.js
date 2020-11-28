import {Platform} from 'react-native';
import { getMarkerImage, isInitialized } from './aircraftIconService';

const isAndroid = Platform.OS === 'android';
const androidRelease = isAndroid && !__DEV__;

export const mapIcons = {
    // B737 PNG fallback — used by PilotMarkers.jsx when pilot.image is null (pre-init safety net)
    B737: require('../../assets/aircraft/blue-2A5D99/boeing-737-icon-32.png'),
    tower64: require('../../assets/atc/tower-64.png'),
    antenna64: require('../../assets/atc/radio-antenna-64.png'),
    radar64: require('../../assets/atc/radar-64.png'),
    towerRadar64: require('../../assets/atc/tower-radar-64.png'),
    antennaRadar64: require('../../assets/atc/antenna-radar-64.png'),
    tower32: require('../../assets/atc/tower-32.png'),
    antenna32: require('../../assets/atc/radio-antenna-32.png'),
    radar32: require('../../assets/atc/radar-32.png'),
    towerRadar32: require('../../assets/atc/tower-radar-32.png'),
    antennaRadar32: require('../../assets/atc/antenna-radar-32.png'),
};

export const iconSizes = {
    BUILDING_SIZE: 64,
    JUMBO_SIZE: 32,
    LARGE_SIZE: 28,
    MED_SIZE: 24,
    SMALL_SIZE: 20,
    EXTRA_SMALL_SIZE: 16
};

export const getAircraftIcon = (code) => {
    if (!isInitialized()) {
        return [null, iconSizes.MED_SIZE];
    }

    const entry = getMarkerImage(code);
    if (!entry) {
        return [null, iconSizes.MED_SIZE];
    }

    return [entry.image, entry.sizeDp];
};

const atcIcons = {
    tower: {32: mapIcons.tower32, 64: mapIcons.tower64},
    antenna: {32: mapIcons.antenna32, 64: mapIcons.antenna64},
    radar: {32: mapIcons.radar32, 64: mapIcons.radar64},
    towerRadar: {32: mapIcons.towerRadar32, 64: mapIcons.towerRadar64},
    antennaRadar: {32: mapIcons.antennaRadar32, 64: mapIcons.antennaRadar64},
};

export const getAtcIcon = (name) => {
    const iconSet = atcIcons[name];
    if (!isAndroid) {
        return iconSet[64];
    }
    if (androidRelease) {
        return iconSet[32];
    }
    return iconSet[64];
};
