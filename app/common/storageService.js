import { AsyncStorage } from 'react-native';
import * as FileSystem from 'expo-file-system';
const SAVED_INITIAL_REGION = 'SAVED_INITIAL_REGION';
const FIR_BOUNDARIES = 'FIR_BOUNDARIES';
const STATIC_AIRSPACE_DATA = 'STATIC_AIRSPACE_DATA';
const SELECTED_AIRPORT = 'SELECTED_AIRPORT';

export const clearStorage = () => {
    AsyncStorage.clear();
    FileSystem.deleteAsync( FileSystem.documentDirectory + FIR_BOUNDARIES, {idempotent: true});
    FileSystem.deleteAsync( FileSystem.documentDirectory + FIR_BOUNDARIES, {idempotent: true});
};

export const storeStaticAirspaceData = async (staticAirspaceData) => {
    try {
        console.log('storing STATIC_AIRSPACE_DATA');
        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + STATIC_AIRSPACE_DATA, JSON.stringify(staticAirspaceData));
    } catch (err) {
        console.log('Error storing static airspace data', err);
    }
};

export const storeFirBoundaries = async (firBoundaries) => {
    try {
        console.log('storing FIR_BOUNDARIES');
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

export const storeSelectedAirport = async (selectedAirport) => {
    try {
        await AsyncStorage.setItem(SELECTED_AIRPORT, JSON.stringify(selectedAirport));
    } catch (err) {
        console.log('Error storing selected Airport', err);
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
        const selectedAirport = await AsyncStorage.getItem(SELECTED_AIRPORT);

        if (selectedAirport !== null) {
            retrievedData.initialRegion = JSON.parse(selectedAirport);
        }
    } catch (err) {
        console.log('Error retrieving selectedAirport', err);
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
        if (staticAirspaceData != null) {
            retrievedData.staticAirspaceData = JSON.parse(staticAirspaceData);
        } else {
            retrievedData.staticAirspaceData = null;
        }
    } catch (err) {
        console.log('Error retrieving static airspace data', err);
    }
    return retrievedData;
};
