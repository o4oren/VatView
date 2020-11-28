import React from 'react';
import renderer, {act} from 'react-test-renderer';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        staticAirspaceData: {
            firs: {
                EGPX: {name: 'Scottish Control', icao: 'EGPX'},
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
        },
    }),
}));

jest.mock('../app/common/firResolver', () => ({
    getFirFromPrefix: jest.fn(() => ({name: 'Scottish Control', icao: 'EGPX'})),
}));

import CtrDetailCard from '../app/components/clientDetails/CtrDetailCard';

const primaryController = {
    callsign: 'EGPX_CTR',
    name: 'Jane Doe',
    cid: 7654321,
    frequency: '135.850',
    facility: 6, // CTR
    rating: 4,   // C1
    logon_time: new Date(Date.now() - 1 * 60 * 60 * 1000 - 5 * 60 * 1000).toISOString(),
    text_atis: ['SCOTTISH INFO A', 'QNH 1015'],
    server: 'EUROPE',
    key: 'egpx_ctr',
};

const secondaryController = {
    callsign: 'EGPX_N_CTR',
    name: 'Bob Jones',
    cid: 2345678,
    frequency: '133.200',
    facility: 6,
    rating: 3,
    logon_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    text_atis: null,
    server: 'EUROPE',
    key: 'egpx_n_ctr',
};

describe('CtrDetailCard', () => {
    // Single controller case
    it('renders primary callsign at peek', () => {
        let tree;
        act(() => {
            tree = renderer.create(<CtrDetailCard ctr={[primaryController]} prefix="EGPX" />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('EGPX_CTR');
    });

    it('renders CTR facility label', () => {
        let tree;
        act(() => {
            tree = renderer.create(<CtrDetailCard ctr={[primaryController]} prefix="EGPX" />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('CTR');
    });

    it('renders sector name from firResolver', () => {
        let tree;
        act(() => {
            tree = renderer.create(<CtrDetailCard ctr={[primaryController]} prefix="EGPX" />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('Scottish Control');
    });

    it('renders primary frequency at peek', () => {
        let tree;
        act(() => {
            tree = renderer.create(<CtrDetailCard ctr={[primaryController]} prefix="EGPX" />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('135.850');
    });

    it('renders primary controller name and CID', () => {
        let tree;
        act(() => {
            tree = renderer.create(<CtrDetailCard ctr={[primaryController]} prefix="EGPX" />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('Jane Doe');
        expect(allText).toContain('7654321');
    });

    it('renders rating label', () => {
        let tree;
        act(() => {
            tree = renderer.create(<CtrDetailCard ctr={[primaryController]} prefix="EGPX" />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('C1');
        expect(allText).toContain('RATING');
    });

    it('renders time online', () => {
        let tree;
        act(() => {
            tree = renderer.create(<CtrDetailCard ctr={[primaryController]} prefix="EGPX" />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('1h');
        expect(allText).toContain('ONLINE');
    });

    // Multiple controllers case
    it('renders all controllers in list', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <CtrDetailCard ctr={[primaryController, secondaryController]} prefix="EGPX" />
            );
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('EGPX_CTR');
        expect(allText).toContain('EGPX_N_CTR');
        expect(allText).toContain('133.200');
        expect(allText).toContain('CONTROLLERS');
    });

    // ATIS in full section
    it('renders ATIS text for controllers that have it', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <CtrDetailCard ctr={[primaryController, secondaryController]} prefix="EGPX" />
            );
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('SCOTTISH INFO A');
        expect(allText).toContain('QNH 1015');
        expect(allText).toContain('EGPX_CTR ATIS');
    });

    it('does not render ATIS section for controllers without ATIS', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <CtrDetailCard ctr={[primaryController, secondaryController]} prefix="EGPX" />
            );
        });
        const allText = JSON.stringify(tree.toJSON());
        // secondaryController has no ATIS so its ATIS label should not appear
        expect(allText).not.toContain('EGPX_N_CTR ATIS');
    });

    it('renders remarks section when remarks are present in ATIS', () => {
        const primaryWithRemarks = {
            ...primaryController,
            text_atis: ['SCOTTISH INFO A', 'REMARKS: TXY B CLSD']
        };
        let tree;
        act(() => {
            tree = renderer.create(
                <CtrDetailCard ctr={[primaryWithRemarks]} prefix="EGPX" />
            );
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('EGPX_CTR REMARKS');
        expect(allText).toContain('TXY B CLSD');
    });

    it('returns null and does not crash when ctr array is empty', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <CtrDetailCard ctr={[]} prefix="EGPX" />
            );
        });
        expect(tree.toJSON()).toBeNull();
    });

    it('falls back to prefix when FIR not found', () => {
        const {getFirFromPrefix} = require('../app/common/firResolver');
        getFirFromPrefix.mockReturnValueOnce(null);
        let tree;
        act(() => {
            tree = renderer.create(<CtrDetailCard ctr={[primaryController]} prefix="UNKN" />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('UNKN');
    });

    it('renders single controller with all content', () => {
        let tree;
        act(() => {
            tree = renderer.create(<CtrDetailCard ctr={[primaryController]} prefix="EGPX" />);
        });
        expect(tree.toJSON()).not.toBeNull();
    });
});
