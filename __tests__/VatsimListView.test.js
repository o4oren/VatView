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
            bookings: [],
            prefiles: [],
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
            pilot: {listIcon: '#2A6BC4'},
            atc: {badge: {clearance: '#8b949e', ground: '#1a7f37', tower: '#bf8700', approach: '#2a6bc4', atis: '#0284c7', ctr: '#1A7A6E', fss: '#8250DF'}},
        },
    }),
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({navigate: jest.fn()}),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('@expo/vector-icons', () => ({
    MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

jest.mock('../app/components/shared/DatePickerModal', () => 'DatePickerModal');

const {useSelector} = require('react-redux');

import VatsimListView, {parseDeptime} from '../app/components/vatsimListView/VatsimListView';

afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
});

function mockState(overrides = {}) {
    const defaultVatsimLiveData = {
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
        bookings: [],
        prefiles: [],
    };
    return {
        vatsimLiveData: {...defaultVatsimLiveData, ...(overrides.vatsimLiveData || {})},
        app: {
            filters: {pilots: true, atc: true, searchQuery: ''},
            ...(overrides.app || {}),
        },
    };
}

describe('VatsimListView — renders pilots', () => {
    it('renders pilot callsign when pilots filter is true', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('BAW123');
    });

    it('does not render pilot when pilots filter is false', () => {
        useSelector.mockImplementation(selector => selector(mockState({
            app: {filters: {pilots: false, atc: true, searchQuery: ''}},
        })));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).not.toContain('BAW123');
    });
});

describe('VatsimListView — renders ATC', () => {
    it('renders ATC callsign when atc filter is true', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('EGLL_TWR');
    });

    it('does not render ATC when atc filter is false', () => {
        useSelector.mockImplementation(selector => selector(mockState({
            app: {filters: {pilots: true, atc: false, searchQuery: ''}},
        })));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).not.toContain('EGLL_TWR');
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
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('No matches for');
    });

    it('does not render empty state when searchQuery is empty', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).not.toContain('No matches for');
    });
});

describe('VatsimListView — controls', () => {
    it('renders search field placeholder', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const inputs = tree.root.findAllByType(require('react-native').TextInput);
        expect(inputs.length).toBeGreaterThan(0);
        expect(inputs[0].props.placeholder).toBe('Search callsign...');
    });

    it('renders Pilots filter button', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('Pilots');
    });

    it('renders ATC filter button', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('ATC');
    });
});

