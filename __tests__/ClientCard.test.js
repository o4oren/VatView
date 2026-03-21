import React from 'react';
import renderer, {act} from 'react-test-renderer';

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        isDark: false,
        activeTheme: {
            text: {primary: '#1F2328', secondary: '#656D76', muted: '#8B949E'},
            surface: {base: '#FFFFFF', elevated: 'rgba(255,255,255,0.5)', border: 'rgba(0,0,0,0.08)'},
            accent: {primary: '#2A6BC4'},
            pilot: {listIcon: '#2A6BC4'},
            atc: {
                badge: {
                    clearance: '#8b949e',
                    ground: '#1a7f37',
                    tower: '#bf8700',
                    approach: '#2a6bc4',
                    atis: '#0284c7',
                    ctr: '#1A7A6E',
                    fss: '#8250DF',
                },
            },
        },
    }),
}));

import ClientCard from '../app/components/vatsimListView/ClientCard';

const pilotWithFP = {
    callsign: 'BAW123',
    cid: 111,
    name: 'John Smith',
    altitude: 35000,
    groundspeed: 480,
    flight_plan: {aircraft_short: 'B738', departure: 'EGLL', arrival: 'KJFK', aircraft: 'B738'},
    facility: null,
};

const pilotNoFP = {
    callsign: 'DLH456',
    cid: 222,
    name: 'Hans Mueller',
    altitude: 12000,
    groundspeed: 300,
    flight_plan: null,
    facility: null,
};

const atcController = {
    callsign: 'EGLL_TWR',
    cid: 333,
    name: 'Jane Doe',
    frequency: '118.700',
    facility: 4,
    rating: 5,
    logon_time: '2024-01-01T00:00:00Z',
};

describe('ClientCard — pilot with flight plan', () => {
    it('renders callsign', () => {
        let tree;
        act(() => {
            tree = renderer.create(<ClientCard client={pilotWithFP} onPress={() => {}} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('BAW123');
    });

    it('renders pilot name', () => {
        let tree;
        act(() => {
            tree = renderer.create(<ClientCard client={pilotWithFP} onPress={() => {}} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('John Smith');
    });

    it('renders altitude as FL', () => {
        let tree;
        act(() => {
            tree = renderer.create(<ClientCard client={pilotWithFP} onPress={() => {}} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('FL350');
    });

    it('renders destination when flight plan present', () => {
        let tree;
        act(() => {
            tree = renderer.create(<ClientCard client={pilotWithFP} onPress={() => {}} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('KJFK');
    });

    it('renders plane icon ✈ in left slot', () => {
        let tree;
        act(() => {
            tree = renderer.create(<ClientCard client={pilotWithFP} onPress={() => {}} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('✈');
    });
});

describe('ClientCard — pilot without flight plan', () => {
    it('renders callsign', () => {
        let tree;
        act(() => {
            tree = renderer.create(<ClientCard client={pilotNoFP} onPress={() => {}} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('DLH456');
    });

    it('renders name without destination when no flight plan', () => {
        let tree;
        act(() => {
            tree = renderer.create(<ClientCard client={pilotNoFP} onPress={() => {}} />);
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('Hans Mueller');
        expect(json).not.toContain('→');
    });
});

describe('ClientCard — ATC controller', () => {
    it('renders ATC callsign', () => {
        let tree;
        act(() => {
            tree = renderer.create(<ClientCard client={atcController} onPress={() => {}} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('EGLL_TWR');
    });

    it('renders frequency in trailing slot', () => {
        let tree;
        act(() => {
            tree = renderer.create(<ClientCard client={atcController} onPress={() => {}} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('118.700');
    });

    it('renders facility short label in left slot', () => {
        let tree;
        act(() => {
            tree = renderer.create(<ClientCard client={atcController} onPress={() => {}} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('TWR');
    });

    it('renders controller name', () => {
        let tree;
        act(() => {
            tree = renderer.create(<ClientCard client={atcController} onPress={() => {}} />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('Jane Doe');
    });
});
