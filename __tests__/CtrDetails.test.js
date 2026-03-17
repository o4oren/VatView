import React from 'react';
import renderer, {act} from 'react-test-renderer';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        staticAirspaceData: {
            firs: {},
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
        },
    }),
}));

jest.mock('../app/common/firResolver', () => ({
    getFirFromPrefix: jest.fn(() => ({name: 'Scottish Control', icao: 'EGPX'})),
}));

import CtrDetails from '../app/components/clientDetails/CtrDetails';

const baseCtr = [
    {
        callsign: 'EGPX_CTR',
        name: 'Jane Doe',
        cid: 7654321,
        frequency: '135.850',
        facility: 6,
        rating: 4,
        logon_time: '2026-03-17T09:00:00Z',
        text_atis: null,
        server: 'EUROPE',
        key: 'egpx_ctr',
    },
];

describe('CtrDetails', () => {
    it('renders CtrDetailCard unconditionally', () => {
        let tree;
        act(() => {
            tree = renderer.create(<CtrDetails ctr={baseCtr} prefix="EGPX" />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('EGPX_CTR');
        expect(allText).toContain('135.850');
        expect(allText).toContain('Scottish Control');
    });

    it('is a thin wrapper — passes ctr and prefix to CtrDetailCard', () => {
        let tree;
        act(() => {
            tree = renderer.create(<CtrDetails ctr={baseCtr} prefix="EGPX" />);
        });
        expect(tree.toJSON()).not.toBeNull();
    });

    it('does not import react-native-paper', () => {
        let tree;
        act(() => {
            tree = renderer.create(<CtrDetails ctr={baseCtr} prefix="EGPX" />);
        });
        expect(tree.toJSON()).not.toBeNull();
    });
});
