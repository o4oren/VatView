import React from 'react';
import renderer, {act} from 'react-test-renderer';

let mockDisclosureLevel = 1;

jest.mock('../app/components/detailPanel/DetailPanelProvider', () => ({
    useDetailPanel: () => ({
        disclosureLevel: mockDisclosureLevel,
        isOpen: true,
        open: jest.fn(),
        close: jest.fn(),
        selectedClient: null,
        sheetState: 'peek',
    }),
}));

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
    beforeEach(() => {
        mockDisclosureLevel = 1;
    });

    it('always renders PilotLevel1Summary', () => {
        let tree;
        act(() => {
            tree = renderer.create(<PilotDetails pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('SWR100');
        expect(allText).toContain('B738');
    });

    it('renders Level 2 when disclosureLevel >= 2', async () => {
        mockDisclosureLevel = 2;
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetails pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('HDG');
        expect(allText).toContain('285°');
    });

    it('does NOT render Level 2 at disclosureLevel 1', () => {
        mockDisclosureLevel = 1;
        let tree;
        act(() => {
            tree = renderer.create(<PilotDetails pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).not.toContain('HDG');
    });

    it('renders Level 3 when disclosureLevel >= 3', async () => {
        mockDisclosureLevel = 3;
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetails pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('SQUAWK');
        expect(allText).toContain('2200');
        expect(allText).toContain('CANADA');
    });

    it('does NOT render Level 3 at disclosureLevel 2', async () => {
        mockDisclosureLevel = 2;
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetails pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).not.toContain('SQUAWK');
    });

    it('all three levels render at disclosureLevel 3 (additive)', async () => {
        mockDisclosureLevel = 3;
        let tree;
        await act(async () => {
            tree = renderer.create(<PilotDetails pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        // Level 1
        expect(allText).toContain('SWR100');
        // Level 2
        expect(allText).toContain('HDG');
        // Level 3
        expect(allText).toContain('SQUAWK');
    });

    it('does not import react-native-paper', () => {
        // The module should have no Paper dependencies
        // If Paper were imported, it would throw since we haven't mocked it
        expect(() => {
            act(() => {
                renderer.create(<PilotDetails pilot={basePilot} />);
            });
        }).not.toThrow();
    });
});
