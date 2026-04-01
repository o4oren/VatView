import React from 'react';
import renderer, {act} from 'react-test-renderer';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
}));

const mockToggleTheme = jest.fn();

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        isDark: false,
        themePreference: 'system',
        toggleTheme: mockToggleTheme,
        activeTheme: {
            text: {primary: '#1F2328', secondary: '#656D76', muted: '#8B949E'},
            surface: {base: '#FFFFFF', elevated: 'rgba(255,255,255,0.5)', border: 'rgba(0,0,0,0.08)'},
            accent: {primary: '#2A6BC4'},
        },
    }),
}));

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        vatsimLiveData: {
            clients: {pilots: [{callsign: 'TEST123'}], controllerCount: 3},
            servers: [{name: 'USA-EAST', location: 'New York', hostname_or_ip: '192.0.2.1'}],
        },
        app: { pollingInterval: 60000, myCid: '', friendCids: [] },
    })),
    useDispatch: jest.fn(() => jest.fn()),
}));

jest.mock('expo-constants', () => ({
    __esModule: true,
    default: {expoConfig: {version: '2.0.0', sdkVersion: '52.0.0'}},
}));

jest.mock('expo-updates', () => ({
    channel: 'production',
    updateId: 'test-update-id',
}));

// Mock with unresolved promise to prevent unhandled promise rejections in tests
// that don't explicitly wait for it
jest.mock('../app/common/storageService', () => ({
    getReleaseTag: jest.fn(() => new Promise(resolve => {
        // Only resolve when explicitly advanced by jest timers or we just return a pre-resolved
        // promise that won't trigger the unhandled act warning if we don't await it
        resolve('v1.0.0');
    })),
    FIR_GEOJSON_RELEASE_TAG_KEY: 'firTag',
    TRACON_RELEASE_TAG_KEY: 'traconTag',
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

jest.mock('../app/components/shared/ThemePicker', () => {
    const React = require('react');
    const {View, Text, Pressable} = require('react-native');
    return function ThemePicker() {
        return (
            <View testID="theme-picker">
                {['system', 'dark', 'light'].map(val => (
                    <Pressable
                        key={val}
                        testID={`chip-${val}`}
                        accessibilityState={{selected: val === 'system'}}
                        onPress={() => mockToggleTheme(val)}
                    >
                        <Text>{val.charAt(0).toUpperCase() + val.slice(1)}</Text>
                    </Pressable>
                ))}
            </View>
        );
    };
});

import Settings from '../app/components/settings/Settings';

afterEach(() => {
    jest.clearAllMocks();
});

// Helper to render and wait for async effects
const renderSettings = async () => {
    let tree;
    await act(async () => {
        tree = renderer.create(<Settings />);
    });
    return tree;
};

describe('Settings', () => {
    test('renders without crashing', async () => {
        const tree = await renderSettings();
        expect(tree).toBeTruthy();
    });

    test('renders ThemePicker with three chips: System, Dark, Light', async () => {
        const tree = await renderSettings();
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('System');
        expect(json).toContain('Dark');
        expect(json).toContain('Light');
    });

    test('active chip corresponds to current themePreference (system)', async () => {
        const tree = await renderSettings();
        const systemChip = tree.root.findAll(
            node => node.props.testID === 'chip-system'
        );
        expect(systemChip.length).toBeGreaterThan(0);
        expect(systemChip[0].props.accessibilityState.selected).toBe(true);
        const darkChip = tree.root.findAll(
            node => node.props.testID === 'chip-dark'
        );
        expect(darkChip[0].props.accessibilityState.selected).toBe(false);
    });

    test('pressing a chip calls toggleTheme with the correct preference value', async () => {
        const tree = await renderSettings();
        const darkChip = tree.root.find(node => node.props.testID === 'chip-dark');
        await act(async () => {
            darkChip.props.onPress();
        });
        expect(mockToggleTheme).toHaveBeenCalledWith('dark');
    });

    test('About section renders VatView app name and attribution text', async () => {
        const tree = await renderSettings();
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('VatView');
        expect(json).toContain('Freepik');
        expect(json).toContain('VAT-Spy Data Project');
    });

    test('Network Status section renders pilot count from Redux state', async () => {
        const tree = await renderSettings();
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('Pilots');
        expect(json).toContain('1');
        expect(json).toContain('ATC');
        expect(json).toContain('3');
    });

    test('Version section renders app version and channel info', async () => {
        const tree = await renderSettings();
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('2.0.0');
        expect(json).toContain('52.0.0');
        expect(json).toContain('production');
    });

    test('renders "My VATSIM" row and navigates to MyVatsimSettings on press', async () => {
        const tree = await renderSettings();
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('My VATSIM');
        const navRow = tree.root.find(n => n.props.accessibilityLabel === 'My VATSIM settings');
        await act(async () => { navRow.props.onPress(); });
        expect(mockNavigate).toHaveBeenCalledWith('MyVatsimSettings');
    });
});
