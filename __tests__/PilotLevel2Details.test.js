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

jest.mock('../app/common/staticDataAcessLayer', () => ({
    getAirportsByICAOAsync: jest.fn(() => Promise.resolve([
        {icao: 'KJFK', name: 'John F Kennedy Intl', latitude: 40.6399, longitude: -73.7787},
        {icao: 'EGLL', name: 'London Heathrow', latitude: 51.4706, longitude: -0.4619},
    ])),
}));

jest.mock('../app/common/timeDIstanceTools', () => ({
    getDistanceFromLatLonInNm: jest.fn((p1, p2) => {
        // Simple mock: return different values based on inputs
        if (Math.abs(p1.lat - 40.6399) < 0.01 && Math.abs(p2.lat - 51.4706) < 0.01) {
            return 3000; // total distance
        }
        if (Math.abs(p1.lat - 40.6399) < 0.01 && Math.abs(p2.lat - 48.0) < 1) {
            return 1500; // flown distance
        }
        return 1500;
    }),
}));

import PilotLevel2Details from '../app/components/clientDetails/PilotLevel2Details';

const basePilot = {
    callsign: 'SWR100',
    latitude: 48.0,
    longitude: -30.0,
    heading: 285,
    groundspeed: 450,
    flight_plan: {
        aircraft_short: 'B738',
        departure: 'KJFK',
        arrival: 'EGLL',
        route: 'HAPIE3 HAPIE DCT ALLRY',
        enroute_time: 420,
        flight_rules: 'I',
    },
};

describe('PilotLevel2Details', () => {
    it('renders heading', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotLevel2Details pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('285°');
        expect(allText).toContain('HDG');
    });

    it('renders distances after airport data loads', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotLevel2Details pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('3000 nm');
        expect(allText).toContain('DIST');
    });

    it('renders route text', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotLevel2Details pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('HAPIE3 HAPIE DCT ALLRY');
    });

    it('renders enroute time formatted', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotLevel2Details pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('7h 0m');
    });

    it('renders progress bar with percentage', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotLevel2Details pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('50%');
        expect(allText).toContain('KJFK');
        expect(allText).toContain('EGLL');
    });

    it('returns null when no flight plan', () => {
        const pilot = {...basePilot, flight_plan: null};
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel2Details pilot={pilot} />);
        });

        expect(tree.toJSON()).toBeNull();
    });

    it('handles missing airport data gracefully', async () => {
        const mockModule = require('../app/common/staticDataAcessLayer');
        mockModule.getAirportsByICAOAsync.mockResolvedValueOnce([]);

        let tree;
        await act(async () => {
            tree = renderer.create(<PilotLevel2Details pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        // Should still render heading even without airport data
        expect(allText).toContain('285°');
        // Should not contain distance fields
        expect(allText).not.toContain('DIST');
    });
});
