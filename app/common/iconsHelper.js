export const mapIcons = {
    A320: require('../../assets/aircraft/blue-2A5D99/airbus-a320-icon-64.png'),
    C172: require('../../assets/aircraft/blue-2A5D99/cessna-icon-64.png'),
    A330: require('../../assets/aircraft/blue-2A5D99/airbus-a330-icon-64.png'),
    A340: require('../../assets/aircraft/blue-2A5D99/airbus-a340-icon-64.png'),
    A380: require('../../assets/aircraft/blue-2A5D99/airbus-a380-icon-64.png'),
    B737: require('../../assets/aircraft/blue-2A5D99/boeing-737-icon-64.png'),
    B747: require('../../assets/aircraft/blue-2A5D99/boeing-747-icon-64.png'),
    B777: require('../../assets/aircraft/blue-2A5D99/boeing-777-icon-64.png'),
    B787: require('../../assets/aircraft/blue-2A5D99/boeing-787-dreamliner-icon-64.png'),
    F100: require('../../assets/aircraft/blue-2A5D99/fokker-100-icon-64.png'),
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
        icon: mapIcons.B737,
        size: iconSizes.MED_SIZE
    },

    b747codes: {
        codes: ['B741', 'B742', 'B744', 'B748', 'B74L', 'B74R'],
        icon: mapIcons.B747,
        size: iconSizes.JUMBO_SIZE
    },
    a320codes: {
        codes: ['A320', 'A321', 'A319', 'A318', 'A21N', 'A20N'],
        icon: mapIcons.A320,
        size: iconSizes.MED_SIZE
    },
    a380codes: {
        codes: ['A380', 'A388', 'A389'],
        icon: mapIcons.A380,
        size: iconSizes.JUMBO_SIZE
    },
    a330codes: {
        codes: ['A330', 'A364', 'A333', 'A336', 'A338', 'A339', 'A350', 'A351', 'A359', 'A35K', 'A306', 'A310'],
        icon: mapIcons.A330,
        size: iconSizes.LARGE_SIZE
    },
    a340codes: {
        codes: ['A340', 'A342', 'A343', 'A435', 'A346'],
        icon: mapIcons.A340,
        size: iconSizes.LARGE_SIZE
    },
    b777codes: {
        codes: ['B777', 'B772', 'B773', 'B77W', 'B77L'],
        icon: mapIcons.B777,
        size: iconSizes.LARGE_SIZE
    },
    b787codes: {
        codes: ['B787', 'B788', 'B789', 'B78J', 'B78W'],
        icon: mapIcons.B787,
        size: iconSizes.LARGE_SIZE
    },
    bizjetcodes: {
        codes: ['C25C', 'C510', 'C560', 'E190', 'E170', 'C550', 'E195', 'CR9', 'GJ5', 'DF7', 'FA50', 'F27', 'F28', 'B721', 'B722'],
        icon: mapIcons.F100,
        size: iconSizes.SMALL_SIZE
    },
    gacodes: {
        codes: ['C172', 'C182', 'C152', 'PA22', 'C210', 'C208', 'V206', 'CRJ1', 'CRJ2', 'CRJX', 'C25B', 'C56X', 'C500', 'C510',
            'C560', 'F2TH', 'E120', 'P28', 'P31', 'P44', 'SREY'],
        icon: mapIcons.C172,
        size: iconSizes.EXTRA_SMALL_SIZE
    },
};

export const getAircraftIcon = (code) => {
    let size = iconSizes.MED_SIZE;
    let icon = mapIcons.B737;

    if(!code)
        return [icon, size];

    for (const [, value] of Object.entries(aircraftCodes)) {
        value.codes.forEach(aCode => {
            if(code.includes(aCode)) {
                icon = value.icon;
                size = value.size;
            }
        });
    }

    return [icon, size];
};

