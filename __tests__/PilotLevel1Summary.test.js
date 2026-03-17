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

import PilotLevel1Summary from '../app/components/clientDetails/PilotLevel1Summary';

const basePilot = {
    callsign: 'SWR100',
    name: 'John Doe',
    cid: 1234567,
    altitude: 35000,
    groundspeed: 450,
    heading: 285,
    latitude: 51.0,
    longitude: -0.5,
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
        cruise_tas: 450,
    },
};

describe('PilotLevel1Summary', () => {
    it('renders callsign, aircraft, route, alt and speed', () => {
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel1Summary pilot={basePilot} />);
        });
        const json = tree.toJSON();
        const allText = JSON.stringify(json);

        expect(allText).toContain('SWR100');
        expect(allText).toContain('B738');
        expect(allText).toContain('KJFK');
        expect(allText).toContain('EGLL');
        expect(allText).toContain('35,000');
        expect(allText).toContain('450');
        expect(allText).toContain('ft');
        expect(allText).toContain('kts');
    });

    it('renders pilot name and CID', () => {
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel1Summary pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('John Doe');
        expect(allText).toContain('1234567');
    });

    it('has accessibilityLabel with semantic description', () => {
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel1Summary pilot={basePilot} />);
        });
        const root = tree.toJSON();
        const label = root.props.accessibilityLabel;

        expect(label).toContain('Pilot SWR100');
        expect(label).toContain('B738');
        expect(label).toContain('KJFK');
        expect(label).toContain('EGLL');
        expect(label).toContain('feet');
        expect(label).toContain('knots');
    });

    it('handles missing flight_plan gracefully', () => {
        const pilot = {...basePilot, flight_plan: null};
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel1Summary pilot={pilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('SWR100');
        expect(allText).toContain('No flight plan filed');
    });

    it('renders airline logo when available', () => {
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel1Summary pilot={basePilot} />);
        });
        const json = tree.toJSON();
        const allText = JSON.stringify(json);
        // Image component should be present (source=1 from mock)
        expect(allText).toContain('"source":1');
    });
});
