import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import AirportMarkers from '../app/components/vatsimMapView/AirportMarkers';

const lightAtcTheme = {
    staffed: '#2A6BC4',
    airportDot: '#2A6BC4',
    airportDotUnstaffed: '#8B949E',
    tracon: '#1A7F37',
    traconFill: 'rgba(26, 127, 55, 0.08)',
    traconStrokeWidth: 1,
    badge: {
        clearance: '#8b949e',
        ground: '#1a7f37',
        tower: '#bf8700',
        approach: '#2a6bc4',
        atis: '#0284c7',
    },
    badgeBackground: 'rgba(0,0,0,0.06)',
};

const darkAtcTheme = {
    staffed: '#3B7DD8',
    airportDot: '#3B7DD8',
    airportDotUnstaffed: '#484F58',
    tracon: '#2EA043',
    traconFill: 'rgba(46, 160, 67, 0.10)',
    traconStrokeWidth: 1,
    badge: {
        clearance: '#656d76',
        ground: '#1a7f37',
        tower: '#d29922',
        approach: '#3b7dd8',
        atis: '#0ea5e9',
    },
    badgeBackground: 'rgba(255,255,255,0.10)',
};

let mockActiveTheme = {
    atc: lightAtcTheme,
};

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        activeTheme: mockActiveTheme,
    }),
}));

jest.mock('../app/common/iconsHelper', () => ({
    mapIcons: {},
    getAtcIcon: jest.fn(() => 'mock-icon'),
}));

const mockGetStaffedMarkerImage = jest.fn((icao) => ({
    image: {uri: `staffed-${icao}`},
    widthDp: 64,
    heightDp: 44,
    anchor: {x: 0.2, y: 0.5},
    centerOffset: {x: -19.2, y: 0},
}));

const mockGetTrafficMarkerImage = jest.fn((icao, departures, arrivals) => ({
    image: {uri: `traffic-${icao}-${departures}-${arrivals}`},
    widthDp: 44,
    heightDp: 44,
    anchor: {x: 0.12, y: 0.5},
    centerOffset: {x: -16.72, y: 0},
}));

jest.mock('../app/common/airportMarkerService', () => ({
    getStaffedMarkerImage: (...args) => mockGetStaffedMarkerImage(...args),
    getTrafficMarkerImage: (...args) => mockGetTrafficMarkerImage(...args),
}));

jest.mock('../app/common/airportTools', () => ({
    getAirportByCode: jest.fn((icao, airports) => {
        if (airports && airports.icao && airports.icao[icao]) {
            return airports.icao[icao];
        }
        return null;
    }),
}));

const mockLookupTracon = jest.fn(() => null);
jest.mock('../app/common/boundaryService', () => ({
    lookupTracon: (...args) => mockLookupTracon(...args),
}));

const makeAirport = (icao = 'EGLL') => ({
    icao,
    latitude: 51.47,
    longitude: -0.46,
});

const makeStore = (overrides = {}) => {
    return createStore(() => ({
        app: {selectedClient: null},
        staticAirspaceData: {
            traconBoundaryLookup: overrides.traconBoundaryLookup || {},
        },
        vatsimLiveData: {
            clients: {
                airportAtc: overrides.airportAtc || {},
                trafficCounts: overrides.trafficCounts || {},
            },
            cachedAirports: overrides.cachedAirports || {icao: {}, iata: {}},
        },
    }));
};

