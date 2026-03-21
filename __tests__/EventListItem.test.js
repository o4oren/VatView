import React from 'react';
import renderer, {act} from 'react-test-renderer';

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

jest.mock('../app/common/themeTokens', () => ({
    tokens: {
        fontFamily: {mono: 'monospace', monoMedium: 'monospace', sans: 'sans-serif'},
        radius: {md: 12, lg: 16},
        animation: {duration: {fast: 100, normal: 250}},
    },
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({navigate: mockNavigate}),
}));

jest.mock('../app/common/timeDIstanceTools', () => ({
    getDateFromUTCString: jest.fn(str => new Date(str)),
}));

import EventListItem from '../app/components/EventsView/EventListItem';

const sampleEvent = {
    id: 1,
    name: 'Cross the Pond 2024',
    start_time: '2024-11-08 17:00:00',
    end_time: '2024-11-08 23:00:00',
    short_description: '<p>Short description</p>',
    description: '<p>Full description</p>',
    banner: 'https://cdn.vatsim.net/events/banner.jpg',
    airports: [{icao: 'EGLL', importance: 1}],
    routes: [{departure: 'EGLL', arrival: 'KJFK', route: 'NATB'}],
};

afterEach(() => {
    jest.clearAllMocks();
});

describe('EventListItem', () => {
    test('renders event name', () => {
        let tree;
        act(() => {
            tree = renderer.create(<EventListItem event={sampleEvent} />);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('Cross the Pond 2024');
    });

    test('renders formatted start and end times', () => {
        let tree;
        act(() => {
            tree = renderer.create(<EventListItem event={sampleEvent} />);
        });
        const textNodes = tree.root.findAllByType('Text');
        const text = textNodes.map(n => n.props.children).join(' ');
        expect(text).toContain('Start:');
        expect(text).toContain('End:');
    });

    test('calls navigation.navigate with Event Details on press', () => {
        let tree;
        act(() => {
            tree = renderer.create(<EventListItem event={sampleEvent} />);
        });
        // Find first pressable component by props.onPress
        const all = tree.root.findAll(node => node.props && typeof node.props.onPress === 'function');
        expect(all.length).toBeGreaterThan(0);
        act(() => {
            all[0].props.onPress();
        });
        expect(mockNavigate).toHaveBeenCalledWith('Event Details', {event: sampleEvent});
    });
});
