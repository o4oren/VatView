import React from 'react';
import renderer, {act} from 'react-test-renderer';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        staticAirspaceData: {
            uirs: {
                KZOA: {name: 'Oakland Oceanic', firs: []},
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

import AtcDetailCard from '../app/components/clientDetails/AtcDetailCard';

const baseAtc = {
    callsign: 'EGLL_TWR',
    name: 'John Smith',
    cid: 1234567,
    frequency: '118.700',
    facility: 4, // TWR_ATIS
    rating: 5,   // C3
    logon_time: new Date(Date.now() - 2 * 60 * 60 * 1000 - 15 * 60 * 1000).toISOString(),
    text_atis: ['ATIS INFO A', 'RUNWAY 27L IN USE', 'QNH 1013'],
    server: 'USA-WEST',
    key: 'egll_twr',
};

describe('AtcDetailCard', () => {
    // Section 1: Peek content
    it('renders callsign at peek', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={baseAtc} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('EGLL_TWR');
    });

    it('renders frequency at peek', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={baseAtc} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('118.700');
    });

    it('renders facility short label at peek', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={baseAtc} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('TWR');
    });

    it('renders ATIS indicator dot when text_atis is present', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={baseAtc} />);
        });
        const json = JSON.stringify(tree.toJSON());
        // ATIS dot is a View with backgroundColor #4FC3F7
        expect(json).toContain('#4FC3F7');
    });

    it('does NOT render ATIS indicator dot when text_atis is empty', () => {
        const atc = {...baseAtc, text_atis: []};
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={atc} />);
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).not.toContain('#4FC3F7');
    });

    it('does NOT render ATIS indicator dot when text_atis is null', () => {
        const atc = {...baseAtc, text_atis: null};
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={atc} />);
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).not.toContain('#4FC3F7');
    });

    // Section 2: Half content
    it('renders controller name in full card', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={baseAtc} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('John Smith');
    });

    it('renders CID in full card', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={baseAtc} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('1234567');
    });

    it('renders ATC rating label', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={baseAtc} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('C3');
        expect(JSON.stringify(tree.toJSON())).toContain('RATING');
    });

    it('renders time online', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={baseAtc} />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('2h');
        expect(allText).toContain('ONLINE');
    });

    it('renders first ATIS line when present', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={baseAtc} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('ATIS INFO A');
    });

    // Section 3: Full content
    it('renders full ATIS text', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={baseAtc} />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('RUNWAY 27L IN USE');
        expect(allText).toContain('QNH 1013');
        expect(allText).toContain('FULL ATIS');
    });

    // Edge cases
    it('handles missing ATIS gracefully — omits ATIS sections', () => {
        const atc = {...baseAtc, text_atis: null};
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={atc} />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).not.toContain('ATIS INFO A');
        expect(allText).not.toContain('FULL ATIS');
    });

    it('test missing remarks omits remarks section', () => {
        const atc = {...baseAtc}; // baseAtc has no remarks
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={atc} />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).not.toContain('REMARKS');
    });

    it('renders remarks section when remarks are present in ATIS', () => {
        const atc = {...baseAtc, text_atis: ['ATIS INFO A', 'REMARKS: TXY B CLSD']};
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={atc} />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).toContain('REMARKS');
        expect(allText).toContain('TXY B CLSD');
    });

    it('handles empty ATIS array gracefully — omits ATIS sections', () => {
        const atc = {...baseAtc, text_atis: []};
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={atc} />);
        });
        const allText = JSON.stringify(tree.toJSON());
        expect(allText).not.toContain('FULL ATIS');
    });

    it('renders FSS sector name from uirs', () => {
        const atc = {
            ...baseAtc,
            callsign: 'KZOA_FSS',
            facility: 1, // FSS
        };
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={atc} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('Oakland Oceanic');
    });

    it('does NOT render sector name for non-FSS facilities', () => {
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={baseAtc} />); // facility=4 (TWR)
        });
        expect(JSON.stringify(tree.toJSON())).not.toContain('Oakland Oceanic');
    });

    it('renders without crashing when logon_time is missing', () => {
        const atc = {...baseAtc, logon_time: null};
        let tree;
        act(() => {
            tree = renderer.create(<AtcDetailCard atc={atc} />);
        });
        expect(tree.toJSON()).not.toBeNull();
    });
});
