import { AsyncStorage } from 'react-native';

const FAVORITES = 'FAVORITES';
const INITIAL_REGION = 'INITIAL_REGION';
const FIR_BOUNDARIES = 'FIR_BOUNDARIES';

export const storeFavorites = async (favorites) => {
    try {
        await AsyncStorage.setItem(FAVORITES, JSON.stringify(favorites));
    } catch (err) {
        console.log('Error storing favorites', err);
    }
};

export const storeInitialRegion = async (region) => {
    try {
        await AsyncStorage.setItem(INITIAL_REGION, JSON.stringify(region));
    } catch (err) {
        console.log('Error storing favorites', err);
    }
};

export const storeFirBoundarie = async (firBoundaries) => {
    try {
        await AsyncStorage.setItem(FIR_BOUNDARIES, JSON.stringify(firBoundaries));
    } catch (err) {
        console.log('Error storing fir boundaries', err);
    }
};

export const retrieveSavedState = async () => {
    try {
        const promises = [AsyncStorage.getItem(FAVORITES), AsyncStorage.getItem(INITIAL_REGION),
            AsyncStorage.getItem(FIR_BOUNDARIES),];
        const [favorites, initialRegion, firBoundaries] = await Promise.all(promises);
        return {
            initialRegion: JSON.parse(initialRegion),
            firBoundaries: JSON.parse(firBoundaries)
        };
    } catch (err) {
        console.log('Error stored preferences', err);
        return null;
    }
};
