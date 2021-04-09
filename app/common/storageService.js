import { AsyncStorage } from 'react-native';
import * as FileSystem from 'expo-file-system';
const SAVED_INITIAL_REGION = 'SAVED_INITIAL_REGION';
const FIR_BOUNDARIES = 'FIR_BOUNDARIES';
const STATIC_AIRSPACE_DATA = 'STATIC_AIRSPACE_DATA';

export const clearStorage = () => {
    AsyncStorage.clear();
    FileSystem.deleteAsync( FileSystem.documentDirectory + FIR_BOUNDARIES, {idempotent: true});
    FileSystem.deleteAsync( FileSystem.documentDirectory + FIR_BOUNDARIES, {idempotent: true});
};

export const storeStaticAirspaceData = async (staticAirspaceData) => {
    try {
        // await AsyncStorage.setItem(STATIC_AIRSPACE_DATA, JSON.stringify(staticAirspaceData));
        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + STATIC_AIRSPACE_DATA, JSON.stringify(staticAirspaceData));
        console.log('stored static', staticAirspaceData);
    } catch (err) {
        console.log('Error storing static airspace data', err);
    }
};

export const storeFirBoundaries = async (firBoundaries) => {
    try {
        // await AsyncStorage.setItem(FIR_BOUNDARIES, JSON.stringify(firBoundaries));
        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + FIR_BOUNDARIES, JSON.stringify(firBoundaries));

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
        const firBoundaries = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + FIR_BOUNDARIES);
        if (firBoundaries != null) {
            retrievedData.firBoundaries = JSON.parse(firBoundaries);
        } else {
            retrievedData.firBoundaries = null;
        }
    } catch (err) {
        console.log('Error retrieving fir boudaries', err);
    }

    try {
        // const staticAirspaceData = await AsyncStorage.getItem(STATIC_AIRSPACE_DATA);
        const staticAirspaceData = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + STATIC_AIRSPACE_DATA);

        console.log('s',staticAirspaceData);
        if (staticAirspaceData != null) {
            retrievedData.staticAirspaceData = JSON.parse(staticAirspaceData);
        } else {
            retrievedData.staticAirspaceData = null;
        }
    } catch (err) {
        console.log('Error retrieving static airspace data', err);
    }
    console.log('r', retrievedData);
    return retrievedData;
};
