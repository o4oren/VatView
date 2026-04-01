import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        activeTheme: {
            text: {primary: '#E6EDF3', secondary: '#8B949E', muted: '#484F58'},
            surface: {base: '#0D1117', elevated: 'rgba(22,27,34,0.45)', border: 'rgba(255,255,255,0.08)'},
            accent: {primary: '#5BA0E6'},
        },
    }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({top: 44, bottom: 34, left: 0, right: 0}),
}));

jest.mock('../app/common/themeTokens', () => ({
    tokens: {
        fontFamily: {mono: 'monospace', monoMedium: 'monospace', sans: 'sans-serif'},
        radius: {md: 12, lg: 16, xl: 24},
        animation: {duration: {fast: 100, normal: 250}},
    },
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
    const actual = jest.requireActual('react-redux');
    return {
        ...actual,
        useDispatch: () => mockDispatch,
    };
});

import MyVatsimSettings from '../app/components/settings/MyVatsimSettings';

const makeStore = (myCid = '', friendCids = []) =>
    createStore(() => ({app: {myCid, friendCids}}));

const renderScreen = (myCid = '', friendCids = []) => {
    const store = makeStore(myCid, friendCids);
    let tree;
    act(() => {
        tree = renderer.create(
            <Provider store={store}>
                <MyVatsimSettings />
            </Provider>
        );
    });
    return tree;
};

afterEach(() => jest.clearAllMocks());

describe('MyVatsimSettings', () => {
    it('renders without crashing', () => {
        const tree = renderScreen();
        expect(tree.toJSON()).not.toBeNull();
    });

    it('renders CID input pre-filled with myCid from Redux', () => {
        const tree = renderScreen('1234567', []);
        const input = tree.root.find(n => n.props.testID === 'cid-input');
        expect(input.props.value).toBe('1234567');
    });

    it('renders friend pills for each friendCid', () => {
        const tree = renderScreen('', ['9876543', '1122334']);
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('9876543');
        expect(json).toContain('1122334');
    });

    it('renders remove buttons for each friend', () => {
        const tree = renderScreen('', ['9876543']);
        const removeBtn = tree.root.find(n => n.props.testID === 'remove-friend-9876543');
        expect(removeBtn).toBeTruthy();
    });

    it('pressing remove friend dispatches saveFriendCids without that CID', () => {
        const tree = renderScreen('', ['9876543', '1122334']);
        const removeBtn = tree.root.find(n => n.props.testID === 'remove-friend-9876543');
        act(() => { removeBtn.props.onPress(); });
        expect(mockDispatch).toHaveBeenCalled();
    });

    it('add button dispatches saveFriendCids with new CID', () => {
        const tree = renderScreen('', []);
        const friendInput = tree.root.find(n => n.props.testID === 'friend-input');
        const addBtn = tree.root.find(n => n.props.testID === 'add-friend-btn');
        act(() => { friendInput.props.onChangeText('5566778'); });
        act(() => { addBtn.props.onPress(); });
        expect(mockDispatch).toHaveBeenCalled();
    });

    it('add button does not dispatch for non-numeric input', () => {
        const tree = renderScreen('', []);
        const friendInput = tree.root.find(n => n.props.testID === 'friend-input');
        const addBtn = tree.root.find(n => n.props.testID === 'add-friend-btn');
        act(() => { friendInput.props.onChangeText('notacid'); });
        act(() => { addBtn.props.onPress(); });
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('add button does not dispatch for duplicate CID', () => {
        const tree = renderScreen('', ['9876543']);
        const friendInput = tree.root.find(n => n.props.testID === 'friend-input');
        const addBtn = tree.root.find(n => n.props.testID === 'add-friend-btn');
        act(() => { friendInput.props.onChangeText('9876543'); });
        act(() => { addBtn.props.onPress(); });
        expect(mockDispatch).not.toHaveBeenCalled();
    });
});
