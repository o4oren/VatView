import {storeInitialRegion} from '../../common/storageService';
export const INITIAL_REGION_LOADED = 'INITIAL_REGION_LOADED';
export const REGION_UPDATED = 'REGION_UPDATED';
export const CLIENT_SELECTED = 'CLIENT_SELECTED';
export const ATC_FILTER_CLICKED = 'ATC_FILTER_CLICKED';
export const PILOTS_FILTER_CLICKED = 'PILOTS_FILTER_CLICKED';
export const SEARCH_QUERY_CHANGED = 'SEARCH_QUERY_CHANGED';

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
    initialRegionLoaded: initialRegionLoaded,
    regionUpdated: regionUpdated,
    saveInitialRegion: saveInitialRegion,
    clientSelected: clientSelected,
    atcFilterClicked: atcFilterClicked,
    pilotsFilterClicked: pilotsFilterClicked,
    searchQueryChanged: searchQueryChanged
};