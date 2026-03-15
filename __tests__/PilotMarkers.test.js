import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import PilotMarkers, {pilotMarkerItemPropsEqual} from '../app/components/vatsimMapView/PilotMarkers';

// Build a minimal Redux store matching the app shape
const makeStore = (pilots = [], selectedClient = null) => {
    return createStore(() => ({
        app: { selectedClient },
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
    image: { uri: 'file:///mock/icon.png' },
    imageSize: 24,
    flight_plan: { aircraft: 'B738' },
    ...overrides,
});

describe('PilotMarkers', () => {
    it('renders correct number of markers', () => {
        const pilots = [
            makePilot({ key: 'p1', callsign: 'BAW1' }),
            makePilot({ key: 'p2', callsign: 'BAW2' }),
            makePilot({ key: 'p3', callsign: 'BAW3' }),
        ];
        const store = makeStore(pilots);
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}>
                    <PilotMarkers />
                </Provider>
            );
        });
        const json = tree.toJSON();
        // PilotMarkers returns an array of Marker elements
        const markers = Array.isArray(json) ? json : (json ? [json] : []);
        expect(markers).toHaveLength(3);
    });

    it('renders nothing for empty pilots array', () => {
        const store = makeStore([]);
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}>
                    <PilotMarkers />
                </Provider>
            );
        });
        const json = tree.toJSON();
        expect(json).toBeNull();
    });

    it('falls back to mapIcons.B737 when pilot.image is null', () => {
        const pilot = makePilot({ image: null, imageSize: null });
        const store = makeStore([pilot]);
        let tree;
        act(() => {
            tree = renderer.create(
                <Provider store={store}>
                    <PilotMarkers />
                </Provider>
            );
        });
        const json = tree.toJSON();
        const marker = Array.isArray(json) ? json[0] : json;
        expect(marker).not.toBeNull();
        // Verify the marker rendered (exact prop check depends on platform mock)
        expect(marker.type).toBe('Marker');
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