describe('AirportMarkers', () => {
    beforeEach(() => {
        mockActiveTheme = { atc: lightAtcTheme };
        mockLookupTracon.mockReset();
        mockLookupTracon.mockReturnValue(null);
        mockGetStaffedMarkerImage.mockClear();
        mockGetTrafficMarkerImage.mockClear();
    });

    it('renders Image markers for staffed airports at global zoom', () => {
        const airport = makeAirport('EGLL');
        const store = makeStore({
            airportAtc: {
                EGLL: [{callsign: 'EGLL_TWR', facility: 4, latitude: 51.47, longitude: -0.46}],
            },
            cachedAirports: {icao: {EGLL: airport}, iata: {}},
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={3} /></Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const markers = elements.filter(e => e.type === 'Marker');
        expect(markers.length).toBeGreaterThanOrEqual(1);
        expect(mockGetStaffedMarkerImage).toHaveBeenCalledWith(
            'EGLL',
            'global',
            mockActiveTheme,
            undefined
        );
    });

    it('renders TRACON polygons when lookup returns polygon data', () => {
        const airport = makeAirport('EGLL');
        mockLookupTracon.mockReturnValue({
            id: 'EGLL-APP',
            polygons: [{
                coordinates: [{latitude: 51, longitude: -1}, {latitude: 52, longitude: 0}, {latitude: 51, longitude: 1}],
                holes: [],
            }],
        });
        const store = makeStore({
            airportAtc: {
                EGLL: [{callsign: 'EGLL_APP', facility: 5, latitude: 51.47, longitude: -0.46}],
            },
            cachedAirports: {icao: {EGLL: airport}, iata: {}},
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={4} /></Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const polygons = elements.filter(e => e.type === 'Polygon');
        expect(polygons.length).toBeGreaterThanOrEqual(1);
        expect(polygons[0].props.strokeColor).toBe('#1A7F37');
        expect(polygons[0].props.fillColor).toBe('rgba(26, 127, 55, 0.08)');
    });

    it('renders APP fallback circle when no TRACON data exists', () => {
        const airport = makeAirport('VHHH');
        mockLookupTracon.mockReturnValue(null);
        const store = makeStore({
            airportAtc: {
                VHHH: [{callsign: 'VHHH_APP', facility: 5, latitude: 22.31, longitude: 113.91}],
            },
            cachedAirports: {icao: {VHHH: airport}, iata: {}},
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={4} /></Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const circles = elements.filter(e => e.type === 'Circle');
        expect(circles.length).toBeGreaterThanOrEqual(1);
        expect(circles[0].props.strokeColor).toBe('#1A7F37');
    });

    it('uses transparent colors when visible=false', () => {
        const airport = makeAirport('EGLL');
        mockLookupTracon.mockReturnValue({
            id: 'EGLL-APP',
            polygons: [{
                coordinates: [{latitude: 51, longitude: -1}, {latitude: 52, longitude: 0}, {latitude: 51, longitude: 1}],
                holes: [],
            }],
        });
        const store = makeStore({
            airportAtc: {
                EGLL: [{callsign: 'EGLL_APP', facility: 5, latitude: 51.47, longitude: -0.46}],
            },
            cachedAirports: {icao: {EGLL: airport}, iata: {}},
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}><AirportMarkers visible={false} zoomLevel={4} /></Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const polygons = elements.filter(e => e.type === 'Polygon');
        expect(polygons.length).toBeGreaterThanOrEqual(1);
        expect(polygons[0].props.strokeColor).toBe('rgba(0,0,0,0)');
        expect(polygons[0].props.fillColor).toBe('rgba(0,0,0,0)');
        expect(polygons[0].props.strokeWidth).toBe(0);
        const markers = elements.filter(e => e.type === 'Marker');
        expect(markers).toHaveLength(0);
    });

    it('updates TRACON colors when the theme changes', () => {
        const airport = makeAirport('EGLL');
        mockLookupTracon.mockReturnValue({
            id: 'EGLL-APP',
            polygons: [{
                coordinates: [{latitude: 51, longitude: -1}, {latitude: 52, longitude: 0}, {latitude: 51, longitude: 1}],
                holes: [],
            }],
        });
        const store = makeStore({
            airportAtc: {
                EGLL: [{callsign: 'EGLL_APP', facility: 5, latitude: 51.47, longitude: -0.46}],
            },
            cachedAirports: {icao: {EGLL: airport}, iata: {}},
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={4} /></Provider>
            );
        });
        let json = tree.toJSON();
        let elements = Array.isArray(json) ? json : (json ? [json] : []);
        let polygons = elements.filter(e => e.type === 'Polygon');
        expect(polygons[0].props.strokeColor).toBe('#1A7F37');

        act(() => {
            mockActiveTheme = { atc: darkAtcTheme };
            tree.update(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={5} /></Provider>
            );
        });
        json = tree.toJSON();
        elements = Array.isArray(json) ? json : (json ? [json] : []);
        polygons = elements.filter(e => e.type === 'Polygon');
        expect(polygons[0].props.strokeColor).toBe('#2EA043');
    });

    it('at continental zoom shows only staffed airports (no unstaffed-with-traffic)', () => {
        const egll = makeAirport('EGLL');
        const kjfk = {icao: 'KJFK', latitude: 40.63, longitude: -73.77};
        const store = makeStore({
            airportAtc: {
                EGLL: [{callsign: 'EGLL_TWR', facility: 4, latitude: 51.47, longitude: -0.46}],
            },
            cachedAirports: {icao: {EGLL: egll, KJFK: kjfk}, iata: {}},
            trafficCounts: {KJFK: {departures: 5, arrivals: 3}},
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={2} /></Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const markers = elements.filter(e => e.type === 'Marker');
        expect(markers).toHaveLength(1);
        expect(mockGetTrafficMarkerImage).not.toHaveBeenCalled();
    });

    it('at regional+ zoom shows staffed + unstaffed-with-traffic as View markers', () => {
        const egll = makeAirport('EGLL');
        const kjfk = {icao: 'KJFK', latitude: 40.63, longitude: -73.77};
        const store = makeStore({
            airportAtc: {
                EGLL: [{callsign: 'EGLL_TWR', facility: 4, latitude: 51.47, longitude: -0.46}],
            },
            cachedAirports: {icao: {EGLL: egll, KJFK: kjfk}, iata: {}},
            trafficCounts: {KJFK: {departures: 5, arrivals: 3}},
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={7} /></Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const markers = elements.filter(e => e.type === 'Marker');
        expect(markers).toHaveLength(2);
        // Regional+ zoom uses LocalAirportMarker, not Image markers
        expect(mockGetStaffedMarkerImage).not.toHaveBeenCalled();
        expect(mockGetTrafficMarkerImage).not.toHaveBeenCalled();
    });

    it('unstaffed airports with zero traffic do NOT render', () => {
        const egll = makeAirport('EGLL');
        const kjfk = {icao: 'KJFK', latitude: 40.63, longitude: -73.77};
        const store = makeStore({
            airportAtc: {
                EGLL: [{callsign: 'EGLL_TWR', facility: 4, latitude: 51.47, longitude: -0.46}],
            },
            cachedAirports: {icao: {EGLL: egll, KJFK: kjfk}, iata: {}},
            trafficCounts: {KJFK: {departures: 0, arrivals: 0}},
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={6} /></Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const markers = elements.filter(e => e.type === 'Marker');
        expect(markers).toHaveLength(1);
    });

    it('zoom change from continental to local adds unstaffed-with-traffic markers', () => {
        const egll = makeAirport('EGLL');
        const kjfk = {icao: 'KJFK', latitude: 40.63, longitude: -73.77};
        const store = makeStore({
            airportAtc: {
                EGLL: [{callsign: 'EGLL_TWR', facility: 4, latitude: 51.47, longitude: -0.46}],
            },
            cachedAirports: {icao: {EGLL: egll, KJFK: kjfk}, iata: {}},
            trafficCounts: {KJFK: {departures: 3, arrivals: 2}},
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={2} /></Provider>
            );
        });
        let json = tree.toJSON();
        let elements = Array.isArray(json) ? json : (json ? [json] : []);
        expect(elements.filter(e => e.type === 'Marker')).toHaveLength(1);

        act(() => {
            tree.update(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={5} /></Provider>
            );
        });
        json = tree.toJSON();
        elements = Array.isArray(json) ? json : (json ? [json] : []);
        expect(elements.filter(e => e.type === 'Marker')).toHaveLength(2);
    });

    it('at local zoom renders LocalAirportMarker instead of AirportMarkerItem for staffed airports', () => {
        const egll = makeAirport('EGLL');
        const store = makeStore({
            airportAtc: {
                EGLL: [{callsign: 'EGLL_TWR', facility: 4, latitude: 51.47, longitude: -0.46}],
            },
            cachedAirports: {icao: {EGLL: egll}, iata: {}},
            trafficCounts: {EGLL: {departures: 2, arrivals: 1}},
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={8} /></Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const markers = elements.filter(e => e.type === 'Marker');
        expect(markers.length).toBeGreaterThanOrEqual(1);
        // At local zoom, should NOT call getStaffedMarkerImage (Image markers)
        expect(mockGetStaffedMarkerImage).not.toHaveBeenCalled();
    });

    it('at local zoom renders LocalAirportMarker for unstaffed-with-traffic airports', () => {
        const kjfk = {icao: 'KJFK', latitude: 40.63, longitude: -73.77};
        const store = makeStore({
            airportAtc: {},
            cachedAirports: {icao: {KJFK: kjfk}, iata: {}},
            trafficCounts: {KJFK: {departures: 5, arrivals: 3}},
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={8} /></Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const markers = elements.filter(e => e.type === 'Marker');
        expect(markers.length).toBeGreaterThanOrEqual(1);
        // Should NOT call getTrafficMarkerImage at local zoom
        expect(mockGetTrafficMarkerImage).not.toHaveBeenCalled();
    });

    it('zoom transition from global to continental swaps to View-based markers', () => {
        const egll = makeAirport('EGLL');
        const store = makeStore({
            airportAtc: {
                EGLL: [{callsign: 'EGLL_TWR', facility: 4, latitude: 51.47, longitude: -0.46}],
            },
            cachedAirports: {icao: {EGLL: egll}, iata: {}},
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={3} /></Provider>
            );
        });
        expect(mockGetStaffedMarkerImage).toHaveBeenCalled();
        mockGetStaffedMarkerImage.mockClear();

        act(() => {
            tree.update(
                <Provider store={store}><AirportMarkers visible={true} zoomLevel={5} /></Provider>
            );
        });
        expect(mockGetStaffedMarkerImage).not.toHaveBeenCalled();
    });
});
