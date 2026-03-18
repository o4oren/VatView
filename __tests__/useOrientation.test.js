/**
 * Tests for useOrientation hook.
 */

import {renderHook} from '@testing-library/react-native';

// Store mock dimensions so they can be changed per test
let mockWidth = 390;
let mockHeight = 844;

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: () => ({
        width: mockWidth,
        height: mockHeight,
        scale: 1,
        fontScale: 1,
    }),
}));

import {useOrientation} from '../app/common/useOrientation';

describe('useOrientation', () => {
    it('returns portrait when height > width', () => {
        mockWidth = 390;
        mockHeight = 844;
        const {result} = renderHook(() => useOrientation());
        expect(result.current).toBe('portrait');
    });

    it('returns landscape when width > height', () => {
        mockWidth = 844;
        mockHeight = 390;
        const {result} = renderHook(() => useOrientation());
        expect(result.current).toBe('landscape');
    });

    it('returns portrait when width equals height (square — edge case)', () => {
        mockWidth = 500;
        mockHeight = 500;
        const {result} = renderHook(() => useOrientation());
        expect(result.current).toBe('portrait');
    });
});
