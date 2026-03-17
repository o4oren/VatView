import React from 'react';
import renderer, {act} from 'react-test-renderer';

global.fetch = jest.fn(() =>
    Promise.resolve({text: () => Promise.resolve('EGLL 171220Z 25012KT 9999 FEW025 15/08 Q1018')})
);

afterEach(() => {
    jest.clearAllMocks();
});

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        vatsimLiveData: {
            clients: {
                airportAtc: {
                    'EGLL': [
                        {callsign: 'EGLL_APP', frequency: '120.400', facility: 5, rating: 4, logon_time: new Date(Date.now() - 90 * 60 * 1000).toISOString(), name: 'Jane Doe', cid: 456, text_atis: null, key: 'egll_app'},
                        {callsign: 'EGLL_TWR', frequency: '118.700', facility: 4, rating: 5, logon_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), name: 'John Smith', cid: 123, text_atis: null, key: 'egll_twr'},
                    ],
                },
                trafficCounts: {
                    'EGLL': {departures: 12, arrivals: 8},
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

import AirportDetailCard from '../app/components/clientDetails/AirportDetailCard';

const staffedAirport = {icao: 'EGLL', name: 'London Heathrow', latitude: 51.4775, longitude: -0.4614};
const unstaffedAirport = {icao: 'ZZZZ', name: 'Empty Airport', latitude: 0, longitude: 0};

describe('AirportDetailCard — staffed airport', () => {
    it('renders ICAO at peek', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={staffedAirport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('EGLL');
    });

    it('renders airport name at peek', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={staffedAirport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('London Heathrow');
    });

    it('renders traffic departure count at peek', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={staffedAirport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('12');
    });

    it('renders traffic arrival count at peek', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={staffedAirport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('8');
    });

    it('renders ATC badge letters T and A for staffed airport with TWR and APP', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={staffedAirport} />);
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('"T"');
        expect(json).toContain('"A"');
    });

    it('renders controller callsigns in half section', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={staffedAirport} />);
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('EGLL_APP');
        expect(json).toContain('EGLL_TWR');
    });

    it('renders controller frequencies in half section', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={staffedAirport} />);
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('120.400');
        expect(json).toContain('118.700');
    });

    it('renders controller name and CID in half section', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={staffedAirport} />);
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('Jane Doe');
        expect(json).toContain('456');
    });

    it('renders controller ratings in full section', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={staffedAirport} />);
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('C1');
        expect(json).toContain('C3');
    });

    it('renders time online for controllers', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={staffedAirport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('ONLINE');
    });

    it('renders METAR label in full section after fetch', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<AirportDetailCard airport={staffedAirport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('METAR');
    });

    it('renders fetched METAR raw text in full section', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<AirportDetailCard airport={staffedAirport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('EGLL 171220Z');
    });
});

describe('AirportDetailCard — unstaffed airport', () => {
    it('renders ICAO for unstaffed airport', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={unstaffedAirport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('ZZZZ');
    });

    it('renders "No ATC online" for unstaffed airport', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={unstaffedAirport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('No ATC online');
    });

    it('does NOT crash for unstaffed airport', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={unstaffedAirport} />);
        });
        expect(tree.toJSON()).not.toBeNull();
    });
});

describe('AirportDetailCard — missing traffic counts', () => {
    it('shows dash symbols when no trafficCounts entry', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AirportDetailCard airport={unstaffedAirport} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('—');
    });
});
