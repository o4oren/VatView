/**
 * Tests for useOrientation hook.
 */

import {renderHook, act} from '@testing-library/react-native';
import {Dimensions} from 'react-native';

let mockWidth = 390;
let mockHeight = 844;
let dimensionsChangeCallback = null;

jest.spyOn(Dimensions, 'get').mockImplementation(() => ({
    width: mockWidth,
    height: mockHeight,
    scale: 1,
    fontScale: 1,
}));

jest.spyOn(Dimensions, 'addEventListener').mockImplementation((event, callback) => {
    dimensionsChangeCallback = callback;
    return {remove: jest.fn()};
});

import {useOrientation} from '../app/common/useOrientation';

describe('useOrientation', () => {
    beforeEach(() => {
        mockWidth = 390;
        mockHeight = 844;
        dimensionsChangeCallback = null;
    });

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

    it('updates orientation when dimensions change', () => {
        mockWidth = 390;
        mockHeight = 844;
        const {result} = renderHook(() => useOrientation());
        expect(result.current).toBe('portrait');

        act(() => {
            mockWidth = 844;
            mockHeight = 390;
            dimensionsChangeCallback?.();
        });
        expect(result.current).toBe('landscape');
    });
});
