import React from 'react';
import renderer, {act} from 'react-test-renderer';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        vatsimLiveData: {
            clients: {
                pilots: [
                    {
                        callsign: 'BAW123',
                        cid: 111,
                        name: 'John Smith',
                        altitude: 35000,
                        groundspeed: 480,
                        flight_plan: {aircraft_short: 'B738', departure: 'EGLL', arrival: 'KJFK', aircraft: 'B738'},
                        facility: null,
                    },
                ],
                airportAtc: {
                    'EGLL': [
                        {
                            callsign: 'EGLL_TWR',
                            cid: 222,
                            name: 'Jane Doe',
                            frequency: '118.700',
                            facility: 4,
                            rating: 5,
                            logon_time: '2024-01-01T00:00:00Z',
                        },
                    ],
                },
                ctr: {},
            },
        },
        app: {
            filters: {pilots: true, atc: true, searchQuery: ''},
        },
    })),
    useDispatch: jest.fn(() => jest.fn()),
}));

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        isDark: false,
        activeTheme: {
            text: {primary: '#1F2328', secondary: '#656D76', muted: '#8B949E'},
            surface: {base: '#FFFFFF', elevated: 'rgba(255,255,255,0.5)', border: 'rgba(0,0,0,0.08)'},
            accent: {primary: '#2A6BC4'},
        },
    }),
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({navigate: jest.fn()}),
}));

const {useSelector} = require('react-redux');

import VatsimListView from '../app/components/vatsimListView/VatsimListView';

afterEach(() => {
    jest.clearAllMocks();
});

function mockState(overrides = {}) {
    const defaultState = {
        vatsimLiveData: {
            clients: {
                pilots: [
                    {
                        callsign: 'BAW123',
                        cid: 111,
                        name: 'John Smith',
                        altitude: 35000,
                        groundspeed: 480,
                        flight_plan: {aircraft_short: 'B738', departure: 'EGLL', arrival: 'KJFK', aircraft: 'B738'},
                        facility: null,
                    },
                ],
                airportAtc: {
                    'EGLL': [
                        {
                            callsign: 'EGLL_TWR',
                            cid: 222,
                            name: 'Jane Doe',
                            frequency: '118.700',
                            facility: 4,
                            rating: 5,
                            logon_time: '2024-01-01T00:00:00Z',
                        },
                    ],
                },
                ctr: {},
            },
        },
        app: {
            filters: {pilots: true, atc: true, searchQuery: ''},
            ...overrides.app,
        },
    };
    return {...defaultState, ...overrides};
}

describe('VatsimListView — renders pilots', () => {
    it('renders pilot callsign when pilots filter is true', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('BAW123');
    });

    it('does not render pilot when pilots filter is false', () => {
        useSelector.mockImplementation(selector => selector(mockState({
            app: {filters: {pilots: false, atc: true, searchQuery: ''}},
        })));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        expect(JSON.stringify(tree.toJSON())).not.toContain('BAW123');
    });
});

describe('VatsimListView — renders ATC', () => {
    it('renders ATC callsign when atc filter is true', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('EGLL_TWR');
    });

    it('does not render ATC when atc filter is false', () => {
        useSelector.mockImplementation(selector => selector(mockState({
            app: {filters: {pilots: true, atc: false, searchQuery: ''}},
        })));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        expect(JSON.stringify(tree.toJSON())).not.toContain('EGLL_TWR');
    });
});

describe('VatsimListView — empty state', () => {
    it('renders "No matches" when searchQuery returns no results', () => {
        useSelector.mockImplementation(selector => selector(mockState({
            app: {filters: {pilots: true, atc: true, searchQuery: 'ZZZZZZZ'}},
        })));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('No matches for');
    });

    it('does not render empty state when searchQuery is empty', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        expect(JSON.stringify(tree.toJSON())).not.toContain('No matches for');
    });
});

describe('VatsimListView — controls', () => {
    it('renders search field placeholder', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('Search callsign...');
    });

    it('renders Pilots filter button', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('Pilots');
    });

    it('renders ATC filter button', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        expect(JSON.stringify(tree.toJSON())).toContain('ATC');
    });
});
