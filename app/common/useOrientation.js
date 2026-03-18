import {useState, useEffect} from 'react';
import {Dimensions} from 'react-native';

function getOrientation() {
    const {width, height} = Dimensions.get('window');
    return width > height ? 'landscape' : 'portrait';
}

/**
 * Returns 'landscape' when width > height, otherwise 'portrait'.
 * Uses Dimensions.addEventListener for reliable updates on rotation,
 * avoiding the known useWindowDimensions delay issue on iOS with React Navigation.
 */
export function useOrientation() {
    const [orientation, setOrientation] = useState(getOrientation);

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', () => {
            setOrientation(getOrientation());
        });
        return () => subscription.remove();
    }, []);

    return orientation;
}
