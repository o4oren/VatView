import {storeInitialRegion} from '../../common/storageService';
export const INITIAL_REGION_LOADED = 'INITIAL_REGION_LOADED';
export const REGION_UPDATED = 'REGION_UPDATED';
export const CLIENT_SELECTED = 'CLIENT_SELECTED';
export const ATC_FILTER_CLICKED = 'ATC_FILTER_CLICKED';
export const PILOTS_FILTER_CLICKED = 'PILOTS_FILTER_CLICKED';
export const SEARCH_QUERY_CHANGED = 'SEARCH_QUERY_CHANGED';
export const AIRPORT_SELECTED = 'AIRPORT_SELECTED';
export const IS_READY = 'IS_READY';
export const LOADING_DB = 'LOADING_DB';

const isReady = (isReady) => {
    return {
        type: IS_READY,
        payload: {isReady: isReady}
    };
};

const loadingDb = (loadingDb) => {
    return {
        type: LOADING_DB,
        payload: {loadingDb: {
            airports: loadingDb.airports,
            firs: loadingDb.firs
        }}
    };
};

const initialRegionLoaded = (region) => {
    return {
        type: INITIAL_REGION_LOADED,
        payload: {initialRegion: region}
    };
};

const regionUpdated = (region) => {
    return {
        type: REGION_UPDATED,
        payload: {region: region}
    };
};

const clientSelected = (client) => {
    return {
        type: CLIENT_SELECTED,
        payload: {selectedClient: client}
    };
};

const airportSelected = (airport) => {
    return {
        type: AIRPORT_SELECTED,
        payload: {selectedAirport: airport}
    };
};

const atcFilterClicked = () => {
    return {
        type: ATC_FILTER_CLICKED
    };
};

const pilotsFilterClicked = () => {
    return {
        type: PILOTS_FILTER_CLICKED
    };
};

const searchQueryChanged = (searchQuery) => {
    return {
        type: SEARCH_QUERY_CHANGED,
        payload: searchQuery
    };
};

export function saveInitialRegion(region) {
    return async function saveRegion(dispatch) {
        const initialRegion = { region };
        await storeInitialRegion(initialRegion);
        dispatch(regionUpdated(initialRegion));
    };
}

export default {
    isReady: isReady,
    loadingDb: loadingDb,
    initialRegionLoaded: initialRegionLoaded,
    regionUpdated: regionUpdated,
    saveInitialRegion: saveInitialRegion,
    clientSelected: clientSelected,
    airportSelected: airportSelected,
    atcFilterClicked: atcFilterClicked,
    pilotsFilterClicked: pilotsFilterClicked,
    searchQueryChanged: searchQueryChanged
};