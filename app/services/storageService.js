import { AsyncStorage } from 'react-native';
const SAVED_INITIAL_REGION = 'SAVED_INITIAL_REGION';
const FIR_BOUNDARIES = 'FIR_BOUNDARIES';
const STATIC_AIRSPACE_DATA = 'STATIC_AIRSPACE_DATA';

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
        await AsyncStorage.setItem(SAVED_INITIAL_REGION, JSON.stringify(region));
    } catch (err) {
        console.log('Error storing initial region', err);
    }
};

export const retrieveSavedState = async () => {
    const retrievedData = {};
    try {
        const initialRegion = await AsyncStorage.getItem(SAVED_INITIAL_REGION);
        if (initialRegion !== null) {
            retrievedData.initialRegion = JSON.parse(initialRegion);
        }
    } catch (err) {
        console.log('Error retrieving initial region', err);
    }

    try {
        const firBoundaries = await AsyncStorage.getItem(FIR_BOUNDARIES);
        if (firBoundaries !== null) {
            retrievedData.firBoundaries = JSON.parse(firBoundaries);
        }
    } catch (err) {
        console.log('Error retrieving fir boudaries', err);
    }

    try {
        const staticAirspaceData = await AsyncStorage.getItem(STATIC_AIRSPACE_DATA);
        if (staticAirspaceData !== null) {
            retrievedData.staticAirspaceData = JSON.parse(staticAirspaceData);
        }
    } catch (err) {
        console.log('Error retrieving static airspace data', err);
    }
    return retrievedData;
};
