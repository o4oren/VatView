import React from 'react';
import renderer, {act} from 'react-test-renderer';

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        activeTheme: {
            surface: {base: '#FFFFFF'},
            accent: {primary: '#2A6BC4'},
            text: {primary: '#1F2328', secondary: '#656D76'},
        },
    }),
}));

const mockUseSelector = jest.fn();
jest.mock('react-redux', () => ({
    useSelector: (selector) => mockUseSelector(selector),
}));

jest.mock('../app/common/themeTokens', () => ({
    tokens: {
        fontFamily: {mono: 'monospace', monoMedium: 'monospace', sans: 'sans-serif'},
        radius: {md: 12, lg: 16},
        animation: {duration: {fast: 100, normal: 250}},
    },
}));

import LoadingView from '../app/components/LoadingView/LoadingView';

afterEach(() => {
    jest.clearAllMocks();
});

describe('LoadingView', () => {
    test('renders without crashing', async () => {
        mockUseSelector.mockImplementation(selector =>
            selector({app: {loadingDb: {airports: 0, firs: 0}}})
        );
        let tree;
        await act(async () => {
            tree = renderer.create(<LoadingView />);
        });
        expect(tree).toBeTruthy();
    });

    test('progress indicator shown when airports + firs < 17500', async () => {
        mockUseSelector.mockImplementation(selector =>
            selector({app: {loadingDb: {airports: 0, firs: 0}}})
        );
        let tree;
        await act(async () => {
            tree = renderer.create(<LoadingView />);
        });
        const json = JSON.stringify(tree.toJSON());
        // ActivityIndicator has type "ActivityIndicator" in the rendered tree
        expect(json).toContain('ActivityIndicator');
    });

    test('progress indicator NOT shown when airports + firs >= 17500', async () => {
        mockUseSelector.mockImplementation(selector =>
            selector({app: {loadingDb: {airports: 10000, firs: 7500}}})
        );
        let tree;
        await act(async () => {
            tree = renderer.create(<LoadingView />);
        });
        const root = tree.toJSON();
        const json = JSON.stringify(root);
        // ActivityIndicator should not be present in the tree
        expect(json).not.toContain('ActivityIndicator');
    });

    test('no react-native-paper components in rendered output', async () => {
        mockUseSelector.mockImplementation(selector =>
            selector({app: {loadingDb: {airports: 0, firs: 0}}})
        );
        let tree;
        await act(async () => {
            tree = renderer.create(<LoadingView />);
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).not.toContain('ProgressBar');
        expect(json).not.toContain('Avatar');
        expect(json).not.toContain('react-native-paper');
    });
});
