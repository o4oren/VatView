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

import PilotLevel3Full from '../app/components/clientDetails/PilotLevel3Full';

const basePilot = {
    callsign: 'SWR100',
    transponder: '2200',
    server: 'CANADA',
    pilot_rating: 4,
    logon_time: new Date(Date.now() - 2 * 60 * 60 * 1000 - 34 * 60 * 1000).toISOString(), // 2h 34m ago
    flight_plan: {
        aircraft_short: 'B738',
        departure: 'KJFK',
        arrival: 'EGLL',
        route: 'HAPIE3 HAPIE DCT ALLRY N130A RESNO',
        remarks: '/v/ PBN/A1B2',
        flight_rules: 'I',
    },
};

describe('PilotLevel3Full', () => {
    it('renders transponder code', () => {
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel3Full pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('2200');
        expect(allText).toContain('SQUAWK');
    });

    it('renders server info', () => {
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel3Full pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('CANADA');
        expect(allText).toContain('SERVER');
    });

    it('renders remarks', () => {
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel3Full pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('/v/ PBN/A1B2');
        expect(allText).toContain('REMARKS');
    });

    it('renders time online as human-readable duration', () => {
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel3Full pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('2h');
        expect(allText).toContain('ONLINE');
    });

    it('renders pilot rating label', () => {
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel3Full pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('ATPL');
        expect(allText).toContain('RATING');
    });

    it('renders flight rules IFR', () => {
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel3Full pilot={basePilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('IFR');
        expect(allText).toContain('RULES');
    });

    it('renders VFR flight rules', () => {
        const pilot = {
            ...basePilot,
            flight_plan: {...basePilot.flight_plan, flight_rules: 'V'},
        };
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel3Full pilot={pilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).toContain('VFR');
    });

    it('handles missing remarks gracefully', () => {
        const pilot = {
            ...basePilot,
            flight_plan: {...basePilot.flight_plan, remarks: null},
        };
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel3Full pilot={pilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        expect(allText).not.toContain('REMARKS');
    });

    it('handles no flight plan', () => {
        const pilot = {...basePilot, flight_plan: null};
        let tree;
        act(() => {
            tree = renderer.create(<PilotLevel3Full pilot={pilot} />);
        });
        const allText = JSON.stringify(tree.toJSON());

        // Should still render transponder, server, rating, online time
        expect(allText).toContain('2200');
        expect(allText).toContain('CANADA');
        expect(allText).not.toContain('FLIGHT PLAN');
        expect(allText).not.toContain('RULES');
    });
});
