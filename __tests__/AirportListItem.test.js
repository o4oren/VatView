import React from 'react';
import renderer, {act} from 'react-test-renderer';

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        isDark: false,
        activeTheme: {
            text: {primary: '#1F2328', secondary: '#656D76', muted: '#8B949E'},
            surface: {base: '#FFFFFF', elevated: 'rgba(255,255,255,0.5)', border: 'rgba(0,0,0,0.08)'},
            accent: {primary: '#2A6BC4'},
            atc: {
                airportDotUnstaffed: '#5A6370',
                badge: {
                    clearance: '#8b949e',
                    ground: '#1a7f37',
                    tower: '#bf8700',
                    approach: '#2a6bc4',
                    atis: '#0284c7',
                    ctr: '#1A7A6E',
                    fss: '#8250DF',
                },
            },
        },
    }),
}));

jest.mock('../app/components/clientDetails/AirportDetailCard', () => {
    const {View} = require('react-native');
    return function MockAirportDetailCard({airport}) {
        return <View testID={`airport-detail-card-${airport?.icao || 'unknown'}`} />;
    };
});

import AirportListItem from '../app/components/airportView/AirportListItem';

const airport = {
    icao: 'EGLL',
    iata: 'LHR',
    name: 'Heathrow',
    latitude: 51.477,
    longitude: -0.461,
    fir: 'EGTT',
    isPseaudo: 0,
};

const airportAtcList = [
    {callsign: 'EGLL_TWR', facility: 4, frequency: '118.700', cid: 111, name: 'Jane Doe', rating: 5, logon_time: '2024-01-01T00:00:00Z'},
];

const flights = {
    departures: [{callsign: 'BAW1', cid: 1, flight_plan: {departure: 'EGLL', arrival: 'KJFK'}}],
    arrivals: [{callsign: 'BAW2', cid: 2, flight_plan: {departure: 'KJFK', arrival: 'EGLL'}}],
};

describe('AirportListItem — rendering', () => {
    it('renders ICAO in monospace via callsign variant', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <AirportListItem
                    airport={airport}
                    airportAtc={airportAtcList}
                    flights={flights}
                    isExpanded={false}
                    onToggle={() => {}}
                />
            );
        });
        expect(JSON.stringify(tree.toJSON())).toContain('EGLL');
    });

    it('renders airport name as subtitle', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <AirportListItem
                    airport={airport}
                    airportAtc={airportAtcList}
                    flights={flights}
                    isExpanded={false}
                    onToggle={() => {}}
                />
            );
        });
        expect(JSON.stringify(tree.toJSON())).toContain('Heathrow');
    });

    it('renders ATC badge letter when airportAtc is non-empty', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <AirportListItem
                    airport={airport}
                    airportAtc={airportAtcList}
                    flights={flights}
                    isExpanded={false}
                    onToggle={() => {}}
                />
            );
        });
        // Tower badge should render letter 'T'
        expect(JSON.stringify(tree.toJSON())).toContain('T');
    });

    it('renders grey dot when no ATC (null)', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <AirportListItem
                    airport={airport}
                    airportAtc={null}
                    flights={flights}
                    isExpanded={false}
                    onToggle={() => {}}
                />
            );
        });
        // Grey dot should have the unstaffed color
        expect(JSON.stringify(tree.toJSON())).toContain('#5A6370');
    });

    it('renders grey dot when no ATC (empty array)', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <AirportListItem
                    airport={airport}
                    airportAtc={[]}
                    flights={flights}
                    isExpanded={false}
                    onToggle={() => {}}
                />
            );
        });
        expect(JSON.stringify(tree.toJSON())).toContain('#5A6370');
    });

    it('renders traffic counts in trailing slot', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <AirportListItem
                    airport={airport}
                    airportAtc={airportAtcList}
                    flights={flights}
                    isExpanded={false}
                    onToggle={() => {}}
                />
            );
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('▲ 1');
        expect(json).toContain('▼ 1');
    });

    it('renders dashes when no flights data', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <AirportListItem
                    airport={airport}
                    airportAtc={airportAtcList}
                    flights={null}
                    isExpanded={false}
                    onToggle={() => {}}
                />
            );
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('▲ —');
        expect(json).toContain('▼ —');
    });
});

describe('AirportListItem — expand/collapse', () => {
    it('does NOT render AirportDetailCard when isExpanded is false', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <AirportListItem
                    airport={airport}
                    airportAtc={airportAtcList}
                    flights={flights}
                    isExpanded={false}
                    onToggle={() => {}}
                />
            );
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).not.toContain('airport-detail-card');
    });

    it('renders AirportDetailCard when isExpanded is true', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <AirportListItem
                    airport={airport}
                    airportAtc={airportAtcList}
                    flights={flights}
                    isExpanded={true}
                    onToggle={() => {}}
                />
            );
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('airport-detail-card');
    });
});
