import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {TextInput} from 'react-native';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(selector => selector({
        metar: {metar: {}},
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

jest.mock('../app/redux/actions', () => ({
    metarActions: {
        metarRequsted: jest.fn(icao => ({type: 'METAR_REQUESTED', payload: icao})),
    },
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({top: 44, bottom: 34, left: 0, right: 0}),
}));

jest.mock('../app/common/metarTools', () => ({
    translateCondition: jest.fn(code => code),
    translateCloudCode: jest.fn(code => code),
}));

jest.mock('../app/common/themeTokens', () => ({
    tokens: {
        fontFamily: {
            mono: 'monospace',
            monoMedium: 'monospace',
            sans: 'sans-serif',
        },
    },
}));

const {useSelector} = require('react-redux');
const allActions = require('../app/redux/actions');

import MetarView from '../app/components/MetarView/MetarView';

const mockRoute = {params: {}};

afterEach(() => {
    jest.clearAllMocks();
});

function mockMetarState(metarObj) {
    useSelector.mockImplementation(selector => selector({
        metar: {metar: metarObj},
    }));
}

const fullMetar = {
    icao: 'EGLL',
    raw_text: 'EGLL 181220Z 24015KT 9999 FEW020 13/07 Q1013 NOSIG',
    observed: new Date('2024-01-18T12:20:00Z'),
    flight_category: 'VFR',
    barometer: {hg: 29.91, mb: 1013},
    temperature: {celsius: 13, fahrenheit: 55.4},
    dewpoint: {celsius: 7, fahrenheit: 44.6},
    humidity_percent: 64,
    wind: {degrees: 240, speed_kts: 15, gust_kts: 15},
    visibility: {miles: '6+'},
    ceiling: null,
    clouds: [{code: 'FEW', base_feet_agl: 2000}],
    conditions: [],
};

describe('MetarView', () => {
    test('renders ICAO search TextInput with correct placeholder', () => {
        mockMetarState({});
        let tree;
        act(() => {
            tree = renderer.create(<MetarView route={mockRoute} />);
        });
        const inputs = tree.root.findAllByType(TextInput);
        expect(inputs.length).toBeGreaterThan(0);
        expect(inputs[0].props.placeholder).toBe('Airport ICAO');
    });

    test('renders "Loading..." when searchTerm is 4 chars and metar is empty', () => {
        mockMetarState({});
        let tree;
        act(() => {
            tree = renderer.create(<MetarView route={mockRoute} />);
        });
        act(() => {
            tree.root.findByType(TextInput).props.onChangeText('EGLL');
        });
        const json = tree.toJSON();
        const text = JSON.stringify(json);
        expect(text).toContain('Loading...');
    });

    test('renders "METAR unavailable for EGLL" when metar has no raw_text after settle', () => {
        mockMetarState({icao: 'EGLL'});
        let tree;
        act(() => {
            tree = renderer.create(<MetarView route={mockRoute} />);
        });
        act(() => {
            tree.root.findByType(TextInput).props.onChangeText('EGLL');
        });
        const json = tree.toJSON();
        const text = JSON.stringify(json);
        expect(text).toContain('METAR unavailable for EGLL');
    });

    test('renders raw METAR string when metar.raw_text is present (full data)', () => {
        mockMetarState(fullMetar);
        let tree;
        act(() => {
            tree = renderer.create(<MetarView route={mockRoute} />);
        });
        act(() => {
            tree.root.findByType(TextInput).props.onChangeText('EGLL');
        });
        const json = tree.toJSON();
        const text = JSON.stringify(json);
        expect(text).toContain('EGLL 181220Z 24015KT 9999 FEW020 13/07 Q1013 NOSIG');
    });

    test('renders decoded fields (flight category, altimeter, temperature) when full METAR available', () => {
        mockMetarState(fullMetar);
        let tree;
        act(() => {
            tree = renderer.create(<MetarView route={mockRoute} />);
        });
        act(() => {
            tree.root.findByType(TextInput).props.onChangeText('EGLL');
        });
        const json = tree.toJSON();
        const text = JSON.stringify(json);
        expect(text).toContain('VFR');
        expect(text).toContain('inHg');
        expect(text).toContain('°C');
    });

    test('renders "Unable to parse METAR string" when raw_text exists but barometer and temperature are missing', () => {
        const parseFailMetar = {
            icao: 'ZZZZ',
            raw_text: 'ZZZZ 181220Z AUTO /////KT /////// //////TCU ////// //////',
        };
        mockMetarState(parseFailMetar);
        let tree;
        act(() => {
            tree = renderer.create(<MetarView route={mockRoute} />);
        });
        act(() => {
            tree.root.findByType(TextInput).props.onChangeText('ZZZZ');
        });
        const json = tree.toJSON();
        const text = JSON.stringify(json);
        expect(text).toContain('Unable to parse METAR string');
        expect(text).toContain('ZZZZ 181220Z AUTO');
    });

    test('pre-fills search field and fires fetch when route.params.icao provided', () => {
        const dispatch = jest.fn();
        const {useDispatch} = require('react-redux');
        useDispatch.mockReturnValue(dispatch);
        mockMetarState({});
        const routeWithIcao = {params: {icao: 'KJFK'}};
        let tree;
        act(() => {
            tree = renderer.create(<MetarView route={routeWithIcao} />);
        });
        expect(tree.root.findByType(TextInput).props.value).toBe('KJFK');
        expect(allActions.metarActions.metarRequsted).toHaveBeenCalledWith('KJFK');
        expect(dispatch).toHaveBeenCalled();
    });

    test('does not show Loading... when searchTerm is fewer than 4 chars', () => {
        mockMetarState({});
        let tree;
        act(() => {
            tree = renderer.create(<MetarView route={mockRoute} />);
        });
        act(() => {
            tree.root.findByType(TextInput).props.onChangeText('EGL');
        });
        const json = tree.toJSON();
        const text = JSON.stringify(json);
        expect(text).not.toContain('Loading...');
    });
});
