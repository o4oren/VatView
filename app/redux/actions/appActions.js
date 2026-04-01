import {
    storeAirportsLoaded,
    storeFirBoundariesLoaded,
    storeInitialRegion,
    storePollingInterval,
    storeMyCid,
    storeFriendCids,
} from '../../common/storageService';
export const REGION_UPDATED = 'REGION_UPDATED';
export const CLIENT_SELECTED = 'CLIENT_SELECTED';
export const ATC_FILTER_CLICKED = 'ATC_FILTER_CLICKED';
export const PILOTS_FILTER_CLICKED = 'PILOTS_FILTER_CLICKED';
export const SEARCH_QUERY_CHANGED = 'SEARCH_QUERY_CHANGED';
export const AIRPORT_SELECTED = 'AIRPORT_SELECTED';
export const AIRPORTS_LOADED = 'AIRPORTS_LOADED';
export const FIR_BOUNDARIES_LOADED = 'FIR_BOUNDARIES_LOADED';
export const LOADING_DB = 'LOADING_DB';
export const FLY_TO_CLIENT = 'FLY_TO_CLIENT';
export const FLY_TO_CONSUMED = 'FLY_TO_CONSUMED';
export const POLLING_INTERVAL_CHANGED = 'POLLING_INTERVAL_CHANGED';
export const MY_CID_CHANGED = 'MY_CID_CHANGED';
export const FRIEND_CIDS_CHANGED = 'FRIEND_CIDS_CHANGED';
export const ICON_CACHE_UPDATED = 'ICON_CACHE_UPDATED';

export const saveAirportsLoaded = (isAirportsLoaded) => {
    return async (dispatch) => {
        await storeAirportsLoaded(isAirportsLoaded);
        dispatch(airportsLoaded(isAirportsLoaded));
    };
};

export const saveFirBoundariesLoaded = (isFirBoundariesLoaded) => {
    return async (dispatch) => {
        await storeFirBoundariesLoaded(isFirBoundariesLoaded);
        dispatch(firBoundariesLoaded(isFirBoundariesLoaded));
    };
};

const airportsLoaded = (airportsLoaded) => {
    return {
        type: AIRPORTS_LOADED,
        payload: {airportsLoaded: airportsLoaded}
    };
};

const firBoundariesLoaded = (firBoundariesLoaded) => {
    return {
        type: FIR_BOUNDARIES_LOADED,
        payload: {firBoundariesLoaded: firBoundariesLoaded}
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

const flyToClient = (coordinate) => {
    return {
        type: FLY_TO_CLIENT,
        payload: coordinate,
    };
};

const flyToConsumed = () => {
    return {type: FLY_TO_CONSUMED};
};

const pollingIntervalChanged = (intervalMs) => {
    return {
        type: POLLING_INTERVAL_CHANGED,
        payload: intervalMs,
    };
};

export const savePollingInterval = (intervalMs) => {
    return async (dispatch) => {
        await storePollingInterval(intervalMs);
        dispatch(pollingIntervalChanged(intervalMs));
    };
};

export function saveInitialRegion(region) {
    return async function saveRegion(dispatch) {
        const initialRegion = { region };
        await storeInitialRegion(initialRegion);
        dispatch(regionUpdated(initialRegion));
    };
}

const myCidChanged = (cid) => ({
    type: MY_CID_CHANGED,
    payload: cid,
});

const friendCidsChanged = (cids) => ({
    type: FRIEND_CIDS_CHANGED,
    payload: cids,
});

export const saveMyCid = (cid) => async (dispatch) => {
    await storeMyCid(cid);
    dispatch(myCidChanged(cid));
};

export const saveFriendCids = (cids) => async (dispatch) => {
    await storeFriendCids(cids);
    dispatch(friendCidsChanged(cids));
};

export const iconCacheUpdated = () => ({ type: ICON_CACHE_UPDATED });

export default {
    saveFirBoundariesLoaded: saveFirBoundariesLoaded,
    saveAirportsLoaded: saveAirportsLoaded,
    loadingDb: loadingDb,
    regionUpdated: regionUpdated,
    saveInitialRegion: saveInitialRegion,
    clientSelected: clientSelected,
    airportSelected: airportSelected,
    atcFilterClicked: atcFilterClicked,
    pilotsFilterClicked: pilotsFilterClicked,
    searchQueryChanged: searchQueryChanged,
    flyToClient: flyToClient,
    flyToConsumed: flyToConsumed,
    savePollingInterval: savePollingInterval,
    saveMyCid: saveMyCid,
    saveFriendCids: saveFriendCids,
    iconCacheUpdated: iconCacheUpdated,
};
