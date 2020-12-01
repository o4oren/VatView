import { AsyncStorage } from 'react-native';

const FAVORITES = 'FAVORITES';
const INITIAL_REGION = 'INITIAL_REGION';
const FIR_BOUNDARIES = 'FIR_BOUNDARIES';
const STATIC_AIRSPACE_DATA = 'STATIC_AIRSPACE_DATA';

export const storeFavorites = async (favorites) => {
    try {
        await AsyncStorage.setItem(FAVORITES, JSON.stringify(favorites));
    } catch (err) {
        console.log('Error storing favorites', err);
    }
};

export const storeStaticAirspaceData = async (staticAirspaceData) => {
    try {
        await AsyncStorage.setItem(STATIC_AIRSPACE_DATA, JSON.stringify(staticAirspaceData));
    } catch (err) {
        console.log('Error storing static airspace data', err);
    }
};

export const storeFirBoundaries = async (firBoundaries) => {
    try {
        await AsyncStorage.setItem(FIR_BOUNDARIES, JSON.stringify(firBoundaries));
    } catch (err) {
        console.log('Error storing static fir boundaries', err);
    }
};

export const storeInitialRegion = async (region) => {
    try {
        await AsyncStorage.setItem(INITIAL_REGION, JSON.stringify(region));
    } catch (err) {
        console.log('Error storing favorites', err);
    }
};

export const retrieveSavedState = async () => {
    try {
        const promises = [AsyncStorage.getItem(FAVORITES), AsyncStorage.getItem(INITIAL_REGION),
            AsyncStorage.getItem(FIR_BOUNDARIES),AsyncStorage.getItem(STATIC_AIRSPACE_DATA)];
        const [favorites, initialRegion, firBoundaries, staticAirspaceData] = await Promise.all(promises);
        return {
            initialRegion: JSON.parse(initialRegion),
            staticAirspaceData: JSON.parse(staticAirspaceData),
            firBoundaries: JSON.parse(firBoundaries),
        };
    } catch (err) {
        console.log('Error stored preferences', err);
        return null;
    }
};
