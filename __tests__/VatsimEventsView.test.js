import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {TextInput} from 'react-native';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        vatsimLiveData: {events: []},
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

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({top: 44, bottom: 34, left: 0, right: 0}),
}));

jest.mock('../app/common/themeTokens', () => ({
    tokens: {
        fontFamily: {mono: 'monospace', monoMedium: 'monospace', sans: 'sans-serif'},
        radius: {md: 12, lg: 16},
        animation: {duration: {fast: 100, normal: 250}},
    },
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

jest.mock('../app/common/timeDIstanceTools', () => ({
    getDateFromUTCString: jest.fn(str => new Date(str)),
}));

jest.mock('../app/components/EventsView/EventListItem', () => {
    const {View, Text} = require('react-native');
    return function MockEventListItem({event}) {
        return <View><Text>{event.name}</Text></View>;
    };
});

const {useSelector} = require('react-redux');

import VatsimEventsView from '../app/components/EventsView/VatsimEventsView';

const sampleEvents = [
    {
        id: 1,
        name: 'Cross the Pond 2024',
        start_time: '2024-11-08 17:00:00',
        end_time: '2024-11-08 23:00:00',
        short_description: '<p>Short description</p>',
        description: '<p>Full description</p>',
        banner: 'https://cdn.vatsim.net/events/banner.jpg',
        airports: [{icao: 'EGLL', importance: 1}],
        routes: [{departure: 'EGLL', arrival: 'KJFK', route: 'NATB'}],
    },
    {
        id: 2,
        name: 'VATSIM Fly-In',
        start_time: '2024-12-01 10:00:00',
        end_time: '2024-12-01 14:00:00',
        short_description: '<p>Another event</p>',
        description: '<p>Details here</p>',
        banner: 'https://cdn.vatsim.net/events/banner2.jpg',
        airports: [{icao: 'KJFK', importance: 1}],
        routes: [],
    },
];

afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
});

describe('VatsimEventsView', () => {
    test('renders TextInput with placeholder "Event name or airport"', () => {
        let tree;
        act(() => {
            tree = renderer.create(<VatsimEventsView />);
        });
        const inputs = tree.root.findAllByType(TextInput);
        expect(inputs.length).toBeGreaterThan(0);
        expect(inputs[0].props.placeholder).toBe('Event name or airport');
    });

    test('renders skeleton rows when events is empty on mount (before 2s timeout)', () => {
        jest.useFakeTimers();
        useSelector.mockImplementation(selector => selector({
            vatsimLiveData: {events: []},
        }));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimEventsView />);
        });
        const skeletonRows = tree.root.findAll(node => {
            if (!node.props.style) return false;
            const style = Array.isArray(node.props.style) 
                ? Object.assign({}, ...node.props.style) 
                : node.props.style;
            return style.opacity === 0.5;
        });
        expect(skeletonRows.length).toBeGreaterThan(0);
    });

    test('renders "No upcoming events" when base events array is empty and loaded (after 2s timeout)', () => {
        jest.useFakeTimers();
        useSelector.mockImplementation(selector => selector({
            vatsimLiveData: {events: []},
        }));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimEventsView />);
        });
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('No upcoming events');
    });

    test('renders event cards when events are available', () => {
        useSelector.mockImplementation(selector => selector({
            vatsimLiveData: {events: sampleEvents},
        }));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimEventsView />);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('Cross the Pond 2024');
        expect(text).toContain('VATSIM Fly-In');
    });

    test('shows "No matches for [query]" when search term filters to zero results', () => {
        useSelector.mockImplementation(selector => selector({
            vatsimLiveData: {events: sampleEvents},
        }));
        let tree;
        act(() => {
            tree = renderer.create(<VatsimEventsView />);
        });
        act(() => {
            tree.root.findAllByType(TextInput)[0].props.onChangeText('xyzxyzxyz');
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('No matches for');
    });
});
