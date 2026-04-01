import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

jest.mock('../app/components/detailPanel/DetailPanelProvider', () => ({
    markNewSelection: jest.fn(),
}));

import PilotMarkers, {pilotMarkerItemPropsEqual} from '../app/components/vatsimMapView/PilotMarkers';

// Build a minimal Redux store matching the app shape
const makeStore = (pilots = [], selectedClient = null, myCid = '', friendCids = []) => {
    return createStore(() => ({
        app: { selectedClient, myCid, friendCids },
        vatsimLiveData: {
            clients: { pilots },
        },
    }));
};

const makePilot = (overrides = {}) => ({
    key: 'pilot-1',
    callsign: 'BAW123',
    latitude: 51.47,
    longitude: -0.46,
    heading: 270,
    groundspeed: 450,
    image: { uri: 'file:///mock/icon.png' },
    imageSize: 24,
    flight_plan: { aircraft: 'B738' },
    ...overrides,
});

// Airport zoom (>10) — ground aircraft visible
const AIRPORT_ZOOM = 11;
// Global zoom (≤4) — ground aircraft hidden
const GLOBAL_ZOOM = 3;
// Local zoom (9-10) — ground aircraft hidden
const LOCAL_ZOOM = 10;

const renderMarkers = (pilots, zoomLevel = AIRPORT_ZOOM, selectedClient = null, myCid = '', friendCids = []) => {
    const store = makeStore(pilots, selectedClient, myCid, friendCids);
    let tree;
    act(() => {
        tree = renderer.create(
            <Provider store={store}>
                <PilotMarkers zoomLevel={zoomLevel} />
            </Provider>
        );
    });
    const json = tree.toJSON();
    return Array.isArray(json) ? json : (json ? [json] : []);
};

describe('PilotMarkers', () => {
    it('renders correct number of markers', () => {
        const pilots = [
            makePilot({ key: 'p1', callsign: 'BAW1' }),
            makePilot({ key: 'p2', callsign: 'BAW2' }),
            makePilot({ key: 'p3', callsign: 'BAW3' }),
        ];
        const markers = renderMarkers(pilots);
        expect(markers).toHaveLength(3);
    });

    it('renders nothing for empty pilots array', () => {
        const markers = renderMarkers([]);
        expect(markers).toHaveLength(0);
    });

    it('falls back to mapIcons.B737 when pilot.image is null', () => {
        const pilot = makePilot({ image: null, imageSize: null });
        const markers = renderMarkers([pilot]);
        expect(markers).toHaveLength(1);
        expect(markers[0].type).toBe('Marker');
    });
});

describe('PilotMarkers ground aircraft filtering', () => {
    it('hides ground aircraft (groundspeed=0) at global zoom', () => {
        const pilot = makePilot({ groundspeed: 0 });
        const markers = renderMarkers([pilot], GLOBAL_ZOOM);
        expect(markers).toHaveLength(0);
    });

    it('hides ground aircraft (groundspeed=5) at local zoom', () => {
        const pilot = makePilot({ groundspeed: 5 });
        const markers = renderMarkers([pilot], LOCAL_ZOOM);
        expect(markers).toHaveLength(0);
    });

    it('shows ground aircraft (groundspeed=5) at airport zoom', () => {
        const pilot = makePilot({ groundspeed: 5 });
        const markers = renderMarkers([pilot], AIRPORT_ZOOM);
        expect(markers).toHaveLength(1);
    });

    it('shows airborne aircraft (groundspeed=6) at global zoom', () => {
        const pilot = makePilot({ groundspeed: 6 });
        const markers = renderMarkers([pilot], GLOBAL_ZOOM);
        expect(markers).toHaveLength(1);
    });

    it('shows pilots with missing groundspeed at global zoom', () => {
        const pilot = makePilot({ groundspeed: undefined });
        const markers = renderMarkers([pilot], GLOBAL_ZOOM);
        expect(markers).toHaveLength(1);
    });

    it('shows ground aircraft that is selectedClient regardless of zoom', () => {
        const pilot = makePilot({ groundspeed: 0, callsign: 'SEL1' });
        const selectedClient = { callsign: 'SEL1' };
        const markers = renderMarkers([pilot], GLOBAL_ZOOM, selectedClient);
        expect(markers).toHaveLength(1);
    });

    it('filters only ground aircraft, keeps airborne in mixed list', () => {
        const pilots = [
            makePilot({ key: 'p1', callsign: 'GND1', groundspeed: 0 }),
            makePilot({ key: 'p2', callsign: 'AIR1', groundspeed: 300 }),
            makePilot({ key: 'p3', callsign: 'GND2', groundspeed: 3 }),
            makePilot({ key: 'p4', callsign: 'AIR2', groundspeed: 150 }),
        ];
        const markers = renderMarkers(pilots, GLOBAL_ZOOM);
        expect(markers).toHaveLength(2);
    });

    it('shows all aircraft at airport zoom regardless of groundspeed', () => {
        const pilots = [
            makePilot({ key: 'p1', callsign: 'GND1', groundspeed: 0 }),
            makePilot({ key: 'p2', callsign: 'AIR1', groundspeed: 300 }),
            makePilot({ key: 'p3', callsign: 'GND2', groundspeed: 3 }),
        ];
        const markers = renderMarkers(pilots, AIRPORT_ZOOM);
        expect(markers).toHaveLength(3);
    });
});

