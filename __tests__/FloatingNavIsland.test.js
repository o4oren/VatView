import React from 'react';
import renderer, {act} from 'react-test-renderer';

let mockWidth = 390;
let mockHeight = 844;
let mockInsets = {top: 44, right: 0, bottom: 34, left: 0};
let mockOrientation = 'portrait';
let mockSelectedClient = null;

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: () => ({width: mockWidth, height: mockHeight, scale: 1, fontScale: 1}),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => mockInsets,
}));

jest.mock('../app/common/useOrientation', () => ({
    useOrientation: jest.fn().mockImplementation(() => mockOrientation),
}));

jest.mock('react-redux', () => ({
    useSelector: jest.fn((selector) => selector({ app: { selectedClient: mockSelectedClient } })),
}));

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        activeTheme: {
            accent: { primary: '#fff' },
            text: { secondary: '#ccc' },
        }
    })
}));

jest.mock('../app/common/analytics', () => ({
    logEvent: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
    MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

jest.mock('../app/common/TranslucentSurface', () => 'TranslucentSurface');

jest.mock('../app/components/detailPanel/SidePanel', () => ({
    PANEL_WIDTH_PHONE: 360,
    PANEL_WIDTH_TABLET: 400,
    TABLET_WIDTH_THRESHOLD: 768,
}));

import FloatingNavIsland from '../app/components/navigation/FloatingNavIsland';

function getWrapperStyle(tree) {
    const json = tree.toJSON();
    return json.props.style;
}

function flattenStyle(style) {
    if (Array.isArray(style)) {
        return Object.assign({}, ...style.map(s => (typeof s === 'object' && s !== null ? s : {})));
    }
    return style || {};
}

describe('FloatingNavIsland', () => {
    let mockState;
    let mockNavigation;

    beforeEach(() => {
        mockWidth = 390;
        mockHeight = 844;
        mockInsets = {top: 44, right: 0, bottom: 34, left: 0};
        mockOrientation = 'portrait';
        mockSelectedClient = null;
        
        mockState = {
            routes: [{ name: 'Map' }],
            index: 0,
        };
        mockNavigation = {
            navigate: jest.fn(),
        };
    });

    it('renders correctly', () => {
        let tree;
        act(() => {
            tree = renderer.create(<FloatingNavIsland state={mockState} navigation={mockNavigation} />);
        });
        expect(tree.toJSON()).not.toBeNull();
    });

    it('portrait: wrapper right offset is 0', () => {
        mockOrientation = 'portrait';
        mockSelectedClient = { cid: 123456 }; // Should still be 0 in portrait
        
        let tree;
        act(() => {
            tree = renderer.create(<FloatingNavIsland state={mockState} navigation={mockNavigation} />);
        });

        const style = flattenStyle(getWrapperStyle(tree));
        expect(style.right).toBe(0);
    });

    it('landscape but map tab not focused: wrapper right offset is 0', () => {
        mockOrientation = 'landscape';
        mockSelectedClient = { cid: 123456 };
        mockState.routes[0].name = 'List'; // Not Map
        
        let tree;
        act(() => {
            tree = renderer.create(<FloatingNavIsland state={mockState} navigation={mockNavigation} />);
        });

        const style = flattenStyle(getWrapperStyle(tree));
        expect(style.right).toBe(0);
    });

    it('landscape on map tab but no client selected: wrapper right offset is 0', () => {
        mockOrientation = 'landscape';
        mockSelectedClient = null; // No client selected
        
        let tree;
        act(() => {
            tree = renderer.create(<FloatingNavIsland state={mockState} navigation={mockNavigation} />);
        });

        const style = flattenStyle(getWrapperStyle(tree));
        expect(style.right).toBe(0);
    });

    it('landscape on map tab with client selected (tablet): wrapper right offset is 400', () => {
        mockOrientation = 'landscape';
        mockSelectedClient = { cid: 123456 };
        mockWidth = 1024; // Tablet width
        
        let tree;
        act(() => {
            tree = renderer.create(<FloatingNavIsland state={mockState} navigation={mockNavigation} />);
        });

        const style = flattenStyle(getWrapperStyle(tree));
        expect(style.right).toBe(400);
    });

    it('landscape on map tab with client selected (phone): wrapper right offset is 360', () => {
        mockOrientation = 'landscape';
        mockSelectedClient = { cid: 123456 };
        mockWidth = 700; // Phone width
        
        let tree;
        act(() => {
            tree = renderer.create(<FloatingNavIsland state={mockState} navigation={mockNavigation} />);
        });

        const style = flattenStyle(getWrapperStyle(tree));
        expect(style.right).toBe(360);
    });
});