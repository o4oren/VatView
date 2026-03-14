import {Platform, PixelRatio} from 'react-native';

const isAndroid = Platform.OS === 'android';

// Aircraft icons keyed by pixel size
const aircraftIcons = {
    A320: {
        16: require('../../assets/aircraft/blue-2A5D99/airbus-a320-icon-16.png'),
        24: require('../../assets/aircraft/blue-2A5D99/airbus-a320-icon-24.png'),
        32: require('../../assets/aircraft/blue-2A5D99/airbus-a320-icon-32.png'),
        48: require('../../assets/aircraft/blue-2A5D99/airbus-a320-icon-48.png'),
        64: require('../../assets/aircraft/blue-2A5D99/airbus-a320-icon-64.png'),
    },
    C172: {
        16: require('../../assets/aircraft/blue-2A5D99/cessna-icon-16.png'),
        24: require('../../assets/aircraft/blue-2A5D99/cessna-icon-24.png'),
        32: require('../../assets/aircraft/blue-2A5D99/cessna-icon-32.png'),
        48: require('../../assets/aircraft/blue-2A5D99/cessna-icon-48.png'),
        64: require('../../assets/aircraft/blue-2A5D99/cessna-icon-64.png'),
    },
    A330: {
        16: require('../../assets/aircraft/blue-2A5D99/airbus-a330-icon-16.png'),
        24: require('../../assets/aircraft/blue-2A5D99/airbus-a330-icon-24.png'),
        32: require('../../assets/aircraft/blue-2A5D99/airbus-a330-icon-32.png'),
        48: require('../../assets/aircraft/blue-2A5D99/airbus-a330-icon-48.png'),
        64: require('../../assets/aircraft/blue-2A5D99/airbus-a330-icon-64.png'),
    },
    A340: {
        16: require('../../assets/aircraft/blue-2A5D99/airbus-a340-icon-16.png'),
        24: require('../../assets/aircraft/blue-2A5D99/airbus-a340-icon-24.png'),
        32: require('../../assets/aircraft/blue-2A5D99/airbus-a340-icon-32.png'),
        48: require('../../assets/aircraft/blue-2A5D99/airbus-a340-icon-48.png'),
        64: require('../../assets/aircraft/blue-2A5D99/airbus-a340-icon-64.png'),
    },
    A380: {
        16: require('../../assets/aircraft/blue-2A5D99/airbus-a380-icon-16.png'),
        24: require('../../assets/aircraft/blue-2A5D99/airbus-a380-icon-24.png'),
        32: require('../../assets/aircraft/blue-2A5D99/airbus-a380-icon-32.png'),
        48: require('../../assets/aircraft/blue-2A5D99/airbus-a380-icon-48.png'),
        64: require('../../assets/aircraft/blue-2A5D99/airbus-a380-icon-64.png'),
    },
    B737: {
        16: require('../../assets/aircraft/blue-2A5D99/boeing-737-icon-16.png'),
        24: require('../../assets/aircraft/blue-2A5D99/boeing-737-icon-24.png'),
        32: require('../../assets/aircraft/blue-2A5D99/boeing-737-icon-32.png'),
        48: require('../../assets/aircraft/blue-2A5D99/boeing-737-icon-48.png'),
        64: require('../../assets/aircraft/blue-2A5D99/boeing-737-icon-64.png'),
    },
    B747: {
        16: require('../../assets/aircraft/blue-2A5D99/boeing-747-icon-16.png'),
        24: require('../../assets/aircraft/blue-2A5D99/boeing-747-icon-24.png'),
        32: require('../../assets/aircraft/blue-2A5D99/boeing-747-icon-32.png'),
        48: require('../../assets/aircraft/blue-2A5D99/boeing-747-icon-48.png'),
        64: require('../../assets/aircraft/blue-2A5D99/boeing-747-icon-64.png'),
    },
    B777: {
        16: require('../../assets/aircraft/blue-2A5D99/boeing-777-icon-16.png'),
        24: require('../../assets/aircraft/blue-2A5D99/boeing-777-icon-24.png'),
        32: require('../../assets/aircraft/blue-2A5D99/boeing-777-icon-32.png'),
        48: require('../../assets/aircraft/blue-2A5D99/boeing-777-icon-48.png'),
        64: require('../../assets/aircraft/blue-2A5D99/boeing-777-icon-64.png'),
    },
    B787: {
        16: require('../../assets/aircraft/blue-2A5D99/boeing-787-dreamliner-icon-16.png'),
        24: require('../../assets/aircraft/blue-2A5D99/boeing-787-dreamliner-icon-24.png'),
        32: require('../../assets/aircraft/blue-2A5D99/boeing-787-dreamliner-icon-32.png'),
        48: require('../../assets/aircraft/blue-2A5D99/boeing-787-dreamliner-icon-48.png'),
        64: require('../../assets/aircraft/blue-2A5D99/boeing-787-dreamliner-icon-64.png'),
    },
    F100: {
        16: require('../../assets/aircraft/blue-2A5D99/fokker-100-icon-16.png'),
        24: require('../../assets/aircraft/blue-2A5D99/fokker-100-icon-24.png'),
        32: require('../../assets/aircraft/blue-2A5D99/fokker-100-icon-32.png'),
        48: require('../../assets/aircraft/blue-2A5D99/fokker-100-icon-48.png'),
        64: require('../../assets/aircraft/blue-2A5D99/fokker-100-icon-64.png'),
    },
};

