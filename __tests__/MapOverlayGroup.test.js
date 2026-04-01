import React from 'react';
import renderer, {act} from 'react-test-renderer';

let mockWidth = 390;
let mockHeight = 844;
let mockInsets = {top: 44, right: 0, bottom: 34, left: 0};
let mockOrientation = 'portrait';

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

jest.mock('../app/components/mapOverlay/FloatingFilterChips', () => 'FloatingFilterChips');
jest.mock('../app/components/shared/StaleIndicator', () => 'StaleIndicator');
jest.mock('../app/components/mapOverlay/CenterOnMeButton', () => 'CenterOnMeButton');
jest.mock('../app/components/detailPanel/SidePanel', () => ({
    PANEL_WIDTH_PHONE: 360,
    PANEL_WIDTH_TABLET: 400,
    TABLET_WIDTH_THRESHOLD: 768,
}));

import MapOverlayGroup from '../app/components/mapOverlay/MapOverlayGroup';

function getStaleIndicatorContainerStyle(tree) {
    // Find the stale indicator container View by nativeID
    const json = tree.toJSON();
    // Root view has absoluteFillObject children; stale container is the second child
    const children = json.children;
    // Second child is the stale indicator container
    const staleContainer = children[1];
    return staleContainer.props.style;
}

function flattenStyle(style) {
    if (Array.isArray(style)) {
        return Object.assign({}, ...style.map(s => (typeof s === 'object' && s !== null ? s : {})));
    }
    return style || {};
}

