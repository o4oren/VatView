import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import CTRPolygons from '../app/components/vatsimMapView/CTRPolygons';

const lightAtcTheme = {
    fir: '#2A6BC4',
    firFill: 'rgba(42, 107, 196, 0.12)',
    firStrokeWidth: 1,
    uir: '#8250DF',
    uirFill: 'rgba(130, 80, 223, 0.15)',
    uirStrokeWidth: 0,
};

const darkAtcTheme = {
    fir: '#3B7DD8',
    firFill: 'rgba(59, 125, 216, 0.15)',
    firStrokeWidth: 1,
    uir: '#A371F7',
    uirFill: 'rgba(163, 113, 247, 0.18)',
    uirStrokeWidth: 0,
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

const makeStore = (overrides = {}) => {
    return createStore(() => ({
        app: {selectedClient: null},
        staticAirspaceData: {
            firs: [],
            uirs: {},
            ...overrides.staticAirspaceData,
        },
        vatsimLiveData: {
            clients: {
                ctr: {},
                fss: {},
                ...overrides.clients,
            },
            cachedFirBoundaries: overrides.cachedFirBoundaries || {},
            cachedAirports: {},
        },
    }));
};

const makeFirBoundary = (icao = 'EGTT') => ({
    icao,
    points: [
        {latitude: 51, longitude: -1},
        {latitude: 52, longitude: 0},
        {latitude: 51, longitude: 1},
    ],
    holes: [],
    center: {latitude: 51.5, longitude: 0},
    isOceanic: false,
    isExtention: false,
});

const makeCtrClient = (callsign = 'EGTT_CTR', overrides = {}) => ({
    callsign,
    frequency: '129.430',
    facility: 6,
    latitude: 51.5,
    longitude: 0,
    ...overrides,
});

describe('CTRPolygons', () => {
    beforeEach(() => {
        mockActiveTheme = {
            atc: lightAtcTheme,
        };
    });

    it('renders FIR polygons for active CTR controllers', () => {
        const store = makeStore({
            clients: {
                ctr: {EGTT: [makeCtrClient()]},
                fss: {},
            },
            cachedFirBoundaries: {
                EGTT: [makeFirBoundary('EGTT')],
            },
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}>
                    <CTRPolygons visible={true} />
                </Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        // Should have at least a Polygon and a Marker for the FIR
        const polygons = elements.filter(e => e.type === 'Polygon');
        const markers = elements.filter(e => e.type === 'Marker');
        expect(polygons.length).toBeGreaterThanOrEqual(1);
        expect(markers.length).toBeGreaterThanOrEqual(1);
        // Check theme token colors on polygon
        expect(polygons[0].props.strokeColor).toBe('#2A6BC4');
        expect(polygons[0].props.fillColor).toBe('rgba(42, 107, 196, 0.12)');
    });

    it('renders UIR polygons with UIR colors', () => {
        const store = makeStore({
            clients: {
                ctr: {EURM: [makeCtrClient('EURM_CTR')]},
                fss: {},
            },
            cachedFirBoundaries: {
                EDGG: [makeFirBoundary('EDGG')],
                EDWW: [makeFirBoundary('EDWW')],
            },
            staticAirspaceData: {
                firs: [],
                uirs: {
                    EURM: {
                        firs: ['EDGG', 'EDWW'],
                    },
                },
            },
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}>
                    <CTRPolygons visible={true} />
                </Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const polygons = elements.filter(e => e.type === 'Polygon');
        expect(polygons.length).toBeGreaterThanOrEqual(1);
        // UIR should use green colors
        expect(polygons[0].props.strokeColor).toBe('#8250DF');
        expect(polygons[0].props.fillColor).toBe('rgba(130, 80, 223, 0.15)');
    });

    it('renders nothing for empty ctr/fss', () => {
        const store = makeStore();
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}>
                    <CTRPolygons visible={true} />
                </Provider>
            );
        });
        const json = tree.toJSON();
        expect(json).toBeNull();
    });

    it('uses transparent colors when visible=false', () => {
        const store = makeStore({
            clients: {
                ctr: {EGTT: [makeCtrClient()]},
                fss: {},
            },
            cachedFirBoundaries: {
                EGTT: [makeFirBoundary('EGTT')],
            },
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}>
                    <CTRPolygons visible={false} />
                </Provider>
            );
        });
        const json = tree.toJSON();
        const elements = Array.isArray(json) ? json : (json ? [json] : []);
        const polygons = elements.filter(e => e.type === 'Polygon');
        expect(polygons.length).toBeGreaterThanOrEqual(1);
        // Should be transparent
        expect(polygons[0].props.strokeColor).toBe('rgba(0,0,0,0)');
        expect(polygons[0].props.fillColor).toBe('rgba(0,0,0,0)');
        expect(polygons[0].props.strokeWidth).toBe(0);
        // Markers should not render when hidden
        const markers = elements.filter(e => e.type === 'Marker');
        expect(markers).toHaveLength(0);
    });

    it('updates FIR colors when the theme changes', () => {
        const store = makeStore({
            clients: {
                ctr: {EGTT: [makeCtrClient()]},
                fss: {},
            },
            cachedFirBoundaries: {
                EGTT: [makeFirBoundary('EGTT')],
            },
        });
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}>
                    <CTRPolygons visible={true} />
                </Provider>
            );
        });
        let json = tree.toJSON();
        let elements = Array.isArray(json) ? json : (json ? [json] : []);
        let polygons = elements.filter(e => e.type === 'Polygon');
        expect(polygons[0].props.strokeColor).toBe('#2A6BC4');
        expect(polygons[0].props.fillColor).toBe('rgba(42, 107, 196, 0.12)');

        act(() => {
            mockActiveTheme = {
                atc: darkAtcTheme,
            };
            tree.update(
                <Provider store={store}>
                    <CTRPolygons visible={true} />
                </Provider>
            );
        });
        json = tree.toJSON();
        elements = Array.isArray(json) ? json : (json ? [json] : []);
        polygons = elements.filter(e => e.type === 'Polygon');
        expect(polygons[0].props.strokeColor).toBe('#3B7DD8');
        expect(polygons[0].props.fillColor).toBe('rgba(59, 125, 216, 0.15)');
    });
});
