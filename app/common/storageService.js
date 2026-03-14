import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
const SAVED_INITIAL_REGION = 'SAVED_INITIAL_REGION';
const STATIC_AIRSPACE_DATA = 'STATIC_AIRSPACE_DATA';
const SELECTED_AIRPORT = 'SELECTED_AIRPORT';
const AIRPORTS_LOADED = 'AIRPORTS_LOADED';
const FIR_BOUNDARIES_LOADED = 'FIR_BOUNDARIES_LOADED';
const TRACON_BOUNDARIES = 'TRACON_BOUNDARIES';
const FIR_GEOJSON = 'FIR_GEOJSON';
export const TRACON_RELEASE_TAG_KEY = 'TRACON_RELEASE_TAG';
export const FIR_GEOJSON_RELEASE_TAG_KEY = 'FIR_GEOJSON_RELEASE_TAG';

export const clearStorage = () => {
    AsyncStorage.clear();
    FileSystem.deleteAsync(FileSystem.documentDirectory + TRACON_BOUNDARIES, {idempotent: true});
    FileSystem.deleteAsync(FileSystem.documentDirectory + FIR_GEOJSON, {idempotent: true});
};

export const storeTraconBoundaries = async (json) => {
    try {
        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + TRACON_BOUNDARIES, json);
    } catch (err) {
        console.log('Error storing TRACON boundaries', err);
    }
};

export const storeFirGeoJson = async (json) => {
    try {
        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + FIR_GEOJSON, json);
    } catch (err) {
        console.log('Error storing FIR GeoJSON', err);
    }
};

export const storeReleaseTag = async (key, tag) => {
    try {
        await AsyncStorage.setItem(key, tag);
    } catch (err) {
        console.log('Error storing release tag', err);
    }
};

export const getReleaseTag = async (key) => {
    try {
        return await AsyncStorage.getItem(key);
    } catch (err) {
        console.log('Error retrieving release tag', err);
        return null;
    }
};

export const storeStaticAirspaceData = async (staticAirspaceData) => {
    try {
        console.log('storing STATIC_AIRSPACE_DATA');
        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + STATIC_AIRSPACE_DATA, JSON.stringify(staticAirspaceData));
    } catch (err) {
        console.log('Error storing static airspace data', err);
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

export const storeAirportsLoaded = async (isAirportsLoaded) => {
    console.log('storing AIRPORTS_LOADED');

    try {
        await AsyncStorage.setItem(AIRPORTS_LOADED, JSON.stringify(isAirportsLoaded));
        
    } catch (err) {
        console.log('Error storing db state', err);
    }
};

export const storeFirBoundariesLoaded = async (isFirBoundariesLoaded) => {
    console.log('storing FIR_BOUNDARIES_LOADED', isFirBoundariesLoaded);

    try {
        await AsyncStorage.setItem(FIR_BOUNDARIES_LOADED, JSON.stringify(isFirBoundariesLoaded));
    } catch (err) {
        console.log('Error storing db state', err);
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
        const airportsLoaded = await AsyncStorage.getItem(AIRPORTS_LOADED);
        if (airportsLoaded !== null) {
            retrievedData.airportsLoaded = JSON.parse(airportsLoaded);
        }
        const firBoundariesLoaded = await AsyncStorage.getItem(FIR_BOUNDARIES_LOADED);

        if (firBoundariesLoaded !== null) {
            retrievedData.firBoundariesLoaded = JSON.parse(firBoundariesLoaded);
        }
        
    } catch (err) {
        console.log('Error retrieving db status', err);
    }

    try {
        const firGeoJson = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + FIR_GEOJSON);
        if (firGeoJson != null) {
            retrievedData.firGeoJson = firGeoJson;
        }
    } catch (err) {
        console.log('Error retrieving FIR GeoJSON', err);
    }

    try {
        const traconBoundaries = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + TRACON_BOUNDARIES);
        if (traconBoundaries != null) {
            retrievedData.traconBoundaries = traconBoundaries;
        }
    } catch (err) {
        console.log('Error retrieving TRACON boundaries', err);
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
