import React from 'react';
import renderer, {act} from 'react-test-renderer';

let mockWidth = 390;
let mockHeight = 844;

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: () => ({width: mockWidth, height: mockHeight, scale: 1, fontScale: 1}),
}));

jest.mock('react-native-reanimated', () => ({
    useReducedMotion: jest.fn(() => false),
}));

jest.mock('../app/common/TranslucentSurface', () => 'TranslucentSurface');

jest.mock('../app/common/themeTokens', () => ({
    tokens: {
        animation: {duration: {fast: 150, normal: 250, slow: 400}},
    },
}));

import {useReducedMotion} from 'react-native-reanimated';
import SidePanel from '../app/components/detailPanel/SidePanel';

describe('SidePanel', () => {
    beforeEach(() => {
        mockWidth = 390;
        mockHeight = 844;
        useReducedMotion.mockReturnValue(false);
    });

    it('renders without crashing when visible=true', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <SidePanel visible={true}>
                    <></>
                </SidePanel>
            );
        });
        expect(tree.toJSON()).not.toBeNull();
    });

    it('renders (off-screen) when visible=false', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <SidePanel visible={false}>
                    <></>
                </SidePanel>
            );
        });
        // Component still renders (just translated off-screen), not null
        expect(tree.toJSON()).not.toBeNull();
    });

    it('uses 360px width at 390px screen width (phone)', () => {
        mockWidth = 390;
        mockHeight = 844;
        let tree;
        act(() => {
            tree = renderer.create(
                <SidePanel visible={true}>
                    <></>
                </SidePanel>
            );
        });
        const instance = tree.toJSON();
        expect(instance).not.toBeNull();
        const panelStyle = instance.props.style;
        const flatStyle = Array.isArray(panelStyle)
            ? Object.assign({}, ...panelStyle.map(s => (typeof s === 'object' && s !== null ? s : {})))
            : panelStyle;
        expect(flatStyle.width).toBe(360);
    });

    it('uses 400px width at 820px screen width (tablet)', () => {
        mockWidth = 820;
        mockHeight = 1180;
        let tree;
        act(() => {
            tree = renderer.create(
                <SidePanel visible={true}>
                    <></>
                </SidePanel>
            );
        });
        const instance = tree.toJSON();
        const panelStyle = instance.props.style;
        const flatStyle = Array.isArray(panelStyle)
            ? Object.assign({}, ...panelStyle.map(s => (typeof s === 'object' && s !== null ? s : {})))
            : panelStyle;
        expect(flatStyle.width).toBe(400);
    });
});
