import {useWindowDimensions} from 'react-native';

/**
 * Returns 'landscape' when width > height, otherwise 'portrait'.
 * Uses react-native's useWindowDimensions for live updates on rotation.
 */
export function useOrientation() {
    const {width, height} = useWindowDimensions();
    return width > height ? 'landscape' : 'portrait';
}