describe('VatsimListView — Live/Scheduled toggle', () => {
    it('renders Live and Scheduled toggle chips', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('Live');
        expect(text).toContain('Scheduled');
    });

    it('Live mode shows ClientCard items (pilots visible)', () => {
        useSelector.mockImplementation(selector => selector(mockState()));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('BAW123');
    });

    it('Scheduled mode shows booking callsign', () => {
        const bookingStart = new Date('2026-03-18T14:00:00Z');
        const bookingEnd = new Date('2026-03-18T16:00:00Z');
        useSelector.mockImplementation(selector => selector(mockState({
            vatsimLiveData: {
                clients: {pilots: [], airportAtc: {}, ctr: {}},
                bookings: [{
                    id: 1,
                    callsign: 'EGLL_APP',
                    start: bookingStart,
                    end: bookingEnd,
                    type: 'APP',
                    division: 'VATEUD',
                    subdivision: null,
                }],
                prefiles: [],
            },
        })));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const instance = tree.root;
        const scheduledPressable = instance.findAllByProps({accessibilityLabel: 'Scheduled mode'});
        expect(scheduledPressable.length).toBeGreaterThan(0);
        act(() => scheduledPressable[0].props.onPress());
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('EGLL_APP');
    });

    it('Scheduled mode shows prefile callsign and DEP→ARR airports', () => {
        // Include a booking so isScheduledLoaded becomes true via useEffect
        useSelector.mockImplementation(selector => selector(mockState({
            vatsimLiveData: {
                clients: {pilots: [], airportAtc: {}, ctr: {}},
                bookings: [{id: 99, callsign: 'INIT_BOOKING', start: new Date(), end: new Date(), type: 'TWR', division: null, subdivision: null}],
                prefiles: [{
                    callsign: 'VIR100',
                    cid: 999,
                    name: 'Test Pilot',
                    flight_plan: {
                        departure: 'EGLL',
                        arrival: 'KJFK',
                        aircraft: 'A359',
                        deptime: '1430',
                        ete: '0700',
                        route: 'ROUTE',
                        altitude: 'FL370',
                    },
                }],
            },
        })));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const instance = tree.root;
        const scheduledPressable = instance.findAllByProps({accessibilityLabel: 'Scheduled mode'});
        act(() => scheduledPressable[0].props.onPress());
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('VIR100');
        expect(text).toContain('EGLL');
        expect(text).toContain('KJFK');
    });

    it('Scheduled mode shows skeleton rows when bookings is empty and not yet loaded', () => {
        useSelector.mockImplementation(selector => selector(mockState({
            vatsimLiveData: {
                clients: {pilots: [], airportAtc: {}, ctr: {}},
                bookings: [],
                prefiles: [],
            },
        })));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const instance = tree.root;
        const scheduledPressable = instance.findAllByProps({accessibilityLabel: 'Scheduled mode'});
        act(() => scheduledPressable[0].props.onPress());
        // isScheduledLoaded is false initially (bookings empty, timer not fired)
        // Should NOT show "No scheduled traffic" yet
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).not.toContain('No scheduled traffic');
    });

    it('Scheduled mode shows empty state "No scheduled traffic" when loaded and no items', () => {
        // Render with a booking first so isScheduledLoaded becomes true
        useSelector.mockImplementation(selector => selector(mockState({
            vatsimLiveData: {
                clients: {pilots: [], airportAtc: {}, ctr: {}},
                bookings: [{id: 1, callsign: 'INIT', start: new Date(), end: new Date(), type: 'TWR', division: null, subdivision: null}],
                prefiles: [],
            },
        })));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        // Now update to empty bookings and switch to Scheduled mode
        useSelector.mockImplementation(selector => selector(mockState({
            vatsimLiveData: {
                clients: {pilots: [], airportAtc: {}, ctr: {}},
                bookings: [],
                prefiles: [],
            },
        })));
        act(() => {
            tree.update(<VatsimListView />);
        });
        const instance = tree.root;
        const scheduledPressable = instance.findAllByProps({accessibilityLabel: 'Scheduled mode'});
        act(() => scheduledPressable[0].props.onPress());
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('No scheduled traffic');
    });

    it('Search filters scheduled items by callsign prefix (case-insensitive)', () => {
        useSelector.mockImplementation(selector => selector(mockState({
            vatsimLiveData: {
                clients: {pilots: [], airportAtc: {}, ctr: {}},
                bookings: [
                    {id: 1, callsign: 'EGLL_APP', start: new Date(), end: new Date(), type: 'APP', division: null, subdivision: null},
                    {id: 2, callsign: 'EDDM_TWR', start: new Date(), end: new Date(), type: 'TWR', division: null, subdivision: null},
                ],
                prefiles: [],
            },
        })));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimListView />);
        });
        const instance = tree.root;
        const scheduledPressable = instance.findAllByProps({accessibilityLabel: 'Scheduled mode'});
        act(() => scheduledPressable[0].props.onPress());
        const textInputs = instance.findAllByType(require('react-native').TextInput);
        expect(textInputs.length).toBeGreaterThan(0);
        act(() => textInputs[0].props.onChangeText('egll'));
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('EGLL_APP');
        expect(text).not.toContain('EDDM_TWR');
    });
});

describe('parseDeptime', () => {
    it('returns 0 for undefined', () => {
        expect(parseDeptime(undefined)).toBe(0);
    });

    it('returns 0 for null', () => {
        expect(parseDeptime(null)).toBe(0);
    });

    it('returns 0 for empty string', () => {
        expect(parseDeptime('')).toBe(0);
    });

    it('returns a number for valid "HHMM" input', () => {
        const result = parseDeptime('1430');
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThan(0);
    });

    it('returns 0 for short string', () => {
        expect(parseDeptime('14')).toBe(0);
    });
});