// Available pixel sizes in ascending order
const availableSizes = [16, 24, 32, 48, 64];

// Pick the closest available size >= target, or the largest available
const pickSize = (targetPx, iconSet) => {
    for (const s of availableSizes) {
        if (s >= targetPx && iconSet[s]) return iconSet[s];
    }
    return iconSet[64];
};

// react-native-maps Marker `image` prop on Android renders differently in dev vs release:
// - Dev: Metro serves density-aware images, so a 64px image on a 3x device displays at ~21dp.
// - Release: bundled images render at raw pixel size as dp, so 64px = 64dp (way too large).
// This is a known, unfixed issue: https://github.com/react-native-community/react-native-maps/issues/1422
// Using a child <Image> instead of the `image` prop causes red pin markers on Android.
// Workaround: select the right pixel-size asset per build type so both render at the target dp.
const pixelRatio = isAndroid ? PixelRatio.get() : 1;
const androidRelease = isAndroid && !__DEV__;

const getAndroidIcon = (iconSet, targetDp) => {
    if (androidRelease) {
        // Release: image prop renders px as dp, so use the exact dp-sized asset
        return pickSize(targetDp, iconSet);
    }
    // Dev: Metro density-scales, so we need targetDp * pixelRatio pixels
    return pickSize(targetDp * pixelRatio, iconSet);
};

export const mapIcons = {
    // Legacy references for iOS and non-aircraft usage
    A320: aircraftIcons.A320[64],
    C172: aircraftIcons.C172[64],
    A330: aircraftIcons.A330[64],
    A340: aircraftIcons.A340[64],
    A380: aircraftIcons.A380[64],
    B737: aircraftIcons.B737[64],
    B747: aircraftIcons.B747[64],
    B777: aircraftIcons.B777[64],
    B787: aircraftIcons.B787[64],
    F100: aircraftIcons.F100[64],
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

const aircraftCodes = {
    b737codes: {
        codes: ['B737', 'B764', 'B733', 'B734', 'B735', 'B736', 'B737', 'B738', 'B739', ],
        iconKey: 'B737',
        size: iconSizes.MED_SIZE
    },

    b747codes: {
        codes: ['B741', 'B742', 'B744', 'B748', 'B74L', 'B74R'],
        iconKey: 'B747',
        size: iconSizes.JUMBO_SIZE
    },
    a320codes: {
        codes: ['A320', 'A321', 'A319', 'A318', 'A21N', 'A20N'],
        iconKey: 'A320',
        size: iconSizes.MED_SIZE
    },
    a380codes: {
        codes: ['A380', 'A388', 'A389'],
        iconKey: 'A380',
        size: iconSizes.JUMBO_SIZE
    },
    a330codes: {
        codes: ['A330', 'A364', 'A332', 'A333', 'A336', 'A338', 'A339', 'A350', 'A351', 'A359', 'A35K', 'A306', 'A310'],
        iconKey: 'A330',
        size: iconSizes.LARGE_SIZE
    },
    a340codes: {
        codes: ['A340', 'A342', 'A343', 'A435', 'A346'],
        iconKey: 'A340',
        size: iconSizes.LARGE_SIZE
    },
    b777codes: {
        codes: ['B777', 'B772', 'B773', 'B77W', 'B77L'],
        iconKey: 'B777',
        size: iconSizes.LARGE_SIZE
    },
    b787codes: {
        codes: ['B787', 'B788', 'B789', 'B78J', 'B78W'],
        iconKey: 'B787',
        size: iconSizes.LARGE_SIZE
    },
    bizjetcodes: {
        codes: ['C25C', 'C510', 'C560', 'E190', 'E170', 'C550', 'E195', 'CR9', 'GJ5', 'DF7', 'FA50', 'F27', 'F28', 'B721', 'B722'],
        iconKey: 'F100',
        size: iconSizes.SMALL_SIZE
    },
    gacodes: {
        codes: ['C172', 'C182', 'C152', 'PA22', 'C210', 'C208', 'V206', 'CRJ1', 'CRJ2', 'CRJX', 'C25B', 'C56X', 'C500', 'C510',
            'C560', 'F2TH', 'E120', 'P28', 'P31', 'P44', 'SREY'],
        iconKey: 'C172',
        size: iconSizes.EXTRA_SMALL_SIZE
    },
};

export const getAircraftIcon = (code) => {
    let size = iconSizes.MED_SIZE;
    let iconKey = 'B737';

    if(!code) {
        const icon = isAndroid ? getAndroidIcon(aircraftIcons[iconKey], size) : mapIcons[iconKey];
        return [icon, size];
    }

    for (const [, value] of Object.entries(aircraftCodes)) {
        value.codes.forEach(aCode => {
            if(code.includes(aCode)) {
                iconKey = value.iconKey;
                size = value.size;
            }
        });
    }

    const icon = isAndroid ? getAndroidIcon(aircraftIcons[iconKey], size) : mapIcons[iconKey];
    return [icon, size];
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
    // Dev: Metro density-scales, use 64 (closest to 32 * pixelRatio on most devices)
    return iconSet[64];
};

