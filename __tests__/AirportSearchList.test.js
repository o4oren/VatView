import React from 'react';
import renderer, {act} from 'react-test-renderer';

jest.mock('react-native/Libraries/Lists/FlatList', () => require('../__mocks__/MockFlatList'));

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() =>
        Promise.resolve({
            runAsync: jest.fn(),
            getAllSync: jest.fn(() => []),
            getFirstAsync: jest.fn(() => ({count: 0})),
        })
    ),
}));

jest.mock('../app/common/staticDataAcessLayer', () => ({
    getAirportsByICAOAsync: jest.fn(() =>
        Promise.resolve([
            {icao: 'EGLL', iata: 'LHR', name: 'Heathrow', latitude: 51.477, longitude: -0.461},
        ])
    ),
    findAirportsByCodeOrNamePrefixAsync: jest.fn(() => Promise.resolve([])),
}));

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector =>
        selector({
            vatsimLiveData: {
                clients: {
                    airportAtc: {
                        EGLL: [
                            {
                                callsign: 'EGLL_TWR',
                                facility: 4,
                                frequency: '118.700',
                                cid: 111,
                                name: 'Jane Doe',
                                rating: 5,
                                logon_time: '2024-01-01T00:00:00Z',
                            },
                        ],
                    },
                    pilots: [],
                },
                prefiles: [],
            },
            app: {filters: {pilots: true, atc: true, searchQuery: ''}},
        })
    ),
    useDispatch: jest.fn(() => jest.fn()),
}));

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        isDark: false,
        activeTheme: {
            text: {primary: '#1F2328', secondary: '#656D76', muted: '#8B949E'},
            surface: {base: '#FFFFFF', elevated: 'rgba(255,255,255,0.5)', border: 'rgba(0,0,0,0.08)'},
            accent: {primary: '#2A6BC4'},
            atc: {
                airportDotUnstaffed: '#5A6370',
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

jest.mock('../app/components/clientDetails/AirportDetailCard', () => {
    const {View} = require('react-native');
    return function MockAirportDetailCard({airport}) {
        return <View testID={`airport-detail-card-${airport?.icao || 'unknown'}`} />;
    };
});

// Mock tokens to avoid import issues
jest.mock('../app/common/themeTokens', () => ({
    tokens: {
        fontFamily: {mono: 'monospace'},
        animation: {duration: {fast: 100}},
    },
}));

// Mock shared components used in AirportListItem
jest.mock('../app/components/shared/ListItem', () => {
    const {Pressable, View} = require('react-native');
    return function MockListItem({leftSlot, title, subtitle, trailingSlot, onPress, accessibilityLabel}) {
        return (
            <Pressable onPress={onPress} accessibilityLabel={accessibilityLabel} testID="list-item">
                <View>{leftSlot}</View>
                <View testID="list-item-title">{title}</View>
                <View testID="list-item-subtitle">{subtitle}</View>
                <View>{trailingSlot}</View>
            </Pressable>
        );
    };
});

jest.mock('../app/components/shared/ThemedText', () => {
    const {Text} = require('react-native');
    return function MockThemedText({children, color, variant}) {
        return <Text style={{color}} data-variant={variant}>{children}</Text>;
    };
});

import {findAirportsByCodeOrNamePrefixAsync, getAirportsByICAOAsync} from '../app/common/staticDataAcessLayer';
import AirportListItem from '../app/components/airportView/AirportListItem';
import AirportSearchList from '../app/components/airportView/AirportSearchList';

describe('AirportSearchList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset mocks to defaults
        getAirportsByICAOAsync.mockResolvedValue([
            {icao: 'EGLL', iata: 'LHR', name: 'Heathrow', latitude: 51.477, longitude: -0.461},
        ]);
        findAirportsByCodeOrNamePrefixAsync.mockResolvedValue([]);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders TextInput search field', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<AirportSearchList />);
            await Promise.resolve();
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('Airport ICAO, IATA or name');
    });

    it('loads active airports on mount when search is empty', async () => {
        await act(async () => {
            renderer.create(<AirportSearchList />);
        });
        expect(getAirportsByICAOAsync).toHaveBeenCalledWith(['EGLL']);
    });

    it('shows "Type at least 3 characters" when 1-2 chars entered', async () => {
        let tree;
        await act(async () => {
            tree = renderer.create(<AirportSearchList />);
            await Promise.resolve();
        });

        // Find the TextInput and simulate typing 2 chars
        const root = tree.root;
        const textInput = root.findByProps({placeholder: 'Airport ICAO, IATA or name'});

        await act(async () => {
            textInput.props.onChangeText('EG');
        });

        expect(JSON.stringify(tree.toJSON())).toContain('Type at least 3 characters to search');
    });

    it('calls findAirportsByCodeOrNamePrefixAsync after 300ms debounce on ≥3-char input', async () => {
        jest.useFakeTimers();
        let tree;
        await act(async () => {
            tree = renderer.create(<AirportSearchList />);
            await Promise.resolve();
        });

        const root = tree.root;
        const textInput = root.findByProps({placeholder: 'Airport ICAO, IATA or name'});

        act(() => {
            textInput.props.onChangeText('EGL');
        });

        // Not yet called
        expect(findAirportsByCodeOrNamePrefixAsync).not.toHaveBeenCalled();

        // Advance timers
        await act(async () => {
            jest.advanceTimersByTime(300);
        });

        expect(findAirportsByCodeOrNamePrefixAsync).toHaveBeenCalledWith('EGL');
        jest.useRealTimers();
    });

    it('shows "No airports found" when results are empty for ≥3-char query', async () => {
        jest.useFakeTimers();
        findAirportsByCodeOrNamePrefixAsync.mockResolvedValue([]);

        let tree;
        await act(async () => {
            tree = renderer.create(<AirportSearchList />);
            await Promise.resolve();
        });

        const root = tree.root;
        const textInput = root.findByProps({placeholder: 'Airport ICAO, IATA or name'});

        await act(async () => {
            textInput.props.onChangeText('XYZ');
        });

        await act(async () => {
            jest.advanceTimersByTime(300);
            // Allow promises to resolve
            await Promise.resolve();
        });

        expect(JSON.stringify(tree.toJSON())).toContain('No airports found for XYZ');
    });

    it('expands only one airport row at a time', async () => {
        getAirportsByICAOAsync.mockResolvedValue([
            {icao: 'EGLL', iata: 'LHR', name: 'Heathrow', latitude: 51.477, longitude: -0.461},
            {icao: 'KJFK', iata: 'JFK', name: 'John F Kennedy', latitude: 40.6413, longitude: -73.7781},
        ]);

        let tree;
        await act(async () => {
            tree = renderer.create(<AirportSearchList />);
            await Promise.resolve();
        });

        const root = tree.root;
        const listItems = root.findAllByType(AirportListItem);
        expect(listItems).toHaveLength(2);

        await act(async () => {
            listItems[0].props.onToggle();
        });

        let updatedItems = root.findAllByType(AirportListItem);
        expect(updatedItems[0].props.isExpanded).toBe(true);
        expect(updatedItems[1].props.isExpanded).toBe(false);

        await act(async () => {
            updatedItems[1].props.onToggle();
        });

        updatedItems = root.findAllByType(AirportListItem);
        expect(updatedItems[0].props.isExpanded).toBe(false);
        expect(updatedItems[1].props.isExpanded).toBe(true);
    });
});
