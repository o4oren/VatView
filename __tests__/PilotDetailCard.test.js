import React from 'react';
import renderer, {act} from 'react-test-renderer';

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        isDark: false,
        activeTheme: {
            text: {primary: '#1F2328', secondary: '#656D76', muted: '#8B949E'},
            surface: {border: 'rgba(0,0,0,0.08)'},
            accent: {primary: '#2A6BC4'},
        },
    }),
}));

jest.mock('../app/common/airlineLogos', () => ({
    airlineLogos: {
        SWR: 1,
    },
}));

jest.mock('../app/common/staticDataAcessLayer', () => ({
    getAirportsByICAOAsync: jest.fn(() => Promise.resolve([
        {icao: 'KJFK', name: 'John F Kennedy Intl', latitude: 40.6399, longitude: -73.7787},
        {icao: 'EGLL', name: 'London Heathrow', latitude: 51.4706, longitude: -0.4619},
    ])),
}));

jest.mock('../app/common/timeDIstanceTools', () => ({
    getDistanceFromLatLonInNm: jest.fn((p1, p2) => {
        if (Math.abs(p1.lat - 40.6399) < 0.01 && Math.abs(p2.lat - 51.4706) < 0.01) {
            return 3000;
        }
        if (Math.abs(p1.lat - 40.6399) < 0.01 && Math.abs(p2.lat - 48.0) < 1) {
            return 1500;
        }
        return 1500;
    }),
    getZuluTimeFromDate: jest.fn((date) => {
        const h = date.getUTCHours().toString().padStart(2, '0');
        const m = date.getUTCMinutes().toString().padStart(2, '0');
        return `${h}:${m}Z`;
    }),
}));

import PilotDetailCard from '../app/components/clientDetails/PilotDetailCard';

const basePilot = {
    callsign: 'SWR100',
    name: 'John Doe',
    cid: 1234567,
    altitude: 35000,
    groundspeed: 450,
    heading: 285,
    latitude: 48.0,
    longitude: -30.0,
    transponder: '2200',
    server: 'CANADA',
    pilot_rating: 4,
    logon_time: new Date(Date.now() - 2 * 60 * 60 * 1000 - 34 * 60 * 1000).toISOString(),
    flight_plan: {
        aircraft_short: 'B738',
        departure: 'KJFK',
        arrival: 'EGLL',
        route: 'HAPIE3 HAPIE DCT ALLRY',
        remarks: '/v/ PBN/A1B2',
        flight_rules: 'I',
        enroute_time: 420,
    },
};

describe('PilotDetailCard', () => {
    // Section 1: Peek content
    it('renders callsign, aircraft, route, alt and speed', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('SWR100');
        expect(allText).toContain('B738');
        expect(allText).toContain('KJFK');
        expect(allText).toContain('EGLL');
        expect(allText).toContain('35,000');
        expect(allText).toContain('450');
        expect(allText).toContain('ft');
        expect(allText).toContain('kts');
    });

    it('renders pilot name and CID', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('John Doe');
        expect(allText).toContain('1234567');
    });

    it('renders airline logo when available', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('"source":1');
    });

    it('has accessibilityLabel with semantic description', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const root = tree.toJSON();
        const label = root.children[0].props.accessibilityLabel;

        expect(label).toContain('Pilot SWR100');
        expect(label).toContain('B738');
        expect(label).toContain('KJFK');
        expect(label).toContain('EGLL');
        expect(label).toContain('feet');
        expect(label).toContain('knots');
    });

    // Section 2: Half content
    it('renders heading in data grid', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('285°');
        expect(allText).toContain('HDG');
    });

    it('renders distances after airport data loads', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('3000 nm');
        expect(allText).toContain('DIST');
    });

    it('renders progress bar with percentage', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('50%');
        expect(allText).toContain('KJFK');
        expect(allText).toContain('EGLL');
    });

    it('renders route text', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('HAPIE3 HAPIE DCT ALLRY');
        expect(allText).toContain('FLIGHT PLAN');
    });

    it('renders enroute time formatted', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        // ETE was replaced with ETA (zulu time); verify ETA label and format hh:mmZ
        expect(allText).toContain('ETA');
        expect(allText).toMatch(/\d{2}:\d{2}Z/);
    });

    // Section 3: Full content
    it('renders transponder code', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('2200');
        expect(allText).toContain('SQUAWK');
    });

    it('renders server info', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('CANADA');
        expect(allText).toContain('SERVER');
    });

    it('renders pilot rating label', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('ATPL');
        expect(allText).toContain('RATING');
    });

    it('renders flight rules IFR', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('IFR');
        expect(allText).toContain('RULES');
    });

    it('renders time online as human-readable duration', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('2h');
        expect(allText).toContain('ONLINE');
    });

    it('renders remarks', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('/v/ PBN/A1B2');
        expect(allText).toContain('REMARKS');
    });

    // Edge cases
    it('handles missing flight_plan gracefully', () => {
        const pilot = {...basePilot, flight_plan: null};
        let tree;
        act(() => {
            tree = renderer.create(<PilotDetailCard pilot={pilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('SWR100');
        expect(allText).toContain('No flight plan filed');
    });

    it('handles missing airport data gracefully', async () => {
        const mockModule = require('../app/common/staticDataAcessLayer');
        mockModule.getAirportsByICAOAsync.mockResolvedValueOnce([]);

        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('285°');
        expect(allText).not.toContain('DIST');
    });

    it('handles missing remarks gracefully', async () => {
        const pilot = {
            ...basePilot,
            flight_plan: {...basePilot.flight_plan, remarks: null},
        };
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={pilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).not.toContain('REMARKS');
    });

    it('renders VFR flight rules', async () => {
        const pilot = {
            ...basePilot,
            flight_plan: {...basePilot.flight_plan, flight_rules: 'V'},
        };
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetailCard pilot={pilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('VFR');
    });
});
