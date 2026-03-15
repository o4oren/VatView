import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import AirportMarkers from '../app/components/vatsimMapView/AirportMarkers';

const lightAtcTheme = {
    tracon: '#1A7F37',
    traconFill: 'rgba(26, 127, 55, 0.08)',
    traconStrokeWidth: 1,
};

const darkAtcTheme = {
    tracon: '#2EA043',
    traconFill: 'rgba(46, 160, 67, 0.10)',
    traconStrokeWidth: 1,
};

let mockActiveTheme = {
    atc: lightAtcTheme,
};

// Mock ThemeProvider's useTheme hook
jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        activeTheme: mockActiveTheme,
    }),
}));

// Mock iconsHelper
jest.mock('../app/common/iconsHelper', () => ({
    mapIcons: {},
    getAtcIcon: jest.fn(() => 'mock-icon'),
}));

// Mock airportTools
jest.mock('../app/common/airportTools', () => ({
    getAirportByCode: jest.fn((icao, airports) => {
        if (airports && airports.icao && airports.icao[icao]) {
            return airports.icao[icao];
        }
        return null;
    }),
}));

// Mock boundaryService
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
            },
            cachedAirports: overrides.cachedAirports || {icao: {}, iata: {}},
        },
    }));
};

describe('AirportMarkers', () => {
    beforeEach(() => {
        mockActiveTheme = {
            atc: lightAtcTheme,
        };
        mockLookupTracon.mockReset();
        mockLookupTracon.mockReturnValue(null);
    });

    it('renders airport markers for staffed airports', () => {
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
                <Provider store={store}>
                    <AirportMarkers visible={true} />
                </Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const markers = elements.filter(e => e.type === 'Marker');
        expect(markers.length).toBeGreaterThanOrEqual(1);
    });

    it('renders TRACON polygons when lookup returns polygon data', () => {
        const airport = makeAirport('EGLL');
        mockLookupTracon.mockReturnValue({
            id: 'EGLL-APP',
            polygons: [{
                coordinates: [
                    {latitude: 51, longitude: -1},
                    {latitude: 52, longitude: 0},
                    {latitude: 51, longitude: 1},
                ],
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
                <Provider store={store}>
                    <AirportMarkers visible={true} />
                </Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const polygons = elements.filter(e => e.type === 'Polygon');
        expect(polygons.length).toBeGreaterThanOrEqual(1);
        // Theme token colors
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
                <Provider store={store}>
                    <AirportMarkers visible={true} />
                </Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const circles = elements.filter(e => e.type === 'Circle');
        expect(circles.length).toBeGreaterThanOrEqual(1);
        expect(circles[0].props.strokeColor).toBe('#1A7F37');
        expect(circles[0].props.fillColor).toBe('rgba(26, 127, 55, 0.08)');
    });

    it('uses transparent colors when visible=false', () => {
        const airport = makeAirport('EGLL');
        mockLookupTracon.mockReturnValue({
            id: 'EGLL-APP',
            polygons: [{
                coordinates: [
                    {latitude: 51, longitude: -1},
                    {latitude: 52, longitude: 0},
                    {latitude: 51, longitude: 1},
                ],
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
                <Provider store={store}>
                    <AirportMarkers visible={false} />
                </Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        // Polygons should still be in tree but transparent
        const polygons = elements.filter(e => e.type === 'Polygon');
        expect(polygons.length).toBeGreaterThanOrEqual(1);
        expect(polygons[0].props.strokeColor).toBe('rgba(0,0,0,0)');
        expect(polygons[0].props.fillColor).toBe('rgba(0,0,0,0)');
        expect(polygons[0].props.strokeWidth).toBe(0);
        // Airport marker items should NOT render when hidden
        const markers = elements.filter(e => e.type === 'Marker');
        expect(markers).toHaveLength(0);
    });

    it('updates TRACON colors when the theme changes', () => {
        const airport = makeAirport('EGLL');
        mockLookupTracon.mockReturnValue({
            id: 'EGLL-APP',
            polygons: [{
                coordinates: [
                    {latitude: 51, longitude: -1},
                    {latitude: 52, longitude: 0},
                    {latitude: 51, longitude: 1},
                ],
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
                <Provider store={store}>
                    <AirportMarkers visible={true} />
                </Provider>
            );
        });
        let json = tree.toJSON();
        let elements = Array.isArray(json) ? json : (json ? [json] : []);
        let polygons = elements.filter(e => e.type === 'Polygon');
        expect(polygons[0].props.strokeColor).toBe('#1A7F37');
        expect(polygons[0].props.fillColor).toBe('rgba(26, 127, 55, 0.08)');

        act(() => {
            mockActiveTheme = {
                atc: darkAtcTheme,
            };
            tree.update(
                <Provider store={store}>
                    <AirportMarkers visible={true} />
                </Provider>
            );
        });
        json = tree.toJSON();
        elements = Array.isArray(json) ? json : (json ? [json] : []);
        polygons = elements.filter(e => e.type === 'Polygon');
        expect(polygons[0].props.strokeColor).toBe('#2EA043');
        expect(polygons[0].props.fillColor).toBe('rgba(46, 160, 67, 0.10)');
    });
});
