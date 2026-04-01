import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {useDispatch, useSelector} from 'react-redux';
import MapComponent from '../app/components/vatsimMapView/MapComponent';

const mockDispatch = jest.fn();
const mockSaveInitialRegion = jest.fn(region => ({
    type: 'SAVE_INITIAL_REGION',
    payload: region,
}));

let capturedAirportMarkersProps = null;
let capturedPilotMarkersProps = null;

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(() => true),
}));

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
}));

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        activeMapStyle: [],
        activeTheme: {surface: {base: '#0D1117'}},
    }),
}));

jest.mock('../app/components/vatsimMapView/CTRPolygons', () => 'CTRPolygons');
jest.mock('../app/components/vatsimMapView/PilotMarkers', () => (props) => {
    capturedPilotMarkersProps = props;
    return 'PilotMarkers';
});
jest.mock('../app/components/vatsimMapView/AirportMarkers', () => (props) => {
    capturedAirportMarkersProps = props;
    return 'AirportMarkers';
});

jest.mock('../app/common/airportTools', () => ({
    getAirportByCode: jest.fn(() => null),
}));

jest.mock('../app/redux/actions', () => ({
    __esModule: true,
    default: {
        appActions: {
            saveInitialRegion: (region) => mockSaveInitialRegion(region),
        },
    },
}));

const mockState = {
    vatsimLiveData: {
        cachedAirports: {icao: {}, iata: {}},
    },
    app: {
        selectedClient: null,
        initialRegion: {
            latitude: 52,
            longitude: 0,
            latitudeDelta: 20,
            longitudeDelta: 20,
        },
        filters: {
            atc: true,
            pilots: true,
        },
    },
};

describe('MapComponent', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        mockSaveInitialRegion.mockClear();
        capturedAirportMarkersProps = null;
        capturedPilotMarkersProps = null;
        useDispatch.mockReturnValue(mockDispatch);
        useSelector.mockImplementation(selector => selector(mockState));
    });

    it('computes zoom level locally and passes updates to AirportMarkers', () => {
        let tree;
        act(() => {
            tree = renderer.create(<MapComponent onMapPress={jest.fn()} />);
        });

        expect(capturedAirportMarkersProps.visible).toBe(true);
        expect(capturedAirportMarkersProps.zoomLevel).toBeCloseTo(Math.log2(360 / 20), 5);
        expect(capturedPilotMarkersProps.zoomLevel).toBeCloseTo(Math.log2(360 / 20), 5);

        const nextRegion = {
            latitude: 51.5,
            longitude: -0.1,
            latitudeDelta: 11.25,
            longitudeDelta: 11.25,
        };

        const mapView = tree.root.findByType('MapView');
        act(() => {
            mapView.props.onRegionChangeComplete(nextRegion);
        });

        expect(mockSaveInitialRegion).toHaveBeenCalledWith(nextRegion);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SAVE_INITIAL_REGION',
            payload: nextRegion,
        });
        expect(capturedAirportMarkersProps.zoomLevel).toBeCloseTo(5, 5);
        expect(capturedPilotMarkersProps.zoomLevel).toBeCloseTo(5, 5);
    });

    it('does not render PilotMarkers when the pilots filter is off', () => {
        const pilotsHiddenState = {
            ...mockState,
            app: {
                ...mockState.app,
                filters: {
                    ...mockState.app.filters,
                    pilots: false,
                },
            },
        };

        useSelector.mockImplementation(selector => selector(pilotsHiddenState));

        act(() => {
            renderer.create(<MapComponent onMapPress={jest.fn()} />);
        });

        expect(capturedPilotMarkersProps).toBeNull();
    });
});
