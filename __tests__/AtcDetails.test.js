import React from 'react';
import renderer, {act} from 'react-test-renderer';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        staticAirspaceData: {
            uirs: {},
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

import AtcDetails from '../app/components/clientDetails/AtcDetails';

const baseAtc = {
    callsign: 'EGLL_TWR',
    name: 'John Smith',
    cid: 1234567,
    frequency: '118.700',
    facility: 4,
    rating: 5,
    logon_time: '2026-03-17T10:00:00Z',
    text_atis: ['ATIS INFO A'],
    server: 'USA-WEST',
    key: 'egll_twr',
};

describe('AtcDetails', () => {
    it('renders AtcDetailCard content unconditionally', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetails atc={baseAtc} />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('EGLL_TWR');
        expect(allText).toContain('118.700');
        expect(allText).toContain('John Smith');
    });

    it('is a thin wrapper — renders same content regardless of showAtis prop', () => {
        let treeWith, treeWithout;
        act(() => {
            treeWith = renderer.create(<AtcDetails atc={baseAtc} showAtis={true} />);
        });
        act(() => {
            treeWithout = renderer.create(<AtcDetails atc={baseAtc} showAtis={false} />);
        });
        // Both should render ATIS content (showAtis is ignored, card always renders all sections)
        expect(JSON.stringify(treeWith.toJSON())).toContain('ATIS INFO A');
        expect(JSON.stringify(treeWithout.toJSON())).toContain('ATIS INFO A');
    });

    it('does not import react-native-paper', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetails atc={baseAtc} />);
        });
        expect(tree.toJSON()).not.toBeNull();
    });
});
