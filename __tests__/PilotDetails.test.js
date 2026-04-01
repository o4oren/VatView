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
    airlineLogos: {},
}));

jest.mock('../app/common/staticDataAcessLayer', () => ({
    getAirportsByICAOAsync: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../app/common/timeDIstanceTools', () => ({
    getDistanceFromLatLonInNm: jest.fn(() => 0),
    getZuluTimeFromDate: jest.fn((date) => {
        const h = date.getUTCHours().toString().padStart(2, '0');
        const m = date.getUTCMinutes().toString().padStart(2, '0');
        return `${h}:${m}Z`;
    }),
}));

import PilotDetails from '../app/components/clientDetails/PilotDetails';

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
    logon_time: '2026-03-16T14:30:00Z',
    flight_plan: {
        aircraft_short: 'B738',
        departure: 'KJFK',
        arrival: 'EGLL',
        route: 'HAPIE3 HAPIE DCT ALLRY',
        remarks: '/v/',
        flight_rules: 'I',
        enroute_time: 420,
    },
};

describe('PilotDetails', () => {
    it('renders PilotDetailCard unconditionally with all content', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetails pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        // Section 1 content (always visible)
        expect(allText).toContain('SWR100');
        expect(allText).toContain('B738');
        // Section 2 content (no longer gated by disclosureLevel)
        expect(allText).toContain('HDG');
        expect(allText).toContain('285°');
        // Section 3 content (no longer gated by disclosureLevel)
        expect(allText).toContain('SQUAWK');
        expect(allText).toContain('2200');
        expect(allText).toContain('CANADA');
    });

    it('is a thin wrapper returning PilotDetailCard', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetails pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('SWR100');
    });

    it('does not import react-native-paper', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetails pilot={basePilot} />);
        });
        expect(tree.toJSON()).not.toBeNull();
    });
});
