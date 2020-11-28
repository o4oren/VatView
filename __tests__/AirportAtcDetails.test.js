import React from 'react';
import renderer, {act} from 'react-test-renderer';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        vatsimLiveData: {
            clients: {
                airportAtc: {
                    'KLAX': [
                        {callsign: 'KLAX_TWR', frequency: '133.900', facility: 4, rating: 3, logon_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), name: 'Alex', cid: 789, text_atis: null, key: 'klax_twr'},
                    ],
                },
                trafficCounts: {
                    'KLAX': {departures: 5, arrivals: 3},
                },
            },
        },
    })),
}));

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        isDark: false,
        activeTheme: {
            text: {primary: '#fff', secondary: '#aaa', muted: '#666'},
            surface: {border: '#333'},
            accent: {primary: '#4FC3F7'},
            atc: {
                badge: {
                    clearance: '#8b949e',
                    ground: '#1a7f37',
                    tower: '#bf8700',
                    approach: '#2a6bc4',
                    atis: '#0284c7',
                },
            },
        },
    }),
}));

global.fetch = jest.fn(() =>
    Promise.resolve({text: () => Promise.resolve('KLAX 171220Z 25012KT 9999 SCT020 22/12 A2992')})
);

import AirportAtcDetails from '../app/components/clientDetails/AirportAtcDetails';

const airport = {icao: 'KLAX', name: 'Los Angeles International', latitude: 33.9425, longitude: -118.408};

describe('AirportAtcDetails thin wrapper', () => {
    it('renders without crashing', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportAtcDetails airport={airport} />);
        });
        expect(tree.toJSON()).not.toBeNull();
    });

    it('renders AirportDetailCard content (ICAO visible)', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportAtcDetails airport={airport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('KLAX');
    });

    it('renders AirportDetailCard content (airport name visible)', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportAtcDetails airport={airport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('Los Angeles International');
    });

    it('renders ATC controller callsign from AirportDetailCard', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportAtcDetails airport={airport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('KLAX_TWR');
    });
});