describe('PilotMarkerItem memo', () => {
    it('returns true when memoized props are identical', () => {
        const pilot = makePilot();
        const onPress = jest.fn();
        const props = {
            pilot,
            pilotImage: pilot.image,
            pilotImageSize: pilot.imageSize,
            onPress,
        };

        expect(pilotMarkerItemPropsEqual(props, props)).toBe(true);
    });

    it('returns false when pilot heading changes', () => {
        const pilot1 = makePilot({ heading: 90 });
        const pilot2 = makePilot({ heading: 180 });
        const onPress = jest.fn();

        expect(pilotMarkerItemPropsEqual(
            {
                pilot: pilot1,
                pilotImage: pilot1.image,
                pilotImageSize: pilot1.imageSize,
                onPress,
            },
            {
                pilot: pilot2,
                pilotImage: pilot2.image,
                pilotImageSize: pilot2.imageSize,
                onPress,
            }
        )).toBe(false);
    });
});

describe('PilotMarkers role coloring', () => {
    it('renders marker for "me" pilot when myCid matches', () => {
        const pilot = makePilot({ key: 'p1', callsign: 'ME001', cid: 1234567 });
        const markers = renderMarkers([pilot], AIRPORT_ZOOM, null, '1234567', []);
        expect(markers).toHaveLength(1);
    });

    it('renders marker for friend pilot when cid in friendCids', () => {
        const pilot = makePilot({ key: 'p1', callsign: 'FRD001', cid: 9999999 });
        const markers = renderMarkers([pilot], AIRPORT_ZOOM, null, '', ['9999999']);
        expect(markers).toHaveLength(1);
    });

    it('renders marker for other pilot when not me or friend', () => {
        const pilot = makePilot({ key: 'p1', callsign: 'OTH001', cid: 1111111 });
        const markers = renderMarkers([pilot], AIRPORT_ZOOM, null, '9999999', ['2222222']);
        expect(markers).toHaveLength(1);
    });
});

describe('PilotMarkerItem memo with pilotRole', () => {
    it('returns false when pilotRole changes', () => {
        const pilot = makePilot();
        const onPress = jest.fn();
        const base = { pilot, pilotImage: pilot.image, pilotImageSize: pilot.imageSize, onPress, pilotRole: 'other' };
        expect(pilotMarkerItemPropsEqual(
            { ...base, pilotRole: 'other' },
            { ...base, pilotRole: 'me' }
        )).toBe(false);
    });

    it('returns true when pilotRole is same', () => {
        const pilot = makePilot();
        const onPress = jest.fn();
        const base = { pilot, pilotImage: pilot.image, pilotImageSize: pilot.imageSize, onPress, pilotRole: 'friend' };
        expect(pilotMarkerItemPropsEqual(base, base)).toBe(true);
    });
});