describe('MapOverlayGroup', () => {
    beforeEach(() => {
        mockWidth = 390;
        mockHeight = 844;
        mockInsets = {top: 44, right: 0, bottom: 34, left: 0};
        mockOrientation = 'portrait';
    });

    it('renders without crashing in portrait', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <MapOverlayGroup dataStatus='live' sheetState='closed' />
            );
        });
        expect(tree.toJSON()).not.toBeNull();
    });

    it('portrait: StaleIndicator right = insets.right + 16 (no panel offset)', () => {
        mockInsets = {top: 44, right: 0, bottom: 34, left: 0};
        mockOrientation = 'portrait';

        let tree;
        act(() => {
            tree = renderer.create(
                <MapOverlayGroup
                    dataStatus='live'
                    sheetState='closed'
                    orientation='portrait'
                    sidePanelVisible={false}
                />
            );
        });

        const style = flattenStyle(getStaleIndicatorContainerStyle(tree));
        expect(style.right).toBe(16); // insets.right(0) + 16
    });

    it('portrait: StaleIndicator top = insets.top + 16', () => {
        mockInsets = {top: 44, right: 0, bottom: 34, left: 0};
        mockOrientation = 'portrait';

        let tree;
        act(() => {
            tree = renderer.create(
                <MapOverlayGroup
                    dataStatus='live'
                    sheetState='closed'
                    orientation='portrait'
                    sidePanelVisible={false}
                />
            );
        });

        const style = flattenStyle(getStaleIndicatorContainerStyle(tree));
        expect(style.top).toBe(60); // 44 + 16
    });

    it('landscape + sidePanelVisible=true + phone: StaleIndicator right offset includes 360px panel', () => {
        mockWidth = 844;
        mockHeight = 390;
        mockInsets = {top: 0, right: 0, bottom: 21, left: 0};
        mockOrientation = 'landscape';

        let tree;
        act(() => {
            tree = renderer.create(
                <MapOverlayGroup
                    dataStatus='live'
                    sheetState='half'
                    orientation='landscape'
                    sidePanelVisible={true}
                />
            );
        });

        const style = flattenStyle(getStaleIndicatorContainerStyle(tree));
        // insets.right(0) + 16 + 360 (phone panel width, screenWidth 844 < 768 threshold? No, 844 >= 768)
        // screenWidth=844 >= 768 → PANEL_WIDTH_TABLET=400
        expect(style.right).toBe(416); // 0 + 16 + 400
    });

    it('landscape + sidePanelVisible=true + phone (width<768): right offset includes 360px panel', () => {
        mockWidth = 700;  // < 768 threshold
        mockHeight = 390;
        mockInsets = {top: 0, right: 0, bottom: 21, left: 0};
        mockOrientation = 'landscape';

        let tree;
        act(() => {
            tree = renderer.create(
                <MapOverlayGroup
                    dataStatus='live'
                    sheetState='half'
                    orientation='landscape'
                    sidePanelVisible={true}
                />
            );
        });

        const style = flattenStyle(getStaleIndicatorContainerStyle(tree));
        expect(style.right).toBe(376); // 0 + 16 + 360
    });

    it('landscape + sidePanelVisible=false: StaleIndicator right has no panel offset', () => {
        mockWidth = 844;
        mockHeight = 390;
        mockInsets = {top: 0, right: 0, bottom: 21, left: 0};
        mockOrientation = 'landscape';

        let tree;
        act(() => {
            tree = renderer.create(
                <MapOverlayGroup
                    dataStatus='live'
                    sheetState='closed'
                    orientation='landscape'
                    sidePanelVisible={false}
                />
            );
        });

        const style = flattenStyle(getStaleIndicatorContainerStyle(tree));
        expect(style.right).toBe(16); // no panel offset
    });

    it('portrait half: FilterChips topOffset=-8', () => {
        mockOrientation = 'portrait';

        let tree;
        act(() => {
            tree = renderer.create(
                <MapOverlayGroup
                    dataStatus='live'
                    sheetState='half'
                    orientation='portrait'
                    sidePanelVisible={false}
                />
            );
        });

        const json = tree.toJSON();
        const filterChipsContainer = json.children[0];
        const filterChips = filterChipsContainer.children[0];
        expect(filterChips.props.topOffset).toBe(-8);
        expect(filterChips.props.hidden).toBe(false);
    });

    it('portrait full: FilterChips hidden=true', () => {
        mockOrientation = 'portrait';

        let tree;
        act(() => {
            tree = renderer.create(
                <MapOverlayGroup
                    dataStatus='live'
                    sheetState='full'
                    orientation='portrait'
                    sidePanelVisible={false}
                />
            );
        });

        const json = tree.toJSON();
        const filterChipsContainer = json.children[0];
        const filterChips = filterChipsContainer.children[0];
        expect(filterChips.props.hidden).toBe(true);
    });

    it('landscape half: FilterChips topOffset=0, hidden=false (never full in landscape)', () => {
        mockOrientation = 'landscape';

        let tree;
        act(() => {
            tree = renderer.create(
                <MapOverlayGroup
                    dataStatus='live'
                    sheetState='half'
                    orientation='landscape'
                    sidePanelVisible={true}
                />
            );
        });

        const json = tree.toJSON();
        const filterChipsContainer = json.children[0];
        const filterChips = filterChipsContainer.children[0];
        expect(filterChips.props.topOffset).toBe(0);
        expect(filterChips.props.hidden).toBe(false);
    });

    it('portrait closed: FilterChips topOffset=0, hidden=false', () => {
        mockOrientation = 'portrait';

        let tree;
        act(() => {
            tree = renderer.create(
                <MapOverlayGroup
                    dataStatus='live'
                    sheetState='closed'
                    orientation='portrait'
                    sidePanelVisible={false}
                />
            );
        });

        const json = tree.toJSON();
        const filterChipsContainer = json.children[0];
        const filterChips = filterChipsContainer.children[0];
        expect(filterChips.props.topOffset).toBe(0);
        expect(filterChips.props.hidden).toBe(false);
    });

    it('uses default props: portrait behavior with no regressions', () => {
        let tree;
        act(() => {
            tree = renderer.create(<MapOverlayGroup />);
        });
        expect(tree.toJSON()).not.toBeNull();

        const style = flattenStyle(getStaleIndicatorContainerStyle(tree));
        expect(style.right).toBe(16); // no landscape panel offset
    });

    it('renders CenterOnMeButton with correct panelOffset in landscape with side panel', () => {
        mockWidth = 844;
        mockOrientation = 'landscape';

        let tree;
        act(() => {
            tree = renderer.create(
                <MapOverlayGroup
                    dataStatus="live"
                    sheetState="half"
                    orientation="landscape"
                    sidePanelVisible={true}
                />
            );
        });

        const json = tree.toJSON();
        const centerBtn = json.children.find(c => c.type === 'CenterOnMeButton');
        expect(centerBtn).toBeTruthy();
        expect(centerBtn.props.panelOffset).toBe(400); // PANEL_WIDTH_TABLET for width 844
    });
});
