export const INITIAL_REGION = {
    latitude: 52,
    longitude: 0,
    latitudeDelta: 20,
    longitudeDelta: 20
};
export const SAVED_INITIAL_REGION = 'SAVED_INITIAL_REGION';

export const EXCLUDED_CALLSIGNS = [
    'BICC_FSS',
];

export const STATIC_DATA_VERSION = 426;
export const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;
export const ONE_MIN = 1000 * 60;
export const PILOT = 'PILOT';
export const ATC = 'ATC';

// 0 - OBS, 1 - FSS, 2 - DEL, 3 GND, 4 - TWR/ATIS, 5 - APP, 6 - CTR
export const OBS = 0;
export const FSS = 1;
export const DEL = 2;
export const GND = 3;
export const TWR_ATIS = 4;
export const APP = 5;
export const CTR = 6;

export const facilities = [
    {
        id: 0,
        short: 'OBS',
        long: 'Observer'
    },
    {
        id: 1,
        short: 'FSS',
        long: 'Flight Service Station'
    },
    {
        id: 2,
        short: 'DEL',
        long: 'Clearance Delivery'
    },
    {
        id: 3,
        short: 'GND',
        long: 'Ground'
    },
    {
        id: 4,
        short: 'TWR',
        long: 'Tower'
    },
    {
        id: 5,
        short: 'APP',
        long: 'Approach/Departure'
    },
    {
        id: 6,
        short: 'CTR',
        long: 'Enroute'
    }
];

export const APP_RADIUS = 80 * 1000;



