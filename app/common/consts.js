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

export const STATIC_DATA_VERSION = 435;
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

// Zoom band thresholds — AIRPORT > 10, LOCAL > 8, REGIONAL > 6, CONTINENTAL > 4, GLOBAL > 0
export const ZOOM_GLOBAL_MAX = 4;
export const ZOOM_CONTINENTAL_MAX = 6;
export const ZOOM_REGIONAL_MAX = 8;
export const ZOOM_LOCAL_MAX = 10;

export const AIRPORT_MARKER_FONT_CONTINENTAL = 13;
export const AIRPORT_MARKER_FONT_REGIONAL = 15;

export const getZoomBand = (zoomLevel) => {
    if (zoomLevel <= ZOOM_GLOBAL_MAX) return 'global';
    if (zoomLevel <= ZOOM_CONTINENTAL_MAX) return 'continental';
    if (zoomLevel <= ZOOM_REGIONAL_MAX) return 'regional';
    if (zoomLevel <= ZOOM_LOCAL_MAX) return 'local';
    return 'airport';
};



